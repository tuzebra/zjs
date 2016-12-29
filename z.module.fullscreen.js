;(function(zjs) {
	var fullScreenApi = { 
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if( typeof document.cancelFullScreen != 'undefined' ){
		fullScreenApi.supportsFullScreen = true;
	}else{
		// check for fullscreen support by vendor prefix
		for(var i = 0, il = browserPrefixes.length; i < il; i++ ){
			fullScreenApi.prefix = browserPrefixes[i];
			
			if( typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ){
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	};
	
	// update methods to do something useful
	if( fullScreenApi.supportsFullScreen ){
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		
		fullScreenApi.isFullScreen = function(){
			switch (this.prefix) {	
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		};
		fullScreenApi.requestFullScreen = function( element ){
			return (this.prefix === '') ? element.requestFullScreen() : element[this.prefix + 'RequestFullScreen']();
		};
		fullScreenApi.cancelFullScreen = function(){
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		};		
	};

	// zjs core
	zjs.extendCore({
		supportsFullScreen: fullScreenApi.supportsFullScreen,
		isFullScreen: function(){
			return fullScreenApi.isFullScreen();
		},
		fullScreen: function(){
			return fullScreenApi.requestFullScreen(document.documentElement);
		},
		cancelFullScreen: function(){
			return fullScreenApi.cancelFullScreen();
		}
	});

	// zjs module
	zjs.extendMethod({
		isFullScreen: function(){
			return fullScreenApi.isFullScreen();
		},
		// action
		fullScreen: function(){
			// apply for first element match
			var element = this.item(0, true);
			if(element)fullScreenApi.requestFullScreen( element );
			return this;
		},
		cancelFullScreen: function(){
			fullScreenApi.cancelFullScreen();
			return this;
		},
		// event handler
		onFullScreen: function( handler ){
			this.on(fullScreenApi.fullScreenEventName, function( event, element ){
				if(typeof handler == 'function')handler( event, element );
			});
			return this;
		}
	});

	// register module name, fix de tuong thich voi zjs version 1.0
	if('required' in zjs)
	zjs.required('fullscreen');
	
})(zjs);