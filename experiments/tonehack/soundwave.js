/*
     Sine Wave Generator for Web Audio API.
     Currently works on Chrome.

     Mohit Cheppudira - http://0xfe.blogspot.com
*/

/* Create a generator for the given AudioContext. */
soundWave = function(context, standing_waves) {
    this.x = 0;
    this.context = context;
    this.sampleRate = this.context.sampleRate;
    this.frequency = 330;
    this.next_frequency = this.frequency;
    this.playing = false;
    this.nr = true; // noise reduction

    this.standing_waves = standing_waves;

    // Create an audio node for the tone generator
    this.node = context.createJavaScriptNode(1024, 0, 2);

    // Setup audio data callback for this node. The callback is called
    // when the node is connected and expects a buffer full of audio data
    // in return.
    var that = this;
    this.node.onaudioprocess = function(e) { that.process(e) };
}

soundWave.prototype.setAmplitude = function(amplitude) {
    this.amplitude = amplitude;
}

// Enable/Disable Noise Reduction
soundWave.prototype.setNR = function(nr) {
    this.nr = nr;
}

soundWave.prototype.setFrequency = function(freq) {
    this.next_frequency = freq;

    // Only change the frequency if not currently playing. This
    // is to minimize noise.
    if (!this.playing) this.frequency = freq;
}

soundWave.prototype.process = function(e) {
    // Get a reference to the output buffer and fill it up.
    var right = e.outputBuffer.getChannelData(0),
            left = e.outputBuffer.getChannelData(1);

    // We need to be careful about filling up the entire buffer and not
    // overflowing.
    var wave;
    var phase = 0;
    var step;
    var current_amplitude;
    var y;

    for (var i = 0; i < right.length; ++i) {
        right[i] = 0;
        left[i] = 0;
        for (var j = 0; j < this.standing_waves.length; j++) {
            wave = this.standing_waves[j];

            current_amplitude = wave.audio_amplitude;
            y = current_amplitude * Math.sin(this.x * wave.freq);
            right[i] += y;
            left[i] += y;


            /* // If the current point approximates 0, and the direction is positive,
            // switch frequencies.
            if (right[i] < 0.001 && right[i] > -0.001 && right[i] < next_data) {
                this.frequency = this.next_frequency;
                this.x = 0;
            }*/
        }
        this.x += Math.PI * 2 / this.sampleRate;
    }
}

soundWave.prototype.play = function() {
    // Plug the node into the output.
    this.node.connect(this.context.destination);
    this.playing = true;
}

soundWave.prototype.pause = function() {
    // Unplug the node.
    this.node.disconnect();
    this.playing = false;
}
