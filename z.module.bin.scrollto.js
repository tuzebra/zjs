// MODULE binScrollTo
;(function(zjs){
"use strict";
	
	// Authors: Luu Nghia Hoa (hoperwish), Nguyen Minh Nhut (bin bin), ... 
	
	var optionkey = 'zjsmodulebinScrollTooption',
		zWindow = zjs(window),
		zBody = zjs('body'),
		binScrollRunning = false,
		binScrollProcess = function(current){},
		binScrollFinish = function(){},
		version = 1.2;
	
	// extend core option cho de dieu chinh
	zjs.extendCore({
		modulebinScrollToOption:{
			// enter your module's default options
			// here
			// option1: '',
			// option2: ''
			onProcess: function(current){},
			onFinish: function(){},
			gotoValueElement: '',
			gotoTop: 0,
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
			if( typeof binScrollProcess == 'function' )
				binScrollProcess(current);
		},
		onFinish: function(){
			binScrollRunning = false;
			if( typeof binScrollFinish == 'function' )
				binScrollFinish();
		}
	});
	
	
	// when user scroll until binScrollTimer.start, it will action binScrollTimer.stop
	zWindow.on('mousewheel',function(event){
		if( binScrollRunning == true ){
			binScrollTimer.stop();
			binScrollRunning = false;
			
		}
		//console.log('mousewheel');
	});
	
	// static function to scroll
	var binScrollTo = function(useroption){
		var option = zjs.extend(zjs.clone(zjs.modulebinScrollToOption), useroption);
		
		// xac dinh coi scroll toi dau
		var to = option.gotoTop;
		if(option.gotoElement != '')
			to = zjs(option.gotoElement).getAbsoluteTop();
		else if(option.gotoValueElement != '')
			to = parseInt( zjs(option.gotoValueElement).getValue(0) );
		
		to += parseInt( option.extraPixel );
		
		//console.log( to , zBody.height() );
		/*
		if( to >= zBody.height() ){
			to = zBody.height();
		
			if(option.gotoValueElement != '')
				zjs(option.gotoValueElement).setValue(to);
		}
		*/
		
		if( to < 0 ) to = 0;
		
		if( typeof option.onFinish == 'function' );
			binScrollFinish = option.onFinish;
			
		if( typeof option.onProcess == 'function' );
			binScrollProcess = option.onProcess;
		
		// stop current scroll
		binScrollTimer.stop();
		
		// set new option
		binScrollTimer.set({
			from: zWindow.scrollTop(),
			to: to,
			time: option.gotoTime,
			transition: option.gotoTransition
		});
		
		// bat dau scroll		
		binScrollTimer.run();
		binScrollRunning = true;
		
		//console.log('binScrollRunning');
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