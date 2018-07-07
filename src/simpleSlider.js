/*!
 * SimpleSlider v1.6.3
 * Simple responsive slider created in pure javascript.
 * https://github.com/michu2k/SimpleSlider
 *
 * Copyright 2017-2018 Michał Strumpf
 * Published under MIT License
 */

(function(window) {

    'use strict';

    let slider = {};

    /**
     * Core
     * @param {string} selector = container, where script will be defined
     * @param {object} userOptions = options defined by user
     */
    slider.simpleSlider = (selector, userOptions) =>
    {
        let defaults;
        let v = {};

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
                paginationItem: 'pagination-bullet', // pagination bullet class {string}
            }
        };

        // Set options
        v.options = slider.extendDefaults(defaults, userOptions);

        // Elements
        v.container = document.querySelector(selector);
        v.wrapper = v.container.querySelector(`.${v.options.classes.wrapper}`);
        v.buttons = v.container.querySelectorAll(`.${v.options.classes.buttons}`);
        v.slides = v.container.querySelectorAll(`.${v.options.classes.slide}`);
        v.pagination = v.container.querySelector(`.${v.options.classes.pagination}`);

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
        window.addEventListener('resize', () => {
            slider.setWidth(v);
            slider.moveWrapper(v);
            slider.setTransition(0, v.wrapper);
        });
    }

    /**
     * Move slider main function
     * @param {object} vars = list of variables
     * @param {string} direction = move direction [left, right]
     */ 
    slider.moveSlider = (vars, direction = 'right') =>
    { 
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
            setTimeout(() => {
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
    }

    /**
     * Create slider pagination
     * @param {object} vars = list of variables
     */ 
    slider.createPagination = (vars) =>
    {
        let bullet;
        let fragment = document.createDocumentFragment();

        // Create bullets
        for (let i = 0; i < vars.slides.length; i++)
        {
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
    }

    /**
     * Move slide when clicked on pagination bullet
     * @param {object} vars = list of variables
     */
    slider.bullets = (vars) =>
    {
        let bullets = vars.pagination.querySelectorAll(`.${vars.options.classes.paginationItem}`);

        for (let i = 0; i < bullets.length; i++)
        {
            bullets[i].addEventListener('click', () => {

                if (!vars.disableEvent) { 

                    vars.index = i - 1;
                    slider.moveSlider(vars);

                    // Reset autoplay
                    if (vars.options.autoplay) {
                        slider.resetAutoplay(vars);
                    }
                }
            });
        }
    }

    /**
     * Highlight active bullet
     * @param {object} vars = list of variables
     */
    slider.highlightBullet = (vars) =>
    {
        let bullets = vars.pagination.querySelectorAll(`.${vars.options.classes.paginationItem}`);
        let index = slider.updateIndex(vars.index, vars.slides.length);

        // Remove active class
        for (let i = 0; i < bullets.length; i++)
        {
            if (bullets[i].classList.contains('active')) {
                bullets[i].classList.remove('active');
            }
        }

        // Add class to active bullet
        bullets[index].classList.add('active');
    }

    /**
     * Move slide when clicked on button
     * @param {object} vars = list of variables
     */
    slider.buttons = (vars) =>
    {
        let direction = ['left', 'right'];

        for (let i = 0; i < vars.buttons.length; i++)
        {
            vars.buttons[i].addEventListener('click', () => {

                if (!vars.disableEvent) {
                    slider.moveSlider(vars, direction[i]);

                    // Reset autoplay
                    if (vars.options.autoplay) {
                        slider.resetAutoplay(vars);
                    }
                }
            });
        }
    }
    
    /**
     * Disable events during slider animation
     * @param {object} vars = list of variables
     */
    slider.disableEvents = (vars) =>
    {
        vars.disableEvent = true;

        // Enable Events
        setTimeout(() => {
            vars.disableEvent = false;
        }, vars.options.speed);
    }

    /** 
     * Slider autoplay 
     * @param {object} vars = list of variables
     */
    slider.autoplay = (vars) =>
    {
        vars.timer = setTimeout(() => {
            slider.moveSlider(vars);
            slider.autoplay(vars);
        }, vars.autoplayDelay);
    }

    /**
     * Reset slider autoplay
     * @param {object} vars = list of variables
     */
    slider.resetAutoplay = (vars) =>
    {
        clearTimeout(vars.timer);
        slider.autoplay(vars);
    }
 
    /** 
     * Set transition duration
     * @param {number} speed = speed value in miliseconds
     * @param {object} wrapper = wrapper element
     */
    slider.setTransition = (speed, wrapper) =>
    {
        let transition = slider.getSupportedProperty('TransitionDuration');
        wrapper.style[transition] = speed + 'ms';
    }

    /**
     * Change wrapper position by a certain number of pixels
     * @param {object} vars = list of variables
     */
    slider.moveWrapper = (vars) =>
    {
        let pixels = 0;
        let slides = vars.container.querySelectorAll(`.${vars.options.classes.slide}`);

        for(let i = 0; i <= vars.index; i++)
        {
            pixels += slides[i].offsetWidth;
        }

        let transform = slider.getSupportedProperty('Transform');
        vars.wrapper.style[transform] = `translate3d( -${pixels}px, 0, 0)`;
    }

    /**
     * Set wrapper and slides width
     * @param {object} vars = list of variables
     */
    slider.setWidth = (vars) =>
    {
        let wrapperWidth = 0;
        let slides = vars.container.querySelectorAll(`.${vars.options.classes.slide}`);

        for(let i = 0; i < slides.length; i++)
        {
            // Slide width
            slides[i].style.width = vars.container.offsetWidth + 'px';

            // Wrapper width
            wrapperWidth += slides[i].offsetWidth;
        } 

        vars.wrapper.style.width = wrapperWidth + 'px';     
    }

    /**
     * Clone first and last slide and append them to the DOM
     * @param {object} vars = list of variables
     */     
    slider.createClones = (vars) =>
    {
        let firstElement = vars.wrapper.firstElementChild.cloneNode(true);
        let lastElement = vars.wrapper.lastElementChild.cloneNode(true);

        vars.wrapper.appendChild(firstElement);
        vars.wrapper.insertBefore(lastElement, vars.slides[0]);
    }

    /**
     * Update index
     * @param {number} index = index value
     * @param {number} slides = number of slides
     * @return {number} index = index value after correction
     */
    slider.updateIndex = (index, slides) =>
    {
        if (index >= slides) {
            index = 0;
        }

        if (index < 0) {
            index = slides - 1;
        }

        return index;
    }

    /**
     * Get supported property and add prefix if needed
     * @param {string} property = property name
     * @return {string} propertyWithPrefix = property prefix
     */
    slider.getSupportedProperty = (property) =>
    {
        let prefix = ['-', 'webkit', 'ms', 'o'];
        let propertyWithPrefix;

        for (let i = 0; i < prefix.length; i++) 
        {
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
    }

    /**
     * Extend defaults deep
     * @param {object} defaults = defaults options defined in script
     * @param {object} properties = new options
     * @return {object} defaults = modified options
     */
    slider.extendDefaults = (defaults, properties) =>
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

    window.simpleSlider = slider.simpleSlider;

})(window);