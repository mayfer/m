function waveCanvas(jq_elem, freqs) {
    var jq_elem = jq_elem;
    var superposed = [];
    var start_time = new Date().getTime();
    var time_diff = 0;
    var pause_time_diff = 0;
    var state = 'stopped';
    var anim_frame;
    var waves = [];
    var parent;
    var waves_canvas;
    var soundwave;

    this.init = function() {
        audio_context = new webkitAudioContext();

        this.setup();
        return this;
    };

    this.setup = function() {
        parent = $('<div class="parent-canvas">').css('height', (freqs.length*75 + 80) + "px");
        $(jq_elem).append(parent);

        waves_canvas = new Canvas(parent).addClass('waves').get(0);
        waves_context = waves_canvas.getContext("2d");

        function compare(a, b) {
          if (a.freq < b.freq)
             return -1;
          if (a.freq > b.freq)
            return 1;
          return 0;
        }
        freqs.sort(compare);

        this.drawWaveMode();
        this.initControls();
        this.initWaves();
        this.initADSR();
    }

    this.reSetup = function() {
        parent.parent().html('');
        this.setup();
    }

    this.initWaves = function() {
        waves = [];
        var index = 1;
        $.each(freqs, function(i, freqobj) {
            var amplitude_ratio = freqobj['amplitude'];
            var frequency = freqobj['freq'];
            var envelope = freqobj['envelope'];
            var amplitude = ((waves_context.height / freqs.length) / 3) * amplitude_ratio;
            var audio_amplitude = 1 * amplitude_ratio;
            waves.push(new standingWave(waves_context, index, freqs.length, frequency, amplitude, audio_amplitude, envelope));
            index++;
        });
        superposed = [new superposedWave(waves_context, 1, 1, waves)];
        soundwave = new soundWave(audio_context, waves);

        this.drawFrame();
    }

    this.setWaves = function(input_waves) {
        waves = input_waves;
    };

    this.drawWaveMode = function() {
        context = waves_context;
        context.fillStyle = "rgba(255,255,255, 0.3)";
        context.lineWidth = 2;
        context.strokeStyle = "#000";
    };

    this.drawFrame = function() {
        context = waves_context;
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
        context = waves_context;
        context.fillStyle = "rgba(255,255,255, 1)";
        context.fillRect(0, 0, context.width, context.height);
        this.drawWaveMode();
    }

    this.reset = function() {
        this.clear();
        time_diff = 0;
        this.drawFrame();
    };

    this.initADSR = function() {
        var adsr_container = $('<div>').addClass('adsr').appendTo(parent);
        var box_height = adsr_container.height() / (waves.length + 1) - 10;
        var box_width = adsr_container.width() - 40;
        var that = this;
        $.each([
            $('<div>').addClass('adsr-title').html('ADSR envelopes<br /><span class="tip">(click to edit)</span>'),
        ], function() {
            $(this).appendTo(adsr_container);
        });

        for(var i = 0; i < waves.length; i++) {
            //context.fillRect(20, waves[i].position - (box_height/2), box_width, box_height);
            var box = $('<a>').addClass('adsr-link')
                .attr('href', '#')
                .width(box_width)
                .height(box_height)
                .css('top', (waves[i].position - (box_height/2)) + 'px')
                .css('left', 20)
                .appendTo(adsr_container)
                .data('wave_index', i);
            $('<div>').addClass('freq').html(waves[i].freq + " Hz").appendTo(box);
            var adsr_canvas = new Canvas(box);
            box.on('click', function(e) {
                e.preventDefault();
                that.editEnvelope($(this).data('wave_index'));
            });
            that.drawADSR(adsr_canvas, waves[i].envelope);
        }

        var add_tone = $('<a>')
            .addClass('add-tone')
            .attr('href', '#')
            .html('Add a tone [+]')
            .appendTo(adsr_container)
            .on('click', function(e){
                e.preventDefault();
                freqs.push({freq: 220, amplitude: 1/2});
                that.reSetup();
            });
    }

    this.editEnvelope = function(wave_index) {
        var wave = waves[wave_index];
        var that = this;
        var draw_canvas;
        
        var modal = $('<div>')
            .addClass('modal-adsr')
            .width((parent.innerWidth() - 44) + 'px')
            .height((parent.innerHeight() - 44) + 'px')
            .appendTo(parent);
        var freq = $('<input type="text" />').val(wave.freq);
        $('<div>')
            .addClass('title')
            .appendTo(modal)
            .append($('<a>').addClass('close').html('x').attr('href', '#').click(function(e){
                e.preventDefault;
                modal.remove();
            }))
            .append($('<h3>').html('ADSR envelope for ').append(freq).append(' Hz'));
        var draw_area = $('<div>')
            .addClass('draw-adsr')
            .css('height', (modal.innerHeight() - 90) + "px")
            .css('width', (modal.innerWidth() - 30 - 15) + "px")
            .appendTo(modal);
        $('<div>')
            .addClass('actions')
            .appendTo(modal)
            .append($('<a>').addClass('save').attr('href', '#').html('Save').click(function(e){
                e.preventDefault();
                freqs[wave_index].freq = parseInt(freq.val());
                freqs[wave_index].envelope = draw_canvas.getPoints();
                freqs[wave_index].duration = 400; // ms
                modal.remove();
                that.reSetup();
            }));
        draw_canvas = new drawingCanvas(draw_area);
        draw_canvas.init();
        draw_canvas.setPoints(wave.envelope);
        this.drawADSR(draw_canvas.getCanvasElement(), wave.envelope);
    }

    this.drawADSR = function(canvas_jq, envelope) {
        // fills the given canvas elem with the adsr drawing
        var canvas = canvas_jq.get(0);
        var context = canvas.getContext("2d");

        context.strokeStyle = '#aa6000';
        context.lineWidth = 2;
        context.lineCap = "round";
        context.clearRect(0, 0, context.width, context.height);
        
        context.beginPath();
        for(var i=0; i<envelope.length; i++) {
            // the 1-envelope[i] is to inverse y axis for the canvas
            context.lineTo(i*(context.width/envelope.length), (1-envelope[i])*context.height);
        }
        context.stroke();
    }

    this.initControls = function(){
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
