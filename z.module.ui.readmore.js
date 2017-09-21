// MODULE TEXTAREA AUTOHEIGHT
(function(zjs){
	
	var optionkey = 'zmoduleuireadmoreoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiReadmoreOption: {
			handlerMethod: 'max-line', // max-line, max-height
			max: 3,
			ellipsis: '…',
			smooth: true,
			smoothTime: 200
		}
	});
	
	
	var hiddenDivEl = false;
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeUiReadmore = function(element, useroption){
		
		var wrapEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se refresh thoi
		var option = wrapEl.getData(optionkey);
		if(option){
			wrapEl.trigger('ui:readmore:trigger_refresh');
			return;
		}
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiReadmoreOption);
		// extend from inline option ?
		var inlineoption = wrapEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		wrapEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);

		// fix option
		// fix handler method
		if(!(option.handlerMethod in handlerMethods))
			option.handlerMethod = 'max-line';

		// save option
		wrapEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// make 1 cai hidden Div neu chua
		// luc lam thi disable hook keo loi
		var zjsHookState = zjs.enablehook();
		zjs.enablehook(false);
		if(!hiddenDivEl){
			hiddenDivEl = zjs('<div style="position:fixed;top:-5000px;left:-5000px;opacity:0;"></div>').appendTo(document.body);
			// hiddenDivEl = zjs('<div style=""></div>').appendTo(document.body);
		}
		
		// find handler method
		var handlerMethod = handlerMethods[option.handlerMethod];

		// --

		// get readmore link
		var readmoreLinkEl = wrapEl.find('.zreadmorelink'),
			readmoreText = readmoreLinkEl.getInnerText();
		readmoreLinkEl.appendTo(hiddenDivEl);
		
		// backup inner text
		// var innerText = wrapEl.getInnerText();
		var innerText = wrapEl.getInnerHTML();

		// tao ra 1 cai div chua noi dung clone
		var wrapCloneDivEl = zjs('<div></div>').appendTo(hiddenDivEl),
			cloneDivEl = zjs('<div></div>').appendTo(wrapCloneDivEl);

		// clone luon style
		wrapCloneDivEl
			.setClass(wrapEl.parent().getAttr('class',''))
			.setStyle({
				'box-sizing': 'border-box'
			});
		cloneDivEl
			.setClass(wrapEl.getAttr('class',''))
			.removeClass('zreadmore')
			.setStyle({
				'margin': wrapEl.getStyle('margin'),
				'padding': wrapEl.getStyle('padding'),
				'font': wrapEl.getStyle('font'),
				'border': wrapEl.getStyle('border'),
				'box-sizing': wrapEl.getStyle('box-sizing'),
				'line-height': wrapEl.getStyle('line-height'),
			});

		// fix style
		// wrapEl.setStyle({overflow:'hidden'});

		// enable hook lai
		zjs.enablehook(zjsHookState);

		var isShowFull = false;

		// xu ly moi khi window resize, test xem coi co can phai show readmore hay khong?
		var mainHandler = function(firstRun){
			if(isShowFull)return;
			firstRun = firstRun || false;

			// luon disable hook khi xu ly cai nay
			zjs.enablehook(false);

			// update width 
			wrapCloneDivEl.width(wrapEl.parent().width());

			// test xem coi co can phai show readmore hay khong?
			var isNeededToShowReadmore = handlerMethod('needed', option, innerText, cloneDivEl);

			// neu khong can show readmore thi tra ve nhu cu
			if(!isNeededToShowReadmore){
				// console.log('dont need');
				readmoreLinkEl.appendTo(hiddenDivEl);
				wrapEl.setInnerHTML(innerText);
				// neu nhu first run ma khong can thi thoi bo luon
				if(firstRun){
					readmoreLinkEl.remove();
					wrapCloneDivEl.remove();
					isShowFull = true;
				}
				zjs.enablehook(zjsHookState);
				return;
			}

			// neu nhu can show readmore thi xem coi show nhu the nao thi vua?
			var trimText = handlerMethod('gettrimtext', option, innerText, cloneDivEl, {readmoreText: readmoreText});
			readmoreLinkEl.appendTo(hiddenDivEl);
			wrapEl.setInnerHTML(trimText);
			wrapEl.append(readmoreLinkEl);
			zjs.enablehook(zjsHookState);
		};

		// fix width when resize
		zjs(window).on('resize', function(){
			mainHandler();
		});

		// cho phep ben ngoai bat thang nay refresh
		wrapEl.on('ui:readmore:trigger_refresh', function(){
			mainHandler();
		});

		// first handler
		mainHandler(true);

		// bind event cho readmore link
		if(readmoreLinkEl.count())readmoreLinkEl.on('click', function(event){
			event.preventDefault();

			// luon disable hook khi xu ly cai nay
			zjs.enablehook(false);

			readmoreLinkEl.remove();
			isShowFull = true;
			wrapEl.setInnerHTML(innerText);
			// remove luon may cai div tam, cho nhe
			wrapCloneDivEl.remove();

			zjs.enablehook(zjsHookState);
		});
		
		
		
		// if(option.smooth)
		// var heightTimer = zjs.timer({time:option.smoothTime, onProcess: function(current,from,to){textEl.height(current);}});
		
		// var fixHeight = function(){
		// 	var text = textEl.getValue();if(!text)text='';
		// 	// luc lam thi disable hook keo loi
		// 	//
		// 	zjs.enablehook(false);
		// 	divEl.setInnerHTML(text.nl2br()+'<br>');
		// 	zjs.enablehook(zjsHookState);
		// 	var newheight = Math.max(minHeight, divEl.height())-divDiffHeight;
			
		// 	// get old height
		// 	if(option.smooth)
		// 		heightTimer.stop().set({
		// 			from: textEl.height()-divDiffHeight,
		// 			to: newheight
		// 		}).run();
		// 	else 
		// 		textEl.height(newheight);
		// };
		


			
	};


	// HANDLER METHOD
	// >>>>>>>>>>>>>>>>>>>>>>>
	var handlerMethods = {
		'max-height': function(command, option, innerText, cloneDivEl, moreData){
			
			if(command == 'needed'){
				cloneDivEl.setInnerHTML(innerText);
				// get ra cai height thu coi?
				return cloneDivEl.height() > option.max;
			}

			if(command == 'gettrimtext'){
				var reText = '';
				var innerTextArr = innerText.split(' ');
				innerTextArr.push(' ');
				do{
					innerTextArr.pop();
					// double run to get "fixed" html string
					cloneDivEl.setInnerHTML(innerTextArr.join(' '));
					reText = cloneDivEl.getInnerHTML() + option.ellipsis + ' ';
					cloneDivEl.setInnerHTML(reText + moreData.readmoreText);
				}
				while(innerTextArr.length && cloneDivEl.height() > option.max);

				return reText;
			}
		},
		'max-line': function(command, option, innerText, cloneDivEl, moreData){
			if(command == 'needed' || command == 'gettrimtext'){
				// get ra line height
				var maxHeight = cloneDivEl.getStyle('line-height').toInt() * option.max;
				return handlerMethods['max-height'](command, {max: maxHeight, ellipsis: option.ellipsis}, innerText, cloneDivEl, moreData);
			}
		}
	};

	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeUiReadmore: function(useroption){
			return this.eachElement(function(element){makeUiReadmore(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zreadmore ko, neu nhu co thi se auto makeUiReadmore luon
			zjs(el).find('.zreadmore').makeUiReadmore();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zreadmore ko, neu nhu co thi se auto makeUiReadmore luon
			if(zjs(el).hasClass('zreadmore'))zjs(el).makeUiReadmore();
			zjs(el).find('.zreadmore').makeUiReadmore();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('.zreadmore').makeUiReadmore();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.readmore');
	
})(zjs);