// MODULE UI FREEZEPANEL
zjs.require('ui', function(){
"use strict";

	var optionkey = 'zmoduleuifreezepaneloption',
		freezepanelparentwrap = 'zmoduleuifreezepanelparentwrap',
		freezepaneloverflowparentwrap = 'zmoduleuifreezepaneloverflowparentwrap',
		freezepanelbufferel = 'zmoduleuifreezepanelbufferel', 
		scrollbarIdkey = 'zmodulescrollbarid',
		scrollbarOptionkey = 'zmodulescrollbaroption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiFreezepanelOption: {
			marginTop: 0,
			marginBottom: 0,
			autoDisableWhenWidthLessThan: 0,
			overflowParent: 'auto',
			pendingScrollTime: 0,
			handlerFreezingElement: false, // false mean: self,	
			handlerFreezingMethod: 'meet-top' // scroll-over
		}
	});

	
	// trigger
	//ui:freezepanel:load
	//trigger:refreshpanel
	
	// class
	//zfreezepanel
	//zfreezepanelwrap
	
	// template
	var freezepanelclass = 'zui-freezepanel',
		freezepaneloverlowclass = 'zui-freeze-absolute',
		freezingclass = 'zui-freezing',
		overflowparentclass = 'zui-freezepanel-scroll-wrap',
		chemclass = 'zui-freezepanel-height-buffer';
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var zWindowEl, zBody;

	var isBodyScrollbarActive = function(){
		return !zBody.hasClass('zui-scrollbar-usedefault') && parseInt(zBody.getData(scrollbarIdkey,0))>0;
	};
	
	var makeFreezepanel = function(element, useroption){
		
		var zFreezepanelEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zFreezepanelEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zFreezepanelEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiFreezepanelOption);
		// extend from inline option ?
		var inlineoption = zFreezepanelEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option
		option.autoDisableWhenWidthLessThan = parseInt(option.autoDisableWhenWidthLessThan);
		if(option.autoDisableWhenWidthLessThan < 0)
			option.autoDisableWhenWidthLessThan = 0;
		
		// fix handler method
		if(!(option.handlerFreezingMethod in handlerMethods))
			option.handlerFreezingMethod = 'meet-top';

		// save option
		// zFreezepanelEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// dau tien la se truy tim cac thang cha cua no
		// de xem co thang nao gan class freezepanelparentwrap hay khong
		// de ma minh biet minh xu ly
		var	zParentEl = false, zOverflowParentEl = false,
			_tempParentEl = element,
			finishFindParentEl = false,
			finishFindOverflowParentEl = false;
		var windowScrollHandler = true;
		while(_tempParentEl){
			_tempParentEl = _tempParentEl.parentNode;
			// neu vao toi body roi thi thoi, break luon, coi nhu khong co
			if(_tempParentEl == document.body || _tempParentEl == document){_tempParentEl = false;break;}
			// kiem tra thu coi co class khong, co thi cung break luon
			if(!finishFindParentEl && zjs(_tempParentEl).hasClass('zfreezepanelwrap')){
				finishFindParentEl = true;
				zParentEl = zjs(_tempParentEl);
				// ok save lai de ty nua truy xuat
				zFreezepanelEl.setData(freezepanelparentwrap, zParentEl);
			}
			// neu nhu ma option overflow parent la auto thi moi can phai tu dong tim
			if(option.overflowParent == 'auto' && !finishFindOverflowParentEl){
				// test xem coi cai overflow la sao?
				var overflowValue = zjs(_tempParentEl).getStyle('overflow');
				if(overflowValue === 'auto' || overflowValue === 'scroll'){
					zOverflowParentEl = zjs(_tempParentEl);
					zOverflowParentEl.addClass(overflowparentclass);
					zFreezepanelEl.setData(freezepaneloverflowparentwrap, zOverflowParentEl).addClass(freezepaneloverlowclass);
					finishFindOverflowParentEl = true;
					overflowValue = zOverflowParentEl.getStyle('overflow-y');
					if(overflowValue === 'auto' || overflowValue === 'scroll')
						windowScrollHandler = false;
				}
			}
		}

		// add class vao cho freeze panel
		zFreezepanelEl.addClass(freezepanelclass);

		// find handler method
		var handlerMethod = handlerMethods[option.handlerFreezingMethod];
		// find handler element
		var handlerElement = (!option.handlerFreezingElement) ? zFreezepanelEl : zjs(option.handlerFreezingElement);
		// test to fix handler method
		if(handlerElement.item(0, true) === zFreezepanelEl.item(0, true)){
			if(option.handlerFreezingMethod == 'scroll-over'){
				option.handlerFreezingMethod = 'meet-top';
				option.handlerFreezingElement = false;
				handlerMethod = handlerMethods[option.handlerFreezingMethod];
			}
		}

		// save option
		zFreezepanelEl.setData(optionkey, option);

		// get ra top
		zWindowEl = zWindowEl || zjs(window);
		zBody = zBody || zjs(document.body);
		var orgAnchorPosition = handlerMethod('getAnchorPosition', handlerElement),
			parentTop = 0,
			overflowParentTop = 0;
		var moduleIsReady = true,
			isEnable = true;


		if(zParentEl)
			parentTop = zParentEl.getAbsoluteTop();

		if(zOverflowParentEl)
			overflowParentTop = zOverflowParentEl.getAbsoluteTop();
		if(!windowScrollHandler){	
			orgAnchorPosition-=overflowParentTop;
			parentTop-=overflowParentTop;
		}else if(isBodyScrollbarActive()){
			moduleIsReady = false;
			zBody.on('scrollbar:ready', function(){
				orgAnchorPosition = handlerMethod('getAnchorPosition', handlerElement);
				moduleIsReady = true;
			});
		}
		
		// tao ra 1 cai element chen vao giua
		var zchemEl = zjs('<div>').insertBefore(zFreezepanelEl).hide();
		zchemEl.addClass(chemclass);
		zFreezepanelEl.setData(freezepanelbufferel, zchemEl);
		//
		
		// bien nay se luu lai trang thai
		var lastTopbtnsStt = false,
			autoresize = false,
			isPendingScroll = false;
		//var trackingVariables = handlerMethod('initTrackingVariables', handlerElement);
		
		// ham xu ly freeze
		function freezeHandler(){

			if(!moduleIsReady)return;
			
			var _currentScrollTop;
			// if(zOverflowParentEl)
			if(windowScrollHandler)
				_currentScrollTop = isBodyScrollbarActive() ? zBody.scrollPosition() : zWindowEl.scrollTop();
			else  
				_currentScrollTop = zOverflowParentEl.getStyle('scrollTop');

			// chuyen qua xu ly bang handler
			var hasNewTopbtnsStt = handlerMethod('checkActivate', handlerElement, option, {
				scrollTop: _currentScrollTop,
				orgAnchorPosition: orgAnchorPosition
			});

			if(!isEnable){
				// tuy khong cho can thiep qua sau
				// nhung van can phai tracking lai
				if(hasNewTopbtnsStt == lastTopbtnsStt)
					return;
				
				lastTopbtnsStt = hasNewTopbtnsStt;
				return;
			}
			
			// support scrollbar = css luon
			if(windowScrollHandler && isBodyScrollbarActive()){
				var scrollbarOption = zBody.getData(scrollbarOptionkey);
				if(scrollbarOption && scrollbarOption.usecss){
					if(zFreezepanelEl.hasClass(freezingclass))
						zFreezepanelEl.item(0,true).style.webkitTransform = 'translate3d(0, '+_currentScrollTop+'px, 0)';
					else
						zFreezepanelEl.item(0,true).style.webkitTransform = 'none';
				}
			}
			
			// neu nhu trang thai van nhu cu thi thoi
			if(hasNewTopbtnsStt == lastTopbtnsStt){
				// nhung truoc khi return thi se coi co phai la dang freezee khong
				if(zParentEl && zFreezepanelEl.hasClass(freezingclass)){
					// check thu height cua thang cha, va thang con
					// coi co nen thay doi top cua thang con (thang freeze) hay khong
					var parentHeight = 	zParentEl.height(),
						height = zFreezepanelEl.height();
					parentTop = zParentEl.getAbsoluteTop();
					if(!windowScrollHandler)
						parentTop-=zOverflowParentEl.getAbsoluteTop();
					var _freezepanelNewTop;
					// fix lai top cua freeze neu duoc
					if(zOverflowParentEl){
						if(windowScrollHandler){
							_freezepanelNewTop=_currentScrollTop-parentTop;
							if(_freezepanelNewTop + height > parentHeight)
								_freezepanelNewTop = parentHeight - height;
						}
						else {
							_freezepanelNewTop=_currentScrollTop;
							if(_freezepanelNewTop + height > parentHeight + parentTop)
								_freezepanelNewTop = parentHeight + parentTop - height;
						}
					}else{
						var maximumTop = parentTop + parentHeight - option.marginBottom - height;
						if(  _currentScrollTop + option.marginTop > maximumTop )
							_freezepanelNewTop = maximumTop - _currentScrollTop;
						else 
							_freezepanelNewTop = option.marginTop;
					}
					
					zFreezepanelEl.top(_freezepanelNewTop);
				}
				return;
			}

			// neu nhu trang thai thay doi
			// thi moi bat dau freezing thoi
			if(lastTopbtnsStt = hasNewTopbtnsStt){
				// get ra size
				var width = zFreezepanelEl.width(),
					height = zFreezepanelEl.height(),
					mgTop = 0,
					mgBottom = 0;

				// co gan get ra margin top (trong css)
				// truoc khi chuyen sang dang freezing
				// boi vi khi freezing thi se khong co margin nua
				try{
					mgTop = zFreezepanelEl.getStyle('margin-top');
					mgBottom = zFreezepanelEl.getStyle('margin-bottom');
				}catch(e){}
				
				// sau do moi add class cho no thanh freeze
				// luu y cai option margin top nay khong phai la margin top trong css
				// option.marginTop co y nghia khac
				var _freezepanelNewTop = option.marginTop;
				if(zOverflowParentEl){
					if(!windowScrollHandler)
						_freezepanelNewTop+=_currentScrollTop;
					else 
						_freezepanelNewTop=_currentScrollTop-parentTop;
				}
				
				zFreezepanelEl.addClass(freezingclass).top(_freezepanelNewTop);
				zchemEl.addClass(freezingclass);

				// fix width chinh xac luon (vi position da thanh fixed); 
				zFreezepanelEl.width(width);
				
				// show ra cai chem de giu dung chieu cao
				zchemEl.setStyle({
					'height': height,
					'margin-top': mgTop,
					'margin-bottom': mgBottom
				}).show();
				// fix lai height cua thang chem 1 lan nua
				(function(){
					zchemEl.height(zFreezepanelEl.height());
				}).delay(50);
				
				
				// test xem coi co can thay doi width khi resize khong?
				// if(!zOverflowParentEl && width == zFreezepanelEl.parent().width()){
				if(width == zFreezepanelEl.parent().width()){
					// truong hop thang nay (freeze) va thang parent bang width voi nhau
					// thi hen xui la width 100%
					// nen active auto resize
					autoresize = true;
				};

				// stop handler scroll
				if(option.pendingScrollTime > 0){
					isPendingScroll = true;
					(function(){
						isPendingScroll = false;
					}).delay(option.pendingScrollTime);
				}
				
			// khong freeze nua	
			}else{
				stopFreeze();
			}
		}
		
		function stopFreeze(){
			zFreezepanelEl.removeClass(freezingclass).top('auto').width('auto');
			zchemEl.removeClass(freezingclass).hide();
		}
		
		
		var refreshpanel = function(){
			// xem coi co option auto hay khong?
			if(option.autoDisableWhenWidthLessThan > 0){
				// get ra cai width hien tai xem sao?
				var width = zFreezepanelEl.width();
				if(width <= option.autoDisableWhenWidthLessThan){
					// disable no thoi
					isEnable = false;
					lastTopbtnsStt = false;
					// neu nhu dang co class freezing thi remove thoi
					stopFreeze();
				}else{
					// enable len lai
					isEnable = true;
					// hander no 1 phat
					freezeHandler();
				}
			}
			
			// fix lai height cua thang chem
			zchemEl.height(zFreezepanelEl.height());
		
			// fix lai thang top
			var _topChem = zchemEl.getAbsoluteTop();


			if(zOverflowParentEl)
				overflowParentTop = zOverflowParentEl.getAbsoluteTop();
			if(!windowScrollHandler){	
				orgAnchorPosition-=overflowParentTop;
				parentTop-=overflowParentTop;
			}else if(isBodyScrollbarActive()){
				//
			}else{
				if(_topChem != 0 && isEnable && zFreezepanelEl.hasClass(freezingclass)){
					orgAnchorPosition = handlerMethod('getAnchorPositionWhenActivated', handlerElement, option, {
						estimateOrgTop: _topChem
					});
				}else{
					orgAnchorPosition = handlerMethod('getAnchorPosition', handlerElement);
				}
			}
			
			freezeHandler();
			
			if(!autoresize)return;
			zFreezepanelEl.width(zFreezepanelEl.parent().width());
		};
		
		zFreezepanelEl.on('trigger:refreshpanel', refreshpanel);
		zWindowEl.on('resize', function(){refreshpanel.delay(100)});
		
		// sau do bind event window scroll
		// se support scrollbar luon
		if(isBodyScrollbarActive()){
			console.log('isBodyScrollbarActive');
			zBody.on('scrollbar:scroll', function(){freezeHandler()});
		}
		
		// xem coi cai freezepanel nay se stick vao window hay la vao element
		// xu ly phu hop cho tung truong hop
		if(!windowScrollHandler){
			zOverflowParentEl.on('scroll', freezeHandler);
		}
		else{
			if(option.pendingScrollTime > 0){
				zWindowEl.on('mousewheel', function(event){
					if(!isPendingScroll)return;
					event.stopPropagation();
					event.preventDefault();
				});
			}
			zWindowEl.on('scroll', function(event){
				if(isPendingScroll)return;
				if(isBodyScrollbarActive())return;
				// neu nhu zscroll-body quay ve default tu som, thi phai cho module ready thoi
				if(!moduleIsReady && zjs(document.body).hasClass('zui-scrollbar-usedefault'))
					moduleIsReady = true;
				freezeHandler();
			});
		}
		
		
		// first run de no se fix freeze ngay va luon
		freezeHandler();
		// trigger resize 1 phat
		//zWindowEl.trigger('resize');
		
		// xong het roi thi run trigger thoi
		zFreezepanelEl.trigger('ui:freezepanel:load');
	};


	// HANDLER METHOD
	// >>>>>>>>>>>>>>>>>>>>>>>
	var handlerMethods = {
		'meet-top': function(command, handlerElement, option, data){
			
			if(command == 'getAnchorPosition'){
				return handlerElement.getAbsoluteTop();
			}

			if(command == 'getAnchorPositionWhenActivated'){
				return option.handlerFreezingElement ? 
					handlerElement.getAbsoluteTop() : 
					data.estimateOrgTop;
			}

			if(command == 'checkActivate'){
				// var active = 
				return (data.scrollTop > data.orgAnchorPosition - option.marginTop);
				// console.log('checkActivate: data.scrollTop', data.scrollTop, 'data.orgAnchorPosition', data.orgAnchorPosition, 'option.marginTop', option.marginTop);
				// return active;
			}
		},
		'scroll-over': function(command, handlerElement, option, data){
			
			if(command == 'getAnchorPosition'){
				return handlerElement.getAbsoluteTop() + handlerElement.height();
			}

			if(command == 'getAnchorPositionWhenActivated'){
				return option.handlerFreezingElement ? 
					handlerElement.getAbsoluteTop() + handlerElement.height() : 
					data.estimateOrgTop + handlerElement.height();
			}

			if(command == 'checkActivate'){
				return (data.scrollTop > data.orgAnchorPosition);
			}
		}
	};
	

	// helper method
	var freezepanelGetOATop = function(getType, element){
		var zFreezepanelEl = zjs(element),
			option = zFreezepanelEl.getData(optionkey);

		// if dont have option => this element is not a freeze element
		// we need to make sure if this element is inside an freeze element or not
		if(!option){
			var isInsideFreezepanel = false, zParentEl, parent = zFreezepanelEl.parent(true).item(0,true);
			while(parent && parent != document.body){
				zParentEl = zjs(parent);
				if(zParentEl.getData(optionkey)){
					isInsideFreezepanel = true;
					break;
				}
				parent = zParentEl.parent(true).item(0,true);
			}
			if(isInsideFreezepanel){

				// check to see if this parent (freeze element) is freezing or not?
				// if not freezing, dont care
				if(!zParentEl.hasClass(freezingclass))
					return zFreezepanelEl.getAbsoluteTop();

				return zFreezepanelEl.getAbsoluteTop() + freezepanelGetOATop(getType, parent);
			}

			return zFreezepanelEl.getAbsoluteTop();
		}

		// this is freeze element, but not freezing yet
		if(!zFreezepanelEl.hasClass(freezingclass))
			return zFreezepanelEl.getAbsoluteTop();

		var zchemEl = zFreezepanelEl.getData(freezepanelbufferel);

		// start get the top
		if(getType == 'original')
			return zchemEl ? zchemEl.getAbsoluteTop() : zFreezepanelEl.getAbsoluteTop();

		// if original == 'absolute'
		var freezingTop = zFreezepanelEl.getAbsoluteTop(),
			currentScrollTop = currentScrollTop = isBodyScrollbarActive() ? zBody.scrollPosition() : zWindowEl.scrollTop();
		return currentScrollTop + freezingTop;
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeFreezepanel: function(useroption){
			return this.eachElement(function(element){makeFreezepanel(element, useroption)});
		},
		freezepanelGetOriginalTop: function(){
			return freezepanelGetOATop('original', this.item(0));
		},
		freezepanelGetAbsoluteTop: function(){
			return freezepanelGetOATop('absolute', this.item(0));
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zfreezepanel ko, neu nhu co thi se auto makeFreezepanel luon
			zjs(el).find('.zfreezepanel').makeFreezepanel();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zfreezepanel ko, neu nhu co thi se auto makeFreezepanel luon
			if(zjs(el).hasClass('zfreezepanel'))zjs(el).makeFreezepanel();
			zjs(el).find('.zfreezepanel').makeFreezepanel();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zfreezepanel').makeFreezepanel();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.freezepanel');
});