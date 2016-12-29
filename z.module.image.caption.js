// extend module Image Caption cho zjs
;(function(zjs){
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		showCaption: function(option){
			
			option = zjs.extend({
				maskup: '<div class="image-with-caption"><img/><div class="image-caption"><div class="text"></div></div></div>'
			}, option);
			
			this.each(function(element){
				var caption = zjs(element).getAttr('title','');
				if(caption.trim()=='')
					caption = zjs(element).getAttr('alt','');
				if(caption.trim()=='')
					return;

				var imgEl =     zjs(element),
					imgStyle =  imgEl.getAttr('style'),
					imgSrc =    imgEl.getAttr('src'),
					imgWidth =  imgEl.width(),
					imgHeight = imgEl.height(),
					parentEl = zjs(option.maskup);
					
				parentEl.insertBefore(element);
				imgEl.remove();
				parentEl.setAttr('style',imgStyle).width(imgWidth).height(imgHeight);
				parentEl.find('img').setAttr('src',imgSrc).width(imgWidth).height(imgHeight);
				parentEl.find('.image-caption .text').append('<span>'+caption+'</span>');
				
			});
			
		}
	});
	
	// load as default
	zjs(function(){
		zjs('img.zshowcaption').each(function(element){
			var zElement = zjs(element),
				option = zElement.getAttr('data-option','');
			if(!zjs.isString(option))option='';
			option = option.jsonDecode();
			zElement.showCaption(option);
		});
	});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('image.caption');

})(zjs);