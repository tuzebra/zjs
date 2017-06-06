// extend module Image Slider cho zjs
;(function(zjs){
	
	var optionkey = 'zmoduleimageslideroption';

	// chua' 1 dong' theme cho slider
	var sliderThemes = {};
		
	// make 1 cai' shortcut cho ham` regTheme
	zjs.extendCore({
		moduleImageSliderOption: {
			theme: '',
			slideitem: 'li'
		},
		regSliderTheme: function(name, callback){
			sliderThemes[name] = callback;
		}
	});
	
	var themeobjkey = 'moduleimagesliderobject';
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeSlide: function(useroption){return this.makeSlider(useroption);},
		makeSlider: function(useroption){
			return this.eachElement(function(element){
				
				var zSliderEl = zjs(element);
							
				// - - - 
				// neu ma co roi thi se ghi lai option
				// option luc nay la option cua user
				var option = zSliderEl.getData(optionkey);
		
				// flag y bao phai refresh lai option
				if(option){
					zSliderEl.setData(optionkey, zjs.extend(option, useroption));
					return;
				};
		
				// - - - 
				// neu ma chua co thi se lam binh thuong
				// copy option tu default option
				option = zjs.clone(zjs.moduleImageSliderOption);
				// extend from inline option ?
				var inlineoption = zSliderEl.getAttr('data-option', '');
				if(zjs.isString(inlineoption) && inlineoption.trim()!='')
					option = zjs.extend(option, inlineoption.jsonDecode());
				// extend from user option ?
				if(typeof useroption!='undefined')
					option = zjs.extend(option, useroption);
				var slideItems = zSliderEl.find(option.slideitem);
				if(!slideItems.count() && option.slideitem == 'li'){
					option.slideitem = 'img';
					slideItems = zSliderEl.find(option.slideitem);
				}
				// save option
				zSliderEl.setData(optionkey, option);
				
		
				if( typeof sliderThemes[option.theme] == 'undefined' ){
					// console.log('[makeSlider]: theme "'+option.theme+'" not support!');
					return;
				}
				
			
				var images = [];
				// gio` se~ get infomation truoc'
				slideItems.eachElement(function(li){
				
					var zli = zjs(li),src = '',srclarge = '',srcpopup = '',srclazy = '',title = '',description = '',link = '';
					if(src=='')src = zli.find('img').getAttr('src','');
					if(src=='')src = zli.find('img').getAttr('src','');
					if(src=='')src = zli.find('img.thumb').getAttr('src','');
					if(src=='')src = zli.find('[data-src]').getAttr('data-src','');
					if(src=='')src = zli.find('img').getAttr('src','');
					if(src=='')src = zli.find('img').getAttr('src','');
					if(src=='')src = zli.getAttr('src','');
					if(src=='')src = zli.getAttr('data-src','');
					if(title=='')title = zli.find('.title').getInnerText();
					if(title=='')title = zli.find('h3').getInnerText();
					if(title=='')title = zli.find('img').getAttr('title','');
					if(title=='')title = zli.find('img').getAttr('alt','');
					if(description=='')description = zli.find('.description').getInnerHTML();
					if(description=='')description = zli.find('.caption').getInnerText();
					if(description=='')description = zli.find('p').getInnerText();
					if(description=='')description = zli.find('img').getAttr('alt','');
					if(description=='')description = zli.getAttr('alt','');
					if(srclarge=='')srclarge = zli.find('img.large').getAttr('src','');
					if(srclarge=='')srclarge = zli.find('img').getAttr('data-largesrc','');
					if(srclarge=='')srclarge = zli.find('img').getAttr('data-srclarge','');
					if(srclarge=='')srclarge = zli.find('img').getAttr('largesrc','');
					if(srclarge=='')srclarge = zli.find('img').getAttr('srclarge','');
					if(srclarge=='')srclarge = zli.getAttr('data-srclarge','');
					if(srclarge=='')srclarge = zli.getAttr('srclarge','');
					if(srcpopup=='')srcpopup = zli.find('img.popup').getAttr('src','');
					if(srcpopup=='')srcpopup = zli.find('img').getAttr('data-popupsrc','');
					if(srcpopup=='')srcpopup = zli.find('img').getAttr('data-srcpopup','');
					if(srcpopup=='')srcpopup = zli.find('img').getAttr('popupsrc','');
					if(srcpopup=='')srcpopup = zli.find('img').getAttr('srcpopup','');
					if(srcpopup=='')srcpopup = zli.getAttr('popupsrc','');
					if(srcpopup=='')srcpopup = zli.getAttr('srcpopup','');
					if(srclazy=='')srclazy = zli.find('[data-lazy-src]').getAttr('data-lazy-src','');
					if(srclazy=='')srclazy = zli.find('[data-lazysrc]').getAttr('data-lazysrc','');
					if(srclazy=='')srclazy = zli.find('[data-srclazy]').getAttr('data-srclazy','');
					if(srclazy=='')srclazy = zli.find('[srclazy]').getAttr('srclazy','');
					if(srclazy=='')srclazy = zli.getAttr('srclazy','');
					if(srclazy=='')srclazy = zli.getAttr('data-lazy-src','');
					if(link=='')link = zli.find('a').getAttr('href','');
					if(link=='')link = zli.find('img').getAttr('data-link','');
					if(link=='')link = zli.find('img').getAttr('link','');
					if(src=='' && srclarge!='')src = srclarge;
					if(src=='' && srcpopup!='')src = srcpopup;
					images.push({src: src, srclarge: srclarge, srcpopup: srcpopup, srclazy: srclazy, title: title, description: description, link: link});
				});
				// bay gio` se~ quang het' cai' infomation nay` vao` theme xu? ly'
				zjs(element).setData(themeobjkey, (sliderThemes[option.theme])(element, images, option));
			});
		},
		slideTo: function(index){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slideTo =='function')themeObj.slideTo(index);
			});
		},
		slideNext: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slideNext =='function')themeObj.slideNext();
			});
		},
		slidePrev: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slidePrev =='function')themeObj.slidePrev();
			});
		},
		slidePause: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slidePause =='function')themeObj.slidePause();
			});
		},
		slidePlay: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slidePlay =='function')themeObj.slidePlay();
			});
		},
		slidePopupShow: function(defaultIndex){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slidePopupShow =='function')themeObj.slidePopupShow(defaultIndex);
			});
		},
		slidePopupHide: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slidePopupHide =='function')themeObj.slidePopupHide();
			});
		},
		slideRefresh: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slideRefresh =='function')themeObj.slideRefresh();
			});
		},
		slideDisable: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slideDisable =='function')themeObj.slideDisable();
			});
		},
		slideEnable: function(){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slideEnable =='function')themeObj.slideEnable();
			});
		},
		slideFilter: function(slideItemFilterHandler){
			return this.eachElement(function(element){
				var themeObj = zjs(element).getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.slideFilter =='function')themeObj.slideFilter(slideItemFilterHandler);
			});
		},
		getSliderInfo: function(){
			var zEl = this.item(0);
			if(zEl){
				var themeObj = zEl.getData(themeobjkey);
				if(typeof themeObj == 'object' && typeof themeObj.getSliderInfo =='function'){
					return themeObj.getSliderInfo();
				}
			}

			return false;
		}
	});
	
	
	// auto make image slider
	var scrollbarIdkey = 'zmodulescrollbarid';
	var isBodyScrollbar = function(){
		return parseInt(zjs(document.body).getData(scrollbarIdkey,0))>0;
	};
	
	var autoMakeSlider = function(element, isHookAuto){
		// check coi nhieu khi co require scrollbar
		// nhung chua khoi tao xong
		// nen cho scrollbar khoi tao xong
		// thi moi makeslider
		if("moduleScrollbarOption" in zjs && zjs(document.body).hasClass('zscroll') && !isBodyScrollbar()){
			//console.log('co scrollbar nhung ma chua khoi tao ne');
			if(!isHookAuto){
			//	console.log('is not hook: scrollbar.ready');
				zjs(document.body).on('scrollbar.ready', function(){
					zjs(element).makeSlider();
				});
			};
			return;
		};
		zjs(element).makeSlider();
	};
	
	// dang ky hook nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zslider ko, neu nhu co thi se auto makeSlider luon
			autoMakeSlider(zjs(el).find('.zslider'), true);
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zslider ko, neu nhu co thi se auto makeSlider luon
			if(zjs(el).hasClass('zslider'))autoMakeSlider(el, true);
			autoMakeSlider(zjs(el).find('.zslider'), true);
		}
	});
	
	// make auto-init slider
	zjs.onready(function(){
		autoMakeSlider('.zslider', false);
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.slider');
	
})(zjs);