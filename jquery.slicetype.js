/**
 * jQuery.sliceType
 * Draw and animate SVG characters (requires Raphael.js)
 */
(function($){
	/**
	 * Utility for quickly setting up a new div
	 */
	var div = function(){
		return $(document.createElement('div'));
	};

	/**
	 * HTML Code Escape Utility.
	 */
	var escapeHTML = function(text){
		return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&quot;')
		.replace(/'/g, '&#039;');
	};

	/**
	 * HTML Code Unescape Utility.
	 */
	var unescapeHTML = function(text){
		return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039/g, '\'');
	};

	/**
	 * Shuffling utility.
	 */
	var shuffle = function(array){
	    var counter = array.length, temp, index;

	    // While there are elements in the array
	    while(counter > 0){
	        // Pick a random index
	        index = Math.floor(Math.random() * counter);

	        // Decrease counter by 1
	        counter--;

	        // And swap the last element with it
	        temp = array[counter];
	        array[counter] = array[index];
	        array[index] = temp;
	    }

	    return array;
	};

	/**
	 * Animate the drawing of the path.
	 *
	 * @see http://stackoverflow.com/questions/13070959/#answer-13074816
	 *
	 * @param Raphael  canvas   The raphael canvas for the path.
	 * @param string   pathstr  The path data string.
	 * @param object   attr     The attributes to update the path with.
	 * @param function callback The callback to make when animation is complete.
	 */
	var drawPath = function( canvas, pathstr, duration, attr, callback ){
		var guide_path = canvas.path( pathstr ).attr( { stroke: "none", fill: "none" } );
		var path = canvas.path( guide_path.getSubpath( 0, 1 ) ).attr( attr );
		var total_length = guide_path.getTotalLength( guide_path );
		var last_point = guide_path.getPointAtLength( 0 );
		var start_time = new Date().getTime();
		var interval_length = 50;
		var result = path;

		var interval_id = setInterval(function(){
			var elapsed_time = new Date().getTime() - start_time;
			var this_length = elapsed_time / duration * total_length;
			var subpathstr = guide_path.getSubpath( 0, this_length );
			attr.path = subpathstr;

			path.animate( attr, interval_length, Raphael.easing_formulas.linear );
			if ( elapsed_time >= duration )
			{
				clearInterval( interval_id );
				if(callback != undefined){
					callback();
				}
				guide_path.remove();
			}
		}, interval_length);
		return result;
	};

	$.fn.sliceType = function(options){
		var defaults = {
			// Typographic options
			font: {}, // The JSON font object
			size: 100, // The capital X-height for the text
			spacing: 0, // The base spacing (relative to original character size) between letters
			kern: null, // A function to modify the spacing for a character
			
			// Timing options
			animate: true, // Wether or not to animate the drawing of the letters
			duration: 1000, // The total duration of the animation per letter
			lineDelay: 0, // How much time between drawing lines
			letterDelay: 0, // How much time between drawing letters
			wordDelay: 0, // How much time between drawing words
			
			// Line attributes
			stroke: 1,
			color: '#000', // also applies to dots
			cap: 'round',
			join: 'round',
			opacity: 1,
			dash: null,
			
			// Extra styling options
			partial: 1, // 0-1 percentage of lines to actually draw
			dots: false, // Wether or not to add dots to the path connections
			dotSize: 1
		};

		options = $.extend({}, defaults, options);

		// Drawing delay counter
		var delay = 0;

		var drawChar = function(chr, chrs, i, o){
			var $character = div().addClass('slicetype-character');

			// Make sure the character exists in the font
			if(o.font[chr]){
				// Copy out the settings for the character
				var svg = $.extend({}, o.font[chr]);

				// Get the width/height of the character's canvas
				var width = svg.canvas.width;
				var height = svg.canvas.height;

				// Calculate and store the ratio
				$character.data('ratio', width / height);

				// Create the Raphael canvas
				var lines = new Raphael($character[0], width, height);
				
				// Overwrite the viewBox attribute of the canvas element so it works properly
				lines.canvas.setAttribute('viewBox', [0, 0, width, height].join(' '));

				var totalDuration = o.duration;

				// Character perimiter counter
				var perimiter = 0;

				// Build the list of paths to actually draw based on "partial" option
				var keepPaths = shuffle(svg.paths).slice(0, Math.ceil(svg.paths.length * o.partial));

				// Loop through each path to setup
				$.each(svg.paths, function(i, path){
					// Mark the path as skipped if not in the keep paths list
					path.skip = $.inArray(path, keepPaths) === -1;

					// Fetch the path data and length
					var p = lines.path(path.data);
					var length = p.getTotalLength();

					// Increase the perimeter
					perimiter += length;

					// Store the length and path object
					path.length = length;
					path.obj = p;

					// Set the stroke to none by default
					p.attr('stroke', 'none');
				});

				// Loop through each path to draw
				$.each(svg.paths, function(i, path){
					// Draw a dot at the beginning of this path if "dots" option is true
					if(o.dots === true){
						// Extract the first point in the path
						var c = path.data.match(/M([-\d\.]+),([-\d\.]+)/);

						// Draw the dot at said point
						var d = lines.circle(c[1], c[2], o.dotSize);

						// Set the fill colour
						d.attr({
							stroke: 'none',
							fill: o.color
						});
					}

					// We needed all paths for the dots,
					// we'll now skip any that aren't keepers
					if(path.skip) return;

					// Animate if desired
					if(o.animate){
						var duration;

						// Duration should be proportional to what fraction
						// the path is of the whole perimiter
						duration = totalDuration * path.length / perimiter;
						duration = Math.round(duration);
						
						// Draw the path
						setTimeout(function(){
							drawPath( lines, path.data, duration, {
								'stroke': o.color,
								'stroke-opacity': o.opacity,
								'stroke-linecap': o.cap,
								'stroke-linejoin': o.join
							});
						}, delay);

						// Increment by the line delay
						delay += o.lineDelay;
					}else{
						// Just draw the line as normal
						path.obj.attr({
							'stroke': o.color,
							'stroke-opacity': o.opacity,
							'stroke-linecap': o.cap,
							'stroke-linejoin': o.join
						});
					}
				});

				// Get the default spacing
				var spacing = o.spacing;

				// If this isn't the last character...
				// and there's kerning data for this character...
				if(i+1 < chrs.length && o.font.kerning && o.font.kerning[chr]){
					// Get the kerning data for this character
					var kern = o.font.kerning[chr];
					
					// Get the current
					var next = chrs[i+1];

					// If there's kerning data for this character...
					if(kern[next]){
						// Get the kerning pair value
						kerning = kern[next];
					
						// If a kern processor is availabe, use it
						if(o.kern){
							kerning = o.kern(kerning, o, chr);
						}
					
						// Add the kerning value
						spacing += kerning;
					}
				}

				// Store the kern spacing in the element
				$character.data('kern', spacing);
			}

			return $character;
		};

		$(this).each(function(){
			var $this = $(this);
			
			// Process the text; unescaping, trimming, stripping tabs/breaks, and swapping <br>s for line breaks
			var text = unescapeHTML($this.html()).trim().replace(/[\t\n\r]/g,'').replace(/<br\s?\/?>/g, '\n').toUpperCase();
			
			// Split into the separate words
			var words = text.split(/(\s)/);

			// Overwrite the settings with any data-attributes on the element
			var o = $.extend({}, options, $(this).data());

			// Clear the container
			var $block = $this.empty();

			// Loop through each word
			$.each(words, function(i, word){
				if(word == ' '){ // Add a plain space character
					$block.append(document.createTextNode(' '));
				}else if(word == '\n'){
					// Swap back the line breaks with <br>s
					$block.append('<br/>');
				}else if(word != ''){
					// Build the word wrapper element
					var $word = div().addClass('slicetype-word');

					// Split into the separate characters
					var characters = word.split('');

					// Loop through each character
					$.each(characters, function(i, chr){
						// Append the result of drawChar
						$word.append(drawChar(chr, characters, i, o));
						
						// Increment by the letter delay
						delay += o.letterDelay;
					});

					// Append the resulting word to the wrapper block
					$block.append($word);
					
					// Increment by the word delay
					delay += o.wordDelay;
				}
			});

			// Responsive setup
			$(window).resize(function(){
				var width = $(this).width();

				// Get the default size for the type
				var size = o.size;
				
				// Get the first highest resize point and update size
				for(var i in o.resize){
					if(width > i) size = o.resize[i];
				}

				// Adjust the fallback font size to reflect via the adjust option
				$this.css('font-size', size * o.adjust);

				// Run through each character element
				$('.slicetype-character').each(function(){
					var $char = $(this);

					// Get the ratio and kerning data
					var ratio = $char.data('ratio');
					var kern = $char.data('kern');

					// Update the width, height and margin
					$char.css({
						width: ratio * size,
						height: size,
						marginRight: size * kern
					});
				});
			}).resize();
		});

		return $(this);
	};
})(jQuery);
