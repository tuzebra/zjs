zjs.require('transition', function(){
	
	zjs.extendMethod({
		
		setHtmlWithNoticed: function(html, option){
			
			option = zjs.extend({from:{background:'#FFFEC8'}, to:{background:'#fff'}, time:1500}, option);
			
			// main each
			this.each(function(element){
				var zEl = zjs(element);
					oldHtml = zEl.getInnerHTML();
				if(oldHtml == html)return;
				zEl.html(html).playTransition(option);
			});
			
			// zjs syntax
			return this;
		}
		
	});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('htmlnoticed');
});