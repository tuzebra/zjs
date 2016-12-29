// extend module Auto suggestion cho zjs
zjs.require('scrollbar', function(){"use strict";
	
	var newinputkey = 'zjsmoduleautosuggestionnewinput',
		optionkey = 'zjsmoduleautosuggestionoption',
		dictionarykey = 'zjsmoduleautosuggestiondictionary',
		keytypehandlerkey = 'zjsmoduleautosuggestionkeytype';
	
	// - - - -
	// class giup tao ra 1 dictionary lookup
	var zDictionary = function(source){
	
		// luu giu data
		this.datas = [];
		this.lastSearchIndexs = [];
	
		// index dictionary la 1 array chua cac array
		// moi array con co key la keyword luon, va 
		// data la cac index ma keyword do ton tai
		this.indexDictionary = [];
		
		// index word la 1 array chua cac keyword
		// muc dich la de giup xac dinh nhanh coi
		// keyword nhap vao co ton tai trong data
		// hay khong
		this.indexWord = [];
		
		// - - -
		// create index keyword
		
		// bat dau create index...
		this.addIndex(source);
		
		return this;
	};
	
	zDictionary.prototype.addIndex = function(raw){
		
		// khong lam gi het
		if(typeof raw == 'undefined' || typeof raw == 'function')return this;
		
		// - -
		// de quy, trong truong hop truyen vao array
		if(raw.constructor === Array){
			for(var i=0;i<raw.length;i++)
				this.addIndex(raw[i]);
			return this;
		};
		
		// - -
		// con lai thi lam binh thuong
		
		// neu data truyen vao la object
		var text = '', data = new Object();
		if(typeof raw == 'string')text = raw;
		if(typeof raw == 'object'){text = raw.text || '';data = raw;};
		
		// luu vao instance object
		this.datas.push(zjs.extend(data, {text:text.toString()}));
		
		// get ra index
		var index = this.datas.length-1;
		
		// bat dau phan tich de lam
		text = text.toString().removeVietnameseCharacter().toLowerCase();
		
		// tach text thanh nhieu tu
		var words = text.split(' '),word = '';
		for(i=0;i<words.length;i++){
			word = words[i];
			if(typeof this.indexDictionary[word] == 'undefined' || this.indexDictionary[word].constructor !== Array){
				this.indexDictionary[word] = [];
				this.indexWord.push(word);
			};
			this.indexDictionary[word].push(index);
		};
		
		// done!
		return this;
	};
	
	zDictionary.prototype.removeIndex = function(query, confirmdel){
		
		// fix arguments
		if(typeof query != 'string')query='';
		if(typeof confirmdel != 'function')confirmdel=function(){return true};
		
		// dau tien la di search
		var result = this.search(query);
		
		// sau do di lap tren tung thang va xoa thoi
		var i, index;
		for(i=0;i<this.lastSearchIndexs.length;i++){
			index = this.lastSearchIndexs[i];
			if(confirmdel(this.datas[index])===true)this.datas[index]=null;
		};
			
		// done!
		return this;
	};
	
	zDictionary.prototype.search = function(rawquery){
	
		// dau tien la xoa dau Tieng Viet trong query
		var query = rawquery.removeVietnameseCharacter().toLowerCase();
		
		// cai nay se la ket qua coi thang element nao dc chon
		var resultIndexs = [];
		
		// dau tien se tach input ra thanh nhieu phan
		var words = query.split(' ');
		
		var i,j,k,word,keywords,resultIndexsTemp,resultIndexsMerge,indextemp;
		
		// gio se tien hanh search tren tung thang
		for(i=0;i<words.length;i++){
			
			// reset temp variable
			word = words[i];
			resultIndexsTemp = [];
			resultIndexsMerge = [];
			
			// gio se thu thap cac keyword thoa man word nay
			keywords = [];
			for(j=0;j<this.indexWord.length;j++)if(this.indexWord[j].indexOf(word)>=0)keywords.push(this.indexWord[j]);
			
			// sau khi thu thap keyword xong thi se di search tren keyword
			for(j=0;j<keywords.length;j++)
				for(k=0;k<this.indexDictionary[keywords[j]].length;k++)
					resultIndexsTemp[this.indexDictionary[keywords[j]][k].toString()] = true;
			
			// sau khi co index temp thi minh se merge voi index
			for(var index in resultIndexsTemp)
				if((i==0 || index in resultIndexs) && typeof resultIndexsTemp[index] != 'function')
					resultIndexsMerge[index] = true;
			
			// merge xong se ghi de
			resultIndexs = resultIndexsMerge;
			
		};
		// end search 1 word
		
		// reset last search index
		this.lastSearchIndexs = [];
		
		// convert to return
		var returnIndexs = [];
		for(index in resultIndexs)if(resultIndexs[index]===true && index in this.datas && this.datas[index] != null){returnIndexs.push(this.datas[index]);this.lastSearchIndexs.push(index);};
		
		// done!
		return returnIndexs;
	};
	// end class
	
	
	// - - - -
	// extend method cho zjs-instance
	zjs.extendMethod({
		autosuggestionAddindex: function(raw){
	
			this.each(function(element){
				zjs(element).getData(dictionarykey).addIndex(raw);
			});
			
			// zjs syntax!
			return this;
		},
		autosuggestionRemoveindex: function(query, confirmdel){
			
			this.each(function(element){
				zjs(element).getData(dictionarykey).removeIndex(query, confirmdel);
			});
			
			// zjs syntax!
			return this;
		},
		makeAutosuggestion: function(useroption){
			
			var defaultoption = {
				minlength: 1,
				customcss: false,
				panelmaxheight: 200,
				source: [],
				itemtemplate: '<div class="item">${text}</div>',
				itemhighlightclass: 'highlight',
				onHighlight: function(data){},
				onEnter: function(data){}
			};
			
			// do each
			this.each(function(element){
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
				
				// - - - 
				// neu ma chua co thi se lam binh thuong
				
				// copy option tu default option
				option = zjs.clone(defaultoption);
				
				// extend from inline option ?
				var inlineoption = zOriginalInput.getAttr('data-option', '');
				if(zjs.isString(inlineoption) && inlineoption.trim()!='')
					option = zjs.extend(option, inlineoption.jsonDecode());
				
				// extend from user option ?
				if(typeof useroption!='undefined')
					option = zjs.extend(option, useroption);
				
				// fix option
				if(option.minlength<1)option.minlength=1;
				
				// save option
				zOriginalInput.setData(optionkey, option);
				
				
				// - - - -
				// init element
				var __htmltpl = '<div class="zui-autosuggestion-wrap">'+
									'<div class="zui-autosuggestion-inputwrap">'+
										'<div class="zui-autosuggestion-placeholder"></div>'+
										'<input type="text" class="zui-autosuggestion-input" autocomplete="off" style="position:absolute;padding:0;margin:0;border:0;outline:none;background:transparent;" />'+
									'</div>'+
									'<div class="zui-autosuggestion-panel-wrap">'+
										'<div class="zui-autosuggestion-panel-scroll">'+
											'<div class="zui-autosuggestion-panel-content">'+
											'</div>'+
										'</div>'+
									'</div>'+
								'</div>';
				
				var __itemclass = 'zui-autosuggestion-item',
					__htmlitemtpl = '<div class="'+__itemclass+'"></div>';
				
				var zWrapper = zjs(__htmltpl).insertAfter(zOriginalInput),
					zWrapperInput = zWrapper.find('.zui-autosuggestion-inputwrap'),
					zPlaceholder = zWrapper.find('.zui-autosuggestion-placeholder'),
					zInput = zWrapper.find('.zui-autosuggestion-input').focus(),
					zPanel = zWrapper.find('.zui-autosuggestion-panel-wrap'),
					zPanelscroll = zWrapper.find('.zui-autosuggestion-panel-scroll'),
					zPanelcontent = zWrapper.find('.zui-autosuggestion-panel-content');
				
				// save new input
				zOriginalInput.setData(newinputkey, zInput.item(0,true));
				
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
			
				// set height panel
				zPanel.height(option.panelmaxheight);
				// make scrollbar xong moi hide
				zPanelscroll.makeScrollbar({bounce:false,usekey:false});
				zPanel.hide();
				
				// function giup thay doi height cua panel
				var changePanelHeight = function(height){
					var toheight = Math.min(height, option.panelmaxheight);
					zPanel.height(toheight);
					zPanelscroll.scrollHeight(toheight).scrollToTop();
				};
				
				
				// end init element
				// - - - -
			
				// - - - -
				// set placeholder text
				var placeholderText = zOriginalInput.getAttr('placeholder'),
					// luu lai coi dang chon thang nao
					currentHighlightIndex = 0, 
					currentResultLength = 0, 
					typevalue = '',
					typevalueholder = '',
					currentValueholderIndex = 0;
				
				zPlaceholder.html(placeholderText);
				
				// - - - -
				// hide old input
				//zOriginalInput.hide();
				zOriginalInput.setAttr({type:'hidden',autocomplete:'off'});
				if(zOriginalInput.getValue('')!=''){
					zInput.setValue(typevalue = zOriginalInput.getValue(), true);
					zPlaceholder.html('');
				};
				
				// - - - -
				// index data source to search
				zOriginalInput.setData(dictionarykey, new zDictionary(option.source));
				
				// - - - -
				// handler onkey make change
				var onkeyhandler = function(event, eventname){
					// refresh option truoc khi lam
					refreshOptionFn();
					// de xem no lam cai tro gi
					var keycode = event.keyCode();
					// up/down
					if(keycode==38||keycode==40){if(eventname=='keydown')onkeyupdownhandler(event, keycode);return;};
					// left
					if(keycode==37){return;};
					// right / tab
					if(keycode==39||keycode==9){if(eventname=='keydown')onkeyrighthandler();return;};
					// enter
					if(keycode==13){if(eventname=='keydown')onkeyenterhandler();return;};
					// esc
					if(keycode==27){onkeyeschandler();return;};
					
					// type something....
					onkeytypehandler(eventname=='keyup'||eventname=='input');
				};
				
				var onkeyupdownhandler = function(event, keycode){
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
					if(currentHighlightIndex==0){
						currentHighlightValue = typevalue;
						zPlaceholder.html(typevalueholder);
					}
					else{
						var zItemwrap = zPanelcontent.find('.'+__itemclass+'[data-highlight='+currentHighlightIndex+']'),
							zItemwrapData = zItemwrap.getData('searchtempdata');
						zItemwrap.addClass(option.itemhighlightclass);
						currentHighlightValue = zItemwrapData.text;
						zPlaceholder.html('');
					};
					// set text for input
					zInput.setValue(currentHighlightValue, true);
					zOriginalInput.setValue(currentHighlightValue, true);
					// move scrollbar
					zPanelscroll.scrollToElement(zItemwrap);
					// trigger event
					if(typeof zItemwrapData != 'object')return;
					zOriginalInput.trigger('autosuggestion.highlight', zItemwrapData);
					// call callback ?
					if(typeof option.onHighlight == 'function')option.onHighlight(zItemwrapData);
				};
				
				var onkeyrighthandler = function(){
					if(typevalueholder=='')return;
					// set text for input
					zInput.setValue(typevalue=typevalueholder, true);
					zOriginalInput.setValue(typevalueholder, true);
					// hide placeholder
					zPlaceholder.html(typevalueholder='');
					// set highlight
					currentHighlightIndex = currentValueholderIndex;
					// hide panel
					zPanel.hide();
					// trigger event
					if(currentValueholderIndex<=0)return;
					var zItemwrapData = zPanelcontent.find('.'+__itemclass+'[data-highlight='+currentValueholderIndex+']').getData('searchtempdata');
					if(typeof zItemwrapData != 'object')return;
					zOriginalInput.trigger('autosuggestion.highlight', zItemwrapData);
					// call callback ?
					if(typeof option.onHighlight == 'function')option.onHighlight(zItemwrapData);
				};
				
				var onkeyeschandler = function(){
					// set text for input
					zInput.setValue(typevalue, true);
					zOriginalInput.setValue(typevalue, true);
					// the same with on enter
					onkeyenterhandler();
				};
				
				var onkeyenterhandler = function(){
					var zItemwrapData = {text:typevalue};
					if(currentHighlightIndex>0)zItemwrapData = zPanelcontent.find('.'+__itemclass+'[data-highlight='+currentHighlightIndex+']').getData('searchtempdata');
					// save type value
					typevalue = zInput.getValue('');
					// reset highlight
					//currentHighlightIndex = 0;
					// hide placeholder
					zPlaceholder.html(typevalueholder='');
					// hide panel
					zPanel.hide();
					// trigger event
					if(typeof zItemwrapData != 'object')return;
					zOriginalInput.trigger('autosuggestion.choice',zItemwrapData);
					// call callback ?
					if(typeof option.onEnter == 'function')option.onEnter(zItemwrapData);
				};
				
				var onkeytypehandler = function(search){
					// get current input value
					var rawvalue = zInput.getValue('');
					
					// pass value for old input
					zOriginalInput.setValue(rawvalue, true);
					
					// save type value
					typevalue = rawvalue;
					
					// show placeholder and stop
					if(rawvalue=='' || rawvalue.length<option.minlength){
						typevalueholder = '';
						if(rawvalue!='')zPlaceholder.html('');
						else zPlaceholder.html(placeholderText);
						zPanel.hide();
						return;
					};
					
					// start search
					if(!search)return;
					
					// reset highlight
					currentHighlightIndex = 0;
					// reset valueholder
					typevalueholder = '';
					currentValueholderIndex = 0;
					
					// start search
					var result = zOriginalInput.getData(dictionarykey).search(rawvalue);
					
					if(result.length==0){
						zPlaceholder.html('');
						zPanel.hide();
						return;
					};
					
					// get current result length
					currentResultLength = result.length;
					
					zPanel.show();
					
					// clean all item
					zPanelcontent.html('');
					
					// count 
					var allItemHeight = 0;
					
					result.each(function(item, i){
						
						// tao ra 1 itemwrap moi
						var zItemwrap = zjs(__htmlitemtpl).appendTo(zPanelcontent);
						// save item data vao luon
						zItemwrap.setData('searchtempdata', item);
						zItemwrap.setAttr('data-highlight', i+1);
						
						// sau do se format data va cho vao luon
						var iteminnerhtml = '';
						if(typeof option.itemtemplate == 'function')iteminnerhtml = option.itemtemplate(item);
						if(typeof option.itemtemplate == 'string')iteminnerhtml = option.itemtemplate;
						if(typeof iteminnerhtml == 'string')iteminnerhtml = iteminnerhtml.format(item);
						
						var zItem = zjs(iteminnerhtml).appendTo(zItemwrap);
						
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
					
					// show placeholder
					zPlaceholder.html(typevalueholder);
					
					//sau do se thay doi height cua panel
					changePanelHeight(allItemHeight);
				};
				
				// save function nay luon
				zOriginalInput.setData(keytypehandlerkey, onkeytypehandler);
				
				
				var onmousehoveritemhandler = function(event, element){
					// turn off current highlight
					zPanelcontent.find('.'+__itemclass).removeClass(option.itemhighlightclass);
					var zItemwrapData = zjs(element).addClass(option.itemhighlightclass).getData('searchtempdata');
					// trigger event
					if(typeof zItemwrapData != 'object')return;
					zOriginalInput.trigger('autosuggestion.highlight', zItemwrapData);
					// call callback ?
					if(typeof option.onHighlight == 'function')option.onHighlight(zItemwrapData);
				};
				
				var onmouseclickitemhandler = function(event, element){
					var zItemwrap = zjs(element),
						zItemwrapData = zItemwrap.getData('searchtempdata');
					if(typeof zItemwrapData != 'object')return;
					// save type value
					typevalue = zItemwrapData.text;
					// set text for input
					zInput.setValue(typevalue, true);
					zOriginalInput.setValue(typevalue, true);
					// set highlight
					currentHighlightIndex = zItemwrap.getAttr('data-highlight',0).toInt();
					// hide placeholder
					zPlaceholder.html(typevalueholder='');
					// hide panel
					zPanel.hide();
					// input focus
					zInput.focus();
					// trigger event
					zOriginalInput.trigger('autosuggestion.choice',zItemwrapData);
					// call callback ?
					if(typeof option.onEnter == 'function')option.onEnter(zItemwrapData);
				};
				// end handler
				
				// bind event
				// html5 da ho tro oninput, nen chi can test
				// neu trinh duyet da support thi chi can oninput la du
				if('oninput' in document.createElement('input'))
					zInput.on('keydown',function(event,element){onkeyhandler(event, 'keydown');})
							.on('input',function(event,element){onkeyhandler(event, 'input');});
				else
					zInput.on('keydown',function(event,element){onkeyhandler(event, 'keydown');})
							.on('keypress',function(event,element){onkeyhandler(event, 'keypress');})
							.on('keyup',function(event,element){onkeyhandler(event, 'keyup');})
							.on('mouseup',function(event,element){onkeyhandler(event, 'keyup');});
				
				zWrapperInput.click(function(){
					zInput.focus();
				});
				
				zjs(document).click(function(){
					// hide panel
					zPanel.hide();
				});
				// done!
				
			});
			// end each
			
			// tuan thu theo 
			// cu phap cua zjs
			// return this!
			return this;
		},
		
		// make lai phuong thuc setValue mac dinh cua zjs
		setValue: function(val, notautosuggest){
			if(typeof val == 'undefined')val='';
			this.each(function(element){
				// lam nhu binh thuong
				try{element.value = val;}catch(er){};
				
				if(typeof notautosuggest == 'undefined'){
					// xem coi day co phai la 1 autosuggest input hay khong
					var inputEl = zjs(element).getData(newinputkey);
					if(inputEl)try{
						inputEl.value = val;
						var onkeytypehandler = zjs(element).getData(keytypehandlerkey);
						// bat dau search luon;
						onkeytypehandler(true);
					}catch(er){};
				};
			});
			return this;
		}
		
	});
	
	// load as default
	zjs(function(){zjs('.zautosuggestion').makeAutosuggestion();});

	// register module name
	zjs.required('autosuggestion');

});