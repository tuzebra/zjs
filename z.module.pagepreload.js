zjs.require('image.loader', function(){
	
	
	// trigger
	//pagepreload.cached
	//pagepreload.start
	//pagepreload.load
	//pagepreload.done
	
	
	var zBody = zjs(window.document.body),
		domreadyMethod = zBody.getAttr('data-preload-domready-method', 'ready'),
		customLoadingContainer = zBody.getAttr('data-preload-custom-loading-container', ''),
		useCacheSecond = parseInt(zBody.getAttr('data-preload-cache-second', 0)),
		useCacheBaseurl = zBody.getAttr('data-preload-cache-baseurl', '');
	
	if(useCacheBaseurl == '')
		useCacheBaseurl = window.document.location.href;
	
	var scrollbaroptionkey = 'zmodulescrollbaroption',
		pagepreloadlasttimekey = 'zmplt'+useCacheBaseurl.hashCode();
	
	var doItNormal = true;
		
	// neu nhu la load-once thi se check cookie xem coi lan gan nhat load la khi nao?
	if(useCacheSecond > 0){

		// kiem tra lan cuoi cung chay preload la khi nao?
		//window.document.location.href
		var lasttimeRunLoad = parseInt(zjs.cookie.get(pagepreloadlasttimekey, 0)),
			now = (new Date()).getTime();
		
		// neu nhu ma da chay preload lau qua roi (> 10s) thi lan nay van se chay tiep nhu binh thuong thoi
		if(now - lasttimeRunLoad < useCacheSecond * 1000){
			// trong nay la xu ly neu nhu van con nam trong gioi han cache
			//console.log('ok cached! now', now, 'lasttimeRunLoad', lasttimeRunLoad, 'sum', now - lasttimeRunLoad);
			doItNormal = false;
		};
	};
	
	// boi vi cache hay khong cache thi thuc te la van preload may cai image
	// de web chay cho nhanh
	// cho nen luon luon can phai 
	// get list preload images
	var preloadImages = [];
	zjs('#zpagepreloadimages li').each(function(liEl){
		preloadImages.push(zjs(liEl).getAttr('data-src'));
	});

	// remove unnecessary dom
	zjs('#zpagepreloadimages').remove();
	
	
	
	
	// function thuc hien viec tao ra overlay va preload
	var mainPreloadFunction = function(){
	
		// dau tien la se make 1 cai overlay
		// (bug on IE)
		//var _html = '<div id="zui-pagepreload-overlay">'+		
		//				'<div class="loading-container">'+
		//					'<div>'+
		//						'<span class="loading-text-percent"></span><span class="loading-percent"></span>'+
		//					'</div>'+
		//				'</div>'+
		//			'</div>';
		var _html = '<div class="loading-container">'+
						'<div>'+
							'<span class="loading-text-percent"></span><span class="loading-percent"></span>'+
						'</div>'+
					'</div>';
				
		//var zPagepreloadEl = zjs(_html);
		var zPagepreloadEl = window.document.createElement('div');
	
		// append vao body
		// >>>>>>
		//console.log('append 1b');
		
		var appendSuccess = false;
		
		try{
			//zBody.append(zPagepreloadEl);
			window.document.body.appendChild(zPagepreloadEl);
			appendSuccess = true;
		}catch(err){}
		
		// neu nhu khong append thanh con
		// (bug tren IE, thi thoi remove luon, ko co preload gi het)
		if(!appendSuccess){
			// >>>>>>
			//console.log('append not Success');
			(function(){
				zjs(window.document.body).removeClass('zpagepreload');
				//alert('fuck');
				//zBody.removeClass('zpagepreload');
				
				// run trigger
				zjs(window.document.body).trigger('pagepreload.done', {percent:100});
				
			}).delay(200);
			//zBody.removeClass('zpagepreload');
			return;
		};
		
		// >>>>>>
		//console.log('appendSuccess');
		
		// chinh chot noi dung cho cai thang El
		zPagepreloadEl = zjs(zPagepreloadEl);
		zPagepreloadEl.setAttr('id', 'zui-pagepreload-overlay');
		zPagepreloadEl.html(_html);
	
		// xem coi neu nhu co custom loading thi se su dung custom loading
		if(customLoadingContainer != ''){
			var customLoadingContainerEl = zjs(customLoadingContainer);
			if(customLoadingContainerEl.count()>0){
				zPagepreloadEl.find('.loading-container').remove();
				// >>>>>>
				//console.log('append 2');
				zPagepreloadEl.append(customLoadingContainerEl);
			}
		}
	
		// bay gio moi remove cai class ra khoi body
		(function(){
			zBody.removeClass('zpagepreload');
		}).delay(200);
	
	
	
		// ===============================
	
	
	
		// LOADING OVERLAY
		// -- 
	
		// lay het event cua thang scrollbar ben duoi luon
		// nhung truoc do phai move cai thang nay ra ben ngoai
		// cai thang scrollbar cai da
		zPagepreloadEl.on('mousewheel', function(event){
			event.preventDefault();
			event.stopPropagation();
		});
	
		var readyImages = false,
			readyDom = false;
	
		var removeOverlay = function(){		
			// just remove loading overlay immediately
			zPagepreloadEl.removeSlow(1000);
		
			// run trigger
			zBody.trigger('pagepreload.done', {percent:100});
		
			// bay gio thi se set time vao cookie
			var now = (new Date()).getTime();
			zjs.cookie.set(pagepreloadlasttimekey, now);
		};
	
	
		// run trigger
		zBody.trigger('pagepreload.start', {percent:0});
	
		// tien hanh preload image va call callback
		zjs.loadImages({
			images: preloadImages,
			delay: 1400,
			onLoading: function(percent){
				zPagepreloadEl.find('.loading-text-percent').html(percent.toString());
				zPagepreloadEl.find('.loading-percent').html('%');
			
				// run trigger
				zBody.trigger('pagepreload.load', {percent:percent});
			}, 
			onFinish: function(){
				readyImages = true;
				if(readyDom)
					removeOverlay();
			}
		});
	
	
		// kiem tra neu nhu body ma duoc gan scroll du
		// thi se dung body
		//var _bodyIsScrollbarDu = zBody.getData(scrollbaroptionkey);
	
		var domreadyFunction = function(){
			readyDom = true;
			if(readyImages)
				removeOverlay();
		};
	
		if(domreadyMethod == 'ready')
			zjs.onready(domreadyFunction);
		else if(domreadyMethod == 'load')
			zjs.onload(domreadyFunction);
		else if(domreadyMethod == 'scrollbar.ready')
			zBody.on('scrollbar.ready', function(){
				// move cai thang preload view ra body
				// >>>>>>
				//console.log('append 3');
				zBody.append(zPagepreloadEl);
				domreadyFunction();
			});	
	};
	
	// function thuc hien khi gap cache
	var mainCacheFunction = function(){
		
		// remove body class
		zBody.removeClass('zpagepreload');
		
		// tien hanh preload image, va khong lam gi het
		zjs.loadImages({images: preloadImages});
		
		var domreadyFunction = function(){
			// run trigger
			zBody.trigger('pagepreload.cached', {percent:100});
			zBody.trigger('pagepreload.done', {percent:100});
		
			// bay gio thi se set time vao cookie
			var now = (new Date()).getTime();
			zjs.cookie.set(pagepreloadlasttimekey, now);
			
			// remove custom loading luon (neu co)
			zjs(customLoadingContainer).removeSlow();
		};
	
		if(domreadyMethod == 'ready')zjs.onready(domreadyFunction);
		else if(domreadyMethod == 'load')zjs.onload(domreadyFunction);
		else if(domreadyMethod == 'scrollbar.ready')domreadyFunction();
	};
	
	
	// =========
	// neu duoc thuc hien binh thuong thi ok
	if(doItNormal)mainPreloadFunction();
	else mainCacheFunction.delay(100);
	
	
	// ===============================
	
	
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('pagepreload');	
});
