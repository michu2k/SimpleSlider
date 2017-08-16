# SimpleSlider
Simple responsive slider created in pure javascript.

## Version
v1.2.0

## Usage

###### Include files
```html
<link rel="stylesheet" href="css/simpleSlider.css"> 
<script src="js/simpleSlider.min.js"></script>  
```

###### Create HTML layout
```html
<div class="simple-slider-container">
	<div class="slider-wrapper">
		<!-- First slide -->
		<div class="slider-element" style="background-image: url('path/to/image.jpg')">
			<!-- Any HTML content -->
		</div>

		<!-- Second slide -->
		<div class="slider-element" style="background-image: url('path/to/image.jpg')">
			<!-- Any HTML content -->
		</div>

		<!-- Third slide -->
		<div class="slider-element" style="background-image: url('path/to/image.jpg')">
			<!-- Any HTML content -->
		</div>
	</div>

	<!-- Buttons (Not required) -->
	<div class="slider-btn slider-btn-prev"></div>
    <div class="slider-btn slider-btn-next"></div> 
</div>
```

###### Initialize the module
```
<script>
    simpleSlider.init(); 
</script>
```

## API

###### Example

```
<script>
    simpleSlider.init({
    	speed: 2000,	//default			
    	containerClass: 'simple-slider-container'	//default
    }); 
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| speed | number | 2000 | Transition duration in ms |
| autoplay | number | 6000 | Delay between transitions in ms |
| containerClass | string | 'simple-slider-container' | Container class |
| wrapperClass | string | 'slider-wrapper' | Wrapper class |
| slideClass | string | 'slider-element' | Slide class |
| buttonsClass | string | 'slider-btn' | Buttons class |
