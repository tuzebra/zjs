// extend theme cho module ImageSlider
;zjs.require('image.slider', function(zjs){
"use strict";
	
	zjs.regSliderTheme('aprilwork1', function(element, images, option){
	
		option = zjs.extend({
			transition: 2,
			time: 600,
			changeTextAfterImage: false,
			fixedSpeed: false,
			autoplay: true,
			autoplayTime: 3000,
			// advanced setting
			maxH: 360,
			maxW: 520,
			minW: 240,
			width: 0,
			height: 0
		}, option);
	
		var _mainHtml = '<div class="images-wrap"></div>'+
						'<div class="nav-wrap">'+
							'<div class="nav">'+
								'<a href="#" class="nav-back">back</a>'+
								'<a href="#" class="nav-next">next</a>'+
							'</div>'+
						'</div>'+
						'<div class="description-wrap">'+
							'<div class="description-wrap-title"><h3></h3></div>'+
							'<div class="description-wrap-text"><p></p></div>'+
						'</div>',
			_imageHtml = '<div class="image-wrap"></div>';
	
		var n = images.length,
			// mang? nay` se~ luu lai. zElement cua? moi~ thang` image
			imageElems = [],
			currentId = 0;
		
		// prepare cai' element
		zjs(element).addClass('imageslider-aprilwork1').html(_mainHtml);
		
		var nextMove = function(){
			currentId = ++currentId % n;
			runEffect(1);
		};
		
		// bind event cho 2 cai' nut' navigation
		zjs(element).find('.nav-next').click(function(event){
			nextMove();
			event.preventDefault();
			event.stopPropagation();
		});
		zjs(element).find('.nav-back').click(function(event){
			currentId = (n+currentId-1) % n;
			runEffect(-1);
			event.preventDefault();
			event.stopPropagation();
		});
		
		var imagesWrapElem = zjs(element).find('.images-wrap');
	
		// tinh toan' may' cai' thong so' coi
		var containerWidth = option.width || imagesWrapElem.getStyle('width', true),
			containerHeight = option.height || imagesWrapElem.getStyle('height', true),
			minH = option.maxH * option.minW / option.maxW,
			mc = minH * (containerWidth - option.maxW) / (option.maxH - minH),
			ac = containerWidth + mc,
			cc = images.length - 1 > 0 ? images.length - 1 : 1,
			aa = (containerWidth - option.minW) / cc,
			height = function(i){return (ac - i*aa) * option.maxH / ac;},
			width = function(i){return option.maxW * height(i) / option.maxH;},
			left = function(i){return i * aa;},
			top = function(i){return containerHeight - height(i);},
			
			// ham` dung` set style cho may' cai' hinh`
			setStyle = function(elem, i){
				z(elem).setStyle({
					'top': top(i),
					'left': left(i),
					'width': width(i),
					'height': height(i),
					'z-index': 2 * images.length - i
				});
			},
			
			// timer thuc. hien. effect
			timer = zjs.timer({
				from:0,
				to:1,
				// time: option.time,
				fps:20,
				transition: option.transition,
				onStart: function(from, to){
				
					// dung` cai' autoplay da~
					if(autoplayTimer.isRunning())
						autoplayTimer.stop();
				
					// load description
					if( !option.changeTextAfterImage )loadDes(currentId);
					imageElems.each(function(imageElem){
						var newpos = (zjs(imageElem).getAttr('imgpos').toInt() - to) % (2*n);
						if( to > 0 ){
							if( newpos < 0 )zjs(imageElem).fadeOut();
							if( newpos >= n - to && newpos < n )zjs(imageElem).fadeIn();
						}else{
							if( newpos == 0 ){
								// phai? move cai' nay` ra cho dung'
								zjs(imageElem).setAttr('imgpos', -1);
								setStyle(imageElem, -1);
								zjs(imageElem).fadeIn();
							};
							if( newpos == n ){
								zjs(imageElem).fadeOut();
							};
						};	
					});
				},
				onProcess: function(current){
					imageElems.each(function(imageElem){
						var newpos = zjs(imageElem).getAttr('imgpos').toInt();
						newpos = (newpos - current) % (2*n);
						setStyle(imageElem, newpos);
					});
				},
				onFinish: function(from, to){
					// load description
					if( option.changeTextAfterImage )loadDes(currentId);
					imageElems.each(function(imageElem){
						var newpos = (zjs(imageElem).getAttr('imgpos').toInt() - to) % (2*n);
						if( newpos < 0 )newpos = (2*n) + newpos;
						zjs(imageElem).setAttr('imgpos', newpos);
					});
					effectRuning = false;
					
					// neu ma autoplay thi` play thoi
					if(option.autoplay)autoplayTimer.run();
				}
			}),
		
			// effect
			effectRuning = false,
			runEffect = function(imgpos){
				if(imgpos == 0 || effectRuning)return;
				effectRuning = true;
				// run effect
				if( timer.isRunning() )timer.stop();
				timer.set({
					to: imgpos,
					time: (option.fixedSpeed ? option.time * Math.abs(imgpos) : option.time )
				});
				timer.run();
			},
			
			// timer lam` nhiem vu. auto play
			autoplayTimer = zjs.timer({
				time:option.autoplayTime,
				onFinish: function(){
					nextMove();
				}
			}),
			
			loadDes = function(imgId){
				zjs(element).find('.description-wrap-title h3').html(images[imgId].title);
				zjs(element).find('.description-wrap-text p').html(images[imgId].description);
			};
		
		// sau do' se~ append lai. may' cai' image
		for(var i=0; i<2*n; i++){
			var imageElem = zjs(_imageHtml).appendTo(imagesWrapElem)
			// update image src
			// imageElem.find('img').setAttr({src: image.src});
			.setAttr('imgid', i%n)
			.setAttr('imgpos', i)
			.setStyle('background-image', 'url('+images[i%n].srclarge+')');
			
			// fix style
			setStyle(imageElem, i);
			if( i>=n )imageElem.hide();
				
			// event
			imageElem.click(function(event, element){
				currentId = zjs(element).getAttr('imgid').toInt(); 
				runEffect( zjs(element).getAttr('imgpos').toInt() );
			});
			
			imageElems.push(imageElem);
		};
			
		// load description cho hinh` 1 luon
		loadDes(0);
		
		// neu ma autoplay thi` play thoi
		if(option.autoplay)autoplayTimer.run();
				
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.slider.theme.aprilwork1');
	
});