;(function(zjs){
"use strict";
	
	var context = zjs('html'),
		temp = 'temp',
		tempElem = document.createElement(temp),
		tempStyle = tempElem.style,
		prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
		omPrefixes = 'Webkit Moz O ms',
		cssomPrefixes = omPrefixes.split(' '),
		
		feature = {},
	
		setCss = function( str ){
			tempStyle.cssText = str;
		},
	
		// ham` lam` nhiem. vu. thuc, hien. tung` test
		// va` add class vao` the <html>
		testFeature = function( testNames, func ){
					
					if( zjs.isArray(testNames) ){
						for(var i=0; i<testNames.length; i++)
							testFeature(testNames[i]);
						return;
					}
					
					// ho~ tro. nhap. vao` test-name dang. : "test1 test2 test3" - ngan cach nhau boi khoang trong
					testNames = testNames.split(/\s+/i);
					
					for(var i=0; i<testNames.length; i++){
						var testName = testNames[i],
							className = testName.toLowerCase(),
							noClassName = 'no-' + className;
						
						context.removeClass(className)
								.removeClass(noClassName);
						
						func = func || testDefines[testName] || (new Function('return false'));
						
						// neu' thuc. hie.n thanh` cong thi` them 
						// class vao` nguoc. lai. thi` go~ ra neu' co'
						if(func()){
							context.addClass(className);
							feature[className] = true;
						}else
							context.addClass(noClassName);
					}
					
				},
		
		testCss = function(prop){
					var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
						props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');
					
					for(var i in props )
						if( tempStyle[ props[i] ] !== undefined )
							return true;
					return false;
				},
		
		// DINH. NGHIA~ CAC' CHUC' NANG SE~ TEST
		// - - -
		testDefines = {
			localstorage: function(){
				try {
					localStorage.setItem('ztest', true);
					localStorage.removeItem('ztest');
					return true;
				} catch(e) {
					return false;
				}
			},
			canvas: function(){
				var elem = document.createElement('canvas');
				return !!(elem.getContext && elem.getContext('2d'));
			},
			borderimage: function() {
				return testCss('borderImage');
			},
			borderradius: function(){
				return testCss('borderRadius');
			},
			boxshadow: function(){
				return testCss('boxShadow');
			},
			textshadow: function(){
				// return document.createElement('div').style.textShadow === '';
				return testCss('textShadow');
			},
			cssanimations: function() {
				return testCss('animationName');
			},
			csscolumns: function() {
				return testCss('columnCount');
			},
			cssgradients: function(){

				var str1 = 'background-image:',
					str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
					str3 = 'linear-gradient(left top,#9f9, white);',
					str = (str1 + 
							//webkit syntax
							'-webkit- '.split(' ').join(str2 + str1) +
							//standard syntax
							prefixes.join(str3 + str1)
						).cutRight(str1.length);
				
				setCss( str );

				return tempStyle.backgroundImage.contains('gradient');
			}
			
			
		};
		// ket thuc' test-define

	// extend vao` zjs-core nhu 1 shortcut de? goi. den'
	zjs.extendCore({
		feature: feature,
		testFeature: testFeature,
		testAllFeature: function(){
			// bat' dau` test cac' tinh' nang da~ dinh nghia~
			for(var testName in testDefines)
				testFeature(testName);
		}
	});

	// register module name
	zjs.required('autodetect');
	
})(zjs);