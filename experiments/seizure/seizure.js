
function get_random_color(steps, range_min, range_max) {
    numOfSteps = steps;
    step = Math.floor(Math.random()*(range_max-range_min+1)+range_min);

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

function rand(num) {
    return Math.floor(Math.random() * num);
}


function seizure(canvas, ctx) {
    var seizure = this;

    this.grid = {};
    this.paint = {};
    this.paint_mode = false;
    this.scale = 15;

    this.prev_mouse = null;

    this.draw_point = function(x, y) {
        var grid_x = Math.floor(x/scale);
        var grid_y = Math.floor(y/scale);

        if(seizure.paint_mode === true) {
            var timeout = new Date().getTime() + 38000;
            seizure.paint[grid_x + "," + grid_y] = timeout;
            seizure.paint[grid_x-1 + "," + grid_y] = timeout;
            seizure.paint[grid_x + "," + (grid_y-1)] = timeout;
            seizure.paint[grid_x + "," + (grid_y+1)] = timeout;
            seizure.paint[grid_x+1 + "," + grid_y] = timeout;
            seizure.paint[grid_x+1 + "," + (grid_y+1)] = timeout;
            seizure.paint[grid_x+1 + "," + (grid_y-1)] = timeout;
            seizure.paint[grid_x-1 + "," + (grid_y+1)] = timeout;
            seizure.paint[grid_x-1 + "," + (grid_y-1)] = timeout;
            
            timeout = 0;
            seizure.grid[grid_x + "," + grid_y] = timeout;
            seizure.grid[grid_x-1 + "," + grid_y] = timeout;
            seizure.grid[grid_x + "," + (grid_y-1)] = timeout;
            seizure.grid[grid_x + "," + (grid_y+1)] = timeout;
            seizure.grid[grid_x+1 + "," + grid_y] = timeout;
            seizure.grid[grid_x+1 + "," + (grid_y+1)] = timeout;
            seizure.grid[grid_x+1 + "," + (grid_y-1)] = timeout;
            seizure.grid[grid_x-1 + "," + (grid_y+1)] = timeout;
            seizure.grid[grid_x-1 + "," + (grid_y-1)] = timeout;
        } else {
            var timeout = new Date().getTime() + 34000;
            seizure.grid[grid_x + "," + grid_y] = timeout;
            seizure.grid[grid_x-1 + "," + grid_y] = timeout;
            seizure.grid[grid_x + "," + (grid_y-1)] = timeout;
            seizure.grid[grid_x + "," + (grid_y+1)] = timeout;
            seizure.grid[grid_x+1 + "," + grid_y] = timeout;
            seizure.grid[grid_x+1 + "," + (grid_y+1)] = timeout;
            seizure.grid[grid_x+1 + "," + (grid_y-1)] = timeout;
            seizure.grid[grid_x-1 + "," + (grid_y+1)] = timeout;
            seizure.grid[grid_x-1 + "," + (grid_y-1)] = timeout;
        }
    }

    function userdraw(e){
        e.preventDefault();

        if(e.originalEvent.touches || e.originalEvent.changedTouches) {
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            var x = touch.pageX;
            var y = touch.pageY;
        } else {
            var x = e.offsetX;
            var y = e.offsetY;
        }

        seizure.draw_point(x, y);
    }

    $(document).bind('mousemove touchmove', userdraw);
    $(document).bind('mousedown touchstart', function(e){
        seizure.paint_mode = true;
        userdraw(e);
    }).bind('mouseup touchend', function(e){
        seizure.paint_mode = false;
    });
    var h = canvas.height;
    var w = canvas.width;

    ctx.fillStyle = '#000';

    this.draw = function() {
        var num_squares = 0;
        for (var x = 0; x < canvas.width; x+=scale) {
            for (var y = 0; y < canvas.height; y+=scale) {
                var now = new Date().getTime();
                var grid_x = x/scale;
                var grid_y = y/scale;
                if(this.grid[grid_x+","+grid_y] === undefined || this.grid[grid_x+","+grid_y] < now) {
                    if(this.paint[grid_x+","+grid_y] !== undefined && this.paint[grid_x+","+grid_y] > now) {
                        ctx.fillStyle = get_random_color(30, 0, 15);
                        ctx.fillRect(x, y, scale, scale);
                    } else {
                        if (Math.random() > 0.2) {
                            ctx.fillStyle = get_random_color(30, 15, 20);
                            ctx.fillRect(x, y, scale, scale);
                        } else {
                            ctx.fillStyle = '#000';
                            ctx.fillRect(x, y, scale, scale);
                        }
                    }
                } else {
                    //ctx.fillStyle = '#fff';
                    //ctx.fillRect(x, y, scale, scale);
                }
                num_squares++;
            }
        }

    }
    return this;

}
