// MODULE UI DATEPICKER
// zjs.require('ui, ui.button, ui.slider, moment', function(){
// update: don't require ui.slider
zjs.require('ui, ui.button, moment', function () {
	"use strict";

	var optionkey = 'zmoduleuidatepickeroption',
		wrapelkey = 'zmoduleuidatepickerwrapel',
		calendardatetimekey = 'zmoduleuidatepickercalendardatetime',
		selectdatetimekey = 'zmoduleuidatepickerselectdatetime';

	var lang = zjs('html').getAttr('lang', 'en').split('-');
	lang = lang[0];

	var locale = {
		en: {
			format: 'MM-DD-YYYY',
			calendarTitleFormat: 'MMMM, YYYY',
			timesliderLabel: {
				h: 'hour',
				m: 'minute',
				s: 'second'
			},
			firstOfWeek: 0,
			orbefore: 'or before',
			orafter: 'or after'
		},
		de: {
			format: 'DD.MM.YYYY',
			calendarTitleFormat: 'MMMM, YYYY',
			timesliderLabel: {
				h: 'hour',
				m: 'minute',
				s: 'second'
			},
			firstOfWeek: 0,
			orbefore: 'or before',
			orafter: 'or after'
		},
		vi: {
			format: 'DD-MM-YYYY',
			calendarTitleFormat: 'MMMM, YYYY',
			timesliderLabel: {
				h: 'giờ',
				m: 'phút',
				s: 'giây'
			},
			firstOfWeek: 1,
			orbefore: 'hoặc trước',
			orafter: 'hoặc sau'
		}
	};

	// extend core mot so option
	zjs.extendCore({
		moduleUiDatepickerOption: {
			full: false,
			time: false,

			hour: true,
			hourmin: 0,
			hourmax: 23,
			hourstep: 1,

			minute: true,
			minutemin: 0,
			minutemax: 59,
			minutestep: 1,

			second: true,
			secondmin: 0,
			secondmax: 59,
			secondstep: 1,

			button: true,
			strictInput: false,
			labelPlaceholder: false,
      autoPlaceholder: true,
			language: lang,
			firstOfWeek: locale[lang].firstOfWeek, // 0: Sunday, ..., 6: Saturday
			calendarTitleFormat: locale[lang].calendarTitleFormat,
			format: locale[lang].format,

			href: '',
			selectweek: false,

			inputClass: '',

			disabledDate: false, // disable date

			calendarChangeMonthYear: true, // allow to chage the month & year
			calendarYearFieldUseInput: false,

			// default is need to show panel to select date
			panel: true
		}
	});

	// trigger
	//ui:datepicker:change
	//ui:datepicker:changeMonth
	//ui:datepicker:ready
	//ui:datepicker:blur

	// template
	var datepickerclass = 'zui-datepicker',
		datepickerinputwrapclass = 'zui-datepicker-input-wrap',
		datepickerinputclass = 'zui-datepicker-input',
		datepickerbuttonwrapclass = 'zui-datepicker-button-wrap',
		datepickerbuttonclass = 'zui-datepicker-button',
		contextualbuttonclass = 'zui-contextual-button',
		contextualpanelwrapclass = 'zui-contextual-panel-wrap',
		datepickerpanelwrapclass = 'zui-datepicker-panel-wrap',
		contextualpanelwraphideclass = 'zui-hide',
		datepickerpanelwrapfullclass = 'zui-full',
		datepickerpanelinnerclass = 'zui-datepicker-panel-inner',
		datepickerpanelclass = 'zui-datepicker-panel',
		datepickernavbuttonclass = 'zui-datepicker-nav',
		datepickernavmonthclass = 'zui-datepicker-month-change',
		datepickernavprevclass = 'zui-datepicker-nav-prev',
		datepickernavnextclass = 'zui-datepicker-nav-next',
		datepickertimepanelclass = 'zui-datepicker-time-panel',
		datepickertimeinnerclass = 'zui-datepicker-time-inner',
		datepickerwraphtml = '<div class="' + datepickerclass + '">' +
			'<div class="' + datepickerinputwrapclass + '">' +
			'<input type="text" class="' + contextualbuttonclass + ' ' + datepickerinputclass + '" />' +
			'</div>' +
			'<div class="' + datepickerbuttonwrapclass + '">' +
			'<a class="' + contextualbuttonclass + ' ' + datepickerbuttonclass + '"></a>' +
			'</div>' +
			'<div class="' + contextualpanelwrapclass + ' ' + datepickerpanelwrapclass + ' ' + contextualpanelwraphideclass + '">' +
			'<div class="' + datepickerpanelinnerclass + '">' +
			'<div class="' + datepickerpanelclass + '"></div>' +
			'<div class="' + datepickernavmonthclass + '"></div>' +
			'<a class="' + datepickernavbuttonclass + ' ' + datepickernavprevclass + '" data-count="-1"><i></i></a>' +
			'<a class="' + datepickernavbuttonclass + ' ' + datepickernavnextclass + '" data-count="1"><i></i></a>' +
			'<div class="' + datepickertimepanelclass + '">' +
			'<div class="' + datepickertimeinnerclass + '">' +
			'<div class="timeunit hour"><label>hour</label><span></span><input /></div>' +
			'<div class="timeunit minute"><label>minute</label><span></span><input /></div>' +
			'<div class="timeunit second"><label>second</label><span></span><input /></div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>' +
			'</div>',

		// calendar
		calendarwrapclass = 'zui-calendar-wrap',
		calendarrowclass = 'zui-row',
		calendarmonthclass = 'zui-month',
		calendarweekdayclass = 'zui-weekday',
		calendarcellcurrentclass = 'zui-current-day',
		calendarcellselectedclass = 'zui-selected-day',
		calendarcellemptyclass = 'zui-empty-day',
		calendarrowhtml = '<div class="' + calendarrowclass + '"></div>',
		calendarrowmonthhtml = '<div class="' + calendarrowclass + ' ' + calendarmonthclass + '"></div>',
		calendarrowweekdayhtml = '<div class="' + calendarrowclass + ' ' + calendarweekdayclass + '"></div>',
		calendarcellhtml = '<a class="zui-cell"></a>',
		calendarcellweekdayhtml = '<label></label>',

		// cai nay khong duoc sua doi, vi la defined trong ui.button
		zbuttonlabelclass = 'zui-button-label',
		zbuttonactiveclass = 'activenothover',
		zuihideclass = 'zui-uihide';

	// - - - - - - - - -


	// MAIN FUNCTIONS
	var makeDatepicker = function (element, useroption) {

		var zDatepickerEl = zjs(element);

		// - - - 
		// neu ma co roi thi se ghi lai option
		// option luc nay la option cua user
		var option = zDatepickerEl.getData(optionkey);

		// flag y bao phai refresh lai option
		if (option) {
			zDatepickerEl.setData(optionkey, zjs.extend(option, useroption));
			return;
		};

		// - - - 
		// neu ma chua co thi se lam binh thuong
		// copy option tu default option
		option = zjs.clone(zjs.moduleUiDatepickerOption);
		// extend from inline option ?
		var inlineoption = zDatepickerEl.getAttr('data-option', '');
		if (zjs.isString(inlineoption) && inlineoption.trim() != '')
			option = zjs.extend(option, inlineoption.jsonDecode());
		// sau do remove di luon inline option luon, cho html ra dep
		zDatepickerEl.removeAttr('data-option');
		// extend from user option ?
		if (typeof useroption != 'undefined')
			option = zjs.extend(option, useroption);

		// fix option
		// xem coi neu nhu thang option nay co data-href
		// thi set cho thang a 1 cai href luon
		var href = zDatepickerEl.getAttr('data-href', '');
		if (href != '') option.href = href;

		// fix option
		if (zjs.isString(option.disabledDate))
			option.disabledDate = option.disabledDate.split(/\s*,\s*/);

		// fix option
		if (zjs.isArray(option.disabledDate)) {
			// neu la string thi phai tinh toan de chuyen no thanh cai function haha
			option.disabledDate = (function () {
				var _maybeDates = option.disabledDate,
					_disabledDates = [],
					_maybeDisabledDate = false,
					_today = moment().format('YYYY-MM-DD'),
					_tomorrow = moment().add(1, 'day').format('YYYY-MM-DD'),
					_yesterday = moment().add(-1, 'day').format('YYYY-MM-DD');
				zjs.foreach(_maybeDates, function (_maybeDate) {
					_maybeDate = _maybeDate.trim();
					_maybeDate = _maybeDate.replace('today', _today).replace('tomorrow', _tomorrow).replace('yesterday', _yesterday)
						.replace('to', '<<').replace('before', '<').replace('after', '>');
					var _maybeDate2 = '';
					if (_maybeDate.indexOf('<<') >= 0 && _maybeDate.match(/(\d\d\d\d-\d\d?-\d\d?)\s*<<\s*(\d\d\d\d-\d\d?-\d\d?)/)) {
						_maybeDate = RegExp.$1 + '<<';
						_maybeDate2 = RegExp.$2;
					};
					_maybeDisabledDate = moment(_maybeDate, 'YYYY-MM-DD');
					if (_maybeDisabledDate.isValid()) {
						var _comparison = '=';
						if (_maybeDate.indexOf('<<') >= 0) _comparison = '<<';
						else if (_maybeDate.indexOf('<') >= 0) _comparison = '<';
						else if (_maybeDate.indexOf('>') >= 0) _comparison = '>';

						// fix 1 xiu neu la <<
						if (_comparison == '<<') {
							_maybeDisabledDate.add(-1, 'day');
							_maybeDate2 = moment(_maybeDate2, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
						};

						// push vao thoi
						_disabledDates.push({
							comparison: _comparison,
							date: _maybeDisabledDate.format('YYYY-MM-DD'),
							date2: _maybeDate2 // cai nay khong can check isValid(), boi vi chac chan la valid roi
						});
					};
				});
				// xem coi co duoc thang nao khong?
				if (_disabledDates.length <= 0) return false;

				// neu co disable date thi phai return ve function thoi
				return function (_theDate) {
					// loop and test
					// neu nhu chi can 1 thang thoa man, thi lap tuc xac dinh la disabled
					var _disabled = false,
						_method = '';
					zjs.foreach(_disabledDates, function (_disabledDate) {
						if (_disabledDate.comparison == '=') _method = 'isSame';
						else if (_disabledDate.comparison == '<') _method = 'isBefore';
						else if (_disabledDate.comparison == '>') _method = 'isAfter';
						else if (_disabledDate.comparison == '<<') _method = 'isBetween';
						if (moment(_theDate, 'YYYY-MM-DD')[_method](_disabledDate.date, _disabledDate.date2)) {
							_disabled = true;
							return false;
						}
					});
					return _disabled;
				};
			})();
		};

		// fix option
		// neu toi day ma cai thang option disabledDate ma khong phai la function
		// thi thoi, coi nhu khong co
		if (!zjs.isFunction(option.disabledDate))
			option.disabledDate = false;

		// fix option panel
		option.panel = !!option.panel;

		// fix option strictInput
		option.strictInput = !!option.strictInput;
		if (option.strictInput) option.button = false;

		// save option
		zDatepickerEl.setData(optionkey, option);

		// - - -
		// start coding module

		// van giu nguyen element nguyen goc
		// chi tao ra, va add class cho mot element insert after
		var zDatepickerWrapEl = zjs(datepickerwraphtml).insertAfter(zDatepickerEl);

		// xem coi neu nhu khong su dung button
		// thi nen move het tat ca vao trong cai div wrap
		// de ma con css cho no de dang
		//if(!option.button){
		//	zDatepickerEl.prependTo(zDatepickerWrapEl);
		//};
		// => UPDATE:
		// khong the lam nhu vay duoc
		// boi vi se co truong hop user muon custom format xuat hien
		// nhung data thuc te de ma input len server phai luon la dang chuan
		// cho nen luon luon phai hide di cai input thuc su nay

		// sau do luu lai luon de sau nay truy xuat
		zDatepickerEl.setData(wrapelkey, zDatepickerWrapEl);

		// get ra value hien tai cua input
		var value = zDatepickerEl.getValue('');
		var selectdatetime = null;
		if(value == '' && !option.strictInput)selectdatetime = moment();
		if(value){
      selectdatetime = moment(value, 'YYYY-MM-DD HH:mm:ss');
    }

		// fix lai selectdatetime theo option
		// boi vi nhieu khi se khong cho chon second, hoac minute, hoac hour
		// nen neu nhu khong chon, thi se set = 0
		if (!option.hour) selectdatetime.hour(0);
		if (!option.minute) selectdatetime.minute(0);
		if (!option.second) selectdatetime.second(0);


		var _defaultPlaceholder = zDatepickerEl.getAttr('placeholder', '');
		var placeholder = _defaultPlaceholder;

		// set lang cho chuan coi
		if(selectdatetime)
			selectdatetime.locale(option.language);



		// PANEL 
		// - - - 

		// get ra thang panel de append cai calendar cho no
		var zDatepickerPanelWrapEl = zDatepickerWrapEl.find('.' + datepickerpanelwrapclass),
			zDatepickerPanelEl = zDatepickerWrapEl.find('.' + datepickerpanelclass),
			zDatepickerTimePanelEl = zDatepickerWrapEl.find('.' + datepickertimepanelclass);

		if (option.full) zDatepickerPanelWrapEl.addClass(datepickerpanelwrapfullclass);
		if (!option.panel)zDatepickerPanelWrapEl.remove();

		// neu nhu khong cho timepicker
		// thi remove luon cho nhe nguoi
		if (!option.time) {
			zDatepickerTimePanelEl.remove();
			// con neu nhu co timepicker 
			// thi se init 1 so thu
		} else if (!('makeUiSlider' in zDatepickerTimePanelEl)) {
			// console.warn('dont have ui slider');
			zDatepickerTimePanelEl.remove();
		} else if (option.panel) {
			// stop event lai de khong hide di cai panel khi click vao cai panel
			zDatepickerPanelWrapEl.on('click', function (event) {
				event.preventDefault();
				event.stop();
			});

			if (option.hour) {
				var hourEl = zDatepickerTimePanelEl.find('.hour'),
					hourrefererEl = hourEl.find('span');
				hourEl.find('label').setInnerHTML(locale[option.language].timesliderLabel.h);
				hourEl.find('input').setValue(selectdatetime.hour())
					.makeUiSlider({
						min: option.hourmin,
						max: option.hourmax,
						step: option.hourstep,
						referer: hourrefererEl
					})
					.on('ui:slider:change', function (event) {
						var selectdatetime = zDatepickerEl.getData(selectdatetimekey).hour(event.getData().value);
						// show ra button luon
						zDatepickerWrapEl.find('.' + zbuttonlabelclass).setInnerHTML(selectdatetime.format(option.format));
						// trigger
						// nhung phai kiem tra neu nhu day la chu dong thay doi value slider
						// thi moi phai run trigger
						// chu neu nhu gian tiep bi thay doi slider value (thong qua sliderSetValue) thi thoi
						if (event.getData().via == 'setvalue') return;
						var value = selectdatetime.format('YYYY-MM-DD HH:mm:ss');
						zDatepickerEl.setAttr('value', value).setValue(value);
						zDatepickerEl.trigger('ui:datepicker:change', {
							value: value
						});
					});
			} else {
				zDatepickerTimePanelEl.find('.hour').remove();
			};

			if (option.minute) {
				var minuteEl = zDatepickerTimePanelEl.find('.minute'),
					minuterefererEl = minuteEl.find('span');
				minuteEl.find('label').setInnerHTML(locale[option.language].timesliderLabel.m);
				minuteEl.find('input').setValue(selectdatetime.minute())
					.makeUiSlider({
						min: option.minutemin,
						max: option.minutemax,
						step: option.minutestep,
						referer: minuterefererEl
					})
					.on('ui:slider:change', function (event) {
						var selectdatetime = zDatepickerEl.getData(selectdatetimekey).minute(event.getData().value);
						// show ra button luon
						zDatepickerWrapEl.find('.' + zbuttonlabelclass).setInnerHTML(selectdatetime.format(option.format));
						// trigger
						if (event.getData().via == 'setvalue') return;
						var value = selectdatetime.format('YYYY-MM-DD HH:mm:ss');
						zDatepickerEl.setAttr('value', value).setValue(value);
						zDatepickerEl.trigger('ui:datepicker:change', {
							value: value
						});
					});
			} else {
				zDatepickerTimePanelEl.find('.minute').remove();
			};

			if (option.second) {
				var secondEl = zDatepickerTimePanelEl.find('.second'),
					secondrefererEl = secondEl.find('span');
				secondEl.find('label').setInnerHTML(locale[option.language].timesliderLabel.s);
				secondEl.find('input').setValue(selectdatetime.second())
					.makeUiSlider({
						min: option.secondmin,
						max: option.secondmax,
						step: option.secondstep,
						referer: secondrefererEl
					})
					.on('ui:slider:change', function (event) {
						var selectdatetime = zDatepickerEl.getData(selectdatetimekey).second(event.getData().value);
						// show ra button luon
						zDatepickerWrapEl.find('.' + zbuttonlabelclass).setInnerHTML(selectdatetime.format(option.format));
						// trigger
						if (event.getData().via == 'setvalue') return;
						var value = selectdatetime.format('YYYY-MM-DD HH:mm:ss');
						zDatepickerEl.setAttr('value', value).setValue(value);
						zDatepickerEl.trigger('ui:datepicker:change', {
							value: value
						});
					});
			} else {
				zDatepickerTimePanelEl.find('.second').remove();
			};


			// sau khi make slider xong roi, thi co the value da bi thay doi do step lam tron
			// nen phai set lai gia tri gio phut giay
			if (option.hour) selectdatetime.hour(hourEl.find('input').getValue());
			if (option.minute) selectdatetime.minute(minuteEl.find('input').getValue());
			if (option.second) selectdatetime.second(secondEl.find('input').getValue());
		};


		// luu current calendar date de sau nay truy xuat
		var theFirstCalendardatetime = moment(selectdatetime);
		zDatepickerEl.setData(calendardatetimekey, theFirstCalendardatetime);
		zDatepickerEl.setData(selectdatetimekey, moment(selectdatetime));


		// set vo input lai cho chuan
		// neu nhu cai input truyen vao mac dinh la empty
		// va dong thoi cung co truyen vao placeholder
		// o dau thi khong biet, chu trong setvalue thi phai set theo 1 chuan thoi
		var valueForOrgInput = !selectdatetime ? '' : selectdatetime.format(option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
		if (valueForOrgInput && valueForOrgInput.toString() !== 'Invalid date' && (value != '' || placeholder == '')) {
			// set ca 2 attribute va value luon 
			// (trong truong hop form chua input nay duoc move di dau do
			// thi browser se tu lay attribute value de ma set lai value 
			// cua input cho dung - vi attribute value va value khong phai la mot)
			// truoc khi set value thi phai check coi co bi disable hay khong da
			if (!option.disabledDate || !option.disabledDate(selectdatetime.format('YYYY-MM-DD'))) {
				zDatepickerEl.setAttr('value', valueForOrgInput).setValue(valueForOrgInput);
				zDatepickerWrapEl.addClass('has-value');
				// run trigger
				zDatepickerEl.trigger('ui:datepicker:change', {
					value: valueForOrgInput
				});
			};
		};


		// CAN CHANGE THE MONTH/YEAR?
		// neu nhu khong the change, thi remove luon
		var zDatepickerNavMonthWrap = zDatepickerPanelWrapEl.find('.' + datepickernavmonthclass),
			zDatepickerNavInputMonth = false,
			zDatepickerNavInputYear = false;

		if (!option.calendarChangeMonthYear) {
			zDatepickerNavMonthWrap.remove();
		} else if (option.panel) {
			var _moment = moment();
			_moment.locale(option.language);
			var _html = '<select class="zui-calendar-input-month">';
			// fill the function
			var getHtmlForSelectMonth = function (month) {
				var _h = '';
				var _m = moment();
				_m.locale(option.language);
				for (var i = 0; i < 12; i++)
					_h += '<option value="' + i + '" ' + (month == i ? 'selected' : '') + ' >' + _m.month(i).format(option.full ? 'MMMM' : 'MMM') + '</option>';
				return _h;
			};
			_html += getHtmlForSelectMonth(theFirstCalendardatetime.month());
			_html += '</select>';

			// neu su dung input cho year
			if (option.calendarYearFieldUseInput) {
				_html += '<input class="zui-calendar-input-year" value="' + _moment.format('YYYY') + '" />';
			} else {
				// fill the function
				var getHtmlForSelectYear = function (year) {
					var _h = '';
					for (var y = year - 40; y <= year + 20; y++)
						_h += '<option value="' + y + '" ' + (y == year ? 'selected' : '') + ' >' + (y == year - 40 ? y + ' (' + locale[option.language].orbefore + ')' : (y == year + 20 ? y + ' (' + locale[option.language].orafter + ')' : y)) + '</option>';
					return _h;
				};

				_html += '<select class="zui-calendar-input-year">';
				_html += getHtmlForSelectYear(_moment.year());
				_html += '</select>';
			};
			zDatepickerNavMonthWrap.setInnerHTML(_html);

			// navigation input month & year
			zDatepickerNavInputMonth = zDatepickerNavMonthWrap.find('.zui-calendar-input-month');
			zDatepickerNavInputYear = zDatepickerNavMonthWrap.find('.zui-calendar-input-year');

			// gio se change cai 

			// Bind event cho 2 cai input month & year
			// neu nhu co option change month year
			// khi click vao day thi se trigger blur cai input
			// nen phai test cho chac
			zDatepickerWrapEl.on('click', '.zui-calendar-input-month, .zui-calendar-input-year', function (event) {
				if (zDatepickerInputEl)
					if (zDatepickerInputEl.hasClass('isfocus'))
						preventBlurEventOnInputFieldEl = true;

				event.preventDefault();
				event.stop();
			});

			// function ve lai cai lich trong truong hop nay
			var _drawCalendarViaInputMonth = function () {

				var rightValueHuh = moment();
				rightValueHuh
					.month(zDatepickerNavInputMonth.getValue().toInt())
					.year(zDatepickerNavInputYear.getValue().toInt());
				// neu nhu khong hop le thi thoi, return luon
				if (!rightValueHuh.isValid()) return;

				var calendardatetime = zDatepickerEl.getData(calendardatetimekey),
					selectdatetime = zDatepickerEl.getData(selectdatetimekey);

				calendardatetime
					.month(rightValueHuh.month())
					.year(rightValueHuh.year());

				// ve lai cai lich
				zDatepickerPanelEl.find('.' + calendarwrapclass).remove();
				zDatepickerPanelEl.append(drawCalendar(calendardatetime, selectdatetime, option));

				// trigger
				zDatepickerEl.trigger('ui:datepicker:changeMonth', {
					value: calendardatetime.format(option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
				});

			};

			// Bind event cho cai year
			// trong truong hop cai year la input
			if (option.calendarYearFieldUseInput) {
				zDatepickerNavInputYear
					.on('keydown', function (event) {
						// neu nhu khong nhap dung, thi thoi se khong cho nhap nua
						if ([48, 49, 50, 51, 52, 53, 54, 55, 56, 57, /*left right*/ 37, 39, /*backspace tab enter*/ 8, 9, 13].indexOf(event.getKeyCode()) < 0) {
							event.preventDefault();
							return;
						};
					})
					.on('keyup', _drawCalendarViaInputMonth);
			}
			// con trong truong hop cai year la select box
			else {
				zDatepickerNavInputYear.on('change', _drawCalendarViaInputMonth);
			}

			// Bind event cho cai month
			zDatepickerNavInputMonth.on('change', _drawCalendarViaInputMonth);

		};


		// CAN CLICK TO NAVIGATE NEXT/PREV MONTH?

		// bind event cho 2 cai nut nav prev/next month
		zDatepickerWrapEl.find('.' + datepickernavbuttonclass).click(function (event) {
			// khi click vao day thi se trigger blur cai input
			// nen phai test cho chac
			if (zDatepickerInputEl)
				if (zDatepickerInputEl.hasClass('isfocus'))
					preventBlurEventOnInputFieldEl = true;
			var self = zjs(this);
			event.preventDefault();
			event.stop();
			var calendardatetime = zDatepickerEl.getData(calendardatetimekey),
				selectdatetime = zDatepickerEl.getData(selectdatetimekey);
			calendardatetime.month(calendardatetime.month() + self.getAttr('data-count').toInt());
			// ve lai cai lich
			zDatepickerPanelEl.find('.' + calendarwrapclass).remove();
			zDatepickerPanelEl.append(drawCalendar(calendardatetime, selectdatetime, option));
			// trigger
			zDatepickerEl.trigger('ui:datepicker:changeMonth', {
				value: calendardatetime.format(option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
			});
		});




		// INPUT-FIELD OR BUTTON 
		// - - - -

		var zDatepickerInputEl = false,
			zDatepickerButtonEl = false,
			zWrapperInput = false;

		var zDatepickerInputElReal = false;

		var zStrictInputBehide = false;

		var substr = function(str, start, length){
			start = start || 0;
			length = length || 1;
			if(length === 1)return str[start];
			if(length === 2)return str[start]+str[start+1];
			if(length === 3)return str[start]+str[start+1]+str[start+2];
			if(length === 4)return str[start]+str[start+1]+str[start+2]+str[start+3];
			if(length === 5)return str[start]+str[start+1]+str[start+2]+str[start+3]+str[start+4];
			if(length === 6)return str[start]+str[start+1]+str[start+2]+str[start+3]+str[start+4]+str[start+5];
			return str.substr(start, length);
		}
		var substrLast = function(str){
			// return str.substr(str.length - 1);
			return str[str.length - 1];
		}

		var triggerEmptyValue = function(){
			zDatepickerEl.setAttr('value', '').setValue('');
			// run trigger
			zDatepickerEl.trigger('ui:datepicker:change', {
				value: ''
			});
		}

		// ham chiu trach nhiem format input behide
		var formatInputBehide = function (rawvalueBefore, keyCode) {
			if (!option.strictInput) return;
			rawvalueBefore = rawvalueBefore || null;
			keyCode = keyCode || 0;

			// var userRawInput = zDatepickerInputEl.getValue().trim();
			var userRawInput = zDatepickerInputElReal.value.trim();
			var isAdd = (rawvalueBefore === null || userRawInput.length > rawvalueBefore.length);

			var _tpl = '';
			// hardcode vai truong hop
			if (option.format === 'DD.MM.YYYY') _tpl = '<span class="zdd">DD</span>.<span class="zmm">MM</span>.<span class="zyyyy">YYYY</span>';
			// neu khong co template thi thua
			if (_tpl === '') return '';

			// render thoi
			zStrictInputBehide.html(_tpl);

			// co gang phan tich cai user go vao, de render ra template phu hop
			var dayInt = null;
			var monthInt = null;
			var yearInt = null;
			var currentActiveComp = null;

			if (option.format === 'DD.MM.YYYY') {

				// fix ngay may truong hop nay:
				// - vi 1 ly do gi do ma xuat hien 2 cai dot "." nam canh nhau
				// - hoac la co nhieu hon 2 dau "."
				var testReplacedUserRawInput = userRawInput.replace(/\.(\.)+/g, '.').split('.').splice(0, 3).join('.');
				if (testReplacedUserRawInput.length !== userRawInput.length) {
					userRawInput = testReplacedUserRawInput;
					zDatepickerInputEl.setValue(userRawInput);
				}

				var isDotEnd = substrLast(userRawInput) === '.';
				var isFullDot = userRawInput.split('.').length >= 3;

				if (rawvalueBefore !== null && rawvalueBefore !== '' &&
					!isFullDot &&
					substrLast(rawvalueBefore) !== '.'
				) {
					if (keyCode === 191 || keyCode === 111 /* / */ ||
					  keyCode === 190 || keyCode === 110 /* . */ ||
						keyCode === 39 /* -> */
					) {
						if(!isDotEnd)userRawInput = userRawInput + '.';
						isDotEnd = isAdd = true;
					}
				}

				// fix cai raw input trong vai truong hop
				// "4" => "04."
				if (userRawInput.length === 1 && isAdd && parseInt(userRawInput) >= 4) {
					userRawInput = '0' + userRawInput + '.';
					isDotEnd = true;
					zDatepickerInputEl.setValue(userRawInput);
				}
				// "1." => "01."
				if (userRawInput.length === 2 && isDotEnd && isAdd) {
					userRawInput = '0' + userRawInput;
					zDatepickerInputEl.setValue(userRawInput);
				}
				// "32" => "03.2"
				if (userRawInput.length === 2) {
					var _testDay = parseInt(userRawInput);
					if (!isNaN(_testDay) && _testDay >= 32) {
						userRawInput = '0' + userRawInput[0] + '.0' + userRawInput[1] + '.';
						isDotEnd = true;
						zDatepickerInputEl.setValue(userRawInput);
					}
				}
				// "1" add "2" => "12."
				if (userRawInput.length === 2 && !isDotEnd && isAdd) {
					isDotEnd = true;
					userRawInput = userRawInput + '.';
					zDatepickerInputEl.setValue(userRawInput);
				}

				if (userRawInput.length === 3 && userRawInput.indexOf('.') < 1) {
					// vay la can phai fix roi
					userRawInput = substr(userRawInput, 0, 2) + '.' + substr(userRawInput, 2);
					zDatepickerInputEl.setValue(userRawInput);
				}
				// "12.2" => "12.02."
				if (userRawInput.length === 4 && userRawInput.indexOf('.') === 2 && isAdd && !isDotEnd) {
					var _userRawInputArr = userRawInput.split('.');
					var _testMonth = parseInt(_userRawInputArr[1]);
					if (!isNaN(_testMonth) && _testMonth >= 2) {
						userRawInput = _userRawInputArr[0] + '.0' + _userRawInputArr[1] + '.';
						zDatepickerInputEl.setValue(userRawInput);
						isDotEnd = true;
					}
				}
				if (userRawInput.length === 4 && userRawInput.indexOf('.') === 1) {
					var _userRawInputArr = userRawInput.split('.');
					var _testMonth = parseInt(_userRawInputArr[1]);
					if (!isNaN(_testMonth) && _testMonth > 12) {
						userRawInput = _userRawInputArr[0] + '.' + substr(_userRawInputArr[1], 0) + '.' + substr(_userRawInputArr[1], 1);
						zDatepickerInputEl.setValue(userRawInput);
					}
				}
				// "01.1." => "01.01."
				if (userRawInput.length === 5 && userRawInput.indexOf('.') === 2 && isAdd && isDotEnd) {
					userRawInput = substr(userRawInput, 0, 2) + '.0' + substr(userRawInput, 3);
					zDatepickerInputEl.setValue(userRawInput);
				}
				// "11.09" => "11.09."
				// "11.10" => "11.10."
				// "11.11" => "11.11."
				// "11.12" => "11.12."
				// "11.13" => "11.01.3"
				if (userRawInput.length === 5 && userRawInput.indexOf('.') === 2 && isAdd) {
					var _userRawInputArr = userRawInput.split('.');
					var _testMonth = parseInt(_userRawInputArr[1]);
					if (!isNaN(_testMonth)) {
						if (_testMonth >= 13) {
							userRawInput = _userRawInputArr[0] + '.0' + substr(_userRawInputArr[1], 0) + '.' + substr(_userRawInputArr[1], 1);
						} else {
							userRawInput = _userRawInputArr[0] + '.' + _userRawInputArr[1] + '.';
							isDotEnd = true;
						}
						zDatepickerInputEl.setValue(userRawInput);
					}
				}
				// "12.099" => "12.09.9"
				// "12.029" => "12.02.9"
				// "12.13." => "12.01.3"
				// "12.012" => "12.01.2"
				// "12.101" => "12.10.1"
				if (userRawInput.length === 6 && userRawInput.indexOf('.') === 2 && !isDotEnd) {
					var _userRawInputArr = userRawInput.split('.');
					var _testMonth = parseInt(_userRawInputArr[1]);
					if(!isNaN(_testMonth)){
						if(_testMonth <= 9){userRawInput = _userRawInputArr[0] + '.0' + _testMonth + '.';isDotEnd = true;}
						else if(_testMonth >= 13 && _testMonth <= 99)userRawInput = _userRawInputArr[0] + '.0' + substr(_testMonth+'', 0) + '.' + substr(_testMonth+'', 1);
						else if(_testMonth >= 100 && _testMonth <= 129)userRawInput = _userRawInputArr[0] + '.' + substr(_testMonth+'', 0, 2) + '.' + substr(_testMonth+'', 2);
						else if(_testMonth >= 130)userRawInput = _userRawInputArr[0] + '.0' + substr(_testMonth+'', 0) + '.' + substr(_testMonth+'', 1, 2);
						zDatepickerInputEl.setValue(userRawInput);
					}
				}
				// "01.011" => "01.01.1"
				if (userRawInput.length === 6 && userRawInput.indexOf('.') === 2 && isAdd && !isDotEnd) {
					userRawInput = substr(userRawInput, 0, 5) + '.' + substr(userRawInput, 5);
					zDatepickerInputEl.setValue(userRawInput);
				}
				// "01.01.75" => "01.01.1975"
				if (userRawInput.length === 8 && userRawInput.indexOf('.') === 2 && isAdd && !isDotEnd) {
					var _userRawInputArr = userRawInput.split('.');
					if (_userRawInputArr[2] && !isNaN(parseInt(_userRawInputArr[2]))) {
						if (parseInt(_userRawInputArr[2]) <= 9) {
							userRawInput = substr(userRawInput, 0, 5) + '.20' + substr(userRawInput, 6, 2);
							zDatepickerInputEl.setValue(userRawInput);
						} else if (parseInt(_userRawInputArr[2]) >= 30) {
							userRawInput = substr(userRawInput, 0, 5) + '.19' + substr(userRawInput, 6, 2);
							zDatepickerInputEl.setValue(userRawInput);
						}
					}
				}
				// end fix!

				var userRawInputArr = userRawInput.split('.');

				if (userRawInputArr.length >= 1) {
					currentActiveComp = 'dd';
					if (userRawInputArr[0] !== '') {
						dayInt = userRawInputArr[0];
					}
				}
				if (userRawInputArr.length >= 2) {
					currentActiveComp = 'mm';
					if (userRawInputArr[1] !== '') monthInt = userRawInputArr[1];
				}
				if (userRawInputArr.length >= 3) {
					currentActiveComp = 'yyyy';
					if (userRawInputArr[2] !== '') yearInt = userRawInputArr[2];
				}

				// fix truong hop dat biet
				if (userRawInputArr.length >= 2 && userRawInputArr[0].trim() === '' && userRawInputArr[1].trim() === '') {
					currentActiveComp = null;
				}
			}

			if (dayInt !== null) zStrictInputBehide.find('.zdd').html(dayInt.toString()).addClass('int');
			if (monthInt !== null) zStrictInputBehide.find('.zmm').html(monthInt.toString()).addClass('int');
			if (yearInt !== null) zStrictInputBehide.find('.zyyyy').html(yearInt.toString()).addClass('int');

			zStrictInputBehide.find('span').removeClass('active');
			if (currentActiveComp !== null) zStrictInputBehide.find('.z' + currentActiveComp).addClass('active');

			return userRawInput;
		};

		// neu nhu ma su dung button thay cho input text thi make button
		if (!option.button) {
			zWrapperInput = zDatepickerWrapEl.find('.' + datepickerinputwrapclass);
			// khi cai thang wrapper input click vao thi se auto focus cai thang input luon
			zWrapperInput.on('click', function () {
				zDatepickerInputEl.focus();
			});

			zDatepickerWrapEl.find('.' + datepickerbuttonwrapclass).remove();

			//var
			zDatepickerInputEl = zDatepickerWrapEl.find('.' + datepickerinputclass);
			zDatepickerInputElReal = zDatepickerInputEl.item(0, 1);

			// set placeholder & default value
			if ((value != '' || placeholder == '')) {
				if(selectdatetime && selectdatetime.toString() !== 'Invalid date'){
					// gi thi gi chu cung can phai kiem tra co bi disabledDate hay khong?
					if (!option.disabledDate || !option.disabledDate(selectdatetime.format('YYYY-MM-DD')))
						zDatepickerInputEl.setValue(selectdatetime.format(option.format));
				}
			};
			var orgPlaceholder = placeholder;
			if (orgPlaceholder == ''){
				if(option.autoPlaceholder)
					orgPlaceholder = option.format;
			}

			// Ho tro show placeholder nhu 1 cai label
			if (option.labelPlaceholder && orgPlaceholder !== '') {
				zjs('<span>').addClass('placeholder').html(orgPlaceholder).insertAfter(zWrapperInput);
				zWrapperInput.addClass('label-placeholder');
				zDatepickerInputEl.setAttr('placeholder', '');
			} else {
				zDatepickerInputEl.setAttr('placeholder', orgPlaceholder);
			}

			// set class to make style
			zDatepickerInputEl.addClass(option.inputClass);
			// remove autosuggess
			zDatepickerInputEl.setAttr('autocomplete', 'off');

			// tao ra 1 cai strictInput helper thoi
			if (option.strictInput) {

				// fix maxlength
				zDatepickerInputEl.setAttr('maxlength', option.format.length);

				zStrictInputBehide = zjs('<div>').addClass('zui-datepicker-input-behide');
				zStrictInputBehide.insertBefore(zDatepickerInputEl);
				formatInputBehide();
			}

			// set

			// auto redirect focus luon
			zDatepickerEl.on('focus', function () {
				zDatepickerInputEl.focus();
			});

			// bay gio quan trong:
			// khi ma focus vao cai field nay, thi phai show len cai datepicker
			var preventBlurEventOnInputFieldEl = false;
			zDatepickerInputEl.on('focus', function (event) {
				event.preventDefault();

				// reset cai format lien
				formatInputBehide();

				preventBlurEventOnInputFieldEl = false;
				var self = zjs(this);
				// kiem tra coi button nay co active chua truoc tien
				//var actived = zDatepickerEl.hasClass(zbuttonactiveclass);
				// check xem cac zselectbox khac hide active stage
				zjs('.' + datepickerinputclass).removeClass('isfocus');
				zjs('.' + contextualbuttonclass).removeClass(zbuttonactiveclass);
				zjs('.' + contextualpanelwrapclass).addClass(contextualpanelwraphideclass);
				// gio moi active cai cua minh
				// neu nhu ma chua co active thi moi active
				// co roi thi thoi (se hide luon, vi o tren la vua hide all luon)
				//if(actived)return;
				self.addClass('isfocus');
				zDatepickerWrapEl.addClass('focus');
				//(function(){
				zDatepickerEl.addClass(zbuttonactiveclass);
				if (option.panel) {
					zDatepickerPanelWrapEl.removeClass(contextualpanelwraphideclass);
				}
				//}).delay(100);

				zDatepickerEl.trigger('ui:datepicker:focus', {});
			});

			zDatepickerInputEl.on('click', function (event) {
				// phai stop, ko thoi thi event truyen thang xuong document luon
				event.stop();
			});

			var tempInputingValue = '';


			// >>>>>>>>>>>>>>>>>>
			zDatepickerInputEl.on('keydown', function (event) {
				var rawvalue = this.getValue().trim();
				var keyCode = event.getKeyCode();

				// neu nhu dung cai thang format thi moi lam
				// khong thoi lai mat cong
				if (
					option.format != 'DD/MM/YYYY' &&
					option.format != 'DD.MM.YYYY'
				) return;

        var prevent = false;

				// neu nhu khong nhap dung, thi thoi se khong cho nhap nua
				if ([
					/*number*/
          48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
          96, 97, 98, 99, 100,101,102,103,104,105,
					/*left right*/
					37, 39,
					/*backspace tab enter */
					8, 9, 13,
					/* chu A */
					65,
					191,
					190
				].indexOf(keyCode) < 0) {
					prevent = true;
				}

				/* dau / normal & numpad */
				if ((keyCode === 191 || keyCode === 111) && option.format !== 'DD/MM/YYYY') prevent = true;

				/* dau . */
				if ((keyCode === 190 || keyCode === 110) && option.format !== 'DD.MM.YYYY') prevent = true;
				if ((keyCode === 190 || keyCode === 110) && rawvalue === '') prevent = true;
				if ((keyCode === 190 || keyCode === 110) && substrLast(rawvalue) === '.') prevent = true;


				// neu nhu go vao chu A, ma khong kem theo command/control thi thoi
				if (!prevent && keyCode === 65 && !event.metaKey()) prevent = true;

				if (option.strictInput) {
					(function () {
						var fixedInputValue = formatInputBehide(rawvalue, keyCode);
						if(fixedInputValue.length < option.format.length){
							triggerEmptyValue();
						}
						else{
							zDatepickerInputEl.trigger('blur');
						}
					}).delay(30);
				}

				if (prevent) {
					event.preventDefault();
				}
			});

			zDatepickerInputEl
				.on('keyup', function (event) {
					event.preventDefault();

					if(option.strictInput && !option.panel)return;

					var self = zjs(this);
					tempInputingValue = self.getValue('');
					if (tempInputingValue)
						tempInputingValue = tempInputingValue.trim();


					if (tempInputingValue == '') return triggerEmptyValue();

					// bay gio thi co gang di phan tich coi co ra duoc cai value gi khong? base on option.format
					var rightValueHuh = moment(tempInputingValue, option.format);
					if (!rightValueHuh.isValid()) return triggerEmptyValue();


					// ok, neu nhu ma dung doi, thi se set lai calendar time, va selected time luon
					var calendardatetime = zDatepickerEl.getData(calendardatetimekey),
						selectdatetime = zDatepickerEl.getData(selectdatetimekey);

					calendardatetime.year(rightValueHuh.year()).month(rightValueHuh.month()).date(rightValueHuh.date());
					selectdatetime.year(rightValueHuh.year()).month(rightValueHuh.month()).date(rightValueHuh.date());

					// >>>>>>
					//console.log('tempInputingValue', tempInputingValue);
					//console.log('rightValueHuh', rightValueHuh.toString());

					// vay la thay doi selectdatetime luon
					//var selectdatetime = zDatepickerEl.getData(selectdatetimekey);
					//selectdatetime = rightValueHuh;
					//rightValueHuh.locale(option.language);

					// luu lai thoi
					//zDatepickerEl.setData(selectdatetimekey, selectdatetime);
					// => UPDATE:
					// chua co luu lai, boi vi dang inputing thoi

					// co gang ve lai cai lich xem choi
					zDatepickerPanelEl.find('.' + calendarwrapclass).remove();
					zDatepickerPanelEl.append(drawCalendar(calendardatetime, selectdatetime, option));

					// set lai cai calendar time luon
					// de co gi con su dung dc cai nut next, pre
					//zDatepickerEl.setData(calendardatetimekey, rightValueHuh);
				});

			// khi ma lost focus
			// thi moi update thiet su cai thong tin 
			zDatepickerInputEl.on('blur', function (event) {

				var self = zjs(this);
				tempInputingValue = self.getValue('');
				if (tempInputingValue)
					tempInputingValue = tempInputingValue.trim();

				(function () {

					// khi ma lo co click vao trong context panel
					// thi se khong lam gi voi cai nay
					if (preventBlurEventOnInputFieldEl) {
						//console.log('preventBlurEventOnInputFieldEl');
						return;
					}

					// vay la thay doi selectdatetime luon
					var rightValueHuh;
					//var selectdatetime = zDatepickerEl.getData(selectdatetimekey);
					if (tempInputingValue != '') {
						// bay gio thi co gang di phan tich coi co ra duoc cai value gi khong? base on option.format
						rightValueHuh = moment(tempInputingValue, option.format);
						if (!rightValueHuh.isValid())
							tempInputingValue = '';
						if (tempInputingValue != '' && option.disabledDate && option.disabledDate(rightValueHuh.format('YYYY-MM-DD')))
							tempInputingValue = '';
					};

					// gio moi bat dau check lai
					if (tempInputingValue != '') {

						// gio thi chac chan la cai thang right value chinh xac roi
						// nen la se thoi
						var calendardatetime = zDatepickerEl.getData(calendardatetimekey),
							selectdatetime = zDatepickerEl.getData(selectdatetimekey);

						if(rightValueHuh && (!selectdatetime || selectdatetime.toString() === 'Invalid date')){
							selectdatetime = moment(rightValueHuh);
						}

						selectdatetime.year(rightValueHuh.year()).month(rightValueHuh.month()).date(rightValueHuh.date());
						calendardatetime.year(rightValueHuh.year()).month(rightValueHuh.month()).date(rightValueHuh.date());

						// luu lai thoi
						zDatepickerEl.setData(selectdatetimekey, selectdatetime);
						zDatepickerEl.setData(calendardatetimekey, calendardatetime);

						// co gang ve lai cai lich xem choi
						zDatepickerPanelEl.find('.' + calendarwrapclass).remove();
						zDatepickerPanelEl.append(drawCalendar(calendardatetime, selectdatetime, option));

						// format lai cai thang input show ra cho chuan
						self.setValue(selectdatetime.format(option.format));

						// add them class cho vui
						zDatepickerWrapEl.addClass('has-value');

						// format lai value (real original input)
						var value = selectdatetime.format(option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
						// o dau thi khong biet, chu trong setvalue thi 
						// phai set theo 1 chuan thoi (YYYY-MM-DD HH:mm:ss)
						// set luon attribute value (doc comment o tren)
						zDatepickerEl.setAttr('value', value).setValue(value);
						// run trigger
						zDatepickerEl.trigger('ui:datepicker:change', {
							value: value
						});
					}

					// neu nhu xui xui xoa het tron data
					else {
						zDatepickerWrapEl.removeClass('has-value');
						zDatepickerInputEl.setValue('');
						zDatepickerEl.setAttr('value', '').setValue('');
						// run trigger
						zDatepickerEl.trigger('ui:datepicker:change', {
							value: ''
						});
					};

					// trigger blur run cuoi cung
					zDatepickerEl.trigger('ui:datepicker:blur', {});

					// xong roi thi trigger cai validation thoi
					//if('moduleFormValidationOption' in zjs && zjs.isObject(zjs.moduleFormValidationOption))
					//	zDatepickerEl.findUp('form').formValidationCheck();

					// hide het cai context panel show ra
					//zjs(document).trigger('click');
					//console.log('zDatepickerPanelEl.addClass(contextualpanelwraphideclass);');
					//console.log('zDatepickerPanelEl', zDatepickerPanelEl.item(0, self));
					if(option.panel){
						zDatepickerPanelWrapEl.addClass(contextualpanelwraphideclass);
					}

					self.removeClass('isfocus');
					zDatepickerWrapEl.removeClass('focus');

				}).delay(200);

			});

		} else {

			zDatepickerWrapEl.find('.' + datepickerinputwrapclass).remove();

			//var 
			zDatepickerButtonEl = zDatepickerWrapEl.find('.' + datepickerbuttonclass);
			// truoc tien phai make no thanh zjs uibutton cai da
			zDatepickerButtonEl.makeButton();
			// sau do se thu set html cho button 
			// nhung phai xem xet them 1 chut nua
			// la neu nhu co default value thi minh se set la cai value do luon
			// nhung neu nhu khong co default value
			// ma lai co placeholder, thi se show ra placeholder
			var orgPlaceholder = placeholder;
			if (orgPlaceholder == ''){
				if(option.autoPlaceholder)
					orgPlaceholder = option.format;
			}
			// gi thi gi chu cung can phai kiem tra co bi disabledDate hay khong?
			zDatepickerButtonEl.find('.' + zbuttonlabelclass).setInnerHTML((!option.disabledDate || !option.disabledDate(selectdatetime.format('YYYY-MM-DD'))) ? selectdatetime.format(option.format) : orgPlaceholder);

			// bind event click cho button
			zDatepickerButtonEl.on('click', function (event, el) {
				event.preventDefault();
				// phai stop, ko thoi thi event truyen thang xuong document luon
				event.stop();

				// kiem tra coi button nay co active chua truoc tien
				var actived = zDatepickerButtonEl.hasClass(zbuttonactiveclass);
				// check xem cac zselectbox khac hide active stage
				zjs('.' + contextualbuttonclass).removeClass(zbuttonactiveclass);
				zjs('.' + contextualpanelwrapclass).addClass(contextualpanelwraphideclass);
				// gio moi active cai cua minh
				// neu nhu ma chua co active thi moi active
				// co roi thi thoi (se hide luon, vi o tren la vua hide all luon)
				if (actived) return;
				zDatepickerButtonEl.addClass(zbuttonactiveclass);
				zDatepickerPanelWrapEl.removeClass(contextualpanelwraphideclass);
			});
		};

		// neu ma su dung button thi hide cai input di thoi
		// nhung tuyet doi khong bao gio choi display none
		// boi nhu vay thi se ra xay ra loi
		// trong nhung truong hop nhu:
		// <input> da duoc init thanh datepicker xong roi
		// luc nay da duoc set value la ngay hien tai neu nhu default value=""
		// cai lai di display none cai input nay
		// sau do form nay lai duoc move vao 1 cai popup
		// the la browser theo mac dinh se set lai value cho nhung thang ma
		// display none thanh la value="" => mat het!
		// nen luon luon dung zui-uihide class de hide di cac ui
		//if(option.button)zDatepickerEl.addClass(zuihideclass);
		// => UPDATE:
		// luon luon phai hide cai datetime picker nay
		zDatepickerEl.addClass(zuihideclass);


		// CALENDAR CELL
		// - - -  - - - 

		// bind event khi ma click vao 1 cell ngay
		zDatepickerPanelEl.on('click', '[data-date]', function (event) {

			// khi click vao day thi se trigger blur cai input
			// nen phai test cho chac
			if (zDatepickerInputEl) {
				if (zDatepickerInputEl.hasClass('isfocus')) {
					preventBlurEventOnInputFieldEl = true;
					zDatepickerInputEl.removeClass('isfocus');
				}
			};

			var zCellEl = zjs(this),
				value = zCellEl.getAttr('data-date');

			// vay la thay doi selectdatetime luon
			var selectdatetime = zDatepickerEl.getData(selectdatetimekey);
			selectdatetime = moment(selectdatetime.format('[' + value + '] HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss');
			selectdatetime.locale(option.language);

			// luu lai thoi
			zDatepickerEl.setData(selectdatetimekey, selectdatetime);

			// ve lai cai lich cho dep
			zDatepickerPanelEl.find('.' + calendarcellselectedclass).removeClass(calendarcellselectedclass);
			zCellEl.addClass(calendarcellselectedclass);

			// show ra button luon
			if (zDatepickerButtonEl)
				zDatepickerButtonEl.find('.' + zbuttonlabelclass).setInnerHTML(selectdatetime.format(option.format));

			// show ra input field luon
			if (zDatepickerInputEl)
				zDatepickerInputEl.setValue(selectdatetime.format(option.format));

			// set lai cai calendar time luon
			var calendardatetime = zDatepickerEl.getData(calendardatetimekey);
			calendardatetime
				.year(selectdatetime.year())
				.month(selectdatetime.month())
				.date(selectdatetime.date());
			zDatepickerEl.setData(calendardatetimekey, calendardatetime);

			// format lai value
			value = selectdatetime.format(option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
			// o dau thi khong biet, chu trong setvalue thi 
			// phai set theo 1 chuan thoi (YYYY-MM-DD HH:mm:ss)
			// set luon attribute value (doc comment o tren)
			zDatepickerEl.setAttr('value', value).setValue(value);
			// run trigger
			zDatepickerEl.trigger('ui:datepicker:change', {
				value: value
			});
			zDatepickerEl.trigger('ui:datepicker:blur', {});

			// xong roi thi trigger cai validation thoi
			//if('moduleFormValidationOption' in zjs && zjs.isObject(zjs.moduleFormValidationOption))
			//	zDatepickerEl.findUp('form').formValidationCheck();

			// xem coi neu nhu co href thi se chuyen trang luon
			var href = zCellEl.getAttr('href', '');
			if (href != '') window.location.href = href;
		});


		// DRAW CALENDAR
		//  - - - - - -

		// ham nay giup ve ra 1 table month calendar voi ngay hien tai 
		var drawCalendar = function (date, selectdatetime, option) {

			// create header of table
			var zCalendarWrapEl = zjs('<div>').addClass(calendarwrapclass);
      if(!date)return zCalendarWrapEl;

			// append month name
			zjs(calendarrowmonthhtml).setInnerHTML(date.format(option.calendarTitleFormat)).appendTo(zCalendarWrapEl);
			// sau khi append month name xong roi
			// thi xem coi tien the thi thay luon 2 cai select box change month & year
			if (zDatepickerNavInputMonth) zDatepickerNavInputMonth.setInnerHTML(getHtmlForSelectMonth(date.month()));
			if (zDatepickerNavInputYear) {
				if (option.calendarYearFieldUseInput) zDatepickerNavInputYear.setValue(date.year());
				else zDatepickerNavInputYear.setInnerHTML(getHtmlForSelectYear(date.year()));
			};

			// append day of week
			var zCalendarHeadRow = zjs(calendarrowweekdayhtml).appendTo(zCalendarWrapEl);

			var firstdayofweek = moment(date).startOf('week'); // tuc la chu nhat
			// neu nhu firstOfWeek = 1 (ngon ngu vi)
			// thi phai fix lai 1 ty de cho thanh thu 2
			if (option.firstOfWeek == 1) firstdayofweek.add(1, 'day');
			// gio moi di in ra
			for (var i = 0; i < 7; i++) {
				zjs(calendarcellweekdayhtml).setInnerHTML(firstdayofweek.format(option.full ? 'dddd' : 'dd')).appendTo(zCalendarHeadRow);
				firstdayofweek.add(1, 'day');
			};


			// tinh ra first va last date va vai date khac
			var first = moment(date).startOf('month'),
				last = moment(date).endOf('month').startOf('day'),
				now = moment(),
				cur = moment(first.format('YYYY-MM-DD'));

			//console.log('cur', cur.format('YYYY-MM-DD'));	

			var zRowEl = zjs(calendarrowhtml);

			// neu nhu ma selectweek thi se set date-date cho row luon
			if (option.selectweek) {
				zRowEl.addClass('zui-week');
			};


			var j = 0;
			while (cur.unix() <= last.unix()) {

				// append empty cells before the first day of month
				if (cur.unix() == first.unix()) {
					var firstday = first.day();
					if (option.firstOfWeek == 1 && firstday == 0) firstday = 7;
					for (i = option.firstOfWeek; i < firstday; i++) {
						if (option.selectweek && i == option.firstOfWeek)
							zRowEl.setAttr('data-date', cur.format('YYYY-MM-DD'));
						zjs(calendarcellhtml).setInnerHTML('&nbsp;').addClass(calendarcellemptyclass).appendTo(zRowEl);
						j++;
					};
				};

				var day = cur.date();
				var wday = cur.day();
				// o dau thi khong biet, chu trong setvalue thi
				// phai set theo 1 chuan thoi (YYYY-MM-DD HH:mm:ss)
				var zCellEl = zjs(calendarcellhtml).setInnerHTML(day).appendTo(zRowEl);

				// neu nhu khong phai la selectweek thi se set date cho cell
				var _allowSetAttr = true;
				if (!option.selectweek) {
					// truoc khi set attribute
					// test 1 phat coi cai thang nay co bi disable hay khong?
					if (option.disabledDate && option.disabledDate(cur)) zCellEl.addClass('disabled');
					else zCellEl.setAttr('data-date', cur.format('YYYY-MM-DD'));
				} else {
					// truoc khi set attribute
					// test 1 phat coi cai thang nay co bi disable hay khong?
					if (option.disabledDate && option.disabledDate(cur)) zRowEl.addClass('disabled');
					else zRowEl.setAttr('data-date', cur.format('YYYY-MM-DD'));
				};

				// xem coi neu nhu thang option nay co data-href
				// thi set cho thang a 1 cai href luon
				if (option.href != '' && !option.selectweek) zCellEl.setAttr('href', option.href.format({
					date: cur.format('YYYY-MM-DD'),
					datetime: cur.format('YYYY-MM-DD HH:mm:ss')
				}));
				if (option.href != '' && option.selectweek) zRowEl.setAttr('href', option.href.format({
					date: cur.format('YYYY-MM-DD'),
					datetime: cur.format('YYYY-MM-DD HH:mm:ss')
				}));

				if (cur.format('YYYY-MM-DD') == now.format('YYYY-MM-DD')) {
					if (option.selectweek) zCellEl.parent().addClass(calendarcellcurrentclass);
					else zCellEl.addClass(calendarcellcurrentclass);
				};
				if (cur.format('YYYY-MM-DD') == selectdatetime.format('YYYY-MM-DD')) {
					if (option.selectweek) zCellEl.parent().addClass(calendarcellselectedclass);
					else zCellEl.addClass(calendarcellselectedclass);
				};
				j++;

				// xem coi co ket thuc cai row nay duoc hay chua
				if ((wday == 6 && option.firstOfWeek == 0) || (wday == 0 && option.firstOfWeek == 1) || cur.unix() == last.unix()) {
					zCalendarWrapEl.append(zRowEl);
					zRowEl = zjs(calendarrowhtml);

					// neu nhu ma selectweek thi se set date-date cho row luon
					if (option.selectweek) {
						zRowEl.addClass('zui-week');
					};

					// reset j
					j = 0;
				};

				cur.add(1, 'day');
			};

			return zCalendarWrapEl;
    };

    zDatepickerEl.setData('drawCalendar', drawCalendar);



		// - - - - - - -

		// sau khi init xong xuoi het moi thu
		// gio moi ve 1 cai calendar
		zDatepickerPanelEl.append(drawCalendar(selectdatetime, selectdatetime, option));

		// trigger event
		zDatepickerEl.trigger('ui:datepicker:ready', {
			value: valueForOrgInput
		});
	};

	// bind event cho document luon
	zjs(document).click(function (event) {
		zjs('.' + datepickerbuttonclass).removeClass(zbuttonactiveclass);
		zjs('.' + datepickerpanelwrapclass).addClass(contextualpanelwraphideclass);
		zjs('.' + datepickerinputclass).removeClass('isfocus');
	});


	// ham giup set value cho datetime picker
	var datepickerSetValue = function (element, value) {
		var zDatepickerEl = zjs(element);
		// neu nhu khong phai la zjs uidatepicker thi thoi
		var zDatepickerWrapEl = zDatepickerEl.getData(wrapelkey, false);
		if (!zDatepickerWrapEl) return;

		var option = zDatepickerEl.getData(optionkey);
    var zDatepickerInputEl = zDatepickerWrapEl.find('.' + datepickerinputclass);
    value = value.trim();
    if(!value){
      // render ra voi strick mode
      if(zDatepickerInputEl.count() && option.strictInput){
        zDatepickerInputEl.setValue('');
        zDatepickerWrapEl.removeClass('has-value');
      }
			// run trigger
			zDatepickerEl.trigger('ui:datepicker:change', {
				value: '',
				via: 'api'
			});
      return;
    }

		// bay gio se format cai value set vao cho dung chuan
		// get ra current datetime
		//zDatepickerEl.setData(calendardatetimekey, moment(selectdatetime));

		var selectdatetime = moment(value, option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
		selectdatetime.locale(option.language);
		zDatepickerEl.setData(calendardatetimekey, moment(selectdatetime));
		zDatepickerEl.setData(selectdatetimekey, moment(selectdatetime));

		// show ra button luon
		zDatepickerWrapEl.find('.' + zbuttonlabelclass).setInnerHTML(selectdatetime.format(option.format));

		// set lai 3 cai ui slider time
		var zDatepickerTimePanelEl = zDatepickerWrapEl.find('.' + datepickertimepanelclass);
		if(zDatepickerTimePanelEl.count() && zjs.moduleUiSliderOption){
			zDatepickerTimePanelEl.find('.hour > input').sliderSetValue(selectdatetime.hour());
			zDatepickerTimePanelEl.find('.minute > input').sliderSetValue(selectdatetime.minute());
			zDatepickerTimePanelEl.find('.second > input').sliderSetValue(selectdatetime.second());
		}

		// draw lai cai calendar
		var zDatepickerPanelEl = zDatepickerWrapEl.find('.' + datepickerpanelclass);
		if(zDatepickerPanelEl.count()){
			zDatepickerPanelEl.find('.' + calendarwrapclass).remove();
			var drawCalendar = zDatepickerEl.getData('drawCalendar');
			zDatepickerPanelEl.append(drawCalendar(selectdatetime, selectdatetime, option));
		}

		// render ra voi strick mode
		if(zDatepickerInputEl.count() && option.strictInput){
			zDatepickerInputEl.setValue(selectdatetime.format(option.format));
			zDatepickerWrapEl.addClass('has-value');
		}

		// sau do trigger event la xong!
		var valueForOrgInput = selectdatetime.format(option.time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
		zDatepickerEl.setAttr('value', valueForOrgInput).setValue(valueForOrgInput);
		// run trigger
		zDatepickerEl.trigger('ui:datepicker:change', {
			value: valueForOrgInput,
			via: 'api'
		});
	};


	// - - - - - - - - - 
	// EXTEND METHOD cho zjs-instance
	zjs.extendMethod({
		makeDatepicker: function (useroption) {
			return this.eachElement(function (element) {
				makeDatepicker(element, useroption)
			});
		},
		datepickerSetValue: function (value) {
			return this.eachElement(function (element) {
				datepickerSetValue(element, value)
			});
		}
	});

	// - - - - - -
	// REG HOOK nhung khong auto enable hook
	zjs.hook({
		after_setInnerHTML: function (el) {
			// kiem tra xem trong so cac thang con
			// co class nao la zdatepicker ko, neu nhu co thi se auto makeDatepicker luon
			zjs(el).find('.zdatepicker').makeDatepicker();
		},
		after_insertDOM: function (el) {
			// kiem tra xem trong so cac thang con, va ngay ca thang con
			// co class nao la zdatepicker ko, neu nhu co thi se auto makeDatepicker luon
			if (zjs(el).hasClass('zdatepicker')) zjs(el).makeDatepicker();
			zjs(el).find('.zdatepicker').makeDatepicker();
		}
	});

	// AUTO INIT
	zjs.onready(function () {
		zjs('.zdatepicker').makeDatepicker();
		zjs('.zdatetimepicker').makeDatepicker({
			time: true
		});
	});
	//fix de tuong thich voi zjs version 1.0
	if ('required' in zjs)
		zjs.required('ui.datepicker');
});