// extend module __BASIC_TEMPLATE__ cho zjs
;(function(zjs){
"use strict";

	// extend method cho zjs-instance
	zjs.extendMethod({
		make__BASIC_TEMPLATE__: function(option){
			
			option = zjs.extend({
				// enter your default options
				// here
				// option1: '',
				// option2: ''
			},option);
			
			// do each and return 
			return this.each(function(element){
				var zElement = zjs(element);
				
				// - - -
				// start coding your module
				
				// ...
				// code here
				// ...
				
				// - - -
				
				
			});
			// end each
		}
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('__BASIC_TEMPLATE__');

})(zjs);