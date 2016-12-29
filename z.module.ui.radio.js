// MODULE UI RADIO
zjs.require('ui', function(){
	
	var optionkey = 'zmoduleuiradiooption',
		wrapelkey = 'zmoduleuiradiowrapel',
		imageelkey = 'zmoduleuiradioimageel',
		clickidkey = 'zmoduleuiradioclickid';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiRadioOption: {
			text: '',
			customlabel: '<span>',
			image:'',
			imagechecked:''
		}
	});
	
	// template
	var zradioclass = 'zui-radio',
		checked = 'checked',
		
		checkedClass = 'checked',
		uncheckClass = 'uncheck',
		
		// uninitialaze hide class
		zradiowrap = 'zui-radio-wrap',
		zradiowrapvalue = 'zui-radio-value-',
		zradiolabel = 'zui-radio-label',
		zradioimage = 'zui-radio-image',
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeRadio = function(element, useroption){
		
		var zRadioEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zRadioEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zRadioEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiRadioOption);
		// extend from inline option ?
		var inlineoption = zRadioEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zRadioEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		
		// hide di cai radio
		zRadioEl.addClass(zradioclass);
		zRadioEl.addClass(uninitclass);
		
		var radioName = zRadioEl.getAttr('name', '');
		// khong co name thi khong lam tiep
		if(radioName == '')return;

		
		var zRadioWrapEl = zjs('<label>').addClass(zradiowrap);
		zRadioWrapEl.insertBefore(zRadioEl);
		zRadioWrapEl.append(zRadioEl);
		
		// set cai value luon
		var _radioValue =  zRadioEl.getValue();
		if(_radioValue != '')
			zRadioWrapEl.addClass(zradiowrapvalue+_radioValue);
		
		// save lai luon
		zRadioEl.setData(wrapelkey, zRadioWrapEl);
		
		
		// if radio has text
		if(option.text !=''){
			var zRadioLabelEl = zjs(option.customlabel);
			zRadioLabelEl.addClass(zradiolabel);
			zRadioLabelEl.html(option.text);
			zRadioWrapEl.append(zRadioLabelEl);
		}
		
		// radio image
		var zRadioImageEl = zjs('<div>').addClass(zradioimage);
		zRadioWrapEl.prepend(zRadioImageEl);
		// save lai luon
		zRadioEl.setData(imageelkey, zRadioImageEl);
		
		
		//bind event click 
		zRadioWrapEl.on('click, tap', function(){
			
			// set 1 cai click id cho cai radio nay
			var clickId = zjs.getUniqueId();
			zRadioEl.setData(clickidkey, clickId);
			
			// radio name
			var radioName = zRadioEl.getAttr('name', '');
			
			// kiem tra coi cai thang radio nay 
			// hien tai la check hay la khong check
			if(zRadioEl.isChecked()){
				
				// bao may thang khac phai uncheck di
				zjs('input[type=radio][name="'+radioName+'"]').each(function(el){
					radioUncheck(el, clickId);
				});
				
				// thang nay se duoc checked
				radioCheck(zRadioEl, -1);
			}
			
			//
			else{
				
				// bao may thang khac phai uncheck di
				zjs('input[type=radio][name="'+radioName+'"]').each(function(el){
					radioCheck(el, clickId);
				});
				
				// thang nay se duoc uncheck
				radioUncheck(zRadioEl, -1);
			};
			
		});
		
		// first handler check or uncheck
		if(zRadioEl.isChecked())
			radioCheck(zRadioEl, -1);
		else
			radioUncheck(zRadioEl, -1);
		
	};
	
	
	var radioUncheck = function(element, clickId){
		
		clickId = clickId || 0;
		
		var zRadioEl = zjs(element);
		
		// kiem tra coi co phai la zradio hay khong
		var zRadioWrapEl = zRadioEl.getData(wrapelkey);
		if(!zRadioWrapEl)
			return false;
			
		// neu nhu co click id bi trung thi thoi
		if(parseInt(zRadioEl.getData(clickidkey)) == clickId)
			return false;
			
		// bay gio se add vao class uncheck
		zRadioWrapEl.removeClass(checkedClass).addClass(uncheckClass);
		
		// xem coi co option image khong
		// neu nhu co thi se set luon
		var zRadioImageEl = zRadioEl.getData(imageelkey),
			option = zRadioEl.getData(optionkey);
		
		if(option && option.imagechecked != '')
			zRadioImageEl.setStyle('background-image', 'none');
		if(option && option.image != '')
			zRadioImageEl.setStyle('background-image', 'url('+option.image+')');
	};
	
	var radioCheck = function(element, clickId){
		
		var zRadioEl = zjs(element);
		
		// kiem tra coi co phai la zradio hay khong
		var zRadioWrapEl = zRadioEl.getData(wrapelkey);
		if(!zRadioWrapEl)
			return false;
			
		// neu nhu co click id bi trung thi thoi
		if(parseInt(zRadioEl.getData(clickidkey)) == clickId)
			return false;
			
		// bay gio se add vao class checked
		zRadioWrapEl.removeClass(uncheckClass).addClass(checkedClass);
		
		// xem coi co option image khong
		// neu nhu co thi se set luon
		var zRadioImageEl = zRadioEl.getData(imageelkey),
			option = zRadioEl.getData(optionkey);
		
		if(option && option.image != '')
			zRadioImageEl.setStyle('background-image', 'none');
		if(option && option.imagechecked != '')
			zRadioImageEl.setStyle('background-image', 'url('+option.imagechecked+')');
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeRadio: function(useroption){
			return this.each(function(element){makeRadio(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zradio ko, neu nhu co thi se auto makeRadio luon
			zjs(el).find('.zradio').makeRadio();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zradio ko, neu nhu co thi se auto makeRadio luon
			if(zjs(el).hasClass('zradio'))zjs(el).makeRadio();
			zjs(el).find('.zradio').makeRadio();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zradio').makeRadio();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.radio');
});
