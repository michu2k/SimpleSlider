/*!
 * SimpleSlider v1.9.0
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
    const setUserOptions = () => {
      // Defaults
      const defaults = {
        speed: 600, // transition duration in ms {number}
        delay: 5000, // delay between transitions in ms {number}
        enableDrag: true, // enable drag option {boolean}
        autoplay: false, // slider autoplay {boolean}
        loop: true, // slider loop {boolean}
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
    const setSliderOptions = () => {
      // Get user options
      const { slidesPerView, class: { wrapper, slide, buttons, pagination } } = this.options;

      // DOM elements
      this.container = document.querySelector(selector);
      this.wrapper = this.container.querySelector(`.${wrapper}`);
      this.slides = this.container.querySelectorAll(`.${slide}`);
      this.buttons = this.container.querySelectorAll(`.${buttons}`);
      this.pagination = this.container.querySelector(`.${pagination}`);

      // Options
      this.disableEvents = false;
      this.slidesWithClones = this.slides;
      this.maxSlidesPerView = Math.max(...Object.keys(slidesPerView).map(key => slidesPerView[key]), 1);
      this.index = 0;
      this.wrapperWidth = 0;
      this.transitionDuration = isWebkit('transitionDuration');
      this.transform = isWebkit('transform');
      this.timer;

      // Drag values
      this.drag = {
        startX: 0,
        endX: 0,
        dragDiff: 0,
        focused: false,
        isLink: false
      };
    };

    /**
     * Init slider
     */
    this.init = () => {
      // Set options
      setUserOptions();
      setSliderOptions();

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

      // Events
      this.attachEvents();

      onInit();
    };

    /**
     * Attach events
     */
    this.attachEvents = () => {
      const { enableDrag } = this.options;
      const c = this.container;

      // Bind all event handlers
      ['touchstartHandler',
        'touchmoveHandler',
        'touchendHandler',
        'clickHandler',
        'mousedownHandler',
        'mousemoveHandler',
        'mouseupHandler',
        'mouseleaveHandler',
        'resizeHandler',
        'visibilitychangeHandler',
        'paginationBulletsHandler',
        'prevSlide',
        'nextSlide'
      ].map(handler => {
        this[handler] = this[handler].bind(this);
      });

      if (enableDrag) {
        // Touch
        c.addEventListener('touchstart', this.touchstartHandler);
        c.addEventListener('touchmove', this.touchmoveHandler);
        c.addEventListener('touchend', this.touchendHandler);

        // Mouse
        c.addEventListener('click', this.clickHandler);
        c.addEventListener('mousedown', this.mousedownHandler);
        c.addEventListener('mousemove', this.mousemoveHandler);
        c.addEventListener('mouseup', this.mouseupHandler);
        c.addEventListener('mouseleave', this.mouseleaveHandler);
      }

      // Pagination
      c.addEventListener('click', this.paginationBulletsHandler);
  
      // Buttons
      if (this.buttons.length === 2) {
        this.buttons[0].addEventListener('click', this.prevSlide);
        this.buttons[1].addEventListener('click', this.nextSlide);
      }

      // Window
      window.addEventListener('resize', this.resizeHandler);
      window.addEventListener('visibilitychange', this.visibilitychangeHandler);
    };

    /**
     * Detach events
     */
    this.detachEvents = () => {
      const c = this.container;
      
      // Touch
      c.removeEventListener('touchstart', this.touchstartHandler);
      c.removeEventListener('touchmove', this.touchmoveHandler);
      c.removeEventListener('touchend', this.touchendHandler);

      // Mouse
      c.removeEventListener('click', this.clickHandler);
      c.removeEventListener('mousedown', this.mousedownHandler);
      c.removeEventListener('mousemove', this.mousemoveHandler);
      c.removeEventListener('mouseup', this.mouseupHandler);
      c.removeEventListener('mouseleave', this.mouseleaveHandler);

      // Pagination
      c.removeEventListener('click', this.paginationBulletsHandler);

      // Buttons
      this.buttons[0].removeEventListener('click', this.prevSlide);
      this.buttons[1].removeEventListener('click', this.nextSlide);

      // Window
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('visibilitychange', this.visibilitychangeHandler);
    };
    
    /**
     * Set the number of slides to be shown
     */
    this.calculateSlidesPerView = () => {
      const { loop, slidesPerView } = this.options;
      this.slidesPerView = 1;

      Object.keys(slidesPerView).forEach(viewport => {
        if (document.body.offsetWidth >= viewport) {
          this.slidesPerView = slidesPerView[viewport];
        }
      });

      this.maxIndex = loop ? this.slides.length : this.slides.length - this.slidesPerView + 1;
    };

    /**
     * Clone slides and append them to the DOM
     */
    this.createClones = () => {
      if (!this.options.loop) return;

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
              
      this.slidesWithClones = this.container.querySelectorAll(`.${slide}`);
    };

    /**
     * Set wrapper and slides width
     */
    this.setWidth = () => {
      const slideWidth = Math.round(this.container.offsetWidth / this.slidesPerView) + 'px';
      this.wrapperWidth = 0;

      Object.keys(this.slidesWithClones).map(index => {
        const slide = this.slidesWithClones[index];

        slide.style.width = slideWidth;
        this.wrapperWidth += slide.offsetWidth;
      });

      this.wrapper.style.width = this.wrapperWidth + 'px';    
    };

    /**
     * Change wrapper position by a certain number of pixels
     */
    this.moveWrapper = () => {
      const { loop } = this.options;
      let activeSlide = ((this.maxSlidesPerView + 1) - this.slidesPerView) + Math.floor(this.slidesPerView / 2) + this.index;
      this.wrapperPosition = 0;

      if (!loop) {
        activeSlide = this.index >= (this.maxIndex - Math.floor(this.slidesPerView / 2)) ? this.maxIndex - 1 : this.index;
      }

      for (let i = 0; i < activeSlide; i++) {
        this.wrapperPosition += this.slidesWithClones[i].offsetWidth;
      }

      // Set wrapper position
      this.wrapper.style[this.transform] = `translate3d(-${this.wrapperPosition}px, 0, 0)`;
    };

    /**
     * Change the slide 
     * @param {boolean} isAutoplay = check if the function is called by autoplay
     */
    this.changeSlide = (isAutoplay = false) => {
      const { speed, loop, onChange } = this.options;

      if (!this.disableEvents) {

        // Reset autoplay
        if (!isAutoplay) {
          this.resetAutoplay();
          this.autoplay();   
        }

        if (!loop) {
          // Disable events
          if (this.index >= 0 && this.index < this.maxIndex) {
            this.disableEvents = true;
          }

          this.index = this.updateIndex(this.index);
        } else {
          // Disable events
          this.disableEvents = true;
        }

        this.highlightPaginationBullet();
        this.wrapper.style[this.transitionDuration] = speed + 'ms';
        this.moveWrapper();

        onChange();

        setTimeout(() => {
          // Switch from the cloned slide to the proper slide
          if (loop && (this.index < 0 || this.index >= this.slides.length)) {
            this.index = this.updateIndex(this.index);
            this.wrapper.style[this.transitionDuration] = 0 + 'ms';
            this.moveWrapper();
          }

          // Enable Events
          this.disableEvents = false;
        }, speed);
      }
    };

    /**
     * Create pagination
     */ 
    this.createPagination = () => {
      if (!this.pagination) return;

      const { loop, class: { paginationItem } } = this.options;
      const fragment = document.createDocumentFragment();
      const activeSlide = loop ? 0 : Math.min(this.index, this.maxIndex - 1);
      let bullet;

      // Create bullets
      for (let i = 0; i < this.maxIndex; i++) {
        bullet = document.createElement('span');
        bullet.classList.add(paginationItem); 
  
        // Add active class to the bullet
        if (i == activeSlide) {
          bullet.classList.add('is-active');
        }
  
        fragment.appendChild(bullet);
      }
  
      // Append bullets to the DOM
      this.pagination.appendChild(fragment);
      this.paginationBullets = this.pagination.querySelectorAll(`.${paginationItem}`);
    };

    /**
     * Destroy pagination
     */ 
    this.destroyPagination = () => {
      if (!this.pagination) return;
      this.pagination.innerHTML = '';
    };

    /**
     * Move slide when clicked on pagination bullet
     */
    this.paginationBulletsHandler = e => {
      const { class: { paginationItem } } = this.options;
      const bullets = [];

      if (e.target.classList.contains(paginationItem)) {
        for (let i = 0; i < this.paginationBullets.length; i++) {
          bullets.push(this.paginationBullets[i]);
        }

        const index = bullets.indexOf(e.target);

        if (!this.disableEvents) {
          this.index = index - 1;
          this.nextSlide();
        }
      }
    };

    /**
     * Highlight active bullet
     */
    this.highlightPaginationBullet = () => {
      if (!this.pagination) return;

      const { class: { paginationItem } } = this.options;

      // Remove active class from bullet
      const activeBullet = this.pagination.querySelector('.is-active');
      activeBullet.classList.remove('is-active');

      // Add class to active bullet
      const bullets = this.pagination.querySelectorAll(`.${paginationItem}`);
      const index = this.updateIndex(this.index);

      bullets[index].classList.add('is-active');
    };

    /**
     * Previous Slide
     */
    this.prevSlide = () => {
      this.decreaseIndex();
      this.changeSlide();
    };

    /**
     * Next Slide
     */
    this.nextSlide = () => {
      this.increaseIndex();
      this.changeSlide();
    };

    /**
     * Increase index
     */
    this.increaseIndex = () => {
      if (!this.disableEvents) {
        this.index++;
      }
    };

    /**
     * Decrease index
     */
    this.decreaseIndex = () => {
      if (!this.disableEvents) {
        this.index--;
      }
    };

    /**
     * Update index
     * @param {number} index = index value
     * @return {number} index = index value after correction
     */
    this.updateIndex = index => {
      const { loop } = this.options;

      if (loop) {
        return index >= this.slides.length ? 0 : (index < 0 ? this.slides.length - 1 : index);
      }

      return index >= this.maxIndex ? this.maxIndex - 1 : (index <= 0 ? 0 : index);
    };

    /** 
     * Slider autoplay
     */
    this.autoplay = () => {
      const { autoplay, delay, speed } = this.options;

      if (autoplay) {
        this.timer = setTimeout(() => {
          this.increaseIndex();
          this.changeSlide(true);
          this.autoplay();
        }, delay + speed);
      }
    };

    /**
     * Reset slider autoplay
     */
    this.resetAutoplay = () => clearTimeout(this.timer);

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
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }

      // Reset drag
      this.wrapper.style[this.transitionDuration] = speed + 'ms';
      this.moveWrapper();

      // Reset values
      this.drag.dragDiff = 0;
      this.drag.isLink = false;
    };

    /**
     * Update slider position during drag event
     */
    this.updateSliderDuringDrag = () => {
      this.resetAutoplay();

      const { loop } = this.options;
      const activeslideWidth = this.slides[this.index].offsetWidth;
      const movement = this.wrapperPosition - this.drag.dragDiff;
      let maxMoveOffset = 100 + activeslideWidth;
      this.drag.dragDiff = this.drag.endX - this.drag.startX;

      if (!loop) {
        if (this.index <= 0 && this.drag.dragDiff > 0) {
          maxMoveOffset = 100;
        }

        if (this.index >= this.maxIndex - 1 && this.drag.dragDiff < 0) {
          maxMoveOffset = 100;
        }
      }

      if (this.drag.dragDiff < maxMoveOffset && this.drag.dragDiff > (-1 * maxMoveOffset)) {
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

      this.wrapper.style[this.transitionDuration] = 0 + 'ms';
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

      this.wrapper.style[this.transitionDuration] = 0 + 'ms';
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
      const { loop } = this.options;
      const prevSlidesPerView = this.slidesPerView;

      this.wrapper.style[this.transitionDuration] = 0 + 'ms';
      this.calculateSlidesPerView();
      this.setWidth();
      this.moveWrapper();

      if (!loop && prevSlidesPerView !== this.slidesPerView) {
        this.destroyPagination();
        this.createPagination();
      }
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