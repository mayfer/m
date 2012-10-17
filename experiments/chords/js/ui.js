var sound;

!function($){
    var namespace = 'musicui'
      , settings = {
          id: 1
        }
      , notes = 'A B♭ B C C♯ D E♭ E F F♯ G A♭'.split(' ')
      , octavePicker
      , notePicker
      , chordPicker

    var getOctave = function() {
        return !octavePicker.empty() ? octavePicker.val() : ''
    }
    var getNote = function() {
        var note = notePicker.find('.note.active').text()
        return note
    }
    var getChordName = function() {
        var input = chordPicker.find('input[name=chords' + settings.id + ']:checked')
        return input.data('chord')
    }

    // Public methods
    var methods = {
        init: function(options) {
            $.extend(settings, options)

            octavePicker = this.find('.octave')
            notePicker = this.find('.notes')
            chordPicker = this.find('.chords')

            notePicker.addClass('btn-group')
                .attr('data-toggle', 'buttons-radio')

            $.each(notes, function(i, note) {
                $('<button>')
                    .addClass('note')
                    .addClass('btn')
                    .text(note)
                    .appendTo(notePicker)
                    .click(function(event) {
                        methods.getChordWithNote(note)
                    })
            })

            var inputId
              , container
            for (chord in Chords.CHORDS) {
                inputId = 'musicui' + settings.id + '_' + chord.replace(/\s/g, '_')
                container = $('<div>')
                $('<input>')
                    .attr('id', inputId)
                    .attr('name', 'chords' + settings.id)
                    .attr('type', 'radio')
                    .attr('data-chord', chord)
                    .appendTo(container)
                $('<label>')
                    .attr('for', inputId)
                    .text(chord)
                    .appendTo(container)
                container.appendTo(chordPicker)
            }

            octavePicker.click(methods.getChord)
            chordPicker.click(methods.getChord)
            $('.note:first-child').click();
            $('div:first-child > input[type=radio]').click();
            methods.getChord();

            $('#edit').click(function() {
                $('.edit-modal').show();
            })
            $('.edit .save').click(function() {
                var inst = $('select').val();
                sound.instruments[inst] = $('.edit textarea').val();
                sound.loadSound(sound.instruments[inst]);
                $('.edit-modal').hide();
            })
            return this
        }

      , destroy: function() {
        }

      , getChord: function(event) {
            methods.getChordWithNote(getNote())
        }
      , getChordWithNote: function(note) {
          var octave = getOctave()
            , chord = getChordName()
          if (!note || !chord) // octave is optional
              return
          var formattedNote = note[0] + octave + (note.substr(1) != '' ? '#' : '')

          $('.progressions').css({visibility: "inherit"});
          var html = "";
          var progressions = Chords.get_progressions(note, chord);
          var count = 0;
          for (var key in progressions) {
            count++;
            chord_names = [];
            for (var i=0;i<progressions[key].length;i++) {
                chord_names[i] = Chords.chord_to_name(progressions[key][i]);
            }
            html += "<div class='progression'><button class='btn' data-chords='"+JSON.stringify(progressions[key])+"'>Play</button><strong>" + key + "</strong><div class='chord-names'>"+chord_names.join(' - ')+"</div></div>";
          }
          if (count === 0) {
            html += "<div class='no-match'>No matching progressions found.</div>";
            html += "<div class='chord'><button class='btn' data-chords='"+JSON.stringify(Chords.get_chord(note, chord))+"'>Play</button><strong>" + chord + "</strong></div>";
          }
          $('.progressions').html(html);
          $('.progression button').click(function() {
            // console.log($(this).data('chords'));
            var progression = $(this).data('chords');
            sound.playChordProgression(progression);
          })
          $('.chord button').click(function() {
              // console.log($(this).data('chords'));
              var chord = $(this).data('chords');
              sound.playChord(chord);
          })
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



$(document).ready(function() {
    $('.picker')
        .musicui()
        .button()

    $('.frets').fretify();
    
    sound = new SoundGenerator();

    for(instrument in sound.instruments) {
        $('#instruments').append("<option>"+instrument+"</option>");
    }
    $('#instruments').change(function(){
        sound.loadSound(sound.instruments[$(this).val()]);
        $('.edit textarea').val(sound.instruments[$(this).val()]);
    });
    // sound.loadSound(sound.instruments['Piano']);
    $('.edit textarea').val(sound.instruments['Piano']);

    
})
