// include plugin contextlinkprop for editor
;zjs.require('editor, ui.button, ui.popup, form.validation', function(){
	
	// include plugin code 
	(function() {
		var defs = {
				use_contextlinkprop : true
			},
			DOM = tinymce.DOM;
	
		function getParam(ed, name) {
			return ed.getParam(name, defs[name]);
		};
		
		tinymce.create('tinymce.plugins.ContextLinkPropPlugin', {

			init : function(ed, url) {
				
				if(!getParam(ed, 'use_contextlinkprop'))
					return;
				
				ed.onNodeChange.addToTop(function(ed, cm, node) {
					
					// xem coi co dang click vao <img> khong
					// neu khong get ra duoc doc thi bo tay
					var doc = ed.contentWindow.document,
						aEl = DOM.getParent(node, 'a');
					if(!doc || !aEl || aEl.tagName!='A'){
						// hide cai popup link lai ngay
						linkPropPopupEl.popupHide();
						return;
					};
					
					if(linkPropPopupEl.getData('aEl') == aEl)return;
				
					// xac dinh cai content area
					var	areaContainerEl = zjs('#'+ed.getContentAreaContainer());
				
					// move cai popup vao cho dung vi tri thoi ^^
					linkPropPopupEl.setData('aEl', aEl).setData('ed', ed).popupShow().left(areaContainerEl.left() + areaContainerEl.width()).top(areaContainerEl.top() + zjs(aEl).top());
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
					longname : 'ContextLinkProp',
					author : 'Tuzebra',
					authorurl : 'http://tuzebra.com',
					infourl : 'http://tuzebra.com',
					version : tinymce.majorVersion + "." + tinymce.minorVersion
				};
			}
		});

		// Register plugin
		tinymce.PluginManager.add('contextlinkprop', tinymce.plugins.ContextLinkPropPlugin);
	})();
	
	
	// extend them option cho editor
	zjs.extend(zjs.moduleEditorOption, {
		contextlinkprop:true
	});

	// extend plugin
	zjs.extend(zjs.moduleEditorPlugins, {
		contextlinkprop: function(option, editorOption){
			// neu nhu option cua plugin bat len thi moi cho phep su dung contextlinkprop
			if('contextlinkprop' in option && !option.contextlinkprop){
				return zjs.extend(editorOption, {
					use_contextlinkprop : false
				});
			};
		}
	});
	
	// tao ra 1 cai popup
	var _popuphtml = '<div class="zeditor-contextlinkprop-popup">'+
						'<form class="prop zvalidation">'+
							'<h3>Hyperlink</h3>'+
							'<div class="field field-href"><label><span>Url</span> <input type="text" name="href" class="required" placeholder="http://" /></label></div>'+
							'<div class="field field-target"><label><input type="checkbox" name="target_blank" value="1" /> Open in new tab</label></div>'+
							'<div class="field field-title"><label><span>Title</span> <textarea name="title" class="zautoheight" /></textarea></label></div>'+
							'<div class="buttons-wrapper">'+
								'<a class="zbutton red btnunlink">Unlink</a>'+
								'<button type="submit" class="zbutton blue btnupdate">Apply</button>'+
							'</div>'+
						'</form>'+
					'</div>';
					
	var linkPropPopupEl = zjs(_popuphtml).appendTo(document.body);
	// repain
	var edRepain = function(){
		var ed = linkPropPopupEl.getData('ed');
		if(ed)ed.execCommand('mceRepaint');
	};
	// make popup
	linkPropPopupEl.makePopup({pagecover:false,clickout:true,center:false})
	.on('ui.popup.show', function(){
		var aEl = this.getData('aEl', false);if(!aEl)return;aEl = zjs(aEl);
		this.find('[name=href]').setValue(aEl.getAttr('href', ''));
		this.find('[name=title]').setValue(aEl.getAttr('title', ''));
		this.find('[name=target_blank]').check(aEl.getAttr('target', '') == '_blank');
		// reset validate form
		if('moduleFormValidationOption' in zjs)this.find('form').formValidationReset();
	})
	.on('ui.popup.hide', function(){
		this.setData('aEl', false);
	});
	// make submit event neu nhu chua
	if('moduleFormValidationOption' in zjs)linkPropPopupEl.find('form').formValidation();
	// bind event submit
	linkPropPopupEl.find('form').on('submit', function(event){
		event.preventDefault();
		var aEl = linkPropPopupEl.getData('aEl', false);if(!aEl)return;aEl = zjs(aEl);
		var option = this.getFormData();
		option.target = option.target_blank ? '_blank' : '';
		delete option.target_blank;
		var ed = linkPropPopupEl.getData('ed');
		ed.execCommand('mceInsertLink', false, option);
		edRepain();
	});
	// bind event for unlink button
	linkPropPopupEl.find('.btnunlink').click(function(){
		linkPropPopupEl.popupHide();
		var ed = linkPropPopupEl.getData('ed');
		if(ed){
			ed.execCommand('mceInsertLink', false, {href:''});
			ed.execCommand('mceRepaint');
		};
	});
	// make cac ui button neu nhu chua
	if('moduleUiButtonOption' in zjs)linkPropPopupEl.find('.zbutton').makeButton();
	if('moduleTextareaAutoheightOption' in zjs)linkPropPopupEl.find('textarea.zautoheight').makeTextareaAutoheight();
	
	// done
	if('required' in zjs)
	zjs.required('editor.contextlinkprop');
});