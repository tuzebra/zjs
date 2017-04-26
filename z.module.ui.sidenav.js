// MODULE UI SIDENAV
zjs.require('ui', function(){
"use strict";

	var optionkey = 'zmoduleuisidenavoption',
		sidenavparentwrap = 'zmoduleuisidenavparentwrap',
		scrollbarIdkey = 'zmodulescrollbarid',
		scrollbarOptionkey = 'zmodulescrollbaroption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiSidenavOption: {
			marginTop:0,
			scrollTime:800,
			scrollTransition:'ease',
			allowUpdateUrl:true
		}
	});
	
	// trigger
	//ui.sidenav.load
	
	// template
	var sidenavclass = 'zui-sidenav',
		sidenavanchorclass = 'zui-sidenav-link',
		activeclass = 'active',
		preactiveclass = 'pre-active',
		sidenavlevelclass = 'sidenav-level-';
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var isBodyScrollbarActive = function(){
		return !zjs(document.body).hasClass('zui-scrollbar-usedefault') && parseInt(zjs(document.body).getData(scrollbarIdkey,0))>0;
	};
	
	var makeSidenav = function(element, useroption){
		
		var zSidenavEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zSidenavEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zSidenavEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiSidenavOption);
		// extend from inline option ?
		var inlineoption = zSidenavEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option
		//.....
		
		// save option
		zSidenavEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// dau tien la add vao cai class cho vui cai da
		zSidenavEl.addClass(sidenavclass);
		
		// 
		var zWindow = zjs(window),
			zBody = zjs(document.body),
			moduleIsReady = true,
			isEnable = true;
		if(isBodyScrollbarActive()){
			moduleIsReady = false;
			zBody.on('scrollbar.ready', function(){
				moduleIsReady = true;
			});
		};
		
		// ham nay co nhiem vu build lai struct cua cai thang nav, 
		// va cung voi nhung thang element lien quan
		var navitems = [];
		function getToKnowNavItem(){
			// bat dau get tat ca nhung thang nao phu hop trong sidenav
			//zSidenavEl.find('a[href^="#"]').each(function(el){
			//	var zNavEl = zjs(el);
				// di xac dinh quan he cha con,... cua may cai thang nav nay
				// ....
			//});
			// => neu nhu lam nhu the nay thi se rat kho khan trong viec xac dinh cha con
			// cho nen tot nhat la di tung cap tung cap theo cay dom
			// de xac dinh cha con luon
			// new way:
			navitems = [];
			getToKnowNavItem_hdnchild(zSidenavEl, null, 0);
		};
		function getToKnowNavItem_hdnchild(el, _prel, _level){
			var zEl = zjs(el);
			_prel = _prel || [];
			if(!zjs.isArray(_prel))_prel = [];
			var prel = zjs.extend([], _prel);
			if(zEl.is('li')){
				// phai co tim cho ra 1 thang la <a>
				// de ma gan vao items
				var aEl = zEl.find('a[href^="#"], [data-target-element]');
				if(aEl.count()>0){
					// di kiem coi cai thang item la thang nao?
					var itemEl = false;
					var href = aEl.item(0).getAttr('href', '');
					if(href.indexOf('#')===0){
						var _tmpNavEl = zjs(href);
						if(_tmpNavEl.count()>0)
							itemEl = _tmpNavEl;
					};
					var queryTargetEl = aEl.item(0).getAttr('data-target-element', '');
					if(!itemEl){
						var _tmpNavEl = zjs(queryTargetEl);
						if(_tmpNavEl.count()>0)
							itemEl = _tmpNavEl;
					};
					navitems.push({
						'nav': aEl.item(0, true),
						'item': itemEl ? itemEl.item(0, true) : false,
						'itemTop': 0,
						'parentNavs': prel,
						'href': href
					});
					// add them cai class
					aEl.addClass(sidenavanchorclass);
					// phai tao moi lai cho no khoi link, met ghe
					prel = zjs.extend([], prel);
					prel.push(aEl.item(0, true));
				}
				// bo sung cai level vao luon
				_level++;
				zEl.addClass(sidenavlevelclass+_level);
				// kiem xem coi co cai thang ul, div nao khong de tiep tuc loop
				zEl.find('>ul,>div').each(function(cel){
					getToKnowNavItem_hdnchild(cel, prel, _level);
				});
			};
			if(zEl.is('ul') || zEl.is('div')){
				zEl.child().each(function(cel){
					getToKnowNavItem_hdnchild(cel, prel, _level);
				});
				return;
			};
		};
		
		// ham giup update top cua may thang item trong list nav
		function updateTopForNavItem(){
			for(var i=0;i<navitems.length;i++){
				navitems[i].itemTop = zjs(navitems[i].item).getAbsoluteTop();
				//console.log(i, navitems[i].item, navitems[i].itemTop);
				//>>>>>>>>>
			}
			// sau do se sort cai list nay luon
			navitems.sort(function(a, b){
				return a.itemTop - b.itemTop;
			});
		};
		
		// ham xu ly khi scroll chuot
		function sidenavHandlerWhenScrollToKeepFocus(){
			// dau tien la đi tim kiem nhưng cai thang id
			// sau do la get top cua tung thang
			// so sanh thang do voi lai thang scrolltop
			// de coi coi nen active nhung thang nao
			// --
			// bay gio moi lan can xu ly thi can can loop tren cai list co san ma thoi
			// tim ra coi cai thang nao la thang can phai set .active
			var i=0, currentScrollTop = zWindow.scrollTop() + option.marginTop + 10;
			for(;i<navitems.length;i++){
				//xem coi neu nhu ma cai thang scrolltop > item top thi chung to la kiem ra thang phu hop roi
				if(navitems[i].itemTop > currentScrollTop)
					break;
			};
			// thang phu hop phai la cai thang truoc do
			i--;
			// remove het current .active class
			zSidenavEl.find('li').removeClass(activeclass);
			// gio se di active ne
			if(i<0)return;
			zjs(navitems[i].nav).findUp('li').addClass(activeclass);
			zjs.foreach(navitems[i].parentNavs, function(nav){
				zjs(nav).findUp('li').addClass(activeclass);
			});
		};
		
		// change behaviour of anchor links to scroll instead of jump
		zSidenavEl.on('click', 'a.'+sidenavanchorclass, function(event){
			// di xem coi cai thang <a> nay co nam trong list navitems khong?
			// neu nhu co nam trong list nay thi moi prevent default
			var a = event.target(), i = 0, okie = false;
			for(;i<navitems.length;i++){
				if(navitems[i].nav == a){
					okie = true;
					event.preventDefault();
					break;
				}
			};
			if(!okie)return;
			
			// keu goi 1 cai trigger cua thang sidenav vo thang item ma no scroll toi luon
			var isDefaultPrevented = false;
			zjs(navitems[i].item).trigger('ui:sidenav:out:trigger', {}, function(event){
				// test xem coi co can phai scroll nua khong?
				isDefaultPrevented = event.isDefaultPrevented;
			});
			if(isDefaultPrevented){
				//console.log('on sidenav -> isDefaultPrevented');
				return;
			}
			
			// gio thi se di update roi fix top cai da
			getToKnowNavItem();
			updateTopForNavItem();
			
			// bay gio se scroll that la muot xuong cai thang noi dung thoi :D
			// >>>>>
			//console.log('smoothScroll', navitems[i].item, navitems[i].itemTop);
			smoothScroll(navitems[i].itemTop);
			// set active luon cho roi
			zjs(navitems[i].nav).findUp('li').addClass(preactiveclass);
			if(option.allowUpdateUrl && navitems[i].href != '' && zjs.supportHistory)
				history.pushState('', document.title, navitems[i].href);
		});
		
		// timer lo vu scroll muot
		var smoothScrollRunning = false,
			smoothScrollTimer = zjs.timer({
				onProcess: function(current){
					//console.log('smoothScrollTimer', current);
					window.scrollTo(0, current);
				},
				onFinish: function(){
					smoothScrollRunning = false;
					// remove het current .pre-active class
					zSidenavEl.find('li').removeClass(preactiveclass);
				},
				onStop: function(){
					smoothScrollRunning = false;
					// remove het current .pre-active class
					zSidenavEl.find('li').removeClass(preactiveclass);
				}
			}),
			smoothScroll = function(to){
				//console.log('smoothScroll to', to);
				to = to || 0;
				to -= parseInt(option.marginTop);
				// update: 
				// hien tai la ke, khoi can fix height lam gi cho no cuc
				//if(to >= zBody.height())to = zBody.height();
				if(to <0)to = 0;
				//console.log('smoothScroll to fix', to);
		
				// stop current scroll
				smoothScrollTimer.stop();
		
				// set new option
				smoothScrollTimer.set({
					from: zWindow.scrollTop(),
					to: to,
					time: option.scrollTime,
					transition: option.scrollTransition
				});
		
				// bat dau scroll		
				smoothScrollTimer.run();
				smoothScrollRunning = true;
			};
		
		// sau do bind event window scroll
		// se support scrollbar luon
		if(isBodyScrollbarActive()){
			zBody.on('scrollbar.scroll', function(){
				sidenavHandlerWhenScrollToKeepFocus();
			});
		};
		
		zWindow.on('scroll', function(){
			if(isBodyScrollbarActive())return;
			if(!moduleIsReady && zjs(document.body).hasClass('zui-scrollbar-usedefault')){
				moduleIsReady = true;
			};
			sidenavHandlerWhenScrollToKeepFocus();
		})
		// khi nguoi dung roll chuot thi phai stop lai cai thang scrool muot
		.on('mousewheel',function(event){
			if(!smoothScrollRunning)return;
			smoothScrollTimer.stop();
			smoothScrollRunning = false;
		})
		// khi nguoi dung resize trinh duyet thi phai fix lai top
		.on('resize', function(){
			updateTopForNavItem();
			sidenavHandlerWhenScrollToKeepFocus();
		});
		
		
		// first build struct
		// first run de no se fix ngay va luon
		getToKnowNavItem();
		updateTopForNavItem();
		sidenavHandlerWhenScrollToKeepFocus();
		
		
		// reg 1 cai hook cho chac ne ^^
		zjs.hook({
			after_setInnerHTML: function(el){},
			after_insertDOM: function(el){
				// thu xem coi cai thang moi duoc insert vao
				// co phai la thuoc thang con cua cai sidenav nay khong?
				// ney nhu la thang con, thi se phai di struct lai luon
				var _zSidenavEl = zjs(el).findUp('.'+sidenavclass);
				if(_zSidenavEl.count()>0 && _zSidenavEl.isTheSame(zSidenavEl)){
					// vay la dung noi roi, don gian la di struct lai thoi
					getToKnowNavItem();
					updateTopForNavItem();
				}
			}
		});
		
		
		// xong het roi thi run trigger thoi
		zSidenavEl.trigger('ui.sidenav.load');
		
		// bind 1 cai event luon
		zSidenavEl.on('ui.sidenav.refresh', function(){
			getToKnowNavItem();
			updateTopForNavItem();
			sidenavHandlerWhenScrollToKeepFocus();
		});
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeSidenav: function(useroption){
			return this.each(function(element){makeSidenav(element, useroption)});
		},
		sidenavRefresh: function(){
			return this.each(function(el){
				zjs(el).trigger('ui.sidenav.refresh');
			});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zsidenav ko, neu nhu co thi se auto makeSidenav luon
			zjs(el).find('.zsidenav').makeSidenav();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zsidenav ko, neu nhu co thi se auto makeSidenav luon
			if(zjs(el).hasClass('zsidenav'))zjs(el).makeSidenav();
			zjs(el).find('.zsidenav').makeSidenav();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zsidenav').makeSidenav();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.sidenav');
});