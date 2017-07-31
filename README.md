# SimpleSlider
Simple responsive slider created in pure javascript. It's working, but slider need some changes.

## Version
v1.1.0 Beta

## Usage

###### Include files
```html
<link rel="stylesheet" href="css/simpleSlider.css"> 
<script src="js/simpleSlider.min.js"></script>  
```

###### Create HTML layout
```html
<div class="simple-slider-container">
	<div class="simple-s-wrapper">
		<!-- First slide -->
		<div class="simple-s-element" style="background-image: url('path/to/image.jpg')">
			<!-- Any HTML content -->
		</div>

		<!-- Second slide -->
		<div class="simple-s-element" style="background-image: url('path/to/image.jpg')">
			<!-- Any HTML content -->
		</div>

		<!-- Third slide -->
		<div class="simple-s-element" style="background-image: url('path/to/image.jpg')">
			<!-- Any HTML content -->
		</div>
	</div>

	<!-- Buttons (Not required) -->
	<div class="simple-s-btn simple-s-btn-prev"></div>
    <div class="simple-s-btn simple-s-btn-next"></div> 
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
    	speed: 2500,
    	containerClass: 'simple-slider-container'
    }); 
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| speed | number | 2000 | Transition duration in ms |
| autoplay | number | 6000 | Delay between transitions in ms |
| containerClass | string | 'simple-slider-container' | Container class |
| wrapperClass | string | 'simple-s-wrapper' | Wrapper class |
| slideClass | string | 'simple-s-element' | Slide class |
| buttonsClass | string | 'simple-s-btn' | Buttons class |
