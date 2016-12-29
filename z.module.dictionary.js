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
		this.dataSourceUrl = '';
		this.defaultSearchProperty = 'text';
		this.lastRawquery = '';
		
		return this;
	};
	
	zDictionary.prototype.setDataSourceUrl = function(url){
		this.dataSourceUrl = url;
	};
	
	zDictionary.prototype.addIndex = function(raw, searchproperty){
		
		// khong lam gi het
		if(typeof raw == 'undefined' || typeof raw == 'function')return this;
		
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
		if(typeof data == 'object' && 'id' in data){
			if(this.getItemById(data.id))
				return;
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
	
	zDictionary.prototype.getItemById = function(id){
		if(!id in this.indexId)return false;
		return this.datas[this.indexId[id]];
	};
	
	zDictionary.prototype.search = function(rawquery){
	
		// xem coi neu nhu co data source thi se uu tien get tren data source
		if(this.dataSourceUrl != '')
			this.getDataFromDataSource(rawquery, false);
	
		// dau tien la xoa dau Tieng Viet trong query
		var query = rawquery.removeVietnameseCharacter().toLowerCase();
		
		// cai nay se la ket qua coi thang element nao dc chon
		var resultIndexs = [];
		
		// dau tien se tach input ra thanh nhieu phan
		var words = query.split(' ');
		
		var i,j,k,word,keywords,resultIndexsTemp,resultIndexsMerge,indextemp;
		
		// gio se tien hanh search tren tung thang
		for(i=0;i<words.length;i++){
			
			// reset temp variable
			word = words[i];
			resultIndexsTemp = [];
			resultIndexsMerge = [];
			
			// gio se thu thap cac keyword thoa man word nay
			keywords = [];
			for(j=0;j<this.indexWord.length;j++)if(this.indexWord[j].indexOf(word)>=0)keywords.push(this.indexWord[j]);
			
			// sau khi thu thap keyword xong thi se di search tren keyword
			for(j=0;j<keywords.length;j++)
				for(k=0;k<this.indexDictionary[keywords[j]].length;k++)
					resultIndexsTemp[this.indexDictionary[keywords[j]][k].toString()] = true;
			
			// sau khi co index temp thi minh se merge voi index
			for(var index in resultIndexsTemp)
				if((i==0 || index in resultIndexs) && typeof resultIndexsTemp[index] != 'function')
					resultIndexsMerge[index] = true;
			
			// merge xong se ghi de
			resultIndexs = resultIndexsMerge;
			
		};
		// end search 1 word
		
		// reset last search index
		this.lastSearchIndexs = [];
		
		// convert to return
		var returnIndexs = [];
		for(index in resultIndexs)if(resultIndexs[index]===true && index in this.datas && this.datas[index] != null){returnIndexs.push(this.datas[index]);this.lastSearchIndexs.push(index);};
		
		// done!
		return returnIndexs;
	};
	
	zDictionary.prototype.getDataFromDataSource = function(rawquery, callback){
		var self = this;
		zjs.ajax({
			url:this.dataSourceUrl,
			data: {f:'text',q:rawquery},
			type: 'json', 
			method: 'get', 
			cache: false,
			onBegin: false,
			onLoading: false,
			onComplete: function(data){
				// >>> test
				// console.log('json: ', data)
				
				// add vao index thoi
				self.addIndex(data, self.defaultSearchProperty);
				
				// neu nhu co callback thi se goi callback
				if(zjs.isFunction(callback))
					callback(data);
			},
			onError: false,
			debug: false
		});
	};
	
	zDictionary.prototype.asyncGetItemById = function(id, callback){
	
		// cu get nhu binh thuong thoi
		var data = this.getItemById(id);
		if(data){
			if(zjs.isFunction(callback))
				callback(data);
			return;
		};
		
		// con neu khong co thi moi phai di get tu data source
		if(this.dataSourceUrl == '')
			return;
		
		var self = this;
		zjs.ajax({
			url:this.dataSourceUrl,
			data: {f:'id',id:id},
			type: 'json', 
			method: 'get', 
			cache: false,
			onBegin: false,
			onLoading: false,
			onComplete: function(data){
				// >>> test
				// console.log('json: ', data)
				
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
			callback(result);
		
		// kiem tra neu nhu co data source url thi moi can lam tiep
		if(this.dataSourceUrl == '')return;
		
		var self = this;
		this.getDataFromDataSource(rawquery, function(){
			
			// tiep tuc search lai
			var result = self.search(rawquery);
			// va goi callback ngay
			if(zjs.isFunction(callback) && rawquery == self.lastRawquery){
				callback(result);
			};
		});
	};
	// end class
	
	// extend core cai dictionary
	zjs.extendCore({
		dictionary: zDictionary
	});
	
	// register module name
	zjs.required('dictionary');
})(window, zjs);
