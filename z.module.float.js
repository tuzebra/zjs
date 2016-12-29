// MODULE UI SIDENAV
zjs.require('ui', function(){
"use strict";
	
	// initialize class name: zfloat, zfloatitem
	
	
	
	var optionkey = 'zmodulefloatoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleFloatOption: {
			unitMinPx: 100,
			unitMaxPx: 200
		}
	});
	
	// trigger
	//ui.sidenav.load
	
	// template
	var floatcontainerclass = 'zfloat-parent';
	
	var zWindow = zjs(window),
		zBody = zjs(document.body);
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeFloatContainer = function(element, useroption){
		
		var zFloatContainerEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zFloatContainerEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zFloatContainerEl.setData(optionkey, zjs.extend(option, useroption));
			// dong thoi phai refresh lai cai thang container nay thoi haha
			refreshFloatContainer(element);
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleFloatOption);
		// extend from inline option ?
		var inlineoption = zFloatContainerEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option
		if(option.unitMinPx<=0)option.unitMinPx = 1;
		if(option.unitMaxPx<=0)option.unitMaxPx = 1;
		//.....
		
		// save option
		zFloatContainerEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// dau tien la add vao cai class cho vui cai da
		zFloatContainerEl.addClass(floatcontainerclass);
		
		// trigger event luon
		zWindow.on('resize', function(){
			refreshFloatContainer(element);
		}).trigger('resize');
	},
	
	refreshFloatContainer = function(element){
		
		var zFloatContainerEl = zjs(element);
				
		// check coi khong phai la float container thi thoi
		var option = zFloatContainerEl.getData(optionkey);
		if(!option)return;
		
		// okie, bat dau refresh
		// ===
		// di xac dinh coi dung duoc bao nhieu col la dep?
		var numberOfColMax = Math.floor(zFloatContainerEl.width()/option.unitMinPx), // max roi nen phai lam tron xuong
			numberOfColMin = Math.ceil(zFloatContainerEl.width()/option.unitMaxPx); // min nen phai lam tron len
		// bao nhieu col la dep?
		var numberOfCol = Math.round((numberOfColMax+numberOfColMin)/2);
		// di xac dinh coi 1 unit width la bao nhieu day ne
		var unitPx = zFloatContainerEl.width()/numberOfCol;
		// chuan bi di dem coi co bao nhieu row la vua
		var numberOfRow = 1;
		// ma tran de luu lai cac vi tri tuyet voi
		var filledMatrix = [];
		
		// di set width va xet vi tri thoi nao haha
		zFloatContainerEl.find('.zfloatitem').each(function(el, index){
			
			var floatItemEl = zjs(el),
				floatWidth = parseInt(floatItemEl.getAttr('data-float-width', 1)),
				floatHeight = parseInt(floatItemEl.getAttr('data-float-height', 1));
			
			// neu cai thang width nay ma con vuot qua ca cai thang cols thi phai fix thoi
			if(floatWidth > numberOfCol)floatWidth = numberOfCol;
			
			// tim coi cai thang nay sap vao cho nao thi duoc nha
			var x,y=0,x1,y1;
			var thoamanpos = false;
			do{
				for(x=0;x<numberOfCol;x++){
					if(!(x+':'+y in filledMatrix)){
						
						// nhung ma truoc khi chiem thi xem coi co thoa man vi tri khong nha
						var thoamansize = false;
						
						// neu vuot qua roi thi thoi, out luon
						// thi out de xuong hang luon
						if(x+floatWidth>numberOfCol)
							break;
							
						thoamansize = true;
						for(x1=x;x1<x+floatWidth;x1++){
							for(y1=y;y1<y+floatHeight;y1++){
								// neu chi can dinh 1 cai thi coi nhu khong thoa man
								if((x1+':'+y1) in filledMatrix){
									thoamansize = false;
									break;
								}
							}
							// vong trong ko thoa man thi vong ngoai cung khong
							if(!thoamansize)
								break;
						}
						// xem coi cuoi cung thi co thoa man hay khong? 
						// neu thoaman thi break ra luon, vi du du lieu roi
						if(thoamansize){
							thoamanpos = true;
							break;
						}
					}
				}
				// khi het 1 vong for thi xem coi thoa man hay chua?
				// break ra luon vong white
				if(thoamanpos)break;
				
				// chua thoa man thi phai tang row len
				y++;
				x=0;
				
			}while(true);
			
			// khi tim duoc vi tri thich hop roi thi phai fill lien
			for(x1=x;x1<x+floatWidth;x1++)
				for(y1=y;y1<y+floatHeight;y1++)
					filledMatrix[x1+':'+y1] = 1;
					
			// coi coi co phai la max row chua?
			if(y1>numberOfRow)numberOfRow=y1;
			
			// gio thi se place cai thang nay vao dung vi tri thoi
			floatItemEl.width(unitPx*floatWidth).height(unitPx*floatHeight).left(x*unitPx).top(y*unitPx);
		});
		
		// fix height cho thang container luon
		zFloatContainerEl.height(numberOfRow*unitPx);
		
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeFloatContainer: function(useroption){
			return this.each(function(element){makeFloatContainer(element, useroption)});
		},
		refreshFloatContainer: function(){
			return this.each(function(element){refreshFloatContainer(element)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zsmartfloat ko, neu nhu co thi se auto makeFloatContainer luon
			zjs(el).find('.zfloat').makeFloatContainer();
			// neu nhu cai thang nay la thang cha
			// thi se di tien hanh float cac thang con thoi
			if(zjs(el).hasClass('zfloat'))zjs(el).refreshFloatContainer();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zsmartfloat ko, neu nhu co thi se auto makeFloatContainer luon
			if(zjs(el).hasClass('zfloat'))zjs(el).makeFloatContainer();
			zjs(el).find('.zfloat').makeFloatContainer();
			// neu nhu cai thang nay la thang cha
			// thi se di tien hanh float cac thang con thoi
			//if(zjs(el).hasClass('zfloat'))zjs(el).refreshFloatContainer();
			//=> thuc ra la hanh dong makeFloatContainer da bao gom trong do refresh luon roi
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zfloat').makeFloatContainer();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('float');
});