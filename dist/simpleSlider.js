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
          speed: 1000, // transition duration in ms {number}
          delay: 6000, // delay between transitions in ms {number}
          slidesPerView: 1,
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
       * Set additional slider options
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

        // Elements
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
          maxMovement: 0,
          focused: false
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

        this.resizeHandler();
        this.visibilityChangeHandler();
      },

      /**
       * Attach events
       */
      attachEvents: function attachEvents() {
        this.container.addEventListener('touchstart', this.touchstartHandler.bind(this));
        this.container.addEventListener('touchmove', this.touchmoveHandler.bind(this));
        this.container.addEventListener('touchend', this.touchendHandler.bind(this));
      },

      /**
       * Touchstart event
       */
      touchstartHandler: function touchstartHandler(e) {
        var _this = this;
        e.stopPropagation();

        this.setTransition(0);
        //this.drag.maxMovement = (this.wrapperWidth / this.allSlides.length) + 50;
        this.drag.startX = e.touches[0].pageX;
        this.drag.focused = true;

        setTimeout(function() {
          _this.drag.focused = false;
        }, 100);
      },

      /**
       * Touchmove event
       */
      touchmoveHandler: function touchmoveHandler(e) {
        e.stopPropagation();

        this.drag.endX = e.touches[0].pageX;
        this.drag.dragDiff = this.drag.endX - this.drag.startX;
        this.wrapper.style[this.transform] = 'translate3d(-'.concat(
          this.wrapperPosition - this.drag.dragDiff,
          'px, 0, 0)'
        );
      },

      /**
       * Touchend event
       */
      touchendHandler: function touchendHandler(e) {
        e.stopPropagation();

        // Autoplay
        //this.autoplay();

        if (Math.abs(this.drag.dragDiff) > 50 && !this.drag.focused) {
          if (this.drag.dragDiff < -50) {
            this.changeSlide('right');
          } else if (this.drag.dragDiff > 50) {
            this.changeSlide();
          }
        }

        // Reset move
        this.setTransition(200);
        this.moveWrapper();

        this.drag.dragDiff = 0;
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
        var _this2 = this;
        var slidesPerView = this.options.slidesPerView;
        var slideWidth = Math.round(this.container.offsetWidth / slidesPerView) + 'px';
        this.wrapperWidth = 0;

        Object.values(this.allSlides).map(function(slide) {
          // Slide width
          slide.style.width = slideWidth;

          // Wrapper width
          _this2.wrapperWidth += slide.offsetWidth;
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

        if (slidesPerView % 2 == 0) {
          activeSlide++;
        }

        for (var i = 0; i < activeSlide; i++) {
          this.wrapperPosition += this.allSlides[i].offsetWidth;
        }

        // Set wrapper position
        this.wrapper.style[this.transform] = 'translate3d(-'.concat(this.wrapperPosition, 'px, 0, 0)');
      },

      /**
       * Move slider main function
       * @param {string} direction = move direction [left, right]
       */
      changeSlide: function changeSlide(direction) {
        var _this3 = this;
        var speed = this.options.speed;

        // Change index value depending on the direction
        direction == 'right' ? this.index++ : this.index--;

        // Disable events
        this.disableAllEvents();

        // Highlight bullet
        this.highlightBullet();

        this.setTransition(speed);
        this.moveWrapper();

        setTimeout(function() {
          // Switch from the cloned slide to the proper slide
          if (_this3.index <= 0 || _this3.index > _this3.slides.length) {
            _this3.index = _this3.updateIndex(_this3.index);
            _this3.moveWrapper();
            _this3.setTransition(0);
          }
        }, speed);
      },

      /**
       * Disable events during slider animation
       */
      disableAllEvents: function disableAllEvents() {
        var _this4 = this;
        var speed = this.options.speed;

        this.disableEvents = true;

        // Enable Events
        setTimeout(function() {
          _this4.disableEvents = false;
        }, speed);
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
        var _this5 = this;
        var paginationItem = this.options.class.paginationItem;
        var bullets = this.pagination.querySelectorAll('.'.concat(paginationItem));

        Object.values(bullets).map(function(bullet, index) {
          bullet.addEventListener('click', function() {
            if (!_this5.disableEvents) {
              _this5.index = index;
            }

            _this5.buttonsAction('right');
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
       * Call actions on click the navigation element
       * @param {string} direction = slider move direction [left, right]
       */
      buttonsAction: function buttonsAction(direction) {
        if (!this.disableEvents) {
          this.changeSlide(direction);

          // Reset autoplay
          this.resetAutoplay();
          this.autoplay();
        }
      },

      /**
       * Previous button
       */
      prevBtn: function prevBtn() {
        var _this6 = this;
        this.buttons[0].addEventListener('click', function() {
          _this6.buttonsAction('left');
        });
      },

      /**
       * Next button
       */
      nextBtn: function nextBtn() {
        var _this7 = this;
        this.buttons[1].addEventListener('click', function() {
          _this7.buttonsAction('right');
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
        var _this8 = this;
        var autoplay = this.options.autoplay;

        if (autoplay) {
          this.timer = setTimeout(function() {
            _this8.changeSlide('right');
            _this8.autoplay();
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
       * Play/Stop autoplay when tab is active/inactive
       */
      visibilityChangeHandler: function visibilityChangeHandler() {
        var _this9 = this;
        var hidden, visibilityChange;

        if (typeof document.hidden !== 'undefined') {
          hidden = 'hidden';
          visibilityChange = 'visibilitychange';
        } else {
          hidden = 'webkitHidden';
          visibilityChange = 'webkitvisibilitychange';
        }

        window.addEventListener(visibilityChange, function() {
          if (!document[hidden]) {
            _this9.resetAutoplay();
            _this9.autoplay();
          } else {
            _this9.resetAutoplay();
          }
        });
      },

      /**
       * Calculate the slider when changing the window size
       */
      resizeHandler: function resizeHandler() {
        var _this10 = this;
        window.addEventListener('resize', function() {
          _this10.setWidth();
          _this10.moveWrapper();
          _this10.setTransition(0);
        });
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
