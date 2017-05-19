// extend module Transition cho zjs
;(function(zjs){
// bacause arguments.callee, so cannot use strict mode in this module;
	
	var optionkey = 'zjsmoduletransitionoption',
		timerkey = 'zjsmoduletransitiontimer',
		inlinedataoptionkey = 'zjsmoduletransitioninlinedataoption',
		calstylefnkey = 'zjsmoduletransitioncalculatefn',
		keyframeprefixkey = 'zjsmoduletransitionkeyframeprefix',
		transitionKeyframename = '_zjsmoduletransition';
	
	// cho vai gia tri thong dung vao truoc keo loi
	window.block = 'block';
	window.none = 'none';
		
	// quyet dinh xem se su dung javascrip hay css3?
	var usedcss3 = (zjs.supportTransition && zjs.supportTransform);
	
	// ham tinh toan lai styles
	// ham nay cung se phu thuoc 
	// vao la css3 hay javascript
	var calculateStyleCss = function(fromstyles, tostyles, percent, runtimeFromstyles){ /* percent:0% -> 100% */
			if(percent==100)return tostyles;
			return fromstyles;
		},
		calculateStyleScript = function(fromstyles, tostyles, percent, runtimeFromstyles){ /* percent:0% -> 100% */
			var stepstyles={};
			for(var x in tostyles){
				var fromstyleValue = null,
					tostyleValue = null;
				if(x in fromstyles)
					fromstyleValue = fromstyles[x];
				else if(x in runtimeFromstyles)
					fromstyleValue = runtimeFromstyles[x];
				if(fromstyleValue !== null){
					tostyleValue = tostyles[x];
					if(zjs.isString(tostyleValue)){
						if(tostyleValue.indexOf('+=')===0)
							tostyleValue = fromstyleValue + tostyleValue.replace('+=', '').toFloat();
						else if(tostyleValue.indexOf('-=')===0)
							tostyleValue = fromstyleValue - tostyleValue.replace('-=', '').toFloat();
					}

					
					// >>>>>>>>>>>>>>>>>
					// if(x == 'scrollLeft'){
						// console.log('fromstyleValue', fromstyleValue);
					// }
					var onepercent;
					if(percent === 0)stepstyles[x] = fromstyleValue;
					else if(percent === 100)stepstyles[x] = tostyleValue;
					else stepstyles[x] = fromstyleValue+(tostyleValue-fromstyleValue)/100*percent;
				}
			}
			return stepstyles;
		};
	
	var fixValueByUnit = function(value, unit){
		if(unit == 'string')return value + '';
		return parseFloat(value, 10);
	};	

	
	// gia mao event
	var TREvent = function(){this.allowrepeat=true;}
	TREvent.prototype.preventDefault = function(){
		this.allowrepeat=false;
	};
	
	// xac dinh cubic-bezie
	var cubicBezierRE = new RegExp('cubic-bezier\\(([^,]+),([^,]+),([^,]+),([^\\)]+)\\)','gi'),
		cubicBezierTest = function(string){
			var test = cubicBezierRE.exec(string);
			if(!test)return false;
			return [parseFloat(test[1]),parseFloat(test[2]),parseFloat(test[3]),parseFloat(test[4])];
		};
	
	// = = = =
	// bay gio minh se tao ra 1 class moi
	// de thay the cho class zjs.timer
	// zjs.timer se dung javascript de chay
	// class moi nay se dung css transition de chay
	// nham tang toc do xu ly
	
	// nhung method class moi phai lam duoc:
	// transitionTimer.set({from:100,to:0}).run();
	// transitionTimer.set({from:0,to:100});
	// transitionTimer.stop();
	// transitionTimer.unset();
	
	// property
	// from:0,to:100,time:option.time,transition:option.timingfunction,
	// onStart: function(from, to)
	// onProcess: function(current, from, to){}
	// onStop: function(from, to){}
	// onFinish: function(from, to){}
	
	// timer binh thuong thi chi to den thoi gian va % chay thoi
	// con class moi thi build base on css3 transition
	// cho nen quan tam den gia tri css hon
	// nen luc setup minh se quan tam den css value hon 
	var CSSTimer = function(option){
	
		// option bat chuoc option cua zjs.timer luon
		this.option = zjs.extend({
			element:false,
			from:0,
			to:100,
			time:1000,
			transition:2,
			onStart: function(from, to){},
			onProcess: function(current, from, to){},
			onStop: function(from, to){},
			onFinish: function(from, to){}
		}, option);
		
		var prefix = zjs.browser.cssprefix.replace(/-/g,'');
		var listEventNameHash = {webkit:'webkitTransitionEnd', moz:'transitionend', o:'OTransitionEnd', ms:'msTransitionEnd'};
		this.eventNameHash = listEventNameHash[prefix];
		
		this.tranendRuned = false;
		this.listener = false;
		
	};
	
	CSSTimer.prototype._settranstyle = function(text){
		if(text!='none'){
			var cubicbezier = 'cubic-bezier(0, 0, 1, 1)'; //linear
			switch(this.option.transition){
				case 1:case 'sinoidal':cubicbezier = 'cubic-bezier(0,0,.58,1)';break;
				case 2:case 'quadratic':cubicbezier = 'cubic-bezier(0,1,.53,1)';break;
				case 3:case 'cubic':cubicbezier = 'cubic-bezier(.34,.95,.84,1.39)';break;
				case 4:case 'elastic':cubicbezier = 'cubic-bezier(.71,1.61,.5,.82)';break;
			};
			// nhieu khi no se la cubic-bezier?
			if(zjs.isString(this.option.transition)){
				var values = cubicBezierTest(this.option.transition);
				if(values && zjs.isArray(values) && values.length==4)
					cubicbezier = 'cubic-bezier('+values[0]+', '+values[1]+', '+values[2]+', '+values[3]+')';
			};
			text = 'all ' + this.option.time+'ms '+cubicbezier;
		};
		this.option.element.style[zjs.stylePropertyNames.transition.name] = text;
		return this;
	};
	CSSTimer.prototype.set = function(option){
		zjs.extend(this.option, option);
		return this;
	};
	CSSTimer.prototype.unset = function(){return this;};
	CSSTimer.prototype.run = function(){
		
		var self = this;
		
		// remove het moi transition 
		self._settranstyle('none');
		
		// thuc hien onStart callback
		self.option.onStart.apply(self);
		
		// thuc hien set style
		// khac voi zjs.timer, csstimer chi thuc hien setstyle 2 lan
		// con lai di chuyen thi se do css transition thuc hien
		// lan 1 la from
		self.option.onProcess(self.option.from, self.option.from, self.option.to);
		// enable transition
		// lan 2 la to, nhung phai delay 1 xiu
		(function(){
			self._settranstyle();
			self.option.onProcess(self.option.to, self.option.from, self.option.to);
		}).delay(15);
		
		// gio quan trong la phai bind duoc event onend
		// nhung truoc het la minh se ngan ko cho 2 event
		// xay ra lien tiep, vi transition event no se phan rieng ra theo csskey
		self.tranendRuned = false;
		
		// function xu ly khi transition end
		self.listener = function(event){
			if(self.tranendRuned)return;
			self.tranendRuned = true;
			// sau khi end xong roi thi se unbind event lien, dong thoi remove transition
			this.removeEventListener(self.eventNameHash, arguments.callee, false);
			self._settranstyle('none');
			// remove het transition
			// thuc hien on finish
			self.option.onFinish(self.option.from, self.option.to);
		};
		
		// bind 
		self.option.element.addEventListener(self.eventNameHash, self.listener);
		
		return self;
	};
	CSSTimer.prototype.stop = function(){
		this.option.onStop(this.option.from, this.option.to);
		return this;
	};
	CSSTimer.prototype.unbind = function(){
		if(this.listener)this.option.element.removeEventListener(this.eventNameHash, this.listener);
		this.listener = false;
		return this;
	};
	
	
	// = = = =
	// bay gio minh se tao ra 1 ham
	// nham doc va hieu duoc cubic bezier
	// de nhu trong truong hop trinh duyet
	// khong ho tro css3 transition thi script 
	// van co the chay tot duoc cubic bezier
	// 
	// currently used function to determine time
	// 1:1 conversion to js from webkit source files
	// UnitBezier.h, WebCore_animation_AnimationBase.cpp
	var cubicBezierAtTime = function(t,p1x,p1y,p2x,p2y,duration){
		var ax=0,bx=0,cx=0,ay=0,by=0,cy=0;
		// `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        function sampleCurveX(t){return ((ax*t+bx)*t+cx)*t;};
        function sampleCurveY(t){return ((ay*t+by)*t+cy)*t;};
        function sampleCurveDerivativeX(t) {return (3.0*ax*t+2.0*bx)*t+cx;};
		// The epsilon value to pass given that the animation is going to run over |dur| seconds. 
		// The longer the animation, the more precision is needed in the timing function result 
		// to avoid ugly discontinuities.
		function solveEpsilon(duration){return 1.0/(200.0*duration);};
        function solve(x,epsilon){return sampleCurveY(solveCurveX(x,epsilon));};
		// Given an x value, find a parametric value it came from.
        function solveCurveX(x,epsilon){var t0,t1,t2,x2,d2,i;
			function fabs(n){if(n>=0){return n;}else{return 0-n;}}; 
            // First try a few iterations of Newton's method -- normally very fast.
            for(t2=x, i=0; i<8; i++){x2=sampleCurveX(t2)-x;if(fabs(x2)<epsilon){return t2;};d2=sampleCurveDerivativeX(t2);if(fabs(d2)<1e-6){break;};t2=t2-x2/d2;}
            // Fall back to the bisection method for reliability.
            t0=0.0; t1=1.0; t2=x; if(t2<t0){return t0;};if(t2>t1){return t1;};
            while(t0<t1){x2=sampleCurveX(t2);if(fabs(x2-x)<epsilon){return t2;};if(x>x2){t0=t2;}else{t1=t2;};t2=(t1-t0)*.5+t0;};
            return t2; // Failure.
        };
		// Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
		cx=3.0*p1x; bx=3.0*(p2x-p1x)-cx; ax=1.0-cx-bx; cy=3.0*p1y; by=3.0*(p2y-p1y)-cy; ay=1.0-cy-by;
		// Convert from input time to parametric value in curve, then from that to output time.
    	return solve(t, solveEpsilon(duration));
	};
	
	
	// = = =
	// gio moi bat dau vao code chinh
	// minh se tao them method cho zjs
	// va mix giua css3 transition va script
	
	// extend core de biet la da support transition
	zjs.extendCore({moduleTransition: true});
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		setTransition: function(useroption){
			
			var defaultoption = {
				from:{},
				to:{},
				keyframes:false,
				time:1000,
				repeat:false,
				reverse:false,
				delay:0,
				delayrepeat:0,
				delayreverse:0,
				timingfunction:2,
				autoplay:true,
				fillmode:'backwards',
				usecss:true,
				// event
				onStart: function(event){},
				onFinish: function(event){},
				onFinishreverse: function(event){}
			};
			
			// main each
			return this.each(function(element){
				var zElement = zjs(element),
					option = zElement.getData(optionkey),
					transitionTimer = zElement.getData(timerkey);
					
				// - - - 
				// neu ma co roi thi se ghi lai option
				// option luc nay la option cua user
				if(option || transitionTimer){
					zElement.setData(optionkey, zjs.extend(option, useroption));
					return;
				};
				
				// - - - 
				// neu ma chua co thi se lam binh thuong
				
				// copy option tu default option
				option = zjs.clone(defaultoption);
				
				// extend from inline option ? (uu tien lay ra tu backup truoc)
				var inlineoption = zElement.getData(inlinedataoptionkey, '');
				if(inlineoption == ''){
					inlineoption = zElement.getAttr('data-option', '');
					// nhung boi vi remove di inline data-option roi
					// nen luc set lai chay se khong ra duoc gi
					// nen se backup luon cai inline data-option
					zElement.setData(inlinedataoptionkey, inlineoption);
				};
				
				if(zjs.isString(inlineoption) && inlineoption.trim()!='')
					option = zjs.extend(option, inlineoption.jsonDecode());
				// sau do remove di luon inline option luon, cho html ra dep
				zElement.removeAttr('data-option');
				
				
				// extend from user option ?
				if(typeof useroption!='undefined')
					option = zjs.extend(option, useroption);
				
				// fix option
				if(option.fillmode==0)option.fillmode='none';
				
				// hien tai thi keyframes chi support tren js ma thoi
				if(option.keyframes && zjs.isObject(option.keyframes))
					option.usecss = false;

				// co the se pass may cai thuoc tinh style vao trong option luon
				// ma khong phai la qua "to" object
				// nen se check o day
				var allkey = zjs.objectKeys(defaultoption);
				for(var x in option){
					if(!allkey.include(x))
						option.to[x] = option[x];
				}
				
				// neu nhu co scrollLeft hoac scrollTop gi do
				// thi se khong cho choi css luon
				allkey = zjs.objectKeys(option.from).concat(zjs.objectKeys(option.to)).unique();
				if(allkey.include('scrollLeft') || allkey.include('scrollTop')){
					option.usecss = false;
					// handler to stop scroll-to-top when user 
					// manualy scroll while scroll-to-top transiton is running
					((element === document.body || element === window) ? zjs(window) : zElement).on('mousewheel', function(){
						zElement.stopTransition();
					});
				}

				// save option
				zElement.setData(optionkey, option);
				
				// - - -
				// start coding your module
				
				// ...
				
				// check coi co cho phep ham reverse chay hay ko
				if(!option.repeat && !option.reverse)zElement.setAttr('data-ztransallowreverse',true);
				
				// khoi tao ztransp
				zElement.setData('ztransp',0);
				
				var trEvent = new TREvent();
				
				// reverse function
				var direction = 0, // chay binh thuong
					finishHandler = function(){
						
						var transitionTimer = zElement.getData(timerkey);
						if(!transitionTimer)return;
						
						if(option.reverse && direction==0){
							
							// run event truoc
							if(typeof option.onFinishreverse == 'function'){
								option.onFinishreverse();
								option = zElement.getData(optionkey);
							};
						
							direction=1; // chay nguoc lai
							(function(){
								// check coi con ton tai khong cho chac
								var transitionTimer = zElement.getData(timerkey);
								if(transitionTimer)
									transitionTimer.set({from:100,to:0}).run();
							}).delay(option.delayreverse);
							return;
							
						};
						
						if(option.reverse && direction==1){
							direction=0; // chay binh thuong
							transitionTimer.set({from:0,to:100});
						};
						
						// run event truoc
						if(typeof option.onFinish == 'function'){
							trEvent.allowrepeat=true;
							option.onFinish(trEvent);
							option = zElement.getData(optionkey);
						};
						// trigger event
						zElement.trigger('transition.finish', option);
							
						if(option.repeat && trEvent.allowrepeat){
							(function(){
								var transitionTimer = zElement.getData(timerkey);
								if(transitionTimer)
									transitionTimer.run();
							}).delay(option.delayrepeat);
						};
					};
				
				var getTransitionTimer = function(transOpt){
					// test xem coi ho tro transition hay khong
					if(option.usecss && usedcss3){
						zElement.data(calstylefnkey, calculateStyleCss);
						return new CSSTimer(transOpt);
					};
						
					// check xem coi nhieu khi timingfunction la cubic bezier thi sao?
					if('transition' in transOpt && zjs.isString(transOpt.transition)){
						var values = cubicBezierTest(transOpt.transition);
						if(values && zjs.isArray(values) && values.length==4){
							// chuyen timing ve dang function ma zjs ho tro luon
							transOpt.transition = (function(){
								var p1x = parseFloat(values[0]),
									p1y = parseFloat(values[1]),
									p2x = parseFloat(values[2]),
									p2y = parseFloat(values[3]),
									duration = transOpt.time;
								return function(x){return cubicBezierAtTime(x,p1x,p1y,p2x,p2y,duration);};
							})();
							
						};
					};
					
					// neu nhu su dung keyframes thi phai lam khac di
					if(option.keyframes){
						zElement.setKeyframes(transitionKeyframename, option.keyframes);
					}else{
						zElement.data(calstylefnkey, calculateStyleScript);
					};
					return zjs.timer(transOpt);
				};
				
				var runtimeFromProps;

				// neu chua co thi se tao ra timer
				transitionTimer = getTransitionTimer({
					element: zElement.item(0,true),
					from:0,to:100,time:option.time,transition:option.timingfunction,
					onStart: function(from, to){
						// run event truoc
						if(direction == 0 && typeof option.onStart == 'function')option.onStart();
						// overwrite lai cai option 
						option = zElement.getData(optionkey);
						// backup 1 cai fromProps tai thoi diem bat dau chay hieu ung
						// nhung chi can lam voi hieu ung su dung js thoi
						// voi css thi khoi, de do mat cong
						if(!(transitionTimer instanceof CSSTimer))
							runtimeFromProps = zElement.getStyle(zjs.objectKeys(option.from).concat(zjs.objectKeys(option.to)).unique());
					},
					onProcess: function(current, from, to){
						// xem coi co phai la su dung keyframe hay khong
						if(zElement.isExistsKeyframes(transitionKeyframename))
							zElement.setStyleByKeyframes(transitionKeyframename, current);
						else{
							var stepstyle = zElement.data(calstylefnkey).call(this, option.from, option.to, current, runtimeFromProps);
							zElement.setStyle(stepstyle).setData('ztransp',current);
						}
					},
					// onStop: function(from, to){
					// 	if(zElement.getAttr('id')=='demo11')
					// 		console.log('onStop');
					// 	if(option.fillmode=='backwards')zElement.setStyle(option.to);
					// 	if(option.fillmode=='forwards')zElement.setStyle(option.from);
					// 	zElement.setData('ztransp',-1);
					// },
					onStop: function(from, to){
						zElement.setData('ztransp',-1);
						return;
						// khong nen lam gi het, qua mat cong
						if(option.fillmode=='backwards' || option.fillmode=='forwards'){
							if(!(transitionTimer instanceof CSSTimer))
								runtimeFromProps = zElement.getStyle(
									zjs.objectKeys(option.fillmode=='backwards'?option.to:option.from)
								);
							var callStyleFn = zElement.getData(calstylefnkey);
							if(callStyleFn){
								zElement.setStyle(callStyleFn.call(
									this, 
									option.fillmode=='forwards'?{}:option.from, 
									option.fillmode=='backwards'?{}:option.to, 
									option.fillmode=='backwards'?100:0, 
									runtimeFromProps
								));
							}
						}
						zElement.setData('ztransp',-1);
					},
					onFinish: function(from, to){
						if(zElement.isExistsKeyframes(transitionKeyframename))
							zElement.setStyleByKeyframes(transitionKeyframename, to);
						else
							zElement.setStyle(zElement.data(calstylefnkey).call(this, option.from, option.to, to, runtimeFromProps)).setData('ztransp',-1);
						// on finish
						finishHandler();
					}
				});
				
				// luu lai timer
				zElement.setData(timerkey, transitionTimer);
				
				// run timer thoi nao ^^
				// thuc hien first style truoc khi delay
				// >>>>>>>>>>>>>
				// console.log('setStyle', option.from);
				zElement.setStyle(option.from);
				if(option.autoplay)(function(){transitionTimer.run()}).delay(option.delay);
				
			});
		},
		unsetTransition: function(){
			return this.each(function(element){
				var zElement = zjs(element),
					transitionTimer = zElement.getData(timerkey);
				
				// neu ma chua co thi thoi ^^
				if(!transitionTimer)return;
				
				// unbind event cho csstimer keo error
				if(transitionTimer instanceof CSSTimer)
					transitionTimer.unbind();
				
				// dung tat ca moi hieu ung dang chay
				transitionTimer.stop();
				
				// sau do se delete luon cai timer handler luon
				transitionTimer.unset();
				// hien tai thi unsetData se gay loi
				//zElement.unsetData(timerkey);
				// sua lai thanh delData
				zElement.delData(timerkey);
				zElement.delData(optionkey);
				
				// set lai id, coi nhu ko co la xong
				zElement.setAttr('data-ztransid',-1);
				
			});
		},
		playTransition: function(option){

			if(arguments.length == 3){
				var opt = arguments[2];
				if(zjs.isNumeric(opt))
					opt = {time: opt};
				opt.to = {};
				opt.to[arguments[0]] = arguments[1];
				return this.playTransition(opt);
			}
			if(arguments.length == 2){
				var to = arguments[0];
				if(zjs.isString(to)){
					to = {};
					to[arguments[0]] = arguments[1];
					return this.playTransition({to:to});
				}
				var opt = arguments[1];
				if(zjs.isNumeric(opt))
					opt = {time: opt};
				opt.to = arguments[0];
				return this.playTransition(opt);
			}

			return this.each(function(element){
				var zElement = zjs(element);

				// xem xet net ma co option thi phai set lai transition
				if(typeof option != 'undefined'){
					zElement.unsetTransition();
					zElement.setTransition(zjs.extend(option,{autoplay:true}));
					return;
				};
				
				// bay gio se test coi co timer chua
				// neu co timer roi thi run timer thoi
				var transitionTimer = zElement.getData(timerkey);
				if(!transitionTimer)return;
								
				// stop truoc cho chac	
				transitionTimer.stop();
				
				// xem xet lai 1 ty
				if(zElement.getAttr('data-ztransallowreverse',false)){
					var currentPercent = zElement.getData('ztransp',0).toInt();
					if(currentPercent==-1)currentPercent=0;
					transitionTimer.set({from:currentPercent,to:100});
				};
				
				// unbind event cho csstimer keo error
				if(transitionTimer instanceof CSSTimer)
					transitionTimer.unbind();
				
				// run thoi
				transitionTimer.run();
				
			});
		},
		stopTransition: function(){
			return this.each(function(element){
				var zElement = zjs(element),
					transitionTimer = zElement.getData(timerkey);
					
				if(!transitionTimer)return;
				transitionTimer.stop();
			});
		},
		reverseTransition: function(){
			return this.each(function(element){
				var zElement = zjs(element),
					transitionTimer = zElement.getData(timerkey);
					
				if(!transitionTimer || !zElement.getAttr('data-ztransallowreverse',false))return;
				
				// neu nhu la instance cua csstimer thi phai lam khac 1 ty
				// vi se khong co khai niem current percent
				if(transitionTimer instanceof CSSTimer){
					transitionTimer.stop().set({from:100,to:0}).run();
				}
				
				// neu nhu la zjs.timer thi xu ly khac
				else{
					var currentPercent = zElement.getData('ztransp',0).toInt();
					if(currentPercent==-1)currentPercent=100;
					transitionTimer.stop().set({from:currentPercent,to:0}).run();
				};
			});
		},
		
		
		// bonus method
		// cac method de ma set keyframes (js) vao 1 element va thuc thi
		
		// set keyframes
		setKeyframes: function(name, object){
			return this.each(function(element){
				var zElement = zjs(element);
				
				// get ra raw animation
				var rawAnimation = false;
				if(zjs.isObject(object))
					rawAnimation = object;
				if(zjs.isString(object) && object.trim()!='')
					rawAnimation = object.jsonDecode();

				if(zjs.isObject(rawAnimation)){
					
					var infoKeyframes = {};
			
					// bay gio se di phan tich lam sao cho infoKeyframes thanh nhu the nay:
					//{
					//	[property_name]:{
					//		unit: 'string', 'px', '%', 'deg', ....
					//		points: [0, 10, 20, ...]
					//		values: [0, 1, 0, ...]
					//	}
					//}
			
					// dau tien la se di loop 1 lan dau tien de thu thap lai tat ca cac property co mat
					for(var i in rawAnimation){
						for(var j in rawAnimation[i]){
							// test xem coi unit cua cai property nay la gi
							var unit = 'string';
							if(j == 'content')unit = 'string';
							else if(zjs.isNumeric(rawAnimation[i][j]))unit = 'numeric';
							else if(zjs.isString(rawAnimation[i][j])){
								if(zjs.isNumeric(rawAnimation[i][j].toFloat())){
									unit = 'px';
									if(rawAnimation[i][j].indexOf('%') >= 0)unit = '%';
									if(rawAnimation[i][j].indexOf('deg') >= 0)unit = 'deg';
								}
							}
							infoKeyframes[j] = {unit:unit, points:[0], values:[]};
						}
					}
				
					// sau khi thu thap xong het cac [property_name] roi thi se di xac dinh frame
					for(i in infoKeyframes){
						var value = null;
						// cai [property_name] nao thi cung phai co diem bat dau, la 0
						// nen se uu tien lam cai 0 dau tien
						// xem coi cai 0 nay no co ton tai o cho nao khong, neu nhu khong co thi se get default
						if('0' in rawAnimation && i in rawAnimation['0'])
							value = rawAnimation['0'][i];
						else
							value = zElement.getStyle(i);
						
						// fix value 
						infoKeyframes[i]['values'].push(fixValueByUnit(value, infoKeyframes[i]['unit']));
					
						// tiep theo la bo sung them vao nhieu frame nua
						for(j in rawAnimation){
							if(j == 0 || j == '0')continue;
							if(!i in rawAnimation[j] || typeof rawAnimation[j][i] == 'undefined')continue;
							infoKeyframes[i]['points'].push(parseFloat(j,10));
							infoKeyframes[i]['values'].push(fixValueByUnit(rawAnimation[j][i], infoKeyframes[i]['unit']));
						}
					}

					// luu lai 
					zElement.setData(keyframeprefixkey+name, infoKeyframes);
				};
				
			});
		},
		setStyleByKeyframes: function(name, duration){
			return this.each(function(element){
				var zElement = zjs(element),
					fabricObj = zElement.getData('fabricObj', false);
				
				if(zElement.getAttr('data-allow-keyframes','true')=='false')return;
				
				// get ra thong tin keyframe se thuc hien
				var infoKeyframes = zElement.getData(keyframeprefixkey+name, false);
				if(infoKeyframes && zjs.isObject(infoKeyframes)){
					for(var propertyName in infoKeyframes){
						// xem coi hien tai la dang nam trong frame nao
						for(var i = 0;i<infoKeyframes[propertyName].points.length;i++)
							if(duration <= infoKeyframes[propertyName].points[i])
								break;
						if(i==0)i=1;
						// sau khi xac dinh duoc frame roi thi se ap style thoi 
						var value = infoKeyframes[propertyName].values[i-1];
						if(i<infoKeyframes[propertyName].points.length && infoKeyframes[propertyName].unit != 'string'){
							var t = duration - infoKeyframes[propertyName].points[i-1],
								p = t/(infoKeyframes[propertyName].points[i] - infoKeyframes[propertyName].points[i-1]);
							value = value + (infoKeyframes[propertyName].values[i] - infoKeyframes[propertyName].values[i-1])*p;
						};
						if(infoKeyframes[propertyName].unit == '%')value = value+'%';
						
						// hack 1 xiu trong truong hop backgroundImage ^^
						if((propertyName == 'backgroundImage' || propertyName == 'content') && zjs.isString(value))
							value = value.format({zjsInteger:zElement.getStyle('zjs-integer'), zjsString:zElement.getStyle('zjs-string')});
						
						// support render to fabric
						if(fabricObj && window.applyStyleToFabric)
							window.applyStyleToFabric(fabricObj, propertyName, value);
						else 
							zElement.setStyle(propertyName, value);
					}
				};
				
			});
		},
		getStyleTransition: function(propertyName){
			var zElement = this.item(0),
				fabricObj = zElement.getData('fabricObj', false);

			// support fabric
			if(fabricObj && window.getStyleFromFabric)
				return window.getStyleFromFabric(fabricObj, propertyName);

			return this.getStyle(propertyName);
		},
		isExistsKeyframes: function(name){
			return (this.item(0).getData(keyframeprefixkey+name, false) != false);
		}
		
	});
	
	// load as default
	zjs(function(){zjs('.ztransition').setTransition();});
	
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('transition');

})(zjs);