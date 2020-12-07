const getQuadraticBezierXYatT = function(startPt,controlPt,endPt,T) {
  var x = Math.pow(1-T,2) * startPt.x + 2 * (1-T) * T * controlPt.x + Math.pow(T,2) * endPt.x; 
  var y = Math.pow(1-T,2) * startPt.y + 2 * (1-T) * T * controlPt.y + Math.pow(T,2) * endPt.y; 
  return( {x:x,y:y} );
}
