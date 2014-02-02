jQuery.sliceType
================

Draw and animate SVG characters (requires Raphael.js)

Usage
=====

HTML...

    <span class="slicetype" data-color="#4183C4">Slice Type</span>
    
jQuery...

    $('.slicetype').sliceType(options);

Font JSON...

    var MyFont = {
        "A": {
            paths: [
                {data: "some svg path data"},
                ...
            ],
            canvas: {
                width: ?,
                height: ?,
            }
        }
        ...
        "kerning": {
        	"A": {
        		"W": ?
        	}
        }
    };

Options
=======

### Typographic
* `font`: The font object to use.
* `size`: The default height (in pixels) to make all characters
* `spacing`: The base spacing (relative to original character size) between letters
* `kern`: A function that will process the orignal kerning data (good if you're ripping from a font)

### Animation
* `animate`: Wether or not toe animate the drawing of the letters
* `duration`: The total duration to animate each letter
* `lineDelay`: The amount of time to pause between drawing lines
* `letterDelay`: The amount of time to pause between drawing letters
* `wordDelay`: The amount of time to pause between drawing words

### Drawing Attributes
* `stroke`: The size of the line stroke
* `color`: The colour of the stroke (and dots if being used)
* `cap`: The line cap style
* `join`: The line join style
* `opacity`: The opacity of the lines
* `dash`: A dash style argument for the lines

### Extra Styling Options
* `partial`: The percentage of the lines in the character to draw (e.g. 0.5 for 50%)
* `dots`: Wether or not to draw dots at each path's starting point (undrawn paths as well)
* `dotSize`: The size of the dots to draw