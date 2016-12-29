// extend module Auto suggestion cho zjs
zjs.require('ui.button.file', function(){"use strict";
	
	var optionkey = 'zjsmoduleimagepickeroption',
		wrapelkey = 'zjsmoduleimagepickerwrapel';
	
	// extend core option cho de dieu chinh
	zjs.extendCore({
		moduleUiImagepickerOption:{
			imageUrl: '',
			autouploadUrl: '',
			renderMethod: 'background',
			maxFileSize: 10 * 1024 * 1024, // 10 MB
			allowFileExt: '',
			notallowFileExt: 'php,exe,asp',
			uploadingText: '',
			dropText: ''
		}
	});
	
	// trigger
	//ui.imagepicker.wrongfileext
	//ui.imagepicker.maxfilesize
	
	// template
	var zimagepickerClass = 'zui-imagepicker-wrap',
		zimagepickerHadimageClass = 'hadimage',
		zimagepickerImageClass = 'zui-imagepicker-image',
		__htmltpl = '<div class="'+zimagepickerClass+' inputtext">'+
						'<div class="zui-imagepicker-image-wrap"></div>'+
						'<div class="zui-imagepicker-button-wrap">'+
							'<a class="red btndelete">Delete</a>'+
							'<a class="btnupload">Upload</a>'+
						'</div>'+
					'</div>',
	
		__itemclass = 'zui-autosuggestion-item',
		__htmlitemtpl = '<div class="'+__itemclass+'"></div>';
	
	// - - - - - - - - -
		
	
	// MAIN FUNCTIONS
	
	var makeImagepicker = function(element, useroption){
		
		var zOriginalInput = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zOriginalInput.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zOriginalInput.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		var refreshOptionFn = function(){
			if(!refreshOption)return;
			option = zOriginalInput.getData(optionkey);
			refreshOption = false;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiImagepickerOption);
		
		// extend from inline option ?
		var inlineoption = zOriginalInput.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zOriginalInput.removeAttr('data-option');
		
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// fix option
		// fix option drop text
		if(option.dropText == '')option.dropText = 'Drop here to upload';
			
		// save option
		zOriginalInput.setData(optionkey, option);
		
		// - - -
		// start coding your module
		
		// - - - -
		// init element
		
		// van giu nguyen element nguyen goc
		// chi tao ra, va add class cho mot element insert after
		var zWrapperEl = zjs(__htmltpl);
		
		// sau do luu lai luon de sau nay truy xuat
		zOriginalInput.setData(wrapelkey, zWrapperEl);
		
		// gio moi insert vao sau khi luu
		zWrapperEl.insertAfter(zOriginalInput);
		if(option.renderMethod == 'img' || option.renderMethod == 'image')
			zWrapperEl.addClass('render-by-img');
		
		// tiep theo se co gang chuyen type cua cai input original sang hidden cho chac
		var _type = zOriginalInput.getAttr('type', '');
		if(_type != 'hidden')zOriginalInput.setAttr('type', 'hidden');
		
		// gio moi di khai bao may cai element khac
		//var	zImageEl = zWrapperEl.find('.zui-imagepicker-image'),
		var zBtndeleteEl = zWrapperEl.find('.btndelete'),
			zBtnuploadEl = zWrapperEl.find('.btnupload'),
		
		
			zWrapperInput = zWrapperEl.find('.zui-autosuggestion-inputwrap'),
			zPlaceholder = zWrapperEl.find('.zui-autosuggestion-placeholder'),
			zInput = zWrapperEl.find('.zui-autosuggestion-input'),
			zPanel = zWrapperEl.find('.zui-autosuggestion-panel-wrap'),
			zPanelscroll = zWrapperEl.find('.zui-autosuggestion-panel-scroll'),
			zPanelcontent = zWrapperEl.find('.zui-autosuggestion-panel-content');
		
		
		
		// make button
		zBtndeleteEl.makeButton();
		zBtnuploadEl.makeButtonFile({
			multiple: false,
			autouploadUrl: option.autouploadUrl,
			maxFileSize: option.maxFileSize,
			allowFileExt: option.allowFileExt,
			notallowFileExt: option.notallowFileExt,
			uploadingText: option.uploadingText,
			dropText: option.dropText
		});
		
		// bind event cho button file
		zBtnuploadEl
			// handerl on select file with wrong file-extension
			.on('ui.button.file.wrongfileext', function(event){
				zOriginalInput.trigger('ui.imagepicker.wrongfileext', event.data);
			})
			// handler on select file out of maximum file size
			.on('ui.button.file.maxfilesize', function(event){
				zOriginalInput.trigger('ui.imagepicker.maxfilesize', event.data);
			})
			// complete
			.on('ui.button.file.upload.complete', function(event, el){
				if(!event.data.response.success)return;
				
				var files = false;
				if('files' in event.data.response)files = event.data.response.files;
				else if('images' in event.data.response)files = event.data.response.images;
				else if('items' in event.data.response)files = event.data.response.items;
				if(!zjs.isArray(files))return;
				
				files.each(function(file){
					//console.log(file);
					//zImageEl.setStyle('background-image', 'url('+file.url+')');
					//zWrapperEl.find('.'+zimagepickerImageClass).remove();
					setImageUrl(file.url);
					zOriginalInput.setValue(file.id);
					zWrapperEl.addClass(zimagepickerHadimageClass);
				});
				
				// xong roi thi trigger cai validation thoi
				if('moduleFormValidationOption' in zjs && zjs.isObject(zjs.moduleFormValidationOption))
					this.findUp('form').formValidationCheck();
			});
			
		// delete thumb image
		zBtndeleteEl
			.click(function(){
				//zImageEl.setStyle('background-image', 'none');
				//zWrapperEl.find('.zui-imagepicker-image-wrap').html('');
				setImageUrl('');
				zOriginalInput.setValue(0);
				zWrapperEl.removeClass(zimagepickerHadimageClass);
			});
		
		
		var setImageUrl = function(url){
			if(url == '')
				zWrapperEl.find('.zui-imagepicker-image-wrap').html('');
			else if(option.renderMethod == 'background')
				zWrapperEl.find('.zui-imagepicker-image-wrap').html('<div class="'+zimagepickerImageClass+'" style="background-image:url('+url+');"></div>');
			else if(option.renderMethod == 'image' || option.renderMethod == 'img')
				zWrapperEl.find('.zui-imagepicker-image-wrap').html('<img class="'+zimagepickerImageClass+'" src="'+url+'" />');
		};
		

		
		// set image mac dinh
		if(option.imageUrl != ''){
			//zImageEl.setStyle('background-image', 'url('+option.imageUrl+')');
			setImageUrl(option.imageUrl);
			zWrapperEl.addClass(zimagepickerHadimageClass);
		};
		
		
		// done!
		
		// - - -
	};
	
	
	// - - - -
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeImagepicker: function(useroption){
			return this.each(function(element){makeImagepicker(element, useroption)});
		}
		
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zimagepicker ko, neu nhu co thi se auto makeImagepicker luon
			zjs(el).find('.zimagepicker').makeImagepicker();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zimagepicker ko, neu nhu co thi se auto makeImagepicker luon
			if(zjs(el).hasClass('zimagepicker'))zjs(el).makeImagepicker();
			zjs(el).find('zimagepicker').makeImagepicker();
		}
	});
	
	// AUTO INIT
	zjs(function(){zjs('.zimagepicker').makeImagepicker();});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.imagepicker');

});