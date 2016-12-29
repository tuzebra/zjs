// extend module Expand Node cho zjs
;(function(zjs){

	// extend method cho zjs-instance
	zjs.extendMethod({
		expandNode: function(option){
			
			option = zjs.extend({signs: 'data-expand', hideAsDefault:true}, option);
			
			// main each - -
			this.each(function(element){
				var El = zjs(element),
					thisSign = El.getAttr(option.signs);
				// delete my sign
				El.setAttr(option.signs,'');
				
				var childEls = zjs('['+option.signs+'='+thisSign+']');
				
				// set height for sign elements
				childEls.each(function(element){
					var height = zjs(element).height(),
						hiding = option.hideAsDefault?1:0;
					zjs(element)
						.setStyle({absolute:'relative',overflow:'hidden'})
						.setAttr('data-eph',height)
						.setAttr('data-ephs',hiding);
				});
				
				var switchState = function(){
						childEls.each(function(element){
							var exEl = zjs(element);
							var hiding = exEl.getAttr('data-ephs',0);
						
							if(hiding==1){var to = 0,from = exEl.getAttr('data-eph');}
							else{var from = 0,to = exEl.getAttr('data-eph');};
							
							/*(new zjs.timer({
								from:from, to:to, time:500, transition:1,
								onStart: function(){},
								onProcess: function(current){exEl.height(current);},
								onFinish: function(form,to){
									exEl.height(to);
								}
							})).run();*/
							exEl.height(to);
							exEl.setAttr('data-ephs',hiding==1?0:1);
						
						});
					};
					
					switchState();
				
				El.click(function(event, element){
					switchState();
				});
				
			});
			// end main each - -
		}
	});
	
	// load as default
	zjs(function(){zjs('.expand-node').expandNode();});

	// register module name
	zjs.required('expandnode');

})(zjs);