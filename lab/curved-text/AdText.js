(function(fabric) {

  /*
   * TextCurved object for fabric.js
   * @author Arjan Haverkamp (av01d)
   * @date January 2018
   */
  
  fabric.TextCurved = fabric.util.createClass(fabric.Object, {
    type: 'text-curved',
    diameter: 250,
    kerning: 0,
    text: '',
    flipped: false,
    fill: '#000',
    fontFamily: 'Times New Roman',
    fontSize: 24, // in px
    fontWeight: 'normal',
    fontStyle: '', // "normal", "italic" or "oblique".
     cacheProperties: fabric.Object.prototype.cacheProperties.concat('diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth'),
    strokeStyle: null,
    strokeWidth: 0,
  
    initialize: function(text, options) {
      options || (options = {});
      this.text = text;
  
      this.callSuper('initialize', options);
      this.set('lockUniScaling', true);
  
      // Draw curved text here initially too, while we need to know the width and height.
      var canvas = this.getCircularText();
      this._trimCanvas(canvas);
      this.set('width', canvas.width);
      this.set('height', canvas.height);
    },
  
    _getFontDeclaration: function()
    {
      return [
        // node-canvas needs "weight style", while browsers need "style weight"
        (fabric.isLikelyNode ? this.fontWeight : this.fontStyle),
        (fabric.isLikelyNode ? this.fontStyle : this.fontWeight),
        this.fontSize + 'px',
        (fabric.isLikelyNode ? ('"' + this.fontFamily + '"') : this.fontFamily)
      ].join(' ');
    },
  
    _trimCanvas: function(canvas)
    {
      var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        pix = {x:[], y:[]}, n,
        imageData = ctx.getImageData(0,0,w,h),
        fn = function(a,b) { return a-b };
  
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          if (imageData.data[((y * w + x) * 4)+3] > 0) {
            pix.x.push(x);
            pix.y.push(y);
          }
        }
      }
      pix.x.sort(fn);
      pix.y.sort(fn);
      n = pix.x.length-1;
  
      w = pix.x[n] - pix.x[0];
      h = pix.y[n] - pix.y[0];
      var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
  
      canvas.width = w;
      canvas.height = h;
      ctx.putImageData(cut, 0, 0);
    },
  
    // Source: http://jsfiddle.net/rbdszxjv/
    getCircularText: function()
    {
      var text = this.text,
        diameter = this.diameter,
        flipped = this.flipped,
        kerning = this.kerning,
        fill = this.fill,
        inwardFacing = true,
        startAngle = 0,
        canvas = fabric.util.createCanvasElement(),
        ctx = canvas.getContext('2d'),
        cw, // character-width
        x, // iterator
        clockwise = -1; // draw clockwise for aligned right. Else Anticlockwise
  
      if (flipped) {
        startAngle = 180;
        inwardFacing = false;
      }
  
      startAngle *= Math.PI / 180; // convert to radians
  
      // Calc heigt of text in selected font:
      var d = document.createElement('div');
      d.style.fontFamily = this.fontFamily;
      d.style.whiteSpace = 'nowrap';
      d.style.fontSize = this.fontSize + 'px';
      d.style.fontWeight = this.fontWeight;
      d.style.fontStyle = this.fontStyle;
      d.textContent = text;
      document.body.appendChild(d);
      var textHeight = d.offsetHeight;
      document.body.removeChild(d);
  
      canvas.width = canvas.height = diameter;
      ctx.font = this._getFontDeclaration();
  
      // Reverse letters for center inward.
      if (inwardFacing) { 
        text = text.split('').reverse().join('') 
      };
  
      // Setup letters and positioning
      ctx.translate(diameter / 2, diameter / 2); // Move to center
      startAngle += (Math.PI * !inwardFacing); // Rotate 180 if outward
      ctx.textBaseline = 'middle'; // Ensure we draw in exact center
      ctx.textAlign = 'center'; // Ensure we draw in exact center
  
      // rotate 50% of total angle for center alignment
      for (x = 0; x < text.length; x++) {
        cw = ctx.measureText(text[x]).width;
        startAngle += ((cw + (x == text.length-1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise;
      }
  
      // Phew... now rotate into final start position
      ctx.rotate(startAngle);
  
      // Now for the fun bit: draw, rotate, and repeat
      for (x = 0; x < text.length; x++) {
        cw = ctx.measureText(text[x]).width; // half letter
        // rotate half letter
        ctx.rotate((cw/2) / (diameter / 2 - textHeight) * clockwise);
        // draw the character at "top" or "bottom"
        // depending on inward or outward facing
  
        // Stroke
        if (this.strokeStyle && this.strokeWidth) {
          ctx.strokeStyle = this.strokeStyle;
          ctx.lineWidth = this.strokeWidth;
          ctx.miterLimit = 2;
          ctx.strokeText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
        }
  
        // Actual text
        ctx.fillStyle = fill;
        ctx.fillText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
  
        ctx.rotate((cw/2 + kerning) / (diameter / 2 - textHeight) * clockwise); // rotate half letter
      }
      return canvas;
    },
  
    _set: function(key, value) {
      switch(key) {
        case 'scaleX':
          this.fontSize *= value;
          this.diameter *= value;
          this.width *= value;
          this.scaleX = 1;
          if (this.width < 1) { this.width = 1; }
          break;
  
        case 'scaleY':
          this.height *= value;
          this.scaleY = 1;
          if (this.height < 1) { this.height = 1; }
          break;
  
        default:
          this.callSuper('_set', key, value);
          break;
      }
    },
  
    _render: function(ctx)
    {
      var canvas = this.getCircularText();
      this._trimCanvas(canvas);
  
      this.set('width', canvas.width);
      this.set('height', canvas.height);
  
      ctx.drawImage(canvas, -this.width / 2, -this.height / 2, this.width, this.height);
  
      this.setCoords();
    },
  
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['text', 'diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth', 'styles'].concat(propertiesToInclude));
    }
  });
  
  fabric.TextCurved.fromObject = function(object, callback, forceAsync) {
     return fabric.Object._fromObject('TextCurved', object, callback, forceAsync, 'text-curved');
  };
  
  })(typeof fabric !== 'undefined' ? fabric : require('fabric').fabric);
  
  $(function() {
  
    function editObject()
    {
      var text = $('#text').val();
      var fName = 'Arial';
      var fSize = +$('#fontSize').val();
      var diameter = +$('#diameter').val();
      var kerning = +$('#kerning').val();
      var flipped = $('#flip').is(':checked');
      var obj = fcanvas.getActiveObject();
  
      if (obj) {
        obj.set({
          text: text,
          diameter: +$('#diameter').val(),
          fontSize: fSize,
          fontFamily: fName,
          kerning: kerning,
          flipped: flipped
        });
        fcanvas.renderAll();
      }
      else {
        obj = new fabric.TextCurved(text, {
          diameter: +$('#diameter').val(),
          fontSize: fSize,
          fontFamily: fName,
          kerning: kerning,
          flipped: flipped,
          left: 50,
          top: 50
        });
        fcanvas.add(obj);
      }
    }
  
    // Create fabric canvas
    fabric.Object.prototype.objectCaching = false;
    var fcanvas = new fabric.Canvas('c');
  
    // Add a circular text
    fcanvas.add(new fabric.TextCurved('It feels so nice to be able to draw', {
      diameter: 360,
      fontSize: 32,
      fontFamily: 'Arial',
      left: 50,
      top: 50,
      fill: 'red'
    }));
  
    // And another one
    fcanvas.add(new fabric.TextCurved('any text around a circular path', {
      diameter: 360,
      fontSize: 32,
      fontFamily: 'Arial',
      left: 395,
      top: 405,
      fill: 'black',
      angle: -180
      //flipped: true
    }));
  
    // Update controls
    function update(e) {
      var obj = e.target;
      $('#diameter').val(obj.diameter);
      $('#text').val(obj.text);
      $('#fontSize').val(obj.fontSize);
      $('#kerning').val(obj.kerning);
      $('#flip').prop('checked', obj.flipped);
    }
  
    fcanvas.on({
      'object:selected': function(e) {
        update(e);
      },
      'selection:updated': function(e) {
        update(e);
      }
    })
  
    $('#diameter,#fontSize,#kerning').on('input', editObject);
    $('#text').on('keyup', editObject);
    $('#flip,#newObject').on('click', editObject);
  });