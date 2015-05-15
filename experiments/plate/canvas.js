
function Canvas(jq_elem) {
    // create a canvas inside another element
    // and set the height&width to fill the element
    var canvas_jq = $('<canvas>');
    var canvas = canvas_jq.get(0);
    var width = jq_elem.innerWidth();
    var height = jq_elem.innerHeight();
    
    canvas_jq.attr('width', width);
    canvas_jq.attr('height', height);
    var context = canvas.getContext("2d");
    // make the h/w accessible from context obj as well
    context.width = width;
    context.height = height;
    canvas_jq.appendTo(jq_elem);
    return canvas_jq;
}

