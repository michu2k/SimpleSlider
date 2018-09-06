/*!
 * SimpleSlider v1.7.1
 * Simple responsive slider created in pure javascript.
 * https://github.com/michu2k/SimpleSlider
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

(function(window) {

    'use strict';

    const simpleSlider = function(selector, userOptions)
    {
        const slider = {};

        /**
         * Init slider
         * @param {string} selector = container, where script will be defined
         * @param {object} userOptions = options defined by user
         */
        slider.init = function(selector, userOptions)
        {
            // Defaults
            const defaults = {
                speed: 1600, // transition duration in ms {number}
                delay: 6000, // delay between transitions in ms {number}
                autoplay: false, // slider autoplay {boolean}
                class: {
                    wrapper: 'slider-wrapper', // wrapper class {string}
                    slide: 'slider-slide', // slide class {string}
                    buttons: 'slider-btn', // buttons class {string}
                    pagination: 'slider-pagination', // pagination class {string}
                    paginationItem: 'pagination-bullet', // pagination bullet class {string}
                }
            };

            // Replace default options with user options
            this.options = slider.extendDefaults(defaults, userOptions);

            // Options
            this.disableEvent = false;
            this.index = 0;
            this.autoplayDelay = this.options.delay + this.options.speed;
            this.transitionDuration = slider.isWebkit('transitionDuration');
            this.transform = slider.isWebkit('transform');
            this.timer;

            // Elements
            this.container = document.querySelector(selector);
            this.wrapper = this.container.querySelector(`.${this.options.class.wrapper}`);
            this.buttons = this.container.querySelectorAll(`.${this.options.class.buttons}`);
            this.slides = this.container.querySelectorAll(`.${this.options.class.slide}`);
            this.pagination = this.container.querySelector(`.${this.options.class.pagination}`);

            slider.createClones();
            slider.setWidth();
            slider.moveWrapper();

            // Pagination
            if (this.pagination) {
                slider.createPagination();
            }

            // Autoplay
            if (this.options.autoplay) {
                slider.autoplay();
            }

            // Buttons
            if (this.buttons.length == 2) {
                slider.prevBtn();
                slider.nextBtn();
            }

            // Events
            slider.resize();
            slider.visibilityChange();
        }

        /**
         * Calculate the slider when changing the window size
         */
        slider.resize = function() 
        {
            window.addEventListener('resize', () => {
                slider.setWidth();
                slider.moveWrapper();
                slider.setTransition(0);
            });
        }

        /**
         * Play/Stop autoplay when tab is active/inactive
         */
        slider.visibilityChange = function() 
        {
            // Old browsers support
            let hidden, visibilityChange;

            if (typeof document.hidden !== 'undefined') {
                hidden = 'hidden';
                visibilityChange = 'visibilitychange';
            } else {
                hidden = 'webkitHidden';
                visibilityChange = 'webkitvisibilitychange';
            }

            window.addEventListener(visibilityChange, () => {
                if (this.options.autoplay) {
                    if (!document[hidden]) {
                        slider.resetAutoplay();
                        slider.autoplay();
                    } else {
                        slider.resetAutoplay();
                    }
                }
            });     
        }

        /**
         * Create slider pagination
         */ 
        slider.createPagination = function()
        {
            let bullet;
            let fragment = document.createDocumentFragment();

            // Create bullets
            for (let i = 0; i < this.slides.length; i++)
            {
                bullet = document.createElement('span');
                bullet.classList.add(this.options.class.paginationItem); 

                // Add active class to the first bullet
                if (i == 0) {
                    bullet.classList.add('active');
                }

                fragment.appendChild(bullet);
            }

            // Append bullets to the DOM
            this.pagination.appendChild(fragment);

            // Bullets action
            slider.bullets();
        }

        /**
         * Move slide when clicked on pagination bullet
         */
        slider.bullets = function()
        {
            let bullets = this.pagination.querySelectorAll(`.${this.options.class.paginationItem}`);

            for (let i = 0; i < bullets.length; i++)
            {
                bullets[i].addEventListener('click', () => {

                    if (!this.disableEvent) {
                        this.index = i - 1;
                    }

                    slider.buttonsAction();
                });
            }
        }

        /**
         * Highlight active bullet
         */
        slider.highlightBullet = function()
        {
            // Remove active class from bullet
            let activeBullet = this.pagination.querySelector('.active');
            activeBullet.classList.remove('active');

            // Add class to active bullet
            let bullets = this.pagination.querySelectorAll(`.${this.options.class.paginationItem}`);
            let index = slider.updateIndex(this.index);
            bullets[index].classList.add('active');
        }

        /**
         * Previous button
         */
        slider.prevBtn = function()
        {
            this.buttons[0].addEventListener('click', () => {
                slider.buttonsAction('left');
            });
        }

        /**
         * Next button
         */
        slider.nextBtn = function()
        {
            this.buttons[1].addEventListener('click', () => {
                slider.buttonsAction();
            });
        }    

        /**
         * Call actions on click the navigation element
         * @param {string} direction = slider move direction [left, right]
         */
        slider.buttonsAction = function(direction = 'right')
        {
            if (!this.disableEvent) {
                slider.moveSlider(direction);

                // Reset autoplay
                if (this.options.autoplay) {
                    slider.resetAutoplay();
                    slider.autoplay();
                }
            }
        }
        
        /**
         * Disable events during slider animation
         */
        slider.disableEvents = function()
        {
            this.disableEvent = true;

            // Enable Events
            setTimeout(() => {
                this.disableEvent = false;
            }, this.options.speed);
        }

        /** 
         * Slider autoplay 
         */
        slider.autoplay = function()
        {
            this.timer = setTimeout(() => {
                slider.moveSlider();
                slider.autoplay();
            }, this.autoplayDelay);
        }

        /**
         * Reset slider autoplay
         */
        slider.resetAutoplay = function()
        {
            clearTimeout(this.timer);
        }
     
        /**
         * Move slider main function
         * @param {string} direction = move direction [left, right]
         */ 
        slider.moveSlider = function(direction = 'right')
        {
            // Change index value depending on the direction
            direction == 'right' ? this.index++ : this.index--;

            slider.disableEvents();

            // Highlight bullet
            if (this.pagination) {
                slider.highlightBullet();
            }

            // Set transition duration
            slider.setTransition(this.options.speed);

            // Switch from the cloned slide to the proper slide
            if (this.index < 0 || this.index >= this.slides.length) {
                setTimeout(() => {

                    // Update index
                    this.index = slider.updateIndex(this.index); 

                    slider.setTransition(0);
                    slider.moveWrapper();

                }, this.options.speed);
            }

            slider.moveWrapper();
        }

        /** 
         * Set transition duration
         * @param {number} speed = speed value in miliseconds
         */
        slider.setTransition = function(speed)
        {
            this.wrapper.style[this.transitionDuration] = speed + 'ms';
        }

        /**
         * Change wrapper position by a certain number of pixels
         */
        slider.moveWrapper = function()
        {
            let pixels = 0;
            let slides = this.container.querySelectorAll(`.${this.options.class.slide}`);

            for(let i = 0; i <= this.index; i++)
            {
                pixels += slides[i].offsetWidth;
            }

            this.wrapper.style[this.transform] = `translate3d(-${pixels}px, 0, 0)`;
        }

        /**
         * Set wrapper and slides width
         */
        slider.setWidth = function()
        {
            let wrapperWidth = 0;
            let slides = this.container.querySelectorAll(`.${this.options.class.slide}`);

            for(let i = 0; i < slides.length; i++)
            {
                // Slide width
                slides[i].style.width = this.container.offsetWidth + 'px';

                // Wrapper width
                wrapperWidth += slides[i].offsetWidth;
            } 

            this.wrapper.style.width = wrapperWidth + 'px';     
        }

        /**
         * Clone first and last slide and append them to the DOM
         */     
        slider.createClones = function()
        {
            let firstElement = this.wrapper.firstElementChild.cloneNode(true);
            let lastElement = this.wrapper.lastElementChild.cloneNode(true);

            this.wrapper.appendChild(firstElement);
            this.wrapper.insertBefore(lastElement, this.slides[0]);
        }

        /**
         * Update index
         * @param {number} index = index value
         * @return {number} index = index value after correction
         */
        slider.updateIndex = function(index)
        {
            if (index >= this.slides.length) {
                index = 0;
            }

            if (index < 0) {
                index = this.slides.length - 1;
            }

            return index;
        }

        /**
         * Get supported property and add webkit prefix if needed
         * @param {string} property = property name
         * @return {string} property = property with optional webkit prefix
         */
        slider.isWebkit = function(property)
        {
            if (typeof document.documentElement.style[property] === 'string') {
                return property;
            }

            property = slider.capitalizeFirstLetter(property);
            property = `webkit${property}`;

            return property;
        }

        /**
         * Capitalize the first letter in the string
         * @param {string} string = string
         * @return {string} string = changed string
         */
        slider.capitalizeFirstLetter = function(string)
        {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        /**
         * Extend defaults deep
         * @param {object} defaults = defaults options defined in script
         * @param {object} properties = user options
         * @return {object} defaults = modified options
         */
        slider.extendDefaults = function(defaults, properties)
        {
            let property;
            let propertyDeep;

            if (properties != undefined && properties != 'undefined') {

                for (property in properties)
                {
                    if (typeof properties[property] === 'object') {

                        for (propertyDeep in properties[property])
                        {
                            defaults[property][propertyDeep] = properties[property][propertyDeep];
                        }
                    } else {
                        defaults[property] = properties[property];
                    }
                }
            }

            return defaults;
        }
        
        slider.init(selector, userOptions);
    };

    window.simpleSlider = simpleSlider;

})(window);