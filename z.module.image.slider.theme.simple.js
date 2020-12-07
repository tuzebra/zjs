// extend theme cho module ImageSlider
;zjs.require('image.slider', function(zjs){
"use strict";

var scrollbarIdkey = 'zmodulescrollbarid';
var isBodyScrollbar = function(){
	return parseInt(zjs(document.body).getData(scrollbarIdkey,0))>0;
};

var isPopupSliderKey = 'zmodulesliderlinearispopup';

zjs.regSliderTheme('simple', function(element, images, option){

	// console.log('images', Array.from(images));

	option = zjs.extend({
		width:0,
		height:0,

		transition:0,	// none, fade, fadein, horizontal, horizontal-stack, horizontal-page, horizontal-center, horizontal-stack-center, horizontal-page-center, vertical
		transitionTime:500,
		transitionTimingfunction:2,
		border: false,
		preload: false,
		lazyloadImage: false,
		lazyloadDelay: 0,
		autoplay: true,
		autoplayTime: 1500,
		playButton: false,
		navButton: true,
		navButtonParent: false,
		navButtonParentIsRoot: false,
		navButtonAutoDisable: false,
		// navThumb: true,
		navDot: true,
		

		// cac option phuc vu cho responsive
		wrapClass: '',
		imageViewClass: '',
		imageHoldClass: '',
		

		// hoverToSlide: false,
		navButtonTemplate: '<a class="nav-button"></a>',
		// navThumbTemplate: '<a class="nav-image"></a>',
		navDotTemplate: '<a class="nav-dot">.</a>',
		// customElementsClass: 'elements',
		// customTransitionClass: 'transition',

		// default index to slide to
		startIndex: 0,

		debug: false
	}, option);

	// trigger event
	//slider:load
	//slider:change
	//slider:click
	//slider:popup:hide
	//slider:popup:show
	//slider:disable
	//slider:enable

	// console.log('images', images);


	// fix option
	option.width = parseInt(option.width);
	option.height = parseInt(option.height);

	// fix option
	if(option.transition=='none')option.transition=0;
	if(option.transition=='fade'||option.transition=='fadein')option.transition=1;
	if(option.transition=='vertical'||option.transition=='slide-vertical'||option.transition=='vertical-slide')option.transition=3;
	if(option.transition.toInt()>3)option.transition=0;
	if(images.length<2)option.autoplay=false;

	// fix option 
	// option.usePercentWidth = !!option.usePercentWidth;
	// option.autoHeight = !!option.autoHeight;
	option.navButtonAutoDisable = !!option.navButtonAutoDisable;

	// fix navButtonParent
	if(option.navButtonParentIsRoot){
		option.navButtonParent = false;
	}

	// fix option
	// chi cho 1 trong 2 thang, hoac la fullwidth, hoac la fullscreen width
	// if(option.fullscreenWidth)
		// option.fullWidth = false;

	// fix option
	// chi cho start index > 0 va < images length
	option.startIndex = parseInt(option.startIndex);
	if(option.startIndex < 0)option.startIndex = 0;
	if(option.startIndex >= images.length)option.startIndex = images.length-1;


	var zElement = zjs(element),
		zBody = zjs(document.body),
		zWindow = zjs(window),
		zElementParent = zElement.parent(),

		// backup toan bo html lai cho chac
		_zElementOriHtml  = zElement.getInnerHTML();

	// remove luon data-option luon
	zElement.removeAttr('data-option');
	zElement.addClass('imageslider-simple');


	// vai cai class
	var slidertrackClass = 'imageslider-track',
		slidersizeClass = 'imageslider-size';


	// - - -

	// luu lai tinh trang hien tai cua slide (disable/enable)
	// var slideIsEnabled = true,
		// slideIsForceDisable = false,
		// slideIsForceEnable = false,
	// save lai cai element goc cua slide
		// slideRawContentEl = false;

	// - - -



	// PREPARE CAI MAIN ELEMENT UI (SLIDER)
	// =============

	// phien ban simple nay se giu lai toan bo raw html 
	zElement.find(option.slideitem).eachElement(function(element, index){

		var _zEl = zjs(element);

		// chuan bi moi thu trong index dau tien
		if(index === 0){
			if(_zEl.is('li')){
				_zEl.parent().addClass(slidertrackClass);

				// tao ra 1 ban clone de xac dinh kich thuoc
				var _nzUl = zjs('<ul>').appendTo(zElement).addClass(slidersizeClass);
				var _nzEl = _zEl.clone(true).appendTo(_nzUl);


			}
		}

	});

	// end prepare UI
	// ===========




	// - - - -

	// test xem nen su dung css3 transform bang zjs.supportTransform
	// neu nhu la dung css3 transform
	// thi setup translate3d truoc, sau do
	// setup auto animate bang css3 luon
	var zImageViewWrapRealEl = zImageViewWrap.item(0,true),
		zImageViewWrapRealElPos = 0,
		// Next pos la cai pos ma phai move toi
		// tuc la trong khi dang chay timer thi Pos -> NextPos
		// khi chay xong timer thi NextPos = Pos
		zImageViewWrapRealElNextPos = -1,
		cubicbezier = 'cubic-bezier(0, 0, 1, 1)', //linear
		// bien flag de check xem coi co su dung css transition hay khong
		flagSlideUseCssTransform = false,
		// dong thoi lam 2 cai ham turnon turn off luon cho chac an
		// vi se sai o nhieu noi
		imageViewWrapCssTransitionTurnOn = function(){
			if(!flagSlideUseCssTransform)return;
			zImageViewWrap.setStyle('transition', 'transform ' + option.transitionTime + 'ms '+cubicbezier);
		},
		imageViewWrapCssTransitionTurnOff = function(){
			if(!flagSlideUseCssTransform)return;
			zImageViewWrap.setStyle('transition', '');
		};
	// bay gio moi di test co co su dung css3 transition khong ne
	if(zjs.supportTransform && option.usecss){
		flagSlideUseCssTransform = true;
		zImageViewWrap.setStyle('transform', 'translate3d(0, 0, 0)');
		switch(option.transitionTimingfunction){
			case 1:case 'sinoidal':cubicbezier = 'cubic-bezier(0,0,.58,1)';break;
			// case 2:case 'quadratic':cubicbezier = 'cubic-bezier(0,1,.53,1)';break;
			case 2:case 'quadratic':cubicbezier = 'cubic-bezier(0.18, 0.17, 0.37, 0.99)';break;
			case 3:case 'cubic':cubicbezier = 'cubic-bezier(.34,.95,.84,1.39)';break;
			case 4:case 'elastic':cubicbezier = 'cubic-bezier(.71,1.61,.5,.82)';break;
		}
		if(typeof option.transitionTimingfunction == 'string' && option.transitionTimingfunction.indexOf('cubic-bezier')>=0){
			cubicbezier = option.transitionTimingfunction;
		}
		// turn on thoi
		imageViewWrapCssTransitionTurnOn();
	}


	// - - - -



	// neu nhu khong co option navdot thi remove di luon cho nhe
	if(!option.navDot)
		zNavDotsWrapEl.remove();

	// bind event cho 2 nut nav
	var doTriggerChangeNavButton = function(moreparam){};
	if(option.navButton){

		// xem coi neu nhu option la root thi move luon
		if(option.navButtonParentIsRoot){
			zElement.find('.nav-next, .nav-back').appendTo(zElement);
		}
		if(option.navButtonParent && zjs.isString(option.navButtonParent)){
			var zNavButtonParent = zElement.find(option.navButtonParent);
			if(zNavButtonParent.count()){
				option.navButtonParent = zNavButtonParent;
			}else{
				option.navButtonParent = false;
			}
		}
		if(option.navButtonParent){
			zElement.find('.nav-next, .nav-back').appendTo(option.navButtonParent);
		}

		// build 2 cai navigation button thoi
		doTriggerChangeNavButton = function(moreparam){

			// build prev button
			var _navButtonHtml = option.navButtonTemplate;
			if(zjs.isFunction(_navButtonHtml))_navButtonHtml = _navButtonHtml(estimatePrevIndex, images[estimatePrevIndex]);
			_navButtonHtml = _navButtonHtml.format(images[estimatePrevIndex])+'';
			var newNavBackButton = zjs(_navButtonHtml).addClass('nav-back').setAttr('data-index', estimatePrevIndex);
			var oldNavBackButton = zElement.find('.nav-back').item(0);
			newNavBackButton.insertBefore(oldNavBackButton).click(function(e){
				e.preventDefault();
				var self = zjs(this);
				if(self.hasClass(navButtonDisableClass))return;
				showPrevImage();
			});
			oldNavBackButton.remove();

			// build next button
			_navButtonHtml = option.navButtonTemplate;
			if(zjs.isFunction(_navButtonHtml))_navButtonHtml = _navButtonHtml(estimateNextIndex, images[estimateNextIndex]);
			_navButtonHtml = _navButtonHtml.format(images[estimateNextIndex])+'';
			var newNavNextButton = zjs(_navButtonHtml).addClass('nav-next').setAttr('data-index', estimateNextIndex);
			var oldNavNextButton = zElement.find('.nav-next').item(0);
			newNavNextButton.insertBefore(oldNavNextButton).click(function(e){
				e.preventDefault();
				var self = zjs(this);
				if(self.hasClass(navButtonDisableClass))return;
				showNextImage();
			});
			oldNavNextButton.remove();


			// handle stage cho 2 cai button nay
			// nhung chi xu ly nhung thang nao sai sequent thoi
			// chu con slider cho phep xoay vong thi thoi
			// khong can phai xu ly
			if(!option.sequent)return;

			// xu ly cho may truong hop binh thuong
			if(option.navButtonAutoDisable){
				if(currentIndex == images.length - 1)
					newNavNextButton.addClass(navButtonDisableClass);
				if(currentIndex == 0)
					newNavBackButton.addClass(navButtonDisableClass);
			}

			// truong hop horizontal stack (201)
			// tat nhien la khong bao gio cho the reach de cai element cuoi cung duoc
			// if(option.navButtonAutoDisable && estimateNextIndex == 0 && (
			// 	option.transition == 201 
			// 	|| option.transition == 202 
			// 	|| option.transition == 204 
			// 	|| option.transition == 205 ))
			// 	newNavNextButton.addClass(navButtonDisableClass);
		};

	}
	else{
		zElement.find('.nav-back, .nav-next').remove();
	};


	// neu nhu mac dinh minh overflow hidden
	// thi gio tra ve overflow la ok!
	zElement.setStyle('overflow','visible');
	zElement.removeClass(sliderNotReadyClass);

	// - - - -

	// ham view large image
	var showLargeImage = function(index, moreparam, notTransition, notTriggerEvent, isInnerCall){

		notTransition = notTransition || false;
		notTriggerEvent = notTriggerEvent || false;
		isInnerCall = isInnerCall || false;

		// trong truong hop slider dang disable
		// thi se cho qua luon
		if(!slideIsEnabled){
			// neu ma autoplay thi play thoi
			if(option.autoplay)autoplayTimer.run();
			return;
		}

		index = parseInt(index);




		// stop autorun first
		// de trong qua trinh dang run transition cua slide
		// thi se khong bi chay autorun qua slide khac
		if(autoplayTimer.isRunning())autoplayTimer.stop();

		// Fix 
		// if(index >= images.length)index = images.length-1;
		// if(index < 0)index=0;
		// console.log('index before', index);
		var direction = 1;
		if(moreparam && (typeof moreparam.direction != 'undefined') && moreparam.direction == 'prev')
			direction = -1;
		// index = getShownIndexKeyByNormalIndex(index, direction);
		// console.log('index after', index);

		// xem coi co dc thay doi hay khong
		// neu nhu dang touch slide thi se out ra
		if(touchSliding == 2){
			// neu ma autoplay thi` play thoi
			if(option.autoplay)autoplayTimer.run();
			return;
		}


		// backup and then set new index
		currentTempIndex = currentIndex;
		currentIndex = index;
		currentTempOrdering = currentOrdering;
		// currentOrdering = findOrderingNumberByShownIndex(index);


		// neu nhu khong co effect tu tu
		// thi phai check coi co trung nhau hay khong
		// neu muon slide toi cai hien tai thi khong cho
		if(!isInnerCall){
			if(!notTransition && currentIndex==currentTempIndex)return;
		}
		

		if(images[index]){
			currentImageSrc = images[index].srclarge || images[index].src;
			currentTitle = images[index].title;
			currentLink = images[index].link;
			currentDes = images[index].description;
			currentLink = images[index].link;
		}

		// extend moreparam
		moreparam = moreparam || new Object();
		moreparam = zjs.extend({
			index: currentIndex,
			oldindex: currentTempIndex,
			image: currentImageSrc,
			title: currentTitle,
			description: currentDes,
			link: currentLink
		}, moreparam);


		// luon luon uu tien thang vua tro thanh current index
		// se co z-index cao hon cac thang con lai
		zImageViewWrap.find('.image'+currentIndex).setStyle('z-index', zIndexCounting++);


		// xem coi co khong cho su dung transition hay khong
		notTransition = notTransition || false;
		// console.log('switch', option.transition);
		// lua chon hieu ung phu hop
		// va tien hanh transition
		switch(option.transition){
			// fade in fade out
			case 1:
				// neu da co san css3 transition thi su dung thoi
				fadeInTransition.stop().run();
				break;

			// slide left right
			case 2: // horizontal
			
				// else floatTransition.stop().set({from: zImageViewWrapRealElPos, to: zImageViewWrapRealElNextPos}).run();
				break;

			// slide up down
			case 3:
				
				// else floatTransition.stop().set({from: zImageViewWrapRealElPos, to: zImageViewWrapRealElNextPos}).run();
				break;


			// switch thoi
			default:
				// zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', 1).show();
				// if(images.length > 1)zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 0).hide();
				break;
		};

		// change active cho nav dot va nav thumbnail cho dung
		zElement.find('.nav-image, .nav-dot').removeClass('active');
		zElement.find('.nav-image[data-index='+index+'], .nav-dot[data-index='+index+']').addClass('active');



		// cung xong xuoi moving image roi
		// gio se tinh toan lai cai prev & next index luon
		// --
		estimatePrevIndex = currentIndex-1;
		estimateNextIndex = currentIndex+1;


		if(estimatePrevIndex<0)
			estimatePrevIndex = images.length-1;
		if(estimateNextIndex>=images.length)
			estimateNextIndex = 0;
		// --
		// end tinh toan prev & next index





		// trigger internal event
		// cai tro old
		doTriggerChangeNavButton(moreparam);

		// trigger external event
		if(!notTriggerEvent){
			// option.onChange(moreparam);
			// trigger event
			zElement.trigger('slider:change', moreparam);
		};

		// neu ma autoplay thi play thoi
		if(option.autoplay){

			var runtimeOption = option;
			if(images[currentIndex] && zjs.isObject(images[currentIndex].option))
				runtimeOption = zjs.extend(runtimeOption, images[currentIndex].option);

			autoplayTimer.set({
				time: runtimeOption.autoplayTime
			}).run();
		};

		

	};


	// - - - -
	// may cai Transition

	// fadeIn transition
	var fadeInTransition = zjs.timer({
		from:0,to:1,
		time:option.transitionTime,
		onStart: function(from, to){
			// chac chan thang nay chua hien
			zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', 0).show();
			zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 1).show();
		},
		onProcess: function(current, from, to){
			// fade ca 2 thang
			zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', current);
			zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 1-current);
		},
		onStop: function(from, to){
			zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', 1);
			zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 0).hide();
		},
		onFinish: function(from, to){
			zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', 1);
			zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 0).hide();
		}
	});

	// float transition
	var floatTransition = zjs.timer({
		from:0,to:1,
		time:option.transitionTime,
		transition:option.transitionTimingfunction,
		onStart: function(from, to){},
		onProcess: function(current, from, to){zImageViewWrapRealElMove(current);},
		onStop: function(from, to){},
		onFinish: function(from, to){zImageViewWrapRealElMove(to, true);}
	});

	// ham that su lam nhiem vu di chuyen vi tri cua zImageViewWrap
	// chi mat cong khai bao 1 lan dau tuy hoi dai dong
	// nhung se tang duoc dang ke performance
	// vi trong luc move ko can phai if else nua
	var zImageViewWrapRealElMove;
	if((option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205) && flagSlideUseCssTransform){
		zImageViewWrapRealElMove = function(to, setDataLog){
			zImageViewWrapRealElPos = to;
			zImageViewWrap.setStyle('transform', 'translate3d(' + to + 'px, 0, 0)');
			// transform = css3 thi can gi check haha
			zImageViewWrap.setData('real-pos', zImageViewWrapRealElPos);
		};
	}else if(option.transition==3 && flagSlideUseCssTransform){
		zImageViewWrapRealElMove = function(to, setDataLog){
			zImageViewWrapRealElPos = to;
			zImageViewWrap.setStyle('transform', 'translate3d(0, ' + to + 'px, 0)');
			// transform = css3 thi can gi check haha
			zImageViewWrap.setData('real-pos', zImageViewWrapRealElPos);
		};
	}else if(option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205){
		zImageViewWrapRealElMove = function(to, setDataLog){
			zImageViewWrapRealElPos = to;
			zImageViewWrapRealEl.style.left = to+'px';
			if(setDataLog)zImageViewWrap.setData('real-pos', zImageViewWrapRealElPos);
		};
	}else if(option.transition==3){
		zImageViewWrapRealElMove = function(to, setDataLog){
			zImageViewWrapRealElPos = to;
			zImageViewWrapRealEl.style.top = to+'px';
			if(setDataLog)zImageViewWrap.setData('real-pos', zImageViewWrapRealElPos);
		};
	};
	// xong!

	// - - - -

	// ham view next image
	var showNextImage = function(){
			// da duoc tinh toan truoc roi
			// cho nen bay gio chi viec run ma thoi
			showLargeImage(estimateNextIndex, {direction:'next'});
		},
		showPrevImage = function(){
			// da duoc tinh toan truoc roi
			// cho nen bay gio chi viec run ma thoi
			showLargeImage(estimatePrevIndex, {direction:'prev'});
		};

	// - - - - - - - - - - -


	// bind event neu nhu la webkit va dang sai thiet bi di dong
	var touchSliding = 0,
		// = 0 nghia la chua lam gi
		// = 1 nghia la vua moi cham vo
		// = 2 nghia la dang move linh tinh
		checkedReponsibilityHandler = false,
		startPixelOffset = 0,
		touchStartPos = 0,
		touchOtherStartPos = 0,
		deltaSlide = 0,
		deltaOtherSlide = 0,
		slideCount = images.length;

	// 1 bien de luu lai la cai nay la dang drag slider chu khong phai la muon click vao slider
	var flagJustDoDrag = false;

	// bat dau add su kien drag cho no thoi
	if(flagSlideUseCssTransform && 
		(option.transition==2 || 
		// option.transition==201 || 
		// option.transition==202 || 
		// option.transition==203 || 
		// option.transition==204 || 
		// option.transition==205 || 
		option.transition==3) && 
		(zjs.isTouchDevice())
	)
	{
		zElement.drag({
			willPreventDefault: true,
			direction: (option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205) ? 'horizontal' : 'vertical',

			onStart: function(event, element){
				//flagJustDoDrag = false;

				if(touchSliding != 0)return;
				touchSliding=1;

				if(option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205)touchStartPos = event.touchX();
				if(option.transition==3)touchStartPos = event.touchY();
			},

			onDrag: function(event, element, mouse, style){
				if(touchSliding == 0)return;

				flagJustDoDrag = true;

				var eventTouchX = event.touchX(),
					eventTouchY = event.touchY();

				if(option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205)deltaSlide = eventTouchX - touchStartPos;
				if(option.transition==3)deltaSlide = eventTouchY - touchStartPos;

				if(touchSliding == 1 && deltaSlide != 0){
					touchSliding = 2;
					startPixelOffset = zImageViewWrapRealElPos;
					// turnoff css3 auto transition
					imageViewWrapCssTransitionTurnOff();
				};

				if(touchSliding == 2){
					var touchPixelRatio = 1;
					if(	((option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205) && currentIndex == 0 && eventTouchX > touchStartPos) ||
						((option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205) && currentIndex == slideCount - 1 && eventTouchX < touchStartPos) ||
						(option.transition==3 && currentIndex == 0 && eventTouchY > touchStartPos) ||
						(option.transition==3 && currentIndex == slideCount - 1 && eventTouchY < touchStartPos)
					)touchPixelRatio = 3;
					zImageViewWrapRealElMove(startPixelOffset + deltaSlide / touchPixelRatio);
				};
			},

			onDrop: function(event, element, mouse, style){
				if(touchSliding != 2)return;

				touchSliding = 0;
				var index = zImageViewWrapRealElPos < startPixelOffset ? currentIndex + 1 : currentIndex - 1;
				index = Math.min(Math.max(index, 0), slideCount - 1);

				// turnon again css3 auto transition
				imageViewWrapCssTransitionTurnOn();

				// neu nhu co su thay doi index thi se move slide
				if(index!=currentIndex){showLargeImage(index)}
				// con neu van giu nguyen index thi se move ve dung vi tri
				else{zImageViewWrapRealElMove(-zImageViewElWidth * index)};
			}
		});

	};

	// - - - - - - - - - - -

	// var refreshSlideFirst = false;
	// ham lam nhiem vu refresh lai slide
	var refreshSlide = function(){
		// if(!refreshSlideFirst){
		// 	refreshSlideFirst = true;
		// 	return;
		// };

		// // slide toi thang hien tai
		// showLargeImage(currentIndex, {}, true, true, true);
		// //function(index, moreparam, notTransition, notTriggerEvent, isInnerCall)

		// // truoc mat thi trigger window resize luon
		// zWindow.trigger('resize');
	};


	// - - - -

	var slideFilter = function(slideItemFilterHandler){
		// // just loop through the images and update the show/hide status
		// var i;for(i=0;i<images.length;i++){
		// 	var isShown = true;
		// 	if(zjs.isFunction(slideItemFilterHandler)){
		// 		var handlerResult = slideItemFilterHandler(images[i]);
		// 		if(typeof handlerResult !== 'undefined')
		// 			isShown = handlerResult;
		// 	}
		// 	// update it to rawimage
		// 	images[i].isShown = isShown;
		// };
		// generateShownImageIndexsFromImages();
		// applyFilterToSlider();
	};

	var applyFilterToSlider = function(){
		// // step 1: hide/show the image-hold & navdot
		// var zNavDotDotsEl = false;
		// if(option.navDot){
		// 	zNavDotDotsEl = zNavDotsEl.find('.nav-dot');
		// 	if(!zNavDotDotsEl.count())
		// 		zNavDotDotsEl = false;
		// }
		// var i;for(i=0;i<images.length;i++){
		// 	if(images[i].isShown){
		// 		images[i].el.removeClass(imageholdhideClass);
		// 		zNavDotDotsEl.item(i).show();
		// 	}else{
		// 		images[i].el.addClass(imageholdhideClass);
		// 		zNavDotDotsEl.item(i).hide();
		// 	}
		// }
		// // step 2: refresh slider
		// refreshSlide();
	};

	// ham co nhiem vu convert index => shownindex
	var getShownIndexKeyByNormalIndex = function(index, direction){
		// direction = direction || 1;
		
		// // do nothing;
		// if(shownImageIndexs.length == images.length)
		// 	return index;

		// var shownIndex = shownImageIndexs.indexOf(index);
		// // if the index in the shown list, just return it
		// if(shownIndex>-1)
		// 	return index;
		// // if it not in the list, need to find the: 
		// // - next one (if direction > 0)
		// // - previous one (if direction < 0)
		// var i;
		// if(direction>0){
		// 	if(index>=images.length){
		// 		index = 0;
		// 	}
		// 	for(i=0;i<shownImageIndexs.length;i++){
		// 		if(shownImageIndexs[i] > index){
		// 			return shownImageIndexs[i];
		// 		}
		// 	}
		// 	return getShownIndexKeyByNormalIndex(0, direction);
		// }
		// if(direction<0){
		// 	if(index<0){
		// 		index = images.length - 1;
		// 	}
		// 	for(i=shownImageIndexs.length-1;i>=0;i--){
		// 		if(shownImageIndexs[i] < index){
		// 			return shownImageIndexs[i];
		// 		}
		// 	}
		// 	return getShownIndexKeyByNormalIndex(images.length - 1, direction);
		// }
		// default
		// return (direction>0) ? shownImageIndexs[0] : shownImageIndexs[shownImageIndexs.lenght - 1];
	};

	// ham co nhiem vu tim ra vi tri (ordering) cua shownindex
	var findOrderingNumberByShownIndex = function(shownIndex){
		// return shownImageIndexs.indexOf(shownIndex);
	};


	// - - - - 



	// ham lam nhiem vu disable / enable slide
	var slideDisable = function(forceAutoOption){
		return;
		forceAutoOption = forceAutoOption || false;
		if(!forceAutoOption && slideIsForceEnable)return;
		// neu nhu khong tao ra slide thi thoi
		if(!imagesliderWrapEl)return;
		slideRawContentEl = zjs('<div></div>').addClass(sliderRawContentClass);
		slideRawContentEl.insertAfter(imagesliderWrapEl);
		slideRawContentEl.setInnerHTML(_zElementOriHtml);
		zElement.addClass(sliderDisableClass);
		// imagesliderWrapEl.hide();
		// imagesliderWrapEl.addClass('slider');
		slideIsEnabled = false;
		if(forceAutoOption)slideIsForceDisable = true;
		if(forceAutoOption)slideIsForceEnable = false;
		zElement.trigger('slider:disable');

	};

	var slideEnable = function(forceAutoOption){
		return;
		forceAutoOption = forceAutoOption || false;
		if(!forceAutoOption && slideIsForceDisable)return;
		if(slideRawContentEl)slideRawContentEl.remove();
		// imagesliderWrapEl.show();
		zElement.removeClass(sliderDisableClass);
		slideIsEnabled = true;
		if(forceAutoOption)slideIsForceDisable = false;
		if(forceAutoOption)slideIsForceEnable = true;
		zElement.trigger('slider:enable');
	};


	// IMPLEMENT AUTO DISABLE SLIDER BY WIDTH 

	if(option.autoDisableWhenWidthLessThan > 0 || 
		option.autoDisableWhenWidthLargerThan > 0 || 
		option.autoDisableWhenWindowWidthLessThan > 0 ||
		option.autoDisableWhenWindowWidthLargerThan > 0
	){

		var autoEnableOrDisableSlider = function()
		{
			// var width = option.fullscreenWidth ? zBody.width() : zElementParent.width(),
			var width = zElementParent.width(),
				winWidth = zWindow.width();

			// new feature
			// tu dong turn on/off cai slide dua vao width
			// nhung voi dieu kien la khong phai dang bi force disable thoi
			// if(!slideIsForceDisable && !slideIsForceEnable){
				// if(option.autoDisableWhenWidthLessThan > 0){
				// 	if(width <= option.autoDisableWhenWidthLessThan && slideIsEnabled === true){
				// 		slideDisable();
				// 	}else if(width > option.autoDisableWhenWidthLessThan && slideIsEnabled === false){
				// 		slideEnable();
				// 	};
				// };
				// if(option.autoDisableWhenWidthLargerThan > 0){
				// 	if(width >= option.autoDisableWhenWidthLargerThan && slideIsEnabled === true){
				// 		slideDisable();
				// 	}else if(width < option.autoDisableWhenWidthLargerThan && slideIsEnabled === false){
				// 		slideEnable();
				// 	};
				// };

				// win width
				if(option.autoDisableWhenWindowWidthLessThan > 0){
					if(winWidth <= option.autoDisableWhenWindowWidthLessThan && slideIsEnabled === true){
						slideDisable();
					}else if(winWidth > option.autoDisableWhenWindowWidthLessThan && slideIsEnabled === false){
						slideEnable();
					};
				};
				if(option.autoDisableWhenWindowWidthLargerThan > 0){
					if(winWidth >= option.autoDisableWhenWindowWidthLargerThan && slideIsEnabled === true){
						slideDisable();
					}else if(winWidth < option.autoDisableWhenWindowWidthLargerThan && slideIsEnabled === false){
						slideEnable();
					};
				};
			// };
		}

		// first fix
		zWindow.on('resize',function(){
			autoEnableOrDisableSlider.delay(500)
		}).trigger('resize');

	};





	// - - - -

	var playButtonEl = option.playButton ? zElement.find('.play-wrap') : false,
		autoplayProcessBarEl = option.playButton ? zElement.find('.play-process-bar') : false;


	// timer lam` nhiem vu. auto play
	var autoplayTimer = zjs.timer({
		time:option.autoplayTime,
		transition:'linear',
		onProcess: function(current){
			if(autoplayProcessBarEl)autoplayProcessBarEl.height(current+'%');
		},
		onStop: function(){
			if(autoplayProcessBarEl)autoplayProcessBarEl.height('0%');
		},
		onFinish: function(){
			showNextImage();
		}
	});
	// - - - -


	// ham lam nhiem vu set autoplay & play slide
	var slidePlay = function(){
			option.autoplay = true;
			autoplayTimer.stop().run();
			if(playButtonEl)playButtonEl.addClass('pause');
		},
		slidePause = function(){
			option.autoplay = false;
			autoplayTimer.stop();
			if(playButtonEl)playButtonEl.removeClass('pause');
		};

	// bind event cho cai nut luon
	if(option.playButton){
		zElement.find('.play-wrap').click(function(event){
			event.preventDefault();
			if(option.autoplay)slidePause();
			else slidePlay();
		});
	};

	// - - -
	// remove elemment unused
	if(!option.navDot && (!option.navButton || option.navButtonParentIsRoot))zElement.find('.nav-wrap').remove();
	if(!option.playButton)zElement.find('.play-wrap').remove();



	// - - - -

	// ham lam nhiem vu show popup (alias voi main slider)
	var slidePopupShow = function(defaultIndex){
		zElement.trigger('slider:popup:show');
	};

	// ham lam nhiem vu close popup
	var slidePopupHide = function(){
		zElement.trigger('slider:popup:hide');
	};





	// - - - -



	// trigger event
	zElement.trigger('slider:ready');
	(function(){
		zElement.trigger('slider:ready:fixheight');
	}).delay(500);
	
	// neu nhu khong choi show preload len UI
	// thi cho nay start slideshow luon
	if(!option.preload){
		// lan toi cai dau tien da roi tinh gi thi tinh
		showLargeImage(0, {}, true, true);
		if(images.length>1){showLargeImage(1, {direction:'next'}, true, true);showLargeImage(0, {direction:'prev'}, true, true);}
		// bay gio neu nhu co option start-index thi se move tu tu tung cai, khong thoi la bi loi nua
		if(option.startIndex>0){
			var _tmpIndex = 0;
			while(_tmpIndex<option.startIndex)
				showLargeImage(++_tmpIndex, {direction:'next'}, true, true);
		};
		
		if(option.autoplay)slidePlay();

		// trigger event
		zElement.trigger('slider:load');

		// refresh 1 cai
		// refreshSlide();
	};

	// cuoi cung la phai return method cho slider
	return {
		slideTo: showLargeImage,
		slideNext: showNextImage,
		slidePrev: showPrevImage,
		slidePlay: slidePlay,
		slidePause: slidePause,
		slidePopupShow: slidePopupShow,
		slidePopupHide: slidePopupHide,
		slideRefresh: refreshSlide,
		slideDisable: function(){slideDisable(true)},
		slideEnable: function(){slideEnable(true)},
		slideFilter: slideFilter,
	};

});

// register module name, fix de tuong thich voi zjs version 1.0
if('required' in zjs)
zjs.required('image.slider.theme.simple');

});