// MODULE binScrollTo
;(function(zjs){
"use strict";
	
	var optionkey = 'zjsmodulebinScrollTooption';
	
	// extend core option cho de dieu chinh
	zjs.extendCore({
		modulebinScrollToOption:{
			// enter your module's default options
			// here
			// option1: '',
			// option2: ''
			gotoElement:'',
			gotoTime:1000,
			gotoTransition:2,
			extraPixel:0
		}
	});
	
	
	// - - - - - - - - -
	
	// STATIC TIMER
	var binScrollTimer = zjs.timer({
		onProcess: function(current){
			window.scrollTo(0, current);
		},
		onFinish: function(){
			
		}
	});
	
	// static function to scroll
	var binScrollTo = function(useroption){
		var option = zjs.extend(zjs.clone(zjs.modulebinScrollToOption), useroption);
		
		// xac dinh coi scroll toi dau
		 var 	to = 0,
		 		toElement = option.gotoElement;
		if(toElement != '')
			to = zjs(toElement).getAbsoluteTop() + option.extraPixel;
		
		// stop current scroll
		binScrollTimer.stop();
		
		// set new option
		binScrollTimer.set({
			from: zjs(window).scrollTop(),
			to: to,
			time: option.gotoTime,
			transition: option.gotoTransition
		});
		
		// bat dau scroll		
		binScrollTimer.run();	
	};
	
	
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeBinScrollTo = function(element, useroption){
		
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
		option = zjs.clone(zjs.modulebinScrollToOption);
		
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
		
		
		zElement.click(function(event){
			
			// reload option
			option = zElement.getData(optionkey);
			
			// scroll
			binScrollTo(option);
		});
		
		// - - -
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeBinScrollTo: function(useroption){
			return this.each(function(element){makeBinScrollTo(element, useroption)});
		},
		binScrollTo: function(useroption){
			binScrollTo(useroption);
			return this;
		}
	});
	
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			var zEl = zjs(el);
			
			// kiem tra xem trong so cac thang con
			// co class nao la binscrollto ko, neu nhu co thi se auto makebinScrollTo luon
			zEl.find('.binscrollto').makeBinScrollTo();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la binscrollto ko, neu nhu co thi se auto makebinScrollTo luon
			if(zjs(el).hasClass('binscrollto'))zjs(el).makeBinScrollTo();
			zjs(el).find('.binscrollto').makeBinScrollTo();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.binscrollto').makeBinScrollTo();
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
		zjs.required('bin.scrollto');
})(zjs);