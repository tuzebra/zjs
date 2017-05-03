// MODULE TEXTAREA AUTOHEIGHT
(function(zjs){
	
	var optionkey = 'zmoduletextareaautoheightoption';
	
	// extend core mot so option
	zjs.extendCore({
		moduleTextareaAutoheightOption: {
			minHeight: 'auto',
			smooth: true,
			smoothTime: 200
		}
	});
	
	
	var hiddenDivEl = false;
		
	
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeTextareaAutoheight = function(element, useroption){
		
		var textEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = textEl.getData(optionkey);
		if(option)return;
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleTextareaAutoheightOption);
		// extend from inline option ?
		var inlineoption = textEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		textEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// make 1 cai hidden Div neu chua
		// luc lam thi disable hook keo loi
		var zjsHookState = zjs.enablehook();
		zjs.enablehook(false);
		if(!hiddenDivEl){
			hiddenDivEl = zjs('<div style="position:fixed;top:-5000px;left:-5000px;opacity:0;"></div>').appendTo(zjs(document.body));
		}
			
		
		// --
		
		// tao ra 1 cai div chua noi dung
		var divEl = zjs('<div></div>').appendTo(hiddenDivEl),
			divDiffHeight = 0,
			minHeight = 0;

		// enable hook lai
		zjs.enablehook(zjsHookState);
		
		// copy style cua text input qua div
		var inited = false,
			initHeight = function(){
				if(inited)return;
				var boxSizing = textEl.getStyle('box-sizing'),
					width = textEl.width(),
					paddingLeftRight = textEl.getStyle('padding-left',1)+textEl.getStyle('padding-right',1),
					borderLeftRight = textEl.getStyle('border-left-width',1)+textEl.getStyle('border-right-width',1);
				
				// fix width & diff height
				if(boxSizing=='content-box'){
					width-=(paddingLeftRight+borderLeftRight);
					divDiffHeight = textEl.getStyle('padding-top',1) + textEl.getStyle('padding-bottom',1) + textEl.getStyle('border-top-width',1) + textEl.getStyle('border-bottom-width',1);
				};
				
				// fix min height
				if(option.minHeight==-1 || option.minHeight=='auto')
					minHeight = textEl.height();
				else
					minHeight = option.minHeight;
				
				// set style
				divEl.setStyle({
					width: width,
					margin: textEl.getStyle('margin'),
					padding: textEl.getStyle('padding'),
					font: textEl.getStyle('font'),
					border: textEl.getStyle('border'),
					'box-sizing': boxSizing
				});
			
			};
		
		// fix style
		textEl.setStyle({overflow:'hidden', resize:'none'});
		
		if(option.smooth)
		var heightTimer = zjs.timer({time:option.smoothTime, onProcess: function(current,from,to){textEl.height(current);}});
		
		var fixHeight = function(){
			var text = textEl.getValue();if(!text)text='';
			// luc lam thi disable hook keo loi
			//
			zjs.enablehook(false);
			divEl.setInnerHTML(text.nl2br()+'<br>');
			zjs.enablehook(zjsHookState);
			var newheight = Math.max(minHeight, divEl.height())-divDiffHeight;
			
			// get old height
			if(option.smooth)
				heightTimer.stop().set({
					from: textEl.height()-divDiffHeight,
					to: newheight
				}).run();
			else 
				textEl.height(newheight);
		};
		
		// bind event when press on text element
		textEl	.on('focus', function(event,element){initHeight();inited=true;fixHeight();})
				.on('keydown',function(event,element){fixHeight();})
				.on('keypress',function(event,element){fixHeight();})
				.on('keyup',function(event,element){fixHeight();})
				.on('changed',function(event,element){fixHeight();});
		
		// first height
		//window.setInterval(fixHeight,100);
		initHeight();
		fixHeight();	
			
	};
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeTextareaAutoheight: function(useroption){
			return this.eachElement(function(element){makeTextareaAutoheight(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zautoheight ko, neu nhu co thi se auto makeTextareaAutoheight luon
			zjs(el).find('.zautoheight').makeTextareaAutoheight();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zautoheight ko, neu nhu co thi se auto makeTextareaAutoheight luon
			if(zjs(el).hasClass('zautoheight'))zjs(el).makeTextareaAutoheight();
			zjs(el).find('.zautoheight').makeTextareaAutoheight();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('textarea.zautoheight').makeTextareaAutoheight();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.textarea.autoheight');
	
})(zjs);