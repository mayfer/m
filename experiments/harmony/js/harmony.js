
Harmony = {
  
    get_overtones_of_chord: function(chord) {
        var overtones = [];
        for(var i=0; i<chord.length; i++) {
            var freq = Chords.halftone_to_freq(chord[i]);
            for(var j=1; j<=15; j++) {
                overtones.push(freq*j)
            }
        }
        return overtones;
    },

    find_harmony: function(chord) {
        var matches = [];
        var chord_overtones = Harmony.get_overtones_of_chord(chord);

        var all_notes = []; //normally would use var here
        n = 0;  //normally would use var here
        while(all_notes.push(n++)<87){}
        //console.log('notes', all_notes);
        var all_chords = Harmony.combine(all_notes, 3, 3);
        //console.log(all_chords.length, all_chords);

        for(var i=0; i < all_chords.length; i++) {
            var note_overtones = Harmony.get_overtones_of_chord(all_chords[i]);
            var scores = [];
            for(var x=0; x < chord_overtones.length; x++) {
                for(var y=0; y < note_overtones.length; y++) {
                    var x_freq = chord_overtones[x];
                    var y_freq = note_overtones[y];
                    var score = (1 - (Math.abs(x_freq - y_freq) / (x_freq + y_freq))) / ((x+y+2)/2);
                    scores.push(score);
                }
            }

            var score_sum = 0;
            for(var s = 0; s < scores.length; s++){
                score_sum += scores[i];
            }

            var score = score_sum/scores.length;
            var match_chord = [];
            for(var r=0; r<all_chords[i].length; r++) {
                match_chord[r] = Chords.halftone_to_note(all_chords[i]);
            }
            matches.push({
                'score': score,
                'match': match_chord,
            });
        }
        matches.sort(function(a, b){ return b.score - a.score; });
        return matches;
    },

    combine: function(a, min, max) {
        var fn = function(n, src, got, all) {
            if (n == 0) {
                if (got.length > 0) {
                    all[all.length] = got;
                }
                return;
            }
            for (var j = 0; j < src.length; j++) {
                fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
            }
            return;
        }
        var all = [];
        for (var i = min; i <= max; i++) {
            fn(i, a, [], all);
        }
        all.push(a);
        return all;
    },
}
