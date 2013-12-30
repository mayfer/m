/**
 * Generate TV static in a canvas element
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 2/9/2013
 * License: MIT
 */

function get_random_color(steps, range_min, range_max) {
    numOfSteps = steps;
    step = Math.floor(Math.random()*(range_max-range_min+1)+range_min);

    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

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


function tvstatic(canvas, ctx) {
    var that = this;

    this.grid = {};
    this.paint = {}
    this.paint_mode = false;
    this.scale = 25;

    $(document).bind('mousemove', function(e){
        var grid_x = Math.floor(e.offsetX / scale);
        var grid_y = Math.floor(e.offsetY / scale);
        if(that.paint_mode === true) {
            var timeout = new Date().getTime() + 5000;
            that.paint[grid_x + "," + grid_y] = timeout;
            that.paint[grid_x-1 + "," + grid_y] = timeout;
            that.paint[grid_x + "," + (grid_y-1)] = timeout;
            that.paint[grid_x + "," + (grid_y+1)] = timeout;
            that.paint[grid_x+1 + "," + grid_y] = timeout;
            that.paint[grid_x+1 + "," + (grid_y+1)] = timeout;
            that.paint[grid_x+1 + "," + (grid_y-1)] = timeout;
            that.paint[grid_x-1 + "," + (grid_y+1)] = timeout;
            that.paint[grid_x-1 + "," + (grid_y-1)] = timeout;
            
        } else {
            var timeout = new Date().getTime() + 3000;
            that.grid[grid_x + "," + grid_y] = timeout;
            that.grid[grid_x-1 + "," + grid_y] = timeout;
            that.grid[grid_x + "," + (grid_y-1)] = timeout;
            that.grid[grid_x + "," + (grid_y+1)] = timeout;
            that.grid[grid_x+1 + "," + grid_y] = timeout;
            that.grid[grid_x+1 + "," + (grid_y+1)] = timeout;
            that.grid[grid_x+1 + "," + (grid_y-1)] = timeout;
            that.grid[grid_x-1 + "," + (grid_y+1)] = timeout;
            that.grid[grid_x-1 + "," + (grid_y-1)] = timeout;
        }
    });
    $(document).mousedown(function(e){
        that.paint_mode = true;
    }).mouseup(function(e){
        that.paint_mode = false;
    });
    var h = canvas.height;
    var w = canvas.width;

    //ctx.clearRect(0, 0, WIDTH, HEIGHT);
    //ctx.fillStyle = '#aaa';
    ctx.fillStyle = '#000';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    // draw the static on the  canvas

    this.draw = function() {
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
            }
        }
    }
    return this;

}
