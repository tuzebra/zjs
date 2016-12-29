// include plugin autoresize for editor
;zjs.require('editor', function(){
	
	// tao ra 1 cai div ao
	
	// main plugin code
	tinymce.create('tinymce.plugins.AutoResizePlugin', {
		init: function(ed, url){
			var t = this, at = 53, oldSize = 0;
			
			if(ed.getParam('fullscreen_is_enabled'))return;

			// This method gets executed each time the editor needs to resize.
			function resize(){
				var deltaSize, d = ed.getDoc(), body = d.body, de = d.documentElement, 
				DOM = tinymce.DOM, resizeHeight = t.autoresize_min_height, myHeight;

				// Get height differently depending on the browser used
				//myHeight = tinymce.isIE ? body.scrollHeight : (tinymce.isWebKit && body.clientHeight == 0 ? 0 : body.offsetHeight);  
				//console.log('myHeight old', myHeight);
				
				// method khác để get height
				// append 1 cái thằng div vào trong body
				var hiddenDiv = zjs('<div style="position:fixed;width:100%;left:-100%;"></div>');
				zjs(body).child().each(function(el){
					hiddenDiv.append(zjs(el).clone(true));
				});
				hiddenDiv.appendTo(body);
				// get height thoi
				myHeight = hiddenDiv.height();
				//console.log('myHeight new', myHeight);
				hiddenDiv.remove();
				

				// Don't make it smaller than the minimum height
				if(myHeight > t.autoresize_min_height)resizeHeight = myHeight;
				
				// If a maximum height has been defined don't exceed this height
				body.style.overflowY = "hidden";
				de.style.overflowY = "hidden"; // Old IE
				body.scrollTop = 0;
				
				// get height of row: eighter line-height or min-height
				//if( zjs(ed.getBody()).find('p:first').css('line-height') != 'normal')
				//	lineHeight = $(ed.getBody()).find('p:first').css('line-height') ;
				//else
				//	lineHeight = $(ed.getBody()).find('p:first').css('min-height');
				//var lineHeight = lineHeight.substr(0, lineHeight.length -2 );
				
				// sau do se goi refresh lai scrollbar 
				// neu nhu parent la mot zscrollbar
				var paEl = zjs('#'+ed.id+'_parent').parent();
				if(typeof zjs.moduleScrollbarOption == 'object' && paEl.iszScrollbar()){try{
					// dau tien la refresh scroll
					paEl.refreshScroll();
					
					// kiem tra vi tri cua pointer
					var sbtop = paEl.scrollPosition(),
						bm = ed.selection.getBookmark(),
						elem = d.getElementById(bm.id+'_start'),
						prheight = t.autoresize_min_height,
						box = elem.getBoundingClientRect(),
						win = ed.getWin(), 
						clientTop  = de.clientTop  || body.clientTop  || 0,
						scrollTop  = win.pageYOffset || de.scrollTop  || body.scrollTop,
						ptop  = box.top  + scrollTop - clientTop;
					
					// set Bookmark
					ed.selection.moveToBookmark(bm);
					
					// neu nhu vi tri cua pointer khuat tam mat
					// thi phai move scrollbar
					if(ptop + at - sbtop > prheight)paEl.scrollTo(ptop+at+sbtop-prheight);
					else if(sbtop > ptop - at)paEl.scrollTo(ptop - at);
					
				}catch(err){}};
				
				// Resize content element
				if(resizeHeight !== oldSize) {
					deltaSize = resizeHeight - oldSize;
					//console.log('deltaSize',deltaSize);
					zjs('#'+ed.id+'_ifr').height(resizeHeight);
					//DOM.setStyle(DOM.get(ed.id + '_ifr'), 'height', resizeHeight + 'px');
					oldSize = resizeHeight;
					
					// WebKit doesn't decrease the size of the body element until the iframe gets resized
					// So we need to continue to resize the iframe down until the size gets fixed
					if(tinymce.isWebKit && deltaSize < 0)resize();
				};
				
			};

			t.editor = ed;

			// Define minimum height
			t.autoresize_min_height = parseInt(ed.getParam('autoresize_min_height', ed.getElement().offsetHeight));

			// Add padding at the bottom for better UX
			ed.onInit.add(function(ed){
				ed.dom.setStyle(ed.getBody(), 'paddingBottom', ed.getParam('autoresize_bottom_margin', at) + 'px');
			});

			// Add appropriate listeners for resizing content area
			ed.onChange.add(resize);
			ed.onSetContent.add(resize);
			ed.onPaste.add(resize);
			ed.onKeyUp.add(resize);
			ed.onClick.add(resize);
			ed.onPostRender.add(resize);

			if(ed.getParam('autoresize_on_init', true)){
				ed.onLoad.add(resize);
				ed.onLoadContent.add(resize);
			};

			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
			ed.addCommand('mceAutoResize', resize);
			
			// resize when window resize
			zjs(window).on('resize', resize);
		},

		//Returns information about the plugin as a name/value array.
		getInfo: function(){
			return {
				longname: 'Auto Resize',
				author: 'Moxiecode Systems AB',
				authorurl: 'http://tinymce.moxiecode.com',
				infourl: 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/autoresize',
				version: tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('autoresize', tinymce.plugins.AutoResizePlugin);

	// extend plugin
	zjs.extend(zjs.moduleEditorPlugins, {
		autoresize: function(option, editorOption){
			// xem coi neu nhu trong option co option nao set autoresize_bottom_margin
			if(typeof option.marginbottom != 'undefined' && !isNaN(option.marginbottom))
				return zjs.extend(editorOption, {
					autoresize_bottom_margin: option.marginbottom,
				});
		}
	});

	// done
	zjs.required('editor.autoresize');
});