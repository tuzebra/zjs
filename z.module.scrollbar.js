// extend module Scrollbar cho zjs
;(function(zjs){
//"use strict";
	
	var idkey = 'zmodulescrollbarid',
		optionkey = 'zmodulescrollbaroption',
		contentElkey = 'zmodulescrollbarcontentel',
		iscontentElkey = 'zmodulescrollbarthisiscontentel',
		containerElkey = 'zmodulescrollbarcontainerel',
		wrapperSizeElkey = 'zmodulescrollbarwrappersizeelkey',
		listFunctionsKey = 'zmodulescrollbarfunctions',
		snapPositionsKey = 'zmodulescrollbarsnappositions',
		globalscrollid = 1,
		
		// 
		nonuiscrollpositionkey = 'zmodulescrollbarnonuipos',
		
		// stop scroll du, su dung scroll default cua browser
		usedefaultkey = 'zmodulescrollbarusedefault';
	
	
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
			scrollline: 300, // so' px trong 1 lan` di chuyen?
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
			skipSnapWhenUseTouchpad: false, // skip using snap positions when use touchpad
			looseSnap: false, // snap loosely
			snapScrollUp: true,
			snapScrollDown: true,
			
			useinteger: false, // used scroll position by integer number
			autorefresh: false, // auto refresh to fix scrollbar size?
			autorefreshtime: 1000,
			customCssClass: '', // css
			customUsedefaultCssClass: '', // css
			customStyleContainer: '',
			
			// cac option phuc vu cho responsive 
			// tu dong chuyen sang dung default scrollbar
			// khi ma chieu rong khong dat yeu cau 
			// thuong su dung khi build website co mobile version
			autoUseDefaultWhenWidthLessThan: 0, 
			autoUseDefaultWithMobile: false, 
			// hoac neu quyet dinh luon luon dung default thi cho luon
			useDefault: false,
			
			// event
			onResize: function(scrollTop, width, height){},
			onScroll: function(scrollTop, width, height){},
			
			//
			nonui: false,
			nonuiMaxScroll: 400,
			
			// debug
			debug: false
		}
	});
	
	// class
	// .zscroll
	// .zscrollnotinclude
	
	// trigger
	//scrollbar:start
	//scrollbar:ready
	//scrollbar:scroll
	//scrollbar:windowResize
	
	//data-snap-modify-px
	
	// template
	var _scrollbarHtml = '<div class="zui-scrollbar-wrap"><div class="zui-scrollbar"></div></div>',
		_shadowHtml = '<div class="zui-scrollbar-shadow"></div>',
		
		_scrollbarUsedefaultClass = 'zui-scrollbar-usedefault';
	
	
	// support module ui.popup
	var popuppredefineclass = 'zpopup',
		popupclass = 'zui-popup',
		popupcoverclass = 'zui-popup-page-cover';
	
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
		
		// fix option 
		option.customUsedefaultCssClass = option.customUsedefaultCssClass || '';
		option.customUsedefaultCssClass = option.customUsedefaultCssClass.trim();
		if(option.customUsedefaultCssClass != '')option.customUsedefaultCssClass = _scrollbarUsedefaultClass+' '+option.customUsedefaultCssClass;
		else option.customUsedefaultCssClass = _scrollbarUsedefaultClass;
		
		// fix option 
		option.autoUseDefaultWhenWidthLessThan = parseInt(option.autoUseDefaultWhenWidthLessThan);
		if(option.autoUseDefaultWhenWidthLessThan < 0)
			option.autoUseDefaultWhenWidthLessThan = 0;
		
		// fix option
		option.useDefault = !!option.useDefault;
		
		// save option
		//contentElement.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		
		// mac dinh thi se su dung scrollbar du chu
		contentElement.setData(usedefaultkey, false);
		
		
		// bat dau khai bao
		var	scrollbarWrapElement = option.alwayshide ? false : zjs(_scrollbarHtml),
			scrollbarElement = option.alwayshide ? false : scrollbarWrapElement.find('.zui-scrollbar'),
			
			containerRealWidth = contentElement.width(),
			containerRealHeight = contentElement.height();
		// fix real width, tai vi neu co box-sizing thi phien
		try{if(contentElement.getStyle('box-sizing') == 'border-box'){
			containerRealWidth -= (contentElement.getStyle('border-left', true) + contentElement.getStyle('border-right', true));
			containerRealHeight -= (contentElement.getStyle('border-top', true) + contentElement.getStyle('border-bottom', true));
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
		if(!option.nonui && isBodyScroll){
			// hien tai content element dang la body
			// nen se fix style cho thang body
			contentElement.setStyle('overflow', 'hidden');
			// replace content Element
			contentElement = zjs('<div></div>');
			// bay gio phai tao ra 1 cai bien moi
			var bodyElement = zjs(element);
			// phai copy toan bo child cua body vao 1 cai moi
			// trong qua trinh copy nay se tam thoi disable zjs hook cho chac an
			var _currentHook = zjs.enablehook();
			zjs.enablehook(false);
			bodyElement.child().eachElement(function(el){
				if(el.tagName == 'SCRIPT' || el.tagName == 'LINK')return;
				//if(zjs(el).hasClass(popuppredefineclass) || zjs(el).hasClass(popupclass) || zjs(el).hasClass(popupcoverclass))return;
				if(!zjs(el).hasClass('zscrollnotinclude'))contentElement.append(el);
			});
			zjs.enablehook(_currentHook);
			// create windowEl de ma get width, height
			windowEl = zjs(window);
			containerWidth = windowEl.width();
			containerHeight = windowEl.height();
			
			// fix cho window scroll ve vi tri 0,0 luon
			window.scrollTo(0, 0);
			// fix them lan nua cho chac an
			//(function(){window.scrollTo(0, 0)}).delay(1000);
			
			// luu content vao trong body luon
			bodyElement.setData(contentElkey, contentElement);
			
			// va khong co cho phep trinh duyet duoc phep handler khi ma change hash 
			zjs(window).on('hashchange', function(event){
				//console.log('hashchange donothing');
				event.preventDefault();
				event.stopPropagation();
				window.scrollTo(0, 0);
			});
		};
		
		// add class cho contentElement luon
		// va them dau hieu nhan biet
		contentElement.addClass('zui-scrollbar-content');
		contentElement.setData(iscontentElkey, true);
		
		
		
		// mot bien flag de xem day la dung webkit transform hay khong
		var webkitTransform = option.usecss && ('webkitTransform' in document.createElement('div').style),
			contentRealElement = contentElement.item(0,true),
			scrollbarRealElement = (scrollbarElement ? scrollbarElement.item(0,true) : false),
			contentElementPosition = 0, 
			scrollbarElementPosition = 0;
		
		// fix option
		option.usecss = webkitTransform;
		
		// get ra cac snap positions
		scrollbarRefreshSnapPositions(element);

		// --
		
		// neu nhu la dung webkit transform thi setup translate3d truoc
		if(!option.nonui && webkitTransform){
			contentRealElement.style.webkitTransform = 'translate3d(0, 0, 0)';
			if(scrollbarRealElement)
			scrollbarRealElement.style.webkitTransform = 'translate3d(0, 0, 0)';
		};
		
		// first fix nonui position
		if(option.nonui){
			contentElement.setData(nonuiscrollpositionkey, 0);
		};
		
		
		// =====
		
		// bay gio moi save option
		contentElement.setData(optionkey, option);
		if(isBodyScroll){
			zjs(window.document.body).setData(optionkey, option);
			if(option.useDefault)scrollbarUseDefault(window.document.body, true);
		}else{
			// check coi co su dung default hay khong?
			if(option.useDefault)scrollbarUseDefault(element, true);
		};
		
		
		// =====
		
		
		
		
		// ham nay se lay position hien tai cua contentElement
		var scrollPosition = function(){
			
			// neu nhu non UI thi scroll position se duoc luu tru trong cho khac
			if(option.nonui)
				return parseFloat(contentElement.getData(nonuiscrollpositionkey, 0));
			
			// neu nhu dang su dung default scroll thi scrollPosition se get khac 1 xiu
			if(contentElement.getData(usedefaultkey, false)){
				if(isBodyScroll)
					return (option.horizontal) ? -zjs(window).scrollLeft() : -zjs(window).scrollTop();
				return (option.horizontal) ? -contentElement.scrollLeft() : -contentElement.scrollTop();
			};
						
			//
			if(webkitTransform){
				//console.log('scrollPosition webkitTransform contentElementPosition', contentElementPosition);
				return contentElementPosition;
			}
			if(option.horizontal)return contentElement.left();
			return contentElement.top();
		};
		
		// tao ra 1 cai container Element de chua moi thu
		var containerElement = option.nonui ? contentElement : zjs('<div></div>');
		
		// trong truong hop cho phep su dung UI thi bat dau xu ly DOM
		if(!option.nonui){
		
			// tim vi tri dat thang container cho hop ly
			if(isBodyScroll)containerElement.prependTo(element);
			else containerElement.insertBefore(element);
			// set style cho thang container cho hop ly
			containerElement.addClass(option.customCssClass).setStyle({position:'relative', overflow:'hidden', width:containerWidth, height:containerHeight});
			containerElement.addClass(isBodyScroll?'body-scroll':'not-body-scroll').addClass(option.horizontal?'zui-scrollbar-horizontal':'zui-scrollbar-vertical');
		
			// sau do append content vao container
			containerElement.append(contentElement);
		
			// fix style cho content element	
			contentElement.setStyle({position:'absolute', left:0, top:0, overflow:'visible'});
			if(option.horizontal)contentElement.setStyle({width:'auto', height:containerHeight});
			else contentElement.setStyle({height:'auto', width:containerWidth});
	
			if(option.innerWidth && !isNaN(option.innerWidth))contentElement.width(option.innerWidth);
			if(option.innerHeight && !isNaN(option.innerHeight))contentElement.height(option.innerHeight);
		
			// style cho scrollbar wrapper
			if(!option.alwayshide){
				containerElement.append(scrollbarWrapElement);
				scrollbarWrapElement.setStyle({position:'absolute', opacity:option.autohide?0:1, display:option.alwayshide?'none':'block'});
				if(option.horizontal)scrollbarWrapElement.width(containerWidth);
				else scrollbarWrapElement.height(containerHeight);
				scrollbarElement.setStyle('position','absolute');
			};
		
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

			// neu non UI thi thoi bo qua function nay
			if(option.nonui)return;
		
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
			// tinh toan lai cai snap element
			scrollbarRefreshSnapPositions(element);
		};
		// first fix
		fixScrollbarSize();
		
		// first run callback & trigger a event
		option.onResize(-scrollPosition(), containerWidth, containerHeight);
		if(isBodyScroll)bodyElement.trigger('scrollbar:windowResize', {scrollTop:-scrollPosition(), width:containerWidth, height:containerHeight});
		else contentElement.trigger('scrollbar:windowResize', {scrollTop:-scrollPosition(), width:containerWidth, height:containerHeight});
		
		// shadow element
		var shadowElement = option.shadow ? zjs(_shadowHtml).appendTo(containerElement).hide() : false;
		
		
		// QUAN TRONG
		// bat dau khai bao timer chinh cua module
		// timer nay lam nhiem vu di chuyen content element
		// va trong khi di chuyen content element
		// thi thang scrollbar se duoc tinh toan
		// ma di chuyen theo cho phu hop
		var moveContentElTimer = zjs.timer({
			time: option.scrolltime, 
			transition: option.transition,
			onStart: function(){
				stopAutorefresh = true;
				fixScrollbarSize();
			},
			onProcess: function(current){
				moveContentEl(current);
			},
			onFinish: function(from, to){
				moveContentEl(to);
				scrollbarHideTimer.run();
				stopAutorefresh = false;
				_movingsmoothbysnap_startbytouchpad = false;
			},
			onStop: function(){
				stopAutorefresh = false;
				_movingsmoothbysnap_startbytouchpad = false;
			}
		});
		
		// timer lam nhiem vu hide, show scrollbar wrap
		var scrollbarHideTimer = zjs.timer({
			from: 50,to: 0,time: 2000,
			onProcess: function(current){if(!option.nonui && option.autohide && !option.alwayshide)scrollbarWrapElement.setStyle('opacity', current);},
			onFinish: function(from, to){if(!option.nonui && option.autohide && !option.alwayshide)scrollbarWrapElement.setStyle('opacity', to);}
		});
		
		// ham lam nhiem vu kiem tra coi
		// hien tai thi co duoc phep scroll khong
		// vi du nhu noi dung ben trong
		// ma ngan hon container bao ben ngoai
		// thi tat nhien khong cho scroll roi
		var canUseScroll = function(){
			
			// neu nhu non UI thi se luon luon su dung duoc scroll
			if(option.nonui)
				return true;
		
			fixScrollbarSize();
			
			var can = true;
			if(option.horizontal)can = (contentWidth > containerWidth);
			else can = (contentHeight > containerHeight);
			
			// neu nhu khong the move
			// thi truoc khi return, phai chinh lai content o trong cho dung vi tri
			// lo nhu dang nam top:-1000 thi sao???
			if(!can)
				moveContentEl(0);
			
			return can;
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
			// nhung phai kiem tra xem coi dang thuc su dung scrolldu
			// hay la da quay tro ve voi default scroll binh thuong
			if(isBodyScroll && contentElement.getData(usedefaultkey)){
				nativeBodyMoveContentEl(to);
			}
			// neu nhu khac truong hop dac biet nay
			// thi se su dung js move top, margin
			else{
				realMoveContentEl(to);
			};
			
			// xu ly khi non UI
			if(!option.nonui && option.shadow){
				if(to < -5)shadowElement.show();
				else shadowElement.hide();
			};
			
			// run callback & trigger a event
			if(!option.nonui)option.onScroll(-to, containerWidth, containerHeight);
			if(option.nonui)contentElement.trigger('scrollbar:scroll', {scrollTop:-to});
			else if(isBodyScroll)bodyElement.trigger('scrollbar:scroll', {
				scrollTop:-to, 
				scrollBottom:option.horizontal?(contentWidth-containerWidth+to):(contentHeight-containerHeight+to), 
				width:containerWidth, 
				height:containerHeight
			});
			else contentElement.trigger('scrollbar:scroll', {
				scrollTop:-to, 
				scrollBottom:option.horizontal?(contentWidth-containerWidth+to):(contentHeight-containerHeight+to), 
				width:containerWidth, 
				height:containerHeight
			});
		};
		
		// ham thuc su di chuyen content element
		// va ham nay chi if 1 lan dau tien (luc khoi tao ham)
		// nen se tang dang ke performance
		if(option.nonui){
			var realMoveContentEl = function(to){
				contentElementPosition = to;
				contentElement.setData(nonuiscrollpositionkey, to);
			};
		}
		else if(option.horizontal && webkitTransform){
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
				//>>>>>>>
				///console.log('set contentElementPosition to', to);
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
		
		// them 1 cai cho thang native luon
		// var nativeBodyMoveContentElTimer = zjs.timer({
		// 	time: 500,
		// 	transition: 2,
		// 	onStart: function(){
		// 		//stopAutorefresh = true;
		// 		//fixScrollbarSize();
		// 	},
		// 	onProcess: function(current){
		// 		//moveContentEl(current);
		// 		if(option.horizontal)document.body.scrollLeft = -current;
		// 		else document.body.scrollTop = -current;
		// 	},
		// 	onFinish: function(from, to){
		// 		// moveContentEl(to);
		// 		// scrollbarHideTimer.run();
		// 		// stopAutorefresh = false;
		// 		// _movingsmoothbysnap_startbytouchpad = false;
		// 	},
		// 	onStop: function(){
		// 		// stopAutorefresh = false;
		// 		// _movingsmoothbysnap_startbytouchpad = false;
		// 	}
		// });
		
		var nativeBodyMoveContentEl = function(to){
			//if(option.horizontal)document.body.scrollLeft = -to;
			//else document.body.scrollTop = -to;
			// nativeBodyMoveContentElTimer.stop();
			var _form = scrollPosition(),
				_to = to;
			// 300, 299 la khoang lan chuot co ban cua window	
			//if(Math.abs(_to - _form) < 280){
			// ma thoi de < 10 cho detech chinh xac la mac hon
			// if(Math.abs(_to - _form) < 280){
				// quyet dinh la khong dung hieu ung gi het
				// cu the ma di thoi
				if(option.horizontal)document.body.scrollLeft = -to;
				else document.body.scrollTop = -to;
			// }
			// else{
			// 	nativeBodyMoveContentElTimer.set({
			// 		from:_form,
			// 		to:to
			// 	}).run();
			// };
			//console.log('_to - _form', _to - _form);
		};
		
		
		// ham co nhiem vu kiem soat qua trinh 
		// move content element, tuc la trong ham nay
		// se goi lai ham moveContentEl va ca timer moveContentElTimer
		// neu nhu co the move thi se return true
		// neu nhu vi ly do gi do khong move duoc thi se return false
		var runMoveContentEl = function(to, notSmooth, rubber){
			
			fixScrollbarSize();
			if(moveContentElTimer.isRunning())
				moveContentElTimer.stop();
			
			if(!option.smooth || (typeof notSmooth != 'undefined' && notSmooth == true)){
				// neu nhu rubber = true thi se bo qua 
				// sai sot trong vi tri cua container
				if(typeof rubber == 'undefined'){
				
					// neu nhu non UI thi phai lam khac
					if(option.nonui && to < -option.nonuiMaxScroll)to = -option.nonuiMaxScroll;
					
					//
					if(!option.nonui && option.horizontal  && to < containerWidth  - contentWidth)  to = containerWidth  - contentWidth;
					if(!option.nonui && !option.horizontal && to < containerHeight - contentHeight) to = containerHeight - contentHeight;
					if(to > 0)to = 0;
				};
				
				if(scrollPosition() == to)return false;
				
				if(!option.nonui){
					scrollbarHideTimer.stop();
					if(!option.alwayshide)scrollbarWrapElement.setStyle('opacity', 1);
					// run timer de fadeOut scrollbar
					if(!option.smooth)scrollbarHideTimer.run();
				};
				
				// move luon, khong can dung timer
				moveContentEl(to);
				return true;
			};
			
			var from = scrollPosition();
			
			moveContentElTimer.set({from:from, to:to, transition:option.transition});
			
			if(option.nonui && to < -option.nonuiMaxScroll){
				to = -option.nonuiMaxScroll;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});
				
				
			};
			if(!option.nonui && option.horizontal  && to < containerWidth - contentWidth){
				to = containerWidth - contentWidth;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});
				
				
			};
			if(!option.nonui && !option.horizontal && to < containerHeight - contentHeight){
				to = containerHeight - contentHeight;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});
			};
			if(to > 0){
				to = 0;
				moveContentElTimer.set({from:from, to:to, transition:(option.bounce?3:option.transition)});	
			};
			
			if(scrollPosition() == to){
				
				// cuc ky quan trong la phai 
				// reset lai cai bien nay
				_newScrollPositionMergeWithSnap_usedsnap = false;
				
				return false;
			};
			
			
			
			if(!option.nonui){
				scrollbarHideTimer.stop();
			
				// fix scrollbar show
				if(!option.alwayshide)scrollbarWrapElement.setStyle('opacity', 1);
			};
			
			
			
			// dung timer de move
			if(!pauseEvent)
				moveContentElTimer.run();
			
			return true;
		};
			
		// ham nay se move scrollbar, va content element
		// se move theo cho hop ly
		var moveScrollbarEl = function(to, notSmooth){
			
			//if(option.nonui)return runMoveContentEl(-to, notSmooth);
			if(option.nonui)return false;
			
			if(option.horizontal)return runMoveContentEl(-to / containerWidth * contentWidth, notSmooth);
			runMoveContentEl(-to / containerHeight * contentHeight, notSmooth);
		};
		
		// function giup tinh toan ra vi tri moi cua scroll position
		// dua vao cac snap position
		//var _newScrollPositionMergeWithSnap_oldPosition = 0;
		//var _newScrollPositionMergeWithSnap_olddeltaY = 0;
		var _newScrollPositionMergeWithSnap_usedsnap = false;
		var _newScrollPositionMergeWithSnap = function(_oldPosition, _deltaY, _isTouchpad, _allowSnap){
			
			
			// reset lai cai bien nay
			_newScrollPositionMergeWithSnap_usedsnap = false;
			
			
			// tinh toan ra vi tri tiep theo se move toi
			var	_to = _oldPosition;	
			
			// cai nay la neu trong truong hop move binh thuong
			var _precal_to_normal = _oldPosition + _deltaY * (_isTouchpad ? option.scrolllinetouchpad : option.scrollline);
			
			if(option.skipSnapWhenUseTouchpad && _isTouchpad)
				return _precal_to_normal;
			
			// cai nay la trong truong hop su dung snap
			var _precal_to_snap = _oldPosition,
				_needtocheck_to_snap = false;
			
			if(_allowSnap){	
			
				var _contentElementSnapPositions = isBodyScroll ? bodyElement.getData(snapPositionsKey) : contentElement.getData(snapPositionsKey);
			
				// neu nhu dung chuot de lan thi se co them truong hop ap dung snap vao 
				// va phai tang(giam) them 10px, de tranh truong hop lan chuot nhanh qua
				// va dong thoi scroll van con dang chay tu tu gan toi cai vi tri lan truoc do
				// nen phai +/- them 10px
				if(_contentElementSnapPositions){
			
					if(_deltaY < 0)
						for(var i = 0;i<_contentElementSnapPositions.length;i++){
							if(-_contentElementSnapPositions[i] < _oldPosition-10){
								_precal_to_snap = -_contentElementSnapPositions[i];
								_needtocheck_to_snap = true;
								break;
							}
						}
					if(_deltaY > 0)
						for(var i = _contentElementSnapPositions.length-1;i>=0;i--)
							if(-_contentElementSnapPositions[i] > _oldPosition+10){
								_precal_to_snap = -_contentElementSnapPositions[i];
								_needtocheck_to_snap = true;
								break;
							}
						
					// bay gio so sanh coi 2 cai thang _to, thi se su dung thang nao
					if(_needtocheck_to_snap){
						// nhung ma voi thang touchpad thi phai kiem tra khac xiu
						// boi vi trong 1 lan di chuyen cua thang touchpad khoang cach ra la nho
						// chi la no di chuyen nhieu lan thoi
						if(option.looseSnap && 
							Math.abs(_oldPosition - _precal_to_snap) > 
							Math.abs(_oldPosition - _precal_to_normal + (_isTouchpad ? option.scrolllinetouchpad : 0))
						)
							return _precal_to_normal;
					
						_newScrollPositionMergeWithSnap_usedsnap = true;
						return _precal_to_snap;
					};
				};
			
			};
			// end - if(_allowSnap)
		
			return _precal_to_normal;
		};
		
		
		// cai nay la bien de ma khoa thang touchpad lai khi ma snap
		var _movingsmoothbysnap_startbytouchpad = false;
		
		
		var isMobile = zjs.isMobileDevice();
		
		// bind event to use mousewheel to move content element
		if(option.usemouse){
			containerElement.on('mousewheel', function(e, el){
				
				// neu nhu hien tai dang su dung default cua browser thi
				// se khong xu ly gi them nua
				if(contentElement.getData(usedefaultkey)){
					// neu nhu su dung mobile thi thoi khong lam gi nua
					if(isMobile)return;
					
					// con neu nhu su dung desktop thi se lam cho scroll that la smooth
					//
					//console.log('xu ly');
					//return
				};
				//console.log(scrollPosition());
				
				if(!canUseScroll())return;
				
				// chan cai thang touchpad lai!
				// nhung neu trong qua trinh dang choi snap
				// thi van phai chang luon
				// boi vi khi snap, thi snap se can thiep vao trong handler default cua event mousewheel
				if(_movingsmoothbysnap_startbytouchpad){
					e.preventDefault();
					e.stopPropagation();
					return;
				};
				
				// kiem tra xem co move thanh cong hay khong
				var moveok = false;
				
				// tinh toan cac thong so de bat dau scroll
				//var _to = _newScrollPositionMergeWithSnap(scrollPosition(), e.getDeltaY(), e.isTouchpad());
				// update: cho phep option la lan len hay lan xuong luon
				var _to = scrollPosition();
					_to = _newScrollPositionMergeWithSnap(
						scrollPosition(), 
						e.getDeltaY(), 
						e.isTouchpad(), 
						((e.getDeltaY() > 0 && option.snapScrollUp) || (e.getDeltaY() < 0 && option.snapScrollDown))
					);
				
				// xem coi move co can smooth hay khong
				// smooth tuc la se dung js timer de ma move cai content cho smooth
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
				// nhung neu trong qua trinh dang choi snap
				// thi van phai chang luon
				// boi vi khi snap, thi snap se can thiep vao trong handler default cua event mousewheel
				if(moveok){
					e.preventDefault();
					e.stopPropagation();
				};
				
			});
		};
		
		// bind event to use keyboard to move content element
		var allowKey = false;
		containerElement.hover(function(){allowKey=true;},function(){allowKey=false;});
		if(option.usekey){
			var keyhbup = true;
			zjs('body').on('keydown', function(event){
				
				
				// neu nhu hien tai dang su dung default cua browser thi
				// se khong xu ly gi them nua
				if(contentElement.getData(usedefaultkey))return;
				
				
				if(!canUseScroll() || !allowKey || !keyhbup) return;
				
				// kiem tra coi co tha key ra chua
				keyhbup = false;
				
				// kiem tra xem co move thanh cong hay khong
				var moveok = false;
				var _to = 0;
				
				if(!moveok && (event.getKeyCode()==40||event.getKeyCode()==38||event.getKeyCode()==37||event.getKeyCode()==39)){
					_to = _newScrollPositionMergeWithSnap(
						scrollPosition(), 
						(event.getKeyCode() == 40 || event.getKeyCode() == 39) ? -1 : 1, 
						false, 
						((event.getKeyCode() == 40 && option.snapScrollDown) || (event.getKeyCode() == 39 && option.snapScrollUp))
					);
					moveok = runMoveContentEl(_to);
				};
				if(!moveok && option.horizontal && (event.getKeyCode()==37||event.getKeyCode()==39)){
					_to = _newScrollPositionMergeWithSnap(
						scrollPosition(), 
						event.getKeyCode() == 39 ? -1 : 1, 
						false,
						true
					);
					moveok = runMoveContentEl(_to);
				};
				if(!moveok && event.getKeyCode()==36){
					if(option.horizontal)return runMoveContentEl(contentWidth);
					moveok = runMoveContentEl(contentHeight);
				};
				if(!moveok && event.getKeyCode()==35){
					if(option.horizontal)return runMoveContentEl(-contentWidth);
					moveok = runMoveContentEl(-contentHeight);
				};
				if(!moveok && event.getKeyCode()==33){
					if(option.horizontal)moveok = runMoveContentEl(scrollPosition() + containerWidth);
					else moveok = runMoveContentEl(scrollPosition() + containerHeight);
				};
				if(!moveok && event.getKeyCode()==34){
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
				// willPreventDefault: true,
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
		var touchstart = {x:-1,y:-1,h:-1,t:0};
		var touchmove = {x:-1,y:-1,h:-1,t:0};
		if(option.usetouch && zjs.isTouchDevice()){
			containerElement.on('touchstart', function(event, element){
				
				// neu nhu hien tai dang su dung default cua browser thi
				// se khong xu ly gi them nua
				if(contentElement.getData(usedefaultkey))return;
			
				//event.preventDefault();
				scrollbarHideTimer.stop();
				stopMomentum();
				touchstart = {x:event.touchX(), y:event.touchY(), h:scrollPosition(), t:event.timeStamp()};
			});
			containerElement.on('touchmove', function(event, element){
				
				// >>>>>>>>
				//console.log('touchmove');
				
				// neu nhu hien tai dang su dung default cua browser thi
				// se khong xu ly gi them nua
				if(contentElement.getData(usedefaultkey))return;
				
				if(option.nonui)return;
			
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
				
				// neu nhu hien tai dang su dung default cua browser thi
				// se khong xu ly gi them nua
				if(contentElement.getData(usedefaultkey))return;
			
				//event.preventDefault();
				scrollbarHideTimer.run();			
				doMomentum();
				touchstart = {x:-1,y:-1};
				touchmove = {x:-1,y:-1};
			});
		};
		
		var doMomentum = function(event){
			
			if(option.nonui)return;
		
			var velocity = (touchmove.y - touchstart.y) / (touchmove.t - touchstart.t);if(isNaN(velocity))velocity = 0;
			var acceleration = velocity < 0 ? 0.0005 : -0.0005;
			var displacement = - (velocity * velocity) / (2 * acceleration);
			var time = - velocity / acceleration;
			
			var to = contentElementPosition + displacement;
			// >>>>>>>
			//console.log('to = contentElementPosition + displacement', displacement);
			
			if(!option.nonui && option.horizontal  && to < containerWidth  - contentWidth){if(velocity<0 && to > containerWidth  - contentWidth-500)time=180;to = containerWidth  - contentWidth;};
			if(!option.nonui && !option.horizontal && to < containerHeight - contentHeight){if(velocity<0 && to > containerHeight - contentHeight-500)time=180;to = containerHeight - contentHeight;}
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
			
			if(option.nonui)return;
			
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
				if(option.nonui)return;
				
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
				return runMoveContentEl(_newScrollPositionMergeWithSnap(scrollPosition(), -1, false, true));
			},
			scrollPrevSnap: function(){
				return runMoveContentEl(_newScrollPositionMergeWithSnap(scrollPosition(), 1, false, true));
			},
			scrollToTop: function(){
				if(option.nonui)
					return runMoveContentEl(0);
				if(option.horizontal)
					return runMoveContentEl(contentWidth);
				return runMoveContentEl(contentHeight);
			},
			scrollToEnd: function(){
				if(option.nonui)
					return runMoveContentEl(-option.nonuiMaxScroll);
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
			containerElement.setData(contentElkey, contentElement);
			contentElement.setData(containerElkey, containerElement);
			contentElement.setData(listFunctionsKey, listUtilFunctions);
		};
		
		// tao ra 1 timer interval de handler autorefresh
		if(!option.nonui && option.autorefresh){
			window.setInterval( 
				function(){
					if(stopAutorefresh)return;
					runMoveContentEl(scrollPosition(), true);
				}, option.autorefreshtime);
		};
		
		// bind them event khi window resize
		// de chac chan la size cua scroll se duoc
		// fix triet de, neu nhu la body scroll
		if(isBodyScroll){
			var maxW600 = option.autoUseDefaultWhenWidthLessThan,
				isMaxW600 = (windowEl.width() <= maxW600);
			
			// ham de xu ly viec su dung hay ko su dung default scroll auto
			var handlerAutoUseOrNotuseDefault = function(){
				// neu nhu co yeu cau ve tu dong chuyen sang default nay no
				// thi moi di xu ly
				if(maxW600 > 0){
					// xem coi qua cot moc 600px chua?
					if(windowEl.width() <= maxW600 && !isMaxW600){
						isMaxW600 = true;
						//console.log('<= 600');
						// turn off custom scroll, use browser default
						bodyElement.scrollbarUseDefault(true);
					};
	
					if(windowEl.width() > maxW600 && isMaxW600){
						isMaxW600 = false;
						//console.log('> 600');
						// turn on custom scroll
						bodyElement.scrollbarUseDefault(false);
					};
				};
			};
			
			// bind event xu ly khi window resize
			windowEl.on('resize', function(){
				bodyElement.refreshScroll();
				
				//
				handlerAutoUseOrNotuseDefault();
			
				// run callback & trigger a event
				option.onResize(-scrollPosition(), containerWidth, containerHeight);
				bodyElement.trigger('scrollbar:windowResize', {scrollTop:-scrollPosition(), width:containerWidth, height:containerHeight});
			});
			
			// first handler
			isMaxW600 = !isMaxW600;
			handlerAutoUseOrNotuseDefault();
			
		};
		
		
		// xem coi phai mobile thi se su dung default thoi
		if(option.autoUseDefaultWithMobile && isMobile){
			if(isBodyScroll)bodyElement.scrollbarUseDefault(true);
			else contentElement.scrollbarUseDefault(true);
		};
		
		
		// sau khi lam xong het roi, thi bay gio se trigger 1 cai event khi khoi tao xong
		if(isBodyScroll)bodyElement.trigger('scrollbar:ready');
		else contentElement.trigger('scrollbar:ready');
	
		
		// support scroll den dung vi tri cua hash
		if(isBodyScroll){(function(){
			if(document.location.hash != '')
				bodyElement.scrollToElement(document.location.hash);
		}).delay(500);};
		
		
	// end makeScrollbar
	};
	
	
	// refresh snap positions
	var scrollbarRefreshSnapPositions = function(element){

		var contentElement = zjs(element),
			isBodyScroll = (element==window.document.body);
		
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
				_zSnapEls.eachElement(function(_snapElements){
					_snapElements = zjs(_snapElements);
					
					_contentElementSnapPositions.push( (isBodyScroll ? (
						option.horizontal ? _snapElements.getAbsoluteLeft() : _snapElements.getAbsoluteTop()
					):(
						option.horizontal ? _snapElements.left() : _snapElements.top()
					)) + parseInt(_snapElements.getAttr('data-snap-modify-px', 0)) );
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
	
	
	// set linked-wrapper-size element: cai nay quan trong
	// day se la element giup set size cho thang scrollbar
	var scrollbarSetWrapperSizeElement = function(element, wrapperElement, setall){
		
		setall = setall || false;
	
		var contentElement = zjs(element);
		
		// test xem scrollbar da duoc khoi tao truoc do chua?
		// neu chua co thi thoi bo qua
		var option = contentElement.getData(optionkey, false),
			containerEl = contentElement.getData(containerElkey, false);
		if(!option)
			return false;
			
		// set thoi
		//contentElement.setData(wrapperSizeElkey, wrapperElement);
		
		// moi khi thang wrapper nay resize thi se update lai size cua thang scrollbar
		zjs(wrapperElement).on('resize', function(){
			
			// bay gio xem coi dang la scroll theo vertical hay la horizontal
			// chi set 1 chieu thoi
			if(!option.horizontal){
				// set chieu doc thoi
				containerEl.height(this.height());
				// neu nhu co set all thi moi coi coi set chieu ngang luon
				if(setall)
					containerEl.width(this.width());
			};
			
		});
	};
	
	
	// back to use default browser scrollbar
	var scrollbarUseDefault = function(element, bool){
		
		bool = bool || false;
		
		var contentElement = zjs(element),
			containerElement = contentElement.getData(containerElkey);
		
		// test xem scrollbar da duoc khoi tao truoc do chua?
		// neu chua co thi thoi bo qua
		var option = contentElement.getData(optionkey, false);
		if(!option)
			return false;
		
		if(element==window.document.body){
		
			var bodyElement = zjs(element);
			contentElement = bodyElement.getData(contentElkey);
			
			if(bool)bodyElement.addClass(option.customUsedefaultCssClass);
			else bodyElement.removeClass(option.customUsedefaultCssClass);
			contentElement.setData(usedefaultkey, bool);
		
		}else{
			
			if(bool)containerElement.addClass(option.customUsedefaultCssClass);
			else containerElement.removeClass(option.customUsedefaultCssClass);
			contentElement.setData(usedefaultkey, bool);
		};
	};
	
	
	// --
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeScrollbar: function(useroption){
			return this.eachElement(function(element){makeScrollbar(element, useroption)});
		},
		pauseScrollEvent: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.pauseScrollEvent == 'function')
					listFunctions.pauseScrollEvent();
			});
		},
		continueScrollEvent: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.continueScrollEvent == 'function')
					listFunctions.continueScrollEvent();
			});
		},
		refreshScroll: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.refreshScroll == 'function')
					listFunctions.refreshScroll();
				scrollbarRefreshSnapPositions(element);
			});
		},
		scrollbarRefreshSnapPositions: function(){
			return this.eachElement(function(element){scrollbarRefreshSnapPositions(element)});
		},
		
		scrollLineUp: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollLineUp == 'function')
					listFunctions.scrollLineUp();
			});
		},
		scrollLineLeft: function(){
			return this.scrollLineUp();
		},
		scrollLineDown: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollLineDown == 'function')
					listFunctions.scrollLineDown();
			});
		},
		scrollLineRight: function(){
			return this.scrollLineDown();
		},
		scrollPageUp: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollPageUp == 'function')
					listFunctions.scrollPageUp();
			});
		},
		scrollPageDown: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollPageDown == 'function')
					listFunctions.scrollPageDown();
			});
		},
		scrollNextSnap: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollNextSnap == 'function')
					listFunctions.scrollNextSnap();
			});
		},
		scrollPrevSnap: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollPrevSnap == 'function')
					listFunctions.scrollPrevSnap();
			});
		},
		scrollToTop: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollToTop == 'function')
					listFunctions.scrollToTop();
			});
		},
		scrollToEnd: function(){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollToEnd == 'function')
					listFunctions.scrollToEnd();
			});
		},
		scrollToBottom: function(){return this.scrollToEnd();},
		scrollTo: function(pixel,notSmooth){
			return this.eachElement(function(element){
				var listFunctions = zjs(element).getData(listFunctionsKey);
				if(typeof listFunctions.scrollTo == 'function')
					listFunctions.scrollTo(pixel,notSmooth);
			});
		},
		scrollToElement: function(query, pixel, notSmooth){
			return this.eachElement(function(element){
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
		},
		
		
		//
		scrollbarUseDefault: function(bool){
			// scrolltop cai da roi tinh sau
			this.scrollToTop();
			return this.eachElement(function(element){scrollbarUseDefault(element, bool)});
		},
		
		//
		scrollbarSetWrapperSizeElement: function(wrapperElement){
			return this.eachElement(function(element){scrollbarSetWrapperSizeElement(element, wrapperElement)});
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
	//zjs.onload(function(){zjs('.zscroll').makeScrollbar()});
	zjs.onready(function(){zjs('.zscroll').makeScrollbar()});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('scrollbar');
	
})(zjs);
