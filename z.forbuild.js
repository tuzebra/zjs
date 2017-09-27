/////////////////////////////////////////////////////////////////////////////////
// * ZJS - Zebra JavaScript Library
// * include Sizzle - CSS selector engine
// * version: 1.1.14.12.25
// * (c) 2009-2017 Zebra <tuzebra@gmail.com>
/////////////////////////////////////////////////////////////////////////////////

;(function(window, undefined){
"use strict";

// check zjs loaded!
if('zjs' in window)return;

var version = '1.1',
	
	// private static function
	
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
	
	isNumeric = function(o){
		return !isNaN( parseFloat(o) ) && isFinite(o);
	},
	
	isString = function(o){
		return typeof o == 'string';
	},
	
	//isArray = function(o){
	//	return o && o.constructor === Array;
	//},
	isArray = Array.isArray || function (o){
		return Object.prototype.toString.call(o) === '[object Array]';
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
	
	/* Determine if a variable is a nodeList. Copyright Martin Bohm. MIT License: https://gist.github.com/Tomalak/818a78a226a0738eaade */
	isNodeList = function isNodeList(nodes){
        var stringRepresentation = Object.prototype.toString.call(nodes);
     
        return typeof nodes === 'object' &&
            /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepresentation) &&
            nodes.length !== undefined &&
            (nodes.length === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0));
    },
	
	//isFunction = function(o){
	//	return typeof o == 'function';
	//},
	isFunction = function(o){
		return Object.prototype.toString.call(o) === '[object Function]';
    },
    
    isRegExp = function(o){
		return Object.prototype.toString.call(o) === '[object RegExp]';
	},
	
	isWindow = function(o) {
		return o && typeof o === "object" && "setInterval" in o;
	},
	
	isFile = function(o) {
		return toString.call(o) === '[object File]';
	},
	
	makeArray = function(obj){
		if(!obj)return [];
		var len=obj.length, ret=new Array(len);
		while(len--)
			ret[len] = obj[len];
		return ret;
	},
	
	extend = function(destination, source, fixonly, dontoverwrite){
		fixonly = fixonly || false;
		dontoverwrite = dontoverwrite || false;
		if(isArray(source)){
			for(var i = 0; i < source.length; i++){
				if( isArray(destination) )
					destination.push( source[i] );
			}
		}
		else if(isObject(source) || isFunction(source)){
			for(var pro in source){
				if(fixonly && typeof destination[pro] == 'undefined')continue;
				if(dontoverwrite && typeof destination[pro] != 'undefined')continue;
				destination[pro]=source[pro];
			};
		};
		return destination;
	},
	
	// use object key to improve performance
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
			};

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
	
	// dung ham each thay cho Object.each() -> gay ra qua nhieu loi cho cac thu vien thu 3
	each = function(obj, fn){ // each(object, function(value, key){} )
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
	
	eachItem = each,

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
	
	
	// - - - - -
	
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
			};
		};
		
		try{return (new Function('return '+text))();}
		catch(error){
			try{return (new Function('return {'+text+'}'))();}
			catch(error){};
		};
		
		return {jsondecode:false};
	},
	
	// - - - - -
	
	// - - - - -
	// module require & dom ready
	domReadyFns = (function(){
		var domReadyFns = function(){
			var fns = [];
			this.isModuleRequired = true;
			this.isReady = (document.readyState === 'complete');
			this.add = function(fn){fns.push(fn)};
			this.run = function(fn){try{fn.call(this, zjs)}catch(err){}};
			this.runall = function(notClean){
				notClean = notClean || false;
				// call all registered functions
				for(var i = 0;i<fns.length;i++)this.run(fns[i]);
				// clear handlers
				if(!notClean){
					fns = [];
				}
			};
		};
		return new domReadyFns();
	})(),
	
	domReady = (function(){
		
		// Check if document already complete, and if so, just trigger page load listeners. 
		// Latest webkit browsers also use "interactive", and will fire the onDOMContentLoaded 
		// before "interactive" but not after entering "interactive" or "complete". More details:
		// http://dev.w3.org/html5/spec/the-end.html#the-end
		// http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
		// so removing the || document.readyState === "interactive" test.
		// There is still a window.onload binding that should get fired if
		// DOMContentLoaded is missed.

		// define stack functions to call before
		var sintid,
			useDrupalBehaviors = ('Drupal' in window) && ('behaviors' in window.Drupal),
			ready = function(){
				if(domReadyFns.isReady)return;
				domReadyFns.isReady = true;
				if(sintid)clearInterval(sintid);
				// check if all module required
				// execute all function in stack
				if(!useDrupalBehaviors && domReadyFns.isModuleRequired)
					domReadyFns.runall();
			};

		// bind ready for the first time
		// for all browsers except IE
		if(document.addEventListener){
			window.document.addEventListener('DOMContentLoaded', ready, false);
			window.addEventListener('load', ready, false);
		}else{
			window.attachEvent('onload', ready);
			// for IE
			// code taken from http://ajaxian.com/archives/iecontentloaded-yet-another-domcontentloaded
			sintid = setInterval(function(){
				// check IE's proprietary DOM members
				if(!window.document.uniqueID && window.document.expando)return;
				// you can create any tagName, even customTag like <document :ready />
				var tempNode = window.document.createElement('document:ready');
				try{
					// see if it throws errors until after ondocumentready
					tempNode.doScroll('left');
					// call ready
					ready();
				}catch(err){};
			}, 30);
		};

		// Support Drupal bigpipe
		if(useDrupalBehaviors){
			if(!('zjs' in window.Drupal.behaviors)){
				window.Drupal.behaviors.zjs = {
					attach: function (context, settings) {
						// console.log('Drupal.behaviors.zjs: context', context);
						if(domReadyFns.isModuleRequired){
							domReadyFns.runall(true);
						}
					}
				};
			}
			return function(fn){
				domReadyFns.add(fn);
				// try to run it instant
				if(domReadyFns.isReady && domReadyFns.isModuleRequired){
					domReadyFns.run(fn);
				}
			};
		}
		
		// return function to call
		return function(fn){
			if(domReadyFns.isReady && domReadyFns.isModuleRequired)
				return domReadyFns.run(fn);
			// add to the list
			domReadyFns.add(fn);
		};
		
	})(),
	
	// - - - - -
	// module require & dom onload
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
	
	// vai static key
	zjsfadeouttimerkey = 'zjsfadeouttimer',
	zjsfadeintimerkey = 'zjsfadeintimer',
	zjshidescaletimerkey = 'zjshidescaletimerkey',
	zjsshowscaletimerkey = 'zjsshowscaletimerkey',

	// BAY GIO` MOI' BAT' DAU` KHAI BAO' ZJS
	zjs = (function(){

		// main selector function
		var zjs = function(selector, contexts){
			// private variable
			var elements = [],
				self = this;
			
			// thang` function "each" la` thang` duy nhat'
			// duoc phep' can thiep. truc tiep vao` cac' element
			this.each = this.eachElement = function(fn){
				if( ! isFunction(fn) || elements.length == 0)
					return self;
				for(var i = 0; i < elements.length; i++){
					// neu nhu ma` function "fn" return dung bang` "false"
					// thi` se~ dung` vong` lap. for
					if( isElement(elements[i]) || elements[i] == window || elements[i] == document || elements[i] == document.body )
						if( fn(elements[i], i) === false )
							break;
				};
				return self;
			};
			
			// dem' coi co' bao nhieu thang` element match
			this.size = function(){return elements.length || 0;};
			this.count = function(){return elements.length || 0;};
			this.reverse = function(){elements = elements.reverse();return self;};
			
			// lay ra cau query de su dung sau
			this.query = function(){return selector;};
			
			// bay gio` moi bat dau select dom
			
			// zjs( NULL )
			if(!selector)return this;
			
			// zjs( window || document || body )
			if(selector == window || selector == 'window'){elements.push(window);return this;};
			if(selector == document || selector == 'document'){elements.push(document);return this;};
			if(selector == document.body || selector == 'body'){
				elements.push(document.body);return this;
			};
			
			// zjs( DOM )
			if(isElement(selector)){elements.push(selector);return this;};
			
			// zjs( zjs )
			if(isZjs(selector)){selector.eachElement(function(el){elements.push(el)});return this;};
			
			// zjs( array of [DOM1, DOM2, DOM3,... ] )
			if( isArray( selector ) ){
				for(var i = 0;i < selector.length;i++){
					if( isElement(selector[i]) || 
						selector[i] == document || selector[i] == document.body || 
						selector[i] == window )
						elements.push( selector[i] );
					if( isZjs(selector[i]) )
						selector[i].eachElement(function(el){elements.push(el)});
					if( isString(selector[i]) )
						zjs.call(window, selector[i]).eachElement(function(el){elements.push(el)});
				};
				return this;
			};
			
			// string
			if(!isString(selector))return this;
			
			// zjs( '<div>html code</div>' )
			if(/^<.*>$/.test(selector.clean())){elements.push(toElement(selector));return this;};
			
			// mac dinh se~ ho~ tro. nhieu` context 1 luc'
			contexts = contexts || [ document ];
			
			// fix context cho chac an
			if( !isArray(contexts) )
				contexts = [ contexts ];
			
			for(var i=0;i < contexts.length;i++){
			
				var context = contexts[i], 
					elems = [],
					done = false;
				
				// su? dung ham` selector co' san~ cua? browser 
				// cho no' mau gon le ma` lai. chinh' xac'
				if( context.querySelectorAll ){
					try{
					elems = context.querySelectorAll( selector );
					done = true;}catch(e){};
				}
				
				//	neu browser ko ho~ tro. thi` se~ dung` Sizzle
				if( ! done && window.Sizzle )
					try{
					elems = Sizzle( selector, context );}catch(e){};
				
				// merge elems voi' main "elements"
				for(var j = 0;j < elems.length;j++)
					elements.push(elems[j]);
			
			};
			
			return this;
			 
		},
		
		isZjs = function(o){
			return o && typeof o === "object" && o.constructor === zjs;
		},

		extendMethod = function(name, fn){
			if(isString(name) && isFunction(fn)){var fns={};fns[name]=fn;return extend(zjs.prototype, fns);};
			if(isObject(name))return extend(zjs.prototype, name);
		};
			
		// chi return vai` thu' don gian nhat' 
		// con` lai. ko quan tam
		// coder muon' code gi` thi` code
		// vd nhu nhung~ function "isNumber", "isElement" gi` gi` do'
		// thi` chi? co' trong scope nay` dc sai` thoi
		// con` nhung~ code ben ngoai` scope
		// thi` ko cho sai`, tu. ma` viet' cai' gi` tuy` y' ^^
		// ho~ tro. 2 ham` extendFn va` extendMethod voi' cung` 1 chuc' nang
		return extend(function(selector, contexts){
				if(isFunction(selector))
					return domReady(selector);
				return new zjs(selector, contexts);
			}, {version: version, extendFn: extendMethod, extendMethod: extendMethod, isZjs: isZjs});
	})(),
	
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
	
	// AJAX 
	makeajaxFn = function(zjs){
	
		// private variable phuc vu cho jsonp
		var requestId = 0, outTime = 20, callbackStorage = {}, timeoutStorage = {};
		var cacheResponseStorage = {};
	
		// 1 cai function global de phuc vu cho viec goi jsonp
		extend(zjs,{jsonpcallback:function(data, rid){
		
			// neu khong tim thay ham callback thi thoi
			if(typeof callbackStorage['rid'+rid]=='undefined')return;
			
			// tim thay ham callback thi thuc hien callback
			// sau do delete ham callback di luon
			callbackStorage['rid'+rid].onComplete(data);
			delete callbackStorage['rid'+rid];
			
			// neu khong tim thay timeout thi thoi
			if(typeof timeoutStorage['rid'+rid]=='undefined')return;
			
			// neu tim thay thi phai clear va xoa di timeout
			window.clearTimeout(timeoutStorage['rid'+rid]);
			delete timeoutStorage['rid'+rid];
			
			// remove script tuong ung luon
			var script=document.getElementById('rid'+rid);
			if(script)script.parentNode.removeChild(script);
			
		}});
		
		return function(option){
			option = extend({
					url:'',
					data: '',
					headers: {},
					// type: 'raw', // html, json, jsonp
					dataType: 'html', // json, jsonp
					method: 'get',
					contentType: 'application/x-www-form-urlencoded',
					repeat: -1,
					cache: true,
					cacheResponse: false,
					onBegin: false,
					onLoading: false,
					onComplete: false,
					onError: false,
					onResponse: false,
					debug: false,
					processData: true,
					withCredentials: false
				}, option);
			
			
			var callajax = function(){
				
				// fix option
				// (still fallback to support "type", 
				// because now we re replace it with "dataType"
				if('type' in option && typeof option.type != 'undefined' && !('isZepto' in zjs)){
					option.dataType = option.type;
				}

				// fix option
				// because we support Zepto, so need to support it "success" option
				if('success' in option && isFunction(option.success) && !('isZepto' in zjs)){
					option.onComplete = option.success;
				}

				// get now time to avoid cache url
				var now = 'zuid='+(new Date()).getTime(), url = option.url;
			
				// loai bo cache
				if(!option.cache)url += ((option.url).indexOf('?')+1 ? '&':'?') + now;
			
				// prepare data
				var data = option.data;
				if(option.processData && !isString(data) && isObject(option.data)){
					var str='';
					eachItem(data, function(value, key){
						if(isArray(value))
							eachItem(value, function(arrvalue){
								str += key + '[]=' + encodeURIComponent(arrvalue).replace(/%20/g,'+')+'&';
							});
						else 
							str += key + '=' + encodeURIComponent(value).replace(/%20/g,'+')+'&';
					});
					data = str.slice(0, -1);
				};
			
				// begin load
				if(typeof option.onBegin == 'function')option.onBegin();
				zjs.trigger('ajax.begin');
				
				

				// BUILD URL FIRST
				// jsonp
				if(option.dataType.toLowerCase() == 'jsonp'){
					// donothing
				}
				// normal xhr
				else{
					// method get?
					if(option.method.toLowerCase() == 'get'){
						if(isString(data) && data != '')url += (url.indexOf('?')+1 ? '&':'?') + data;
						data = null;
					};
				};
				if(option.debug && console)console.log('url', url);


				// RUN AJAX
				// cached
				if(option.cacheResponse && (url in cacheResponseStorage)){
					if(option.debug && console)console.log('[zjs ajax] use from cache: ' + url);
					var result = cacheResponseStorage[url];
					if(option.dataType.toLowerCase() == 'json')result = result.jsonDecode();
			        if(typeof option.onComplete == 'function')option.onComplete(result);
				}

				// jsonp
				else if(option.dataType.toLowerCase() == 'jsonp'){
				
					if(typeof option.onLoading == 'function')option.onLoading();
				
					// chuan bi requestid
					var rid=requestId++;
					callbackStorage['rid'+rid]={
						onComplete: option.onComplete,
						onError: option.onError
					};
				
					// send request id cho server
					url += (url.indexOf('?')+1 ? '&':'?') + 'zjsonprid='+rid;
					if(isString(data) && data != '')url += (url.indexOf('?')+1 ? '&':'?') + data;
				
					// view log?
					if(option.debug && console)console.log('get: ' + url);
				
					// bat dau tao script tag va send request
					var script=document.createElement('script');
					script.id='rid'+rid;
					script.setAttribute('type', 'text/javascript');
					script.setAttribute('src', url);
					document.getElementsByTagName('head')[0].appendChild(script);
				
					// set timeout, de biet sau thoi gian "outtime"
					// ma callback function van con do (chua xoa)
					// thi chung to la chua thuc hien dc
					// luc nay chac la da bi error roi
					timeoutStorage['rid'+rid] = window.setTimeout(function(){
						if(typeof callbackStorage['rid'+rid]=='undefined')return;
						if(typeof callbackStorage['rid'+rid].onError =='function')callbackStorage['rid'+rid].onError();
						delete callbackStorage['rid'+rid];
						var script=document.getElementById('rid'+rid);
						if(script)script.parentNode.removeChild(script);
					}, outTime*1000);
				
				}

				// cordova local file
				else if(
					// is Cordova
					((typeof cordova != 'undefined') && (typeof device != 'undefined') && device.platform != 'browser')
					// url don't have http
					&& url.indexOf('http') !== 0
				){
					if(option.debug && console)console.log('[zjs ajax] resolveLocalFileSystemURL start: ', url);
					resolveLocalFileSystemURL(url, function (fileEntry) {
					    // console.log('[zjs ajax] url: ' + url);
					    if(option.debug && console)console.log('[zjs ajax] resolveLocalFileSystemURL recieve: ' + fileEntry.name);
					    fileEntry.file(function (file) {
						    var reader = new FileReader();
						    reader.onloadend = function() {
						        var result = this.result;
						        if(option.cacheResponse){
						        	cacheResponseStorage[url] = result;
						        }
						        if(option.dataType.toLowerCase() == 'json')result = result.jsonDecode();
						        if(typeof option.onComplete == 'function')option.onComplete(result);
						    };
						    reader.readAsText(file);
						}, 
						function(err){
							if(option.debug && console)console.log('[zjs ajax] onErrorReadFile: ', JSON.stringify(err));
							if(typeof option.onError == 'function')option.onError();
						});
					    
					}, function(err){
						if(option.debug && console)console.log('[zjs ajax] onErrorReadFolder: ', JSON.stringify(err));
						if(typeof option.onError == 'function')option.onError();
					});

				}
			
				// normal xhr
				else{
			
					// get XHR
					var xhr = false;
					if(window.XMLHttpRequest){
						xhr = new XMLHttpRequest();
						xhr.withCredentials = option.withCredentials;
					}
					else if(typeof ActiveXObject != 'undefined'){
						eachItem(['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], function(str){
							try{
								xhr = new ActiveXObject(str);
							}catch(e){};
							if(xhr)
								return false;
						});
					};
				
					if(xhr === false)return;
				
					if(xhr.overrideMimeType)xhr.overrideMimeType('text/xml');
				
					// bind callback event
					xhr.onreadystatechange = function(){
						if(xhr.readyState == 2){
							if(typeof option.onLoading == 'function')option.onLoading();
							zjs.trigger('ajax.loading');
						};
						if(xhr.readyState == 4){
							var result = '';
							if(option.debug && console)console.log('response: ' + xhr.responseText);
							if(xhr.responseText)result = xhr.responseText.replace(/[\n\r]/g,'');
							if(option.cacheResponse){
					        	cacheResponseStorage[url] = result;
					        }
							if(option.dataType.toLowerCase() == 'json')result = result.jsonDecode();
							//if(xhr.status == 200){
							if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 0){
								if(typeof option.onComplete == 'function')option.onComplete(result);
								zjs.trigger('ajax.complete', result);
							}else{
								if(typeof option.onError == 'function')option.onError(result);
								zjs.trigger('ajax.error', result);
							}
							// onResponse
							if(typeof option.onResponse == 'function')option.onResponse(result);
							zjs.trigger('ajax.response', result);
						}
					};
				
					// view log ?
					if(option.debug && console){
						console.log(option.method.toLowerCase()+': ' + url);
						if(data)console.log('data: '+ data);
					};
								
					// open connect
					xhr.open(option.method.toUpperCase(), url, true);
					xhr.setRequestHeader('Content-type', option.contentType + ';charset=UTF-8;');
					// set custom headers
					if(typeof option.headers == 'object'){
						var keys = objectKeys(option.headers), n=keys.length;
						for(var i=0;i<n;i++)
							xhr.setRequestHeader(keys[i], option.headers[keys[i]]);
					};
					// send
					xhr.send(data);
			
				};
				// end normal xhr
				
			};
			// end callajax
			
			if(option.repeat > 0)
				callajax.repeat(option.repeat);
			else
				callajax();
			
		};
	},
	
	// EVENT STORE luu lai toan bo cac handler function
	EventStore = (function(){
		var uid = 1,
			EventStore = function(){
			// truy xuat cac event theo type
			// kieu nhu the nay:
			// eventTypes = {
			// 		click: {
			// 			el1: [[handler,query,el], [handler,query,el]], 
			// 			el2: [[handler,query,el]]
			// 		}
			// }	
			// trong do el1,el2,el3,.. la cac unique id 
			// tuong ung voi cac element trong trang
			// voi cach luu tru nhu the nay thi
			// khi ma muon trigger 1 event nao do
			// thi chi trigger duoc tren thang parent element
			// thi minh moi chay vao trong nay kiem tra duoc coi
			// thang parent do co dang listen event nao do thay cho 
			// tat ca thang con cua no hay khong
			// chu viec ma khi 1 thang nao do bat ky trong trang web
			// trigger 1 event, ma ban than minh ko the biet la thang nay
			// co thang cha nao cua no dang listen event thay cho no hay khong
			// boi vi co rat nhieu parent element cua no, nen viec nay la khong the
			var eventTypes = {};
			
			// eventDistracts = {
			//		el1: [el, el, el,... ], 
			//		el2: [el, el,... ]
			// }
			// trong do el1,el2,el3,.. la cac unique id 
			// tuong ung voi cac element trong trang
			var eventDistracts = {};
			
			// method kiem tra coi voi 1 type thi element nay da luu gi truoc do hay chua
			this.typeExist = function(type, element){
				// fix agruments
				if(!type || !element)return false;
				// kiem tra xem element co event id hay chua
				// neu nhu chua co id luon thi chung to chua co type nao het
				if(typeof element.zjseventid == 'undefined')return false;
				var eventid = parseInt(element.zjseventid);
				// bay gio se set den type
				// neu nhu type nay chua ton tai thi chung to ko co element nao co
				if(typeof eventTypes[type] == 'undefined')return false;
				// kiem tra coi thang element nay co type nay khong
				if(typeof eventTypes[type]['el'+eventid] == 'undefined')return false;
				// vay la chung to co truoc do roi
				return true;
			};
			
			// method co nhiem vu add them handler vao luu tru
			this.addEventHandler = function(type, element, handler, query){
				// fix agruments
				if(!type || !element)return;
				handler = handler || false;if(handler===false)handler = function(){return false};
				query = query || '';
				// kiem tra xem element co event id hay chua
				var eventid = -1;
				if(typeof element.zjseventid != 'undefined')eventid = parseInt(element.zjseventid);
				if(eventid<=-1){
					eventid = uid++;
					element.zjseventid = eventid;
				};
				// bay gio se set den type
				if(typeof eventTypes[type] == 'undefined')eventTypes[type] = {};
				// set den elid
				if(typeof eventTypes[type]['el'+eventid] == 'undefined')eventTypes[type]['el'+eventid] = [];
				eventTypes[type]['el'+eventid].push([handler, query, element]);
			};
			
			// method co nhiem vu remove tat ca cac handler cua 1 element
			this.removeAllEventHandler = function(element){
				// fix agruments
				if(!element)return;
				// kiem tra event id hay chua
				var eventid = -1;
				if(typeof element.zjseventid != 'undefined')eventid = parseInt(element.zjseventid);
				if(eventid<=-1)return;
				// bat dau tim kiem va remove tat ca
				eachItem(eventTypes, function(value, type){
					if(typeof eventTypes[type]['el'+eventid] != 'undefined')
						eventTypes[type]['el'+eventid] = [];
				});
			};
			
			// method co nhiem vu get ra dung handler can xu ly
			this.getEventHandler = function(type, element, targetElement){
				// fix agruments
				if(!type || !element)return false;
				if(!isElement(targetElement))targetElement = false;
				// kiem tra event id hay chua
				var eventid = -1;
				if(typeof element.zjseventid != 'undefined')eventid = parseInt(element.zjseventid);
				if(eventid<=-1)return false;
				// kiem tra 
				if(typeof eventTypes[type] == 'undefined')return false;
				if(typeof eventTypes[type]['el'+eventid] == 'undefined')return false;
				// gio se check cac handler return
				var handlers = [];
				for(var i=0,len=eventTypes[type]['el'+eventid].length;i<len;i++){
					// kiem tra query that can than
					var query = eventTypes[type]['el'+eventid][i][1];
					// xem coi cuoi cung thi thang element nao
					// phai chiu event
					var eventElement = element;
					if(query!=''){	
						var ok=false;
						// neu co target thi moi kiem tra, ko thi thoi
						// trong qua trinh kiem tra se kiem tra luon
						// thang con cua thang element ma query dang tim
						// de biet chac chan
						if(targetElement)
							zjs(element).find(query).eachElement(function(el){
								// kiem tra thang nay co phai la thang target hay khong
								if(targetElement===el){
									eventElement = el;
									ok=true;
									return false;
								};
								// neu nhu thang nay khong phai thi phai kiem tra
								// tat ca cac thang con cua no cho chinh xac
								zjs(el).find('*').eachElement(function(childEl){
									if(targetElement===childEl){
										eventElement = el;
										ok=true;
										return false;
									};
								});
							});
						// neu nhu khong on thi thoi
						if(!ok)continue;
					};
					handlers.push([eventTypes[type]['el'+eventid][i][0], eventElement]);
				};
				return handlers;
			};
			
			// method co nhiem vu get ra tat ca cac handler cua 1 event
			// muc dich la de phuc vu cho viec trigger global
			this.getAllEventHandler = function(type){
				// fix agruments
				if(!type)return false;
				// kiem tra 
				if(typeof eventTypes[type] == 'undefined')return false;
				// gio se check cac handler return
				var handlers = [];
				// xem coi eventtype nay co nhung thang element nao
				var elids = objectKeys(eventTypes[type]);
				// gio se lap tren tung thang de get ra handler
				for(var i=0,len=elids.length;i<len;i++){
					var elHandlers = eventTypes[type][elids[i]];
					for(var j=0,l2=elHandlers.length;j<l2;j++)
						handlers.push([elHandlers[j][0],elHandlers[j][2]]);
				};
				return handlers;
			};
			
			// method co chuc nang set eventDistracts
			this.setEventDistract = function(element, elements){
				// fix agruments
				if(!element)return;;
				// kiem tra xem element co event id hay chua
				var eventid = -1;
				if(typeof element.zjseventid != 'undefined')eventid = parseInt(element.zjseventid);
				if(eventid<=-1){
					eventid = uid++;
					element.zjseventid = eventid;
				};
				// bay gio se set vao thoi 
				if(typeof eventDistracts['el'+eventid] == 'undefined')eventDistracts['el'+eventid] = Array();
				eventDistracts['el'+eventid] = elements;
			};
			
			// get ra xem coi element nay co cai distract nao khong?
			this.getEventDistract = function(element){
				// fix agruments
				if(!element)return false;
				// kiem tra event id hay chua
				var eventid = -1;
				if(typeof element.zjseventid != 'undefined')eventid = parseInt(element.zjseventid);
				if(eventid<=-1)return false;
				// kiem tra 
				if(typeof eventDistracts['el'+eventid] == 'undefined')return false;
				return eventDistracts['el'+eventid];
			};
			
			this.removeEventDistract = function(element){
				// fix agruments
				if(!element)return false;
				// kiem tra event id hay chua
				var eventid = -1;
				if(typeof element.zjseventid != 'undefined')eventid = parseInt(element.zjseventid);
				if(eventid<=-1)return false;
				// kiem tra 
				if(typeof eventDistracts['el'+eventid] == 'undefined')return false;
				eventDistracts['el'+eventid] = false;
			};
			
		};
		return new EventStore();
	})(),

	
	// EVENT OBJECT for custom event
	DataEvent = function(data, element){
		this.data = data;
		this.target = function(){return element};
		// stop event
		this.isDefaultPrevented = false;
		this.preventDefault = function(){
			this.isDefaultPrevented = true;
		};
		this.getData = function(){
			return this.data;
		}
	},
	
	// EVENT OBJECT for default browser event
	Event = function(e, element){
		e = e || window.event;
		element = element || false;
		
		var ePageX = e.pageX ? e.pageX : 0,
			ePageY = e.pageY ? e.pageY : 0;
		
		// may' method co ban
		this.x = function(){ return this.xy().x; };
		this.y = function(){ return this.xy().y; };
		this.xy = function(){
			var x = e.offsetX || e.layerX || 0,
				y = e.offsetY || e.layerY || 0;
			// vi` event nay` mac. dinh. la` base tren
			// element no' cham. vao`
			// va` nhu the' se~ co' truong` hop. elem
			// cham. vao` la` elem con cua? elem ma`
			// ta thuc. su. can`, cho nen phai? 
			// truy lung` tan. goc'
			if( isElement(element) ){
				var targetEl = this.target();
				while( isElement(targetEl) && targetEl != element ){
					x += ( targetEl.offsetLeft || 0 );
					y += ( targetEl.offsetTop || 0 );
					targetEl = targetEl.parentNode;
				}
			};
			return {x:x, y:y};
		};
		this.target = this.getTarget = function(){ return (e.target || e.srcElement); };
		this.fromTarget = function(){ return (e.relatedTarget || e.fromElement); };
		this.toTarget = this.getToTarget = function(){ return (e.relatedTarget || e.toElement || e.target || e.srcElement || false); };
		
		// fix pageX, pageY tren touchdevice
		if(e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend"){
			if(isMobileDevice() && isTouchDevice() && 'targetTouches' in e && e.targetTouches.length > 0){
				// luon luon fix, khong quan tam
				//if(ePageX == 0)
				ePageX = e.targetTouches[0].pageX;
				ePageY = e.targetTouches[0].pageY;
			}
		};
		
		this.clientX = this.getClientX = function(){ return (e.clientX ? e.clientX + document.body.scrollLeft : ePageX); };
		this.clientY = this.getClientY = function(){ return (e.clientY ? e.clientY + document.body.scrollTop : ePageY); };
		
		// touch
		this.touchX = function(i){i=i||0; return ePageX; };
		this.touchY = function(i){i=i||0; return ePageY; };
		
		// key
		this.keyCode = this.getKeyCode = function(){return e.keyCode || -1};
		this.shiftKey = function(){return e.shiftKey};
		this.altKey = function(){return e.altKey};
		this.ctrlKey = function(){return e.ctrlKey};
		this.metaKey = function(){return e.metaKey};
		
		// stop event
		this.isDefaultPrevented = false;
		this.preventDefault = function(){
			this.isDefaultPrevented = true;

			// https://www.chromestatus.com/features/5093566007214080
			if(('defaultPrevented' in e) && e.defaultPrevented === true){
				return;
			}

			if(e.preventDefault)
				e.preventDefault();
			else if(e.stop)
				e.stop();
			try{
				e.returnValue = false;
			}catch(err){};
		};
		this.stopPropagation = function(){
			try{
				if(browser.msie)e.cancelBubble = true;
				else if(e.stopPropagation)e.stopPropagation();
			}catch(err){};
		};
		this.stop = function(){
			return this.stopPropagation();
		};
		
		// method cho mouse scroll - mousewheel
		this.deltas = this.getDeltas = function(){
			var delta = 0,
				deltaX = 0,
				deltaY = 0;
			
			// lay' ra gia' tri. delta nhu binh` thuong`
			if(e.wheelDelta)delta= e.wheelDelta/120; /* IE/Opera */
			// Mozilla case.
			// In Mozilla, sign of delta is different than in IE.
			// Also, delta is multiple of 3.
			if(e.detail    )delta=-e.detail/3; 
			
			// lay' ra gia' tri. delta moi' ung' voi' 2 truc.
			deltaY = delta;
			
			// Gecko
			if(e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS){
				deltaY = 0;
				deltaX = -1 * delta;
			};
			
			// Webkit
			if(e.wheelDeltaY !== undefined)deltaY = e.wheelDeltaY/120;
			if(e.wheelDeltaX !== undefined)deltaX = -1 * e.wheelDeltaX/120;

			return [delta, deltaX, deltaY];
		};
		this.deltaX = this.getDeltaX = function(){
			return this.getDeltas()[1];
		};
		this.deltaY = this.getDeltaY = function(){
			return this.getDeltas()[2];
		};
		this.isTouchpad = function(){
			var a = Math.abs(this.getDeltaY());return parseInt(a)<a;
		};
		
		// mouse button
		this.isLeftMouse = function(){return (e.which && e.which == 1)};
		this.isCenterMouse = function(){return (e.which && e.which == 2)};
		this.isRightMouse = function(){return (e.which && e.which == 3)};
		
		// other 
		try{this.type = e.type;}catch(er){};
		this.timeStamp = function(){
			if(e.timeStamp)return e.timeStamp;
			return 0;
		};
		
		// save original event
		this.original = e;
		this.getOriginal = function(){
			return e;
		};
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
	})();
	

