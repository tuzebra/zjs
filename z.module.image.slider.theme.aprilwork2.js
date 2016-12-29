// extend theme cho module ImageSlider
;zjs.require('image.slider', function(zjs){
	
	zjs.regSliderTheme('aprilwork2', function(element, images, option){
	
		option = zjs.extend({
			width: 0,
			height: 0,
			flyTime: 1000,
			autoplay: true,
			autoplayTime: 3000,
			fullscreen: true,
			// 1don vi do. dai` theo chieu` z ung' voi' bao nhieu px
			zRate: 2
		}, option);
	
		// - - - KHAI BAO LUNG TUNG - - -
	
		var _mainHtml = '<div class="images-wrap"></div>'+
						'<div class="description-wrap">'+
							'<div class="description-wrap-title"><h3></h3></div>'+
							'<div class="description-wrap-text"><p></p></div>'+
						'</div>'+
						'<div class="nav-wrap">'+
							'<div class="nav">'+
								'<a href="#" class="nav-back">back</a>'+
								'<a href="#" class="nav-next">next</a>'+
							'</div>'+
						'</div>'+
						'<div class="full-wrap">'+
							'<a href="#" class="full" title="fullscreen"></a>'+
							'<a href="#" class="exit" title="exit fullscreen"></a>'+
						'</div>',
			_imageHtml = '<div class="image-wrap"><img src="" /></div>',
	
			n = images.length,
			// mang? nay` se~ luu lai. zElement cua? moi~ thang` image
			imageElems = [],
		
			// prepare cai' container element
			containerElement = zjs(element)
				// chuan? hoa; struct
				.html(_mainHtml)
				// them vao` class
				.addClass('imageslider-aprilwork2'),
		
			// kich thuoc'
			containerWidth = 0,
			containerHeight = 0,
			// kich' thuoc' 1/2 duong` cheo'
			containerDiagonal = 0,
			
			// ham` nay` tinh' toan' ra cac' kich' thuoc' chuan?
			initSize = function(width, height){
				// kich thuoc'
				containerWidth = width || option.width || containerElement.getStyle('width', true);
				containerHeight = height || option.height || containerElement.getStyle('height', true);
				// kich' thuoc' 1/2 duong` cheo'
				containerDiagonal = Math.sqrt( containerHeight*containerHeight + containerWidth*containerWidth ) / 2;
			},
			
			// ham` nay` tinh' ra kich' thuoc' cua? doan. = (duong` cheo - d)
			diagonalCaculator = function( z ){
				if(z===0)return 0;
				if(z<0)return -1;
				var n = z * option.zRate,
					e = Math.pow( 1 + 1/n , n );
				// chay. tu` 1->e nen phai tru` di 1
				return (e - 1) * containerDiagonal / (Math.E - 1);
			},
		
			// ham` nay` return ve` lai. cac' toa. do. moi' dua. tren duong` cheo' (toa. do. z)
			sizeCaculator = function( x, y, w, h, z ){
				var d = diagonalCaculator(z);
				if( d === 0 )return [x, y, w, h, 0];
				if( d === -1 )return [x, y, w, h, -1];
				var	r = (containerDiagonal - d) / containerDiagonal,
					nw = r * w,
					nh = r * h,
					px = containerWidth/2 - r * containerWidth/2,
					py = containerHeight/2 -r * containerHeight/2,
					nx = r * x + px,
					ny = r * y + py;
				return [nx, ny, nw, nh, d];
			},
			
			// ham` nay` la` ham` generate random coor
			generateRandomCoor = function(image){
				var	
					// dau tien la` random truc. z dua. vao` current axisz
					// tao. ra 100 vi. tri' ngau~ nhien tu` 0->10
					ranz = zjs.random(5,50)/10,
					// random truc. x va` y thi` phai? dua. vao` width & height nua~
					// dong` thoi` cung~ dua. vao` truc. z, vi` cang` ra xa thi` goc' nhin`
					// cang` rong. nen x va` y co' the? mo? rong. hon
					d = diagonalCaculator(ranz),
					W = containerDiagonal * containerWidth  / d,
					H = containerDiagonal * containerHeight  / d;
					
				// apply	
				image.x = zjs.random(0, W*3);
				image.y = zjs.random(0, H*3);
				image.z = ranz;
			},
			
			// ham` nay` se~ render 2D -> 3D
			render3D = function(image){			
				coor3d = sizeCaculator( image.x, image.y, image.w, image.h, image.z );
				// gio` se~ fix style cho element
				if( coor3d[4] == -1 )
					image.element.hide();
				else
					image.element.setStyle({left:coor3d[0], top:coor3d[1], width:coor3d[2], height:coor3d[3], 'z-index':50-image.z*10});
			},
			
			// luu lai. muc' do. chenh lech. khi move anh?
			cx = 0, cy = 0, cz = 0,
			
			// timer lam` nhiem. vu. Fly
			flyTimer = zjs.timer({
				from: 0,
				to: 1,
				time: option.flyTime,
				transition: 1,
				onStart: function(){
					
					// dung` cai' autoplay da~
					if(autoplayTimer.isRunning())
						autoplayTimer.stop();
					
					// phai backup image position truoc da~
					images.each(function(image){
						image.bx = image.x;
						image.by = image.y;
						image.bz = image.z;
					});
				},
				onProcess: function(current){
					// thay doi? toa. do. 3d cai' da~
					images.each(function(image, i){
						image.x = image.bx + current * cx;
						image.y = image.by + current * cy;
						image.z = image.bz + current * cz;
						
						// khong cho thang` dang chon. hide duoc.
						if( i == currentId && image.z < 0 )
							image.z = 0;
							
						// thay doi? xong roi` thi` render ra thoi ^^
						render3D(image);
					});
				},
				onFinish: function(){
					// voi' nhung~ thang` ma` lo~ hide roi`
					// thi` random cho no' 1 vi. tri' moi'
					images.each(function(image){
						if( image.z < 0 ){
							generateRandomCoor(image);
							// thay doi? xong roi` thi` render ra thoi ^^
							render3D(image);
							// show ra (vi` luc' nay~ da~ bi. hide)
							image.element.fadeIn();
						};
					});
					// show description
					loadDes(currentId);
					containerElement.find('.description-wrap').fadeIn();
					
					// neu ma autoplay thi` play thoi
					if(option.autoplay)autoplayTimer.run();
				}
			}),
			
			// ham` nay` co' nhiem. vu. move 1 image to Front
			moveImageToFront = function(){
				
				// neu dang chay. thi` khong cho lam`
				if(flyTimer.isRunning())return;
				
				// xac dinh coi phai? move chung` nao` (x, y, z)
				var image = images[currentId],
					nx = (containerWidth - image.w)/2,
					ny = (containerHeight - image.h)/2;
				
				// update
				cx = nx - image.x;
				cy = ny - image.y;
				cz = - image.z;
				
				// bat dau` run timer
				flyTimer.run();
				
				// 
				containerElement.find('.description-wrap').fadeOut();
			},
			
			// 
			currentId = -1,
			nextMove = function(){
				currentId = ++currentId % n;
				moveImageToFront();
			},
			
			// ham` set description
			loadDes = function(imgId){
				containerElement.find('.description-wrap-title h3').html(images[imgId].title);
				containerElement.find('.description-wrap-text p').html(images[imgId].description);
			},
			
			// timer lam` nhiem vu. auto play
			autoplayTimer = zjs.timer({
				time:option.autoplayTime,
				onFinish: function(){
					nextMove();
				}
			}),
		
			// prepare cai' images element
			imagesWrapElement = zjs(element).find('.images-wrap')
				// fix style
				.setStyle({top:0, left:0, width: containerWidth, height: containerHeight});
		
		// - - - BAT DAU - - -
		
		// tinh toan' kick' thuoc' cho chuan?
		initSize();
		
		// gio` se~ append may' cai' hinh` vao`
		images.each(function(image, i){
			
			var imageElem = zjs(_imageHtml).appendTo(imagesWrapElement).setAttr('imgid', i);
			
			// quang vao "image" luon
			image.element = imageElem;
			
			// fill image
			imageElem.find('img').setAttr('src', image.src);
			
			// get kich thuoc dung'
			var imageWidth = imageElem.getStyle('width', true),
				imageHeight = imageElem.getStyle('height', true);
				
			// fix lai. kich' thuoc' cho no'
			imageElem.setStyle({width:imageWidth, height:imageHeight});
			
			// quang vao "image" luon
			image.w = imageWidth;
			image.h = imageHeight;
			
			// sau do' se~ fix lai. kich thuoc img
			imageElem.find('img').setStyle({width:'100%', height:'100%'});
			
			// bind event
			imageElem.click(function(event, element){
				imgId = zjs(element).getAttr('imgid').toInt();
				if( imgId != currentId ){
					currentId = imgId;
					moveImageToFront();
				};
				event.preventDefault();
			});
			
			// gio` se~ random toa. do. (x,y,z) theo width, height, va` z
			generateRandomCoor(image);
			
			// render lan` dau` tien
			render3D(image);
			
		// end each
		});
		
		// bind event cho 2 cai' nut' back next
		containerElement.find('.nav-next').click(function(event){
			nextMove();
			event.preventDefault();
			event.stopPropagation();
		});
		containerElement.find('.nav-back').click(function(event){
			currentId = (n+currentId-1) % n;
			moveImageToFront();
			event.preventDefault();
			event.stopPropagation();
		});
		
		// neu nhu option cho full screen
		if( zjs.supportsFullScreen ){
		
			// neu nhu option fullscreen thi` 
			// minh` moi' quan tam may' cai' nut'
			if( option.fullscreen ){
				containerElement.find('.full-wrap').show();
				containerElement.find('.full-wrap .exit').hide();
			}
			else
				containerElement.find('.full-wrap').hide();
				
			// con` event "onFullscreen" thi` luon luon phai? co'
			
			// bind event cho cai' nut' full'
			containerElement.find('.full-wrap .full')
				.click(function(event){
					containerElement.fullScreen();
					event.preventDefault();
					event.stopPropagation();
				});
				
			// bind event cho cai' nut' exit'
			containerElement.find('.full-wrap .exit')
				.click(function(event){
					containerElement.cancelFullScreen();
					event.preventDefault();
					event.stopPropagation();
				});
				
			// backup cac' kich' thuoc' chuan?
			var bakContainerWidth = containerWidth,
				bakContainerHeight = containerHeight;
				
			// bind event cho container
			containerElement
				.onFullScreen(function(event, element){
					if( zjs.isFullScreen() ){
						containerElement.find('.full-wrap .full').hide();
						containerElement.find('.full-wrap .exit').show();
						// phai? fix lai. vi. tri' cua? may' cai' hinh`
						images.each(function(image){
							image.x += (window.innerWidth - bakContainerWidth)/2;
							image.y += (window.innerHeight - bakContainerHeight)/2;
						});
						// fix lai. kich' thuoc' la` full man` hinh`
						initSize(window.innerWidth, window.innerHeight);
					}else{
						containerElement.find('.full-wrap .full').show();
						containerElement.find('.full-wrap .exit').hide();
						// phai? fix lai. vi. tri' cua? may' cai' hinh`
						images.each(function(image){
							image.x -= (containerWidth - bakContainerWidth)/2;
							image.y -= (containerHeight - bakContainerHeight)/2;
						});
						// fix lai. kich' thuoc' la` full man` hinh`
						initSize(bakContainerWidth, bakContainerHeight);
					};
					// render lai.
					images.each(function(image){render3D(image);});
				});
			
		};
		
		
		// load description cho hinh` 1 luon
		// hide cai' description da~
		containerElement.find('.description-wrap').hide();
		
		// neu ma autoplay thi` play thoi
		if(option.autoplay)autoplayTimer.run();
		
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.slider.theme.aprilwork2');
	
});