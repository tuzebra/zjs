// extend module Upload Button cho zjs
;(function(zjs){
	
	var uniqueId=0;
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeUploadButton: function(option){
			
			option = zjs.extend({
				text:'Choose File',
				classname:'zui-upload-button',
				hoverclassname:'zui-upload-button-hover',
				activeclassname:'zui-upload-button-active',
				autoUpload:false,
				clearFileAfterUpload:true,
				uploadUrl:'',
				onChange:function(event, file){},
				onBegin:function(){},
				onUploading:function(){},
				onComplete:function(response){},
				onError:function(){}
			}, option);
			
			// gia mao event
			var UBEvent = function(){this.allowupload=true;}
			UBEvent.prototype.preventDefault = function(){
				this.allowupload=false;
			};
			
			// main each - -
			this.each(function(element){
				var zElement = zjs(element),
					zButton = zjs('<a class="'+option.classname+'" style="position:relative;overflow:hidden;direction:ltr;"><span>'+option.text+'</span></a>').insertBefore(element);
				
				var ubEvent = new UBEvent();
				
				zElement
					.appendTo(zButton)
					.setStyle({position:'absolute',right:'0px',top:'0px','font-family':'Arial','font-size':'118px','margin':'0px',padding:'0px',cursor:'pointer',opacity:0})
					.hover(function(){zButton.addClass(option.hoverclassname)},
						function(){zButton.removeClass(option.hoverclassname)})
					.on('mousedown',function(){zButton.addClass(option.activeclassname)})
					.on('mouseup',function(){zButton.removeClass(option.activeclassname)});
				
				// bind event for input
				zElement.on('change', function(event, element){
					var path='', name='', size=0;
					if(element.value){
						// it is a file input            
						// get input value and remove path to normalize
						path = element.value;
						name = path.replace(/.*(\/|\\)/, "");
					}else{
						// fix missing properties in Safari
						name = element.fileName != null ? element.fileName : element.name;
						size = element.fileSize != null ? element.fileSize : element.size;
					};
					
					var file = {path:path, name:name, size:size};
					
					if(typeof option.onChange=='function'){
						ubEvent.allowupload=true;
						option.onChange(ubEvent, file);
						
						// autoupload ?
						if(option.autoUpload && ubEvent.allowupload)
							uploadFn(file);
					};
					
				});
				
				// Disable keyboard access
				if(window.attachEvent)zElement.setAttr('tabIndex', '-1');
				
				// prepare for support auto upload
				if(!option.autoUpload)return;
				
				var hiddenDivEl = zjs('<div style="position:fixed;top:-5000;left:-5000;opacity:0;display:none;"></div>').appendTo('body');
				
				var uploadFn = function(file){
					
					// create iframe
					var iframeName = 'zjsautouploadform'+(uniqueId++);
					var iframeUpload = zjs('<iframe src="javascript:false;" name="'+iframeName+'" />')
										.appendTo(hiddenDivEl);
					
					// create form
					var formUpload = zjs('<form method="post" enctype="multipart/form-data"></form>')
										.setAttr('action', option.uploadUrl)
										.setAttr('target', iframeName)
										.appendTo(hiddenDivEl);
					
					// move fileInput to new form
					zElement.appendTo(formUpload);
					
					// attach event to iframe to get value
					iframeUpload.on('load', function(event, iframe){
					
						if (!iframe.parentNode)return;
			
						if (iframe.contentDocument &&
							iframe.contentDocument.body &&
							iframe.contentDocument.body.innerHTML == "false")return;
						
						// get response	
						var response = false;
						var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document
					
						try{response = eval("(" + doc.body.innerHTML + ")");}
						catch(err){response = {};}
						
						// run callback
						if(typeof option.onComplete == 'function')
							option.onComplete(response);
						
						setTimeout(function(){zjs(iframe).remove();}, 1);
						
						// move fileInput back
						zElement.appendTo(zButton);
						if(option.clearFileAfterUpload){
							var felem = zElement.item(0,true);
							if(felem.value)try{felem.value = null;}catch(er){};
							if(felem.fileName)try{felem.fileName = null;}catch(er){};
						};
						
					});
					
					// start upload
					if(typeof option.onBegin == 'function')option.onBegin(file);
					formUpload.item(0,true).submit();
					
				};
				// end upload function
								
			});
			// end main each - -
		}
	});
	
	// load as default
	zjs(function(){
		zjs('input.zuploadbutton[type=file]').each(function(element){
			var zElement = zjs(element),
				option = zElement.getAttr('data-option','');
			if(!zjs.isString(option))option='';
			option = option.jsonDecode();
			zElement.makeUploadButton(option);
		});
	});
	
	// register module name
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('uploadbutton');

})(zjs);