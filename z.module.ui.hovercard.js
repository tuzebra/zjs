// MODULE UI HOVERCARD
zjs.require('ui', function(){
"use strict";
	
	var optionkey = 'zmoduleuihovercardoption',
		wrapelkey = 'zmoduleuihovercardwrapel',
		hovercardelkey = 'zmoduleuihovercardel',
		ajaxloadedkey = 'zmoduleuihovercardajaxloaded',
		isusecustomelkey = 'zmoduleuihovercardcustomwrapel',
		parentwrapelkey = 'zmoduleuihovercardparentwrapel',
		iswrapelkey = 'zmoduleuihovercardiswrapel',
		wrapelbelongcount = 'zmoduleuihovercardwrapelbelongcount';
	
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiHovercardOption:{
			timeBeforeShow:0,
			timeBeforeHide:200,
			attribute:'title',
			horizontal:'left',
			vertical:'top',
			autoFixPosition:true,
			autoFixArrowPosition:true,
			hideWhenHoverCard:false,
			// 
			customCssClass:'',
			left:'auto',
			right:'auto',
			top:'auto',
			bottom:'auto',
			// 
			appendToBody:false,
			ajaxContent:false,
			ajaxContentDataStructure:'',
			ajaxLoadingHtml: '<div class="loading-icon"></div>',
			cacheAjax: true,
			customContentElement:false,
		}
	});
	
	// trigger
	//
	
	// template
	var hovercardclass = 'zui-hovercard',
		hovercardfixclass = 'zui-hovercard-fix',
		
		// zui commont class name
		contextualpanelwrapclass = 'zui-contextual-panel-wrap',
		contextualpanelwraphideclass = 'zui-hide',
		contextualpanelwrapactiveclass = 'active',

		uihideclass = 'zui-uihide',
		uiuninithideclass = 'zui-uiuninithide',
		
		hovercardjspanelclass = 'js-hovercard-panel',
		hovercardpanelwrapclass = 'zui-hovercard-panel-wrap',
		hovercardpanelfixedclass = 'zui-fixed',
		hovercardpanelwraptooltipclass = 'zui-tooltip',
		hovercardpanelarrowclass = 'zui-hovercard-panel-arrow',
		hovercardpanelclass = 'zui-hovercard-panel',
		hovercardpanelinnerclass = 'zui-hovercard-panel-inner',

		// ajax
		ajaxLoadingClass = 'ajax-loading',
		
		// horizontal
		hovercardpanelwrapleftclass = 'zui-left',
		hovercardpanelwraprightclass = 'zui-right',
		
		// vertical
		hovercardpanelwraptopclass = 'zui-top',
		hovercardpanelwrapbottomclass = 'zui-bottom',
		
		hovercardpanelwraphtml = '<div class="'+hovercardpanelwrapclass+' '+uiuninithideclass+'">'+
									'<div class="'+hovercardpanelarrowclass+'"></div>'+
									'<div class="'+hovercardpanelclass+'">'+
										'<div class="'+hovercardpanelinnerclass+'"></div>'+
									'</div>'+
								'</div>';
	
	// Cache
	var ajaxCache = [];

	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeHovercard = function(element, useroption){
		
		var zHovercardEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zHovercardEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zHovercardEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		}
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiHovercardOption);
		// extend from inline option ?
		var inlineoption = zHovercardEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zHovercardEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// fix option 
		// 
		// save option
		zHovercardEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// truoc tien la add class
		zHovercardEl.addClass(hovercardclass);
		
		// tao ra cai panel 
		var zHovercardPanelwrapEl,
			useCustomWrapElement = false;

		if(zjs.isString(option.customContentElement)){
			zHovercardPanelwrapEl = zjs(option.customContentElement);
			useCustomWrapElement = true;
		}
		else{
			// build wrap element 
			zHovercardPanelwrapEl = zjs(hovercardpanelwraphtml);
			// insert vao cung cap voi thang element goc luon
			// muc dich la de de dang xac dinh vi tri toa do
			// cua thang panel sau nay
			// nhung neu nhu ma append to body thi khac
			if(option.appendToBody){
				// set position cua body luon cho no chac an
				var position = zjs(document.body).getStyle('position');
				if(position == '' || position == 'static')
					zjs(document.body).setStyle('position', 'relative');
				zHovercardPanelwrapEl.appendTo(top.document.body).setStyle('z-index',10);
			}else
				zHovercardPanelwrapEl.insertAfter(zHovercardEl);
			
			// add them custom class
			if(option.customCssClass !=''){
				zHovercardPanelwrapEl.addClass(option.customCssClass);
			}
		}
		
		// set js to detect later
		zHovercardPanelwrapEl.addClass(hovercardjspanelclass).setData(hovercardelkey, zHovercardEl);

		// save lai de sau nay truy xuat den
		zHovercardEl.setData(wrapelkey, zHovercardPanelwrapEl);

		// gio phai truy tim thang cha, lo nhu no la 1 panel wrap thi sao?
		var zHovercardParentPanelwrapEl = zHovercardEl.findUp('.'+hovercardjspanelclass);
		if(zHovercardParentPanelwrapEl.count()>0){
			zHovercardEl.setData(parentwrapelkey, zHovercardParentPanelwrapEl);
		}
		
		
		// BIND EVENT MOUSE HOVER/OUT
		// - - - -

		var waitBeforeHide = false;
		
		// bind event cho cai hovercard,
		// can phai ca hover va out nen
		// su dung method longHover cho nhanh
		zHovercardEl.longHover(
		
			// on mousehover handler
			function(){
				// console.log('mouse in');
				// clear timer ngay
				window.clearTimeout(waitBeforeHide);waitBeforeHide = false;
				hovercardShow(element);
			},
			
			// on mouseout handler
			// bay gio se wait 1 ty truoc khi hide cai panel di
			function(event){
				// console.log('mouse out');
				waitBeforeHide = window.setTimeout(function(){
					hovercardHide(element, (option.hideWhenHoverCard ? false : event));
				}, option.timeBeforeHide);
			},
			
			// time wait to call hover hander
			option.timeBeforeShow
		);
		
		// bind event cho cai panel
		if(!option.hideWhenHoverCard){zHovercardPanelwrapEl
			.on('mouseover', function(event){
				// clear timer ngay
				window.clearTimeout(waitBeforeHide);waitBeforeHide = false;
			})
			.on('mouseout', function(event){
				// console.log('mouse out');
				// bay gio se wait 1 ty truoc khi hide cai panel di
				waitBeforeHide = window.setTimeout(function(){
					hovercardHide(element, event);
				}, option.timeBeforeHide);
			});
		}
		
		
		// neu su dung custom element thi coi nhu xong
		if(useCustomWrapElement){
			zHovercardEl.setData(isusecustomelkey, true);
			return;
		}


		// SET CONTENT FOR PANEL
		// - - - -
		var zHovercardPanelinnerEl = zHovercardPanelwrapEl.find('.'+hovercardpanelinnerclass);
		var text = zHovercardEl.getAttr(option.attribute, '');
		if(text){
			// neu attribute la title thi
			// co kha nang cao day la tooltip
			// nen se set cho no 1 cai class la tooltip luon
			if(option.attribute == 'title'){
				zHovercardPanelwrapEl.addClass(hovercardpanelwraptooltipclass);
				// xoa di attribute nay luon, de browser khong co tu hien len
				zHovercardEl.removeAttr('title');
			};
				
			zHovercardPanelinnerEl.setInnerHTML(text);
		}
		// save cai hovercard elemnent luon
		// (de hook truy xuat)
		zHovercardPanelinnerEl.setData(hovercardelkey, zHovercardEl);
		
		// sau khi init xong het roi thi moi that su hide di cai panel
		// boi vi trong khi dang init ma hide luon cai panel
		// thi lo trong panel dang co module scrollbar hay gi do can init
		// thi module scrollbar se khong get duoc chinh xac width/height
		// vi khi panel hide di thi posision la fixed, width/height la 0
		zHovercardPanelwrapEl.addClass(uihideclass).removeClass(uiuninithideclass);
	},
	
	
	// han nay giup show cai panel cua hovercard
	hovercardShow = function(element){
		var zHovercardEl = zjs(element),
			option = zHovercardEl.getData(optionkey),
			zHovercardPanelwrapEl = zHovercardEl.getData(wrapelkey),
			useCustomWrapElement = zHovercardEl.getData(isusecustomelkey);

		// neu nhu khong co panel wrap element thi 
		// chung to day khong phai la mot hovercard
		if(!zHovercardPanelwrapEl)return;
		
		
		// FIX position style
		// --
		// test xem thu coi element co position la gi
		// neu ma chua phai la relative/absolute
		// thi minh se quang vao 1 cai css de fix
		// tot nhat la try catch cho nay, boi vi ham getStyle
		// se di sau vao computed style de get
		// nen rat co the browser chua support
		if(!useCustomWrapElement){
			try{
				var position = zHovercardEl.getStyle('position', '');
				if((position=='' || position=='static') && !zHovercardEl.is('tr'))
					zHovercardEl.addClass(hovercardfixclass);
			}catch(err){}
		}
	
		// bay gio se hien ra cai panel truoc, roi tinh tiep
		zHovercardPanelwrapEl.removeClass(uihideclass).addClass(contextualpanelwrapactiveclass);
		// bay gio moi di fix align lai position cua hovercard
		hovercardAlign(element);
		(function(){
			hovercardAlign(element);
		}).delay(200);

		// neu nhu thang hovercard nay co 1 thang wrap lam cha
		// thi se set thang cha dang bi phu thuoc 1 thang, khong cho thang cha hide
		var zHovercardParentPanelwrapEl = zHovercardEl.getData(parentwrapelkey);
		if(zHovercardParentPanelwrapEl){
			var belongCount = zHovercardParentPanelwrapEl.getData(wrapelbelongcount, 0).toInt() + 1;
			zHovercardParentPanelwrapEl.setData(wrapelbelongcount, belongCount);
		}
		
		// LOAD CONTENT VIA AJAX
		if(!useCustomWrapElement && option.ajaxContent && !zHovercardEl.getData(ajaxloadedkey)){
			
			zHovercardPanelwrapEl.addClass(ajaxLoadingClass);
			var zHovercardPanelinnerEl = zHovercardPanelwrapEl.find('.'+hovercardpanelinnerclass);

			zHovercardPanelinnerEl.setInnerHTML(option.ajaxLoadingHtml);
			hovercardAlign(element);

			var ajaxCallback = function(html){
				zHovercardEl.setData(ajaxloadedkey, true);
				zHovercardPanelinnerEl.setInnerHTML(html);
				// set hovercard content and align
				zHovercardPanelwrapEl.removeClass(ajaxLoadingClass);
				hovercardAlign(element);
			};

			// find in ajax cache first
			var urlHash = 'aj'+option.ajaxContent.hashCode();
			// console.log('urlHash', urlHash);
			if(option.cacheAjax && (typeof ajaxCache[urlHash] !== 'undefined')){
				ajaxCallback(ajaxCache[urlHash]);
				return;
			}

			var ajaxDataType = (option.ajaxContentDataStructure != '') ? 'json' : 'html';
			zjs.ajax({
				url:option.ajaxContent,
				dataType:ajaxDataType,
				success:function(response){
					var html = response;
					if(ajaxDataType === 'json' && zjs.isObject(response)){
						html = zjs.getValueByKey(response, option.ajaxContentDataStructure);
					}
					if(html){
						if(option.cacheAjax){
							ajaxCache[urlHash] = html;
						}
						ajaxCallback(html);
					}
				}
			});
		}
	},
	
	
	// ham nay se giup hide di cai panel cua hovercard
	hovercardHide = function(element, event){
		var zHovercardEl = zjs(element),
			zHovercardPanelwrapEl = zHovercardEl.getData(wrapelkey),
			useCustomWrapElement = zHovercardEl.getData(isusecustomelkey);

		// neu nhu khong co panel wrap element thi 
		// chung to day khong phai la mot hovercard
		if(!zHovercardPanelwrapEl)return;
		
		// check coi neu nhu dang belong theo thang nao do
		// thi se khong duoc hide
		var belongCount = zHovercardPanelwrapEl.getData(wrapelbelongcount, 0).toInt();
		if(belongCount>0)return;

		// tien hanh kiem tra xem coi neu nhu chuot dang hover vao panel
		// thi minh se thoi khong hide card nua
		// console.log('event', event);
		if(event){
			var hovercardPanelwrapEl = zHovercardPanelwrapEl.item(0, true);
			try{
				// xem coi thang to element la di toi dau
				// tuc la mouse dang hover vao dau
				var toElement = event.getToTarget();
				// console.log('toElement', toElement);
			
				// neu nhu ma mouse dang hover vao thang panel luon
				// hoac chi la thang con cua thang panel thoi
				// thi se stop lai, khong lam gi nua
				while(toElement){
					if(toElement == hovercardPanelwrapEl)return;
					if(toElement == document)break;
					toElement = toElement.parentNode;
				};
			}catch(err){};
		}
		
		// bay gio se hide di card panel di thoi
		if(useCustomWrapElement){
			zHovercardPanelwrapEl.removeClass(contextualpanelwrapactiveclass);
		}
		else{	
			zHovercardEl.removeClass(hovercardfixclass);
			zHovercardPanelwrapEl.addClass(uihideclass)
					.removeClass(contextualpanelwrapactiveclass)
					.removeClass(hovercardpanelwrapleftclass)
					.removeClass(hovercardpanelwraprightclass)
					.removeClass(hovercardpanelwraptopclass)
					.removeClass(hovercardpanelwrapbottomclass)
					.top('auto').bottom('auto').left('auto').top('auto');
		}

		// sau khi hide di thi phai set belong count cho thang wrap cha (neu co)
		var zHovercardParentPanelwrapEl = zHovercardEl.getData(parentwrapelkey);
		if(zHovercardParentPanelwrapEl){
			belongCount = zHovercardParentPanelwrapEl.getData(wrapelbelongcount, 0).toInt() - 1;
			if(belongCount<0)belongCount = 0;
			zHovercardParentPanelwrapEl.setData(wrapelbelongcount, belongCount);

			// trigger cai event hide luon cho thang cha
			hovercardHide(zHovercardParentPanelwrapEl.getData(hovercardelkey), event);
		}
	},
	
	
	// ham nay giup canh chinh vi tri cua hover card
	hovercardAlign = function(element){
		var zHovercardEl = zjs(element),
			zHovercardPanelwrapEl = zHovercardEl.getData(wrapelkey),
			useCustomWrapElement = zHovercardEl.getData(isusecustomelkey);

		// neu nhu khong co panel wrap element thi 
		// chung to day khong phai la mot hovercard
		if(!zHovercardPanelwrapEl || useCustomWrapElement)return;
		
		var zHovercardArrowEl = zHovercardPanelwrapEl.find('.'+hovercardpanelarrowclass),
			zHovercardPanelinnerEl = zHovercardPanelwrapEl.find('.'+hovercardpanelinnerclass);
		
		// reset before align
		if(useCustomWrapElement){
			// zHovercardPanelwrapEl.removeClass(contextualpanelwrapactiveclass);
		}
		else{	
			zHovercardPanelwrapEl
					.removeClass(hovercardpanelwrapleftclass)
					.removeClass(hovercardpanelwraprightclass)
					.removeClass(hovercardpanelwraptopclass)
					.removeClass(hovercardpanelwrapbottomclass)
					.top('auto').bottom('auto').left('auto').top('auto');
		}

		
		// co gang lay ra position & size hien tai cua thang element
		var eleft = zHovercardEl.left(),
			eright = zHovercardEl.right(),
			etop = zHovercardEl.top(),
			ebottom = zHovercardEl.bottom(),
			ewidth = zHovercardEl.width(),
			eheight = zHovercardEl.height();

		// console.log('eleft', eleft);
		// console.log('eright', eright);
		// console.log('etop', etop);
		// console.log('ebottom', ebottom);
		// console.log('ewidth', ewidth);
		// console.log('eheight', eheight);
		
		// get ra size cua thang panel luon cho de tinh toan
		var pwidth = zHovercardPanelwrapEl.width(),
			pheight = zHovercardPanelwrapEl.height();
		
		//console.log('left', eleft, 'right', eright, 'top', etop, 'bottom', ebottom);
		//console.log('width', ewidth, 'height', eheight, 'pwidth', pwidth, 'pheight', pheight);
		
		// gio se di tinh toan xem coi se show ra o dau
		var option = zHovercardEl.getData(optionkey),
			horizontal = option.horizontal,
			vertical = option.vertical;
		
		
		
		
		
		// APPEND TO BODY
		// --
		// nhung neu nhu ma append to body
		// thi se get ra top, va left theo relative
		if(option.appendToBody){
			eleft = zHovercardEl.getAbsoluteLeft();
			eright = zHovercardEl.getAbsoluteRight();
			etop = zHovercardEl.getAbsoluteTop();
			ebottom = zHovercardEl.getAbsoluteBottom();
			
			// kiem tra xem coi position get duoc co base tren 1 cai fixed element hay khong
			var elem = element,
				position = '',
				positionFixed = false;
			while(elem){
				// neu truy toi body luon roi thi thoi
				if(elem == document.body)break;
				// kiem tra coi element nay co phai la fixed hay khong
				try{
					position = zjs(elem).getStyle('position');
					if(position=='fixed'){
						positionFixed = true;
						break;
					}
				}catch(err){}
				elem = elem.parentNode;
			}
			
			// fix position
			if(option.autoFixPosition == true){
				var zWindowEl = zjs(window);
				// vertical
				if(vertical == 'top'){
					var bodyHeight = zjs(document.body).height();
					if(bodyHeight - ebottom - eheight - pheight < (positionFixed ? 0 : document.body.scrollTop))vertical = 'bottom';
				}
				if(vertical == 'bottom'){
					var windowInnerHeight = zWindowEl.height();
					if(etop + eheight + pheight > (positionFixed ? 0 : document.body.scrollTop) + windowInnerHeight)vertical = 'top';
				}

				// horizontal
				if(horizontal == 'left'){
					var windowInnerWidth = zWindowEl.width();
					if(eleft + ewidth + pwidth > document.body.scrollLeft + windowInnerWidth)horizontal = 'right';
				}
				if(horizontal == 'right'){
					var bodyWidth = zjs(document.body).width();
					if(bodyWidth - eright - ewidth - pwidth < document.body.scrollLeft)horizontal = 'left';
				}
			}
		}
		
		// NOT APPEND TO BODY
		// --
		else{
		
			//console.log(option.autoFixPosition);
			//console.log(horizontal);
		
			// first fix
			if(option.autoFixPosition == true){
				// neu nhu set la center
				if(horizontal == 'center' && pwidth/2 > ewidth/2 + eleft)horizontal = 'left';
				if(horizontal == 'center' && pwidth/2 > ewidth/2 + eright)horizontal = 'right';
				// neu nhu set la left thi phai kiem tra xem width cua panel co vuot qua khong
				if(horizontal == 'left' && pwidth > ewidth + eright)horizontal = 'right';
				// neu set la right thi cung kiem tra tuong tu
				// tuc la neu truong truong hop left chuyen qua right,
				// ma right van khong duoc thi chuyen lai qua left
				if(horizontal == 'right' && pwidth > ewidth + eleft)horizontal = 'left';
			}
		}
		
		
		// FIX DONE!
		// --
		// sau khi xong buoc tinh toan quyet dinh
		// thi gio se fix lai position cho dung
		// horizontal
		if(horizontal == 'center'){
			// set panel hien thi canh theo center cua element
			// nhung cung phai fix lai cho hop ly
			var pleft = eleft - pwidth/2 + ewidth/2;
			var aleft = pwidth/2;
			if(option.appendToBody){
				var windowInnerWidth = zWindowEl.width();
				var new_pleft = pleft;
				if(pleft + pwidth + 10 > document.body.scrollLeft + windowInnerWidth){
					new_pleft = document.body.scrollLeft + windowInnerWidth - pwidth - 10;
				}
				if(pleft - 10 < document.body.scrollLeft){
					new_pleft = document.body.scrollLeft + 10;
				}
				if(pleft !== new_pleft){
					aleft-= (new_pleft - pleft);
					pleft = new_pleft;
				}
			}
			zHovercardPanelwrapEl.addClass(hovercardpanelwrapleftclass);
			zHovercardPanelwrapEl.left(pleft);
			zHovercardArrowEl.left(aleft).right('auto');
		}else if(horizontal == 'left'){
			// set panel hien thi canh theo left cua element
			zHovercardPanelwrapEl.addClass(hovercardpanelwrapleftclass);
			zHovercardPanelwrapEl.left(option.left == 'auto' ? eleft : parseInt(option.left));
			if(option.autoFixArrowPosition){
				var aleft = (option.left == 'auto' ? ewidth/2 : ewidth/2 + eleft - option.left);
				if(aleft > pwidth/2)aleft = pwidth/2;
				zHovercardArrowEl.left(aleft).right('auto');
			}
		}else if(horizontal == 'right'){
			// canh theo right cua element
			zHovercardPanelwrapEl.addClass(hovercardpanelwraprightclass);
			zHovercardPanelwrapEl.right(option.right == 'auto' ? eright : parseInt(option.right));
			if(option.autoFixArrowPosition){
				var aright = (option.right == 'auto' ? ewidth/2 : ewidth/2 + eright - option.right);
				if(aright > pwidth/2)aright = pwidth/2;
				zHovercardArrowEl.right(aright).left('auto');
			}
		}
		
		// vertical
		if(vertical == 'top'){
			// set panel hien thi canh theo top cua element
			zHovercardPanelwrapEl.addClass(hovercardpanelwraptopclass);
			zHovercardPanelwrapEl.bottom(option.bottom == 'auto' ? ebottom + eheight : option.bottom);
		}else if(vertical == 'bottom'){
			// set panel hien thi canh theo bottom cua element
			zHovercardPanelwrapEl.addClass(hovercardpanelwrapbottomclass);
			zHovercardPanelwrapEl.top(option.top == 'auto' ? etop + eheight : option.top);
		}
		
		// position fixed
		// neu nhu co position fixed thi se them class vo
		if(positionFixed)zHovercardPanelwrapEl.addClass(hovercardpanelfixedclass);
		else zHovercardPanelwrapEl.removeClass(hovercardpanelfixedclass);
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeHovercard: function(useroption){
			return this.eachElement(function(element){makeHovercard(element, useroption)});
		},
		hovercardShow: function(useroption){
			return this.eachElement(function(element){hovercardShow(element)});
		},
		hovercardHide: function(useroption){
			return this.eachElement(function(element){hovercardHide(element, false)});
		},
		hovercardPanel: function(){
			// tap hop cac panel lai
			var zPanelEls = [];
			this.eachElement(function(element){
				var zHovercardPanelwrapEl = zjs(element).getData(wrapelkey);
				// neu nhu khong co panel wrap element thi 
				// chung to day khong phai la mot hovercard
				if(!zHovercardPanelwrapEl)return;
				zPanelEls.push(zHovercardPanelwrapEl.item(0, true));
			});
			return zjs(zPanelEls);
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			var zEl = zjs(el);
			
			// kiem tra xem trong so cac thang con
			// co class nao la zhovercard ko, neu nhu co thi se auto makeHovercard luon
			zEl.find('.zhovercard').makeHovercard();
			zEl.find('.zhovercardcenter').makeHovercard({horizontal:'center'});
			zEl.find('.zhovercardleft').makeHovercard({horizontal:'left'});
			zEl.find('.zhovercardright').makeHovercard({horizontal:'right'});
			
			// kiem tra xem neu nhu thang hovercard inner
			// ma thay html thi cung align lai panel luon
			if(zEl.hasClass(hovercardpanelinnerclass))
				hovercardAlign(zEl.getData(hovercardelkey));
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zhovercard ko, neu nhu co thi se auto makeHovercard luon
			if(zjs(el).hasClass('zhovercard'))zjs(el).makeHovercard();
			if(zjs(el).hasClass('zhovercardcenter'))zjs(el).makeHovercard({horizontal:'center'});
			if(zjs(el).hasClass('zhovercardleft'))zjs(el).makeHovercard({horizontal:'left'});
			if(zjs(el).hasClass('zhovercardright'))zjs(el).makeHovercard({horizontal:'right'});
			
			zjs(el).find('.zhovercard').makeHovercard();
			zjs(el).find('.zhovercardcenter').makeHovercard({horizontal:'center'});
			zjs(el).find('.zhovercardleft').makeHovercard({horizontal:'left'});
			zjs(el).find('.zhovercardright').makeHovercard({horizontal:'right'});
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zhovercard').makeHovercard();
		zjs('.zhovercardcenter').makeHovercard({horizontal:'center'});
		zjs('.zhovercardleft').makeHovercard({horizontal:'left'});
		zjs('.zhovercardright').makeHovercard({horizontal:'right'});
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.hovercard');
});