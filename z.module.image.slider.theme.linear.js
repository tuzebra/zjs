// extend theme cho module ImageSlider
;zjs.require('image.slider, image.loader, transition', function(zjs){
"use strict";

var scrollbarIdkey = 'zmodulescrollbarid';
var isBodyScrollbar = function(){
	return parseInt(zjs(document.body).getData(scrollbarIdkey,0))>0;
};

var isPopupSliderKey = 'zmodulesliderlinearispopup';

zjs.regSliderTheme('linear', function(element, images, option){

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
		navThumb: true,
		navDot: true,
		showInfo: true,
		linkTitle: false,
		linkCover: false,
		sequent: true,
		usePercentWidth: true,

		// option tao ra 1 cai navigation moi
		// dua tren horizontal-stack / horizontal-page / horizontal-center
		navThumbSlider: false,
		navThumbSliderTransition: 'horizontal-page',
		navThumbSliderTransitionTime: 1600,
		navThumbSliderTransitionTimingfunction: 2,
		navThumbSliderNavButton: true,
		navThumbSliderUsePercentWidth: true,
		navThumbSliderAutoHeight: false,


		// cac option phuc vu cho responsive
		wrapClass: '',
		imageViewClass: '',
		imageHoldClass: '',
		autoHeight: false,
		fullHeight: false,
		fullWidth: true,
		fullscreenWidth: false,

		scaleHeightWhenWidthLessThan: 0,

		autoDisableWhenWidthLessThan:0,
		autoDisableWhenWidthLargerThan:0,
		autoDisableWhenWindowWidthLessThan:0,
		autoDisableWhenWindowWidthLargerThan:0,

		hoverToSlide: false,
		navButtonTemplate: '<a class="nav-button"></a>',
		navThumbTemplate: '<a class="nav-image"></a>',
		navDotTemplate: '<a class="nav-dot">.</a>',
		customElementsClass: 'elements',
		customTransitionClass: 'transition',

		// use css transform if browser support
		usecss: true,

		// option cho phep su dung image slider nhu 1 content slider
		contentSlide: false,

		// for nav thumb
		navImagesElMargin: 0,

		// default index to slide to
		startIndex: 0,

		// drag to move slider
		dragSlide: false,

		// support clone to an popup
		popup: false,
		popupOnly: false,
		popupShowOnClick: true,
		popupHideOnClickOut: false,
		popupCloseButton: true,
		popupAllowKeyboard: true,
		popupScrollPopup: false,  				// false | true | "mobileOnly"

		// animate when show popup
		popupAnimate: false,
		popupAnimateTime: 1000,
		popupAnimateName: 'fadeInDown fadeOutUp',

		// option for slider inside popup
		popupTransition: false,  				// <- ket thua tu thang popup cha
		popupTransitionTime: false,				// <- ket thua tu thang popup cha
		popupTransitionTimingfunction: false,	// <- ket thua tu thang popup cha

		popupLazyloadImage: false,
		popupLazyloadDelay: false,
		popupAutoplay: true,
		popupAutoplayTime: 6000,
		popupPlayButton: false,

		popupNavButton: true,
		popupNavButtonParent: false,
		popupNavButtonParentIsRoot: false,
		popupNavThumb: true,
		popupNavDot: true,
		popupShowInfo: true,
		popupLinkTitle: false,
		popupLinkCover: false,
		popupSequent: true,
		popupFullscreenWidth: false,
		popupContentSlide: false,

		popupPageCoverClass: '',
		popupContainerClass: '',
		popupImagesliderPopupWrapClass: '',

		cleanHtml: false,

		// event
		onChange: function(moreparam){},
		allowChange: function(index){return true;},
		// debug
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

	var _images = new Array();
	zjs.foreach(images, function(image){
		if(image.src != '' || image.srclazy != ''){
			_images.push(image);
		}
		// auto active option.lazyloadImage
		if(image.srclazy){
			option.lazyloadImage = true;
		}
	});
	// neu nhu ma khong phai contentSlide thi phai nghiem ngat kiem tra images cho chinh xac
	if(!option.contentSlide){
		images = _images;
	}

	// add them index
	for(var _i=0;_i<images.length;_i++){
		images[_i].index = _i;
		images[_i].lazyloaded = false;
		images[_i].lazyEl = false;
		images[_i].isShown = true;
	}

	var shownImageIndexs;
	var generateShownImageIndexsFromImages = function(){
		shownImageIndexs = [];
		for(var _i=0;_i<images.length;_i++){
			if(images[_i].isShown)
				shownImageIndexs.push(_i);
		}
	};

	// first run to generate images to use
	generateShownImageIndexsFromImages();

	// fix option
	option.width = parseInt(option.width);
	option.height = parseInt(option.height);

	// fix option
	if(option.transition=='none')option.transition=0;
	if(option.transition=='fade'||option.transition=='fadein')option.transition=1;
	if(option.transition=='horizontal'||option.transition=='slide-horizontal'||option.transition=='horizontal-slide')option.transition=2;
	if(option.transition=='horizontal-stack')option.transition=201;
	if(option.transition=='horizontal-page')option.transition=202;
	if(option.transition=='horizontal-center')option.transition=203;
	if(option.transition=='horizontal-stack-center')option.transition=204;
	if(option.transition=='horizontal-page-center')option.transition=205;
	if(option.transition=='vertical'||option.transition=='slide-vertical'||option.transition=='vertical-slide')option.transition=3;
	//if(option.transition.toInt()>3)option.transition=0;
	if(images.length<2)option.autoplay=false;

	if(option.transition > 200){
		option.fullWidth = false;
		option.fullscreenWidth = false;
		if(option.transition==201 || option.transition==202 || option.transition==204 || option.transition==205){
			option.navButtonParentIsRoot = true;
		}
		if(option.transition==202 || option.transition==205){
			option.sequent = true;
		}
	}

	// fix option 
	option.usePercentWidth = !!option.usePercentWidth;
	option.autoHeight = !!option.autoHeight;
	option.navButtonAutoDisable = !!option.navButtonAutoDisable;

	// fix navButtonParent
	if(option.navButtonParentIsRoot){
		option.navButtonParent = false;
	}

	// fix option
	// chi cho 1 trong 2 thang, hoac la fullwidth, hoac la fullscreen width
	if(option.fullscreenWidth)
		option.fullWidth = false;

	// fix option khi su dung contentSlide thi se khong co 1 so thu khong can thiet
	if(option.contentSlide){
		option.preload = false;
		option.navThumb = false;
		//option.linkTitle = false;
		//option.linkCover = false;
		option.hoverToSlide = false;
		// option.showInfo = false; => show info that ra cung ko lien quan den content slide
	}

	// fix option
	// chi cho start index > 0 va < images length
	option.startIndex = parseInt(option.startIndex);
	if(option.startIndex < 0)option.startIndex = 0;
	if(option.startIndex >= images.length)option.startIndex = images.length-1;

	// fix option
	// neu nhu su dung navThumbSlider thi se phai chinh lai 1 so option cho phu hop
	if(option.navThumbSlider){
		option.navButtonParentIsRoot = true;
		option.navButtonParent = false;
		option.navThumb = false;
	}

	// fix option
	// neu nhu su dung option popupOnly thi chac chan phai su dung popup
	if(option.popupOnly)
		option.popup = true;

	// fix option khi su dung popup animate
	if(option.popupAnimate){
		option.popupAnimateTime = parseInt(option.popupAnimateTime);
		zjs.require('ui.popup');
	}

	// fix option
	option.scaleHeightWhenWidthLessThan = parseInt(option.scaleHeightWhenWidthLessThan);
	if(option.scaleHeightWhenWidthLessThan < 0)
		option.scaleHeightWhenWidthLessThan = 0;
	// neu co auto scale height thi se khong cho full height nua
	//if(option.scaleHeightWhenWidthLessThan > 0)
	//	option.fullHeight = false;



	option.autoDisableWhenWidthLessThan = parseInt(option.autoDisableWhenWidthLessThan);
	if(option.autoDisableWhenWidthLessThan < 0)option.autoDisableWhenWidthLessThan = 0;
	option.autoDisableWhenWidthLargerThan = parseInt(option.autoDisableWhenWidthLargerThan);
	if(option.autoDisableWhenWidthLargerThan < 0)option.autoDisableWhenWidthLargerThan = 0;

	option.autoDisableWhenWindowWidthLessThan = parseInt(option.autoDisableWhenWindowWidthLessThan);
	if(option.autoDisableWhenWindowWidthLessThan < 0)option.autoDisableWhenWindowWidthLessThan;


	// - - - -
	var _mainHtml = '<div class="image-view">'+
						'<div class="image-view-wrap"></div>'+
						'<div class="image-view-border"></div>'+
					'</div>'+
					'<div class="image-info-wrap">'+
						'<div class="image-info-container">'+
							'<div class="image-title"><h4></h4></div>'+
							'<div class="image-description"></div>'+
						'</div>'+
					'</div>'+
					'<div class="image-linkcover-wrap">'+
						'<a href="#"></a>'+
					'</div>'+
					'<div class="play-wrap">'+
						'<a class="play-process-bar"></a>'+
						'<div class="playpause-button"></div>'+
					'</div>'+
					'<div class="nav-wrap">'+
						'<div class="nav-container">'+
							'<div class="nav-dots-wrap">'+
								'<div class="nav-dots"></div>'+
							'</div>'+
							'<a class="nav-button nav-back"></a>'+
							'<div class="nav-images-wrap">'+
								'<div class="nav-images"></div>'+
							'</div>'+
							'<a class="nav-button nav-next"></a>'+
						'</div>'+
					'</div>',
		_imageHoldHtml = '<div class="image-hold"></div>',
		_imageItemHtml = '<div class="image-item"></div>',
		_loaderHtml = '<div class="slider-loading-wrap"><div class="text-wrap"><span class="percent"></span>%</div></div>',

		// dung cho popup
		_popupPageCoverHtml = '<div class="imageslider-popup-page-cover"></div>',
		_popupContainerHtml = '<div class="imageslider-popup-container">'+
								'<div class="imageslider-popup-close-button">&times;<i class="icon"></i></div>'+
								'<div class="imageslider-popup-wrap">'+
									'<div class="inpopup-imageslider"></div>'+
								'</div>'+
							'</div>';

	// class
	var linkcoverhoverClass = 'linkcoverhover',
		linktitlehoverClass = 'linktitlehover',

		sliderContainerClass = 'imageslider-container',
		sliderWrapClass = 'imageslider-wrap',
		sliderRawContentClass = 'imageslider-raw',
		sliderDisableClass = 'slider-disabled',
		navButtonDisableClass = 'disabled',

		imageholdloadingClass = 'imageloading',
		imageholdhideClass = 'slide-hide',

		bodypopupshowClass = 'imageslider-popup-show',

		sliderNotReadyClass = 'slider-not-ready',

		lazyImgSelector = '[data-lazy-src], [data-lazysrc], [data-srclazy], [srclazy]';

	var zElement = zjs(element),
		zBody = zjs(document.body),
		zWindow = zjs(window),
		zElementParent = zElement.parent(),
		zElementIsInPopup = !!zElement.getData(isPopupSliderKey, false),

		// backup toan bo html lai cho chac
		_zElementOriHtml  = zElement.getInnerHTML();

	// remove luon data-option luon
	zElement.removeAttr('data-option');

	// add them class cho drag
	if(option.dragSlide)
		zElement.addClass('drag');

	// add class de xac dinh width theo cai gi?
	zElement.addClass(option.usePercentWidth ? 'use-percent' : 'use-pixel');
	// get some custom html elements
	zElement.find(option.slideitem).eachElement(function(element, index){
		if(index>=images.length)return;

		var _zEl = zjs(element);
		var separateOption = _zEl.getAttr('data-option', '');
		if(zjs.isString(separateOption) && separateOption.trim()!='')
			separateOption = separateOption.jsonDecode();
		if(!zjs.isObject(separateOption))separateOption = false;
		images[index].option = separateOption;

		var _customEl = _zEl.find('.'+option.customElementsClass);
		if(_customEl.count() <= 0 && _zEl.hasClass(option.customElementsClass) && _zEl.is('img')){
			_customEl = _zEl;
			// _customEl.setAttr('data-need-to-append');
		}
		// binh thuong thi se bo cuoc
		// nhung ma neu nhu su dung content slide
		// thi bat buoc phai co content
		if(_customEl.count() <= 0 && option.contentSlide){
			_customEl = _zEl;
		}

		images[index].customEl = _customEl.clone(true);
		if(option.lazyloadImage){
			images[index].customEl.addClass(imageholdloadingClass);
		}
	});
	// - - -

	// luu lai tinh trang hien tai cua slide (disable/enable)
	var slideIsEnabled = true,
		slideIsForceDisable = false,
		slideIsForceEnable = false,
	// save lai cai element goc cua slide
		slideRawContentEl = false;

	// - - -



	// PREPARE CAI MAIN ELEMENT UI (SLIDER)
	// =============

	var imagesliderWrapEl = false;

	// nhung ma trong truong hop chi sai only popup thoi thi
	// se khong build UI
	// tuc la neu nhu khong phai dung popup only thi moi build UI
	if(!option.popupOnly){

		// old solution --
		//zElement.addClass('imageslider-linear').setInnerHTML(_mainHtml);

		// new solution --
		// tao ra 1 cai div tam wrap toan bo slider
		var tempDivEl = zjs('<div></div>').setInnerHTML(_mainHtml);
		var imagesliderContainerEl = zjs('<div></div>').addClass(sliderContainerClass);
		// tao ra thang wrap element luon
		var imagesliderWrapEl = zjs('<div></div>').addClass(sliderWrapClass);
		// neu can thiet phai clean html thi lam thoi
		if(option.cleanHtml)zElement.setInnerHTML('');
		// insert thang temp nay vao sau thang ul hoac ol
		var ulEl;
		if(zElement.find('> '+option.slideitem).count()){
			imagesliderWrapEl.appendTo(zElement);
		}else{
			ulEl = zElement.find('ul,ol,table,div').item(0);
			if(ulEl.count())imagesliderWrapEl.insertAfter(ulEl);
			else imagesliderWrapEl.appendTo(zElement);
		}
		// fix imageslider-wrap append into imageslider-container
		imagesliderContainerEl.insertAfter(imagesliderWrapEl);
		imagesliderWrapEl.appendTo(imagesliderContainerEl);
		if(option.wrapClass !== ''){
			imagesliderWrapEl.addClass(option.wrapClass);
		}
		/*tempDivEl.childReverse().eachElement(function(_tempDivChileEl){*/
		tempDivEl.child().eachElement(function(_tempDivChileEl){
			zjs(_tempDivChileEl).appendTo(imagesliderWrapEl);
		});
		// move info-wrap, nav-wrap out of container
		imagesliderContainerEl.find('.image-info-wrap').insertAfter(imagesliderContainerEl);
		imagesliderContainerEl.find('.nav-wrap').insertAfter(imagesliderContainerEl);
		// sau do remove di thang ul hoac ol la duoc
		zElement.find(option.slideitem).remove();
		if(ulEl)ulEl.remove();tempDivEl.remove();
		// add class cho thang cha ngoai cung
		zElement.addClass('imageslider-linear');
		// add class count image
		zElement.addClass('total-image-'+images.length);
		// add class neu nhu la horizontal dac biet horizontal-stack, horizontal-page, horizontal-stack-center, horizontal-page-center
		if(option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205)
			zElement.addClass('horizontal-stack');
		if(option.transition==203)
			zElement.addClass('horizontal-center');
		if(option.transition==204)
			zElement.addClass('horizontal-stack-center');
		if(option.transition==205)
			zElement.addClass('horizontal-page horizontal-page-center');
	}

	// va neu nhu sai popup onlye thi phai bind event vao day
	// bind event click cho may cai thang li
	else if(option.popupShowOnClick){

		zElement.find(option.slideitem).eachElement(function(element, index){
			zjs(element).setAttr('data-index', index).click(function(event){
				event.preventDefault();
				var self = zjs(this),
					index = self.getAttr('data-index');

				// xem coi cai li hien tai dang o index bao nhieu
				// thi shop popup o index bay nhieu
				slidePopupShow(index);
				// trigger thoi nao
				zElement.trigger('slider:click', {index:index});
			});
		});
	}

	// end prepare UI
	// ===========



	// - - - -

	// sau do se append may cai hinh thumb vao images nav
	var zNavImagesWrapEl = zElement.find('.nav-images-wrap'),
		zNavDotsWrapEl = zElement.find('.nav-dots-wrap'),
		zNavDotsEl = zElement.find('.nav-dots'),
		zNavImagesEl = zElement.find('.nav-images'),
		navImagesElMargin = 0,

		zImageViewContainer = zElement.find('.image-view'),
		zImageViewBorder = zElement.find('.image-view-border'),
		zImageViewWrap = zElement.find('.image-view-wrap'),
		zImageTitleEl = zElement.find('.image-title h4'),
		zImageDesEl = zElement.find('.image-description'),

		zImageCoverLinkContainer = zElement.find('.image-linkcover-wrap'),

		currentIndex = -1,
		currentTempIndex = -1,
		currentOrdering = -1,
		currentTempOrdering = -1,
		currentImageSrc = '',
		currentTempImageSrc = '',
		currentTitle = '',
		currentDes = '',
		currentLink = '',
		currentSequentDirect = 1,

		// tinh toan truoc 1 so buoc luon
		estimateNextIndex = -1,
		estimatePrevIndex = -1,
		estimateNextOrdering = -1,
		estimatePrevOrdering = -1,

		zImageViewElWidth = option.width,
		zImageViewElHeight = option.height,
		zImageViewElOriHeight = zImageViewElHeight,

		zIndexCounting = 1;

	// neu nhu co fullwidth, thi se lay width cua thang cha
	if(option.fullscreenWidth || option.fullWidth || option.usePercentWidth){
		zImageViewElWidth = option.fullscreenWidth ? zBody.width() : zElementParent.width();
	}

	// neu nhu co fullheight thi se lay height cua thang cha
	if(option.fullHeight){
		zImageViewElHeight = zElementParent.height();
	}

	// bay gio dang bi gap van de la
	// neu nhu ko get duoc height (vi xui xui)
	// thi phai get height bang cach khac
	// try to get parent width & height
	if(zImageViewElWidth<=0)zImageViewElWidth = zImageViewWrap.width();
	if(zImageViewElWidth<=0)zImageViewElWidth = zElementParent.width();
	if(zImageViewElWidth<=0){
		// cung lam thi choi get width cua window luon
		zImageViewElWidth = zBody.width();
	}
	if(zImageViewElHeight<=0)zImageViewElHeight = zImageViewWrap.height();
	if(zImageViewElHeight<=0)zImageViewElHeight = parseInt(zElementParent.height());
	if(zImageViewElHeight<=0){
		try{
			var cssString = zImageViewWrap.getCss();
			if(cssString){
				var heightInfo = cssString.match(/(^|[^a-z-])height:\s*(\d+)\s*px/);
				if(zjs.isArray(heightInfo))
					zImageViewElHeight = parseInt(heightInfo[2]);
			}
		}catch(err){}
	}
	if(zImageViewElHeight<=0){
		// cung lam thi set cung luon
		zImageViewElHeight = 376;
	}
	zImageViewElOriHeight = zImageViewElHeight;
	// neu nhu co fullheight
	// thi can gi cai thang original height nua?
	//if(option.fullHeight)zImageViewElOriHeight = '';


	// fix z-index cho info wrap
	//zImageViewContainer.setStyle({position:'relative',overflow:'hidden'}).height(zImageViewElHeight);
	// can phai fix height cho view container
	// boi vi thang view wrap nam trong thang view container
	// zImageViewContainer
	//   ->  zImageViewWrap
	// ma thang view wrap la absolute (khong co height)
	// cho nen phai set height cho thang container
	// neu nhu khong co fullheight thi moi set height vao
	if(!option.fullHeight)
		zImageViewContainer.height(zImageViewElHeight);
	// neu nhu khong co fullwidth thi set Width vao luon
	if(!option.fullscreenWidth && !option.fullWidth && !option.usePercentWidth){
		// hien tai neu nhu cho nay la may cai horizontal thi khong can set width
		// @todo: can xem lai cac truong hop khac
		// tien toi viec khong set width cho nay luon
		// transition: 0-none, 1-fade, 2-horizontal, 3-vertical
		if(option.transition <= 3){
			zImageViewContainer.width(zImageViewElWidth);
		}
	}

	zImageViewWrap.setStyle('position','absolute');
	if(option.imageViewClass !== ''){
		zImageViewContainer.addClass(option.imageViewClass);
	}

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
			// zImageViewWrap.setStyle('transition', 'transform ' + option.transitionTime + 'ms '+cubicbezier);
			zImageViewWrap.setStyle('transition-duration', option.transitionTime+'ms');
		},
		imageViewWrapCssTransitionTurnOff = function(){
			if(!flagSlideUseCssTransform)return;
			// zImageViewWrap.setStyle('transition', '');
			zImageViewWrap.setStyle('transition-duration', '0ms');
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
		// imageViewWrapCssTransitionTurnOn();
		zImageViewWrap.setStyle('transition', 'transform ' + option.transitionTime + 'ms '+cubicbezier);
	}


	// - - - -


	// init image - images each - - -
	zjs.foreach(images, function(image, index){
		if(option.popupOnly)return;
		// neu nhu image khong co src thi bo qua luon
		// neu nhu su dung contentSlide thi se bo qua
		if(image.src=='' && !option.contentSlide)return;

		// init navigation thumbnail
		if(option.navThumb){
			var _navImageHtml = option.navThumbTemplate;if(zjs.isFunction(_navImageHtml))_navImageHtml = _navImageHtml(index);
			_navImageHtml = _navImageHtml.format({index:index, src:image.src, title:image.title, description:image.description});
			var zNavImageEl = zjs(_navImageHtml)
				.addClass('nav-image')
				.setStyle('background-image','url('+image.src+')')
				.setAttr('data-index',index)
				.appendTo(zNavImagesEl)
				.on(option.hoverToSlide ? 'hover':'click', function(e,el){
					var index = zjs(el).getAttr('data-index').toInt();
					// neu nhu click vao thumbnail thi
					// go to (show) large image
					showLargeImage(index);
				});
			// add value into class title
			if(image.title)zNavImageEl.find('.title').setInnerHTML(image.title);
			// fix margin value
			navImagesElMargin = zNavImageEl.getStyle('margin-right',true);
			if(isNaN(navImagesElMargin) || !navImagesElMargin)
				navImagesElMargin = option.navImagesElMargin;
		}

		// init navigation dot
		if(option.navDot){
			var _navDotHtml = option.navDotTemplate;if(zjs.isFunction(_navDotHtml))_navDotHtml = _navDotHtml(index);
			_navDotHtml = _navDotHtml.format({index:index, src:image.src, title:image.title, description:image.description});
			var zNavDotEl = zjs(_navDotHtml)
				.addClass('nav-dot')
				.setAttr('data-index',index)
				.appendTo(zNavDotsEl)
				.click(function(e,el){
					var index = zjs(el).getAttr('data-index').toInt();
					showLargeImage(index);
				});
		}
		
		// init image holder
		// tuy vao tung loai transition ma image holder
		// se co cac cach sap xep khac nhau
		// - horizontal: cac image holder se xep theo hang ngang
		// - vertical: cac image holder se xep theo hang doc
		// - fade & none: cac image hodler se xep chong len nhau
		var _tempEl = zjs(_imageHoldHtml);
		_tempEl.appendTo(zImageViewWrap); 
		_tempEl.addClass('image'+index);
		_tempEl.setData('image-index', index);
		if(option.imageHoldClass !== ''){
			_tempEl.addClass(option.imageHoldClass);
		}
		var _imageItemEl = zjs(_imageItemHtml);
		_tempEl.append(_imageItemEl);

		// sau do se gan cai custom elements
		if(image.customEl){
			_imageItemEl.append(image.customEl);
		}
		var _tempElWidth = _tempEl.width();

		// tim kiem image src + lazysrc
		var _srcForTempEl = zElementIsInPopup?
								(image.srcpopup||image.srclarge||image.src):
								(_tempElWidth<250?(image.src):(image.srclarge||image.src));
		// xu ly lazyload
		// truong hop defaule
		if(!option.contentSlide){
			if(option.lazyloadImage){
				if(image.srclazy){
					_imageItemEl.setStyle('background-image', 'url('+_srcForTempEl+')');
				}
				image.lazyEl = _imageItemEl;
			}
			else{
				_imageItemEl.setStyle('background-image', 'url('+_srcForTempEl+')');
			}
		}
		// doi voi contentSlide
		// thi lazyimg se nam ben trong cai div content
		// cho nen se phai tim lazyEl
		else{
			var maybeLazyEl = _imageItemEl.find(lazyImgSelector);
			if(maybeLazyEl.count()){
				image.lazyEl = maybeLazyEl;
			}

			// chan chan la user dang thuc su muon sai lazyload
			if(option.lazyloadImage){
				// neu van chua co lazyElement thi se thu tim trong popup?
				if(!image.lazyEl){
					maybeLazyEl = _imageItemEl.find('[popupsrc], [srcpopup], [data-popupsrc], [data-srcpopup]');
					if(maybeLazyEl.count()){
						image.lazyEl = maybeLazyEl;
					}
				}
			}
		}

		if(option.lazyloadImage){
			_imageItemEl.addClass(imageholdloadingClass);
			// neu van chua co lazy image thi phai lay tu thang khac qua
			if(!image.srclazy){
				image.srclazy = _srcForTempEl;
			}
		}

		// sau do se chinh vi tri cho dung
		_tempEl.setStyle({top:0, left:0});
		if(option.transition==0 || option.transition==1)_tempEl.setStyle({opacity:0,'z-index':0}).hide();
		if(option.transition==1 && flagSlideUseCssTransform)_tempEl.show().setStyle('transition', 'opacity ' + option.transitionTime + 'ms '+cubicbezier);
		if(option.transition==2 || option.transition==201 || option.transition==202 || option.transition==203 || option.transition==204 || option.transition==205){
			_tempEl.left(zImageViewElWidth * index);
		}
		if(option.transition==3)_tempEl.top(zImageViewElHeight * index);

		
		// bo cai team vao trong images luon cho sau nay de truy cap
		images[index].el = _tempEl;
	});
	// end images each - - -



	// set width cho navigation thumbnail wrapper
	// neu nhu khong co thi remove luon
	if(!option.navThumb){
		zNavImagesWrapEl.remove();
	}else{

		var _navImageWidth = parseInt(zElement.find('.nav-image').width());
		zNavImagesEl.width((_navImageWidth+navImagesElMargin)*images.length);

		// ham fix de lam sao active image trong nav-images
		// luon luon xuat hien
		var fixActiveThumbAlwayShow = function(){
			var activeThumbEl = zNavImagesEl.find('.nav-image.active'),
				activeThumbElLeft = activeThumbEl.left(),
				navImagesElLeft = zNavImagesEl.left(),
				navImagesElWidth = zNavImagesEl.width(),
				navImagesWrapElWidth = zNavImagesWrapEl.width(),
				navImageWidth = zNavImagesWrapEl.find('.nav-image').width(),
				newNavImagesElLeft = 2 * (navImageWidth + navImagesElMargin) - activeThumbElLeft;

			if(newNavImagesElLeft>0)
				newNavImagesElLeft=0;
			if(newNavImagesElLeft<navImagesWrapElWidth-navImagesElWidth+navImagesElMargin)
				newNavImagesElLeft=navImagesWrapElWidth-navImagesElWidth+navImagesElMargin;
			if(zNavImagesEl.width()<zNavImagesWrapEl.width())
				newNavImagesElLeft=zNavImagesWrapEl.width()/2-zNavImagesEl.width()/2;

			// neu nhu khong support zjs.supportTransition thi se dung js thoi
			// hoi bi cui mia 1 xiu
			if(zjs.supportTransition){
				zNavImagesEl.left(newNavImagesElLeft);
			}else{
				zjs.timer({
					from:zNavImagesEl.left(),
					to:newNavImagesElLeft,
					onProcess:function(current){
						zNavImagesEl.left(current);
					},
					onFinish: function(from, to){
						zNavImagesEl.left(to);
					}
				}).run();
			};
		};
	};

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
			if(option.navButtonAutoDisable && estimateNextIndex == 0 && (
				option.transition == 201 
				|| option.transition == 202 
				|| option.transition == 204 
				|| option.transition == 205 ))
				newNavNextButton.addClass(navButtonDisableClass);
		};

	}
	else{
		zElement.find('.nav-back, .nav-next').remove();
	};

	// neu nhu su dung slider lam nav-thumb
	// thi se di init thoi hiu hiu
	if(option.navThumbSlider){
		var zNavThumbSliderWrapEl = zjs('<div></div>').appendTo(zElement).addClass('nav-slider-wrap');
		// console.log('_zElementOriHtml', _zElementOriHtml);
		// console.log('slideitem', option.slideitem);
		var zNavThumbSliderEl = zjs('<div></div>').setInnerHTML(_zElementOriHtml).appendTo(zNavThumbSliderWrapEl);
		zNavThumbSliderEl.addClass('imageslider-linear-navigation').makeSlider({
			slideitem: option.slideitem,
			theme:'linear',
			border: false,
			preload: false,
			autoplay: false,
			navButton: option.navThumbSliderNavButton,
			navThumb: false,
			navDot: false,
			showInfo: false,
			linkTitle: false,
			linkCover: false,
			contentSlide: option.contentSlide,
			usePercentWidth: option.navThumbSliderUsePercentWidth,

			transition: option.navThumbSliderTransition,
			transitionTime: option.navThumbSliderTransitionTime,
			transitionTimingfunction: option.navThumbSliderTransitionTimingfunction,

			autoHeight: option.navThumbSliderAutoHeight
		})
		// bind event luon
		.on('slider:click', function(event){
			// show cai large image thoi
			showLargeImage(event.getData().index);
		});

		// bind event theo huong nguoc lai
		// khi main slider change -> show focus vao cai nav-slider
		zElement.on('slider:change', function(event){
			zNavThumbSliderEl.find('.image-hold').removeClass('main-slider-active');
			var _imageHoldEl = zNavThumbSliderEl.find('.image-hold.image'+event.getData().index).addClass('main-slider-active');
			// tim cach move cai active qua cho dep dep coi ne
			// nhung khong phai khi nao cung can thiet phai move
			// cho nen phai test cai coi
			// la cai active co nam trong vung nhin thay hay khong?
			// neu nhu khong nam trong vung nhin thay thi moi can thiet move
			var _vwx = parseInt(zNavThumbSliderEl.find('.image-view-wrap').getData('real-pos')),
				_vww = zNavThumbSliderEl.width(),
				_ihx = _imageHoldEl.left(),
				_ihw = _imageHoldEl.width();

			// test cai thang active image hold khong nam trong khung hinh
			// thi moi can move nhe
			if(_vwx+_ihx < 0 || _vwx+_ihx+_ihw>_vww)
				zNavThumbSliderEl.slideTo(event.getData().index);
		});
	};



	// neu nhu co option linkTitle thi se bind khi hover
	if(option.linkTitle)
		zImageTitleEl.hover(function(){zElement.addClass(linktitlehoverClass)}, function(){zElement.removeClass(linktitlehoverClass)});


	// neu nhu co option linkCover thi se bind event khi hover
	if(option.linkCover)
		zImageCoverLinkContainer.hover(function(){zElement.addClass(linkcoverhoverClass)}, function(){zElement.removeClass(linkcoverhoverClass)});
	// con neu khong thi remove di luon cho nhe nguoi
	else
		zImageCoverLinkContainer.remove();



	// neu nhu mac dinh minh overflow hidden
	// thi gio tra ve overflow la ok!
	zElement.setStyle('overflow','visible');
	zElement.removeClass(sliderNotReadyClass);

	// - - - -

	// luu tru lai cai margin dang co
	var imagesliderWrapElHorizontalPadding = 0;

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



		// tinh toan so luong image/page
		var _imagePerPage = 1;
		if(option.transition >= 200){
			// xem coi voi cai width cua "imageslider-wrap" (imagesliderWrapEl.width())
			// thi chua duoc bao nhieu hinh, voi width 1 hinh la (zImageViewElWidth)
			_imagePerPage = parseInt((imagesliderWrapEl.width() / zImageViewElWidth)+0.1);
		}

		if(isNaN(_imagePerPage)){
			_imagePerPage = 1;
		}

		// fix index
		if(option.transition === 201 && _imagePerPage > 1 && index + _imagePerPage >= images.length){
			// console.log('old index', index);
			index = images.length - _imagePerPage;
		}



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
		index = getShownIndexKeyByNormalIndex(index, direction);
		// console.log('index after', index);

		// xem coi co dc thay doi hay khong
		// neu nhu dang touch slide thi se out ra
		if(touchSliding == 2 || typeof option.allowChange != 'function' || !option.allowChange(index)){
			// neu ma autoplay thi` play thoi
			if(option.autoplay)autoplayTimer.run();
			return;
		}


		// backup and then set new index
		currentTempIndex = currentIndex;
		currentIndex = index;
		currentTempOrdering = currentOrdering;
		currentOrdering = findOrderingNumberByShownIndex(index);


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

		// stop custom animation
		if(zjs.moduleTransition)
		zElement.find('.image'+currentTempIndex+' .'+option.customTransitionClass).stopTransition().unsetTransition();

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
				if(flagSlideUseCssTransform){
					zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', 1);
					if(images.length > 1)zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 0);
				}else{
					fadeInTransition.stop().run();
				};
				break;

			// slide left right
			case 2: // horizontal
			case 203: // horizontal-center
				// tinh toan ra position se phai move cai image-view-wrap toi
				// neu nhu cac image duoc sap xep sequent (theo thu tu) thi de roi
				// khi cac image khong duoc sap xep sequent thi bay gio phai
				// chinh lai vi tri cua thang image tiep theo cho chinh xac
				// neu nhu currentTempIndex = -1 : tuc la vua moi slide lan dau tien
				// thi cung coi nhu la sequent luon
				if(option.sequent || currentTempIndex<0){
					// zImageViewWrapRealElNextPos = -zImageViewElWidth * index;
					zImageViewWrapRealElNextPos = -zImageViewElWidth * currentOrdering;
				}else{
					// xem coi neu nhu thang nay nen dat ben phai hay ben trai
					currentSequentDirect = (currentTempIndex < currentIndex ? 1 : -1);
					if('direction' in moreparam)currentSequentDirect = (moreparam.direction == 'next' ? 1 : -1);

					// move thoi
					// neu nhu choi fullwidth thi chuyen qua % cho chac an luon
					zImageViewWrap.find('.image'+currentIndex).left(zImageViewWrap.find('.image'+currentTempIndex).left() + zImageViewElWidth * currentSequentDirect);

					// tinh toan next pos
					zImageViewWrapRealElNextPos = zImageViewWrapRealElNextPos - zImageViewElWidth * currentSequentDirect;

					//console.log('zImageViewWrapRealElNextPos: ', zImageViewWrapRealElNextPos);
					//console.log('zImageViewElWidth: ', zImageViewElWidth);

					// (lam them 1 chut de cho cai image tiep sau nua
					// no se tu dong chay vao dung vi tri ngay tu bay gio luon
					// de nhu trong truong hop viewport khong chi show 1 image
					// ma show nhieu hinh cung 1 luc vi du nhu 3 hinh
					// thi ben trai va phai cua cai hinh trung tam khong bi trong)
					// muon lam vay thi phai xem coi cai hinh tiep theo la gi
					var _currentTempIndexImageHoldLeft = zImageViewWrap.find('.image'+currentTempIndex).left();
					var _hakvalue = [
						0,
						[ 1,  2], // tien len 1
						[-1, -0], // lui lai 1
						[ 2,  3], // tien len 2
						[-2, -1], // lui lai 2
						[ 3,  4], // tien len 3
						[-3, -2], // lui lai 3
						[ 4,  5], // tien len 4
						[-4, -3], // lui lai 4
						[ 5,  6], // tien len 5
						[-5, -4], // lui lai 5
						[ 6,  7], // tien len 6
						[-6, -5], // lui lai 6
						[ 7,  8], // tien len 7
						[-7, -6], // lui lai 7
						[ 8,  9], // tien len 8
						[-8, -7], // lui lai 8
						[ 9, 10], // tien len 9
						[-9, -8], // lui lai 9
						[10, 11], // tien len 10
						[-10,-9], // lui lai 10
					];
					for(var _ti=1;_ti<_hakvalue.length;_ti++)
						if(images.length>_ti)
							zImageViewWrap.find('.image'+_utiFixIndexNumber(currentIndex + _hakvalue[_ti][0]*currentSequentDirect)).left(
										_currentTempIndexImageHoldLeft + _hakvalue[_ti][1]*zImageViewElWidth*currentSequentDirect
							);
				};

				// neu nhu trong lan dau tien chay
				// thi se fix cai thang hinh ngoai cung ben trai
				if(currentTempIndex < 0 && !option.sequent && images.length>1)
					zImageViewWrap.find('.image'+(images.length-1)).left(-zImageViewElWidth);


				// neu nhu khong cho lam hieu ung
				// thi se nhay cai bup vao luon
				// nhung van de la neu nhu transition auto use css3
				// thi cho nay chi can set left(top) value la no se tu make "transition animation"
				// nen phai turnoff truoc, sau do moi turnon lai sau
				if(notTransition){
					//console.log('notTransition: ', notTransition);
					imageViewWrapCssTransitionTurnOff();
					zImageViewWrapRealElMove(zImageViewWrapRealElNextPos, true);
					imageViewWrapCssTransitionTurnOn.delay(100);
				}

				// da co san css3 roi, chi viec set value thoi
				else if(flagSlideUseCssTransform)zImageViewWrapRealElMove(zImageViewWrapRealElNextPos, true);
				else floatTransition.stop().set({from: zImageViewWrapRealElPos, to: zImageViewWrapRealElNextPos}).run();
				break;

			// slide up down
			case 3:
				// tinh toan ra position se phai move cai image-view-wrap toi
				if(option.sequent || currentTempIndex<0){
					zImageViewWrapRealElNextPos = -zImageViewElHeight * index;
				}else{
					// xem coi neu nhu thang nay nen dat ben phai hay ben trai
					currentSequentDirect = (currentTempIndex < currentIndex ? 1 : -1);
					if('direction' in moreparam)currentSequentDirect = (moreparam.direction == 'next' ? 1 : -1);

					// move thoi
					zImageViewWrap.find('.image'+currentIndex).top(zImageViewWrap.find('.image'+currentTempIndex).top() + zImageViewElHeight * currentSequentDirect);
					zImageViewWrapRealElNextPos = zImageViewWrapRealElNextPos - zImageViewElHeight * currentSequentDirect;

					// (lam them 1 chut de cho cai image tiep sau nua
					// no se tu dong chay vao dung vi tri ngay tu bay gio luon
					// de nhu trong truong hop viewport khong chi show 1 image
					// ma show nhieu hinh cung 1 luc vi du nhu 3 hinh
					// thi ben trai va phai cua cai hinh trung tam khong bi trong)
					// muon lam vay thi phai xem coi cai hinh tiep theo la gi
					var _currentTempIndexImageHoldTop = zImageViewWrap.find('.image'+currentTempIndex).top();
					// tien len 1
					if(images.length>1)
						zImageViewWrap.find('.image'+_utiFixIndexNumber(currentIndex + 1*currentSequentDirect)).top(_currentTempIndexImageHoldTop + zImageViewElWidth * 2*currentSequentDirect);
					// lui lai 1
					if(images.length>2)
						zImageViewWrap.find('.image'+_utiFixIndexNumber(currentIndex - 1*currentSequentDirect)).top(_currentTempIndexImageHoldTop - zImageViewElWidth * 0*currentSequentDirect);
					// tien len 2
					if(images.length>3)
						zImageViewWrap.find('.image'+_utiFixIndexNumber(currentIndex + 2*currentSequentDirect)).top(_currentTempIndexImageHoldTop + zImageViewElWidth * 3*currentSequentDirect);
					// lui lai 2
					if(images.length>4)
						zImageViewWrap.find('.image'+_utiFixIndexNumber(currentIndex - 2*currentSequentDirect)).top(_currentTempIndexImageHoldTop - zImageViewElWidth * 1*currentSequentDirect);
				};

				// neu nhu trong lan dau tien chay
				// thi se fix cai thang hinh tren cung
				if(currentTempIndex < 0 && !option.sequent && images.length>1)
					zImageViewWrap.find('.image'+(images.length-1)).top(-zImageViewElHeight);


				// neu nhu khong cho lam hieu ung
				// thi se nhay cai bup vao luon
				// nhung van de la neu nhu transition auto use css3
				// thi cho nay chi can set left(top) value la no se tu make "transition animation"
				// nen phai turnoff truoc, sau do moi turnon lai sau
				if(notTransition){
					//console.log('notTransition: ', notTransition);
					imageViewWrapCssTransitionTurnOff();
					zImageViewWrapRealElMove(zImageViewWrapRealElNextPos, true);
					imageViewWrapCssTransitionTurnOn.delay(100);
				}

				// da co san css3 roi, chi viec set value thoi
				if(flagSlideUseCssTransform)zImageViewWrapRealElMove(zImageViewWrapRealElNextPos, true);
				else floatTransition.stop().set({from: zImageViewWrapRealElPos, to: zImageViewWrapRealElNextPos}).run();
				break;

			// slide horizontal-stack (& horizontal-page)
			// (van la move left-right nhung ma khac 1 chut,
			// la khi move toi cuoi cung thi se luon luon lam cho image cuoi cung
			// fix vua vao voi "imageslider-wrap"
			case 201:
			case 202:
			case 204:
			case 205:
				// tinh toan ra position se phai move cai image-view-wrap toi
				// neu nhu cac image duoc sap xep sequent (theo thu tu) thi de roi
				// khi cac image khong duoc sap xep sequent thi bay gio phai
				// chinh lai vi tri cua thang image tiep theo cho chinh xac
				// neu nhu currentTempIndex = -1 : tuc la vua moi slide lan dau tien
				// thi cung coi nhu la sequent luon
				if(option.sequent || currentTempIndex<0){

					// backup 1 cai position de xiu nua so sanh
					var zImageViewWrapRealElBackupPos = zImageViewWrapRealElNextPos;

					// tinh toan lai cai pos nay
					zImageViewWrapRealElNextPos = -zImageViewElWidth * index;
					// truoc tien se support voi truong hop sequent truoc
					// @todo: con cai khong sequent kho qua, se lam sau
					// xem coi tong cong chung nay hinh la het bao nhieu width (zImageViewElWidth * images.length)
					// xem coi hien tai "imageslider-wrap" width bao nhieu (imagesliderWrapEl.width())
					// vay thi cai left toi thieu ma dc move se la...			
					var _chenhLechInnerItemVSWrap = imagesliderWrapEl.width() - zImageViewElWidth * images.length;
					// fix 1 ti xiu lai width cua tung item cho dung
					if(imagesliderWrapElHorizontalPadding <= 0 && Math.abs(_chenhLechInnerItemVSWrap) < 5){
						zImageViewElWidth = imagesliderWrapEl.width() / images.length;
						_chenhLechInnerItemVSWrap = 0;
					}
					var _zImageViewWrapRealElMinPos = _chenhLechInnerItemVSWrap - imagesliderWrapElHorizontalPadding;
					//console.log('_zImageViewWrapRealElMinPos', _zImageViewWrapRealElMinPos);
					if(zImageViewWrapRealElNextPos < _zImageViewWrapRealElMinPos)
						zImageViewWrapRealElNextPos = _zImageViewWrapRealElMinPos;
					// xem coi co thay doi xiu nao khong?
					if(zImageViewWrapRealElBackupPos == zImageViewWrapRealElNextPos){
						// neu van khong thay doi thi se tang index len, va chay cai slide tiep theo luon
						// nhung ma trong truong hop tat ca cac hinh ma width van khong lon hon "imageslider-wrap"
						// thi thua luon, ke no
						if(!isInnerCall && _zImageViewWrapRealElMinPos < 0)
							return showLargeImage( ('direction' in moreparam && moreparam.direction == 'prev') ? index-1 : 0, moreparam, notTransition, notTriggerEvent, true);
					};
				}else{
					// xem coi neu nhu thang nay nen dat ben phai hay ben trai
					currentSequentDirect = (currentTempIndex < currentIndex ? 1 : -1);
					if('direction' in moreparam)currentSequentDirect = (moreparam.direction == 'next' ? 1 : -1);

					// move thoi
					// @todo: neu nhu choi fullwidth thi chuyen qua % cho chac an luon
					zImageViewWrap.find('.image'+currentIndex).left(zImageViewWrap.find('.image'+currentTempIndex).left() + zImageViewElWidth * currentSequentDirect);

					// tinh toan next pos
					zImageViewWrapRealElNextPos = zImageViewWrapRealElNextPos - zImageViewElWidth * currentSequentDirect;

					//console.log('zImageViewWrapRealElNextPos: ', zImageViewWrapRealElNextPos);
					//console.log('zImageViewElWidth: ', zImageViewElWidth);

					// (lam them 1 chut de cho cai image tiep sau nua
					// no se tu dong chay vao dung vi tri ngay tu bay gio luon
					// de nhu trong truong hop viewport khong chi show 1 image
					// ma show nhieu hinh cung 1 luc vi du nhu 3 hinh
					// thi ben trai va phai cua cai hinh trung tam khong bi trong)
					// muon lam vay thi phai xem coi cai hinh tiep theo la gi
					var _next1CurrentIndex = currentIndex + currentSequentDirect
					if(_next1CurrentIndex<0)_next1CurrentIndex = images.length - 1;
					if(_next1CurrentIndex>=images.length)_next1CurrentIndex = 0;
					if(images.length>1)zImageViewWrap.find('.image'+_next1CurrentIndex).left(zImageViewWrap.find('.image'+currentTempIndex).left() + zImageViewElWidth * 2 * currentSequentDirect);

					// neu nhu >= 5 hinh thi moi lam cai nay
					if(images.length >= 5){
						var _next2CurrentIndex = _next1CurrentIndex + currentSequentDirect
						if(_next2CurrentIndex<0)_next2CurrentIndex = images.length - 1;
						if(_next2CurrentIndex>=images.length)_next2CurrentIndex = 0;
						if(images.length>2)zImageViewWrap.find('.image'+_next2CurrentIndex).left(zImageViewWrap.find('.image'+currentIndex).left() + zImageViewElWidth * 2 * currentSequentDirect);
					};
				};

				// neu nhu trong lan dau tien chay
				// thi se fix cai thang hinh ngoai cung ben trai
				if(currentTempIndex < 0 && !option.sequent && images.length>1)
					zImageViewWrap.find('.image'+(images.length-1)).left(-zImageViewElWidth);


				// neu nhu khong cho lam hieu ung
				// thi se nhay cai bup vao luon
				// nhung van de la neu nhu transition auto use css3
				// thi cho nay chi can set left(top) value la no se tu make "transition animation"
				// nen phai turnoff truoc, sau do moi turnon lai sau
				if(notTransition){
					//console.log('notTransition: ', notTransition);
					imageViewWrapCssTransitionTurnOff();
					zImageViewWrapRealElMove(zImageViewWrapRealElNextPos, true);
					imageViewWrapCssTransitionTurnOn.delay(100);
				}

				// da co san css3 roi, chi viec set value thoi
				else if(flagSlideUseCssTransform)zImageViewWrapRealElMove(zImageViewWrapRealElNextPos, true);
				else floatTransition.stop().set({from: zImageViewWrapRealElPos, to: zImageViewWrapRealElNextPos}).run();
				break;

			// switch thoi
			default:
				zImageViewWrap.find('.image'+currentIndex).setStyle('opacity', 1).show();
				if(images.length > 1)zImageViewWrap.find('.image'+currentTempIndex).setStyle('opacity', 0).hide();
				break;
		};


		// change slide title, description
		if(option.linkTitle && currentLink!='')zImageTitleEl.setInnerHTML('<a href="'+currentLink+'">'+currentTitle+'</a>');
		else zImageTitleEl.setInnerHTML(currentTitle);
		if(option.linkCover && currentLink!='')zImageCoverLinkContainer.find('a').setAttr('href', currentLink);
		zImageDesEl.setInnerHTML(currentDes);


		// change avtive cho image slide
		zImageViewWrap.find('.image-hold').removeClass('active active-next active-back active-next2 active-back2 active-next3 active-back3 active-next4 active-back4 out-of-range');
		_utiImageHoldAddClass(index, 'active');
		if(images.length>1)_utiImageHoldAddClass(index+1, 'active-next');
		if(images.length>2)_utiImageHoldAddClass(index-1, 'active-back');
		if(images.length>3)_utiImageHoldAddClass(index+2, 'active-next2');
		if(images.length>4)_utiImageHoldAddClass(index-2, 'active-back2');
		if(images.length>5)_utiImageHoldAddClass(index+3, 'active-next3');
		if(images.length>6)_utiImageHoldAddClass(index-3, 'active-back3');
		if(images.length>7)_utiImageHoldAddClass(index+4, 'active-next4');
		if(images.length>8)_utiImageHoldAddClass(index-4, 'active-back4');





		// change active cho nav dot va nav thumbnail cho dung
		zElement.find('.nav-image, .nav-dot').removeClass('active');
		zElement.find('.nav-image[data-index='+index+'], .nav-dot[data-index='+index+']').addClass('active');


		// neu nhu co cho show navigation
		// thi moi can fix vi tri
		if(option.navThumb)fixActiveThumbAlwayShow();


		// bat dau run custom animation
		if(zjs.moduleTransition)
		zImageViewWrap.find('.image'+currentIndex+' .'+option.customTransitionClass).playTransition({autoplay:false});



		// cung xong xuoi moving image roi
		// gio se tinh toan lai cai prev & next index luon
		// --
		estimatePrevIndex = currentIndex-1;
		estimateNextIndex = currentIndex+1;

		// truong hop horizontal-stack-center (204)
		// truong hop horizontal-page-center (205)
		if(option.transition==204 || option.transition==205){
			// add class cua 2 cai thang out of range
			_utiImageHoldAddClass(index-1, 'out-of-range');
			_utiImageHoldAddClass(index+_imagePerPage, 'out-of-range');
		};

		// truong hop horizontal-stack
		if(option.transition==201 || option.transition==204){
			// kiem tra coi thang next co thuc su la next duoc khong?
			// boi vi bi thang nam cuoi cung giu chan lai
			if(estimateNextIndex + _imagePerPage > images.length)
				estimateNextIndex = 0;
		}

		// truong hop "horizontal-page / horizontal-page-center" move nguyen 1 page
		if(option.transition == 202 || option.transition == 205){
			// xem coi co tong cong bao nhieu page (images.length)
			// va voi cai page hien tai (index)
			// thi phai move them (_imagePerPage) page nua moi du
			estimatePrevIndex = index - _imagePerPage;
			estimateNextIndex = index + _imagePerPage;
			// nhung neu nhu index ve < 0 thi cho di lai tu dau kia
			if(estimatePrevIndex + _imagePerPage <= 0){
				estimatePrevIndex = images.length - _imagePerPage;
			}
			// con neu nhu gan ve toi, thi cho ve toi luon
			else if(estimatePrevIndex < 0){
				estimatePrevIndex = 0;
			}
			// nhung neu nhu index vuoi qua tong so page, thi cho di lai tu dau luon
			// if(estimateNextIndex>=images.length){
				// estimateNextIndex = 0;
			// }
			// con neu nhu hoi vuot qua so so thoi, thi doi lai 1 xiu
			// else 
			if(estimateNextIndex + _imagePerPage > images.length){
				// estimateNextIndex = images.length - _imagePerPage;
				estimateNextIndex = 0;
			}
		}


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
			option.onChange(moreparam);
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

		// console.log('lazyloadImage');
		// lazyload
		if(option.lazyloadImage){
			var il;
			// console.log(currentIndex, _imagePerPage);
			for(il=0;il<_imagePerPage;il++){(function(){
				// console.log('il', il);
				var ic = currentIndex+il;
				if(!images[ic] || images[ic].lazyloaded)
					return;

				// console.log('lazy load index: ', ic, _imagePerPage);
				images[ic].lazyloaded = true;
				var lazyEls = images[ic].lazyEl || images[ic].customEl;

				// console.log('lazyEls', lazyEls.item(0,true) );
				if(!lazyEls)
					return;
				
				lazyEls.eachElement(function(lazyEl){
					lazyEl = zjs(lazyEl);
					// console.log('images[ic]', images[ic]);
					zjs.loadImage({
						image: images[ic].srclazy,
						onError: function(image){},
						onLoaded: function(image){
							(function(){
								// console.log('loaded: ', ic);
								lazyEl.removeClass(imageholdloadingClass);
								images[ic].el.find('.image-item').removeClass(imageholdloadingClass);
								if(images[ic].customEl){
									// console.log('customEl', ic, images[ic].customEl.item(0, true));
									images[ic].customEl.removeClass(imageholdloadingClass);
								}
								if(lazyEl.is('img')){
									lazyEl.setAttr('src', image.src);
								}
								else{
									lazyEl.setStyle('background-image', 'url('+image.src+')');
								}

								if(option.autoHeight){
									_runfixreheight();
								}

							}).delay(option.lazyloadDelay);
						}
					});
				});

			})();}
			// endfor
		}
		// neu khong lazyload thi se fix autoheight
		// truong hop autoheight
		else if(option.autoHeight){
			_runfixreheight();
			/*
			//horizontal
			if(option.transition === 1 || option.transition === 2){
				fixreheight(currentIndex);
			}

			//horizontal-center
			if(option.transition === 203){ 
				(function(){
					var indexNeedToFix = currentIndex;
					(function(){
						fixreheight(indexNeedToFix);
					}).delay(option.transitionTime+100);
				})();
			}
			*/
		}

	};

	var _runfixreheight = function(){
		//horizontal
		if(option.transition === 1 || option.transition === 2){
			fixreheight(currentIndex);
		}

		//horizontal-center
		if(option.transition === 203){ 
			(function(){
				var indexNeedToFix = currentIndex;
				(function(){
					fixreheight(indexNeedToFix);
				}).delay(option.transitionTime+100);
			})();
		}
	};

	// ham ho tro fix lai index cho dung
	var _utiFixIndexNumber = function(num){
		if(num>=images.length)num=num-images.length;
		if(num<0)num=images.length+num;
		return num;
	};

	// cai ham ho tro add class vo .image-hold
	var _utiImageHoldAddClass = function(_index, classname){
		// fix index truoc
		_index = _utiFixIndexNumber(_index);
		// truong hop dat biet can phai fix
		if(_index === 0){
			if(images.length === 2 && classname === 'active-next')classname = 'active-back';
			if(images.length === 3 && classname === 'active-next')classname = 'active-back2';
		}
		if(_index === 2){
			if(images.length === 3 && classname === 'active-back')classname = 'active-next2';
		}
		// add class
		zImageViewWrap.find('.image-hold.image'+_index).addClass(classname);
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
		option.transition==201 || 
		option.transition==202 || 
		option.transition==203 || 
		option.transition==204 || 
		option.transition==205 || 
		option.transition==3) && 
		(zjs.isTouchDevice() || option.dragSlide)
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
				if(index!=currentIndex){showLargeImage(index, {direction:index>currentIndex ? 'next' : 'prev'})}
				// con neu van giu nguyen index thi se move ve dung vi tri
				else{zImageViewWrapRealElMove(-zImageViewElWidth * index)};
			}
		});

	};

	// - - - - - - - - - - -

	var refreshSlideFirst = false;
	// ham lam nhiem vu refresh lai slide
	var refreshSlide = function(){
		if(!refreshSlideFirst){
			refreshSlideFirst = true;
			return;
		};

		// slide toi thang hien tai
		showLargeImage(currentIndex, {}, true, true, true);
		//function(index, moreparam, notTransition, notTriggerEvent, isInnerCall)

		// truoc mat thi trigger window resize luon
		zWindow.trigger('resize');
	};


	// - - - -

	var slideFilter = function(slideItemFilterHandler){
		// just loop through the images and update the show/hide status
		var i;for(i=0;i<images.length;i++){
			var isShown = true;
			if(zjs.isFunction(slideItemFilterHandler)){
				var handlerResult = slideItemFilterHandler(images[i]);
				if(typeof handlerResult !== 'undefined')
					isShown = handlerResult;
			}
			// update it to rawimage
			images[i].isShown = isShown;
		};
		generateShownImageIndexsFromImages();
		applyFilterToSlider();
	};

	var applyFilterToSlider = function(){
		// step 1: hide/show the image-hold & navdot
		var zNavDotDotsEl = false;
		if(option.navDot){
			zNavDotDotsEl = zNavDotsEl.find('.nav-dot');
			if(!zNavDotDotsEl.count())
				zNavDotDotsEl = false;
		}
		var i;for(i=0;i<images.length;i++){
			if(images[i].isShown){
				images[i].el.removeClass(imageholdhideClass);
				zNavDotDotsEl.item(i).show();
			}else{
				images[i].el.addClass(imageholdhideClass);
				zNavDotDotsEl.item(i).hide();
			}
		}
		// step 2: refresh slider
		refreshSlide();
	};

	// ham co nhiem vu convert index => shownindex
	var getShownIndexKeyByNormalIndex = function(index, direction){
		direction = direction || 1;
		
		// do nothing;
		if(shownImageIndexs.length == images.length)
			return index;

		var shownIndex = shownImageIndexs.indexOf(index);
		// if the index in the shown list, just return it
		if(shownIndex>-1)
			return index;
		// if it not in the list, need to find the: 
		// - next one (if direction > 0)
		// - previous one (if direction < 0)
		var i;
		if(direction>0){
			if(index>=images.length){
				index = 0;
			}
			for(i=0;i<shownImageIndexs.length;i++){
				if(shownImageIndexs[i] > index){
					return shownImageIndexs[i];
				}
			}
			return getShownIndexKeyByNormalIndex(0, direction);
		}
		if(direction<0){
			if(index<0){
				index = images.length - 1;
			}
			for(i=shownImageIndexs.length-1;i>=0;i--){
				if(shownImageIndexs[i] < index){
					return shownImageIndexs[i];
				}
			}
			return getShownIndexKeyByNormalIndex(images.length - 1, direction);
		}
		// default
		// return (direction>0) ? shownImageIndexs[0] : shownImageIndexs[shownImageIndexs.lenght - 1];
	};

	// ham co nhiem vu tim ra vi tri (ordering) cua shownindex
	var findOrderingNumberByShownIndex = function(shownIndex){
		return shownImageIndexs.indexOf(shownIndex);
	};


	// - - - - 



	// ham lam nhiem vu disable / enable slide
	var slideDisable = function(forceAutoOption){
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

		// support lazyloading:
		// if there're some img with lazy src,
		// we need to show them all
		// 
		slideRawContentEl.find(lazyImgSelector).eachElement(function(el){
			var imgEl = z(el);
			// try to find src lazy
			var srclazy = imgEl.getAttr('data-lazy-src','');
			if(srclazy=='')srclazy = imgEl.getAttr('data-lazysrc','');
			if(srclazy=='')srclazy = imgEl.getAttr('data-srclazy','');
			if(srclazy=='')srclazy = imgEl.getAttr('srclazy','');
			if(srclazy=='')srclazy = imgEl.getAttr('srclazy','');
			if(srclazy=='')srclazy = imgEl.getAttr('data-lazy-src','');
			// set to src
			if(srclazy != '')imgEl.setAttr('src', srclazy);
		});
	};

	var slideEnable = function(forceAutoOption){
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
			var width = option.fullscreenWidth ? zBody.width() : zElementParent.width(),
				winWidth = zWindow.width();

			// new feature
			// tu dong turn on/off cai slide dua vao width
			// nhung voi dieu kien la khong phai dang bi force disable thoi
			// if(!slideIsForceDisable && !slideIsForceEnable){
				if(option.autoDisableWhenWidthLessThan > 0){
					if(width <= option.autoDisableWhenWidthLessThan && slideIsEnabled === true){
						slideDisable();
					}else if(width > option.autoDisableWhenWidthLessThan && slideIsEnabled === false){
						slideEnable();
					};
				};
				if(option.autoDisableWhenWidthLargerThan > 0){
					if(width >= option.autoDisableWhenWidthLargerThan && slideIsEnabled === true){
						slideDisable();
					}else if(width < option.autoDisableWhenWidthLargerThan && slideIsEnabled === false){
						slideEnable();
					};
				};

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


	// IMPLEMENT AUTO WIDTH 
	// support full width && fullscreen width, hoac la full height
	if(option.fullscreenWidth || option.fullWidth || option.fullHeight)
	{

		if(option.fullscreenWidth || option.fullWidth)zElement.addClass('fullwidth');
		if(option.fullHeight)zElement.addClass('fullheight');

		var fixrewidth = function()
		{	
			var width = option.fullscreenWidth ? zBody.width() : zElementParent.width();

			// neu nhu slide disable luon roi thi thoi, ko can lam tiep
			if(!slideIsEnabled)
				return;

			// voi slide horizontal / center, can fix lai width
			// ================================================
			// @todo: looking here
			if(option.transition===2 || option.transition===203){

				// tinh toan lai zImageViewWrapRealElNextPos trong truong hop ko su dung sequent
				if(!option.sequent)
					zImageViewWrapRealElNextPos = zImageViewWrapRealElNextPos * width / zImageViewElWidth;

				// tinh toan lai left cua tung thang image hold
				if(!option.usePercentWidth){
					zImageViewWrap.find('.image-hold').eachElement(function(el, index){
						var ordering = findOrderingNumberByShownIndex(index);
						if(ordering<0)return;
						
						var zEl = zjs(el);
						if(!option.sequent)
							zEl.left( zEl.left() * width / zImageViewElWidth );
						else
							zEl.left( width * ordering );
					});
				}

				// fix thang viewwrap
				zImageViewWrapRealElMove(zImageViewWrapRealElNextPos);
			};
			

			// gio moi update cai viewWidth
			zImageViewElWidth = width;

			// xem coi co option fix height khong
			// neu co thi fix luon
			var _backUpHeight = zImageViewElHeight;
			if(option.scaleHeightWhenWidthLessThan > 0){
				if(zImageViewElWidth <= option.scaleHeightWhenWidthLessThan){
					if(option.fullHeight)zElement.removeClass('fullheight');
					zImageViewElHeight = zImageViewElOriHeight * zImageViewElWidth / option.scaleHeightWhenWidthLessThan;
				}else{
					// check coi co option fullheight khong?
					if(option.fullHeight){
						zElement.addClass('fullheight');
						// khong co cap nhat image-view theo thang original height lam gi ca
						// boi vi thang original la theo px
						zImageViewElHeight = '';
						// nhung ma cung khong quen cap nhat thang original height
						// cho truong hop resize cho dung
						zImageViewElOriHeight = zElementParent.height();
					}
					else zImageViewElHeight = zImageViewElOriHeight;
				};
				zImageViewWrap.height(zImageViewElHeight);
				zImageViewContainer.height(zImageViewElHeight);
			};

			// voi slide vertical
			if(option.transition===3){

				// tinh toan lai zImageViewWrapRealElNextPos trong truong hop ko su dung sequent
				if(!option.sequent)
					zImageViewWrapRealElNextPos = zImageViewWrapRealElNextPos * zImageViewElHeight / _backUpHeight;

				// tinh toan lai top cua tung thang image hold
				zImageViewWrap.find('.image-hold').eachElement(function(el, index){
					var zEl = zjs(el);
					if(!option.sequent)
						zEl.top( zEl.top() * zImageViewElHeight / _backUpHeight );
					else
						zEl.top( zImageViewElHeight * index );
				});

				// fix thang viewwrap
				zImageViewWrapRealElMove(zImageViewWrapRealElNextPos);
			};


			// refresh luon
			if(option.transition==2 
				|| option.transition==203 
				|| option.transition==3
			){
				// slide toi thang hien tai
				showLargeImage(currentIndex, {}, true, true, true);
			};

		};

		// first fix
		zWindow.on('resize',function(){
			fixrewidth.delay(500)
		}).trigger('resize');

		// neu nhu co scrollbar thi phai fix them 1 lan nua
		if(isBodyScrollbar())fixrewidth.delay(500);

	};



	// voi horizontal-stack, horizontal-page, horizontal-stack-center, horizontal-page-center
	// if(option.transition==201 || option.transition==202 || option.transition==204 || option.transition==205){
	if(option.usePercentWidth)
	{

		var fixrewidthPercent = function()
		{	
			if(option.transition <= 1){
				return;
			}

			// console.log('fixrewidthPercent');
			// cap nhat lai cai width quan trong
			zImageViewElWidth = zImageViewContainer.width();

			// di toi
			var _lastLeft = 0;
			//for(var i = 0;i<images.length;i++){
			for(var i = 0;i<shownImageIndexs.length;i++){
				var ordering = shownImageIndexs[i];
				// console.log('ordering', ordering);

				//get ra cai left va width hien tai
				var zEl = zjs(images[ordering].el);
				// console.log('el', images[ordering].el.item(0,true));
				// console.log('_lastLeft', _lastLeft);

				zEl.left(_lastLeft);
				_lastLeft += zEl.width();
			}

			// fix lien vi tri left current
			(function(){
				// slide toi thang hien tai
				showLargeImage(currentIndex, {}, true, true, true);
			}).delay(1);

		};

		// first fix
		zWindow.on('resize', fixrewidthPercent);
		fixrewidthPercent.delay(500);

	};


	var fixreheight = function(){};
	if(option.autoHeight){
		var lastReHeight = -1;
		fixreheight = function(indexNeedToFix)
		{	
			if(!slideIsEnabled)return;
			if(indexNeedToFix != currentIndex)return;

			// tim ra cai height cao nhat
			var maxHeight = 0;

			
			if(option.transition==0 
			|| option.transition==1 
			|| option.transition==2
			|| option.transition==203 )
			{	
				if(images[currentIndex] && ('customEl' in images[currentIndex])){
					var _he = images[currentIndex].customEl.height();
					if(_he>maxHeight)
						maxHeight = _he;
				}
			}


			if(option.transition==201 
			|| option.transition==202 
			|| option.transition==204 
			|| option.transition==205)
			{
				if(option.contentSlide){
					zjs.foreach(images, function(_image){
						if(typeof _image.customEl == 'undefined')return;
						var _he = _image.customEl.height();
						if(_he>maxHeight)
							maxHeight = _he;
					});
				}
			}

			if(maxHeight && maxHeight != lastReHeight){
				lastReHeight = maxHeight;
				// zElement.height(maxHeight);
				imagesliderWrapEl.height(maxHeight);
				zImageViewContainer.height(maxHeight);
				zImageViewWrap.height(maxHeight);

				// trigger event
				zElement.trigger('slider:fixheight');
			}

		};

		// first fix
		zWindow.on('resize', function(){fixreheight(currentIndex)});
		fixreheight(currentIndex);
		(function(){fixreheight(currentIndex)}).delay(500);
	}





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
	if(!option.navDot && !option.navThumb && (!option.navButton || option.navButtonParentIsRoot))zElement.find('.nav-wrap').remove();
	if(!option.playButton)zElement.find('.play-wrap').remove();
	if(!option.border)zElement.find('.image-view-border').remove();

	// can nhac, vi contentSlide cung khong lien quan lam den show info
	// co info thi cu show ra thoi.
	// if(option.contentSlide || !option.showInfo)zElement.find('.image-info-wrap').remove();
	if(!option.showInfo)zElement.find('.image-info-wrap').remove();



	// - - -
	// fix navdot trong truong hop horizontal-page
	// fix cai center trong truong hop horizontal-stack-center
	if((option.transition==202 && option.navDot) || option.transition==204 || option.transition==205){
		zWindow.on('resize',function(){

			// xem coi voi cai width cua "imageslider-wrap" (imagesliderWrapEl.width())
			// thi chua duoc bao nhieu hinh, voi width 1 hinh la (zImageViewElWidth)
			//var _imagePerPage = parseInt((imagesliderWrapEl.width() - imagesliderWrapElHorizontalPadding) / zImageViewElWidth);
			// cho nay thi dung la khong can phai tinh toan tru ra lam gi ca, vi can tinh ra gan dung nhat
			var _imagePerPage = parseInt(imagesliderWrapEl.width() / zImageViewElWidth);

			// gio se quyet dinh xem coi show va hide cai dot nao?
			if((option.transition==202 || option.transition==205) && option.navDot){
				zNavDotsEl.find('.nav-dot').eachElement(function(eldot, index){
					if(index % _imagePerPage == 0)zjs(eldot).show();
					else zjs(eldot).hide();
				})
			}
			// quyet dinh coi move left bao nhieu?
			if(option.transition==204 || option.transition==205){
				var _margin = (imagesliderWrapEl.width() - _imagePerPage*zImageViewElWidth)/2;
				imagesliderWrapElHorizontalPadding = _margin*2;
				imagesliderWrapEl.setStyle({paddingLeft: _margin, paddingRight: _margin});
			}

		}).trigger('resize');
	};
	
	



	// - - - -

	var popupTimer1 = false,
		popupTimer2 = false;

	var isPopupShowed = false;

	// ham lam nhiem vu show popup (alias voi main slider)
	var slidePopupShow = function(defaultIndex){
		if(!option.popup)return;
		if(isPopupShowed)return;
		isPopupShowed = true;

		try{
		defaultIndex = (defaultIndex !== 0) ? (defaultIndex || -1) : 0;
		// neu nhu index la -1 thi phai tim ra cai current index
		if(defaultIndex < 0 || defaultIndex >= images.length)
			defaultIndex = currentIndex;
		}catch(err){
			defaultIndex = currentIndex;
		};
		
		// co 2 cach:
		// + 1 la su dung module ui.popup => ok hon, vi ui.popup xu ly ra nhieu truong hop roi
		// + 2 la se tu handle cai popup => mat cong hon
		var usePopupModule = zjs.isObject(zjs.moduleUiPopupOption);


		// dau tien la append vao body cai page cover
		var popupPageCoverEl;
		if(!usePopupModule){
			popupPageCoverEl = zjs(_popupPageCoverHtml).appendTo(document.body);
			popupPageCoverEl.addClass(option.popupPageCoverClass);	
		}

		// sau do append vao body cai popup slide container
		var popupContainerEl = zjs(_popupContainerHtml).appendTo(document.body),
			popupCloseButtonEl = popupContainerEl.find('.imageslider-popup-close-button'),
			inpopupSliderEl = popupContainerEl.find('.inpopup-imageslider');

		popupContainerEl.addClass(option.popupContainerClass);
		if(option.popupImagesliderPopupWrapClass){
			popupContainerEl.find('.imageslider-popup-wrap').addClass(option.popupImagesliderPopupWrapClass);
		}

		// dong thoi add vao body 1 cai class thong bao la show popup
		zBody.addClass(bodypopupshowClass);

		// xem coi co cho phep su dung key board khong?
		if(option.popupAllowKeyboard)
			inpopupSliderEl.addClass('allow-keyboard');

		// luu lai 2 cai element moi tao de ma sau nay close
		zElement.setData('popupsliderels_popupPageCoverEl', popupPageCoverEl);
		zElement.setData('popupsliderels_popupContainerEl', popupContainerEl);
		zElement.setData('popupsliderels_inpopupSliderEl', inpopupSliderEl);
		inpopupSliderEl.setData('parent_SliderEl', zElement);

		// bay gio moi bat dau show cai popup len
		if(usePopupModule){
			popupContainerEl.makePopup({
				closebutton: false, // se su dung custom close button chu khong can default popup button
				closethenremove: true,
				pagecover: true,
				clickout: option.popupHideOnClickOut,
				pressEsc: option.popupAllowKeyboard,
				fade: true,
				fadeTime: option.popupAnimateTime,
				animate: option.popupAnimate,
				animateTime: option.popupAnimateTime,
				animateName: option.popupAnimateName,
				scrollPopup: option.popupScrollPopup, 		// false | true | "mobileOnly"
			}).on('ui:popup:hide', function(){
				isPopupShowed = false;
			});
		}
		// neu khong su dung module thi tu handler
		else{
			// truong hop ko 
			// neu nhu co animate thi cover luon luon la fade
			// va dong thoi coi nhu popup container la zui-popup luon
			popupPageCoverEl.fadeIn({
				time: option.popupAnimateTime
			});
			if(option.popupAnimate)
				popupContainerEl.addClass('zui-popup hide-before-animate '+option.popupAnimateName).setStyle('animation-duration', option.animateTime+'ms');
		}

		// bind event khi ma make slider thanh cong roi thi moi show ra
		inpopupSliderEl.on('slider:ready', function(){
			// stop lai cai thang autoplay cua main slider
			slidePause();
			// chinh thuc show ra popup container
			if(usePopupModule){
				popupContainerEl.popupShow();
			}
			// neu khong su dung module thi tu handler
			else{
				if(option.popupAnimate){
					popupContainerEl.removeClass('hide-before-animate');
					// stop timer truoc do cho chac an
					window.clearTimeout(popupTimer1);window.clearTimeout(popupTimer2);
					popupContainerEl.addClass('showing zanimate zanimate-start');
					popupTimer1 = (function(){popupContainerEl.addClass('zanimate-end')}).delay(option.popupAnimateTime);
					popupTimer2 = (function(){popupContainerEl.removeClass('showing zanimate zanimate-start zanimate-end')}).delay(option.popupAnimateTime + 100);
				}else{
					popupContainerEl.fadeIn();
				};
			}

			// gio moi di goi callback cua cai thang popup cha
			zElement.trigger('slider:popup:show', {index: defaultIndex, info: images[defaultIndex]});
		})
		.on('slider:fixheight', function(){
			if(usePopupModule){
				popupContainerEl.popupRefresh();
			}
		});

		// fix new option cho inpopup 1 xiu
		var inpoupOption = zjs.extend(zjs.clone(option), {
			// cai nay chac chan la se khong co popup,...
			popup: false,
			popupOnly: false,
			popupShowOnClick: false,
			popupHideOnClickOut: false,
			popupCloseButton: false,

			// start index
			startIndex: 			defaultIndex,

			// option cho slider
			lazyloadImage: 			option.popupLazyloadImage,
			lazyloadDelay: 			option.popupLazyloadDelay,
			autoplay:				option.popupAutoplay,
			autoplayTime:			option.popupAutoplayTime,
			playButton:				option.popupPlayButton,

			// cac option ve navigation
			navButton: 				option.popupNavButton,
			navButtonParent: 		option.popupNavButtonParent,
			navButtonParentIsRoot: 	option.popupNavButtonParentIsRoot,
			navThumb: 				option.popupNavThumb,
			navDot: 				option.popupNavDot,
			showInfo: 				option.popupShowInfo,
			linkTitle: 				option.popupLinkTitle,
			linkCover: 				option.popupLinkCover,
			sequent: 				option.popupSequent,
			fullWidth: 				option.popupFullWidth,
			fullscreenWidth: 		option.popupFullscreenWidth,

			contentSlide: 			option.popupContentSlide,
		});

		// bay gio moi di fix may cai inpopup dac biet
		if(inpoupOption.popupTransition !== false)inpoupOption.transition = inpoupOption.popupTransition;
		if(inpoupOption.popupTransitionTime !== false)inpoupOption.transitionTime = inpoupOption.popupTransitionTime;
		if(inpoupOption.popupTransitionTimingfunction !== false)inpoupOption.transitionTimingfunction = inpoupOption.popupTransitionTimingfunction;

		// gio thi make slider thoi
		(function(){
			// thay het html cho cai popup-wrap
			inpopupSliderEl.setInnerHTML(_zElementOriHtml);
			inpopupSliderEl.setData(isPopupSliderKey, true).makeSlider(inpoupOption);
		}).delay(100);

		// bind 1 de close popup
		if(option.popupHideOnClickOut && !usePopupModule){
			popupPageCoverEl.click(function(event){
				event.preventDefault();
				slidePopupHide();
			});
		}

		if(option.popupCloseButton){
			popupCloseButtonEl.click(function(event){
				event.preventDefault();
				slidePopupHide();
			});
		}else{
			popupCloseButtonEl.remove();
		}


		// doi 1 chut cho browser on dinh da roi moi effect ra
		//(function(){
			//popupPageCoverEl.removeClass('hide').addClass('show');
			//popupPageCoverEl.fadeIn();
		//}).delay(1000);
	};


	// handler click event on slider
	var handlerClickToShowPopup = function(event)
	{

		var autoChangeSlide = false;

		if(flagJustDoDrag){
			flagJustDoDrag = false;
			return;
		};


		if(
			// chi duoc prevent default khi ma khong phai la 1 the a
			(!zjs(event.target()).is('a[href]') && zjs(event.target()).findUp('a[href]').count()<=0)
			&&
			// va khong phai la input
			(!zjs(event.target()).is('input,textarea,label') && !zjs(event.target()).is('textarea'))
		){
			event.preventDefault();
			autoChangeSlide = true;
		};

		// xem coi cai hinh hien tai dang o index bao nhieu
		// thi shop popup o index bay nhieu
		var _clickIndex = -1,
			_clickTargetEl = event.target();

		// find up coi tim duoc cai thang image hold hay ko?
		if(_clickTargetEl)
			_clickTargetEl = zjs(_clickTargetEl);

		if(!_clickTargetEl.hasClass('image-hold'))
			_clickTargetEl = _clickTargetEl.findUp('.image-hold');

		if(!_clickTargetEl.hasClass('image-hold'))
			_clickTargetEl = false;

		if(_clickTargetEl)
			_clickIndex = parseInt(_clickTargetEl.getData('image-index', -1));

		if(_clickIndex>=0){

			// bind event auto show popup on click
			if(option.popup && option.popupShowOnClick)
				slidePopupShow(_clickIndex);

			// trigger thoi nao
			zElement.trigger('slider:click', {index:_clickIndex}, function(event){
				// neu nhu khong co gi thay doi thi se goi thang show large image cho nay
				if(option.transition==203 && autoChangeSlide && !event.isDefaultPrevented){
					showLargeImage(_clickIndex);
				};
			});
		}
		else{
			// bind event auto show popup on click
			if(option.popup && option.popupShowOnClick)
				slidePopupShow();
		};
	};
	// test here >>>>>>
	zImageViewWrap.click(handlerClickToShowPopup);
	zImageCoverLinkContainer.click(handlerClickToShowPopup);
	// ----



	// ham lam nhiem vu close popup
	var slidePopupHide = function(){
		if(!option.popup)return;
		if(!isPopupShowed)return;
		isPopupShowed = false;

		// get ra het
		var popupPageCoverEl = zElement.getData('popupsliderels_popupPageCoverEl'),
			popupContainerEl = zElement.getData('popupsliderels_popupContainerEl'),
			inpopupSliderEl = zElement.getData('popupsliderels_inpopupSliderEl');

		// xem coi show popup ra bang cach nao?
		var usePopupModule = zjs.isObject(zjs.moduleUiPopupOption);

		// stop neu nhu no co autoplay
		if(inpopupSliderEl)
			inpopupSliderEl.slidePause();

		// bat dau hide popup
		if(usePopupModule){
			popupContainerEl.on('ui:popup:hide', function(){
				zBody.removeClass(bodypopupshowClass);
			}).popupHide();
		}
		// neu nhu khong su dung module thi se tu xu
		else{
			// neu nhu co animate thi se run truoc khi remove
			if(popupContainerEl){
				if(option.popupAnimate){
					window.clearTimeout(popupTimer1);window.clearTimeout(popupTimer2);
					popupContainerEl.addClass('hiding animate animate-start');
					popupTimer1 = (function(){popupContainerEl.addClass('animate-end')}).delay(option.popupAnimateTime);
					popupTimer2 = (function(){popupContainerEl.removeClass('hiding animate animate-start animate-end');popupContainerEl.remove()}).delay(option.popupAnimateTime + 100);
				}
				// con khong thi cung remove tu tu bang js
				else
					popupContainerEl.removeSlow();
			};

			// remove cover thi luon luon 1 hieu ung thoi thoi
			if(popupPageCoverEl)popupPageCoverEl.fadeOut({
				time: option.popupAnimateTime,
				callback: function(){
					popupPageCoverEl.remove();
					zBody.removeClass(bodypopupshowClass);
				}
			});
		}

		// gio thi trigger thoi
		zElement.trigger('slider:popup:hide');
	};





	// - - - -




	// ham lam nhiem vu lay ra thong tin
	var getSliderInfo = function(){
		return {
			images: images,
			current: {
				index: currentIndex,
				image: currentImageSrc,
				title: currentTitle,
				description: currentDes,
				link: currentLink
			}
		};
	};



	// - - - -



	// trigger event
	zElement.trigger('slider:ready');
	(function(){
		zElement.trigger('slider:ready:fixheight');
	}).delay(500);

	// preload image and then autoplay
	// sua code lai 1 chut
	// la luon luon cho phep preload cai thang image
	// boi vi trong nhieu truong hop, can preload de ma cache
	// chi la preload image thoi, chua chac la da show cai preload len ui
	var loaderEl = false;
	if(typeof zjs.loadImages == 'function'){
		if(option.preload)
			loaderEl = zjs(_loaderHtml).appendTo(element);

		zjs.loadImages({
			images: (function(){
						var preloadimgs=[];
						for(var i=0;i<images.length;i++){
							if(typeof images[i].src != 'undefined' && images[i].src != '')
								preloadimgs.push(images[i].src);
							if(typeof images[i].srclarge != 'undefined' && images[i].srclarge != '')
								preloadimgs.push(images[i].srclarge);
							if(typeof images[i].srcpopup != 'undefined' && images[i].srcpopup != '')
								preloadimgs.push(images[i].srcpopup);
						};
						return preloadimgs;
					})(),
			onLoading: function(percent){
				// khong muon show preload len UI thi thoi
				if(!option.preload)return;

				loaderEl.find('.percent').setInnerHTML(percent.toString());
			},
			onFinish: function(){
				// khong muon show preload len UI thi thoi
				if(!option.preload)return;

				// debug help to develop loading...
				if(option.debug && option.debug == 'loading')return;

				loaderEl.removeSlow();
				// lan toi cai dau tien da roi tinh gi thi tinh
				showLargeImage(0, {}, true, true);
				if(images.length>1){showLargeImage(1, {direction:'next'}, true, true);showLargeImage(0, {direction:'prev'}, true, true);}
				// bay gio neu nhu co option start-index thi se move tu tu tung cai, khong thoi la bi loi nua
				if(option.startIndex>0){
					var _tmpIndex = 0;
					while(_tmpIndex<option.startIndex)
						showLargeImage(++_tmpIndex, {direction:'next'}, true, true);
				};
				if(option.fullscreenWidth || option.fullWidth)fixrewidth();
				if(option.autoplay)slidePlay();
				// trigger event
				zElement.trigger('slider:load');

				// refresh 1 cai
				refreshSlide();
			}
		});
	};

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
		if(option.fullscreenWidth || option.fullWidth)fixrewidth();
		if(option.autoplay)slidePlay();

		// trigger event
		zElement.trigger('slider:load');

		// refresh 1 cai
		refreshSlide();
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
		getSliderInfo: getSliderInfo,
	};

});

// bind event presskey cho body
zjs(document).on('keydown', function(event){
	if(event.keyCode() != 37 && event.keyCode() != 39 && event.keyCode() != 27)return;
	var inpopupSlider = zjs('.inpopup-imageslider.allow-keyboard');
	if(inpopupSlider.count()<=0)return;

	if(event.keyCode() == 37)inpopupSlider.slidePrev();
	if(event.keyCode() == 39)inpopupSlider.slideNext();
	if(event.keyCode() == 27)inpopupSlider.getData('parent_SliderEl').slidePopupHide();
});

// register module name, fix de tuong thich voi zjs version 1.0
if('required' in zjs)
zjs.required('image.slider.theme.linear');

});