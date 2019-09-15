# SimpleSlider
Simple responsive slider created in pure javascript.
<br> Browsers support: All modern browsers, Internet Explorer 10+

## Version
1.9.0

## Installation

###### npm
Install the package & import files

```
npm install simpleslider-js
```

```javascript
import SimpleSlider from 'simpleslider-js';
import 'simpleslider-js/dist/simpleslider.min.css';
```

###### CDN
Include files using CDN.

```
https://unpkg.com/simpleslider-js@1.9.0/dist/simpleSlider.min.js
https://unpkg.com/simpleslider-js@1.9.0/dist/simpleSlider.min.css
```

###### Github
You can also download files from Github and attach them manually to your project. <br>
Note: On production use files (JS and CSS) only from **dist/** folder.

```html
<link rel="stylesheet" href="css/simpleSlider.min.css"> 
<script src="js/simpleSlider.min.js"></script>  
```
## Usage

###### Include files
See the section above.

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
  new SimpleSlider('.simple-slider-first');
</script>
```

## API

###### Example
new SimpleSlider(container, options)

* container - string (required), selector of slider container
* options - object (optional), slider options

You can initialize more than one slider per page.

```javascript
<script>
  // Default options
  new SimpleSlider('.simple-slider-first');  

  // User options
  new SimpleSlider('.simple-slider-second', {
    speed: 600,
    autoplay: false,
    class: {
      wrapper: 'slider-wrapper'
    },
    onChange: function(activeSlide) {
      console.log(activeSlide);
    }
  });

  // SlidesPerView example
  new SimpleSlider('.simple-slider-third', {
    slidesPerView: {
      768: 2, // 2 slides for viewport >= 768px
      1024: 3 // 3 slides for viewport >= 1024px
    }
  });
  
  // Access to other slider functions and properties
  var slider = new SimpleSlider('.simple-slider-third');
  console.log(slider);
</script>
```

###### Options

| Option  | Type | Default value | Description |
| ----- | ----- | ----- | ----- |
| speed | number | 600 | Transition duration in ms |
| delay | number | 5000 | Delay between transitions in ms (autoplay) |
| enableDrag | boolean | true | Enable drag option | 
| autoplay | boolean | false | Slider autoplay |
| slidesPerView | object | 1 | The number of slides to be shown [Read more below] |
| class:wrapper | string | 'slider-wrapper' | Wrapper class |
| class:slide | string | 'slider-slide' | Slide class |
| class:buttons | string | 'slider-btn' | Buttons class |
| class:pagination | string | 'slider-pagination' | Pagination class |
| class:paginationItem | string | 'pagination-bullet' | Pagination bullet class |
| onInit | function | - | Function called after slider initialization |
| onChange | function | - | Function called when the slide change start |

###### Other functions and properties
There are only a few useful options on the list. Run console.log (As in Example above) to see them all

| Option  | Type | Description |
| ----- | ----- | ----- |
| .attachEvents() | function | Attach all events |
| .detachEvents() | function | Detach all events |
| .nextBtn() | function | Move the slider to the right |
| .prevBtn() | function | Move the slider to the left |
| .changeSlide(direction: ['left', 'right']) | function | Move slider to the left / right |
| .index | string | Get slider index |
| .disableEvents | boolean | Disable/Enable slider navigation events |
| .options | object | All slider options |
| .wrapper | object | Slider wrapper |
| .container | object | Slider container |
| .slides | object | List of slides |
| .buttons | object | List of buttons |
| .paginationBullets | object | List of pagination bullets |


###### Comments

**slidesPerView** - Number of slides can't be bigger than the amount of slides in the slider.