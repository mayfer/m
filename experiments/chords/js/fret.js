
Guitar = {
    STRINGS: [ 
        { 'note': 'E4', 'label': 'e', },
        { 'note': 'B4', 'label': 'B', },
        { 'note': 'G3', 'label': 'G', },
        { 'note': 'D3', 'label': 'D', },
        { 'note': 'A3', 'label': 'A', },
        { 'note': 'E2', 'label': 'E', },
    ],
    FRET_MARKS: [ 3, 5, 7, 9, 12, 15 ],
}


!function($){
    var namespace = 'fretify',
        settings = {},
        NUM_FRETS = 16;
    
    var toggleString = function(event) {
        var string = $('.string.'+$(this).data('string'));
        console.log(string)
        if( $(this).prop('checked') ) {
            string.css('opacity', '1');
        } else {
            string.css('opacity', '0');
        }
    }

    var drawFrets = function(element) {
        box = element;
        box.html('');

        fret_lengths = [];
        length = box.innerWidth();

        var strings = $('<div>')
            .addClass('strings')
            .width(box.innerWidth())
            .appendTo($('.frets'));

        // place the guitar strings. and make them togglable.
        for(var i=0; i<Guitar.STRINGS.length; i++) {
            
            var stringLabel = $('<div>')
                .addClass('string-label')
                .append(
                    $('<div>')
                        .addClass('string-name')
                        .html(Guitar.STRINGS[i].label)
                )
                .append(
                    $("<input type='checkbox' />")
                        .addClass('string-toggle')
                        .data('string', Guitar.STRINGS[i].note)
                        .prop('checked', true)
                        .on('change.'+namespace, toggleString)
                );
                
            $('<div>')
                .addClass('string')
                .addClass(Guitar.STRINGS[i].note)
                .after(stringLabel)
                .appendTo(strings);
        }

        // draw each fret left to right (low to high)
        for(var i = 0; i < NUM_FRETS; i++) {
            fret_length = length / 17.817;
            fret_lengths.push(fret_length);

            var fret = $('<div>')
                .addClass('fret')
                .css({
                    width: (fret_length-1)+'px',
                })
                .data('fret-num', i+1);

            // inside each fret, place invisible sections that mark the clickable areas on the strings
            for(var j = 0; j < Guitar.STRINGS.length; j++) {
                var fret_num = j;
                var open_string_note = Guitar.STRINGS[j].note
                var open_string_halftone = Chords.note_to_halftone(open_string_note)
                var string_slice = $('<div>')
                    .addClass('string-slice')
                    .data('string', open_string_note)
                    .data('note', Chords.halftone_to_note(open_string_halftone + fret_num))
                    .on('click.'+namespace, markStringFret)
                    .appendTo(fret);
            }

            // mark the appropriate frets with litte diamonds
            if(Guitar.FRET_MARKS.indexOf(i+1) != -1) {
                fret.addClass('marked');
            }

            // the metal bar
            var divider = $('<div>')
                .addClass('fret-divider');
                
            fret.appendTo(box);
            divider.appendTo(box);
            
            length -= fret_length;
        }

        // re-adjust the fret widths to fill the container area fully
        var total = 0;
        for(var i=0; i<fret_lengths.length; i++) {
            total += fret_lengths[i];
        }
        var grow_frets_by = box.innerWidth() / total;
        box.find('.fret').each(function() {
            $(this).width( $(this).width()*grow_frets_by );
        });
        
    }
    var markStringFret = function(event) {
        var $this = $(this);
        if($this.hasClass('active')) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    }
    
        
    var methods = {
        init: function(options) {
            $.extend(settings, options);
            return this.each(function() {
                drawFrets($(this));
            });
        },
        halftone_to_element: function(halftone) {
            var note = Chords.halftone_to_note(halftone);
            return $('div.string-slice:data("note='+note+'")')
        }
    }
    
    // General set up
    
    $.fn[namespace] = function(method) {
        // Call method
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments)
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.' + namespace)
        }
    }
}(window.jQuery);
