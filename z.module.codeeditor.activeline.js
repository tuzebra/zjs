// include addon activeline for codeeditor

// Because sometimes you need to style the cursor's line.
//
// Adds an option 'styleActiveLine' which, when enabled, gives the
// active line's wrapping <div> the CSS class "CodeMirror-activeline",
// and gives its background <div> the class "CodeMirror-activeline-background".
;zjs.require('codeeditor', function(){
	
	// include addon code 
	(function() {
	  "use strict";
	  var WRAP_CLASS = "CodeMirror-activeline";
	  var BACK_CLASS = "CodeMirror-activeline-background";

	  CodeMirror.defineOption("styleActiveLine", false, function(cm, val, old) {
		var prev = old && old != CodeMirror.Init;
		if (val && !prev) {
		  updateActiveLine(cm);
		  cm.on("cursorActivity", updateActiveLine);
		} else if (!val && prev) {
		  cm.off("cursorActivity", updateActiveLine);
		  clearActiveLine(cm);
		  delete cm.state.activeLine;
		}
	  });

	  function clearActiveLine(cm) {
		if ("activeLine" in cm.state) {
		  cm.removeLineClass(cm.state.activeLine, "wrap", WRAP_CLASS);
		  cm.removeLineClass(cm.state.activeLine, "background", BACK_CLASS);
		}
	  }

	  function updateActiveLine(cm) {
		var line = cm.getLineHandleVisualStart(cm.getCursor().line);
		if (cm.state.activeLine == line) return;
		clearActiveLine(cm);
		cm.addLineClass(line, "wrap", WRAP_CLASS);
		cm.addLineClass(line, "background", BACK_CLASS);
		cm.state.activeLine = line;
	  }
	})();
	
	// extend them option cho editor
	zjs.extend(zjs.moduleCodeEditorOption, {
		styleActiveLine:true
	});

	// extend addon
	zjs.extend(zjs.moduleCodeEditorAddons, {
		activeline: function(option, editorOption){
		}
	});

	// done
	if('required' in zjs)
	zjs.required('codeeditor.activeline');
});