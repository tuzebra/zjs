// extend module april like cho zjs
;(function(zjs){
	
	var optionkey = 'zjsmoduleaprillikeoption',
		datakey = 'zjsmoduleaprillikeotherdata',
		tokencookiekey = 'zjsmoduleaprilliketoken';
	
	// extend method cho zjs-instance
	zjs.extendMethod({
		makeAprilLikebutton: function(useroption){
			
			var defaultoption = {
				// enter your options
				// here
				id: '',
				type: '',
				userid: '',
				liketext: 'like',
				likedtext: 'liked'
			};
			
			
			// ham xu ly event khi click
			// va se chi duoc bind khi ma load data thanh cong
			// ham nay nam ben ngoai main each
			// de tiet kiem memory (khong phai tao ra ham nay nhieu lan
			var onClick = function(event, element){
				event.preventDefault();
				var zElement = zjs(element),
					textEl = zElement.find('.liketext'),
					option = zElement.getData(optionkey),
					data = zElement.getData(datakey);
					
				console.log(data);
				// thuc hien ajax
				zjs.ajax({
					url:'http://services.april.vn/like/like.php',
					data: {action:'like',customid:option.id,type:option.type,token:data.token,userid:option.userid,url:data.url},
					type: 'jsonp', // json, jsonp
					onComplete: function(json){console.log('json: ', json);
						// neu khong nhan duoc objectid thi coi nhu sai
						if(typeof json.objectid == 'undefined' || json.objectid.toInt()<=0)return;
						
						// luu lai token ngay
						zjs.cookie.set(tokencookiekey,json.token);
						
						// luu lai data
						zElement.setData(datakey, data = zjs.extend(data, json));
						
						// set lai text
						textEl.html(data.liked?option.likedtext:option.liketext);
					},
					onError: false,
					debug: true
				});
				
			};
			
			// main each - - -
			// do each
			this.each(function(element){
				var zElement = zjs(element);
				
				// - - - 
				// neu ma co roi thi se ghi lai option
				// option luc nay la option cua user
				var option = zElement.getData(optionkey);
				
				// flag y bao phai refresh lai option
				var refreshOption = false;
				if(option){
					zElement.setData(optionkey, zjs.extend(option, useroption));
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
				var inlineoption = zElement.getAttr('data-option', '');
				if(zjs.isString(inlineoption) && inlineoption.trim()!='')
					option = zjs.extend(option, inlineoption.jsonDecode());
				
				// extend from user option ?
				if(typeof useroption!='undefined')
					option = zjs.extend(option, useroption);
				
				// save option
				zElement.setData(optionkey, option);
				
				// - - -
				// start coding your module
				
				// ...
				
				var _htmlText = '<span class="liketext"></span>';
				// get template, sau do
				// thay the html cua element
				zElement.html(zElement.getInnerHTML().format({text:_htmlText}));
				
				// set text lien
				var textEl = zElement.find('.liketext').html(option.liketext);
				
				// gio se di chuan bi may cai thong tin khac
				var data;
				zElement.setData(datakey, data = {
					objectid: 0,
					url: window.location.href,
					liked: false,
					likes: 0,
					token: zjs.cookie.get(tokencookiekey,'')
				});
				
				// gio se load coi da like hay chua
				zjs.ajax({
					url:'http://services.april.vn/like/like.php',
					data: {customid:option.id,type:option.type,token:data.token,userid:option.userid,url:data.url},
					type: 'jsonp', // json, jsonp
					onComplete: function(json){console.log('json: ', json);
						// neu khong nhan duoc objectid thi coi nhu sai
						if(typeof json.objectid == 'undefined' || json.objectid.toInt()<=0)return;
						
						// luu lai token ngay
						zjs.cookie.set(tokencookiekey,json.token);
						
						// luu lai data
						zElement.setData(datakey, data = zjs.extend(data, json));
						
						// set lai text
						if(data.liked)textEl.html(option.likedtext);
						
						// bat dau bind event cho nut bam
						zElement.click(onClick);
					},
					onError: false,
					debug: true
				});
				
				
				// - - -
				
				
			});
			// end each
			
			
			// follow 
			// zjs syntax
			// return this!
			return this;
		}
	});
	
	// autoload?
	zjs(function(){zjs('.zaprillikebutton').makeAprilLikebutton();});

	// register module name
	zjs.required('april.like');
	
})(zjs);