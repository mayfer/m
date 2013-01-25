// Built from Mohit Cheppudira's sine wave generator - http://0xfe.blogspot.com
// Modified by Murat Ayfer - http://muratayfer.com

soundWave = function(context, standing_waves) {
    this.x = 0;
    this.counter = 0;
    this.context = context;
    this.sampleRate = this.context.sampleRate; // 44100 by default
    this.sampleRateMillisecond = this.sampleRate / 1000;
    this.playing = false;

    this.standing_waves = standing_waves;

    this.node = context.createJavaScriptNode(4096, 0, 2);

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

    var buffer_size = channels[0].length;
    var num_channels = channels.length;
    var num_standing_waves = this.standing_waves.length;

    var cumulative_amplitude = 0;

    for (var i = 0; i < buffer_size; i++) {
        cumulative_amplitude = 0;

        for (var j = 0; j < num_standing_waves; j++) {
            wave = this.standing_waves[j];

            var envelope_amplitude = wave.currentEnvelopeValue(this.counter / (this.sampleRateMillisecond * wave.duration), wave.volume_envelope);
            var current_freq = (wave.currentEnvelopeValue(this.counter / (this.sampleRateMillisecond * wave.duration), wave.freq_envelope) + 0.5) * wave.freq;
            
            // square env. amplitude to convert it to a logarithmic scale which better suits our perception
            current_amplitude = envelope_amplitude * envelope_amplitude;
            y = current_amplitude * Math.sin(this.x * current_freq + wave.phase);
            
            cumulative_amplitude += y / num_standing_waves;
        }
        for(var k = 0; k < num_channels; k++) {
            channels[k][i] = cumulative_amplitude;
        }

        this.counter += 1;
        this.x += Math.PI * 2 / this.sampleRate;
    }
    /*
    var jump_duration = 150;
    var i = 0;
    while(i < (buffer_size-jump_duration)) {
        var jump = channels[0][i+jump_duration] - channels[0][i];
        if(jump > 0.3) {
            console.log('Jumped at '+i+' out of '+buffer_size);
            for(var j = 0; j < jump_duration; j++) {
                for(var k = 0; k < num_channels; k++) {
                    channels[k][i+j] = channels[k][i] + (jump/jump_duration) * j;
                }
            }
            i += jump_duration;
        } else {
            i++;
        }
    }
    console.log('End of buffer at '+buffer_size);
    */
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
