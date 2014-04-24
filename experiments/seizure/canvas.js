
function Canvas(jq_elem) {
    // create a canvas inside another element
    // and set the height&width to fill the element
    var canvas_jq = $('<canvas>');
    this.canvas = canvas_jq.get(0);
    this.width = jq_elem.innerWidth();
    this.height = jq_elem.innerHeight();
    
    canvas_jq.attr('width', this.width);
    canvas_jq.attr('height', this.height);
    this.context = this.canvas.getContext("2d");
    // make the h/w accessible from context obj as well
    context.width = this.width;
    context.height = this.height;
    canvas_jq.appendTo(jq_elem);
    return canvas_jq;
}

