// MODULE CODE EDITOR
zjs.require('codemirror', function(){
	
	var uniqueId = 0,
		optionkey = 'zmodulecodeeditoroption',
		edkey = 'zmodulecodeeditored';
	
	// extend core mot so option
	zjs.extendCore({
		moduleCodeEditorOption:{
			mode:  "text/html",
			theme: "default",
			lineWrapping: true,
			lineNumbers: true,
			readOnly: false,
			showCursorWhenSelecting: false
		},
		moduleCodeEditorAddons:{
		}
	});
	
	// trigger
	
	
	// template
	
	// - - - - - - - - -
	// MAIN FUNCTIONS
	
	var makeCodeEditor = function(element, useroption){
		
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
		option = zjs.clone(zjs.moduleCodeEditorOption);
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
		var mirrorId = zEl.getAttr('id','');
		if(mirrorId==''){
			mirrorId = 'zcodeeditor'+(uniqueId++);
			zEl.setAttr('id', mirrorId);
		};
		
		// chuan bi cac option de tao moi 1 cai editor
		var editorOption = option;
		
		// xem coi cai mode la gi de ma load cho phu hop
		var codemirrorModes = [];
		if(option.mode == 'text/html' || option.mode == 'xml')codemirrorModes.push('codemirror.mode.xml');
		if(option.mode == 'text/html' || option.mode == 'javascript')codemirrorModes.push('codemirror.mode.javascript');
		if(option.mode == 'text/html' || option.mode == 'css')codemirrorModes.push('codemirror.mode.css');
		if(option.mode == 'text/html' || option.mode == 'html')codemirrorModes.push('codemirror.mode.htmlmixed');
		
		// neu nhu khong co cai mode thi thoi khong lam luon
		if(codemirrorModes.length<=0)return;
		
		// load zjs module 
		zjs.require(codemirrorModes.join(','), function(){
			
			// tao moi editor
			var editor = CodeMirror.fromTextArea(element, editorOption);
	
			// save cai editor nay luon de sau nay dung lai
			zEl.setData(edkey, editor);
		});
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeCodeEditor: function(useroption){
			return this.each(function(element){makeCodeEditor(element, useroption)});
		},
		// INSTANCE
		codeEditorInstance: function(){
			return this.item(0).getData(edkey);
		},
		codeEditorGetValue: function(){
			var editor = this.codeEditorInstance();if(!editor)return false;return editor.getValue();
		},
		codeEditorSetValue: function(content){
			return this.each(function(element){
				var editor = zjs(element).getData(edkey);
				if(editor)
					editor.setValue(content);
			});
		},
		codeEditorFocus: function(){
			var editor = this.codeEditorInstance();if(!editor)return this;
			editor.focus();
			return this;
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook

	
	// AUTO INIT
	zjs.onready(function(){
		// make editor
		zjs('textarea.zcodeeditor').makeCodeEditor();
	});
	
	if('required' in zjs)
	zjs.required('codeeditor');
	
	// sau do se load luon 4 cai mode thong dung hay su dung
	// de tang toc do load
	//zjs.require('codemirror.mode.xml, codemirror.mode.javascript, codemirror.mode.css, codemirror.mode.htmlmixed');
});