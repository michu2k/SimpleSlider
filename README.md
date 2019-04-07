# SimpleSlider
Simple responsive slider created in pure javascript.

## Version
1.8.0

## Installation

###### npm
```
npm install simpleslider-js
```

###### CDN
```
https://unpkg.com/simpleslider-js@1.8.0/dist/simpleSlider.min.js
https://unpkg.com/simpleslider-js@1.8.0/dist/simpleSlider.min.css
```

###### Github
You can also download files from github.

## Usage
On production use files (JS and CSS) only from **dist/** folder

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

    <!--Pagination (Not required)-->
    <div class="slider-pagination"></div>

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
        speed: 1600, //default
        autoplay: false, //default
        class: {
            wrapper: 'slider-wrapper' //default
        }
    });
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| speed | number | 1600 | Transition duration in ms |
| delay | number | 6000 | Delay between transitions in ms (autoplay)|
| autoplay | boolean | false | slider autoplay |
| class:wrapper | string | 'slider-wrapper' | Wrapper class |
| class:slide | string | 'slider-slide' | Slide class |
| class:buttons | string | 'slider-btn' | Buttons class |
| class:pagination | string | 'slider-pagination' | Pagination class |
| class:paginationItem | string | 'pagination-bullet' | Pagination bullet class |