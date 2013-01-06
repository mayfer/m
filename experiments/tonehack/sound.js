// Built from Mohit Cheppudira's sine wave generator - http://0xfe.blogspot.com
// Modified by Murat Ayfer - http://muratayfer.com

soundWave = function(context, standing_waves) {
    this.x = 0;
    this.counter = 0;
    this.context = context;
    this.sampleRate = this.context.sampleRate;
    this.frequency = 330;
    this.next_frequency = this.frequency;
    this.playing = false;
    this.nr = true; // noise reduction

    this.standing_waves = standing_waves;

    this.node = context.createJavaScriptNode(1024, 0, 2);

    var that = this;
    this.node.onaudioprocess = function(e) { that.process(e) };
}

soundWave.prototype.process = function(e) {
    // Get a reference to the output buffer and fill it up.
    var channels = [ e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1) ];

    // We need to be careful about filling up the entire buffer and not
    // overflowing.
    var wave;
    var phase = 0;
    var step;
    var current_amplitude;
    var y;

    for (var i = 0; i < channels[0].length; i++) {
        for(var k = 0; k < channels.length; k++) {
            channels[k][i] = 0;
        }
        for (var j = 0; j < this.standing_waves.length; j++) {
            wave = this.standing_waves[j];

            var sample_length = 1 / this.sampleRate;
            var amp_point_length = (wave.duration / 100) / wave.envelope.length;
            var index;
            if(true) { //wave.envelope_options.repeat) {
                index = Math.floor((this.counter/this.sampleRate) * (amp_point_length / sample_length)) % wave.envelope.length;
            } else {
                index = Math.min(wave.envelope.length-1, Math.floor((this.counter/this.sampleRate) * (amp_point_length / sample_length)));
            }
            // current_amplitude = wave.envelope[index];
            // if(this.counter < (10/this.sampleRate)) console.log(j, sample_length, amp_point_length, index,current_amplitude);
            
            current_amplitude = wave.audio_amplitude * wave.envelope[index];
            y = current_amplitude * Math.sin(this.x * wave.freq);
            
            for(var k = 0; k < channels.length; k++) {
                channels[k][i] += y / this.standing_waves.length;
            }

            // If the current point approximates 0, and the direction is positive,
            // switch frequencies.
            /*if (channels[0][i] < 0.001 && channels[0][i] > -0.001 && channels[0][i] < next_data) {
                this.frequency = this.next_frequency;
                this.x = 0;
            }*/
        }
        this.counter += 1;
        this.x += Math.PI * 2 / this.sampleRate;
    }
}

soundWave.prototype.play = function() {
    this.node.connect(this.context.destination);
    this.playing = true;
}

soundWave.prototype.pause = function() {
    this.node.disconnect();
    this.playing = false;
    this.counter = 0;
}
