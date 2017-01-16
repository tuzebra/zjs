// MODULE UI BUTTON
zjs.require('ui', function(){
	
	var optionkey = 'zmoduleuislideroption',
		wrapelkey = 'zmoduleuisliderwrapel';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiSliderOption: {
			min:0,
			max:1,
			step:0,
			referer:false,
			valueArray:false
		}
	});
	
	// trigger
	//ui.slider.change
	
	// template
	var sliderclass = 'zui-slider',
		slidertouchclass = 'zui-slider-touch',
		slidertraywrapclass = 'zui-slider-tray-wrapper',
		slidertrayclass = 'zui-slider-tray',
		sliderbuttonclass = 'zui-slider-button',
		sliderwraphtml = '<div class="'+sliderclass+'">'+
							'<div class="'+slidertraywrapclass+'">'+
								'<div class="'+slidertrayclass+'"></div>'+
							'</div>'+
							'<div class="'+sliderbuttonclass+'"></div>'+
						'</div>',
		
		// cai nay khong duoc sua doi, vi la defined trong ui.css
		zuihideclass = 'zui-uihide';
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeUiSlider = function(element, useroption){
		
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
		option = zjs.clone(zjs.moduleUiSliderOption);
		// extend from inline option ?
		var inlineoption = zSliderEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option 1 xiu
		// check coi no co truyen vo valueArray khong?
		// neu nhu co thi phai thay doi toan bo
		if(zjs.isArray(option.valueArray)){
			// makesure la array chay dung int
			var _tempArr = [];
			zjs.foreach(option.valueArray, function(value){
				value = parseFloat(value);
				if(zjs.isNumeric(value))
					_tempArr.push(value);
			});
			// sort lai cai array 1 phat
			_tempArr = _tempArr.sort(function(a,b){return a-b;});
			// set vao lai
			option.valueArray = _tempArr;
			if(option.valueArray.length <= 1)
				option.valueArray = false;
		};
		
		// fix option tiep
		if(zjs.isArray(option.valueArray)){
			//option min va max
			option.min = option.valueArray[0];
			option.max = option.valueArray[option.valueArray.length-1];
			option.step = 0;
		};
		
		// save option
		zSliderEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// module nay minh se thay doi cau truc html
		// khong lam giong nhu da lam voi module auto suggestion
		// tuc la se van giu nguyen element nguyen goc
		// chi tao ra, va add class cho mot element insert after
		var zSliderWrapEl = zjs(sliderwraphtml).insertAfter(zSliderEl);
		
		// check xem co id gi khong de set luon cho roi
		var sliderId = zSliderEl.getAttr('id', '');
		if(sliderId != '')
			zSliderWrapEl.setAttr('id', 'slider-for-'+sliderId);
		
		// sau do luu lai luon de sau nay truy xuat
		zSliderEl.setData(wrapelkey, zSliderWrapEl);
		
		// neu nhu la touch thi se thay css 1 chut
		if(zjs.isTouchDevice())
			zSliderWrapEl.addClass(slidertouchclass);
		
		// bind event de ngan khong cho select text trong cai slider nay
		zSliderWrapEl.on('selectstart', function(event){
			event.preventDefault();
			event.stop();
			return false;
		});
		
		// hide cai input slider di thoi
		// nhung tuyet doi khong bao gio choi display none
		// boi nhu vay thi se ra xay ra loi
		// trong nhung truong hop nhu:
		// <input> da duoc init thanh slider xong roi
		// cai lai di display none cai input nay
		// sau do form nay lai duoc move vao 1 cai popup
		// the la browser theo mac dinh se set lai value cho nhung thang ma
		// display none thanh la value="" => mat het!
		// nen luon luon dung zui-uihide class de hide di cac ui
		zSliderEl.addClass(zuihideclass);
		
		// get ra mot vai element va mot vai gia tri
		var zTrayWrapEl = zSliderWrapEl.find('.'+slidertraywrapclass),
			zTrayEl = zSliderWrapEl.find('.'+slidertrayclass).width(0),
			zSliderButtonEl = zSliderWrapEl.find('.'+sliderbuttonclass).left(0);
			
			
		
		// set style de tranh truong hop css chua load xong
		//zSliderWrapEl.width('100%');
		
		var sliderValue = 0;
		
		// ham move button toi vi tri nao do
		// sau do se tinh toan new value luon
		function moveButton(left){
			
			// luc move thi get ra gia tri width lai cho dung
			var zTrayWrapWidth = zTrayWrapEl.width(),
				zSliderButtonWidth = zSliderButtonEl.width();
		
			// luc move phai chac chan la button khong
			// vuot ra khoi pham vi cua tray
			if(left<0)left=0;
			if(left>zTrayWrapWidth-zSliderButtonWidth)left=zTrayWrapWidth-zSliderButtonWidth;
			// tinh toan ra new value
			sliderValue = left / (zTrayWrapWidth-zSliderButtonWidth) * (option.max - option.min) + option.min;
			// sau do se xem coi neu nhu co set option step
			// thi se di lam tron new value theo option step
			if(!isNaN(option.step) && option.step > 0){
				sliderValue = Math.round((sliderValue-option.min) / option.step) * option.step + option.min;
				if(sliderValue<option.min)sliderValue=option.min;
				if(sliderValue>option.max)sliderValue=option.max;
				// sau do se kiem tra de fix lai left di theo value
				left = (sliderValue - option.min) / (option.max - option.min) * (zTrayWrapWidth-zSliderButtonWidth);
			};
			// xem coi co option value array hay khong?
			// thi se di lam tron value theo cai array value nay
			if(zjs.isArray(option.valueArray)){
				// bay gio se so sanh voi cai value trong array
				var i,j;
				for(i=1;i<option.valueArray.length;i++){
					if(option.valueArray[i] >= sliderValue)
						break;
				};
				if(sliderValue - option.valueArray[i-1] < option.valueArray[i] - sliderValue){
					sliderValue = option.valueArray[i-1];
				}else{
					sliderValue = option.valueArray[i];
				};
				// sau do se kiem tra de fix lai left di theo value
				left = (sliderValue - option.min) / (option.max - option.min) * (zTrayWrapWidth-zSliderButtonWidth);
			};
			
			// bay gio moi move button that su
			zSliderButtonEl.left(left);
			// set width cho thang tray
			zTrayEl.width(left);
			
			// backup old value
			var sliderOldValue = zSliderEl.getValue();
			
			// set new value vao cho cai input nguyen goc luon
			// vi ham set value da duoc hook
			// cho nen phai kiem tra neu nhu dang enable hook cho zjs
			// thi phai disable hook di truoc khi thuc hien set value
			var hook = zjs.enablehook();
			zjs.enablehook(false);
			// thuc hien
			zSliderEl.setValue(sliderValue);
			// enable hook lai neu nhu truoc do co enable
			zjs.enablehook(hook);
			
			// sau do se run trigger neu nhu value da duoc thay doi
			// (tuc la new value va old value khac nhau)
			if(sliderOldValue != sliderValue)
			zSliderEl.trigger('ui:slider:change', {value:sliderValue, via:'movebutton'});
			// dong thoi update referer
			if(option.referer)zjs(option.referer).setInnerHTML(sliderValue);
		};
		
		// bind event cho cai slider-button drag
		zSliderButtonEl.drag({
			onStart: function(event, element){
				zjs(element).addClass('moving');
			},
			onDrag: function(event, element, mouse, style){
				moveButton(mouse.x+style.left);
			},
			onDrop: function(event, element, mouse, style){
				zjs(element).removeClass('moving');
			}
		});
		
		// resize window
		// and first setSliderValue
		zjs(window).on('resize', function(){
			setSliderValue(element, zSliderEl.getValue());
		}).trigger('resize');
	},
	
	// ham nay se move button theo value cua input
	setSliderValue = function(element, value){
		var zSliderEl = zjs(element);
		// kiem tra neu nhu khong phai slider thi thoi
		var option = zSliderEl.getData(optionkey);
		if(!option)return;
		
		var sliderValue = value,
			zSliderWrapEl = zSliderEl.getData(wrapelkey),
			zTrayWrapEl = zSliderWrapEl.find('.'+slidertraywrapclass),
			zTrayEl = zSliderWrapEl.find('.'+slidertrayclass),
			zSliderButtonEl = zSliderWrapEl.find('.'+sliderbuttonclass),
			zTrayWrapWidth = zTrayWrapEl.width(),
			zSliderButtonWidth = zSliderButtonEl.width();
		
		//xem coi neu nhu co set option step
		// thi se di lam tron new value theo option step
		if(!isNaN(option.step) && option.step > 0)
			sliderValue = Math.round((sliderValue-option.min) / option.step) * option.step + option.min;
		
		// xem coi co option value array hay khong?
		// thi se di lam tron value theo cai array value nay
		if(zjs.isArray(option.valueArray)){
			// bay gio se so sanh voi cai value trong array
			var i,j;
			for(i=1;i<option.valueArray.length;i++){
				if(option.valueArray[i] >= sliderValue)
					break;
			};
			if(sliderValue - option.valueArray[i-1] < option.valueArray[i] - sliderValue){
				sliderValue = option.valueArray[i-1];
			}else{
				sliderValue = option.valueArray[i];
			};
		};
			
		if(sliderValue<option.min)sliderValue=option.min;
		if(sliderValue>option.max)sliderValue=option.max;
		
		// sau do se kiem tra de fix lai left di theo value
		var left = (sliderValue - option.min) / (option.max - option.min) * (zTrayWrapWidth-zSliderButtonWidth);
		
		// bay gio moi move button 
		zSliderButtonEl.left(left);
		// set width cho thang tray
		zTrayEl.width(left);
		
		// backup old value
		var sliderOldValue = zSliderEl.getValue();
		
		// set new value vao cho cai input nguyen goc luon
		// vi ham set value da duoc hook
		// cho nen phai kiem tra neu nhu dang enable hook cho zjs
		// thi phai disable hook di truoc khi thuc hien set value
		var hook = zjs.enablehook();
		zjs.enablehook(false);
		// thuc hien
		zSliderEl.setValue(sliderValue);
		// enable hook lai neu nhu truoc do co enable
		zjs.enablehook(hook);
		
		// sau do se run trigger
		if(sliderOldValue != sliderValue)
		zSliderEl.trigger('ui:slider:change', {value:sliderValue, via:'setvalue'});
		// dong thoi update referer
		if(option.referer)zjs(option.referer).setInnerHTML(sliderValue);
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeUiSlider: function(useroption){
			return this.eachElement(function(element){makeUiSlider(element, useroption)});
		},
		getUiSliderElement: function(){
			return this.item(0).getData(wrapelkey);
		},
		sliderSetValue: function(value){
			return this.eachElement(function(element){setSliderValue(element, value)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zuislider ko, neu nhu co thi se auto makeUiSlider luon
			zjs(el).find('.zuislider').makeUiSlider();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zuislider ko, neu nhu co thi se auto makeUiSlider luon
			if(zjs(el).hasClass('zuislider'))zjs(el).makeUiSlider();
			zjs(el).find('.zuislider').makeUiSlider();
		},
		after_setValue: function(el){
			// sau khi set value cho thang input
			// thi se mo thang slider button cho chinh xac
			setSliderValue(el, zjs(el).getValue());
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zuislider').makeUiSlider();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.slider');
});