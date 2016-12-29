// extend module scroll slider cho zjs
;zjs.require('transition', function(zjs){
"use strict";
	// update : 2014-04-25
	// last update : 2014-11-06
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeScrollSlider: function(option){
			
			option = zjs.extend({
				// enter your default options
				// here
				autoplay: 	0,
				dots: 		1,
				buttons: 	0,
				icons: 		0,
				delay: 		5000,
				circle: 	0,
				time: 		1200,
				fullscreen: 0,
				textLeft: 	'&lt',
				textRight: 	'&gt',
				classUL: 	'',
				classLI: 	'',
				testTouch: 	0,
				onLoad: 	function(){},
				onChange: 	function(){},
				transition: 1 // max = 4
			},option);
			
			//console.log(option);
			// do each and return 
			return this.each(function(element){
				if(zjs.supportTransform && zjs.isTouchDevice())zjs('body').addClass('is_touch_device');
				
				//khai bao bien
				var zElement = zjs(element),
					w = 0,
					h = 0,
					dots = '',
					timeoutID = null,
					zElementA = null,
					window_width = 0,
					zElementContent = zjs('<div class="contents"></div>'),
					zElementUl = zElement.find('ul'+option.classUL+':first');
				
				//tao element cha de chua cac elements
				zElementContent.append(zElementUl);
				zElement.append(zElementContent);
				
				//dung cho chuc nang full man hinh
				if(option.fullscreen){
					window_width = zjs(window).width();
					zElementContent.width(window_width);
				} 
				//them nut prev vao truoc cac dot
				if(option.dots&&option.buttons==2){
					dots += '<li class="li_left"><a class="left" href="#left">'+(option.icons?'<i class="icon-left"></i>':'')+'<span>'+option.textLeft+'</span></a></li>';
				}
				//set vi tri element active
				zElementUl.activeIndex = 0;
				var zElementLi = zElement.find('li'+option.classLI);
				zElementLi.each(function(el,i){
					var eli = zjs(el);
					if(option.fullscreen){
						w += window_width;
						eli.width(window_width);
					} else {
						w += eli.width();
						//eli.width(eli.width());
						// khong co set width nua vi se ra nguy hiem
						// ma se di tinh theo % thoi
						eli.width((100/zElementLi.count())+'%');
					}
					if(h<eli.height()){
						h = eli.height();
					}
					if(option.dots){
						dots += '<li class="page"><a href="#" rel="'+i+'">'+(option.icons?'<i class="icon-page"></i>':'')+'<span>'+(i+1)+'</span></a></li>';
					}
					if(eli.find('.active').count()>0&&zElementUl.activeIndex!=i&&zElementUl.activeIndex==0){
						zElementUl.activeIndex = i;
					}
				});
				//them nut next vao sau cac dot
				if(option.dots&&option.buttons==2){
					dots += '<li class="li_right"><a class="right" href="#right"><span>'+option.textRight+'</span>'+(option.icons?'<i class="icon-right"></i>':'')+'</a></li>';
				}
				zElementUl.style({
					//width:w,
					// khong co set width nua vi se ra nguy hiem
					// ma se di tinh theo % thoi
					width:(100*zElementLi.count())+'%',
					//position:'absolute',
					top:0,
					left:0
				});
				//zElementContent.height(h);
				// bay gio moi xem lai height cua UL
				//zElementContent.height(zElementUl.height());
				
				zElementUl.playing = 0;
				// khong co can phai set left ngay bay gio
				// vi left co the bi thay doi
				//zElementLi.each(function(el,i){zjs(el).setData('left',zjs(el).left());});
				
				//them cac dot
				if(option.dots){
					dots = zjs('<div class="dots"><ul class="clearfix">'+dots+'</ul></div>');
					zElement.append(dots);
					zElementA = dots.find('.page a');
					zElementA.each(function(el,index){
						el.onclick = function(e){
							var self = zjs(this);
							if(!self.hasClass('active')){
								zScrollElementWrapperMove(index);
							}
							return false;
						};
					}).item(0).addClass('active');
				}
				if(option.buttons>0){
					//them cac nut rieng
					if(option.buttons==1){
						var buttons = zjs(	'<div class="buttons">'+
											'<a class="left" href="#left">'+(option.icons?'<i class="icon-left"></i>':'')+'<span>'+option.textLeft+'</span></a>'+
											'<a class="right" href="#right"><span>'+option.textRight+'</span>'+(option.icons?'<i class="icon-right"></i>':'')+'</a>'+
											'</div>'
										);
						zElement.append(buttons);
					}
					zElement.find('a.left').each(function(el,i){
						el.onclick = function(e){
							//console.log('left',zElementUl);
							var index = parseInt(zElementUl.activeIndex);
							index-=1;
							if(option.circle&&index<0){
								index = zElementLi.count()-1;
							}
							if(index>-1){
								if(timeoutID){
									clearTimeout(timeoutID);
								}
								zScrollElementWrapperMove(index);
							}
							return false;
						};
					});
					zElement.find('a.right').each(function(el,i){
						el.onclick = function(e){
							//console.log('right',zElementUl);
							var index = parseInt(zElementUl.activeIndex);
							index+=1;
							if(option.circle&&index>=zElementLi.count()){
								index = 0;
							}
							if(index<zElementLi.count()){
								if(timeoutID){
									clearTimeout(timeoutID);
								}
								zScrollElementWrapperMove(index);
							}
							return false;
						};
					});
				}
				if(zElementUl.activeIndex>0){
					zScrollElementWrapperMove(parseInt(zElementUl.activeIndex));
				}				
				function autoplay(){
					if(option.autoplay){
						timeoutID = setTimeout(function(){
							if(zElementUl.playing == 0){
								clearTimeout(timeoutID);
								var index = parseInt(zElementUl.activeIndex);
								index += 1;
								if(index>=zElementLi.count()){
									index = 0;
								}
								zScrollElementWrapperMove(index);
							}
						},option.delay);
					}
				};
				//cho chay luon
				autoplay();
				
				if(zjs.supportTransform && zjs.isTouchDevice()){
					// bind event neu nhu la webkit va dang sai thiet bi di dong
					var touchSliding = 0,
						startPixelOffset = 0,
						touchStartPos = 0,
						deltaSlide = 0,
						slideCount = zElementLi.count()
						;
				
					if(option.testTouch){
						zjs('body').append('<div style="position:fixed;left:0;top:0;width:100%;text-align:center;z-index:10000;">'
							+'<b id="msg" '
							+'style="background:#fff;padding:2px 10px;border:1px solid #ddd;border-radius:5px;box-shadow:3px 3px 5px #000;">'
							+'</b></div>');
					}	
					zElement.on('touchstart', function(event, element){
						//zjs('#msg').html('start:'+event.touchX()+';del:'+deltaSlide);
						//console.log('start:'+event.touchX()+';del:'+deltaSlide);
						if(touchSliding == 0){
							touchSliding = 1;
							touchStartPos = event.touchX();
							
							// save lai cai left thoi
							this.setData('left', this.left());
						};
					});
					zElement.on('touchmove', function(event, element){
						//event.preventDefault();
						deltaSlide = event.touchX() - touchStartPos;
						//zjs('#msg').html('move:'+event.touchX()+';del:'+deltaSlide+';start:'+touchStartPos);
						//console.log('move:'+event.touchX()+';del:'+deltaSlide);
						if(touchSliding == 1 && deltaSlide != 0){
							touchSliding = 2;
							zElementUl.item(0).style('transition', '');
						};
						if(touchSliding == 2){
							zElementUl.playing = 1;
							zElementUl.item(0).style('transform', 'translate3d('+(deltaSlide-zElementLi.item(zElementUl.activeIndex).getData('left').toInt())+'px,0,0)' );
							if(option.testTouch){
								zjs('#msg').html('end( touchX: '+event.touchX()+'; touchStartPos:'+touchStartPos+'; deltaSlide:'+deltaSlide+' )');
							}
						}
					});
					zElement.on('touchend', function(event, element){
						if(touchSliding == 2&&deltaSlide!=0){
							touchSliding = 0;
							var index = zElementUl.activeIndex-(deltaSlide<0?-1:1);
							//zScrollElementWrapperTo(,1);
							// neu nhu co su thay doi index thi se move slide
							if( index<0 || index>=zElementLi.count() ){
								zScrollElementWrapperMove(zElementUl.activeIndex,1);
							} else if(index>-1&&index<zElementLi.count()){
								zScrollElementWrapperMove(index,1);
							}
						};
						if(option.testTouch){
							zjs('#msg').html('end( touchX: '+event.touchX()+'; touchStartPos:'+touchStartPos+'; deltaSlide:'+deltaSlide+' )');
						}
					});
				}
				//action move
				function zScrollElementWrapperMove(index,useTouch){
					zElementUl.activeIndex = index;
					/*if(useTouch){
						zElementUl.item(0).style('transition', 'transform ' + option.time + 'ms cubic-bezier(0,1,.53,1)');
						zElementUl.item(0).style('transform', 'translate3d(-'+zElementLi.item(index).getData('left')+'px,0,0)' );						
					} else {*/
						if(option.dots){
							zElementA.removeClass('active').item(index).addClass('active');
						}						
						if(typeof option.onChange == 'function'){
							option.onChange(index,zElement);
						}
						zElementUl.playing = 1;
						if( option.transition == 0 ){
							zElementUl.item(0).style({
								//'margin-left':-zElementLi.item(index).left()
								'transform':'translate3d(-'+zElementLi.item(index).left()+'px,0,0)'
							});
							zElementUl.playing = 0;
							autoplay();
						} else {
							zElementUl.item(0).playTransition({
								time:option.time,
								transition:option.transition,
								to:{'transform':'translate3d(-'+zElementLi.item(index).left()+'px,0,0)'},
								onFinish:function(from, to){
									zElementUl.playing = 0;
									autoplay();
								}
							});
						}
					//}
				}
				
				if(typeof option.onLoad == 'function'){
					option.onLoad();
				}						
			});
			// end each
		}
	});
	
	// make auto-init slider
	zjs.onready(function(){
		zjs('.zscrollslider').each(function(element){
			var zElement = zjs(element),
				option = zElement.getAttr('data-option','');
			if(!zjs.isString(option))option='';
			option = option.jsonDecode();
			zElement.makeScrollSlider(option).removeAttr('data-option');
		});
	});
	
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('scrollslider');
});
