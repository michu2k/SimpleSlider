/**
  * SimpleSlider v1.5.0
  * Simple responsive slider created in pure javascript.
  * https://github.com/michu2k/SimpleSlider
  *
  * Copyright 2017 Michał Strumpf
  * Published under MIT License
  */
(function(window) {

	'use strict';

	/* simpleSlider */
	let simpleSlider = function(selector, userOptions)
	{
		// Variables
		let a, index, defaults, v = [];

		// Defaults
		defaults = {
			speed: 2000,		// transition duration in ms [number]
			delay: 6000,		// delay between transitions in ms [number]
			autoplay: true,		// slider autoplay [boolean]
			classes: {
				wrapper: 'slider-wrapper',	// wrapper class [string]
				slide: 'slider-slide',		// slide class [string]
				buttons: 'slider-btn'		// buttons class [string]
			}
		};

		// Set options
		v.options = extendDefaults(defaults, userOptions); 

		v.container = document.querySelector(selector);
		v.wrapper = v.container.querySelector(`.${v.options.classes.wrapper}`);
		v.buttons = v.container.querySelectorAll(`.${v.options.classes.buttons}`);
		v.slides = v.container.querySelectorAll(`.${v.options.classes.slide}`);
		v.selector = selector;

		// Call functions
		updateData();
		createClones();
		setWidth();
		updateWrapper();

		// Enable slider autoplay
		if (v.options.autoplay === true)
			autoPlay();

		// Buttons
		if (v.buttons && v.buttons.length == 2) 
		{
			btnClick(0, 'left');
			btnClick(1, 'right');
		}

		/**
		  * Slider main core
		  * direction = move direction [string][left, right]
		  */	
		function sliderCore(direction)
		{
			if (typeof index === 'undefined') index = 1;

			// Change index depending on the direction
			if (direction == 'left')
				index--;
			else
				index++;

			// Set transition
			setTransition(v.options.speed, 'none');

			setTimeout(function() {
				setTransition(0, 'auto');
			}, v.options.speed);
			
			// Switch from last cloned to first slide
			if (index > v.slides.length)
			{	
				setTimeout(function() {
					updateWrapper();
					index = 1;
				}, v.options.speed);
			}

			// Switch from first cloned to last slide
			if (index == 0)
			{	
				setTimeout(function() {
					updateWrapper(v.slides.length);
					index = v.slides.length;
				}, v.options.speed);
			}

			updateWrapper(index);
		}

		/** 
		  * Set transition duration and enable/disable buttons 
		  * speed = speed value in miliseconds [number]
		  * event = pointer event value [string]
		  */
		function setTransition(speed, event)
		{
			let transition = getSupportedProperty('TransitionDuration');
			v.wrapper.style[transition] = speed + 'ms';

			v.buttons[0].style.pointerEvents = event;
			v.buttons[1].style.pointerEvents = event;
		}

		/**
		  * Move slide when clicked on button
		  * index = button number [number]
		  * direction = move direction [string][left, right]
		  */
		function btnClick(index, direction)
		{
			v.buttons[index].addEventListener('click', function() {
				
				sliderCore(direction);

				if (v.options.autoplay === true)
				{
					clearInterval(a);
					setTimeout(autoPlay, v.options.speed);
				}
			});
		}

		/* Slider autoplay */
		function autoPlay()
		{
			let delay = v.options.delay + v.options.speed;
			a = setInterval(sliderCore, delay);
		}
	
		/* Call functions when window is resized */	
		function updateData()
		{
			let resize;
			window.addEventListener('resize', function() {
				clearTimeout(resize);

			    resize = setTimeout(function() {
					setWidth();
					updateWrapper(index);
			    }, 100);
			});	
		}

		/**
		  * Change wrapper position by a certain number of pixels
		  * index = current slider index [number]
		  */
		function updateWrapper(index)
		{
			if (typeof index === 'undefined') index = 1;
		
			let pixels = index * v.container.offsetWidth;
			v.wrapper = v.container.querySelector(`.${v.options.classes.wrapper}`);

			let transform = getSupportedProperty('Transform');
			v.wrapper.style[transform] = `translate3d( -${pixels}px, 0, 0)`;
		}

		/* Clone first and last slide and append them to the DOM */
		function createClones()
		{
			let firstElement = v.wrapper.firstElementChild.cloneNode(true);
			let lastElement = v.wrapper.lastElementChild.cloneNode(true);

			v.wrapper.appendChild(firstElement);
			v.wrapper.insertBefore(lastElement, v.slides[0]);
		}

		/* Set wrapper and slides width */
		function setWidth()
		{
			let i, slides, wrapperWidth;
			slides = v.container.querySelectorAll(`.${v.options.classes.slide}`);

			// Wrapper width
			wrapperWidth = (v.container.offsetWidth + 1) * slides.length;
			v.wrapper.style.width = wrapperWidth + 'px';

			// Slides
			for (i = 0; i < slides.length; i++)
			{
				slides[i].style.width = v.container.offsetWidth + 'px';
			}
		}

		/**
		  * Get supported property and add prefix if needed
		  * property = property name [string]
		  */
		function getSupportedProperty(property)
		{
			let prefix = ['-', 'webkit', 'moz', 'ms', 'o'];
			let i, propertyWithPrefix;

			for (i = 0; i < prefix.length; i++) 
			{
				if (prefix[i] == '-')
					propertyWithPrefix = property.toLowerCase();
				else
					propertyWithPrefix = prefix[i] + property;

				if (typeof document.body.style[propertyWithPrefix] != 'undefined')
				{
		           return propertyWithPrefix;
		        }
			}

			return null;
		}

		/**
		  * Extend defaults deep
		  * defaults = defaults options defined in script
		  * properties = new options
		  */
		function extendDefaults(defaults, properties)
		{
			let property, propertyDeep;

			if (properties != undefined && properties != 'undefined')
			{
				for (property in properties)
				{
					if (typeof properties[property] === 'object')
					{
						for (propertyDeep in properties[property])
						{
							defaults[property][propertyDeep] = properties[property][propertyDeep];
						}
					} else defaults[property] = properties[property];
				}
			}
			return defaults;
		}
	}

	window.simpleSlider = simpleSlider;

})(window);