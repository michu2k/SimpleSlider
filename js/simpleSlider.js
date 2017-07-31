/*
	Simple responsive slider created in pure javascript.
	Author: Michał Strumpf
	License: MIT
	Version: v1.0.0 Beta
*/

let simpleSlider = (()=> {
	'use strict';

	// Defaults
	let defaults = {
		speed: 				2000, 						// transition duration in ms 	
		autoplay: 			6000, 						// delay between transitions in ms
		containerClass: 	'simple-slider-container',	// container class
		wrapperClass: 		'simple-s-wrapper',			// wrapper class
		slideClass: 		'simple-s-element', 		// slide class
		buttonsClass: 		'simple-s-btn'				// buttons class
	};

	// Constans
	const container = document.querySelector(`.${defaults.containerClass}`),
		  wrapper = document.querySelector(`.${defaults.wrapperClass}`),
		  buttons = container.querySelectorAll(`.${defaults.buttonsClass}`);

	let index = 1,
		slides = document.querySelectorAll(`.${defaults.slideClass}`),
		auto;

	// Clone first and last slide
	function createClones() {
		let firstEl = wrapper.firstElementChild.cloneNode(true);
		let lastEl = wrapper.lastElementChild.cloneNode(true);
		wrapper.appendChild(firstEl);
		wrapper.insertBefore(lastEl, slides[0]);
	}

	// Set wrapper width
	function setWrapper() {
		let wrapperWidth = 0;
		wrapperWidth = (window.innerWidth + 1) * (slides.length + 2) + 'px';
		wrapper.style.width = wrapperWidth;	
	}

	// Change wrapper position
	function changeWrapperPos(index) {
		if (typeof index === 'undefined') 
			index = 1;

		let transform = index * window.innerWidth;

		wrapper.style.WebkitTransform = `translate3d( -${transform}px, 0, 0)`; 
		wrapper.style.transform = `translate3d( -${transform}px, 0, 0)`; 
	}

	// Set transition duration
	function setTransition() {
		wrapper.style.WebkitTransitionDuration = defaults.speed + 'ms'; 
		wrapper.style.transitionDuration = defaults.speed + 'ms';

		setTimeout(()=> {
			wrapper.style.WebkitTransitionDuration = 0 + 'ms'; 
			wrapper.style.transitionDuration = 0 + 'ms';
		}, defaults.speed);
	}

	// Call functions again when window is resized
	function resize() {
		window.addEventListener('resize', () => {
			clearTimeout(window.resizeTimer);
		    window.resizeTimer = setTimeout(() => {
		    	setWrapper();
		    	changeWrapperPos(index);
		    }, 200);	
		});		
	}

	// Move slider 
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

	// Disable buttons during animation 
	function pointerEvents() {
		buttons[0].style.pointerEvents = 'none';
		buttons[1].style.pointerEvents = 'none';	

		setTimeout(()=> {
			buttons[0].style.pointerEvents = 'auto';
			buttons[1].style.pointerEvents = 'auto';
		}, defaults.speed);		
	}

	// Slider autoplay
	function autoPlay() {
		auto = setInterval(moveSlider, (defaults.autoplay + defaults.speed));
	}

	// Move slide to the right or to the left
	function changeCurrSlide(direction) {
		clearInterval(auto);
		moveSlider(direction);

		setTimeout(()=> {
			autoPlay();
		}, defaults.speed);
	}

	// Slider core
	function sliderCore() {

		createClones();
		setWrapper();	
		changeWrapperPos();

		autoPlay();
		resize();

		if (buttons && buttons.length >= 2) {
			// Buttons
			buttons[0].addEventListener('click', function() {
				changeCurrSlide('left');
			});	

			buttons[1].addEventListener('click', function() {
				changeCurrSlide('right');
			});	
		}
	}

	// Extend defaults
	function extendDefaults(defaults, properties) {
		for (let property in properties)
			defaults[property] = properties[property];
		
		return defaults;
	}

	// Initiate module
	function _init(properties) {
		extendDefaults(defaults, properties);
		sliderCore();
	}

	return {
		init: _init
	}

})();
