// Built from Mohit Cheppudira's sine wave generator - http://0xfe.blogspot.com
// Modified by Murat Ayfer - http://muratayfer.com

soundWave = function(context, standing_waves) {
    this.x = 0;
    this.counter = 0;
    this.context = context;
    this.sampleRate = this.context.sampleRate;
    this.playing = false;

    this.standing_waves = standing_waves;

    this.node = context.createJavaScriptNode(1024, 0, 2);

    var that = this;
    this.node.onaudioprocess = function(e) { that.process(e) };
}

soundWave.prototype.process = function(e) {
    // Get a reference to the output buffer and fill it up.
    var channels = [ e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1) ];

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
            
            current_amplitude = wave.audio_amplitude * wave.envelope[index];
            y = current_amplitude * Math.sin(this.x * wave.freq);
            
            for(var k = 0; k < channels.length; k++) {
                channels[k][i] += y / this.standing_waves.length;
            }
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
