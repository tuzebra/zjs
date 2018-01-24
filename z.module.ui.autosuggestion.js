// extend module Auto suggestion cho zjs
zjs.require('dictionary, scrollbar', function(){
"use strict";
	
	var optionkey = 'zjsmoduleautosuggestionoption',
		wrapelkey = 'zmoduleautosuggestionwrapel',
		wrapinputelkey = 'zmoduleautosuggestionwrapinputel',
		newinputkey = 'zjsmoduleautosuggestionnewinput',
		dictionarykey = 'zjsmoduleautosuggestiondictionary',
		keytypehandlerkey = 'zjsmoduleautosuggestionkeytype';
	
	// extend core option cho de dieu chinh
	zjs.extendCore({
		moduleUiAutosuggestionOption:{
			minlength: 1,
			minheight: 18,
			customcss: true,
			focusshowsuggestion: false,
			autofocus: false,
			panelmaxheight: 200,
			multiline: true,
			multichoice: false,
			mentionmode: false,
			usedproperty: 'text',
			searchproperty: 'text',
			usedpropertytext: false,
			noneValue: '',
			source: [],
			sourceUrl: '',
			initSourceUrl: '',
			sourceDataStructure: '',
			cacheResponse: true,
			itemtemplate: '<div class="item">${text}</div>',
			itemLinkFormat: '',
			itemhighlightclass: 'highlight'
		}
	});
	
	// trigger
	//ui:autosuggestion:highlight
	//ui:autosuggestion:choice
	//ui:autosuggestion:input
	//ui:autosuggestion:blur
	//ui:autosuggestion:beforesearch
	//ui:autosuggestion:searchresult
	
	// template
	var zautosuggestionClass = 'zui-autosuggestion-wrap',
		zautosuggestionFocusClass = 'focus',
		zautosuggestionMultiClass = 'zui-autosuggestion-multi-wrap',
		zautosuggestionWithTokenClass = 'zui-autosuggestion-with-token',
		__htmltpl = '<div class="'+zautosuggestionClass+'">'+
						'<div class="zui-autosuggestion-inputwrap">'+
							'<div class="zui-autosuggestion-placeholder"></div>'+
							// do bi loi css qua, nen tam thoi se khong co set type cua cai input nay luon
							//'<input type="text" class="zui-autosuggestion-input" autocomplete="off" />'+
							'<input class="zui-autosuggestion-input" autocomplete="off" />'+
							'<textarea class="zui-autosuggestion-input" autocomplete="off"></textarea>'+
							'<div class="zui-autosuggestion-input-test-wrap"><div class="zui-autosuggestion-input-test"></div></div>'+
							'<div class="zui-estimate-height-wrap"><div class="zui-autosuggestion-input zui-estimate-height"></div></div>'+
						'</div>'+
						'<div class="zui-autosuggestion-panel-wrap zui-panel-hide">'+
							'<div class="zui-autosuggestion-panel-scroll">'+
								'<div class="zui-autosuggestion-panel-content">'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>',
	
		__itemclass = 'zui-autosuggestion-item',
		__htmlitemtpl = '<div class="'+__itemclass+'"></div>',
		__htmlitemlinktpl = '<a class="'+__itemclass+'"></a>';
	
	var _supportOnInputEvent = ('oninput' in document.createElement('input'));

	// - - - - - - - - -
		
	
	// MAIN FUNCTIONS
	
	var makeAutosuggestion = function(element, useroption){
		
		var zOriginalInput = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zOriginalInput.getData(optionkey);
		
		// flag y bao phai refresh lai option
		var refreshOption = false;
		if(option){
			zOriginalInput.setData(optionkey, zjs.extend(option, useroption));
			refreshOption = true;
			return;
		};
		
		var refreshOptionFn = function(){
			if(!refreshOption)return;
			option = zOriginalInput.getData(optionkey);
			refreshOption = false;
		};

		var IS_ENABLE_AUTOSUGGESTION = true;
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiAutosuggestionOption);
		
		// extend from inline option ?
		var inlineoption = zOriginalInput.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zOriginalInput.removeAttr('data-option');
		
		// support sourceUrl option pass as an attribute of element
		if(!option.sourceUrl){
			var _attDataAutocompletePath = zOriginalInput.getAttr('data-autocomplete-path', '');
			if(_attDataAutocompletePath !== ''){
				option.sourceUrl = _attDataAutocompletePath;
			}
		}
		
		// check coi need to watch autocomplete path change hay khong?
		// add luon cai hook vo luon
		// boi vi khi da chay module autosugess len roi, ma sau do lai thay doi attribute
		// thi chung to la muon thay doi suggest path that
		zjs.hook({after_setAttr: function(el, att, val){
			if(el !== element || att !== 'data-autocomplete-path')return;
			var _attDataAutocompletePath = zOriginalInput.getAttr('data-autocomplete-path', '');
			// neu nhu empty thi disable autosuggess luon
			if(_attDataAutocompletePath == ''){
				// console.log('disable autosugges luon!');
				IS_ENABLE_AUTOSUGGESTION = false;
			}else{
				// console.log('enable autosugges, change path!');
				IS_ENABLE_AUTOSUGGESTION = true;
				option.sourceUrl = _attDataAutocompletePath;
				//set sourceUrl vao cho thang dictionary
				dictionary.setDataSourceUrl(option.sourceUrl);
			}
		}});

		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);


		// support source is a <select>
		var selectSourceEl = false;
		var selectSourceDefaultValue = false;
		var selectNoneValue = '';
		var selectNoneText = '';
		if(zjs.isString(option.source)){
			selectSourceEl = zjs(option.source);
			if(selectSourceEl.count()>0){
				
				// fix option luon
				option.multichoice = false;
				option.usedproperty = 'id.text';
				
				// init data cho thang option
				option.source = {};
				selectSourceEl.find('option').eachElement(function(optionEl, index){
					var _optionValue = zjs(optionEl).getValue();
					var _optionText = zjs(optionEl).getInnerText();

					// @todo: need to improve it later
					// just reture because we don't need this data
					if(_optionValue === option.noneValue){
						return;
					}

					// option.source.push({
					// 	id: _optionValue, 
					// 	text: _optionText
					// });
					option.source[_optionValue] = _optionText;
					if(_optionValue == option.noneValue){
						selectNoneValue = _optionValue;
						selectNoneText = _optionText;
					}
					// set cai data vao cai thang input luon
					if(index === 0){
						selectSourceDefaultValue = _optionValue;
						if(_optionValue != option.noneValue){
							zOriginalInput.setValue(_optionValue);
						}
					}
					if(optionEl.selected){
						// @todo: need to fix later
						if(_optionValue != option.noneValue){
							// zOriginalInput.setValue(_optionValue);
							zOriginalInput.setValue(_optionText);
						}
					}
				});

				// hide <select> element
				selectSourceEl.hide();
				// and because now this autosuggestion will take over the select
				// so it don't need to be handler the required case anymore
				// to prevent focusable issue
				selectSourceEl.removeAttr('required').removeClass('required');
			}
			else{
				selectSourceEl = false;
			}
		}
		
		// fix option
		var searchpropertyTemp = option.searchproperty;
		if(option.usedproperty == 'id.text'){
			option.searchproperty = 'text';
			option.usedproperty = 'id';
			searchpropertyTemp = 'id.text';
		}
		// fix option
		// neu nhu dang trong mention mode thi se khong co vu multichoice gi ca
		if(option.mentionmode){
			option.multichoice = false;
		}
		// neu nhu dang trong multichoice mode thi se khong co support multiline
		// boi vi multiline o day chi mang y nghia support cho single choice ma thoi
		if(option.multichoice){
			option.multiline = false;
		}
		
		// save option
		zOriginalInput.setData(optionkey, option);
		
		// - - -
		// start coding your module
		
		// - - - -
		
		// INIT ELEMENT
		
		// van giu nguyen element nguyen goc
		// chi tao ra, va add class cho mot element insert after
		var zWrapperEl = zjs(__htmltpl);
		// xem coi co support multiline hay khong?
		if(option.multiline)zWrapperEl.find('input.zui-autosuggestion-input').remove();
		else zWrapperEl.find('textarea.zui-autosuggestion-input').remove();
		
		// sau do luu lai luon de sau nay truy xuat
		zOriginalInput.setData(wrapelkey, zWrapperEl);
		
		// gio moi insert vao sau khi luu
		zWrapperEl.insertAfter(zOriginalInput);
		
		// gio moi di khai bao may cai element khac
		var	zWrapperInput = zWrapperEl.find('.zui-autosuggestion-inputwrap'),
			zPlaceholder = zWrapperEl.find('.zui-autosuggestion-placeholder'),
			zInput = zWrapperEl.find('input.zui-autosuggestion-input,textarea.zui-autosuggestion-input'),
			zPanel = zWrapperEl.find('.zui-autosuggestion-panel-wrap'),
			zPanelscroll = zWrapperEl.find('.zui-autosuggestion-panel-scroll'),
			zPanelcontent = zWrapperEl.find('.zui-autosuggestion-panel-content'),
			zEstimateHeightEl = false;
		
		// save new input && wrapper input
		zOriginalInput.setData(wrapinputelkey, zWrapperInput);
		zOriginalInput.setData(newinputkey, zInput.item(0,true));
		
		// sau khi khai bao xong element thi tien hanh build co che de ma track lai height
		if(option.multiline){
			zEstimateHeightEl = zWrapperEl.find('.zui-estimate-height');
			zWrapperEl.addClass('multiline');
		}else
			zWrapperEl.find('.zui-estimate-height-wrap').remove();
		
		
		
		// neu nhu khong tu custom css thi phai auto set thoi
		if(!option.customcss){
		
			// get all style from original input
			var zOriginalInputStyle = {
			
				width: zOriginalInput.width(),
				height: zOriginalInput.height(),
				
				marginLeft: zOriginalInput.getStyle('margin-left', true),
				marginRight: zOriginalInput.getStyle('margin-right', true),
				marginTop: zOriginalInput.getStyle('margin-top', true),
				marginBottom: zOriginalInput.getStyle('margin-bottom', true),
				
				paddingLeft: zOriginalInput.getStyle('padding-left', true),
				paddingRight: zOriginalInput.getStyle('padding-right', true),
				paddingTop: zOriginalInput.getStyle('padding-top', true),
				paddingBottom: zOriginalInput.getStyle('padding-bottom', true),
				
				borderLeft: zOriginalInput.getStyle('border-left-width', true),
				borderRight: zOriginalInput.getStyle('border-right-width', true),
				borderTop: zOriginalInput.getStyle('border-top-width', true),
				borderBottom: zOriginalInput.getStyle('border-bottom', true),
				
				font: zOriginalInput.getStyle('font'),
				boxSizing: zOriginalInput.getStyle('box-sizing')
				
			};
			// then fix it
			if(zOriginalInputStyle.boxSizing=='content-box'){
				zOriginalInputStyle.width -= (zOriginalInputStyle.paddingLeft + zOriginalInputStyle.paddingRight + zOriginalInputStyle.borderLeft + zOriginalInputStyle.borderRight);
				zOriginalInputStyle.height -= (zOriginalInputStyle.paddingTop + zOriginalInputStyle.paddingBottom + zOriginalInputStyle.borderTop + zOriginalInputStyle.borderBottom);
			};
			
			// apply style to new wraper div
			zWrapperInput.copyStyleFrom(zOriginalInput);
			zWrapperInput.setStyle({
				position: 'relative',
				cursor: 'text',
				width: zOriginalInputStyle.width,
				height: zOriginalInputStyle.height,
				'-webkit-text-fill-color': 'initial'
			});
			
			// apply style to new input
			zInput.setStyle({
				top: zPlaceholder.top(),
				font: zOriginalInputStyle.font,
				width: zOriginalInputStyle.width
			});
		
		};
		// end auto css
		
		//var zInputTestWrapEl = false;
		var zInputTestEl = false;
		
		// xem coi neu nhu khong dung multichoice
		// thi se remove luon cai thang input test luon
		if(!option.multichoice){
			zWrapperEl.find('.zui-autosuggestion-input-test-wrap').remove();
		// con neu su dung multi thi se set 1 ty
		}else{
			zWrapperEl.addClass(zautosuggestionMultiClass);
			//zInputTestWrapEl = zWrapperEl.find('.zui-autosuggestion-input-test-wrap');
			
			// set thang test width cua thang input
			zInputTestEl = zWrapperEl.find('.zui-autosuggestion-input-test').setStyle({
				margin: zInput.getStyle('margin'),
				padding: zInput.getStyle('padding'),
				font: zInput.getStyle('font'),
				border: zInput.getStyle('border')
			});
		};
		
		// set height panel
		zPanel.height(option.panelmaxheight);
		// make scrollbar xong moi hide
		zPanelscroll.makeScrollbar({bounce:false,usecss:false,usekey:false,customCssClass:'zui-autosuggestion-panel',autoUseDefaultWithMobile:true});
		zPanel.addClass('zui-panel-hide');
		
		// function giup thay doi height cua panel
		var changePanelHeight = function(height){
			var toheight = Math.min(height, option.panelmaxheight);
			zPanel.height(toheight);
			zPanelscroll.scrollHeight(toheight).scrollToTop();
		};

		// check lai cai last link de co gi con redirect
		var lastHighlightLinkByKeyUpDown = '';
		
		// END INIT ELEMENT
		// - - - -
	
		// - - - -
		// set placeholder text
		var placeholderText = function(){
				return zOriginalInput.getAttr('data-placeholder', zOriginalInput.getAttr('placeholder', ''));
			};

		// luu lai coi dang chon thang nao
		var currentHighlightIndex = 0, 
			currentResultLength = 0, 
			typevalue = '',
			typevalueholder = '',
			// luu lai coi dang show len holder la cai thang nao?
			// index tuc la index cua cai thang dang nam trong list suggest
			currentValueholderIndex = 0,
			// realvalue that use in the result
			usedvalue = '';
		
		setPlaceholderText(zPlaceholder, placeholderText());
		
		// - - - -
		// hide old input
		zOriginalInput.setAttr({type:'hidden', autocomplete:'off'});
		// neu nhu thang input hien tai dang co value
		// thi se empty cai placeholder di thoi
		if(zOriginalInput.getValue('')!=''){
			zInput.setValue(typevalue = zOriginalInput.getValue());
			setPlaceholderText(zPlaceholder, '');
		};
		
		// - - - -
		// index data source to search
		var dictionary = new zjs.dictionary(option.source, searchpropertyTemp);
		
		if(!option.cacheResponse){
			dictionary.setCacheResponse(false);
		}
		if(option.sourceUrl != ''){
			dictionary.setDataSourceUrl(option.sourceUrl);
		}
		if(option.initSourceUrl != ''){
			dictionary.setDataSourceUrl(option.initSourceUrl);
			if(option.sourceUrl === ''){
				dictionary.useCacheDataSource(true);
			}
			dictionary.getDataFromDataSource();
		}
		if(option.sourceDataStructure != ''){
			dictionary.setDataSourceDataStructure(option.sourceDataStructure);
		}
			
		// >>> test
		zOriginalInput.setData(dictionarykey, dictionary);
		
		// - - - -
		// HANDLER EVENT FUNCTION
		
		// handler onkey make change
		var onkeyhandler = function(event, eventname){
			// refresh option truoc khi lam
			refreshOptionFn();
			
			// de xem no lam cai tro gi
			var keycode = event.getKeyCode();
			// up/down
			if(keycode==38||keycode==40){if(eventname=='keydown')onkeyupdownhandler(event, keycode);return;};
			// left
			if(keycode==37){return;}
			// right / tab
			if(keycode==39||keycode==9){
				if(eventname=='keydown')onkeyrighthandler();
				// neu nhu an tab thi se goi su kien blur luon
				if(keycode==9){
					zPanel.addClass('zui-panel-hide');
					zOriginalInput.trigger('ui:autosuggestion:blur');
				}
				return;
			}
			// enter
			if(keycode==13){
				//console.log('>>> 13');
				
				// cai quan trong la:
				// neu nhu single choice (khong phai multichoi) 
				// thi se de event dien ra nhu binh thuong
				if(!option.multichoice){
					
					var needToSendSubmitEvent = zPanel.hasClass('zui-panel-hide');

					// moi thu dien ra binh thuong
					if(eventname=='keydown')
						onkeyenterhandler();
					
					// voi cai thang textarea thi khong cho enter xuong hang
					if(option.multiline){
						event.preventDefault();
						fixheightmultiline();
						// boi vi textarea khong auto send submit event to form
						// cho nen sau do phai submit form manual luon
						// (phai delay 1milisecond chu khong lai bi clear mat event)
						if(needToSendSubmitEvent){
							(function(){zOriginalInput.findUp('form').submit()}).delay(1);
						}
					};
				}
				// neu nhu la multichoice 
				// thi se xem xet coi co cho submit hay la khong?
				else{
					// neu nhu khong cho submit form nhu binh thuong thi se prevent lai					
					// cac truong hop ma phai prevent:
					// trong cai input con data, thi phai xu ly cai data nay cai da
					// roi sau do prevent sau
					if(zInput.getValue('')!=''){
						if(eventname=='keydown')
							onkeyenterhandler();
						event.preventDefault();
					};
				};
				
				return;
			};
			// esc
			if(keycode==27){
				// boi vi trong cai thang key esc nay no cung se goi cai thang enter
				// nen phai check ky giong nhu thang enter
				// khong lam khoi khoi nhu vay duoc
				//onkeyeschandler();
				
				//console.log('>>> 27');

				if(!option.multichoice){
					// moi thu dien ra binh thuong
					onkeyeschandler();
				}
				// neu nhu la multichoice 
				else{
					onkeyeschandler();
				};
				
				return;
			};
			// backspace
			if(keycode==8){onkeybackspacehandler();return;};
			
			// other keycode (type something....)
			// if we have "input" event name, just wait for it
			if(_supportOnInputEvent && eventname=='input'){
				onkeytypehandler(true);
			}else if(eventname=='keyup'){
				onkeytypehandler(true);
			}

			// trigger event
			zOriginalInput.trigger('input');
		},
		
		onkeyupdownhandler = function(event, keycode){
			event.preventDefault();
			// turn off current highlight
			zPanelcontent.find('.'+__itemclass).removeClass(option.itemhighlightclass);
			// fix index
			if(keycode==40)currentHighlightIndex++;
			if(keycode==38)currentHighlightIndex--;
			if(currentHighlightIndex > currentResultLength)currentHighlightIndex=0;
			if(currentHighlightIndex < 0)currentHighlightIndex=currentResultLength;
			// - -
			var currentHighlightValue = '';
			if(currentHighlightIndex===0){
				currentHighlightValue = typevalue;
				setPlaceholderText(zPlaceholder, typevalueholder, typevalue);
			}
			else{
				var zItemwrap = zPanelcontent.find('.'+__itemclass+'[data-highlight="'+currentHighlightIndex+'"]'),
					zItemwrapData = zItemwrap.getData('searchtempdata');
				zItemwrap.addClass(option.itemhighlightclass);
				currentHighlightValue = zItemwrapData.text;
				setPlaceholderText(zPlaceholder, '');
			};
			// set text for input
			zInput.setValue(currentHighlightValue);
			
			// fix width cho input, set top cho panel
			// bang cach la se get ra cai thang div<input test>
			// sau do lay width cua no de ma add cho width cua thang input :))
			if(option.multichoice){
				zInput.width(zInputTestEl.setInnerHTML(zInput.getValue('')).width()+10);
				zPanel.top(zWrapperInput.height());
			};
			
			// xem coi nen lay property nao 
			if(zItemwrapData && option.usedproperty in zItemwrapData){
				zOriginalInput.setValue(zItemwrapData[option.usedproperty]);
			}else if(option.usedproperty == 'text' || option.usedpropertytext){
				zOriginalInput.setValue(typevalue);
			}
			
			// cuoi cung la fix height cho multiline
			if(option.multiline)fixheightmultiline();
			
			// move scrollbar
			zPanelscroll.scrollToElement(zItemwrap);
			// trigger event
			if(typeof zItemwrapData != 'object')return;
			zOriginalInput.trigger('ui:autosuggestion:highlight', zItemwrapData);

			// save last highlight link
			if(option.itemLinkFormat != ''){
				lastHighlightLinkByKeyUpDown = zItemwrap.getAttr('href');
			}
		},
		
		onkeyrighthandler = function(){
			if(typevalueholder=='')return;
			// set text for input
			zInput.setValue(typevalue=typevalueholder);
			
			// hide placeholder
			setPlaceholderText(zPlaceholder, typevalueholder = '');
			// set highlight
			// neu nhu dang co highlight san thi thoi, boi vi highlight uu tien cao hon
			if(currentHighlightIndex<=0)
				currentHighlightIndex = currentValueholderIndex;
			// hide panel
			zPanel.addClass('zui-panel-hide');
			
			// get ra object tuong ung voi highlight
			if(currentHighlightIndex<=0)return;
			var zItemwrapData = zPanelcontent.find('.'+__itemclass+'[data-highlight="'+currentHighlightIndex+'"]').getData('searchtempdata');
			
			// neu nhu khong tim duoc thi thoi
			if(typeof zItemwrapData != 'object')return;
			
			// neu nhu la sing le choi thi se check de fix autoheight
			if(!option.multichoice){
				if(option.multiline)fixheightmultiline();
				// xem coi nen lay property nao 
				if(zItemwrapData && option.usedproperty in zItemwrapData){
					// set text for input lai 1 lan nua cho dung luon
					usedvalue = zItemwrapData[option.usedproperty];
					typevalue = zItemwrapData[option.searchproperty];
					zInput.setValue(typevalue);
					zOriginalInput.setValue(usedvalue);
				}
			}
			// neu nhu la multichoice thi se append vao 1 cai token
			else{
				// empty text input
				zInput.setValue('').width(10);
				if(zItemwrapData && option.usedproperty in zItemwrapData){
					zjs('<div class="zui-autosuggestion-token"></div>').setInnerHTML(zItemwrapData.text).setAttr('data-value', zItemwrapData[option.usedproperty]).insertBefore(zInput);
					// fix height cho nguyen thang input
					zWrapperEl.addClass(zautosuggestionWithTokenClass);
					// set value cho original
					multichoiceSetValueForOriginalInput();
				};
			};

			// change data for <select> element
			if(selectSourceEl){
				// console.log('right', usedvalue);
				selectSourceEl.setValue(zItemwrapData.id);
			}
			
			// trigger event
			//zOriginalInput.trigger('ui:autosuggestion:highlight', zItemwrapData);
			// trigger event
			zOriginalInput.trigger('ui:autosuggestion:choice',zItemwrapData);
		},
		
		onkeyeschandler = function(){
			
			//console.log('>>>27 typevalue: '+typevalue);
			
			// set text for input
			// muc dich o day la set text go back ve voi text user go vao khi ma no show suggest panel
			// nen neu nhu ko show panel thi se khong set gi het
			if(!zPanel.hasClass('zui-panel-hide'))
				zInput.setValue(typevalue);
			
			// xem coi nen lay property nao, neu nhu su dung text
			// thi se tra lai luon cai value cho original input, con khong thi thoi
			if(option.usedproperty === 'text' || option.usedpropertytext){
				zOriginalInput.setValue(typevalue);
				if(typevalue === '')setPlaceholderText(zPlaceholder, placeholderText());
				else setPlaceholderText(zPlaceholder, typevalueholder = '');
			}
			else{
				zOriginalInput.setValue('');
			}
			
			// hide panel
			zPanel.addClass('zui-panel-hide');
			// khi ma hide thi dong thoi phai remove luon may cai item highlight
			zPanelcontent.find('.'+__itemclass).removeClass('highlight');
			// reset something
			currentHighlightIndex = 0;
			currentValueholderIndex = 0;
			
			// cuoi cung la fix height cho multiline
			if(option.multiline)fixheightmultiline();
		},
		
		onkeyenterhandler = function(){
			// save type value
			typevalue = zInput.getValue('');
			
			//console.log('typevalue', typevalue);
			
			// defailt
			var zItemwrapData = {text:typevalue};
			var _highlightItemEl = false;
			
			// phai dang show panel thi moi get item
			//if(!zPanel.hasClass('zui-panel-hide') && typevalue!=''){
			// update la khong phai la dang phai show panel thi moi lam
			// ma la dang highligh hoac dang placeholder
			if((currentValueholderIndex || currentHighlightIndex || !zPanel.hasClass('zui-panel-hide')) && typevalue!=''){
				// uu tien so 1:
				// neu nhu dang co highlight cai item nao do
				// thi cai item nay se duoc chon
				if(currentHighlightIndex>0){
					_highlightItemEl = zPanelcontent.find('.'+__itemclass+'[data-highlight="'+currentHighlightIndex+'"]');
				// uu tien so 2:
				// thang nao ma dang la holder value luon, thi se chon thang do
				}else if(currentValueholderIndex>0){
					_highlightItemEl = zPanelcontent.find('.'+__itemclass+'[data-highlight="'+currentValueholderIndex+'"]');
				// uu tien so 3:
				// thang dau tien trong list suggestion
				// nhung ma cai nay ko co choi voi text, chi choi voi id thoi
				// }else if(option.usedproperty != 'text'){
				}else if(option.usedproperty == 'id'){
					var _highlightItemEls = zPanelcontent.find('.'+__itemclass);
					if(_highlightItemEls.count()>0)
						_highlightItemEl = _highlightItemEls.item(0);
				};
				
				// okie, neu nhu co tim ra duoc highlight Item thi moi lay ra
				if(_highlightItemEl)
					zItemwrapData = _highlightItemEl.getData('searchtempdata');
			};
			
			// code dung chung cho ca truong hop Single & Multi
			
			// hide placeholder
			// can phai hide boi vi khi enter thi kha la quan trong
			// enter roi thi se khong co can cai placeholder lam gi nua
			// nhung ma trong truong hop input empty thi thoi
			if(typevalue!='')
				setPlaceholderText(zPlaceholder, typevalueholder = '');
			
			// hide panel
			zPanel.addClass('zui-panel-hide');
			
			// xem coi neu nhu khong tim ra item nao thi thoi
			// khong can phai xuong duoi trigger event gi ca
			if(typeof zItemwrapData != 'object')return;
			
			// xu ly cho truong hop singlechoice
			if(!option.multichoice){
				if(zItemwrapData){
					// hide placeholder
					setPlaceholderText(zPlaceholder, typevalueholder = '');
					// hide panel
					zPanel.addClass('zui-panel-hide');
					// set text for input
					if(option.searchproperty in zItemwrapData){
						zInput.setValue(typevalue=zItemwrapData[option.searchproperty]);
					}
					// xem coi nen lay property nao 
					if(option.usedproperty in zItemwrapData){
						zOriginalInput.setValue(zItemwrapData[option.usedproperty]);
					}
				}
			}
			// xu ly cho truong hop multichoice
			// neu nhu la multichoice thi se append vao 1 cai token
			else{
				// empty text input va phai reset thang type value nua
				zInput.setValue('').width(10);
				typevalue = '';
				
				if(zItemwrapData && option.usedproperty in zItemwrapData){
					zjs('<div class="zui-autosuggestion-token"></div>').setInnerHTML(zItemwrapData.text).setAttr('data-value', zItemwrapData[option.usedproperty]).insertBefore(zInput);
					// fix height cho thang input
					zWrapperEl.addClass(zautosuggestionWithTokenClass);
					// voi thang multichoice thi se khong can thiet placeholder
					//zPlaceholder.hide();
					// @update:
					// voi thang multichoice thi gio se fix position cho cai thang placeholder nay luon
					// de lam sao ma cho fix cam giac voi thang input
					// @todo: implement this
					//zPlaceholder.top(0).left(0);
				};
				// set value cho original
				multichoiceSetValueForOriginalInput();
			};

			// change data for <select> element
			if(selectSourceEl){
				// console.log('enter', zItemwrapData);
				selectSourceEl.setValue(zItemwrapData.id);
			}
			
			// trigger event
			zOriginalInput.trigger('ui:autosuggestion:choice',zItemwrapData);

			// handler link
			if(option.itemLinkFormat != '' && _highlightItemEl){
				var linkChoiceByEnter = _highlightItemEl.getAttr('href');
				if(linkChoiceByEnter == lastHighlightLinkByKeyUpDown){
					window.location.href = linkChoiceByEnter;
				}
			}
		},
		
		onkeybackspacehandler = function(){
			// chi co tac dung neu nhu dung multi
			if(!option.multichoice)return;
			
			// neu nhu zInput chua empty thi xu ly rieng
			if(zInput.getValue('')!=''){
				return;
			};
			
			// remove di cai token gan nhat
			zWrapperEl.find('.zui-autosuggestion-token').lastChild().remove();
			multichoiceSetValueForOriginalInput();
			
			// fix height cho thang input neu nhu khong con cai token nao
			if(zOriginalInput.getValue()==''){
				zWrapperEl.removeClass(zautosuggestionWithTokenClass);
				
				// neu nhu thang dich (original input) cung empty luon,
				// thi gio show ra default placeholder text thoi
				typevalueholder = '';
				// delay 1 xiu de ma kip update top va left
				(function(){
					zPlaceholder.top(zInput.top()).left(zInput.left()).show();
					setPlaceholderText(zPlaceholder, placeholderText());
				}).delay(80);
			};
		},
		
		onkeytypehandler = function(search){
			
			// get current input value
			var rawvalue = zInput.getValue('');
			// save type value
			typevalue = rawvalue;
			// hide cai place holder truoc cho chac
			setPlaceholderText(zPlaceholder, '');
			
			
			// day la truong hop cho single choice
			if(!option.multichoice){
				
				// noi chung check height cai da
				if(option.multiline)
					fixheightmultiline();
				
				// pass value for old input dong thoi hide placeholder
				// xem coi nen lay property nao, neu nhu su dung text
				// thi se set luon cai value cho original input, con khong thi thoi
				if(option.usedproperty == 'text' || option.usedpropertytext){
					zOriginalInput.setValue(rawvalue);
				}
				else{
					zOriginalInput.setValue('');
				}

				// show placeholder and stop
				if(rawvalue=='' || (search && rawvalue.length<option.minlength)) {
					typevalueholder = '';
					if(rawvalue!='')setPlaceholderText(zPlaceholder, '', rawvalue);
					else setPlaceholderText(zPlaceholder, placeholderText());
					zPanel.addClass('zui-panel-hide');
					return;
				};
			}
			// day la truong hop cho multichoice
			else{
				// fix width cho input
				zInput.width(zInputTestEl.setInnerHTML(rawvalue).width()+10);
			
				//console.log('onkeytypehandler - rawvalue: '+rawvalue+' zOriginalInput.getValue():'+zOriginalInput.getValue());
				
				// neu nhu khong nhap gi het, thi phai tuy tinh hinh
				// ma quyet dinh xem coi show placeholder hay la hide
				// rawvalue khong co gi het, chung to la chua co nhap
				// nhung ma dang show 1 dong token thi cung se khong duoc hien thi
				// chi co khi nao chua co token thi moi cho hien thi
				if(rawvalue==''){ /* khong nhap gi ne */
					// va dong thoi thang original (thang dich) cung empty thi return ve defautl placeholder thoi
					if(zOriginalInput.getValue()=='') 
						setPlaceholderText(zPlaceholder.show(), placeholderText());
					// con neu nhu thang dich khong co empty thi thoi, se hide di cho roi
					else 
						zPlaceholder.hide();
					
					// neu nhu rawvalue empty thi gio neu dang co cai thang highlight nao thi cung phai empty luon
					typevalueholder = '';
					setPlaceholderText(zPlaceholder, placeholderText());
					zPanel.addClass('zui-panel-hide');
					return;
				}
				//neu nhu co nhap, thi phai test de ma move cai thang placehoder cho dung vi tri
				else{
					// move place holder to fix with input
					zPlaceholder.top(zInput.top()).left(zInput.left()).show();
					// va chi can move thoi, xiu nua xuong ben duoi thi se search va replace dung placeholder
				};
				
				
				//if(rawvalue=='' && zOriginalInput.getValue()=='')
				// khong lien quan gio thoi cai thang zOriginalInput het tron
				//if(rawvalue=='')
				//	setPlaceholderText(zPlaceholder.show(), placeholderText());
				//else 
				//	zPlaceholder.hide();
				// @todo:
				// need to fix it

			};
			
			
			// start search
			if(!search)return;

			// neu nhu dang khong enable autosuggest thi thoi
			if(!IS_ENABLE_AUTOSUGGESTION)return;
			
			// reset highlight
			currentHighlightIndex = 0;
			// reset valueholder
			typevalueholder = '';
			currentValueholderIndex = 0;
			
			// start asynchronies search
			zOriginalInput.trigger('ui:autosuggestion:beforesearch', {'value': rawvalue});
			zOriginalInput.getData(dictionarykey).asyncSearch(rawvalue, function(result){
				
				zOriginalInput.trigger('ui:autosuggestion:searchresult', {'value': rawvalue, result: result});

				// neu nhu khong tim ra ket qua, 
				// hoac nhieu khi search ajax tuc la da type xong tu khoa ra token
				// nhung ma ajax return data cham hon
				// cho nen phai check input xem coi co can thiet show suggestion ra khong?
				typevalue = zInput.getValue();
				if(typevalue===''){
					setPlaceholderText(zPlaceholder, placeholderText());
				}
				if(result.length===0 || typevalue===''){
					zPanel.addClass('zui-panel-hide');
					return;
				};
			
				// get current result length
				currentResultLength = result.length;
			
				// set panel top va sau do show len
				zPanel.removeClass('zui-panel-hide').top(zWrapperInput.height());
			
				// clean all item
				zPanelcontent.setInnerHTML('');
			
				// count 
				var allItemHeight = 0;
			
				zjs.eachItem(result, function(item, i){
				
					// tao ra 1 itemwrap moi
					// var zItemwrap = zjs(__htmlitemtpl).appendTo(zPanelcontent);
					// save item data vao luon
					// zItemwrap.setData('searchtempdata', item);
					// zItemwrap.setAttr('data-highlight', i+1);
				
					// sau do se format data va cho vao luon
					// var iteminnerhtml = '';
					// if(typeof option.itemtemplate == 'function')iteminnerhtml = option.itemtemplate(item);
					// if(typeof option.itemtemplate == 'string')iteminnerhtml = option.itemtemplate;
					// if(typeof iteminnerhtml == 'string')iteminnerhtml = iteminnerhtml.format(item);
				
					// var zItem = zjs(iteminnerhtml).appendTo(zItemwrap);
					
					var zItemwrap = createHighlightItem(option, zPanelcontent, item, i);
				
					allItemHeight+= zItemwrap.height();
				
					// bind event cho thang nho nay luon
					zItemwrap.hover(onmousehoveritemhandler);
					zItemwrap.click(onmouseclickitemhandler);
				
					// test placeholder
					if(typevalueholder=='' && item.text.indexOf(rawvalue)==0){
						typevalueholder = item.text;
						currentValueholderIndex = i+1;
					};
				
				});
			
				// set placeholder
				setPlaceholderText(zPlaceholder, typevalueholder, rawvalue);
			
				//sau do se thay doi height cua panel
				changePanelHeight(allItemHeight);
				
			});
			
		};
		
		// END HANDLER FUNCTIONs
		// ------------------------
		
		
		// save function nay luon
		zOriginalInput.setData(keytypehandlerkey, onkeytypehandler);
		
		// HANDLER EVENT CHO MAY CAI HIGHLIGHT ITEM
		// --------------
		var onmousehoveritemhandler = function(event){
			// turn off current highlight
			zPanelcontent.find('.'+__itemclass).removeClass(option.itemhighlightclass);
			var zItemwrapData = zjs(this).addClass(option.itemhighlightclass).getData('searchtempdata');
			// trigger event
			if(typeof zItemwrapData != 'object')return;
			zOriginalInput.trigger('ui:autosuggestion:highlight', zItemwrapData);
		},
		
		onmouseclickitemhandler = function(event){
			var zItemwrap = zjs(this),
				zItemwrapData = zItemwrap.getData('searchtempdata');
				
			// xem coi neu nhu khong search ra item nao thi thoi
			if(typeof zItemwrapData != 'object')return;
			// save type value
			typevalue = zItemwrapData.text;
			// set text for input
			zInput.setValue(typevalue);
			
			// neu nhu la multichoice thi se append vao 1 cai token
			if(option.multichoice){
				// empty text input
				zInput.setValue('').width(10);
				if(zItemwrapData && option.usedproperty in zItemwrapData){
					zjs('<div class="zui-autosuggestion-token"></div>').setInnerHTML(zItemwrapData.text).setAttr('data-value', zItemwrapData[option.usedproperty]).insertBefore(zInput);
					// fix height cho thang input
					zWrapperEl.addClass(zautosuggestionWithTokenClass);
					// set value cho original
					multichoiceSetValueForOriginalInput();
				};
			}else{
				// xem coi nen lay property nao 
				if(zItemwrapData && option.usedproperty in zItemwrapData)
				zOriginalInput.setValue(zItemwrapData[option.usedproperty]);
				// fix multiline luon
				if(option.multiline)fixheightmultiline();
			};

			// change data for <select> element
			if(selectSourceEl){
				// console.log('click', zItemwrapData);
				selectSourceEl.setValue(zItemwrapData.id);
			}
			
			// set highlight
			currentHighlightIndex = zItemwrap.getAttr('data-highlight',0).toInt();
			// hide placeholder
			setPlaceholderText(zPlaceholder, typevalueholder = '');
			// hide panel
			zPanel.addClass('zui-panel-hide');
			// input focus
			zInput.focus();
			// trigger event
			zOriginalInput.trigger('ui:autosuggestion:choice',zItemwrapData);
		};
		// end handler
		// --------------------
		
		
		// ham giup get ra value cua original input
		// khi su dung multichoice
		var multichoiceSetValueForOriginalInput = function(){
			var values = [];
			zWrapperEl.find('.zui-autosuggestion-token').eachElement(function(elem){
				values.push(zjs(elem).getAttr('data-value',''));
			});
			zOriginalInput.setValue(values.join(','));
		};
		
		
		// ham giup fix height cho cai textarea
		var fixheightmultiline = function(){
			zEstimateHeightEl.setInnerHTML(zInput.getValue());
			var height = Math.max(zEstimateHeightEl.height(), option.minheight);
			zInput.height(height);
			// fix height xong roi thi cung move thang suggestion panel thoi
			if(!zPanel.hasClass('zui-panel-hide'))zPanel.top(zWrapperInput.height());
		};
		// bind event cho window resize luon
		if(option.multiline){
			zjs(window).on('resize', fixheightmultiline);
			// first fix luon
			fixheightmultiline.delay(1);
		};
		
		
		// BIND EVENT
		// ----------
		// xong het roi thi bind event vao luon
		// html5 da ho tro oninput, nen chi can test
		// neu trinh duyet da support thi chi can oninput la du
		if(_supportOnInputEvent)
			zInput.on('keydown',function(event,element){onkeyhandler(event, 'keydown')})
					.on('input',function(event,element){onkeyhandler(event, 'input')});
		else
			zInput.on('keydown',function(event,element){onkeyhandler(event, 'keydown')})
					.on('keypress',function(event,element){onkeyhandler(event, 'keypress')})
					.on('keyup',function(event,element){onkeyhandler(event, 'keyup')})
					.on('mouseup',function(event,element){onkeyhandler(event, 'keyup')});
		// 
		zInput.on('blur', function(event){zOriginalInput.trigger('ui:autosuggestion:blur')});
		
		// khi cai thang wrapper input click vao thi se auto focus cai thang input luon
		zWrapperInput.on('click', function(){
			zInput.focus();
		});



		// FORWARD EVENT
		// -------------
		// qua cho thang original input
		var _fakeFocus = false;

		// redirect input focus
		zOriginalInput.on('focus', function(){
			if(!_fakeFocus)zInput.focus();
		});
		
		// bind event focus de add css vao
		zInput.on('focus', function(){
			zWrapperEl.addClass(zautosuggestionFocusClass);

			_fakeFocus = true;
			zOriginalInput.trigger('focus');
			_fakeFocus = false;
		}).on('blur', function(){
			zWrapperEl.removeClass(zautosuggestionFocusClass);

			// support <select> element
			if(selectSourceEl){
				if(zInput.getValue().trim() === ''){
					selectSourceEl.setValue(option.noneValue);
				}
			}

			zOriginalInput.trigger('blur');
		}).on('keyup', function(){
			zOriginalInput.trigger('keyup');
		});
		// auto focus new input?
		if(option.autofocus)
			zInput.focus();

		// END Forward
		
		
		// xem coi co option cho chon khi focus vao thi se show ra luon suggestion khong
		// neu co thi gio phai bind event
		if(option.focusshowsuggestion){
			//zInput.on('focus', function(event){
			zWrapperInput.on('click', function(event){
				
				// xem coi neu nhu dang co type cai gi do roi thi se khong show suggestino nua
				if(typevalue != '')
					return;
				
				// xem coi la click vao cai thang nao trong day?
				// neu nhu ma click vao may cai token thi thoi, bo qua
				var _targetClickEl = event.getTarget();
				if(zjs(_targetClickEl).hasClass('zui-autosuggestion-token'))
					return;
				
				// tot nhat la phai delay 1 chut
				(function(){
					//console.log('focus');
					
					var result = zOriginalInput.getData(dictionarykey).search('');
					if(result.length==0)
						return;
			
					// get current result length
					currentResultLength = result.length;
			
					// set panel top va sau do show len
					zPanel.removeClass('zui-panel-hide').top(zWrapperInput.height());
			
					// clean all item
					zPanelcontent.setInnerHTML('');
			
					// count 
					var allItemHeight = 0;
					
					zjs.eachItem(result, function(item, i){
				
						// tao ra 1 itemwrap moi
						// var zItemwrap = zjs(__htmlitemtpl).appendTo(zPanelcontent);
						// save item data vao luon
						// zItemwrap.setData('searchtempdata', item);
						// zItemwrap.setAttr('data-highlight', i+1);
				
						// sau do se format data va cho vao luon
						// var iteminnerhtml = '';
						// if(typeof option.itemtemplate == 'function')iteminnerhtml = option.itemtemplate(item);
						// if(typeof option.itemtemplate == 'string')iteminnerhtml = option.itemtemplate;
						// if(typeof iteminnerhtml == 'string')iteminnerhtml = iteminnerhtml.format(item);
				
						// var zItem = zjs(iteminnerhtml).appendTo(zItemwrap);
						
						var zItemwrap = createHighlightItem(option, zPanelcontent, item, i);
				
						allItemHeight+= zItemwrap.height();
				
						// bind event cho thang nho nay luon
						zItemwrap.hover(onmousehoveritemhandler);
						zItemwrap.click(onmouseclickitemhandler);
					});
			
					//sau do se thay doi height cua panel
					changePanelHeight(allItemHeight);
					
				}).delay(100);
			});
		};
		
		
		zjs(document).on('click', function(event){
			// hide panel
			zPanel.addClass('zui-panel-hide');
		});
		
		
		// event khi click vao token
		if(option.multichoice){
			zWrapperInput.on('click', '.zui-autosuggestion-token', function(event){
				// stop event lai de khoi bi thanh cai event click to input => auto show suggest panel
				//event.stop();
				
				// remove cai token nay thoi
				this.remove();
				multichoiceSetValueForOriginalInput();
				
				
				// fix height cho thang input neu nhu khong con cai token nao
				if(zOriginalInput.getValue()==''){
					zWrapperEl.removeClass(zautosuggestionWithTokenClass);

					// neu nhu thang dich (original input) cung empty luon,
					// thi gio show ra default placeholder text thoi
					if(typevalue == ''){
						typevalueholder = '';
						setPlaceholderText(zPlaceholder, placeholderText());
					};
				};
				
				// fix top left cho cai thang placeholder
				// delay 1 xiu de ma kip update top va left
				(function(){
					zPlaceholder.show().top(zInput.top()).left(zInput.left());
				}).delay(50);
			});
		};
		
		
		// ------------------------------------------------------------------------------------------------
		// FOR MULTI CHOICE MODE
		// ------------------------------------------------------------------------------------------------
		
		// show ra nhung cai token default
		// va phai use cai property la id hoac la text thi moi duoc
		if(option.multichoice && typevalue!='' && (option.usedproperty=='id' || option.usedproperty=='text')){
			if(option.usedproperty=='id'){
				zjs.eachItem(typevalue.split(/\s*,\s*/), function(_dataid){
					dictionary.asyncGetItemById(_dataid, function(zItemwrapData){
						if(!zItemwrapData)return;
						zjs('<div class="zui-autosuggestion-token"></div>').setInnerHTML(zItemwrapData.text).setAttr('data-value', zItemwrapData[option.usedproperty]).insertBefore(zInput);
						// set value cho original (phai lam sau khi async)
						multichoiceSetValueForOriginalInput();
					});
				});
			}else if(option.usedproperty=='text'){
				zjs.eachItem(typevalue.split(/\s*,\s*/), function(_text){
					// thu co gang search 
					dictionary.asyncSearch(_text, function(_itemsdata){
						// lay thang ket qua dau tien
						if(_itemsdata.length<=0)return;
						var zItemwrapData = _itemsdata[0];
						zjs('<div class="zui-autosuggestion-token"></div>').setInnerHTML(zItemwrapData.text).setAttr('data-value', zItemwrapData[option.usedproperty]).insertBefore(zInput);
						// set value cho original (phai lam sau khi async)
						multichoiceSetValueForOriginalInput();
					});
				});
			};
			// fix height cho nguyen thang input
			zWrapperEl.addClass(zautosuggestionWithTokenClass);
			// sau do phai empty het cai current input
			zInput.setValue(typevalue = '');
			// hide placeholder
			zPlaceholder.hide();
		};
		
		// DONE!
		
		// - - -
	},
	
	// help to create highlight item 
	createHighlightItem = function(option, zPanelcontent, item, i){
		// tao ra 1 itemwrap moi
		var zItemwrap;
		if(option.itemLinkFormat != ''){
			// option itemLinkFormat support "function"
			var _itemLinkFormat = zjs.isFunction(option.itemLinkFormat) ? option.itemLinkFormat(item) : option.itemLinkFormat;
			zItemwrap = zjs(__htmlitemlinktpl).setAttr('href', _itemLinkFormat.format(item));
		}
		else{
			zItemwrap = zjs(__htmlitemtpl);
		}
		zItemwrap.appendTo(zPanelcontent);

		// save item data vao luon
		zItemwrap.setData('searchtempdata', item);
		zItemwrap.setAttr('data-highlight', i+1);
	
		// sau do se format data va cho vao luon
		var iteminnerhtml = '';
		if(typeof option.itemtemplate == 'function')iteminnerhtml = option.itemtemplate(item);
		if(typeof option.itemtemplate == 'string')iteminnerhtml = option.itemtemplate;
		if(typeof iteminnerhtml == 'string')iteminnerhtml = iteminnerhtml.format(item);
	
		var zItem = zjs(iteminnerhtml).appendTo(zItemwrap);
	
		// allItemHeight+= zItemwrap.height();
	
		// bind event cho thang nho nay luon
		// zItemwrap.hover(onmousehoveritemhandler);
		// zItemwrap.click(onmouseclickitemhandler);
		
		return zItemwrap;
	},

	isAutosuggestion = function(element){
		return !!zjs(element).getData(dictionarykey);
	},

	// ham giup add index vao trong suggestion
	autosuggestionAddindex = function(element, raw){
		
		// >>> test
		//console.log('autosuggestionAddindex: ', element, raw);
		
		var zOriginalInput = zjs(element),
			dictionary = zOriginalInput.getData(dictionarykey),
			option = zOriginalInput.getData(optionkey);
			
		// neu nhu khong co dictionary thi 
		// chung to day khong phai la mot autosuggestion
		if(!dictionary)return;
		
		// >>> test
		//console.log('dictionary ', dictionary);
		
		// set
		dictionary.addIndex(raw, option.searchproperty);
		
		// >>> test
		//console.log('ok');
	},
	
	// ham giup remove index
	autosuggestionRemoveindex = function(element, query, confirmdel){
		
		var zOriginalInput = zjs(element),
			dictionary = zOriginalInput.getData(dictionarykey);
			
		// neu nhu khong co dictionary thi 
		// chung to day khong phai la mot autosuggestion
		if(!dictionary)return;
		
		// remove
		dictionary.removeIndex(query, confirmdel);
	},
	autosuggestionResetIndex = function(element){
		
		var zOriginalInput = zjs(element),
			dictionary = zOriginalInput.getData(dictionarykey);
			
		// neu nhu khong co dictionary thi 
		// chung to day khong phai la mot autosuggestion
		if(!dictionary)return;
		
		// remove
		dictionary.resetIndex();
	},
	
	// ham giup focus
	autosuggestionFocus = function(element){
		
		var zOriginalInput = zjs(element),
			zWrapperInput = zOriginalInput.getData(wrapinputelkey);
			
		// neu nhu khong co zWrapperInput thi 
		// chung to day khong phai la mot autosuggestion
		if(!zWrapperInput){
			zOriginalInput.focus();
			return;
		}
		
		// chi can trigger event click cua thang wrapper
		// la thang input se tu dong focus thoi
		zWrapperInput.trigger('click');
	},
	

	// help function to render to placeholder element
	setPlaceholderText = function(pelm, text, hidetext){
		text = text || '';
		hidetext = hidetext || '';
		if(hidetext && text){
			text = text.replace(hidetext, '<span class="_hide">'+hidetext+'</span>');
		}
		pelm.setInnerHTML(text);
	};

	
	// - - - -
	// extend method cho zjs-instance
	zjs.extendMethod({
		isAutosuggestion: function(){
			return isAutosuggestion(this.item(0,1));
		},
		makeAutosuggestion: function(useroption){
			return this.eachElement(function(element){makeAutosuggestion(element, useroption)});
		},
		autosuggestionAddindex: function(raw){
			// >>> test
			//console.log('autosuggestionAddindex: ', raw);
			return this.eachElement(function(element){autosuggestionAddindex(element, raw)});
		},
		autosuggestionRemoveindex: function(query, confirmdel){
			return this.eachElement(function(element){autosuggestionRemoveindex(element, query, confirmdel)});
		},
		autosuggestionResetIndex: function(){
			return this.eachElement(function(element){autosuggestionResetIndex(element)});
		},
		autosuggestionFocus: function(){
			return this.eachElement(function(element){autosuggestionFocus(element)});
		},
		
		// make lai phuong thuc setValue mac dinh cua zjs
		autosuggestionSetValue: function(val, autosearch){
			val = val || '';
			return this.eachElement(function(element){
				// xem coi day co phai la 1 autosuggest input hay khong
				var inputEl = zjs(element).getData(newinputkey);
				if(inputEl){
					try{
						inputEl.value = val;
						// bat dau search luon;
						zjs(element).getData(keytypehandlerkey)(autosearch || false);
					}catch(er){};
				}
				// fallback to default input
				else{
					zjs(element).setValue(val);
				}
			});
		},
		autosuggestionDisable: function(surehuh){
			surehuh = surehuh || false;
			return this.eachElement(function(element){
				// xem coi day co phai la 1 autosuggest input hay khong
				var inputEl = zjs(element).getData(newinputkey),
					zWrapperEl = zjs(element).getData(wrapelkey);
				if(inputEl)try{
					inputEl.disabled = surehuh;
					if(surehuh)zWrapperEl.addClass('disabled');else zWrapperEl.removeClass('disabled');
				}catch(er){};
			});
		}
		
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zautosuggestion ko, neu nhu co thi se auto makeAutosuggestion luon
			zjs(el).find('.zautosuggestion').makeAutosuggestion();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zautosuggestion ko, neu nhu co thi se auto makeAutosuggestion luon
			if(zjs(el).is('.zautosuggestion'))zjs(el).makeAutosuggestion();
			zjs(el).find('.zautosuggestion').makeAutosuggestion();
		}
	});
	
	// AUTO INIT
	zjs(function(){zjs('.zautosuggestion').makeAutosuggestion();});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.autosuggestion');

});