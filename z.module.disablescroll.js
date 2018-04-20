// MODULE DISABLE SCROLL
(function(){
"use strict";

	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var zWindowEl, zHtml, zDocument, zBody;

	var rememberLastScroll = null;
	
	var disableScroll = function(element){

		// currently it just support window
		if(element !== window)return;

		if(!zHtml)zHtml = zjs('html');
		if(!zBody)zBody = zjs(document.body);

		zHtml.setStyle({
			overflow: 'hidden', 
			// height: '100%'
		});
		
		if(zjs.browser.safari && zjs.browser.isIPhone){
			rememberLastScroll = zBody.scrollTop();
			zBody.setStyle({overflow: 'hidden', height: '100%'});
		}

	};

	var enableScroll = function(element){

		// currently it just support window
		if(element !== window)return;

		if(!zHtml)zHtml = zjs('html');
		if(!zBody)zBody = zjs(document.body);

		zHtml.setStyle({
			overflow: null, 
			// height: null
		});

		if(zjs.browser.safari && zjs.browser.isIPhone){
			zBody.setStyle({overflow: null, height: null, scrollTop: rememberLastScroll});
		}

	};


	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		disableScroll: function(useroption){
			return this.eachElement(function(element){disableScroll(element)});
		},
		enableScroll: function(){
			return this.eachElement(function(element){enableScroll(element)});
		},
	});

	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('disablescroll');
})();