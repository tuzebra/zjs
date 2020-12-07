// https://github.com/sdegueldre/js-software-rasterizer/blob/master/objImgConverter.js
function objToImg(obj){
  let [vertices, faces] = parseOBJ(obj);
  let pixelVertices = [];

  for(let v of vertices)
    pixelVertices.push(v[0], v[1], v[2]);
  pixelVertices = pixelVertices.map((v) => floatToUint8Array(v));

  let tempArr = [];
  for(let pv of pixelVertices)
    tempArr.push(pv[0], pv[1], pv[2], pv[3]);
  pixelVertices = new Uint8Array(tempArr);

  let pixelFaces = [];
  for(let f of faces)
    pixelFaces.push(f[0], f[1], f[2]);
  pixelFaces = pixelFaces.map((f) => int32ToUint8Array(f));

  tempArr = [];
  for(let pf of pixelFaces)
    tempArr.push(pf[0], pf[1], pf[2], pf[3]);
  pixelFaces = new Uint8Array(tempArr);

  let rawData = [...int32ToUint8Array(vertices.length), ...int32ToUint8Array(faces.length), ...pixelVertices, ...pixelFaces];
  console.log(rawData);
  let pixelData = [];
  for(let i = 0; i < rawData.length; i++){
    pixelData.push(rawData[i]);
    if(i%3 == 2)
      pixelData.push(255);
  }
  pixelData.push(255,255,255);

  let cv = document.createElement('canvas');
  let sz = Math.ceil(Math.sqrt(pixelData.length/4));
  cv.width = cv.height = sz;
  let ctx = cv.getContext('2d');
  let imgData = ctx.getImageData(0,0,sz,sz);
  for(let i = 0; i < pixelData.length; i++)
    imgData.data[i] = pixelData[i];
  ctx.putImageData(imgData, 0, 0);
  document.body.appendChild(cv);

  console.log(imgData.data);
  imgData = ctx.getImageData(0,0,sz,sz);
  return imgData.data;
}

function floatToUint8Array(f){
    let buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = f;
    let view = new DataView(buf);
    return [view.getUint8(3), view.getUint8(2), view.getUint8(1), view.getUint8(0)];
}

function int32ToUint8Array(i){
    let buf = new ArrayBuffer(4);
    (new Uint32Array(buf))[0] = i;
    let view = new DataView(buf);
    return [view.getUint8(3), view.getUint8(2), view.getUint8(1), view.getUint8(0)];
}

function uint8ArrayToInt32(arr){
  let buf = new ArrayBuffer(4);
  let uint8Buf = new Uint8Array(buf);
  for(let i = 0; i < 4; i++)
    uint8Buf[i] = arr[i];
  let view = new DataView(buf);
  return view.getUint32(0);
}

function uint8ArrayToFloat32(arr){
  let buf = new ArrayBuffer(4);
  let uint8Buf = new Uint8Array(buf);
  for(let i = 0; i < 4; i++)
    uint8Buf[i] = arr[i];
  let view = new DataView(buf);
  return view.getFloat32(0);
}

function imgToObj(imgID){
  let img = new Image();
  img.src = "teapot obj.png";
  let cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  let ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  let imgData = ctx.getImageData(0, 0, cv.width, cv.height);
  let pixelData = imgData.data;
  let rawData = [];
  for(let i = 0; i < pixelData.length; i++)
    if(i%4 != 3)
      rawData.push(pixelData[i]);

  let nbVertices = uint8ArrayToInt32(rawData.slice(0,4));
  let nbFaces = uint8ArrayToInt32(rawData.slice(4,8));
  let vertexDelimiter = 4*nbVertices*3 + 8;
  let vertexData = rawData.slice(8, vertexDelimiter);
  let faceData = rawData.slice(vertexDelimiter, vertexDelimiter + 4*nbFaces*3);

  let verticesCoordinates = [];
  for(let i = 0; i < vertexData.length; i+=4)
    verticesCoordinates.push(uint8ArrayToFloat32(vertexData.slice(i, i+4)));

  let facesCoordinates = [];
  for(let i = 0; i < faceData.length; i+=4)
    facesCoordinates.push(uint8ArrayToInt32(faceData.slice(i, i+4)));

  let vertices = [];
  for(let i = 0; i < verticesCoordinates.length; i+=3)
    vertices.push([...verticesCoordinates.slice(i, i+3)])

  let faces = [];
  for(let i = 0; i < facesCoordinates.length; i+=3)
    faces.push([...facesCoordinates.slice(i, i+3)])

  return [vertices, faces];
}
