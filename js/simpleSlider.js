/*
	SimpleSlider v1.3.0
	Simple responsive slider created in pure javascript.
	https://github.com/michu2k/SimpleSlider

	Copyright 2017 Michał Strumpf
	Published under MIT License
*/
(function(window) {

	'use strict';

	/*
		simpleSlider
	*/
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
				wrapper: 'slider-wrapper',		// wrapper class [string]
				slide: 'slider-slide',		// slide class [string]
				buttons: 'slider-btn'		// buttons class [string]
			}
		};

		v.options = extendDefaults(defaults, userOptions); // Set options
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
			onButtonClick(0, 'left');
			onButtonClick(1, 'right');
		}

		/*
			Slider main core
			direction = move direction [string][left, right]
		*/	
		function sliderCore(direction)
		{
			if (typeof index === 'undefined') index = 1;

			// Disable buttons
			for (let i = 0; i < v.buttons.length; i++) 
			{
				v.buttons[i].style.pointerEvents = 'none';

				setTimeout(function() {
					v.buttons[i].style.pointerEvents = 'auto';
				}, v.options.speed);
			}

			// If index is bigger than slides.length, set index to 1 without animation
			if (index > v.slides.length)
				index = 1;
			else 
			{
				// Set transition duration. When animation will end, transition is set to 0
				v.wrapper.style.WebkitTransitionDuration = v.options.speed + 'ms';
				v.wrapper.style.transitionDuration = v.options.speed + 'ms';

				setTimeout(function() {
					v.wrapper.style.WebkitTransitionDuration = 0 + 'ms';
					v.wrapper.style.transitionDuration = 0 + 'ms';
				}, v.options.speed);
			}

			// Change index depending on the direction
			if (direction != undefined && direction == 'left')
				index--;
			else
				index++;
			
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

		/*
			Move slide when clicked on button
			index = button number [number]
			direction = move direction [string][left, right]
		*/
		function onButtonClick(index, direction)
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

		/*
			Slider autoplay
		*/
		function autoPlay()
		{
			let delay = v.options.delay + v.options.speed;
			a = setInterval(sliderCore, delay);
		}
	
		/*
			Call functions when window is resized
		*/	
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

		/*
			Change wrapper position
			index = current slider index [number]
		*/
		function updateWrapper(index)
		{
			if (typeof index === 'undefined') index = 1;
		
			let pixels = index * v.container.offsetWidth;

			// Moving wrapper by a certain number of pixels
			v.wrapper = v.container.querySelector(`.${v.options.classes.wrapper}`);
			v.wrapper.style.WebkitTransform = `translate3d( -${pixels}px, 0, 0)`;
			v.wrapper.style.transform = `translate3d( -${pixels}px, 0, 0)`;
		}

		/*
			Clone first and last slide and append them to the DOM
		*/
		function createClones()
		{
			let firstElement = v.wrapper.firstElementChild.cloneNode(true);
			let lastElement = v.wrapper.lastElementChild.cloneNode(true);
			v.wrapper.appendChild(firstElement);
			v.wrapper.insertBefore(lastElement, v.slides[0]);
		}

		/*
			Set wrapper and slides width
		*/
		function setWidth()
		{
			let i, slides, wrapperWidth;
			slides = v.container.querySelectorAll(`.${v.options.classes.slide}`);

			// Wrapper width
			wrapperWidth = (v.container.offsetWidth + 1) * slides.length;
			v.wrapper.style.width = wrapperWidth + 'px';

			// Slides
			for (i = 0; i < slides.length; i++)
				slides[i].style.width = v.container.offsetWidth + 'px';
		}

		/* 
			Extend defaults deep
			defaults = defaults options defined in script
			properties = new options
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