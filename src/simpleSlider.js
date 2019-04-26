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
    const simpleSlider = function(selector, userOptions)
    {
        const slider = {

            /**
             * Extend defaults options
             */
            setUserOptions() {
                // Defaults
                const defaults = {
                    speed: 1000, // transition duration in ms {number}
                    delay: 6000, // delay between transitions in ms {number}
                    slidesPerView: 1,
                    autoplay: false, // slider autoplay {boolean}
                    class: {
                        wrapper: 'slider-wrapper', // wrapper class {string}
                        slide: 'slider-slide', // slide class {string}
                        buttons: 'slider-btn', // buttons class {string}
                        pagination: 'slider-pagination', // pagination class {string}
                        paginationItem: 'pagination-bullet', // pagination bullet class {string}
                    }
                };

                // Extends defaults
                const replaceClasses = Object.assign(defaults.class, userOptions.class);
                const options = Object.assign(defaults, userOptions);
                Object.assign(options.class, replaceClasses);

                this.options = options;
            },

            /**
             * Set additional slider options
             */
            setSliderOptions() {
                // Get user options
                const {delay, speed, class: {wrapper, slide, buttons, pagination}} = this.options;

                // Elements
                this.container = document.querySelector(selector);
                this.wrapper = this.container.querySelector(`.${wrapper}`);
                this.slides = this.container.querySelectorAll(`.${slide}`);
                this.buttons = this.container.querySelectorAll(`.${buttons}`);
                this.pagination = this.container.querySelector(`.${pagination}`);

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
                }
            },

            /**
             * Init slider
             */
            init() {
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
            attachEvents() {
                this.container.addEventListener('touchstart', this.touchstartHandler.bind(this));
                this.container.addEventListener('touchmove', this.touchmoveHandler.bind(this));
                this.container.addEventListener('touchend', this.touchendHandler.bind(this));
            },

            /**
             * Touchstart event
             */
            touchstartHandler(e) {
                e.stopPropagation();

                this.setTransition(0);
                //this.drag.maxMovement = (this.wrapperWidth / this.allSlides.length) + 50;
                this.drag.startX = e.touches[0].pageX;
                this.drag.focused = true;

                setTimeout(() => {
                    this.drag.focused = false;
                }, 100);
            },

            /**
             * Touchmove event
             */
            touchmoveHandler(e) {
                e.stopPropagation();

                this.drag.endX = e.touches[0].pageX;
                this.drag.dragDiff = this.drag.endX - this.drag.startX;
                this.wrapper.style[this.transform] = `translate3d(-${this.wrapperPosition - this.drag.dragDiff}px, 0, 0)`;
            },
    
            /**
             * Touchend event
             */
            touchendHandler(e) {
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
            createClones() {
                const {slidesPerView, class: {slide}} = this.options;
                const wrapper = this.wrapper;
                const slidesLength = this.slides.length - 1;
                const clonesAtFront = document.createDocumentFragment();
                const clonesAtBack = document.createDocumentFragment();
                let cloned;

                for (let i = 0; i < slidesPerView; i++) {
                    if (slidesLength - i < 0 || i > slidesLength)  break;

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
            },

            /**
             * Set wrapper and slides width
             */
            setWidth() {
                const {slidesPerView} = this.options;
                const slideWidth = Math.round(this.container.offsetWidth / slidesPerView) + 'px';
                this.wrapperWidth = 0;

                Object.values(this.allSlides).map((slide) => {
                    // Slide width
                    slide.style.width = slideWidth;

                    // Wrapper width
                    this.wrapperWidth += slide.offsetWidth;
                });
                
                this.wrapper.style.width = this.wrapperWidth + 'px';     
            },
            
            /**
             * Change wrapper position by a certain number of pixels
             */
            moveWrapper() {
                const {slidesPerView} = this.options;
                let activeSlide = Math.floor(slidesPerView / 2) + this.index;
                this.wrapperPosition = 0;

                if (slidesPerView % 2 == 0) {
                    activeSlide++;
                }

                for (let i = 0; i < activeSlide; i++) {
                    this.wrapperPosition += this.allSlides[i].offsetWidth;
                }

                // Set wrapper position
                this.wrapper.style[this.transform] = `translate3d(-${this.wrapperPosition}px, 0, 0)`;
            },

            /**
             * Move slider main function
             * @param {string} direction = move direction [left, right]
             */
            changeSlide(direction) {
                const {speed} = this.options;

                // Change index value depending on the direction
                direction == 'right' ? this.index++ : this.index--;
    
                // Disable events
                this.disableAllEvents();

                // Highlight bullet
                this.highlightBullet();
    
                this.setTransition(speed);
                this.moveWrapper();

                setTimeout(() => {
                    // Switch from the cloned slide to the proper slide
                    if (this.index <= 0 || this.index > this.slides.length) {
                        this.index = this.updateIndex(this.index);
                        this.moveWrapper();
                        this.setTransition(0);
                    }
                }, speed);
            },

            /**
             * Disable events during slider animation
             */
            disableAllEvents() {
                const {speed} = this.options;

                this.disableEvents = true;
                
                // Enable Events
                setTimeout(() => {
                    this.disableEvents = false;
                }, speed);
            },

            /** 
             * Set transition duration
             * @param {number} speed = speed value in miliseconds
             */
            setTransition(speed) {
                this.wrapper.style[this.transitionDuration] = speed + 'ms';
            },    

            /**
             * Create slider pagination
             */ 
            createPagination() {
                if (!this.pagination) return;

                const {class: {paginationItem}} = this.options;
                const fragment = document.createDocumentFragment();
                const slidesLength = this.slides.length;
                let bullet;
    
                // Create bullets
                for (let i = 0; i < slidesLength; i++) {
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
            bullets() {
                const {class: {paginationItem}} = this.options;
                const bullets = this.pagination.querySelectorAll(`.${paginationItem}`);

                Object.values(bullets).map((bullet, index) => {
                    bullet.addEventListener('click', () => {
                        if (!this.disableEvents) {
                            this.index = index;
                        }
    
                        this.buttonsAction('right');
                    });
                });
            },

            /**
             * Highlight active bullet
             */
            highlightBullet() {
                if (!this.pagination) return;

                const {class: {paginationItem}} = this.options;

                // Remove active class from bullet
                let activeBullet = this.pagination.querySelector('.active');
                activeBullet.classList.remove('active');
    
                // Add class to active bullet
                let bullets = this.pagination.querySelectorAll(`.${paginationItem}`);
                let index = this.updateIndex(this.index);
                bullets[index - 1].classList.add('active');
            },

            /**
             * Call actions on click the navigation element
             * @param {string} direction = slider move direction [left, right]
             */
            buttonsAction(direction) {
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
            prevBtn() {
                this.buttons[0].addEventListener('click', () => {
                    this.buttonsAction('left');
                });
            },
    
            /**
             * Next button
             */
            nextBtn() {
                this.buttons[1].addEventListener('click', () => {
                    this.buttonsAction('right');
                });
            },

            /**
             * Update index
             * @param {number} index = index value
             * @return {number} index = index value after correction
             */
            updateIndex(index) {
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
            autoplay() {
                const {autoplay} = this.options;
                
                if (autoplay) {
                    this.timer = setTimeout(() => {
                        this.changeSlide('right');
                        this.autoplay();
                    }, this.autoplayDelay);
                }
            },

            /**
             * Reset slider autoplay
             */
            resetAutoplay() {
                clearTimeout(this.timer);
            },

            /**
             * Play/Stop autoplay when tab is active/inactive
             */
            visibilityChangeHandler() {
                let hidden, visibilityChange;
    
                if (typeof document.hidden !== 'undefined') {
                    hidden = 'hidden';
                    visibilityChange = 'visibilitychange';
                } else {
                    hidden = 'webkitHidden';
                    visibilityChange = 'webkitvisibilitychange';
                }
    
                window.addEventListener(visibilityChange, () => {
                    if (!document[hidden]) {
                        this.resetAutoplay();
                        this.autoplay();
                    } else {
                        this.resetAutoplay();
                    }
                });
            },

            /**
             * Calculate the slider when changing the window size
             */
            resizeHandler() {
                window.addEventListener('resize', () => {
                    this.setWidth();
                    this.moveWrapper();
                    this.setTransition(0);
                });
            },
            
            /**
             * Get supported property and add webkit prefix if needed
             * @param {string} property = property name
             * @return {string} property = property with optional webkit prefix
             */
            isWebkit(property) {
                if (typeof document.documentElement.style[property] === 'string') {
                    return property;
                }

                property = this.capitalizeFirstLetter(property);
                property = `webkit${property}`;

                return property;
            },

            /**
             * Capitalize the first letter in the string
             * @param {string} string = string
             * @return {string} string = changed string
             */
            capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        };

        slider.init();
    };

    window.simpleSlider = simpleSlider;

})(window);