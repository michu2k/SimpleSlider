'use strict';
function _typeof(obj) {
  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype
        ? 'symbol'
        : typeof obj;
    };
  }
  return _typeof(obj);
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === '[object Arguments]')
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}
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
  var SimpleSlider = function SimpleSlider(selector) {
    var _this = this;
    var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    /**
     * Extend defaults options
     */
    this.setUserOptions = function() {
      // Defaults
      var defaults = {
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
          paginationItem: 'pagination-bullet' // pagination bullet class {string}
        },
        onInit: function onInit() {}, // function called after initialization {function}
        onChange: function onChange() {} // function called after slide change {function}
      };

      // Extends defaults
      _this.options = _this.extendDefaults(defaults, userOptions);
    };

    /**
     * Set slider options
     */
    this.setSliderOptions = function() {
      // Get user options
      var _this$options = _this.options,
        speed = _this$options.speed,
        delay = _this$options.delay,
        slidesPerView = _this$options.slidesPerView,
        _this$options$class = _this$options.class,
        wrapper = _this$options$class.wrapper,
        slide = _this$options$class.slide,
        buttons = _this$options$class.buttons,
        pagination = _this$options$class.pagination;

      // DOM elements
      _this.container = document.querySelector(selector);
      _this.wrapper = _this.container.querySelector('.'.concat(wrapper));
      _this.slides = _this.container.querySelectorAll('.'.concat(slide));
      _this.buttons = _this.container.querySelectorAll('.'.concat(buttons));
      _this.pagination = _this.container.querySelector('.'.concat(pagination));

      // Options
      _this.disableEvents = false;
      _this.index = 1;
      _this.slidesPerView = 1;
      _this.maxSlidesPerView = Math.max.apply(
        Math,
        _toConsumableArray(
          Object.keys(slidesPerView).map(function(key) {
            return slidesPerView[key];
          })
        ).concat([_this.slidesPerView])
      );
      _this.wrapperWidth = 0;
      _this.autoplayDelay = delay + speed;
      _this.transitionDuration = _this.isWebkit('transitionDuration');
      _this.transform = _this.isWebkit('transform');
      _this.timer;

      // Drag values
      _this.drag = {
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
    this.init = function() {
      // Set options
      _this.setUserOptions();
      _this.setSliderOptions();
      var onInit = _this.options.onInit;

      // Create slides and set wrapper
      _this.calculateSlidesPerView();
      _this.createClones();
      _this.setWidth();
      _this.moveWrapper();

      // Pagination
      _this.createPagination();

      // Autoplay
      _this.autoplay();

      // Buttons
      if (_this.buttons.length == 2) {
        _this.prevBtn();
        _this.nextBtn();
      }

      // Events
      _this.attachEvents();

      onInit();
    };

    /**
     * Attach events
     */
    this.attachEvents = function() {
      var enableDrag = _this.options.enableDrag;

      // Bind all event handlers
      ['touchstart', 'touchmove', 'touchend', 'click', 'mousedown', 'mousemove', 'mouseup', 'mouseleave', 'resize'].map(
        function(handler) {
          _this[''.concat(handler, 'Handler')] = _this[''.concat(handler, 'Handler')].bind(_this);
        }
      );

      if (enableDrag) {
        // Touch
        _this.container.addEventListener('touchstart', _this.touchstartHandler);
        _this.container.addEventListener('touchmove', _this.touchmoveHandler);
        _this.container.addEventListener('touchend', _this.touchendHandler);

        // Mouse
        _this.container.addEventListener('click', _this.clickHandler);
        _this.container.addEventListener('mousedown', _this.mousedownHandler);
        _this.container.addEventListener('mousemove', _this.mousemoveHandler);
        _this.container.addEventListener('mouseup', _this.mouseupHandler);
        _this.container.addEventListener('mouseleave', _this.mouseleaveHandler);
      }

      // Window
      window.addEventListener('resize', _this.resizeHandler);
      _this.visibilityChangeHandler();
    };

    /**
     * Detach events
     */
    this.detachEvents = function() {
      // Touch
      _this.container.removeEventListener('touchstart', _this.touchstartHandler);
      _this.container.removeEventListener('touchmove', _this.touchmoveHandler);
      _this.container.removeEventListener('touchend', _this.touchendHandler);

      // Mouse
      _this.container.removeEventListener('click', _this.clickHandler);
      _this.container.removeEventListener('mousedown', _this.mousedownHandler);
      _this.container.removeEventListener('mousemove', _this.mousemoveHandler);
      _this.container.removeEventListener('mouseup', _this.mouseupHandler);
      _this.container.removeEventListener('mouseleave', _this.mouseleaveHandler);

      // Window
      window.removeEventListener('resize', _this.resizeHandler);
    };

    /**
     * Set the number of slides to be shown
     */
    this.calculateSlidesPerView = function() {
      var slidesPerView = _this.options.slidesPerView;

      _this.slidesPerView = 1;

      Object.keys(slidesPerView).forEach(function(key) {
        if (document.body.offsetWidth >= key) {
          _this.slidesPerView = slidesPerView[key];
        }
      });
    };

    /**
     * Clone slides and append them to the DOM
     */
    this.createClones = function() {
      var slide = _this.options.class.slide;
      var wrapper = _this.wrapper;
      var slidesLength = _this.slides.length - 1;
      var clonesAtFront = document.createDocumentFragment();
      var clonesAtBack = document.createDocumentFragment();
      var cloned;

      for (var i = 0; i < _this.maxSlidesPerView; i++) {
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
      wrapper.insertBefore(clonesAtBack, _this.slides[0]);

      _this.allSlides = _this.container.querySelectorAll('.'.concat(slide));
    };

    /**
     * Set wrapper and slides width
     */
    this.setWidth = function() {
      var slideWidth = Math.round(_this.container.offsetWidth / _this.slidesPerView) + 'px';
      var offset = _this.maxSlidesPerView - _this.slidesPerView;

      _this.wrapperWidth = 0;
      _this.drag.maxOffset = 100;
      _this.drag.minOffset = -100;

      Object.keys(_this.allSlides).map(function(index) {
        var slide = _this.allSlides[index];

        // Slide width
        slide.style.width = slideWidth;

        // Wrapper width
        _this.wrapperWidth += slide.offsetWidth;

        // Maximum drag offset
        if (parseInt(index) + _this.slidesPerView < _this.allSlides.length - offset) {
          _this.drag.maxOffset += slide.offsetWidth;
        }

        // Minimum drag offset
        if (parseInt(index) < offset) {
          _this.drag.minOffset += slide.offsetWidth;
        }
      });

      _this.wrapper.style.width = _this.wrapperWidth + 'px';
    };

    /**
     * Change wrapper position by a certain number of pixels
     */
    this.moveWrapper = function() {
      var activeSlide =
        _this.maxSlidesPerView - _this.slidesPerView + Math.floor(_this.slidesPerView / 2) + _this.index;
      _this.wrapperPosition = 0;

      for (var i = 0; i < activeSlide; i++) {
        _this.wrapperPosition += _this.allSlides[i].offsetWidth;
      }

      // Set wrapper position
      _this.wrapper.style[_this.transform] = 'translate3d(-'.concat(_this.wrapperPosition, 'px, 0, 0)');
    };

    /**
     * Change the slide
     * @param {string} direction = move direction [left, right]
     * @param {boolean} isAutoplay = check if the function is called by autoplay
     */
    (this.changeSlide = function(direction) {
      var isAutoplay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var _this$options2 = _this.options,
        speed = _this$options2.speed,
        onChange = _this$options2.onChange;

      if (!_this.disableEvents) {
        // Reset autoplay
        if (!isAutoplay) {
          _this.resetAutoplay();
          _this.autoplay();
        }

        // Change index value depending on the direction
        direction == 'right' ? _this.index++ : _this.index--;

        // Disable events during slider animation
        _this.disableEvents = true;

        // Highlight bullet
        _this.highlightPaginationBullet();

        _this.setTransition(speed);
        _this.moveWrapper();

        // Call onChange function
        onChange(_this.slides[_this.index - 1]);

        setTimeout(function() {
          // Switch from the cloned slide to the proper slide
          if (_this.index <= 0 || _this.index > _this.slides.length) {
            _this.index = _this.updateIndex(_this.index);
            _this.setTransition(0);
            _this.moveWrapper();
          }

          // Enable Events
          _this.disableEvents = false;
        }, speed);
      }
    }),
      /**
       * Set transition duration
       * @param {number} speed = speed value in miliseconds
       */
      (this.setTransition = function(speed) {
        _this.wrapper.style[_this.transitionDuration] = speed + 'ms';
      }),
      /**
       * Create slider pagination
       */
      (this.createPagination = function() {
        if (!_this.pagination) return;
        var paginationItem = _this.options.class.paginationItem;
        var fragment = document.createDocumentFragment();
        var slidesLength = _this.slides.length;
        var bullet;

        // Create bullets
        for (var i = 0; i < slidesLength; i++) {
          bullet = document.createElement('span');
          bullet.classList.add(paginationItem);

          // Add active class to the first bullet
          if (i == 0) {
            bullet.classList.add('is-active');
          }

          fragment.appendChild(bullet);
        }

        // Append bullets to the DOM
        _this.pagination.appendChild(fragment);

        // Bullets action
        _this.paginationBullets();
      }),
      /**
       * Move slide when clicked on pagination bullet
       */
      (this.paginationBullets = function() {
        var paginationItem = _this.options.class.paginationItem;
        var bullets = _this.pagination.querySelectorAll('.'.concat(paginationItem));

        Object.keys(bullets).map(function(index) {
          bullets[index].addEventListener('click', function() {
            if (!_this.disableEvents) {
              _this.index = index;
            }

            _this.changeSlide('right');
          });
        });
      }),
      /**
       * Highlight active bullet
       */
      (this.highlightPaginationBullet = function() {
        if (!_this.pagination) return;
        var paginationItem = _this.options.class.paginationItem;

        // Remove active class from bullet
        var activeBullet = _this.pagination.querySelector('.is-active');
        activeBullet.classList.remove('is-active');

        // Add class to active bullet
        var bullets = _this.pagination.querySelectorAll('.'.concat(paginationItem));
        var index = _this.updateIndex(_this.index);
        bullets[index - 1].classList.add('is-active');
      }),
      /**
       * Previous button
       */
      (this.prevBtn = function() {
        _this.buttons[0].addEventListener('click', function() {
          _this.changeSlide('left');
        });
      }),
      /**
       * Next button
       */
      (this.nextBtn = function() {
        _this.buttons[1].addEventListener('click', function() {
          _this.changeSlide('right');
        });
      }),
      /**
       * Update index
       * @param {number} index = index value
       * @return {number} index = index value after correction
       */
      (this.updateIndex = function(index) {
        if (index > _this.slides.length) {
          index = 1;
        }

        if (index <= 0) {
          index = _this.slides.length;
        }

        return index;
      }),
      /**
       * Slider autoplay
       */
      (this.autoplay = function() {
        var autoplay = _this.options.autoplay;

        if (autoplay) {
          _this.timer = setTimeout(function() {
            _this.changeSlide('right', true);
            _this.autoplay();
          }, _this.autoplayDelay);
        }
      }),
      /**
       * Reset slider autoplay
       */
      (this.resetAutoplay = function() {
        clearTimeout(_this.timer);
      }),
      /**
       * Update slider position after drag event
       */
      (this.updateSliderAfterDrag = function() {
        var speed = _this.options.speed;

        _this.drag.focused = false;

        if (!_this.drag.dragDiff) return;

        // Autoplay
        _this.autoplay();

        // Move slider
        if (Math.abs(_this.drag.dragDiff) > 100) {
          if (_this.drag.dragDiff < 0) {
            _this.changeSlide('right');
          } else {
            _this.changeSlide();
          }
        }

        // Reset drag
        _this.setTransition(speed);
        _this.moveWrapper();

        // Reset values
        _this.drag.dragDiff = 0;
        _this.drag.isLink = false;
      }),
      /**
       * Update slider position during drag event
       */
      (this.updateSliderDuringDrag = function() {
        // Reset autoplay
        _this.resetAutoplay();

        _this.drag.dragDiff = _this.drag.endX - _this.drag.startX;
        var movement = _this.wrapperPosition - _this.drag.dragDiff;

        if (movement < _this.drag.maxOffset && movement > _this.drag.minOffset) {
          _this.wrapper.style[_this.transform] = 'translate3d('.concat(-1 * movement, 'px, 0, 0)');
        } else {
          _this.updateSliderAfterDrag();
        }
      }),
      /**
       * Mousedown event
       */
      (this.mousedownHandler = function(e) {
        e.stopPropagation();
        e.preventDefault();

        _this.setTransition(0);
        _this.drag.focused = true;
        _this.drag.startX = e.pageX;
      }),
      /**
       * Mousemove event
       */
      (this.mousemoveHandler = function(e) {
        e.stopPropagation();

        if (!_this.disableEvents && _this.drag.focused) {
          // Disable links
          if (e.target.nodeName === 'A') {
            _this.drag.isLink = true;
          }

          _this.drag.endX = e.pageX;
          _this.updateSliderDuringDrag();
        }
      }),
      /**
       * Mouseup event
       */
      (this.mouseupHandler = function(e) {
        e.stopPropagation();
        _this.updateSliderAfterDrag();
      }),
      /**
       * Mouseleave event
       */
      (this.mouseleaveHandler = function(e) {
        e.stopPropagation();
        _this.updateSliderAfterDrag();
      }),
      /**
       * Click event
       */
      (this.clickHandler = function(e) {
        if (_this.drag.isLink) {
          e.preventDefault();
        }

        _this.drag.isLink = false;
      }),
      /**
       * Touchstart event
       */
      (this.touchstartHandler = function(e) {
        e.stopPropagation();

        _this.setTransition(0);
        _this.drag.focused = true;
        _this.drag.startX = e.touches[0].pageX;
      }),
      /**
       * Touchmove event
       */
      (this.touchmoveHandler = function(e) {
        e.stopPropagation();

        if (!_this.disableEvents && _this.drag.focused) {
          _this.drag.endX = e.touches[0].pageX;
          _this.updateSliderDuringDrag();
        }
      }),
      /**
       * Touchend event
       */
      (this.touchendHandler = function(e) {
        e.stopPropagation();
        _this.updateSliderAfterDrag();
      }),
      /**
       * Play/Stop autoplay when tab is active/inactive
       */
      (this.visibilityChangeHandler = function(e) {
        var hidden, visibilityChange;

        if (typeof document.hidden !== 'undefined') {
          hidden = 'hidden';
          visibilityChange = 'visibilitychange';
        } else {
          hidden = 'webkitHidden';
          visibilityChange = 'webkitvisibilitychange';
        }

        window.addEventListener(visibilityChange, function() {
          _this.resetAutoplay();

          if (!document[hidden]) {
            _this.autoplay();
          }
        });
      }),
      /**
       * Calculate the slider when changing the window size
       */
      (this.resizeHandler = function() {
        _this.calculateSlidesPerView();
        _this.setWidth();
        _this.setTransition(0);
        _this.moveWrapper();
      }),
      /**
       * Get supported property and add webkit prefix if needed
       * @param {string} property = property name
       * @return {string} property = property with optional webkit prefix
       */
      (this.isWebkit = function(property) {
        if (typeof document.documentElement.style[property] === 'string') {
          return property;
        }

        property = _this.capitalizeFirstLetter(property);
        property = 'webkit'.concat(property);

        return property;
      }),
      /**
       * Capitalize the first letter in the string
       * @param {string} string = string
       * @return {string} string = changed string
       */
      (this.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }),
      /**
       * Extend defaults deep
       * @param {object} defaults = defaults options defined in script
       * @param {object} properties = user options
       * @return {object} defaults = modified options
       */
      (this.extendDefaults = function(defaults, properties) {
        var property, propertyDeep;

        if (properties != undefined && properties != 'undefined') {
          for (property in properties) {
            var propObj = properties[property];

            if (_typeof(propObj) === 'object') {
              for (propertyDeep in propObj) {
                defaults[property][propertyDeep] = propObj[propertyDeep];
              }
            } else {
              defaults[property] = propObj;
            }
          }
        }

        return defaults;
      });

    this.init();
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SimpleSlider;
  } else {
    window.SimpleSlider = SimpleSlider;
  }
})(window);
