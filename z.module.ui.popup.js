// MODULE UI POPUP
zjs.require('ui', function(){
"use strict";
	
	var optionkey = 'zmoduleuipopupoption',
		pagecoverElKey = 'zmoduleuipopupcoverel',
		scrollwrapElKey = 'zmoduleuipopupscrollwrapel',
		showedScrolltopkey = 'zmoduleuipopupscrolltop',
		fixedBodyElKey = 'zmoduleuipopupfixedbodyel',
		wrapFixedBodyElKey = 'zmoduleuipopupwrapfixedbodyel';
	
	// support scrollbar module
	var scrollbaroptionkey = 'zmodulescrollbaroption',
		scrollbarContentElkey = 'zmodulescrollbarcontentel';
		
	// extend core mot so option
	zjs.extendCore({
		moduleUiPopupOption: {
			width: 'auto',
			height: 'auto',
			autoshow: false,
			autoshowDelay: 0,
			closebutton: true,
			closethenremove: false,
			pagecover: true,
			hidePagecoverWhenWindowWidthLessThan: 0,
			pagecoverClass: '',
			clickout: false,
			pressEsc: true,
			pullDown: false,
			center: true,
			centerY: false, 
			fade: true,
			fadeCover: false,
			fadeTime: 500,
			animate: false,
			animateTime: 1000,
			animateName:'',
			longPopup: 'mobileOnly', 		// false | true | "mobileOnly"
			scrollPopup: true, 				// false | true | "mobileOnly"
			disableWindowScroll: false,		// false | true | "mobileOnly"
		}
	});
	
	// trigger
	//ui:popup:beforehide
	//ui:popup:hide
	//ui:popup:show
	//ui:popup:aftershow
	//ui:popup:refresh
	
	// template
	var popupclass = 'zui-popup',
		hideclass = 'zui-popup-hide',
		longpopupclass = 'zui-long-popup',
		bodyclasswhenlongpopup = 'zui-long-popup-is-open',
		bodyclasswhenscrollpopup = 'zui-scroll-popup-is-open',
		fixedcontentwrapclass = 'zui-long-popup-fixed-content-wrap',
		scrollwrapclass = 'zui-popup-scrollwrap',
		coverclass = 'zui-popup-page-cover',
		wrapclass = 'zui-popup-wrapper',
		centerclass = 'zui-popup-center',
		activeclass = 'active',
		_closehtml = '<a class="zui-popup-close">×</a>',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh zpopupuninithide zpopupuninithideh',

		// neu nhu element co cai class nay
		// thi se khong cho vao trong locked-div khi show len long popup
		zpreventlongpopup = 'zpreventlongpopup',

		// zui-freezepanel zui-freezing
		zfreezepanelfreezingclass = 'zui-freezing';

	
	// static variable
	// luu vao top frame luon cho chac
	var getPopuplastindex = (function(){
		// test coi co duoc access vao trong top khong
		var topWindowAccess = false;
		try{var a = typeof top.document;
		top.document.body.offsetTop = top.document.body.offsetTop;
		topWindowAccess = true;
		}catch(er){}
		
		if(topWindowAccess){if(isNaN(top.popuplastindex))top.popuplastindex = 10000;}
		else{if(isNaN(window.popuplastindex))window.popuplastindex = 10000;}
		
		return function(){
			if(topWindowAccess)return top.popuplastindex++;
			return window.popuplastindex++;
		};
	})();
	
	// cho 1 thang de luu vao last popup duoc show ra, de ma su dung duoc phim esc
	var zpopupelementstackesc = [];
	var zpopupelementstackpull = [];
	var countlongpopupinpage = [];
	var countscrollpopupinpage = 0;
	var zWindow = zjs(window);
	var wrapFixedBodyEl = false;

	// - - - - - - - - -
	// MAIN FUNCTIONS
	var makePopup = function(element, useroption){

		var zPopupEl = zjs(element);
		
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zPopupEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zPopupEl.setData(optionkey, zjs.extend(option, useroption));
			if(option.animate && option.animateTime)
				zPopupEl.setStyle('animation-duration', option.animateTime+'ms');
			return;
		}
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiPopupOption);
		// extend from inline option ?
		var inlineoption = zPopupEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zPopupEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// fix option:
		option.fadeTime = parseInt(option.fadeTime);
		// fix option:
		// neu nhu ma co animate thi se khong co fade, keo lai bi conflict
		if(option.animate)option.fade = !(option.fadeCover = true);
		option.animateTime = parseInt(option.animateTime);
		option.animateCoverTime = parseInt(option.animateCoverTime);

		// scrollPopup cung giong nhu long popup
		// nhung khong phai su dung co che wrap all content into fixed div
		// thay vao do de su dung 1 div rieng de scroll cai popup
		// neu nhu su dung mobileOnly thi se fallback ve long popup cho khoe
		if(option.scrollPopup === 'mobileOnly'){
			option.longPopup = 'mobileOnly';
			option.scrollPopup = false;
		}

		// neu nhu su dung longpopup thi se khong co vu centerY, vi top se duoc set trong css
		// boi vi longPopup bay gio se ho tro value 'mobileOnly' nen check ky 1 xiu
		if(option.longPopup === 'mobileOnly')
			option.longPopup = zjs.isMobileDevice();
		if(option.longPopup === true)
			option.centerY = option.scrollPopup = false;


		option.autoshow = !!option.autoshow;
		option.autoshowDelay = parseInt(option.autoshowDelay);
		if(isNaN(option.autoshowDelay)){
			option.autoshowDelay = 0;
		}

		option.hidePagecoverWhenWindowWidthLessThan = parseInt(option.hidePagecoverWhenWindowWidthLessThan);
		if(option.hidePagecoverWhenWindowWidthLessThan < 0)
			option.hidePagecoverWhenWindowWidthLessThan = 0;

		// save option
		zPopupEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// se stop lai hook ngay luc nay keo lai bi loi~ nua
		var bakHookStatus = zjs.enablehook();
		zjs.enablehook(false);
		// --
		
		// add class for popup
		zPopupEl.addClass(popupclass);
		
		if(option.center)
			zPopupEl.addClass(centerclass);
		if(option.animate)
			zPopupEl.addClass(option.animateName).setStyle('animation-duration', option.animateTime+'ms');

		if(option.longPopup || option.scrollPopup)
			zPopupEl.appendTo(document.body);
		
		// popup scrollwrap
		var zPopupScrollwrapEl = zjs();
		if(option.scrollPopup!==false){
			zPopupScrollwrapEl = zjs('<div>').addClass(scrollwrapclass).hide();
			zPopupScrollwrapEl.insertBefore(zPopupEl);
			zPopupScrollwrapEl.append(zPopupEl);
		}
		zPopupEl.setData(scrollwrapElKey, zPopupScrollwrapEl);

		// popup page cover
		var zPopupPCoverEl = zjs();
		if(option.pagecover){
			//if(option.pagecoverOnlyOnDesktop && zjs.isMobileDevice()){
			//@todo:
			//}
			zPopupPCoverEl = zjs('<div>').addClass(coverclass);
			// xem coi cai popup element co cai id nao ko?
			// co thi set cho cai thang cover luon
			var _id = zPopupEl.getAttr('id', '');
			if(_id!='')zPopupPCoverEl.addClass(coverclass+'-'+_id);
			if(option.pagecoverClass)zPopupPCoverEl.addClass(option.pagecoverClass);
		}
		zPopupEl.setData(pagecoverElKey, zPopupPCoverEl);
		
		// popup wrapper
		var zPopupWrapEl = zjs('<div>').addClass(wrapclass);
		
		// copy het noi dung qua wrapper
		zPopupEl.child().eachElement(function(el){zPopupWrapEl.append(el)});
		zPopupEl.append(zPopupWrapEl);
		
		// --
		// xong het roi thi bay gio moi set lai tinh trang cua hook
		zjs.enablehook(bakHookStatus);
		
		// find coi coi trong day co element nao duoc
		// chon de su dung nhu la nut close hay khong
		var zPopupCloseEl = zPopupEl.find('.zpopupclose');
		// neu nhu ma nguoi dung chua chuan bi nut close
		// thi module se tu tao ra 1 cai nut
		// voi dieu kien la trong option cho phep
		if(zPopupCloseEl.count()==0 && option.closebutton)
			zPopupCloseEl = zjs(_closehtml).prependTo(zPopupEl);
		// bind event cho cai nut close nay luon
		zPopupCloseEl.click(function(event, el){
			if(zjs(this).hasClass('disabled'))return;
			popupHide(element);
		});
		
		// xong xuoi het roi thi remove di un-init class thoi
		zPopupEl.removeClass(uninitclass);
		
		// show or hide popup
		if(option.autoshow){
			zPopupEl.addClass(hideclass);
			(function(){
				popupShow(element);
			}).delay(option.autoshowDelay);
		}
		else{
			zPopupEl.addClass(activeclass);
			popupHide(element, true, true);
		}
		
		// bind event cho window khi ma resize
		zWindow
			.on('resize', function(){popupAlignTop(element)})
			.on('scroll', function(){popupAlignTop(element)});


		// Support click outside to hide popup
		if(option.clickout){
			zPopupPCoverEl.click(function(){popupHide(element)});
			if(option.scrollPopup!==false){
				zPopupScrollwrapEl.click(function(event){
					if(event.target() === this.item(0,1))popupHide(element);
				});
			}
		}
	},
	
	// luu lai 1 so timer cho chac
	timer1 = false,
	timer2 = false,
	
	popupShow = function(element, showOption){
		// check coi co phai la popup hay khong
		var zPopupEl = zjs(element);
		var option = zPopupEl.getData(optionkey);
		if(!option)return;

		// xem coi neu nhu popup chua active thi moi can phai show
		if(zPopupEl.hasClass(activeclass))return;

		// co can thiet show page cover hay khong?
		var needShowPagecover = true;
		if(option.hidePagecoverWhenWindowWidthLessThan > 0){
			if(zWindow.width() <= option.hidePagecoverWhenWindowWidthLessThan){
				needShowPagecover = false;
			}
		}

		if(needShowPagecover)
			var pagecoverEl = zPopupEl.getData(pagecoverElKey).insertBefore(zPopupEl).hide().setStyle('z-index', getPopuplastindex());

		zPopupEl.removeClass(hideclass).setStyle('z-index', getPopuplastindex());
		
		// xem coi dang su dung default scroll hay la custom scrollbar
		// de biet ma xu ly cho phu hop
		var isInUsedBodyScrollbarModule = !!zjs(document.body).getData(scrollbaroptionkey, false);
		
		// save lai current scrolltop cua body
		// de co gi thi dung lai
		var _scrollTop = !isInUsedBodyScrollbarModule ? zjs(document.body).scrollTop() : zjs(document.body).scrollPosition();
		zPopupEl.setData(showedScrolltopkey, _scrollTop);

		// save lai cai instance id
		var popupShowInstanceId = zjs.getUniqueId();
		zPopupEl.setAttr('data-show-instance', popupShowInstanceId);
		
		// neu nhu la longpopup
		// thi cho nay phai can thiep 1 xiu vao thang body
		if(option.longPopup){
			var bakHookStatus = zjs.enablehook();
			zjs.enablehook(false);

			// dau tien la add cho no cai class, neu dung la no
			zPopupEl.addClass(longpopupclass);

			// neu day la long popup dau tien
			if(countlongpopupinpage.length === 0){

				// tao ra 1 cai fix element de co dinh body lai
				var fixedBodyEl = zjs('<div></div>');
				
				var listElsHasSwap = [];

				var _topContentEl = !isInUsedBodyScrollbarModule ? zjs(document.body) : zjs(document.body).getData(scrollbarContentElkey, false);
				if(_topContentEl){
					_topContentEl.child().eachElement(function(el){
						if(el.tagName == 'SCRIPT' 
						|| el.tagName == 'LINK' 
						|| zjs(el).hasClass(popupclass) 
						|| zjs(el).hasClass(coverclass) 
						|| zjs(el).hasClass(zpreventlongpopup)
						|| zjs(el).hasClass(zfreezepanelfreezingclass)
						|| zjs(el).getAttr('id') == 'fb-root'
						){
							// swap luon neu can thiet
							if(zjs(el).hasClass(zfreezepanelfreezingclass)){
								// stop handler freezing function
								zjs(el).freezepanelDisableHandler(true);
								var swapEl = zjs('<span></span>').appendTo(fixedBodyEl);
								zjs(el).setData('zlongpopupswapel', swapEl);
								listElsHasSwap.push(el);
							};
							return;
						}
						fixedBodyEl.append(el);
					});
					// tao ra 1 thang wrap cai thang nay luon
					if(!wrapFixedBodyEl)
						wrapFixedBodyEl = zjs('<div></div>').setStyle({
							position:'fixed',width:'100%',height:'100%',overflow:'hidden',top:0,
						});

					// luon luon prepend vao cai body that
					//_bodyEl.prepend(fixedBodyEl);
					zjs(document.body).prepend(wrapFixedBodyEl);
					fixedBodyEl.addClass(fixedcontentwrapclass).setStyle({position:'absolute',width:'100%'}).top(-_scrollTop).appendTo(wrapFixedBodyEl);
					
					if(!isInUsedBodyScrollbarModule)document.body.scrollTop = 0;
					else zjs(document.body).refreshScroll().scrollTo(0, true);//notSmooth = true
					
					zPopupEl.setData(fixedBodyElKey, fixedBodyEl);

					// add class to body
					// cho scroll ve vi tri 0 luon
					zjs(document.body).setStyle('scrollTop', 0).addClass(bodyclasswhenlongpopup);
				};

				// va cuoi cung la phai loai bo ra nhung thang ma duoc "preventlongpopup"
				fixedBodyEl.find('.'+zpreventlongpopup+',.'+zfreezepanelfreezingclass).eachElement(function(el){
					// tao cho no 1 thang the chan (giu cho)
					var swapEl = zjs('<span></span>').insertBefore(el);
					zjs(el).setData('zlongpopupswapel', swapEl).insertBefore(wrapFixedBodyEl);
					listElsHasSwap.push(el);
				});
				// save lai luon
				zPopupEl.setData('zlongpopuplistelswap', listElsHasSwap);

			}
			// cac long popup tiep theo thi don gian hon
			// chi can move thang long popup truoc do thoi la duoc
			else{
				// tao ra 1 cai fix element de co dinh long popup truoc lai
				var fixedBodyEl = zjs('<div></div>');
				var lastLongPopupEl = zjs('.zui-long-popup[data-show-instance="'+countlongpopupinpage.last()+'"]');
				fixedBodyEl.append(lastLongPopupEl.getData(pagecoverElKey));
				fixedBodyEl.append(lastLongPopupEl);
				fixedBodyEl.setStyle({position:'absolute',width:'100%'}).top(-_scrollTop).appendTo(wrapFixedBodyEl);

				zPopupEl.setData(fixedBodyElKey, fixedBodyEl);
				// cho scroll ve vi tri 0 luon
				zjs(document.body).setStyle('scrollTop', 0);
			}

			countlongpopupinpage.push(popupShowInstanceId);

			zjs.enablehook(bakHookStatus);
		}
		// neu nhu la scroll popup
		else if(option.scrollPopup){
			var scrollwrapEl = zPopupEl.addClass(longpopupclass).getData(scrollwrapElKey).show().setStyle('scrollTop', 0).setStyle('z-index', getPopuplastindex());
			// move cai pagecover luon
			if(needShowPagecover)
				pagecoverEl.insertBefore(scrollwrapEl);

			if(countscrollpopupinpage === 0){
				zjs(document.body).addClass(bodyclasswhenscrollpopup);

				// get scroll width
				var scrw = getScrollbarWidth();
				if(scrw > 0){
					var currentBodyPaddingRight = zjs(document.body).getStyle('padding-right').toInt();
					if(currentBodyPaddingRight > 0){
						zjs(document.body).setData('data-bakpdr', currentBodyPaddingRight);
						scrw += currentBodyPaddingRight;
					}
					zjs(document.body).setStyle('padding-right', scrw);
				}
			}

			countscrollpopupinpage++;
		}
		// neu nhu lam binh thuong
		else{
			// remove class neu nhu khong phai
			zPopupEl.removeClass(longpopupclass);
		};
		
		var delayShownTime = 0;
		popupRefresh(element);
		// neu nhu fade (old version) thi se dung script de fade
		if(option.fade){
			zPopupEl.fadeIn({time:option.fadeTime});
			delayShownTime = option.fadeTime;
		}
		if(option.fadeCover)zPopupEl.getData(pagecoverElKey).fadeIn({time:option.fadeTime});
		else zPopupEl.getData(pagecoverElKey).show();
		// neu nhu animate thi se add cac class phu hop de ma dung css3 animate
		if(option.animate){
			// stop timer truoc do cho chac an
			window.clearTimeout(timer1);window.clearTimeout(timer2);
			zPopupEl.addClass('showing zanimate zanimate-start');
			timer1 = (function(){zPopupEl.addClass('zanimate-end')}).delay(option.animateTime);
			timer2 = (function(){zPopupEl.removeClass('showing zanimate zanimate-start zanimate-end')}).delay(option.animateTime + 100);
			delayShownTime = option.animateTime;
		};
		// add class cho popup
		// run trigger
		zPopupEl.addClass(activeclass).trigger('ui:popup:show');
		if(zPopupEl.hasClass(centerclass))popupAlignTop(element);
		
		// support press esc
		if(option.pressEsc){
			bindPressEsc();
			zpopupelementstackesc.push(popupShowInstanceId)
		}
		// support pull down on mobile only
		if(option.pullDown && option.longPopup && zjs.isMobileDevice()){
			bindPullDown();
			zpopupelementstackpull.push(popupShowInstanceId);
		}
		
		// helper 1 xiu cho form cho vui
		// cai nay se auto focus may cai field luon
		(function(){
			zPopupEl.find('.autofocus').focus();
			if(option.disableWindowScroll && ('disableScroll' in zWindow)){
				if(option.disableWindowScroll === 'mobileOnly'){
					if(zjs.isMobileDevice())
						zWindow.disableScroll();
				}
				else{
					zWindow.disableScroll();
				}
			}
			// set cai class cho page cover
			zPopupEl.getData(pagecoverElKey).addClass(activeclass);
			// call callback
			if(showOption && zjs.isFunction(showOption.callback)){
				showOption.callback.call(zPopupEl, element);
			}
			zPopupEl.trigger('ui:popup:aftershow');
		}).delay(delayShownTime+100);

	},
	
	popupHide = function(element, notUseFade, initHide){
		// check coi co phai la popup hay khong
		var zPopupEl = zjs(element);
		var option = zPopupEl.getData(optionkey);
		if(!option)return;

		// xem coi neu nhu popup phai active roi thi moi can phai hide
		if(!zPopupEl.hasClass(activeclass))return;
		if(zPopupEl.hasClass(hideclass))return;


		zPopupEl.trigger('ui:popup:beforehide');

		// remove cai class cho page cover
		zPopupEl.getData(pagecoverElKey).removeClass(activeclass);

		// khi hide popup thi se uu tien xu ly cai scroll truoc
		if(option.disableWindowScroll && ('enableScroll' in zWindow)){
			if(option.disableWindowScroll === 'mobileOnly'){
				if(zjs.isMobileDevice())
					zWindow.enableScroll();
			}
			else{
				zWindow.enableScroll();
			}
		}


		var _popupHide = function(){
			zPopupEl.addClass(hideclass);
			// run trigger
			zPopupEl.removeClass(activeclass).trigger('ui:popup:hide');
			
			// longPopup or have fixedBodyElement?
			var fixedBodyEl = zPopupEl.getData(fixedBodyElKey, false);
			if(fixedBodyEl){

				// xem coi dang su dung default scroll hay la custom scrollbar
				// de biet ma xu ly cho phu hop
				var isInUsedBodyScrollbarModule = !!zjs(document.body).getData(scrollbaroptionkey, false);
				var _showedScrollTop = zPopupEl.getData(showedScrolltopkey, 0);

				if(countlongpopupinpage.length)
					countlongpopupinpage.pop();

				// neu day la long popup cuoi cung
				// thi se restore ve body
				if(countlongpopupinpage.length === 0){
					
					zPopupEl.setData(fixedBodyElKey, false);
					
					if(isInUsedBodyScrollbarModule){
						var topContentEl = zjs(document.body).getData(scrollbarContentElkey, false);
						topContentEl.prepend(fixedBodyEl);
					};
					fixedBodyEl.child().eachElement(function(el){
						zjs(el).insertBefore(wrapFixedBodyEl)
					});
						
					fixedBodyEl.remove();
					wrapFixedBodyEl.remove();
					
					// reset current scroll position
					if(!isInUsedBodyScrollbarModule)zjs(document.body).setStyle('scrollTop', _showedScrollTop);
					else zjs(document.body).refreshScroll().scrollTo(_showedScrollTop, true);//notSmooth = true

					// remove class out of body
					zjs(document.body).removeClass(bodyclasswhenlongpopup);

					// tra ve vi tri dung cho may cai element bi swap
					var listElsHasSwap = zPopupEl.getData('zlongpopuplistelswap', []);
					if(listElsHasSwap.length>0)listElsHasSwap.eachItem(function(el){
						var swapEl = zjs(el).getData('zlongpopupswapel', false);
						if(swapEl)zjs(el).insertBefore(swapEl);
						swapEl.remove();
						if(zjs(el).hasClass(zfreezepanelfreezingclass)){
							zjs(el).freezepanelDisableHandler(false);
						}
					});
				}
				// cac long popup truoc do thi don gian hon
				// chi can move thang long popup truoc do thoi la duoc
				else{
					// tao ra 1 cai fix element de co dinh long popup truoc lai
					var lastLongPopupEl = zjs('.zui-long-popup[data-show-instance="'+countlongpopupinpage.last()+'"]');
					// var fixedBodyEl = zjs('<div></div>');
					
					zjs(document.body).append(lastLongPopupEl.getData(pagecoverElKey));
					zjs(document.body).append(lastLongPopupEl);
					zPopupEl.getData(fixedBodyElKey).remove();

					// reset current scroll position
					zjs(document.body).setStyle('scrollTop', 0);
					if(!isInUsedBodyScrollbarModule)zjs(document.body).setStyle('scrollTop', _showedScrollTop);
				}

			}
			
			// closethenremove ?
			if(!initHide && option.closethenremove){
				if(option.scrollPopup!==false){
					zPopupEl.getData(scrollwrapElKey).remove();
				}else{
					zPopupEl.remove();
				}
			}

		},
		_popupCoverHide = function(){
			if(zPopupEl){
				var _coverEl = zPopupEl.getData(pagecoverElKey);
				if(_coverEl)_coverEl.remove(false);

				// neu nhu la scroll popup, thi hide luon scrollwrap
				if(option.scrollPopup!==false){
					zPopupEl.getData(scrollwrapElKey).hide();
					if(countscrollpopupinpage > 0)countscrollpopupinpage--;
					if(countscrollpopupinpage === 0)
						zjs(document.body).removeClass(bodyclasswhenscrollpopup).setStyle('padding-right', '');
				}
			}
		};
		
		notUseFade = notUseFade || false;
		
		// --
		
		// Phai remove page cover truoc
		// chi remove pagecoverElKey thoi
		// khong remove deep, vay nen set remove(deep = false)
		if(!notUseFade && option.fadeCover)zPopupEl.getData(pagecoverElKey).fadeOut({time:option.fadeTime, callback:_popupCoverHide});
		
		else _popupCoverHide();
		
		// ---
		
		var delayHideTime = 0;
		// hide popup sau
		if(!notUseFade && option.fade && !option.animate){
			zPopupEl.fadeOut({time:option.fadeTime, callback:_popupHide});
			delayHideTime = option.fadeTime;
		}

		// neu nhu animate thi se add cac class phu hop de ma dung css3 animate
		else if(!notUseFade && option.animate){
			// stop timer truoc do cho chac an
			window.clearTimeout(timer1);window.clearTimeout(timer2);
			zPopupEl.addClass('hiding zanimate zanimate-start');
			timer1 = (function(){zPopupEl.addClass('zanimate-end')}).delay(option.animateTime);
			timer2 = (function(){zPopupEl.removeClass('hiding zanimate zanimate-start zanimate-end');_popupHide()}).delay(option.animateTime + 100);
			delayHideTime = option.animateTime;
		}
		
		else _popupHide();
		
		
		// xoa di thong tin show instance
		zPopupEl.removeAttr('data-show-instance');

	},
	
	popupRefresh = function(element){
		// check coi co phai la popup hay khong
		var zPopupEl = zjs(element);
		if(!zPopupEl.getData(optionkey))return;
		if(zPopupEl.hasClass(hideclass))return;
		// fix show to center
		if(zPopupEl.hasClass(centerclass))popupAlignTop(element);
		// run trigger
		zPopupEl.trigger('ui:popup:refresh');
	},
	
	popupAlignTop = function(element){
		// check coi co phai la popup hay khong
		var zPopupEl = zjs(element);
		var option = zPopupEl.getData(optionkey);
		if(!option)return;
		if(!zPopupEl.hasClass(centerclass))return;
		var diffHeight = zWindow.height() - zPopupEl.height();
		
		// uu tien xem set de set margin theo relative popup (longPopup)
		if(option.longPopup || option.scrollPopup){
			// neu nhu winheight > popup height thi moi can thiet
			// con neu nhu khong thi thoi, cho tu xu trong css luon cho don gian
			if(diffHeight > 0)zPopupEl.setStyle('margin-top', diffHeight/2);
			else zPopupEl.setStyle('margin-top', '');
			
			// se anh huong den cac thang module khac
			// cho nene se can refresh
			(function(){zPopupEl.find('.zfreezepanel').trigger('trigger:refreshpanel')}).delay(100);
			
			return;
		};
		
		// ##
		// o duoi day thi moi la lam binh thuong (ko phai longPopup)
		// tuy nhien nen su dung longPopup se tot hon ve UX
		// set margin theo fixed popup
		if(diffHeight > 0){
			var marginTop = -zPopupEl.height()/2;
			// neu nhu ma khong can center chinh xac theo y thi se fix lai cai margin 1 ty cho dep
			if(!option.centerY)
				marginTop = marginTop - diffHeight / 6;
		}
		
		// neu nhu window height be hon thi phai xem set den scrolltop
		else{
			var saveScrollTop = zPopupEl.getData(showedScrolltopkey),
				diffScrollTop = saveScrollTop - document.body.scrollTop;

			if(diffScrollTop < diffHeight)diffScrollTop = diffHeight;
			if(diffScrollTop > 0)diffScrollTop = 0;
			
			var marginTop = -zPopupEl.height()/2 - diffHeight /2 + diffScrollTop;
		}
		zPopupEl.setStyle('margin-top', marginTop);
		
		// margin left
		zPopupEl.setStyle('margin-left', -zPopupEl.width()/2);
	};

	// helper
	var getScrollbarWidth = function(){ 
	    var divMersure = zjs('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>'); 
	    // Append our div, do our calculation and then remove it 
	    zjs(document.body).append(divMersure);
	    var w1 = divMersure.item(0, true).offsetWidth;
	    divMersure.setStyle('overflow', 'scroll');
	    var w2 = divMersure.item(0, true).clientWidth;
	    divMersure.remove(); 
	    return (w1 - w2); 
	};
	
		
	// bind event cho document
	var isBindPressEsc = false;
	function bindPressEsc(){
		if(isBindPressEsc)return;
		isBindPressEsc = true;
		zjs(document).on('keyup', function(event){
			if(event.getKeyCode() != 27)return;
			hideTheTopPopup(zpopupelementstackesc);
		});
	}

	var isBindPullDown = false;
	function bindPullDown(){
		if(isBindPullDown)return;
		isBindPullDown = true;
		var tssy;
		zjs(document).on('touchstart', function(event){
			tssy = window.scrollY;
		}).on('touchend', function(event){
			if(tssy < 100 && window.scrollY < -50){
				tssy = 9999;
				hideTheTopPopup(zpopupelementstackpull);
			}
		});
		
	}	

	function hideTheTopPopup(elmstack){
		// bay gio se la qua trinh di tim cai thang can phai remove nha
		var popupShowInstanceEl = false;
		while(elmstack.length > 0){
			var _id = elmstack.pop();
			popupShowInstanceEl = zjs('.zui-popup[data-show-instance="'+_id+'"]');
			if(popupShowInstanceEl.count()>0)break;
			else popupShowInstanceEl = false;
		}
		
		// xem coi co tim ra duoc khong?
		if(!popupShowInstanceEl)return;
		
		// tim duoc thi tam thoi prevent default lan ESC nay
		event.preventDefault();
		
		// hide thoi
		popupShowInstanceEl.popupHide();
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makePopup: function(useroption){
			return this.eachElement(function(element){makePopup(element, useroption)});
		},
		popupShow: function(showOption){
			return this.eachElement(function(element){popupShow(element, showOption)});
		},
		popupHide: function(){
			return this.eachElement(function(element){popupHide(element)});
		},
		popupRefresh: function(){
			return this.eachElement(function(element){popupRefresh(element)});
		},
		popupBackdrop: function(){
			return this.getData(pagecoverElKey);
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zpopup ko, neu nhu co thi se auto makePopup luon
			zjs(el).find('.zpopup').makePopup();
			// kiem tra xem thang cha co phai la popup hay khong
			// neu phai thi refresh cho no (lam den 3 cap cha thoi)
			zjs(el).parent().popupRefresh().parent().popupRefresh().parent().popupRefresh();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zpopup ko, neu nhu co thi se auto makePopup luon
			if(zjs(el).hasClass('zpopup'))zjs(el).makePopup();
			zjs(el).find('.zpopup').makePopup();
			// kiem tra xem thang cha co phai la popup hay khong
			// neu phai thi refresh cho no (lam den 3 cap cha thoi)
			zjs(el).parent().popupRefresh().parent().popupRefresh().parent().popupRefresh();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){zjs('.zpopup').makePopup()});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.popup');
});