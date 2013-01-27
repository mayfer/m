(function( $ ) {
  $.fn.piano = function(options) {
	var containing_div = this;
	
	var settings = $.extend( {
      number_of_keys : 35, // cannot exceed 83 nor be less than 35
      key_width : 30, // white key width in pixels
      key_height : 130, // white key height in pixels
      chord_color : '#bbd9e4', // color accent when a chord is chosen
      scale_color : '#fbce80' // color accent when a scale is chosen

    }, options);
    
    return this.each(function() {  
    	
	    var chord_color = settings.chord_color;
	    var scale_color = settings.scale_color;
		var number_of_keys = settings.number_of_keys; // cannot exceed 83 nor be less than 35
		var key_width = settings.key_width;  // white key width in pixels
		var key_height = settings.key_height; // white key height in pixels
		
		
		var black_key_array = new Array(1,3,6,8,10,13,15,18,20,22,25,27,30,32,34,37,39,42,44,46,49,51,54,56,58,61,63,66,68,70,73,75,78,80,82);
		var black_key_offset = parseInt(key_width / 4); // offset (distance - offset = width between keys)   
		var black_key_width = parseInt(key_width/2);
		var black_key_height = parseInt(key_height/1.65);
		var black_key_position = 0; // current black key postion
		var white_key_counter = 0;
		
		var white_key_position = 0;   // current white key position
		
		var key_notes = new Array('C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B','C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B','C','C#','D');
		var root = ''; // root key, initially unassigned
		var key_step = 0; // how many steps to take from one note to the next
		
		// if number of keys undefined set to default of 35
		// else if number of keys exceeds 81 bump down else if it is less than 35, bump up
		if(isNaN(number_of_keys)){
		    number_of_keys = 35;
		}else if(number_of_keys > 83){
		    number_of_keys = 83;
		}else if(number_of_keys < 35){
		    number_of_keys = 35;
		}else{}
		
		// find a Middle C key number - (12 is the number of keys from one octave to the next) 
		var middle_c = Math.round((number_of_keys) / 12 );
		middle_c = (Math.round(middle_c / 2) * 12) - 13;
		
		// if number of keys ends on a black key, bump up +1 to end on a white key
		if($.inArray(number_of_keys, black_key_array) != -1){
			number_of_keys = number_of_keys + 1;
		}
				
		// create containing divs for virtual piano chords
		$(containing_div).append('<div id="vpcf_container"></div>');
		
		// Print the keys to screen
		for(key=0;key<=number_of_keys;key++){
			// if key is a black key
			if($.inArray(key, black_key_array) != -1){
			    black_key_position = (key_width * white_key_counter) - black_key_offset;
		    	$('#vpcf_container').append('<div class="vpcf_black_key" id="vpcf_key_'+key+'" style="margin-left:'+black_key_position+'px;width:'+black_key_width+'px;height:'+black_key_height+'px;"></div>');
			}else{
		    	$('#vpcf_container').append('<div class="vpcf_white_key" id="vpcf_key_'+key+'" style="margin-left:'+white_key_position+'px;width:'+key_width+'px;height:'+key_height+'px"></div>');
		    	white_key_position = white_key_position + key_width;
		    	white_key_counter++;
		    }
		}
		
		// assign width for container
		var border_width = 2; // border width is the left and right border
		var total_width = (white_key_counter * key_width) + border_width;
		var total_height = key_height + border_width;
		$('#vpcf_container').width(total_width);
		$('#vpcf_container').height(total_height);
		
			
	 });
  };
})( jQuery );
