function Canvas(jq_elem) {
    var canvas_jq = $('<canvas>');
    var canvas = canvas_jq.get(0);
    canvas.width = jq_elem.innerWidth();
    canvas.height = jq_elem.innerHeight();
    canvas_jq.attr('width', canvas.width);
    canvas_jq.attr('height', canvas.height);
    var context = canvas.getContext("2d");
    context.width = canvas.width;
    context.height = canvas.height;
    canvas_jq.appendTo(jq_elem);
    return canvas_jq;
}

function drawingCanvas(jq_elem) {
    var jq_elem = jq_elem;
    var canvas_jq = new Canvas(jq_elem);
    var canvas = document.getElementById("canvas");
    var that = this;

    this.init = function() {
        resetLineHistory();
        var ctx = canvas.getContext("2d");
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        canvas_jq.mousedown(function(e) {
            e.preventDefault();
            that.startDrawing();
        }).mouseup(function() {
            that.stopDrawing();
        }).mousemove(function(e) {
            if(canvas_jq.data("draw") == true) {
                var current_position = that.getCursorPosition(e);
                that.drawLine(ctx, canvas_jq.data("prev_position"), current_position);
                canvas_jq.data("prev_position", current_position);
            }
        }).mouseover(function(e){
            canvas_jq.data("draw_when_entering", false);
        }).mouseout(function(e) {
            canvas_jq.data("draw_when_entering", true);
            if($(canvas_jq.data("draw") == true) {
                drawLine(ctx, canvas_jq.data("prev_position"), getCursorPosition(e));
                $("*").one("mouseup", function() {
                    that.stopDrawing();
                });
            }
            that.resetLineHistory();
            // when user mouseups outside the canvas
        });
    }

    this.startDrawing = function() {
        canvas_jq.data("draw", true);
    }
    this.stopDrawing = function() {
        canvas_jq.data("draw", false);
        resetLineHistory();
    }
    this.resetLineHistory = function() {
        cavnas_jq.data("prev_position", { x: null, y: null });
    }
    this.drawLine = function(ctx, prev_position, current_position) {
        ctx.beginPath();
        if(prev_position.x!=null && prev_position.y!=null) {
            ctx.moveTo(prev_position.x, prev_position.y);
        }
        ctx.lineTo(current_position.x, current_position.y);
        ctx.stroke();
    }
    this.getCursorPosition = function(e) {
        var x, y;

        if (e.layerX || e.layerX == 0) { // Firefox
            x = e.layerX;
            y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) { // Opera
            x = e.offsetX;
            y = e.offsetY;
        }
        return {x: x, y: y};
    }
}

$(document).ready(function() {


	//code for color pallete
	$("#colors > div").click( function(){
		ctx.strokeStyle = $(this).css("background-color");
	});

	//Eraser
	$("#eraser").click(function(){
		ctx.strokeStyle = '#fff';
	});

	//Code for save the image
	$("#save").click(function(){
		$("#result").append("<br /><br /><img src="+ canvas.toDataURL()+ " /><br /><a href="+canvas.toDataURL()+ " target='_blank'>show</a>");
	});

	//Clear
	$("#clear").click(function(){
			var tmp_fillStyle = ctx.fillStyle;
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = tmp_fillStyle;
		}
	);
});
