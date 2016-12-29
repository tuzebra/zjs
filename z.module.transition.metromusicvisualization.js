// extend module metromusicvisualization cho zjs
zjs.require('transition', function(){
	
	// test css3 transition support
	var usedcss3 = (zjs.supportTransition && zjs.supportTransform);
	
	// class may cai cuc nho o ben trong
	var Visuaz = function(wrapperEl, size, time, peak){
		
		// dau tien se tao ra mot cai element
		var zEl = zjs('<div style="position:absolute;opacity:0"></div>');
		
		// get size cua cai wrapper
		wrapperEl = zjs(wrapperEl);
		var wrapperWidth = wrapperEl.width(),
			wrapperHeight = wrapperEl.height();
		
		// random moi thu
		var from = {
				width: zjs.random(wrapperWidth/2, wrapperWidth*1.5) * size / peak,
				height: zjs.random(wrapperHeight/2, wrapperHeight*1.5) * size / peak,
				left: zjs.random(-wrapperWidth/2, wrapperWidth/2) / size,
				top: zjs.random(-wrapperHeight/2, wrapperHeight/2) / size,
				opacity: 0
			},
			to = {
				width: zjs.random(wrapperWidth/2, wrapperWidth*1.5) * size / peak,
				height: zjs.random(wrapperHeight/2, wrapperHeight*1.5) * size / peak,
				left: zjs.random(-wrapperWidth/2, wrapperWidth/2) / size,
				top: zjs.random(-wrapperHeight/2, wrapperHeight/2) / size,
				opacity: 0
			},
			between = {
				width: (to.width + from.width) / 2,
				height: (to.height + from.height) / 2,
				left: (to.left + from.left) / 2,
				top: (to.top + from.top) / 2,
				opacity: 1
			};
		
		var bgcolor = 'rgba('+zjs.random(0,255)+','+zjs.random(0,255)+','+zjs.random(0,255)+',1)';
		var degs = [45,135,0],
			//skew = 'skew('+degs[zjs.random(0,3)]+'deg,'+degs[zjs.random(0,3)]+'deg)';
			skew = 'skew('+degs[zjs.random(0,3)]+'deg)';
		
		// neu nhu su dung css3 thi minh se dung transform thay cho top, left luon
		if(usedcss3){
			from['transform'] = 'translate3d('+from.left+'px, '+from.top+'px, 0) '+skew;
			to['transform'] = 'translate3d('+to.left+'px, '+to.top+'px, 0) '+skew;
			between['transform'] = 'translate3d('+between.left+'px, '+between.top+'px, 0) '+skew;
			from.left = from.top = to.left = to.top = between.left = between.top = 0;
			to.width = between.width = from.width;
			to.height = between.height = from.height;
		};
		
		// set style
		zEl.setStyle({
			width: from.width,
			height: from.height,
			left: from.left,
			top: from.top,
			background: bgcolor
		});
		if(usedcss3)
			zEl.setStyle('transform', from['transform']);
		else
			zEl.setStyle('transform', skew);
		
		// append to wrapper element
		zEl.appendTo(wrapperEl);
		
		// ko can dung den wrapper nua, xoa di cho nhe
		wrapperEl = false;
		delete wrapperEl;
		
		// random time
		time = time * zjs.random(50,150) / 100 * (1-peak);
		//time = time * (1-peak);
		//console.log(time);
		// sau do se run transition
		//console.log(from,to);
		zEl.playTransition({
			from:from,
			to:between,
			time:time/2,
			timingfunction:0,
			onFinish: function(event){
				// ko cho phep chay nua
				event.preventDefault();
				// xoa cai transition cu
				zEl.unsetTransition();
				// sau do se set 1 cai transition moi
				zEl.playTransition({
					from:between,
					to:to,
					time:time/2,
					timingfunction:0,
					onFinish: function(event){
						// ko cho phep chay nua
						event.preventDefault();
						// xoa cai transition cu
						zEl.unsetTransition();
						// remove luon element 
						zEl.remove();
					}
				});
			}
		});
		
	};
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		metromusicvisualization: function(option){
			
			option = zjs.extend({
				time: 10000,
				density: 0.5, // mat do
				size: 1,
				peak: 0.5,
				autoplay:true
			}, option);
			
			// fix option			
			if(option.density<0)option.density=0;
			if(option.density>1)option.density=0.9;
			
			// set peak
			this.setpeakmetromusicvisualization(option.peak);
			
			// cho phep play
			this.setData('mmvisualplay', option.autoplay);
			
			this.each(function(element){
				var zElement = zjs(element);
				
				// dau tien se fix lai style
				zElement.setStyle({position:'relative',overflow:'hidden'});
				
				var createvusbox = function(){
					if(!zElement.getData('mmvisualplay'))return;
					// get peak
					var peak = zElement.getData('mmvisualpeak');
					// run
					if(zjs.random(0,100*(1-option.density)*(1-peak))==1)
						new Visuaz(element, option.size, option.time, peak);
				};
				//createvusbox();
				window.setInterval(createvusbox, 20);
				
			});
			
			return this;
		},
		setpeakmetromusicvisualization: function(number){
			return this.setData('mmvisualpeak', number);
		},
		playmetromusicvisualization: function(){
			return this.setData('mmvisualplay',true);
		},
		stopmetromusicvisualization: function(){
			return this.setData('mmvisualplay',false);
		}
		
	});
	
	// load as default
	zjs(function(){
		zjs('.metromusicvisualization').each(function(element){
			var zElement = zjs(element),
				option = zElement.getAttr('data-option','');
			if(!zjs.isString(option))option='';
			option = option.jsonDecode();
			zElement.metromusicvisualization(option);
		});
	});
	
	// register module name
	zjs.required('transition.metromusicvisualization');

});