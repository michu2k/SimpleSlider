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
             * Set slider options
             */
            setSliderOptions() {
                // Get user options
                const {delay, speed, class: {wrapper, slide, buttons, pagination}} = this.options;

                // DOM elements
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
                    maxOffset: 0,
                    focused: false,
                    isLink: false
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
            },

            /**
             * Attach events
             */
            attachEvents() {
                const {enableDrag} = this.options;

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
                this.drag.maxOffset = 100;

                Object.values(this.allSlides).map((slide, index) => {
                    // Slide width
                    slide.style.width = slideWidth;

                    // Wrapper width
                    this.wrapperWidth += slide.offsetWidth;

                    // Maximum drag offset
                    if (index + slidesPerView < this.allSlides.length) {
                        this.drag.maxOffset += slide.offsetWidth;
                    }
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

                for (let i = 0; i < activeSlide; i++) {
                    this.wrapperPosition += this.allSlides[i].offsetWidth;
                }

                // Set wrapper position
                this.wrapper.style[this.transform] = `translate3d(-${this.wrapperPosition}px, 0, 0)`;
            },

            /**
             * Change the slide 
             * @param {string} direction = move direction [left, right]
             * @param {boolean} isAutoplay = check if the function is called by autoplay
             */
            changeSlide(direction, isAutoplay = false) {
                const {speed} = this.options;

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

                    setTimeout(() => {
                        // Switch from the cloned slide to the proper slide
                        if (this.index <= 0 || this.index > this.slides.length) {
                            this.index = this.updateIndex(this.index);
                            this.setTransition(0);
                            this.moveWrapper();
                        }

                        // Enable Events
                        this.disableEvents = false;
                    }, speed);
                }
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
    
                        this.changeSlide('right');
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
             * Previous button
             */
            prevBtn() {
                this.buttons[0].addEventListener('click', () => {
                    this.changeSlide('left');
                });
            },
    
            /**
             * Next button
             */
            nextBtn() {
                this.buttons[1].addEventListener('click', () => {
                    this.changeSlide('right');
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
                        this.changeSlide('right', true);
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
             * Update slider position after drag event
             */
            updateSliderAfterDrag() {
                const {speed} = this.options;

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
            updateSliderDuringDrag() {
                // Reset autoplay
                this.resetAutoplay();

                this.drag.dragDiff = this.drag.endX - this.drag.startX;
                const movement = this.wrapperPosition - this.drag.dragDiff;

                if (movement < this.drag.maxOffset && movement > -100) {
                    this.wrapper.style[this.transform] = `translate3d(${-1 * movement}px, 0, 0)`;
                } else {
                    this.updateSliderAfterDrag();
                }
            },

            /**
             * Mousedown event
             */
            mousedownHandler(e) {
                e.stopPropagation();

                this.setTransition(0);
                this.drag.focused = true;
                this.drag.startX = e.pageX;
            },

            /**
             * Mousemove event
             */
            mousemoveHandler(e) {
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
            mouseupHandler(e) {
                e.stopPropagation();
                this.updateSliderAfterDrag();
            },

            /**
             * Click event
             */
            clickHandler(e) {
                if (this.drag.isLink) {
                    e.preventDefault();
                }

                this.drag.isLink = false;
            },

            /**
             * Touchstart event
             */
            touchstartHandler(e) {
                e.stopPropagation();

                this.setTransition(0);
                this.drag.focused = true;
                this.drag.startX = e.touches[0].pageX;
            },

            /**
             * Touchmove event
             */
            touchmoveHandler(e) {
                e.stopPropagation();

                if (!this.disableEvents && this.drag.focused) {
                    this.drag.endX = e.touches[0].pageX;
                    this.updateSliderDuringDrag();
                }
            },
    
            /**
             * Touchend event
             */
            touchendHandler(e) {
                e.stopPropagation();
                this.updateSliderAfterDrag();
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
                    this.resetAutoplay();

                    if (!document[hidden]) {
                        this.autoplay();
                    }
                });
            },

            /**
             * Calculate the slider when changing the window size
             */
            resizeHandler() {
                this.setWidth();
                this.setTransition(0);
                this.moveWrapper();
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