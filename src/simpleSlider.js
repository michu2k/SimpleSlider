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
                    speed: 1600, // transition duration in ms {number}
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
                // Get options
                const {delay, speed, class: {wrapper, slide, buttons, pagination}} = this.options;

                // Elements
                this.container = document.querySelector(selector);
                this.wrapper = this.container.querySelector(`.${wrapper}`);
                this.slides = this.container.querySelectorAll(`.${slide}`);
                this.buttons = this.container.querySelectorAll(`.${buttons}`);
                this.pagination = this.container.querySelector(`.${pagination}`);

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
            init() {

                // Set options
                this.setUserOptions();
                this.setSliderOptions();

                // Call functions
                this.createClones();
                this.setWidth();
                this.moveWrapper();

                const {autoplay} = this.options;
    
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
            createClones() {
                const {slidesPerView} = this.options;
                const wrapper = this.wrapper;
                const slidesLength = this.slides.length - 1;
                const clonesAtFront = document.createDocumentFragment();
                const clonesAtBack = document.createDocumentFragment();
                let slide;

                for (let i = 0; i < slidesPerView; i++) {
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
            setWidth() {
                const {slidesPerView, class: {slide}} = this.options;
                const slides = this.container.querySelectorAll(`.${slide}`);
                const slideWidth = Math.round(this.container.offsetWidth / slidesPerView) + 'px';
                let wrapperWidth = 0;

                Object.values(slides).map((slide) => {
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
            moveWrapper() {
                const {slidesPerView,class: {slide}} = this.options;
                const slides = this.container.querySelectorAll(`.${slide}`);
                let activeSlide = Math.round(slidesPerView / 2) + this.index;
                let pixels = 0;

                // If slides per view is even, move one to the left
                if (slidesPerView % 2 == 0 ) {
                    activeSlide++;
                }

                for (let i = 0; i < activeSlide; i++) {
                    pixels += slides[i].offsetWidth;
                }

                this.wrapper.style[this.transform] = `translate3d(-${pixels}px, 0, 0)`;
            },
     
            /**
             * Move slider main function
             * @param {string} direction = move direction [left, right]
             */ 
            moveSlider(direction) {
                const {speed} = this.options;

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
                    setTimeout(() => {
                        // Update index
                        this.index = this.updateIndex(this.index); 
    
                        this.setTransition(0);
                        this.moveWrapper();
                    }, speed);
                }
    
                this.moveWrapper();
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
    
                        if (!this.disableEvent) {
                            this.index = index - 1;
                        }
    
                        this.buttonsAction('right');
                    });
                });
            },

            /**
             * Call actions on click the navigation element
             * @param {string} direction = slider move direction [left, right]
             */
            buttonsAction(direction) {
                const {autoplay} = this.options;

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
            highlightBullet() {
                const {class: {paginationItem}} = this.options;

                // Remove active class from bullet
                let activeBullet = this.pagination.querySelector('.active');
                activeBullet.classList.remove('active');
    
                // Add class to active bullet
                let bullets = this.pagination.querySelectorAll(`.${paginationItem}`);
                let index = this.updateIndex(this.index);
                bullets[index].classList.add('active');
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
            disableEvents() {
                const {speed} = this.options;
                this.disableEvent = true;
    
                // Enable Events
                setTimeout(() => {
                    this.disableEvent = false;
                }, speed);
            },

            /** 
             * Slider autoplay
             */
            autoplay() {
                this.timer = setTimeout(() => {
                    this.moveSlider('right');
                    this.autoplay();
                }, this.autoplayDelay);
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
            visibilityChange() {
                const {autoplay} = this.options;

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
                    if (autoplay) {
                        if (!document[hidden]) {
                            this.resetAutoplay();
                            this.autoplay();
                        } else {
                            this.resetAutoplay();
                        }
                    }
                });
            },

            /**
             * Calculate the slider when changing the window size
             */
            resize() {
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