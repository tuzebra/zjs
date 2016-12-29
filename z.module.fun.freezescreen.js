// MODULE FUN FREEZE SCREEN
(function(){
	
	// test coi co support canvas chua
	var canvasSupported = (typeof document.createElement('canvas').getContext == 'function');
	// neu khong support thi thoi
	if(!canvasSupported)return;
	
	var soundManagerIsReady = false;
	
	// require soundmanager
	zjs.require('soundmanager', function(){
		
		if(!'soundManager' in window)return;
		
		zjs.onready(function(){
			
			(function(){
		
				var soundManagerSwfurl = '//app.april.com.vn/zjs/vers/1.1/sm2swf/';
		
				if('soundManagerSwfurl' in window)
					soundManagerSwfurl = window.soundManagerSwfurl;
			
				soundManager.setup({
					url: soundManagerSwfurl,
					useHTML5Audio: true,
					preferFlash: false,
					debugMode: false,
					onready: function(){
						soundManagerIsReady = true;
						zjs.trigger('fun.freezescreen.soundready');
					}
				});
				
			}).delay(2500);
		});
		
	});
	
	var optionkey = 'zmodulefunfreezescreenoption',
		timerkey = 'zmodulefunfreezescreentimer',
		soundkey = 'zmodulefunfreezescreensound';
	
	// extend core mot so option
	zjs.extendCore({
		moduleFunFreezeScreenOption: {
			soundUrl: '//app.april.com.vn/zjs/vers/1.1/sounds/sleighride.mp3',
			snowflakeUrl: '//app.april.com.vn/zjs/vers/1.1/images/z.module.fun.freezescreen.snowflake.2.png',
			lineWidth: 30,
			defrostButtonText: 'defrost'
		}
	});
	
	// template
	var zfreezescreenclass = 'zfun-freezescreen',
		zdefrostbtnclass = 'zfun-freezescreen-defrost-button',
		
		// uninitialaze hide class
		uninitclass = 'zui-uiuninithide zui-uiuninithideh',
		
		// html 
		_html = '<a class="'+zdefrostbtnclass+'">${text}</a><canvas width="${width}" height="${height}"></canvas>';
	
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeFreezeScreen = function(element, useroption){
		
		var zFreezeScreenEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zFreezeScreenEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zFreezeScreenEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleFunFreezeScreenOption);
		// extend from inline option ?
		var inlineoption = zFreezeScreenEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zFreezeScreenEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zFreezeScreenEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		zFreezeScreenEl.addClass(zfreezescreenclass);
		
		// xac dinh dinh size
		var width = zFreezeScreenEl.width(),
			height = zFreezeScreenEl.height();
		
		// init html	
		zFreezeScreenEl.html(_html.format({width:width, height:height, text:option.defrostButtonText}));
		
		// nut thoat
		var zDefrostBtnEl = zFreezeScreenEl.find('.'+zdefrostbtnclass);
		zDefrostBtnEl.click(function(){
			removeFreezeScreen(element);
		});
		
		// xac dinh canvas element
		var canvasEl = zFreezeScreenEl.find('canvas'),
			context = canvasEl.item(0,true).getContext('2d');
		
		canvasEl.width(width).height(height);
		
		// reset canvas compositing option
		// setup san de ty nua cao` 
		context.globalCompositeOperation = 'destination-out';
		context.strokeStyle = 'rgba(0,0,0,1)';
		context.lineWidth = option.lineWidth;
		context.lineJoin = 'round';
		
		// load image and drag it
		var img = new Image,
			imgready = false;
		img.onload = function(){imgready = true;};
		img.src = option.snowflakeUrl;
		
		// set 1 cai timeout de draw snowflake
		zFreezeScreenEl.setData(timerkey, window.setInterval(function(){
			
			if(!imgready)return;
			
			// truoc khi ve thi phai reset canvas
			context.globalCompositeOperation = 'source-over';
			for(var i=0;i<zjs.random(0,20);i++){
				//context.rotate(zjs.random(0,90)*Math.PI/180);
				context.drawImage(img, zjs.random(-100,width), zjs.random(-100,height));
				//context.rotate(0);
			};
			
			// ve xong thi phai set lai nhu cu
			context.globalCompositeOperation = 'destination-out';
			
		}, 100));
		
		
		
		// dem de biet % da cao
		// tinh toan tong so pixel can cao
		var mousedown = false,
			mousehoverdefrost = false;
		
		var handlerMousedown = function(x,y){

				context.beginPath();
				context.moveTo(x, y);
				mousedown = true;
				
				if(!mousehoverdefrost)return;
				zDefrostBtnEl.removeClass('hover').addClass('active');
			},
			handerMousemove = function(x,y){
				
				if(mousedown){
				
					// erasing...
					context.lineTo(x, y);
					context.stroke();
				
				}
				
				else{
				
					// test xem coi co hover qua cai nut defrost khong
					var zDefrostBtnTop = zDefrostBtnEl.top(),
						zDefrostBtnLeft = zDefrostBtnEl.left(),
						zDefrostBtnWidth = zDefrostBtnEl.width(),
						zDefrostBtnHeight = zDefrostBtnEl.height();
					
					mousehoverdefrost = (y > zDefrostBtnTop && y < zDefrostBtnTop + zDefrostBtnHeight &&
										x > zDefrostBtnLeft && x < zDefrostBtnLeft + zDefrostBtnWidth);
				
					if(mousehoverdefrost)
						zDefrostBtnEl.addClass('hover');
					else
						zDefrostBtnEl.removeClass('hover');
				
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
					zDefrostBtnEl.removeClass('active');
					if(mousehoverdefrost)zDefrostBtnEl.trigger('click');
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
					zDefrostBtnEl.removeClass('active');
					if(mousehoverdefrost)zDefrostBtnEl.trigger('click');
				});
		
		
		// remove uninitialaze hide class
		zFreezeScreenEl.removeClass(uninitclass);
		
		
		// xem coi neu nhu sound manager ready roi thi play nhac thoi
		if(soundManagerIsReady){
			zFreezeScreenEl.setData(soundkey, soundManager.createSound({
				id: 'freezescreensound'+zjs.getUniqueId(),
				url: option.soundUrl,
				autoLoad: true,
				loops: 9999,
				multiShot: true,
				volume: 100,
				whileloading: function(){},
				whileplaying: function(){},
				onload: function(){},
				onfinish: function(){}
			}));
			zFreezeScreenEl.getData(soundkey).play({volume:100});
		};
	},
	
	removeFreezeScreen = function(element){
		var zFreezeScreenEl = zjs(element),
			option = zFreezeScreenEl.getData(optionkey);
		if(!option)return;
		
		var soundObj = zFreezeScreenEl.getData(soundkey);
		if(soundObj)soundObj.stop();
		
		zFreezeScreenEl.remove();
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeFreezeScreen: function(useroption){
			return this.each(function(element){makeFreezeScreen(element, useroption)});
		},
		removeFreezeScreen: function(){
			return this.each(function(element){removeFreezeScreen(element)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zfreezescreen ko, neu nhu co thi se auto makeFreezeScreen luon
			zjs(el).find('.zfreezescreen').makeFreezeScreen();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zfreezescreen ko, neu nhu co thi se auto makeFreezeScreen luon
			if(zjs(el).hasClass('zfreezescreen'))zjs(el).makeFreezeScreen();
			zjs(el).find('.zfreezescreen').makeFreezeScreen();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zfreezescreen').makeFreezeScreen();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('fun.freezescreen');
	
})();