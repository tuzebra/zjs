// include plugin contexttableprop for editor
;zjs.require('editor, editor.table, ui.button, ui.popup', function(){
	
	// include plugin code 
	(function() {
		var defs = {
				use_contexttableprop : true
			},
			DOM = tinymce.DOM;
	
		function getParam(ed, name) {
			return ed.getParam(name, defs[name]);
		};
		
		tinymce.create('tinymce.plugins.ContextTablePropPlugin', {

			init : function(ed, url) {
				
				if(!getParam(ed, 'use_contexttableprop'))
					return;
				
				ed.onNodeChange.addToTop(function(ed, cm, node) {
					
					// xem coi co dang click vao <table> khong
					// neu khong get ra duoc doc thi bo tay
					var doc = ed.contentWindow.document,
						tableEl = DOM.getParent(node, 'table');
					if(!doc || !tableEl || tableEl.tagName!='TABLE'){
						// hide cai popup link lai ngay
						tablePropPopupEl.popupHide();
						return;
					};
					
					if(tablePropPopupEl.getData('tableEl') == tableEl)return;
				
					// xac dinh cai content area
					var	areaContainerEl = zjs('#'+ed.getContentAreaContainer());
				
					// move cai popup vao cho dung vi tri thoi ^^
					tablePropPopupEl.setData('tableEl', tableEl).setData('ed', ed).popupShow().left(areaContainerEl.left() + areaContainerEl.width()).top(areaContainerEl.top() + zjs(tableEl).top());
				});

			},

			/**
			* Returns information about the plugin as a name/value array.
			* The current keys are longname, author, authorurl, infourl and version.
			*
			* @return {Object} Name/value array containing information about the plugin.
			*/
			getInfo : function() {
				return {
					longname : 'ContextTableProp',
					author : 'Tuzebra',
					authorurl : 'http://tuzebra.com',
					infourl : 'http://tuzebra.com',
					version : tinymce.majorVersion + "." + tinymce.minorVersion
				};
			}
		});

		// Register plugin
		tinymce.PluginManager.add('contexttableprop', tinymce.plugins.ContextTablePropPlugin);
	})();
	
	
	// extend them option cho editor
	zjs.extend(zjs.moduleEditorOption, {
		contexttableprop:true
	});

	// extend plugin
	zjs.extend(zjs.moduleEditorPlugins, {
		contexttableprop: function(option, editorOption){
			// neu nhu option cua plugin bat len thi moi cho phep su dung contexttableprop
			if('contexttableprop' in option && !option.contexttableprop){
				return zjs.extend(editorOption, {
					use_contexttableprop : false
				});
			};
		}
	});
	
	// tao ra 1 cai popup
	var _popuphtml = '<div class="zeditor-contexttableprop-popup">'+
						'<form class="cell">'+
							'<h3>Cell</h3>'+
							'<div class="field"> '+
								'<div class="buttons-wrapper">'+
									'<a class="zbutton btnmerge">Merge</a>'+
									'<a class="zbutton btnsplit">Split</a>'+
								'</div>'+
							'</div>'+
						'</form>'+
						'<form class="row">'+
							'<h3>Row</h3>'+
							'<div class="field field-insert"><label><span>Insert</span> '+
								'<div class="buttons-wrapper">'+
									'<a class="zbutton btninsertabove">Above</a>'+
									'<a class="zbutton btninsertbelow">Below</a>'+
									'<a class="zbutton red btndeleterow">Delete</a>'+
								'</div>'+
							'</div>'+
						'</form>'+
						'<form class="column">'+
							'<h3>Column</h3>'+
							'<div class="field field-insert"><label><span>Insert</span> '+
								'<div class="buttons-wrapper">'+
									'<a class="zbutton btninsertleft">Left</a>'+
									'<a class="zbutton btninsertright">Right</a>'+
									'<a class="zbutton red btndeletecolumn">Delete</a>'+
								'</div>'+
							'</div>'+
						'</form>'+
						'<form class="table">'+
							'<h3>Table</h3>'+
							'<div class="buttons-wrapper delete">'+
								'<a class="zbutton red btndeletetable">Delete</a>'+
							'</div>'+
						'</form>'+
					'</div>';
					
	var tablePropPopupEl = zjs(_popuphtml).appendTo(document.body);
	// repain
	var edRepain = function(){
		var ed = tablePropPopupEl.getData('ed');
		if(ed)ed.execCommand('mceRepaint');
	};
	// make popup
	tablePropPopupEl.makePopup({pagecover:false,clickout:true,center:false})
	.on('ui.popup.hide', function(){
		this.setData('tableEl', false);
	});
	// bind event cell button
	tablePropPopupEl.find('.btnmerge').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableMergeCells');});
	tablePropPopupEl.find('.btnsplit').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableSplitCells');});
	// bind event row button
	tablePropPopupEl.find('.btninsertabove').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableInsertRowBefore');});
	tablePropPopupEl.find('.btninsertbelow').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableInsertRowAfter');});
	tablePropPopupEl.find('.btndeleterow').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableDeleteRow');});
	// bind event column button
	tablePropPopupEl.find('.btninsertleft').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableInsertColBefore');});
	tablePropPopupEl.find('.btninsertright').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableInsertColAfter');});
	tablePropPopupEl.find('.btndeletecolumn').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableDeleteCol');});
	// bind event table button
	tablePropPopupEl.find('.btndeletetable').click(function(){tablePropPopupEl.getData('ed').execCommand('mceTableDelete');});
	
	// make cac ui button neu nhu chua
	if('moduleUiButtonOption' in zjs)tablePropPopupEl.find('.zbutton').makeButton();
	
	// done
	if('required' in zjs)
	zjs.required('editor.contexttableprop');
});