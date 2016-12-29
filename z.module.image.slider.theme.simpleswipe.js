// extend theme cho module ImageSlider
zjs.require('image.slider', function(){
	
	zjs.regSliderTheme('simpleswipe', function(element, images, option){
		
		option = zjs.extend({
			transition:1,
			transitionTime:600,
			autoplay: true,
			autoplayTime: 2000,
			onChange: function(index){},
			navButton: true,
			fullscreenWidth: false,
			navThumbTemplate: '<a class="nav-image"></a>',
			navDotTemplate: '<a class="nav-dot">.</a>'
		}, option);
	
		var _mainHtml = '<div class="image-view">'+
							'<div class="image-view-wrap">'+
								'<div class="image-hold"></div>'+
								'<div class="image-hold-temp"></div>'+
							'</div>'+
							'<div class="image-view-border"></div>'+
						'</div>'+
						'<div class="image-info-wrap">'+
							'<div class="image-title"><h4></h4></div>'+
							'<div class="image-description"></div>'+
						'</div>'+
						'<div class="nav-wrap">'+
							'<div class="nav-dots-wrap">'+
								'<div class="nav-dots"></div>'+
							'</div>'+
							'<a class="nav-back"></a>'+
							'<div class="nav-images-wrap">'+
								'<div class="nav-images"></div>'+
							'</div>'+
							'<a class="nav-next"></a>'+
						'</div>',
			_trayHtml = '<div class="images-wrap"></div>',
			_imageHoldHtml = '<div class="image-hold"></div>',
			_loaderHtml = '<div class="slider-loading-wrap"><div class="text-wrap"><span class="percent"></span>%</div></div>';
	
		var zElement = zjs(element).addClass('imageslider-simpleswipe');
		var zImagesWrapEl = zjs(_trayHtml).appendTo(zElement).setStyle({position:'relative',overflow:'hidden',width:'100%',height:'100%'});
		var zImagesTrayEl = zElement.find('ul').item(0).addClass('tray');
		
		zImagesTrayEl.appendTo(zImagesWrapEl);
		
		// get some custom html content
		zImagesTrayEl.find('li').each(function(element, index){
			var zTempel = zjs(element);
			images[index].zEl = zTempel;
			images[index].width = zTempel.width();
			images[index].orgleft = zTempel.left();
			
			// create timer here 
			images[index].timer = zjs.timer({
				//from:0,to:1,
				time:option.transitionTime,
				transition:option.transition,
				onStart: function(from, to){},
				onProcess: function(current, from, to){
					zTempel.left(current);
				},
				onStop: function(from, to){
					zTempel.left(to);
				},
				onFinish: function(from, to){
					zTempel.left(to);
				}
			});
			
			//console.log(zTempel.item(0,true));
		});
		// - - -
		
		// function tim ra thang co left lon nhat
		var findMaxWidth = function(){
				width = 0;
				zImagesTrayEl.find('li').each(function(element, index){
					if(zjs(element).left()>=0)width+=zjs(element).width();
				});
				return width;
			};
		
		// prepare vai cai element
		var zImagesTrayElWidth = 0,
			zImagesTrayElHeight = zElement.height();
		zImagesTrayEl.find('li').each(function(element, index){
			images[index].zEl.setStyle({position:'absolute',width:images[index].width,left:zImagesTrayElWidth});
			zImagesTrayElWidth += images[index].width;
		});
		zImagesTrayEl.setStyle({position:'absolute',width:zImagesTrayElWidth,height:zImagesTrayElHeight,top:0,left:'50%','margin-left':-zImagesTrayElWidth/2});
		
		// - - - - -
		
		// function move slide
		var showSlide = function(index){
				// tim coi slide nay dang nam o dau
				var left = images[index].zEl.left();
				
				for(var i=0;i<images.length;i++){
					var from = images[i].zEl.left(),
						to = from-left;
					images[i].timer.stop();
					images[i].timer.set({from:from, to:to}).run();
				};
				
				(function(){
					for(var i=0;i<images.length;i++){
						images[i].timer.stop();
						if(images[i].zEl.left()<0)
							images[i].zEl.left(findMaxWidth());
					};
				}).delay(option.transitionTime+200);
				
			};
		
		var currentIndex = 0;
		
		// ham view next image
		var showNextImage = function(){
				currentIndex++;
				if(currentIndex>=images.length)
					currentIndex = 0;
				showSlide(currentIndex);
			},
			showPrevImage = function(){
				currentIndex--;
				if(currentIndex<0)
					currentIndex = images.length-1;
				showSlide(currentIndex);
			};
		
		// - - -
		
		// timer lam` nhiem vu. auto play
		var autoplayTimer = zjs.timer({
			time:option.autoplayTime,
			onFinish: function(){
				showNextImage();
			}
		});
		
		if(option.autoplay)autoplayTimer.run();
		
		// - - - -
		
		// cuoi cung la phai return method cho slider
		return {
			slideTo: showSlide,
			slideNext: showNextImage,
			slidePrev: showPrevImage
		};
		
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.slider.theme.simpleswipe');
	
});