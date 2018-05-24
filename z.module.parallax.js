// MODULE UI PARALLAX
zjs.require('ui, transition', function(){
	
	var optionkey = 'zmoduleparallaxoption',
		scrollbaroptionkey = 'zmodulescrollbaroption',
		parallaxautokeyframe = 'zmoduleparallaxautokeyframe',
		listsectionnamekey = 'zmoduleparallaxlistsectionname',
		// --
		parallaxcurrentscrollkey = 'zmoduleparallaxcurrentscroll',
		parallaxcurrentsectionkey = 'zmoduleparallaxcurrentsection',
		parallaxlastfullscreensectionkey = 'zmoduleparallaxlastfullscreensection',
		parallaxfocussectionkey = 'zmoduleparallaxfocussection',
		// --
		sectionautoscalekey = 'zmoduleparallaxautoscale';
	
	var scrollTimer = false,
		scrollByTimer = false;
	
	// extend core mot so option
	zjs.extendCore({
		moduleParallaxOption: {
			
			// common
			property: 'margin',
			horizontal: false,
			sectionclass: 'zparallax-section',
			elementclass: 'zparallax-element',
			keyframes: false,
			
			// layout
			indicator: false,
			indicatorTemplate: '<a class="indicator">.</a>',
			autoscaleusecss: false,
			
			// scroll
			scrolltime: 800, // thoi` gian thuc. hien. hieu. ung' scroll-smooth (su dung neu nhu khong dung module scrollbar)
			transition: 2, 
			
			// event
			timewaittofocus: 200,
			
			// --
			debug: false
		}
	});
	
	// trigger
	//parallax.risingsection
	//parallax.changesection
	//parallax.changefullscreensection
	//parallax.changefocussection
	//parallax.scroll (for elementclass)
	
	
	
	// attribute
	// .zparallax-section[data-autoscale] 			boolean: true
	// .zparallax-element[data-ratio-vertical] 		number: 0
	// .zparallax-element[data-ratio-horizontal] 	number: 0
	// .zparallax-element[data-keyframes] 			json: {}
	
	
	// template
	var zparallaxclass = 'zparallax',
		zparallaxverticalclass = 'zparallax-vertical',
		zparallaxhorizontalclass = 'zparallax-horizontal',
		zparallaxscaleclass = 'zparallax-autoscale',
		
		
		_indicatorWrapHtml = '<div class="zparallax-indicator-wrapper">'+
								'<div class="zparallax-indicator-container">'+
								'</div>'+
							'</div>';
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	// make (init) parallax wrapper container
	var makeParallax = function(element, useroption){
		
		var zParallaxEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zParallaxEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zParallaxEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleParallaxOption);
		// extend from inline option ?
		var inlineoption = zParallaxEl.getData('inlineoption', '');
		if(inlineoption == '')inlineoption = zParallaxEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!=''){
			option = zjs.extend(option, inlineoption.jsonDecode());
			zParallaxEl.setData('inlineoption', inlineoption);
		};
		// sau do remove di luon inline option luon, cho html ra dep
		zParallaxEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zParallaxEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		zParallaxEl.addClass(zparallaxclass);
		zParallaxEl.addClass(option.horizontal ? zparallaxhorizontalclass : zparallaxverticalclass);
		
		if(option.autoscaleusecss)
			zParallaxEl.addClass(zparallaxscaleclass);
		
		// xem coi co auto make 1 cai indicator hay khong
		var zIndicatorContainerEl = false;
		if(option.indicator){
			zParallaxEl.append(_indicatorWrapHtml);
			zIndicatorContainerEl = zParallaxEl.find('.zparallax-indicator-container');
		};
		
		
		// get ra toan bo session
		var listSectionNames = [];
		zSectionEls = zParallaxEl.find('.'+option.sectionclass);
		zSectionEls.eachElement(function(el, index){			
			
			var _zSectionEl = zjs(el);
			
			// chinh cho section dung vi tri neu nhu su dung css de scale	
			if(option.autoscaleusecss)
				_zSectionEl.top(index*100+'%');
			
			// save attribute
			_zSectionEl.setData(sectionautoscalekey, _zSectionEl.getAttr('data-autoscale'));
			_zSectionEl.removeAttr('data-autoscale');
			
			// xem coi section nay co ten hay khog
			// neu nhu khong co ten thi se auto dat ten cho no luon
			var sectionName = _zSectionEl.getAttr('data-name', '');
			if(sectionName == ''){
				sectionName = 'section'+(index+1);
				_zSectionEl.setAttr('data-name', sectionName);
			};
			
			listSectionNames.push(sectionName);
			
			// --
			
			// tao ra 1 cai indicator tuong ung voi section
			if(option.indicator){
				var _indicatorHtml = option.indicatorTemplate;if(zjs.isFunction(_indicatorHtml))_indicatorHtml = _indicatorHtml(index, sectionName);
				_indicatorHtml = _indicatorHtml.format({index:index, name:sectionName});
				var _zIndicatorEl = zjs(_indicatorHtml)
					.addClass('zparallax-indicator')
					.setAttr('data-name', sectionName)
					.appendTo(zIndicatorContainerEl)
					.click(function(e, el){
						var _name = zjs(el).getAttr('data-name', '');
						parallaxScrollToSection(element, _name);
					});
			};
		});
		// save cai list section name luon
		zParallaxEl.setData(listsectionnamekey, listSectionNames);
		
		
		
		// get ra custom navigation
		var zCustomNavigationEls = zParallaxEl.find('.zparallax-navigation[data-name]').click(function(){
			var _name = this.getAttr('data-name');
			parallaxScrollToSection(element, _name);
		});
		
		
		
		// get ra toan bo element
		zElementEls = zParallaxEl.find('.'+option.elementclass);
		
		var windowWidth = 0,
			windowHeight = 0,
			currentScroll = 0,
			currentSection = '',
			focusSection = '',
			lastFullScreenSection = '';
			
		// save lai original property value
		zElementEls.eachElement(function(el){
			
			var zEl = zjs(el);
			
			
			// original Property
			// --
			var	originalPropertyTop = 0,
				originalPropertyLeft = 0;
				
			if(option.property == 'margin'){
				originalPropertyTop = zEl.getStyle('margin-top', 0);
				originalPropertyLeft = zEl.getStyle('margin-left', 0);
			};

			zEl.setData('originalPropertyTop', originalPropertyTop)
				.setData('originalPropertyLeft', originalPropertyLeft);
			
			
			// ratio
			// --
			var ratioVertical = zEl.getAttr('data-ratio-vertical', 0).toFloat(),
				ratioHorizontal = zEl.getAttr('data-ratio-horizontal', 0).toFloat();
			zEl.setData('ratioVertical', ratioVertical)
				.setData('ratioHorizontal', ratioHorizontal)
				.removeAttr('data-ratio-vertical')
				.removeAttr('data-ratio-horizontal');
			
			
			// keyframes
			// --
			
			var inlineAnimation = zEl.getAttr('data-keyframes', ''),
				rawAnimation = false;
			if(zjs.isString(inlineAnimation) && inlineAnimation.trim()!='')
				rawAnimation = inlineAnimation.jsonDecode();
			zEl.removeAttr('data-keyframes');
			
			// set key frame ngay va luon
			if(zjs.isObject(rawAnimation) && 'setKeyframes' in zEl)
				zEl.setKeyframes(parallaxautokeyframe, rawAnimation);
			
			// keyframes trong truong hop dung 1 object global ben ngoai
			// --
			
			var keyframesName = zEl.getAttr('data-keyframes-name', '');
			if(keyframesName != '' && zjs.isObject(option.keyframes) && keyframesName in option.keyframes)
				zEl.setKeyframes(parallaxautokeyframe, option.keyframes[keyframesName]);
		});
		
		// luu lai scrollbarOption neu nhu su dung scroll du
		var scrollbarOption = false;
		
		var updateNavigation = function(_sectionName){
			zCustomNavigationEls.removeClass('active');
			zCustomNavigationEls.filter('[data-name="'+_sectionName+'"]').addClass('active');
		};

		// ham xu ly khi ma scroll
		var onscroll = function(){
			
			// neu nhu dang scroll timer thi stop cai da
			if(!scrollByTimer && scrollTimer)scrollTimer.stop({force: true});
			
			scrollByTimer = false;
			
			// update
			if(!scrollbarOption)
				currentScroll = option.horizontal ? zParallaxEl.scrollLeft() : zParallaxEl.scrollTop();
			// neu nhu day la zscrollbar thi phai xu ly khac
			if((!scrollbarOption && (scrollbarOption = zParallaxEl.getData(scrollbaroptionkey))) || scrollbarOption)
				currentScroll = zParallaxEl.scrollPosition();
			// save vao luon
			zParallaxEl.setData(parallaxcurrentscrollkey, currentScroll);
			
			// move element
			zElementEls.eachElement(function(el){
				
				var zEl = zjs(el);
				
				
				// auto move by ratio
				// --
				var	originalPropertyTop = zEl.getData('originalPropertyTop').toFloat(),
					originalPropertyLeft = zEl.getData('originalPropertyLeft').toFloat(),
					
					ratioVertical = zEl.getData('ratioVertical'),
					ratioHorizontal = zEl.getData('ratioHorizontal');
				
				// xem coi cai element nay co nam trong 1 cai section nao khong
				var zSectionEl = zEl.findUp('.'+option.sectionclass),
					gapStartAt = zSectionEl.count() ? parseFloat(zSectionEl.getAttr('data-gap-start-at', 0), 10) : 0;
				
				// get ra cai balance moi quan trong ne
				var balance = 0;
				if(zSectionEl.count()){

					// neu nhu khong su dung scroll du
					// thi chi can get ra absolute top hoac left thoi
					//if(!scrollbarOption || (scrollbarOption && scrollbarOption.usecss))
					//	balance = option.horizontal ? zSectionEl.getAbsoluteLeft() : zSectionEl.getAbsoluteTop();
					//else
					
					// ua nhung cuoi cung thay chi can nhu vay la du
					balance = option.horizontal ? zSectionEl.left() : zSectionEl.top();
				};
				
				
				// tinh ra do chenh lech 
				var gapVertical = (currentScroll - balance - gapStartAt) * ratioVertical,
					gapHorizontal = (currentScroll - balance - gapStartAt) * ratioHorizontal;
				
				// so sanh su can bang de tinh toan ra vi tri chenh lech
				var newPropertyTop = originalPropertyTop - gapVertical,
					newPropertyLeft = originalPropertyLeft - gapHorizontal;

				if(option.property == 'margin'){
					if(ratioVertical)zEl.setStyle('margin-top', newPropertyTop);
					if(ratioHorizontal)zEl.setStyle('margin-left', newPropertyLeft);
				};
				
				
				// move by keyframes
				// --
				if(zEl.isExistsKeyframes(parallaxautokeyframe)){
					var keyframeStartAt = zSectionEl.count() ? parseFloat(zSectionEl.getAttr('data-keyframe-start-at', 0), 10) : 0;
					zEl.setStyleByKeyframes(parallaxautokeyframe, currentScroll - keyframeStartAt);
				};
				
				
				// trigger event for elementclass
				zEl.trigger('parallax.scroll', {currentScroll:currentScroll, gapVertical:gapVertical, gapHorizontal:gapHorizontal});

			});
			
			
			// update current active section
			// update current 
			// --
			var _currentSectionName = parallaxGetCurrentSection(element);
			// xem coi cai current section co thay doi hay khong
			currentSection = zParallaxEl.getData(parallaxcurrentsectionkey, '');
			
			if(_currentSectionName != currentSection){
				
				// update indicator
				if(option.indicator){
					zIndicatorContainerEl.find('.zparallax-indicator.active').removeClass('active');
					zIndicatorContainerEl.find('.zparallax-indicator[data-name="'+_currentSectionName+'"]').addClass('active');
				};
				
				// update custom navigation
				if(!zjs.isMobileDevice()){
					updateNavigation(_currentSectionName);
				}
				
				// save  lai
				zParallaxEl.setData(parallaxcurrentsectionkey, _currentSectionName);
				
				// trigger event
				zParallaxEl.trigger('parallax.changesection', {currentSection:_currentSectionName, prevSection:currentSection});
			};
			
			
			// update focus section
			// --
			focusSection = zParallaxEl.getData(parallaxfocussectionkey);
			
			// focus section la "current section"
			// nhung ma co ratio visible phai gan bang 1
			if(_currentSectionName != focusSection && parallaxGetRatioVisible(element, _currentSectionName)> 0.9){
			
				
			
				// delay 1 khoang thoi gian, sau do check lai, neu nhu van con 
				// dang trong cai lastFullScreenSection nay
				// thi se trigger them 1 event thong bao la user dang focus vao cai section nay
				// tai vi se co truong hop truot rat nhanh xuong section 3
				// thi trong qua trinh do phai truot vao section 2
				// nhung ma lai khong muon section 2 xay ra cac su kien gi do
				// boi vi muc dich chinh la section 3 chu ko phai section 2
				// -> nen can phai co 1 khoang thoi gian delay
				// de check xem coi co dung cai section nay la section 3 hay 2
				(function(){
					
					// neu nhu van con
					// va van con ty le cao thi moi coi nhu la da focus
					if(zParallaxEl.getData(parallaxcurrentsectionkey) == _currentSectionName &&
						zParallaxEl.getData(parallaxfocussectionkey) != _currentSectionName
					){
						
						// save lai
						zParallaxEl.setData(parallaxfocussectionkey, _currentSectionName);
						
						zParallaxEl.trigger('parallax.changefocussection', {focusSection:_currentSectionName});
					};
					
				// delay 200ms la 1 con so hop ly, khong qua nhanh cung khong qua lau
				}).delay(option.timewaittofocus);
			
			};
			
			
			
			// update rising percent section
			// --
			var _lastFullScreenSection = parallaxGetLastFullScreenSection(element);
			// xem coi cai thang last fullscreen section nay co thay doi hay khong
			lastFullScreenSection = zParallaxEl.getData(parallaxlastfullscreensectionkey, '');
			
			var _zLastFullScreenSectionEl = zParallaxEl.find('.'+option.sectionclass+'[data-name="'+_lastFullScreenSection+'"]').item(0);			
			
			
			if(_lastFullScreenSection != lastFullScreenSection){
				
				// save lai
				zParallaxEl.setData(parallaxlastfullscreensectionkey, _lastFullScreenSection);
				
				// khi vua moi change qua cai section khac
				// thi cai rising cu se bi nhay qua cai moi
				// luc nay cai rising cu chi moi tang toi 0.99 thoi
				// nen phai trigger no 1 phat de no len 1
				zParallaxEl.trigger('parallax.risingsection', {
					prevSection:listSectionNames[listSectionNames.indexOf(_lastFullScreenSection)-1],
					nextSection:_lastFullScreenSection,
					percent:1
				});
				
				// trigger event change fullscreen section
				zParallaxEl.trigger('parallax.changefullscreensection', {lastFullScreenSection:_lastFullScreenSection, prevFullScreenSection:lastFullScreenSection});
				
			};
				
			
			// tinh toan de trigger even risingsection
			// neu nhu cai section nay la section cuoi cung trong so cac section 
			// thi se khong co chuyen cai section nay rising sang section khac
			// trong truong hop nay thang percent khong the bang 1 duoc
			// boi vi thang section nay moi vua chua qua het, la da co thang khac nhay vao roi =.=
			var _lastFullScreenSectionIndex = listSectionNames.indexOf(_lastFullScreenSection);
			if(_lastFullScreenSectionIndex < listSectionNames.length - 1){
				zParallaxEl.trigger('parallax.risingsection', {
					prevSection:_lastFullScreenSection, 
					nextSection:listSectionNames[_lastFullScreenSectionIndex+1],
					percent:(currentScroll - _zLastFullScreenSectionEl.top())/_zLastFullScreenSectionEl.height()
				});
			};
			
		};
		
		// ham xu ly khi ma resize
		var onresize = function(){
			
			// update
			windowWidth = zjs(window).width();
			windowHeight = zjs(window).height();
			
			var totalWidth = 0;
			
			// resize autoscale section
			zSectionEls.eachElement(function(el){
				
				var _zSectionEl = zjs(el),
					autoscale = _zSectionEl.getData(sectionautoscalekey);
				
				// mac dinh la se luon autoscale
				if(!option.autoscaleusecss && autoscale != '0' && autoscale != 0 && autoscale != 'false')
					_zSectionEl.width(windowWidth).height(windowHeight);
				
				totalWidth+= _zSectionEl.width();
			});
			
			// neu nhu la horizontal thi phai set width de ma may thang section con nam ngang ra duoc nua
			if(option.horizontal){
				zParallaxEl.width(totalWidth);
				if(zParallaxEl.getData(scrollbaroptionkey))
					zParallaxEl.refreshScroll();
			};
			
			// xem coi day co phai la scroll du khong
			// neu la scroll du thi phai refresh scroll luon
			//zParallaxEl.refreshScroll()
			
			// fix scroll
			onscroll();
			// update navigation
			updateNavigation(currentSection);
		};
		
		// first resize
		onresize();
		
		// bind event for scroll & resize
		zParallaxEl.on('scrollbar.scroll', onscroll);
		zjs(window).on('scroll', onscroll);
		zjs(window).on('resize', onresize);
		
		// refresh scroll de fix may cai snap
		if(scrollbarOption){
			zParallaxEl.refreshScroll();
		};
		
		// bind event vao may cai sections luon
		// muc dich la de nhieu khi can stop cai event lan chuot
		// khong cho event truyen xuong duoi thang body
		// (thang body scroll du se khong lan duoc nua)
		//zSectionEls.on('mousewheel', function(event){
		//	if(option.debug){
			//	event.preventDefault();
			//	event.stopPropagation();
			//	console.log('adsad');
		//	}
		//});
		
		// vua vo thi se check hash
		// de ma scroll vao dung cai sesstion luon
		// (cai nay thi scroll du da support, nhung ma la support voi kieu achor id="aaa")
		// parallax se support them
		if(document.location.hash != ''){
			// delay 1 xiu, cho thang cho module scrollbar load cai da
			(function(){
				parallaxScrollToSection(element, document.location.hash.replace('#', ''));
			}).delay(1000);
		}

		// add a internal trigger to update navigation
		zParallaxEl.on('parallax:scroll:stop', function(){
			updateNavigation(this.parallaxGetCurrentSection());
		});
	};
	
	// function scroll to section
	var parallaxScrollToSection = function(element, sectionName){
		// fix param
		sectionName = sectionName || '';
		
		var zParallaxEl = zjs(element);
				
		// - - - 
		// dau tien phai check xem coi co phai day la 1 parallax container khong da
		// neu nhu khong co option thi chung to la khong phai
		var option = zParallaxEl.getData(optionkey);
		if(!option)return false;
		
		// bay gio moi tiep tuc tim ra cai thang section, dua vao section name
		var zSectionEl = zParallaxEl.find('.'+option.sectionclass+'[data-name="'+sectionName+'"]').item(0);
		// neu nhu khong co thi thoi
		if(zSectionEl.count() < 1)return false;
		
		// tinh toan ra toa do cua cai section nay
		var sectionTop = zSectionEl.top();
		
		// kiem tra xem coi day co dong thoi la module scrollbar hay khong
		// neu co thi su dung luon cho nhanh
		if(zParallaxEl.getData(scrollbaroptionkey)){
			zParallaxEl.scrollTo(sectionTop);
			return true;
		};
		
		// neu nhu khong co module scrollbar 
		// thi phai scroll kieu mac dinh
		// nhung phai xem coi co smooth khong
		if(option.scrolltime > 0){
			if(scrollTimer)scrollTimer.stop({force: true});
			else scrollTimer = zjs.timer({
				onProcess: function(current){
					scrollByTimer = true;
					window.scrollTo(option.horizontal ? current : 0, option.horizontal ? 0 : current);
				},
				onStop: function(){
					zParallaxEl.trigger('parallax:scroll:stop');
				}
			});
			scrollTimer.set({
				from: option.horizontal ? zjs(window).scrollLeft() : zjs(window).scrollTop(),
				to: sectionTop,
				time: option.scrolltime,
				transition: option.transition
			}).run();
			return true;
		};
		
		// neu khong thi scroll binh thuong
		window.scrollTo(option.horizontal ? sectionTop : 0, option.horizontal ? 0 : sectionTop);
	};
	
	var parallaxScrollToNextSection = function(element){
		
		var zParallaxEl = zjs(element);
		
		// - - - 
		var listSectionNames = zParallaxEl.getData(listsectionnamekey, false);
		if(!listSectionNames && !zjs.isArray(listSectionNames))return false;
		
		var currentSection = parallaxGetCurrentSection(element);
		if(!currentSection)return false;
		
		var nextSection = listSectionNames[listSectionNames.indexOf(currentSection)+1];
		if(!nextSection)return false;
		
		parallaxScrollToSection(element, nextSection);
	};
	
	// function xac dinh coi phan tram xuat hien cua 1 section
	var parallaxGetRatioVisible = function(element, sectionName){
		
		// fix param
		sectionName = sectionName || '';
		
		var zParallaxEl = zjs(element);
				
		// - - - 
		// dau tien phai check xem coi co phai day la 1 parallax container khong da
		// neu nhu khong co option thi chung to la khong phai
		var option = zParallaxEl.getData(optionkey);
		if(!option)
			return 0;
		
		// bay gio moi tiep tuc tim ra cai thang section, dua vao section name
		var zSectionEl = zParallaxEl.find('.'+option.sectionclass+'[data-name="'+sectionName+'"]').item(0);
		// neu nhu khong co thi thoi
		if(zSectionEl.count() < 1)
			return 0;
		
		// tinh toan ra toa do cua cai section nay
		var sectionTop = zSectionEl.top(),
			sectionHeight = zSectionEl.height();
		
		var currentScroll = zParallaxEl.getData(parallaxcurrentscrollkey),
			windowSize = zjs(window).height();
		
		//console.log('sectionTop', sectionTop, 'sectionHeight', sectionHeight, 'currentScroll', currentScroll, 'windowSize', windowSize);
			
		if(windowSize <= 0)
			return 0;
		
		var ratio = currentScroll >= sectionTop ? 
					(sectionHeight - currentScroll + sectionTop) / windowSize : 
					(currentScroll + windowSize - sectionTop) / windowSize ;
		if(ratio < 0)
			ratio = 0;
			
		return ratio;
	};
	
	// function xac dinh coi cai thang section nao dang la thang current
	var parallaxGetCurrentSection = function(element){
		
		var zParallaxEl = zjs(element);
				
		// - - - 
		// dau tien phai check xem coi co phai day la 1 parallax container khong da
		// neu nhu khong co option thi chung to la khong phai
		var listSectionNames = zParallaxEl.getData(listsectionnamekey, false);
		if(!listSectionNames || !zjs.isArray(listSectionNames))return '';
		
		// xem coi thang section nao co ratio cao nhat
		var maxRatioSectionName = '',
			maxRatio = 0;
		
		for(var i = 0; i<listSectionNames.length; i++){
			var _ratio = parallaxGetRatioVisible(element, listSectionNames[i]);
			if(_ratio > maxRatio){
				maxRatioSectionName = listSectionNames[i];
				maxRatio = _ratio;
			}
		}
		
		return maxRatioSectionName;
	};
	
	// function xac dinh coi cai thang section nao dang la thang last full section
	var parallaxGetLastFullScreenSection = function(element){
		
		var zParallaxEl = zjs(element);
				
		// - - - 
		// dau tien phai check xem coi co phai day la 1 parallax container khong da
		// neu nhu khong co option thi chung to la khong phai
		var listSectionNames = zParallaxEl.getData(listsectionnamekey, false);
		if(!listSectionNames || !zjs.isArray(listSectionNames))return '';
		
		var option = zParallaxEl.getData(optionkey),
			currentScroll = zParallaxEl.getData(parallaxcurrentscrollkey, 0);
		
		// thang last fullscreen section la thang section cuoi cung ma co top >= scrolltop
		var lastFullScreenSection = '',
			_zSectionEl = false;
		
		for(var i = 0; i<listSectionNames.length-1; i++){
			_zSectionEl = zParallaxEl.find('.'+option.sectionclass+'[data-name="'+listSectionNames[i]+'"]').item(0);
			if(_zSectionEl.count() < 1)
				continue;
		
			if(currentScroll >= _zSectionEl.top())
				lastFullScreenSection = listSectionNames[i];
		}
		
		return lastFullScreenSection;
	};
	
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeParallax: function(useroption){
			return this.eachElement(function(element){makeParallax(element, useroption)});
		},
		parallaxScrollToSection: function(sectionName){
			return this.eachElement(function(element){parallaxScrollToSection(element, sectionName)});
		},
		parallaxScrollToNextSection: function(){
			return this.eachElement(function(element){parallaxScrollToNextSection(element)});
		},
		parallaxGetRatioVisible: function(sectionName){
			return parallaxGetRatioVisible(this.item(0, true), sectionName);
		},
		parallaxGetCurrentSection: function(){
			return parallaxGetCurrentSection(this.item(0, true));
		},
		parallaxGetLastFullScreenSection: function(){
			return parallaxGetLastFullScreenSection(this.item(0, true));
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zparallax ko, neu nhu co thi se auto makeParallax luon
			zjs(el).find('.zparallax').makeParallax();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zparallax ko, neu nhu co thi se auto makeParallax luon
			if(zjs(el).hasClass('zparallax'))zjs(el).makeParallax();
			zjs(el).find('.zparallax').makeParallax();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zparallax').makeParallax();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('parallax');
});
