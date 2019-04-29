'use strict'
/*!
 * SimpleSlider v1.8.0
 * Simple responsive slider created in pure javascript.
 * https://github.com/michu2k/SimpleSlider
 *
 * Copyright 2017-2019 Michał Strumpf
 * Published under MIT License
 */;

(function(window) {
  'use strict';

  /**
   * Core
   * @param {string} selector = container, where script will be defined
   * @param {object} userOptions = options defined by user
   */
  var simpleSlider = function simpleSlider(selector, userOptions) {
    var slider = {
      /**
       * Extend defaults options
       */
      setUserOptions: function setUserOptions() {
        // Defaults
        var defaults = {
          speed: 800, // transition duration in ms {number}
          delay: 6000, // delay between transitions in ms {number}
          slidesPerView: 1, // number of slides per view {number}
          enableDrag: true, // enable drag option {boolean}
          autoplay: false, // slider autoplay {boolean}
          class: {
            wrapper: 'slider-wrapper', // wrapper class {string}
            slide: 'slider-slide', // slide class {string}
            buttons: 'slider-btn', // buttons class {string}
            pagination: 'slider-pagination', // pagination class {string}
            paginationItem: 'pagination-bullet' // pagination bullet class {string}
          }
        };

        // Extends defaults
        var replaceClasses = Object.assign(defaults.class, userOptions.class);
        var options = Object.assign(defaults, userOptions);
        Object.assign(options.class, replaceClasses);

        this.options = options;
      },

      /**
       * Set slider options
       */
      setSliderOptions: function setSliderOptions() {
        // Get user options
        var _this$options = this.options,
          delay = _this$options.delay,
          speed = _this$options.speed,
          _this$options$class = _this$options.class,
          wrapper = _this$options$class.wrapper,
          slide = _this$options$class.slide,
          buttons = _this$options$class.buttons,
          pagination = _this$options$class.pagination;

        // DOM elements
        this.container = document.querySelector(selector);
        this.wrapper = this.container.querySelector('.'.concat(wrapper));
        this.slides = this.container.querySelectorAll('.'.concat(slide));
        this.buttons = this.container.querySelectorAll('.'.concat(buttons));
        this.pagination = this.container.querySelector('.'.concat(pagination));

        // Options
        this.disableEvents = false;
        this.index = 1;
        this.wrapperWidth = 0;
        this.autoplayDelay = delay + speed;
        this.transitionDuration = this.isWebkit('transitionDuration');
        this.transform = this.isWebkit('transform');
        this.timer;

        // Drag values
        this.drag = {
          startX: 0,
          endX: 0,
          dragDiff: 0,
          maxOffset: 0,
          focused: false,
          isLink: false
        };
      },

      /**
       * Init slider
       */
      init: function init() {
        // Set options
        this.setUserOptions();
        this.setSliderOptions();

        // Create slides and set wrapper
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

        // Handlers
        this.attachEvents();
      },

      /**
       * Attach events
       */
      attachEvents: function attachEvents() {
        var enableDrag = this.options.enableDrag;

        if (enableDrag) {
          // Touch
          this.container.addEventListener('touchstart', this.touchstartHandler.bind(this));
          this.container.addEventListener('touchmove', this.touchmoveHandler.bind(this));
          this.container.addEventListener('touchend', this.touchendHandler.bind(this));

          // Mouse
          this.container.addEventListener('click', this.clickHandler.bind(this));
          this.container.addEventListener('mousedown', this.mousedownHandler.bind(this));
          this.container.addEventListener('mousemove', this.mousemoveHandler.bind(this));
          this.container.addEventListener('mouseup', this.mouseupHandler.bind(this));
        }

        // Window
        window.addEventListener('resize', this.resizeHandler.bind(this));
        this.visibilityChangeHandler();
      },

      /**
       * Clone slides and append them to the DOM
       */
      createClones: function createClones() {
        var _this$options2 = this.options,
          slidesPerView = _this$options2.slidesPerView,
          slide = _this$options2.class.slide;
        var wrapper = this.wrapper;
        var slidesLength = this.slides.length - 1;
        var clonesAtFront = document.createDocumentFragment();
        var clonesAtBack = document.createDocumentFragment();
        var cloned;

        for (var i = 0; i < slidesPerView; i++) {
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

        this.allSlides = this.container.querySelectorAll('.'.concat(slide));
      },

      /**
       * Set wrapper and slides width
       */
      setWidth: function setWidth() {
        var _this = this;
        var slidesPerView = this.options.slidesPerView;
        var slideWidth = Math.round(this.container.offsetWidth / slidesPerView) + 'px';
        this.wrapperWidth = 0;
        this.drag.maxOffset = 100;

        Object.values(this.allSlides).map(function(slide, index) {
          // Slide width
          slide.style.width = slideWidth;

          // Wrapper width
          _this.wrapperWidth += slide.offsetWidth;

          // Maximum drag offset
          if (index + slidesPerView < _this.allSlides.length) {
            _this.drag.maxOffset += slide.offsetWidth;
          }
        });

        this.wrapper.style.width = this.wrapperWidth + 'px';
      },

      /**
       * Change wrapper position by a certain number of pixels
       */
      moveWrapper: function moveWrapper() {
        var slidesPerView = this.options.slidesPerView;
        var activeSlide = Math.floor(slidesPerView / 2) + this.index;
        this.wrapperPosition = 0;

        for (var i = 0; i < activeSlide; i++) {
          this.wrapperPosition += this.allSlides[i].offsetWidth;
        }

        // Set wrapper position
        this.wrapper.style[this.transform] = 'translate3d(-'.concat(this.wrapperPosition, 'px, 0, 0)');
      },

      /**
       * Change the slide
       * @param {string} direction = move direction [left, right]
       * @param {boolean} isAutoplay = check if the function is called by autoplay
       */
      changeSlide: function changeSlide(direction) {
        var _this2 = this;
        var isAutoplay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var speed = this.options.speed;

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
          this.highlightBullet();

          this.setTransition(speed);
          this.moveWrapper();

          setTimeout(function() {
            // Switch from the cloned slide to the proper slide
            if (_this2.index <= 0 || _this2.index > _this2.slides.length) {
              _this2.index = _this2.updateIndex(_this2.index);
              _this2.setTransition(0);
              _this2.moveWrapper();
            }

            // Enable Events
            _this2.disableEvents = false;
          }, speed);
        }
      },

      /**
       * Set transition duration
       * @param {number} speed = speed value in miliseconds
       */
      setTransition: function setTransition(speed) {
        this.wrapper.style[this.transitionDuration] = speed + 'ms';
      },

      /**
       * Create slider pagination
       */
      createPagination: function createPagination() {
        if (!this.pagination) return;
        var paginationItem = this.options.class.paginationItem;
        var fragment = document.createDocumentFragment();
        var slidesLength = this.slides.length;
        var bullet;

        // Create bullets
        for (var i = 0; i < slidesLength; i++) {
          bullet = document.createElement('span');
          bullet.classList.add(paginationItem);

          // Add active class to the first bullet
          if (i == 0) {
            bullet.classList.add('active');
          }

          fragment.appendChild(bullet);
        }

        // Append bullets to the DOM
        this.pagination.appendChild(fragment);

        // Bullets action
        this.bullets();
      },

      /**
       * Move slide when clicked on pagination bullet
       */
      bullets: function bullets() {
        var _this3 = this;
        var paginationItem = this.options.class.paginationItem;
        var bullets = this.pagination.querySelectorAll('.'.concat(paginationItem));

        Object.values(bullets).map(function(bullet, index) {
          bullet.addEventListener('click', function() {
            if (!_this3.disableEvents) {
              _this3.index = index;
            }

            _this3.changeSlide('right');
          });
        });
      },

      /**
       * Highlight active bullet
       */
      highlightBullet: function highlightBullet() {
        if (!this.pagination) return;
        var paginationItem = this.options.class.paginationItem;

        // Remove active class from bullet
        var activeBullet = this.pagination.querySelector('.active');
        activeBullet.classList.remove('active');

        // Add class to active bullet
        var bullets = this.pagination.querySelectorAll('.'.concat(paginationItem));
        var index = this.updateIndex(this.index);
        bullets[index - 1].classList.add('active');
      },

      /**
       * Previous button
       */
      prevBtn: function prevBtn() {
        var _this4 = this;
        this.buttons[0].addEventListener('click', function() {
          _this4.changeSlide('left');
        });
      },

      /**
       * Next button
       */
      nextBtn: function nextBtn() {
        var _this5 = this;
        this.buttons[1].addEventListener('click', function() {
          _this5.changeSlide('right');
        });
      },

      /**
       * Update index
       * @param {number} index = index value
       * @return {number} index = index value after correction
       */
      updateIndex: function updateIndex(index) {
        if (index > this.slides.length) {
          index = 1;
        }

        if (index <= 0) {
          index = this.slides.length;
        }

        return index;
      },

      /**
       * Slider autoplay
       */
      autoplay: function autoplay() {
        var _this6 = this;
        var autoplay = this.options.autoplay;

        if (autoplay) {
          this.timer = setTimeout(function() {
            _this6.changeSlide('right', true);
            _this6.autoplay();
          }, this.autoplayDelay);
        }
      },

      /**
       * Reset slider autoplay
       */
      resetAutoplay: function resetAutoplay() {
        clearTimeout(this.timer);
      },

      /**
       * Update slider position after drag event
       */
      updateSliderAfterDrag: function updateSliderAfterDrag() {
        var speed = this.options.speed;

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
      },

      /**
       * Update slider position during drag event
       */
      updateSliderDuringDrag: function updateSliderDuringDrag() {
        // Reset autoplay
        this.resetAutoplay();

        this.drag.dragDiff = this.drag.endX - this.drag.startX;
        var movement = this.wrapperPosition - this.drag.dragDiff;

        if (movement < this.drag.maxOffset && movement > -100) {
          this.wrapper.style[this.transform] = 'translate3d('.concat(-1 * movement, 'px, 0, 0)');
        } else {
          this.updateSliderAfterDrag();
        }
      },

      /**
       * Mousedown event
       */
      mousedownHandler: function mousedownHandler(e) {
        e.stopPropagation();

        this.setTransition(0);
        this.drag.focused = true;
        this.drag.startX = e.pageX;
      },

      /**
       * Mousemove event
       */
      mousemoveHandler: function mousemoveHandler(e) {
        e.stopPropagation();

        if (!this.disableEvents && this.drag.focused) {
          // Disable links
          if (e.target.nodeName === 'A') {
            this.drag.isLink = true;
          }

          this.drag.endX = e.pageX;
          this.updateSliderDuringDrag();
        }
      },

      /**
       * Mouseup event
       */
      mouseupHandler: function mouseupHandler(e) {
        e.stopPropagation();
        this.updateSliderAfterDrag();
      },

      /**
       * Click event
       */
      clickHandler: function clickHandler(e) {
        if (this.drag.isLink) {
          e.preventDefault();
        }

        this.drag.isLink = false;
      },

      /**
       * Touchstart event
       */
      touchstartHandler: function touchstartHandler(e) {
        e.stopPropagation();

        this.setTransition(0);
        this.drag.focused = true;
        this.drag.startX = e.touches[0].pageX;
      },

      /**
       * Touchmove event
       */
      touchmoveHandler: function touchmoveHandler(e) {
        e.stopPropagation();

        if (!this.disableEvents && this.drag.focused) {
          this.drag.endX = e.touches[0].pageX;
          this.updateSliderDuringDrag();
        }
      },

      /**
       * Touchend event
       */
      touchendHandler: function touchendHandler(e) {
        e.stopPropagation();
        this.updateSliderAfterDrag();
      },

      /**
       * Play/Stop autoplay when tab is active/inactive
       */
      visibilityChangeHandler: function visibilityChangeHandler() {
        var _this7 = this;
        var hidden, visibilityChange;

        if (typeof document.hidden !== 'undefined') {
          hidden = 'hidden';
          visibilityChange = 'visibilitychange';
        } else {
          hidden = 'webkitHidden';
          visibilityChange = 'webkitvisibilitychange';
        }

        window.addEventListener(visibilityChange, function() {
          _this7.resetAutoplay();

          if (!document[hidden]) {
            _this7.autoplay();
          }
        });
      },

      /**
       * Calculate the slider when changing the window size
       */
      resizeHandler: function resizeHandler() {
        this.setWidth();
        this.setTransition(0);
        this.moveWrapper();
      },

      /**
       * Get supported property and add webkit prefix if needed
       * @param {string} property = property name
       * @return {string} property = property with optional webkit prefix
       */
      isWebkit: function isWebkit(property) {
        if (typeof document.documentElement.style[property] === 'string') {
          return property;
        }

        property = this.capitalizeFirstLetter(property);
        property = 'webkit'.concat(property);

        return property;
      },

      /**
       * Capitalize the first letter in the string
       * @param {string} string = string
       * @return {string} string = changed string
       */
      capitalizeFirstLetter: function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
    };

    slider.init();
  };

  window.simpleSlider = simpleSlider;
})(window);
