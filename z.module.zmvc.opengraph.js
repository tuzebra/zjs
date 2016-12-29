// MODULE ZMVC OPENGRAPH
;zjs.require('ui.popup', function(){
	
	// enable zjs hook luon
	// de cho don gian moi chuyen
	zjs.enablehook(true);
	
	var optionkey = 'zmodulezmvcopengraphlikebuttonoption',
		// option key se dung chung cho ca like button, va comment button, panel
		
		commentbuttonelkey = 'zmodulezmvcopengraphcommentbuttonel',
		commentpanelelkey = 'zmodulezmvcopengraphcommentpanelel',
		commentcountelkey = 'zmodulezmvcopengraphcommentcountel',
	
		likedkey = 'zmodulezmvcopengraphlikebuttonliked',
		likecountelkey = 'zmodulezmvcopengraphlikecountel',
		likecountidkey = 'zmodulezmvcopengraphlikecountid';
	
	// extend core mot so option
	zjs.extendCore({
		moduleZmvcOpengraphOption: {
			opengraphurl: '',
			id: 0, // id chinh xac cua opengraph object
			type: '',
			customid: '',
			time: false,
			likes: 0,
			comments: 0,
			// text
			labellike:'Thích',
			labelliked:'Đã thích',
			labellikecounthtml:'<span>${count}</span>',
			likesiframe: true,
			// comment
			labelcommentcounthtml:'<span>${count}</span>',
			hidecommentpanel: false,
			hidecommentpanelwhennocomment: true,
			
			customclass: ''
		}
	});
	
	// trigger
	//zmvc.opengraph.like
	//zmvc.opengraph.newcomment
	
	// template
	var buttonlikeclass = 'zmvc-likebtn',
		buttonlikelikeclass = 'zmvc-likebtn-like',
		buttonlikelikedclass = 'zmvc-likebtn-liked',
		countlikeclass = 'zmvc-likecount',
		countlikepopupclass = 'zmvc-likecount-popup',
		
		buttoncommentclass = 'zmvc-commentbtn',
		countcommentclass = 'zmvc-commentcount',
		
		commentpanelclass = 'zmvc-commentpanel',
		commenttextareaclass = 'zmvc-commenttextarea',
		
		// defined in module.ui.popup.js
		uipopupwrapclass = 'zui-popup-wrapper';
	
	// - - - - - - - - - 
	
	var testTopWindowAccess = function(){
		var topWindowAccess = false;
		try{var a = typeof top.document;
		top.document.body.offsetTop = top.document.body.offsetTop;
		topWindowAccess = true;
		}catch(er){};
		return topWindowAccess;
	};
	
	var getHeadOpengraphUrl = function(){
		if(testTopWindowAccess())
			return top.zjs('script[name=opengraph]').getAttr('href','');
		
		return window.zjs('script[name=opengraph]').getAttr('href','');
	};
	
	// - - - - - - - - -
	
	// MAKE FEEDBACK FUNCTION
	// --
	var makeOgFeedback = function(element, useroption){
		
		var zFeedbackEl = zjs(element);
				
		// - - - 
		// neu ma co roi thi thoi, 
		// khong co ghi lai option nhu nhung module khac
		var option = zFeedbackEl.getData(optionkey);
		if(option)return;
		
		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleZmvcOpengraphOption);
		// auto get opengraph url set trong head
		var headopengraphurl = getHeadOpengraphUrl();
		if(headopengraphurl!='')option.opengraphurl = headopengraphurl;
		// extend from inline option ?
		var inlineoption = zFeedbackEl.getAttr('data-option', '');
		if(zjs.isString(inlineoption) && inlineoption.trim()!='')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zFeedbackEl.removeAttr('data-option');
		// extend from user option ?
		if(typeof useroption!='undefined')
			option = zjs.extend(option, useroption);
		// save option
		zFeedbackEl.setData(optionkey, option);
		
		//
		// dau tien la se get ra tat cac cac element 
		// co the thao tac o trong feedback group nay
		
		// like button
		var zLikeButtonEl = zFeedbackEl.find('.likebutton'),
			zLikeCountEl = zFeedbackEl.find('.likecount'),
			zCommentButtonEl = zFeedbackEl.find('.commentbutton'),
			zCommentCountEl = zFeedbackEl.find('.commentcount'),
			zCommentPanelEl = zFeedbackEl.find('.commentpanel');
		
		// neu nhu ma khong get ra duoc 1 cai element nao het thi thoi
		// bo tay luon roi
		if (zLikeButtonEl.count() <= 0
			&& zLikeCountEl.count() <= 0
			&& zCommentButtonEl.count() <= 0
			&& zCommentCountEl.count() <= 0
			&& zCommentPanelEl.count() <= 0)
			return;
		
		zCommentPanelEl.addClass(commentpanelclass);
		
		// tat ca moi hanh dong khac
		// chi bat dau khi ma da get ajax thanh cong
		// bat dau di get ajax
		// de xem coi opengraph nay la cai gi
		// va dong thoi get luon so luong like, so luong comment,
		// ...
		zjs.ajax({
			url:option.opengraphurl+'/liked', 
			// su dung method get, va type la json
			method: 'get', type:'json',
			// khong cho su dung cache
			cache:false, 
			// quang data la nguyen cuc option len luon
			// boi vi tren server se xu ly lay ra field can thiet
			data:{id:option.id, type:option.type, customid:option.customid, customclass:option.customclass},
			onComplete:function(data){
				// neu nhu khong success thi thoi
				if(typeof data.success == 'undefined' || !data.success)return;
				// ok neu nhu thang cong roi thi gio se ghi de 
				// opengraph get duoc vao option luon
				// boi vi nhung field opengraph cung la nhung field cua option
				option = zjs.extend(option, data.opengraph);
				
				
				
				// LIKE BUTTON 
				// --
				if(zLikeButtonEl.count() > 0){
				
					// bat dau gan cac class vao 
					zLikeButtonEl.addClass(buttonlikeclass);
					// set trang thai liked cho button
					// khong biet la data.liked tra ve bool hay la object nen ? cho chac
					zLikeButtonEl.setData(likedkey, data.liked ? true : false);
					// set lai label text cho dep
					zLikeButtonEl.find('.label').html(zLikeButtonEl.data(likedkey) ? option.labelliked : option.labellike);
					zLikeButtonEl.addClass(zLikeButtonEl.data(likedkey) ? buttonlikelikedclass : buttonlikelikeclass);
					// bay gio moi show ra cai button
					zLikeButtonEl.removeClass('zmvcoguninithide');
				
					// bind event cho button
					zLikeButtonEl.click(function(event){
						event.preventDefault();
					
						// kiem tra coi co dang nhap chua
						// neu chua dang nhap thi tuc la se co popup dang nhap
						// va co the zjs module dang duoc load trong iframe
						// nen can phai check o trong top frame
						var zpopupLoginEl = testTopWindowAccess() ? top.zjs('#popupzmvcopengraphlogin') : zjs('#popupzmvcopengraphlogin');
						if(zpopupLoginEl.count()>0){
							zpopupLoginEl.popupShow();
							zpopupLoginEl.find('input[type=text]:first-child').focus();
							return;
						};
					
						// chi can ajax request len 1 phat la xong
						// he thong se tu kiem tra coi user da liked hay chua ma xu ly
						option.likes += (zLikeButtonEl.data(likedkey) ? -1 : 1);
						zjs.ajax({url:option.opengraphurl+'/'+(zLikeButtonEl.data(likedkey)?'unlike':'like'), method: 'post', data:{id:option.id}});
					
						// con o duoi client thi se change label text va icon cho nhanh 
						// (khong quan tam server, boi vi hau het la server va client match voi nhau)
						zLikeButtonEl.setData(likedkey, !zLikeButtonEl.data(likedkey));
						zLikeButtonEl.find('.label').html(zLikeButtonEl.data(likedkey) ? option.labelliked : option.labellike);
						zLikeButtonEl.removeClass(buttonlikelikedclass+' '+buttonlikelikeclass).addClass(zLikeButtonEl.data(likedkey) ? buttonlikelikedclass : buttonlikelikeclass);
					
						// change text cho cai thang count like luon
						if(zLikeCountEl.count() > 0){
							// kiem tra xem neu nhu ma count like = 0 thi hide di cho roi
							if(option.likes == 0)zLikeCountEl.hide();else zLikeCountEl.show();
							zLikeCountEl.find('.int').html(option.likes);
						};
					});
					// end bind event
				
				};
				// end like button
				
				
				
				// LIKE COUNT
				// --
				// gio se tim thu xem coi co cai element count like nao chua
				// neu co roi thi su dung element do luon
				// con neu chua co thi se auto insert 1 cai count likes 
				// ngay dang sau cai button like nay luon
				// neu nhu co san roi thi sai thoi
				// neu nhu chua co thi se tao moi 1 thang
				if(zLikeCountEl.count() <= 0 && zLikeButtonEl.count() > 0){
					var labellikecounthtml = option.labellikecounthtml.replace('${count}','<span class="int"></span>');
					zLikeCountEl = zjs(labellikecounthtml).insertAfter(zLikeButtonEl);
				};
				
				// bay gio se di chinh sua lai like count hehe
				if(zLikeCountEl.count() > 0){
					
					// add class vo cho dep
					zLikeCountEl.removeClass('zmvcoguninithide').addClass(countlikeclass);
				
					// kiem tra xem neu nhu ma count like = 0 thi hide di cho roi
					if(option.likes == 0)zLikeCountEl.hide();
					zLikeCountEl.find('.int').html(option.likes);
					
					// bind event cho cai count like nay luon
					zLikeCountEl.click(function(event){
						event.preventDefault();
						
						// neu nhu option cho phep thi moi duoc lam 
						if(!option.likesiframe)return;
						
						// append vao body 1 cai element moi
						// va tao cho element nay popup luon
						var zLikeCountPopupEl = zjs('<div></div>')
							.appendTo(testTopWindowAccess() ? top.document.body : document.body)
							.addClass(countlikepopupclass)
							.makePopup({autoshow:true, closethenremove:true, clickout:true, center:true});
						// va trong popup nay, don gian nhat la cho no 1 cai iframe la xong
						zLikeCountPopupEl.find('.'+uipopupwrapclass).append('<iframe src="'+option.opengraphurl+'/likesiframe/'+option.id+'"></iframe>');
					});
					
				};
				// end like count
				
				
				
				// COMMENT BUTTON
				// --
				if(zCommentButtonEl.count() > 0){
					
					// bat dau gan cac class vao 
					zCommentButtonEl.addClass(buttoncommentclass);
					// bay gio moi show ra cai button
					zCommentButtonEl.removeClass('zmvcoguninithide');
				
					// bind event cho button
					zCommentButtonEl.click(function(event){
						event.stop();
			
						// kiem tra coi co dang nhap chua
						// neu chua dang nhap thi tuc la se co popup dang nhap
						// va co the zjs module dang duoc load trong iframe
						// nen can phai check o trong top frame
						var zpopupLoginEl = testTopWindowAccess() ? top.zjs('#popupzmvcopengraphlogin') : zjs('#popupzmvcopengraphlogin');
						if(zpopupLoginEl.count()>0){
							zpopupLoginEl.popupShow();
							zpopupLoginEl.find('input[type=text]:first-child').focus();
							return;
						};
						// kiem tra coi neu nhu co comment panel 
						// thi chi viec show ra cai comment panel nay thoi
						if(zCommentPanelEl.count() > 0)
							zCommentPanelEl.removeClass('zmvcoguninithide').find('textarea').trigger('click').focus();
					});
					// end bind event
				
				};
				// end comment button
				
				
				
				// COMMENT COUNT
				// --
				// tuong tu nhu like count
				// (xem them comment cua like count)
				if(zCommentCountEl.count() <= 0 && zCommentButtonEl.count() > 0){
					var labelcommentcounthtml = option.labelcommentcounthtml.replace('${count}','<span class="int"></span>');
					zCommentCountEl = zjs(labelcommentcounthtml).insertAfter(zCommentButtonEl);
				};
				
				if(zCommentCountEl.count() > 0){
					
					// add class vo cho dep
					zCommentCountEl.removeClass('zmvcoguninithide').addClass(countcommentclass);
				
					// kiem tra xem neu nhu ma count comment = 0 thi hide di cho roi
					if(option.comments == 0)zCommentCountEl.hide();
					else zCommentCountEl.find('.int').html(option.comments);
				
				};
				// end comment count
				
				
				
				// COMMENT PANEL
				// --
				if(zCommentPanelEl.count() > 0){
					
					// ajax
					// --
					// load html structure cua toan bo panel luon ^.^
					// va cung dong thoi check xem coi opengraph object co ton tai hay khong
					zjs.ajax({
						url:option.opengraphurl+'/comments', 
						// su dung method get, va type la json
						method: 'get', type:'json',
						// khong cho su dung cache
						cache:false, 
						// quang data la nguyen cuc option len luon
						// boi vi tren server se xu ly lay ra field can thiet
						data:{id:option.id, html:2, customclass:option.customclass},
						onComplete:function(data){
							// neu nhu khong success thi thoi
							if(typeof data.success == 'undefined' || !data.success)return;
				
							// --
				
							// bay gio, quan trong la phai set nguyen cuc panel html 
							// sau do lam gi thi lam
							zCommentPanelEl.html(data.html);
				
				
							// xem xet coi co show comment panel ra luon hay khong
							if(option.hidecommentpanel || (option.hidecommentpanelwhennocomment && data.comments.total <= 0)){
								// hide comment
							}else{
								// show comment
								zCommentPanelEl.removeClass('zmvcoguninithide');
							};
				
				
							// BUTTON COMMENT COUNT
							// --
							// gio se set data cho button comment count
							option.comments = data.comments.total;
							// kiem tra xem neu nhu ma count comment = 0 thi hide di cho roi
							if(option.comments == 0)zCommentCountEl.hide();
							zCommentCountEl.find('.int').html(option.comments);
							
							
							// BUTTON ATTACH IMAGE
							// --
							// bind event khi ma upload attach image thanh cong
							var btnUploadImageEl = zCommentPanelEl.find('.comment-composer-attach-wrapper .btnchoiceimage')
							.on('ui.button.file.upload.complete', function(event, el){
								if(!event.data.response.success)return;
								event.data.response.files.each(function(file){
									// remove het nhung cai hinh dang co
									zCommentPanelEl.find('.comment-composer-text-wrapper .comment-attach-image-wrapper').remove();
									zCommentPanelEl.find('.comment-composer-text-wrapper').append('<div class="comment-attach-image-wrapper" data-id="'+file.id+'"><img src="'+file.url+'" /><a class="remove zhovercardcenter" title="Xoá ảnh này" data-option="timeBeforeShow:0,timeBeforeHide:0,horizontal:\'center\',vertical:\'top\',autoFixPosition:false,hideWhenHoverCard:true">×</a></div>');
								});
							});
							// bind event cho may cai nut remove attach image
							zCommentPanelEl.find('.comment-composer-text-wrapper').on('click', '.comment-attach-image-wrapper .remove', function(event){
								event.preventDefault();
								this.parent().remove();
							});
		

							// INPUT FORM
							// --
							// gio quan trong la se get ra cai input form
							// cai input form nay se duoc render san trong html
							// js chi co nhiem vu get ra va bind event thoi
							var inputEl = zCommentPanelEl.find('textarea');
							if(inputEl.count() > 0){
			
								// addclass
								inputEl.addClass(commenttextareaclass);
			
								// bind event khi ma focus vao input
								inputEl.click(function(event){
									if(event && event.stop)event.stop();
									zCommentPanelEl.find('.comment-composer-text-border').addClass('focus');
								});
			
								// bind event khi ma input enter
								inputEl.on('keypress', function(event){
				
									// neu nhu dang posting thi bo qua het moi thu
									if(this.hasClass('posting')){
										event.preventDefault();
										event.stop();
										return;
									};
				
									// neu nhu ma khong an enter hoac co an Shift thi bo qua khong submit
									if(event.keyCode() != 13 || event.shiftKey())return;
									event.preventDefault();
									event.stop();
				
									// gio se tien hanh lay noi dung va submit luon
									var content = this.getValue('').trim();
									if(content == '')return;
									
									// get ra attach image
									var imageid = 0;
									zCommentPanelEl.find('.comment-composer-text-wrapper .comment-attach-image-wrapper').each(function(el){
										imageid = zjs(el).getAttr('data-id', 0).toInt();
									});
				
									// add class posting
									zCommentPanelEl.find('.comment-composer-text-border').addClass('posting');
									
									var inputEl = this;
				
									zjs.ajax({
										url:option.opengraphurl+'/comment', 
										// su dung method post, va type la json
										method: 'post', type:'json',
										// khong cho su dung cache
										cache:false, 
										// quang data la nguyen cuc option len luon
										// boi vi tren server se xu ly lay ra field can thiet
										data:{id:option.id, content:content, imageid:imageid, customclass:option.customclass},
										onComplete:function(data){
											zCommentPanelEl.find('.comment-composer-text-border').removeClass('posting');
					
											// neu nhu khong success thi thoi
											if(typeof data.success == 'undefined' || !data.success)return;
						
											// reset lai cai field va ca image attach
											inputEl.setValue('');
											zCommentPanelEl.find('.comment-composer-text-wrapper .comment-attach-image-wrapper').remove();
								
											// gio se append html vao luon
											zCommentPanelEl.find('.comment-rows').append(data.html);
								
											// tang comment count len
											option.comments++;
											// kiem tra xem neu nhu ma count comment = 0 thi hide di cho roi
											if(option.comments == 0)zCommentCountEl.hide();
											else zCommentCountEl.show().find('.int').html(option.comments);
											
											// ok, goi  trigger thoi
											zFeedbackEl.trigger('zmvc.opengraph.newcomment');
										}
									});
								});
			
							};
							// end input form
				
						}
						// end ajax oncomplete
						
					});
					// end ajax
				
				};
				// end comment panel
				
				
				
				// BUTTON LOAD MORE COMMENT
				// --
				if(zCommentPanelEl.count() > 0){
					
					zCommentPanelEl.on('click', '.comment-loadmore-wrapper', function(event){
						event.preventDefault();
			
						// neu nhu dang loading roi thi thoi
						// khong cho load nua, cu binh tinh
						if(this.hasClass('loading'))return;
			
						var loadmoreEl = this.addClass('loading'),
							start = loadmoreEl.getAttr('data-nextstart'),
							limit = loadmoreEl.getAttr('data-nextlimit');
				
				
						// send ajax
						zjs.ajax({
							url:option.opengraphurl+'/comments', 
							// su dung method get, va type la json
							method: 'get', type:'json',
							// khong cho su dung cache
							cache:false, 
							// quang data la nguyen cuc option len luon
							// boi vi tren server se xu ly lay ra field can thiet
							data:{id:option.id, start:start, limit:limit, html:1, customclass:option.customclass},
							onComplete:function(data){
								// neu nhu khong success thi thoi
								if(typeof data.success == 'undefined' || !data.success)return;
								loadmoreEl.removeClass('loading');
					
								// --
								// prepend vao
								zjs.foreach(data.comments.rows, function(row){
									zCommentPanelEl.find('.comment-rows').prepend(row.html);
								});
					
								// neu nhu da load xong het thi thoi, remove luon
								if(data.comments.nextstart <= 0)
									return loadmoreEl.remove();
					
								// xem coi tiep theo se load bao nhieu
								loadmoreEl
									.setAttr('data-nextstart',data.comments.nextstart)
									.setAttr('data-nextlimit',data.comments.nextlimit)
									.find('.count').html(data.comments.nextlimit);
					
							}
						});
					});
				};
				// end button load more comment
		
		
		
				// BUTTON REMOVE EACH COMMENT
				// --
				if(zCommentPanelEl.count() > 0){

					// bind live event cho mat cai button remove
					// vi chua biet khi nao thi cai button se xuat hien
					zCommentPanelEl.on('click', '.comment-remove[data-id]', function(event){
						event.preventDefault();
						var commentid = this.getAttr('data-id'),
							rowEl = zCommentPanelEl.find('.comment-row[data-id='+commentid+']');
				
						// chi can ajax request len 1 phat la xong
						// he thong se tu kiem tra coi comment da remove hay chua ma xu ly
						zjs.ajax({url:option.opengraphurl+'/removeComment', method:'post', data:{commentid:commentid, trash:1}});
					
						// con o duoi client thi se change state cho comment row luon
						// (khong quan tam server, boi vi hau het la server va client match voi nhau)		
						rowEl.addClass('removed');
			
						// fix count
						option.comments--;
						if(option.comments == 0)zCommentCountEl.hide();
						else zCommentCountEl.show().find('.int').html(option.comments);
					});
		
					zCommentPanelEl.on('click', '.comment-remove-undo[data-id]', function(event){
						event.preventDefault();
						var commentid = this.getAttr('data-id'),
							rowEl = zCommentPanelEl.find('.comment-row[data-id='+commentid+']');
			
						// chi can ajax request len 1 phat la xong
						// he thong se tu kiem tra coi comment da remove hay chua ma xu ly
						zjs.ajax({url:option.opengraphurl+'/removeComment', method:'post', data:{commentid:commentid, trash:0}});
					
						// con o duoi client thi se change state cho comment row luon
						// (khong quan tam server, boi vi hau het la server va client match voi nhau)		
						rowEl.removeClass('removed');
			
						// fix count
						option.comments++;
						zCommentCountEl.show().find('.int').html(option.comments);
					});
				};
				// end button remove comment
				
				
			}
			// end ajax oncomplete
			
		});
		// end ajax
	};
	
	
	
	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeOgFeedback: function(useroption){
			return this.each(function(element){makeOgFeedback(element, useroption)});
		}
	});
	
	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function(el){
			// kiem tra xem trong so cac thang con
			// co class nao la zmvcogfeedback ko, neu nhu co thi se auto makeOgFeedback luon
			zjs(el).find('.zmvcogfeedback').makeOgFeedback();
		},
		after_insertDOM: function(el){
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zmvcogfeedback ko, neu nhu co thi se auto makeOgFeedback luon
			if(zjs(el).hasClass('zmvcogfeedback'))zjs(el).makeOgFeedback();
			zjs(el).find('.zmvcogfeedback').makeOgFeedback();
		}
	});

	// AUTO INIT
	zjs.onready(function(){
		zjs('.zmvcogfeedback').makeOgFeedback();
		zjs(document).click(function(){
			zjs('.comment-composer-text-border').removeClass('focus');
		});
	});
	//fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('zmvc.opengraph');
	
	// require thang autoheight
	zjs.require('textarea.autoheight, ui.button.file');
	
});
