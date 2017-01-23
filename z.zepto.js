/////////////////////////////////////////////////////////////////////////////////
// * ZJS ZEPTO
// * This is the bridge that help zjs's modules can run at Zepto enviroment
// * (c) 2017 Zebra <tuzebra@gmail.com>
/////////////////////////////////////////////////////////////////////////////////

// - - - - - - 
// ZEPTO TO ZJS BRIDGE CORE 
;(function(window, Zepto, undefined){
"use strict";

// check Zepto & Zjs loaded!
if(Zepto == undefined)return;
if('zjs' in window)return;

var zjs = Zepto,
	version = '1.1',

	isDefined = function(){
		var len = arguments.length;
		while(len--)
			if(typeof arguments[len] == 'undefined')
				return false;
		return true;
	},
	
	isBoolean = function(o){
		return typeof o == 'boolean';
	},
	
	isNumeric = zjs.isNumeric,
	
	isString = function(o){
		return typeof o == 'string';
	},

	isArray = zjs.isArray,

	isObject = function(o){
		return o != null && typeof o === 'object';
	},
	
	isDate = function(o){
		return toString.call(o) === '[object Date]';
	},
	
	isObject = function(o){
		return o != null && typeof o === 'object';
	},
	
	isElement = function(o){
		return o && (o.nodeType === 3 || (o.nodeType === 1 && o.tagName));
	},

	isFunction = zjs.isFunction,

	makeArray = function(obj){
		if(!obj)return [];
		var len=obj.length, ret=new Array(len);
		while(len--)
			ret[len] = obj[len];
		return ret;
	},

	extend = zjs.extend,

	each = zjs.each, 

	eachItem = function(obj, fn){ // each(object, function(value, key){} )
		if(isArray(obj)){
			for(var i=0,n=obj.length;i<n;i++)
				if(fn.call(obj, obj[i], i) === false)
					break;
			return;
		}
		if(isObject(obj)){
			var keys = objectKeys(obj);
			for(var i=0,n=keys.length;i<n;i++)
				if(fn.call(obj, obj[keys[i]], keys[i]) === false)
					break;	
		}
	},

	objectKeys = Object.keys = Object.keys || (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !{toString:null}.propertyIsEnumerable("toString"),
			DontEnums = [ 
				'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
				'isPrototypeOf', 'propertyIsEnumerable', 'constructor'
			],
			DontEnumsLength = DontEnums.length;

		return function(obj){
			if (typeof obj != 'object' && typeof obj != 'function' || obj === null)
				throw new TypeError('Object.keys called on a non-object');

			var result = [];
			for(var name in obj)if(hasOwnProperty.call(obj, name))result.push(name);

			if(hasDontEnumBug){
				for(var i = 0;i<DontEnumsLength;i++)
					if(hasOwnProperty.call(obj, DontEnums[i]))
						result.push(DontEnums[i]);
			}

			return result;
		};
	})(),
	
	objectIndexOf = function(object, value){
		var keys = objectKeys(object),
			i;
		for(i=0;i<keys.length;i++)
			if(object[keys[i]] == value)
				return keys[i];
		return false;
	},

	getValueByKey = function(object, key){
		var value = object;
		eachItem(key.split(/\.|\[|\]/), function(k){
			if(typeof value == 'undefined')return;
			if(k==='')return;
			if(!isNaN(k))k=parseInt(k);
			if(typeof value[k] == 'undefined'){
				value = undefined;
				return false;
			}
			value = value[k];
		});
		return value;
	},

	clone = function(source){
		if(isObject(source))return extend(new Object(), source);
		if(isArray(source))return extend(new Array(), source);
		return source;
	},
	
	
	// BROWSER - - - - -
	
	browser = (function(){
		var ua=window.navigator.userAgent.toLowerCase(),
			match=/(opera)\/([\w.]+)\s+\(([A-za-z]+)/.exec(ua)||
				/\(([A-za-z]+).+(firefox)\/([\w.]+)/.exec(ua)||
				/\(([A-za-z]+).+(chrome)[ \/]([\w.]+)/.exec(ua)||
				/\(([A-za-z]+).+(webkit)[ \/]([\w.]+)/.exec(ua)||
				/\(([A-za-z]+).+(msie) *([\w.]+)/.exec(ua)||
				[],
			platform=match[1]||false,
			name=match[2]||false,
			version=match[3]||"0",
			browser={};
		if(platform=='opera'){
			platform=version;
			version=name;
			name='opera';
		};
		if(name){
			browser.name=name;
			browser.platform=platform;
			browser[name]=true;
			if(name=='webkit')browser.safari=true;
			if(name=='webkit'||name=='chrome')browser.webkit=true;
			browser.version=version;
		};
		browser.isAndroid = (/android/gi).test(navigator.appVersion);
		browser.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
		browser.isIPhone = (/iphone/gi).test(navigator.appVersion);
		browser.isPlaybook = (/playbook/gi).test(navigator.appVersion);
		browser.isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
		browser.isIElt = function(version){
			return (browser.name == 'msie' && parseInt(browser.version) < version);
		};
		
		// test prefix
		var div = document.createElement('div');
		browser.cssprefix = '';
		if('webkitTransform' in div.style)browser.cssprefix = '-webkit-';
		if('MozTransform' in div.style)browser.cssprefix = '-moz-';
		if('msTransform' in div.style)browser.cssprefix = '-ms-';
		if('OTransform' in div.style)browser.cssprefix = '-o-';
		
		return browser;
	})(),
	
	isTouchDevice = ((function(){
		var test = -1;
		return function(){
			if(test>-1)return (test==1);
			
			// method 1 works on most browsers
			if( !!('ontouchstart' in window) || window.DocumentTouch && (document) instanceof (DocumentTouch) )return (test=1 && true);
			
			// method 2 works on ie10
			if( !!('onmsgesturechange' in window) )return (test=1 && true);
			
			// method 3
			var el = document.createElement('div');
			el.setAttribute('ongesturestart', 'return;');
			if(typeof el.ongesturestart == "function")return (test=1 && true);
			
			// no-touch
			return (test=0 && false);
		};
	})()),
	
	isMobileDevice = ((function(){
		var test = -1;
		return function(){
			if(test>-1)return (test==1);
			if(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))return (test=1 && true);
			return (test=0 && false);
		};
	})()),
	
	// list css3 property
	stylePropertyNames = (function(){
		// danh sach nhung thuoc tinh hay gap
		var props = {borderRadius:'',textShadow:'',boxShadow:'',flex:'',
				transform:'',transformOrigin:'',transformOriginX:'',transformOriginY:'',transformOriginZ:'',transformStyle:'',
				transition:'',transitionDelay:'',transitionDuration:'',transitionProperty:'',transitionTimingFunction:'',
				animation:'',animationDelay:'',animationDirection:'',animationDuration:'',animationFillMode:'',animationIterationCount:'',animationName:'',animationPlayState:'',animationTimingFunction:''
			};
		var vender = ['','webkit-','-webkit-','-moz-','-o-','ms-','-ms-'];
		var div = document.createElement('div');
		// bay gio se di test tung thuoc tinh va fix name
		var prop,i,fixprop,fixprops={};
		for(prop in props){
			for(i=0;i<vender.length;i++){
				fixprop = (vender[i]+prop).replace(/-([a-z])/ig, function(a,l){return l.toUpperCase();});
				if(fixprop in div.style){
					fixprops[prop] = {name:fixprop, prefix:vender[i]};
					if(fixprops[prop].prefix=='webkit-')fixprops[prop].prefix='-webkit-';
					if(fixprops[prop].prefix=='ms-')fixprops[prop].prefix='-ms-';
					fixprops[prop].cssname = fixprops[prop].prefix+prop;
					break;
				};
			};
		};
		return fixprops;
	})(),

	// REQUIRE, DOMREADY, DOMLOAD

	require = function(name, callback){
		callback.call(this, zjs);
	},

	domReady = function(callback){
		return zjs(callback);
	},

	domLoadedFns = (function(){
		var domLoadedFns = function(){
			var fns = [];
			this.isModuleRequired = true;
			this.isLoaded = false;
			this.add = function(fn){fns.push(fn)};
			this.run = function(fn){try{fn.call(this, zjs)}catch(err){}};
			this.runall = function(){
				// call all registered functions
				for(var i = 0;i<fns.length;i++)this.run(fns[i]);
				// clear handlers
				fns = [];
			};
		};
		return new domLoadedFns();
	})(),

	domLoaded = (function(){
		
		var loaded = function(){
				if(domLoadedFns.isLoaded)return;
				domLoadedFns.isLoaded = true;
				// check if all module required
				// execute all function in stack
				if(domLoadedFns.isModuleRequired)
					domLoadedFns.runall();
			};
		
		// bind onload for the first time
		if(window.addEventListener)
			window.addEventListener('load', loaded, false); 
		else if(window.attachEvent)
			window.attachEvent('onload', loaded);
		
		// return function to call
		return function(fn){
			if(domLoadedFns.isLoaded && domLoadedFns.isModuleRequired)
				return domLoadedFns.run(fn);
			// add to the list
			domLoadedFns.add(fn);
		};
		
	})(),
	
	// TEST SUPPORT ...
	
	// test support history state
	supportHistory = (window.history && typeof window.history.replaceState == 'function'),
	
	// test support transform & transition
	supportTransform = (typeof stylePropertyNames.transform != 'undefined'),
	supportTransition = (typeof stylePropertyNames.transition != 'undefined'),
	
	// test support translate3d
	supportTranslate3dTest = function(){
		var div = document.createElement('div');
		// add it to the body to get the computed style.
	    document.body.insertBefore(div, null);
	    var has3d = false;
	    if('transform' in stylePropertyNames){
			div.style[stylePropertyNames.transform.name] = 'translate3d(1px,1px,1px)';
            has3d = window.getComputedStyle(div).getPropertyValue(stylePropertyNames.transform.prefix+'transform');
        };
        document.body.removeChild(div);
        return (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
	},
	// will test late, on dom ready
	supportTranslate3d = false,
	
	// test support classList
	supportClassList = ('classList' in document.createElement('p')),
	
	// test support background-position-x or y
	supportBackgroundPositionXY = (function(){
		var div = document.createElement('div');
		return ('backgroundPositionX' in div.style);
	})(),
	
	supportOpacity = (function(){
		var div = document.createElement('div');
		return ('opacity' in div.style);
	})(),
	
	supportFlexbox = (function(){
		if(typeof stylePropertyNames.flex != 'undefined')return true;
		
		var div = document.createElement('div');
		var vender = ['','webkit-','-webkit-','-moz-','-o-','ms-','-ms-'];
		for(var i=0;i<vender.length;i++){
			if(!('style' in div))continue;
			if(!('display' in div.style))continue;
			try{
				div.style.display = vender[i]+'flex';
				if(div.style.display === vender[i]+'flex')
					return true;
			}catch(err){};
		};
		
		return false;
	})(),
	
	// POLYFILL ...
	
	// matchMedia() Test a CSS media type/query in JS. 
	// Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas
	matchMedia = window.matchMedia = window.matchMedia || (function(doc, undefined){
		"use strict";

		var bool;
		var docElem = doc.documentElement;
		var refNode = docElem.firstElementChild || docElem.firstChild;
		// fakeBody required for <FF4 when executed in <head>
		var fakeBody = doc.createElement( "body" );
		var div = doc.createElement( "div" );

		div.id = "mq-test-1";
		div.style.cssText = "position:absolute;top:-100em";
		fakeBody.style.background = "none";
		fakeBody.appendChild(div);

		return function(q){

			div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

			docElem.insertBefore( fakeBody, refNode );
			bool = div.offsetWidth === 42;
			fakeBody.parentNode.removeChild( fakeBody );

			return {
				matches: bool,
				media: q
			};

		};

	})(document),
	
	
	// RAF polyfill
	// Gist: https://gist.github.com/julianshapiro/9497513
    requestAnimationFrame = window.requestAnimationFrame || (function(){
		"use strict";

		var timeLast = 0;

		return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback){
			var timeCurrent = (new Date()).getTime(),
				timeDelta;

			/* Dynamically set delay on a per-tick basis to match 60fps. */
			/* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
			timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
			timeLast = timeCurrent + timeDelta;

			return setTimeout(function(){callback(timeCurrent + timeDelta);}, timeDelta);
		};
	})(),

	// JSON...
	jsonEncode = function(object){
		if('JSON' in window)
			return JSON.stringify(object);
		return '{}';
	},
	
	jsonDecode = function(text){
		if('JSON' in window){
			try{return JSON.parse(text);}
			catch(error){
				try{return JSON.parse('{'+text+'}');}
				catch(error){}
			}
		}
		
		try{return (new Function('return '+text))();}
		catch(error){
			try{return (new Function('return {'+text+'}'))();}
			catch(error){};
		}
		
		return {jsondecode:false};
	},
	
	toElement = (function(){
		var div = document.createElement('div');
		return function(html){
		
				// chuan hoa html
				html = html || '';
				html = html.clean();
					
				// fix DOM Exception 8 for table
				var tableChildTest = [/^<?td/gi, /^<?tr/gi, /^<?tbody/gi, /^<?thead/gi, /^<?th/gi];
				for(var i=0;i<tableChildTest.length;i++)
					if(html.test(tableChildTest[i]))
						return document.createElement(html.replace(/<|>|\//gi,''));
				
				// dung binh thuong cho truong hop khac
				div.innerHTML = html;
				var e = div.firstChild;
				div.removeChild(e);
				return e;
			};
	})(),
	
	prependElement = function(parentEl, childEl){
		var firstchildEl = parentEl.firstChild;
		if(firstchildEl)parentEl.insertBefore(childEl, firstchildEl);
		else parentEl.appendChild(childEl);
	},
	
	// may ham ve cookie
	getCookie = function(name, defaultvalue){
		defaultvalue = defaultvalue || '';
		var start = document.cookie.indexOf(name+'=');
		var len = start+name.length+1;
		if((!start)&&(name!=document.cookie.substring(0,name.length)))return defaultvalue;
		if(start==-1)return defaultvalue;
		var end = document.cookie.indexOf(';',len);
		if(end==-1)end = document.cookie.length;
		return unescape(document.cookie.substring(len,end));
	},
	setCookie = function(name,value,expires,path,domain,secure){
		value = value || '';
		var today = new Date();
		today.setTime(today.getTime());
		if(expires)expires=expires*1000*60*60*24;
		var expires_date = new Date(today.getTime()+(expires));
		document.cookie = name+'='+escape(value)+
			((expires)?';expires='+expires_date.toGMTString():'')+ 
			((path)?';path='+path:'')+
			((domain)?';domain='+domain:'')+
			((secure)?';secure':'');
		return value;
	},
	delCookie = function(name,path,domain){
		if(getCookie(name, false))
			document.cookie=name+"="+
				((path)?';path='+path:'')+
				((domain)?';domain='+domain:'')+
				';expires=Thu, 01-Jan-1970 00:00:01 GMT';
	},
	
	// some static key
	zjsfadeouttimerkey = 'zjsfadeouttimer',
	zjsfadeintimerkey = 'zjsfadeintimer',
	zjshidescaletimerkey = 'zjshidescaletimerkey',
	zjsshowscaletimerkey = 'zjsshowscaletimerkey',
	
	// TIMER CLASS
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
		
		this.stop = function(){
			window.clearTimeout(handler);
			// reset lai. moi. thu'
			handler = false;
			onStarted = false;
			x = 0;
			// goi. onStop
			if(onStop)onStop(from, to);
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
	},

	// HOOK
	Hook = (function(){
		var Hook = function(){
			// private variable
			var list = {};
			var enablehook = true;
			// public method
			this.reg = function(name, fn){
				if(!isString(name))return;
				// array
				if(isArray(fn)){for(var i=0;i<fn.length;i++)this.reg(name, fn[i]);return;};
				// function
				if(!isFunction(fn))return;
				if(typeof list[name] == 'undefined')list[name] = [];
				list[name].push(fn);
			};
			this.run = function(){
				if(!enablehook)return;
				var args = makeArray(arguments), name = args.shift();
				if(typeof list[name] == 'undefined')return;
				for(var val,i=0,n=list[name].length;i<n;i++)
					val = list[name][i].apply(this, args);
				return val;
			};
			this.enable = function(val){
				if(isBoolean(val))return enablehook = val;
				if(isString(val))return enablehook && typeof list[val] != 'undefined';
				return enablehook;
			};
		};
		return new Hook();
	})(),

	// ZJS
	isZjs = function(o){
		// return o && typeof o === "object" && o.constructor === zjs;
		return o && typeof o === "object" && ('selector' in o);
	},
	
	isZepto = isZjs;

extend(Number.prototype, {
	toString: function(){
		return (this+'');
	},
	addPadded: function(n, str){
		return this.toString().addPadded(str,n);
	},
	removePadded: function(str){
		return this.toString().removePadded(str);
	},
	toPaddedString: function(length, radix){
		var string = this.toString(radix || 10);
		return '0'.times(length - string.length) + string;
	},
	pow: function(p){
		return Math.pow(this, p || 1);
	},
	abs: function(){
		return Math.abs(this);
	},
	toInt: function(radix){
		return parseInt(this, radix || 10);
	},
	toFloat: function(radix){
		return parseFloat(this, radix || 10);
	},
	secondsToTime: function(){
		var secs = this;
		var t = new Date(1970,0,1);
		t.setSeconds(secs);
		var s = t.toTimeString().substr(0,8);
		if(secs > 86399)
			s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
		if(secs < 3600)
			s = s.substr(3);
		return s;
	}
});
extend(String.prototype, {
	toString: function(){
		return this;
	},
  	decode: function(){
		return decodeURIComponent(this);
	},
  	encode: function(){
		return encodeURIComponent(this);
	},
	stripTags: function(){
		return this.replace(/<\/?[^>]+>/gi, '');
	},
	
	/**
	* trim Polyfill.
	* trim was added to the ECMA-262 standard in the 5th edition.
	* It may not be present in all browsers.
	* For example: Internet Explorer < 9.
	**/
	trim: function(){
		return this.replace(/^[\s ]+|[\s ]+$|[\s ]+(?=\s)/g, '');
	},
	clean: function(){
		return this.replace(/\s/g,' ');
	},
	nl2br: function(a){a=a||1;
		return this.replace(/\n/gi,'<br>'.times(a));
	},
	left: function(n){
		return this.substring(0,n);
	},
	right: function(n){
		return this.substring(this.length - n);
	},
	mid: function(n,len){
		return this.substring(n, n + len);
	}, // = substr
	cutLeft: function(n){
		return this.substring(n, this.length);
	},
	cutRight: function(n){
		return this.slice(0, -n);
		// return this.substring(0, this.length - n);
	},
	insert: function(n, str){
		return this.left(n) + str + this.cutLeft(n);
	},
	format: function(obj, _prefix){
		_prefix = _prefix || '';
		if(typeof obj != 'object'){
			var s = this, length = arguments.length; 
			while (--length >= 0)  s = s.replace(new RegExp('(\\$|#){' + length + '\\}', 'g'), arguments[length]);
			return s+'';
		};
		var s = this;
		eachItem(obj, function(value, key){
			if(typeof value == 'object'){
				for(var j in value)
					s = s.format(value, _prefix+key+'\\.');
			}
			else if(typeof value == 'string' || typeof value == 'number'){
				s = s.replace(new RegExp('(\\$|#){'+_prefix+key+'\\}', 'g'), value);
				s = s.replace(new RegExp('(\\$|#){'+_prefix+key+'\\+1\\}', 'g'), parseInt(value)+1);
			};
		});
		return s+'';
	},
	test: function(reg){
		return reg.test(this);
	},
	contains: function(substr){
		return !!~this.indexOf(substr);
	},
	addPadded: function(str, n){
		var a = [], self = this; str = str || '.';
		n = n || 3;
		while(self.length > n){
			a.push(self.right(n));
			self = self.cutRight(n);
		};
		a.push(self);
		self='';
		for(var i=0;i<a.length;i++)
			self = ( i < a.length-1 ? str : '') + a[i] + self;
		return self;
	},
	removePadded: function(str){
		str = str || '.';
		return (this.split(str)).join('');
	},
	times: function(count){count=count||0;
		return count < 1 ? '' : new Array(count + 1).join(this);
	},
	toInt: function(radix){
		return parseInt(this, radix || 10);
	},
	toFloat: function(radix){
		return parseFloat(this, radix || 10);
	},
	camelCase: function(){
		return this.replace(/-([a-z]|[0-9])/ig, function(all, letter){return (letter+"").toUpperCase();});
	},
	crop: function(totalChar){
		totalChar = totalChar || 100;
		
		// neu nhu ngan' qua' thi` thoi
		if(this.length <= totalChar)
			return this;
		
		// gio` se~ cat' chuoi~
		var text = this.substring(0, totalChar+1), c='';
		// sau khi cat' xong se~ lam` lai. cho dep.
		do{
			// lay ra ky tu. cuoi cung
			c = text.substring(text.length-1, text.length);
			text = text.substring(0, text.length-1);
			// neu ky' tu. cuoi cung` la` text thi` cat' tiep'
			// con` neu' no' la` khoang trang thi` thoi
		}while( text.length > 0 && c != ' ' );
		return text;
	},
	removeVietnameseCharacter: function(){
		return''==this?'':this
			.replace(/[\u00e0\u00e1\u1ea1\u1ea3\u00e3\u00e2\u1ea7\u1ea5\u1ead\u1ea9\u1eab\u0103\u1eb1\u1eaf\u1eb7\u1eb3\u1eb5]/g,'a')
			.replace(/[\u00c0\u00c1\u1ea0\u1ea2\u00c3\u00c2\u1ea6\u1ea4\u1eac\u1ea8\u1eaa\u0102\u1eb0\u1eae\u1eb6\u1eb2\u1eb4]/g,'A')
			.replace(/[\u00e8\u00e9\u1eb9\u1ebb\u1ebd\u00ea\u1ec1\u1ebf\u1ec7\u1ec3\u1ec5]/g,'e')
			.replace(/[\u00c8\u00c9\u1eb8\u1eba\u1ebc\u00ca\u1ec0\u1ebe\u1ec6\u1ec2\u1ec4]/g,'E')
			.replace(/[\u00f2\u00f3\u1ecd\u1ecf\u00f5\u00f4\u1ed3\u1ed1\u1ed9\u1ed5\u1ed7\u01a1\u1edd\u1edb\u1ee3\u1edf\u1ee1]/g,'o')
			.replace(/[\u00d2\u00d3\u1ecc\u1ece\u00d5\u00d4\u1ed2\u1ed0\u1ed8\u1ed4\u1ed6\u01a0\u1edc\u1eda\u1ee2\u1ede\u1ee0]/g,'O')
			.replace(/[\u00ec\u00ed\u1ecb\u1ec9\u0129]/g,'i')
			.replace(/[\u00cc\u00cd\u1eca\u1ec8\u0128]/g,'I')
			.replace(/[\u00f9\u00fa\u1ee5\u1ee7\u0169\u01b0\u1eeb\u1ee9\u1ef1\u1eed\u1eef]/g,'u')
			.replace(/[\u00d9\u00da\u1ee4\u1ee6\u0168\u01af\u1eea\u1ee8\u1ef0\u1eec\u1eee]/g,'U')
			.replace(/[\u1ef3\u00fd\u1ef5\u1ef7\u1ef9]/g,'y')
			.replace(/[\u1ef2\u00dd\u1ef4\u1ef6\u1ef8]/g,'Y')
			.replace(/[\u0111]/g,'d')
			.replace(/[\u0110]/g,'D')
			.replace(/[\u0301\u0300\u0323\u0309\u0303]/g, ''); // Unicode to hop ('`.?~)
	},
	isEmail: function(){
		var re = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		return re.test(this);
	},
	jsonDecode: function(){
		return jsonDecode(this);
	},
	hashCode: function(){
		var hash = 0, i, chr, len;
		if(this.length == 0)return hash;
		for(i = 0,len = this.length; i < len; i++){
			chr   = this.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	},
	
	/**
	* https://github.com/resrcit/resrc.js/blob/master/src/resrc.js
    * Split any well-formed URI into its parts.
    * Hat Tip to Steven Levithan <stevenlevithan.com> (MIT License)
    * @property authority
    * @property query
    * @property directory
    * @param str
    * @returns {object}
    */
	parseUri: function(){
		var o = {
			key: ["source", "protocol", "authority", 
		 		"userInfo", "user", "password", 
		 		"host", "port", "relative", 
		 		"path", "directory", "file", "query", "anchor"],
			q: {
				name : "queryKey",
				parser : /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		};

		// Fix the parser not playing nice with the @ signs in URL's such as: http://example.com/@user123
		var str = this.replace(/@/g, "%40");
		var m = o.parser.exec(str);
		var uri = {};
		var i = 14;
		while (i--){
		 uri[o.key[i]] = m[i] || "";
		};
		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if($1)
			uri[o.q.name][$1] = $2;
		});

		var fileSplt = uri.file.split(".");
		uri.filename = fileSplt[ 0 ];
		uri.ext = ( fileSplt.length > 1 ? fileSplt[ fileSplt.length - 1 ] : "" );

		return uri;
	},
	
	/**
	* http://stackoverflow.com/questions/5796718/html-entity-decode
    * HTML Entity Decode
    */
	decodeEntities: (function() {
		// this prevents any overhead from creating the object each time
		var element = document.createElement('div');

		return function(){
			var str = this;
			// strip script/html tags
			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
			str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
			element.innerHTML = str;
			str = element.textContent;
			element.textContent = '';

			return str;
		}
	})(),
});
extend(Function.prototype, {
	delay: function(){
	 	var f = this, args = makeArray(arguments), t = args.shift();
	 	return window.setTimeout(function(){return f.apply(f,args)},t);
	}
});
extend(Event.prototype, {
	getData: function(){
	 	return this._args || null;
	},
	getKeyCode: function(){
	 	return -1;
	}
});
extend(KeyboardEvent.prototype, {
	getTarget: function(){
		return this.target || this.srcElement;
	},
	getKeyCode: function(){
	 	return this.keyCode;
	}
});
extend(MouseEvent.prototype, {
	stop: function(){
		if(isFunction(this.stopPropagation))
			return this.stopPropagation();
	},
	getOriginal: function(){
		return this;
	},
	getTarget: function(){
		return this.target || this.srcElement;
	},
	getToTarget: function(){
		return this.relatedTarget || this.toElement || this.target || this.srcElement;
	},
	getClientX: function(){
		var ePageX = this.pageX || 0;

		// fix pageX, pageY in touchdevice
		if(this.type == "touchstart" || this.type == "touchmove" || this.type == "touchend"){
			if(isMobileDevice() && isTouchDevice() && 'targetTouches' in this && this.targetTouches.length > 0){
				ePageX = e.targetTouches[0].pageX;
			}
		}

	 	return (this.clientX ? this.clientX + document.body.scrollLeft : ePageX);
	},
	getClientY: function(){
		var ePageY = this.pageY || 0;

		// fix pageX, pageY in touchdevice
		if(this.type == "touchstart" || this.type == "touchmove" || this.type == "touchend"){
			if(isMobileDevice() && isTouchDevice() && 'targetTouches' in this && this.targetTouches.length > 0){
				ePageY = e.targetTouches[0].pageY;
			}
		}

	 	return (this.clientY ? this.clientY + document.body.scrollTop : ePageY);
	},
	getDeltas: function(){
		var delta = 0,
			deltaX = 0,
			deltaY = 0;
		
		// lay' ra gia' tri. delta nhu binh` thuong`
		if(this.wheelDelta)delta= this.wheelDelta/120; /* IE/Opera */
		// Mozilla case.
		// In Mozilla, sign of delta is different than in IE.
		// Also, delta is multiple of 3.
		if(this.detail    )delta=-this.detail/3; 
		
		// lay' ra gia' tri. delta moi' ung' voi' 2 truc.
		deltaY = delta;
		
		// Gecko
		if(this.axis !== undefined && this.axis === this.HORIZONTAL_AXIS){
			deltaY = 0;
			deltaX = -1 * delta;
		}
		
		// Webkit
		if(this.wheelDeltaY !== undefined)deltaY = this.wheelDeltaY/120;
		if(this.wheelDeltaX !== undefined)deltaX = -1 * this.wheelDeltaX/120;

		return [delta, deltaX, deltaY];
	},
	getDeltaX: function(){
		return this.getDeltas()[1];
	},
	getDeltaY: function(){
		return this.getDeltas()[2];
	},
	isTouchpad: function(){
		var a = Math.abs(this.getDeltaY());return parseInt(a)<a;
	}
});

extend(zjs, {
	isZjs: isZjs,
	isZepto: isZepto,
	extendCore: function(name, fn){
		if(isString(name) && zjs.isFunction(fn)){var fns={};fns[name]=fn;return extend(zjs, fns);};
		if(isObject(name))return extend(zjs, name);
	},
	extendMethod: function(name, fn){
		if(isString(name) && isFunction(fn)){var fns={};fns[name]=fn;return extend(zjs.fn, fns);};
		if(isObject(name))return extend(zjs.fn, name);
	}
});

// extend to core
zjs.extendCore({
	isBoolean: isBoolean,
	isString: isString,
	isDate: isDate,
	isObject: isObject,
	isElement: isElement,
	clone: clone,
	eachItem: eachItem,
	foreach: eachItem,
	browser: browser,
	makeArray: makeArray,
	objectKeys: objectKeys,
	objectIndexOf: objectIndexOf,
	getValueByKey: getValueByKey,
	isTouchDevice: isTouchDevice,
	isMobileDevice: isMobileDevice,
	supportFlexbox: supportFlexbox,
	supportOpacity: supportOpacity,
	supportHistory: supportHistory,
	supportTransform: supportTransform,
	supportTransition: supportTransition,
	supportTranslate3d: supportTranslate3d,
	supportClassList: supportClassList,
	stylePropertyNames: stylePropertyNames,
	matchMedia: function(q){return matchMedia.call(window, q)},
	requestAnimationFrame: function(c){return requestAnimationFrame.call(window, c)},

	required: function(){},
	require: function(){
		var args = makeArray(arguments);
		if(args.length<=0)return;
		if(args.length==1 && isString(args[0]))return require(args[0], function(){return false});
		if(args.length>=2 && isString(args[0]) && isFunction(args[1]))return require(args[0], args[1]);
	},
	onready: function(){
		var args = makeArray(arguments);
		if(args.length<=0)return;
		if(args.length==1 && isFunction(args[0]))return domReady(args[0]);
		if(args.length>=2 && isString(args[0]) && isFunction(args[1]))return require(args[0], function(){domReady(args[1])});
	},
	onload: function(){
		var args = makeArray(arguments);
		if(args.length<=0)return;
		if(args.length==1 && isFunction(args[0]))return domLoaded(args[0]);
		if(args.length>=2 && isString(args[0]) && isFunction(args[1]))return require(args[0], function(){domLoaded(args[1])});
	},
	hook: function(name, fn){
		if(isString(name))Hook.reg(name, fn);
		if(isObject(name))eachItem(name, function(fn, name){Hook.reg(name, fn)});
	},
	enablehook: Hook.enable, 
	getUniqueId: (function(){
		var id=0;return function(){return ++id;};
	})(),
	jsonEncode: jsonEncode,
	jsonDecode: jsonDecode,
	// ajax: makeajaxFn(zjs),
	timer: function(o){
		return new Timer(o);
	},
	random: function(min,max){
		return parseInt( Math.random() * ( max - min ) ) + min;
	},
	rand: function(min,max){
		return parseInt( Math.random() * ( max + 1 - min ) ) + min;
	},
	cookie: {get: getCookie, set: setCookie, del: delCookie},
});

// zjs method that zepto miss
zjs.extendMethod({
	count: zjs.fn.size,
	item: function(index, realElement){
		var elem = this[index];
		if( realElement )
			return elem;
		return zjs( elem );
	},
	eachElement: function(fn){
		if( ! isFunction(fn) || this.length == 0){
			return this;
		}
		for(var i = 0; i < this.length; i++){
			if( isElement(this[i]) || this[i] == window || this[i] == document || this[i] == document.body )
				if( fn(this[i], i) === false )
					break;
		}
		return this;
	},
	// is: function(selector){},
	isTheSame: function(elems){
		if( isElement( elems ) )
			elems = [ elems ];
		if( zjs.isZjs(elems) ){
			var _elems = [];
			elems.eachElement(function(_el){
				_elems.push(_el);
			});
			elems = _elems;
		};
		var theSame = true;
		this.eachElement(function(elem){
			for(var i=0;i < elems.length;i++)
				if(elem != elems[i]){
					theSame = false;
					return false;
				}
		});
		return theSame;
	},
	tagName: function(){
		var el = this.item(0,true),
			tagname = null;
		try{tagname = el.tagName;}catch(e){};
		if(tagname == null)tagname='';
		return tagname;
	},
	// filter: function(selector){},
	// find: function(selector){},
	findUp: function(selector){
		var parentEls = [];
		this.eachElement(function(el){
			var parentEl = el.parentNode;
			while(parentEl){
				// neu nhu len toi cap document roi thi thoi luon
				if(parentEl == document){
					parentEl = false;
					break;
				};
				// con chua len top cap docment (moi chi la html thoi)
				// thi van cho tiep tuc :D
				// neu nhu ma dung chuan roi thi thoi luon
				if(zjs(parentEl).is(selector)){
					parentEls.push(parentEl);
					break;
				};
				// tiep tuc tim kiem len cap cao hon
				parentEl = parentEl.parentNode;
			};
		});
		// sau do qua buoc tiep theo
		// moi loc ra cac thang parent bi trung nhau
		// boi vi co the may thang con trung nhau parent
		var parentEl2s = [];
		for(var i=0,n=parentEls.length;i<n;i++){
			var identical = false;
			for(var j=0,k=parentEl2s.length;j<k;j++)
				if(parentEls[i] == parentEl2s[j]){
					identical = true;
					break;
				};
			if(!identical)
				parentEl2s.push(parentEls[i]);
		};
		// xong
		return zjs(parentEl2s);
	},
	// siblings: function(){},
	nextSibling: function(){
		var els = [];
		this.eachElement(function(el){els.push(el.nextSibling)});
		return zjs(els);
	},
	previousSibling: function(){
		var els = [];
		this.eachElement(function(el){els.push(el.previousSibling)});
		return zjs(els);
	},
	getParent: function(relative){
		// relative option se get ra parent element
		// nhung ma parent nay se la parent co position relative/absolute/fixed
		// hoac la body luon
		relative = relative || false;
		var elem = false;
		this.eachElement(function(e){elem = e;return false;});
		elem = elem.parentNode;
		
		// neu nhu khong yeu cau get ra relative thi vay la xong roi
		if(!relative)return zjs(elem);
		
		// neu yeu cau relative thi phai di nguoc len tren de tim
		var position = '';
		while(elem){
			// neu truy toi body luon roi thi thoi
			if(elem == document.body)break;
			// kiem tra coi element nay co thoa man relative chua
			try{
				var zParentEl = zjs(elem);
				// neu nhu element la table roi thi coi nhu la co relative roi
				if(zParentEl.is('table'))break;
				position = zParentEl.getStyle('position');
				if(position=='relative' || position=='absolute' || position=='fixed')break;
			}catch(err){};
			elem = elem.parentNode;
		};
		return zjs(elem);
	},
	// parent: function(relative){}, /* use zepto */
	relativeParent: function(){
		return this.getParent(true);
	},
	child: function(reverse){
		var elems = [];
		this.eachElement(function(e){
			var childs = e.childNodes,
				n = childs.length;
			for(var i=0;i<n;i++)
				elems.push(childs[i]);
		});
		if(typeof reverse != 'undefined' && reverse==true)
			elems = elems.reverse();
		return zjs(elems);
	},
	childReverse: function(){
		return this.child(true);
	},
	lastChild: function(realElement){
		return this.item(this.count()-1, realElement);
	},
	// next: function(){},
	// prev: function(){},
	getAttr: function(att, defaultVal){
		if(!isDefined(defaultVal))
			defaultVal = null;
		var attr = this.attr(att); 
		if(attr == null)attr = defaultVal;
		return attr;
	},
	setAttr: function(att, val){
		return this.attr(att, val);
	},
	removeAttr: function(att){
		return this.attr(att, null);
	},
	setInnerHTML: function(){
		var args = makeArray(arguments);
		if(args.length<1)return this.getInnerHTML('');
		if(isFunction(args[0]))args[0]=args[0].call(this);
		if(isObject(args[0]) && isFunction(args[0].toString))args[0]=args[0].toString();
		if(isNumeric(args[0]))args[0]=args[0]+'';
		if(!isString(args[0]))return this;
		
		// call main loop
		var string = args[0], stringBk = args[0];
		this.eachElement(function(el){
			if(Hook.enable('before_setInnerHTML'))string = Hook.run('before_setInnerHTML',el,stringBk);
			try{el.innerHTML = string;}catch(er){};
			if(Hook.enable('after_setInnerHTML'))Hook.run('after_setInnerHTML',el,stringBk);
		});
		return this;
	},
	// html: function(){},
	getInnerHTML: function(defaultStr){
		defaultStr = defaultStr || '';
		if(!isString(defaultStr))defaultStr = '';
		if(this.count()<=0)return defaultStr;
		try{return this.item(0,true).innerHTML;}catch(e){};
		return defaultStr;
	},
	getInnerText: function(){
		return this.getInnerHTML().stripTags();
	},
	getPlainText: function(){
		var content = this.getInnerHTML()
						.replace(/\n/gi,"")
						.replace(/<(br|li|ul|p)\s?\/?>/gi,"\n");
		return content.stripTags();
	},
	isChecked:function(){
		var checked = false;
		this.eachElement(function(el){
			checked = el.checked;
			return false;
		});
		return checked;
	},
	check: function(value){
		if(typeof value == 'undefined')value = '';
		return this.eachElement(function(el){
			// gio se xem coi cai element nay thuoc radio/checkbox
			var zEl = zjs(el);
			if(zEl.is('[type=radio]')){
				try{el.checked = zEl.is('[value="'+value+'"]');}catch(err){};
			};
			if(zEl.is('[type=checkbox]')){
				try{el.checked = value;}catch(err){};
			};
		});
	},
	selected:function(value){
		if(typeof value == 'undefined')value = '';
		return this.eachElement(function(el){
			try{el.selected = value;}catch(err){};
		});
	},
	// on: function(){},
	// trigger: function(){},
	// distractAllEventTo: function(){},
	// removeAllDistractEvent: function(){},
	live: function(){
		// dau tien la kiem tra thu coi truyen vao may agruments
		var args = makeArray(arguments);
		if(args.length<2)return this;
		// bat dau bind event = on method
		zjs(document).on(args[0], this.query(), args[1]);
		return this;
	},
	click: function(fn){
		// dau tien la kiem tra thu coi truyen vao may agruments
		var args = makeArray(arguments);
		if(args.length<1)return this.trigger('click');
		return this.on('click', args[0]);
	},
	hover: function(fn, fno){
		return this.longHover(fn, fno, 0);
	},
	longHover: function(fn, fno, miliseconds){
	
		miliseconds = miliseconds || 0;

		return this.eachElement(function(element){

			var self = zjs(element),
				// cho 1 xiu roi moi goi function cua nguoi dung
				waitOnInCallback = -1,
				// xem coi co cho phep thuc hien function call out hay khong?
				allowCallOnOutCallback;

			var isIn = false;
			
			// var catchEl = 
			// console.log('element', element);

			self.on('mouseover', function(event){
				if(typeof fn != 'function')return;
				if(isIn)return;isIn = true;
				if(waitOnInCallback > 0)return;

				// tu gio tro di se khong allow outCallback duoc thuc hien
				allowCallOnOutCallback = false;

				// cai nay la dien ra tuc thi luon
				if(miliseconds <= 0){
					fn.call(self, event, element);
					allowCallOnOutCallback = true;
					waitOnInCallback = -1;
					return;
				};

				// support truong hop delay callback
				waitOnInCallback = window.setTimeout(function(){
					fn.call(self, event, element);
					allowCallOnOutCallback = true;
				}, miliseconds);
				
			});

			var onMouseOut = function(event, forceOut){
				// neu nhu thang onInCallback chua duoc goi
				// thi se khong cho thang onOutCallback goi
				if(!allowCallOnOutCallback)return;
				if(!isIn)return;
				// khong the set isIn cho nay
				// boi vi co the onMouseOut
				// nhung ma cai element bi out ra
				// khong phai la cai element chinh xac can track
				// wrong >>> isIn = false;

				// xem coi co the la out cai thang cha, boi vi chay vo trong thang con
				// nen cho nay can track
				if(!forceOut){
					try{
						// xem coi thang to element la di toi dau
						// var toElement = currentMouseElement;
						// var toElement = event.toElement;
						// console.log('toElement', mouseTop, toElement);
						var toElement = event.toTarget();
					
						// neu nhu co nguon goc tu element dang xet
						// thi se bo qua
						while(toElement){
							if(toElement == element)return;
							if(toElement == document)break;
							toElement = toElement.parentNode;	
						};
					}catch(err){};
				};
				
				// clear & reset timer ngay
				if(waitOnInCallback > 0){
					window.clearTimeout(waitOnInCallback);
					waitOnInCallback = -1;
				};

				isIn = false;

				if(isFunction(fno))
					fno.call(self, event, element);
			};

			self.on('mouseout', function(event){
				onMouseOut(event, false);
			});
			// zjs(document).on('mouseout', onMouseOut);

			zjs(window).on('mouseout', function(event){
				if(event.getOriginal().toElement == null && event.getOriginal().relatedTarget == null){
					onMouseOut(event, true);
				};

			});


		});
	},
	clickout: function(handler){
		return this.eachElement(function(element){
			zjs(document).click(function(event){
				try{
					// xem coi thang to element la di toi dau
					var toElement = event.toTarget();
					// neu nhu co nguon goc tu element dang xet
					// thi se bo qua
					while(toElement){
						if(toElement == element)return;
						if(toElement == document)break;
						toElement = toElement.parentNode;	
					};
				}catch(err){};
				// bay gio chung to la dung click vao document roi
				// thuc hien callback
				if(isFunction(handler))handler.call(zjs(element), event, element);
			});
		});
	},
	mouseWheel: function(handler){
		return this.on('mousewheel', handler);
	},
	drag: function(opt){
		
		var mousedownevent = 'mousedown',
			mousemoveevent = 'mousemove',
			mouseupevent = 'mouseup';
		
		// ho tro luon touch nen phai check truoc
		if(isTouchDevice()){
			// dung chung (boi vi co the nhieu khi dang chay window8
			mousedownevent = 'mousedown, touchstart';
			mousemoveevent = 'mousemove, touchmove';
			mouseupevent = 'mouseup, touchend';

			// nhung neu ma tren iso, android thi ko dung mousedown luon, do mat cong
			if(isMobileDevice()){
				mousedownevent = 'touchstart';
				mousemoveevent = 'touchmove';
				mouseupevent = 'touchend';
			};
		};
	
		return this.eachElement(function(element){
			
			var option = extend({
				onStart: function(event, element){},
				onDrag: function(event, element, mouse, style){},
				onDrop: function(event, element, mouse, style){},
				// mac dinh se ho tro 2 direction luon
				// con neu nhu thiet lap direction la vertical, horizontal
				direction: ''
			}, opt);
		
			var mouseStart = {},
				mouse = {},
				style = {},
				readyToMove = false,
				currentElement = false,
				preventClick = false,
				
				// cac bien phuc vu cho muc dich chinh 
				checkedReponsibilityHandler = false,
				touchStartPos = 0,
				touchOtherStartPos = 0,
				deltaSlide = 0,
				deltaOtherSlide = 0,
				
				// handlers
				mousemoveHandler = function(event){
					if( ! readyToMove )return;
					
					mouse = {x: event.getClientX() - mouseStart.x, y: event.getClientY() - mouseStart.y};
									
					var eventTouchX = event.getClientX(),
						eventTouchY = event.getClientY();
				
					// phuc vu cho muc dich prevent drag theo direction khong mong muon
					if(option.direction != ''){
					
						if(option.direction == 'horizontal'){
							deltaSlide = eventTouchX - touchStartPos;
							deltaOtherSlide = eventTouchY - touchOtherStartPos;
						};
						if(option.direction == 'vertical'){
							deltaSlide = eventTouchY - touchStartPos;
							deltaOtherSlide = eventTouchX - touchOtherStartPos;
						};
				
						// neu nhu > 5 roi thi moi quyet dinh coi la drag element hay la move scrollbar (browser default hander)	
						if(!checkedReponsibilityHandler){
					
							// neu nhu delta <5 thi chua quyet dinh lam gi het
							if((deltaSlide > 5 || deltaSlide < -5) && (deltaOtherSlide > 5 || deltaOtherSlide < -5))
								return;
						
							// neu nhu ma deltaOther > delta tuc la khong phai muc dich la drag cai element nay
							if(Math.abs(deltaOtherSlide) > Math.abs(deltaSlide)){
								readyToMove = false;
								return;
							};
					
							// con khong thi chung to la muon move slider
							checkedReponsibilityHandler = true;
						};
					};
											
					event.preventDefault();
					event.stopPropagation();
					
					if( option.onDrag )option.onDrag( event, currentElement, mouse, style );
					
					// khong cho thuc hien click neu nhu move mouse khong xa
					preventClick = (Math.abs(mouse.x) > 1 || Math.abs(mouse.y) > 1);
				},
				mouseupHandler = function(event){
					if( ! readyToMove )return;
					readyToMove = false;
					if( option.onDrop )
						option.onDrop( event, currentElement, mouse, style );
				};
			
			// bind event cho no
			zjs(element).on(mousedownevent, function(event, element){
				
				element = element || this;
				if(isZjs(element))element = element.item(0, true);

				// voi img element tren firefox co van de
				// firefox se auto drag cai image di luon nen phai prevent default
				try{
					if(element.tagName == 'IMG' /*&& browser.name == 'firefox'*/)
						event.preventDefault();
				}catch(err){};
				
				mouseStart = { x: event.getClientX(), y: event.getClientY() };
				
				// khoi tao cac gia tri cho muc dich prevent drag theo direction khong mong muon
				checkedReponsibilityHandler = false;
				if(option.direction == 'horizontal'){
					touchStartPos = event.getClientX();
					touchOtherStartPos = event.getClientY();
				};
				if(option.direction == 'vertical'){
					touchStartPos = event.getClientY();
					touchOtherStartPos = event.getClientX();
				};
				
				
				// reset mouse lo nhu trong truong hop ko co move
				mouse = {x:0, y:0};
				
				style = {
					top: element.offsetTop || 0,
					left: element.offsetLeft || 0,
					height: element.offsetHeight || 0,
					width: element.offsetWidth || 0
				};
				readyToMove = true;
				currentElement = element;
				if( option.onStart )
					option.onStart( event, currentElement);
			});

			// luc' nay` moi bat dau` bind event cho document
			zjs(document).on(mousemoveevent, mousemoveHandler)
						.on(mouseupevent, mouseupHandler);
			
			// bind luon event click de xu ly khong cho goi onclick khi ma drag
			zjs(element).on('click', function(event){
				if(!preventClick)return;
				preventClick = false;
				event.preventDefault();
				event.stop();
			});
			
			/*
			// Implement Native Drag and Drop
			element.addEventListener('dragover', function(event){
				event.preventDefault();
			});
			element.addEventListener('dragenter', function(event){
				event.preventDefault();
			});
			fatherElement.addEventListener('drop', function(event){
				element = event.dataTransfer;
			});
			*/
			
		});
	},
	getValue: function(defaultVal){
		defaultVal = defaultVal || '';
		var val = this.val();
		if(!val)val = defaultVal;
		return val;
	},
	setValue: function(val){
		if(typeof val == 'undefined')val='';
		this.eachElement(function(el){
			try{el.value = val;
			
			// run hook
			if(Hook.enable('after_setValue'))Hook.run('after_setValue',el);
			
			}catch(err){};
		});
		return this;
	},
	getCss: function(){
		var element = this.item(0,true),
			cssstyledeclaration = false;
		try{cssstyledeclaration = document.defaultView.getComputedStyle(element,null);}catch(er){};
		if(!cssstyledeclaration)return '';
		return cssstyledeclaration.cssText;
	},
	// style: function(){},
	getStyle: function(key, num){

		if(zjs.isArray(key)){
			var returnValue = {};
			for(var i =0;i<key.length;i++)
				returnValue[key[i]] = zjs(this).getStyle(key[i], num);
			return returnValue;
		};

		if(!zjs.isString(key))
			return false;

		var val = false;

		// some special case that not style
		if(key == 'scrollLeft')
			return this.item(0, true).scrollLeft;
		if(key == 'scrollTop')
			return this.item(0, true).scrollTop;
		
		key = key.replace(/([A-Z])/g, function(a,l){return '-'+l.toLowerCase();});

		// --
		// hack
		// some special zjs case
		if(key == 'zjs-integer'){
			val = parseInt(this.getAttr('data-zjs-integer', 0));
			if(val === false || isNaN(val))val = 0;
			return val;
		};
		if(key == 'zjs-string')return this.getAttr('data-zjs-string', '');
		if(key == 'content')return this.html();
		// --
		
		// fix key trong truong hop dac biet (co vender prefix)
		// transform => -webkit-transform
		if(key in stylePropertyNames)
			key = stylePropertyNames[key].cssname;
		
		this.eachElement(function(e){
			// may cai dac biet
			if(e==document && key=='height'){val = Math.max(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), Math.max(document.body.offsetHeight, document.documentElement.offsetHeight), Math.max(document.body.clientHeight, document.documentElement.clientHeight));return false;};
			if(e==document && key=='width'){val = Math.max(Math.max(document.body.scrollWidth, document.documentElement.scrollWidth), Math.max(document.body.offsetWidth, document.documentElement.offsetWidth), Math.max(document.body.clientWidth, document.documentElement.clientWidth));return false;};
			if(e==window && key=='height'){val = window.innerHeight;return false;};
			if(e==window && key=='width'){val = window.innerWidth;return false;};
			if(!val || (val=='auto' && num)){
				if(key == 'top')val = e.offsetTop;
				if(key == 'left')val = e.offsetLeft;
				if(key == 'height')val = e.offsetHeight;
				if(key == 'width')val = e.offsetWidth;
				if(key == 'bottom'){
					// neu nhu la body
					// thi bottom la 0 roi
					if(e == document.body){val = 0;return false;};
					// voi bottom thi phai lay height cua parent element tru di top
					// nhung ma top dc baseon parent nao ma co position la relative/absolute/fixed
					// nen phai di get duoc parent element nao ma co position relative/absolute/fixed moi dung
					var parent = zjs(e).relativeParent().item(0,true);
					// neu nhu ma get ra duoc thi quoc thoi - con khong thi bo tay
					if(parent){
						var pheight = parent.offsetHeight;
						// neu nhu la body, thi phai kiem tra coi body co position
						// relative chua, neu nhu chua co thi phai check lai pheight
						// boi vi luc nay thi thang con cua body
						// se canh position theo window
						// ma khong canh theo body (tai position cua body khong relative)
						if(parent == document.body){
							var position = zjs(parent).getStyle('position');
							if(position == 'static' || position == '')
								pheight = Math.min(window.innerHeight, document.body.scrollHeight);
						};
						val = pheight - zjs(e).top() - zjs(e).height();
					};
				};
				if(key == 'right'){
					if(e == document.body){val = 0;return false;};
					var parent = zjs(e).relativeParent().item(0,true);
					// neu nhu ma get ra duoc thi quoc thoi - con khong thi bo tay
					if(parent){
						var pwidth = parent.offsetWidth;
						if(parent == document.body){
							var position = zjs(parent).getStyle('position');
							if(position == 'static' || position == '')
								pwidth = Math.min(window.innerWidth, document.body.scrollWidth);
						};
						val = pwidth - zjs(e).left() - zjs(e).width();
					};
				};
				if(key == 'rotate'){
					// truoc tien thi phai get ra style value cua thang transform cai da
					var transformVal = zjs(e).getStyle('transform');
					if(transformVal && isString(transformVal)){
						var valDeg = transformVal.match(/rotate\((\d+(\.\d+)?deg)\)/);
						if(isArray(valDeg) && valDeg.length > 1)
							val = valDeg[1];
					};
					if(val === false)val = '0deg';
				};
			};
			if(!val&&val!==0)val=e.style[key]||false;
			if(!val&&val!==0 && e.currentStyle)try{val=e.currentStyle[key]||false;}catch(er){};
			if(!val&&val!==0 && window.getComputedStyle)try{val=document.defaultView.getComputedStyle(e,null).getPropertyValue(key)||false;}catch(er){};
			if(num)val = parseInt(val,10);
			return false;
		});
		return val;
	},
	setStyle: function(key, val){
		if(typeof key == 'undefined')
			return this;
		
		// pass an object
		if( isObject(key) ){
			var self = this;
			eachItem(key, function(value, key){self.setStyle(key, value)});
			return this;
		}
		
		if(isString(val)){
			if(val.indexOf('+=')===0)
				val = this.getStyle(key).toFloat() + val.replace('+=', '').toFloat();
			else if(val.indexOf('-=')===0)
				val = this.getStyle(key).toFloat() - val.replace('-=', '').toFloat();
		}

		// pass an single value
		key = key.camelCase();
		
		// --
		// hack
		// some special case that not style
		if(key == 'scrollLeft')
			return this.eachElement(function(el){el.scrollLeft = val});
		if(key == 'scrollTop')
			return this.eachElement(function(el){el.scrollTop = val});
		// zjs special case
		if(key == 'zjsInteger'){
			val = parseInt(val);
			if(isNaN(val))val = 0;
			return this.setAttr('data-zjs-integer', val);
		}
		if(key == 'zjsString'){
			if(!isString(val))val = val+'';
			return this.setAttr('data-zjs-string', val);
		}
		if(key == 'content'){
			if(!isString(val))val = val+'';
			return this.html(val);
		}
				
		// --		
		
		// fix css3 prefix
		// doi voi webkit thi webkitTransition hay WebkitTransition deu duoc
		// tuy nhien webkitTransition la mac dinh
		// doi voi moz thi chi co MozTransition moi duoc chap nhan
		// doi voi opera thi co OTransition
		if(key in stylePropertyNames)key = stylePropertyNames[key].name;
		
		// fix css3 value
		if(isString(val))eachItem(stylePropertyNames, function(style, prop){
			val = val.replace(new RegExp(prop,'gi'), style.prefix + prop);
		});
		
		
		// fix translate3d
		if(!supportTranslate3d && isString(val))
			val = val.replace(/translate3d\(([^,]+),([^,]+),[^\)]+\)/gi, function(all, x, y){return 'translate('+x+','+y+')';});
		
		// fix background position x,y
		if(!supportBackgroundPositionXY){
			//console.log('!supportBackgroundPositionXY');
			if(key == 'backgroundPositionX'){key = 'backgroundPosition';val = val+'px 0px';};
			if(key == 'backgroundPositionY'){key = 'backgroundPosition';val = '0px '+val+'px';};
		};
		
		// fix opacity
		if(!supportOpacity && key=='opacity'){
			key = 'filter';
			val = 'alpha(opacity = '+(parseFloat(val)*100)+')';
		};
		
		
		// fix zindex
		if(key == 'zIndex'){
			val = parseInt(val);
			if(isNaN(val))val = 0;
		};
		
		
		// auto add 'px' unit
		if(isNumeric(val) && key != 'opacity' && key != 'zIndex' && key != 'rotate')val = val+'px';
		
		
		// fix rotate
		if(key == 'rotate' && 'transform' in stylePropertyNames){
			
			// tam thoi se nhu the nay
			// fix lai luon cai key va value
			key = stylePropertyNames.transform.name;
			
			// bay gio phai fix lai val cho dung unit
			val = parseFloat(val);
			val = !isNaN(val) ? val+'deg' : '0deg';
			
			// gio moi fix lai val cho dung voi style syntax
			val = 'rotate('+val+')';
		};
		
		// start set style
		return this.eachElement(function(el){try{el.style[key] = val;}catch(e){};});
	},
	copyStyleFrom: function(element){
		var csstext = zjs(element).getCss();
		this.eachElement(function(elem){
			elem.setAttribute('style',csstext);
		});
		return this;
	},
	
	// POSITION (relative position)
	// --
	top: function(val){
		// set
		if(isDefined(val))return this.setStyle('top', val);
		// get
		return this.getStyle('top', true);
	},
	bottom: function(val){
		// set
		if(isDefined(val))return this.setStyle('bottom', val);
		// get
		return this.getStyle('bottom', true);
	},
	left: function(val){
		// set
		if(isDefined(val))return this.setStyle('left', val);
		// get
		return this.getStyle('left', true);
	},
	right: function(val){
		// set
		if(isDefined(val))return this.setStyle('right', val);
		// get
		return this.getStyle('right', true);
	},
	
	// POSITION (absolute position)
	// get ra vi tri thuc su cua 1 element so voi document
	// --
	getAbsoluteTop: function(){
		var zEl = this.item(0),
			top = zEl.top() - zEl.scrollTop(),
			// get ra thang parent relative
			parent = zEl.relativeParent().item(0,true),
			_parentTop = 0;
		
		// support zscrollbar
		var scrollbarIsContentElkey = 'zmodulescrollbarthisiscontentel';
			
		// neu nhu ma get ra duoc thi quoc thoi - con khong thi bo tay
		// get tu tu ra top luon
		while(parent && parent != document.body){
			zEl = zjs(parent);
			_parentTop = zEl.getData(scrollbarIsContentElkey, false) ? 0 : zEl.top();
			top += _parentTop - zEl.scrollTop();
			parent = zEl.relativeParent().item(0,true);
		};
		return top;
	},
	getAbsoluteBottom: function(){
		var zEl = this.item(0),
			bottom = zEl.bottom(),
			// get ra thang parent relative
			parent = zEl.relativeParent().item(0,true);
			
		// neu nhu ma get ra duoc thi quoc thoi - con khong thi bo tay
		// get tu tu ra bottom luon
		while(parent && parent != document.body){
			zEl = zjs(parent);
			bottom += zEl.bottom();
			parent = zEl.relativeParent().item(0,true);
		};
		return bottom;
	},
	getAbsoluteLeft: function(){
		var zEl = this.item(0),
			left = zEl.left(),
			// get ra thang parent relative
			parent = zEl.relativeParent().item(0,true),
			_parentLeft = 0;
		
		// support zscrollbar
		var scrollbarIsContentElkey = 'zmodulescrollbarthisiscontentel';
			
		// neu nhu ma get ra duoc thi quoc thoi - con khong thi bo tay
		// get tu tu ra left luon
		while(parent && parent != document.body){
			zEl = zjs(parent);
			_parentLeft = zEl.left();
			left += _parentLeft;
			parent = zEl.relativeParent().item(0,true);
		};
		return left;
	},
	getAbsoluteRight: function(){
		var zEl = this.item(0),
			right = zEl.right(),
			// get ra thang parent relative
			parent = zEl.relativeParent().item(0,true);
			
		// neu nhu ma get ra duoc thi quoc thoi - con khong thi bo tay
		// get tu tu ra right luon
		while(parent && parent != document.body){
			zEl = zjs(parent);
			right += zEl.right();
			parent = zEl.relativeParent().item(0,true);
		};
		return right;
	},
	
	// SIZE
	// --
	// height: function(val){},
	// width: function(val){},
	
	// TRANSFORM
	rotate: function(val){
		// set
		if(isDefined(val))return this.setStyle('rotate', val);
		// get
		return this.getStyle('rotate', true);
	},
	
	// SCROLL position
	// --
	// scrollTop: function(val){},
	// scrollLeft: function(val){},
	offsetTop: function(){
		var top = 0;
		this.eachElement(function(e){
			top = e.offsetTop;
			return false;
		});
		return top;
	},
	offsetLeft: function(){
		var left = 0;
		this.eachElement(function(e){
			left = e.offsetLeft;
			return false;
		});
		return left;
	},
	focus: function(){
		this.eachElement(function(e){
			if(e.focus){
				e.focus();
				zjs(e).trigger('focus');
				return false;
			}
		});
		return this;
	},
	setClass: function(name){
		this.setAttr('class', name);
		return this;
	},
	// hasClass:function(name){},
	// addClass: function(name){},
	// removeClass: function(){},
	// toggleClass: function(name){},
	// show: function(){},
	// hide: function(){},
	toggleShowHide:function(){
		this.eachElement(function(e){
			if(e.style.display == 'none')
				zjs(e).show();
			else
				zjs(e).hide();
		});
		return this;
	},
	fadeIn: function(options){
		
		options = extend({
			from:0,
			to:1,
			time:500,
			callback:function(el){}
		}, options);

		// main each
		return this.eachElement(function(el){
			var zEl = zjs(el);
			
			// kiem tra neu nhu co 1 timer 
			// truoc roi thi se ko lam gi ca
			if(typeof zEl.getData(zjsfadeintimerkey) == 'object')
				return;
			
			// create new timer
			var timer = new Timer({
				from:options.from, 
				to:options.to, 
				time:options.time, 
				transition:'quadratic',
				onStart: function(){
					zEl.show().setStyle('opacity', 0);
				},
				onProcess: function(t){
					zEl.setStyle('opacity', t);
				},
				onFinish: function(){
					zEl.setStyle('opacity', 1);
					zEl.delData(zjsfadeintimerkey);
					// remove di opacity
					zEl.setStyle('opacity', '');
					// sau cung moi goi callback
					if(typeof options.callback == 'function')
						options.callback(el);
				}
			});
			
			// save timer handler to element
			zEl.setData(zjsfadeintimerkey, timer);
			
			// run
			zEl.getData(zjsfadeintimerkey).run();
		
		});
	},
	fadeOut: function(options){
		
		options = extend({
			from:1,
			to:0,
			time:500,
			callback:function(el){}
		}, options);

		// main each
		return this.eachElement(function(el){
			var zEl = zjs(el);
			
			// kiem tra neu nhu co 1 timer 
			// truoc roi thi se ko lam gi ca
			if(typeof zEl.getData(zjsfadeouttimerkey) == 'object')
				return;
			
			// create new timer
			var timer = new Timer({
				from:options.from, 
				to:options.to, 
				time:options.time, 
				transition:'quadratic',
				onStart: function(){
					zEl.setStyle('opacity', 1);
				},
				onProcess: function(t){
					zEl.setStyle('opacity', t);
				},
				onFinish: function(){
					zEl.hide().delData(zjsfadeouttimerkey);
					// remove di opacity
					zEl.setStyle('opacity', '');
					// sau cung moi goi callback
					if(typeof options.callback == 'function')
						options.callback(el);
				}
			});
			
			// save timer handler to element
			zEl.setData(zjsfadeouttimerkey, timer);
			
			// run
			zEl.getData(zjsfadeouttimerkey).run();
		
		});
	},
	fadeStop: function(){
		return this.eachElement(function(el){
			var zEl = zjs(el);
			
			// kiem tra stop fadeout/fadein de stop
			var timer = zEl.getData(zjsfadeouttimerkey);
			if(typeof timer == 'object')timer.stop();
			timer = zEl.getData(zjsfadeintimerkey);
			if(typeof timer == 'object')timer.stop();
			timer = zEl.getData(zjshidescaletimerkey);
			if(typeof timer == 'object')timer.stop();
			timer = zEl.getData(zjsshowscaletimerkey);
			if(typeof timer == 'object')timer.stop();
			
			// xong roi thi delete luon
			zEl.delData(zjsfadeouttimerkey).delData(zjsfadeintimerkey).delData(zjshidescaletimerkey).delData(zjsshowscaletimerkey);
		});
	},
	removeSlow: function(time){
		time = time || 500;
		var self=this;
		this.fadeOut({
				time: time,
				callback: function(El){
					zjs(El).remove();
				}
			});
		return this;
	},
	
	showScale: function(options){
		
		options = extend({
			vertical:true,
			horizontal:false,
			time:500,
			transition:'quadratic',
			callback:function(el){}
		}, options);

		// main each
		return this.eachElement(function(el){
			var zEl = zjs(el);
			
			// kiem tra neu nhu co 1 timer 
			// truoc roi thi se ko lam gi ca
			if(typeof zEl.getData(zjsshowscaletimerkey) == 'object')
				return;

			var hideScaleTimer = zEl.getData(zjshidescaletimerkey);
			if(hideScaleTimer){
				hideScaleTimer.finish();
			}
			
			// bay gio quan trong, phai di tinh toan width, height cua cai element 
			// khi ma element show ra
			// boi vi dang display none nen khong co tinh toan duoc
			// nen phai clone ra 1 cai element de tinh toan
			// truoc khi clone ra, thi disable hook cho chac an, tranh truong hop cac module auto init
			var hookstatus = Hook.enable();
			Hook.enable(false);
			var wrapCloneEl = zjs('<div></div>').setStyle({overflow:'hidden','height':0,'opacity':0}).insertAfter(zEl);
			var cloneEl = zEl.clone(true).appendTo(wrapCloneEl).show();
			var orgHeight = cloneEl.height(),
				orgWidth = cloneEl.width();
			// xong roi thi remove cai wrap di thoi
			wrapCloneEl.remove();
			// tra ve lai tinh trang hook
			Hook.enable(hookstatus);
			
			// create new timer
			var timer = new Timer({
				from:0, 
				to:1, 
				time:options.time, 
				transition:options.transition,
				onStart: function(){
					zEl.show().setStyle('overflow', 'hidden');
					if(options.vertical)zEl.height(0);
					if(options.horizontal)zEl.width(0);
				},
				onProcess: function(t){
					if(options.vertical)zEl.height(orgHeight*t);
					if(options.horizontal)zEl.width(orgWidth*t);
				},
				onFinish: function(){
					zEl.delData(zjsshowscaletimerkey);
					// remove di height, width
					zEl.setStyle('overflow', '');
					if(options.vertical)zEl.setStyle('height', '')
					if(options.horizontal)zEl.setStyle('width', '')
					// sau cung moi goi callback
					if(typeof options.callback == 'function')
						options.callback(el);
				}
			});
			
			// save timer handler to element
			zEl.setData(zjsshowscaletimerkey, timer);
			
			// run
			zEl.getData(zjsshowscaletimerkey).run();
		
		});
	},
	hideScale: function(options){
		
		options = extend({
			vertical:true,
			horizontal:false,
			time:500,
			transition:'quadratic',
			callback:function(el){}
		}, options);

		// main each
		return this.eachElement(function(el){
			var zEl = zjs(el);
			
			// kiem tra neu nhu co 1 timer 
			// truoc roi thi se ko lam gi ca
			if(typeof zEl.getData(zjshidescaletimerkey) == 'object')
				return;
			
			var showScaleTimer = zEl.getData(zjsshowscaletimerkey);
			if(showScaleTimer){
				showScaleTimer.finish();
			}

			// bay gio quan trong, phai di tinh toan width, height cua cai element hien tai
			var orgHeight = zEl.height(),
				orgWidth = zEl.width();
			
			// create new timer
			var timer = new Timer({
				from:1, 
				to:0, 
				time:options.time, 
				transition:options.transition,
				onStart: function(){
					zEl.setStyle('overflow', 'hidden');
					if(options.vertical)zEl.height(orgHeight);
					if(options.horizontal)zEl.width(orgWidth);
				},
				onProcess: function(t){
					if(options.vertical)zEl.height(orgHeight*t);
					if(options.horizontal)zEl.width(orgWidth*t);
				},
				onFinish: function(){
					zEl.hide().delData(zjshidescaletimerkey);
					// remove di height, width
					zEl.setStyle('overflow', '');
					if(options.vertical)zEl.setStyle('height', '')
					if(options.horizontal)zEl.setStyle('width', '')
					// sau cung moi goi callback
					if(typeof options.callback == 'function')
						options.callback(el);
				}
			});
			
			// save timer handler to element
			zEl.setData(zjshidescaletimerkey, timer);
			
			// run
			zEl.getData(zjshidescaletimerkey).run();
		
		});
	},
	
	// append()
	// neu nhu param truyen vao la string, 
	// tuc la phai tao element moi tu string do
	// thi se ho tro append cho tat cac cac element
	// moi element 1 elem moi
	// vd <a></a><a></a>
	// <a>.append(<b>)
	// <a><b></b></a><a><b></b></a>
	// - -
	// neu nhu param truyen vao la element hoac zjs
	// thi se append element vao element dau tien dang co
	// vd <a></a><a></a>
	// <a>.append(b)
	// <a><b></b></a><a></a>
	append: function(){
		var args = makeArray(arguments);
		if(args.length==0)return this;
		// array
		if(args.length > 1){for(var i=0;i<args.length;i++)this.append(args[i]);return this;};
		if(isArray(args[0])){for(var i=0;i<args[0].length;i++)this.append(args[0][i]);return this;};
		
		// string
		if(isString(args[0]))return this.eachElement(function(el){
			zjs(args[0]).eachElement(function(cel){
				el.appendChild(cel);
				if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',cel);
			});
		});
		
		// element
		var thisEl = this.item(0,true);
		if(isElement(args[0])){
			thisEl.appendChild(args[0]);
			if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',args[0]);
		};
		
		// zjs
		if(zjs.isZjs(args[0]))args[0].eachElement(function(el){
			thisEl.appendChild(el);
			if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',el);
		});
		
		//
		return this;
	},
	
	// prepend()
	// hoan toan tuong tu nhu append
	prepend: function(){
		var args = makeArray(arguments);
		if(args.length==0)return this;
		// array
		if(args.length > 1){for(var i=0;i<args.length;i++)this.prepend(args[i]);return this;};
		if(isArray(args[0])){for(var i=0;i<args[0].length;i++)this.prepend(args[0][i]);return this;};
		
		// string
		if(isString(args[0]))return this.eachElement(function(el){
			zjs(args[0]).eachElement(function(cel){
				prependElement(el, cel);
				if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',cel);
			});
		});
		
		// element
		var thisEl = this.item(0,true);
		if(isElement(args[0])){
			prependElement(thisEl, args[0]);
			if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',args[0]);
		};
		
		// zjs
		if(zjs.isZjs(args[0]))args[0].eachElement(function(el){
			prependElement(thisEl, el);
			if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',el);
		});
		
		//
		return this;
	},
	
	// appendTo()
	// vd <a></a><a></a>
	// <b>.appendTo(<a>)
	// <a><b></b><b></b></a><a></a>
	appendTo: function(){
		var args = makeArray(arguments);
		if(args.length==0)return this;
		zjs(args[0]).append(this);
		return this;
	},
	
	// prependTo()
	prependTo: function(){
		var args = makeArray(arguments);
		if(args.length==0)return this;
		zjs(args[0]).prepend(this);
		return this;
	},
	
	insertTo: function(element){
		return this.appendTo(element);
	},
	insertAfter: function( element ){
		var targetElem;
		if( isElement( element ) )
			targetElem = element;
		if( isString( element) )
			targetElem = zjs(element).item(0, true);
		if( zjs.isZjs( element ) )
			element.eachElement(function(el){
				targetElem = el;
				return false;
			});
		if( ! isElement( targetElem ) )
			return this;
		this.eachElement(function(el){
			var parent = targetElem.parentNode;
			if(parent.lastchild == targetElem)parent.appendChild(el);
			else parent.insertBefore(el, targetElem.nextSibling);
			if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',el);
		});
		return this;
	},
	insertBefore: function( element ){
		var targetElem;
		if( isElement( element ) )
			targetElem = element;
		if( isString( element) )
			targetElem = zjs(element).item(0, true);
		if( zjs.isZjs( element ) )
			element.eachElement(function(el){
				targetElem = el;
				return false;
			});
		if( ! isElement( targetElem ) )
			return this;
		this.eachElement(function(el){
			targetElem.parentNode.insertBefore(el,targetElem);
			if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',el);
		});
		return this;
	},
	swapWith: function(elem){
	
		if( zjs.isZjs( elem) ){
			var _elem = false;
			elem.eachElement(function(e){
				_elem = e;
				return false;
			});
			elem = _elem;
		};
		
		if( ! isElement( elem ) )
			return this;
			
		var thisElem = false;
		this.eachElement(function(e){
			thisElem = e;
			return false;
		});
		
		var thisElemClone = thisElem.cloneNode(true),
			newElemClone = elem.cloneNode(true);
			
		thisElem.parentNode.replaceChild(newElemClone, thisElem);
		elem.parentNode.replaceChild(thisElemClone, elem);
		
		return zjs( thisElemClone );
	},
	getFormData: function(){
		
		// xem coi co muon get ra nhung thang nao khong?
		// support truyen vao chinh xac cac item muon lay luon
		var args = makeArray(arguments);
		if(args.length > 0){
			// dau tien cu get nhu binh thuong thoi
			var data = this.getFormData();
			// bay gio moi di truy xuat ra tung thang haha
			var tx = function(name){
				if(!(name in data) || typeof data[name] == 'undefined'){
					// check to tryto fix the name
					if(name.match(/^(.+)\[\]$/))
						name = RegExp.$1;
				};
				if(!(name in data) || typeof data[name] == 'undefined'){
					// nan roi, return luon
					return;
				};
				return data[name];
			};
			
			if(args.length == 1)
				return tx(args[0]);
		};
		
		var formEl = this.item(0),
			inputEl = false,
			name = '',
			value = '',
			data = {},
			assignData = function(name, value){
				// fix cai name da ne
				//if(name.match(/^(.+)\[\]$/)){
				//	name = RegExp.$1;
				//	if(!name in data)data[name] = new Array();
				//	else if(!isArray(data[name]))data[name]=[data[name]];
				//};
				if(isArray(data[name]))data[name].push(value);
				else data[name] = value;
			};
			
		// loop all input and get data
		formEl.find('[name]').eachElement(function(element){
			inputEl = zjs(element);
			if(!inputEl.is('input') && !inputEl.is('textarea') && !inputEl.is('select') && !inputEl.is('button'))return;
			name = inputEl.getAttr('name','');
			if(name=='')return;
			// test de fix name lien
			if(name.match(/^(.+)\[\]$/)){
				name = RegExp.$1;
				if(!(name in data) || typeof data[name] == 'undefined')data[name] = new Array();
				else if(!isArray(data[name]))data[name]=[data[name]];
			};
			if(name=='')return;
			try{
				if(inputEl.is('[type=checkbox]') || inputEl.is('[type=radio]')){
					// get cai ten cai da
					if(!(name in data) || typeof data[name] == 'undefined')
						assignData(name, "");
					
					// neu la checkbox hoac radio thi phai checked moi get value
					if(!inputEl.isChecked())return;
				};
				// get value
				value = inputEl.getValue('');
			}catch(e){return;};
			
			// neu nhu la checkbox thi phai kiem tra tiep
			if(inputEl.is('[type=checkbox]')){
				// neu nhu lan dau tien thi gan data luon
				//if(!isDefined(data[name])){
				if(!isArray(data[name]) && data[name] === ""){
					assignData(name, value);
					return;
				};
					
				// neu da co name nay truoc do roi, thi phai insert them vao
				// vay nen phai chuyen doi thanh array
				if(!isArray(data[name]))
					data[name] = [data[name]];
				// them data vao
				assignData(name, value);
				return;
			};
			
			// neu nhu la radio thi thoi ke luon
			// cu checked thi ghi de vao, khong so trung ten, vi chi lay co 1
			//if(inputEl.is('[type=radio]')){}
			
			// voi selectbox cung lam binh thuong
			//if(inputEl.is('[type=select]')){}
			
			// voi textarea ma da bien thanh editor
			// nen se kiem tra coi co luu bien "edkey" khong
			if(inputEl.getData('zmoduleeditormceed', false)){
				inputEl.editorSave();
				value = inputEl.getValue('');
			};
			if(inputEl.getData('zmodulecodeeditored', false)){
				value = inputEl.codeEditorGetValue();
			};
			
			
			// them vao binh thuong
			assignData(name, value);
		});
		
		// gio xem coi co thang button nao la button submit form truoc do hay khong?
		var buttonSubmitEl = formEl.getData('formSubmitButton');
		if(buttonSubmitEl && buttonSubmitEl.count()>0){
			data[buttonSubmitEl.getAttr('name')] = buttonSubmitEl.getAttr('value', '');
		};
		
		return data;
	},
	// submit: function(){}
});

// handler on domready
domReady(function(zjs){
	zjs.supportTranslate3d = supportTranslate3d = supportTranslate3dTest();
});

if(typeof window.zjs == 'undefined')window.zjs = zjs;
if(typeof window.z == 'undefined')window.z = zjs;

})(window, Zepto);

// - - - - - - 
// MODULE ZJS DATA
(function(zjs, undefined){
	
	var dataarray = [];
	zjs.extendMethod({
		setData: function(name, data){
			name = name || '';if(name=='')return this;
			// moi element se co 1 data rieng biet
			// khong con chung data nhu old version
			this.eachElement(function(el){
				var dataid = -1;
				if(typeof el.zjsdataid != 'undefined')dataid = parseInt(el.zjsdataid);
				if(dataid<=-1){
					dataid = dataarray.length;
					el.zjsdataid = dataid;
					dataarray.push(Array());
				}
				// neu da set data roi thi chi can update thoi
				dataarray[dataid][name] = data;
			});
			return this;
		},
		getData: function(){
			var args = zjs.makeArray(arguments);
			if(args.length<=0)return false;
			var name = args[0];
			var defaultData = (args.length >= 2 ? args[1] : false);
			if(name=='')return defaultData;
			var el = this.item(0,true);
			if(!el)return defaultData;
			var dataid = -1;
			if(typeof el.zjsdataid != 'undefined')dataid = parseInt(el.zjsdataid);
			if(dataid<=-1 || dataid>=dataarray.length)return defaultData;
			if(typeof dataarray[dataid][name] == 'undefined')return defaultData;
			return dataarray[dataid][name];
		},
		getAllData: function(){
			// chi can lay 1 thang element dau tien lam dai dien thoi
			var el = this.item(0,true);
			var dataid = -1;
			if(typeof el.zjsdataid != 'undefined')dataid = parseInt(el.zjsdataid);
			if(dataid<=-1 || dataid>=dataarray.length)return false;
			return dataarray[dataid];
		},
		delData: function(name){
			name = name || '';if(name=='')return false;
			this.eachElement(function(el){
				var dataid = -1;
				if(typeof el.zjsdataid != 'undefined')dataid = parseInt(el.zjsdataid);
				if(dataid<=-1 || dataid>=dataarray.length)return;
				if(typeof dataarray[dataid][name] == 'undefined')return;
				dataarray[dataid][name] = null;
				try{delete dataarray[dataid][name];}catch(e){};
			});
			return this;
		},
		unsetData: function(){
			this.eachElement(function(el){
				if(typeof el.zjsdataid == 'undefined')return;
				var dataid = parseInt(el.zjsdataid);
				// don gian la ko link data id vo nua
				el.zjsdataid = -1;
				// sau do phai xoa luon data
				if(dataid<=-1 || dataid>=dataarray.length)return;
				dataarray[dataid] = null;
				try{delete dataarray[dataid];}catch(e){};
			});
			return this;
		},
		removeData: function(){
			return this.unsetData();
		}
	});

})(window.zjs);