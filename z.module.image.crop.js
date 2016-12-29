// extend module Image Crop cho zjs
;(function(zjs){
//"use strict";
	
	var optionkey = 'zmoduleimagecropoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleImageCropOption: {
			
		}
	});
	
	// template
	var zimagecropclass = 'zui-image-crop',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeImageCrop = function(element, useroption){
		
		var zImageEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zImageEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zImageEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleImageCropOption);
		// extend from inline option ?
		var inlineoption = zImageEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zImageEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		zImageEl.addClass(zimagecropclass);
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeImageCrop: function(useroption){
			return this.each(function(element){makeImageCrop(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zimagecrop ko, neu nhu co thi se auto makeImageCrop luon
			zjs(el).find('img.zimagecrop').makeImageCrop();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zimagecrop ko, neu nhu co thi se auto makeImageCrop luon
			if(zjs(el).hasClass('img.zimagecrop'))zjs(el).makeImageCrop();
			zjs(el).find('img.zimagecrop').makeImageCrop();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('img.zimagecrop').makeImageCrop();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.crop');

})(zjs);