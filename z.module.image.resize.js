// extend module Image Resize cho zjs
;zjs.require('image.loader', function(){
//"use strict";
	
	var optionkey = 'zmoduleimageresizeoption',
		originalratiokey = 'zmoduleimageresizeoriginalratio',
		shadowimagekey = 'zmoduleimageresizeshadowimg',
		hidecornertimeoutkey = 'zmoduleimageresizehidecortimeout',
		resizeonprocesskey = 'zmoduleimageresizeonprocess',
		
		// 8 corner
		corner1key = 'zmoduleimageresizecorner1',
		corner2key = 'zmoduleimageresizecorner2',
		corner3key = 'zmoduleimageresizecorner3',
		corner4key = 'zmoduleimageresizecorner4',
		corner5key = 'zmoduleimageresizecorner5',
		corner6key = 'zmoduleimageresizecorner6',
		corner7key = 'zmoduleimageresizecorner7',
		corner8key = 'zmoduleimageresizecorner8',
		
		// 4 border
		borderTopKey = 'zmoduleimageresizebordertop',
		borderLeftKey = 'zmoduleimageresizeborderleft',
		borderRightKey = 'zmoduleimageresizeborderright',
		borderBottomKey = 'zmoduleimageresizeborderbottom',
		
		cornerindexkey = 'zmoduleimageresizecornerindexkey';
	
	// extend core mot so option
	zjs.extendCore({
		moduleImageResizeOption: {
			aspectRatio: false,
			pressShiftToAspectRatio: true,
			minWidth: 50,
			minHeight: 50,
			changePosition: true,
			changeZindex: true,
			border: true,
			hideCornerTimeout: 600
		}
	});
	
	// global variable
	var globalZindex = 1;
	
	// template
	var zimagemovableclass = 'zimage-resize-movable',
		zcornerclass = 'zimage-resize-corner',
		zcornermoveclass = 'zimage-resize-corner-move',
		zborderclass = 'zimage-resize-border',
		zbordermoveclass = 'zimage-resize-border-move',
		zbodymoveclass = 'zimage-resize-process',
		zimageshadowclass = 'zimage-resize-shadowimg',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeImageResize = function(element, useroption){
		
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
		option = zjs.clone(zjs.moduleImageResizeOption);
		// extend from inline option ?
		var inlineoption = zImageEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zImageEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option minWidth, minHeight
		if(option.minWidth<=0)option.minWidth = 1;
		if(option.minHeight<=0)option.minHeight = 1;
		
		// test xem coi element nay co cho phep change position duoc hay khong
		// position phai la 'absolute' hoac 'fixed' thi moi duoc
		// neu nhu element la table roi thi coi nhu la co relative roi
		var position = zImageEl.getStyle('position');
		if(position!='absolute' && position!='fixed')
			option.changePosition = false;
			
		// neu nhu khong cho change position thi zindex cung se khong duoc change
		if(!option.changePosition)
			option.changeZindex = false;
		
		// save option
		zImageEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// bay gio se lay ra src cua cai tam hinh
		var src = zImageEl.getAttr('src', '');
		if(!src)return;
		
		// co duoc src roi thi phai cho cho khi nao cai hinh nay load xong thi moi init
		if(!'loadImage' in zjs)return;
		zjs.loadImage({
			image: src,
			onLoaded: function(image){
				
				// that su init
				// trong qua trinh load xong thi minh se get duoc
				// image{width,height,src}
				// nhung ma cai image nay la image voi width, height that su tren server
				// va se khong su dung thong tin nay
				// ma se su dung thong tin width, height cua image element
				// de lam tieu chuan (boi vi width, height co the duoc
				// thay doi dua vao css, va khong dung voi ti le that su cua image)
				// neu nhu 1 trong 2 thang width hoac height bang 0 thi bo tay (lam sao lay ratio duoc)
				if(zImageEl.width() == 0 || zImageEl.height() == 0)
					return;
				
				// lay ra ty le goc cua hinh
				// ty le se duoc tinh la dua vao width/height
				// sau do luu lai ty le nay luon
				var originalRatio = zImageEl.width() / zImageEl.height();
				zImageEl.setData(originalratiokey, originalRatio);
				
				// tao ra 1 cai hinh lam shadow cho cai hinh that
				// va phai append cai hinh nay vao trong 1 thang cha cua imageEl
				// va thang cha nay phai la thang cha relative
				var zImageRelativeParent = zImageEl.parent(true);
				zImageEl.setData(shadowimagekey, zjs('<img src="'+image.src+'" />').addClass(zimageshadowclass).appendTo(zImageRelativeParent));
				
				// bay gio se xem coi co option border hay khong, neu co thi se append them border
				if(option.border){
					zImageEl.setData(borderTopKey, zjs('<div class="'+zborderclass+' brtop"></div>').appendTo(zImageRelativeParent));
					zImageEl.setData(borderLeftKey, zjs('<div class="'+zborderclass+' brleft"></div>').appendTo(zImageRelativeParent));
					zImageEl.setData(borderRightKey, zjs('<div class="'+zborderclass+' brright"></div>').appendTo(zImageRelativeParent));
					zImageEl.setData(borderBottomKey, zjs('<div class="'+zborderclass+' brbottom"></div>').appendTo(zImageRelativeParent));
				};
				
				// tiep theo la tao ra 8 corner cua tam hinh
				// vi tri cac corner duoc danh so nhu sau:
				// 1--2--3
				// 4-----5
				// 6--7--8
				// sau khi tao ra thi phai append cac corner 
				var	i = 0;
				for(i=1;i<=8;i++)
					zImageEl.setData('zmoduleimageresizecorner'+i, 
						zjs('<div></div>')
						.addClass(zcornerclass)
						.addClass('c'+i)
						.setData(cornerindexkey, i)
						.drag({
							onStart: function(event, cornerElement){
								handlerCornerDragStart(element, cornerElement);
							},
							onDrag: function(event, cornerElement, mouse, style){
								handlerCornerDrag(element, cornerElement, mouse, style, event);
							},
							onDrop: function(event, cornerElement, mouse, style){
								handlerCornerDrop(element, cornerElement, mouse, style);
							}
						})
						.hover(
							function(){
								clearTimeout(zImageEl.getData(hidecornertimeoutkey));
								if(zImageEl.getData(resizeonprocesskey, false))return;
							},
							function(){
								clearTimeout(zImageEl.getData(hidecornertimeoutkey));
								if(zImageEl.getData(resizeonprocesskey, false))return;
								// set timeout 1s de hide di may cai corner
								zImageEl.setData(hidecornertimeoutkey, setTimeout(function(){
									hideCorner(element);
								}, option.hideCornerTimeout));
							}
						)
						.appendTo(zImageRelativeParent)
					);
				
				// sau do phai fix lai vi tri cua may cai thang corner va shadow image nay ngay
				fixCornerAndShadowPosition(element);
				
				// hide border
				if(option.border){
					zImageEl.getData(borderTopKey).hide();
					zImageEl.getData(borderLeftKey).hide();
					zImageEl.getData(borderRightKey).hide();
					zImageEl.getData(borderBottomKey).hide();
				};
				
				// hide di may cai corner
				//hideCorner(element);
				zImageEl.getData(corner1key).hide();
				zImageEl.getData(corner2key).hide();
				zImageEl.getData(corner3key).hide();
				zImageEl.getData(corner4key).hide();
				zImageEl.getData(corner5key).hide();
				zImageEl.getData(corner6key).hide();
				zImageEl.getData(corner7key).hide();
				zImageEl.getData(corner8key).hide();
		
				// hide di cai hinh shadow
				hideShadowImage(element);
				
				// --
				
				// bind event khi ma mouse hover vao image thi phai show may cai corner len
				zImageEl.setData(hidecornertimeoutkey, 0);
				zImageEl.hover(
					function(event, element){
						// get ra lai element, de phong trong truong hop su dung distract event
						var zImageEl = zjs(element);
						if(!zImageEl.getData(corner1key, false))return;
						// --
						clearTimeout(zImageEl.getData(hidecornertimeoutkey));
						if(zImageEl.getData(resizeonprocesskey, false))return;
						// show may cai corner len
						showCorner(element);
						fixCornerAndShadowPosition(element);
					},
					function(event, element){
						// get ra lai element, de phong trong truong hop su dung distract event
						var zImageEl = zjs(element);
						if(!zImageEl.getData(corner1key, false))return;
						// --
						clearTimeout(zImageEl.getData(hidecornertimeoutkey));
						if(zImageEl.getData(resizeonprocesskey, false))return;
						// set timeout 1s de hide di may cai corner
						zImageEl.setData(hidecornertimeoutkey, setTimeout(function(){
							hideCorner(element);
						}, option.hideCornerTimeout));
					}
				);
				
				// neu nhu allow change position thi bay gio phai bind event khi move cai hinh nay luon
				if(option.changePosition){
					zImageEl.addClass(zimagemovableclass);
					zImageEl.drag({
						onStart: function(event, element){
							addClassCorner(element);
						},
						onDrag: function(event, element, mouse, style){
							zjs(element).left(style.left + mouse.x).top(style.top + mouse.y);
							fixCornerAndShadowPosition(element);
						},
						onDrop: function(event, element, mouse, style){
							removeClassCorner(element);
						}
					});
				};
				
				// neu nhu allow change zindex thi khi vua khoi tao phai fix lai zindex cho dung
				// va phai bind event click vao cai hinh thi zindex phai tang len
				if(option.changeZindex){
					zImageEl.setStyle('z-index', globalZindex++);
					zImageEl.click(function(){
						this.setStyle('z-index', globalZindex++);
					});
				};
			}
		});
	},
	
	// ham giup cho viec move 8 corner cua image vao dung vi tri
	fixCornerAndShadowPosition = function(element){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai la 1 image da duoc set la resize
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		// get ra option
		var option = zImageEl.getData(optionkey);
		
		// get ra cac thong so can thiet cua image de co the move cac corner
		var top = zImageEl.top(),
			left = zImageEl.left(),
			width = zImageEl.width(),
			height = zImageEl.height();
		
		// tien hanh move cac corner
		zImageEl.getData(corner1key).top(top).left(left);
		zImageEl.getData(corner2key).top(top).left(left+width/2);
		zImageEl.getData(corner3key).top(top).left(left+width);
		zImageEl.getData(corner4key).top(top+height/2).left(left);
		zImageEl.getData(corner5key).top(top+height/2).left(left+width);
		zImageEl.getData(corner6key).top(top+height).left(left);
		zImageEl.getData(corner7key).top(top+height).left(left+width/2);
		zImageEl.getData(corner8key).top(top+height).left(left+width);
		
		// move cai shadow image
		zImageEl.getData(shadowimagekey).top(top).left(left).width(width).height(height);
		
		// xem coi co option border khong, neu co thi move border luon
		if(!option.border)return;
		zImageEl.getData(borderTopKey).top(top).left(left).width(width);
		zImageEl.getData(borderLeftKey).top(top).left(left).height(height);
		zImageEl.getData(borderRightKey).top(top).left(left+width).height(height);
		zImageEl.getData(borderBottomKey).top(top+height).left(left).width(width);
	},
	
	// ham giup cho viec move 6 corner di theo shadow image
	moveOtherCornerRelativeToShadowImage = function(element, cornerIndex, symmetricCornerIndex){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		// get ra option
		var option = zImageEl.getData(optionkey);
		
		// get ra shadow image
		var zShadowImageEl = zjs(element).getData(shadowimagekey);
		if(!zShadowImageEl)return;
		
		// get ra cac thong so can thiet cua shadow image de co the move cac corner
		var top = zShadowImageEl.top(),
			left = zShadowImageEl.left(),
			width = zShadowImageEl.width(),
			height = zShadowImageEl.height(); 
		
		// tien hanh move cac corner
		if(cornerIndex!=1 && symmetricCornerIndex!=1)zImageEl.getData(corner1key).top(top).left(left);
		if(cornerIndex!=2 && symmetricCornerIndex!=2)zImageEl.getData(corner2key).top(top).left(left+width/2);
		if(cornerIndex!=3 && symmetricCornerIndex!=3)zImageEl.getData(corner3key).top(top).left(left+width);
		if(cornerIndex!=4 && symmetricCornerIndex!=4)zImageEl.getData(corner4key).top(top+height/2).left(left);
		if(cornerIndex!=5 && symmetricCornerIndex!=5)zImageEl.getData(corner5key).top(top+height/2).left(left+width);
		if(cornerIndex!=6 && symmetricCornerIndex!=6)zImageEl.getData(corner6key).top(top+height).left(left);
		if(cornerIndex!=7 && symmetricCornerIndex!=7)zImageEl.getData(corner7key).top(top+height).left(left+width/2);
		if(cornerIndex!=8 && symmetricCornerIndex!=8)zImageEl.getData(corner8key).top(top+height).left(left+width);
		
		// xem coi co option border khong, neu co thi move border luon
		if(!option.border)return;
		zImageEl.getData(borderTopKey).top(top).left(left).width(width);
		zImageEl.getData(borderLeftKey).top(top).left(left).height(height);
		zImageEl.getData(borderRightKey).top(top).left(left+width).height(height);
		zImageEl.getData(borderBottomKey).top(top+height).left(left).width(width);
	},
	
	// ham hide di cai shadow image
	hideShadowImage = function(element){
		var zShadowImageEl = zjs(element).getData(shadowimagekey);
		if(!zShadowImageEl)return;
		zShadowImageEl.hide();
	},
	
	// ham show cai shadow image
	showShadowImage = function(element){
		var zShadowImageEl = zjs(element).getData(shadowimagekey);
		if(!zShadowImageEl)return;
		zShadowImageEl.show();
	},
	
	// ham hide di may cai corner
	hideCorner = function(element){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		// get ra option
		var option = zImageEl.getData(optionkey);
		
		// tien hanh hide cac corner
		zImageEl.getData(corner1key).fadeOut();
		zImageEl.getData(corner2key).fadeOut();
		zImageEl.getData(corner3key).fadeOut();
		zImageEl.getData(corner4key).fadeOut();
		zImageEl.getData(corner5key).fadeOut();
		zImageEl.getData(corner6key).fadeOut();
		zImageEl.getData(corner7key).fadeOut();
		zImageEl.getData(corner8key).fadeOut();
		
		// xem coi co option border khong, neu co thi hide border luon
		if(!option.border)return;
		zImageEl.getData(borderTopKey).fadeOut();
		zImageEl.getData(borderLeftKey).fadeOut();
		zImageEl.getData(borderRightKey).fadeOut();
		zImageEl.getData(borderBottomKey).fadeOut();
	},
	
	// ham show may cai corner
	showCorner = function(element){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		// get ra option
		var option = zImageEl.getData(optionkey);
		
		// tien hanh hide cac corner
		zImageEl.getData(corner1key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner2key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner3key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner4key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner5key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner6key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner7key).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(corner8key).fadeStop().show().setStyle({opacity:1});
		
		// xem coi co option border khong, neu co thi show border luon
		if(!option.border)return;
		zImageEl.getData(borderTopKey).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(borderLeftKey).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(borderRightKey).fadeStop().show().setStyle({opacity:1});
		zImageEl.getData(borderBottomKey).fadeStop().show().setStyle({opacity:1});
	},
	
	// ham hide di may cai corner
	addClassCorner = function(element){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		// get ra option
		var option = zImageEl.getData(optionkey);
		
		// add class cho body luon
		zjs(document.body).addClass(zbodymoveclass);
		
		// hide di tat ca cac corner khac
		zjs('.'+zcornerclass).fadeStop().hide();
		
		// tien hanh add class move cac corner
		zImageEl.getData(corner1key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner2key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner3key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner4key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner5key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner6key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner7key).addClass(zcornermoveclass).show();
		zImageEl.getData(corner8key).addClass(zcornermoveclass).show();
		
		if(!option.border)return;
		zImageEl.getData(borderTopKey).addClass(zbordermoveclass).show();
		zImageEl.getData(borderLeftKey).addClass(zbordermoveclass).show();
		zImageEl.getData(borderRightKey).addClass(zbordermoveclass).show();
		zImageEl.getData(borderBottomKey).addClass(zbordermoveclass).show();
	},
	
	// ham hide di may cai corner
	removeClassCorner = function(element){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		// get ra option
		var option = zImageEl.getData(optionkey);
		
		// tien hanh hide cac corner
		zImageEl.getData(corner1key).removeClass(zcornermoveclass);
		zImageEl.getData(corner2key).removeClass(zcornermoveclass);
		zImageEl.getData(corner3key).removeClass(zcornermoveclass);
		zImageEl.getData(corner4key).removeClass(zcornermoveclass);
		zImageEl.getData(corner5key).removeClass(zcornermoveclass);
		zImageEl.getData(corner6key).removeClass(zcornermoveclass);
		zImageEl.getData(corner7key).removeClass(zcornermoveclass);
		zImageEl.getData(corner8key).removeClass(zcornermoveclass);
		
		// remove body class
		zjs(document.body).removeClass(zbodymoveclass);
		
		if(!option.border)return;
		zImageEl.getData(borderTopKey).removeClass(zbordermoveclass);
		zImageEl.getData(borderLeftKey).removeClass(zbordermoveclass);
		zImageEl.getData(borderRightKey).removeClass(zbordermoveclass);
		zImageEl.getData(borderBottomKey).removeClass(zbordermoveclass);
	},
	
	// ham giup cho viec handler start drag corner
	handlerCornerDragStart = function(element, cornerElement){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		var zCornerEl = zjs(cornerElement),
			cornerIndex = parseInt(zCornerEl.getData(cornerindexkey));
			
		// start
		// -- 
		
		// khong cho hide may cai corner
		clearTimeout(zImageEl.getData(hidecornertimeoutkey));
		// bao la dang trong qua trinh resize
		zImageEl.setData(resizeonprocesskey, true);
		
		addClassCorner(element);
		
		// fix position 1 cai 
		fixCornerAndShadowPosition(element);
		
		// show len cai shadow image
		showShadowImage(element);
	},
	
	// ham giup cho viec handler drag corner
	handlerCornerDrag = function(element, cornerElement, mouse, cornerStyle, event){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		var zCornerEl = zjs(cornerElement),
			cornerIndex = parseInt(zCornerEl.getData(cornerindexkey)),
			symmetricCornerIndex = 0;
		
		var option = zImageEl.getData(optionkey);
		
		var zShadowImageEl = zjs(element).getData(shadowimagekey);
		
		// xem coi co dang aspect ratio khong day
		var aspectRatio = option.aspectRatio,
			originalRatio = parseFloat(zImageEl.getData(originalratiokey, 1));
		
		// neu nhu nhan giu shift thi se tinh ratio cua cai lan resize nay
		if(option.pressShiftToAspectRatio && event.shiftKey()){
			aspectRatio = true;
			originalRatio = zImageEl.width() / zImageEl.height();
		};
		
		// drag
		// -- 
		
		var newCornerLeft = cornerStyle.left + mouse.x,
			newCornerTop = cornerStyle.top + mouse.y,
			newShadowImageLeft = zShadowImageEl.left(),
			newShadowImageTop = zShadowImageEl.top(),
			newShadowImageWidth = zShadowImageEl.width(),
			newShadowImageHeight = zShadowImageEl.height(),
			newRatio = 1;
		
		// corner doi xung voi corner dang duoc move
		var zSymmetricCornerEl = false;
		
		// dua vao dang move corner nao de ma xu ly cho phu hop
		// duoi day la xu ly cho 4 corner o 4 goc
		if(cornerIndex == 1){
			symmetricCornerIndex = 8;
			zSymmetricCornerEl = zImageEl.getData(corner8key);
			if(newCornerLeft > zSymmetricCornerEl.left() - option.minWidth)
				newCornerLeft = zSymmetricCornerEl.left() - option.minWidth;
			if(newCornerTop > zSymmetricCornerEl.top() - option.minHeight)
				newCornerTop = zSymmetricCornerEl.top() - option.minHeight;
			newShadowImageLeft = newCornerLeft;
			newShadowImageTop = newCornerTop;
			newShadowImageWidth = zSymmetricCornerEl.left() - newCornerLeft;
			newShadowImageHeight = zSymmetricCornerEl.top() - newCornerTop;
			if(aspectRatio){
				newRatio = newShadowImageWidth / newShadowImageHeight;
				if(newRatio > originalRatio)
					newShadowImageHeight = newShadowImageWidth / originalRatio;
				else
					newShadowImageWidth = newShadowImageHeight * originalRatio;
				newCornerLeft = zSymmetricCornerEl.left() - newShadowImageWidth;
				newCornerTop = zSymmetricCornerEl.top() - newShadowImageHeight;
				newShadowImageLeft = newCornerLeft;
				newShadowImageTop = newCornerTop;
			}
		}else if(cornerIndex == 3){
			symmetricCornerIndex = 6;
			zSymmetricCornerEl = zImageEl.getData(corner6key);
			if(newCornerLeft < zSymmetricCornerEl.left() + option.minWidth)
				newCornerLeft = zSymmetricCornerEl.left() + option.minWidth;
			if(newCornerTop > zSymmetricCornerEl.top() - option.minHeight)
				newCornerTop = zSymmetricCornerEl.top() - option.minHeight;
			//newShadowImageLeft = 
			newShadowImageTop = newCornerTop;
			newShadowImageWidth = -zSymmetricCornerEl.left() + newCornerLeft;
			newShadowImageHeight = zSymmetricCornerEl.top() - newCornerTop;
			if(aspectRatio){
				newRatio = newShadowImageWidth / newShadowImageHeight;
				if(newRatio > originalRatio)
					newShadowImageHeight = newShadowImageWidth / originalRatio;
				else
					newShadowImageWidth = newShadowImageHeight * originalRatio;
				newCornerLeft = zSymmetricCornerEl.left() + newShadowImageWidth;
				newCornerTop = zSymmetricCornerEl.top() - newShadowImageHeight;
				//newShadowImageLeft = 
				newShadowImageTop = newCornerTop;
			}
		}else if(cornerIndex == 6){
			symmetricCornerIndex = 3;
			zSymmetricCornerEl = zImageEl.getData(corner3key);
			if(newCornerLeft > zSymmetricCornerEl.left() - option.minWidth)
				newCornerLeft = zSymmetricCornerEl.left() - option.minWidth;
			if(newCornerTop < zSymmetricCornerEl.top() + option.minHeight)
				newCornerTop = zSymmetricCornerEl.top() + option.minHeight;
			newShadowImageLeft = newCornerLeft;
			//newShadowImageTop = 
			newShadowImageWidth = zSymmetricCornerEl.left() - newCornerLeft;
			newShadowImageHeight = -zSymmetricCornerEl.top() + newCornerTop;
			if(aspectRatio){
				newRatio = newShadowImageWidth / newShadowImageHeight;
				if(newRatio > originalRatio)
					newShadowImageHeight = newShadowImageWidth / originalRatio;
				else
					newShadowImageWidth = newShadowImageHeight * originalRatio;
				newCornerLeft = zSymmetricCornerEl.left() - newShadowImageWidth;
				newCornerTop = zSymmetricCornerEl.top() + newShadowImageHeight;
				newShadowImageLeft = newCornerLeft;
				//newShadowImageTop = 
			}
		}else if(cornerIndex == 8){
			symmetricCornerIndex = 1;
			zSymmetricCornerEl = zImageEl.getData(corner1key);
			if(newCornerLeft < zSymmetricCornerEl.left() + option.minWidth)
				newCornerLeft = zSymmetricCornerEl.left() + option.minWidth;
			if(newCornerTop < zSymmetricCornerEl.top() + option.minHeight)
				newCornerTop = zSymmetricCornerEl.top() + option.minHeight;
			//newShadowImageLeft = 
			//newShadowImageTop = 
			newShadowImageWidth = -zSymmetricCornerEl.left() + newCornerLeft;
			newShadowImageHeight = -zSymmetricCornerEl.top() + newCornerTop;
			if(aspectRatio){
				newRatio = newShadowImageWidth / newShadowImageHeight;
				if(newRatio > originalRatio)
					newShadowImageHeight = newShadowImageWidth / originalRatio;
				else
					newShadowImageWidth = newShadowImageHeight * originalRatio;
				newCornerLeft = zSymmetricCornerEl.left() + newShadowImageWidth;
				newCornerTop = zSymmetricCornerEl.top() + newShadowImageHeight;
				//newShadowImageLeft = 
				//newShadowImageTop = 
			}
		}
		
		// duoi day la xu ly cho 4 corner nam o 4 canh
		else if(cornerIndex == 2){
			symmetricCornerIndex = 7;
			zSymmetricCornerEl = zImageEl.getData(corner7key);
			newCornerLeft = cornerStyle.left;
			if(newCornerTop > zSymmetricCornerEl.top() - option.minHeight)
				newCornerTop = zSymmetricCornerEl.top() - option.minHeight;
			//newShadowImageLeft = ;
			newShadowImageTop = newCornerTop;
			//newShadowImageWidth = 
			newShadowImageHeight = zSymmetricCornerEl.top() - newCornerTop;
			if(aspectRatio){
				newShadowImageWidth = newShadowImageHeight * originalRatio;
				if(newShadowImageWidth < option.minWidth){
					newShadowImageWidth = option.minWidth;
					newShadowImageHeight = newShadowImageWidth / originalRatio;
				}
				newShadowImageLeft = newCornerLeft - newShadowImageWidth/2;
				newShadowImageTop = newCornerTop = zSymmetricCornerEl.top() - newShadowImageHeight;
			}
		}else if(cornerIndex == 4){
			symmetricCornerIndex = 5;
			zSymmetricCornerEl = zImageEl.getData(corner5key);
			if(newCornerLeft > zSymmetricCornerEl.left() - option.minWidth)
				newCornerLeft = zSymmetricCornerEl.left() - option.minWidth;
			newCornerTop = cornerStyle.top;
			newShadowImageLeft = newCornerLeft;
			//newShadowImageTop = ;
			newShadowImageWidth = zSymmetricCornerEl.left() - newCornerLeft;
			//newShadowImageHeight = 
			if(aspectRatio){
				newShadowImageHeight = newShadowImageWidth / originalRatio;
				if(newShadowImageHeight < option.minHeight){
					newShadowImageHeight = option.minHeight;
					newShadowImageWidth = newShadowImageHeight * originalRatio;
				}
				newShadowImageLeft = newCornerLeft = zSymmetricCornerEl.left() - newShadowImageWidth;
				newShadowImageTop = newCornerTop - newShadowImageHeight/2;
			}
		}else if(cornerIndex == 5){
			symmetricCornerIndex = 4;
			zSymmetricCornerEl = zImageEl.getData(corner4key);
			if(newCornerLeft < zSymmetricCornerEl.left() + option.minWidth)
				newCornerLeft = zSymmetricCornerEl.left() + option.minWidth;
			newCornerTop = cornerStyle.top;
			//newShadowImageLeft = 
			//newShadowImageTop = ;
			newShadowImageWidth = -zSymmetricCornerEl.left() + newCornerLeft;
			//newShadowImageHeight = 
			if(aspectRatio){
				newShadowImageHeight = newShadowImageWidth / originalRatio;
				if(newShadowImageHeight < option.minHeight){
					newShadowImageHeight = option.minHeight;
					newShadowImageWidth = newShadowImageHeight * originalRatio;
				}
				newCornerLeft = zSymmetricCornerEl.left() + newShadowImageWidth;
				newShadowImageTop = newCornerTop - newShadowImageHeight/2;
			}
		}else if(cornerIndex == 7){
			symmetricCornerIndex = 2;
			zSymmetricCornerEl = zImageEl.getData(corner2key);
			newCornerLeft = cornerStyle.left;
			if(newCornerTop < zSymmetricCornerEl.top() + option.minHeight)
				newCornerTop = zSymmetricCornerEl.top() + option.minHeight;
			//newShadowImageLeft = ;
			//newShadowImageTop = ;
			//newShadowImageWidth = 
			newShadowImageHeight = -zSymmetricCornerEl.top() + newCornerTop;
			if(aspectRatio){
				newShadowImageWidth = newShadowImageHeight * originalRatio;
				if(newShadowImageWidth < option.minWidth){
					newShadowImageWidth = option.minWidth;
					newShadowImageHeight = newShadowImageWidth / originalRatio;
				}
				newShadowImageLeft = newCornerLeft - newShadowImageWidth/2;
				newCornerTop = zSymmetricCornerEl.top() + newShadowImageHeight;
			}
		};
		
		// move position & change dimension cua shadow image
		zShadowImageEl.left(newShadowImageLeft).top(newShadowImageTop).width(newShadowImageWidth).height(newShadowImageHeight);
		
		// move position cua corner hien tai
		zCornerEl.left(newCornerLeft).top(newCornerTop);
		
		// move position cua nhung cai corner con lai
		moveOtherCornerRelativeToShadowImage(element, cornerIndex, symmetricCornerIndex);
	},
	
	// ham giup cho viec handler drop corner
	handlerCornerDrop = function(element, cornerElement, mouse, cornerStyle){
		var zImageEl = zjs(element);
		
		// get ra cai corner dau tien 
		// neu nhu ma khong get ra duoc thi chung to day khong phai
		var zCorner1El = zImageEl.getData(corner1key, false);
		if(!zCorner1El)return;
		
		var zCornerEl = zjs(cornerElement),
			cornerIndex = parseInt(zCornerEl.getData(cornerindexkey));
		
		var option = zImageEl.getData(optionkey);
			
		// drop
		// -- 
		
		// bao la da xong qua trinh resize
		zImageEl.setData(resizeonprocesskey, false);
		
		removeClassCorner(element);
		
		// get ra shadow image de ma set lai dimension cho image that
		var zShadowImageEl = zjs(element).getData(shadowimagekey);
		
		var	shadowImageWidth = zShadowImageEl.width(),
			shadowImageHeight = zShadowImageEl.height(),
			shadowImageLeft = zShadowImageEl.left(),
			shadowImageTop = zShadowImageEl.top();
			
		// set dimension cho image that
		zImageEl.width(shadowImageWidth).height(shadowImageHeight);
		
		// neu nhu ma allow change position cua image that luon
		// thi gio se set position cho image that
		if(option.changePosition)
			zImageEl.left(shadowImageLeft).top(shadowImageTop);
		
		// sau do se di fix position 1 cai 
		fixCornerAndShadowPosition(element);
		
		// hide cai shadow image
		hideShadowImage(element);
		
		// cuoi cung la set timeout 1s de hide di may cai corner
		//zImageEl.setData(hidecornertimeoutkey, setTimeout(function(){
		//	hideCorner(element);
		//}, option.hideCornerTimeout));
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeImageResize: function(useroption){
			return this.each(function(element){makeImageResize(element, useroption)});
		},
		getResizedImagesInfo: function(){
			// lap 1 lan dau tien de tong hop lai cac thong tin
			var info = [];
			this.each(function(element){
				var zImageEl = zjs(element);
		
				// get ra cai corner dau tien 
				// neu nhu ma khong get ra duoc thi chung to day khong phai
				var zCorner1El = zImageEl.getData(corner1key, false);
				if(!zCorner1El)return;
				
				info.push({
					id: zImageEl.getAttr('id'),
					imageid: zImageEl.getAttr('data-imageid', 0).toInt(),
					src: zImageEl.getAttr('src', ''),
					zindex: zImageEl.getStyle('z-index', 0).toInt(),
					left: zImageEl.left(),
					top: zImageEl.top(),
					width: zImageEl.width(),
					height: zImageEl.height()
				});
			});
			return info.sort(function(a,b){
				if(!isFinite(a.zindex))return -1;
				if(!isFinite(b.zindex))return 1;
				return a.zindex-b.zindex;
			});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zimageresize ko, neu nhu co thi se auto makeImageResize luon
			zjs(el).find('img.zimageresize').makeImageResize();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zimageresize ko, neu nhu co thi se auto makeImageResize luon
			if(zjs(el).hasClass('zimageresize'))zjs(el).makeImageResize();
			zjs(el).find('img.zimageresize').makeImageResize();
		},
		before_removeDOM: function(el){
			var zEl = zjs(el);
			// remove het nhung cai element lien quan truoc
			if(zEl.getData(corner1key, false)){
			
				zEl.getData(corner1key).remove();
				zEl.getData(corner2key).remove();
				zEl.getData(corner3key).remove();
				zEl.getData(corner4key).remove();
				zEl.getData(corner5key).remove();
				zEl.getData(corner6key).remove();
				zEl.getData(corner7key).remove();
				zEl.getData(corner8key).remove();
				zEl.getData(shadowimagekey).remove();
				
				var option = zEl.getData(optionkey);
				if(!option.border)return;
				zEl.getData(borderTopKey).remove();
				zEl.getData(borderLeftKey).remove();
				zEl.getData(borderRightKey).remove();
				zEl.getData(borderBottomKey).remove();
			};
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('img.zimageresize').makeImageResize();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.resize');

});