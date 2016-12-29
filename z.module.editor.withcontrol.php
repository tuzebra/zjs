<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>zjs editor module - with default control button</title>
	<script type="text/javascript" src="z.js"></script>
	<script>
		zjs.onready('editor, editor.table, editor.paste, editor.autolink, editor.autoresize, editor.contexttableprop, editor.contextimageprop, editor.contextlinkprop, editor.sourcepopup, ui.button, ui.popup, scrollbar, textarea.autoheight, codeeditor, codeeditor.activeline, codeeditor.closetag', function(){
			
			// bind event for buttons
			zjs('a.bold').click(function(){		zjs('#editor1').editorBold() });
			zjs('a.underline').click(function(){	zjs('#editor1').editorUnderline() });
			zjs('a.italic').click(function(){	zjs('#editor1').editorItalic() });
			
			zjs('a.alignleft').click(function(){		zjs('#editor1').editorAlignLeft() });
			zjs('a.aligncenter').click(function(){		zjs('#editor1').editorAlignCenter() });
			zjs('a.alignright').click(function(){		zjs('#editor1').editorAlignRight() });
			zjs('a.alignfull').click(function(){		zjs('#editor1').editorAlignFull() });
			
			zjs('a.bullist').click(function(){zjs('#editor1').editorInsertUnorderedList() });
			zjs('a.numlist').click(function(){zjs('#editor1').editorInsertOrderedList() });
			zjs('a.indent').click(function(){zjs('#editor1').editorIndent() });
			zjs('a.outdent').click(function(){zjs('#editor1').editorOutdent() });
			
			// link
			zjs('a.link').click(function(){ });
			
			// image
			
			// source
			zjs('a.source').click(function(){zjs('#editor1').editorSourcePopup() });
			
			
			// tabel
			zjs('a.table').click(function(){	zjs('#editor1').editorInsertTablePopup()	});
			zjs('a.delete-table').click(function(){	zjs('#editor1').editorDeleteTable()	});
			zjs('a.insert-row-above').click(function(){	zjs('#editor1').editorInsertRowAbove()	});
			zjs('a.insert-row-below').click(function(){		zjs('#editor1').editorInsertRowBelow()	});
			zjs('a.delete-row').click(function(){		zjs('#editor1').editorDeleteRow()	});
			zjs('a.insert-column-left').click(function(){	zjs('#editor1').editorInsertColumnLeft()	});
			zjs('a.insert-column-right').click(function(){		zjs('#editor1').editorInsertColumnRight()	});
			zjs('a.delete-column').click(function(){		zjs('#editor1').editorDeleteColumn()	});
			zjs('a.split-cells').click(function(){		zjs('#editor1').editorSplitCells()	});
			zjs('a.merge-cells').click(function(){		zjs('#editor1').editorMergeCells()	});
			
			
			
			zjs('a.hide').click(function(){	zjs('#editor1').editorHide() });
			zjs('a.show').click(function(){	zjs('#editor1').editorShow() });
			zjs('a.getcontent').click(function(){	console.log('editorGetContent: ', zjs('#editor1').editorGetContent()) });
			zjs('a.getnode').click(function(){	console.log('editorGetNode: ', zjs('#editor1').editorGetNodeEl()) });
			
			
						
		});
	</script>
	
	<style>
	body{font-family:arial,tahomal;padding:0;margin:0;font-size:14px;line-height:1.4;color:#444;background:#fff;}
	.wrapper{width:960px;margin:0 auto;padding:40px 0;}
	input[type="text"]{width:300px;}
	</style>
	
	
	
</head>
<body>
	<div class="wrapper">
		
		<?php if(isset($_POST['content']))echo stripslashes($_POST['content']),'<hr/>';?>
		
		<form method="post">

			
			<h3>Content</h3>
			
			<textarea class="zeditor" name="content" id="editor1" style="width:700px;height:300px;" data-option="usedefaultbutton:true">
				<?php if(isset($_POST['content'])):
					echo stripslashes($_POST['content']);
				else:?>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eu eleifend purus. Nulla in diam quam, sed aliquam ligula. Aenean volutpat euismod leo, non malesuada est euismod in.</p>
				<p><em>Quisque id lorem ultricies erat venenatis aliquam in in nunc. Nunc rutrum sapien vitae augue rutrum vel pulvinar est ullamcorper.</em></p>
				<p><strong>Quisque orci metus, congue laoreet dapibus eu, vehicula fringilla arcu. Curabitur pulvinar mattis euismod.</strong></p>
				<?php endif;?>
			</textarea>
			
			<div>
				<button class="zbutton blue" type="submit" />submit</button>
			</div>
			
		</form>
	</div>
	
</body>
</html>