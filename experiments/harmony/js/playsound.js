var audiolet = new Audiolet();

var Sound = {
    play_freq: function(freq) {
        var sine = new Sine(audiolet, freq);
        sine.connect(audiolet.output);
    },
}
