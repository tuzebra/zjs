// MODULE UI SELECTBOX
zjs.require('scrollbar, ui, ui.button', function(){
"use strict";
	
	var optionkey = 'zmoduleuiselectboxoption',
		wrapelkey = 'zmoduleuiselectboxwrapel';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiSelectboxOption: {
			width: 'auto', // 'auto', number
			customCssClass: '',
			panelmaxheight: 250,
			itemtemplate: '${text}',
		}
	});
	
	// trigger
	//ui:selectbox:change
	//ui:selectbox:clickchange
	
	// template
	var selectboxclass = 'zui-selectbox',
		selectboxbuttonwrapclass = 'zui-selectbox__button-wrap',
		selectboxbuttonclass = 'zui-selectbox__button',
		contextualbuttonclass = 'zui-contextual-button',
		contextualpanelwrapclass = 'zui-contextual-panel-wrap',
		selectboxpanelwrapclass = 'zui-selectbox__panel-wrap',
		selectboxpanelwrapinitclass = 'zui-initing',
		contextualpanelwraphideclass = 'zui-hide',
		selectboxpanelinnerclass = 'zui-selectbox__panel-inner',
		selectboxpanelclass = 'zui-selectbox__panel',
		selectboxwraphtml = '<div class="'+selectboxclass+'">'+
								'<div class="'+selectboxbuttonwrapclass+'">'+
									'<a class="'+contextualbuttonclass+' '+selectboxbuttonclass+'"></a>'+
								'</div>'+
								'<div class="'+contextualpanelwrapclass+' '+selectboxpanelwrapclass+' '+selectboxpanelwrapinitclass+'">'+
									'<div class="'+selectboxpanelinnerclass+'">'+
										'<div class="'+selectboxpanelclass+'"></div>'+
									'</div>'+
								'</div>'+
							'</div>',
		selectboxitemclass = 'zui-selectbox__item',
		selectboxitemselectedclass = 'zui-selected',
		selectboxitemdisabledclass = 'zui-disabled',
		selectboxitemhtml = '<a class="'+selectboxitemclass+'"></a>',
		selectboxitemheaderclass = 'zui-selectbox__item-header',
		selectboxitemheaderlineclass = 'zui-selectbox__item-header-line',
		selectboxitemheaderhtml = '<span class="'+selectboxitemheaderclass+'"></span>',
		
		// cai nay khong duoc sua doi, vi la defined trong ui.button
		zbuttonlabelclass = 'zui-button-label',
		zbuttonactiveclass = 'activenothover',
		zuihideclass = 'zui-uihide';
	
	var regDataAttr = /^data\-(.+)$/;

	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeSelectbox = function(element, useroption){
		
		var zSelectboxEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zSelectboxEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zSelectboxEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiSelectboxOption);
		// extend from inline option ?
		var inlineoption = zSelectboxEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zSelectboxEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zSelectboxEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// van giu nguyen element nguyen goc
		// chi tao ra, va add class cho mot element insert after
		var zSelectboxWrapEl = zjs(selectboxwraphtml);
		
		// set width
		if(option.width == 'auto'){
			zSelectboxWrapEl.width(zSelectboxEl.width());
		}
		if(option.customCssClass !=''){
			zSelectboxWrapEl.addClass(option.customCssClass);
		}

		// sau do luu lai luon de sau nay truy xuat
		zSelectboxEl.setData(wrapelkey, zSelectboxWrapEl);
		
		// gio moi insert vao thoi
		zSelectboxWrapEl.insertAfter(zSelectboxEl);
		
		// PANEL 
		// - - - 
		
		// get ra thang panel de append cac option cho no
		var zSelectboxPanelWrapEl = zSelectboxWrapEl.find('.'+selectboxpanelwrapclass),
			zSelectboxPanelEl = zSelectboxWrapEl.find('.'+selectboxpanelclass);
		
		// bay gio se tien hanh di get ra toan bo value cua cai selectbox
		var countTotalItem = 0, countTotalActiveItem = 0, defaultSelectedIndex = 0;
		zSelectboxEl.find('option,optgroup').eachElement(function(el){
			var zEl = zjs(el);
			// kiem tra xem coi type cua element de lam 
			if(zEl.is('optgroup')){
				// append 1 cai header vao panel
				var headerEl = zjs(selectboxitemheaderhtml).appendTo(zSelectboxPanelEl);
				if(zEl.getAttr('label','')!='')headerEl.setInnerHTML(zEl.getAttr('label'));
				else headerEl.addClass(selectboxitemheaderlineclass);
			}
			else if(zEl.is('option')){
				countTotalItem++;
				var itemEl = zjs(selectboxitemhtml).appendTo(zSelectboxPanelEl);
				var itemValue = zEl.is('[value]') ? zEl.getAttr('value','') : zEl.getInnerHTML();
				itemEl.setAttr('data-value', itemValue);
				// set custom html
				var customhtml = zEl.getAttr('data-html', '');
				if(customhtml==''){
					var formatData = {
						value: itemValue,
						text: zEl.getInnerHTML(),
					};
					// get them nhung thang attribute nao bat dau bang "data-"
					zjs.foreach(zEl.item(0,true).attributes, function(attr){
						if (regDataAttr.test(attr.nodeName)) {
							var key = attr.nodeName.match(regDataAttr)[1];
							formatData[key] = attr.nodeValue;
						}
					});
					var iteminnerhtml = '';
					if(typeof option.itemtemplate == 'function')iteminnerhtml = option.itemtemplate(formatData);
					if(typeof option.itemtemplate == 'string')iteminnerhtml = option.itemtemplate;
					if(typeof iteminnerhtml == 'string')iteminnerhtml = iteminnerhtml.format(formatData);
					customhtml = iteminnerhtml;
				}
				itemEl.setInnerHTML(customhtml);
				// cem coi thang nay neu nhu disabled thi thoi
				if(zEl.is('[disabled]')){
					itemEl.addClass(selectboxitemdisabledclass);
					return;
				}
				countTotalActiveItem++;
				// xem coi neu nhu thang option nay co data-href
				// thi set cho thang a 1 cai href luon
				var href = zEl.getAttr('data-href', '');
				if(href!='')itemEl.setAttr('href', href);
				if(zEl.is('[selected]')){
					itemEl.addClass(selectboxitemselectedclass);
					defaultSelectedIndex = (countTotalItem - 1);
				}
				// san tien fix lai cau truc cua thang select goc luon
				zEl.setAttr('value', itemEl.getAttr('data-value'));
				// custom class
				var customclass = zEl.getAttr('data-class', '');
				if(customclass!='')itemEl.addClass(customclass);
			};
		});

		// reset lai cai selected value cho thang select
		// because Modern browsers implement something known as back-forward cache (BFCache).
		element.selectedIndex = defaultSelectedIndex;

		// add them class de biet duong ma style
		zSelectboxWrapEl.addClass('total-item-'+countTotalItem).addClass('total-active-item-'+countTotalActiveItem);
		
		// boi vi can makeScrollbar cho panel (width, height)
		// nen trong luc init phai set visibility cua 
		// panel la hidden bang class initing
		// va sau khi makeScrollbar xong roi thi se 
		// remove class init di va add class hide vao
		var zSelectboxPanelHeight = zSelectboxPanelEl.height();
		if(zSelectboxPanelHeight > option.panelmaxheight){
			// nhieu khi module scrollbar chua duoc load thi se khong can dung toi luon
			if('makeScrollbar' in zSelectboxPanelEl){
				zSelectboxPanelEl.makeScrollbar({height:option.panelmaxheight});
			}
		}
		zSelectboxPanelWrapEl.addClass(contextualpanelwraphideclass).removeClass(selectboxpanelwrapinitclass);
		
		// sau cung se xem coi neu chua co cai item nao duoc selected
		// neu chua co thi se auto select cai dau tien ma khong disable
		if(zSelectboxPanelEl.find('.'+selectboxitemclass+'.'+selectboxitemselectedclass).count()==0)
			zSelectboxPanelEl.find('.'+selectboxitemclass+':not(.'+selectboxitemdisabledclass+')').item(0).addClass(selectboxitemselectedclass);
		
		// bind event click cho tung thang item
		// bind theo kieu live de sau nay co gi append item vao them duoc
		zSelectboxPanelEl.on('click', '.'+selectboxitemclass, function(event){
			var zSelectboxItemEl = zjs(this);
			
			// neu nhu thang nay dang disable thi thoi
			if(zSelectboxItemEl.hasClass(selectboxitemdisabledclass))
				return;
				
			selectboxSelectValue(zSelectboxEl, zSelectboxItemEl.getAttr('data-value'), 'click');
		});
		
		// sau khi init xong panel roi thi se 
		// remove di cai position relative cua thang zui-selectbox luon
		// zSelectboxWrapEl.setStyle('position','initial');
		// set width cho thang panel
		//zSelectboxPanelWrapEl.width(zSelectboxWrapEl.width()); /* to remove */
		
		// BUTTON  
		// - - - -
		
		// gio moi di set value cho thang button ne
		var zSelectboxButtonEl = zSelectboxWrapEl.find('.'+selectboxbuttonclass);
		var zSelectboxButtonLabelEl;
		// truoc tien phai make no thanh zjs uibutton cai da
		if(zjs.isFunction(zSelectboxButtonEl.makeButton)){
			zSelectboxButtonEl.makeButton();
			zSelectboxButtonLabelEl = zSelectboxButtonEl.find('.'+zbuttonlabelclass);
		}
		else{
			zSelectboxButtonLabelEl = zSelectboxButtonEl;
		}
		
		// gio se set text cho no la thang selected item trong panel
		zSelectboxButtonLabelEl.setInnerHTML(zSelectboxPanelEl.find('.'+selectboxitemclass+'.'+selectboxitemselectedclass).item(0).getInnerHTML());
		
		// bind event click cho button
		zSelectboxButtonEl.on('click', function(event){
			event.preventDefault();
			event.stop();
			// kiem tra coi button nay co active chua truoc tien
			var actived = zSelectboxButtonEl.hasClass(zbuttonactiveclass);
			// check xem cac zselectbox khac hide active stage
			zjs('.'+contextualbuttonclass).removeClass(zbuttonactiveclass);
			zjs('.'+contextualpanelwrapclass).addClass(contextualpanelwraphideclass);
			// gio moi active cai cua minh
			// neu nhu ma chua co active thi moi active
			// co roi thi thoi (se hide luon, vi o tren la vua hide all luon)
			if(actived)return;
			zSelectboxButtonEl.addClass(zbuttonactiveclass);
			zSelectboxPanelWrapEl.removeClass(contextualpanelwraphideclass);
		});
		
		
		// hide cai input select di thoi
		// nhung tuyet doi khong bao gio choi display none
		zSelectboxEl.addClass(zuihideclass);
		
		// support inline html attribute "onchange" luon
		var inlineJsFunctionName = zSelectboxEl.getAttr('onchange', '');
		if(inlineJsFunctionName != ''){
			var func = new Function('event', 'return '+inlineJsFunctionName+'.call(this, event)');
			zSelectboxEl.on('ui:selectbox:change', func);
		}
	};
	
	// bind event cho document luon
	zjs(document).on('click', function(){
		zjs('.'+selectboxbuttonclass).removeClass(zbuttonactiveclass);
		zjs('.'+selectboxpanelwrapclass).addClass(contextualpanelwraphideclass);
	});
	
	// ham giup select 1 item nao do
	var selectboxSelectValue = function(element, value, click){
		var zSelectboxEl = zjs(element);
		// neu nhu khong phai la zjs uiselectbox thi thoi
		var zSelectboxWrapEl = zSelectboxEl.getData(wrapelkey, false);
		if(!zSelectboxWrapEl)return;
		
		
		
		//
		var zSelectboxPanelEl = zSelectboxWrapEl.find('.'+selectboxpanelclass),
			zSelectboxButtonEl = zSelectboxWrapEl.find('.'+selectboxbuttonclass),
			zSelectboxButtonLabelEl = zSelectboxButtonEl.find('.'+zbuttonlabelclass);
		if(!zSelectboxButtonLabelEl.count())
			zSelectboxButtonLabelEl = zSelectboxButtonEl;
			
		// kiem coi co cai item nao thoa man value khong
		var zSelectboxItemEl = zSelectboxPanelEl.find('.'+selectboxitemclass+'[data-value="'+value+'"]').item(0);
		// neu nhu khong tim duoc cai nao thoa man value thi thoi
		if(zSelectboxItemEl.count()<=0)return;
		// neu nhu ma cai nay dang bi disabled thi cung thoi
		if(zSelectboxItemEl.hasClass(selectboxitemdisabledclass))return;
		
		// gio se selected cai item nay
		zSelectboxPanelEl.find('.'+selectboxitemclass).removeClass(selectboxitemselectedclass);
		zSelectboxItemEl.addClass(selectboxitemselectedclass);
		// change button text
		zSelectboxButtonLabelEl.setInnerHTML(zSelectboxItemEl.getInnerHTML());
		
		// sau do se change thang <option selected> trong cai <select> goc
		zSelectboxEl.find('option[selected]').selected(false);
		zSelectboxEl.find('option[value="'+value+'"]').selected(true);
		
		// run trigger
		if(typeof click != 'undefined' && click == 'click')
		zSelectboxEl.trigger('ui:selectbox:clickchange', {value:value, text:zSelectboxItemEl.getInnerHTML()});
		zSelectboxEl.trigger('ui:selectbox:change', {value:value, text:zSelectboxItemEl.getInnerHTML()});
	};

	// ham giup get ra tat ca value dang co
	var selectboxGetAllValue = function(element){
		var zSelectboxEl = zjs(element);
		// neu nhu khong phai la zjs uiselectbox thi thoi
		var zSelectboxWrapEl = zSelectboxEl.getData(wrapelkey, false);
		if(!zSelectboxWrapEl)return [];

		var values = [];
		zSelectboxWrapEl.find('.'+selectboxitemclass).eachElement(function(el){
			values.push(z(el).getAttr('data-value', ''))
		});
		return values;
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeSelectbox: function(useroption){
			return this.eachElement(function(element){makeSelectbox(element, useroption)});
		},
		selectboxSelectValue: function(value){
			return this.eachElement(function(element){selectboxSelectValue(element, value)});
		},
		selectboxGetAllValue: function(){
			return selectboxGetAllValue(this.item(0, true));
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zselectbox ko, neu nhu co thi se auto makeSelectbox luon
			zjs(el).find('.zselectbox').makeSelectbox();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zselectbox ko, neu nhu co thi se auto makeSelectbox luon
			if(zjs(el).hasClass('zselectbox'))zjs(el).makeSelectbox();
			zjs(el).find('.zselectbox').makeSelectbox();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zselectbox').makeSelectbox();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.selectbox');
});