// EXTEND MAY' CAI' METHOD CHO CAC LOP' SAN~ CO' CUA JAVASCRIPT
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
},false, true);
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
			.replace(/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g,'a')
			.replace(/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g,'A')
			.replace(/[\uA733]/g,'aa')
			.replace(/[\uA732]/g,'AA')
			.replace(/[\u00E6\u01FD\u01E3]/g,'ae')
			.replace(/[\u00C6\u01FC\u01E2]/g,'AE')
			.replace(/[\uA735]/g,'ao')
			.replace(/[\uA734]/g,'AO')
			.replace(/[\uA737]/g,'au')
			.replace(/[\uA736]/g,'AU')
			.replace(/[\uA739\uA73B]/g,'av')
			.replace(/[\uA738\uA73A]/g,'AV')
			.replace(/[\uA73D]/g,'ay')
			.replace(/[\uA73C]/g,'AY')

			.replace(/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g,'b')
			.replace(/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g,'B')

			.replace(/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g,'c')
			.replace(/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g,'C')

			.replace(/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g,'d')
			.replace(/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g,'D')
			.replace(/[\u01F3\u01C6]/g,'dz')
			.replace(/[\u01F1\u01C4]/g,'DZ')
			.replace(/[\u01F2\u01C5]/g,'Dz')

			.replace(/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g,'e')
			.replace(/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g,'E')

			.replace(/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g,'f')
			.replace(/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g,'F')

			.replace(/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g,'g')
			.replace(/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g,'G')

			.replace(/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g,'h')
			.replace(/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g,'H')
			.replace(/[\u0195]/g,'hv')

			.replace(/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g,'i')
			.replace(/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g,'I')

			.replace(/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g,'j')
			.replace(/[\u004A\u24BF\uFF2A\u0134\u0248]/g,'J')

			.replace(/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g,'k')
			.replace(/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g,'K')

			.replace(/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g,'l')
			.replace(/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g,'L')
			.replace(/[\u01C9]/g,'lj')
			.replace(/[\u01C7]/g,'LJ')
			.replace(/[\u01C8]/g,'Lj')

			.replace(/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g,'m')
			.replace(/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g,'M')

			.replace(/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g,'n')
			.replace(/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g,'N')
			.replace(/[\u01CC]/g,'nj')
			.replace(/[\u01CA]/g,'NJ')
			.replace(/[\u01CB]/g,'Nj')

			.replace(/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g,'o')
			.replace(/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g,'O')
			.replace(/[\u01A3]/g,'oi')
			.replace(/[\u01A2]/g,'OI')
			.replace(/[\u0223]/g,'ou')
			.replace(/[\u0222]/g,'OU')
			.replace(/[\uA74F]/g,'oo')
			.replace(/[\uA74E]/g,'OO')

			.replace(/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g,'p')
			.replace(/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g,'P')

			.replace(/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g,'q')
			.replace(/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g,'Q')

			.replace(/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g,'r')
			.replace(/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g,'R')

			.replace(/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g,'s')
			.replace(/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g,'S')

			.replace(/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g,'t')
			.replace(/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g,'T')
			.replace(/[\uA729]/g,'tz')
			.replace(/[\uA728]/g,'TZ')

			.replace(/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g,'u')
			.replace(/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g,'U')

			.replace(/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g,'v')
			.replace(/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g,'V')
			.replace(/[\uA761]/g,'vy')
			.replace(/[\uA760]/g,'VY')

			.replace(/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g,'w')
			.replace(/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g,'W')

			.replace(/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g,'x')
			.replace(/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g,'X')

			.replace(/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g,'y')
			.replace(/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g,'Y')

			.replace(/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g,'z')
			.replace(/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g,'Z')

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
	})()
	
},false, true);
extend(Array.prototype, {
	each: function(fun, step){ // eachItem( function( value , index ,this){} )
		var me=this;
		step = step || 1;
		for (var i = 0; i < this.length; i += step)
			if(fun.call(this, this[i], i, me) === false)
				break;
		return this;
	},
	eachItem: function(fun, step){ // eachItem( function( value , index ,this){} )
		var me=this;
		step = step || 1;
		for (var i = 0; i < this.length; i += step)
			if(fun.call(this, this[i], i, me) === false)
				break;
		return this;
	},
	last: function(){
		return this.length ? this[this.length - 1] : undefined; 
	},
	indexOf: function(item,i){
		i||(i = 0);
		var length = this.length;
		if(i<0) i = length + i;
		for(;i<length;i++)
			if(this[i] === item)return i;
		return -1;
	},
	include: function(obj){
		return this.indexOf(obj) != -1; 
	},
	isInclude: function(obj){
		return this.indexOf(obj) != -1; 
	},
	charCodeToString: function(){
		var _a = this,_ar = [],length = this.length;
		for(var i=0;i<length;i++)
			_ar.push(String.fromCharCode(_a[i]));
		return _ar.join('');
	},
	map: function(fun /*, thisp*/){
		var len = this.length;
		if(typeof fun != "function")
			throw new TypeError();

		var res = new Array(len),
			thisp = arguments[1];
			
		for(var i = 0; i < len; i++)
			if(i in this)
				res[i] = fun.call(thisp, this[i], i, this);

		return res;
	},
	unique: function() {
	    var a = this.concat();
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i] === a[j])
	                a.splice(j--, 1);
	        }
	    }
	    return a;
	}
},false, true);
extend(Function.prototype, {
	bind: function(){
		var f = this,args = makeArray(arguments), o = args.shift();
		return function(){
			return f.apply(o, args.concat(makeArray(arguments)));	
		};
	},
	delay: function(){
	 	var f = this, args = makeArray(arguments), t = args.shift();
	 	return window.setTimeout(function(){return f.apply(f,args)},t);
	},
	repeat: function(){
		var f = this, args = makeArray(arguments), t = args.shift();
		// run the first time
		f.apply(f,args);
		// then interval
		return window.setInterval(function(){return f.apply(f,args)},t);
	},
	inheritsFrom: function(o){
		// Normal Inheritance
		if (o.constructor == Function){ 
			this.prototype = new o;
			this.prototype.constructor = this;
			this.prototype.parent=o.prototype;
		// Pure Virtual Inheritance
		}else{
			this.prototype = o;
			this.prototype.constructor = this;
			this.prototype.parent = o;
		};
		return this;
	}
},false, true);
Date.daysInMonth = function(month, year){
	month = month || 1;
	year = year || (new Date()).getYear();
	return (new Date(year, month, 0)).getDate();
};
extend(Date.prototype, {
	nextDate: function(){
		this.setDate( this.getDate() + 1 );return this.getTime();
	},
	prevDate: function(){
		this.setDate( this.getDate() - 1 );return this.getTime();
	},
	nextHour: function(){
		this.setHours( this.getHours() + 1 );return this.getTime();
	},
	prevHour: function(){
		this.setHours( this.getHours() - 1 );return this.getTime();
	}
},false, true);

