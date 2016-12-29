// include plugin contextimageprop for editor
;zjs.require('editor, ui.button, ui.popup', function(){
	
	// include plugin code 
	(function() {
		var defs = {
				use_contextimageprop : true
			},
			DOM = tinymce.DOM;
	
		function getParam(ed, name) {
			return ed.getParam(name, defs[name]);
		};
		
		tinymce.create('tinymce.plugins.ContextImagePropPlugin', {

			init : function(ed, url) {
				
				if(!getParam(ed, 'use_contextimageprop'))
					return;
				
				ed.onNodeChange.addToTop(function(ed, cm, node) {
					
					// xem coi co dang click vao <img> khong
					// neu khong get ra duoc doc thi bo tay
					var doc = ed.contentWindow.document,
						imgEl = node;
					if(!doc || !imgEl || imgEl.tagName!='IMG'){
						// hide cai popup link lai ngay
						imagePropPopupEl.popupHide();
						return;
					};
					
					if(imagePropPopupEl.getData('imgEl') == imgEl)return;
				
					// xac dinh cai content area
					var	areaContainerEl = zjs('#'+ed.getContentAreaContainer());
				
					// move cai popup vao cho dung vi tri thoi ^^
					imagePropPopupEl.setData('imgEl', imgEl).setData('ed', ed).popupShow().left(areaContainerEl.left() + areaContainerEl.width()).top(areaContainerEl.top() + zjs(imgEl).top());
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
					longname : 'ContextImageProp',
					author : 'Tuzebra',
					authorurl : 'http://tuzebra.com',
					infourl : 'http://tuzebra.com',
					version : tinymce.majorVersion + "." + tinymce.minorVersion
				};
			}
		});

		// Register plugin
		tinymce.PluginManager.add('contextimageprop', tinymce.plugins.ContextImagePropPlugin);
	})();
	
	
	// extend them option cho editor
	zjs.extend(zjs.moduleEditorOption, {
		contextimageprop:true
	});

	// extend plugin
	zjs.extend(zjs.moduleEditorPlugins, {
		contextimageprop: function(option, editorOption){
			// neu nhu option cua plugin bat len thi moi cho phep su dung contextimageprop
			if('contextimageprop' in option && !option.contextimageprop){
				return zjs.extend(editorOption, {
					use_contextimageprop : false
				});
			};
		}
	});
	
	// tao ra 1 cai popup
	var _popuphtml = '<div class="zeditor-contextimageprop-popup">'+
						'<form class="prop">'+
							'<h3>Image</h3>'+
							'<div class="field field-alt"><label><span>Alternate text</span> <textarea name="alt" class="zautoheight" /></textarea></label></div>'+
							'<div class="field field-width"><label><span>Width</span> <input type="text" name="width" value="" placeholder="auto" /></label></div>'+
							'<div class="field field-height"><label><span>Height</span> <input type="text" name="height" value="" placeholder="auto" /></label></div>'+
							'<div class="buttons-wrapper update">'+
								'<button type="submit" class="zbutton blue btnupdate">Apply</button>'+
							'</div>'+
						'</form>'+
						'<form class="action">'+
							'<div class="field field-float"><label><span>Float</span> '+
								'<div class="buttons-wrapper float">'+
									'<a class="zbutton btnfloatnone">None</a>'+
									'<a class="zbutton btnfloatleft">Left</a>'+
									'<a class="zbutton btnfloatright">Right</a>'+
								'</div>'+
							'</div>'+
							'<div class="field field-display"><label><span>Display</span> '+
								'<div class="buttons-wrapper display">'+
									'<a class="zbutton btndisplayinline">Inline</a>'+
									'<a class="zbutton btndisplayblock">Block</a>'+
								'</div>'+
							'</div>'+
							'<div class="buttons-wrapper delete">'+
								'<a class="zbutton red btndelete">Delete</a>'+
							'</div>'+
						'</form>'+
					'</div>';
					
	var imagePropPopupEl = zjs(_popuphtml).appendTo(document.body);
	// repain
	var edRepain = function(){
		var ed = imagePropPopupEl.getData('ed');
		if(ed)ed.execCommand('mceRepaint');
	};
	// make popup
	imagePropPopupEl.makePopup({pagecover:false,clickout:true,center:false})
	.on('ui.popup.show', function(){
		var imgEl = this.getData('imgEl', false);if(!imgEl)return;imgEl = zjs(imgEl);
		this.find('[name=alt]').setValue(imgEl.getAttr('alt', ''));
		this.find('[name=width]').setValue(imgEl.getAttr('width', ''));
		this.find('[name=height]').setValue(imgEl.getAttr('height', ''));
	})
	.on('ui.popup.hide', function(){
		this.setData('imgEl', false);
	});
	// bind event submit
	imagePropPopupEl.find('form').on('submit', function(event){
		event.preventDefault();
		var imgEl = imagePropPopupEl.getData('imgEl', false);if(!imgEl)return;imgEl = zjs(imgEl);
		var option = this.getFormData();
		if('alt' in option)imgEl.setAttr('alt', option.alt);
		if('title' in option)imgEl.setAttr('title', option.title);
		if('width' in option)imgEl.setAttr('width', option.width);
		if('height' in option)imgEl.setAttr('height', option.height);
		edRepain();
	});
	// bind event for float button
	imagePropPopupEl.find('.btnfloatnone').click(function(){zjs(imagePropPopupEl.getData('imgEl')).setStyle('float','none');edRepain();});
	imagePropPopupEl.find('.btnfloatleft').click(function(){zjs(imagePropPopupEl.getData('imgEl')).setStyle('float','left');edRepain();});
	imagePropPopupEl.find('.btnfloatright').click(function(){zjs(imagePropPopupEl.getData('imgEl')).setStyle('float','right');edRepain();});
	// bind event for display button
	imagePropPopupEl.find('.btndisplayinline').click(function(){zjs(imagePropPopupEl.getData('imgEl')).setStyle('display','inline');edRepain();});
	imagePropPopupEl.find('.btndisplayblock').click(function(){zjs(imagePropPopupEl.getData('imgEl')).setStyle('display','block');edRepain();});
	// bind event for delete button
	imagePropPopupEl.find('.btndelete').click(function(){zjs(imagePropPopupEl.getData('imgEl')).remove();edRepain();imagePropPopupEl.popupHide();});
	// make cac ui button neu nhu chua
	if('moduleUiButtonOption' in zjs)imagePropPopupEl.find('.zbutton').makeButton();
	if('moduleTextareaAutoheightOption' in zjs)imagePropPopupEl.find('textarea.zautoheight').makeTextareaAutoheight();
	
	// done
	if('required' in zjs)
	zjs.required('editor.contextimageprop');
});