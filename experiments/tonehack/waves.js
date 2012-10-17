window.requestAnimFrame = (function(){
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame || 
        function(callback, element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();
window.cancelAnimFrame = (function(){
    return window.cancelAnimationFrame || 
        window.cancelRequestAnimationFrame || 
        window.webkitCancelAnimationFrame || 
        window.webkitCancelRequestFrame || 
        window.mozCancelAnimationFrame || 
        window.mozCancelRequestAnimationFrame || 
        window.oCancelAnimationFrame || 
        window.oCancelRequestAnimationFrame || 
        window.msCancelAnimationFrame || 
        window.msCancelRequestAnimationFrame || 
        function(handler){
            clearTimeout(handler);
        };
})();

var X_INCREMENT = 10;
var DEFAULT_SPEED = 3;

var lastCalledTime;
var fps;


function standingWave(context, index, num_waves, freq, amplitude) {
    var amplitude = amplitude;
    var step = 0.0;
    var standing = Math.PI / context.width; // resonant wavelength for canvas width
    var freq = freq;
    var freq_diff = freq * standing / 440; // calculate relative wavelength
    var speed = DEFAULT_SPEED;
    var wave_height = (context.height / (num_waves+1));
    var current_amplitude = 0;
    var current_plot_coordinates = null;
    var position = index * wave_height;// - (wave_height/2);

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
        step = speed * time_diff * (Math.PI/20) * freq * (standing / 440) % Math.PI*2;
        current_amplitude = Math.sin(step) * amplitude;
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
        context.fillRect(0, position-amplitude-10, context.width, amplitude*2+20);
        this.current_plot_coordinates = this.getPlotCoordinates(time_diff);
        for(var i = 0; i < this.current_plot_coordinates.length; i++) {
            coord = this.current_plot_coordinates[i];
            context.beginPath();
            context.moveTo(coord.from.x, coord.from.y + position);
            context.lineTo(coord.to.x, coord.to.y + position);
            context.stroke();
        }
    };
}
                    
function superposedWave(context, index, num_waves, standing_waves) {
    var wave_height = (context.height / (num_waves+1));
    var position = index * wave_height;
    var num_steps = Math.round(context.width / X_INCREMENT);
    var coords, current_coords;
    this.draw = function(time_diff) {
        context.fillRect(0, 0, context.width, context.height);
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
            context.beginPath();
            context.moveTo(coords.from.x, coords.from.y + position);
            context.lineTo(coords.to.x, coords.to.y + position);
            context.stroke();
        }
    };
}


function waveCanvas(jq_elem) {
    var jq_elem = jq_elem;
    var wavelengths = [];
    var overtones = [];
    var superposed = [];
    var start_time = new Date().getTime();
    var time_diff = 0;
    var pause_time_diff = 0;
    var state = 'stopped';
    var context;
    var anim_frame;
    var waves = [];

    this.init = function() {
        var canvas_jq = $('<canvas>');
        $(jq_elem).append(canvas_jq);
        var canvas = canvas_jq.get(0);
        canvas.height = canvas_jq.innerHeight();
        canvas.width = canvas_jq.innerWidth();
        canvas_jq.attr('height', canvas.height);
        canvas_jq.attr('width', canvas.width);
        context = canvas.getContext("2d");
        context.translate(0.5, 0.5); // unblur lines
        // just to be able to access directly from context object
        context.width = canvas.width;
        context.height = canvas.height;
        this.makeControls();
                    
        this.drawWaveMode();
                
        wavelengths = [440, 440*2, 440*3, 440*4];

        overtones = [];
        for(i = 0; i < wavelengths.length; i++) {
            var amplitude = (context.height / wavelengths.length) / 3;
            amplitude = amplitude / (i+1);
            overtones.push(new standingWave(context, i+1, wavelengths.length, wavelengths[i], amplitude));
        }
        superposed = [new superposedWave(context, 1, 1, overtones)];
        waves = overtones;

        this.drawFrame();
    };

    this.setWaves = function(input_waves) {
        waves = input_waves;
    };

    this.drawWaveMode = function() {
        context.fillStyle = "rgba(0, 0, 0, 0.3)";
        context.lineWidth = 2;
        context.strokeStyle = "#fff";
    };

    this.drawFrame = function() {
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

                    
        if(!lastCalledTime) {
            lastCalledTime = new Date().getTime();
            fps = 0;
            return;
        }
        delta = (new Date().getTime() - lastCalledTime)/1000;
        lastCalledTime = new Date().getTime();
        fps = Math.round(1/delta);
        fps_elem.html(fps);
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
    };

    this.pause = function() {
        state = 'paused';
        pause_time_diff = new Date().getTime() - start_time;
    };

    this.stop = function() {
        state = 'stopped';
        cancelAnimFrame(anim_frame);
        this.reset()
    };

    this.restart = function() {
        // graceful
        start_time = new Date().getTime();
    }

    this.clear = function() {
        context.fillStyle = "rgba(0, 0, 0, 1)";
        context.fillRect(0, 0, context.width, context.height);
        this.drawWaveMode();
    }

    this.reset = function() {
        this.clear();
        time_diff = 0;
        this.drawFrame();
    };

    this.makeControls = function(){
        var wave_canvas = this;
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
                wave_canvas.start();
                $(this).removeClass('start icon-play')
                    .addClass('pause icon-pause');
            } else if($(this).hasClass('pause')) {
                wave_canvas.pause();
                $(this).removeClass('pause icon-pause')
                    .addClass('start icon-play');
            } else if($(this).hasClass('stop')) {
                wave_canvas.stop();
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
            wave_canvas.restart();
        });
        controls.on('click', '.split', function(e) {
            e.preventDefault();
            $('.superpose').removeClass('selected');
            $('.split').addClass('selected');
            wave_canvas.clear();
            wave_canvas.setWaves(overtones);
            wave_canvas.drawFrame();
        });
        controls.on('click', '.superpose', function(e) {
            e.preventDefault();
            $('.split').removeClass('selected');
            $('.superpose').addClass('selected');
            wave_canvas.clear();
            wave_canvas.setWaves(superposed);
            wave_canvas.drawFrame();
        });
    };
}
        
$(document).ready(function(){
    fps_elem = $('#fps');
});