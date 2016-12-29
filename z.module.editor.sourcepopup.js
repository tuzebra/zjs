// include plugin sourcepopup for editor
;zjs.require('editor, ui.button, ui.popup', function(){
	
	var edkey = 'zmoduleeditormceed';
	
	// template
	var _popuphtml = '<div class="zeditor-source-popup">'+
						'<form>'+
							'<h3>Html source code</h3>'+
							'<div class="field field-content"><textarea name="content" /></textarea></div>'+
							'<div class="buttons-wrapper update">'+
								'<button type="submit" class="zbutton blue btnupdate">Apply</button>'+
							'</div>'+
						'</form>'+
					'</div>';

	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		editorSourcePopup: function(){
			return this.each(function(element){
				
				// get ra xem coi day co phai la 1 cai zeditor khong
				// neu khong thi thoi
				var ed = zjs(element).getData(edkey);
				if(!ed)return;
				
				// tao ra cai popup
				var sourcePopupEl = zjs(_popuphtml).appendTo(document.body).makePopup({center:true,autoshow:true,closethenremove:true})
				var textareaEl = sourcePopupEl.find('[name=content]'),
					content = ed.getContent();
				// set content cho textarea
				textareaEl.setValue(content).focus();
				
				// make cac ui button neu nhu chua
				if('moduleUiButtonOption' in zjs)sourcePopupEl.find('.zbutton').makeButton();
				if('moduleCodeEditorOption' in zjs)textareaEl.makeCodeEditor().codeEditorFocus();
				
				// bind event submit
				sourcePopupEl.find('form').on('submit', function(event){
					event.preventDefault();
					var textareaEl = this.find('[name=content]');
					// set content cho ed
					ed.setContent(textareaEl.getData('zmodulecodeeditored') ? textareaEl.codeEditorGetValue() : textareaEl.getValue());
					ed.execCommand('mceRepaint');
					sourcePopupEl.popupHide();
				});
				
			});
		}
	});

	// done
	if('required' in zjs)
	zjs.required('editor.sourcepopup');
});