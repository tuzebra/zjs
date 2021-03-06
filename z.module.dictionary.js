// extend module dictionary cho zjs
;(function(window, zjs){"use strict";

	// class giup tao ra 1 dictionary lookup
	var zDictionary = function(source, searchproperty){
	
		// luu giu data
		this.datas = [];
		this.lastSearchIndexs = [];
	
		// index dictionary la 1 array chua cac array
		// moi array con co key la keyword luon, va 
		// data la cac index ma keyword do ton tai
		this.indexDictionary = [];
		
		// index id la 1 array
		// co key la id cua item, con data la 
		// index cua keyword luon
		this.indexId = [];
		
		// index word la 1 array chua cac keyword
		// muc dich la de giup xac dinh nhanh coi
		// keyword nhap vao co ton tai trong data
		// hay khong
		this.indexWord = [];
		
		// - - -
		// create index keyword
		
		// bat dau create index...
		this.addIndex(source, searchproperty);
		
		// data source
		// tat nhien local khong the luu giu nhieu data duoc
		// cho nen se can den 1 data source 
		// va khi can thi dictionary se get more data (via ajax) 
		this.cacheResponse = true;
		this.usedCacheDataSource = false;
		this.dataSourceUrl = null;
		this.sourceUrlValueSelector = null;
		this.dataSourceDataStructure = '';
		this.dataSourceDataSelector = '';
		this.defaultSearchProperty = searchproperty || 'text';
		this.lastRawquery = '';

		// limit
		this.searchResultLimit = 0;
		this.searchMatchStartWith = false;
		this.dataSourceUrlIsLoaded = false;

		// neu nhu load async lien tuc
		// thi bien nay se giup count total nhung thang xhr request dang load
		this.countXhrRequesting = 0;
		this.onStartXhrRequesting = null;
		this.onEndXhrRequesting = null;

		this.itemFilterFunction = null;

		return this;
	};

	zDictionary.prototype.setSearchMatchStartWith = function(bool){
		this.searchMatchStartWith = true;
	};
	zDictionary.prototype.setDefaultSearchResultLimit = function(number){
		this.searchResultLimit = number;
	};
	zDictionary.prototype.setCacheResponse = function(bool){
		this.cacheResponse = bool;
	};
	zDictionary.prototype.useCacheDataSource = function(bool){
		this.usedCacheDataSource = bool;
	};
	zDictionary.prototype.setDataSourceUrl = function(url){
		this.dataSourceUrl = url;
	};
	
	zDictionary.prototype.setDataSourceDataStructure = function(structure){
		this.dataSourceDataStructure = structure;
	};
	zDictionary.prototype.setDataSourceDataSelector = function(dataSelector){
		this.dataSourceDataSelector = dataSelector;
	};

	zDictionary.prototype.setDataSourceUrlValueSelector = function(urlValueSelector){
		this.sourceUrlValueSelector = urlValueSelector;
	};
	zDictionary.prototype.setOnStartEndLoading = function(onStart, onEnd){
		this.onStartXhrRequesting = onStart;
		this.onEndXhrRequesting = onEnd;
	};
	zDictionary.prototype.setItemFilterFunction = function(func){
		this.itemFilterFunction = func;
	};
	
	zDictionary.prototype.addIndex = function(raw, searchproperty){
		
		// khong lam gi het
		if(typeof raw == 'undefined' || typeof raw == 'function' || raw == null)return this;
		
		// - -
		// de quy, trong truong hop truyen vao array
		if(raw.constructor === Array){
			for(var i=0;i<raw.length;i++)
				this.addIndex(raw[i], searchproperty);
			return this;
		};
		// de quy, trong truong hop truyen vao object
		// va search property la "id=>text"
		if(typeof raw == 'object' && searchproperty == 'id.text'){
			for(var id in raw)
				this.addIndex({id:id, text:raw[id]}, 'text');
			return this;
		};
		
		// - -
		// con lai thi lam binh thuong
		
		// mac dinh search bang text
		searchproperty = searchproperty || 'text';
		// save lai luon
		this.defaultSearchProperty = searchproperty;

		// neu data truyen vao la object
		var text = '', data = new Object();
		if(typeof raw == 'string')text = raw;
		if(typeof raw == 'object'){text = raw[searchproperty] || '';data = raw;};
		
		// kiem tra neu nhu cai data nay co id
		// thi se dam bao la id khong bi trung
		// trong truong hop khong co id
		// thi se coi nhu id la cai searchproperty luon
		if(typeof data == 'object'){
			if(!('id' in data) && text !== ''){
				data.id = text;
			}
			if(this.getItemById(data.id)){
				return;
			}
		}
		
		// luu vao instance object
		this.datas.push(zjs.extend(data, {text:text.toString()}));
		
		// get ra index
		var index = this.datas.length-1;
		
		// bat dau phan tich de lam
		text = text.toString().removeVietnameseCharacter().toLowerCase();
		
		// index by word (de search bang text)
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
		
		// index by id (de get ra item bang id)
		if('id' in data){
			this.indexId[data.id] = index;
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

	zDictionary.prototype.resetIndex = function(){
		
		this.datas = [];
		this.lastSearchIndexs = [];
		this.indexDictionary = [];
		this.indexId = [];
		this.indexWord = [];

		// done!
		return this;
	};
	
	zDictionary.prototype.getItemById = function(id){
		if(!id in this.indexId)return false;
		return this.datas[this.indexId[id]];
	};
	
	zDictionary.prototype.getItemsLimit = function(limit){
		limit = limit || this.searchResultLimit;
		var data = limit<=0 ? this.datas.slice() : this.datas.slice(0, limit);
		return (typeof this.itemFilterFunction === 'function') ? data.filter(this.itemFilterFunction) : data;
	};

	zDictionary.prototype.search = function(rawquery){
	
		// dau tien la xoa dau Tieng Viet trong query
		var query = rawquery.removeVietnameseCharacter().toLowerCase();
		
		// cai nay se la ket qua coi thang element nao dc chon
		var resultIndexs = [];
		
		// dau tien se tach input ra thanh nhieu phan
		var words = query.split(' ');
		
		var i,j,k,word,keywords,resultIndexsTemp,resultIndexsMerge,indextemp;
		var _idofk = -1;
		
		// gio se tien hanh search tren tung thang
		var wl = words.length;
		for(i=0;i<wl;i++){
			
			// reset temp variable
			word = words[i];
			resultIndexsTemp = [];
			resultIndexsMerge = [];
			
			// gio se thu thap cac keyword thoa man word nay
			keywords = [];
			for(j=0;j<this.indexWord.length;j++){
				_idofk = this.indexWord[j].indexOf(word);
				if(_idofk>=0){
					// tang trong so them 10% neu nhu index = 0 luon
					keywords.push({
						keyword: this.indexWord[j],
						strong: (word.length / this.indexWord[j].length) + (_idofk === 0 ? 0.2 * (wl-i) : 0)
					});
				}
			}
			
			// sau khi thu thap keyword xong thi se di search tren keyword
			for(j=0;j<keywords.length;j++)
				for(k=0;k<this.indexDictionary[keywords[j].keyword].length;k++)
					resultIndexsTemp[this.indexDictionary[keywords[j].keyword][k].toString()] = keywords[j].strong;
			
			
			// sau khi co index temp thi minh se merge voi index
			for(var index in resultIndexsTemp){
				if((i==0 || index in resultIndexs) && typeof resultIndexsTemp[index] != 'function' && index in this.datas && this.datas[index] != null)
					resultIndexsMerge[index] = {
						index: index, 
						idof: (typeof this.datas[index].text === 'string') ? this.datas[index].text.removeVietnameseCharacter().toLowerCase().indexOf(query) : -1,
						strong: resultIndexsTemp[index]
					};
			}
			// merge xong se ghi de
			resultIndexs = resultIndexsMerge;
			
		};
		// end search 1 word
		
		// sort 
		resultIndexs.sort(function(a, b){
			if((a.idof === 0 && b.idof === 0) || (a.idof !== 0 && b.idof !== 0))
				return b.strong - a.strong;
			if(a.idof === 0)return -1;
			return 1;
		});
		// reset last search index
		this.lastSearchIndexs = [];
		
		// convert to return
		var returnIndexs = [];
		var _limit = this.searchResultLimit;
		for(i=0;i<resultIndexs.length;i++){
			if(typeof resultIndexs[i] === 'object'){

				var startWithFilter = true;

				if(this.searchMatchStartWith){
					var _rawqueryLowerCase = rawquery.toLowerCase();
					var _textLowerCase = this.datas[resultIndexs[i].index];
					_textLowerCase = _textLowerCase.text.toLowerCase();

					if(_textLowerCase.indexOf(_rawqueryLowerCase) !== 0){
						startWithFilter = false;
					}
				}

				if(startWithFilter){
					returnIndexs.push(this.datas[resultIndexs[i].index]);
					this.lastSearchIndexs.push(resultIndexs[i].index);
					// se breck ra neu nhu dat duoc limit roi
					if(this.searchResultLimit > 0){
						_limit--;
						if(_limit <= 0)break;
					}
				}
			}
		}

		// filter before return
		return (typeof this.itemFilterFunction === 'function') ? returnIndexs.filter(this.itemFilterFunction) : returnIndexs;
	};
	
	zDictionary.prototype.getDataFromDataSource = debounce(function(rawquery, callback){
		var self = this;
		
		if(self.dataSourceUrlIsLoaded){
			if(zjs.isFunction(callback))
				callback();
			return;
		}

		if(self.usedCacheDataSource)
			self.dataSourceUrlIsLoaded = true;

		var _srq = (rawquery||'');
		if(zjs.isString(_srq))
			_srq = _srq.toLowerCase();

		var _queryData = {f:'text',q:_srq};
		if(self.searchResultLimit > 0)_queryData.limit = self.searchResultLimit;

		if(typeof self.sourceUrlValueSelector === 'function')
			_queryData = self.sourceUrlValueSelector(_queryData);

		self.countXhrRequesting++;
		if(self.countXhrRequesting==1 && typeof self.onStartXhrRequesting == 'function')self.onStartXhrRequesting();

		zjs.ajax({
			url: typeof self.dataSourceUrl === 'function' ? self.dataSourceUrl(_queryData) : self.dataSourceUrl,
			data: _queryData,
			type: 'json', 
			method: 'get', 
			cache: self.cacheResponse,
			cacheResponse: self.cacheResponse,
			onBegin: false,
			onLoading: false,
			onResponse: function(rawdata, fromServer){
				self.countXhrRequesting--;
				if(!self.countXhrRequesting && typeof self.onEndXhrRequesting == 'function')self.onEndXhrRequesting();

				// >>> test
				// console.log('json: ', data)
				// fix raw data to usable data
				var data = [];
				if(self.dataSourceDataStructure != ''){
					var st = self.dataSourceDataStructure.split('.');
					if(st.length > 1 && st[0] == ''){
						for(var si=1;si<st.length;si++){
							if(rawdata && (typeof rawdata === 'object') && rawdata[st[si]]){
								rawdata = rawdata[st[si]];
							}
						}
					}
				}
				data = (typeof self.dataSourceDataSelector === 'function') ? self.dataSourceDataSelector(rawdata, _queryData) : rawdata;

				// add vao index thoi
				self.addIndex(data, self.defaultSearchProperty);
				
				// neu nhu co callback thi se goi callback
				if(zjs.isFunction(callback))
					callback(data);
			},
			onError: false,
			debug: false
		});
	}, 650);
	
	zDictionary.prototype.asyncGetItemById = function(id, callback){
	
		// cu get nhu binh thuong thoi
		var data = this.getItemById(id);
		if(data){
			if(zjs.isFunction(callback))
				callback(data);
			return;
		};
		
		// con neu khong co thi moi phai di get tu data source
		if(!this.dataSourceUrl)
			return;
		
		var self = this;
		var _queryData = {f:'id',id:id};
		if(typeof this.sourceUrlValueSelector === 'function')
			_queryData = this.sourceUrlValueSelector(_queryData);

		zjs.ajax({
			url:typeof this.dataSourceUrl === 'function' ? this.dataSourceUrl(_queryData) : this.dataSourceUrl,
			data: _queryData,
			type: 'json', 
			method: 'get', 
			cache: false,
			onBegin: false,
			onLoading: false,
			onComplete: function(rawdata){
				// >>> test
				// console.log('json: ', data)
				// fix raw data to usable data
				var data = [];
				if(self.dataSourceDataStructure != ''){
					var st = self.dataSourceDataStructure.split('.');
					if(st.length > 1 && st[0] == ''){
						for(var si=1;si<st.length;si++){
							rawdata = rawdata[st[si]];
						}
					}
				}
				data = (typeof self.dataSourceDataSelector === 'function') ? self.dataSourceDataSelector(rawdata, _queryData) : rawdata;
				
				// add vao index thoi
				self.addIndex(data, self.defaultSearchProperty);
				
				// get ra lai cho chac an
				data = self.getItemById(id);
				
				if(!data)
					return;
				
				// neu nhu co callback thi se goi callback
				if(zjs.isFunction(callback))
					callback(data);
			},
			onError: false,
			debug: false
		});
	};
	
	zDictionary.prototype.asyncSearch = function(rawquery, callback){
		
		this.lastRawquery = rawquery;
		
		// dau tien la search 1 lan dau tien
		var result = this.search(rawquery);
		// va goi callback ngay
		if(zjs.isFunction(callback))
			callback(result, false);
		
		// kiem tra neu nhu co data source url thi moi can lam tiep
		if(!this.dataSourceUrl)return;
		
		var self = this;
		this.getDataFromDataSource(rawquery, function(){
			
			// tiep tuc search lai
			var result = self.search(rawquery);
			// va goi callback ngay
			if(zjs.isFunction(callback) && rawquery == self.lastRawquery){
				callback(result, true);
			};
		});
	};
	// end class

	// helper function
	function debounce(func, wait) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				func.apply(context, args);
			}, wait);
		};
	}

	// extend core cai dictionary
	zjs.extendCore({
		dictionary: zDictionary
	});
	
	// register module name
	zjs.required('dictionary');
})(window, zjs);