// MODULE FORM VALIDATION
;(function(zjs){"use strict";
	
	var optionkey = 'zjsmoduleformvalidationoption',
		tipelkey = 'zjsmoduleformvalidationtipel',
		// bao cho module biet la cai thang input nay da duoc handler roi
		isvalidinputkey = 'zjsmoduleformvalidationinputel',
		passstatuskey = 'zjsmoduleformvalidationpassStatus',
		
		// ho tro luon datepicker
		datepickerwrapelkey = 'zmoduleuidatepickerwrapel',
		datepickerchildinputclass = 'zui-datepicker-input',

		// ho tro luon imagepicker
		imagepickerwrapelkey = 'zjsmoduleimagepickerwrapel',
		
		// ho tro autosuggestion
		autosuggestionwrapelkey = 'zmoduleautosuggestionwrapel',
		autosuggestionchildinputclass = 'zui-autosuggestion-input',

		// ho tro ckeditor
		ckeditorinstancekey = 'ckeditorinstance';
		
	
	var pageLang = zjs('html').getAttr('lang', 'en').split('-');
	pageLang = pageLang[0];

	var defaulttips = {
		en:{
			required: 'Field is required',
			email: 'Not a valid email',
			url: 'Not a valid url',
			date: 'Not a valid date',
			number: 'Not a number',
			phonenumber: 'Not a phone number',
			digits: 'Not a digits',
			minlength: 'Value as least minlength',
			repassword: 'The specified passwords do not match'
		},
		es:{
			//required: 'Se requiere campo',
			required: 'Campo obligatorio',
			email: 'No es un correo electrónico válido',
			url: 'No es una URL válida',
			date: 'No es una fecha válida',
			number: 'No un número',
			phonenumber: 'No es un número de teléfono',
			digits: 'No un dígito',
			minlength: 'Valor como mínimo minlength',
			repassword: 'Las contraseñas especificadas no coinciden'
		},
		de:{
			required: 'Feld ist erforderlich',
			email: 'Keine gültige E-Mail',
			url: 'Nicht eine gültige URL',
			date: 'Nicht gültiges Datum',
			number: 'Nicht eine Nummer',
			phonenumber: 'Nicht eine Telefonnummer',
			digits: 'Nicht eine Ziffern',
			minlength: 'Wert so wenig minderlth',
			repassword: 'Die eingegebenen Passwörter stimmen nicht überein'
		},
		it:{
			required: 'Campo obbligatorio',
			email: 'Non è un\'e-mail valida',
			url: 'Non un URL valido',
			date: 'Non è una data valida',
			number: 'non un numero',
			phonenumber: 'Non un numero di telefono',
			digits: 'Non una cifra',
			minlength: 'Valore minima di lunghezza minima',
			repassword: 'Le password specificate non corrispondono'
		},
		vi:{
			required: 'Còn thiếu thông tin này',
			email: 'Sai định dạng email',
			url: 'Sai định dạng url',
			date: 'Sai định dạng ngày',
			number: 'Không phải là số',
			phonenumber: 'Không phải là số điện thoại',
			digits: 'Không phải là số',
			minlength: 'Không đủ chiều dài quy định',
			repassword: 'Mật khẩu nhập lại không chính xác'
		}
	};
	
	// extend core option cho de dieu chinh
	zjs.extendCore({
		moduleFormValidationOption:{
			errorClass: 'error',
			successClass: 'success',
			// set default lang dua vao ngon ngu cua trang
			language: pageLang,
			// default tips la empty
			tips: {
			//	required: '',
			//	email: '',
			//	url: '',
			//	date: '',
			//	number: '',
			//	phonenumber: '',
			//	digits: ''
			},
			
			// prevent check class
			preventClass: 'prevent',
			checkboxClass: 'checkbox',
			radiogroupClass: 'radiogroup',
			dategroupClass: 'dategroup',
			customInputClass: 'zvalidation-custom-input',
			
			// prevent enter to submit
			preventPressEnterToSubmit: false,
			
			// auto check right after blur
			autoCheckWhenBlur: true,
			autoCheckWhenInput: false,
			
			// Only show error on the first error-field
			onlyone: false
		}
	});
	
	// trigger
	//form:validation:success
	//form:validation:failed
	//form:validation:checking
	//form:validation:error
	
	// template
	var formclass = 'z-form-validation',
		fieldclass = 'z-form-field',
		tipclass = 'checktip',
		tiptextclass = 'text',
		tiphtml = '<div class="'+tipclass+'"><div class="'+tiptextclass+'"></div></div>';
	
	// list query se check de get ra cac input
	//[type=password], [type=file], select, textarea, [type=number], [type=search] ,[type=tel], 
	//[type=url], [type=email], [type=datetime], [type=date], [type=month], [type=week], 
	//[type=time], [type=datetime-local], [type=range], [type=color]
	//var inputsQuery = 'input[type=text], input[type=email], input[type=password], input.zimagepicker, textarea, .'+option.radiogroupClass+', .'+option.checkboxClass;
	var inputsQuery = '';
	
	// - - - - - - - - -
	
	var isCKE = function(zInput, element){
		return (zInput.tagName() === 'TEXTAREA' && ('CKEDITOR' in window) && zInput.getAttr('id', '') !== '' && 
					zInput.getAttr('id') in window.CKEDITOR.instances && 
					window.CKEDITOR.instances[zInput.getAttr('id')].element.$ === element);
	};
	
	// MAIN FUNCTIONS
	
	var formValidation = function(element, useroption){
		
		var zForm = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zForm.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zForm.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleFormValidationOption);
		
		// extend from inline option ?
		var inlineoption = zForm.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zForm.removeAttr('data-option');
		
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		
		// gio set them phan tips
		if(!option.language in defaulttips)option.language = 'en';
		option.tips = zjs.extend(defaulttips[option.language], option.tips);
		
		// fix option
		option.preventPressEnterToSubmit = !!option.preventPressEnterToSubmit;
		
		// da su dung onlyone roi, thi tuc la chi dung khi nao ma submit ma thoi
		option.onlyone = !!option.onlyone;
		if(option.onlyone)option.autoCheckWhenBlur = false;
		
		// save option
		zForm.setData(optionkey, option);
		
		// set lai cai query
		inputsQuery = 'input[type=text], input[type=email], input[type=password], input.zimagepicker, textarea, select'
					// ho tro check box group
					+', .'+option.checkboxClass
					// ho tro radio group
					+', .'+option.radiogroupClass
					// ho tro date group
					+', .'+option.dategroupClass;
		
		// - - -
		// start coding your module
		
		// add class cho form
		zForm.addClass(formclass);
		
		// bind event cho tung thang input khi ma onblur
		// se tu kiem tra luon
		var firstFixInputToFormValidation = function(){
			// trong luc lam cai nay thi se disable hook cho khoi bi error
			var currentZjsHookEnable = zjs.enablehook();
			zjs.enablehook(false);
			// bat dau man thoi
			zForm.find(inputsQuery+', .'+option.customInputClass).eachElement(function(element){
				var zInput = zjs(element);
			
				// xem coi neu nhu thang input nay la thang input dac biet thi thoi, ko ho tro
				if(zInput.hasClass(autosuggestionchildinputclass))return;
				if(zInput.hasClass(datepickerchildinputclass))return;

				// tuong tu cho dategroup
				// neu nhu cai input nay nam ben trong 1 cai dategroup thi cung khong check no rieng le
				if(zInput.hasClass('js-dategroup-item'))return;
				if(zInput.findUp('.'+option.dategroupClass).count()){
					zInput.addClass('js-dategroup-item');
					return;
				}
			
				// xem coi neu nhu thang input nay duoc xu ly 1 lan dau tien roi thi thoi
				if(zInput.getData(isvalidinputkey, false))return;
				zInput.setData(isvalidinputkey, true);
				
				// gio se tao ra cac tips element append vao san
				// nhung chi hide no di thoi
				var ztipEl = zjs(tiphtml).hide();
				var _makeTipClass = zInput.getAttr('name');
				if(zInput.hasClass(option.checkboxClass) && !zInput.is('input')){
					_makeTipClass = zInput.find('> input[type=checkbox]').getAttr('name');
				}
				ztipEl.addClass(tipclass+'-'+_makeTipClass);

				// quan trong -> xac dinh coi nen append vao dau thi dep ne
				// xem coi cai input nay co phai la 1 cai autosuggestion hay khong?
				// neu la vay thi phai append dang sau cai wrap element moi hop ly
				ztipEl.insertAfter(zInput);
				var _temp_AutoSGWrapEl = zInput.getData(autosuggestionwrapelkey);
				if(_temp_AutoSGWrapEl)ztipEl.insertAfter(_temp_AutoSGWrapEl);
				var _temp_DatepickerWrapEl = zInput.getData(datepickerwrapelkey);
				if(_temp_DatepickerWrapEl)ztipEl.insertAfter(_temp_DatepickerWrapEl);

				// Support cho CKEditor
				var ckeInstance = false;
				if(isCKE(zInput, element)){
					ckeInstance = window.CKEDITOR.instances[zInput.getAttr('id')];
					// set vao lan sau cho de truy xuat
					zInput.setData(ckeditorinstancekey, ckeInstance);
				}
				
				// dong thoi se luu lai cai input nay luon, sau nay truy xuat moi dc
				zInput.setData(tipelkey, ztipEl);
				
				// bind event cho input
				if(option.autoCheckWhenBlur){
					zInput.on('blur, ui:autosuggestion:blur, ui:datepicker:blur', function(event){
						handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
					});
				};
				if(option.autoCheckWhenInput){
					zInput.on('input, ui:autosuggestion:input', function(){
						//console.log('on ui.datepicker.blur');
						handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
					});
				};
				// neu nhu day la select 
				if(zInput.is('select')){
					// console.log('is select here', zInput.item(0,1));
					zInput.on('change, ui:selectbox:change, ui:selectbox:blur, ui:autosuggestion:choice, ui:autosuggestion:blur', function(){
						handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
					});
				};
				// neu nhu day la radiogroup thi phai xu ly khi cac thang con (radio) cua no click
				if(zInput.hasClass(option.radiogroupClass)){
					//zInput.find('input[type=radio]').live('click', function(){
					zInput.on('click', 'input[type=radio]', function(){
						handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
					});
				};
				// neu nhu la checkbox thi co 2 truong hop
				// 1: <div class="checkbox required"><input type="checkbox"></div>
				// 2: <input type="checkbox" class="checkbox required">
				// neu nhu la checkbox thi phai xu ly khi thang con (checkbox) cua no click
				if(zInput.hasClass(option.checkboxClass)){
					if(zInput.is('input')){
						zInput.on('click', function(){
							handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
						});
					}else{
						//zInput.find('input[type=checkbox]').live('click', function(){
						zInput.on('click', 'input[type=checkbox]', function(){
							handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
						});
					}
				};
				// neu nhu day la dategroup thi phai xu ly cac thang con (input) cua no
				if(zInput.hasClass(option.dategroupClass)){
					// bind event cho cac thang input con
					if(option.autoCheckWhenBlur){
						zInput.find('input').on('blur', function(){
							handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
						});
					};
					if(option.autoCheckWhenInput){
						zInput.find('input').on('input', function(){
							handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
						});
					};
				}
			
				// quan trong khong kem do la add class cho thang cha cua thang input
				// de co gi con css cho de
				zInput.parent().addClass(fieldclass);
			});
			// lam xong roi thi tra hook ve trang thai ban dau
			zjs.enablehook(currentZjsHookEnable);
		};
		// first run 
		firstFixInputToFormValidation();
		
		// dong thoi reg 1 cai hook de mai mot co thang 
		// input nao bay vao trong form validation thi cung se duoc khoi tao
		zjs.hook({
			//after_setInnerHTML: function(el){},
			after_insertDOM: function(el){
				firstFixInputToFormValidation();
			}
		});
		
		
		// HANDLER ENTER 
		// to submit or not?
		var lastSubmitByEnter = false;
		
		
		// bind event cho form khi ma submit
		// thi se kiem tra tung thang input
		zForm.on('submit', function(event){
			if(formCheck(element, event)){
				
				// check okie het roi thi remove class thoi 
				this.removeClass('zvalidation-invalid');
				
				// xem coi neu nhu last submit by enter
				// thi se khong cho phep submit :))
				if(lastSubmitByEnter){
					lastSubmitByEnter = false;
					event.preventDefault();
					// boi vi khong cho submit
					// nen khong cho lam gi tiep theo
					// zjs nen la thang cuoi cung dc handler submit
					// nen se stop luon
					event.stopPropagation();
					return;
				};
				this.trigger('form:validation:success', {}, function(customEvent){
					if(customEvent.isDefaultPrevented)
						event.preventDefault();
				});
			}
			else{
				this.addClass('zvalidation-invalid')
				.trigger('form:validation:failed', {
					status: zForm.getData(passstatuskey)
				});
			}
		});
		
		// - - - 
		
		// bind event khong cho tuy tien enter
		zjs(window).on('keydown', function(event){
			if(event.getKeyCode() == 13){
				// check coi cai thang input nay co thang form cha la thang nao?
				var _iszForm = zjs(event.target()).findUp('form');
				if(_iszForm.count() > 0){
					// check lai xem 1 phat coi option co dung hay khong?
					var _isOption = _iszForm.getData(optionkey, false);
					if(!_isOption)return;
					// check coi option co param dung khong?
					// neu co thi se ghi nhan lai hanh dong enter nay
					if(_isOption.preventPressEnterToSubmit)
						lastSubmitByEnter = true;
				};
			};	
		});
		
		// - - -
		
		// auto focus
		(function(){zForm.find('.autofocus').focus()}).delay(100);
	};
	
	
	// ham nay giup xu ly khi submit
	var formCheck = function(element, event, workInSilent, container){
		
		workInSilent = workInSilent || false;

		// get ra form
		var zForm = zjs(element);
		
		// neu khong phai la form validation thi thoi
		var option = zForm.getData(optionkey);
		if(!option)return;
		
		// roi truoc khi check, thi phai make sure la trong form
		// co cai editor nao
		// thi cai thang editor do phai duoc save cai da (tuc la update content ra textarea done)
		if('moduleEditorOption' in zjs)zForm.find('textarea').editorSave();
		
		// bat dau test
		var passAll = true, test;
		var passStatus = {};
		
		//var inputsQuery = 'input[type=text], input[type=email], textarea, .radiogroup';	
		//zForm.find('input,textarea').eachElement(function(element){
		var zContainer = typeof container === 'string'
			? zForm.find(container)
			: container
			? zjs(container)
			: zForm;
		zContainer.find('input,textarea,select,.'+option.checkboxClass+',.'+option.radiogroupClass+',.'+option.dategroupClass+',.'+option.customInputClass).eachElement(function(inputelm){
			var zInput = zjs(inputelm);
			
			//console.log('before', inputelm);
			// >>>>>>
			
			// neu nhu khong phai la input can thiet,
			// khong phai la autosuggestion
			// khong phai la 1 cai custom validation-type
			// => thi thoi khong check nua
			if(
				!zInput.is(inputsQuery+', .'+option.customInputClass) && 
				!zInput.getData(autosuggestionwrapelkey, false) &&
				!customTestMethodTypes.find(function(customType){return zInput.is('[data-'+customType+']')})
			)return;

			// neu nhu cai input nay nam ben trong 1 cai dategroup thi cung khong check no rieng le
			if(zInput.hasClass('js-dategroup-item'))return;
			if(zInput.findUp('.'+option.dategroupClass).count()){
				zInput.addClass('js-dategroup-item');
				return;
			}
			
			// va tuong tu cho auto suggestion
			// tuong tu cho datepicker luon
			// neu la truong hop cac input dat biet thi cung khong cho phep
			if(zInput.hasClass(autosuggestionchildinputclass))return;
			if(zInput.hasClass(datepickerchildinputclass))return;


			// Support cho CKEditor
			if(!zInput.getData(ckeditorinstancekey, false) && isCKE(zInput, inputelm))
			{	
				var ckeInstance = window.CKEDITOR.instances[zInput.getAttr('id')];
				// set vao lan sau cho de truy xuat
				zInput.setData(ckeditorinstancekey, ckeInstance);
				
				// boi vi lan dau, cho nen bind event luon
				if(option.autoCheckWhenInput){
					ckeInstance.on('change', function( evt ) {
						evt.editor.updateElement();
						handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
					});
				}
				if(option.autoCheckWhenBlur){
					ckeInstance.on('blur', function( evt ) {
						evt.editor.updateElement();
						handlerTestResult(zInput, checkInput(zInput, option, zForm), option);
					});
				}
			}

			if(zInput.getData(ckeditorinstancekey, false)){
				zInput.getData(ckeditorinstancekey).updateElement();
			}

		
			// console.log('handlerTestResult', inputelm);
			// >>>>>>>
			handlerTestResult(inputelm, test = checkInput(inputelm, option, zForm), option, workInSilent);
			
			// track lai thong tin
			var elName = zInput.getAttr('name', '');
			if(elName !== ''){
				// track lai ly do luon
				passStatus[elName] = test;
			};
			
			// chi can 1 thang khong pass, la coi nhu xong phim
			if(!test.pass){
				passAll = false;
				
				// neu ma chi can test 1 thang thoi, thi return luon cho roi
				if(option.onlyone)
					return false;
			};
		});
		zForm.setData(passstatuskey, passStatus);
		
		// neu nhu ma khong pass qua het thi khong cho form submit nua
		if(!passAll){
			try{
				if(typeof event != 'undefined' && event)
					event.preventDefault();
			}catch(err){};
			
			// neu nhu lam trong im lang thi return luon cho roi
			if(workInSilent)
				return false;

			// tu dong focus vao cai input dau tien bi error
			focusFirstErrorField(false, zForm, option);
			
			return false;
		};
		
		return true;
	};

	// ham nay giup focus vao first error form
	// phai delay chu chi can focus thi cai form se bi reset error state
	var _focusFirstErrorFieldTimeOut = null;
	var focusFirstErrorField = function(firstErrorElm, zForm, option){
		if(_focusFirstErrorFieldTimeOut)clearTimeout(_focusFirstErrorFieldTimeOut);
		_focusFirstErrorFieldTimeOut = setTimeout(function(){
			firstErrorElm = firstErrorElm || zForm.find('.'+option.errorClass).item(0);
			
			if(firstErrorElm.getData(ckeditorinstancekey, false)){
				firstErrorElm.getData(ckeditorinstancekey).focus();
			}
			else if('isAutosuggestion' in firstErrorElm && firstErrorElm.isAutosuggestion()){
				firstErrorElm.autosuggestionFocus();
			}
			else if(firstErrorElm.is('input') || firstErrorElm.is('textarea') || firstErrorElm.is('select')){
				firstErrorElm.focus();
			}
			else if(firstErrorElm.hasClass('radiogroup')){
				// scroll toi
				if('moduleTransition' in zjs){
					zjs(document.body).playTransition('scrollTop', firstErrorElm.getAbsoluteTop() - 100, {time: 800})
				}
			};
		}, 100);
	};
	
	
	// ham nay giup reset (hide di trang thai check error hien tai) form
	var formErrorReset = function(element){
		var zForm = zjs(element);
		// neu nhu la validation form thi moi lam tiep
		var option = zForm.getData(optionkey, false);
		if(!option)return;
		
		zForm.find('input,textarea,select,.'+option.checkboxClass).eachElement(function(element){
			var zInput = zjs(element);
			
			// xem coi thang input nay co cai tip-element nao khong
			var ztipEl = zInput.getData(tipelkey, false);
			if(!ztipEl)return;
			
			// hide di thoi
			ztipEl.hide();
			
			// remove class error tren input
			zInput.removeClass(option.errorClass);
			var zDatepickerWrapEl = zInput.getData(datepickerwrapelkey, false);
			if(zDatepickerWrapEl)zDatepickerWrapEl.removeClass(option.errorClass);
			var zImagepickerWrapEl = zInput.getData(imagepickerwrapelkey, false);
			if(zImagepickerWrapEl)zImagepickerWrapEl.removeClass(option.errorClass);
			var zAutosuggestWrapEl =  zInput.getData(autosuggestionwrapelkey, false);
			if(zAutosuggestWrapEl)zAutosuggestWrapEl.removeClass(option.errorClass);

			// support ckeditor
			var ckeInstance = zInput.getData(ckeditorinstancekey, false);
			if(ckeInstance)zjs(ckeInstance.container.$).removeClass(option.errorClass);
		});
	};
	
	// ham nay se thuc hien viec khi ma 1 input bi error
	var handlerTestResult = function(element, test, option, workInSilent){
		var zInput = zjs(element);
		// neu nhu test pass thi don gian la cho qua
		if(test.pass){

			// neu nhu work in silent thi se khong can add class success lam gi
			var successClass = (workInSilent || false) ? '' : option.successClass;

			zInput.removeClass(option.errorClass);
			// neu nhu co required thi moi can add class success 
			if(zInput.hasClass('required'))
				zInput.addClass(successClass);
			
			// hide tip key
			var ztipEl = zInput.getData(tipelkey);
			if(ztipEl)ztipEl.hide();
			
			// kiem tra coi day co phai la 1 datepicker khong
			// neu nhu phai thi se remove errorclass tren cai picker luon
			var zDatepickerWrapEl = zInput.getData(datepickerwrapelkey, false);
			if(zDatepickerWrapEl)zDatepickerWrapEl.removeClass(option.errorClass).addClass(successClass);
			// neu nhu la imagepicker
			var zImagepickerWrapEl = zInput.getData(imagepickerwrapelkey, false);
			if(zImagepickerWrapEl)zImagepickerWrapEl.removeClass(option.errorClass).addClass(successClass);
			// kiem tra autosuggest
			var zAutosuggestWrapEl =  zInput.getData(autosuggestionwrapelkey, false);
			if(zAutosuggestWrapEl)zAutosuggestWrapEl.removeClass(option.errorClass).addClass(successClass);
			// support ckeditor luon
			var ckeInstance = zInput.getData(ckeditorinstancekey, false);
			if(ckeInstance)zjs(ckeInstance.container.$).removeClass(option.errorClass).addClass(option.successClass);
			
			// also fire an event
			zInput.trigger('form:validation:success', {type: test.type});
			return;
		};

		// neu nhu work in silent thi se khong can phai add class error va ko can show checktip
		if(workInSilent || false){
			return;
		}


		// con neu nhu khong pass qua thi phai set 1 tip html
		// get ra tip dua vao type cua test
		zInput.addClass(option.errorClass).removeClass(option.successClass);
		
		// show tip key
		var ztipEl = zInput.getData(tipelkey);
		if(ztipEl){
			// xem coi cai tip element nay co set san cai tip khong
			// neu co thi su dung thoi
			var tipText = '';
			if(zInput.getAttr('data-tip-'+test.type, '') != '')tipText = zInput.getAttr('data-tip-'+test.type, '');
			else if(typeof option.tips[test.type] != 'undefined')tipText = option.tips[test.type];
			ztipEl.show().find('.'+tiptextclass).setInnerHTML(tipText).setAttr('data-type', test.type);
		};
		
		// kiem tra coi day co phai la 1 datepicker khong
		// neu nhu phai thi se add errorclass tren cai picker luon
		var zDatepickerWrapEl = zInput.getData(datepickerwrapelkey, false);
		if(zDatepickerWrapEl)zDatepickerWrapEl.addClass(option.errorClass).removeClass(option.successClass);
		// neu la imagepicker
		var zImagepickerWrapEl = zInput.getData(imagepickerwrapelkey, false);
		if(zImagepickerWrapEl)zImagepickerWrapEl.addClass(option.errorClass).removeClass(option.successClass);
		// kiem tra autosuggest
		var zAutosuggestWrapEl =  zInput.getData(autosuggestionwrapelkey, false);
		if(zAutosuggestWrapEl)zAutosuggestWrapEl.addClass(option.errorClass).removeClass(option.successClass);

		// support ckeditor luon
		var ckeInstance = zInput.getData(ckeditorinstancekey, false);
		if(ckeInstance){
			zjs(ckeInstance.container.$).addClass(option.errorClass).removeClass(option.successClass);

			// neu nhu la test require ma ko pass
			// thi se reset html cai editor luon
			if(test.type === 'required'){
				ckeInstance.document.getBody().setHtml('');
			}

		}

		// trigger cai event luon
		zInput.trigger('form:validation:error', {type: test.type});
	};
	
	// ham giup cho viec kiem tra tung input element
	var checkInput = function(element, option, zForm){
		
		var zInput = zjs(element);
		
		// neu nhu co preventClass thi se bo qua luon
		if(zInput.hasClass(option.preventClass))return {pass:true};
		
		// bay gio se xac dinh coi la thang element nay se duoc test nhung cai gi
		var id = zInput.getAttr('id', '').trim().toLowerCase(),
			name = zInput.getAttr('name', '').trim().toLowerCase(),
			inputType = zInput.getAttr('type', '').trim().toLowerCase(),
			classname = zInput.getAttr('class', '').trim().toLowerCase(),
			value = zInput.getValue('').trim();

		// ok neu nhu cho nay la ckeditor, thi check them 1 xiu
		if(zInput.getData(ckeditorinstancekey, false)){
			// console.log('value', value);
			// value = value.replace(/&nbsp;/g, '').stripTags().trim();
			// console.log('value after', value);
			value = zInput.getData(ckeditorinstancekey).document.getBody().getText().trim();
			// console.log('plainValue', plainValue);
		}
			
		// 0. trong truong hop dac biet
		// check required cua groupradio
		if(zInput.hasClass(option.radiogroupClass)){
			// edit value phai la value cua 1 trong so nhung thang radio duoc check
			value = zInput.find('input[type=radio]:checked').getValue('').trim();
		};
		
		// neu la checkbox thi co 2 truong hop
		if(zInput.hasClass(option.checkboxClass)){
			if(zInput.is('input')){
				// reset value if checkbox isn't checked
				if(!zInput.is(':checked'))value = '';
			}else{
				// edit value phai la value cua thang checkbox duoc check
				value = zInput.find('input[type=checkbox]:checked').getValue('').trim();
			}
		};

		// neu nhu la date group
		if(zInput.hasClass(option.dategroupClass)){
			// edit value phai la value cua 1 trong so nhung thang radio duoc check
			// value = zInput.find('input[type=radio]:checked').getValue('').trim();
			
			// tim ra value la tong hop cua 3 cai input con
			var dayInput = null, monthInput = null, yearInput = null;
			zInput.find('input').eachElement(function(inputElm){
				var _datePartName = z(inputElm).getAttr('name', '').trim().toLowerCase();
				if(_datePartName.indexOf('year')>=0)yearInput = z(inputElm);
				else if(_datePartName.indexOf('month')>=0)monthInput = z(inputElm);
				else if(_datePartName.indexOf('day')>=0)dayInput = z(inputElm);
			});
			
			var _values = [];
			if(yearInput && yearInput.getValue())_values.push(yearInput.getValue());
			if(monthInput && monthInput.getValue())_values.push(monthInput.getValue());
			if(dayInput && dayInput.getValue())_values.push(dayInput.getValue());
			value = _values.length > 2 ? _values.join('-') : '';
		};
		
		if(zInput.hasClass(option.customInputClass)){
			value = zInput.getAttr('data-value', '');
		};
		
		// truong hop la datepicker
		if(zInput.getData(datepickerwrapelkey, false)){
			value = zInput.getValue();
		};
		
		// truong hop la imagepicker
		if(zInput.getData(imagepickerwrapelkey, false)){
			value = zInput.getValue();
			if(!value)value=0;else value = parseInt(value);
			if(value <= 0)value = '';
		};
			
		
		
		// 1. dau tien la check required
		// neu nhu khong dap ung duoc la thoi ngay
		if(value == ''){
			if(classname.indexOf('required')>=0 || zInput.getAttr('data-tip-required','')!='')return {pass:false, type:'required'};
			// neu nhu input nay khong co phai la required, ma value dang rong
			// thi dau co can phai check nua
			//else return {pass:true};
		};
		
		// 2. thu nhi la check type
		if(value != ''){

			// check truong hop dat biet la cai thang dategroup truoc
			if(zInput.hasClass(option.dategroupClass)){
				if(!testMethods.yearmonthday(value, element))
					return {pass:false, type:'date'};
			}

			// gio moi di check cac truong hop khac
			var testType = '';
			if(name.indexOf('email')>=0 || classname.indexOf('email')>=0 || zInput.getAttr('data-tip-email','')!='' || inputType == 'email')testType = 'email';
			else if(name.indexOf('url')>=0 || classname.indexOf('url')>=0 || zInput.getAttr('data-tip-url','')!='')testType = 'url';
			else if(name.indexOf('phonenumber')>=0 || classname.indexOf('phonenumber')>=0 || zInput.getAttr('data-tip-phonenumber','')!='')testType = 'phonenumber';
			else if(name.indexOf('number')>=0 || classname.indexOf('number')>=0 || zInput.getAttr('data-tip-number','')!='' || inputType == 'number')testType = 'number';
			else if(name.indexOf('digits')>=0 || classname.indexOf('digits')>=0 || zInput.getAttr('data-tip-digits','')!='')testType = 'digits';
			else if(name.indexOf('date')>=0 /*|| classname.indexOf('date')>=0*/ || classname.indexOf('zdatepicker')>=0 || zInput.getAttr('data-tip-date','')!='' || inputType == 'date')testType = 'date';
			
			// doi khi field name co ten la "number"
			// nhung luc su dung van cho phep nhap vao ky tu
			// nen se check them 1 xiu nua
			if(testType == 'number' && zInput.hasClass('allow-alphabet')){
				testType = '';
			}

			// test thoi
			if(testType != '' && !testMethods[testType](value, element))return {pass:false, type:testType};
		};
		
		// 2.1 check type co the mix voi nhau
		if(value != ''){
			if(name.indexOf('minlength')>=0 || classname.indexOf('minlength')>=0 || zInput.getAttr('data-tip-minlength','')!='' || zInput.getAttr('minlength', null) !== null || zInput.getAttr('data-minlength', null) !== null)testType = 'minlength';
			// test thoi
			if(testType != '' && !testMethods[testType](value, element))return {pass:false, type:testType};
		};
		
		// 3. thu ba la check mat khau nhap lai coi chinh xac hay khong
		if(inputType == 'password' && (name.indexOf('repassword')>=0 || name.indexOf('pass[pass2]')>=0 || classname.indexOf('repassword')>=0 || zInput.getAttr('data-tip-repassword','')!='')){
			// xem coi trong nay co bao nhieu thang password
			var passwordInputEls = zForm.find('input[type="password"]');
			if(passwordInputEls.count() > 1){
				
				var _currentPassInputIndex = -1;
				
				// get ra cai password field truoc do
				passwordInputEls.eachElement(function(_passInputEl, _passInputIndex){
					if(zInput.isTheSame(_passInputEl)){
						_currentPassInputIndex = _passInputIndex;
						return;
					}
				});
				
				if(_currentPassInputIndex >= 1){
					// neu nhu khac password cua cai field truoc do thi bao loi
					if(zInput.getValue('') != passwordInputEls.item(_currentPassInputIndex-1).getValue())
						return {pass:false, type:'repassword'};
				};
				
			};
		};

		// 4. thu check trong list custom test type da register truoc do
		if(value != '')for(var i = 0;i<customTestMethodTypes.length;i++){

			var customTestType = customTestMethodTypes[i];

			// khong co tin hieu check thi bo qua
			if(!zInput.is('[data-'+customTestType+']'))continue;

			var param = zInput.getAttr('data-'+customTestType, '');
		
			// test
			if(!testMethods[customTestType](value, element, param, zForm))
				return {pass:false, type:customTestType};
		}
		
		
		// n. trigger event to a custom check 
		zForm.trigger('form:validation:checking', {element:element, option:option}, function(customEvent){
			//if(customEvent.isDefaultPrevented)
			//	event.preventDefault();
		});
		
		return {pass:true};
	};

	// ham giup cho viec manual force set error cho tung form field
	function formSetError(element, field, testType, errorMessage, workInSilent){
		var zForm = zjs(element);
		// neu nhu la validation form thi moi lam tiep
		var option = zForm.getData(optionkey, false);
		if(!option)return;

		// fix option
		testType = testType || 'manual';
		errorMessage = errorMessage || null;
		workInSilent = workInSilent || false;

		// tim ra cai field
		var zField = (typeof field === 'string')
			? zForm.find('[name="'+field+'"]')
			: field;

		// neu co set error message thi se di set attribute luon cho field
		if(errorMessage !== null){
			zField.setAttr('data-tip-'+testType, errorMessage);
		}
		
		// handler test thoi
		handlerTestResult(zField, {
			pass: false,
			type: testType,
		}, option);
			
		// neu nhu lam trong im lang thi return luon cho roi
		if(workInSilent)
			return false;

		// tu dong focus vao cai input bi set error
		focusFirstErrorField(zField, zForm, option);
	};
	
	// duoi day la 1 loat cac ham dung de test
	// http://jquery.bassistance.de/validate/jquery.validate.js
	var testMethods = {
		// http://projects.scottsplayground.com/email_address_validation/
		email: function(value, element){
			return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
		},
		// http://projects.scottsplayground.com/iri/
		url: function(value, element){
			return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},
		date: function(value, element){

			// console.log('date', value);

			return !/Invalid|NaN/.test(new Date(value).toString());
		},
		yearmonthday: function(valueYearMonthDay, element){
			// dau tien la check neu nhu sai dinh dang ngay thi thoi, thua
			if(!testMethods.dateISO(valueYearMonthDay))return false;

			var ss = valueYearMonthDay.split('-');
			var dd = [parseInt(ss[0]), parseInt(ss[1]).toPaddedString(2), parseInt(ss[2]).toPaddedString(2)].join('-');
			var a = new Date(dd+'T00:00:00Z');
			
			// neu nhu khong dung ngay thi thoi
			if(isNaN(a.getDate()))return false;

			return dd === a.toISOString().slice(0,10);
		},
		dateISO: function(value, element){
			return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
		},
		number: function(value, element){
			return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
		},
		phonenumber: function(value, element){

			// first: value should have minimum 3 character
			if((value + ' ').trim().length < 3)return false;

			//return /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/.test(value);
			//return /^[\s()+-]*([0-9][\s()+-]*){6,20}$/.test(value);
			return /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/.test(value);
			/* Matches:
				(+351) 282 43 50 50
				90191919908
				555-8909
				001 6867684
				001 6867684x1
				1 (234) 567-8901
				1-234-567-8901 x1234
				1-234-567-8901 ext1234
				1-234 567.89/01 ext.1234
				1(234)5678901x1234
				(123)8575973
				(0055)(123)8575973
			*/
		},
		digits: function(value, element){
			return /^\d+$/.test(value);
		},
		// http://en.wikipedia.org/wiki/Luhn
		creditcard: function(value, element){
			// accept only spaces, digits and dashes
			if(/[^0-9 \-]+/.test(value))return false;
			
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for(var n = value.length - 1; n >= 0; n--){
				var cDigit = value.charAt(n);
				nDigit = parseInt(cDigit, 10);
				if(bEven && (nDigit *= 2) > 9)nDigit -= 9;
				nCheck += nDigit;
				bEven = !bEven;
			};

			return (nCheck % 10) === 0;
		},
		minlength: function(value, element){
			// get ra min length trong element
			var ml = zjs(element).getAttr('data-minlength', null);
			if(ml ===  null)ml = zjs(element).getAttr('minlength', null);
			if(ml === null)ml = 0;
			ml = parseInt(ml);
			if(isNaN(ml))return false;

			return (value + ' ').trim().length >= ml;
		},
		maxlength: function(value, element, param){
			return false;
			//var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			//return this.optional(element) || length <= param;
		},
		rangelength: function(value, element, param){
			return false;
			//var length = $.isArray( value ) ? value.length : this.getLength($.trim(value), element);
			//return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},
		min: function(value, element, param){
			return false;
			//return this.optional(element) || value >= param;
		},
		max: function(value, element, param){
			return false;
			//return this.optional(element) || value <= param;
		},
		range: function(value, element, param){
			return false;
			//return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},
		equalTo: function(value, element, param){
			return false;
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			//var target = $(param);
			//if ( this.settings.onfocusout ) {
			//	target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
			//		$(element).valid();
			//	});
			//}
			//return value === target.val();
		}
	};
	
	var customTestMethodTypes = [];


	function formAddTestType(element, testType, handler, errorMessage){
		// thuc ra la cho nay lam chung luon
		// chu khong phai la lam rieng cho tung element (form) nao ca
		testMethods[testType] = handler;
		customTestMethodTypes.push(testType);

		// @todo: implement errorMessage later
		// it should be:
		//  - a function to return a json 
		//  - a raw json itselt 
		// like this:
		// {
		// 	  en: "error message",
		// 	  de: "Fehlermeldung",
		// 	  ...
		// }
	};
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		formValidation: function(useroption){
			return this.eachElement(function(element){formValidation(element, useroption)});
		},
		formValidationReset: function(){
			return this.eachElement(function(element){formErrorReset(element)});
		},
		formValidationCheck: function(workInSilent, container){
			// ket qua cuoi cung
			var result = false;
			this.eachElement(function(element){
				result = formCheck(element, false, workInSilent, container);
			});
			return result;
		},
		formValidationCheckInSilent: function(container){
			return this.formValidationCheck(true, container);
		},
		/**
		 * [formValidationAddTestType description]
		 * @param  {string} testType 	name of this test
		 * @param  {function} handler  	function(value, element, param){return bool}
		 * @return {this}          		this
		 */
		formValidationAddTestType: function(testType, handler, errorMessage){
			return this.eachElement(function(element){
				formAddTestType(element, testType, handler, errorMessage);
			});
		},
		formValidationSetError: function(field, testType, errorMessage){
			return this.eachElement(function(element){
				formSetError(element, field, testType, errorMessage);
			});
		},
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			var zEl = zjs(el);
			
			// kiem tra xem trong so cac thang con
			// co class nao la zvalidation ko, neu nhu co thi se auto formValidation luon
			zEl.find('.zvalidation').formValidation();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zvalidation ko, neu nhu co thi se auto formValidation luon
			if(zjs(el).hasClass('zvalidation'))zjs(el).formValidation();
			zjs(el).find('.zvalidation').formValidation();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zvalidation').formValidation();
	});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('form.validation');
})(zjs);