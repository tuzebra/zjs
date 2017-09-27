// MODULE UI ACCORDION
zjs.require('ui', function(){
	
	var optionkey = 'zmoduleuiaccordionoption',
		titleindexkey = 'zmoduleuiaccordiontitleindex',
		//currentindexkey = 'zmoduleuiaccordioncurrentindex',
		preventhashchangeeventkey = 'zmoduleuiaccordionpreventhashevent';
	
	var fixTopTimer = false;
	//var fixTopTimerAlowEvent = true;
	zjs(window).on('mousewheel',function(event){
		if(fixTopTimer)fixTopTimer.stop();
	});
	
	// extend core mot so option
	zjs.extendCore({
		moduleUiAccordionOption: {
			transition: 'vertical',
			titleclass: 'h3',
			activesession: 0,
			allowclose: false,
			useurlhash:false,
			autoscroll:false,
			separate:false,
			scrollmargintop:0
		}
	});
	
	// trigger
	//ui.accordion.load
	
	// template
	var accordionclass = 'zui-accordion',
		wrapclass = 'zui-accordion-wrap',
		titleclass = 'zui-accordion-title',
		sessionclass = 'zui-accordion-session',
		contentclass = 'zui-accordion-content';
	
		
	// - - - - - - - - -
	
	// MAIN FUNCTIONS
	
	var makeAccordion = function(element, useroption){

		var zAccordionEl = zjs(element);
		
		
		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zAccordionEl.getData(optionkey);
		
		// flag y bao phai refresh lai option
		if(option){
			zAccordionEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};
				
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiAccordionOption);
		// extend from inline option ?
		var inlineoption = zAccordionEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zAccordionEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// fix option
		if(option.transition=='none')option.transition=0;
		if(option.transition=='fade'||option.transition=='fadein')option.transition=1;
		if(option.transition=='horizontal')option.transition=2;
		if(option.transition=='vertical')option.transition=3;
		if(option.transition.toInt()>3)option.transition=0;
		// first active session
		if(!zjs.isNumeric(option.activesession))
			option.activesession = 0;
		// use has
		option.useurlhash=(!!option.useurlhash);
		option.autoscroll=(!!option.autoscroll);
		option.scrollmargintop = parseInt(option.scrollmargintop);
		if(!zjs.isNumeric(option.scrollmargintop))
			option.scrollmargintop = 0;
		
		// save option
		zAccordionEl.setData(optionkey, option);
		
		// - - -
		// start coding module
		
		// set first current index
		//zAccordionEl.setData(currentindexkey, -1);
		
		// add class & set id for tabpanel
		zAccordionEl.addClass(accordionclass);
		
		var lastContentEl = false,
			lastTitleIndex = 0;
		
		// di init cac thang con ben trong thang tab panel
		zAccordionEl.child().each(function(el){
			var zEl = zjs(el);
			
			// tim kiem thang title
			if(zEl.is(option.titleclass)){
				zEl.addClass(titleclass)
					.setData(titleindexkey, lastTitleIndex++)
					.click(function(){
						accordionSelectSession(zAccordionEl, this.getData(titleindexkey).toInt());
					});
				
				// bind event cho thang title nay luon
				// (nham support cho thang sidenav)
				zEl.on('ui:toc:out:trigger', function(event){
					// neu nhu dang active thi thoi
					if(this.hasClass('active'))return;
					// neu nhu khong active thi moi cho phep haha
					accordionSelectSession(zAccordionEl, this.getData(titleindexkey).toInt(), false, true);
					// cai param true thu 4 la forceScroll
					// nghia la cho nay thi thang sidenav se khong can phai scroll
					// ma nhiem vu scroll giao cho thang arcodion luon
					// nen phai bao ve cho cai thang sidenav biet
					event.preventDefault();
				});
				
				zjs('<div></div>').addClass(wrapclass).insertAfter(zEl).append(zEl);	
				var sessionEl = zjs('<div></div>').addClass(sessionclass).insertAfter(zEl);
				lastContentEl = zjs('<div></div>').addClass(contentclass).appendTo(sessionEl);
			}else if(lastContentEl){
				lastContentEl.append(zEl);
			};
		});
		
		// neu nhu ma chon option separate thi phai hide het di cai da
		if(option.separate){
			zAccordionEl.find('>.'+wrapclass+'>.'+sessionclass).hide();
			//zAccordionEl.find('>.'+sessionclass).each(function(el, i){
			//	zjs(el).hide();
			//});
		};
		
		
		
		var _focusedFirstsection = false;
		
		// kiem tra coi co dung url hash khong
		if(option.useurlhash){
			_focusedFirstsection = accordionSelectSessionByHash(element);
			// kiem tra coi co dung urlhash ko de bind event
			zjs(window).on('hashchange', function(event){
				if(zjs(element).getData(preventhashchangeeventkey)){
					zjs(element).setData(preventhashchangeeventkey, false);
					//console.log('preventhashchangeeventkey');
					return;
				};
				accordionSelectSessionByHash(element);
			});
		};
		
		// select first tab for default
		if(!_focusedFirstsection)
			accordionSelectSession(element, option.activesession);
		
		
		// run trigger
		zAccordionEl.trigger('ui.accordion.load');
	},
	
	// select tab by hash, neu lam dc thi return true
	accordionSelectSessionByHash = function(element){
		if(document.location.hash=='')return;
		
		var zAccordionEl = zjs(element);
		var option = zAccordionEl.getData(optionkey);
		
		// neu chua co option thi chung to la day khong phai la accordion
		if(!option)return;
		if(!option.useurlhash)return;
		
		// xem coi lam duoc hay khong
		var _lamdc = false;
		
		// xem coi cai hash nay co trong thang nav li nay ko
		var _mbHeaderEl = zAccordionEl.find('[data-name="'+document.location.hash.substr(1)+'"]');
		// neu nhu khong co thi tim trong id
		if(_mbHeaderEl.count()<=0)_mbHeaderEl = zAccordionEl.find('#'+document.location.hash.substr(1));
		// co thi lam
		if(_mbHeaderEl.count()>0){
			var _mbsectionIndex = parseInt(_mbHeaderEl.getData(titleindexkey, -1));
			if(_mbsectionIndex>=0){
				accordionSelectSession(element, _mbsectionIndex, true);
				_lamdc = true;
			}
		}
		
		return _lamdc;
	},
	
	accordionSelectSession = function(element, index, fromHash, forceScroll){
		
		// fix default param
		forceScroll = forceScroll || false;
		
		var zAccordionEl = zjs(element);
		var option = zAccordionEl.getData(optionkey);
		
		// neu chua co option thi chung to la day khong phai la accordion
		if(!option)return;
		//console.log('accordionSelectSession');
		
		// bay gio xem coi cai index da duoc click chua? nhu nhu roi thi thoi
		//var currentIndex = zAccordionEl.getData(currentindexkey).toInt();
		//if(currentIndex == index){
		// get ra cai thang title o vi tri nay
		// var thisIndexTitle = zAccordionEl.find('.zui-accordion-title').item(index);
		var thisIndexWrap = zAccordionEl.find('>.'+wrapclass).item(index);
		if(thisIndexWrap.hasClass('active')){	
			// neu nhu cai thang nay dang la thang active roi thi thoi
			// neu nhu cho phep close cai thang dang active, thi se xu ly
			// con khong thi return luon
			if(option.allowclose){
				// tim ra cac thang session la con truc tiep cua cai thang accordion nay
				// var thisIndexSession = zAccordionEl.find('>.'+wrapclass+'>.'+sessionclass).item(index);
				var thisIndexTitle = thisIndexWrap.find('>.'+titleclass),
					thisIndexSession = thisIndexWrap.find('>.'+sessionclass);
				if(thisIndexSession.hasClass('active')){
					thisIndexSession.hideScale({time:500});
					thisIndexSession.removeClass('active');
				}
		
				thisIndexTitle.removeClass('active');
				thisIndexWrap.removeClass('active');
			}
			
			return;
		}
		
		
		// tim ra cac thang session la con truc tiep cua cai thang accordion nay
		// zAccordionEl.find('>.'+sessionclass).each(function(el, i){
		zAccordionEl.find('>.'+wrapclass).each(function(el, i){
			var zWrapEl = zjs(el),
				zEl = zWrapEl.find('>.'+sessionclass),
				zTitleEl = zWrapEl.find('>.'+titleclass);

			if(i == index){
				zWrapEl.addClass('active');
				zTitleEl.addClass('active');
				zEl.showScale({time:500}).addClass('active');
				
				var zHeaderEl = false,
					sectionName = '';
				
				// tranh thu tim ra cai thang section header
				if(option.useurlhash || option.autoscroll || forceScroll){
					// tim kiem section name
					zAccordionEl.find(option.titleclass).each(function(el){
						var _tempHeaderEl = zjs(el);
						if(_tempHeaderEl.getData(titleindexkey) == index){
							sectionName = _tempHeaderEl.getAttr('data-name', '');
							// neu khong co thi get id
							if(sectionName=='')sectionName = _tempHeaderEl.getAttr('id', '');
							zHeaderEl = _tempHeaderEl;
							return false;
						}
					});
				}
				
				// xem coi co su dung hash khong
				// neu nhu co su dung thi se change document hash
				// dau tien la xac dinh cai name truoc
				if(option.useurlhash && sectionName != ''){
					if(!fromHash)
						zjs(element).setData(preventhashchangeeventkey, true);
					document.location.hash = sectionName;
				}
				
				// xem coi co su dung autoscroll khong?
				//console.log('forceScroll', forceScroll, 'zHeaderEl', zHeaderEl);
				if((forceScroll || option.autoscroll) && zHeaderEl){
					
					// scroll cai thang nay to bottom cua thang header dung truoc no
					// neu day la header dau tien: scroll toi top cua cai accodion wrap 

					// bay gio phai scroll cai thang nay to top
					//console.log('zHeaderEl top', );
					// boi vi top cua cai thang header se thay doi lien tuc
					// do content dai ra theo timer
					// nen phai dieu chinh cho phu hop
					if(fixTopTimer)fixTopTimer.stop();
					var _b1 = zHeaderEl.getAbsoluteTop() - option.scrollmargintop;
					fixTopTimer = zjs.timer({
						from:0,
						to:1,
						time:1000,
						onProcess: function(t, from, to){
							// get ra cai scrolltop hien tai
							//var _a = zjs(window).scrollTop() - option.scrollmargintop;
							// get ra top cua thang header
							var _b = zHeaderEl.getAbsoluteTop() - option.scrollmargintop;
							// nhiem vu la khi chay den 100 thi 2 thang nay phai bang nhau
							//var _a2 = _a+(_b-_a)*t;
							//var _a2 = (_a+_b)/2;
							//var _a2 = _a+(_b-_a)/2;
							//var _a2 = _a*(1-t)+_b*t;
							//var _a2 = _b;
							//if(_a2<_a)_a2 = _a;
							// muc tieu la tinh tien toi _b tu tu thoi
							//var _a2 = (_b1+_b)/2;
							//console.log('_a',_a,'_b',_b,'_a2',_a2);
							//fixTopTimerAlowEvent = false;
							window.scrollTo(zjs(window).scrollLeft(), parseInt((_b1+_b)/2));
							//window.scrollTo(zjs(window).scrollLeft(), _a2);
							//window.scrollTo(zjs(window).scrollLeft(), _b);
							//fixTopTimerAlowEvent = false;
							_b1 = _b;
						}
					});
					fixTopTimer.run();
				}
				
			}
			// neu nhu khong cho rieng biet thi moi close
			// con neu nhu cho thi thoi
			else{
				if(!option.separate){
					if(zEl.hasClass('active'))zEl.hideScale({time:500});else zEl.hide();
					zWrapEl.removeClass('active');
					zTitleEl.removeClass('active');
					zEl.removeClass('active');
				}
			}
		});
		
		// ho tro cho cai thang sidenav luon
		// se update lai cai thang sidenav cho dung
		// boi vi thang accordion nay se thay doi height
		(function(){
			zjs('.zsidenav').trigger('ui.sidenav.refresh');
		}).delay(1000);
	};
	
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeAccordion: function(useroption){
			return this.each(function(el){makeAccordion(el, useroption)});
		},
		accordionSelectSession: function(index){
			return this.each(function(el){accordionSelectSession(el, index)});
		}
	});
	

	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zaccordion ko, neu nhu co thi se auto makeAccordion luon
			zjs(el).find('.zaccordion').makeAccordion();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zaccordion ko, neu nhu co thi se auto makeAccordion luon
			if(zjs(el).hasClass('zaccordion'))zjs(el).makeAccordion();
			zjs(el).find('.zaccordion').makeAccordion();
		}
	});
	
	// AUTO INIT
	zjs.onready(function(){zjs('.zaccordion').makeAccordion()});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('ui.accordion');
});