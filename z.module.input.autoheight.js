// extend module Auto Height cho zjs
;(function(zjs){
	
	var hiddenDivEl = false;
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		autoHeight: function(option){
			
			option = zjs.extend({
				minHeight: 'auto',
				smooth: true
			}, option);
			
			// make 1 cai hidden Div neu chua
			if(!hiddenDivEl){
				// luc lam thi disable hook keo loi
				var zjsHookState = zjs.enablehook();
				zjs.enablehook(false);
				hiddenDivEl = zjs('<div style="position:fixed;top:-5000px;left:-5000px;opacity:0;"></div>').appendTo(zjs('body'));
				zjs.enablehook(zjsHookState);
			};
			
			// main each - -
			this.each(function(element){
				
				
				
				var textEl = zjs(element);
				
				// tao ra 1 cai div chua noi dung
				// luc lam thi disable hook keo loi
				var zjsHookState = zjs.enablehook();
				zjs.enablehook(false);
				var divEl = zjs('<div></div>').appendTo(hiddenDivEl);
				zjs.enablehook(zjsHookState);
				
				var divDiffHeight = 0,
					minHeight = 0;
				
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
				var heightTimer = zjs.timer({time:200,onProcess: function(current,from,to){textEl.height(current);}});
				
				var fixHeight = function(){
					var text = textEl.getValue();if(!text)text='';
					// luc lam thi disable hook keo loi
					var zjsHookState = zjs.enablehook();
					zjs.enablehook(false);
					divEl.html(text.nl2br()+'<br>');
					zjs.enablehook(zjsHookState);
					
					// get old height
					if(option.smooth)
					heightTimer.stop().set({
						from: textEl.height()-divDiffHeight,
						to: Math.max(minHeight, divEl.height())-divDiffHeight
					}).run();
					else 
					textEl.height(Math.max(minHeight, divEl.height())-divDiffHeight);
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
				
			});
			// end main each - -
			
		}
	
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zdatepicker ko, neu nhu co thi se auto makeDatepicker luon
			zjs(el).find('textarea.autoheight').autoHeight();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zdatepicker ko, neu nhu co thi se auto makeDatepicker luon
			if(zjs(el).is('textarea.autoheight'))zjs(el).autoHeight();
			zjs(el).find('textarea.autoheight').autoHeight();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){
		zjs('textarea.autoheight').autoHeight();
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('input.autoheight');

})(zjs);