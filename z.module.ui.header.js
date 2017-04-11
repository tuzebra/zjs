// MODULE UI HEADER
zjs.require('ui.freezepanel', function(){
	
	var optionkey = 'zmoduleuiheaderoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiHeaderOption: {
			freeze: 1,

			// freezepanel module options
			autoHideWhenReach: false,
			autoHideSpeed: 2000,
			autoHideDelay: 0,
			useHeightBuffer: true,

			// mobile
			mobileMenuStyle: 'offcanvas',

			// offcanvas effect
			offcanvasMenuItemEffect: 'showdelay',
			offcanvasMenuItem: '.main-nav ul li > a',
		}
	});
	
	// template
	var zheaderclass = 'zui-header',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeHeader = function(element, useroption){
		
		var zHeaderEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zHeaderEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zHeaderEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiHeaderOption);
		// extend from inline option ?
		var inlineoption = zHeaderEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zHeaderEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zHeaderEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		zHeaderEl.addClass(zheaderclass);
		
		// remove uninitialaze hide class
		zHeaderEl.removeClass(uninitclass);

		// alway makt it freeze
		zHeaderEl.makeFreezepanel(option);
		if(option.autoHideSpeed === 0){
			zHeaderEl.addClass('autohide-speed-0');
		}

		// save trang thai on/off cua menu
		var isMobileMenuOpen = false;

		// find hamburger button
		var zHamburgerButton = zHeaderEl.find('.zhamburger');
		zHamburgerButton.on(clickTapEvent(), function(event){
			event.preventDefault();
			if(!isMobileMenuOpen){
				isMobileMenuOpen = true;
				zHamburgerButton.find('.icon-menu').removeClass('icon-menu').addClass('icon-close');
				zHeaderEl.freezepanelAlwayShow(true);
				zHeaderEl.freezepanelDisableChangeHeightBuffer(true);
				// apply effect?
				(function(){
					if(option.offcanvasMenuItemEffect == 'showdelay'){
						offcanvasMenuItemEffectShowdelay(zHeaderEl, option, 'init');
					}
				}).delay(100);
				(function(){
					zHeaderEl.addClass('active-'+option.mobileMenuStyle);
				}).delay(200);
				// apply effect?
				(function(){
					if(option.offcanvasMenuItemEffect == 'showdelay'){
						offcanvasMenuItemEffectShowdelay(zHeaderEl, option, 'show');
					}
				}).delay(300);
			}
			else{
				isMobileMenuOpen = false;
				zHamburgerButton.find('.icon-close').removeClass('icon-close').addClass('icon-menu');
				// apply effect?
				if(option.offcanvasMenuItemEffect == 'showdelay'){
					offcanvasMenuItemEffectShowdelay(zHeaderEl, option, 'hide');
				}
				zHeaderEl.removeClass('active-'+option.mobileMenuStyle);
				(function(){
					zHeaderEl.freezepanelAlwayShow(false);
					zHeaderEl.freezepanelDisableChangeHeightBuffer(false);
				}).delay(100);
			}
		});

	};

	//function that help to find the event name
	var clickTapEvent = function(){
		return zjs.isMobileDevice() ? 'touchstart' : 'click';
		// return zjs.isMobileDevice() ? 'tap' : 'click';
	};


	//////////// EFFECTS //////////////
	
	// Offcanvas Effect
	var offcanvasMenuItemEffectShowdelay = function(zHeaderEl, option, command){
		// get list menu item
		var itemEls = zHeaderEl.find(option.offcanvasMenuItem);

		if(command == 'init'){
			var step = 50;
			itemEls.eachElement(function(el, index){
				// console.log(el);
				zjs(el).addClass('offcanvas-item-show-delay');
				(function(){
					zjs(el).setStyle('transition-delay', (step*index)+'ms');
				}).delay(50);
			});
		}

		if(command == 'show'){
			itemEls.addClass('effect-active');
		}

		if(command == 'hide'){
			itemEls.setStyle('transition-delay', null).removeClass('offcanvas-item-show-delay effect-active');
		}
	};




	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeHeader: function(useroption){
			return this.eachElement(function(element){makeHeader(element, useroption)});
		},
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeHeader luon
			zjs(el).find('.zheader').makeHeader();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeHeader luon
			if(zjs(el).hasClass('zheader'))zjs(el).makeHeader();
			zjs(el).find('.zheader').makeHeader();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zheader').makeHeader();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.header');
});