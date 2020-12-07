var ImageLoader = function(src){
  this.img = false;
  this.src = src;
};

ImageLoader.prototype.load = function(callback, errorCallback){
  this.callback = callback;
  this.errorCallback = errorCallback || false;
  var self = this;

  // console.log('handlerImgLoading', self.src);
  if(!self.img){
    self.img = new Image();
  }
  self.img.src = self.src;
  
  // neu da~ load xong san~ truoc' do' roi` thi`
  if(self.img.complete){
    // console.log('self.img.complete');
    var a = self.img.naturalWidth;
    if( a === undefined )
      a = self.img.width;
    var b = self.img.naturalHeight;
    if( b === undefined )
      b = self.img.height;
    self.onLoad(a, b);
    return;
  }
  
  // neu chua load xong san~
  // thi` se~ onload de? quang vao` callback
  self.img.onload = function(){
    self.onLoad(this.width, this.height);
  };
  self.img.onerror = function(){
    self.onError();
  };

  return;
};

ImageLoader.prototype.onLoad = function(width, height){
  // delete image
  this.img = undefined;
  // run callback
  this.callback && this.callback({src:this.src, width:width, height:height});
};

ImageLoader.prototype.onError = function(){
  // delete image
  this.img = undefined;
  // run callback
  this.errorCallback && this.errorCallback({src:this.src});
};