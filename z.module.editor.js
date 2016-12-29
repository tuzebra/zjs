// MODULE EDITOR
zjs.require('tinymce', function(){
	
	var uniqueId = 0,
		optionkey = 'zmoduleeditoroption',
		edkey = 'zmoduleeditormceed';
	
	// extend core mot so option
	zjs.extendCore({
		moduleEditorOption: {
			css: zjs.requireOption.root+'z.module.editor.reset.css',
			customcss: '',
			baseurl: '',
			converturls: true,
			usedefaultbutton: true,
			buttons:'',
			transparentbutton: false,
			displayastextinput: true,
			formats: {
				bold : {inline:'strong'},
                italic : {inline:'em'},
                underline : {inline:'u'}
			}
		},
		moduleEditorPlugins: {
		
		},
		moduleEditorButtons: {
			bold: function(zEl){zEl.editorBold()},
			underline: function(zEl){zEl.editorUnderline()},
			italic: function(zEl){zEl.editorItalic()},
			
			alignleft: function(zEl){zEl.editorAlignLeft()},
			aligncenter: function(zEl){zEl.editorAlignCenter()},
			alignright: function(zEl){zEl.editorAlignRight()},
			alignfull: function(zEl){zEl.editorAlignFull()},
			
			bullist: function(zEl){zEl.editorInsertUnorderedList()},
			numlist: function(zEl){zEl.editorInsertOrderedList()},
			indent: function(zEl){zEl.editorIndent()},
			outdent: function(zEl){zEl.editorOutdent()},
			
			blockquote: function(zEl){zEl.editorBlockQuote()},
			removeformat: function(zEl){zEl.editorRemoveFormat()}
		}
	});
	
	// trigger
	//editor.activate
	//editor.formatchange
	//editor.hide
	//editor.show
	//editor.keypress
	//editor.click
	
	
	// template
	//var hoverclass = 'hover',
	//	activeclass = 'active';
	var zeditorparentclass = 'zeditor-parent',
		zeditoriframecontainerclass = 'zeditor-iframecontainer';
	
	// - - - - - - - - -
	// MAIN FUNCTIONS
	
	var makeEditor = function(element, useroption){
		
		var zEl = zjs(element);
		
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleEditorOption);
		// extend from inline option ?
		var inlineoption = zEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// bay gio moi luu lai option
		zEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// reset id cho dung
		var mceId = zEl.getAttr('id','');
		if(mceId==''){
			mceId = 'zeditor'+(uniqueId++);
			zEl.setAttr('id', mceId);
		};
		
		var	mceButtonWrapperId = mceId+'_buttons',
			mceParentId = mceId+'_parent',
			mceIframeContainerId = mceId+'_iframecontainer',
			mceHeight = zEl.height(),
			mceWidth = zEl.width();
		
		// len danh sach cac plugins
		var plugins = Object.keys(zjs.moduleEditorPlugins);
	
		// chuan bi cac option de tao moi 1 cai editor
		var editorOption = {
			content_css: option.css,
			convert_urls: option.converturls,
			relative_urls: true,
			remove_script_host: true,
			document_base_url: option.baseurl,
			// Prevents language packs from loading
			language: false,
			entity_encoding: 'raw',
			convert_fonts_to_spans: true,
			plugins: plugins.join(','),
			formats: option.formats, 
			theme: function(editor, target){
				// make iframe
				zjs('<div style="width:'+mceWidth+'px" id="'+mceParentId+'" class="'+zeditorparentclass + (option.displayastextinput?' inputtext':'') + '"><div id="'+mceIframeContainerId+'" class="'+zeditoriframecontainerclass+'"></div></div>').insertAfter(target);
					
				// Register state change listeners
				editor.onInit.add(function(){
					
					// add custom css
					if(zjs.isString(option.customcss) && option.customcss != '')
						zjs('<link type="text/css" rel="stylesheet" href="'+option.customcss+'">').appendTo(editor.getDoc().head);
					else if(zjs.isArray(option.customcss)){
						zjs.foreach(option.customcss, function(customcss){
							if(zjs.isString(customcss) && customcss != '')
								zjs('<link type="text/css" rel="stylesheet" href="'+customcss+'">').appendTo(editor.getDoc().head);
						});
					};
					
					
					// --
					
					
					// boi vi khong co cai formatter nao cua <ul>,<ol> nen se tao ra 1 cahi
					editor.formatter.register('bullist', {inline : 'ul'});
					editor.formatter.register('numlist', {inline : 'ol'});
				
					zjs.foreach(['bold','italic','underline',
						'strikethrough', 'subscript', 'superscript',
						'alignleft','alignright','aligncenter','alignfull',
						'forecolor', 'hilitecolor',	
						'fontname', 'fontsize', 'fontsize_class',
						'blockquote', 'link',
						'bullist','numlist'], function(command){
						editor.formatter.formatChanged(command, function(state){

							// highlight may cai button default xem choi
							zjs('#'+mceButtonWrapperId).find('.zbutton.'+command)[state?'addClass':'removeClass']('active');
							
							// trigger event for element
							zEl.trigger('editor.formatchange', {command:command, state:state});
						});
					});
					
					zjs.foreach({onActivate:'activate',onKeyPress:'keypress',onClick:'click'}, function(name, orgname){
						editor[orgname].add(function(ed, e){zEl.trigger('editor.'+name, e)})
					});
					
					// khi init xong xuoi het roi thi luc nay moi add default buttons vao
					
					
					// xem coi co su dung default button hay khong
					if(option.usedefaultbutton)
						option.buttons = 'bold,underline,italic|alignleft,aligncenter,alignright,alignfull|bullist,numlist,indent,outdent|blockquote|removeformat';
			
					// xem coi co render button hay khong
					if(option.buttons.trim()!=''){
						// dau tien xem coi co cai wrapper nao de chua cac button hay chua
						// neu chua co thi se tu tao
						var buttonsWrapperEl = zjs('<div class="zeditor-buttons-wrapper"></div>').insertBefore(zjs('#'+mceParentId));
						buttonsWrapperEl.setAttr('id', mceButtonWrapperId);
			
						// sau do se append cac button vao theo tung group
						var groupbuttons = option.buttons.split(/\s*\|\s*/);
						zjs.foreach(groupbuttons, function(groupbutton){
				
							// append 1 group vao
							var groupbuttonEl = zjs('<div class="zgroupbutton"></div>').appendTo(buttonsWrapperEl);
							if(option.transparentbutton)
								groupbuttonEl.addClass('transparent');
							
							var buttons = groupbutton.split(/\s*,\s*/);
							zjs.foreach(buttons, function(button){
								
								// xem coi cai button nay co phuong thuc khoi tao nao dac biet hay khong
								var buttonEl = false;
								if(button in zjs.moduleEditorButtons){
									if(zjs.isObject(zjs.moduleEditorButtons[button])){
										if('init' in zjs.moduleEditorButtons[button]){
											if(zjs.isFunction(zjs.moduleEditorButtons[button].init)){
												buttonEl = zjs.moduleEditorButtons[button].init(zEl);
											}
										}
									}
								}
								
								if(!buttonEl)
									buttonEl = zjs('<a class="zbutton '+button+'">'+button+'</a>');
									
								buttonEl.addClass('zeditorbutton').appendTo(groupbuttonEl);
									
								if(option.transparentbutton)
									buttonEl.addClass('transparent');
									
								// xem coi co handler gi cho cai button nay khong
								if(button in zjs.moduleEditorButtons){
									if(zjs.isFunction(zjs.moduleEditorButtons[button])){
										buttonEl.click(function(event){
											event.preventDefault();
											zjs.moduleEditorButtons[button].call(this, zEl);
										});
									}
								}
							});
						});
						
						// make button neu nhu chua auto
						if('moduleUiButtonOption' in zjs){			
							buttonsWrapperEl.find('.zbutton').makeButton();
							buttonsWrapperEl.find('.zgroupbutton').makeGroupButton();
							buttonsWrapperEl.find('.zeditorbutton').addClass('zui-editor-icon');
						};
					};
					
					
					
					
					
				});
				//editor.onVisualAid.add(function(ed, e, s) {
				//	console.debug('onVisualAid event: ' + ed.id + ", State: " + s);
				//});
				//editor.onNodeChange.add(function(ed, cm, e) {
					// Activates the link button when the caret is placed in a anchor element
				//	if (e.nodeName == 'A')
				//		cm.setActive('link', true);
				//});
				return {
					editorContainer: mceParentId,
					iframeContainer: mceIframeContainerId,
					iframeHeight: mceHeight
				};
			}
		};
		
		// get more option from plugin
		for(var i=0;i<plugins.length;i++)
			zjs.moduleEditorPlugins[plugins[i]].call(this, option, editorOption);
	
		// tao moi editor
		var editor = new tinymce.Editor(mceId, editorOption);
		
		// start render
		editor.render(1);
		
		// save cai editor nay luon de sau nay dung lai
		zEl.setData(edkey, editor);
		
	},
	
	editorCommand = function(element, cmd, ui, value){
		// test coi co phai la editer khong
		// neu khong thi thoi
		var zEl = zjs(element);
		if(!zEl.getData(optionkey))return;
		
		// get ra editor
		var editor = zEl.getData(edkey);
		editor.execCommand(cmd, ui, value);
	};
	
	//Instance commands:
	// from: http://www.tinymce.com/wiki.php/Command_identifiers
	// mceImage, mceInsertContent, mceInsertLink
	// mceToggleVisualAid	Turns on or off visual aids like table borders.
	// tinyMCE.execCommand('mceReplaceContent',false,'<b>{$selection}</b>')
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeEditor: function(useroption){
			return this.each(function(element){makeEditor(element, useroption)});
		},
		editorShow: function(){
			return this.each(function(element){
				var zEl = zjs(element), editor = zEl.getData(edkey);if(!editor)return;editor.show();
				zEl.trigger('editor.show');
			});
		},
		editorHide: function(){
			return this.each(function(element){
				var zEl = zjs(element), editor = zEl.getData(edkey);if(!editor)return;editor.hide();
				zEl.trigger('editor.hide');
			});
		},
		editorIsHidden: function(){
			var editor = this.item(0).getData(edkey);if(!editor)return false;return editor.isHidden();
		},
		
		// EXEC COMMAND
		editorCommand: function(cmd, ui, value){return this.each(function(element){editorCommand(element, cmd, ui, value)})},
		editorBold: function(){return this.editorCommand('bold')},
		editorUnderline: function(){return this.editorCommand('underline')},
		editorItalic: function(){return this.editorCommand('italic')},
		// 
		editorStrikethrough: function(){return this.editorCommand('Strikethrough')},
		editorSuperscript: function(){return this.editorCommand('Superscript')},
		editorSubscript: function(){return this.editorCommand('Subscript')},
		
		// ALIGN
		editorAlign: function(justify){return this.editorCommand('Justify'+justify)},
		editorAlignLeft: function(){return this.editorAlign('left')},
		editorAlignRight: function(){return this.editorAlign('right')},
		editorAlignCenter: function(){return this.editorAlign('center')},
		editorAlignFull: function(){return this.editorAlign('full')},
		
		// LIST: ul, ol
		editorInsertUnorderedList: function(content){return this.editorCommand('InsertUnorderedList', false, content)},
		editorInsertOrderedList: function(content){return this.editorCommand('InsertOrderedList', false, content)},
		editorIndent: function(){return this.editorCommand('Indent')},
		editorOutdent: function(){return this.editorCommand('Outdent')},
		
		// BLOCKQUOTE
		editorBlockQuote: function(){return this.editorCommand('mceBlockQuote')},
		
		
		// insert
		editorInsert: function(content){return this.editorCommand('mceInsertContent', false, content)},
		// insert link
		// @param	object	{href:'', target:''}
		editorInsertLink: function(option){return this.editorCommand('mceInsertLink', false, option)},
		editorInsertRawHTML: function(html){return this.editorCommand('mceInsertRawHTML', false, html)},
		editorReplaceContent: function(content){return this.editorCommand('mceReplaceContent', false, content)},
		/* {$selection} */
		
		// remove format
		editorRemoveFormat: function(command){return this.editorCommand('RemoveFormat', false, command)},
		
		// INSTANCE
		editorInstance: function(){
			return this.item(0).getData(edkey);
		},
		editorGetBody: function(){
			var ed = this.editorInstance();
			if(!ed)return false;
			return zjs(ed.getDoc().body);
		},
		editorGetSelectionElements: function(query){
			
			var bodyEl = this.editorGetBody();
			if(!bodyEl) return false;
			
			// tao ra 1 cai div tam thoi
			var divEl = zjs('<div></div>').html(this.editorGetSelectionContent());
			
			// sau do se update 1 xiu cho nhung cai thang match query
			divEl.find(query).setAttr('data-temp-find-els');
			
			// gio moi thay the content
			this.editorInsert(divEl.html());
			
			// get ra lai nhung thang khop
			return bodyEl.find('[data-temp-find-els]').removeAttr('data-temp-find-els');
		},
		editorGetElements: function(query){
			
			var bodyEl = this.editorGetBody();
			if(!bodyEl) return false;
			
			// get ra lai nhung thang khop
			return bodyEl.find(query);
		},
		
		// CONTENT
		editorGetSelectionContent: function(opt){
			var editor = this.editorInstance();if(!editor)return false;return editor.selection.getContent(opt);
		},
		editorGetContent: function(opt){
			var editor = this.editorInstance();if(!editor)return false;return editor.getContent(opt);
		},
		editorSetContent: function(content){
			return this.each(function(element){
				var zEl = zjs(element), editor = zEl.getData(edkey);if(!editor)return;
				editor.setContent(content);
			});
		},
		editorSave: function(){
			return this.each(function(element){
				var zEl = zjs(element), editor = zEl.getData(edkey);if(!editor)return;
				editor.save();
			});
		},
		
		editorGetNodeEl: function(){
			var editor = this.editorInstance();if(!editor)return false;return editor.selection.getNode();
		},
		editorGetNode: function(selector){
			var zEl = zjs(this.editorGetNodeEl());
			
			// neu nhu khong co truyen vao selector thi khoe roi
			if(typeof selector == 'undefined')
				return zEl;
				
			// con neu nhu truyen vao, thi gio phai co nhiem vu tim ra cho dung
			if(zEl.is(selector))
				return zEl;
				
			return zEl.findUp(selector);
		},
		
		editorHeight: function(value){
			// xem coi la get hay la set
			if(zjs.isNumeric(value))
				return this.each(function(element){
					var zEl = zjs(element), editor = zEl.getData(edkey);if(!editor)return;
					zjs('#'+editor.id+'_ifr').height(value);
				});
			
			// la get thi se return ve height cua editor dau tien
			var editor = this.item(0).getData(edkey);if(!editor)return false;
			return zjs('#'+editor.id+'_ifr').height();
		}
		
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zeditor ko, neu nhu co thi se auto makeEditor luon
			zjs(el).find('textarea.zeditor').makeEditor();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zeditor ko, neu nhu co thi se auto makeEditor luon
			if(zjs(el).hasClass('zeditor'))zjs(el).makeEditor();
			zjs(el).find('textarea.zeditor').makeEditor();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		// make editor
		zjs('textarea.zeditor').makeEditor();
		// auto make zbutton icon
		zjs('.zeditorbutton').addClass('zui-editor-icon');
	});
	
	if('required' in zjs)
	zjs.required('editor');
});
