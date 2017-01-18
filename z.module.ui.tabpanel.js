// MODULE UI TABPANEL
zjs.require('ui', function(){
	
	var optionkey = 'zmoduleuitabpaneloption',
		tabindexkey = 'data-tabindex',
		contentwrapidkey = 'zmoduleuitabpanelcontentwrapid',
		navwrapelkey = 'zmoduleuitabpanelnavwrapel',
		currenttabindexkey = 'zmoduleuitabpanelcurrindex',

		// support 
		scrollbarContentElkey = 'zmodulescrollbarcontentel',
		imageSliderOptionkey = 'zmoduleimageslideroption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiTabpanelOption: {
			childclass:'div',
			autoheight:false,
			transition:0,
			activetab:0,
			useurlhash:false,
			hover:false,

			contentWrapperClass: '',

			// option for responsive 
			// auto disable this "tab" module
			// when the width less than a [number]
			autoDisableWhenWidthLessThan: 0, 
			autoDisableWithMobile: false, 

			// like option for mobile, but this is for desktop
			autoDisableWhenWidthLargerThan: 0, 
		}
	});
	
	// trigger
	//ui:tabpanel:load
	//ui:tabpanel:change
	
	// template
	var tabpanelclass = 'zui-tabpanel',
		tabpanelautoheightclass = 'zui-tabpanel-autoheight',
		navclass = 'zui-tabpanel-nav-wrapper',
		navbottomclass = 'zui-tabpanel-nav-wrapper-bottom',
		contentwrapclass = 'zui-tabpanel-content-wrapper',
		contentclass = 'zui-tabpanel-content',
		contentactiveclass = 'zui-active',
		contentdeactiveclass = 'zui-deactive',
		disableclass = 'zui-disable',
		
		_contentwrapperhtml = '<div></div>',
		_contenthtml = '<div></div>';
		
	
	// static variable
	var lastindex = 0,
		windowEl = zjs(window);
		
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeTabpanel = function(element, useroption){

		var zTabPanelEl = zjs(element);
		
		
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zTabPanelEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zTabPanelEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
				
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiTabpanelOption);
		// extend from inline option ?
		var inlineoption = zTabPanelEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zTabPanelEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// fix option
		if(option.transition=='none')option.transition=0;
		if(option.transition=='fade'||option.transition=='fadein')option.transition=1;
		if(option.transition=='horizontal')option.transition=2;
		if(option.transition=='vertical')option.transition=3;
		if(option.transition.toInt()>3)option.transition=0;
		// first active tab
		if(!zjs.isNumeric(option.activetab))
			option.activetab = 0;
		// use has
		option.useurlhash=(!!option.useurlhash);
		// use hover to change tab
		option.hover = (!!option.hover);
		// auto disable option
		option.autoDisableWhenWidthLessThan = parseInt(option.autoDisableWhenWidthLessThan);
		if(option.autoDisableWhenWidthLessThan < 0)
			option.autoDisableWhenWidthLessThan = 0;
		//
		option.autoDisableWhenWidthLargerThan = parseInt(option.autoDisableWhenWidthLargerThan);
		if(option.autoDisableWhenWidthLargerThan < 0)
			option.autoDisableWhenWidthLargerThan = 0;
		// save option
		zTabPanelEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// add class & set id for tabpanel
		zTabPanelEl.addClass(tabpanelclass).setData(contentwrapidkey, zjs.getUniqueId());
		
		if(option.autoheight)
			zTabPanelEl.addClass(tabpanelautoheightclass);
		
		// build tabpanel struct
		var zNavWrapEl = false,
			zContentWrapEl = zjs(_contentwrapperhtml).setData(contentwrapidkey, zjs.getUniqueId()),
			zContentWrapElIndom = false;

		if(option.contentWrapperClass != '')
			zContentWrapEl.addClass(option.contentWrapperClass);
		zContentWrapEl.addClass(contentwrapclass);
		
		// 
		function initnavwrap(__ztempEl){
			if(__ztempEl.count()==0 || zNavWrapEl)return;
			// kiem tra xem cai el nay co phai la ul khong
			// neu nhu khong phai la ul thi minh se di find ul
			if(!__ztempEl.is('ul'))__ztempEl=__ztempEl.find('ul').item(0);
			zNavWrapEl = __ztempEl.addClass(navclass);
			
			// xem xem coi cai nav-wrap nay la nam tren hay la nam duoi
			// neu nhu zContentWrapEl chua duoc gan vao Dom
			// thi chung to la nam tren
			// nguoc lai la nam phia ben duoi
			if(zContentWrapElIndom)
				zNavWrapEl.addClass(navbottomclass);
			
			var index = 0;
			
			// sau khi tim duoc navigation roi
			// thi se di bind event cho navigation

			var clickEventName = [];
			if(zjs.browser.isTouchPad)clickEventName.push('tap');
			else if(option.hover)clickEventName.push('hover');
			else clickEventName.push('click');

			zNavWrapEl.child().each(function(el){
				if(el.nodeType==3)zjs(el).remove();
				if(zjs(el).is('li')){
					zjs(el).setAttr(tabindexkey, index++).on(clickEventName.join(','), function(event, el){
						tabpanelSelectTab(element, this.attr(tabindexkey).toInt());
					});
				};
			});
		};
		
		// di init cac thang con ben trong thang tab panel
		zTabPanelEl.child().each(function(el){
			var zEl = zjs(el);
			
			// neu nhu la ul, ma lai chua co nav-wrap
			// thi se cho no lam nav-wrap luon
			if((zEl.is('ul') || zEl.is('.ztabpaneltabs')) && !zNavWrapEl)
				initnavwrap(zEl);
			
			// kiem tra neu nhu thang nay khong phai thang tabs
			// va cung khong chua thang tabs thi moi lam
			// dong thoi neu chu chua tung insert content-wrapper 
			// thi se insert vao
			if(zEl.is(option.childclass+':not(.ztabpaneltabs)')){
				if(zEl.find('.ztabpaneltabs').count()>0){
					// neu nhu co custom tabpanel 
					// thi phai check xem coi cai tabpanel nay
					// co dung la thuoc cai thang ztabpanel nay hay khong
					// hay cua 1 thang con khac
					//var testTabPanelId = zEl.find('.ztabpaneltabs').item(0).findUp('.'+tabpanelclass).getData(contentwrapidkey);
					var testTabPanelRealEl = zEl.find('.ztabpaneltabs').item(0).findUp('.ztabpanel').item(0, true);
					//console.log('testTabPanelId', testTabPanelRealEl);
					//console.log('tabPanelId', zTabPanelEl.item(0, true));
					
					// neu nhu cai id nay trung, thi chung to la tabpaneltab cua cai tabpanel nay
					if(zTabPanelEl.item(0, true) == testTabPanelRealEl)
						return;
				}
				
				if(!zContentWrapElIndom){
					zContentWrapElIndom = true;
					zContentWrapEl.insertBefore(zEl);
				};
				var tabContentEl = zjs(_contenthtml).appendTo(zContentWrapEl);
				tabContentEl.append(el);
				var customTabContentClass = zjs(el).getAttr('data-tabpanel-class', '');
				if(customTabContentClass != '')
					tabContentEl.addClass(customTabContentClass);
				tabContentEl.addClass(contentclass);
				
				// neu nhu thang el nay la zscrollbar thi se link cho no cai size wrapper luon
				var zScrollbarEl = zjs(el).getData(scrollbarContentElkey);
				if(!option.autoheight && typeof zjs.moduleScrollbar != 'undefined' && zScrollbarEl){
					zScrollbarEl.scrollbarSetWrapperSizeElement(zContentWrapEl);
				};

				// neu nhu thang el nay la slider
				// thi se cho thang slider nay chay xong thi phai trigger resize cai thang tabpanel lai luon
				// var imageSliderOption = zjs(el).getData(imageSliderOptionkey);
				// if(option.autoheight && typeof zjs.moduleImageSliderOption != 'undefined' && imageSliderOption){
					// console.log('imageSliderOption', el, imageSliderOption);
				// }
			};
		});
		
		// init tabs-content
		// di xac dinh coi cai max height la cai nao
		var fixMaxHeightRoi = false,
		fixMaxHeight = function(){
			var zContentMaxHeight = 0;
			zContentWrapEl.child().each(function(el, index){
				var zContentEl = zjs(el);
				if(!fixMaxHeightRoi)
					zContentEl.setAttr(tabindexkey, index).style('z-index',lastindex++);
				if(zContentEl.height()>zContentMaxHeight)
					zContentMaxHeight = zContentEl.height();
			});
			
			if(!option.autoheight)
				zContentWrapEl.height(zContentMaxHeight);
			
			if(zContentMaxHeight > 0)
				zContentWrapEl.trigger('resize', {});
			
			fixMaxHeightRoi = true;
			
			return zContentMaxHeight;
		};
		
		// init size neu nhu khong phai set autoheight
		// delay lai 1 xiu nua lam them 1 lan nua cho chac an
		if(fixMaxHeight()<=0)
			fixMaxHeight.delay(500);
		
		// toi buoc nay, sau khi da lam xong het thang tabcontent,
		// thi luu lai thang navwrap luon
		zTabPanelEl.setData(navwrapelkey, zNavWrapEl);
		
		// set current select tab for default
		zTabPanelEl.setData(currenttabindexkey, -1);
		
		var _focusedFirsttab = false;
		
		// kiem tra coi co dung url hash khong
		if(option.useurlhash){
			_focusedFirsttab = tabpanelSelectTabByHash(element);
			// kiem tra coi co dung urlhash ko de bind event
			zjs(window).on('hashchange', function(event){
				tabpanelSelectTabByHash(element);
			});
		};
		

		// Handler disable/enable case
		if(option.autoDisableWhenWidthLargerThan > 0){
			var minW = option.autoDisableWhenWidthLargerThan,
				isMinW = (windowEl.width() >= minW);

			var handlerDisableOrNotDisableByWidthLarger = function(){
				if(minW > 0){
					// xem coi qua cot moc 600px chua?
					if(windowEl.width() >= minW && !isMinW){
						isMinW = true;
						zTabPanelEl.addClass(disableclass);
					}
	
					if(windowEl.width() < minW && isMinW){
						isMinW = false;
						zTabPanelEl.removeClass(disableclass);
					}
				};
			};
			
			// bind event xu ly khi window resize
			windowEl.on('resize', function(){
				handlerDisableOrNotDisableByWidthLarger();
			});
			
			// first handler
			isMinW = !isMinW;
			handlerDisableOrNotDisableByWidthLarger();
		}


		// select first tab for default
		if(!_focusedFirsttab)
			tabpanelSelectTab(element, option.activetab);
		
		// run trigger
		zTabPanelEl.trigger('ui:tabpanel:load');
	},
	
	// select tab by hash, neu lam dc thi return true
	tabpanelSelectTabByHash = function(element){
		if(document.location.hash=='')return;
		
		var zTabPanelEl = zjs(element);
		var option = zTabPanelEl.getData(optionkey);
		
		// neu chua co option thi chung to la day khong phai la tabpanel
		if(!option)return;
		if(!option.useurlhash)return;
		
		// xem coi lam duoc hay khong
		var _lamdc = false;
		
		// xem coi cai hash nay co trong thang nav li nay ko
		var _mbLiEl = zTabPanelEl.find('[data-name="'+document.location.hash.substr(1)+'"]');
		// neu nhu khong co thi tim trong id
		if(_mbLiEl.count()<=0)_mbLiEl = zTabPanelEl.find('#'+document.location.hash.substr(1));
		// co thi lam
		if(_mbLiEl.count()>0){
			var _mbtabIndex = parseInt(_mbLiEl.getAttr(tabindexkey, -1));
			if(_mbtabIndex>=0){
				tabpanelSelectTab(element, _mbtabIndex);
				_lamdc = true;
			}
		}
		
		return _lamdc;
	},
	
	tabpanelSelectTab = function(element, index){
		var zTabPanelEl = zjs(element);
		var option = zTabPanelEl.getData(optionkey);
		
		// neu chua co option thi chung to la day khong phai la tabpanel
		if(!option)return;
		
		// neu nhu ma tab nay dang select roi thi thoi
		var currIndex = zTabPanelEl.getData(currenttabindexkey, 0);
		if(index == currIndex)return;
		
		var topWrapContentEl = zTabPanelEl.find('.'+contentwrapclass).item(0),
			topWrapContentId = topWrapContentEl.getData(contentwrapidkey),
			tabName = '';
		
		var zCurrentContentEl = null;
		topWrapContentEl.find('.'+contentclass).each(function(el){
			
			var zContentEl = zjs(el);
			
			// support tab long trong tab
			// cho nen se tim nguoc len tren coi co phai thang tabcontent nay
			// nam trong ngay thang cha truc tiep cua no hay khong
			var testTopWrapContentId = zContentEl.findUp('.'+contentwrapclass).getData(contentwrapidkey);
			
			if(testTopWrapContentId != topWrapContentId)
				return;
			
			var tabindex = zContentEl.getAttr(tabindexkey, 0).toInt();
	
			if(index != tabindex){
				zContentEl.removeClass(contentactiveclass).addClass(contentdeactiveclass);
			}
			else{
				zCurrentContentEl = zContentEl;
				zContentEl.addClass(contentactiveclass).removeClass(contentdeactiveclass).style('z-index',lastindex++);
			}
		});
		
		var zNavWrapEl = zTabPanelEl.getData(navwrapelkey, false);
		if(zNavWrapEl){
			zNavWrapEl.find('> li').each(function(el){
				var zLi = zjs(el),
					tabindex = zLi.attr(tabindexkey).toInt();
				if(index != tabindex)zLi.removeClass(contentactiveclass).addClass(contentdeactiveclass);
				else{
					zLi.addClass(contentactiveclass).removeClass(contentdeactiveclass);
					// tranh thu get tabname luon
					tabName = zLi.getAttr('data-name', '');
					// neu khong co thi get id
					if(tabName=='')tabName = zLi.getAttr('id', '');
				};
			});
		};
		
		// save the current index
		zTabPanelEl.setData(currenttabindexkey, index);
		
		// xem coi co su dung hash khong
		// neu nhu co su dung thi se change document hash
		// dau tien la xac dinh cai name truoc
		if(option.useurlhash && tabName != ''){
			document.location.hash = tabName;
		};
			
		
		// neu nhu autoheight 
		// thi se anh huong den height toan cuc
		// nen can phai refresh lai vai thang module
		if(option.autoheight){
			(function(){
				zjs('.zfreezepanel').trigger('trigger:refreshpanel');
			}).delay(200);

			// support Image Slider refresh size
			var imageSliderOption = zCurrentContentEl.child().getData(imageSliderOptionkey);
			if(option.autoheight && typeof zjs.moduleImageSliderOption != 'undefined' && imageSliderOption){
				// console.log('here');
				// (function(){console.log('here2');
					zCurrentContentEl.child().slideRefresh();
				// }).delay(1000);
			}
		};
		
		
		// trigger event
		zTabPanelEl.trigger('ui:tabpanel:change', {index:index});
	};
	
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeTabpanel: function(useroption){
			return this.each(function(el){makeTabpanel(el, useroption)});
		},
		tabpanelSelectTab: function(index){
			return this.each(function(el){tabpanelSelectTab(el, index)});
		},
		tabpanelSelectNextTab: function(){
			return this.each();
		},
		tabpanelSelectPrevTab: function(){
			return this.each();
		}
	});
	

	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeButton luon
			zjs(el).find('.ztabpanel').makeTabpanel();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeButton luon
			if(zjs(el).hasClass('ztabpanel'))zjs(el).makeTabpanel();
			zjs(el).find('.ztabpanel').makeTabpanel();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){zjs('.ztabpanel').makeTabpanel()});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.tabpanel');
});