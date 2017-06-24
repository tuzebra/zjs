// MODULE UI MENU
zjs.require('ui.freezepanel', function(){
	
	var optionkey = 'zmoduleuimenuoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiMenuOption: {
			freeze: false,

			// freezepanel module options
			autoHideWhenReach: false,
			autoHideSpeed: 2000,
			autoHideDelay: 0,
			useHeightBuffer: true,

			// option when open mobile menu
			disableWindowScroll: true,			// true | false | "mobileOnly"

			// mobile
			mobileMenuStyle: 'offcanvas',

			// offcanvas effect
			offcanvasMenuItemEffect: 'showdelay',
			offcanvasMenuItem: '.main-nav ul li > a',
		}
	});
	
	// template
	var zmenuclass = 'zui-menu',
		hamburgerButtonClass = 'zhamburger',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh';
	
	var zWindow = zjs(window);	
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeMenu = function(element, useroption){
		
		var zMenuEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zMenuEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zMenuEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiMenuOption);
		// extend from inline option ?
		var inlineoption = zMenuEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zMenuEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zMenuEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		zMenuEl.addClass(zmenuclass);
		
		// remove uninitialaze hide class
		zMenuEl.removeClass(uninitclass);

		// alway makt it freeze
		zMenuEl.makeFreezepanel(option);
		if(option.autoHideSpeed === 0){
			zMenuEl.addClass('autohide-speed-0');
		}

		// save trang thai on/off cua menu
		var isMobileMenuOpen = false;

		// find hamburger button
		var zHamburgerButton = zMenuEl.find('.'+hamburgerButtonClass);
		zHamburgerButton.on(clickTapEvent(), function(event){
			event.preventDefault();
			if(!isMobileMenuOpen){
				isMobileMenuOpen = true;
				zHamburgerButton.find('.icon-menu').removeClass('icon-menu').addClass('icon-close');
				zMenuEl.freezepanelAlwayShow(true);
				zMenuEl.freezepanelDisableChangeHeightBuffer(true);
				// apply effect?
				(function(){
					if(option.offcanvasMenuItemEffect == 'showdelay'){
						offcanvasMenuItemEffectShowdelay(zMenuEl, option, 'init');
					}
				}).delay(100);
				(function(){
					zMenuEl.addClass('active-'+option.mobileMenuStyle);
				}).delay(200);
				// apply effect?
				(function(){
					if(option.offcanvasMenuItemEffect == 'showdelay'){
						offcanvasMenuItemEffectShowdelay(zMenuEl, option, 'show');
					}
				}).delay(300);
			}
			else{
				isMobileMenuOpen = false;
				zHamburgerButton.find('.icon-close').removeClass('icon-close').addClass('icon-menu');
				// apply effect?
				if(option.offcanvasMenuItemEffect == 'showdelay'){
					offcanvasMenuItemEffectShowdelay(zMenuEl, option, 'hide');
				}
				zMenuEl.removeClass('active-'+option.mobileMenuStyle);
				(function(){
					zMenuEl.freezepanelAlwayShow(false);
					zMenuEl.freezepanelDisableChangeHeightBuffer(false);
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
	var offcanvasMenuItemEffectShowdelay = function(zMenuEl, option, command){
		// get list menu item
		var itemEls = zMenuEl.find(option.offcanvasMenuItem);

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
			
			if(option.disableWindowScroll && ('disableScroll' in zWindow)){
				if(option.disableWindowScroll === 'mobileOnly'){
					if(zjs.isMobileDevice())
						zWindow.disableScroll();
				}
				else{
					zWindow.disableScroll();
				}
			}
		}

		if(command == 'hide'){
			itemEls.setStyle('transition-delay', null).removeClass('offcanvas-item-show-delay effect-active');

			if(option.disableWindowScroll && ('enableScroll' in zWindow)){
				if(option.disableWindowScroll === 'mobileOnly'){
					if(zjs.isMobileDevice())
						zWindow.enableScroll();
				}
				else{
					zWindow.enableScroll();
				}
			}
		}
	};




	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeMenu: function(useroption){
			return this.eachElement(function(element){makeMenu(element, useroption)});
		},
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeMenu luon
			zjs(el).find('.zmenu').makeMenu();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zbutton ko, neu nhu co thi se auto makeMenu luon
			if(zjs(el).hasClass('zmenu'))zjs(el).makeMenu();
			zjs(el).find('.zmenu').makeMenu();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zmenu').makeMenu();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.menu');
});