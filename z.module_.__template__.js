// MODULE __TEMPLATE__
;(function(zjs){
"use strict";
	
	var optionkey = 'zjsmodule__TEMPLATE__option';
	
	// extend core option cho de dieu chinh
	zjs.extendCore({
		module__TEMPLATE__Option:{
			// enter your module's default options
			// here
			// option1: '',
			// option2: ''
		}
	});
	
	// trigger
	//ui.datepicker.change
	
	// template
	var templateclass = '__TEMPLATE__class';
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var make__TEMPLATE__ = function(element, useroption){
		
		var zElement = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zElement.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zElement.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.module__TEMPLATE__Option);
		
		// extend from inline option ?
		var inlineoption = zElement.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zElement.removeAttr('data-option');
		
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
			
		// save option
		zElement.setData(optionkey, option);
		
		// - - -
		// start coding your module
		
		// ...
		
		// - - -
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		make__TEMPLATE__: function(useroption){
			return this.each(function(element){make__TEMPLATE__(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			var zEl = zjs(el);
			
			// kiem tra xem trong so cac thang con
			// co class nao la z__TEMPLATE__ ko, neu nhu co thi se auto make__TEMPLATE__ luon
			zEl.find('.z__TEMPLATE__').make__TEMPLATE__();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la z__TEMPLATE__ ko, neu nhu co thi se auto make__TEMPLATE__ luon
			if(zjs(el).hasClass('z__TEMPLATE__'))zjs(el).make__TEMPLATE__();
			zjs(el).find('.z__TEMPLATE__').make__TEMPLATE__();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.z__TEMPLATE__').make__TEMPLATE__();
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('__TEMPLATE__');
})(zjs);