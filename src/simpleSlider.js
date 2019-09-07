/*!
 * SimpleSlider v1.8.0
 * Simple responsive slider created in pure javascript.
 * https://github.com/michu2k/SimpleSlider
 *
 * Copyright 2017-2019 Michał Strumpf
 * Published under MIT License
 */

(function(window) {

  'use strict';

  /**
   * Core
   * @param {string} selector = container, where script will be defined
   * @param {object} userOptions = options defined by user
   */
  const SimpleSlider = function(selector, userOptions = {}) {
    /**
     * Extend defaults options
     */
    this.setUserOptions = () => {
      // Defaults
      const defaults = {
        speed: 600, // transition duration in ms {number}
        delay: 5000, // delay between transitions in ms {number}
        enableDrag: true, // enable drag option {boolean}
        autoplay: false, // slider autoplay {boolean}
        slidesPerView: {}, // number of slides per view {object}
        class: {
          wrapper: 'slider-wrapper', // wrapper class {string}
          slide: 'slider-slide', // slide class {string}
          buttons: 'slider-btn', // buttons class {string}
          pagination: 'slider-pagination', // pagination class {string}
          paginationItem: 'pagination-bullet', // pagination bullet class {string}
        },
        onInit: () => {}, // function called after initialization {function}
        onChange: () => {} // function called after slide change {function}
      };

      // Extends defaults
      this.options = extendDefaults(defaults, userOptions);
    };

    /**
     * Set slider options
     */
    this.setSliderOptions = () => {
      // Get user options
      const { speed, delay, slidesPerView, class: { wrapper, slide, buttons, pagination } } = this.options;

      // DOM elements
      this.container = document.querySelector(selector);
      this.wrapper = this.container.querySelector(`.${wrapper}`);
      this.slides = this.container.querySelectorAll(`.${slide}`);
      this.buttons = this.container.querySelectorAll(`.${buttons}`);
      this.pagination = this.container.querySelector(`.${pagination}`);

      // Options
      this.disableEvents = false;
      this.index = 1;
      this.slidesPerView = 1;
      this.maxSlidesPerView = Math.max(...Object.keys(slidesPerView).map(key => slidesPerView[key]), this.slidesPerView);
      this.wrapperWidth = 0;
      this.autoplayDelay = delay + speed;
      this.transitionDuration = isWebkit('transitionDuration');
      this.transform = isWebkit('transform');
      this.timer;

      // Drag values
      this.drag = {
        startX: 0,
        endX: 0,
        dragDiff: 0,
        minOffset: 0,
        maxOffset: 0,
        focused: false,
        isLink: false
      };
    };

    /**
     * Init slider
     */
    this.init = () => {
      // Set options
      this.setUserOptions();
      this.setSliderOptions();

      const { onInit } = this.options;

      // Create slides and set wrapper
      this.calculateSlidesPerView();
      this.createClones();
      this.setWidth();
      this.moveWrapper();

      // Pagination
      this.createPagination();
  
      // Autoplay
      this.autoplay();
  
      // Buttons
      if (this.buttons.length == 2) {
        this.prevBtn();
        this.nextBtn();
      }

      // Events
      this.attachEvents();

      onInit();
    };

    /**
     * Attach events
     */
    this.attachEvents = () => {
      const { enableDrag } = this.options;

      // Bind all event handlers
      ['touchstart', 'touchmove', 'touchend', 'click', 'mousedown', 'mousemove', 'mouseup', 'mouseleave', 'resize', 'visibilitychange'].map(handler => {
        this[`${handler}Handler`] = this[`${handler}Handler`].bind(this);
      });

      if (enableDrag) {
        // Touch
        this.container.addEventListener('touchstart', this.touchstartHandler);
        this.container.addEventListener('touchmove', this.touchmoveHandler);
        this.container.addEventListener('touchend', this.touchendHandler);

        // Mouse
        this.container.addEventListener('click', this.clickHandler);
        this.container.addEventListener('mousedown', this.mousedownHandler);
        this.container.addEventListener('mousemove', this.mousemoveHandler);
        this.container.addEventListener('mouseup', this.mouseupHandler);
        this.container.addEventListener('mouseleave', this.mouseleaveHandler);
      }

      // Window
      window.addEventListener('resize', this.resizeHandler);
      window.addEventListener('visibilitychange', this.visibilitychangeHandler);
    };

    /**
     * Detach events
     */
    this.detachEvents = () => {
      // Touch
      this.container.removeEventListener('touchstart', this.touchstartHandler);
      this.container.removeEventListener('touchmove', this.touchmoveHandler);
      this.container.removeEventListener('touchend', this.touchendHandler);

      // Mouse
      this.container.removeEventListener('click', this.clickHandler);
      this.container.removeEventListener('mousedown', this.mousedownHandler);
      this.container.removeEventListener('mousemove', this.mousemoveHandler);
      this.container.removeEventListener('mouseup', this.mouseupHandler);
      this.container.removeEventListener('mouseleave', this.mouseleaveHandler);

      // Window
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('visibilitychange', this.visibilitychangeHandler);
    };
    
    /**
     * Set the number of slides to be shown
     */
    this.calculateSlidesPerView = () => {
      const { slidesPerView } = this.options;

      this.slidesPerView = 1;

      Object.keys(slidesPerView).forEach((key) => {
        if (document.body.offsetWidth >= key) {
          this.slidesPerView = slidesPerView[key];
        }
      });
    };

    /**
     * Clone slides and append them to the DOM
     */
    this.createClones = () => {
      const { class: { slide } } = this.options;
      const wrapper = this.wrapper;
      const slidesLength = this.slides.length - 1;
      const clonesAtFront = document.createDocumentFragment();
      const clonesAtBack = document.createDocumentFragment();
      let cloned;

      for (let i = 0; i < this.maxSlidesPerView; i++) {
        if (slidesLength - i < 0 || i > slidesLength) break;

        // Copy the slides from the end
        cloned = wrapper.children[slidesLength - i].cloneNode(true);
        clonesAtBack.insertBefore(cloned, clonesAtBack.childNodes[0]);

        // Copy the slides from the beginning
        cloned = wrapper.children[i].cloneNode(true);
        clonesAtFront.appendChild(cloned);
      }

      // Append slides to the DOM
      wrapper.appendChild(clonesAtFront);
      wrapper.insertBefore(clonesAtBack, this.slides[0]);
              
      this.allSlides = this.container.querySelectorAll(`.${slide}`);
    };

    /**
     * Set wrapper and slides width
     */
    this.setWidth = () => {
      const slideWidth = Math.round(this.container.offsetWidth / this.slidesPerView) + 'px';
      const offset = this.maxSlidesPerView - this.slidesPerView;

      this.wrapperWidth = 0;
      this.drag.maxOffset = 100;
      this.drag.minOffset = -100;

      Object.keys(this.allSlides).map(index => {
        const slide = this.allSlides[index];

        // Slide width
        slide.style.width = slideWidth;

        // Wrapper width
        this.wrapperWidth += slide.offsetWidth;

        // Maximum drag offset
        if (parseInt(index) + this.slidesPerView < this.allSlides.length - offset) {
          this.drag.maxOffset += slide.offsetWidth;
        }

        // Minimum drag offset
        if (parseInt(index) < offset) {
          this.drag.minOffset += slide.offsetWidth;
        }
      });

      this.wrapper.style.width = this.wrapperWidth + 'px';    
    };

    /**
     * Change wrapper position by a certain number of pixels
     */
    this.moveWrapper = () => {
      const activeSlide = (this.maxSlidesPerView - this.slidesPerView) + Math.floor(this.slidesPerView / 2) + this.index;
      this.wrapperPosition = 0;

      for (let i = 0; i < activeSlide; i++) {
        this.wrapperPosition += this.allSlides[i].offsetWidth;
      }

      // Set wrapper position
      this.wrapper.style[this.transform] = `translate3d(-${this.wrapperPosition}px, 0, 0)`;
    };

    /**
     * Change the slide 
     * @param {string} direction = move direction [left, right]
     * @param {boolean} isAutoplay = check if the function is called by autoplay
     */
    this.changeSlide = (direction, isAutoplay = false) => {
      const { speed, onChange } = this.options;

      if (!this.disableEvents) {
        // Reset autoplay
        if (!isAutoplay) {
          this.resetAutoplay();
          this.autoplay();   
        }

        // Change index value depending on the direction
        direction == 'right' ? this.index++ : this.index--;

        // Disable events during slider animation
        this.disableEvents = true;

        // Highlight bullet
        this.highlightPaginationBullet();
      
        this.setTransition(speed);
        this.moveWrapper();

        // Call onChange function
        onChange();

        setTimeout(() => {
          // Switch from the clonedk slide to the proper slide
          if (this.index <= 0 || this.index > this.slides.length) {
            this.index = this.updateIndex(this.index);
            this.setTransition(0);
            this.moveWrapper();
          }

          // Enable Events
          this.disableEvents = false;
        }, speed);
      }
    };

    /** 
     * Set transition duration
     * @param {number} speed = speed value in miliseconds
     */
    this.setTransition = speed => {
      this.wrapper.style[this.transitionDuration] = speed + 'ms';
    };

    /**
     * Create slider pagination
     */ 
    this.createPagination = () => {
      if (!this.pagination) return;

      const { class: { paginationItem } } = this.options;
      const fragment = document.createDocumentFragment();
      const slidesLength = this.slides.length;
      let bullet;
  
      // Create bullets
      for (let i = 0; i < slidesLength; i++) {
        bullet = document.createElement('span');
        bullet.classList.add(paginationItem); 
  
        // Add active class to the first bullet
        if (i == 0) {
          bullet.classList.add('is-active');
        }
  
        fragment.appendChild(bullet);
      }
  
      // Append bullets to the DOM
      this.pagination.appendChild(fragment);
  
      // Bullets action
      this.paginationBullets();
    };

    /**
     * Move slide when clicked on pagination bullet
     */
    this.paginationBullets = () => {
      const { class: { paginationItem } } = this.options;
      const bullets = this.pagination.querySelectorAll(`.${paginationItem}`);

      Object.keys(bullets).map(index => {
        bullets[index].addEventListener('click', () => {
          if (!this.disableEvents) {
            this.index = index;
          }
  
          this.changeSlide('right');
        });
      });
    };

    /**
     * Highlight active bullet
     */
    this.highlightPaginationBullet = () => {
      if (!this.pagination) return;

      const { class: { paginationItem } } = this.options;

      // Remove active class from bullet
      let activeBullet = this.pagination.querySelector('.is-active');
      activeBullet.classList.remove('is-active');
  
      // Add class to active bullet
      let bullets = this.pagination.querySelectorAll(`.${paginationItem}`);
      let index = this.updateIndex(this.index);
      bullets[index - 1].classList.add('is-active');
    };

    /**
     * Previous button
     */
    this.prevBtn = () => {
      this.buttons[0].addEventListener('click', () => {
        this.changeSlide('left');
      });
    };
  
    /**
     * Next button
     */
    this.nextBtn = () => {
      this.buttons[1].addEventListener('click', () => {
        this.changeSlide('right');
      });
    };

    /**
     * Update index
     * @param {number} index = index value
     * @return {number} index = index value after correction
     */
    this.updateIndex = index =>  {
      if (index > this.slides.length) {
        index = 1;
      }
  
      if (index <= 0) {
        index = this.slides.length;
      }
  
      return index;
    };

    /** 
     * Slider autoplay
     */
    this.autoplay = () => {
      const { autoplay } = this.options;

      if (autoplay) {
        this.timer = setTimeout(() => {
          this.changeSlide('right', true);
          this.autoplay();
        }, this.autoplayDelay);
      }
    };

    /**
     * Reset slider autoplay
     */
    this.resetAutoplay = () => {
      clearTimeout(this.timer);
    };

    /**
     * Update slider position after drag event
     */
    this.updateSliderAfterDrag = () => {
      const { speed } = this.options;

      this.drag.focused = false;

      if (!this.drag.dragDiff) return;

      // Autoplay
      this.autoplay();
              
      // Move slider
      if (Math.abs(this.drag.dragDiff) > 100) {
        if (this.drag.dragDiff < 0) {
          this.changeSlide('right');
        } else {
          this.changeSlide();
        }
      }

      // Reset drag
      this.setTransition(speed);
      this.moveWrapper();

      // Reset values
      this.drag.dragDiff = 0;
      this.drag.isLink = false;
    };

    /**
     * Update slider position during drag event
     */
    this.updateSliderDuringDrag = () => {
      // Reset autoplay
      this.resetAutoplay();

      this.drag.dragDiff = this.drag.endX - this.drag.startX;
      const movement = this.wrapperPosition - this.drag.dragDiff;

      if (movement < this.drag.maxOffset && movement > this.drag.minOffset) {
        this.wrapper.style[this.transform] = `translate3d(${-1 * movement}px, 0, 0)`;
      } else {
        this.updateSliderAfterDrag();
      }
    };

    /**
     * Mousedown event
     */
    this.mousedownHandler = e => {
      e.stopPropagation();
      e.preventDefault();

      this.setTransition(0);
      this.drag.focused = true;
      this.drag.startX = e.pageX;
    };

    /**
     * Mousemove event
     */
    this.mousemoveHandler = e => {
      e.stopPropagation();

      if (!this.disableEvents && this.drag.focused) {
        // Disable links
        if (e.target.nodeName === 'A') {
          this.drag.isLink = true;
        }

        this.drag.endX = e.pageX;
        this.updateSliderDuringDrag();
      }
    };

    /**
     * Mouseup event
     */
    this.mouseupHandler = e => {
      e.stopPropagation();
      this.updateSliderAfterDrag();
    };

    /**
     * Mouseleave event
     */
    this.mouseleaveHandler = e => {
      e.stopPropagation();
      this.updateSliderAfterDrag();
    };

    /**
     * Click event
     */
    this.clickHandler = e => {
      if (this.drag.isLink) {
        e.preventDefault();
      }

      this.drag.isLink = false;
    };

    /**
     * Touchstart event
     */
    this.touchstartHandler = e => {
      e.stopPropagation();

      this.setTransition(0);
      this.drag.focused = true;
      this.drag.startX = e.touches[0].pageX;
    };

    /**
     * Touchmove event
     */
    this.touchmoveHandler = e => {
      e.stopPropagation();

      if (!this.disableEvents && this.drag.focused) {
        this.drag.endX = e.touches[0].pageX;
        this.updateSliderDuringDrag();
      }
    };
  
    /**
     * Touchend event
     */
    this.touchendHandler = e => {
      e.stopPropagation();
      this.updateSliderAfterDrag();
    };

    /**
     * Play/Stop autoplay when tab is active/inactive
     */
    this.visibilitychangeHandler = () => {
      this.resetAutoplay();

      if (!document.hidden) {
        this.autoplay();
      }
    };

    /**
     * Calculate the slider when changing the window size
     */
    this.resizeHandler = () => {
      this.calculateSlidesPerView();
      this.setWidth();
      this.setTransition(0);
      this.moveWrapper();
    };

    /**
     * Get supported property and add webkit prefix if needed
     * @param {string} property = property name
     * @return {string} property = property with optional webkit prefix
     */
    const isWebkit = property => {
      if (typeof document.documentElement.style[property] === 'string') {
        return property;
      }

      // Capitalize the first letter
      property = property.charAt(0).toUpperCase() + property.slice(1);

      return `webkit${property}`;
    };

    /**
     * Extend defaults
     * @param {object} defaults = defaults options defined in script
     * @param {object} properties = user options
     * @return {object} defaults = modified options
     */
    const extendDefaults = (defaults, properties) => {
      let property, propertyDeep;

      if (properties != undefined && properties != 'undefined') {
        for (property in properties) {
          const propObj = properties[property];

          if (typeof propObj === 'object') {
            for (propertyDeep in propObj) {
              defaults[property][propertyDeep] = propObj[propertyDeep];
            }
          } else {
            defaults[property] = propObj;
          }
        }
      }

      return defaults;
    };

    this.init();
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SimpleSlider;
  } else {
    window.SimpleSlider = SimpleSlider;
  }

})(window);