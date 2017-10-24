# SimpleSlider
Simple responsive slider created in pure javascript.

## Version
v1.4.1

## Usage
On production use files (JS and CSS) only from **dist/** folder

## Install
```
npm install simpleslider-js
```

###### Include files
```html
<link rel="stylesheet" href="simpleSlider.min.css"> 
<script src="simpleSlider.min.js"></script>  
```

###### Create HTML layout
```html
<div class="simple-slider simple-slider-first">
	<div class="slider-wrapper">
		<!-- First slide -->
		<div class="slider-slide" style="background-image: url('path/to/image')">
			<!-- Any HTML content -->
		</div>

		<!-- Second slide -->
		<div class="slider-slide" style="background-image: url('path/to/image')">
			<!-- Any HTML content -->
		</div>

		<!-- Third slide -->
		<div class="slider-slide" style="background-image: url('path/to/image')">
			<!-- Any HTML content -->
		</div>
	</div>

	<!-- Buttons (Not required) -->
	<div class="slider-btn slider-btn-prev"></div>
    <div class="slider-btn slider-btn-next"></div> 
</div>
```

###### Initialize the module
```javascript
<script>
    var slider = new simpleSlider('.simple-slider-first');
</script>
```

## API

###### Example

new simpleSlider(container, options)

* container - string (required), selector of slider container
* options - object (optional), slider options

You can initialize more than one slider per page.

```javascript
<script>
	// Default options
	var slider = new simpleSlider('.simple-slider-first');	

	// User options
	var slider = new simpleSlider('.simple-slider-second', {
		speed: 2000, //default
		autoplay: true, //default
		classes: {
			wrapper: 'slider-wrapper' //default
		}
	});
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| speed | number | 2000 | Transition duration in ms |
| delay | number | 6000 | Delay between transitions in ms |
| autoplay | boolean | true | slider autoplay |
| classes: wrapper | string | 'slider-wrapper' | Wrapper class |
| classes: slide | string | 'slider-slide' | Slide class |
| classes: buttons | string | 'slider-btn' | Buttons class |
