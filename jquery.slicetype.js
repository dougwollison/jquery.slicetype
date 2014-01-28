/**
 * jQuery.sliceType
 * Draw and animate SVG characters (requires Raphael.js)
 */
(function($){
	var div = function(){
		return $(document.createElement('div'));
	};

	var escapeHTML = function(text){
		return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&quot;')
		.replace(/'/g, '&#039;');
	};

	var unescapeHTML = function(text){
		return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039/g, '\'');
	};

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
			scale: 1,
			dots: false,
			dotSize: 1,
			duration: 1000,
			lineDelay: 0,
			letterDelay: 0,
			wordDelay: 0,
			capHeight: 100,
			spacing: 0,
			stroke: 1,
			color: '#000',
			cap: 'round',
			join: 'round',
			opacity: 1,
			dash: null,
			partial: 1,
			font: {},
			kern: null
		};

		options = $.extend({}, defaults, options);

		var delay = 0;

		var drawChar = function(chr, chrs, i, o){
			var $character = div().addClass('slicetype-character');

			if(o.font[chr]){
				var svg = $.extend({}, o.font[chr]);

				var width = svg.canvas.width;
				var height = svg.canvas.height;

				$character.data('ratio', width / height);

				var lines = new Raphael($character[0], width, height);
				lines.canvas.setAttribute('viewBox', [0, 0, width, height].join(' '));

				var totalDuration = o.duration;

				var perimiter = 0;

				var keepPaths = shuffle(svg.paths).slice(0, Math.ceil(svg.paths.length * o.partial));

				$.each(svg.paths, function(i, path){
					path.skip = $.inArray(path, keepPaths) === -1;

					var p = lines.path(path.data);
					var length = p.getTotalLength();

					perimiter += length;

					path.length = length;
					path.obj = p;

					p.attr('stroke', 'none');
				});

				$.each(svg.paths, function(i, path){
					if(o.dots === true){
						var c = path.data.match(/M([-\d\.]+),([-\d\.]+)/);

						var d = lines.circle(c[1], c[2], o.dotSize);

						d.attr({
							stroke: 'none',
							fill: o.color
						});
					}

					if(path.skip) return;

					if(o.animate){
						var duration;

						duration = totalDuration * path.length / perimiter;

						duration = Math.round(duration);

						/*path.obj.attr({
							'stroke': 'none',
							'stroke-width': o.stroke,
							'fill-opacity': 0
						});*/

						setTimeout(function(){
							drawPath( lines, path.data, duration, {
								'stroke': o.color,
								'stroke-opacity': o.opacity,
								'stroke-linecap': o.cap,
								'stroke-linejoin': o.join
							});
						}, delay);

						delay += o.lineDelay;
					}else{
						path.obj.attr({
							'stroke': o.color,
							'stroke-opacity': o.opacity,
							'stroke-linecap': o.cap,
							'stroke-linejoin': o.join
						});
					}
				});

				var spacing = o.spacing;

				if(o.kern && i+1 < chrs.length && o.font.kerning && o.font.kerning[chr]){
					var kern = o.font.kerning[chr];
					var next = chrs[i+1];

					if(kern[next]){
						spacing += o.kern(kern[next], o, chr);
					}
				}

				$character.data('kern', spacing);
			}

			return $character;
		};

		$(this).each(function(){
			var $this = $(this);
			var text = unescapeHTML($this.html()).trim().replace(/\t/g,'').replace(/<br\s?\/?>/g, '\n').toUpperCase();
			var words = text.split(/(\s)/);

			var o = $.extend({}, options, $(this).data());

			var $block = $this.empty();

			$.each(words, function(i, word){
				if(word == ' '){
					$block.append(document.createTextNode(' '));
				}else if(word == '\n'){
					$block.append('<br/>');
				}else if(word != ''){
					var $word = div().addClass('slicetype-word');

					var characters = word.split('');

					$.each(characters, function(i, chr){
						$word.append(drawChar(chr, characters, i, o));
						delay += o.letterDelay;
					});

					$block.append($word);
					delay += o.wordDelay;
				}
			});

			$(window).resize(function(){
				var width = $(this).width();

				var size = o.size;
				for(var i in o.resize){
					if(width > i) size = o.resize[i];
				}

				$this.css('font-size', size * o.adjust);

				$('.slicetype-character').each(function(){
					var $char = $(this);

					var ratio = $char.data('ratio');
					var kern = $char.data('kern');

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
