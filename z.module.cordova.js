(function(zjs){
	
	
	//
	// EXTEND ZJS CORE
	// ZJS.CORDOVA
	//

	// list quan ly cac file css dang load
	var currentViewCssList = [],
		currentViewControllerList = [];
	
	var loadJs = function(filesrc, id){
		var scriptEl = document.createElement('script');
		scriptEl.src = filesrc;
		if(id)scriptEl.id=id;
		document.getElementsByTagName('head')[0].appendChild(scriptEl);
	};
	

	var zjsCordova = {
		
		loadView: function(viewName, param, animate, callback){
			
			param = param || {};
			animate = animate || '';
			callback = callback || false;
			
			// xac dinh 1 view id
			var viewHash = viewName.hashCode(),
				viewId = (viewName+zjs.getUniqueId()).hashCode();
			
			// load intro view via ajax
			zjs.ajax({
				url: 'view/'+viewName+'/'+viewName+'.html',
				onComplete: function(raw){
					//console.log('ajax');
					//console.log(raw);
					//console.log(raw.clean());
					
					// load css
					// neu nhu co san truoc do roi thi khong load ^.^
					if(currentViewCssList.indexOf(viewHash)<0){
						zjs.loadCss('view/'+viewName+'/'+viewName+'.css');
						currentViewCssList.push(viewHash);
					};
					
					// append template
					var viewEl = zjs(raw)
									.setAttr('id', 'view'+viewId)
									.setAttr('data-param', zjs.jsonEncode(param));
									
					// neu nhu co animate thi phai hide truoc khi append vo
					if(animate != '')
						viewEl.addClass('view-hide-before-animated');
					
					viewEl.appendTo('.app');
					
					// make touch button
					//viewEl.find('.touch-button').cordovaMakeTouchButton();
					
					
					// loadJs
					// neu nhu chua co thi moi load thoi
					//console.log('here 1');
					if(!zjs.isFunction(currentViewControllerList[viewName])){
						//console.log('here 2');
						loadJs('view/'+viewName+'/'+viewName+'.js', 'js'+viewId);
						// khi load js xong, thi se vao trong cai method viewController
						// nen phai bind cho method nay cai thang viewEl
						// de khi load xong thi cai thang view Controller nay se call init cho viewEl luon
					}else{
						// co roi thi goi callback thoi
						//console.log('here 3', currentViewControllerList[viewName]);
						viewEl.setAttr('data-param', '');
						currentViewControllerList[viewName].call(viewEl, param);
					}
					
					
					// canh canh 100ms sau khi moi hieu ung cai view
					if(animate != '')(function(){
						viewEl.removeClass('view-hide-before-animated');
						viewEl.addClass('animated '+animate);
						// thuc hien hieu ung thi khoang 1s la xong
						// nen se remove class thoi
						(function(){
							viewEl.removeClass('animated '+animate);
						}).delay(1000);
					}).delay(100);
					
					
					// check xem coi co callback hay khong?
					// neu co thi goi callback thoi
					if(zjs.isFunction(callback))
						callback.apply(this);
				}
			});
		},
		
		loadViewBounceIn: function(viewName, param){return this.loadView(viewName, param, 'bounceIn')},
		loadViewBounceInRight: function(viewName, param){return this.loadView(viewName, param, 'bounceInRight')},
		loadViewBounceInLeft: function(viewName, param){return this.loadView(viewName, param, 'bounceInLeft')},
		loadViewBounceInUp: function(viewName, param){return this.loadView(viewName, param, 'bounceInUp')},
		loadViewBounceInDown: function(viewName, param){return this.loadView(viewName, param, 'bounceInDown')},
		
		loadViewFlipInX: function(viewName, param){return this.loadView(viewName, param, 'flipInX')},
		loadViewFlipInY: function(viewName, param){return this.loadView(viewName, param, 'flipInY')},
		
		loadViewZoomIn: function(viewName, param){return this.loadView(viewName, param, 'zoomIn')},
		
		
		
		viewController: function(viewName, functionToRun){
			
			//console.log('here 4');
			
			// xem coi co chua, neu co roi thi thoi
			if(zjs.isFunction(currentViewControllerList[viewName]))
				return;
			
			//console.log('here 5');
			// khong thoi thi cho cai view nay vao
			currentViewControllerList[viewName] = functionToRun;
			
			//console.log('here 6', currentViewControllerList[viewName]);
			
			// bay gio se bat dau call init cho viewEl luon
			// boi vi cho nay chi load co 1 lan dau tien ma thoi
			// nen se query de ma tim ra cai thang viewEl chinh xac
			var viewEl = zjs('.app [data-name="'+viewName+'"]').item(0);
			if(viewEl.count()>0){
				var param = zjs.jsonDecode(viewEl.getAttr('data-param'));
				viewEl.setAttr('data-param', '');
				currentViewControllerList[viewName].call(viewEl, param);
			}
		}
		
	};
	
	zjs.extendCore({cordova: zjsCordova});
	
	
	
	// 
	// EXTEND ZJS METHOD
	//
	
	zjs.extendMethod({
		cordovaMakeTouchButton: function(){
			return this
				.addClass('touch-button')
				.on('touchstart', function(event){
					this.addClass('touch')
				})
				.on('touchend', function(event){
					this.removeClass('touch')
				})
		},
		
		cordovaViewRemove: function(callback, animate){
			callback = callback || {};
			animate = animate || '';
			
			// khong co animate gi het thi remove ngay luon
			if(animate == '')
				return this.remove();
			
			var view = this;
			view.addClass('animated').addClass(animate);
			// thuc hien hieu ung thi khoang 1s la xong
			// nen se remove view thoi
			(function(){
				view.remove();
			}).delay(1000);
		},
		
		cordovaViewRemoveBounceOut: function(callback){return this.cordovaViewRemove(callback, 'bounceOut')},
		cordovaViewRemoveBounceOutDown: function(callback){return this.cordovaViewRemove(callback, 'bounceOutDown')},
		cordovaViewRemoveBounceOutLeft: function(callback){return this.cordovaViewRemove(callback, 'bounceOutLeft')},
		cordovaViewRemoveBounceOutRight: function(callback){return this.cordovaViewRemove(callback, 'bounceOutRight')},
		cordovaViewRemoveBounceOutUp: function(callback){return this.cordovaViewRemove(callback, 'bounceOutUp')},
		
		cordovaViewRemoveFlipOutX: function(callback){return this.cordovaViewRemove(callback, 'flipOutX')},
		cordovaViewRemoveFlipOutY: function(callback){return this.cordovaViewRemove(callback, 'flipOutY')},
		
		cordovaViewRemoveZoomOut: function(callback){return this.cordovaViewRemove(callback, 'zoomOut')}
		
	});
	
	
	
	// PREVENT SCROLL WEBVIEW
	zjs(document.body).on('touchmove', function(event){
		var tgEl = zjs(event.toTarget());
		if(tgEl.hasClass('scrolling-area'))return;
		if(tgEl.findUp('.scrolling-area').count()>0)return;
		if(tgEl.hasClass('scrolling-area-x'))return;
		if(tgEl.findUp('.scrolling-area-x').count()>0)return;
		event.preventDefault();
	});
	
	var touchingButtonEls = [];
	
	// TOUCH EFFECT
	zjs(document.body).on('touchstart', function(event){
		var tgEl = zjs(event.toTarget());
		if(!tgEl.hasClass('touch-button'))
			tgEl = tgEl.findUp('.touch-button');
		if(tgEl.count() <= 0)
			return;
		tgEl.addClass('touch');
		touchingButtonEls.push(tgEl);
	});
	zjs(document.body).on('touchmove, touchend', function(event){
		touchingButtonEls.each(function(tgEl){
			tgEl.removeClass('touch');
		});
	});
	
	
	
})(zjs);