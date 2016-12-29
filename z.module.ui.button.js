// MODULE UI BUTTON
zjs.require('ui', function(){
	
	var optionkey = 'zmoduleuibuttonoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiButtonOption: {
			
		}
	});
	
	// template
	var zbuttonclass = 'zui-button',
		zbuttonlabelclass = 'zui-button-label',
		zgroupclass = 'zui-group-button',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeButton = function(element, useroption){
		
		var zButtonEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zButtonEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zButtonEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiButtonOption);
		// extend from inline option ?
		var inlineoption = zButtonEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zButtonEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		zButtonEl.addClass(zbuttonclass);
		var zButtonLabelEl = zjs('<span>').addClass(zbuttonlabelclass);
		
		// copy het noi dung qua label
		zButtonEl.child().each(function(el){zButtonLabelEl.append(el)});
		zButtonEl.append(zButtonLabelEl);
		
		// bind event for prevent default action while button disable
		zButtonEl.click(function(event, el){if(zjs(el).hasClass('disabled'))event.preventDefault()});
		
		// remove uninitialaze hide class
		zButtonEl.removeClass(uninitclass);
	},
	
	// remove tat ca khoang trang giua cac button trong group
	makeGroupButton = function(element){
		zjs(element).addClass(zgroupclass).child().each(function(el){
			if(el.nodeType==3)zjs(el).remove();
		});
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeButton: function(useroption){
			return this.each(function(element){makeButton(element, useroption)});
		},
		makeGroupButton: function(useroption){
			return this.each(function(element){makeGroupButton(element)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeButton luon
			zjs(el).find('.zbutton').makeButton();
			zjs(el).find('.zgroupbutton').makeGroupButton();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeButton luon
			if(zjs(el).hasClass('zbutton'))zjs(el).makeButton();
			zjs(el).find('.zbutton').makeButton();
			if(zjs(el).hasClass('zgroupbutton'))zjs(el).makeGroupButton();
			zjs(el).find('.zgroupbutton').makeGroupButton();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zbutton').makeButton();
		zjs('.zgroupbutton').makeGroupButton();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.button');
});