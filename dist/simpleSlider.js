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
          speed: 1600, // transition duration in ms {number}
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
        // Get options
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
        this.disableEvent = false;
        this.index = 0;
        this.autoplayDelay = delay + speed;
        this.transitionDuration = this.isWebkit('transitionDuration');
        this.transform = this.isWebkit('transform');
        this.timer;
      },

      /**
       * Init slider
       */
      init: function init() {
        // Set options
        this.setUserOptions();
        this.setSliderOptions();

        // Call functions
        this.createClones();
        this.setWidth();
        this.moveWrapper();
        var autoplay = this.options.autoplay;

        // Pagination
        if (this.pagination) {
          this.createPagination();
        }

        // Autoplay
        if (autoplay) {
          this.autoplay();
        }

        // Buttons
        if (this.buttons.length == 2) {
          this.prevBtn();
          this.nextBtn();
        }

        // Events
        this.resize();
        this.visibilityChange();
      },

      /**
       * Clone slides and append them to the DOM
       */
      createClones: function createClones() {
        var slidesPerView = this.options.slidesPerView;
        var wrapper = this.wrapper;
        var slidesLength = this.slides.length - 1;
        var clonesAtFront = document.createDocumentFragment();
        var clonesAtBack = document.createDocumentFragment();
        var slide;

        for (var i = 0; i < slidesPerView; i++) {
          // Copy the slides from the end
          slide = wrapper.children[slidesLength - i].cloneNode(true);
          clonesAtBack.insertBefore(slide, clonesAtBack.childNodes[0]);

          // Copy the slides from the beginning
          slide = wrapper.children[i].cloneNode(true);
          clonesAtFront.appendChild(slide);
        }

        // Append slides to the DOM
        wrapper.appendChild(clonesAtFront);
        wrapper.insertBefore(clonesAtBack, this.slides[0]);
      },

      /**
       * Set wrapper and slides width
       */
      setWidth: function setWidth() {
        var _this$options2 = this.options,
          slidesPerView = _this$options2.slidesPerView,
          slide = _this$options2.class.slide;
        var slides = this.container.querySelectorAll('.'.concat(slide));
        var slideWidth = Math.round(this.container.offsetWidth / slidesPerView) + 'px';
        var wrapperWidth = 0;

        Object.values(slides).map(function(slide) {
          // Slide width
          slide.style.width = slideWidth;

          // Wrapper width
          wrapperWidth += slide.offsetWidth;
        });

        this.wrapper.style.width = wrapperWidth + 'px';
      },

      /**
       * Change wrapper position by a certain number of pixels
       */
      moveWrapper: function moveWrapper() {
        var _this$options3 = this.options,
          slidesPerView = _this$options3.slidesPerView,
          slide = _this$options3.class.slide;
        var slides = this.container.querySelectorAll('.'.concat(slide));
        var activeSlide = Math.round(slidesPerView / 2) + this.index;
        var pixels = 0;

        // If slides per view is even, move one to the left
        if (slidesPerView % 2 == 0) {
          activeSlide++;
        }

        for (var i = 0; i < activeSlide; i++) {
          pixels += slides[i].offsetWidth;
        }

        this.wrapper.style[this.transform] = 'translate3d(-'.concat(pixels, 'px, 0, 0)');
      },

      /**
       * Move slider main function
       * @param {string} direction = move direction [left, right]
       */
      moveSlider: function moveSlider(direction) {
        var _this = this;
        var speed = this.options.speed;

        // Change index value depending on the direction
        direction == 'right' ? this.index++ : this.index--;

        // Disable events
        this.disableEvents();

        // Highlight bullet
        if (this.pagination) {
          this.highlightBullet();
        }

        // Set transition duration
        this.setTransition(speed);

        // Switch from the cloned slide to the proper slide
        if (this.index < 0 || this.index >= this.slides.length) {
          setTimeout(function() {
            // Update index
            _this.index = _this.updateIndex(_this.index);

            _this.setTransition(0);
            _this.moveWrapper();
          }, speed);
        }

        this.moveWrapper();
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
        var _this2 = this;
        var paginationItem = this.options.class.paginationItem;
        var bullets = this.pagination.querySelectorAll('.'.concat(paginationItem));

        Object.values(bullets).map(function(bullet, index) {
          bullet.addEventListener('click', function() {
            if (!_this2.disableEvent) {
              _this2.index = index - 1;
            }

            _this2.buttonsAction('right');
          });
        });
      },

      /**
       * Call actions on click the navigation element
       * @param {string} direction = slider move direction [left, right]
       */
      buttonsAction: function buttonsAction(direction) {
        var autoplay = this.options.autoplay;

        if (!this.disableEvent) {
          this.moveSlider(direction);

          // Reset autoplay
          if (autoplay) {
            this.resetAutoplay();
            this.autoplay();
          }
        }
      },

      /**
       * Highlight active bullet
       */
      highlightBullet: function highlightBullet() {
        var paginationItem = this.options.class.paginationItem;

        // Remove active class from bullet
        var activeBullet = this.pagination.querySelector('.active');
        activeBullet.classList.remove('active');

        // Add class to active bullet
        var bullets = this.pagination.querySelectorAll('.'.concat(paginationItem));
        var index = this.updateIndex(this.index);
        bullets[index].classList.add('active');
      },

      /**
       * Previous button
       */
      prevBtn: function prevBtn() {
        var _this3 = this;
        this.buttons[0].addEventListener('click', function() {
          _this3.buttonsAction('left');
        });
      },

      /**
       * Next button
       */
      nextBtn: function nextBtn() {
        var _this4 = this;
        this.buttons[1].addEventListener('click', function() {
          _this4.buttonsAction('right');
        });
      },

      /**
       * Update index
       * @param {number} index = index value
       * @return {number} index = index value after correction
       */
      updateIndex: function updateIndex(index) {
        if (index >= this.slides.length) {
          index = 0;
        }

        if (index < 0) {
          index = this.slides.length - 1;
        }

        return index;
      },

      /**
       * Disable events during slider animation
       */
      disableEvents: function disableEvents() {
        var _this5 = this;
        var speed = this.options.speed;
        this.disableEvent = true;

        // Enable Events
        setTimeout(function() {
          _this5.disableEvent = false;
        }, speed);
      },

      /**
       * Slider autoplay
       */
      autoplay: function autoplay() {
        var _this6 = this;
        this.timer = setTimeout(function() {
          _this6.moveSlider('right');
          _this6.autoplay();
        }, this.autoplayDelay);
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
      visibilityChange: function visibilityChange() {
        var _this7 = this;
        var autoplay = this.options.autoplay;

        // Old browsers support
        var hidden, visibilityChange;

        if (typeof document.hidden !== 'undefined') {
          hidden = 'hidden';
          visibilityChange = 'visibilitychange';
        } else {
          hidden = 'webkitHidden';
          visibilityChange = 'webkitvisibilitychange';
        }

        window.addEventListener(visibilityChange, function() {
          if (autoplay) {
            if (!document[hidden]) {
              _this7.resetAutoplay();
              _this7.autoplay();
            } else {
              _this7.resetAutoplay();
            }
          }
        });
      },

      /**
       * Calculate the slider when changing the window size
       */
      resize: function resize() {
        var _this8 = this;
        window.addEventListener('resize', function() {
          _this8.setWidth();
          _this8.moveWrapper();
          _this8.setTransition(0);
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
