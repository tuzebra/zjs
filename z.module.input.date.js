// extend module zDateInput cho zjs
;(function(zjs){
"use strict";

	// define locale values
	var lang = zjs('html').getAttr('lang', 'en').split('-');
	lang = lang[0];
	var locale = [];
	locale['en'] = {
		monthName: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		weekDay: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		firstOfWeek: 0
	};
	locale['vi'] = {
		monthName: ['Tháng Một','Tháng Hai','Tháng Ba','Tháng Tư','Tháng Năm','Tháng Sáu','Tháng Bảy','Tháng Tám','Tháng Chín','Tháng Mười','Tháng Mười Một','Tháng Mười Hai'],
		weekDay: ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
		firstOfWeek: 1
	};

	zjs.extendCore({
		moduleDateInputOptions: {
			language: lang,
			firstOfWeek: locale[lang].firstOfWeek // 0: Sunday, ..., 6: Saturday
		}
	});

	var optionkey = 'zjsmoduleDateInputoption';

	// extend method cho zjs-instance
	zjs.extendMethod({
		zDateInput: function(useroption){
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
				option = zjs.clone(zjs.moduleDateInputOptions);

				// extend from inline option ?
				var inlineoption = zElement.getAttr('data-option', '');
				if(zjs.isString(inlineoption) && inlineoption.trim()!='')
					option = zjs.extend(option, ('{'+inlineoption+'}').jsonDecode());

				// extend from user option ?
				if(typeof useroption!='undefined')
					option = zjs.extend(option, useroption);

				// save option
				zElement.setData(optionkey, option);


				// - - -
				// start coding your module

				zElement.on('focus', function(e, o) {
					zjs('#zdate-table').remove();
					// get first and last day of month
					var val = zjs(o).getValue();
					var d = (val == '') ? new Date() : new Date(val);
					if (d == 'Invalid Date') {
						d = new Date();
					} else if (d == 'NaN') { // IE lt 9
						if (val && val != '') {
							var v = val.split('-');
							if (v.length == 3) {
								d = new Date(v[0], v[1]-1, v[2]);
							} else {
								d = new Date();
							}
						} else {
							d = new Date();
						}
					}
					var first = new Date(d.getFullYear(), d.getMonth(), 1);
					var last = new Date(d.getFullYear(), d.getMonth()+1, 0);

					// create header of table
					var myLocale = locale[option.language];
					var tblDate = zjs('<table border="1" id="zdate-table">');
					var tHead = zjs('<thead>');
					tHead.append(zjs('<tr>').append(zjs('<th>').setAttr('colspan', 7).html(myLocale.monthName[d.getMonth()])));
					var tHeadRow = zjs('<tr>');
					for(var i = option.firstOfWeek; i <= option.firstOfWeek+6; i++) {
						tHeadRow.append(zjs('<th>').html(myLocale.weekDay[i%7]));
					}
					tHead.append(tHeadRow);
					tblDate.append(tHead);

					// create body of table
					var tBody = zjs('<tbody>');
					var cur = first;
					var row = zjs('<tr>');
					var j = 0;
					while(cur <= last) {
						if (cur == first) {
							// append empty cells before the first day of month
							for(i = option.firstOfWeek; i < first.getDay(); i++) {
								row.append(zjs('<td>').addClass('zdate-empty').html('&nbsp;'));
								j++;
							}
						}
						var day = cur.getDate();
						var wday = cur.getDay();
						var classname = 'zdate-day';
						if (cur.toDateString() == d.toDateString()) {
							classname += ' zdate-current';
						}
						row.append(zjs('<td>').addClass(classname).html(day));
						j++;
						if (cur.getTime() == last.getTime() && j < 7) {
							// append empty cells after the last day of month
							for(i = last.getDay(); i < option.firstOfWeek+6; i++) {
								row.append(zjs('<td>').addClass('zdate-empty').html('&nbsp;'));
								j++;
							}
						}
						if (wday == ((option.firstOfWeek+6)%7) || cur.getTime() == last.getTime()) {
							tBody.append(row);
							row = zjs('<tr>');
							j = 0;
						}
						cur = new Date(cur.getFullYear(), cur.getMonth(), day + 1);
					}
					tblDate.append(tBody);
					zjs('body').append(tblDate);
					tblDate.hide();
					tblDate.fadeIn();
				});
				zElement.on('blur', function() {
					zjs('#zdate-table').fadeOut({
						callback: function(o) {
							zjs(o).remove();
						}
					});
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
	zjs(function(){zjs('input[type=date]').zDateInput();});
	
	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('input.date');

})(zjs);