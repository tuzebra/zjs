// extend module Image Resize cho zjs
;zjs.onready(function(){
//"use strict";
	
	var optionkey = 'zmoduleuisizeadaptableoption',
		originalratiokey = 'zmoduleuisizeadaptableoriginalratio';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiSizeAdaptableOption: {
			aspectRatio: false,
			parent: false,
			handlerResizeMethod: 'cover'
		}
	});
	
	// template & class
	var zsizeadaptableclass  = 'zui-size-adaptable';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeSizeAdaptable = function(element, useroption){
		
		var zSizeAdaptableEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zSizeAdaptableEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zSizeAdaptableEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiSizeAdaptableOption);
		// extend from inline option ?
		var inlineoption = zSizeAdaptableEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zSizeAdaptableEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option...
		if(option.aspectRatio){
			option.aspectRatio = parseInt(option.aspectRatio, 10);
			if(isNaN(option.aspectRatio))
				option.aspectRatio = false;
		}

		// fix handler method
		if(!(option.handlerResizeMethod in handlerMethods))
			option.handlerResizeMethod = 'cover';
		
		// save option
		zSizeAdaptableEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// add class to element
		zSizeAdaptableEl.addClass(zsizeadaptableclass);

		// get parent element
		var zParentEl = false;
		if(zjs.isString(option.parent)){
			zParentEl = zSizeAdaptableEl.findUp(option.parent);
		}else if(zjs.isElement(option.parent)){
			zParentEl = zjs(option.parent);
		}else if(zjs.isZjs(option.parent)){
			zParentEl = option.parent;
		}
		// check to see if parent element is found
		if(!zParentEl || !zParentEl.count()){
			zParentEl = zSizeAdaptableEl.parent();
		}
		// re-check again, if still don't got the parent, we don't need to do anything
		if(!zParentEl.count()){
			return;
		}

		// loaded hander
		var onloaded = function(){
			// backup original aspect ratio
			var originalRatio = zSizeAdaptableEl.width() / zSizeAdaptableEl.height();
			// bug, can't do anything
			if(isNaN(originalRatio)){
				return;
			}

			zSizeAdaptableEl.setData(originalratiokey, originalRatio);

			// get handler method
			var handlerMethod = handlerMethods[option.handlerResizeMethod];
			// first run
			handlerMethod(zSizeAdaptableEl, zParentEl, originalRatio, option);

			zjs(window).on('resize', function(){
				handlerMethod(zSizeAdaptableEl, zParentEl, originalRatio, option);
			});
		};

		if(zSizeAdaptableEl.is('img') && !zSizeAdaptableEl.item(0, true).complete){
			zSizeAdaptableEl.item(0, true).onload = function(){
				onloaded();
			};
		}else{
			onloaded();
		}
		
	};


	// HANDLER METHODs
	var handlerMethods = {
		'cover': function(zSizeAdaptableEl, zParentEl, originalRatio, option){
			// area ratio 
			var areaWidth = zParentEl.width(),
				areaHeight = zParentEl.height(),
	        	areaRatio = areaWidth / areaHeight;

	        // neu nhu cai hinh co ty le lon hon cua area
	        // thi tuc la width cua cai hinh lon hon width cua area
	        // thi luc nay se tinh lai height moi cua cai hinh = height cua area
	        if (originalRatio > areaRatio) {
	            var newElHeight = areaHeight,
	            	newElWidth = areaHeight * originalRatio,
	            	newElTop = 0,
		            // tinh cai left nay ngoai viec giong nhu tinh left cua contain
		            // thi con phai scale no len nua
		            // boi vi cai left nay dung cho source image (tuc la cai size no to hon)
		            // nen phai scale cai left nay len (do left nay la dang duoc tinh
		            // theo size cua destination image (hinh nho) => nen phai scale to len
		            newElLeft = (areaWidth - newElWidth) / 2;
	        } // va nguoc lai cho height
	        else {
				var newElWidth = areaWidth,
					newElHeight = areaWidth / originalRatio, 
					newElTop = (areaHeight - newElHeight) / 2,
					newElLeft = 0;
	        }

	        // apply size
	        zSizeAdaptableEl.setStyle({
	        	width: newElWidth,
	        	height: newElHeight,
	        	top: newElTop,
	        	left: newElLeft,
	        });
		},
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeSizeAdaptable: function(useroption){
			return this.eachElement(function(element){makeSizeAdaptable(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zimageresize ko, neu nhu co thi se auto makeImageResize luon
			zjs(el).find('.zsizeadaptable').makeSizeAdaptable();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zimageresize ko, neu nhu co thi se auto makeImageResize luon
			if(zjs(el).hasClass('zsizeadaptable'))zjs(el).makeSizeAdaptable();
			zjs(el).find('.zsizeadaptable').makeSizeAdaptable();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zsizeadaptable').makeSizeAdaptable();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.sizeadaptable');

});