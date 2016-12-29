// extend module Marquee cho zjs
;(function(zjs){
	
	var optionkey = 'zjsmodulemarqueeoption';
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeMarquee: function(useroption){
			
			var defaultoption = {
				// enter your options
				// here
				direction: 'left',
				behavior: 'scroll', // alternate, slide
				speed: 5,
				loop: -1,
				width: 'auto',
				pauseonhover: true,
				pausetime: 2000
			};
			
			// do each
			this.each(function(element){
				var zElement = zjs(element);
				
				// - - - 
				// neu ma co roi thi se ghi lai option
				// option luc nay la option cua user
				var option = zElement.getData(optionkey);
				if(option){
					zElement.setData(optionkey, zjs.extend(option, useroption));
					return;
				};
				
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
				
				var zElemWidth = 0,
					zElementWrap = zjs('<div style="position:absolute;top:0;left:0;width:10000px;"></div>'),
					zElementPanel = zjs('<div style="float:left;"></div>'); 
					
				if(option.width != 'auto')zElemWidth = parseInt(option.width);
				if(zElemWidth == 0)zElemWidth = zElement.width();
				
				zElement.width(zElemWidth);
				
				// phai copy toan bo child cua no vao 1 cai moi
				for(i=0;i<element.childNodes.length;i++)
					if(element.childNodes[i].nodeType != 3)
						zElementPanel.append(element.childNodes[i]);
				
				// clone ra
				var zElementPanelCopy = zElementPanel.clone(true);
				
				// sau do append lai
				zElementWrap.append(zElementPanel).append(zElementPanelCopy);
				zElement.append(zElementWrap);
				
				// fix style
				zElement.setStyle({position:'relative',overflow:'hidden'});
				
				var realSpeed = option.speed,
					changeSpeed = zjs.timer({
						time: option.pausetime,
						onStart: function(from, to){},
						onProcess: function(current, from, to){realSpeed=current;},
						onStop: function(from, to){},
						onFinish: function(from, to){realSpeed=to;}
					});
					
				zElement.hover(function(){if(option.pauseonhover)changeSpeed.stop().set({from:realSpeed,to:0}).run();},
							function(){if(option.pauseonhover)changeSpeed.stop().set({from:realSpeed,to:option.speed}).run();});
				
				var currentLeft = 0,
					zElementPanelWidth = zElementPanel.width();
					
				// play thoi
				window.setInterval(function(){
					currentLeft+=realSpeed;
					if(currentLeft>zElementPanelWidth)currentLeft = realSpeed;
					zElementWrap.setStyle('left',-currentLeft);
				}, 30);
				
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
 	zjs.onload(function(){zjs('.zmarquee').makeMarquee();});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('marquee');

})(zjs);