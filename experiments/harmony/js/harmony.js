
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

        for(var i=0; i < 88; i++) {
            var note_overtones = Harmony.get_overtones_of_chord([i]);
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
            matches.push({
                'score': score,
                'match': Chords.halftone_to_note(i),
            });
        }
        matches.sort(function(a, b){ return b.score - a.score; });
        return matches;
    },
}
