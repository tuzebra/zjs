// extend module Image Loader cho zjs
;(function(zjs, undefined){
"use strict";
	
	// save all cache image url
	var cacheImageUrls = {};


	// dinh nghia~ class ImageLoader
	// ImageLoader class support imgcache.js
	var ImageLoader = function(src){
		this.img = false;
		this.src = src;
		this.localCache = true;
	};
	
	zjs.extend(ImageLoader.prototype,{
		load: function(callback, errorCallback){
			this.callback = callback;
			this.errorCallback = errorCallback || false;
			var self = this;

			var handlerImgLoading = function(forceLoaded){

				if(forceLoaded){
					return self.onLoad();
				}

				// console.log('handlerImgLoading', self.src);
				if(!self.img){
					self.img = new Image();
				}
				self.img.src = self.src;
				
				// neu da~ load xong san~ truoc' do' roi` thi`
				if(self.img.complete){
					// console.log('self.img.complete');
					var a = self.img.naturalWidth;
					if( a === undefined )
						a = self.img.width;
					var b = self.img.naturalHeight;
					if( b === undefined )
						b = self.img.height;
					self.onLoad(a, b);
					return;
				}
				
				// neu chua load xong san~
				// thi` se~ onload de? quang vao` callback
				self.img.onload = function(){
					self.onLoad(this.width, this.height);
				};
				self.img.onerror = function(){
					self.onError();
				};
			};

			// support imgcache.js
			if(self.localCache && typeof ImgCache != 'undefined'){
				// console.log('check local cache');
				ImgCache.isCached(self.src, function(path, success) {
					// console.log('is cache? ', path);
					if (success) {
						ImgCache.options.debug && console.log('[img loader] is cached! ', path);
						// already cached
						// we'll switch to cached version
						ImgCache.getCachedFileURL(self.src, function(src, newSrc){
							ImgCache.options.debug && console.log('[img loader] getCachedFileURL:', src, newSrc);
							cacheImageUrls[self.src] = newSrc;
							self.src = newSrc;
							// run handler
							handlerImgLoading(true);
						});
					} else {
						ImgCache.options.debug && console.log('[img loader] not cached! ', path);
						// not there, need to cache the image
						ImgCache.cacheFile(self.src, function () {
							ImgCache.options.debug && console.log('[img loader] cacheFile:', self.src);
							// console.log('cache done ', path);
							// we'll switch to cached version
							ImgCache.getCachedFileURL(self.src, function(src, newSrc){
								ImgCache.options.debug && console.log('[img loader] cacheFile -> getCachedFileURL:', src, newSrc);
								cacheImageUrls[self.src] = newSrc;
								// console.log('get cache url: ', path, src, newSrc);
								self.src = newSrc;
								handlerImgLoading(true);
							});
						});
					}
				});
			}
			// Or just run handler
			else{
				// console.log('use online');
				cacheImageUrls[self.src] = self.src;
				handlerImgLoading();
			}
			
			return;
		},
		onLoad: function(width, height){
			// delete image
			this.img = undefined;
			// run callback
			this.callback && this.callback({src:this.src, width:width, height:height});
		},
		onError: function(){
			// delete image
			this.img = undefined;
			// run callback
			this.errorCallback && this.errorCallback({src:this.src});
		},
		setOptionLocalCache: function(boolValue){
			this.localCache = boolValue;
			return this;
		}
	});
	
	// dinh nghia~ ham` loading 1 image
	var loadImage = function(option){
		option = zjs.extend({
			image: '',
			localCache: true,
			onError: function(image){},
			onLoaded: function(image){}
		}, option);
		
		(new ImageLoader(option.image)).setOptionLocalCache(option.localCache).load(
			// loaded
			function(image){option.onLoaded(image);},
			// error
			function(image){option.onError(image);}
		);
	};
	
	
	// dinh nghia~ ham` loading  list Images
	var loadImages = function(option){
		// console.log('[imageloader] loadImages');
		option = zjs.extend({
			path: '',
			images: [], 
			delay: 800,
			localCache: true,
			onError: function(image){},
			onLoaded: function(image){},
			onLoading: function(percent){}, 
			onFinish: function(){}
		}, option);

		// fix delay
		if(option.delay<=0)option.delay=1;
	
		// khai bao' lung tung
		var total = option.images.length,
			loaded = 0,
			oldPercent = 0,
			percentTimer = false;
		
		// gio` se~ load nhieu` thang` Image
		for( var i=0; i<total; i++  )
			(new ImageLoader(option.path+option.images[i])).setOptionLocalCache(option.localCache).load(
				// loaded
				function(image){
					if( percentTimer !== false )
						percentTimer.stop();
					// khai bao' va` run timer moi'
					(percentTimer = zjs.timer({
						from: oldPercent,
						to: (++loaded) / total * 100,
						time: option.delay, 
						transition: 'linear',
						onProcess: function(percent){
							// chi? lay' phan` nguyen
							percent = percent.toInt();
							if( percent > 100 )percent = 100;
							// goi. callback va` update oldPercent
							option.onLoading( oldPercent = percent );
						},
						onStop: function(){
							option.onLoaded(image);
						},
						onFinish: function(){
							if(loaded >= total)
								option.onFinish();
						}
					})).run();
				},
				// error!
				function(image){
					option.onError(image);
				}
			);
			
	};
	
	// cuoi' cung` la`
	// extend vao` zjs-core nhu 1 shortcut de? goi. den'
	zjs.extendCore({
		loadImage: loadImage,
		loadImages: loadImages,
		imageLoaderGetCacheUrl: function(url){
			return cacheImageUrls[url];
		}
	});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.loader');

})(zjs);