// EXTEND THEM MAY' CAI' METHOD CHO ZJS
extend(zjs, {
	isBoolean: isBoolean,
	isNumeric: isNumeric,
	isString: isString,
	isArray: isArray,
	isDate: isDate,
	isObject: isObject,
	isElement: isElement,
	isNodeList: isNodeList,
	isFunction: isFunction,
	isRegExp: isRegExp,
	isWindow: isWindow,
	isFile: isFile,
	each: each,
	eachItem: eachItem,
	clone: clone,
	foreach: each,
	extend: extend,
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
	extendCore: function(name, fn){
		if(isString(name) && isFunction(fn)){var fns={};fns[name]=fn;return extend(zjs, fns);};
		if(isObject(name))return extend(zjs, name);
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
	ajax: makeajaxFn(zjs),
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
	
	// global trigger event
	trigger: function(){
		// dau tien la kiem tra thu coi truyen vao may agruments
		var args = makeArray(arguments);
		if(args.length<1)return this;
		// bat dau get arguments
		var type = args[0], data = false;
		if(!type)return this;
		if(args.length >= 2)data = args[1];
		// global trigger thi event tat nhien la custom data roi
		var newEvent = (data ? new DataEvent(data, false) : false);
		
		// get ra toan bo event handler cho type nay
		var handlers = EventStore.getAllEventHandler(type);
		if(!handlers || !handlers.length)return;
		
		for(var i=0;i<handlers.length;i++){
			// sau do se goi callback
			handlers[i][0].call(zjs(handlers[i][1]), newEvent, handlers[i][1]);
			// continue call next event ?
			if(newEvent.isDefaultPrevented)break;
		};
	},
	
	log: (function(){
			var element = false;
			return function(text){
				if(element === false){
					element = zjs('<div style="position:fixed;z-index:999;top:0;left:0;background:#fa9400;color:#fff;font-family:arial, tahoma;font-size:12px;border:1px solid #fff;"><div style="padding:4px 10px;background:red;"><b>zjs log:</b></div></div>').appendTo('body');
				};
				element.append('<p style="line-height:18px;margin:4px 10px;">'+text+'</p>');
			};
		})()
});
// EXTEND MAY' CAI' METHOD XU? LY' DOM CHO ZJS
zjs.extendMethod({
	// check all element matches the selector
	is: function(selector){
		var matchall = true;
		this.eachElement(function(el){
			if(!Sizzle.matchesSelector(el, selector))
				return (matchall = false);
		});
		return matchall;
	},
	// so sanh coi 2 cai' co' giong' nhau khong
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
	filter: function(selector){
		var matchedEls = [];
		this.eachElement(function(elem){
			if(zjs(elem).is(selector))
				matchedEls.push(elem);
		});
		return zjs(matchedEls);
	},
	find: function(selector){
		var contexts = [];
		this.eachElement(function(el){contexts.push(el)});
		return zjs(selector, contexts);
	},
	findUp: function(selector){
		// dau tien se co gang liet ke ra het cac parent cua element
		// ma thoa man selector
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
	siblings: function(){
		//
		return this;
	},
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
	parent: function(relative){
		return this.getParent(relative);
	},
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
	next: function(){
		//
		return this;
	},
	prev: function(){
		//
		return this;
	},
	item: function( index, realElement ){
		var elem = false, i = 0;
		this.eachElement(function(e){
			if( i == index ){
				elem = e;
				return false;
			}
			i++;
		});
		if( realElement )
			return elem;
		return zjs( elem );
	},
	clone: function(deep){
		var _cloneEl = false;
		this.eachElement(function(e){
			try{_cloneEl = e.cloneNode(deep);return;}catch(er){};
		});
		return zjs(_cloneEl);
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
	html: function(){
		var args = makeArray(arguments);
		return this.setInnerHTML.apply(this, args);
	},
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
	on: function(){
		// dau tien la kiem tra thu coi truyen vao may agruments
		var args = makeArray(arguments);
		if(args.length<2)return this;
		// bat dau get arguments
		var types = args[0], handler = args[1], query = '', options = false;
		if(!types)return this;
		if(args.length >= 3 && isFunction(args[2])){
			query = args[1];
			handler = args[2];
		};
		if(args.length >= 3 && isFunction(args[1]) && isObject(args[2])){
			handler = args[1];
			options = args[2];
		};
		if(args.length >= 4 && isFunction(args[2]) && isObject(args[3])){
			query = args[1];
			handler = args[2];
			options = args[3];
		};
		
		// normal event
		var self = this;
		return this.eachElement(function(elem){
			
			// co the truyen vao nhieu type 1 luc nen se tach ra
			types.split(/\s*,\s*/i).eachItem(function(type){
				
				// special event
				if(type=='clickout')return self.clickout(handler);
				if(type=='hover')type = 'mouseover';
				
				// kiem tra element da tung bind event type nay lan nao chua
				// tai vi zjs chi cho phep dung event cua browser dung 1 lan
				// con nhieu lan la do zjs xu ly
				var callback = !EventStore.typeExist(type, elem);
				
				// bind handler vao eventStore
				EventStore.addEventHandler(type, elem, handler, query);
			
				// neu nhu khong co callback thi thoi out luon
				// noi chung cho nay return tuc la 
				// event cua he thong (click,...) da duoc bind roi
				// neu khong can phai xuong duoi de bind them lam gi nua
				if(!callback)return;
				
				// bay gio tiep theo se test coi phai cac event la cac event 
				// additional them cua zjs cho mobile hay khong
				// neu la cac event nay thi khong can phai di xuong duoi addEventListener lam chi ca
				// boi vi dau co event do dau ma add lam gi :))
				// thay vao do se di bind event khac cho document luon
				// va cai nay chi bind dung 1 lan ma thoi
				// (can't use [].include because conflit with mootools)
				if(['swipe', 'swipeleft', 'swiperight', 'swipeup', 'swipedown', 
					'touch', 'doubletap', 'tap', 'singletap', 'longtap'].isInclude(type)){
					zjs.initTouchEvent();
					return;
				};
				
				// test them 1 phat nua
				// trong truong hop bind event submit cua form
				// thi test luon coi la cai thang button nao click luon ha
				if(type == 'submit' && zjs(elem).is('form')){
					// bay gio co nhiem vu la bind event click cho may cai thang button het luon
					// thang nao click thi se save thang do vao trong form luon
					zjs(elem).on('click', 'button[name]', function(event){
						zjs(elem).setData('formSubmitButton', this);
					});
				};
				
				// bay gio moi bat dau di bind event mac dinh cho browser
				// cho nen se di tao ra 1 cai function callback
				// tao ra 1 callback cho event theo cach mac dinh cua browser
				callback = function(event){
					// don gian la chi can trigger event thoi
					return zjs(elem).trigger(type, event);
				};
				
				// tiep theo se thu listen 
				if(elem.addEventListener){
					// fix mousewheel
					if(type == 'scroll' || type == 'mousewheel')
						elem.addEventListener('DOMMouseScroll', callback, false);
					// fix touch event
					/*if(window.navigator.msPointerEnabled){
						if(type=='touchstart')type='MSPointerDown';
						if(type=='touchmove')type='MSPointerMove';
						if(type=='touchend')type='MSPointerUp';
					};*/
					// support passive event
					// https://developers.google.com/web/updates/2017/01/scrolling-intervention
					// if(type=='touchstart' || type=='touchmove'){
						// elem.addEventListener(type, callback, {passive: true});
					// }
					// normal
					// else{
						elem.addEventListener(type, callback, options);
					// }
				}
				else if(elem.attachEvent){
					if(type == 'scroll')type = 'mousewheel';
					elem.attachEvent('on' + type, callback);
				};
			
			});
		});
	},
	trigger: function(){
		// dau tien la kiem tra thu coi truyen vao may agruments
		var args = makeArray(arguments);
		if(args.length<1)return this;
		// bat dau get arguments
		var type = args[0], event = false, data = true;
		if(!type)return this;
		if(args.length >= 2)event = args[1];
		// callback (callback de giup tra lai ket qua cho thang goi trigger
		var callback = false;
		if(args.length >= 3 && isFunction(args[2]))callback = args[2];
		
		// kiem tra coi day la args thu 2 la event cua browser hay la custom data
		// neu nhu la event cua browser roi thi ko co custom data gi het
		if(typeof event == 'object' && (typeof event.preventDefault == 'function' || typeof event.stop == 'function'))data = false;
		
		// kiem tra voi IE, nhieu khi se luu event vao trong window.event
		// nhung bay gio truoc mat chi fix voi event mousewheel (module scrollbar) thoi
		if('event' in window && typeof window.event == 'object' && window.event != null && 'clientX' in window.event && typeof window.event.clientX == 'number' && window.event.clientX != null){
			// noi chung la nhung event cua he thong, khong phai cua zjs
			if(type == 'mousedown' || type == 'mouseup' || type == 'mousemove' || type == 'mousewheel' || 
				type == 'hover' || type == 'click' || type == 'focus' || type == 'blur' ||
				type == 'submit'){
				event = window.event;
				data = false;
			};
		};
		
		
		var callEventStoreCallback = function(handlers, newEvent){
			// >>>>>>>>
			//console.log('callEventStoreCallback');
			
			var isDefaultPrevented = false;
			for(var i=0;i<handlers.length;i++){
				
				// bay gio khong biet la event nay se tac dong len dau
				// nen phai get ra distract element thu
				var distractedEls = EventStore.getEventDistract(handlers[i][1]);				
				// neu co distracted elements thi se lam viec tren nhung thang distracted nay
				if(distractedEls && isArray(distractedEls)){
					for(var j=0;j<distractedEls.length;j++)
						handlers[i][0].call(zjs(distractedEls[j]), newEvent, distractedEls[j]);
				}
				// con khong thi se goi callback tren cai element nay
				else{
					handlers[i][0].call(zjs(handlers[i][1]), newEvent, handlers[i][1]);
				};
				
				// continue call next event ?
				if(newEvent.isDefaultPrevented){
					//isDefaultPrevented = true;
					return true;
				};
			};
			
			return isDefaultPrevented;
		};
		
		
		return this.eachElement(function(elem){
		
			// tao moi event
			if(!data)var newEvent = new Event(event, elem);
			else var newEvent = new DataEvent(event, elem);
			
			// get handler tu eventStore
			// neu nhu khnog get ra duoc thi check lan 1
			var handlers = EventStore.getEventHandler(type, elem, newEvent.target());
			if(!handlers || !handlers.length){
				
				// neu nhu khong co get ra duoc handler
				// nhung ma trong truong hop tap/... (su dung touch vao cai thang document)
				// cho nen neu get ra handler cua thang elem nay thi se khong chinh xac
				// ma nen go up de tim ra cai thang chinh xac ma can event nay
				if(['touch', 'doubletap', 'tap', 'singletap', 'longtap'].include(type)){
					
					// bay gio se co gang go up (find parent) de ma tim thoi
					try{
						elem = elem.parentElement;
						
						while(elem != null && !handlers){
							handlers = EventStore.getEventHandler(type, elem, newEvent.target());
							elem = elem.parentElement;
						}
					}catch(e){}
						
					if(!handlers || !handlers.length)
						return;
				};
				
				// neu nhu lan nay ma van khong get ra duoc
				// thi thoi, return luon
				// if(!handlers || !handlers.length)
				//	return;
				// update:
				// boi vi nhieu khi trigger trong khi chua bind event nao
				// cho nen van phai thuc hien callback
				// nen cho nay se khong return lien
			};
			
			var isDefaultPrevented = false;
			
			// call callback thoi (callback get ra tu event store)
			if(handlers && handlers.length){
				isDefaultPrevented = callEventStoreCallback(handlers, newEvent);
			}
			
			// xong roi thi truyen qua cho thang callback
			if(callback){
				callback(newEvent, elem);
			}

			// neu nhu khong co handler thi thoi khong can lam nua
			if(!handlers || !handlers.length){
				return;
			}
			
			// neu nhu su dung may cai tap, singletap,... linh tinh
			// vi su dung custom event cua zjs, nen phai back len tren
			// de check coi thang cha ben tren co bind event hay khong
			// neu nhu co thi lam luon thang ben tren
			if(!isDefaultPrevented && ['touch', 'doubletap', 'tap', 'singletap', 'longtap'].include(type)){
				// bay gio se co gang go up (find parent) de ma tim thoi
				try{
					elem = elem.parentElement;
					
					while(elem != null){
						handlers = EventStore.getEventHandler(type, elem, newEvent.target());
						
						// neu khong get ra thi go up thoi
						if(!handlers || !handlers.length){
							elem = elem.parentElement;
							continue;
						}
						
						// neu ma co thi call handler thoi
						// tao moi event
						if(!data)var newEvent = new Event(event, elem);
						else var newEvent = new DataEvent(event, elem);
						// khi call event thi check coi co isDefaultPrevented hay khong
						// neu nhu ma isDefaultPrevented == true, thi thoi, khong go up nua
						isDefaultPrevented = callEventStoreCallback(handlers, newEvent);
						
						if(isDefaultPrevented)
							break;
						
						// prepare to continue go up
						elem = elem.parentElement;
					}
				}catch(e){}
			};
		});
		
	},
	distractAllEventTo: function(){
		var args = makeArray(arguments);
		if(args.length==0)return this;
		
		// array
		if(args.length > 1){for(var i=0;i<args.length;i++)this.distractAllEventTo(args[i]);return this;};
		if(isArray(args[0])){for(var i=0;i<args[0].length;i++)this.distractAllEventTo(args[0][i]);return this;};
		
		// tat ca moi truong hop thi phai set ve 1 truong hop la element thoi
		var zEls = false;
		
		// string? (css query string)
		if(isString(args[0]))
			zEls = zjs(args[0]);
		// element?
		else if(isElement(args[0]))
			zEls = zjs(args[0]);
		// zjs
		else if(zjs.isZjs(args[0]))
			zEls = args[0];
		
		// neu khong tim duoc thi thoi
		if(!zEls)return this;
		
		var listDomEls = Array();
		zEls.eachElement(function(el){
			listDomEls.push(el);
		});
		
		return this.eachElement(function(el){
			EventStore.setEventDistract(el, listDomEls);
		});
	},
	removeAllDistractEvent: function(){
		return this.eachElement(function(el){
			EventStore.removeEventDistract(el);
		});
	},
	ready: function(handler){
		if(this.item(0,true)===document)domReady(handler);
		return this;
	},
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
				direction: '',
				willPreventDefault: false,
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
			
			var addEventOptions = {
				passive: !option.willPreventDefault
			};

			// bind event cho no
			zjs(element).on(mousedownevent, function(event, element){
						
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
			}, addEventOptions);

			// luc' nay` moi bat dau` bind event cho document
			zjs(document).on(mousemoveevent, mousemoveHandler, addEventOptions)
						.on(mouseupevent, mouseupHandler, addEventOptions);
			
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
	remove: function(){
		var args = makeArray(arguments);
		var deep = (args.length == 0 ? true : args[0]);
		return this.eachElement(function(el){
			var zEl = zjs(el);
			
			// kiem tra stop fadeout/fadein truoc khi remove
			var timer = zEl.getData(zjsfadeouttimerkey);
			if(typeof timer == 'object')timer.stop();
			timer = zEl.getData(zjsfadeintimerkey);
			if(typeof timer == 'object')timer.stop();
			timer = zEl.getData(zjshidescaletimerkey);
			if(typeof timer == 'object')timer.stop();
			timer = zEl.getData(zjsshowscaletimerkey);
			if(typeof timer == 'object')timer.stop();
									
			// run hook
			if(Hook.enable('before_removeDOM'))Hook.run('before_removeDOM',el);
			
			// sau do se remove data
			if(deep)zEl.removeData();
			// remove event handlers
			if(deep)EventStore.removeAllEventHandler(el);
			
			// remove
			// kiem tra coi da duoc append vao chua moi remove chu
			if(isElement(el.parentNode))
				el.parentNode.removeChild(el);
		});
	},
	attr: function(){
		var arg = arguments;
		if(arg.length<1)return null;
		if(arg.length<2)return this.getAttr(arg[0]);
		return this.setAttr(arg[0], arg[1]);
	},
	getAttr: function(att, defaultVal){
		if(typeof defaultVal == 'undefined')
		var defaultVal = null;
		var attr = null;
		var lowerAtt = att.toLowerCase();
		this.eachElement(function(e){
			
			// for
			if(lowerAtt == 'for')try{attr = e.htmlFor;if(attr != null)return false;}catch(e){};
			
			// class
			if(lowerAtt == 'class' || lowerAtt == 'classname')try{attr = e.className;if(attr != null)return false;}catch(e){};
			
			// col/row span	
			if(lowerAtt == 'colspan')try{attr = e.colSpan;if(attr != null)return false;}catch(e){};
			if(lowerAtt == 'rowspan')try{attr = e.rowSpan;if(attr != null)return false;}catch(e){};
			
			// other
			try{attr = e.getAttribute(att);}catch(e){};
			return false;
			
		});
		if(attr == null)attr = defaultVal;
		return attr;
	},
	setAttr: function(att, val){
		// truyen vo 1 tap. gia' tri.
		if(isObject(att)){
			var self = this;
			eachItem(att, function(value, key){self.setAttr(key, value)});
			return this;
		};
		var lowerAtt = att.toLowerCase();
		// chi? truyen` vao` 1 gia tri
		this.eachElement(function(e){

			var done = false;
			
			// for
			if(!done && lowerAtt == 'for')try{e.htmlFor = val;done = true;}catch(e){};
			
			// class
			if(!done && (lowerAtt == 'class' || lowerAtt == 'classname'))try{e.className = val;done = true;}catch(e){};
			
			// col/row span	
			if(!done && lowerAtt == 'colspan')try{e.colSpan = val;done = true;}catch(e){};
			if(!done && lowerAtt == 'rowspan')try{e.rowSpan = val;done = true;}catch(e){};
			
			// other	
			if(!done)try{e.setAttribute(att, val);}catch(e){};
			
		});
		return this;
	},
	removeAttr: function(att){
		return this.eachElement(function(el){
			if(typeof el.removeAttribute == 'function')
				el.removeAttribute(att);
		});
	},
	getValue: function(defaultVal){
		defaultVal = defaultVal || '';
		var val = null;
		this.eachElement(function(e){
			try{val = e.value;}catch(e){};
			if(val == null){try{val = e.getAttribute('value');}catch(e){};};
			return false;
		});
		if(!val||val==null)val=defaultVal;
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
	style: function(){
		var args = makeArray(arguments);
		if(args.length<1)return null;
		if(args.length==1 && isObject(args[0]))
			return this.setStyle(args[0]);
		if(args.length==1 && isString(args[0]))
			return this.getStyle(args[0]);
		if(args.length==2 && isString(args[0]) && isBoolean(args[1]))
			return this.getStyle(args[0], args[1]);
		if(args.length==2 && isString(args[0]))
			return this.setStyle(args[0], args[1]);
	},
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

		// 1 so truong hop dat biet khong phai la style
		if(key == 'scrollLeft'){
			var el = this.item(0, true);
			if(el === document.body)
				return (document.scrollingElement || document.documentElement || document.body).scrollLeft;
			return el.scrollLeft;
		}
		if(key == 'scrollTop'){
			var el = this.item(0, true);
			if(el === document.body)
				return (document.scrollingElement || document.documentElement || document.body).scrollTop;
			return el.scrollTop;
		}
		
		// dau tien la phai replace lai cai key cho chuan
		// marginTop -> margin-top
		key = key.replace(/([A-Z])/g, function(a,l){return '-'+l.toLowerCase();});

		// --
		// hack
		// truong hop dat biet cua zjs
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
		};
		
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
		// 1 so truong hop dat biet khong phai la style
		if(key == 'scrollLeft'){
			return this.eachElement(function(el){
				// Fix to have better compatible (Firefox)
				if(el === document.body){
					var scrollTop = (document.scrollingElement || document.documentElement || document.body).scrollTop;
					window.scrollTo(val, scrollTop);
				}
				else{
					el.scrollLeft = val;
				}
			});
		}
		if(key == 'scrollTop'){
			return this.eachElement(function(el){
				// Fix to have better compatible (Firefox)
				if(el === document.body){
					var scrollLeft = (document.scrollingElement || document.documentElement || document.body).scrollLeft;
					window.scrollTo(scrollLeft, val);
				}
				else{
					el.scrollTop = val;
				}
			});
		}
		// truong hop dat biet cua zjs
		if(key == 'zjsInteger'){
			val = parseInt(val);
			if(isNaN(val))val = 0;
			return this.setAttr('data-zjs-integer', val);
		};
		if(key == 'zjsString'){
			if(!isString(val))val = val+'';
			return this.setAttr('data-zjs-string', val);
		};
		if(key == 'content'){
			if(!isString(val))val = val+'';
			return this.html(val);
		};
				
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
	height: function(val){
		// set
		if(isDefined(val))return this.setStyle('height', val);
		// get
		return this.getStyle('height', true);
	},
	width: function(val){
		// set
		if(isDefined(val))return this.setStyle('width', val);
		// get
		return this.getStyle('width', true);
	},
	
	// TRANSFORM
	rotate: function(val){
		// set
		if(isDefined(val))return this.setStyle('rotate', val);
		// get
		return this.getStyle('rotate', true);
	},
	
	// SCROLL position
	// --
	scrollTop: function(val){
		// set
		if(isDefined(val)){
			this.eachElement(function(elem){
				// try{
				elem.scrollTop = val;
				// }catch(e){};
			});
			return this;
		}
		// get
		var elem = false;
		this.eachElement(function(e){
			elem = e;
			return false;
		});
		if(elem){
			if(elem == document.body)
				return window.pageYOffset;
			return elem.pageYOffset || elem.scrollTop || 0;
		};
		return 0;
	},
	scrollLeft: function(val){
		// set
		if(isDefined(val)){
			this.eachElement(function(elem){
				// try{
				elem.scrollLeft = val;
				// }catch(e){};
			});
			return this;
		}
		// get
		var elem = false;
		this.eachElement(function(e){
			elem = e;
			return false;
		});
		if(elem){
			if(elem == document.body)
				return window.pageXOffset;
			return elem.pageXOffset || elem.scrollLeft || 0;
		};
		return 0;
	},
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
	hasClass:function(name){
		if(this.size() == 0)return false;

		var elem = this.item(0,true);

		// native way
		try{if(supportClassList)return elem.classList.contains(name);}catch(err){};
		
		var classname = zjs(elem).getAttr('class');
		return (new RegExp('(?:^|\\s+)'+name+'(?:\\s+|$)')).test(classname);
	},
	addClass: function(name){
		var args = makeArray(arguments), className = args.join(' ');
		this.eachElement(function(elem){
			eachItem(className.split(/[^A-Za-z0-9-_]+/), function(name){
				// native way
				var donenative=false;if(supportClassList)
					try{elem.classList.add(name);donenative=true;}catch(e){donenative=true};
			
				if(!donenative && !zjs(elem).hasClass(name)){
					var classs = zjs(elem).getAttr('class');
					if( isString(classs) )classs = classs.split(/[^A-Za-z0-9-_]+/);else classs = [];
					classs.push(name);
					zjs(elem).setClass(classs.join(' '));
				};
			});
		});
		return this;
	},
	removeClass: function(){
		var args = makeArray(arguments), className = args.join(' ');
		this.eachElement(function(elem){
			eachItem(className.split(/[^A-Za-z0-9-_]+/), function(name){
				// native way
				var donenative=false;if(supportClassList)
					try{elem.classList.remove(name);donenative=true;}catch(e){donenative=true};
			
				if(!donenative && zjs(elem).hasClass(name)){
					var classs = zjs(elem).getAttr('class');
					if(!isString(classs))classs = '';
					zjs(elem).setClass(classs.replace(new RegExp('(?:^|\\s+)'+name+'(?:\\s+|$)','g'),' '));
				};
			});
		});
		return this;
	},
	toggleClass: function(name){
		this.eachElement(function(elem){
			// native way
			if(supportClassList){
				try{elem.classList.toggle(name);}catch(e){};
			}else if(zjs(elem).hasClass(name))
				zjs(elem).removeClass(name);
			else 
				zjs(elem).addClass(name);
		});
		return this;
	},
	show: function(){
		this.eachElement(function(e){
			e.style.display = '';
			zjs(e).trigger('show');
		});
		return this;
	},
	hide: function(){
		this.eachElement(function(e){
			e.style.display = 'none';
			zjs(e).trigger('hide');
		});
		return this;
	},
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
			zjs('<div>').setInnerHTML(args[0]).child().eachElement(function(cel){
				el.appendChild(cel);
				if(Hook.enable('after_insertDOM'))Hook.run('after_insertDOM',cel);
			});
		});
		
		// element
		var thisEl = this.item(0,true);
		if(!thisEl){
			return this;
		}
		
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
			zjs('<div>').setInnerHTML(args[0]).child().eachElement(function(cel){
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
	submit: function(){
		if(this.is('form')){
			var el = this.item(0,true);
			if('submit' in el){
				// trigger submit event
				this.trigger('submit', {}, function(customEvent){
					if(!customEvent.isDefaultPrevented){
						// submit that su
						// nhung truoc khi submit thi phai xem coi co bi prevent default khong cai da
						// boi vi khi goi ham el.submit() thi se khong bi trigger event submit
						// event submit chi duoc trigger khi user thao tac tren UI (click button submit)
						// con khi su dung method el.submit() thi se khong trigger
						// cho nen phai trigger truoc
						el.submit();
					};
				});
			};
		};
		return this;
	}
});

// - - - - - - 
// include Sizzle
// A pure-JavaScript CSS selector engine designed to be easily dropped in to a host library.
// More information: http://sizzlejs.com/
(function(){var chunker=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,expando="sizcache"+(Math.random()+'').replace('.',''),done=0,toString=Object.prototype.toString,hasDuplicate=false,baseHasDuplicate=true,rBackslash=/\\/g,rReturn=/\r\n/g,rNonWord=/\W/;[0,0].sort(function(){baseHasDuplicate=false;return 0});var Sizzle=function(selector,context,results,seed){results=results||[];context=context||document;var origContext=context;if(context.nodeType!==1&&context.nodeType!==9){return[]}if(!selector||typeof selector!=="string"){return results}var m,set,checkSet,extra,ret,cur,pop,i,prune=true,contextXML=Sizzle.isXML(context),parts=[],soFar=selector;do{chunker.exec("");m=chunker.exec(soFar);if(m){soFar=m[3];parts.push(m[1]);if(m[2]){extra=m[3];break}}}while(m);if(parts.length>1&&origPOS.exec(selector)){if(parts.length===2&&Expr.relative[parts[0]]){set=posProcess(parts[0]+parts[1],context,seed)}else{set=Expr.relative[parts[0]]?[context]:Sizzle(parts.shift(),context);while(parts.length){selector=parts.shift();if(Expr.relative[selector]){selector+=parts.shift()}set=posProcess(selector,set,seed)}}}else{if(!seed&&parts.length>1&&context.nodeType===9&&!contextXML&&Expr.match.ID.test(parts[0])&&!Expr.match.ID.test(parts[parts.length-1])){ret=Sizzle.find(parts.shift(),context,contextXML);context=ret.expr?Sizzle.filter(ret.expr,ret.set)[0]:ret.set[0]}if(context){ret=seed?{expr:parts.pop(),set:makeArray(seed)}:Sizzle.find(parts.pop(),parts.length===1&&(parts[0]==="~"||parts[0]==="+")&&context.parentNode?context.parentNode:context,contextXML);set=ret.expr?Sizzle.filter(ret.expr,ret.set):ret.set;if(parts.length>0){checkSet=makeArray(set)}else{prune=false}while(parts.length){cur=parts.pop();pop=cur;if(!Expr.relative[cur]){cur=""}else{pop=parts.pop()}if(pop==null){pop=context}Expr.relative[cur](checkSet,pop,contextXML)}}else{checkSet=parts=[]}}if(!checkSet){checkSet=set}if(!checkSet){Sizzle.error(cur||selector)}if(toString.call(checkSet)==="[object Array]"){if(!prune){results.push.apply(results,checkSet)}else if(context&&context.nodeType===1){for(i=0;checkSet[i]!=null;i++){if(checkSet[i]&&(checkSet[i]===true||checkSet[i].nodeType===1&&Sizzle.contains(context,checkSet[i]))){results.push(set[i])}}}else{for(i=0;checkSet[i]!=null;i++){if(checkSet[i]&&checkSet[i].nodeType===1){results.push(set[i])}}}}else{makeArray(checkSet,results)}if(extra){Sizzle(extra,origContext,results,seed);Sizzle.uniqueSort(results)}return results};Sizzle.uniqueSort=function(results){if(sortOrder){hasDuplicate=baseHasDuplicate;results.sort(sortOrder);if(hasDuplicate){for(var i=1;i<results.length;i++){if(results[i]===results[i-1]){results.splice(i--,1)}}}}return results};Sizzle.matches=function(expr,set){return Sizzle(expr,null,null,set)};Sizzle.matchesSelector=function(node,expr){return Sizzle(expr,null,null,[node]).length>0};Sizzle.find=function(expr,context,isXML){var set,i,len,match,type,left;if(!expr){return[]}for(i=0,len=Expr.order.length;i<len;i++){type=Expr.order[i];if((match=Expr.leftMatch[type].exec(expr))){left=match[1];match.splice(1,1);if(left.substr(left.length-1)!=="\\"){match[1]=(match[1]||"").replace(rBackslash,"");set=Expr.find[type](match,context,isXML);if(set!=null){expr=expr.replace(Expr.match[type],"");break}}}}if(!set){set=typeof context.getElementsByTagName!=="undefined"?context.getElementsByTagName("*"):[]}return{set:set,expr:expr}};Sizzle.filter=function(expr,set,inplace,not){var match,anyFound,type,found,item,filter,left,i,pass,old=expr,result=[],curLoop=set,isXMLFilter=set&&set[0]&&Sizzle.isXML(set[0]);while(expr&&set.length){for(type in Expr.filter){if((match=Expr.leftMatch[type].exec(expr))!=null&&match[2]){filter=Expr.filter[type];left=match[1];anyFound=false;match.splice(1,1);if(left.substr(left.length-1)==="\\"){continue}if(curLoop===result){result=[]}if(Expr.preFilter[type]){match=Expr.preFilter[type](match,curLoop,inplace,result,not,isXMLFilter);if(!match){anyFound=found=true}else if(match===true){continue}}if(match){for(i=0;(item=curLoop[i])!=null;i++){if(item){found=filter(item,match,i,curLoop);pass=not^found;if(inplace&&found!=null){if(pass){anyFound=true}else{curLoop[i]=false}}else if(pass){result.push(item);anyFound=true}}}}if(found!==undefined){if(!inplace){curLoop=result}expr=expr.replace(Expr.match[type],"");if(!anyFound){return[]}break}}}if(expr===old){if(anyFound==null){Sizzle.error(expr)}else{break}}old=expr}return curLoop};Sizzle.error=function(msg){throw new Error("Syntax error, unrecognized expression: "+msg)};var getText=Sizzle.getText=function(elem){var i,node,nodeType=elem.nodeType,ret="";if(nodeType){if(nodeType===1||nodeType===9||nodeType===11){if(typeof elem.textContent==='string'){return elem.textContent}else if(typeof elem.innerText==='string'){return elem.innerText.replace(rReturn,'')}else{for(elem=elem.firstChild;elem;elem=elem.nextSibling){ret+=getText(elem)}}}else if(nodeType===3||nodeType===4){return elem.nodeValue}}else{for(i=0;(node=elem[i]);i++){if(node.nodeType!==8){ret+=getText(node)}}}return ret};var Expr=Sizzle.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(elem){return elem.getAttribute("href")},type:function(elem){return elem.getAttribute("type")}},relative:{"+":function(checkSet,part){var isPartStr=typeof part==="string",isTag=isPartStr&&!rNonWord.test(part),isPartStrNotTag=isPartStr&&!isTag;if(isTag){part=part.toLowerCase()}for(var i=0,l=checkSet.length,elem;i<l;i++){if((elem=checkSet[i])){while((elem=elem.previousSibling)&&elem.nodeType!==1){}checkSet[i]=isPartStrNotTag||elem&&elem.nodeName.toLowerCase()===part?elem||false:elem===part}}if(isPartStrNotTag){Sizzle.filter(part,checkSet,true)}},">":function(checkSet,part){var elem,isPartStr=typeof part==="string",i=0,l=checkSet.length;if(isPartStr&&!rNonWord.test(part)){part=part.toLowerCase();for(;i<l;i++){elem=checkSet[i];if(elem){var parent=elem.parentNode;checkSet[i]=parent.nodeName.toLowerCase()===part?parent:false}}}else{for(;i<l;i++){elem=checkSet[i];if(elem){checkSet[i]=isPartStr?elem.parentNode:elem.parentNode===part}}if(isPartStr){Sizzle.filter(part,checkSet,true)}}},"":function(checkSet,part,isXML){var nodeCheck,doneName=done++,checkFn=dirCheck;if(typeof part==="string"&&!rNonWord.test(part)){part=part.toLowerCase();nodeCheck=part;checkFn=dirNodeCheck}checkFn("parentNode",part,doneName,checkSet,nodeCheck,isXML)},"~":function(checkSet,part,isXML){var nodeCheck,doneName=done++,checkFn=dirCheck;if(typeof part==="string"&&!rNonWord.test(part)){part=part.toLowerCase();nodeCheck=part;checkFn=dirNodeCheck}checkFn("previousSibling",part,doneName,checkSet,nodeCheck,isXML)}},find:{ID:function(match,context,isXML){if(typeof context.getElementById!=="undefined"&&!isXML){var m=context.getElementById(match[1]);return m&&m.parentNode?[m]:[]}},NAME:function(match,context){if(typeof context.getElementsByName!=="undefined"){var ret=[],results=context.getElementsByName(match[1]);for(var i=0,l=results.length;i<l;i++){if(results[i].getAttribute("name")===match[1]){ret.push(results[i])}}return ret.length===0?null:ret}},TAG:function(match,context){if(typeof context.getElementsByTagName!=="undefined"){return context.getElementsByTagName(match[1])}}},preFilter:{CLASS:function(match,curLoop,inplace,result,not,isXML){match=" "+match[1].replace(rBackslash,"")+" ";if(isXML){return match}for(var i=0,elem;(elem=curLoop[i])!=null;i++){if(elem){if(not^(elem.className&&(" "+elem.className+" ").replace(/[\t\n\r]/g," ").indexOf(match)>=0)){if(!inplace){result.push(elem)}}else if(inplace){curLoop[i]=false}}}return false},ID:function(match){return match[1].replace(rBackslash,"")},TAG:function(match,curLoop){return match[1].replace(rBackslash,"").toLowerCase()},CHILD:function(match){if(match[1]==="nth"){if(!match[2]){Sizzle.error(match[0])}match[2]=match[2].replace(/^\+|\s*/g,'');var test=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2]==="even"&&"2n"||match[2]==="odd"&&"2n+1"||!/\D/.test(match[2])&&"0n+"+match[2]||match[2]);match[2]=(test[1]+(test[2]||1))-0;match[3]=test[3]-0}else if(match[2]){Sizzle.error(match[0])}match[0]=done++;return match},ATTR:function(match,curLoop,inplace,result,not,isXML){var name=match[1]=match[1].replace(rBackslash,"");if(!isXML&&Expr.attrMap[name]){match[1]=Expr.attrMap[name]}match[4]=(match[4]||match[5]||"").replace(rBackslash,"");if(match[2]==="~="){match[4]=" "+match[4]+" "}return match},PSEUDO:function(match,curLoop,inplace,result,not){if(match[1]==="not"){if((chunker.exec(match[3])||"").length>1||/^\w/.test(match[3])){match[3]=Sizzle(match[3],null,null,curLoop)}else{var ret=Sizzle.filter(match[3],curLoop,inplace,true^not);if(!inplace){result.push.apply(result,ret)}return false}}else if(Expr.match.POS.test(match[0])||Expr.match.CHILD.test(match[0])){return true}return match},POS:function(match){match.unshift(true);return match}},filters:{enabled:function(elem){return elem.disabled===false&&elem.type!=="hidden"},disabled:function(elem){return elem.disabled===true},checked:function(elem){return elem.checked===true},selected:function(elem){if(elem.parentNode){elem.parentNode.selectedIndex}return elem.selected===true},parent:function(elem){return!!elem.firstChild},empty:function(elem){return!elem.firstChild},has:function(elem,i,match){return!!Sizzle(match[3],elem).length},header:function(elem){return(/h\d/i).test(elem.nodeName)},text:function(elem){var attr=elem.getAttribute("type"),type=elem.type;return elem.nodeName.toLowerCase()==="input"&&"text"===type&&(attr===type||attr===null)},radio:function(elem){return elem.nodeName.toLowerCase()==="input"&&"radio"===elem.type},checkbox:function(elem){return elem.nodeName.toLowerCase()==="input"&&"checkbox"===elem.type},file:function(elem){return elem.nodeName.toLowerCase()==="input"&&"file"===elem.type},password:function(elem){return elem.nodeName.toLowerCase()==="input"&&"password"===elem.type},submit:function(elem){var name=elem.nodeName.toLowerCase();return(name==="input"||name==="button")&&"submit"===elem.type},image:function(elem){return elem.nodeName.toLowerCase()==="input"&&"image"===elem.type},reset:function(elem){var name=elem.nodeName.toLowerCase();return(name==="input"||name==="button")&&"reset"===elem.type},button:function(elem){var name=elem.nodeName.toLowerCase();return name==="input"&&"button"===elem.type||name==="button"},input:function(elem){return(/input|select|textarea|button/i).test(elem.nodeName)},focus:function(elem){return elem===elem.ownerDocument.activeElement}},setFilters:{first:function(elem,i){return i===0},last:function(elem,i,match,array){return i===array.length-1},even:function(elem,i){return i%2===0},odd:function(elem,i){return i%2===1},lt:function(elem,i,match){return i<match[3]-0},gt:function(elem,i,match){return i>match[3]-0},nth:function(elem,i,match){return match[3]-0===i},eq:function(elem,i,match){return match[3]-0===i}},filter:{PSEUDO:function(elem,match,i,array){var name=match[1],filter=Expr.filters[name];if(filter){return filter(elem,i,match,array)}else if(name==="contains"){return(elem.textContent||elem.innerText||getText([elem])||"").indexOf(match[3])>=0}else if(name==="not"){var not=match[3];for(var j=0,l=not.length;j<l;j++){if(not[j]===elem){return false}}return true}else{Sizzle.error(name)}},CHILD:function(elem,match){var first,last,doneName,parent,cache,count,diff,type=match[1],node=elem;switch(type){case"only":case"first":while((node=node.previousSibling)){if(node.nodeType===1){return false}}if(type==="first"){return true}node=elem;case"last":while((node=node.nextSibling)){if(node.nodeType===1){return false}}return true;case"nth":first=match[2];last=match[3];if(first===1&&last===0){return true}doneName=match[0];parent=elem.parentNode;if(parent&&(parent[expando]!==doneName||!elem.nodeIndex)){count=0;for(node=parent.firstChild;node;node=node.nextSibling){if(node.nodeType===1){node.nodeIndex=++count}}parent[expando]=doneName}diff=elem.nodeIndex-last;if(first===0){return diff===0}else{return(diff%first===0&&diff/first>=0)}}},ID:function(elem,match){return elem.nodeType===1&&elem.getAttribute("id")===match},TAG:function(elem,match){return(match==="*"&&elem.nodeType===1)||!!elem.nodeName&&elem.nodeName.toLowerCase()===match},CLASS:function(elem,match){return(" "+(elem.className||elem.getAttribute("class"))+" ").indexOf(match)>-1},ATTR:function(elem,match){var name=match[1],result=Sizzle.attr?Sizzle.attr(elem,name):Expr.attrHandle[name]?Expr.attrHandle[name](elem):elem[name]!=null?elem[name]:elem.getAttribute(name),value=result+"",type=match[2],check=match[4];return result==null?type==="!=":!type&&Sizzle.attr?result!=null:type==="="?value===check:type==="*="?value.indexOf(check)>=0:type==="~="?(" "+value+" ").indexOf(check)>=0:!check?value&&result!==false:type==="!="?value!==check:type==="^="?value.indexOf(check)===0:type==="$="?value.substr(value.length-check.length)===check:type==="|="?value===check||value.substr(0,check.length+1)===check+"-":false},POS:function(elem,match,i,array){var name=match[2],filter=Expr.setFilters[name];if(filter){return filter(elem,i,match,array)}}}};var origPOS=Expr.match.POS,fescape=function(all,num){return"\\"+(num-0+1)};for(var type in Expr.match){Expr.match[type]=new RegExp(Expr.match[type].source+(/(?![^\[]*\])(?![^\(]*\))/.source));Expr.leftMatch[type]=new RegExp(/(^(?:.|\r|\n)*?)/.source+Expr.match[type].source.replace(/\\(\d+)/g,fescape))}Expr.match.globalPOS=origPOS;var makeArray=function(array,results){array=Array.prototype.slice.call(array,0);if(results){results.push.apply(results,array);return results}return array};try{Array.prototype.slice.call(document.documentElement.childNodes,0)[0].nodeType}catch(e){makeArray=function(array,results){var i=0,ret=results||[];if(toString.call(array)==="[object Array]"){Array.prototype.push.apply(ret,array)}else{if(typeof array.length==="number"){for(var l=array.length;i<l;i++){ret.push(array[i])}}else{for(;array[i];i++){ret.push(array[i])}}}return ret}}var sortOrder,siblingCheck;if(document.documentElement.compareDocumentPosition){sortOrder=function(a,b){if(a===b){hasDuplicate=true;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition){return a.compareDocumentPosition?-1:1}return a.compareDocumentPosition(b)&4?-1:1}}else{sortOrder=function(a,b){if(a===b){hasDuplicate=true;return 0}else if(a.sourceIndex&&b.sourceIndex){return a.sourceIndex-b.sourceIndex}var al,bl,ap=[],bp=[],aup=a.parentNode,bup=b.parentNode,cur=aup;if(aup===bup){return siblingCheck(a,b)}else if(!aup){return-1}else if(!bup){return 1}while(cur){ap.unshift(cur);cur=cur.parentNode}cur=bup;while(cur){bp.unshift(cur);cur=cur.parentNode}al=ap.length;bl=bp.length;for(var i=0;i<al&&i<bl;i++){if(ap[i]!==bp[i]){return siblingCheck(ap[i],bp[i])}}return i===al?siblingCheck(a,bp[i],-1):siblingCheck(ap[i],b,1)};siblingCheck=function(a,b,ret){if(a===b){return ret}var cur=a.nextSibling;while(cur){if(cur===b){return-1}cur=cur.nextSibling}return 1}}(function(){var form=document.createElement("div"),id="script"+(new Date()).getTime(),root=document.documentElement;form.innerHTML="<a name='"+id+"'/>";root.insertBefore(form,root.firstChild);if(document.getElementById(id)){Expr.find.ID=function(match,context,isXML){if(typeof context.getElementById!=="undefined"&&!isXML){var m=context.getElementById(match[1]);return m?m.id===match[1]||typeof m.getAttributeNode!=="undefined"&&m.getAttributeNode("id").nodeValue===match[1]?[m]:undefined:[]}};Expr.filter.ID=function(elem,match){var node=typeof elem.getAttributeNode!=="undefined"&&elem.getAttributeNode("id");return elem.nodeType===1&&node&&node.nodeValue===match}}root.removeChild(form);root=form=null})();(function(){var div=document.createElement("div");div.appendChild(document.createComment(""));if(div.getElementsByTagName("*").length>0){Expr.find.TAG=function(match,context){var results=context.getElementsByTagName(match[1]);if(match[1]==="*"){var tmp=[];for(var i=0;results[i];i++){if(results[i].nodeType===1){tmp.push(results[i])}}results=tmp}return results}}div.innerHTML="<a href='#'></a>";if(div.firstChild&&typeof div.firstChild.getAttribute!=="undefined"&&div.firstChild.getAttribute("href")!=="#"){Expr.attrHandle.href=function(elem){return elem.getAttribute("href",2)}}div=null})();if(document.querySelectorAll){(function(){var oldSizzle=Sizzle,div=document.createElement("div"),id="__sizzle__";div.innerHTML="<p class='TEST'></p>";if(div.querySelectorAll&&div.querySelectorAll(".TEST").length===0){return}Sizzle=function(query,context,extra,seed){context=context||document;if(!seed&&!Sizzle.isXML(context)){var match=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);if(match&&(context.nodeType===1||context.nodeType===9)){if(match[1]){return makeArray(context.getElementsByTagName(query),extra)}else if(match[2]&&Expr.find.CLASS&&context.getElementsByClassName){return makeArray(context.getElementsByClassName(match[2]),extra)}}if(context.nodeType===9){if(query==="body"&&context.body){return makeArray([context.body],extra)}else if(match&&match[3]){var elem=context.getElementById(match[3]);if(elem&&elem.parentNode){if(elem.id===match[3]){return makeArray([elem],extra)}}else{return makeArray([],extra)}}try{return makeArray(context.querySelectorAll(query),extra)}catch(qsaError){}}else if(context.nodeType===1&&context.nodeName.toLowerCase()!=="object"){var oldContext=context,old=context.getAttribute("id"),nid=old||id,hasParent=context.parentNode,relativeHierarchySelector=/^\s*[+~]/.test(query);if(!old){context.setAttribute("id",nid)}else{nid=nid.replace(/'/g,"\\$&")}if(relativeHierarchySelector&&hasParent){context=context.parentNode}try{if(!relativeHierarchySelector||hasParent){return makeArray(context.querySelectorAll("[id='"+nid+"'] "+query),extra)}}catch(pseudoError){}finally{if(!old){oldContext.removeAttribute("id")}}}}return oldSizzle(query,context,extra,seed)};for(var prop in oldSizzle){Sizzle[prop]=oldSizzle[prop]}div=null})()}(function(){var html=document.documentElement,matches=html.matchesSelector||html.mozMatchesSelector||html.webkitMatchesSelector||html.msMatchesSelector;if(matches){var disconnectedMatch=!matches.call(document.createElement("div"),"div"),pseudoWorks=false;try{matches.call(document.documentElement,"[test!='']:sizzle")}catch(pseudoError){pseudoWorks=true}Sizzle.matchesSelector=function(node,expr){expr=expr.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!Sizzle.isXML(node)){try{if(pseudoWorks||!Expr.match.PSEUDO.test(expr)&&!/!=/.test(expr)){var ret=matches.call(node,expr);if(ret||!disconnectedMatch||node.document&&node.document.nodeType!==11){return ret}}}catch(e){}}return Sizzle(expr,null,null,[node]).length>0}}})();(function(){var div=document.createElement("div");div.innerHTML="<div class='test e'></div><div class='test'></div>";if(!div.getElementsByClassName||div.getElementsByClassName("e").length===0){return}div.lastChild.className="e";if(div.getElementsByClassName("e").length===1){return}Expr.order.splice(1,0,"CLASS");Expr.find.CLASS=function(match,context,isXML){if(typeof context.getElementsByClassName!=="undefined"&&!isXML){return context.getElementsByClassName(match[1])}};div=null})();function dirNodeCheck(dir,cur,doneName,checkSet,nodeCheck,isXML){for(var i=0,l=checkSet.length;i<l;i++){var elem=checkSet[i];if(elem){var match=false;elem=elem[dir];while(elem){if(elem[expando]===doneName){match=checkSet[elem.sizset];break}if(elem.nodeType===1&&!isXML){elem[expando]=doneName;elem.sizset=i}if(elem.nodeName.toLowerCase()===cur){match=elem;break}elem=elem[dir]}checkSet[i]=match}}}function dirCheck(dir,cur,doneName,checkSet,nodeCheck,isXML){for(var i=0,l=checkSet.length;i<l;i++){var elem=checkSet[i];if(elem){var match=false;elem=elem[dir];while(elem){if(elem[expando]===doneName){match=checkSet[elem.sizset];break}if(elem.nodeType===1){if(!isXML){elem[expando]=doneName;elem.sizset=i}if(typeof cur!=="string"){if(elem===cur){match=true;break}}else if(Sizzle.filter(cur,[elem]).length>0){match=elem;break}}elem=elem[dir]}checkSet[i]=match}}}if(document.documentElement.contains){Sizzle.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):true)}}else if(document.documentElement.compareDocumentPosition){Sizzle.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}}else{Sizzle.contains=function(){return false}}Sizzle.isXML=function(elem){var documentElement=(elem?elem.ownerDocument||elem:0).documentElement;return documentElement?documentElement.nodeName!=="HTML":false};var posProcess=function(selector,context,seed){var match,tmpSet=[],later="",root=context.nodeType?[context]:context;while((match=Expr.match.PSEUDO.exec(selector))){later+=match[0];selector=selector.replace(Expr.match.PSEUDO,"")}selector=Expr.relative[selector]?selector+"*":selector;for(var i=0,l=root.length;i<l;i++){Sizzle(selector,root[i],tmpSet,seed)}return Sizzle.filter(later,tmpSet)};window.Sizzle=Sizzle})();
// - - - - - - 

// - - - - - - 
// include module data vao zjs luon
(function(){
	
	var dataarray = [];
	zjs.extendMethod({
		data: function(){
			var args = makeArray(arguments);
			if(args.length<1)return null;
			if(args.length<2)return this.getData(args[0]);
			return this.setData(args[0], args[1]);
		},
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
				};
				// neu da set data roi thi chi can update thoi
				dataarray[dataid][name] = data;
			});
			return this;
		},
		getData: function(){
			var args = makeArray(arguments);
			if(args.length<=0)return false;
			var name = args[0];
			var defaultData = (args.length >= 2 ? args[1] : false);
			if(name=='')return defaultData;
			// chi can lay 1 thang element dau tien lam dai dien thoi
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

})();
// 
// - - - - - -

// include module require
(function(){
	// 1 so option cho require
	zjs.extendCore({requireOption:{
		root: '',
		listFile: 'modules.js',
		useHttps: false,
		loadCss: false,
		cssFolder: '',
		prefix: 'z.module.',
		autoLoadJs: false,
		timeout: 10000,
		debug: false
	}});
	
	// thu auto get root
	zjs('script[src]').eachElement(function(el){
		var zScriptEl = zjs(el),
			src = zScriptEl.attr('src');
		if(zScriptEl.is('[data-auto-load-js=false]')){
			zjs.requireOption.autoLoadJs = false;
		};
		if(zScriptEl.is('[data-load-css=false]')){
			zjs.requireOption.loadCss = false;
		};
		if(src.test(/z\.js/)){
			zjs.requireOption.root = src.replace(/z\.js.*$/gi, '');
			zjs.requireOption.debug = (zjs(el).getAttr('data-debug', '') == 'true');
			return;
		};
		if(src.test(/z\.min\.js/)){
			zjs.requireOption.root = src.replace(/z\.min\.js.*$/gi, '');
			zjs.requireOption.debug = (zjs(el).getAttr('data-debug', '') == 'true');
			return;
		};
	});
	
	var allModuleFiles = {},
		requiresList = {},
		requiresTimeout = {},
		listLoaded = false,
		listLoading = false,
		headEl = document.getElementsByTagName('head')[0],
		loadJs = function(filesrc, id){
			var scriptEl = document.createElement('script');scriptEl.async=true;scriptEl.src = filesrc;if(id)scriptEl.id=id;
			headEl.appendChild(scriptEl);
		},
		loadCss = function(filesrc){
			var linkEl = document.createElement('link');linkEl.rel='stylesheet';linkEl.type='text/css';
			linkEl.href = filesrc;
			headEl.appendChild(linkEl);
		},
		loadList = function(){
			if(!zjs.requireOption.autoLoadJs)return;
			if(listLoaded)return;
			if(listLoading)return;
			listLoading = true;
			loadJs(zjs.requireOption.root + zjs.requireOption.listFile, 'zjsmodulerequirelist');
		},
		loadRequire = function(){
			if(!zjs.requireOption.autoLoadJs)return;
			if(!listLoaded)return loadList();
			eachItem(requiresList, function(requiresListValue, name){
				if(!isArray(requiresList[name]) || requiresList[name].length<=0)return;
				var allLoaded = true;
				eachItem(name.split(/[^A-Za-z0-9-_\.\*]+/), function(na){
								
					//for(var fullname in allModuleFiles){
					eachItem(allModuleFiles, function(v, fullname){
						
						// neu nhu fullname la file min thi khong cho autoload (chuc nang load .*)
						fullname = fullname.replace('.min.js', '.js');
					
						if(allModuleFiles[fullname]!='loaded'){	
							if(fullname.test(new RegExp('^'+na.replace('.','\\.').replace('*','.*')+'\.js$','gi'))){
								allLoaded = false;
							
								if(allModuleFiles[fullname]!='loading'){
								
									// truoc khi load Js thi check xem coi min version co ton tai hay khong
									// neu nhu co thi load min version cho roi
									var fullname_min = fullname.replace('.js', '.min.js');
									if(fullname_min in allModuleFiles && !zjs.requireOption.debug)
										loadJs(zjs.requireOption.root+zjs.requireOption.prefix+fullname_min);
									else 
										loadJs(zjs.requireOption.root+zjs.requireOption.prefix+fullname);
								
									// 	
									(function(){
										var errText = 'require module '+fullname.replace('.js','')+' failed';
										requiresTimeout[fullname] = window.setTimeout(function(){
											try{
												if(typeof TypeError != 'undefined')
													throw new TypeError(errText);
											}catch(err){};
										},zjs.requireOption.timeout);
									})();
								};
								allModuleFiles[fullname]='loading';
							};
							if(fullname.test(new RegExp('^'+na.replace('.','\\.').replace('*','.*')+'\.css$','gi'))){
								if(zjs.requireOption.loadCss)loadCss(zjs.requireOption.root+
																	zjs.requireOption.cssFolder+
																	zjs.requireOption.prefix+
																	fullname);
								allModuleFiles[fullname]='loaded';
							};
						};
					});
					//};
				});
				
				// neu chua load xong thi thoi, qua xem cai khac
				if(!allLoaded)return;
				
				// neu nhu da load xong het resource
				// thi chi viec goi callback thoi
				// nhung truoc do phai xoa triet de requiresList[name]
				var requiresListName = makeArray(requiresList[name]);
				delete requiresList[name];
				for(var i=0;i<requiresListName.length;i++)
					if(isFunction(requiresListName[i]))
						requiresListName[i].call(this, zjs);
			});
			// end for each
			
			// boi vi sau khi require vao tat ca module xong
			// tinh luon truong hop module nay se require module kia
			// neu neu nhu phat sinh require trong require
			// thi cho thuc hien "call" kia da bi xuat hien requiresList[name] moi
			// cho nen neu nhu kiem tra o day ma empty, chung to la da xong het
			// luc nay ta moi that su call nhung handler onready o day
			var count = 0;
			eachItem(requiresList, function(){count++;});
			if(count>0)return;
			
			domReadyFns.isModuleRequired = true;
			domLoadedFns.isModuleRequired = true;
			// neu nhu da ready luon roi thi run luon thoi
			if(domReadyFns.isReady)domReadyFns.runall();
			if(domLoadedFns.isLoaded)domLoadedFns.runall();
			
		};
		
	// ham lam nhiem vu callback sau khi 
	// danh sach module duoc load xong
	zjs.extendCore({
		loadJs: loadJs,
		loadCss: loadCss,
		requireListCallback: function(names){
			listLoaded = true;
			for(var i=0;i<names.length;i++)
				if(typeof allModuleFiles[names[i]] == 'undefined')
					allModuleFiles[names[i]] = '';
			zjs('#zjsmodulerequirelist').remove();
			loadRequire();
		},
		required: function(name){
			if(!zjs.requireOption.autoLoadJs)return;
			var fullname = name.replace(/\.js$/gi, '')+'.js';
			// kiem tra truoc chu khong thi se bi lap vo han
			if(allModuleFiles[fullname] == 'loaded')return;
			allModuleFiles[fullname] = 'loaded';
			// clear error timeout
			if(requiresTimeout[fullname])
				clearTimeout(requiresTimeout[fullname])
			loadRequire();
		}
	});
	
	// ham lam nhiem vu quan trong nhat
	var require = function(name, callback){
		// khong can quan tam require cai gi, chi can chay callback ngay va luon
		if(!zjs.requireOption.autoLoadJs && callback){
			callback.call(this, zjs);
			return;
		};

		if(typeof requiresList[name] == 'undefined')requiresList[name] = [];
		domReadyFns.isModuleRequired = false;
		requiresList[name].push(callback);
		loadRequire();
	};
	
	// extend to core
	zjs.extendCore({
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
		}
	});
	
})();
// 
// - - - - - -

// include module mobile event
// module nay se them vao cac event nhu sau:
// tap, singletap, doubletap, longtap,
// swipe, swipeleft, swiperight, swipeup, swipedown
(function(){
	
	// 1 so option cho mobile event
	zjs.extendCore({mobileEventOption:{
		touchDelay: 35,
		longTapDelay: 750,
		doubleTapDelay: 250,
		twoNormalTapDelay: 800,
		swipePoint: 25
	}});
	
	
	// cac bien se su dung
	var justInited = false,
	touchTimeout, tapTimeout, doubleTapTimeout, swipeTimeout, longTapTimeout,
	
	// luu lai may cai thong tin cua 1 lan touch
	touch = {
		zEl: false,
		x1: 0,
		y1: 0,
		isDoubleTap: false,
		isTap: false,
		isTouch: false,
		last: 0
	},
	
	// handler may cai event gesture
	gesture,
	
	// helper function
	isPointerEventType = function(e, type){
		return (e.type == 'pointer'+type || e.type.toLowerCase() == 'mspointer'+type);
	},
	
	isPrimaryTouch = function(e){
		return (e.pointerType == 'touch' || e.pointerType == e.MSPOINTER_TYPE_TOUCH) && e.isPrimary;
	},
	swipeDirection = function(x1, x2, y1, y2){
		return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'left' : 'right') : (y1 - y2 > 0 ? 'up' : 'down');
	},

	cancelLongTap = function(){
		if(longTapTimeout)clearTimeout(longTapTimeout);
		longTapTimeout = null;
	},

	cancelAll = function(){
		if(touchTimeout)clearTimeout(touchTimeout);
		if(tapTimeout)clearTimeout(tapTimeout);
		if(doubleTapTimeout)clearTimeout(doubleTapTimeout);
		if(swipeTimeout)clearTimeout(swipeTimeout);
		if(longTapTimeout)clearTimeout(longTapTimeout);
		touchTimeout = tapTimeout = doubleTapTimeout = swipeTimeout = longTapTimeout = null;
		touch = {};
	},
	
	// may cai bien nay se phuc vu trong luc chay
	now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType,
	
	initTouchEvent = function(){
	
		// neu nhu khong phai touch device thi chay init lam cai gi
		if(!isTouchDevice())return;
	
		// make sure la cai init nay chi chay 1 lan duy nhat ma thoi kaka
		if(justInited)return;
		justInited = true;
		
		// >>>>
		//console.log('ok, init event fo touch device');
		
		if('MSGesture' in window){
			gesture = new MSGesture();
			gesture.target = document.body;
		};
		
		// handler for MS Gesture
		zjs(document).on('MSGestureEnd', function(e){
			var swipeDirectionFromVelocity = e.velocityX > 1 ? 'right' : 
											e.velocityX < -1 ? 'left' : 
											e.velocityY > 1 ? 'down' : 
											e.velocityY < -1 ? 'up' : null;
			if(swipeDirectionFromVelocity){
				touch.zEl.trigger('swipe');
				touch.zEl.trigger('swipe'+ swipeDirectionFromVelocity);
			};
		});
		
		// on touch start
		// zjs(document).on('touchstart, MSPointerDown, pointerdown', function(e){
		zjs(document).on('touchstart', function(e){
			
			// neu nhu ma day la pointer event (khong phai touch event)
			// va no khong phai la primary touch thi thoi cho out
			if((_isPointerType = isPointerEventType(e.getOriginal(), 'down')) && !isPrimaryTouch(e.getOriginal()))
				return;
			
			firstTouch = _isPointerType ? e.getOriginal() : e.getOriginal().touches[0];
			
			if(e.getOriginal().touches && e.getOriginal().touches.length === 1 && touch.x2){
				// Clear out touch movement data if we have it sticking around
				// This can occur if touchcancel doesn't fire due to preventDefault, etc.
				touch.x2 = undefined;
				touch.y2 = undefined;
			};
			
			// mac dinh thi cai nay se la tap
			touch.isTap = true;
			
			now = Date.now()
			delta = now - (touch.last || now);
			touch.zEl = zjs('tagName' in firstTouch.target ? firstTouch.target : firstTouch.target.parentNode);
			
			// neu co timeout thi clear
			if(doubleTapTimeout)clearTimeout(doubleTapTimeout);
			if(touchTimeout)clearTimeout(touchTimeout);
				
			touch.x1 = firstTouch.pageX;
			touch.y1 = firstTouch.pageY;
			// nhung ma neu nhu qua nhanh, thi khong du tieu chuan la normal tap
			if(delta > 0 && delta <= zjs.mobileEventOption.twoNormalTapDelay){
				touch.isTap = false;
			}
			// neu nhu rat nhanh, thi du tieu chuan la double tap
			if(delta > 0 && delta <= zjs.mobileEventOption.doubleTapDelay)
				touch.isDoubleTap = true;
			// update lai cai last time
			if(touch.isTap)
				touch.last = now;

			// set cai timeout de ma fire cai "touch"
			touchTimeout = setTimeout(function(){
				touchTimeout = null;
				if(touch.zEl)touch.zEl.trigger('touch');
			}, zjs.mobileEventOption.touchDelay);
			
			// set cai timeout de ma fire cai long tap
			longTapTimeout = setTimeout(function(){
				cancelLongTap();
				if(touch.last){
					touch.zEl.trigger('longtap');
					cancelAll();
				};
			}, zjs.mobileEventOption.longTapDelay);
			
			// adds the current touch contact for IE gesture recognition
			if(gesture && _isPointerType)gesture.addPointer(e.getOriginal().pointerId);
		});
      	
      	// on touch move
		zjs(document).on('touchmove, MSPointerMove, pointermove', function(e){
			
			// neu nhu ma day la pointer event (khong phai touch event)
			// va no khong phai la primary touch thi thoi cho out
			if((_isPointerType = isPointerEventType(e.getOriginal(), 'move')) && !isPrimaryTouch(e.getOriginal()))
				return;
			
			// neu ma move roi thi khong co con longtap gi nua het ah
			cancelLongTap();
			
			firstTouch = _isPointerType ? e.getOriginal() : e.getOriginal().touches[0];
			touch.x2 = firstTouch.pageX;
			touch.y2 = firstTouch.pageY;
			
			deltaX += Math.abs(touch.x1 - touch.x2);
			deltaY += Math.abs(touch.y1 - touch.y2);
			
			// doi voi chrome on Android, thi chi co chay duoc duy nhat 1 lan la touchmove ma thoi
			// cho neu neu kiem tra thay duoc thi fire swipe event luon cho roi 
			// fire event: swipe
			if((touch.x2 && deltaX > zjs.mobileEventOption.swipePoint) || (touch.y2 && deltaY > zjs.mobileEventOption.swipePoint)){
				if(touchTimeout)clearTimeout(touchTimeout);
				if(swipeTimeout)clearTimeout(swipeTimeout);
				swipeTimeout = setTimeout(function(){
					if(touch.zEl){
						touch.zEl.trigger('swipe');
						touch.zEl.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
					};
					cancelAll();
				}, 0);
			};
		});
		
		// on touch end
		// zjs(document).on('touchend, MSPointerUp, pointerup', function(e){
		zjs(document).on('touchend', function(e){
			
			// neu nhu ma day la pointer event (khong phai touch event)
			// va no khong phai la primary touch thi thoi cho out
    	    if((_isPointerType = isPointerEventType(e.getOriginal(), 'up')) && !isPrimaryTouch(e.getOriginal()))
    	    	return;
        	
        	// cho den en luon roi thi thoi, cancel cai thang longtap luon
			cancelLongTap();

			// fire event: swipe
			if((touch.x2 && deltaX > zjs.mobileEventOption.swipePoint) || (touch.y2 && deltaY > zjs.mobileEventOption.swipePoint)){
				swipeTimeout = setTimeout(function() {
					if(touch.zEl){
						touch.zEl.trigger('swipe');
						touch.zEl.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
					};
					cancelAll();
				}, 0);
			}
		
			// fire event: normal tap
			else if('last' in touch){
				// don't fire tap when delta position changed by more than 30 pixels,
				// for instance when moving to a point and back to origin
				if(deltaX < zjs.mobileEventOption.swipePoint && deltaY < zjs.mobileEventOption.swipePoint){
					// delay by one tick so we can cancel the 'tap' event if 'scroll' fires
					// ('tap' fires before 'scroll')
					tapTimeout = setTimeout(function(){

						if(!touch.isTap && !touch.isDoubleTap)return;

						// trigger universal 'tap' with the option to cancelTouch()
						// (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
						//var event = zjs.Event('tap');
						//event.cancelTouch = cancelAll;
						//touch.zEl.trigger(event)
						//console.log('touch', touch);
						
						if(!touch.isDoubleTap && touch.zEl){
							touch.zEl.trigger('tap', e.getOriginal());
						}

						// trigger double tap immediately
						if(touch.isDoubleTap){
							if(touch.zEl)touch.zEl.trigger('doubletap');
							// reset cai touch, nhung ma phai giu lai cai isTap
							//touch = {};
							touch.isDoubleTap = false;
							touch.zEl = false;
						}
						//>>>>>>>>>>>>

						// de cho co thoi gian kip xu ly xem coi co phai la 
						// double tap hay khong, cho nen se delay lai 1 xiu xem thu
						// default la cho 250ms
						else{
							doubleTapTimeout = setTimeout(function(){
								doubleTapTimeout = null;
								if(touch.zEl)touch.zEl.trigger('singletap');
								// reset cai touch, nhung ma phai giu lai cai isTap
								//touch = {};
								touch.isDoubleTap = false;
								touch.zEl = false;
							}, zjs.mobileEventOption.doubleTapDelay);
						};
					
					}, 0);
				}
			
				// con neu lo nhu move qua 30px roi thi thoi, coi nhu lam lai tu dau
				else{
					touch = {};
				}
			};
		
			// reset het delta la xong
			deltaX = deltaY = 0;
		});
      
		// when the browser window loses focus,
		// for example when a modal dialog is shown,
		// cancel all ongoing events
		zjs(document).on('touchcancel, MSPointerCancel, pointercancel', cancelAll);

		// scrolling the window indicates intention of the user
		// to scroll, not tap or swipe, so cancel all ongoing events
		//zjs(window).on('scroll', cancelAll);
		
	};
	
	// gan cai ham nay vao core thoi la xong
	zjs.extendCore({initTouchEvent: initTouchEvent});
	
})();

// handler on domready
domReady(function(zjs){
	zjs.supportTranslate3d = supportTranslate3d = supportTranslate3dTest();
});

// gan cho bien zjs on top scope (window)
if(typeof window.zjs == 'undefined')window.zjs = zjs;
if(typeof window.z == 'undefined')window.z = zjs;

// make sure console.log donot show an error
if(!('console' in window))window.console = {log:zjs.log};

})(window);