function Canvas(jq_elem) {
    // create a canvas inside another element
    // and set the height&width to fill the element
    var canvas_jq = $('<canvas>');
    var canvas = canvas_jq.get(0);
    canvas.width = jq_elem.innerWidth();
    canvas.height = jq_elem.innerHeight();
    canvas_jq.attr('width', canvas.width);
    canvas_jq.attr('height', canvas.height);
    var context = canvas.getContext("2d");
    // make the h/w accessible from context obj as well
    context.width = canvas.width;
    context.height = canvas.height;
    canvas_jq.appendTo(jq_elem);
    return canvas_jq;
}

function drawingCanvas(jq_elem) {
    var jq_elem = jq_elem;
    var canvas_jq = new Canvas(jq_elem);
    var canvas = canvas_jq.get(0);
    var ctx = canvas.getContext("2d");
    var that = this;
    var points = new Float32Array(512);
    var draw = false;
    var prev_position = null;
    
    for(var j=0; j<points.length; j++) {
        points[j] = 0;
    }

    this.init = function() {
        this.resetLineHistory();
        ctx.strokeStyle = '#aa6000';
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        $("*").on("mousemove", function(e) {
            if(draw == true) {
                var current_position = that.getCursorPosition(e);
                that.drawLine(ctx, prev_position, current_position);
                prev_position = current_position;
            }
        });
        $("*").on("mouseup", function() {
            that.stopDrawing();
        });

        canvas_jq.mousedown(function(e) {
            e.preventDefault();
            that.startDrawing();
        }).mouseup(function() {
            that.stopDrawing();
        });
    }

    this.startDrawing = function() {
        draw = true;
    }
    this.stopDrawing = function() {
        draw = false;
        this.resetLineHistory();
    }
    this.resetLineHistory = function() {
        prev_position = { x: null, y: null };
    }
    this.drawLine = function(ctx, prev_position, current_position) {
        if(prev_position.x==null || prev_position.y==null) {
            prev_position.x = current_position.x;
            prev_position.y = current_position.y;
        }
            
        var adjusted_px = parseInt((prev_position.x / ctx.width) * 512);
        var adjusted_cx = parseInt((current_position.x / ctx.width) * 512);
        ctx.clearRect(0, 0, ctx.width, ctx.height);
        var from, to;
        if(adjusted_px < adjusted_cx) {
            from = adjusted_px;
            to = adjusted_cx;
        } else {
            from = adjusted_cx;
            to = adjusted_px;
        }
        var y_diff = current_position.y - prev_position.y;
        for(var i = from; i <= to; i++) {
            // linear values between from and to coordinates
            points[i] = (prev_position.y + (y_diff * (Math.abs(adjusted_px-i)/Math.abs(adjusted_cx-adjusted_px)))) / ctx.height;
        }
        ctx.beginPath();
        for(var i=0; i<points.length; i++) {
            ctx.lineTo(i*(ctx.width/512), points[i]*ctx.height);
        }
        ctx.stroke();
    }
    this.getCursorPosition = function(e) {
        var x = e.pageX - canvas_jq.offset().left
        var y = e.pageY - canvas_jq.offset().top
        if(x < 0) x = 0;
        if(y < 0) y = 0;
        return {x: x, y: y};
    }
}

