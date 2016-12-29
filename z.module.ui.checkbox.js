// MODULE UI CHECKBOX
zjs.require('ui', function(){
	
	var optionkey = 'zmoduleuicheckboxoption',
		wrapelkey = 'zmoduleuicheckboxwrapel',
		imageelkey = 'zmoduleuicheckboximageel',
		clickidkey = 'zmoduleuicheckboxclickid';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiCheckboxOption: {
			text: '',
			customlabel: '<span>',
			image:'',
			imagechecked:''
		}
	});
	
	// template
	var zcheckboxclass = 'zui-checkbox',
		checked = 'checked',
		
		checkedClass = 'checked',
		uncheckClass = 'uncheck',
		
		// uninitialaze hide class
		zcheckboxwrap = 'zui-checkbox-wrap',
		zcheckboxwrapvalue = 'zui-checkbox-value-',
		zcheckboxlabel = 'zui-checkbox-label',
		zcheckboximage = 'zui-checkbox-image',
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeCheckbox = function(element, useroption){
		
		var zCheckboxEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zCheckboxEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zCheckboxEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiCheckboxOption);
		// extend from inline option ?
		var inlineoption = zCheckboxEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zCheckboxEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		
		// hide di cai checkbox
		zCheckboxEl.addClass(zcheckboxclass);
		zCheckboxEl.addClass(uninitclass);
		
		var checkboxName = zCheckboxEl.getAttr('name', '');
		// khong co name thi khong lam tiep
		if(checkboxName == '')return;

		
		var zCheckboxWrapEl = zjs('<label>').addClass(zcheckboxwrap);
		zCheckboxWrapEl.insertBefore(zCheckboxEl);
		zCheckboxWrapEl.append(zCheckboxEl);
		
		// set cai value luon
		var _checkboxValue =  zCheckboxEl.getValue();
		if(_checkboxValue != '')
			zCheckboxWrapEl.addClass(zcheckboxwrapvalue+_checkboxValue);
		
		// save lai luon
		zCheckboxEl.setData(wrapelkey, zCheckboxWrapEl);
		
		
		// if checkbox has text
		if(option.text !=''){
			var zCheckboxLabelEl = zjs(option.customlabel);
			zCheckboxLabelEl.addClass(zcheckboxlabel);
			zCheckboxLabelEl.html(option.text);
			zCheckboxWrapEl.append(zCheckboxLabelEl);
		}
		
		// checkbox image
		var zCheckboxImageEl = zjs('<div>').addClass(zcheckboximage);
		zCheckboxWrapEl.prepend(zCheckboxImageEl);
		// save lai luon
		zCheckboxEl.setData(imageelkey, zCheckboxImageEl);
		
		
		//bind event click 
		zCheckboxWrapEl.on('click, tap', function(){
			
			// set 1 cai click id cho cai checkbox nay
			var clickId = zjs.getUniqueId();
			zCheckboxEl.setData(clickidkey, clickId);
			
			// checkbox name
			var checkboxName = zCheckboxEl.getAttr('name', '');
			
			// kiem tra coi cai thang checkbox nay 
			// hien tai la check hay la khong check
			if(zCheckboxEl.isChecked()){
			
				// thang nay se duoc checked
				checkboxCheck(zCheckboxEl, -1);
			}
			
			//
			else{
			
				// thang nay se duoc uncheck
				checkboxUncheck(zCheckboxEl, -1);
			};
			
		});
		
		// first handler check or uncheck
		if(zCheckboxEl.isChecked())
			checkboxCheck(zCheckboxEl, -1);
		else
			checkboxUncheck(zCheckboxEl, -1);
		
	};
	
	
	var checkboxUncheck = function(element, clickId){
		
		clickId = clickId || 0;
		
		var zCheckboxEl = zjs(element);
		
		// kiem tra coi co phai la zcheckbox hay khong
		var zCheckboxWrapEl = zCheckboxEl.getData(wrapelkey);
		if(!zCheckboxWrapEl)
			return false;
			
		// neu nhu co click id bi trung thi thoi
		if(parseInt(zCheckboxEl.getData(clickidkey)) == clickId)
			return false;
			
		// bay gio se add vao class uncheck
		zCheckboxWrapEl.removeClass(checkedClass).addClass(uncheckClass);
		
		// xem coi co option image khong
		// neu nhu co thi se set luon
		var zCheckboxImageEl = zCheckboxEl.getData(imageelkey),
			option = zCheckboxEl.getData(optionkey);
		
		if(option && option.imagechecked != '')
			zCheckboxImageEl.setStyle('background-image', 'none');
		if(option && option.image != '')
			zCheckboxImageEl.setStyle('background-image', 'url('+option.image+')');
	};
	
	var checkboxCheck = function(element, clickId){
		
		var zCheckboxEl = zjs(element);
		
		// kiem tra coi co phai la zcheckbox hay khong
		var zCheckboxWrapEl = zCheckboxEl.getData(wrapelkey);
		if(!zCheckboxWrapEl)
			return false;
			
		// neu nhu co click id bi trung thi thoi
		if(parseInt(zCheckboxEl.getData(clickidkey)) == clickId)
			return false;
			
		// bay gio se add vao class checked
		zCheckboxWrapEl.removeClass(uncheckClass).addClass(checkedClass);
		
		// xem coi co option image khong
		// neu nhu co thi se set luon
		var zCheckboxImageEl = zCheckboxEl.getData(imageelkey),
			option = zCheckboxEl.getData(optionkey);
		
		if(option && option.image != '')
			zCheckboxImageEl.setStyle('background-image', 'none');
		if(option && option.imagechecked != '')
			zCheckboxImageEl.setStyle('background-image', 'url('+option.imagechecked+')');
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeCheckbox: function(useroption){
			return this.each(function(element){makeCheckbox(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zcheckbox ko, neu nhu co thi se auto makeCheckbox luon
			zjs(el).find('.zcheckbox').makeCheckbox();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zcheckbox ko, neu nhu co thi se auto makeCheckbox luon
			if(zjs(el).hasClass('zcheckbox'))zjs(el).makeCheckbox();
			zjs(el).find('.zcheckbox').makeCheckbox();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zcheckbox').makeCheckbox();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.checkbox');
});
