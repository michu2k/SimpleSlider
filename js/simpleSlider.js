/*
	Simple responsive slider created in pure javascript.
	Author: Michał Strumpf https://github.com/michu2k
	License: MIT
	Version: v1.2.0
*/

let simpleSlider = (()=> {
	'use strict';

	// Defaults
	let defaults = {
		speed:				2000,						// transition duration in ms 	
		autoplay:			6000,						// delay between transitions in ms
		containerClass:		'simple-slider-container',	// container class
		wrapperClass:		'slider-wrapper',			// wrapper class
		slideClass:			'slider-element',			// slide class
		buttonsClass:		'slider-btn'				// buttons class
	};

	// Constans
	const container = document.querySelector(`.${defaults.containerClass}`),
		  wrapper = document.querySelector(`.${defaults.wrapperClass}`),
		  buttons = container.querySelectorAll(`.${defaults.buttonsClass}`),
		  slides = document.querySelectorAll(`.${defaults.slideClass}`);

	let autoplay, index = 1;

	/*
		Clone first and last slide
	*/
	function createClones() {
		let firstEl = wrapper.firstElementChild.cloneNode(true);
		let lastEl = wrapper.lastElementChild.cloneNode(true);
		wrapper.appendChild(firstEl);
		wrapper.insertBefore(lastEl, slides[0]);
	}

	createClones();

	/*
		Set elements width
	*/
	function setWidth() {
		const slides = document.querySelectorAll(`.${defaults.slideClass}`);

		// Wrapper 
		let wrapperWidth = 0;
		wrapperWidth = (container.offsetWidth + 1) * slides.length + 'px';
		wrapper.style.width = wrapperWidth;	

		// Slides
		for (let i = 0; i < slides.length; i++) {
			slides[i].style.width = container.offsetWidth + 'px';
		}
	}

	/* 
		Change wrapper position
		index = current slider index [number]
	*/	
	function changeWrapperPos(index) {
		if (typeof index === 'undefined') 
			index = 1;

		let pixels = index * container.offsetWidth;

		wrapper.style.WebkitTransform = `translate3d( -${pixels}px, 0, 0)`; 
		wrapper.style.transform = `translate3d( -${pixels}px, 0, 0)`; 
	}

	/*
		Set transition duration. When animation will end, transition is set to 0 
	*/	
	function setTransition() {
		wrapper.style.WebkitTransitionDuration = defaults.speed + 'ms'; 
		wrapper.style.transitionDuration = defaults.speed + 'ms';

		setTimeout(()=> {
			wrapper.style.WebkitTransitionDuration = 0 + 'ms'; 
			wrapper.style.transitionDuration = 0 + 'ms';
		}, defaults.speed);
	}

	/*
		Call functions again when window is resized
	*/	
	function resize() {
		window.addEventListener('resize', () => {
			clearTimeout(window.resizeTimer);
		    window.resizeTimer = setTimeout(() => {
		    	setWidth();
		    	changeWrapperPos(index);
		    }, 100);	
		});		
	}

	/*
		Move slider 
		direction = slide direction [left, right]
	*/	
	function moveSlider(direction = null) {

		if (buttons && buttons.length >= 2) {
			pointerEvents();
		}
		
		// If index is bigger than slides.length, set index to 0 without animation
		if (index > slides.length)	
			index = 0;
		else
			setTransition();

		let dr = (direction === 'left') ? index-- : index++;
		
		// Switch from last cloned to first slide
		if (index > slides.length) {	
			setTimeout(()=> {
				changeWrapperPos();
				index = 1;
			}, defaults.speed);
		}

		// Switch from first cloned to last slide
		if (index == 0) {	
			setTimeout(()=> {
				changeWrapperPos(slides.length);
				index = slides.length;
			}, defaults.speed);
		}

		changeWrapperPos(index);
	}

	/*
		Disable buttons during animation 
	*/	
	function pointerEvents() {
		buttons[0].style.pointerEvents = 'none';
		buttons[1].style.pointerEvents = 'none';	

		setTimeout(()=> {
			buttons[0].style.pointerEvents = 'auto';
			buttons[1].style.pointerEvents = 'auto';
		}, defaults.speed);		
	}

	/*
		Slider autoplay
	*/	
	function autoPlay() {
		autoplay = setInterval(moveSlider, (defaults.autoplay + defaults.speed));
	}

	/*
		Move slide to the right or to the left
		direction = slide direction [left, right]
	*/	
	function changeCurrSlide(direction) {
		clearInterval(autoplay);
		moveSlider(direction);

		setTimeout(()=> {
			autoPlay();
		}, defaults.speed);
	}

	/*
		Slider core
	*/	
	function sliderCore() {

		setWidth();
		changeWrapperPos();

		autoPlay();
		resize();

		// Buttons
		if (buttons && buttons.length >= 2) {

			buttons[0].addEventListener('click', function() {
				changeCurrSlide('left');
			});	

			buttons[1].addEventListener('click', function() {
				changeCurrSlide('right');
			});	
		}
	}

	/* 
		Extend defaults
		defaults = defaults options defined in script
		properties = new options
	*/
	function extendDefaults(defaults, properties) {
		for (let property in properties)
			defaults[property] = properties[property];
		
		return defaults;
	}

	/*
		Initialize the module
		properties = new options
	*/	
	function _init(properties) {
		extendDefaults(defaults, properties);
		sliderCore();
	}

	return {
		init: _init
	}

})();
