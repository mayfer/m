
var X_INCREMENT = 10;
var DEFAULT_SPEED = 14;
var BASE_FREQ = 220;

var frames = 0;


function standingWave(context, index, num_waves, freq, amplitude, audio_amplitude, envelope, duration, phase) {
    var amplitude = amplitude;
    var step = 0.0;
    var standing = Math.PI / context.width; // resonant wavelength for canvases['waves'] width
    var freq = freq;
    var freq_diff = freq * standing / BASE_FREQ; // calculate relative wavelength
    var speed = DEFAULT_SPEED;
    var wave_height = (context.height / (num_waves+1));
    var current_amplitude = 0;
    var current_plot_coordinates = null;
    var position = index * wave_height;
    var phase = phase;
    var duration = duration;
    if(envelope === undefined) {
        envelope = [0.5];
    }

    this.freq = freq;
    this.audio_amplitude = audio_amplitude;
    this.position = position;
    this.duration = duration;
    this.envelope = envelope;
    this.phase = phase;
    
    this.jq_progress = null;
    var progress_canvas = null;
    var progress_context = null;

    this.setProgressElem = function(jq_elem) {
        this.jq_progress = jq_elem;
        progress_canvas = this.jq_progress.get(0);
        progress_context = progress_canvas.getContext("2d");
        progress_context.strokeStyle = '#a00';
    };
    this.changeSpeed = function(change) {
        if(change > 0) {
            speed *= 2;
        } else {
            speed /= 2;
        }
    };
    this.blurMode = function(){
        context.fillStyle = "rgba(0, 0, 0, 0)";
    };
    this.sin = function(x, rad_diff, amplitude) {
        return -amplitude * Math.sin(rad_diff * x);
    };
    this.getPlotCoordinates = function(time_diff) {
        step = speed * time_diff * (Math.PI/20) * freq_diff % Math.PI*2;
        var envelope_amplitude = this.getCurrentEnvelopeValue(time_diff / (this.duration));
        current_amplitude = Math.sin(step + phase) * amplitude * envelope_amplitude * 2;
        var x = 0, y = this.sin(x, freq_diff, current_amplitude);
        var points = [];
        while(x < context.width) {
            var from = {
                x: x,
                y: y,
            };
            x += X_INCREMENT;
            y = this.sin(x, freq_diff, current_amplitude);
            var to = {
                x: x,
                y: y,
            };
            points.push({from: from, to: to});
        }
        return points;
    };
    this.getCurrentEnvelopeValue = function(percent_progress) {
        var decimal_index = this.envelope.length * percent_progress;
        var index = Math.floor(decimal_index);
        if(true) { // this.envelope_options.repeat) {
            index = index % this.envelope.length;
            decimal_index = decimal_index % this.envelope.length;
        } else {
            index = Math.min(this.envelope.length-1, index);
            decimal_index = Math.min(this.envelope.length-1, decimal_index);
        }
        var value;
        
        // if possible, pick the envelope value from a linear interpolation between indeces.
        // this should prevent popping/crackling
        if(index < this.envelope.length-1) {
            value = this.envelope[index] + (decimal_index - index) * (this.envelope[index+1] - this.envelope[index]);
        } else if(index >= this.envelope.length-1) {
            value = this.envelope[this.envelope.length-1];
        } else {
            value = this.envelope[index];
        }
        return value;
    };
    this.draw = function(time_diff) {
        this.current_plot_coordinates = this.getPlotCoordinates(time_diff);
        context.beginPath();
        context.moveTo(0, position);
        for(var i = 1; i < this.current_plot_coordinates.length; i++) {
            coord = this.current_plot_coordinates[i];
            context.lineTo(coord.to.x, coord.to.y + position);
        }
        context.stroke();
    };
    this.markProgress = function(time_diff) {

        var percent_progress = (time_diff % this.duration) / this.duration;

        progress_context.clearRect(0, 0, progress_context.width, progress_context.height);
        progress_context.beginPath();
        progress_context.moveTo(percent_progress*progress_context.width, 0);
        progress_context.lineTo(percent_progress*progress_context.width, progress_context.height);
        progress_context.stroke();
    }

}
                    
function superposedWave(context, index, num_waves, standing_waves) {
    var wave_height = (context.height / (num_waves+1));
    var position = index * wave_height;
    var num_steps = Math.round(context.width / X_INCREMENT);
    var coords, current_coords;
    this.draw = function(time_diff) {
        context.fillRect(0, 0, context.width, context.height);
        context.beginPath();
        context.moveTo(0, position);
        for(var i = 0; i < num_steps; i++) {
            coords = {from: {x: 0, y: 0}, to: {x: 0, y: 0}};
            for(var j = 0; j < standing_waves.length; j++) {
                current_coords = standing_waves[j].getPlotCoordinates(time_diff);
                // x is same for all anyways
                coords.from.x = current_coords[i].from.x;
                coords.from.y += current_coords[i].from.y;
                coords.to.x = current_coords[i].to.x;
                coords.to.y += current_coords[i].to.y;
            }
            context.lineTo(coords.to.x, coords.to.y + position);
        }
        context.stroke();
    };
}

