;(function(zjs){
"use strict";
	
	var context = zjs('html');
	
	// thuc hien test khi dom ready
	zjs.onready(function(){
		
		// test browser name
		context.addClass(zjs.browser.name);
		
		// test transform
		if(zjs.supportTransform)
			context.addClass('transform');
			
		// test supportTransition
		if(zjs.supportTransition)
			context.addClass('transition');
		
		// test flexbox model support
		if(zjs.supportFlexbox)
			context.addClass('flexbox');
	});

	// register module name
	zjs.required('detection');
	
})(zjs);