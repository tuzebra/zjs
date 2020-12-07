var isNumeric = function (o) {
    return !isNaN(parseFloat(o)) && isFinite(o);
  };

var  isString = function (o) {
    return typeof o == 'string';
  };

var isFunction = function (o) {
  return Object.prototype.toString.call(o) === '[object Function]';
};

var isArray = Array.isArray || function (o) {
  return Object.prototype.toString.call(o) === '[object Array]';
};

var isObject = function (o) {
  return o != null && typeof o === 'object';
};

var extend = function (destination, source, fixonly, dontoverwrite) {
    fixonly = fixonly || false;
    dontoverwrite = dontoverwrite || false;
    if (isArray(source)) {
      for (var i = 0; i < source.length; i++) {
        if (isArray(destination))
          destination.push(source[i]);
      }
    } else if (isObject(source) || isFunction(source)) {
      for (var pro in source) {
        if (fixonly && typeof destination[pro] == 'undefined') continue;
        if (dontoverwrite && typeof destination[pro] != 'undefined') continue;
        destination[pro] = source[pro];
      };
    };
    return destination;
  };


Timer = function(mainOpt){
		
		var transitionFunc = {
				linear: function(t){return t;},
				sinoidal: function (t) { return (-Math.cos(t * Math.PI) / 2) + 0.5; },
				quadratic: function(t){var t2 = t * t;return t * (-t2 * t + 4 * t2 - 6 * t + 4);},
				cubic: function(t){return t * (4 * t * t - 9 * t + 6);},
				elastic: function(t){var t2 = t * t;return t * (33 * t2 * t2 - 106 * t2 * t + 126 * t2 - 67 * t + 15);}
			},
			transitionFuncName = ['linear', 'sinoidal', 'quadratic', 'cubic', 'elastic'],
			trans = function(x){return x;},
			self = this, handler = false, 
			asc = false, dis = 0, step = 0, x = 0, v = 0,
			from = 0, to = 0,
			onStarted = false, onStart = false, onProcess = false, onFinish = false, onStop = false;
			
		// can` them method nay` de? khi nao` can`
		// thay doi? cac' option thi` thay dc lien`
		this.set = function(o){
			
			// dau` tien la` se~ copy cai' main option da~
			var _o = extend({
				from: 0,
				to: 100,
				time: 5000, // mili second
				fps: 30, // frame per second
				transition: 'quadratic',
				onStart: function(from, to){},
				onProcess: function(current, from, to){},
				onStop: function(from, to){},
				onFinish: function(from, to){}
			}, mainOpt);
			
			// sau do' se~ copy qua cho cai' option set trong nay`
			o = extend(_o, o);
			
			// fix ten "transition" neu nhu no' la` so'
			if( isNumeric(o.transition) )
				o.transition = transitionFuncName[(o.transition % transitionFuncName.length)];
			// set lai. may' cai' gia' tri. lung tung
			if(isString(o.transition) && (o.transition in transitionFunc))trans = transitionFunc[o.transition];
			if(isFunction(o.transition))trans = o.transition;
			asc = (o.from < o.to);
			// tinh ra ty le chenh lech
			dis = ( asc ? o.to - o.from : o.from - o.to);
			// x run from beginPos to endPos width Step => fix x run form 0 -> 1;
			step = 1 / (o.fps * o.time / 1000);
			v = (1000 / o.fps);
			//
			from = o.from;
			to = o.to;
			onStart = o.onStart;
			onProcess = o.onProcess;
			onStop = o.onStop;
			onFinish = o.onFinish;
			
			return this;
		};
		
		// xoa het tat ca
		this.unset = function(){
			window.clearTimeout(handler);
			onStart = onProcess = onStop = onFinish = false;
			return this;
		};
			
		this.run = function(){
			// start
			if(!onStarted && onStart){
				onStart(from, to);
				onStarted = true;
			};
			
			// tinh toan ra y
			var y = trans(x);
			var disY = asc ? (from + y*dis) : (from - y*dis);
			
			// callback
			if(onProcess)onProcess(disY, from, to);
			
			// call again
			if(x < 1){
				x += step;
				handler = window.setTimeout(self.run, v);
			}
			// stop
			else{
				// goi. stop truoc'
				self.stop();
				// sau do' moi' goi. onFinish
				if(onFinish)onFinish(from, to);
			};
			
			return this;
		};
		
		this.stop = function(options){
			window.clearTimeout(handler);
			// reset lai. moi. thu'
			handler = false;
			onStarted = false;
			x = 0;
			// goi. onStop
			if(onStop)onStop(from, to, options);
			return this;
		};

		this.finish = function(){
			this.stop();
			// goi. onFinish
			if(onFinish)onFinish(from, to);
			return this;
		};
		
		this.isRunning = function(){
			return (handler !== false);
		};
		
		// gio` moi' bat' dau` set cac' option
		this.set();
	}