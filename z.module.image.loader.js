// extend module Image Loader cho zjs
;(function(zjs, undefined){
"use strict";

	// dinh nghia~ class ImageLoader
	var ImageLoader = function(src){
		this.src = src;
	};
	
	zjs.extend(ImageLoader.prototype,{
		load: function(callback, errorCallback){
			this.callback = callback;
			this.errorCallback = errorCallback || false;
			var self = this;
			this.img = new Image;
			this.img.src = this.src;
			
			// neu da~ load xong san~ truoc' do' roi` thi`
			if(this.img.complete){
				var a = this.img.naturalWidth;
				if( a === undefined )
					a = this.img.width;
				var b = this.img.naturalHeight;
				if( b === undefined )
					b = this.img.height;
				this.onLoad(a, b);
				return;
			};
			
			// neu chua load xong san~
			// thi` se~ onload de? quang vao` callback
			this.img.onload = function(){
				self.onLoad(this.width, this.height);
			};
			this.img.onerror = function(){
				self.onError();
			};
			
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
		}
	});
	
	// dinh nghia~ ham` loading 1 image
	var loadImage = function(option){
		option = zjs.extend({
			image: '',
			onError: function(image){},
			onLoaded: function(image){}
		}, option);
		
		(new ImageLoader(option.image)).load(
			// loaded
			function(image){option.onLoaded(image);},
			// error
			function(image){option.onError(image);}
		);
	};
	
	
	// dinh nghia~ ham` loading  list Images
	var loadImages = function(option){
		
		option = zjs.extend({
			path: '',
			images: [], 
			delay: 800,
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
			(new ImageLoader(option.path+option.images[i])).load(
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
		loadImages: loadImages
	});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.loader');

})(zjs);