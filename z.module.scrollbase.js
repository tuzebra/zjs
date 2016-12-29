// extend module Scrollbar cho zjs
;(function(zjs){
//"use strict";
	
	var idkey = 'zmodulescrollbarid',
		optionkey = 'zmodulescrollbaroption',
		containerElkey = 'zmodulescrollbarcontainerel',
		listFunctionsKey = 'zmodulescrollbarfunctions',
		snapPositionsKey = 'zmodulescrollbarsnappositions',
		globalscrollid = 1;
	
	// extend core de biet la da support scrollbar
	zjs.extendCore({
		moduleScrollbar: true,
		moduleScrollbarOption: {
			// neu khong co' width, height 
			// thi` se~ lay' kich' thuoc' hien. tai.
			width: 0,
			height: 0,
			innerWidth: 0,
			innerHeight: 0,
			horizontal: false,
			scrollline: 200, // so' px trong 1 lan` di chuyen?
			scrolllinetouchpad: 40, // so' px trong 1 lan` di chuyen? neu move = touchpad
			scrolltime: 800, // thoi` gian thuc. hien. hieu. ung' scroll-smooth
			usecss: true, // use css3 transition for smooth
			smooth: true, // allow scroll smooth ?
			bounce: true, // bounce scrollbar ?
			usekey: true, // use Up & Down key to move scrollbar ?
			usemouse: true, // use mouse to move scrollbar ?
			usetouch: true, // user touch?
			shadow: true, // show top-shadow ?
			autohide: true, // auto hide scrollbar ?
			alwayshide: false, // never show scrollbar?
			transition: 2, // transition function
			snapElements: '', // automatic snap scrollbar by elements position ?
			snapPositions: [], // snap scrollbar at positions?
			skipSnapWhenUseTouchpad: false, // skip using snap position when use touchpad
			useinteger: false, // used scroll position by integer number
			autorefresh: false, // auto refresh to fix scrollbar size?
			autorefreshtime: 1000,
			customCssClass: '', // css
			customStyleContainer: '',
			onResize: function(scrollTop, width, height){},
			onScroll: function(scrollTop, width, height){},
			// debug
			debug: false
		}
	});
	
	// class
	// .zscroll
	// .zscrollnotinclude
	
	// trigger
	//scrollbar.scroll
	//scrollbar.windowResize
	
	// template
	var _scrollbarHtml = '<div class="zui-scrollbar-wrap"><div class="zui-scrollbar"></div></div>',
		_shadowHtml = '<div class="zui-scrollbar-shadow"></div>';
	
	
	// main function
	var makeScrollbar = function(element, useroption){

		// LUU Y: content Element tuc la element goc
		// element nay dang chua content (html)
		// va muon bien no thanh 1 element scrollable
		// thi minh se tao ra 1 element moi
		// goi la container element, va element nay
		// se bao phu thang content element
		// cho nen content element se luu lai 1 reference 
		// den container de co gi thi con thao tac tren container
		var contentElement = zjs(element);
		
		// test xem scrollbar da duoc khoi tao truoc do chua?
		// neu nhu da duoc khoi tao truoc do roi thi
		// se refresh lai cac thong so cua scroll
		if(parseInt(contentElement.getData(idkey,0))>0){
			contentElement.refreshScroll();
			return;
		};
		
		// set uniqueid
		contentElement.setData(idkey, globalscrollid++);
		
		// copy option tu default option
		var option = zjs.clone(zjs.moduleScrollbarOption);
		
		// extend from inline option ?
		var inlineoption = contentElement.getData('inlineoption', '');
		if(inlineoption == '')inlineoption = contentElement.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!=''){
			option = zjs.extend(option, inlineoption.jsonDecode());
			contentElement.setData('inlineoption', inlineoption);
		};
		// sau do remove di luon inline option luon, cho html ra dep
		contentElement.removeAttr('data-option');

		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option
		if(option.horizontal)option.shadow = false;
		
		// save option
		contentElement.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		
		// bat dau khai bao
		var	scrollbarWrapElement = option.alwayshide ? false : zjs(_scrollbarHtml),
			scrollbarElement = option.alwayshide ? false : scrollbarWrapElement.find('.zui-scrollbar'),
			
			containerRealWidth = contentElement.width(),
			containerRealHeight = contentElement.height();
		// fix real width, tai vi neu co box-sizing thi phien
		try{if(contentElement.style('box-sizing') == 'border-box'){
			containerRealWidth -= (contentElement.style('border-left', true) + contentElement.style('border-right', true));
			containerRealHeight -= (contentElement.style('border-top', true) + contentElement.style('border-bottom', true));
		}}catch(err){};
			
			
			// dimension cua container thuong thi 
			// se nho hon cua thang content (thang con ben trong)
		var containerWidth = (option.width || containerRealWidth),
			containerHeight = (option.height || containerRealHeight),
			
			contentWidth = 0,
			contentHeight = 0,
			scrollbarWidth = 0,
			scrollbarHeight = 0,
			
			pauseEvent = false,
			windowEl = false;
		
		
		
		// mot bien flag de xem coi day la body scroll hay la div scroll
		var isBodyScroll = (element==window.document.body);
		
		// mot bien flag de xem coi co stop lai autorefresh event hay khong
		// boi vi trong luc dang scroll thi ko the cho xay ra call autorefresh
		// duoc, vi autorefresh lai goi nguoc lai ham scroll
		var stopAutorefresh = false;
		
		// neu nhu la body thi se phai
		// tao ra 1 thang div content element moi
		// sau do copy toan bo noi dung cua body
		// bo vao trong div moi nay
		if(isBodyScroll){
			// hien tai content element dang la body
			// nen se fix style cho thang body
			contentElement.style('overflow', 'hidden');
			// replace content Element
			contentElement = zjs('<div></div>');
			// bay gio phai tao ra 1 cai bien moi
			var bodyElement = zjs(element);
			// phai copy toan bo child cua body vao 1 cai moi
			bodyElement.child().each(function(el){if(!zjs(el).hasClass('zscrollnotinclude'))contentElement.append(el)});
			// create windowEl de ma get width, height
			windowEl = zjs(window);
			containerWidth = windowEl.width();
			containerHeight = windowEl.height();
			
			// fix cho window scroll ve vi tri 0,0 luon
			window.scrollTo(0, 0);
		};
		
		// mot bien flag de xem day la dung webkit transform hay khong
		var webkitTransform = option.usecss && ('webkitTransform' in document.createElement('div').style),
			contentRealElement = contentElement.item(0,true),
			scrollbarRealElement = (scrollbarElement ? scrollbarElement.item(0,true) : false),
			contentElementPosition = 0, 
			scrollbarElementPosition = 0;
		
		// get ra cac snap positions
		scrollbarRefreshSnapPositions(element);

		// --
		
		// neu nhu la dung webkit transform thi setup translate3d truoc
		if(webkitTransform){
			contentRealElement.style.webkitTransform = 'translate3d(0, 0, 0)';
			if(scrollbarRealElement)
			scrollbarRealElement.style.webkitTransform = 'translate3d(0, 0, 0)';
		};
		
		// ham nay se lay position hien tai cua contentElement
		var scrollPosition = function(){
			if(webkitTransform)return contentElementPosition;
			if(option.horizontal)return contentElement.left();
			return contentElement.top();
		};
		
		// tao ra 1 cai container Element de chua moi thu
		var containerElement = zjs('<div></div>');
		// tim vi tri dat thang container cho hop ly
		if(isBodyScroll)containerElement.appendTo(element);
		else containerElement.insertBefore(element);
		// set style cho thang container cho hop ly
		containerElement.addClass(option.customCssClass).style({position:'relative', overflow:'hidden', width:containerWidth, height:containerHeight});
		if(isBodyScroll)containerElement.style({position:'fixed','z-index':1});
		containerElement.addClass(option.horizontal?'zui-scrollbar-horizontal':'zui-scrollbar-vertical');
		
		// sau do append content vao container
		containerElement.append(contentElement);
		
		// fix style cho content element	
		contentElement.style({position:'absolute', left:0, top:0, overflow:'visible'});
		if(option.horizontal)contentElement.style({width:'auto', height:containerHeight});
		else contentElement.style({height:'auto', width:containerWidth});
		
		if(option.innerWidth && !isNaN(option.innerWidth))contentElement.width(option.innerWidth);
		if(option.innerHeight && !isNaN(option.innerHeight))contentElement.height(option.innerHeight);
		
		// style cho scrollbar wrapper
		if(!option.alwayshide){
			containerElement.append(scrollbarWrapElement);
			scrollbarWrapElement.style({position:'absolute', opacity:option.autohide?0:1, display:option.alwayshide?'none':'block'});
			if(option.horizontal)scrollbarWrapElement.width(containerWidth);
			else scrollbarWrapElement.height(containerHeight);
			scrollbarElement.style('position','absolute');
		};
		
		// function fic container size
		function fixContainerSize(){
			// neu la body scroll thi lam khac 1 ty
			if(isBodyScroll){
				containerElement.height(containerHeight = windowEl.height()).width(containerWidth = windowEl.width());
				if(option.horizontal)contentElement.height(containerHeight);
				else contentElement.width(containerWidth);
				return;
			};
			if(option.horizontal)containerElement.height(containerHeight = contentElement.height());
			else containerElement.width(containerWidth = contentElement.width());
		};
		
		// function fix scrollbar size
		// neu nhu khong phai body scroll thi se 
		// get lai gia tri size cua container
		// boi vi neu la body scroll thi size cua
		// container da duoc get lai moi lan window resize roi
		function fixScrollbarSize(){
			if(!isBodyScroll){
				containerWidth = containerElement.width();
				containerHeight = containerElement.height();
			};
			contentWidth = contentElement.width();
			contentHeight = contentElement.height();
			scrollbarWidth  = containerWidth  * containerWidth  / contentWidth;
			scrollbarHeight = containerHeight * containerHeight / contentHeight;
			if(!option.alwayshide){
				if(option.horizontal){
					scrollbarElement.width(scrollbarWidth);
					scrollbarWrapElement.width(containerWidth);
				}else{
					scrollbarElement.height(scrollbarHeight);
					scrollbarWrapElement.height(containerHeight);
				};
				// hide scrollbar
				if(option.horizontal){
					if(contentWidth<=scrollbarWidth)scrollbarWrapElement.hide();else scrollbarWrapElement.show();
				}else{
					if(contentHeight<=scrollbarHeight)scrollbarWrapElement.hide();else scrollbarWrapElement.show();
				};
			};
		};
		// first fix
		fixScrollbarSize();
		
		// first run callback & trigger a event
		option.onResize(-scrollPosition(), containerWidth, containerHeight);
		if(isBodyScroll)bodyElement.trigger('scrollbar.windowResize', {scrollTop:-scrollPosition(), width:containerWidth, height:containerHeight});
		else contentElement.trigger('scrollbar.windowResize', {scrollTop:-scrollPosition(), width:containerWidth, height:containerHeight});
		
		// shadow element
		var shadowElement = option.shadow ? zjs(_shadowHtml).appendTo(containerElement).hide() : false;
		
		
		// QUAN TRONG
		// bat dau khai bao timer chinh cua module
		// timer nay lam nhiem vu di chuyen content element
		// va trong khi di chuyen content element
		// thi thang scrollbar se duoc tinh toan
		// ma di chuyen theo cho phu hop
		var moveContentElTimer = zjs.timer({
			time: option.scrolltime, transition: option.transition,
			onStart: function(){stopAutorefresh = true;fixScrollbarSize();},
			onProcess: function(current){moveContentEl(current);},
			onFinish: function(from, to){
				moveContentEl(to);scrollbarHideTimer.run();stopAutorefresh = false;
				_movingsmoothbysnap_startbytouchpad = false;
			},
			onStop: function(){stopAutorefresh = false;}
		});
		
		// timer lam nhiem vu hide, show scrollbar wrap
		var scrollbarHideTimer = zjs.timer({
			from: 50,to: 0,time: 2000,
			onProcess: function(current){if(option.autohide && !option.alwayshide)scrollbarWrapElement.style('opacity', current);},
			onFinish: function(from, to){if(option.autohide && !option.alwayshide)scrollbarWrapElement.style('opacity', to);}
		});
		
		// ham lam nhiem vu kiem tra coi
		// hien tai thi co duoc phep scroll khong
		// vi du nhu noi dung ben trong
		// ma ngan hon container bao ben ngoai
		// thi tat nhien khong cho scroll roi
		var canUseScroll = function(){
			fixScrollbarSize();
			if(option.horizontal)return contentWidth > containerWidth;
			return contentHeight > containerHeight;
		};
		
		// ham lam nhiem vu move content element
		// nhung ham nay khong thuc su move content element
		// ma ham move content element thuc su se duoc
		// dinh nghia sau, tuong ung voi tung truong hop
		// ma ham move se duoc dinh nghia phu hop
		// nham tang toc performance
		var moveContentEl_integer_lastTo = 0;
		var moveContentEl = function(to){
			
			// kiem tra coi neu chi su dung so nguyen (integer)
			// thi se convert
			if(option.useinteger){
				to = parseInt(to);
				if(to == moveContentEl_integer_lastTo)return;
				moveContentEl_integer_lastTo = to;
			};
			
			// bat dau move content
			realMoveContentEl(to);
			if(option.shadow){
				if(to < -5)shadowElement.show();
				else shadowElement.hide();
			};
			
			// run callback & trigger a event
			option.onScroll(-to, containerWidth, containerHeight);
			if(isBodyScroll)bodyElement.trigger('scrollbar.scroll', {scrollTop:-to, scrollBottom:contentWidth-containerWidth+to, width:containerWidth, height:containerHeight});
			else contentElement.trigger('scrollbar.scroll', {scrollTop:-to, scrollBottom:contentWidth-containerWidth+to, width:containerWidth, height:containerHeight});
		};
		
		// ham thuc su di chuyen content element
		// va ham nay chi if 1 lan dau tien (luc khoi tao ham)
		// nen se tang dang ke performance
		if(option.horizontal && webkitTransform){
			var realMoveContentEl = function(to){
				contentElementPosition = to;
				contentRealElement.style.webkitTransform = 'translate3d(' + to + 'px, 0, 0)';
				if(option.alwayshide)return;
				scrollbarElementPosition = -to * containerWidth / contentWidth;
				scrollbarRealElement.style.webkitTransform = 'translate3d(' + scrollbarElementPosition + 'px, 0, 0)';
			};
		}
		else if(!option.horizontal && webkitTransform){
			var realMoveContentEl = function(to){
				contentElementPosition = to;
				contentRealElement.style.webkitTransform = 'translate3d(0, ' + to + 'px, 0)';
				if(option.alwayshide)return;
				scrollbarElementPosition = -to * containerHeight / contentHeight;
				scrollbarRealElement.style.webkitTransform = 'translate3d(0, ' + scrollbarElementPosition + 'px, 0)';
			};
		}
		else if(option.horizontal){
			var realMoveContentEl = function(to){
				contentRealElement.style.left = to+'px';
				if(option.alwayshide)return;
				scrollbarRealElement.style.left = (-to * containerWidth / contentWidth)+'px';
			};
		}
		else {
			var realMoveContentEl = function(to){
				contentRealElement.style.top = to+'px';
				if(option.alwayshide)return;
				scrollbarRealElement.style.top = (-to * containerHeight / contentHeight)+'px';
			};
		};
		
		// ham co nhiem vu kiem soat qua trinh 
		// move content element, tuc la trong ham nay
		// se goi lai ham moveContentEl va ca timer moveContentElTimer
		// neu nhu co the move thi se return true
		// neu nhu vi ly do gi do khong move duoc thi se return false
		var runMoveContentEl = function(to, notSmooth, rubber){
			fixScrollbarSize();
			if(moveContentElTimer.isRunning())moveContentElTimer.stop();
			
			if(!option.smooth || (typeof notSmooth != 'undefined' && notSmooth == true)){
				// neu nhu rubber = true thi se bo qua 
				// sai sot trong vi tri cua container
				if(typeof rubber == 'undefined'){
					if(option.horizontal  && to < containerWidth  - contentWidth)  to = containerWidth  - contentWidth;
					if(!option.horizontal && to < containerHeight - contentHeight) to = containerHeight - contentHeight;
					if(to > 0)to = 0;
				};
				
				if(scrollPosition() == to)return false;
				
				scrollbarHideTimer.stop();
				if(!option.alwayshide)scrollbarWrapElement.style('opacity', 1);
				// move luon, khong can dung timer
				moveContentEl(to);
				// run timer de fadeOut scrollbar
				!option.smooth && scrollbarHideTimer.run();
				return true;
			};
			
			var from = scrollPosition();
			moveContentElTimer.set({from:from, to:to, transition:option.transition});
			
			if(option.horizontal  && to < containerWidth - contentWidth){
				to = containerWidth - contentWidth;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});
			};
			if(!option.horizontal && to < containerHeight - contentHeight){
				to = containerHeight - contentHeight;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});
			};
			if(to > 0){
				to = 0;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});
			};
			
			if(scrollPosition() == to)return false;
			
			scrollbarHideTimer.stop();
			
			// fix scrollbar show
			if(!option.alwayshide)scrollbarWrapElement.style('opacity', 1);
			
			// dung timer de move
			if(!pauseEvent)moveContentElTimer.run();
			
			return true;
		};
			
		// ham nay se move scrollbar, va content element
		// se move theo cho hop ly
		var moveScrollbarEl = function(to, notSmooth){
			if(option.horizontal)return runMoveContentEl(-to / containerWidth * contentWidth, notSmooth);
			runMoveContentEl(-to / containerHeight * contentHeight, notSmooth);
		};
		
		// function giup tinh toan ra vi tri moi cua scroll position
		// dua vao cac snap position
		//var _newScrollPositionMergeWithSnap_oldPosition = 0;
		//var _newScrollPositionMergeWithSnap_olddeltaY = 0;
		var _newScrollPositionMergeWithSnap_usedsnap = false;
		var _newScrollPositionMergeWithSnap = function(_oldPosition, _deltaY, _isTouchpad){
		
			// fix _oldPosition
			//if(_newScrollPositionMergeWithSnap_olddeltaY == _deltaY && Math.abs(_newScrollPositionMergeWithSnap_oldPosition - _oldPosition) > 10)
			//	_oldPosition = _newScrollPositionMergeWithSnap_oldPosition;
			
			//console.log('Math.abs(_newScrollPositionMergeWithSnap_oldPosition - _oldPosition)', Math.abs(_newScrollPositionMergeWithSnap_oldPosition - _oldPosition));
			//console.log('_oldPosition ', _oldPosition);
				
			// tinh toan ra vi tri tiep theo se move toi
			var	_to = _oldPosition;	
			
			// reset lai cai bien nay
			_newScrollPositionMergeWithSnap_usedsnap = false;
			
			var _contentElementSnapPositions = isBodyScroll ? bodyElement.getData(snapPositionsKey) : contentElement.getData(snapPositionsKey);
			
			// neu nhu dung chuot de lan thi se co them truong hop ap dung snap vao 
			// va phai tang(giam) them 10px, de tranh truong hop lan chuot nhanh qua
			// va dong thoi scroll van con dang chay tu tu gan toi cai vi tri lan truoc do
			// nen phai +/- them 10px
			if(_contentElementSnapPositions && !(option.skipSnapWhenUseTouchpad && _isTouchpad)){
			
				if(_deltaY < 0)
					for(var i = 0;i<_contentElementSnapPositions.length;i++){
						if(-_contentElementSnapPositions[i] < _oldPosition-10){
							_to = -_contentElementSnapPositions[i];
							_newScrollPositionMergeWithSnap_usedsnap = true;
							break;
						}
					}
				if(_deltaY > 0)
					for(var i = _contentElementSnapPositions.length-1;i>=0;i--)
						if(-_contentElementSnapPositions[i] > _oldPosition+10){
							_to = -_contentElementSnapPositions[i];
							_newScrollPositionMergeWithSnap_usedsnap = true;
							break;
						}
			};
			
			// neu nhu khong get ra duoc snap thi se lam nhu binh thuong
			if(!_newScrollPositionMergeWithSnap_usedsnap)
				_to = _oldPosition + _deltaY * (_isTouchpad ? option.scrolllinetouchpad : option.scrollline);
			
			return _to;
		};
		
		
		// cai nay la bien de ma khoa thang touchpad lai khi ma snap
		var _movingsmoothbysnap_startbytouchpad = false;
		
		// bind event to use mousewheel to move content element
		if(option.usemouse){
			containerElement.on('mousewheel', function(e){
				
				if(!canUseScroll())return;
				
				// chan cai thang touchpad lai!
				if(_movingsmoothbysnap_startbytouchpad)return;
							
				// va de han che khi ma snap, nhung ma content lai move qua nhanh
				// (do su dung touchpad) thi phai track lai neu nhu la touchpad
				//if(_newScrollPositionMergeWithSnap_usedsnap && e.isTouchpad()){
					//console.log(e);
				//	console.log('lock touchpad');
				//	return;
				//};
				//console.log('move');
				
				// kiem tra xem co move thanh cong hay khong
				var moveok = false;
				
				// tinh toan cac thong so de bat dau scroll
				var _to = _newScrollPositionMergeWithSnap(scrollPosition(), e.deltaY(), e.isTouchpad());
				
				// xem coi move co can smooth hay khong
				// neu nhu ma dung touchpad nhung ma da bi snap roi 
				// thi cung se smooth luon
				var _notSmooth = e.isTouchpad() && !_newScrollPositionMergeWithSnap_usedsnap;
				
				// bat dau move va track lai co move thanh cong hay khong
				moveok = runMoveContentEl(_to, _notSmooth);
				// track lai la dang move smooth, usedsnap, va bat dau bang touchpad
				if(_newScrollPositionMergeWithSnap_usedsnap && e.isTouchpad())
					_movingsmoothbysnap_startbytouchpad = true;
				
				// neu nhu move ok thi minh phai stop
				// lai event move binh thuong cua browser
				// con khong ok thi se cho browser move
				if(!moveok)return;
				
				
				e.preventDefault();
				e.stopPropagation();
			});
		};
		
		// bind event to use keyboard to move content element
		var allowKey = false;
		containerElement.hover(function(){allowKey=true;},function(){allowKey=false;});
		if(option.usekey){
			var keyhbup = true;
			zjs('body').on('keydown', function(event){
				if(!canUseScroll() || !allowKey || !keyhbup) return;
				
				// kiem tra coi co tha key ra chua
				keyhbup = false;
				
				// kiem tra xem co move thanh cong hay khong
				var moveok = false;
				var _to = 0;
				
				if(!moveok && (event.keyCode()==40||event.keyCode()==38||event.keyCode()==37||event.keyCode()==39)){
					_to = _newScrollPositionMergeWithSnap(scrollPosition(), (event.keyCode() == 40 || event.keyCode() == 39) ? -1 : 1, false);
					moveok = runMoveContentEl(_to);
				};
				if(!moveok && option.horizontal && (event.keyCode()==37||event.keyCode()==39)){
					_to = _newScrollPositionMergeWithSnap(scrollPosition(), event.keyCode() == 39 ? -1 : 1, false);
					moveok = runMoveContentEl(_to);
				};
				if(!moveok && event.keyCode()==36){
					if(option.horizontal)return runMoveContentEl(contentWidth);
					moveok = runMoveContentEl(contentHeight);
				};
				if(!moveok && event.keyCode()==35){
					if(option.horizontal)return runMoveContentEl(-contentWidth);
					moveok = runMoveContentEl(-contentHeight);
				};
				if(!moveok && event.keyCode()==33){
					if(option.horizontal)moveok = runMoveContentEl(scrollPosition() + containerWidth);
					else moveok = runMoveContentEl(scrollPosition() + containerHeight);
				};
				if(!moveok && event.keyCode()==34){
					if(option.horizontal)moveok = runMoveContentEl(scrollPosition() - containerWidth);
					else moveok = runMoveContentEl(scrollPosition() - containerHeight);
				};
				
				// neu nhu move ok thi minh phai stop
				// lai event move binh thuong cua browser
				// con khong ok thi se cho browser move
				if(!moveok)return;
				
				event.preventDefault();
				event.stopPropagation();
				
			}).on('keyup', function(event){
				keyhbup = true;
			});
		};
		
		// bind event de co the move content element
		// bang cach nhan vao trong scrollbar wrap
		if(!option.alwayshide)
			scrollbarWrapElement.on('mousedown', function(event){
				if (!canUseScroll())return;
				if(option.horizontal)moveScrollbarEl(event.x() - scrollbarWidth / 2);
				else moveScrollbarEl(event.y() - scrollbarHeight / 2);
				event.preventDefault();
				event.stopPropagation();
			}).hover(function (event) {
				if (!canUseScroll()) return;
				scrollbarHideTimer.stop();
				scrollbarWrapElement.setStyle('opacity',1);
				event.preventDefault();
			}, function (event) {
				if (!canUseScroll()) return;
				scrollbarHideTimer.run();
				event.preventDefault();
			});
		var _scrollbarElementPosition = 0;
		if(!option.alwayshide)
			scrollbarElement.drag({
				onStart: function (event) {
					event.preventDefault();
					event.stopPropagation();
					_scrollbarElementPosition = scrollbarElementPosition;
				},
				onDrag: function (event, element, mouse, style) {
					if(!canUseScroll())return;
					scrollbarHideTimer.stop();
					scrollbarWrapElement.setStyle('opacity',1);
					if(option.horizontal)
						moveScrollbarEl(_scrollbarElementPosition + style.left + mouse.x, true);
					else
						moveScrollbarEl(_scrollbarElementPosition + style.top + mouse.y, true);
					event.preventDefault();
					event.stopPropagation();
				},
				onDrop: function (event) {
					event.preventDefault();
					event.stopPropagation();
				}
			});
		
		// - - - -
		// handler for touch screen
		
		// event for touch screen
		if(option.usetouch && zjs.isTouchDevice()){
			var touchstart = {x:-1,y:-1,h:-1,t:0};
			var touchmove = {x:-1,y:-1,h:-1,t:0};
			containerElement.on('touchstart', function(event, element){
				//event.preventDefault();
				scrollbarHideTimer.stop();
				stopMomentum();
				touchstart = {x:event.touchX(), y:event.touchY(), h:scrollPosition(), t:event.timeStamp()};
			});
			containerElement.on('touchmove', function(event, element){
				event.preventDefault();
				touchmove = {x:event.touchX(), y:event.touchY(), t:event.timeStamp()};
				var to = event.touchY() - touchstart.y + touchstart.h;
				var ratio = 4;
				if( (option.horizontal  && to < containerWidth  - contentWidth ) ||
					(!option.horizontal && to < containerHeight - contentHeight) ||
					(to > 0) )
					to = (event.touchY() - touchstart.y)/ratio + touchstart.h;
				runMoveContentEl(to, true, true);
			});
			containerElement.on('touchend', function(event, element){
				//event.preventDefault();
				scrollbarHideTimer.run();			
				doMomentum();
				touchstart = {x:-1,y:-1};
				touchmove = {x:-1,y:-1};
			});
		};
		
		var doMomentum = function(event){
			var velocity = (touchmove.y - touchstart.y) / (touchmove.t - touchstart.t);
			var acceleration = velocity < 0 ? 0.0005 : -0.0005;
			var displacement = - (velocity * velocity) / (2 * acceleration);
			var time = - velocity / acceleration;
			
			var to = contentElementPosition + displacement;
			
			if(option.horizontal  && to < containerWidth  - contentWidth){if(velocity<0 && to > containerWidth  - contentWidth-500)time=180;to = containerWidth  - contentWidth;};
			if(!option.horizontal && to < containerHeight - contentHeight){if(velocity<0 && to > containerHeight - contentHeight-500)time=180;to = containerHeight - contentHeight;}
			if(to > 0){if(velocity>0 && to < 500)time=180;to=0;}
			
			contentElementPosition = to;
			contentRealElement.style.webkitTransition = '-webkit-transform ' + time + 'ms cubic-bezier(0.33, 0.66, 0.66, 1)';
			contentRealElement.style.webkitTransform = 'translate3d(0, ' + contentElementPosition + 'px, 0)';
			if(option.alwayshide)return;
			scrollbarElementPosition = -to * containerHeight / contentHeight;
			scrollbarRealElement.style.webkitTransition = '-webkit-transform ' + time + 'ms cubic-bezier(0.33, 0.66, 0.66, 1)';
			scrollbarRealElement.style.webkitTransform = 'translate3d(0, ' + scrollbarElementPosition + 'px, 0)';
		};
		
		var stopMomentum = function(){
			// Get the computed style object.
			var style = document.defaultView.getComputedStyle(contentRealElement, null);
			// Computed the transform in a matrix object given the style.
			var transform = new WebKitCSSMatrix(style.webkitTransform);
			// Clear the active transition so it doesn’t apply to our next transform.
			contentRealElement.style.webkitTransition = '';
			if(scrollbarRealElement)
			scrollbarRealElement.style.webkitTransition = '';
			// Set the element transform to where it is right now.
			realMoveContentEl(transform.m42);
		};
		
		// end handler for touch screen
		// - - - - - 
		
		
		// tao ra cac function linh tinh
		var listUtilFunctions = {
			pauseScrollEvent: function(){pauseEvent=true;},
			continueScrollEvent: function(){pauseEvent=false;},
			refreshScroll: function(){
				fixContainerSize();fixScrollbarSize();
				// sau do se thu move scrollbar de fix lai dung vi tri dep
				return runMoveContentEl(scrollPosition(), true);
			},
			scrollLineUp: function(){
				return runMoveContentEl(scrollPosition() + option.scrollline);
			},
			scrollLineDown: function(){
				return runMoveContentEl(scrollPosition() - option.scrollline);
			},
			scrollPageUp: function(){
				if(option.horizontal)
					return runMoveContentEl(scrollPosition() + containerWidth);
				return runMoveContentEl(scrollPosition() + containerHeight);
			},
			scrollPageDown: function(){
				if(option.horizontal)
					return runMoveContentEl(scrollPosition() - containerWidth);
				return runMoveContentEl(scrollPosition() - containerHeight);
			},
			scrollNextSnap: function(){
				return runMoveContentEl(_newScrollPositionMergeWithSnap(scrollPosition(), -1, false));
			},
			scrollPrevSnap: function(){
				return runMoveContentEl(_newScrollPositionMergeWithSnap(scrollPosition(), 1, false));
			},
			scrollToTop: function(){
				if(option.horizontal)
					return runMoveContentEl(contentWidth);
				return runMoveContentEl(contentHeight);
			},
			scrollToEnd: function(){
				if(option.horizontal)
					return runMoveContentEl(-contentWidth);
				return runMoveContentEl(-contentHeight);
			},
			scrollTo: function(pixel, notSmooth){
				pixel=pixel||0;
				if(typeof notSmooth == 'number'){
					var _top = -scrollPosition();
					if((_top<=pixel&&_top>=pixel-notSmooth)||(_top>=pixel&&_top<=pixel+notSmooth))
						return runMoveContentEl(-pixel);
					runMoveContentEl(-pixel+notSmooth,true);
					return runMoveContentEl(-pixel);
				};
				return runMoveContentEl(-(pixel||0), notSmooth);
			},
			scrollToElement: function(query, pixel, notSmooth){
				if( zjs.isString(query) )var targetElement = contentElement.find(query);
				else var targetElement = zjs(query);
				return runMoveContentEl(-targetElement.getStyle(option.horizontal?'left':'top', true) - (pixel||0), notSmooth);
			},
			scrollPosition: function(){
				return -scrollPosition();
			}
		};
		
		// luu containerElement vo de sau nay lay ra sai cho de
		if(isBodyScroll){
			bodyElement.setData(containerElkey, containerElement);
			bodyElement.setData(listFunctionsKey, listUtilFunctions);
		}else{
			contentElement.setData(containerElkey, containerElement);
			contentElement.setData(listFunctionsKey, listUtilFunctions);
		};
		
		// tao ra 1 timer interval de handler autorefresh
		if(option.autorefresh){
			window.setInterval( 
				function(){
					if(stopAutorefresh)return;
					runMoveContentEl(scrollPosition(), true);
				}, option.autorefreshtime);
		};
		
		// bind them event khi window resize
		// de chac chan la size cua scroll se duoc
		// fix triet de, neu nhu la body scroll
		if(isBodyScroll){windowEl.on('resize', function(){
			bodyElement.refreshScroll();
			// run callback & trigger a event
			option.onResize(-scrollPosition(), containerWidth, containerHeight);
			bodyElement.trigger('scrollbar.windowResize', {scrollTop:-scrollPosition(), width:containerWidth, height:containerHeight});
		})};
		
		
		// sau khi lam xong het roi, thi bay gio se trigger 1 cai event khi khoi tao xong
		if(isBodyScroll)bodyElement.trigger('scrollbar.ready');
		else contentElement.trigger('scrollbar.ready');
	};
	
	
	// refresh snap positions
	var scrollbarRefreshSnapPositions = function(element){
		
		var contentElement = zjs(element);
		
		// test xem scrollbar da duoc khoi tao truoc do chua?
		// neu chua co thi thoi bo qua
		var option = contentElement.getData(optionkey, false);
		if(!option)
			return false;
		
		// tien hanh merge 
		// xem coi trong option co set snap position hay khong
		// de ma con merge lai 2 cai option snap
		var _contentElementSnapPositions = false;
		if(option.snapPositions && zjs.isArray(option.snapPositions))
			_contentElementSnapPositions = zjs.clone(option.snapPositions);
		if(option.snapElements){
			var _zSnapEls = contentElement.find(option.snapElements);
			if(_zSnapEls.count()>0){
				if(!zjs.isArray(_contentElementSnapPositions))
					_contentElementSnapPositions = [];
				_zSnapEls.each(function(_snapElements){
					_contentElementSnapPositions.push(zjs(_snapElements).top());
				});
			};
		};
		if(zjs.isArray(_contentElementSnapPositions))
			_contentElementSnapPositions = _contentElementSnapPositions.sort(function(a,b){
				return parseInt(a)-parseInt(b);
			});
		// save lai
		contentElement.setData(snapPositionsKey, _contentElementSnapPositions);
	};
	
	
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeScrollbar: function(useroption){
			return this.each(function(element){makeScrollbar(element, useroption)});
		},
		pauseScrollEvent: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.pauseScrollEvent == 'function')
					listFunctions.pauseScrollEvent();
			});
		},
		continueScrollEvent: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.continueScrollEvent == 'function')
					listFunctions.continueScrollEvent();
			});
		},
		refreshScroll: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.refreshScroll == 'function')
					listFunctions.refreshScroll();
				scrollbarRefreshSnapPositions(element);
			});
		},
		scrollbarRefreshSnapPositions: function(){
			return this.each(function(element){scrollbarRefreshSnapPositions(element)});
		},
		
		scrollLineUp: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollLineUp == 'function')
					listFunctions.scrollLineUp();
			});
		},
		scrollLineLeft: function(){
			return this.scrollLineUp();
		},
		scrollLineDown: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollLineDown == 'function')
					listFunctions.scrollLineDown();
			});
		},
		scrollLineRight: function(){
			return this.scrollLineDown();
		},
		scrollPageUp: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollPageUp == 'function')
					listFunctions.scrollPageUp();
			});
		},
		scrollPageDown: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollPageDown == 'function')
					listFunctions.scrollPageDown();
			});
		},
		scrollNextSnap: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollNextSnap == 'function')
					listFunctions.scrollNextSnap();
			});
		},
		scrollPrevSnap: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollPrevSnap == 'function')
					listFunctions.scrollPrevSnap();
			});
		},
		scrollToTop: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollToTop == 'function')
					listFunctions.scrollToTop();
			});
		},
		scrollToEnd: function(){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollToEnd == 'function')
					listFunctions.scrollToEnd();
			});
		},
		scrollToBottom: function(){return this.scrollToEnd();},
		scrollTo: function(pixel,notSmooth){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollTo == 'function')
					listFunctions.scrollTo(pixel,notSmooth);
			});
		},
		scrollToElement: function(query, pixel, notSmooth){
			return this.each(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollToElement == 'function')
					listFunctions.scrollToElement(query, pixel, notSmooth);
			});
		},
		scrollPosition: function(){
			var listFunctions = this.item(0).getData(listFunctionsKey);
			if(typeof listFunctions.scrollPosition == 'function')
				return listFunctions.scrollPosition();
			return 0;
		},
		scrollContainer: function(){
			return zjs(this.item(0).getData(containerElkey));
		},
		scrollHeight: function(value){
			var returnheight = this.scrollContainer().height(value);
			if(typeof returnheight == 'number')return returnheight;
			return this;
		},
		scrollContainerHeight: function(value){
			var returnheight = this.scrollContainer().height(value);
			if(typeof returnheight == 'number')return returnheight;
			return this;
		},
		iszScrollbar: function(){
			return (typeof this.item(0).getData(optionkey) == 'object');
		}
	});
	
	// dang ky hook nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zscroll ko, neu nhu co thi se auto makescrollbar luon
			zjs(el).find('.zscroll').makeScrollbar();
			// kiem tra xem thang nay co phai la scrollbar ko
			// neu nhu phai thi phai refresh lai
			zjs(el).refreshScroll().parent().refreshScroll().parent().refreshScroll();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zscroll ko, neu nhu co thi se auto makescrollbar luon
			if(zjs(el).hasClass('zscroll'))zjs(el).makeScrollbar();
			zjs(el).find('.zscroll').makeScrollbar();
			// kiem tra coi thang cha cua thang el nay co phai la zscroll khong
			// neu phai thi se refresh scroll (lam den 3 cap cha thoi)
			zjs(el).parent().refreshScroll().parent().refreshScroll().parent().refreshScroll();
		},
		before_removeDOM: function(el){
			// kiem tra coi thang nay co phai la thang content element
			// trong scrollable group hay khong
			// neu nhu phai thi minh phai remove luon thang container
			if(parseInt(zjs(el).getData(idkey,0))<=0)return;
			// remove
			zjs(el).scrollContainer().remove();
		}
	});
	
	// cuoi cung la auto init
	zjs.onload(function(){zjs('.zscroll').makeScrollbar()});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('scrollbar');
	
})(zjs);