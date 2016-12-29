// extend module Sprite cho zjs
;(function(zjs){
"use strict";
	
	window.zjsmodulespriteFn = {};
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeSprite: function(option){
			
			option = zjs.extend({
				duration:2000,
				loop:true,
				autoplay:false,
				unit:1,
				frames:[]
			}, option);
			
			if(option.frames.length<2)return;
			
			var totalFrame = option.frames.length,
				timePerFrame = option.duration / (totalFrame - 1);
			
			this.each(function(element){
				
				var zmspriteid = zjs.getUniqueId(),
					zEl = zjs(element).setData('zmspriteid', zmspriteid),
					currentFrame = 0,
					status = 'running',
					timer = false,
					frames = zjs.extend([], option.frames),
					setBg = function(){
						zEl.setStyle('background-position',(-frames[currentFrame][0]*option.unit)+'px '+(-frames[currentFrame][1]*option.unit)+'px');
					},
					destroy = function(){
						if(timer)window.clearInterval(timer);
						timer = false;
					},
					init = function(){
						destroy();
						timer = window.setInterval(function(){
							if(status!='running')return;
							if(++currentFrame == totalFrame){
								if(typeof endCallback == 'function')endCallback();
								if(!option.loop){destroy();currentFrame=-1;return;};
								currentFrame = 0;
							};
							setBg();
						},timePerFrame);
					},
					reverse = function(){
						frames = frames.reverse();
					},
					endCallback = false;
				
				window.zjsmodulespriteFn['spritePause' + zmspriteid] = function(){status='pause';destroy();};
				window.zjsmodulespriteFn['spriteStop' + zmspriteid] = function(){status='stop';currentFrame=0;setBg();destroy();};
				window.zjsmodulespriteFn['spritePlay' + zmspriteid] = function(callback){status='running';init();endCallback=callback;};
				window.zjsmodulespriteFn['spriteReverse' + zmspriteid] = function(){reverse();};
			
				// set element to the first frame
				setBg();
				if(option.autoplay)init();
				
			});
			
			// - - -
			// tuan thu? theo
			// cu' phap' cua? zjs
			return this;
		},
		spritePause: function(){this.each(function(element){var zmspriteid = zjs(element).getData('zmspriteid', 0);if(zmspriteid)(window.zjsmodulespriteFn['spritePause' + zmspriteid])();});return this;},
		spriteStop: function(){this.each(function(element){var zmspriteid = zjs(element).getData('zmspriteid', 0);if(zmspriteid)(window.zjsmodulespriteFn['spriteStop' + zmspriteid])();});return this;},
		spritePlay: function(callback){this.each(function(element){var zmspriteid = zjs(element).getData('zmspriteid', 0);if(zmspriteid)(window.zjsmodulespriteFn['spritePlay' + zmspriteid])(callback);});return this;},
		spriteReverse: function(){this.each(function(element){var zmspriteid = zjs(element).getData('zmspriteid', 0);if(zmspriteid)(window.zjsmodulespriteFn['spriteReverse' + zmspriteid])();});return this;}
	});
	
	// make auto-init slider
	zjs(function(){
		zjs('.zsprite').each(function(element){
			var zElement = zjs(element),
				option = zElement.getAttr('data-option','');
			if(!zjs.isString(option))option='';
			option = option.jsonDecode();
			zElement.makeSprite(option);
		});
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('sprite');
	
})(zjs);