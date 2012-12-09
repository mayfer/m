
var X_INCREMENT = 10;
var DEFAULT_SPEED = 7;
var BASE_FREQ = 440;

var frames = 0;


function standingWave(context, index, num_waves, freq, amplitude, audio_amplitude) {
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
    var phase = 0;

    this.freq = freq;
    this.audio_amplitude = audio_amplitude;
    this.position = position;
    
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
        current_amplitude = Math.sin(step + phase) * amplitude;
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


function waveCanvas(jq_elem, freqs) {
    var jq_elem = jq_elem;
    var overtones = [];
    var superposed = [];
    var start_time = new Date().getTime();
    var time_diff = 0;
    var pause_time_diff = 0;
    var state = 'stopped';
    var contexts = {};
    var anim_frame;
    var waves = [];

    var soundwave;

    this.init = function() {
        var parent = $('<div class="parent-canvas">');
        $(jq_elem).append(parent);

        var waves_jq = $('<canvas class="waves">');
        $(parent).append(waves_jq);
        var adsr_jq = $('<canvas class="adsr">');
        $(parent).append(adsr_jq);
        
        var canvases = {};
        canvases['waves'] = waves_jq.get(0);
        canvases['adsr'] = adsr_jq.get(0);

        canvases['waves'].height = waves_jq.innerHeight();
        canvases['waves'].width = waves_jq.innerWidth();
        waves_jq.attr('height', canvases['waves'].height);
        waves_jq.attr('width', canvases['waves'].width);

        canvases['adsr'].height = adsr_jq.innerHeight();
        canvases['adsr'].width = adsr_jq.innerWidth();
        adsr_jq.attr('height', canvases['adsr'].height);
        adsr_jq.attr('width', canvases['adsr'].width);

        contexts['waves'] = canvases['waves'].getContext("2d");
        contexts['adsr'] = canvases['adsr'].getContext("2d");
        
        contexts['waves'].translate(0.5, 0.5); // antialias lines
        // just to be able to access directly from context object
        contexts['waves'].width = canvases['waves'].width;
        contexts['waves'].height = canvases['waves'].height;
        contexts['adsr'].width = canvases['adsr'].width;
        contexts['adsr'].height = canvases['adsr'].height;
        this.makeControls();
                    
        this.drawWaveMode();
                
        num_overtones = Object.keys(freqs).length;

        overtones = [];
        var index = 1;
        $.each(freqs, function(frequency, amplitude_ratio) {
            var amplitude = ((contexts['waves'].height / num_overtones) / 3) * amplitude_ratio;
            var audio_amplitude = 1 * amplitude_ratio;
            overtones.push(new standingWave(contexts['waves'], index, num_overtones, frequency, amplitude, audio_amplitude));
            index++;
        });
        superposed = [new superposedWave(contexts['waves'], 1, 1, overtones)];
        waves = overtones;

        this.drawFrame();
        soundwave = new soundWave(new webkitAudioContext(), overtones);
        this.makeADSR();
        return this;
    };

    this.setWaves = function(input_waves) {
        waves = input_waves;
    };

    this.drawWaveMode = function() {
        context = contexts['waves'];
        context.fillStyle = "rgba(255,255,255, 0.3)";
        context.lineWidth = 2;
        context.strokeStyle = "#000";
    };

    this.drawFrame = function() {
        context = contexts['waves'];
        context.fillRect(0, 0, context.width, context.height    );
        for(i = 0; i < waves.length; i++) {
            waves[i].draw(time_diff);
        }
        time_diff = new Date().getTime() - start_time;
    }

    this.animLoop = function() {
        if(state == 'running') {
            anim_frame = requestAnimFrame(this.animLoop.bind(this));
            this.drawFrame();
        }
        frames++;
    }

    this.start = function() {
        if(state != 'running') {
            if(state == 'stopped') {
                start_time = new Date().getTime();
            } else if(state == 'paused') {
                start_time = new Date().getTime() - pause_time_diff;
            }
            state = 'running';
            this.animLoop();
        }
        soundwave.play();
    };

    this.pause = function() {
        state = 'paused';
        pause_time_diff = new Date().getTime() - start_time;
        soundwave.pause();
    };

    this.stop = function() {
        state = 'stopped';
        cancelAnimFrame(anim_frame);
        this.reset()
        soundwave.pause();
    };

    this.restart = function() {
        // graceful
        start_time = new Date().getTime();
    }

    this.clear = function() {
        context = contexts['waves'];
        context.fillStyle = "rgba(255,255,255, 1)";
        context.fillRect(0, 0, context.width, context.height);
        this.drawWaveMode();
    }

    this.reset = function() {
        this.clear();
        time_diff = 0;
        this.drawFrame();
    };

    this.makeADSR = function() {
        var context = contexts['adsr'];
        var box_height = context.height / (waves.length + 1) - 5;
        var box_width = 100;
        context.fillStyle = "rgba(200, 200, 200, 1)";
        context.fillRect(0, 0, context.width, context.height);
        context.fillStyle = "rgba(255, 255, 255, 1)";
        for(var i = 0; i < waves.length; i++) {
            context.fillRect(20, waves[i].position - (box_height/2), box_width, box_height);
            console.log(waves[i], waves[i].position);
        }
    }

    this.makeControls = function(){
        var parent = this;
        var controls = $('<div>').addClass('controls');
        $.each([
            $('<a>').addClass('start icon-play'),
            $('<a>').addClass('stop icon-stop'),
            $('<a>').addClass('faster').html('faster'),
            $('<a>').addClass('slower').html('slower'),
            $('<a>').addClass('superpose tab').html('resulting vibration'),
            $('<a>').addClass('split tab selected').html('breakdown of overtones'),
        ], function() {
            $(this).attr('href', '#');
            $(this).appendTo(controls);
        });
        controls.prependTo(jq_elem);

        controls.on('click', '.start, .pause, .stop', function(e){
            e.preventDefault();
            if($(this).hasClass('start')) {
                parent.start();
                $(this).removeClass('start icon-play')
                    .addClass('pause icon-pause');
            } else if($(this).hasClass('pause')) {
                parent.pause();
                $(this).removeClass('pause icon-pause')
                    .addClass('start icon-play');
            } else if($(this).hasClass('stop')) {
                parent.stop();
                $('.pause').removeClass('pause icon-pause')
                    .addClass('start icon-play');
            }
        });
        controls.on('click', '.stop', function(e){
            e.preventDefault();
            state = 'stopped';
        });
        controls.on('click', '.faster, .slower', function(e){
            e.preventDefault();
            var diff = 0;
            if($(this).hasClass('faster')) diff = 1;
            else diff = -1;
                    
            for(i = 0; i < overtones.length; i++) {
                overtones[i].changeSpeed(diff);
            }
            parent.restart();
        });
        controls.on('click', '.split', function(e) {
            e.preventDefault();
            $('.superpose').removeClass('selected');
            $('.split').addClass('selected');
            parent.clear();
            parent.setWaves(overtones);
            parent.drawFrame();
        });
        controls.on('click', '.superpose', function(e) {
            e.preventDefault();
            $('.split').removeClass('selected');
            $('.superpose').addClass('selected');
            parent.clear();
            parent.setWaves(superposed);
            parent.drawFrame();
        });
    };
}
        
$(document).ready(function(){
    fps_elem = $('#fps');
    showfps = false;
    if(showfps){
        setInterval(function(){
            fps_elem.html(frames);
            frames = 0;
        }, 1000);
    }
});
