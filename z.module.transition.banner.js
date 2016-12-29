// MODULE UI TRANSITION BANNER
zjs.require('transition', function(){
"use strict";
	
	var optionkey = 'zjsmoduletransitionbanneroption',
		timerkey = 'zjsmoduletransitionbannertimer',
		bannerautokeyframe = 'zmoduletransitionbannerautokeyframe';
	
	// extend core mot so option
	zjs.extendCore({
		moduleTransitionBannerOption: {
			autoplay: true,
			repeat: true,
			ratio: 1,
			keyframes: false
		}
	});
	
	// trigger
	//transition.banner.start
	
	
	// template
	var zbannerclass = 'zbanner';
	
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeBanner = function(element, useroption){
		
		var zBannerEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zBannerEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zBannerEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleTransitionBannerOption);
		// extend from inline option ?
		var inlineoption = zBannerEl.getData('inlineoption', '');
		if(inlineoption == '')inlineoption = zBannerEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!=''){
			option = zjs.extend(option, inlineoption.jsonDecode());
			zBannerEl.setData('inlineoption', inlineoption);
		};
		// sau do remove di luon inline option luon, cho html ra dep
		zBannerEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// test keyframes
		if(!option.keyframes || !zjs.isObject(option.keyframes)){
			// thu co gang get keyframes mac dinh xem coi co khong
			if(window.keyframes && zjs.isObject(window.keyframes))
				option.keyframes = window.keyframes;
		};
		
		// save option
		zBannerEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// neu nhu khong co keyframes thi con lam duoc gi nua
		if(!option.keyframes || !zjs.isObject(option.keyframes))
			return;
			
		// tao ra 1 unique Keyframe name cho cai banner nay
		bannerautokeyframe = bannerautokeyframe + zjs.getUniqueId();
		
		// add class choi
		zBannerEl.addClass(zbannerclass);
		
		// get ra toan bo element
		var _zAllEls = zBannerEl.find('*'),
			zAllEls = [];
			
		// ghi nhan lai cai last timepoint
		var maxTimePoint = 0;
		
		// bay gio moi di thanh loc lai cac element nay, 
		// xem coi thang nao co keyframes thi moi duoc su dung
		_zAllEls.each(function(el){
			
			var zEl = zjs(el);
			
			// lap 1 vong trong keyframes, de xem coi cai element nay co duoc su dung hay khong
			for(var keyframeName in option.keyframes){
				
				// neu nhu keyframeName la 1 class trong element
				// thi chung to element nay se duoc su dung de transition
				if(zEl.hasClass(keyframeName)){
					
					// gio se di set keyframe cho cai thang element nay luon
					zEl.setKeyframes(bannerautokeyframe, option.keyframes[keyframeName]);
					
					// set data keyframe name vao, de giup cho editor chinh sua
					zEl.setData('keyframesName', keyframeName);
					
					// dong thoi bay gio se get ra xem coi cai keyframes
					// nao ma co time point cao nhat
					var _maxTimePoint = Math.max.apply(this, zjs.objectKeys(option.keyframes[keyframeName]));
					if(_maxTimePoint > maxTimePoint)
						maxTimePoint = _maxTimePoint;
					
					zAllEls.push(zEl);
					break;
				};
			
			};
		});
		
		
		// sau khi init xong thi bay gio moi tao ra 1 timer de ma chay thoi
		// nhung truoc do phai kiem tra cai thang max time point da
		// neu nhu ma bang voi 0 thi thua luon
		if(maxTimePoint <= 0)
			return;
		
		// bay gio moi tao ra timer ne
		var bannerTimer = zjs.timer({
			from: 0,
			to: maxTimePoint,
			time: option.ratio * maxTimePoint,
			transition: 0,
			onStart: function(from, to){
			},
			onProcess: function(current, from, to){
				zAllEls.each(function(zEl){
					zEl.setStyleByKeyframes(bannerautokeyframe, current);
				});
			},
			onStop: function(from, to){
			},
			onFinish: function(from, to){
				// co cho repeat hay khong?
				if(option.repeat)
					bannerTimer.run();
			}
		});
		
		// set cai banner timer nay vao element luon 
		zBannerEl.setData(timerkey, bannerTimer);
		
		// auto play luon ^^
		if(option.autoplay)
			bannerTimer.run();
	},
	
	playBanner = function(element){
		var zBannerEl = zjs(element),
			bannerTimer = zBannerEl.getData(timerkey, false);
		
		// neu nhu khong co bannerTimer
		// chung to day khong phai la mot zbanner
		if(!bannerTimer)return;
		
		bannerTimer.run();
	},
	
	stopBanner = function(element){
		var zBannerEl = zjs(element),
			bannerTimer = zBannerEl.getData(timerkey, false);
		
		// neu nhu khong co bannerTimer
		// chung to day khong phai la mot zbanner
		if(!bannerTimer)return;
		
		bannerTimer.stop();
	};
	
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeBanner: function(useroption){
			return this.each(function(element){makeBanner(element, useroption)});
		},
		playBanner: function(useroption){
			return this.each(function(element){playBanner(element)});
		},
		stopBanner: function(useroption){
			return this.each(function(element){stopBanner(element)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zbanner ko, neu nhu co thi se auto makeBanner luon
			zjs(el).find('.zbanner').makeBanner();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zbanner ko, neu nhu co thi se auto makeBanner luon
			if(zjs(el).hasClass('zbanner'))zjs(el).makeBanner();
			zjs(el).find('.zbanner').makeBanner();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zbanner').makeBanner();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('transition.banner');
});