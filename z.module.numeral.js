// extend module numeral cho zjs
;(function(window, zjs){

/*!
 * numeral.js
 * version : 1.4.9
 * author : Adam Draper
 * license : MIT
 * http://numeraljs.com/
 * http://adamwdraper.github.com/Numeral-js/
 */
!function(){function a(a){this._n=a}function b(a,b,c){var d,e=Math.pow(10,b);if(d=(Math.round(a*e)/e).toFixed(b),c){var f=new RegExp("0{1,"+c+"}$");d=d.replace(f,"")}return d}function c(a,b){var c;return c=b.indexOf("$")>-1?e(a,b):b.indexOf("%")>-1?f(a,b):b.indexOf(":")>-1?g(a,b):i(a,b)}function d(a,b){if(b.indexOf(":")>-1)a._n=h(b);else if(b===o)a._n=0;else{var c=b;"."!==m[n].delimiters.decimal&&(b=b.replace(/\./g,"").replace(m[n].delimiters.decimal,"."));for(var d=new RegExp("[^a-zA-Z]"+m[n].abbreviations.thousand+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),e=new RegExp("[^a-zA-Z]"+m[n].abbreviations.million+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),f=new RegExp("[^a-zA-Z]"+m[n].abbreviations.billion+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),g=new RegExp("[^a-zA-Z]"+m[n].abbreviations.trillion+"(?:\\)|(\\"+m[n].currency.symbol+")?(?:\\))?)?$"),i=["KB","MB","GB","TB","PB","EB","ZB","YB"],j=!1,k=0;k<=i.length&&!(j=b.indexOf(i[k])>-1?Math.pow(1024,k+1):!1);k++);a._n=(j?j:1)*(c.match(d)?Math.pow(10,3):1)*(c.match(e)?Math.pow(10,6):1)*(c.match(f)?Math.pow(10,9):1)*(c.match(g)?Math.pow(10,12):1)*(b.indexOf("%")>-1?.01:1)*((b.split("-").length+Math.min(b.split("(").length-1,b.split(")").length-1))%2?1:-1)*Number(b.replace(/[^0-9\.]+/g,"")),a._n=j?Math.ceil(a._n):a._n}return a._n}function e(a,b){var d=b.indexOf("$")<=1?!0:!1,e="";b.indexOf(" $")>-1?(e=" ",b=b.replace(" $","")):b.indexOf("$ ")>-1?(e=" ",b=b.replace("$ ","")):b=b.replace("$","");var f=c(a,b);return d?f.indexOf("(")>-1||f.indexOf("-")>-1?(f=f.split(""),f.splice(1,0,m[n].currency.symbol+e),f=f.join("")):f=m[n].currency.symbol+e+f:f.indexOf(")")>-1?(f=f.split(""),f.splice(-1,0,e+m[n].currency.symbol),f=f.join("")):f=f+e+m[n].currency.symbol,f}function f(a,b){var d="";b.indexOf(" %")>-1?(d=" ",b=b.replace(" %","")):b=b.replace("%",""),a._n=100*a._n;var e=c(a,b);return e.indexOf(")")>-1?(e=e.split(""),e.splice(-1,0,d+"%"),e=e.join("")):e=e+d+"%",e}function g(a){var b=Math.floor(a._n/60/60),c=Math.floor((a._n-60*60*b)/60),d=Math.round(a._n-60*60*b-60*c);return b+":"+(10>c?"0"+c:c)+":"+(10>d?"0"+d:d)}function h(a){var b=a.split(":"),c=0;return 3===b.length?(c+=60*60*Number(b[0]),c+=60*Number(b[1]),c+=Number(b[2])):2===b.length&&(c+=60*Number(b[0]),c+=Number(b[1])),Number(c)}function i(a,c){var d=!1,e=!1,f="",g="",h="",i=Math.abs(a._n);if(0===a._n&&null!==o)return o;if(c.indexOf("(")>-1&&(d=!0,c=c.slice(1,-1)),c.indexOf("a")>-1&&(c.indexOf(" a")>-1?(f=" ",c=c.replace(" a","")):c=c.replace("a",""),i>=Math.pow(10,12)?(f+=m[n].abbreviations.trillion,a._n=a._n/Math.pow(10,12)):i<Math.pow(10,12)&&i>=Math.pow(10,9)?(f+=m[n].abbreviations.billion,a._n=a._n/Math.pow(10,9)):i<Math.pow(10,9)&&i>=Math.pow(10,6)?(f+=m[n].abbreviations.million,a._n=a._n/Math.pow(10,6)):i<Math.pow(10,6)&&i>=Math.pow(10,3)&&(f+=m[n].abbreviations.thousand,a._n=a._n/Math.pow(10,3))),c.indexOf("b")>-1){c.indexOf(" b")>-1?(g=" ",c=c.replace(" b","")):c=c.replace("b","");for(var j,k,l=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],p=0;p<=l.length;p++)if(j=Math.pow(1024,p),k=Math.pow(1024,p+1),a._n>=j&&a._n<k){g+=l[p],j>0&&(a._n=a._n/j);break}}c.indexOf("o")>-1&&(c.indexOf(" o")>-1?(h=" ",c=c.replace(" o","")):c=c.replace("o",""),h+=m[n].ordinal(a._n)),c.indexOf("[.]")>-1&&(e=!0,c=c.replace("[.]","."));var q=a._n.toString().split(".")[0],r=c.split(".")[1],s=c.indexOf(","),t="",u=!1;return r?(r.indexOf("[")>-1?(r=r.replace("]",""),r=r.split("["),t=b(a._n,r[0].length+r[1].length,r[1].length)):t=b(a._n,r.length),q=t.split(".")[0],t=t.split(".")[1].length?m[n].delimiters.decimal+t.split(".")[1]:"",e&&0===Number(t.slice(1))&&(t="")):q=b(a._n,null),q.indexOf("-")>-1&&(q=q.slice(1),u=!0),s>-1&&(q=q.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1"+m[n].delimiters.thousands)),0===c.indexOf(".")&&(q=""),(d&&u?"(":"")+(!d&&u?"-":"")+q+t+(h?h:"")+(f?f:"")+(g?g:"")+(d&&u?")":"")}function j(a,b){m[a]=b}var k,l="1.4.9",m={},n="en",o=null,p="undefined"!=typeof module&&module.exports;k=function(b){return k.isNumeral(b)?b=b.value():0==b||"undefined"==typeof b?b=0:Number(b)||(b=k.fn.unformat(b)),new a(Number(b))},k.version=l,k.isNumeral=function(b){return b instanceof a},k.language=function(a,b){if(!a)return n;if(a&&!b){if(!m[a])throw new Error("Unknown language : "+a);n=a}return(b||!m[a])&&j(a,b),k},k.language("en",{delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th"},currency:{symbol:"$"}}),k.zeroFormat=function(a){o="string"==typeof a?a:null},k.fn=a.prototype={clone:function(){return k(this)},format:function(a){return c(this,a?a:k.defaultFormat)},unformat:function(a){return d(this,a?a:k.defaultFormat)},value:function(){return this._n},valueOf:function(){return this._n},set:function(a){return this._n=Number(a),this},add:function(a){return this._n=this._n+Number(a),this},subtract:function(a){return this._n=this._n-Number(a),this},multiply:function(a){return this._n=this._n*Number(a),this},divide:function(a){return this._n=this._n/Number(a),this},difference:function(a){var b=this._n-Number(a);return 0>b&&(b=-b),b}},p&&(module.exports=k),"undefined"==typeof ender&&(this.numeral=k),"function"==typeof define&&define.amd&&define([],function(){return k})}.call(this);

// vietnames language
numeral.language('vi', {
	delimiters: {
		thousands: '.',
		decimal: ','
	},
	abbreviations: {
		thousand: 'k',
		million: 'm',
		billion: 'b',
		trillion: 't'
	},
	ordinal: function(number){
		return '';
	},
	currency: {
		symbol: 'đ'
	}
});

// register module name, fix de tuong thich voi zjs version 1.0
if('required' in zjs)
zjs.required('numeral');
})(window, zjs);