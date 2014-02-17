
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
    
    this.level = 1;

    this.grid = {};
    this.paint = {};
    this.burned = {};
    this.paint_mode = false;
    this.scale = 30;

    this.prev_mouse = null;

    this.draw_point = function(x, y) {
        var grid_x = Math.floor(x/scale);
        var grid_y = Math.floor(y/scale);

        var timeout = new Date().getTime();
        var area = [-1, 0, 1];

        if(seizure.paint_mode === true && seizure.level == 2) {
            for(var i=0; i<area.length; i++) {
                for(var j=0; j<area.length; j++) {
                    var x = grid_x + area[i];
                    var y = grid_y + area[j];
                    if(x >= 0 && y >= 0) {
                        if(this.burned[x + "," + y] === undefined) {
                            seizure.paint[x + "," + y] = timeout;
                        }
                    }
                }
            }
        } else {
            for(var i=0; i<area.length; i++) {
                for(var j=0; j<area.length; j++) {
                    var x = grid_x + area[i];
                    var y = grid_y + area[j];
                    if(x >= 0 && y >= 0) {
                        seizure.grid[x + "," + y] = timeout;
                    }
                }
            }
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

    var grid_total = Math.ceil(canvas.height/this.scale) * Math.ceil(canvas.width/this.scale);

    ctx.fillStyle = '#000';

    this.draw01 = function() {
        for (var x = 0; x < canvas.width; x+=scale) {
            for (var y = 0; y < canvas.height; y+=scale) {
                var now = new Date().getTime();
                var grid_x = Math.floor(x/scale);
                var grid_y = Math.floor(y/scale);
                if(this.grid[grid_x+","+grid_y] === undefined || this.grid[grid_x+","+grid_y] + 34000 < now) {
                    if (Math.random() > 0.2) {
                        ctx.fillStyle = get_random_color(30, 15, 20);
                        ctx.fillRect(x, y, scale, scale);
                    } else {
                        ctx.fillStyle = '#000';
                        ctx.fillRect(x, y, scale, scale);
                    }
                } else {
                    //ctx.fillStyle = '#fff';
                    //ctx.fillRect(x, y, scale, scale);
                }
            }
        }
    }

    this.draw02 = function() {
        this.level = 2;
        for (var x = 0; x < canvas.width; x+=scale) {
            for (var y = 0; y < canvas.height; y+=scale) {
                var now = new Date().getTime();
                var grid_x = Math.floor(x/scale);
                var grid_y = Math.floor(y/scale);

                if(this.paint[grid_x+","+grid_y] !== undefined) {
                    if(this.paint[grid_x+","+grid_y] + 1000 > now) {
                        ctx.fillStyle = get_random_color(30, 0, 15);
                        if(Math.random() < 0.1 && this.burned[grid_x+","+(grid_y-1)] == undefined) {
                            this.paint[grid_x+","+(grid_y-1)] = new Date().getTime() - 500;
                        }

                    } else {
                        ctx.fillStyle = '#000';
                        this.burned[grid_x+","+grid_y] = new Date().getTime();
                    }
                    ctx.fillRect(x, y, scale, scale);
                }
            }
        }
    }

    this.draw = function() {

        if(Object.keys(seizure.burned).length >= grid_total) {
            setTimeout(function() {
                window.animation = triangle(canvas, ctx);
            }, 2000);
        } else if (Object.keys(seizure.grid).length >= grid_total) {
            this.draw02();
        } else {
            this.draw01();
        }

    }
    return this;

}
