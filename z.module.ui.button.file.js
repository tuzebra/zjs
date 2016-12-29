// MODULE UI BUTTON
zjs.require('ui.button', function(){
	
	var optionkey = 'zmoduleuibuttonfileoption',
		xhrskey = 'zmoduleuibuttonfilexhrs',
		buttonelkey = 'zmoduleuibuttonfilebtnel',
		inputelkey = 'zmoduleuibuttonfileinputel',
		zelkey = 'zmoduleuibuttonfilezel';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiButtonFileOption: {
			name: '', 
			text: 'Choose File',
			data: {},
			multiple: true,
			autoupload: 'ajax',
			autouploadUrl: '',
			autouploadClear: true,
			uploadMultipleFilesAtOneTime: true,
			maxFileSize: 10 * 1024 * 1024, // 10 MB
			maxNumberOfFile: 10,
			allowFileExt: '',
			notallowFileExt: 'php,exe,asp',
			returntype: 'json',
			uploadingText: '',
			dropText: '',
			getFileContent: false,
			readEXIF: false
		}
	});
	
	// trigger
	//ui.button.file.change
	//ui.button.file.maxnumberoffile
	//ui.button.file.maxfilesize
	//ui.button.file.wrongfileext
	//ui.button.file.upload.begin
	//ui.button.file.upload.loading
	//ui.button.file.upload.complete
	//ui.button.file.upload.abort
	//ui.button.file.getcontent
	
	
	// template
	var buttonfileclass = 'zui-button-file',
		supportdragdrop = 'zui-support-drag-drop',
		disabledclass = 'disabled',
		hoverclass = 'hover',
		activeclass = 'active',
		loadingclass = 'zui-loading-icon',
		buttondroptextclass = 'zui-button-drop-text',
		buttonlabelclass = 'zui-button-label',
		loadingwithtextclass = 'zui-loading-icon-with-text';
		
	// class for drag and drop
	var body_ready_to_drop_class = 'zui-body-ready-to-drop',
		button_ready_to_drop_class = 'zui-ready-to-drop';
	
	var inputdefaultname = 'uploadfile'; // recomend used the default value to work-well with zmvc
	
	// now test the support for XHR2
	var isSupportAjaxUpload = (function(){
		// supportAjaxUploadProgressEvents
		var xhr = false;if(window.XMLHttpRequest)xhr = new window.XMLHttpRequest();
		// supportFileAPI
		var fi = document.createElement('INPUT');fi.type = 'file';
		// supportFormData
		var fd = !! window.FormData;
		
		return ('files' in fi) && (xhr && xhr.upload && 'onprogress' in xhr.upload) && fd;
	})();
	
	// - - - - - - - - -
	// MAIN FUNCTIONS
	
	var makeButtonFile = function(element, useroption){
		
		var zElement = zjs(element);
		
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zElement.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zElement.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiButtonFileOption);
		// extend from inline option ?
		var inlineoption = zElement.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zElement.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// - - -
		// start coding module
		
		// truoc tien la stop lai hook keo lai bi loi~ nua
		var bakHookStatus = zjs.enablehook();
		zjs.enablehook(false);
		
		// ho tro ca 2 cach init, init tu 1 <a> hoac tu 1 <input file>
		// nen phai kiem tra truoc cho chac an
		var basedon = (zElement.is('input') ? 'input':'a');
		// neu nhu based on <input> ma input nay khong phai la file
		// thi thoi bo tay luon!
		if(basedon=='input' && !zElement.is('[type=file]'))return;
		
		// neu nhu based on <a> thi phai tao ra input
		if(basedon=='a'){
			var zButtonEl = zjs(element),
				zInputEl = zjs('<input type="file">');
		};
		// neu nhu based on <input> thi phai tao ra <a>
		if(basedon=='input'){
			var zInputEl = zjs(element),
				zButtonEl = zjs('<a>').html(option.text).insertBefore(zInputEl);
		};
		// Disable keyboard access for inputEl
		if(window.attachEvent)zInputEl.attr('tabIndex', -1);
		// xem coi option co multiple khong de fix input cho chuan
		if(option.multiple)try{zInputEl.item(0,true).multiple = true;}catch(err){};
		// test multiple de fix lai option
		// de phong nhung truong hop ma browser chua ho tro multiple
		if('multiple' in zInputEl.item(0,true) && zInputEl.item(0,true).multiple){option.multiple = true;}
		else{option.multiple = false;zInputEl.item(0,true).multiple = false;}
		// xem coi option co name khong de fix input cho chuan
		if(option.name=='' && zInputEl.getAttr('name','')=='')zInputEl.attr('name',inputdefaultname);
		if(option.name!='' && zInputEl.getAttr('name','')=='')zInputEl.attr('name',option.name);
		// fix name trong truong hop multiple
		if(option.multiple && zInputEl.attr('name') && !zInputEl.attr('name').test(/\[\]$/))zInputEl.attr('name',zInputEl.attr('name')+'[]');
		// save lai name vo option
		option.name = zInputEl.attr('name');
		// luu lai 2 cai nay vao zElement de sau nay dung lai ma khong can suy nghi nhieu
		zElement.setData(buttonelkey, zButtonEl);
		zElement.setData(inputelkey, zInputEl);
		// save nguoc lai zElement vao input luon de truy xuat nguoc
		//zInputEl.setData(zelkey, zElement);
		
		// fix option drop text
		if(option.dropText == '')option.dropText = 'Drop here to upload';
		
		// tiep theo moi lam nhung cong viec khoi tao
		
		// dau tien phai tao ra 1 cai button cho no cai da
		zButtonEl.makeButton().addClass(buttonfileclass).style({position:'relative',overflow:'hidden',direction:'ltr'});
		// sau do se move input vao ben trong button luon
		zInputEl.appendTo(zButtonEl)
				.style({position:'absolute',right:'0px',top:'0px','font-family':'Arial','font-size':'118px','margin':'0px','padding':'0px','min-height':'100%','min-width':'100%','cursor':'pointer','opacity':0})
				.hover(function(){
					zInputEl.style('cursor',(zButtonEl.hasClass(disabledclass)?'default':'pointer'));
					zButtonEl.addClass(hoverclass)},
					function(){zButtonEl.removeClass(hoverclass+' '+activeclass)})
				.on('mousedown',function(){zButtonEl.addClass(activeclass)})
				.on('mouseup',function(){zButtonEl.removeClass(activeclass)});
		
		// - - - - -
		// fix option
		// neu nhu khong co truyen autouploadUrl thi lam sao ma upload day???
		if(option.autouploadUrl == '')option.autoupload = '';
		// test xem coi browser co ho tro upload qua ajax hay khong
		// voi truong hop la user phai chon option
		// neu nhu khong ho tro thi chuyen ve thanh form upload
		if(option.autoupload == 'ajax' && !isSupportAjaxUpload)option.autoupload = 'form';
		
		// bind event nhanh 1 phat roi moi save option sau
		if(option.autoupload == 'ajax' && isSupportAjaxUpload){
			// fix option
			option.uploadMultipleFilesAtOneTime = !!option.uploadMultipleFilesAtOneTime;
			// add class cho hop ly
			zButtonEl.addClass(supportdragdrop).prepend('<span class="'+buttondroptextclass+'">'+option.dropText+'</span>');
			zInputEl.on('dragenter', function(event){if(zButtonEl.hasClass(disabledclass))return;zButtonEl.addClass(button_ready_to_drop_class)});
			zInputEl.on('dragleave', function(event){zButtonEl.removeClass(button_ready_to_drop_class)});
			zInputEl.on('drop', function(event){zButtonEl.removeClass(button_ready_to_drop_class)});
		};
		
		// bay gio moi luu lai option
		zElement.setData(optionkey, option);
		
		// neu nhu ma !uploadMultipleFilesAtOneTime
		// thi phai set san 1 cai option luon
		// sau nay chi can get ra la sai duoc thoi
		zElement.setData(xhrskey, []);
		
		
		// get ra button lable sau nay con su dung
		var zButtonLabelEl = zButtonEl.find('.'+buttonlabelclass);
		
		// - - - - -
		// bind event for input
		zInputEl.on('change', function(event, el){
			
			// di get ra lai option moi
			// (lo nhu trong truong hop moi set lai custom data)
			option = zElement.getData(optionkey);
			
			// test xem coi neu nhu tren IE thi list file nay se duoc save o cho khac
			var target = false;
			try{target = event.original ? (event.original.target ? event.original.target : (event.original.srcElement ? event.original.srcElement : false)) : false;}catch(err){};
			if(target && typeof target.files != 'undefined'){
			
				// The files selected by the user (as a FileList object).
				var files = [];
				for(var i=0;i<event.original.target.files.length;i++)
					if(isFile(event.original.target.files[i]))
						files.push(getFileInfo(event.original.target.files[i]));
			}
			
			// xem coi co ho tro property files hay khong
			// neu co thi su dung luon
			else if(el.files){
				var files = [];
				for(var i=0;i<el.files.length;i++)
					if(isFile(el.files[i]))
						files.push(getFileInfo(el.files[i]));
			}
			
			// neu khong ho tro thi phai tu xu thoi
			else{
				var name='', size=0;
				if(el.value){
					// it is a file input            
					// get input value and remove path to normalize
					var path = el.value;
					name = path.replace(/.*(\/|\\)/, "");
				}else{
					// fix missing properties in Safari
					name = el.fileName != null ? el.fileName : el.name;
					size = el.fileSize != null ? el.fileSize : el.size;
				};
				var files = [{name:name, size:size, upsize:0}];
			};
			
			// trigger event
			try{zElement.trigger('ui.button.file.change', {files:files});}catch(err){zjs.log('your handler for event <b>ui.button.file.change</b> has error! (see console log)');console.log(err)};
			
			// xem coi co set count limit hay khong
			if(option.maxNumberOfFile > 0 && files.length > option.maxNumberOfFile){
				try{zElement.trigger('ui.button.file.maxnumberoffile', {files:files});}catch(err){zjs.log('your handler for event <b>ui.button.file.maxnumberoffile</b> has error! (see console log)');console.log(err)};
				return;
			};
			
			// xem coi co vuong vao cai allow va not-allow nao khong
			var wrongExtFiles = Array();
			if(option.allowFileExt.trim() != ''){
				var allowFileExts = option.allowFileExt.toLowerCase().split(/\s*,\s*/);
				for(var i=0;i<files.length;i++)
					if(!allowFileExts.include(files[i].ext))
						wrongExtFiles.push(files[i]);
			};
			if(option.notallowFileExt.trim() != ''){
				var notallowFileExts = option.notallowFileExt.toLowerCase().split(/\s*,\s*/);
				for(var i=0;i<files.length;i++)
					if(notallowFileExts.include(files[i].ext))
						wrongExtFiles.push(files[i]);
			};
			
			if(wrongExtFiles.length > 0){
				try{zElement.trigger('ui.button.file.wrongfileext', {files:wrongExtFiles});}catch(err){zjs.log('your handler for event <b>ui.button.file.wrongfileext</b> has error! (see console log)');console.log(err)};
				return;
			};
			
			
			// xem coi co set size limit hay khong
			if(option.maxFileSize > 0){
				
				// xem coi file co bi vuot qua gioi han limit hay khong
				// chi can 1 file vuot qua gioi han la se khong cho upload
				var outOfLimitFiles = Array();
				
				for(var i=0;i<files.length;i++)
					if(files[i].size > option.maxFileSize)
						outOfLimitFiles.push(files[i]);
				
				// chi can co 1 file vuot qua gioi han la se thuc hien triger va khong cho upload lien
				if(outOfLimitFiles.length > 0){
					try{zElement.trigger('ui.button.file.maxfilesize', {files:outOfLimitFiles});}catch(err){zjs.log('your handler for event <b>ui.button.file.maxfilesize</b> has error! (see console log)');console.log(err)};
					return;
				};
			};
			


			// --------------
			// READ FILE DATA
			// --------------
			if(option.getFileContent && 'FileReader' in window){
				zjs.each(el.files, function(file, i){
					if(!isFile(file))return;

					var reader = new FileReader();
				    reader.onload = function(e){
				    	//e.target.result
				    	var triggerData = {file:file, progressEvent:e, content:e.target.result};
				    	if(option.readEXIF){
				    		zjs.require('exif', function(){
				    			triggerData.exif = zjs.readEXIFFromBase64(e.target.result);
					    		zElement.trigger('ui.button.file.getcontent', triggerData);
					    	});
				    	}else{
				    		zElement.trigger('ui.button.file.getcontent', triggerData);
				    	}
				    };
				    reader.readAsDataURL(file);					
				});
			}

			
			
			// --------------------
			// AUTO UPLOAD VIA FORM
			// --------------------
			
			
			
			// xem coi co auto upload khong
			if(option.autoupload == 'form'){
				// upload bang form thi se khong tinh toan duoc %
				try{zElement.trigger('ui.button.file.upload.begin', {files:files});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.begin</b> has error! (see console log)');console.log(err)};
				
				// add class for button
				zButtonEl.addClass(loadingclass, disabledclass);
				var _backupLabelText = zButtonLabelEl.getInnerHTML();
				if(option.uploadingText != ''){
					zButtonEl.addClass(loadingwithtextclass);
					// change button label text ngay va luon
					zButtonLabelEl.html(option.uploadingText.format({percent:0}));
				};
				
				// change xong roi moi trigger
				try{zElement.trigger('ui.button.file.upload.loading', {files:files, percent:0});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.loading</b> has error! (see console log)');console.log(err)};
				
				// start upload
				uploadFileViaForm(el, option.autouploadUrl, option.returntype, option.data, option, 
					// on complete!
					function(response){
						// khi up xong thi tat nhien % up se la 100%
						for(var i=0;i<files.length;i++)files[i].upsize=files[i].size;
						
						// change button label text
						if(option.uploadingText != '')zButtonLabelEl.html(option.uploadingText.format({percent:100}));
						
						// change xong roi moi trigger
						try{zElement.trigger('ui.button.file.upload.loading', {files:files, percent:100});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.loading</b> has error! (see console log)');console.log(err)};
						try{zElement.trigger('ui.button.file.upload.complete', {files:files, response:response});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.complete</b> has error! (see console log)');console.log(err)};
						
						// remove class for button
						zButtonEl.removeClass(loadingclass, loadingwithtextclass, disabledclass, hoverclass);
						// change button label text
						if(option.uploadingText != '')zButtonLabelEl.html(_backupLabelText);
					
						// xem coi co auto clear file hay khong autouploadClear
						// truoc mat la lam voi chrome va safari thoi cho chac an
						if(option.autouploadClear && zjs.browser.cssprefix == '-webkit-'){
							try{el.files = null;}catch(err){};
							try{el.value = null;}catch(err){};
							try{el.fileName = null;}catch(err){};
						};
					}
					// --
				);
			}else
			
			
			// ------------------------------------------------
			// AUTO UPLOAD VIA AJAX (Multiple file at one time)
			// ------------------------------------------------
			
			
			// xem coi co auto upload khong?
			// va day la truong hop upload nhieu file, nhung chi support up 1 lan duy nhat ma thoi
			if(option.autoupload == 'ajax' && option.uploadMultipleFilesAtOneTime){
				// upload bang ajax thi se tinh toan duoc % ohyeah
				try{zElement.trigger('ui.button.file.upload.begin', {files:files});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.begin</b> has error! (see console log)');console.log(err)};
				
				// add class for button
				zButtonEl.addClass(loadingclass).addClass(disabledclass);
				var _backupLabelText = zButtonLabelEl.getInnerHTML();
				if(option.uploadingText != '')zButtonEl.addClass(loadingwithtextclass);
					
				try{zElement.trigger('ui.button.file.upload.loading', {files:files, percent:0});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.loading</b> has error! (see console log)');console.log(err)};
				
				uploadFileViaAjax(el, option.autouploadUrl, option.returntype, option.data, option, 
					// onprogress
					function(e, percent){
						for(var i=0;i<files.length;i++)files[i].upsize=files[i].size*percent/100;
						
						// change button label text
						if(option.uploadingText != '')zButtonLabelEl.html(option.uploadingText.format({percent:percent}));
						
						// change xong roi moi trigger
						try{zElement.trigger('ui.button.file.upload.loading', {files:files, percent:percent});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.loading</b> has error! (see console log)');console.log(err)};
					},
					// onloaded
					function(e, response){
						// khi up xong thi tat nhien % up se la 100%
						for(var i=0;i<files.length;i++)files[i].upsize=files[i].size;
						try{zElement.trigger('ui.button.file.upload.complete', {files:files, response:response});}catch(err){zjs.log('your handler for event <b>ui.button.file.upload.complete</b> has error! (see console log)');console.log(err)};
						
						// remove button class
						zButtonEl.removeClass(loadingclass, loadingwithtextclass, disabledclass, hoverclass);
						// change button label text
						if(option.uploadingText != '')zButtonLabelEl.html(_backupLabelText);
					},
					// onabort
					function(e){}
					// --
				);
			}else
			
			
			// -------------------------------------
			// AUTO UPLOAD VIA AJAX (separate files)
			// -------------------------------------
			
			
			// xem coi co auto upload khong?
			// va day la truong hop upload nhieu file, nhung chi support up 1 lan duy nhat ma thoi
			if(option.autoupload == 'ajax' && !option.uploadMultipleFilesAtOneTime){
				
				// upload bang cai hinh thuc nay, thi se show % cua tung file ma thoi
				// va phai cho phep upload nhieu lan duoc
				// nen cung se khong disable cai button upload lam chi ca
				// tien hanh upload luon ne
				uploadFileViaAjaxSeparate(el, option.autouploadUrl, option.returntype, option.data, option, element,
					// OnBegin
					function(e, id, fileData){
						// trigger thoi chu lam gi dau
						try{
							zElement.trigger('ui.button.file.upload.begin', {id:id, file:fileData});
						}catch(err){
							zjs.log('your handler for event <b>ui.button.file.upload.begin</b> has error! (see console log)');console.log(err)
						};
					}, 
					// OnProgress
					function(e, id, fileData, percent){
						// trigger thoi chu lam gi dau
						try{
							zElement.trigger('ui.button.file.upload.loading', {id:id, file:fileData, percent:percent});
						}catch(err){
							zjs.log('your handler for event <b>ui.button.file.upload.loading</b> has error! (see console log)');console.log(err)
						};
					},
					// OnLoaded
					function(e, id, fileData, response){
						// trigger thoi chu lam gi dau
						try{
							zElement.trigger('ui.button.file.upload.complete', {id:id, file:fileData, response:response});
						}catch(err){
							zjs.log('your handler for event <b>ui.button.file.upload.complete</b> has error! (see console log)');console.log(err)
						};
					},
					// OnAbort
					function(e, id, fileData){
						// trigger thoi chu lam gi dau
						try{
							zElement.trigger('ui.button.file.upload.abort', {id:id, file:fileData});
						}catch(err){
							zjs.log('your handler for event <b>ui.button.file.upload.abort</b> has error! (see console log)');console.log(err)
						};
					}
				);
				
				
			};
			
		});
		
		
		// lam xong xuoi het roi thi moi tra lai trang thai cho hook
		zjs.enablehook(bakHookStatus);
	},
	
	isFile = function(file){
		try{return (typeof file == 'object' && file.constructor === File)}catch(err){};
		return false;
	},
	
	// ham giup khoi tao file
	getFileInfo = function(file){
		
		return {
			name:file.name, 
			size:file.size, 
			upsize:0, 
			ext:file.name.split(/\s*\.\s*/).pop().toLowerCase(),
			type:file.type
		};
	},
	
	// ham giup set them custom data vao button file
	buttonFileSetData = function(element, name, value){
		// xem coi co get ra duoc option khong
		// neu khong get ra duoc thi chung to la khong phai button file
		var zElement = zjs(element);
		var option = zElement.getData(optionkey);
		if(!option)return;
		// di set cai data thoi
		option.data[name] = value;
		// set vao lai
		zElement.setData(optionkey, option);
	},
	
	uploadFileViaForm = (function(){
		// private variable
		var uniqueId = 0,
			hiddenDivEl = false;

		// make sure body is loaded before interaction with it
		zjs.onready(function(){
			hiddenDivEl = zjs('<div>').appendTo('body').style({position:'fixed',top:-5000,left:-5000,opacity:0,display:'none'});
		});
		
		// main function
		return function(el, url, returntype, data, option, callback){
			
			var zInputEl = zjs(el),
				zInputParentEl = zInputEl.parent();
			
			// create iframe
			var iframeName = 'zjsautouploadform'+(uniqueId++);
			var iframeUpload = zjs('<iframe src="javascript:false;" name="'+iframeName+'" />').appendTo(hiddenDivEl);
			
			// create form
			var zFormEl = zjs('<form>').setAttr({method:'post', enctype:'multipart/form-data', action:url, target:iframeName}).appendTo(hiddenDivEl);
			
			// move fileInput to new form
			zInputEl.appendTo(zFormEl);
			
			// xem coi co post len them data nao khong
			zjs.foreach(data, function(value, key){
				zjs('<input type="hidden" name="'+key+'" value="'+value+'" />').appendTo(zFormEl);
			});
			
			// attach event to iframe to get value
			iframeUpload.on('load', function(event, iframe){
				if(!iframe.parentNode)return;
	
				if(iframe.contentDocument &&
					iframe.contentDocument.body &&
					iframe.contentDocument.body.innerHTML == 'false')return;
				
				// get response	
				var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
					response = '';
				
				// need remove HTML Entities for correct json decode	
				try{response = doc.body.innerHTML}catch(err){};
				try{if(response!='')response = response.stripTags().replace(/^[^\[{]*(\[|{)/,function(match, p1){return p1;})}catch(err){};
				try{if(response!='')response = response.decodeEntities();}catch(err){};
				if(!response)response = '';
				
				//console.log('ui.button.file.upload response (raw)');
				//console.log(response);
					
				// fix cai error them vao <pre> vo van cua chrome
				if(returntype == 'json')response = response.jsonDecode();
				
				//console.log('ui.button.file.upload response (json)');
				//console.log(response);
				
				// run callback
				if(typeof callback == 'function')callback.call(this, response);
				
				// sau do xoa di iframe cho nhe
				setTimeout(function(){zjs(iframe).remove()}, 1);
				
				// move fileInput back
				if(zInputParentEl)
					zInputEl.appendTo(zInputParentEl);
			});
			
			// start upload
			zFormEl.submit();
			
			return true;
		};
	})(),
	
	uploadFileViaAjax = function(el, url, returntype, data, option, callbackOnProgress, callbackOnLoaded, callbackOnAbort){
		// khong support thi bien
		if(!isSupportAjaxUpload)return false;
		
		// bat dau
		var formData = new FormData();
		
		if(!formData)return;
		// append more data with formdata
		zjs.each(data, function(val, key){
			//console.log('val', val);
			//console.log('key', key);
			formData.append(key, val);
		});
		
		// bat dau read file thoi
		var i = 0, reader, file;
		for(var i=0;i<el.files.length;i++){
			if(!isFile(el.files[i]))
				continue;
			file = el.files[i];
			
			//if(window.FileReader){
			//	reader = new FileReader();
			//	reader.onloadend = function(e){ 
					//>>>>>>>>>>>
					//console.log('showUploadedItem', e.target.result);
			//	};
			//	reader.readAsDataURL(file);
			//};
			
			formData.append(option.name, file);
		};
		
		// chuan bi send thoi		
		var xhr = new XMLHttpRequest();
		xhr.onerror = function(e) {
			//>>>>>>>>>>>
			//console.log('onError');
		};
		
		// bind callback event
		xhr.onreadystatechange = function(){
			//>>>>>>>>>>>
			//console.log('onreadystatechange: ' + xhr.readyState + ' status: ' + xhr.status );
		};
		
		xhr.onload = function(e) {
			var result = '';
			if(this.responseText)result = this.responseText.replace(/[\n\r]/g,'');
			if(returntype == 'json')result = result.jsonDecode();
			callbackOnLoaded(e, result);
		};

		xhr.upload.onprogress = function(e){
		    var p = Math.round(100 / e.total * e.loaded);
			//console.log('onprogress', e, p);
			callbackOnProgress(e, p);
		};

		xhr.onabort = function(e) {
			//console.log('Upload abgebrochen');
			callbackOnAbort(e);
		};

		// start upload now
		xhr.open("POST", url);
		xhr.send(formData);
		
		// xem coi co auto clear file hay khong autouploadClear
		// truoc mat la lam voi chrome va safari thoi cho chac an
		if(option.autouploadClear){
			try{el.files = null;}catch(err){};
			try{el.value = null;}catch(err){};
			try{el.fileName = null;}catch(err){};
		};
		
		return true;
	},
	
	uploadFileViaAjaxSeparate = function(el, url, returntype, data, option, element, callbackOnBegin, callbackOnProgress, callbackOnLoaded, callbackOnAbort){
		// khong support thi bien
		if(!isSupportAjaxUpload)return false;
		
		// bat dau
		var zElement = zjs(element);
		
		// bat dau add file vao formdata
		// roi sau do la upload luon
		zjs.each(el.files, function(file, i){
			if(!isFile(file))return;
			// quan trong nhat la tao ra 1 cai key cai da
			var id = zjs.getUniqueId(),
				fileData = getFileInfo(file);
			// tao 1 cai form data
			var formData = new FormData();
			if(!formData)return;
			// append more data with formdata
			zjs.each(data, function(val, key){
				formData.append(key, val);
			});
			// append file vao thoi
			formData.append(option.name, file);
		
			// truoc khi send thi trigger begin thoi
			callbackOnBegin(false, id, fileData);
		
			// chuan bi send thoi
			var XHRS = zElement.getData(xhrskey, []);
			if(!zjs.isArray(XHRS))XHRS = [];
			XHRS[id] = new XMLHttpRequest();
			
			XHRS[id].onerror = function(e){};
			XHRS[id].onreadystatechange = function(){};
			XHRS[id].onload = function(e) {
				var result = '';
				if(this.responseText)result = this.responseText.replace(/[\n\r]/g,'');
				if(returntype == 'json')result = result.jsonDecode();
				callbackOnLoaded(e, id, fileData, result);
			};

			XHRS[id].upload.onprogress = function(e){
			    var p = Math.round(100 / e.total * e.loaded);
				// fix file upsize
				fileData.upsize = e.loaded;
				callbackOnProgress(e, id, fileData, p);
			};

			XHRS[id].onabort = function(e) {
				callbackOnAbort(e, id, fileData);
			};

			
			
			// sau khi xong xuoi het thi
			// se save cai xhr nay vao element luon
			// de sau nay con truy xuat
			zElement.setData(xhrskey, XHRS);
			
			// start upload now
			XHRS[id].open("POST", url);
			XHRS[id].send(formData);
		});
		
		// xem coi co auto clear file hay khong autouploadClear
		// truoc mat la lam voi chrome va safari thoi cho chac an
		if(option.autouploadClear){
			try{el.files = null;}catch(err){};
			try{el.value = null;}catch(err){};
			try{el.fileName = null;}catch(err){};
		};
		
		return true;
	},
	
	// Abort the uploading process
	buttonFileAbortUpload = function(element, uploadId){
		// khong support ajax thi bien
		if(!isSupportAjaxUpload)return;
		
		// xem coi co get ra duoc option khong
		// neu khong get ra duoc thi chung to la khong phai button file
		var zElement = zjs(element);
		var option = zElement.getData(optionkey);
		if(!option)return;
		
		// ok, tien hanh abort ma thoi
		var XHRS = zElement.getData(xhrskey, []);
		if(XHRS[uploadId])XHRS[uploadId].abort();
	};
	
	
	// check coi trinh duyet support khong de ma auto bind file draw, drop event
	if(isSupportAjaxUpload){
		zjs(window).on('dragenter', function(event){
			//console.log('dragenter');
			zjs(document.body).addClass(body_ready_to_drop_class);
		});
		zjs(window).on('dragover', function(event){
			//console.log('dragover');
			var _targetEl = zjs(event.toTarget()),
				_canDrop = true;
			if(!_targetEl){_canDrop = false;}
			else if(!_targetEl.is('input[type=file]')){_canDrop = false;}
			if(!_canDrop){
				event.preventDefault();
				event.stop();
			};
			
			//console.log(event.original.clientX, event.original.clientY);
			if(event.original.clientX > window.innerWidth || event.original.clientY > window.innerHeight || event.original.clientX <= 0 || event.original.clientY <= 0){
				zjs(document.body).removeClass(body_ready_to_drop_class);
			};
		});
		zjs(window).on('dragleave', function(event){
			//console.log('dragleave');
			//console.log(event.original.clientX, event.original.clientY);
			if(event.original.clientX > window.innerWidth || event.original.clientY > window.innerHeight || event.original.clientX <= 0 || event.original.clientY <= 0){
				zjs(document.body).removeClass(body_ready_to_drop_class);
			};
		});
		zjs(window).on('drop', function(event){
			//console.log('drop');
			var _targetEl = zjs(event.toTarget()),
				_canDrop = true;
			if(!_targetEl){_canDrop = false;}
			else if(!_targetEl.is('input[type=file]')){_canDrop = false;}
			if(!_canDrop){
				event.preventDefault();
				event.stop();
			};
			zjs(document.body).removeClass(body_ready_to_drop_class);
		});
	};
	
	
	// - - - - - - - - -
	// EXTEND METHOD CHO zjs-core
	// extend core mot so option
	zjs.extendCore({
		uploadFile: function(option){
			option = zjs.extend({
				inputName: 'uploadfile', //(old:filesupload) - but recomend used the default value to work-well with zmvc
				fileLocation: '',
				uploadUrl: '',
				returnType: 'json',
				data: {},
				callback: function(){}			
			}, option);
		
			// dau tien la tao ra 1 cai input thoi
			var fileInputEl = zjs('<input type="file" name="'+option.inputName+'" value="'+option.fileLocation+'" />');
			if(fileInputEl.count()<=0)
				return false;
			
			// bat dau upload thoi
			return uploadFileViaForm(fileInputEl, option.uploadUrl, option.returnType, option.data, option.callback);
		}
	});
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeButtonFile: function(useroption){
			return this.each(function(element){makeButtonFile(element, useroption)});
		},
		buttonFileSetData: function(name, value){
			return this.each(function(element){buttonFileSetData(element, name, value)});
		},
		buttonFileAbortUpload: function(uploadId){
			return this.each(function(element){buttonFileAbortUpload(element, uploadId)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zbuttonfile ko, neu nhu co thi se auto makeButtonFile luon
			zjs(el).find('.zbuttonfile').makeButtonFile();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zbuttonfile ko, neu nhu co thi se auto makeButtonFile luon
			if(zjs(el).hasClass('zbuttonfile'))zjs(el).makeButtonFile();
			zjs(el).find('.zbuttonfile').makeButtonFile();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){zjs('.zbuttonfile').makeButtonFile()});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.button.file');
});


/****
Orientation to remember
  1        2       3      4         5            6           7          8

888888  888888      88  88      8888888888  88                  88  8888888888
88          88      88  88      88  88      88  88          88  88      88  88
8888      8888    8888  8888    88          8888888888  8888888888          88
88          88      88  88
88          88  888888  888888
****/