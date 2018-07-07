/*!
 * SimpleSlider v1.6.3
 * Simple responsive slider created in pure javascript.
 * https://github.com/michu2k/SimpleSlider
 * 
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (window) {

    'use strict';

    var slider = {};

    /**
     * Core
     * @param {string} selector = container, where script will be defined
     * @param {object} userOptions = options defined by user
     */
    slider.simpleSlider = function (selector, userOptions) {
        var defaults = void 0;
        var v = {};

        // Defaults
        defaults = {
            speed: 2000, // transition duration in ms {number}
            delay: 6000, // delay between transitions in ms {number}
            autoplay: true, // slider autoplay {boolean}
            classes: {
                wrapper: 'slider-wrapper', // wrapper class {string}
                slide: 'slider-slide', // slide class {string}
                buttons: 'slider-btn', // buttons class {string}
                pagination: 'slider-pagination', // pagination class {string}
                paginationItem: 'pagination-bullet' // pagination bullet class {string}
            }
        };

        // Set options
        v.options = slider.extendDefaults(defaults, userOptions);

        // Elements
        v.container = document.querySelector(selector);
        v.wrapper = v.container.querySelector('.' + v.options.classes.wrapper);
        v.buttons = v.container.querySelectorAll('.' + v.options.classes.buttons);
        v.slides = v.container.querySelectorAll('.' + v.options.classes.slide);
        v.pagination = v.container.querySelector('.' + v.options.classes.pagination);

        // Vars
        v.disableEvent = false;
        v.index = 0;
        v.timer;
        v.autoplayDelay = v.options.delay + v.options.speed;

        // Call functions
        slider.createClones(v);
        slider.setWidth(v);
        slider.moveWrapper(v);

        // Pagination
        if (v.pagination) {
            slider.createPagination(v);
        }

        // Autoplay
        if (v.options.autoplay) {
            slider.autoplay(v);
        }

        // Buttons
        if (v.buttons.length == 2) {
            slider.buttons(v);
        }

        // Call functions when window is resized
        window.addEventListener('resize', function () {
            slider.setWidth(v);
            slider.moveWrapper(v);
            slider.setTransition(0, v.wrapper);
        });
    };

    /**
     * Move slider main function
     * @param {object} vars = list of variables
     * @param {string} direction = move direction [left, right]
     */
    slider.moveSlider = function (vars) {
        var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'right';

        // Change index value depending on the direction
        direction == 'left' ? vars.index-- : vars.index++;

        // Disable events
        slider.disableEvents(vars);

        // Highlight bullet
        if (vars.pagination) {
            slider.highlightBullet(vars);
        }

        // Set transition duration
        slider.setTransition(vars.options.speed, vars.wrapper);

        // Switch from the cloned slide to the proper slide
        if (vars.index < 0 || vars.index >= vars.slides.length) {
            setTimeout(function () {
                // Set transition duration
                slider.setTransition(0, vars.wrapper);

                // Update index
                vars.index = slider.updateIndex(vars.index, vars.slides.length);

                // Move wrapper
                slider.moveWrapper(vars);
            }, vars.options.speed);
        }

        // Move wrapper
        slider.moveWrapper(vars);
    };

    /**
     * Create slider pagination
     * @param {object} vars = list of variables
     */
    slider.createPagination = function (vars) {
        var bullet = void 0;
        var fragment = document.createDocumentFragment();

        // Create bullets
        for (var i = 0; i < vars.slides.length; i++) {
            bullet = document.createElement('span');
            bullet.classList.add(vars.options.classes.paginationItem);

            // Add active class to first bullet
            if (i == 0) {
                bullet.classList.add('active');
            }

            fragment.appendChild(bullet);
        }

        // Append bullets to the DOM
        vars.pagination.appendChild(fragment);

        // Bullets action
        slider.bullets(vars);
    };

    /**
     * Move slide when clicked on pagination bullet
     * @param {object} vars = list of variables
     */
    slider.bullets = function (vars) {
        var bullets = vars.pagination.querySelectorAll('.' + vars.options.classes.paginationItem);

        var _loop = function _loop(i) {
            bullets[i].addEventListener('click', function () {

                if (!vars.disableEvent) {

                    vars.index = i - 1;
                    slider.moveSlider(vars);

                    // Reset autoplay
                    if (vars.options.autoplay) {
                        slider.resetAutoplay(vars);
                    }
                }
            });
        };

        for (var i = 0; i < bullets.length; i++) {
            _loop(i);
        }
    };

    /**
     * Highlight active bullet
     * @param {object} vars = list of variables
     */
    slider.highlightBullet = function (vars) {
        var bullets = vars.pagination.querySelectorAll('.' + vars.options.classes.paginationItem);
        var index = slider.updateIndex(vars.index, vars.slides.length);

        // Remove active class
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].classList.contains('active')) {
                bullets[i].classList.remove('active');
            }
        }

        // Add class to active bullet
        bullets[index].classList.add('active');
    };

    /**
     * Move slide when clicked on button
     * @param {object} vars = list of variables
     */
    slider.buttons = function (vars) {
        var direction = ['left', 'right'];

        var _loop2 = function _loop2(i) {
            vars.buttons[i].addEventListener('click', function () {

                if (!vars.disableEvent) {
                    slider.moveSlider(vars, direction[i]);

                    // Reset autoplay
                    if (vars.options.autoplay) {
                        slider.resetAutoplay(vars);
                    }
                }
            });
        };

        for (var i = 0; i < vars.buttons.length; i++) {
            _loop2(i);
        }
    };

    /**
     * Disable events during slider animation
     * @param {object} vars = list of variables
     */
    slider.disableEvents = function (vars) {
        vars.disableEvent = true;

        // Enable Events
        setTimeout(function () {
            vars.disableEvent = false;
        }, vars.options.speed);
    };

    /** 
     * Slider autoplay 
     * @param {object} vars = list of variables
     */
    slider.autoplay = function (vars) {
        vars.timer = setTimeout(function () {
            slider.moveSlider(vars);
            slider.autoplay(vars);
        }, vars.autoplayDelay);
    };

    /**
     * Reset slider autoplay
     * @param {object} vars = list of variables
     */
    slider.resetAutoplay = function (vars) {
        clearTimeout(vars.timer);
        slider.autoplay(vars);
    };

    /** 
     * Set transition duration
     * @param {number} speed = speed value in miliseconds
     * @param {object} wrapper = wrapper element
     */
    slider.setTransition = function (speed, wrapper) {
        var transition = slider.getSupportedProperty('TransitionDuration');
        wrapper.style[transition] = speed + 'ms';
    };

    /**
     * Change wrapper position by a certain number of pixels
     * @param {object} vars = list of variables
     */
    slider.moveWrapper = function (vars) {
        var pixels = 0;
        var slides = vars.container.querySelectorAll('.' + vars.options.classes.slide);

        for (var i = 0; i <= vars.index; i++) {
            pixels += slides[i].offsetWidth;
        }

        var transform = slider.getSupportedProperty('Transform');
        vars.wrapper.style[transform] = 'translate3d( -' + pixels + 'px, 0, 0)';
    };

    /**
     * Set wrapper and slides width
     * @param {object} vars = list of variables
     */
    slider.setWidth = function (vars) {
        var wrapperWidth = 0;
        var slides = vars.container.querySelectorAll('.' + vars.options.classes.slide);

        for (var i = 0; i < slides.length; i++) {
            // Slide width
            slides[i].style.width = vars.container.offsetWidth + 'px';

            // Wrapper width
            wrapperWidth += slides[i].offsetWidth;
        }

        vars.wrapper.style.width = wrapperWidth + 'px';
    };

    /**
     * Clone first and last slide and append them to the DOM
     * @param {object} vars = list of variables
     */
    slider.createClones = function (vars) {
        var firstElement = vars.wrapper.firstElementChild.cloneNode(true);
        var lastElement = vars.wrapper.lastElementChild.cloneNode(true);

        vars.wrapper.appendChild(firstElement);
        vars.wrapper.insertBefore(lastElement, vars.slides[0]);
    };

    /**
     * Update index
     * @param {number} index = index value
     * @param {number} slides = number of slides
     * @return {number} index = index value after correction
     */
    slider.updateIndex = function (index, slides) {
        if (index >= slides) {
            index = 0;
        }

        if (index < 0) {
            index = slides - 1;
        }

        return index;
    };

    /**
     * Get supported property and add prefix if needed
     * @param {string} property = property name
     * @return {string} propertyWithPrefix = property prefix
     */
    slider.getSupportedProperty = function (property) {
        var prefix = ['-', 'webkit', 'ms', 'o'];
        var propertyWithPrefix = void 0;

        for (var i = 0; i < prefix.length; i++) {
            if (prefix[i] == '-') {
                propertyWithPrefix = property.toLowerCase();
            } else {
                propertyWithPrefix = prefix[i] + property;
            }

            if (typeof document.body.style[propertyWithPrefix] != 'undefined') {
                return propertyWithPrefix;
            }
        }

        return null;
    };

    /**
     * Extend defaults deep
     * @param {object} defaults = defaults options defined in script
     * @param {object} properties = new options
     * @return {object} defaults = modified options
     */
    slider.extendDefaults = function (defaults, properties) {
        var property = void 0;
        var propertyDeep = void 0;

        if (properties != undefined && properties != 'undefined') {

            for (property in properties) {
                if (_typeof(properties[property]) === 'object') {

                    for (propertyDeep in properties[property]) {
                        defaults[property][propertyDeep] = properties[property][propertyDeep];
                    }
                } else {
                    defaults[property] = properties[property];
                }
            }
        }

        return defaults;
    };

    window.simpleSlider = slider.simpleSlider;
})(window);