<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>zjs editor module</title>
	<script type="text/javascript" src="z.js"></script>
	<script>
		zjs.onready('editor, editor.table, editor.paste, editor.autolink, editor.autoresize, editor.contexttableprop, editor.contextimageprop, editor.contextlinkprop, editor.sourcepopup, ui.button, ui.popup, scrollbar, textarea.autoheight, codeeditor, codeeditor.activeline, codeeditor.closetag', function(){
		
			// bind event for editor
			zjs('#editor1').on('editor.formatchange', function(event, el){
				// change state for button
				console.log('command:', event.data.command);
				if(event.data.state)
					zjs('a.'+event.data.command).addClass('active');
				else
					zjs('a.'+event.data.command).removeClass('active');
			});
			zjs('#editor1').on('editor.activate', function(event, el){	
				console.debug('Editor activate: ');
			});
			zjs('#editor1').on('editor.click', function(event, el){	
				console.debug('Click event: ', event);
			});
			zjs('#editor1').on('editor.keypress', function(event, el){	
				console.debug('Key press event: ', event.keyCode());
			});
			zjs('#editor1').on('editor.show', function(event, el){	
				console.debug('editor is show');
			});
			zjs('#editor1').on('editor.hide', function(event, el){	
				console.debug('editor is hide');
			});
			
			
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
			zjs('a.link').click(function(){console.log(zjs('#editor1').editorGetNode('a'));if(zjs('#editor1').editorGetNode('a'))zjs('#popupinsertlink').popupShow() });
			zjs('#popupinsertlink').on('ui.popup.show', function(){
				this.find('input[name=href]').setValue(zjs('#editor1').editorGetNode('a').getAttr('href', '')).focus();
				this.find('input[name=target]').setValue(zjs('#editor1').editorGetNode('a').getAttr('target', ''));
			});
			zjs('#popupinsertlink form').on('submit', function(event){
				event.preventDefault();
				zjs('#popupinsertlink').popupHide();
				zjs('#editor1').editorInsertLink(this.getFormData());
			});
			
			// image
			zjs('a.image').click(function(){	zjs('#editor1').editorInsert('<img src="http://www.nopcommerce.com/images/thumbs/0001173.jpeg" />'); });
			
			// source
			zjs('a.source').click(function(){zjs('#editor1').editorSourcePopup() });
			
			
			
			zjs('a.hello').click(function(){	zjs('#editor1').editorInsert('hello') });
			
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
			
			<h3>Basic</h3>
			
			<div class="zgroupbutton">
				<a class="zbutton zeditorbutton bold"><b>B</b></a>
				<a class="zbutton zeditorbutton underline"><u>U</u></a>
				<a class="zbutton zeditorbutton italic"><i>I</i></a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton zeditorbutton alignleft">left</a>
				<a class="zbutton zeditorbutton aligncenter">center</a>
				<a class="zbutton zeditorbutton alignright">right</a>
				<a class="zbutton zeditorbutton alignfull">full</a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton zeditorbutton bullist">bullist</a>
				<a class="zbutton zeditorbutton numlist">numlist</a>
				<a class="zbutton zeditorbutton indent">indent</a>
				<a class="zbutton zeditorbutton outdent">outdent</a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton zeditorbutton link">insert link</a>
				<a class="zbutton zeditorbutton image">insert Image</a>
				<a class="zbutton zeditorbutton table">insert Table</a>
			</div>
			
			<a class="zbutton zeditorbutton source">view source</a>
			
			<div class="zgroupbutton">
				<a class="zbutton hello">insert Hello</a>
			</div>
			
			<h3>Table</h3>
			
			<div class="zgroupbutton">
				<a class="zbutton split-cells">split Cells</a>
				<a class="zbutton merge-cells">merge Cells</a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton insert-row-above">insert Row above</a>
				<a class="zbutton insert-row-below">insert Row below</a>
				<a class="zbutton delete-row">delete Row</a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton insert-column-left">insert Column left</a>
				<a class="zbutton insert-column-right">insert Column right</a>
				<a class="zbutton delete-column">delete Column</a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton delete-table">delete Table</a>
			</div>
			
			<h3>Editor</h3>
			
			<div class="zgroupbutton">
				<a class="zbutton hide">hide Editor</a>
				<a class="zbutton show">show Editor</a>
			</div>
			
			<div class="zgroupbutton">
				<a class="zbutton getcontent">get Content</a>
				<a class="zbutton getnode">get Node</a>
			</div>
			
			<h3>Content</h3>
			
			<textarea class="zeditor" name="content" id="editor1" style="width:700px;height:300px;" data-option="">
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
	
	
	<!-- POPUP INSERT LINK -->
	<div class="zpopup" id="popupinsertlink" data-option="center:true">
		<strong>Link properties</strong>
		<form method="post" style="margin-top:20px;">
			<p><label>Link<br/><input type="text" name="href" value="" placeholder="http://" /></label></p>
			<p><label>Target<br/><input type="text" name="target" value="" placeholder="target" /></label></p>
			<p><button class="zbutton" type="submit">Update</button></p>
		</form>
	</div>
	
	
</body>
</html>