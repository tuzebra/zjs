// MODULE UI FREEZEPANEL
zjs.require('ui', function(){
"use strict";

	var optionkey = 'zmoduleuifreezepaneloption',
		freezepanelparentwrap = 'zmoduleuifreezepanelparentwrap',
		freezepaneloverflowparentwrap = 'zmoduleuifreezepaneloverflowparentwrap',
		freezepanelbufferel = 'zmoduleuifreezepanelbufferel', 
		freezepaneldisableshowhidekey = 'zmoduleuifreezepaneldisableshowhide', 
		freezepaneldisablechangeheightbufferkey = 'zmoduleuifreezepaneldisablechangeheightbufferkey',
		freezepaneldisablehandlerkey = 'zmoduleuifreezepaneldisablehandlerkey',
		freezepanelalwayshowkey = 'zmoduleuifreezepanelalwayshow',
		scrollbarIdkey = 'zmodulescrollbarid',
		scrollbarOptionkey = 'zmodulescrollbaroption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiFreezepanelOption: {
			freeze: true,
			marginTop: 0,
			marginBottom: 0,
			disableOnDesktop: false,
			autoDisableWhenWidthLessThan: 0,
			autoDisableWhenWindowWidthLessThan: 0,
			overflowParent: 'auto',
			pendingScrollTime: 0,
			autoHideWhenReach: false,
			autoHideSpeed: 2000,
			autoHideDelay: 0,
			useHeightBuffer: true,
			excludeFromFreezingStack: false,
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
	
	var zWindowEl, zDocument, zBody;

	var isBodyScrollbarActive = function(){
		return !zBody.hasClass('zui-scrollbar-usedefault') && parseInt(zBody.getData(scrollbarIdkey,0))>0;
	};

	// this array store all freezepanel in page, with these "top" & "height"
	// [{el:obj, top:int, height:int, freezing:bool}, {},...]
	// window.allFreezepanelInPage = [];
	var allFreezepanelInPage = [];

	var findIndexOfFreezePanel = function(element){
		for(var i=0;i<allFreezepanelInPage.length;i++){
			if(allFreezepanelInPage[i].el === element){
				return i;
			}
		}
		return -1;
	}, 

	logFreeze = function(element, freezing, newTop){
		newTop = newTop || null;

		// find this element
		var i = findIndexOfFreezePanel(element);
		if(i < 0)return;

		allFreezepanelInPage[i].top = (newTop !== null ? newTop : zjs(element).top());
		allFreezepanelInPage[i].height = zjs(element).height();
		allFreezepanelInPage[i].freezing = freezing?1:0;
	},

	// calculate total height of all "freezing" panel
	calVisibleFreezingHeight = function(element){
		// console.log('calVisibleFreezingHeight', allFreezepanelInPage);
		var totalFreezingHeight = 0, i, tempVisibleHeight = 0;
		for(i=0;i<allFreezepanelInPage.length;i++){
			// fix index
			zjs(allFreezepanelInPage[i].el).setStyle('z-index', allFreezepanelInPage.length - i);
			if(allFreezepanelInPage[i].el === element)
				break;
			if(allFreezepanelInPage[i].exclude){
				continue;
			}
			if(allFreezepanelInPage[i].freezing){
				tempVisibleHeight = allFreezepanelInPage[i].top + allFreezepanelInPage[i].height;
				if(totalFreezingHeight < tempVisibleHeight)
					totalFreezingHeight = tempVisibleHeight;
			}
		}
		// console.log('totalFreezingHeight', totalFreezingHeight);
		return totalFreezingHeight;
	};

	var freezeFakePx = 0;

	// function help to get window scrollTop
	// it merge real scrollTop with fakeScrollTop
	// help to implement autoHideSpeed feature
	var getWindowScrollTop = function(){
		return zWindowEl.scrollTop()+freezeFakePx;
	},

	getAbsoluteTop = function(zEl){
		return zEl.getAbsoluteTop()+freezeFakePx;
	},
	
	makeFreezepanel = function(element, useroption){
		
		var zFreezepanelEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zFreezepanelEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zFreezepanelEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		}
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiFreezepanelOption);
		// extend from inline option ?
		var inlineoption = zFreezepanelEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zFreezepanelEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);

		// check option disable 
		if(option.disableOnDesktop && !zjs.isMobileDevice()){
			zFreezepanelEl.setData(optionkey, option);
			return this;
		}
		
		// fix option
		option.autoDisableWhenWidthLessThan = parseInt(option.autoDisableWhenWidthLessThan);
		if(option.autoDisableWhenWidthLessThan < 0)
			option.autoDisableWhenWidthLessThan = 0;
		option.autoDisableWhenWindowWidthLessThan = parseInt(option.autoDisableWhenWindowWidthLessThan);
		if(option.autoDisableWhenWindowWidthLessThan < 0)
			option.autoDisableWhenWindowWidthLessThan = 0;
		
		// fix handler method
		if(!(option.handlerFreezingMethod in handlerMethods))
			option.handlerFreezingMethod = 'meet-top';

		option.excludeFromFreezingStack = !!option.excludeFromFreezingStack;

		
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

		// find "auto hide when reach" element
		var  handlerAHWRElement = false;
		if(zjs.isString(option.autoHideWhenReach)){
			handlerAHWRElement = zjs(option.autoHideWhenReach);
			if(handlerAHWRElement.count() < 1){
				handlerAHWRElement = option.autoHideWhenReach = false;
			}else{
				handlerAHWRElement = handlerAHWRElement.item(0);
			}
		}else if(zjs.isNumeric(option.autoHideWhenReach)){
			handlerAHWRElement = {
				getAbsoluteTop: function(){
					return option.autoHideWhenReach;
				}
			}
		}

		// fix autoHideSpeed
		var autoHideTimer = false;
		option.autoHideSpeed = parseInt(option.autoHideSpeed, 10);
		option.autoHideDelay = parseInt(option.autoHideDelay, 10);
		if(isNaN(option.autoHideDelay) || option.autoHideDelay < 0){
			option.autoHideDelay = 0;
		}

		if(isNaN(option.autoHideSpeed) || option.autoHideSpeed < 0){
			option.autoHideSpeed = 0;
		}else{
			// hien tai chi support trong page co 1 cai panel auto hide ma thoi
			// neu co nhieu hon 2 cai panel auto hide thi se bi loi
			autoHideTimer = zjs.timer({
			 	from: 0,
				to: 0,
				time: option.autoHideSpeed, 
				// transition: 'quadratic', // linear, sinoidal, quadratic, cubic, elastic
				onStart: function(from, to){
					freezeFakePx = from;
					refreshAllfreezepanel();
				},
				onProcess: function(current, from, to){
					freezeFakePx = current;
					refreshAllfreezepanel();
				},
				// onStop: function(from, to){},
				onFinish: function(from, to){
					freezeFakePx = to;
					refreshAllfreezepanel();
				}
			 });
		}

		// save option
		zFreezepanelEl.setData(optionkey, option);

		// push to array to management later
		allFreezepanelInPage.push({
			el: element, 
			zEl: zFreezepanelEl,
			top: getAbsoluteTop(zFreezepanelEl), 
			height: 0, 
			freezing: 0,
			viewTop: 0,
			exclude: option.excludeFromFreezingStack
		});

		// console.log('allFreezepanelInPage', allFreezepanelInPage);
		allFreezepanelInPage.sort(function(a, b){
			if(a.el === b.el)return 0;
			if(!a.el.compareDocumentPosition){
				return a.el.sourceIndex - b.el.sourceIndex;
			}
			if(a.el.compareDocumentPosition(b.el) & 2){  // 2: DOCUMENT_POSITION_PRECEDING
				return 1;
			}
			return -1;
		});

		// get ra top
		zWindowEl = zWindowEl || zjs(window);
		zBody = zBody || zjs(document.body);
		zDocument = zDocument || zjs(document);
		var orgAnchorPosition = handlerMethod('getAnchorPosition', handlerElement),
			parentTop = 0,
			overflowParentTop = 0;
		var moduleIsReady = true,
			isEnable = true,
			enableAlwayShowEffect = false;


		if(zParentEl)
			parentTop = getAbsoluteTop(zParentEl);

		if(zOverflowParentEl)
			overflowParentTop = getAbsoluteTop(zOverflowParentEl);
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
		var zchemEl;
		
		// bien nay se luu lai trang thai
		var lastTopbtnsStt = false,
			autoresize = false,
			isPendingScroll = false;
		
		var lastLargestScrollTop = zFreezepanelEl.height();
		
		// ham xu ly freeze
		function freezeHandler(){

			if(!moduleIsReady)return;

			if(zFreezepanelEl.getData(freezepaneldisablehandlerkey)){
				return;
			}
			
			var _currentScrollTop;
			
			// if(zOverflowParentEl)
			if(windowScrollHandler){
				_currentScrollTop = isBodyScrollbarActive() ? zBody.scrollPosition() : getWindowScrollTop();
			}
			else{
				_currentScrollTop = zOverflowParentEl.getStyle('scrollTop');
			}
			var j = findIndexOfFreezePanel(element);
			var _currentViewTop = calVisibleFreezingHeight(element);
			
			// chuyen qua xu ly bang handler
			var hasNewTopbtnsStt = handlerMethod('checkActivate', handlerElement, option, {
				scrollTop: _currentScrollTop,
				viewTop: _currentViewTop, 
				orgAnchorPosition: orgAnchorPosition,
				parentEl: zParentEl,
				freezepanelEl: zFreezepanelEl
			});

			if(!isEnable){
				logFreeze(element, 0);

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
			if(hasNewTopbtnsStt === lastTopbtnsStt){

				var _freezepanelNewTop;

				// nhung truoc khi return thi se coi co phai la dang freezee khong
				if(zFreezepanelEl.hasClass(freezingclass)){
					
					// check thu height cua thang cha, va thang con
					// coi co nen thay doi top cua thang con (thang freeze) hay khong
					var parentHeight = zParentEl ? zParentEl.height() : zDocument.height(),
						height = zFreezepanelEl.height();

					var _AHWRTop = handlerAHWRElement ? getAbsoluteTop(handlerAHWRElement) : zDocument.height();

					parentTop = zParentEl ? getAbsoluteTop(zParentEl) : 0;
					if(!windowScrollHandler)
						parentTop-=getAbsoluteTop(zOverflowParentEl);

					var visibleTop = parentTop+parentHeight;
					// uu tien AHWRtop hon
					if(visibleTop > _AHWRTop){
						visibleTop = _AHWRTop;
					}

					
					// fix lai top cua freeze neu duoc
					if(zOverflowParentEl){
						if(windowScrollHandler){
							_freezepanelNewTop=_currentScrollTop+_currentViewTop-parentTop;
							if(_freezepanelNewTop + height > parentHeight)
								_freezepanelNewTop = parentHeight - height;
						}
						else {
							_freezepanelNewTop=_currentScrollTop+_currentViewTop;
							if(_freezepanelNewTop + height > parentHeight + parentTop)
								_freezepanelNewTop = parentHeight + parentTop - height;
						}
					}
					// truong hop binh thuong
					// khong phai la overflow freeze
					else{
						var maximumTop = visibleTop - option.marginBottom - height;
						if(  _currentScrollTop + _currentViewTop + option.marginTop > maximumTop ){
							_freezepanelNewTop = maximumTop - _currentScrollTop;
						}else {
							_freezepanelNewTop = _currentViewTop + option.marginTop;
						}
					}

					// them truong hop tu dong scroll up,
					// nen se xu ly cho nay
					if(handlerAHWRElement){

						// so keep the top don't be so small
						if(_freezepanelNewTop < -height){
							_freezepanelNewTop = -height;
						}

						var needToModifyTheTop = false;
						// backup the lasest scroll
						if(lastLargestScrollTop <= _currentScrollTop){
							lastLargestScrollTop = _currentScrollTop;
							needToModifyTheTop = false;
						}else{
							// it mean user start to scroll up again
							needToModifyTheTop = true;
						}

						if(needToModifyTheTop){
							var _diffScroll = (lastLargestScrollTop - _currentScrollTop);
							_freezepanelNewTop += _diffScroll;
							if(_freezepanelNewTop > 0){
								_freezepanelNewTop = 0;
								lastLargestScrollTop = _currentScrollTop + height;
							}
						}
					}

					// neu nhu dang co lenh bat phai luon luon show
					if(zFreezepanelEl.getData(freezepanelalwayshowkey)){
						_freezepanelNewTop = 0;
					}
					
					zFreezepanelEl.top(_freezepanelNewTop);
				}
				logFreeze(element, zFreezepanelEl.hasClass(freezingclass), _freezepanelNewTop);
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

				// truoc khi bien thanh freezing
				// backup top cua thang freeze nay cai da
				var _freezepanelAbsTop = zFreezepanelEl.getAbsoluteTop();

				// test xem coi co can thay doi width khi resize khong?
				// cho sai so trong vong 1px
				// autoresize = (!zOverflowParentEl && width == zFreezepanelEl.parent().width());
				autoresize = (Math.abs(width - zFreezepanelEl.parent().width())) <= 1;

				// co gan get ra margin top (trong css)
				// truoc khi chuyen sang dang freezing
				// boi vi khi freezing thi se khong co margin nua
				try{
					mgTop = zFreezepanelEl.getStyle('margin-top');
					mgBottom = zFreezepanelEl.getStyle('margin-bottom');
				}catch(e){}

				// show ra cai chem de giu dung chieu cao
				zchemEl = zjs('<div>');
				if(option.useHeightBuffer){
					zchemEl.insertBefore(zFreezepanelEl);
				}
				zchemEl.setStyle({
					'height': height,
					'margin-top': mgTop,
					'margin-bottom': mgBottom
				}).addClass(chemclass);
				zFreezepanelEl.setData(freezepanelbufferel, zchemEl);
				// fix lai height cua thang chem 1 lan nua
				(function(){
					if(zchemEl)zchemEl.height(zFreezepanelEl.height());
				}).delay(50);


				// console.log('_freezepanelAbsTop', );
				
				// sau do moi add class cho no thanh freeze
				// luu y cai option margin top nay khong phai la margin top trong css
				// option.marginTop co y nghia khac
				var _freezepanelNewTop = option.marginTop + _currentViewTop;
				if(zOverflowParentEl){
					if(!windowScrollHandler)
						_freezepanelNewTop+=_currentScrollTop+_currentViewTop;
					else 
						_freezepanelNewTop=_currentScrollTop+_currentViewTop-parentTop;
				}
				
				zFreezepanelEl.addClass(freezingclass);

				// need effect?
				if(enableAlwayShowEffect){
					enableAlwayShowEffect = false;
					zFreezepanelEl.top(_freezepanelAbsTop - _currentScrollTop);
					setTimeout(function(){
						zFreezepanelEl.top(_freezepanelNewTop);
					});
				}
				else{
					zFreezepanelEl.top(_freezepanelNewTop);
				}
				

				// fix width chinh xac luon (vi position da thanh fixed); 
				zFreezepanelEl.width(width);

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

			//@TODO: need to use variable instead of checking "hasClass"
		    // => for performance improvement
			logFreeze(element, zFreezepanelEl.hasClass(freezingclass));
		};
		
		var isStopingFreeze = false;

		function finishStopFreeze(){
			// make sure ham nay chi chay 1 lan thoi
			if(!isStopingFreeze)return;

			zFreezepanelEl.removeClass(freezingclass).top(null).width(null);
			if(zchemEl){
				zchemEl.remove();
			    zchemEl = null;
			}
			isStopingFreeze = false;
		}

		function stopFreeze(){
			autoresize = false;
			isStopingFreeze = true;
			
			// need effect?
			if(enableAlwayShowEffect && zchemEl){
				enableAlwayShowEffect = false;
				var _freezepanelAbsTop = zchemEl.getAbsoluteTop();
				var _currentScrollTop = isBodyScrollbarActive() ? zBody.scrollPosition() : getWindowScrollTop();
				zFreezepanelEl.top(_freezepanelAbsTop - _currentScrollTop);
				(function(){
					finishStopFreeze();
				}).delay(300);
			}
			// don't need effect
			else{
				finishStopFreeze();
			}
			
		    zFreezepanelEl.setData(freezepanelbufferel, null);
		};
		
		var disableFreeze = function(){
			if(!isEnable)return;
			// disable no thoi
			isEnable = false;
			lastTopbtnsStt = false;
			// neu nhu dang co class freezing thi remove thoi
			stopFreeze();
		};

		var enableFreeze = function(){
			if(isEnable)return;
			// truoc khi enable thi xem coi co dang stop freeze hay khong?
			// neu dang stop thi dut diem luon cho xong, roi moi enable len lai duoc
			if(isStopingFreeze){
				finishStopFreeze();
			}
			// enable len lai
			isEnable = true;
			lastTopbtnsStt = false;
			// hander no 1 phat
			freezeHandler();
		};

		var refreshpanel = function(){
			// xem coi co option auto hay khong?
			if(option.autoDisableWhenWidthLessThan > 0){
				// get ra cai width hien tai xem sao?
				var width = zFreezepanelEl.width();
				if(width <= option.autoDisableWhenWidthLessThan){
					disableFreeze();
				}else{
					enableFreeze();
				}
			}
			if(option.autoDisableWhenWindowWidthLessThan > 0){
				// get ra cai width hien tai xem sao?
				if(zWindowEl.width() <= option.autoDisableWhenWindowWidthLessThan){
					disableFreeze();
				}else{
					enableFreeze();
				}
			}
			
			// fix lai height cua thang chem
			var _topChem = 0;
			var disableChangeHeightBuffer = zFreezepanelEl.getData(freezepaneldisablechangeheightbufferkey);
			if(zchemEl){
				if(!disableChangeHeightBuffer){
					zchemEl.height(zFreezepanelEl.height());
				}
				_topChem = getAbsoluteTop(zchemEl);
			}
		
			// fix lai thang top
			if(zOverflowParentEl)
				overflowParentTop = getAbsoluteTop(zOverflowParentEl);
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
			// console.log('isBodyScrollbarActive');
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
			// window.fflog = function(){
				// console.log('freezeFakePx', freezeFakePx);
			// }
			// support autohidespeed
			var lastDeltaY = 0,
				lastScrollTop = 0;

			function autoHideHandlerScroll(){

				var isDisabled = zFreezepanelEl.getData(freezepaneldisableshowhidekey, false);
				if(isDisabled){
					// console.log('is disabled now');
					return;
				}

				var currentScrollTop = zWindowEl.scrollTop();

				var deltaY = (lastScrollTop - currentScrollTop);
				if(deltaY < 0)deltaY = -1;
				else if(deltaY > 0)deltaY = 1;

				lastScrollTop = currentScrollTop;
				// console.log('deltaY', deltaY, freezeFakePx);

				if(deltaY !== 0 && deltaY != lastDeltaY){
					// console.log('stop');
					autoHideTimer.stop();
					lastDeltaY = deltaY;
				}

				if(autoHideTimer.isRunning()){
					// console.log('autoHideTimer.isRunning');
					return;
				}

				var ph = zFreezepanelEl.height() * 2;
				// var ph = 120;
				// get ra real scrolltop
				// get ra real handlerAHWRElement top, 
				// tai vi day la can xac dinh that, khong phai bi thang fakedata kiem soat
				var diffAHWRvsST = handlerAHWRElement.getAbsoluteTop() - zWindowEl.scrollTop();
				// console.log(diffAHWRvsST);

				// chay len (hide)
				if(diffAHWRvsST <= 0 && deltaY < 0 && freezeFakePx < ph){
					// console.log('set hide, is running', autoHideTimer.isRunning());
					// neu nhu doi chieu dot ngot thi phai dung cai timer lai ngay

					if(!autoHideTimer.isRunning()){
						// console.log('start hide');
						autoHideTimer.set({
							// from: 0,
							from: freezeFakePx,
							to: ph
							// to: zFreezepanelEl.height()
						}).run();
					}
				}

				// chay xuong (show)
				if(diffAHWRvsST <= 0 && deltaY > 0 && freezeFakePx > 0){
					// neu nhu doi chieu dot ngot thi phai dung cai timer lai ngay
					if(deltaY != lastDeltaY){
						autoHideTimer.stop();
					}
					if(!autoHideTimer.isRunning()){
						// console.log('start show');
						autoHideTimer.set({
							// from: zFreezepanelEl.height(),
							from: freezeFakePx,
							to: 0
						}).run();
					}
				}
			}

			zWindowEl.on('scroll', function(event){
				if(isPendingScroll)return;
				if(isBodyScrollbarActive())return;
				// neu nhu zscroll-body quay ve default tu som, thi phai cho module ready thoi
				if(!moduleIsReady && zjs(document.body).hasClass('zui-scrollbar-usedefault'))
					moduleIsReady = true;
				freezeHandler();

				if(option.autoHideSpeed <= 0 || !handlerAHWRElement){
					return;
				}

				//zWindowEl.on('mousewheel', function(event){
				
				// console.log(event.getDeltaY());
				// var deltaY = event.getDeltaY();
				if(option.autoHideDelay > 0){
					autoHideHandlerScroll.delay(option.autoHideDelay);
				}
				else{
					autoHideHandlerScroll();
				}
			});
		}
		
		// first run de no se fix freeze ngay va luon
		if(option.freeze){
			freezeHandler();
			// trigger resize 1 phat
			//zWindowEl.trigger('resize');
		}
		// disable freeze by default?
		else{
			disableFreeze();
			// bind event
			zFreezepanelEl.on('trigger:enablefreeze', function(event){
				enableAlwayShowEffect = (event.getData() && event.getData().effect);
				enableFreeze();
			});
			zFreezepanelEl.on('trigger:disablefreeze', function(event){
				enableAlwayShowEffect = (event.getData() && event.getData().effect);
				disableFreeze();
			});
		}
		
		// xong het roi thi run trigger thoi
		zFreezepanelEl.trigger('ui:freezepanel:load');
	};

	var freezepanelRefresh = function(element){
		// var zFreezepanelEl = zjs(element);
		zjs(element).trigger('trigger:refreshpanel');
	};

	var refreshAllfreezepanel = function(){
		allFreezepanelInPage.map(function(_o){
			_o.zEl.trigger('trigger:refreshpanel');
		});
	};

	var freezepanelDisableAutoShowHide = function(element, trueFalse){
		zjs(element).setData(freezepaneldisableshowhidekey, trueFalse);
	};

	var freezepanelAlwayShow = function(element, trueFalse){
		var zFreezepanelEl = zjs(element);
		var option = zFreezepanelEl.getData(optionkey);
		zFreezepanelEl.setData(freezepaneldisableshowhidekey, trueFalse);
		zFreezepanelEl.setData(freezepanelalwayshowkey, trueFalse);
		
		// truong hop bi disable by default, thi khi muon alway show, thi phai active len truoc da
		if(!option.freeze){
			// console.log('option.freeze', option.freeze);
			if(trueFalse){
				zFreezepanelEl.trigger('trigger:enablefreeze', {effect: true});
			}
			else{
				zFreezepanelEl.trigger('trigger:disablefreeze', {effect: true});
			}
		}
		else{
			// refresh luon de apply ngay
			freezepanelRefresh(element);
		}
	};

	var freezepanelDisableChangeHeightBuffer = function(element, trueFalse){
		zjs(element).setData(freezepaneldisablechangeheightbufferkey, trueFalse);
	};

	var freezepanelDisableHandler = function(element, trueFalse){
		zjs(element).setData(freezepaneldisablehandlerkey, trueFalse);
	};


	// HANDLER METHOD
	// >>>>>>>>>>>>>>>>>>>>>>>
	var handlerMethods = {
		'meet-top': function(command, handlerElement, option, data){
			
			if(command == 'getAnchorPosition'){
				return getAbsoluteTop(handlerElement);
			}

			if(command == 'getAnchorPositionWhenActivated'){
				return option.handlerFreezingElement ? 
					getAbsoluteTop(handlerElement) : 
					data.estimateOrgTop;
			}

			if(command == 'checkActivate'){

				// neu nhu co thang parent, ma height cua parent qua nho
				// thi thoi khong freezing gi ca
				if(data.parentEl){
					if(data.freezepanelEl.height() >= data.parentEl.height())
						return false;
				}

				// var active = 
				return (data.scrollTop + data.viewTop >= data.orgAnchorPosition - option.marginTop);
				// console.log('checkActivate: data.scrollTop', data.scrollTop, 'data.orgAnchorPosition', data.orgAnchorPosition, 'option.marginTop', option.marginTop);
				// return active;
			}
		},
		'scroll-over': function(command, handlerElement, option, data){
			
			if(command == 'getAnchorPosition'){
				return getAbsoluteTop(handlerElement) + handlerElement.height();
			}

			if(command == 'getAnchorPositionWhenActivated'){
				return option.handlerFreezingElement ? 
					getAbsoluteTop(handlerElement) + handlerElement.height() : 
					data.estimateOrgTop + handlerElement.height();
			}

			if(command == 'checkActivate'){
				return (data.scrollTop + data.viewTop >= data.orgAnchorPosition);
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
					return getAbsoluteTop(zFreezepanelEl);

				return getAbsoluteTop(zFreezepanelEl) + freezepanelGetOATop(getType, parent);
			}

			return getAbsoluteTop(zFreezepanelEl);
		}

		// this is freeze element, but not freezing yet
		if(!zFreezepanelEl.hasClass(freezingclass))
			return getAbsoluteTop(zFreezepanelEl);

		var zchemEl = zFreezepanelEl.getData(freezepanelbufferel, null);

		// start get the top
		if(getType == 'original')
			return zchemEl ? getAbsoluteTop(zchemEl) : getAbsoluteTop(zFreezepanelEl);

		// if original == 'absolute'
		var freezingTop = getAbsoluteTop(zFreezepanelEl),
			currentScrollTop = currentScrollTop = isBodyScrollbarActive() ? zBody.scrollPosition() : getWindowScrollTop();
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
		},
		freezepanelRefresh: function(){
			return this.eachElement(function(element){freezepanelRefresh(element)});
		},
		freezepanelDisableAutoShowHide: function(trueFalse){
			return this.eachElement(function(element){freezepanelDisableAutoShowHide(element, trueFalse)});
		},
		freezepanelAlwayShow: function(trueFalse){
			return this.eachElement(function(element){freezepanelAlwayShow(element, trueFalse)});
		},
		freezepanelDisableChangeHeightBuffer: function(trueFalse){
			return this.eachElement(function(element){freezepanelDisableChangeHeightBuffer(element, trueFalse)});
		},
		freezepanelDisableHandler: function(trueFalse){
			return this.eachElement(function(element){freezepanelDisableHandler(element, trueFalse)});
		}
	});
	// EXTEND CORE METHOD 
	zjs.extendCore({
		freezepanelGetVisibleFreezingHeight: function(){
			return calVisibleFreezingHeight(window);
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