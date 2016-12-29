// extend module Sortable cho zjs
;(function(zjs){

	var optionkey = 'zmoduleuisortableoption',
		tabindexkey = 'data-tabindex';

	// extend core mot so option
	zjs.extendCore({
		moduleUiSortableOption: {
			autoheight:false,
			transition:0
		}
	});

	// extend method cho zjs-instance
	zjs.extendMethod({
		makeSortable: function(option){
			option = zjs.extend({
				// enter your default options
				// here
				// option1: '',
				// option2: ''
			},option);

			// do each and return 
			return this.each(function(element){
				var zElement = zjs(element),
					zSortableItems = zElement.find('li');

				zSortableItems.each(function(elm){
					var zSortableItem = zjs(elm);
					zSortableItem.drag({
						onStart: function(event, element){
							console.log('start dragging');
						},
						onDrag: function(event, element, mouse, style){
							var newleft = style.left + mouse.x,
								newtop = style.top + mouse.y;
							
							// fix
							if(newleft < 0)
								newleft = 0;
							if(newleft > zSortableItems.width() - zSortableItem.width())
								newleft = zSortableItems.width() - zSortableItem.width();
							
							if(newtop < 0)
								newtop = 0;
							if(newtop > zSortableItems.height() - zSortableItem.height())
								newtop = zSortableItems.height() - zSortableItem.height();

							console.log('mouse:', mouse, ' | style:', style, ' | newtop:', newtop, ' | newleft:', newleft);

							// apply new left, top
							zSortableItem.left(newleft).top(newtop);
						},
						onDrop: function(event, element, mouse, style){
							console.log('dropped');
						}
					});
				});

				// - - -
				// start coding your module

				// ...
				// code here
				// ...

				// - - -

			});
			// end each
		}
	});

	// AUTO INIT
	zjs.onready(function(){zjs('.zsortable').makeSortable()});
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.sortable');

})(zjs);