// extend module canvas scratch cho zjs
;(function(zjs){
	
	var optionkey = 'zjsmodulecanvasscratchoption';
	
	// test coi co support canvas chua
	var canvasSupported = (typeof document.createElement('canvas').getContext == 'function');
	
	// tao san 1 global option
	zjs.extendCore({
		canvasscratch:{
			image: '',
			data: false,
			color: 'transparent',
			onHit: function(data){},
			//
			composite: 'destination-out',
			stroke: 'rgba(0,0,0,1)'
		}
	});
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeCanvasscratch: function(useroption){
			
			// copy option tu global option
			var defaultoption = zjs.clone(zjs.canvasscratch);
			
			// do each
			this.each(function(element){
				var zElement = zjs(element);
				
				// - - - 
				// neu ma co roi thi se ghi lai option
				// option luc nay la option cua user
				var option = zElement.getData(optionkey);
				if(option)zElement.setData(optionkey, zjs.extend(option, useroption));
				
				// - - - 
				// neu ma chua co thi se lam binh thuong
				
				// copy option tu default option
				option = zjs.clone(defaultoption);
				
				// extend from inline option ?
				var inlineoption = zElement.getAttr('data-option', '');
				if(zjs.isString(inlineoption) && inlineoption.trim()!='')
					option = zjs.extend(option, inlineoption.jsonDecode());
				
				// extend from user option ?
				if(typeof useroption!='undefined')
					option = zjs.extend(option, useroption);
				
				// save option
				zElement.setData(optionkey, option);
				
				
				// - - -
				// start coding your module
				
				// ...
				
				var width = zElement.width(),
					height = zElement.height(),
					topLayerEl = zjs('<div style="position:absolute;top:0;left:0;width:'+width+'px;height:'+height+'px;"></div>').appendTo(zElement);
				
				// neu nhu chua ho tro canvas thi se lam kieu div
				if(!canvasSupported){
					topLayerEl.setStyle('background','url('+option.image+') no-repeat');
					topLayerEl.click(function(event, element){
						topLayerEl.setStyle('background','none');
						if(option.data && typeof option.onHit == 'function'){
							option.onHit(option.data);
							option.data = false;
						};
					});
				}
				
				// neu nhu sopport canvas thi lam kieu canvas thoi ^^
				else{
					
					// truoc tien phai tao 1 canvas moi
					var canvasEl = zjs('<canvas width="'+width+'" height="'+height+'"></canvas>').appendTo(topLayerEl),
						context = canvasEl.item(0,true).getContext('2d');
					
					// reset canvas compositing option
					context.globalCompositeOperation = 'source-over';
					
					// load image and drag it
					var img = new Image;
					img.src = option.image;
					
					img.onload = function(){
					
						context.drawImage(img, 0, 0);
						
						// setup san de ty nua cao` 
						context.globalCompositeOperation = 'destination-out';
						context.strokeStyle = 'rgba(0,0,0,1)';
						if(option.color != 'transparent'){
							context.globalCompositeOperation = 'source-atop';
							context.strokeStyle = option.color;
						};
						context.lineWidth = 3;
						context.lineWidth = 'round';
						context.lineJoin = 'round';
					
					};
					
					// dem de biet % da cao
					// tinh toan tong so pixel can cao
					var countpixel = 0,
						minHitPixel = parseInt(width*height/3/9),
						x = y = 0,
						mousedown = false;
					
					var handlerMousedown = function(_x,_y){
							// backup lai x,y
							x = _x;y = _y;
							context.beginPath();
							context.moveTo(x, y);
							mousedown = true;
						},
						handerMousemove = function(_x,_y){
							if(!mousedown)return;
							
							if(countpixel>-1){
								countpixel+= parseInt(Math.sqrt((_x-x)*(_x-x) + (_y-y)*(_y-y)));
								// backup lai x,y
								x = _x;y = _y;
							};
							
							// erasing...
							context.lineTo(_x, _y);
							context.stroke();
							
							// callback ?
							if(countpixel>=minHitPixel){
								countpixel=-1;
								if(option.data && typeof option.onHit == 'function'){
									option.onHit(option.data);
									option.data = false;
								};
							};
						};
					
					// bind event
					canvasEl.on('mousedown',function(event, element){
								handlerMousedown(event.x(), event.y());
							})
							.on('mousemove',function(event, element){
								handerMousemove(event.x(), event.y());
							})
							.on('mouseup',function(event, element){
								mousedown=false;
							});
					
					if(zjs.isTouchDevice())
						canvasEl.on('touchstart',function(event, element){
								handlerMousedown(event.touchX(), event.touchY());
							})
							.on('touchmove',function(event, element){
								handerMousemove(event.touchX(), event.touchY());
							})
							.on('touchend',function(event, element){
								mousedown=false;
							});
					
				};
				
				// - - -
				
			});
			// end each
			
			// follow 
			// zjs syntax
			// return this!
			return this;
		}
	});
	
	// autoload?
	zjs(function(){zjs('.zcanvasscratch').makeCanvasscratch();});

	// register module name
	zjs.required('canvasscratch');

})(zjs);