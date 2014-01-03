
function triangle(canvas, ctx) {
    var that = this;
    

    function userdraw(e){
        e.preventDefault();
        var grid_x, grid_y;

        if(e.originalEvent.touches || e.originalEvent.changedTouches) {
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            grid_x = touch.pageX;
            grid_y = touch.pageY;
        } else {
            grid_x = e.offsetX;
            grid_y = e.offsetY;
        }

        that.cursor_percentX = grid_x / canvas.height;
        that.cursor_percentY = grid_y / canvas.width;
    }

    $(document).bind('mousemove touchmove', userdraw);
    $(document).bind('mousedown touchstart', function(e){
        that.paint_mode = true;
        userdraw(e);
    }).bind('mouseup touchend', function(e){
        that.paint_mode = false;
    });
    var h = canvas.height;
    var w = canvas.width;

    ctx.fillStyle = '#000';

    this.random = function(steps, range_min, range_max) {
        numOfSteps = steps;
        step = Math.floor(Math.random()*(range_max-range_min+1)+range_min);
        return step;
    }
    this.random_color = function(steps, range_min, range_max) {
        step = this.random(steps, range_min, range_max);

        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch(i % 6){
            case 0: r = 1, g = f, b = 0; break;
            case 1: r = q, g = 1, b = 0; break;
            case 2: r = 0, g = 1, b = f; break;
            case 3: r = 0, g = q, b = 1; break;
            case 4: r = f, g = 0, b = 1; break;
            case 5: r = 1, g = 0, b = q; break;
        }
        var brightness = 220;
        var c = "#" + ("00" + (~ ~(r * brightness)).toString(16)).slice(-2) + ("00" + (~ ~(g * brightness)).toString(16)).slice(-2) + ("00" + (~ ~(b * brightness)).toString(16)).slice(-2);
        return (c);
    }
    this.draw = function() {

        var h = canvas.height - this.random(canvas.height, 0, canvas.height) + this.random(canvas.height, 0, canvas.height);
        var w = canvas.width - this.random(canvas.width, 0, canvas.width) + this.random(canvas.width, 0, canvas.width);;

        var triangle = {
            width: 200,
            height: 200 * Math.sin(Math.PI/3),
        };

        ctx.fillStyle = this.random_color(40, that.cursor_percentX * 40, that.cursor_percentY * 40);
        console.log(that.cursor_percentY);

        ctx.beginPath();
        ctx.moveTo((w/2), (h/2) - (triangle.height/2) );
        ctx.lineTo((w/2) + (triangle.width/2), (h/2) + (triangle.height/2) );
        ctx.lineTo((w/2) - (triangle.width/2), (h/2) + (triangle.height/2) );
        ctx.closePath();
        ctx.fill();
    }



    return this;
}
