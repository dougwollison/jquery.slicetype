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
        'A': {
            paths: [
                {data: 'some svg path data'},
                ...
            ],
            canvas: {
                width: ?,
                height: ?,
            }
        }
        ...
    };

Options
=======

To be documented...
