;(function(zjs){
"use strict";

	function zpopup(option){
		var defaultContent='';
		if(typeof option == 'string')defaultContent=option;
		option = zjs.extend({
			classname:'',
			closeButton:true,
			content:defaultContent,
			autoShow:true,
			destroyWhenClose:true,
			parentElement: document.body,
			onShow: function(element){},
			onHide: function(element){}
		}, option);
	
		var self = this;
		this.dws = option.destroyWhenClose;

		this.zElement = zjs('<div class="z-module-popup-wrap" style="display:none;">'+
			'<div class="z-module-popup-border">'+
				'<div class="z-module-popup-content">'+
					(option.closeButton?'<a class="z-module-popup-closebtn">×</a>':'')+
					'<div class="z-module-popup-body">'+option.content+'</div>'+
				'</div>'+
			'</div>'+
		'</div>');
	
		this.zElement.addClass(option.classname).appendTo(option.parentElement);
		this.zElement.find('.z-module-popup-closebtn').click(function(event){event.preventDefault();self.close();});
		this.onShow = function(){option.onShow(self.zElement.item(0,true))};
		this.onHide = function(){option.onHide(self.zElement.item(0,true))};
		if(option.autoShow)this.zElement.fadeIn({callback:this.onShow});
		this.popupbodyEl = this.zElement.find('.z-module-popup-body');
		
		return this;
	};
	
	zpopup.prototype = {
		setContent:function(html){this.popupbodyEl.html(html);},
		close:function(){if(this.dws)this.zElement.removeSlow();else this.hide({callback:this.onHide});},
		show:function(){this.zElement.fadeIn({callback:this.onShow});},
		hide:function(){this.zElement.fadeOut({callback:this.onHide});}
	};
	// - - - - - - - - - - - - - - - - - - -


	// extend to zjs

	zjs.extendCore({
		popup: function(option){return new zpopup(option);}
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('popup');

})(zjs);