/**
 * @fileOverview Declaration of JSGL package namespaces.
 * @author Tomas Rehorek
 * @since version 1.0   
 */
 

/**
 * @namespace Root namespace for JSGL.
 */
jsgl={
  /**
   * @namespace Holds functionality related to JSGL elements.
   */     
  elements: {
  
    /**
     * @namespace Holds DOM presenters for JSGL elements.
     */         
    dom: {}
  
  },

  /**
   * @namespace Classes related to <code>Panel</code> object.
   */        
  panel: {},
  
  path: {},
  
  /**
   * @namespace Classes related to stroke manipulation and rendering.
   */     
  stroke: {},
  
  /**
   * @namespace Claases related to filling, i.e. manipulating and rendering of fill.
   */     
  fill:{},
  
  /**
   * @namespace Utility classes and useful sugar code.
   */     
  util: {}
};;/**
 * @fileOverview Detect information about user's web browser.
 * @author Tomas Rehorek
 * @since version 1.0
 */  

/**
 * Table of properties capturing information about user's web browser.
 * @class 
 * @constant 
 * @memberOf jsgl.util
 */  
jsgl.util.BrowserInfo=(function() {
  __browserinfo=0;

  document.write("<!--[if vml]><script type='text/javascript'>__browserinfo++;</script><![endif]-->");

  if(document.implementation&&(document.implementation.hasFeature("org.w3c.svg", "1.0") ||
 	            document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#SVG", "1.1") ||
 	            document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"))) __browserinfo+=2;

  document.write("<!--[if IE]><script type='text/javascript'>__browserinfo+=4;</script><![endif]-->");
  document.write("<!--[if IE 5.5000]><script type='text/javascript'>__browserinfo+=8;</script><![endif]-->");
  document.write("<!--[if lte IE 6]><script type='text/javascript'>__browserinfo+=32;</script><![endif]-->");
  document.write("<!--[if lte IE 7]><script type='text/javascript'>__browserinfo+=64;</script><![endif]-->");

  if(typeof(window.event)!="undefined") __browserinfo+=16;

  /**
   * Determines whether the browser support Vector Markup Language (VML).
   * @type boolean   
   */      
  this.supportsVml=!!(__browserinfo & 1);

  /**
   * Determines whether the browser support Scalable Vector Graphics (SVG).
   * @type boolean
   */
  this.supportsSvg=!!(__browserinfo & 2);
  
  /**
   * Determines whether the browser is MSIE.
   * @type boolean   
   */     
  this.isMSIE=!!(__browserinfo & 4);
  
  /**
   * Determines whether the browser is MSIE 5.5.
   * @type boolean   
   */   
  this.isMSIE55=!!(__browserinfo & 8);

  /**
   * Determines whether the browser supports window.event
   * @type boolean   
   */     
  this.usesWindowEvent=!!(__browserinfo & 16);
  
  /**
   * Determines whether the browser is MSIE <= 6.
   * @type boolean
   */
  this.isMSIElte6 = !!(__browserinfo & 32);
  
  /**
   * Determines whether the browser is MSIE <= 7.
   * @type boolean
   */
  this.isMSIElte7 = !!(__browserinfo && 64);        
  
  /**
   * Determines whether the browser is Opera-like.
   * @type boolean
   */
  this.isOpera = !this.isMSIE && this.usesWindowEvent;
  
  return this;
})();;/**
 * @fileOverview Sugar code for object inheritance, cloning, and working with
 * functions.
 * @author Tomas Rehorek
 * @since version 1.0
 */    

Function.prototype.jsglExtend = function(ancestor) {

  function F() {};
  F.prototype = ancestor.prototype;
  this.prototype = new F();
  this.prototype.constructor=this;
  this.base = F.prototype;
  this.base.constructor = ancestor;
}

Number.prototype.jsglVmlize = function() {

  return Math.round(this*1000);
}

jsgl.util.delegate = function(object, method) {

  return function() {
  
    return method.apply(object, arguments);
  }
}

/**
 * @deprecated
 */
jsgl.cloneObject=function(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = new obj.constructor();
    for(var key in obj)
        temp[key] = jsgl.cloneObject(obj[key]);

    return temp;
}

jsgl.util.clone=function(obj)
{
  if(obj == null || typeof(obj) != "object")
  {
    return obj;
  }

  var temp = new obj.constructor();  
  for(var key in obj)
  {
    temp[key] = jsgl.util.clone(obj[key]);
  }

  return temp;
}

if(navigator.userAgent.indexOf("MSIE 5.0") > 0)
{
  Function.prototype.call = function(obj)
  {
    obj.__fnc = this;
    var __args = "";
    for(var i=1;i<arguments.length;i++)
    {
      __args += (i == 1 ? "" : ",") + "arguments[" + i + "]";
    }
    return eval("obj.__fnc(" + __args + ")");
  }

  Function.prototype.apply = function(obj,args)
  {
    obj.__fnc = this;
    var __args = "";
    for(var i=0;i<args.length;i++)
    {
      __args += (i == 0 ? "" : ",") + "args[" + i + "]"
    };
    return eval("obj.__fnc(" + __args + ")");
  }
};/**
 * @fileOverview Implementation of <code>jsgl.util.ArrayList</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Simple ArrayList implementation. 
 * @constructor
 * @description Creates an instance of <code>jsgl.util.ArrayList</code>. 
 * @since version 1.0
 */    
jsgl.util.ArrayList = function() {

  /**
   * The internal javascript array object to hold the elements.
   * @type array
   * @private
   */      
  this.items = [];
  
  /**
   * Internal size counter.
   * @type number
   * @private
   */           
  this.count = 0;
}

/**
 * @description Appends an item at the end of the list.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {value} item The item to be appended.
 * @since version 1.0
 */      
jsgl.util.ArrayList.prototype.add = function(item) {

  if(typeof(item)=='undefined') return;

  this.insertAt(item,this.count);
}

/**
 * @description Removes items in the ArrayList with respect to provided filter
 * function. If no filter function is provided, all the elements are removed
 * from the list.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {function} filter The filtering function. The item is removed from
 * the list if filter(item) is truthy.
 * @since version 1.0
 */  
jsgl.util.ArrayList.prototype.clear = function(filter)
{
  var f = filter || jsgl.util.ArrayList.DEFAULT_CLEAR_FILTER;
  
  var j = 0;
  for(var i=0; i<this.count; i++)
  {
    if(f(this.items[i])) delete this.items[i];
    else
    {
      if(i!=j)
      {
        this.items[j] = this.items[i];
        delete this.items[i];
      }
      j++;
    } 
  }
  this.count = j;
}

/**
 * @description Tests whether a given item is present in the list.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {value} item The item to be tested for presence.
 * @since version 1.0
 */  
jsgl.util.ArrayList.prototype.contains = function(item) {

  for(var i=0; i<this.count; i++)
  {
    if(this.items[i]===item) return true;
  }
  return false;

}

/**
 * @description Gets the number of items that are currently contained in the list.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @returns {number}
 * @since version 1.0    
 */ 
jsgl.util.ArrayList.prototype.getCount = function() {

  return this.count;
  
}

/**
 * @description Default filter function to be used by the <code>clear()</code>
 * method if no filter is provided.
 * @private
 * @static
 * @field
 * @memberOf jsgl.util.ArrayList
 * @since version 1.0
 */       
jsgl.util.ArrayList.DEFAULT_CLEAR_FILTER = function() {
  return true;
}

/**
 * @description Gets an item present at the specified index in the list.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {number} index Index of the item to be returned, starting from 0.
 * @returns {value}
 * @since version 1.0
 */     
jsgl.util.ArrayList.prototype.get = function(index) {

  if((index >= 0) && (index < this.count)) return this.items[index];
  else return null;
  
}

/**
 * @description Sets an item at specified index. If any item is already present
 * at the index, it will be replaced.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {value} item The item to be placed at the index. 
 * @param {number} index Index of the item to be set.
 * @since version 1.0
 */       
jsgl.util.ArrayList.prototype.setAt = function(item, index) {

  if(typeof(item)=='undefined' || index<0) return;

  this.items[index] = item;

  if(index >= this.count) this.count = index + 1;
}

/**
 * @description Inserts and item at the specified index. All the elements starting
 * at the index up to the end of the list are shifted right.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {value} item The item to be inserted into the list.
 * @param {number} index Index where the item shall be inserted at.
 * @since version 1.0
 */   
jsgl.util.ArrayList.prototype.insertAt = function(item, index) {
  if(typeof(item)=='undefined' || index<0) return;
  
  for(var i=this.count; i>index; i--)
  {
    this.items[i] = this.items[i-1];
  }
  
  for(var i=this.count; i<index; i++)
  {
    this.items[i] = null;
  }

  this.items[index] = item;
  
  if(index > this.count) this.count = index + 1;
  else this.count ++;
}

/**
 * @description Removes an item at the specified index from the list. The rest
 * of the list is shifted left after the element is removed. 
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {value} index The index of the item to be removed.
 * @since version 1.0
 */   
jsgl.util.ArrayList.prototype.removeAt = function(index) {

  if(index<0 || index>=this.count) return;
  for(var i=index+1;i<this.count;i++)
  {
    this.items[i-1] = this.items[i];
  }
  this.items[this.count-1]=null;
  this.count--;
  
}

/**
 * @description Removes all the items that are equal to <code>item</code> from
 * the list.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {value} item The item whose all occurances will be removed from the list.
 * @since version 1.0
 */      
jsgl.util.ArrayList.prototype.remove = function(item) {

  this.clear(function(_item) { return _item === item });
  
}

/**
 * @description Reverses the ordering of items in the list. 
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @since version 2.0
 */    
jsgl.util.ArrayList.prototype.reverse = function() {

  this.items.reverse();
}

/**
 * @description Sorts the list according to a given comparator function. If no
 * comparator is given, default comparison is used.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @param {function(a,b)} The comparator function to be used for sorting.
 * @since version 1.0
 */  
jsgl.util.ArrayList.prototype.sort = function(comparator)
{
  var cmp = function(a,b)
  {
    var result = (comparator || jsgl.util.ArrayList.DEFAULT_COMPARATOR)(a,b);
    return (typeof(result) == "number" ? result : 0)
  }
  var c = true;
  while(c)
  {
    c = false;
    for(var i=1;i<this.count;i++)
    {
      if(cmp(this.items[i-1],this.items[i]) < 0)
      {
        c = true;
        var temp = this.items[i-1];
        this.items[i-1] = this.items[i];
        this.items[i] = temp;
      }
    }
  }
}

/**
 * @description Default comparator function to be used by the <code>sort()</code>
 * method if no comparator is provided.
 * @private
 * @static
 * @field
 * @memberOf jsgl.util.ArrayList
 * @since version 1.0
 */       
jsgl.util.ArrayList.DEFAULT_COMPARATOR = function(a,b) {

  return b - a;

}

/**
 * @description Returns the ArrayList as string.
 * @public
 * @methodOf jsgl.util.ArrayList#
 * @returns string
 * @since version 1.0
 */     
jsgl.util.ArrayList.prototype.toString = function(index) {

  var itemsStr = "";
  for(var i=0; i<this.count; i++)
  {
    if(i!=0) itemsStr += ",";
    itemsStr += i + ":" + this.items[i];
  }
  return "ArrayList(count=" + this.count + ",items=[" + itemsStr + "])";

}
;jsgl.util.SortedList=function(comparator)
{
  if(comparator) this.comparator = comparator;
  this.items=[];
  this.count=0;
}

/* Default comparator. */
jsgl.util.SortedList.prototype.comparator = function(a,b)
{
  if(b > a) return 1;
  if(b < a) return -1;
  return 0;
}

jsgl.util.SortedList.prototype.setComparator = function(comparator)
{
  if(comparator)
  {
    this.comparator = comparator;
  }
  else
  {
    delete this.comparator;
  }
}

// prepsat na binarni hledani!
jsgl.util.SortedList.prototype.add = function(item)
{
  var pos;
  if(this.count == 0)
  {
    pos = 0;
  }
  else
  {
    var i=this.count;
    while((i > 0) && (this.comparator(this.items[i-1], item) < 0))
    {
      i--;
    }
    pos = i;
    for(var i=this.count; i>=pos; i--)
    {
      this.items[i+1] = this.items[i];
    }
  }
  
  this.items[pos] = item;
  this.count++;
}

jsgl.util.SortedList.prototype.contains = function(item)
{
  for(var i=0; i<this.count; i++)
  {
    if(this.items[i]==item) return true;
  }
  return false;
}

jsgl.util.SortedList.prototype.get = function(index)
{
  return this.items[index];
}

jsgl.util.SortedList.prototype.getCount = function()
{
  return this.count;
}

jsgl.util.SortedList.prototype.remove = function(obj)
{
  if(this.count==0) return;
  for(var i=0; i<this.count; i++)
  {
    if(this.items[i] == obj)
    {
      for(var j=i; j<this.count-1; j++)
      {
        this.items[j]=this.items[j+1];
      }
      this.items[this.count-1] = null;
      this.count--;
      
      break; // remove one element at most
    }
  }
}

jsgl.util.SortedList.prototype.removeAt = function(index)
{
  if(index < 0 || index >= this.count) return;
  for(var i=index; i<this.count-1; i++)
  {
    this.items[i]=this.items[i+1];
  }
  this.items[this.count-1] = null;
  this.count--;
}

jsgl.util.SortedList.prototype.toString = function()
{
  var itemsString = "";
  for(var i=0;i<this.count;i++)
  {
    if(i!=0) itemsString += ",";
    itemsString += this.items[i];
  }
  return "SortedList(count=" + this.count + ",items=[" + itemsString + "])";
}
;/**
 * @fileOverview <code>jsgl.util.Queue</code> class implementation.
 * @author Tomas Rehorek
 * @since version 1.0   
 */
 
/**
 * @class Simple FIFO structure implementation.
 * @constructor
 * @description Creates new instance of <code>jsgl.util.Queue</code>.
 * @since version 1.0
 */    
jsgl.util.Queue = function() {

  /**
   * Head element of the queue.
   * @type value
   * @private
   */           
  this.first = null;
  
  /**
   * Tailing element of the queue.
   * @type value
   * @private
   */         
  this.last = null;
  
  /**
   * Number of elements in the queue.
   * @type number
   * @private
   */   
  this.count = 0;
}

/**
 * @description Adds an item to the end of the queue.
 * @methodOf jsgl.util.Queue#
 * @param {value} item The item to enqueued.
 * @since version 1.0
 */  
jsgl.util.Queue.prototype.enqueue = function(item) {

  if(this.first == null) {
    this.first = this.last = { item : item, next : null };
  }
  else this.last.next = this.last = { item : item, next : null };
  this.count ++;
}

/**
 * @description Removes and returns the first element from the head of the queue.
 * If the queue is empty, <code>null</code> is returned. 
 * @methodOf jsgl.util.Queue#
 * @returns value
 * @since version 1.0
 */    
jsgl.util.Queue.prototype.dequeue = function() {

  var result = this.first && this.first.item;

  if(this.first != null) {
    if(this.last == this.first) this.last = null;
    this.first = this.first.next;
    this.count --;
  }

  return result;
}

/**
 * @description Returns the first element from the head of the queue, keeping
 * the item in the queue. If there are no elements in the Queue,
 * <code>null</code> is returned.
 * @methodOf jsgl.util.Queue#
 * @returns value
 * @since version 1.0
 */    
jsgl.util.Queue.prototype.peek = function() {

  return this.first && this.first.item;
}

/**
 * @description Gets the number of elements that are currently present in the queue.
 * @methodOf jsgl.util.Queue#
 * @returns number
 * @since version 1.0
 */    
jsgl.util.Queue.prototype.getCount = function() {

  return this.count;
}

/**
 * @description Returns string representation of the queue.
 * @methodOf jsgl.util.Queue#
 * @returns string
 * @since version 1.0
 */    
jsgl.util.Queue.prototype.toString = function() {

  var itemsStr = "";
  obj = this.first;
  while(obj)
  {
    if(obj != this.first) itemsStr += ",";
    itemsStr += obj.item;
    obj = obj.next;
  }
  return "Queue(count=" + this.getCount() + ",items=[" + itemsStr + "])";
}
;/**
 * @fileOverview <code>jsgl.util.CommandQueue</code> class implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Simple command queue implementation. Command queues are important for
 * handling events. The command queue prevents hazardeous states by executing
 * update operations invoked by individual events in FIFO manner. If an event
 * leads to changes in the list of listeners, it will not happen so before all
 * peer listeners have been executed.
 * @extends jsgl.util.Queue 
 * @constructor
 * @description Creates new instance of <code>jsgl.util.CommandQueue</code>
 * @since version 1.0
 */   
jsgl.util.CommandQueue = function() {

  jsgl.util.Queue.call(this);

  /**
   * Determines whether the command queue is currently stopped.
   * @type boolean
   * @private
   */           
  this.stopped = false;
}
jsgl.util.CommandQueue.jsglExtend(jsgl.util.Queue);

/**
 * @description Stops the command queue.
 * @methodOf jsgl.util.CommandQueue#
 * @since version 1.0
 */  
jsgl.util.CommandQueue.prototype.stop = function() {

  this.stopped = true;
}

/**
 * @description Runs the command queue.
 * @methodOf jsgl.util.CommandQueue#
 * @since version 1.0
 */   
jsgl.util.CommandQueue.prototype.go = function() {

  while(this.peek() != null) {
  
    this.dequeue();
  }
  
  this.stopped = false;
}

/**
 * @description Adds new subroutine at the end of the command queue.
 * @methodOf jsgl.util.CommandQueue#
 * @param {function()} item The subroutine to be added at the end of the queue.
 * @since version 1.0
 */    
jsgl.util.CommandQueue.prototype.enqueue = function(item) {

  if(this.stopped) jsgl.util.Queue.prototype.enqueue.call(this,item);
  else item();
}

/**
 * @description Executes the first subroutine at the head of the command queue
 * and removes it from the queue.
 * @methodOf jsgl.util.CommandQueue#
 * @since version 1.0  
 */
jsgl.util.CommandQueue.prototype.dequeue = function() {

  jsgl.util.Queue.prototype.dequeue.call(this)();
}
;/**
 * @fileOverview Implementation of <code>jsgl.util.EventRaiser</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */    

/**
 * @class EventRaiser class for MVC architecture.
 * @constructor
 * @description Instantiates new <code>jsgl.util.EventRaiser</code>.
 * @since version 1.0
 */    
jsgl.util.EventRaiser=function() {
  
  /**
   * The ArrayList of registered listeners.
   * @type jsgl.util.ArrayList
   * @private   
   */        
  this.listeners = new jsgl.util.ArrayList();
  
  /**
   * CommandQueue used for executing listeners. It avoids potential problems
   * caused by registering/unregistering during sequential execution of listeners.
   * @type jsgl.util.CommandQueue
   * @private   
   */         
  this.commandQueue = new jsgl.util.CommandQueue();
}

/**
 * @description Registers a function listening to the event.
 * @public 
 * @methodOf jsgl.util.EventRaiser# 
 * @param {function} listener The listener function. {@link jsgl.util.delegate}
 * may be used to provide method of a specific object. 
 * @since version 1.0
 */ 
jsgl.util.EventRaiser.prototype.registerListener = function(listener) {

  if(!listener) return;
  
  this.commandQueue.enqueue(jsgl.util.delegate(this,function()
    {
      this.listeners.add(listener);
    }));
}

/**
 * @description Unregisters a function listening to the event.
 * @public 
 * @methodOf jsgl.util.EventRaiser#
 * @param {function} listener The function that is currently listening to events
 * and shall not listen anymore.  
 * @since version 1.0
 */    
jsgl.util.EventRaiser.prototype.unregisterListener = function(listener) {

  if(!listener) return;

  this.commandQueue.enqueue(jsgl.util.delegate(this,function()
    {
      this.listeners.remove(listener);
    }));
}

/**
 * @description Raises an event. This results in sequential execution of all
 * the registered listeners.
 * @public 
 * @methodOf jsgl.util.EventRaiser#
 * @param {value} eventAtgs Event arguments that shall be passed to the listeners.
 * @since version 1.0
 */  
jsgl.util.EventRaiser.prototype.raiseEvent = function(eventArgs) {

  this.commandQueue.enqueue(jsgl.util.delegate(this,function()
    {
      this.commandQueue.stop();

      for(var i=0;i<this.listeners.getCount();i++)
      {
        this.listeners.get(i)(eventArgs);
      }
      
      this.commandQueue.go();
    }));
}
;/**
 * @fileOverview Sugar class <code>jsgl.util.Property</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Sugar property-wrapping class for simplification of MVC architecture
 * building.
 * @constructor
 * @param {value} value The initial value of the property.
 * @description Creates new instance of <code>jsgl.elements.Property</code>.
 * @since version 1.0
 */  
jsgl.util.Property=function(value) {

  /**
   * The value to be stored by the Property object.
   * @type value
   * @private
   */           
  this.value = value;
  
  /**
   * The event raiser object to inform listening objects about value changes.
   * @type jsgl.util.EventRaiser
   * @private
   */           
  this.eventRaiser=new jsgl.util.EventRaiser();
}

/**
 * @description Sets the value and informs the listeners about new value.
 * @methodOf jsgl.util.Property#
 * @param {value} value The new value.
 * @since version 1.0
 */  
jsgl.util.Property.prototype.setValue=function(value) {

  if(this.value != value)
  {
    this.value = value;
    this.eventRaiser.raiseEvent(value);
  }
}

/**
 * @description Gets the current value.
 * @methodOf jsgl.util.Property#
 * @returns value  
 * @since version 1.0
 */  
jsgl.util.Property.prototype.getValue=function() {

  return this.value;
}

/**
 * @description Register new listener to be informed about value changes.
 * @methodOf jsgl.util.Property#
 * @param {function(value)} listener The new listener to be added to the chain.
 * @since version 1.0
 */  
jsgl.util.Property.prototype.registerChangeListener=function(listener) {

  this.eventRaiser.registerListener(listener);
}

/**
 * @description Unregister already-present listener from listening to Property's
 * value changes. 
 * @methodOf jsgl.util.Property#
 * @param {function(value)} listener The listener to be removed from the chain.
 * @since version 1.0
 */   
jsgl.util.Property.prototype.unregisterChangeListener=function(listener) {

  this.eventRaiser.unregisterListener(listener);
};jsgl.util.StructuredProperty=function(value)
{
  /* parent constructor call */
  jsgl.util.Property.call(this,value);
  
  this.internalChangeListener=jsgl.util.delegate(this.eventRaiser,this.eventRaiser.raiseEvent);
}
jsgl.util.StructuredProperty.jsglExtend(jsgl.util.Property);

jsgl.util.StructuredProperty.prototype.getInternalChangeListener=function()
{
  return this.internalChangeListener;
};jsgl.util.singletonInstanceGetter=function()
{
  if(!this.instance)
  {
    this.instance=new this();
  }
  return this.instance;
};/**
 * @fileOverview Implementation of <code>jsgl.util.Animator</code> utility class.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Utility class for creating animations. Although it is especially useful
 * for programming graphics, its scope goes beyond graphics applications. 
 * @constructor
 * @description Creates new instance of <code>jsgl.util.Animator</code> class.
 * @since version 2.0
 */
jsgl.util.Animator = function() {
  
  /**
   * The start value of the animation's control parameter.
   * @type number
   * @private
   */
  this.startValue = 0;
  
  /**
   * The end value of the animation's control parameter.
   * @type number
   * @private
   */
  this.endValue = 1;

  /**
   * The duration of the animation in milliseconds.
   * @type number
   * @private
   */
  this.duration = 1000;           
  
  /**
   * Current time in milliseconds.
   * @type number
   * @private
   */
  this.currTime = 0;
  
  /**
   * Determines whether the animation should be reversed.
   * @type boolean
   * @private
   */
  this.reversed = false;           
  
  /**
   * The event raiser for the animation functions.
   * @type jsgl.util.EventRaiser
   * @private
   */
  this.animRaiser = new jsgl.util.EventRaiser();
  
  /**
   * The event raiser for the functions listening to animation start events.
   * @type jsgl.util.EventRaiser
   * @private
   */
  this.animStartRaiser = new jsgl.util.EventRaiser();         
  
  /**
   * The event raiser for the functions listening to animation end events.
   * @type jsgl.util.EventRaiser
   * @private
   */
  this.animEndRaiser = new jsgl.util.EventRaiser();
    
  /**
   * The time of the last step in milliseconds since midnight Jan 1, 1970.
   * @type number
   * @private
   */         
  this.prevStepTime = 0;
  
  /**
   * The timer identifier currently used.
   * @type number
   * @private
   */
  this.timer = 0;
  
  /**
   * Frames per second.  
   * @type number
   * @private   
   */
  this.fps = jsgl.util.BrowserInfo.isMSIE ? 10 : 20;
  
  /**
   * Determines whether the animator is in repeat mode or not.
   * @type boolean
   * @private      
   */
  this.repeat = false;
  
  /**
   * Determines whether the animator is currently playing or not.
   * @type number
   * @private      
   */     
  this.playing = false;
}

/**
 * @description Gets the currently set start value of the animation's control
 * parameter.
 * @methodOf jsgl.util.Animator#
 * @returns {number}
 * @since version 2.0
 */  
jsgl.util.Animator.prototype.getStartValue = function() {

  return this.startValue;
}

/**
 * @description Sets the new start value for the animation's control parameter. 
 * @methodOf jsgl.util.Animator#
 * @param {number} newValue The new start value of the control parameter.
 * @since version 2.0
 */  
jsgl.util.Animator.prototype.setStartValue = function(newValue) {

  this.startValue = newValue;
}

/**
 * @description Gets the currently set end value of the animation's control
 * parameter.
 * @methodOf jsgl.util.Animator#
 * @returns {number}
 * @since version 2.0
 */
jsgl.util.Animator.prototype.getEndValue = function() {

  return this.endValue;
}

/**
 * @description Sets the new end value for the animation's control parameter.
 * @methodOf jsgl.util.Animator#
 * @param {number} newValue The new end value for the control parameter.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.setEndValue = function(newValue)   {

  this.endValue = newValue;
}

/**
 * @description Gets the currently set duration of the animation in milliseconds.
 * @methodOf jsgl.util.Animator#
 * @returns {number}
 * @since version 2.0
 */
jsgl.util.Animator.prototype.getDuration = function() {

  return this.timeStep;
}

/**
 * @description Sets the duration of the animation in milliseconds.
 * @methodOf jsgl.util.Animator#
 * @param {number} newDuration The new duration in milliseconds.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.setDuration = function(newDuration) {

  this.duration = newDuration;
}

/**
 * @description Determines whether or not the animation is currently
 * in reversed mode.
 * @methodOf jsgl.util.Animator#
 * @returns {boolean}
 * @since version 2.0
 */
jsgl.util.Animator.prototype.getReversed = function() {

  return this.reversed;
}

jsgl.util.Animator.prototype.isReversed = function() {

  return this.reversed;
}


/**
 * @description Sets whether or not the animation should be reversed.
 * @methodOf jsgl.util.Animator#
 * @param {boolean} reversed True if the animation should be reversed, false
 * if not.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.setReversed = function(reversed) {

  this.reversed = reversed;
}

/**
 * @description Adds a listener function to be invoked when the animation
 * starts.
 * @methodOf jsgl.util.Animator#
 * @param {Function} listener The animation-start event listener to be added.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.addStartListener = function(listener) {

  this.animStartRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of animation-start
 * event listeners, making it to not listen anymore.
 * @methodOf jsgl.util.Animator#
 * @param {Function} listener The listener function to be removed.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.removeStartListener = function(listener) {

  this.animStartRaiser.unregisterListener(listener);
}  

/**
 * @description Adds a step function to be invoked on each step of the
 * animation. This is the crucial function that should control graphic elements
 * to make the animation work. When the function is executed, current parameter
 * value is passed to the function as an argument by the Animator. Based on
 * the parameter value, the function should perform desirable operations.
 * @methodOf jsgl.util.Animator#
 * @param {Function} listener The listener function to be added.
 * @since version 2.0 
 */
jsgl.util.Animator.prototype.addStepListener = function(listener) {

  this.animRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of animation-step
 * event listeners, making it to not listen anymore.
 * @methodOf jsgl.util.Animator#
 * @param {Function} listener The listener to be removed. 
 * @since version 2.0
 */
jsgl.util.Animator.prototype.removeStepListener = function(listener) {

  this.animRaiser.unregisterListener(listener);
}

/**
 * @description Adds a listener function to be invoked when the animation ends.
 * When the Animator is in the repeat mode, the end event is raised at the end
 * of each cycle. 
 * @methodOf jsgl.util.Animator#
 * @param {Function} listener The listener to be added.
 * @since version 2.0  
 */
jsgl.util.Animator.prototype.addEndListener = function(listener) {

  this.animEndRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of animation-end event
 * listeners, making it to not listen anymore.
 * @methodOf jsgl.util.Animator#
 * @param {Function} listener The listener to be removed.
 * 
 */
jsgl.util.Animator.prototype.removeEndListener = function(listener) {

  this.animEndRaiser.unregisterListener(listener);
}

/**
 * @description Time step function.
 * @private
 */ 
jsgl.util.Animator.prototype.step = function() {

  var currStepTime = (new Date()).getTime();
  
  if(this.prevStepTime) {
  
    this.currTime += (this.reversed ? -1 : 1) * (currStepTime - this.prevStepTime);
  }

  this.currTime = Math.max(0, Math.min(this.currTime, this.duration));

  var paramValue = this.startValue +
    (this.currTime / this.duration) * (this.endValue - this.startValue);
  
  this.animRaiser.raiseEvent(paramValue);
  
  if((!this.reversed && this.currTime == this.duration) ||
     (this.reversed && this.currTime == 0)) {
    
    if(this.repeat) {
    
      this.currTime = this.reversed ? this.duration : 0;
      this.prevStepTime = currStepTime;
    }
    else {
      window.clearInterval(this.timer);
      this.playing = false;
      this.timer = 0;
      //this.currTime = 0;
      this.prevStepTime = 0;
      //this.rewind();
    }

    this.animEndRaiser.raiseEvent();
  }
  else {

    this.prevStepTime = currStepTime;
  }
}

/**
 * @description Allows the animated objects to be correctly initialized before
 * the animation starts. This will simply invoke the step event without actually
 * playing the animation.
 * @methodOf jsgl.util.Animator#
 * @since version 2.0
 */
jsgl.util.Animator.prototype.init = function() {
  
  this.animRaiser.raiseEvent(this.startValue +
    (this.currTime / this.duration) * (this.endValue - this.startValue));
}     

/**
 * @description Plays the animation. If the animation is currently stopped, it
 * start playing from the beginning. If the animation has been previously
 * paused, it is continued from the point when the pause was invoked.
 * @methodOf jsgl.util.Animator#
 * @since version 2.0  
 */ 
jsgl.util.Animator.prototype.play = function() {

  if(this.currTime == this.duration && !this.reversed) {
    this.currTime = 0;
  }

  if(!this.currTime) {
  
    this.animStartRaiser.raiseEvent();
  }

  if(!this.timer) {
  
    this.step();
    this.timer = window.setInterval(jsgl.util.delegate(this, this.step), 1000/this.fps);
  }
  
  this.playing = true;
}

/**
 * @description Rewinds the animation to the start. This does not stop the
 * animation if it is playing.
 * @methodOf jsgl.util.Animator#
 * @since version 2.0
 */    
jsgl.util.Animator.prototype.rewind = function() {

  this.currTime = 0;
  this.prevStepTime = 0;
}

/**
 * @description Pauses the animation at the current point, allowing the play
 * to continue later.
 * @methodOf jsgl.util.Animator#
 * @since version 2.0
 */  
jsgl.util.Animator.prototype.pause = function() {

  window.clearInterval(this.timer);
  this.timer = 0;
  
  this.prevStepTime = 0;
  
  this.playing = false;
}

/**
 * @description Stops the animation, rewinding it to the start.
 * @methodOf jsgl.util.Animator#
 * @since version 2.0
 */   
jsgl.util.Animator.prototype.stop = function() {

  window.clearInterval(this.timer);
  this.timer = 0;
  
  this.currTime = 0;
  this.prevStepTime = 0;
  this.step();
  this.currTime = 0;
  this.prevStepTime = 0;
  
  this.playing = false;

}

/**
 * @description Sets whether or not the animation should be played in a loop.
 * @methodOf jsgl.util.Animator#
 * @param {Boolean} repeating True if the animation should repeat, false if not.
 * @since version 2.0 
 */   
jsgl.util.Animator.prototype.setRepeating = function(repeating) {
  
  this.repeat = repeating;
}

/**
 * @description Determines whether the animation is currently in repeat mode
 * or not.
 * @methodOf jsgl.util.Animator#
 * @returns {Boolean} 
 * @since version 2.0
 */    
jsgl.util.Animator.prototype.isRepeating = function() {

  return this.repeat;
}

/**
 * @description Determines whether or not the animation is currently playing.
 * @methodOf jsgl.util.Animator#
 * @returns {Boolean}
 * @since version 2.0
 */    
jsgl.util.Animator.prototype.isPlaying = function() {

  return this.playing;
}

/**
 * @description Sets the number of steps that the Animator should invoke
 * per second. This overrides the default setting, which is 10 FPS for MSIE
 * and 20 FPS for other browsers. When the CPU is too busy and the browser
 * does not manage to perform as many FPS as required, some frames may be
 * dropped. The Animator primarily aims to meet the required duration of the
 * animation, not to execute every single step according to the desired FPS.
 * It is recommended, however, not to set the FPS value to high, because using
 * too much CPU will definitely not result in a pleasurable user experience.
 * @methodOf jsgl.util.Animator#
 * @param {Number} newFps The new number of frames per second.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.setFps = function(newFps) {

  this.fps = newFps;
}

/**
 * @description Gets the current FPS of the Animator. If no FPS has been set
 * manually before, the value returned may be browser-dependent.
 * @methodOf jsgl.util.Animator#
 * @returns {Number} The current number of steps that the Animator tends to
 * invoke per second.
 * @since version 2.0
 */
jsgl.util.Animator.prototype.getFps = function() {

  return this.fps;
} ;jsgl.Vector2D = function(x,y) {

  this.X = typeof(x)=="number" ? x : 0;
  this.Y = typeof(y)=="number" ? y : 0;
}

jsgl.Vector2D.NULL = new jsgl.Vector2D();
jsgl.Vector2D.INVALID = new jsgl.Vector2D(Number.NaN, Number.NaN);

/**
 * @methodOf jsgl.Vector2D#
 * @description Gets the current X-axis coordinate of the vector.
 * @returns {Number}
 * @since version 1.0
 */    
jsgl.Vector2D.prototype.getX = function() {

  return this.X;
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Sets the X-axis coordinate of the vector.
 * @param {Number} newX The new value for the X-axis coordinate.
 * @since version 1.0
 */  
jsgl.Vector2D.prototype.setX = function(newX) {

  this.X = typeof(newX) == "number" ? newX : 0;
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Gets the current Y-axis coordinate of the vector.
 * @returns {Number}
 * @since version 1.0
 */    
jsgl.Vector2D.prototype.getY = function() {

  return this.Y;
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Sets the Y-axis coordinate of the vector.
 * @param {Number} newY The new value for the Y-axis coordinate.
 * @since version 1.0
 */  
jsgl.Vector2D.prototype.setY = function(newY) {

  this.Y = typeof(newY) == "number" ? newY : 0;
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Creates a new vector whose X and Y components are the
 * coordinates of the current vector, translated by a vector given as a parameter.
 * The current vector remains unchanged. 
 * @param {jsgl.Vector2D} v The translation vector.
 * @since version 1.0
 */ 
jsgl.Vector2D.prototype.add = function(v) {

  return new jsgl.Vector2D(this.X + v.X, this.Y + v.Y);
}

/**
 * @methodOf jsgl.Vector2D#
 * @descriptions Creates a new vector whose X and Y components are the
 * coordinates of the current vector, translated by a negation of the vector
 * given as a parameter. The current vector remains unchanged.
 * @param {jsgl.Vector2D} v The inverse-translation vector.
 * @since version 1.0
 */ 
jsgl.Vector2D.prototype.subtract = function(v) {

  return new jsgl.Vector2D(this.X - v.X, this.Y - v.Y);
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Creates a new vector obtained by rotation of the current vector
 * around point [<code>centerX</code>,<code>centerY</code>] by <code>angle</code>
 * given in radians.
 * @param {Number} centerX The X-coordinate of the rotation origin.
 * @param {Number} centerY The Y-coordinate of the rotation origin.
 * @param {Number} angle The angle by which the current vector will be rotated,
 * given in radians.
 * @since version 1.0
 */           
jsgl.Vector2D.prototype.rotate = function(centerX, centerY, angle) {

  var alpha = angle + Math.atan2(this.Y - centerY, this.X - centerX),
      radius = Math.sqrt((this.X - centerX) * (this.X - centerX) +
                         (this.Y - centerY) * (this.Y - centerY));

  return new jsgl.Vector2D(centerX + Math.cos(alpha) * radius,
                           centerY + Math.sin(alpha) * radius);
}

/**
 * @methodOf jsgl.Vector2D# 
 * @since version 2.0
 */ 
jsgl.Vector2D.prototype.multiply = function(t) {

  return new jsgl.Vector2D(t*this.X, t*this.Y);
}

jsgl.Vector2D.prototype.round = function() {
  return new jsgl.Vector2D(Math.round(this.X), Math.round(this.Y));
}

jsgl.Vector2D.prototype.applyToCSSLocationOf=function(element)
{
  element.style.left=this.X+"px";
  element.style.top=this.Y+"px";
}

jsgl.Vector2D.prototype.applyToCSSSizeOf=function(element)
{
  element.style.width=this.X+"px";
  element.style.height=this.Y+"px";
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Tests whether the vector is equal to the object given as the
 * argument.
 * @returns {Boolean} <code>false</code> if the argument is not instance of
 * <code>jsgl.Vector2D</code>, or if differs in X or Y component. <code>true<code>
 * if the argument is <code>jsgl.Vector2D</code> object, which is component-wise
 * equal to the current vector.
 * @since version 1.0
 */   
jsgl.Vector2D.prototype.equals = function(obj) {

  if(obj == null || typeof(obj) != "object") return false;
  if(obj.constructor != jsgl.Vector2D) return false;
  
  return (obj.X==this.X) && (obj.Y==this.Y);
}

/**
 * @methodOf jsgl.Vector2D#
 * @description Converts the vector to string representation.
 * @returns {String}
 * @since version 1.0
 */  
jsgl.Vector2D.prototype.toString = function() {
  return this.X+" "+this.Y;
}

/**
 * @methodOf jsgl.Vector2D
 * @description Calculated the Euclidean distance between the two vectors given
 * as arguments.
 * @returns {Number} Non-negative real number.
 * @since version 1.0
 */ 
jsgl.Vector2D.getDistance = function(vectA, vectB) {

  return Math.sqrt((vectA.X - vectB.X)*(vectA.X - vectB.X) + (vectA.Y - vectB.Y)*(vectA.Y - vectB.Y));
};/**
 * @fileOverview <code>jsgl.stroke.AbstractStroke</code> class declaration.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Base class for outline-styling objects for JSGL elements.
 * @constructor
 * @description Base constructor for any element outline-styling object.
 * @since version 1.0
 */    
jsgl.stroke.AbstractStroke = function() {

  /**
   * The MVC event raiser responsible for the propagation of changes made in the
   * stroke object. The set of listeners will always contain all the JSGL API
   * elements that use the stroke object for styling. Whenever informed about
   * change in fill, they informorm their DOM presenters that repaint should
   * take place.
   * @type jsgl.util.EventRaiser
   * @private            
   */     
  this.onChangeRaiser = new jsgl.util.EventRaiser();
}

/**
 * @description Applies the stroke properties to a SVG element. Typically, the
 * CSS <code>style</code> attributes are used to achieve that.
 * @methodOf jsgl.stroke.AbstractStroke#
 * @param {SVGElement} svgElement The SVG element to which the stroke properties
 * will be applied.
 * @abstract
 * @since version 1.0
 */   
jsgl.stroke.AbstractStroke.prototype.applyToSvgElement = function(svgElement) {

  throw "not implemented";
}

/**
 * @description Applies the stroke properties to a VML <code>&lt;stroke&gt;</code>
 * element, which is typically a subelement of some VML shape-defining element.
 * The stroke properties are typically applied by setting XML attribute values
 * of the <code>&lt;stroke&gt;</code>.
 * @methodOf jsgl.stroke.AbstractStroke#
 * @param {VmlStrokeElement} strokeElement The VML <code>&lt;stroke&gt;</code>
 * subelement to which the stroke should be applied.
 * @abstract 
 * @since version 1.0
 */   
jsgl.stroke.AbstractStroke.prototype.applyToVmlStrokeElement = function(strokeElement) {

  throw "not implemented";
}

/**
 * @description Registers a function listening to changes in the properties of
 * the stroke object. Typically, JSGL API elements are listening to the changes,
 * allowing MVC repainting to be done whenever the stroke changes.
 * @methodOf jsgl.stroke.AbstractStroke#
 * @param {function} listener The function to start listening to changes in the
 * stroke object.
 * @since version 1.0   
 */ 
jsgl.stroke.AbstractStroke.prototype.registerChangeListener = function(listener)
{
  this.onChangeRaiser.registerListener(listener);
}

/**
 * @description Removes a function that is already listening to changes in the
 * stroke object from the pool of listeners. This is typically needed when
 * a stroke object of sime JSGL API element is replaced by another one, making
 * changes in the old one unimportant.
 * @methodOf jsgl.stroke.AbstractStroke#
 * @param {function} listener The already-listening function that should be
 * removed from the pool of listeners.
 * @since version 1.0
 */   
jsgl.stroke.AbstractStroke.prototype.unregisterChangeListener = function(listener) {

  this.onChangeRaiser.unregisterListener(listener);
};/**
 * @fileOverview Implementation of <code>jsgl.stroke.DisabledStroke</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */    

/**
 * @class A trivial stroke-styling API class that does notning but disabling the
 * stroke completely.
 * @extends jsgl.stroke.AbstractStroke
 * @constructor
 * @description Creates new instance of the <code>jsgl.stroke.DisabledStroke</code>
 * class. Typically, this is not needed since a singleton instance is always
 * accessible via <code>jsgl.stroke.DISABLED</code>.
 * @since version 1.0
 * @version 2.0 
 */ 
jsgl.stroke.DisabledStroke = function() {

  jsgl.stroke.AbstractStroke.call(this);
}
jsgl.stroke.DisabledStroke.jsglExtend(jsgl.stroke.AbstractStroke);

/**
 * A singleton instance of the <code>jsgl.stroke.DisabledStoke</code> class.
 * @type jsgl.stroke.DisabledStroke
 * @static
 */   
jsgl.stroke.DISABLED = new jsgl.stroke.DisabledStroke();

/**
 * @description Turns off the stroke for the given SVG element.
 * @methodOf jsgl.stroke.DisabledStroke#
 * @param {SVGElement} svgElement The SVG elements whose outline-painting
 * should be disabled.
 * @since version 1.0
 */   
jsgl.stroke.DisabledStroke.prototype.applyToSvgElement = function(svgElement) {

  svgElement.style.setProperty("stroke", "none", null);
}

/**
 * @description Turns off the stroke via given VML <code>&lt;stroke&gt;</code>
 * subelement.
 * @methodOf jsgl.stroke.DisabledStroke#
 * @param {VmlStrokeElement} strokeElement The VML <code>&lt;stroke&gt;</code>
 * subelement that should be set as disabled.
 * @since version 1.0  
 */
jsgl.stroke.DisabledStroke.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.on = false;
};/**
 * @fileOverview Implementation of <code>jsgl.stroke.SolidStroke</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class General outline-styling API class. Allows outline to be painted with
 * specific weight, color, opacity, dash style, endcap type and join style.
 * @extends jsgl.stroke.AbstractStroke#
 * @constructor
 * @description Creates new instance of the <code>jsgl.stroke.SolidStroke</code>
 * class.
 * @since version 1.0
 * @version 2.0 
 */
jsgl.stroke.SolidStroke = function() {

  jsgl.stroke.AbstractStroke.call(this);

  /**
   * The weight (width) of the stroke in pixels.
   * @type number
   * @private
   */      
  this.weight = 1;

  /**
   * The color of the stroke in HTML format.
   * @type string
   * @private
   */      
  this.color = "black";
  
  /**
   * The opacity of the stroke. This is a real number from interval [0,1].
   * @type number
   * @private
   */      
  this.opacity = 1;

  /**
   * Determines whether or not the outline rendering is enabled or not. If it is
   * disabled, the result is the same as if the <code>jsgl.stroke.DISABLED</code>
   * object was used.
   * @type boolean
   * @private
   */                 
  this.enabled = true;

  /**
   * The dash style defining object to be used by the stroke object. It
   * controls the dash pattern of the outline.      
   * @type jsgl.stroke.AbstractDashStyle
   * @private
   */         
  this.dashStyle = new jsgl.stroke.SolidDashStyle();
  
  /**
   * The endcap type defining object to be used by the stroke object.
   * @type jsgl.stroke.AbstractEndcapType
   * @private
   */   
  this.endcapType = new jsgl.stroke.RoundEndcapType();
  
  /**
   * The join style type defining object to be used by the stroke object.
   * @type jsgl.stroke.AbstractJoinStyle
   * @private
   */
  this.joinStyle = new jsgl.stroke.RoundJoinStyle();
}
jsgl.stroke.SolidStroke.jsglExtend(jsgl.stroke.AbstractStroke);

/**
 * @description Applies the stroke properties to a SVG elements. The properties
 * are applied via CSS <code>style</code> attribute.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {SVGElement} svgElement The SVG element to which the stroke properties
 * will be applied.
 * @since version 1.0
 */   
jsgl.stroke.SolidStroke.prototype.applyToSvgElement = function(svgElement) {

  if(this.enabled) {

    svgElement.style.setProperty("stroke", this.color, null);
    svgElement.style.setProperty("stroke-width", this.weight+"px", null);
    svgElement.style.setProperty("stroke-opacity", this.opacity, null);
    this.dashStyle.applyToSvgElement(svgElement, this.weight);
    this.endcapType.applyToSvgElement(svgElement);
    this.joinStyle.applyToSvgElement(svgElement);
  }
  else {

    svgElement.style.setProperty("stroke", "none", null);
  }
}

/**
 * @description Applies the stroke properties to a VML <code>stroke</code>
 * subelement.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {VmlStrokeElement} strokeElement The VML <code>stroke</code> element
 * to which properties of the stroke will be applied.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.applyToVmlStrokeElement = function(strokeElement) {

  if(this.enabled) {

    strokeElement.color = this.color;
    strokeElement.weight = this.weight+"px";
    strokeElement.opacity = this.opacity;
    strokeElement.on = true;
    this.dashStyle.applyToVmlStrokeElement(strokeElement);
    this.endcapType.applyToVmlStrokeElement(strokeElement);
    this.joinStyle.applyToVmlStrokeElement(strokeElement);
  }
  else {

    strokeElement.on = false;
  }
}

/**
 * @description Gets the current weight (i.e. width) of the stroke in pixels.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.stroke.SolidStroke.prototype.getWeight = function() {

  return this.weight;
}

/**
 * @description Sets the new weight (i.e. width) of the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {number} newWeight A real number that the new stroke weight will be
 * set to.
 * @since version 1.0
 */   
jsgl.stroke.SolidStroke.prototype.setWeight = function(newWeight) {

  this.weight = newWeight;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current color of the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.stroke.SolidStroke.prototype.getColor = function() {

  return this.color;
}

/**
 * @description Sets the new color of the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {string} newColor The new color of the stroke in CSS format.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.setColor = function(newColor) {

  this.color = newColor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current opacity of the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {number}
 * @since version 1.0
 */
jsgl.stroke.SolidStroke.prototype.getOpacity = function() {

  return this.opacity;
}

/**
 * @description Sets the new opacity of the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {number} newOpacity A real number from interval [0,1], where 0.0 means
 * fully transparent, 1.0 means fully opaque.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.setOpacity = function(newOpacity) {

  this.opacity = newOpacity;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the dash style object currently used by the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {jsgl.stroke.AbstractDashStyle} The dash style object currently used.
 * @since version 1.0
 */    
jsgl.stroke.SolidStroke.prototype.getDashStyle = function() {

  return this.dashStyle;
}

/**
 * @description Sets the new dash style specifying object to be used by the
 * stroke. The dash style object controls the pattern of dashes and gaps used
 * by the stroke paths. Singleton dash styles from <code>jsgl.DashStyles</code>
 * enumeration can be used.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {jsgl.stroke.AbstractDashStyle} dashStyle The new dash style object.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.setDashStyle = function(dashStyle) {

  this.dashStyle = dashStyle;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the endcap type object currently used by the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {jsgl.stroke.AbstractEndcapType} The endcap type object currently
 * used. 
 * @since version 1.0
 */     
jsgl.stroke.SolidStroke.prototype.getEndcapType = function() {

  return this.endcapType;
}

/**
 * @description Sets the new endcap type specifying object to be used by the
 * stroke. The endcap type object specifies the shape to be used at the end of
 * open subpaths when they are stroked. Singleton endcap types from
 * <code>jsgl.EndcapTypes</code> enumeration can be used.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {jsgl.stroke.AbstractEndcapType} endcapType The new encap type object.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.setEndcapType = function(endcapType) {

  this.endcapType = endcapType;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Get the join style object currently used by the stroke.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {jsgl.stroke.AbstractJoinStyle} The join style object currently
 * used.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.getJoinStyle = function() {

  return this.joinStyle;
}

/**
 * @description Sets the new join style specifying object to be used for the
 * stroke. The join style object specifies the shape to be used at the corners
 * of paths or basic shapes when they are stroked. Singleton join styles from
 * <code>jsgl.JoinStyles</code> enumeration can be used.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {jsgl.stroke.AbstractJoinStyle} joinStyle The new join style object.
 * @since version 1.0
 */  
jsgl.stroke.SolidStroke.prototype.setJoinStyle = function(joinStyle) {

  this.joinStyle = joinStyle;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether the stroke is currently enabled or not.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {boolean} <code>true</code> if the stroke is enabled,
 * <code>false</code> if it is disabled.
 * @since version 1.0
 * @deprecated 
 */  
jsgl.stroke.SolidStroke.prototype.getEnabled = function() {

  return this.enabled;
}

jsgl.stroke.SolidStroke.prototype.isEnabled = jsgl.stroke.SolidStroke.prototype.getEnabled;

/**
 * @description Determines whether the stroke is currently enabled or not.
 * @methodOf jsgl.stroke.SolidStroke#
 * @returns {boolean} <code>true</code> if the stroke is enabled,
 * <code>false</code> if it is disabled.
 * @since version 2.0
 */
jsgl.stroke.SolidStroke.prototype.isEnabled = function() {

  return this.enabled;
}

/**
 * @description Sets whether or not to enable the stroke. If the stroke is
 * disabled, the result is the same as if the <code>jsgl.stroke.DISABLED</code>
 * object was used, i.e. no stroke will be painted.
 * @methodOf jsgl.stroke.SolidStroke#
 * @param {boolean} enabled If <code>true</code>, the stroke will be enabled,
 * if <code>false</code>, the stroke will be disabled.
 * @since version 1.0
 */   
jsgl.stroke.SolidStroke.prototype.setEnabled = function(enabled) {

  this.enabled = enabled;
  this.onChangeRaiser.raiseEvent();
}
;/**
 * @fileOverview <code>jsgl.stroke.AbstractEndcapType</code> declaration.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Base class for endcap type controlling classes for
 * <code>jsgl.stroke.SolidStroke</code>. The endcap type specifies the shape to
 * be used at the end of open subpaths when they are stroked. There are three
 * inheriting classes:
 * <ul> 
 * <li>{@link jsgl.stroke.RoundEndcapType} for round endcap,</li>
 * <li>{@link jsgl.stroke.FlatEndcapType} for flat endcap,</li>
 * <li>{@link jsgl.stroke.SquareEndcaoType} for square endcap.</li>  
 * </ul>
 * All the inheriting classes must be able to specify the endcap for both the
 * VML and SVG elements.
 * @since version 1.0    
 */
jsgl.stroke.AbstractEndcapType = function() {

}

/**
 * @description Applies the endcap type to a SVG element. This is done via CSS
 * <code>stroke-linecap</code> property.
 * @methodOf jsgl.stroke.AbstractEndcapType#
 * @param {SVGElement} svgElement The SVG element to which the endcap type will
 * be applied.
 * @abstract 
 * @since version 1.0
 */    
jsgl.stroke.AbstractEndcapType.prototype.applyToSvgElement = function(svgElement) {

  throw "not implemented";
}

/**
 * @description Applies the endcap type to a VML stroke subelement. This is done
 * via its <code>endcap</code> attribute.
 * @methodOf jsgl.stroke.AbstractEndcapType#
 * @param {VmlStrokeElement} strokeElement The VML stroke element to which the
 * endcap will be applied.
 * @abstract
 * @since version 1.0   
 */ 
jsgl.stroke.AbstractEndcapType.prototype.applyToVmlStrokeElement = function(strokeElement) {

  throw "not implemented";
};/**
 * @fileOverview <code>jsgl.stroke.FlatEndcapType</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Flat endcap type.
 * @extends jsgl.stroke.AbstractEndcapType
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.FlatEndcapType</code>
 * class. Typically, calling this constructor is not needed since there is
 * a singleton instance available via <code>jsgl.EndcapTypes.FLAT</code>. Also,
 * the singleton instance may be obtained via static
 * {@link jsgl.stroke.FlatEndcapType.getInstance} method.
 * @since version 1.0
 */
jsgl.stroke.FlatEndcapType = function() {

}
jsgl.stroke.FlatEndcapType.jsglExtend(
  jsgl.stroke.AbstractEndcapType);

/**
 * @methodOf jsgl.stroke.FlatEndcapType#
 * @see jsgl.stroke.AbstractEndcapType#applyToSvgElement
 * @since version 1.0
 */
jsgl.stroke.FlatEndcapType.prototype.applyToSvgElement = function(svgElement) {

  svgElement.style.setProperty("stroke-linecap", "butt", null);
}

/**
 * @methodOf jsgl.stroke.FlatEndcapType#
 * @see jsgl.stroke.AbstractEndcapType#applyToVmlStrokeElement
 * @since version 1.0
 */
jsgl.stroke.FlatEndcapType.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.endcap = "flat";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.FlatEndcapType</code> class.
 * @methodOf jsgl.stroke.FlatEndcapType
 * @static
 * @since version 1.0
 */
jsgl.stroke.FlatEndcapType.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.RoundEndcapType</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Round endcap type.
 * @extends jsgl.stroke.AbstractEndcapType
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.RoundEndcapType</code>
 * class. Typically, calling this constructor is not needed since there is
 * a singleton instance available via <code>jsgl.EndcapTypes.ROUND</code>. Also,
 * the singleton instance may be obtained via static
 * {@link jsgl.stroke.RoundEndcapType.getInstance} method.
 * @since version 1.0
 */  
jsgl.stroke.RoundEndcapType = function() {

}
jsgl.stroke.RoundEndcapType.jsglExtend(
  jsgl.stroke.AbstractEndcapType);

/**
 * @methodOf jsgl.stroke.RoundEndcapType#
 * @see jsgl.stroke.AbstractEndcapType#applyToSvgElement
 * @since version 1.0
 */   
jsgl.stroke.RoundEndcapType.prototype.applyToSvgElement = function(svgElement) {

  svgElement.style.setProperty("stroke-linecap", "round", null);
}

/**
 * @methodOf jsgl.stroke.RoundEndcapType#
 * @see jsgl.stroke.AbstractEndcapType#applyToVmlStrokeElement
 * @since version 1.0
 */
jsgl.stroke.RoundEndcapType.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.endcap = "round";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.RoundEndcapType</code> class.
 * @methodOf jsgl.stroke.RoundEndcapType
 * @static
 * @since version 1.0
 */
jsgl.stroke.RoundEndcapType.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.SquareEndcapType</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Square endcap type.
 * @extends jsgl.stroke.AbstractEndcapType
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.SquareEndcapType</code>
 * class. Typically, calling this constructor is not needed since there is
 * a singleton instance available via <code>jsgl.EndcapTypes.SQUARE</code>.
 * Also, the singleton instance may be obtained via static
 * {@link jsgl.stroke.SquareEndcapType.getInstance} method.
 * @since version 1.0
 */
jsgl.stroke.SquareEndcapType = function() {

}
jsgl.stroke.SquareEndcapType.jsglExtend(
  jsgl.stroke.AbstractEndcapType);

/**
 * @methodOf jsgl.stroke.SquareEndcapType#
 * @see jsgl.stroke.AbstractEndcapType#applyToSvgElement
 * @since version 1.0
 */
jsgl.stroke.SquareEndcapType.prototype.applyToSvgElement = function(svgElement) {

  svgElement.style.setProperty("stroke-linecap", "square", null);
}

/**
 * @methodOf jsgl.stroke.SquareEndcapType#
 * @see jsgl.stroke.AbstractEndcapType#applyToVmlStrokeElement
 * @since version 1.0
 */
jsgl.stroke.SquareEndcapType.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.endcap = "square";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.SquareEndcapType</code> class.
 * @methodOf jsgl.stroke.SquareEndcapType
 * @static
 * @since version 1.0
 */
jsgl.stroke.SquareEndcapType.getInstance = jsgl.util.singletonInstanceGetter;
;jsgl.stroke.AbstractJoinStyle=function()
{
  this.onChangeRaiser=new EventRaiser();
}

jsgl.stroke.AbstractJoinStyle.prototype.applyToSvgElement=function(svgElement)
{
  throw "not implemented";
}

jsgl.stroke.AbstractJoinStyle.prototype.applyToVmlStrokeElement=function(strokeElement)
{
  throw "not implemented";
}

jsgl.stroke.AbstractJoinStyle.prototype.containsPointStrokeTest=function(
  point,vertexLocation,orientationA,orientationB,strokeWidth)
{
  return false;
}

jsgl.stroke.AbstractJoinStyle.prototype.registerChangeListener=function(listener)
{
  this.onChangeRaiser.registerListener(listener);
}

jsgl.stroke.AbstractJoinStyle.prototype.unregisterChangeListener=function(listener)
{
  this.onChangeRaiser.unregisterListener(listener);
};jsgl.stroke.BevelJoinStyle=function()
{
}
jsgl.stroke.BevelJoinStyle.jsglExtend(jsgl.stroke.AbstractJoinStyle);

jsgl.stroke.BevelJoinStyle.prototype.applyToSvgElement=function(svgElement)
{
  svgElement.style.setProperty("stroke-linejoin","bevel",null);
}

jsgl.stroke.BevelJoinStyle.prototype.applyToVmlStrokeElement=function(strokeElement)
{
  strokeElement.joinstyle="bevel";
}

jsgl.stroke.BevelJoinStyle.prototype.containsPointStrokeTest=function(
  point,vertexLocation,orientationA,orientationB,strokeWidth)
{
  var u1=Math.cos(orientationA+Math.PI/2)*strokeWidth/2,
      u2=Math.sin(orientationA+Math.PI/2)*strokeWidth/2,
      v1=Math.cos(orientationB-Math.PI/2)*strokeWidth/2,
      v2=Math.sin(orientationB-Math.PI/2)*strokeWidth/2,
      w1=point.X-vertexLocation.X,
      w2=point.Y-vertexLocation.Y;
  
  var t=(u1*w2 - u2*w1)/(u1*v2 - u2*v1),
      s=(w1-v1*t)/u1;
  
  return (s >= 0) && (t >= 0) && (s + t <= 1);  
}

jsgl.stroke.BevelJoinStyle.getInstance=jsgl.util.singletonInstanceGetter;;jsgl.stroke.MiterJoinStyle=function(miterLimit)
{
  this.miterLimit=miterLimit;
}
jsgl.stroke.MiterJoinStyle.jsglExtend(jsgl.stroke.AbstractJoinStyle);

jsgl.stroke.MiterJoinStyle.prototype.applyToSvgElement=function(svgElement)
{
  svgElement.style.setProperty("stroke-linejoin","miter",null);
  svgElement.style.setProperty("stroke-miterlimit",this.miterLimit,null);
}

jsgl.stroke.MiterJoinStyle.prototype.applyToVmlStrokeElement=function(strokeElement)
{
  strokeElement.joinstyle="miter";
  strokeElement.miterlimit=this.miterLimit;
}

/* begin property: miterLimit */
jsgl.stroke.MiterJoinStyle.prototype.getMiterLimit=function()
{
  return this.miterLimit;
}

jsgl.stroke.MiterJoinStyle.prototype.setMiterLimit=function(miterLimit)
{
  this.miterLimit = miterLimit;
  this.onChangeRaiser.raiseEvent();
}
/* end property: miterLimit*/;jsgl.stroke.RoundJoinStyle=function()
{
}
jsgl.stroke.RoundJoinStyle.jsglExtend(jsgl.stroke.AbstractJoinStyle);

jsgl.stroke.RoundJoinStyle.prototype.applyToSvgElement=function(svgElement)
{
  svgElement.style.setProperty("stroke-linejoin","round",null);
}

jsgl.stroke.RoundJoinStyle.prototype.applyToVmlStrokeElement=function(strokeElement)
{
  strokeElement.joinstyle="round";
}

jsgl.stroke.RoundJoinStyle.prototype.containsPointStrokeTest=function(
  point,vertexLocation,orientationA,orientationB,strokeWidth)
{
  return jsgl.Vector2D.getDistance(point, vertexLocation) <= strokeWidth/2;
}

jsgl.stroke.RoundJoinStyle.getInstance=jsgl.util.singletonInstanceGetter;;/**
 * @fileOverview Declaration and implementation of
 * <code>jsgl.stroke.AbstractDashStyle</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Base class for dash pattern controlling classes for
 * <code>jsgl.style.SolidStroke</code>. All the inheriting provide some pattern
 * of dashes and gaps used to stroke paths. To achieve compatibility of VML,
 * only finite number of dash patterns (represented by individual inheriting
 * classes) is available.
 * @since version 1.0
 */ 
jsgl.stroke.AbstractDashStyle = function() {

}

/**
 * @description Gets the array for the dashes and gaps pattern to be used by
 * the stroke.
 * @methodOf jsgl.stroke.AbstractDashStyle#
 * @returns {array} Array of numbers coding the dashed and gaps pattern. The
 * sizes are relative to the weight of the stroke.
 * @abstract 
 * @since version 1.0
 */
jsgl.stroke.AbstractDashStyle.prototype.getDashArray = function() {

  throw "not implemented";
}

/**
 * @description Applies the dash style pattern to a SVG element. This is done
 * via CSS <code>stroke-dasharray</code> property of the element. For SVG, this
 * method is the same for all the inheriting classes -- it only uses the
 * implementation of abstract <code>getDashArray</code> method.
 * @methodOf jsgl.stroke.AbstractDashStyle#
 * @param {SVGElement} svgElement The SVG element to which the dash style will
 * be applied.
 * @param {number} strokeWeight Current weight of the stroke. Because the dash
 * patterns (following VML) are relative to the weight of the stroke, the weight
 * must be provided for convertion to absolutely-measured dash patterns in SVG.
 * @since version 1.0
 */   
jsgl.stroke.AbstractDashStyle.prototype.applyToSvgElement = function(svgElement, strokeWeight) {

  var dashArray = this.getDashArray();
  for(var i=0; i<dashArray.length; i++) {
  
    dashArray[i] *= strokeWeight;

    if(!dashArray[i]) {
      // bugfix for browsers that do not support zero-length dashes
      dashArray[i] += 1e-2;
    }
  }

  svgElement.style.setProperty("stroke-dasharray", dashArray.join(), null)
}

/**
 * @description Applies the dash style pattern to a VML <code>stroke</code>
 * subelement. Every subclass provides a valid VML dash style name.
 * @methodOf jsgl.stroke.AbstractDashStyle#
 * @param {VmlStrokeElement} strokeElement The VML <code>stroke</code> element
 * to which the dash style will be applied.
 * @abstract  
 * @since version 1.0
 */   
jsgl.stroke.AbstractDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  throw "not implemented";
};/**
 * @fileOverview <code>jsgl.stroke.DashDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Short dashes dash pattern class.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.DashDashStyle</code>
 * class. Typically, calling this constructor is not necessary since there is
 * a singleton instance available via <code>jsgl.DashStyles.DASH</code>.
 * Also, the singleton instance may be obtained via the static
 * {@link jsgl.stroke.DashDashStyle.getInstance} method. 
 * @since version 1.0
 */
jsgl.stroke.DashDashStyle = function() {

}
jsgl.stroke.DashDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.DashDashStyle#
 * @returns {array} [3,4]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray
 * @since version 1.0 
 */ 
jsgl.stroke.DashDashStyle.prototype.getDashArray = function() {

  return [3,4];
}

/**
 * @methodOf jsgl.stroke.DashDashStyle#
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement 
 * @since version 1.0
 */   
jsgl.stroke.DashDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "dash";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.DashDashStyle</code> class.
 * @methodOf jsgl.stroke.DashDashStyle 
 * @static
 * @since version 1.0
 */
jsgl.stroke.DashDashStyle.getInstance = jsgl.util.singletonInstanceGetter;;/**
 * @fileOverview <code>jsgl.stroke.DashDotDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Dash pattern class providing alternating short dashes and dots.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.DashDotDashStyle</code>
 * class. Typically, calling this constructor is not necessary since there is
 * a singleton instance available via <code>jsgl.DashStyles.DASH_DOT</code>.
 * Also, the singleton instance may be obtained via static
 * {@link jsgl.stroke.DashDotDashStyle.getInstance} method.
 * @since version 1.0
 */
jsgl.stroke.DashDotDashStyle = function() {

}
jsgl.stroke.DashDotDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.DashDotDashStyle
 * @returns {array} [3,4,0,4]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray  
 * @since version 1.0 
 */   
jsgl.stroke.DashDotDashStyle.prototype.getDashArray = function() {

  return [3,4,0,4];
}

/**
 * @methodOf jsgl.stroke.DashDotDashStyle
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement   
 * @since version 1.0
 */  
jsgl.stroke.DashDotDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "dashdot";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.DashDotDashStyle</code> class.
 * @methodOf jsgl.stroke.DashDotDashStyle
 * @static
 * @since version 1.0    
 */ 
jsgl.stroke.DashDotDashStyle.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.DotDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Dash pattern class providing simple pattern of dots.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.DotDashStyle</code>
 * class. Typically, calling this constructor is not necessary since there is
 * a singleton instance available via <code>jsgl.DashStyles.DOT</code>.
 * Also, the singleton instance may be obtained via the static
 * {@link jsgl.stroke.DashDashStyle.getInstance} method.  
 * @since version 1.0
 */
jsgl.stroke.DotDashStyle = function() {

}
jsgl.stroke.DotDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.DotDashStyle
 * @returns {array} [0,4]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray 
 * @since version 1.0
 */  
jsgl.stroke.DotDashStyle.prototype.getDashArray = function() {

  return [0, 4];
}

/**
 * @methodOf jsgl.stroke.DotDashStyle
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement  
 * @since version 1.0
 */  
jsgl.stroke.DotDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "dot";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.DotDashStyle</code> class.
 * @methodOf jsgl.stroke.DotDashStyle 
 * @static
 * @since version 1.0
 */
jsgl.stroke.DotDashStyle.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.LongDashDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Dash pattern class providing pattern of long dashes.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of <code>jsgl.stroke.LongDashDashStyle</code>
 * class. Typically, calling this constructor is not necessary since there is
 * a singleton instance available via <code>jsgl.DashStyles.LONG_DASH</code>.
 * Also, the singleton instance may be obtained via the static
 * {@link jsgl.stroke.LongDashDashStyle.getInstance} method.
 * @since version 1.0
 */
jsgl.stroke.LongDashDashStyle = function() {

}
jsgl.stroke.LongDashDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.LongDashDashStyle#
 * @returns {array} [7,4]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray  
 * @since version 1.0
 */  
jsgl.stroke.LongDashDashStyle.prototype.getDashArray = function() {

  return [7,4];
}

/**
 * @methodOf jsgl.stroke.LongDashDashStyle#
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement   
 * @since version 1.0
 */  
jsgl.stroke.LongDashDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "longdash";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.LongDashDashStyle</code> class.
 * @methodOf jsgl.stroke.LongDashDashStyle 
 * @static
 * @since version 1.0
 */
jsgl.stroke.LongDashDashStyle.getInstance = jsgl.util.singletonInstanceGetter;;/**
 * @fileOvervire <code>jsgl.stroke.LongDashDotDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Dash pattern class providing pattern of alternating long dashes and
 * dots.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.stroke.LongDashDotDashStyle</code> class. Typically, calling this
 * constructor is not necessary since there is a singleton instance available
 * via <code>jsgl.DashStyles.LONG_DASH_DOT</code>. Also, the singleton instance
 * may be obtained via the static
 * {@link jsgl.stroke.LongDashDotDashStyle.getInstance} method. 
 * @since version 1.0
 */
jsgl.stroke.LongDashDotDashStyle = function() {

}
jsgl.stroke.LongDashDotDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.LongDashDotDashStyle#
 * @returns {array} [7,4,0,4]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray 
 * @since version 1.0
 */  
jsgl.stroke.LongDashDotDashStyle.prototype.getDashArray = function() {

  return [7,4,0,4];
}

/**
 * @methodOf jsgl.stroke.LongDashDotDashStyle#
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement  
 * @since version 1.0 
 */  
jsgl.stroke.LongDashDotDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "longdashdot";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.LongDashDotDashStyle</code> class.
 * @methodOf jsgl.stroke.LongDashDotDashStyle
 * @static
 * @since version 1.0
 */
jsgl.stroke.LongDashDotDashStyle.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.LongDashDotDotDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Dash pattern class providing pattern of alternating long dashes
 * followed by two dots.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of 
 * <code>jsgl.stroke.LongDashDotDotDashStyle</code> class. Typically, calling
 * this constructor is not necessary since there is a singleton instance available
 * via <code>jsgl.DashStyles.LONG_DASH_DOT_DOT</code>. Also, the singleton
 * instance may be obtained via the static
 * {@link jsgl.stroke.LongDashDotDotDashStyle.getInstance} method. 
 * @since version 1.0
 */ 
jsgl.stroke.LongDashDotDotDashStyle = function() {

}
jsgl.stroke.LongDashDotDotDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.LongDashDotDotDashStyle#
 * @returns {array} [7,4,0,4,0,4]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray 
 * @since version 1.0
 */  
jsgl.stroke.LongDashDotDotDashStyle.prototype.getDashArray = function() {

  return [7,4,0,4,0,4];
}

/**
 * @methodOf jsgl.stroke.LongDashDotDotDashStyle#
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement
 * @since version 1.0
 */
jsgl.stroke.LongDashDotDotDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "longdashdotdot";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.LongDashDotDotDashStyle</code> class.
 * @methodOf jsgl.stroke.LongDashDotDotDashStyle
 * @static
 * @since version 1.0
 */
jsgl.stroke.LongDashDotDotDashStyle.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.ShortDashDotDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Dash pattern class providing pattern of alternating short dashes and
 * dots. 
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of 
 * <code>jsgl.stroke.ShortDashDotDashStyle</code> class. Typically, calling
 * this constructor is not necessary since there is a singleton instance
 * available via <code>jsgl.DashStyles.SHORT_DASH_DOT</code>. Also, the
 * singleton instance may be obtained via the static
 * {@link jsgl.stroke.ShortDashDotDashStyle.getInstance} method. 
 * @since version 1.0
 */ 
jsgl.stroke.ShortDashDotDashStyle = function() {

}
jsgl.stroke.ShortDashDotDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.ShortDashDotDashStyle#
 * @returns {array} [2,2,0,2]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray 
 * @since version 1.0
 */
jsgl.stroke.ShortDashDotDashStyle.prototype.getDashArray = function() {

  return [2,2,0,2];
}

/**
 * @methodOf jsgl.stroke.ShortDashDotDashStyle#
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement
 * @since version 1.0
 */
jsgl.stroke.ShortDashDotDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement) {

  strokeElement.dashstyle = "shortdashdot";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.ShortDashDotDashStyle</code> class.
 * @methodOf jsgl.stroke.ShortDashDotDashStyle
 * @static
 * @since version 1.0
 */
jsgl.stroke.ShortDashDotDashStyle.getInstance = jsgl.util.singletonInstanceGetter;
;/**
 * @fileOverview <code>jsgl.stroke.SolidDashStyle</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Dash patterns class providing solid line with no gaps.
 * @extends jsgl.stroke.AbstractDashStyle
 * @constructor
 * @description Creates new instance of 
 * <code>jsgl.stroke.SolidDashStyle</code> class. Typically, calling this
 * constructor is not necessary since there is a singleton instance available
 * via <code>jsgl.DashStyles.SOLID</code>. Also, the singleton instance may be
 * obtained via the static {@link jsgl.stroke.SolidDashStyle.getInstance} method. 
 * @since version 1.0
 */ 
jsgl.stroke.SolidDashStyle = function() {

}
jsgl.stroke.SolidDashStyle.jsglExtend(
  jsgl.stroke.AbstractDashStyle);

/**
 * @methodOf jsgl.stroke.SolidDashStyle#
 * @returns {array} [Number.POSITIVE_INFINITY]
 * @see jsgl.stroke.AbstractDashStyle#getDashArray 
 * @since version 1.0
 */
jsgl.stroke.SolidDashStyle.prototype.getDashArray = function() {

  return [Number.POSITIVE_INFINITY];
}

/**
 * @description Overrides {@link jsgl.stroke.AbstractDashStyle#applyToSvgElement}
 * method in order to deal with disabled dash pattern (solid line only).
 * @methodOf jsgl.stroke.SolidDashStyle#
 * @param {SVGElement} svgElement The SVG element on which dash patterns for
 * outline painting will be disabled.
 * @since version 1.0
 */
jsgl.stroke.SolidDashStyle.prototype.applyToSvgElement = function(svgElement) {

  svgElement.style.setProperty("stroke-dasharray", "none", null);
}

/**
 * @methodOf jsgl.stroke.SolidDashStyle#
 * @see jsgl.stroke.AbstractDashStyle#applyToVmlStrokeElement
 * @since version 1.0
 */
jsgl.stroke.SolidDashStyle.prototype.applyToVmlStrokeElement = function(strokeElement)
{
  strokeElement.dashstyle = "solid";
}

/**
 * @description Gets a singleton instance of the
 * <code>jsgl.stroke.SolidDashStyle</code> class.
 * @methodOf jsgl.stroke.SolidDashStyle
 * @static
 * @since version 1.0
 */
jsgl.stroke.SolidDashStyle.getInstance = jsgl.util.singletonInstanceGetter;;/**
 * @fileOverview <code>jsgl.fill.AbstractFill</code> class declaration.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Base class for interior-styling objects for JSGL elements.
 * @constructor
 * @description Base constructor for any element-interior styling object.
 * @since version 1.0
 */    
jsgl.fill.AbstractFill = function() {

  /**
   * The MVC event raiser responsible for the propagation of changes made in
   * the fill object. The set of listeners always contains all the JSGL API
   * elements that use the fill object. Whenever informed about change in fill,
   * they inform their DOM presenters that repaint should take place.
   * @type jsgl.util.EventRaiser
   * @private   
   * @since version 1.0
   */                    
  this.onChangeRaiser = new jsgl.util.EventRaiser();
}

/**
 * @description Applies the fill properties to a SVG element. Typically, the CSS
 * <code>style</code> attributes are used to achieve that.
 * @methodOf jsgl.elements.AbstractFill#
 * @param {SVGElement} svgElement The SVG element to which the fill should be
 * applied.
 * @abstract
 * @private
 * @since version 1.0
 */
jsgl.fill.AbstractFill.prototype.applyToSvgElement = function(svgElement) {

  throw "not implemented";
}

/**
 * @description Applies the fill properties to a VML <code>&lt;fill&gt;</code>
 * element, which is typically a subelement of some VML shape-defining element.
 * The fill properties are typically applied by setting XML attribute values
 * of the element.  
 * @methodOf jsgl.elements.AbstractFill#
 * @param {VmlFillElement} The VML <code>&lt;fill&gt;</code> element to which
 * the fill should be applied.
 * @abstract
 * @private
 * @since version 1.0
 */   
jsgl.fill.AbstractFill.prototype.applyToVmlFillElement = function(fillElement) {

  throw "not implemented";
}

/**
 * @description Registers a function listening to changes in the properties
 * of the fill object. Typically, JSGL API elements are listening to the
 * changes, allowing MVC repainting to be done whenever the fill is changed.
 * @methodOf jsgl.elements.AbstractFill#
 * @param {function} listener The function that should start listening to
 * changes in the fill object.
 * @since version 1.0
 */   
jsgl.fill.AbstractFill.prototype.registerChangeListener = function(listener) {

  this.onChangeRaiser.registerListener(listener);
}

/**
 * @description Removes a fuction that is already listening to the changes of
 * the fill object from the pool os listeners. This is typically needed when
 * a fill object of some JSGL API element is replaced by another one, making
 * changes in the old one unimportant.
 * @methodOf jsgl.elements.AbstractFill#
 * @param {function} listener The already-listening function that should be
 * removed from the pool of listeners.
 * @since version 1.0
 */   
jsgl.fill.AbstractFill.prototype.unregisterChangeListener = function(listener) {

  this.onChangeRaiser.unregisterListener(listener);
};/**
 * @fileOverview Implementation of <code>jsgl.fill.DisabledFill</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class A trivial fill-styling API class that does nothing but disabling the
 * fill completely.
 * @extends jsgl.fill.AbstractFill 
 * @constructor
 * @description Creates new instance of the <code>jsgl.fill.DisabledFill</code>   
 * class. Typically, it is not needed since a singleton instance is always
 * accessible via <code>jsgl.fill.DISABLED</code>.
 * @since version 1.0
 */    
jsgl.fill.DisabledFill = function() {

  jsgl.fill.AbstractFill.call(this);
}
jsgl.fill.DisabledFill.jsglExtend(jsgl.fill.AbstractFill);

/**
 * A singleton instance of the <code>jsgl.fill.DisabledFill</code> class.
 * @type jsgl.fill.DisabledFill
 * @static
 */
jsgl.fill.DISABLED = new jsgl.fill.DisabledFill();

/**
 * @description Turns the fill off for the given SVG element.
 * @methodOf jsgl.fill.DisabledFill#
 * @param {SVGElement} svgElement The SVG element whose filling should be
 * disabled.
 * @since version 1.0
 */   
jsgl.fill.DisabledFill.prototype.applyToSvgElement = function(svgElement) {

  svgElement.style.setProperty("fill", "none", null);
}

/**
 * @description Turns the filling off for the given VML <code>fill</code>
 * subelement.
 * @methodOf jsgl.fill.DisabledFill#
 * @param {VmlFillElement} fillElement The VML <code>fill</code> element that
 * should be set as disabled.
 * @since version 1.0
 */   
jsgl.fill.DisabledFill.prototype.applyToVmlFillElement = function(fillElement) {

  fillElement.on = false;
};/**
 * @fileOverview Implementation of <code>jsgl.fill.SolidFill</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Simple fill-styling API class that allows the object's interior to be
 * filled with given color and opacity.
 * @extends jsgl.fill.AbstractFill
 * @constructor
 * @description Creates new instance of the <code>jsgl.fill.SolidFill</code> class.
 * @since version 1.0
 */ 
jsgl.fill.SolidFill = function(color, opacity, enabled) {

  jsgl.fill.AbstractFill.call(this);

  /**
   * The color of the fill in HTML format.
   * @type string
   * @private
   */           
  this.color = color || "white";
  
  /**
   * The opacity of the fill. It is a real number from interval [0,1].
   * @type number
   * @private
   */      
  this.opacity = typeof(opacity) != "undefined" ? opacity : 1;
  
  /**
   * Determines whether the filling is enabled. It it is disabled, it has the
   * same effect as if <code>jsgl.fill.DISABLED</code> object was used.
   * @type boolean
   * @private
   */         
  this.enabled = typeof(enabled) != "undefined" ? !!enabled : true;
}
jsgl.fill.SolidFill.jsglExtend(jsgl.fill.AbstractFill);

/**
 * @description Applies the fill properties to a SVG element. The properties
 * are applied via CSS <code>style</code> attribute.
 * @methodOf jsgl.fill.SolidFill#
 * @param {SVGElement} svgElement The SVG element to which the fill properties
 * should be applied.
 * @since version 1.0
 */   
jsgl.fill.SolidFill.prototype.applyToSvgElement = function(svgElement) {

  if(this.enabled) {

    svgElement.style.setProperty("fill", this.color, null);
    svgElement.style.setProperty("fill-opacity", this.opacity, null);
  }
  else {

    svgElement.style.setProperty("fill", "none", null);
  }
}

/**
 * @description Applies the fill properties to a VML <code>fill</code> subelement.
 * @methodOf jsgl.fill.SolidFill#
 * @param {VmlFillElement} fillElement The VML <code>fill</code> element to
 * which the sollid fill should be applied.
 * @since version 1.0
 */   
jsgl.fill.SolidFill.prototype.applyToVmlFillElement=function(fillElement) {

  if(this.enabled) {
    fillElement.type = "solid";
    fillElement.color = this.color;
    fillElement.opacity = this.opacity;
    fillElement.on = true;
  }
  else {

    fillElement.on = false;
  }
}

/**
 * @description Gets the current color used for filling.
 * @methodOf jsgl.fill.SolidFill#
 * @returns {string}
 * @since version 1.0
 */    
jsgl.fill.SolidFill.prototype.getColor = function() {

  return this.color;
}

/**
 * @description Sets the new color to be used for filling.
 * @methodOf jsgl.fill.SolidFill#
 * @param {string} The new color in HTML format to be used.
 * @since version 1.0
 */  
jsgl.fill.SolidFill.prototype.setColor = function(newColor) {

  this.color = newColor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether the fill object is currently enabled or not.
 * @methodOf jsgl.fill.SolidFill#
 * @returns {boolean}
 * @since version 1.0
 */ 
jsgl.fill.SolidFill.prototype.getEnabled = function() {

  return this.enabled;
}

jsgl.fill.SolidFill.prototype.isEnabled = jsgl.fill.SolidFill.prototype.getEnabled;

/**
 * @description Sets whether or not to disable the fill. It the fill is
 * disabled, the result is the same as if the <code>jsgl.fill.DISABLED</code>
 * object was used, i.e. no fill will be painted.
 * @methodOf jsgl.fill.SolidFill#
 * @param {boolean} enabled If <code>true</code>, the fill will be enabled, if
 * <code>false</code>, the fill will be disabled.
 * @since version 1.0
 */  
jsgl.fill.SolidFill.prototype.setEnabled = function(enabled) {

  this.enabled = enabled;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current opacity of the fill object.
 * @methodOf jsgl.fill.SolidFill#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.fill.SolidFill.prototype.getOpacity = function() {

  return this.opacity;
}

/**
 * @descrption Sets the new opacity of the solid fill.
 * @methodOf jsgl.fill.SolidFill#
 * @param {number} newOpacity A real number from interval
 * [0,1], where 0.0 means fully transparent, 1.0 means fully opaque.
 * @since version 1.0
 */  
jsgl.fill.SolidFill.prototype.setOpacity = function(newOpacity) {

  this.opacity = newOpacity;
  this.onChangeRaiser.raiseEvent();
}
;/** 
 * @fileOverview Declaration and implementation of <code>AbstractElement</code> class.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class AbstractElement API class.
 * @constructor
 * @description Base constructor for any JSGL element.
 * @since version 1.0
 * @panel The factory <code>jsgl.Panel</code> that is creating the element.
 * @version 2.0 
 */    
jsgl.elements.AbstractElement = function(panel) {

  /**
   * The <code>jsgl.Panel</code> object that created the element.
   * @type jsgl.Panel
   * @private
   * @since 2.0
   */
  this.panel = panel;

  /**
   * The current container (either <code>jsgl.Panel</code> or
   * <code>jsgl.elements.GroupElement</code>) that currently hold the elements.
   * @type object
   * @private
   * @since version 2.0
   */            
  this.container = null;

  /**
   * The age of the element in the container. This is used for resolving
   * conflicts of with the same z-index.
   * @type number
   * @private
   * @since version 2.0
   */
  this.age = 0;

  /**
   * The current Z-index of the element. It affects z-ordering of the elements,
   * i.e. the order in which elements are drawn.
   * @type number      
   * @private
   */      
  this.zIndex = 0;
  
  /**
   * The MVC event raiser responsible for propagation of changes in z-index.
   * It is important because SVG does not support z-indices and hence changes
   * in z-index require re-ordering of elements in the DOM tree whenever
   * z-index changes.
   * @type jsgl.util.EventRaiser
   * @private
   */                   
  this.zIndexChangeRaiser = new jsgl.util.EventRaiser();
  
  this.cursor = jsgl.Cursor.INHERIT;
  
  /**
   * The unique ID of the element.
   * @type number
   * @const
   * @private
   */
  this.uid = jsgl.elements.AbstractElement.uidCounter ++;              
  
  /**
   * The MVC event raiser responsible for propagation of changes made in the
   * elements. Most notably, whenever some property of the element changes by
   * a setter method, the event raiser should raise an event. One of the event
   * listeners is always the element's DOM presenter, which renders the element
   * on the user's browser. Hence whenever some property changes, through the
   * <code>onChangeRaiser</code>, repaint process is invoked.
   * @type jsgl.util.EventRaiser
   * @private
   */      
  this.onChangeRaiser=new jsgl.util.EventRaiser();

  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addMouseMoveListener()</code> method about mouse-move events on the
   * element.
   * @type jsgl.util.EventRaiser
   * @private
   */      
  this.mouseMoveRaiser = new jsgl.util.EventRaiser();
  
  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addMouseDownListener</code> method about mouse-down events on the
   * element.
   * @type jsgl.util.EventRaiser
   * @private
   */            
  this.mouseDownRaiser = new jsgl.util.EventRaiser();
  
  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addMouseUpListener</code> method about mouse-up events on the element.
   * @type jsgl.util.EventRaiser
   * @private
   */            
  this.mouseUpRaiser = new jsgl.util.EventRaiser();
  
  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addMouseOverListener</code> method about mouse-enter events on the
   * element.
   * @type jsgl.util.EventRaiser
   * @private
   */
  this.mouseOverRaiser = new jsgl.util.EventRaiser();
  
  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addMouseOutListener</code> method about mouse-leave events on the
   * element.
   * @type jsgl.util.EventRaiser
   * @private
   */            
  this.mouseOutRaiser = new jsgl.util.EventRaiser();
  
  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addClickListener</code> method about mouse-click events on the
   * element.
   * @type jsgl.util.EventRaiser
   * @private
   */            
  this.clickRaiser = new jsgl.util.EventRaiser();
  
  /**
   * MVC event raiser that informs the listeners registered via the
   * <code>addDoubleClickListener</code> method about mouse double-click events
   * on the element.
   * @type jsgl.util.EventRaiser
   * @private
   */            
  this.dblClickRaiser = new jsgl.util.EventRaiser();
}

/**
 * Unique ID counter for JSGL elements.
 * @type number
 * @static
 * @since version 2.0 
 */   
jsgl.elements.AbstractElement.uidCounter = 0;

/**
 * @description Gets the unique id of the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @returns {number} The unique identifier.
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.getUid = function() {

  return this.uid;
}

/**
 * @description Gets the <code>jsgl.Panel</code> object that created the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @returns {jsgl.Panel}
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.getPanel = function() {

  return this.panel;
}

/**
 * @description Gets the DOM presenter that is used for rendering the element
 * of the user's browser.
 * @methodOf jsgl.elements.AbstractElement#
 * @returns {jsgl.elements.AbstractDomPresenter}
 * @since version 1.0
 * @version 2.0 
 */
jsgl.elements.AbstractElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Sets the container of the element. This is called either by
 * <code>jsgl.Panel</code> object or by <code>jsgl.elements.GroupElement</code>
 * object.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {object} container The panel or the group which newly holds the element.
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.setContainer = function(container) {

  this.container = container;
}

/**
 * @description Gets the container of the element. May return either
 * <code>jsgl.elements.GroupElement</code> or <code>jsgl.Panel</code> object.
 * @methodOf jsgl.elements.AbstractElement#
 * @returns object
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.getContainer = function() {

  return this.container;
}

/**
 * @description Gets the current of the element in scope of its container. This
 * is used for resolving conflict between elements with the same z-index. 
 * @methodOf jsgl.elements.AbstractElement#
 * @returns {number} The current age of the element.
 * @private
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.getAge = function() {

  return this.age;
} 

/**
 * @description Sets the new age of the element within a container. The container
 * should call this whenever the element is added into it, increasing an internal
 * age counter. Using the age information, container may resolve conflicts
 * between elements with the same z-index.
 * @methodOf jsgl.elements.AbstractElement#    
 * @param {number} newAge The new age of the element within the container.
 * @private
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.setAge = function(newAge) {

  this.age = newAge;
} 

/**
 * @description Adds a listener function for handling mouse move events on the
 * element. 
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */ 
jsgl.elements.AbstractElement.prototype.addMouseMoveListener=function(listener) {

  this.mouseMoveRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse move event
 * listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse move events on the element anymore.
 * @since version 2.0
 */  
jsgl.elements.AbstractElement.prototype.removeMouseMoveListener=function(listener) {

  this.mouseMoveRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse move event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.MouseEvent} eventArgs The mouse move event arguments object.  
 * @private
 * @since version 2.0
 */ 
jsgl.elements.AbstractElement.prototype.raiseMouseMove = function(eventArgs) {

  this.mouseMoveRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling mouse down events on the
 * element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */       
jsgl.elements.AbstractElement.prototype.addMouseDownListener=function(listener) {

  this.mouseDownRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse down event
 * listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse down events on the element anymore.
 * @since version 2.0
 */  
jsgl.elements.AbstractElement.prototype.removeMouseDownListener=function(listener) {

  this.mouseDownRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse down event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.MouseEvent} eventArgs The mouse down event arguments object.
 * @private
 * @since version 2.0
 */    
jsgl.elements.AbstractElement.prototype.raiseMouseDown = function(eventArgs) {

  this.mouseDownRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling mouse up events on the
 * element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */       
jsgl.elements.AbstractElement.prototype.addMouseUpListener=function(listener) {

  this.mouseUpRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse up event
 * listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse up events on the element anymore.
 * @since version 2.0
 */      
jsgl.elements.AbstractElement.prototype.removeMouseUpListener=function(listener) {

  this.mouseUpRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse up event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.MouseEvent} eventArgs The mouse up event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.raiseMouseUp = function(eventArgs) {

  this.mouseUpRaiser.raiseEvent(eventArgs);
}     

/**
 * @description Adds a listener function for handling mouse over events on the
 * element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.addMouseOverListener=function(listener) {

  this.mouseOverRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse over event
 * listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse over events on the element anymore.
 * @since version 2.0
 */      
jsgl.elements.AbstractElement.prototype.removeMouseOverListener=function(listener) {

  this.mouseOverRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse over event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.MouseEvent} eventArgs The mouse over event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.raiseMouseOver = function(eventArgs) {

  this.mouseOverRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling mouse out events on the
 * element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */  
jsgl.elements.AbstractElement.prototype.addMouseOutListener=function(listener) {

  this.mouseOutRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse out event
 * listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse out events on the element anymore.
 * @since version 2.0
 */      
jsgl.elements.AbstractElement.prototype.removeMouseOutListener=function(listener) {

  this.mouseOutRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse out event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.MouseEvent} eventArgs The mouse out event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.raiseMouseOut = function(eventArgs) {

  this.mouseOutRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling click events on the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */  
jsgl.elements.AbstractElement.prototype.addClickListener=function(listener) {

  this.clickRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of click event listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to click events on the element anymore.
 * @since version 2.0
 */     
jsgl.elements.AbstractElement.prototype.removeClickListener=function(listener) {

  this.clickRaiser.unregisterListener(listener);
}

/**
 * @description Raises the click event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.MouseEvent} eventArgs The click event arguments object.  
 * @private
 * @since version 2.0 
 */ 
jsgl.elements.AbstractElement.prototype.raiseClick = function(eventArgs) {

  this.clickRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling double click events on the
 * element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */ 
jsgl.elements.AbstractElement.prototype.addDoubleClickListener=function(listener) {

  this.dblClickRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of double click event
 * listeners.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {function(eventArgs)} listener The listeer function that should not
 * listen to double click events on the element anymore.
 * @since version 2.0
 */   
jsgl.elements.AbstractElement.prototype.removeDoubleClickListener=function(listener) {

  this.dblClickRaiser.unregisterListener(listener);
}

/**
 * @description Raises the double click event.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.util.MouseEvet} eventArgs The click event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.elements.AbstractElement.prototype.raiseDoubleClick = function(eventArgs) {

  this.dblClickRaiser.raiseEvent(eventArgs);
}


jsgl.elements.AbstractElement.prototype.addChangeListener=function(listener) {

  this.onChangeRaiser.registerListener(listener);
}

jsgl.elements.AbstractElement.prototype.removeChangeListener=function(listener) {

  this.onChangeRaiser.unregisterListener(listener);
}

/**
 * @description Sets the new Z-axis index of the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param zIndex The new z-index.
 * @since version 1.0
 */    
jsgl.elements.AbstractElement.prototype.setZIndex = function(zIndex) {

  this.zIndex = Number(zIndex);
  this.zIndexChangeRaiser.raiseEvent();
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the curent Z-axis index of the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.AbstractElement.prototype.getZIndex = function() {

  return this.zIndex;

}

/**
 * @description Sets the new mouse cursor for the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @param {jsgl.Cursor} cursor The new cursor.
 * @since version 2.0  
 */ 
jsgl.elements.AbstractElement.prototype.setCursor = function(cursor) {

  this.cursor = cursor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current mouse cursor of the element.
 * @methodOf jsgl.elements.AbstractElement#
 * @returns {jsgl.Cursor} The current cursor used by the element.
 * @since version 2.0
 */   
jsgl.elements.AbstractElement.prototype.getCursor = function() {

  return this.cursor;
}

jsgl.elements.AbstractElement.prototype.addZIndexChangeListener = function(listener) {

  this.zIndexChangeRaiser.registerListener(listener);
}

jsgl.elements.AbstractElement.prototype.removeZIndexChangeListener = function(listener) {

  this.zIndexChangeRaiser.unregisterListener(listener);
};/**
 * @fileOverview Declaration and implementation of <code>jsgl.elements.AbstractDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 1.0 
 */   

/**
 * @class AbstractDomPresenter class.
 * @constructor
 * @description Base constructor for any DOM presenter.
 * @since version 1.0
 * @version 2.0 
 */     
jsgl.elements.AbstractDomPresenter=function() {

  /**
   * The JSGL API element to be rendered by the presenter.
   * @type jsgl.elements.AbstractElement
   * @private
   * @since version 2.0         
   */  
  this.graphicsElement = null;

  this.refreshTimer = null;
}

/**
 * @description Returns the associated JSGL element.
 * @methodOf jsgl.elements.AbstractDomPresenter#
 * @returns {jsgl.elements.AbstractElement} 
 * @since version 1.0
 */   
jsgl.elements.AbstractDomPresenter.prototype.getGraphicsElement=function() {

  return this.graphicsElement;
}

/**
 * @description Sets the JSGL API element to be rendered by the presenter.
 * @methodOf jsgl.elements.AbstractDomPresenter#
 * @param {jsgl.elements.AbstractElement} element The JSGL API element to be
 * rendered.   
 * @since version 2.0
 */
jsgl.elements.AbstractDomPresenter.prototype.setGraphicsElement=function(element) {

  this.graphicsElement = element;
  this.getXmlElement().jsglElement = element;
  this.graphicsElement.addChangeListener(jsgl.util.delegate(this,this.invalidate));
}

/**
 * @description Returns the root XML element that is used for rendering.
 * @methodOf jsgl.elements.AbstractDomPresenter#
 * @returns HTMLElement 
 * @since version 1.0 
 */ 
jsgl.elements.AbstractDomPresenter.prototype.getXmlElement=function() {

  throw "getXmlElement(): not implemented";
}

/**
 * @description Updates the contents of rendering XML accoring to state of the
 * JSGL object associated.
 * @private 
 * @methodOf jsgl.elements.AbstractDomPresenter#
 * @since version 1.0
 * @version 2.0    
 */ 
jsgl.elements.AbstractDomPresenter.prototype.update=function() {

  this.getXmlElement().style.zIndex=this.getGraphicsElement().getZIndex();
  this.getXmlElement().style.cursor = this.getGraphicsElement().getCursor().asCSS;
}

/**
 * @description Marks the current contents of the DOM presenter as outdated.
 * In accordance with the rendering policy (<code>jsgl.IMMEDIATE_UPDATE</code>)
 * the element is refreshed either immediately or just after the envoking
 * subroutine finishes.
 * @public 
 * @methodOf jsgl.elements.AbstractDomPresenter#
 * @since version 1.0
 */  
jsgl.elements.AbstractDomPresenter.prototype.invalidate=function() {

  if(!jsgl.IMMEDIATE_UPDATE == true) {
  
    if(this.refreshTimer != null) {
    
      window.clearTimeout(this.refreshTimer);
    }
    this.refreshTimer = window.setTimeout(jsgl.util.delegate(this,this.update),0);
  }
  else {
    this.update();
  }
}


/**
 * @private
 */ 
jsgl.elements.AbstractDomPresenter.prototype.attachMouseHandlers = function(element) {

  element.onclick = jsgl.util.delegate(this, function(e) {

      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseClick(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.CLICK));
    });
  
  element.ondblclick = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseDoubleClick(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.DOUBLE_CLICK));
    });
  
  element.onmousedown = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseMouseDown(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.DOWN));
    });
  
  element.onmouseup = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseMouseUp(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.UP));
    });
  
  element.onmousemove = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseMouseMove(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.MOVE));
    });
  
  element.onmouseover = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseMouseOver(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.OVER));
    });
  
  element.onmouseout = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.graphicsElement.raiseMouseOut(
        jsgl.MouseEvent.fromJsglElement(e, this.graphicsElement, jsgl.MouseEvent.OUT));
    });
};/**
 * @fileOverview <code>jsgl.elements.DomSorter</code> class implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Maintains ordering of elements within given DOM node according to their
 * z-indices and age. This allows to emulate CSS z-index which is not included
 * into SVG standard and is also not supported by the browser. Hence the only
 * way how to implement z-index is to maintain ordering of SVG nodes.
 * @constructor
 * @description Creates new DOM sorter for given parent DOM node.
 * @param {Element} domRoot The DOM element that will serve as a container for
 * JSGL elements' DOM presenters' XML elements.
 * @since version 2.0
 */  
jsgl.elements.DomSorter = function(domRoot) {

  this.domRoot = domRoot;
  
  /**
   * Maps unique ids of elements to integer positions in the child nodes array.
   * @type array
   * @private
   */
  this.idToPosition = {};
  
  /**
   * Maps integer positions from the child nodes array to elements.
   * @type array
   * @private
   */
  this.posToElement = {};
  
  /**
   * Maps uniques ids of elements to corresponding z-index change listeners.
   * @type array
   * @private
   */
  this.idToZICL = {};         
  
  /**
   * Number of elements in the DOM tree.
   * @type number
   * @private
   */         
  this.numElements = 0;
  
  /**
   * Age counter that allows unique age to be assigned to each element added,
   * resolving conflicts between elements of the same z-index.
   * @type number
   * @private
   */                 
  this.ageCounter = 0;
}

/**
 * @description Adds the element to the DOM presenter. This method should only
 * be called if the DOM presenter does not contain the element yet. 
 * @methodOf jsgl.elements.DomSorter#
 * @param {jsgl.elements.AbstractElement} element The element to be added.
 * @since version 2.0 
 */ 
jsgl.elements.DomSorter.prototype.add = function(element) {
  
  element.setAge(this.ageCounter++);
  
  this.domRoot.appendChild(element.getDomPresenter().getXmlElement());

  this.idToPosition[element.getUid()] = this.numElements;
  this.posToElement[this.numElements] = element;

  this.numElements ++;
    
  var zicl = jsgl.util.delegate(this, function() { this.update(element) });
  
  element.addZIndexChangeListener(zicl);
  this.idToZICL[element.getUid()] = zicl;
  
  this.update(element);
}

/**
 * @description Removes the element from the DOM presenter. 
 * @methodOf jsgl.elements.DomSorted#
 * @param {jsgl.elements.AbstractElement} element The element to be removed.
 * @since version 2.0
 */
jsgl.elements.DomSorter.prototype.remove = function(element) {
  
  var uid = element.getUid();

  element.setAge(-1);
  
  var position = this.idToPosition[uid];
  
  for(var i=position; i<this.numElements-1; i++) {
  
    this.posToElement[i] = this.posToElement[i+1];
    this.idToPosition[this.posToElement[i+1].getUid()] --;
  }
  
  this.idToPosition[uid] = null;
  this.posToElement[this.numElements-1] = null;
  
  element.removeZIndexChangeListener(this.idToZICL[uid]);
  this.idToZICL[uid] = null;

  this.domRoot.removeChild(element.getDomPresenter().getXmlElement());

  this.numElements --;
}  

/**
 * @description Updates the position of the element's DOM presenter's element
 * in the DOM tree after its z-index changes.
 * @methodOf jsgl.elements.DomSorter#
 * @param {jsgl.elements.AbstractElement} element The element whose XML node
 * position should be updated.
 * @since version 2.0
 */   
jsgl.elements.DomSorter.prototype.update = function(element) {

  /* Do not do updates on VML -- not only that they are not neccessary, but
     they are also harmful for rendering! */
  if(!jsgl.util.BrowserInfo.supportsSvg) {

    return;
  }

  // current position of the element in the DOM tree
  var currPos = this.idToPosition[element.getUid()];
  
  // new position of the element in the DOM tree (to be determined)
  var newPos = currPos;

  /* determine the new position in DOM (currently, by means of brute force --
     could be much improved) */    
  var changed;

  do {  

    changed = false;
    
    if(newPos != this.numElements-1 &&
        this.lessThan(this.posToElement[newPos+1], element)) {
      
      newPos ++;
      changed = true;
    }
    
    if(newPos != 0 && this.lessThan(element, this.posToElement[newPos-1])) {

      newPos --;
      changed = true;
    }
  }
  while(changed);
  
  // if the position hasn't changed, return
  if(currPos == newPos) {

    return;
  }

  this.domRoot.removeChild(element.getDomPresenter().getXmlElement());
  
  if(newPos < currPos) {
  
    for(var i=currPos; i>newPos; i--) {
    
      this.idToPosition[this.posToElement[i-1].getUid()] ++;
      this.posToElement[i] = this.posToElement[i-1];
    }
    
    this.domRoot.insertBefore(
      element.getDomPresenter().getXmlElement(),
      this.domRoot.childNodes.item(newPos));
  }
  else {
  
    for(var i=currPos; i<newPos; i++) {
    
      this.idToPosition[this.posToElement[i+1].getUid()] --;
      this.posToElement[i] = this.posToElement[i+1];
    }
    
    if(newPos != this.numElements - 1) {
    
      this.domRoot.insertBefore(
        element.getDomPresenter().getXmlElement(),
        this.domRoot.childNodes.item(newPos));
    }
    else {
    
      this.domRoot.appendChild(element.getDomPresenter().getXmlElement());
    }
  }

  this.idToPosition[element.getUid()] = newPos;
  this.posToElement[newPos] = element;

}

/**
 * @description Helper method for comparison of two elements according to their
 * z-index and age.
 * @methodOf jsgl.elements.DomSorter#
 * @param {boolean}
 * @since version 2.0
 */
jsgl.elements.DomSorter.prototype.lessThan = function(elementA, elementB) {

  if(elementA.getZIndex() == elementB.getZIndex()) {
  
    return elementA.getAge() < elementB.getAge();
  }
  
  return elementA.getZIndex() < elementB.getZIndex();
};/**
 * @fileOverview Declaration and implementation of JSGL API
 * <code>jsgl.elements.GroupElement</code>. 
 * @author Tomas Rehorek
 * @since version 1.0  
 * @version 2.0
 */ 

/**
 * @class Container class for grouping elements. Uses composite design pattern.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.GroupElement</code>.
 * @param {jsgl.elements.AbstractGroupDomPresenter} domPresenter Appropriate
 * DOM presenter of the group for the user's browser.
 * @param {jsgl.Panel} panel The factor <code>jsgl.Panel</code> object that
 * creates the group element.
 * @since version 1.0
 * @version 2.0
 */    
jsgl.elements.GroupElement=function(domPresenter,panel,x,y,zIndex) {

  jsgl.elements.AbstractElement.call(this,panel,zIndex);
  
  /**
   * Translation of inner coordspace of the group within the coordspace of
   * a parent container.
   * @type jsgl.Vector2D
   * @private
   */              
  this.location = new jsgl.Vector2D(x,y);
  
  /**
   * The list of the elements in the group.
   * @type jsgl.util.ArrayList
   * @private
   */           
  this.elements = new jsgl.util.ArrayList();
  
  /**
   * The DOM presenter that is used for rendering the group (wrapping its elements)
   * on the user's browser.
   * @type jsgl.elements.AbstractGroupDomPresenter
   * @private         
   */     
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
  
  
  /**
   * The DOM sorter that ensures appropriate sorting of elements in DOM
   * according to their z-index (SVG does not support CSS z-index!) and age.
   * @type jsgl.elements.DomSorter
   * @private
   */
  this.domSorter = new jsgl.elements.DomSorter(this.domPresenter.getXmlElement());             
}
jsgl.elements.GroupElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the group.
 * @methodOf jsgl.elements.GroupElement#
 * @returns {jsgl.elements.AbstractGroupDomPresenter}
 * @since version 1.0 
 */  

jsgl.elements.GroupElement.prototype.getDomPresenter=function() {

  return this.domPresenter;
}

/**
 * @description Adds an elements to the group. The element is appended at the
 * end of the list of group's elements. 
 * @methodOf jsgl.elements.GroupElement#
 * @param {jsgl.elements.AbstractElement} element The element to be added.
 * @since version 1.0
 * @version 2.0 
 */  
jsgl.elements.GroupElement.prototype.addElement = function(element) {

  // If the element is already contained within the group, terminate.
  if(this.elements.contains(element)) {
  
    return false;
  }

  this.elements.add(element);
  
  /*
  var newIndex=this.elements.getCount(),
      zIndex=element.getZIndex();

  while((newIndex>0) && this.elements.get(newIndex-1).getZIndex() > zIndex) {

    newIndex--;
  }

  this.domPresenter.getXmlElement().appendChild(
    element.getDomPresenter().getXmlElement());
  */
  
  this.domSorter.add(element);

  
  element.setContainer(this);
  element.getDomPresenter().update();
}

/**
 * @description Gets an element from the list of elements contained within the
 * group at given index.
 * @methodOf jsgl.elements.GroupElement#
 * @param {number} index Index of the element to be retrieved.
 * @since version 1.0
 */  
jsgl.elements.GroupElement.prototype.getElementAt = function(index) {

  return this.elements.get(index);
}

/**
 * @description Gets the number of elements that are currently contained within
 * the group.
 * @methodOf jsgl.elements.GroupElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.GroupElement.prototype.getElementsCount = function() {

  return this.elements.getCount();
}

/**
 * @description Tests whether the given element is currently contained within
 * the group.
 * @methodOf jsgl.elements.GroupElement#
 * @param {jsgl.elements.AbstractElement} element The element to be tested
 * for presence.
 * @since version 1.0
 */     
jsgl.elements.GroupElement.prototype.containsElement = function(element) {

  return this.elements.contains(element);
}

/**
 * @description Removes the given element from the group.
 * @methodOf jsgl.elements.GroupElement#
 * @param {jsgl.elements.AbstractElement} element The element to be removed.
 * @since version 1.0
 */    
jsgl.elements.GroupElement.prototype.removeElement=function(element) {

  if(!this.elements.contains(element)) {

     return false;
  }
  
  this.elements.remove(element);
  
  /*this.domPresenter.getXmlElement().removeChild(
    element.getDomPresenter().getXmlElement());*/
  
  this.domSorter.remove(element);
    
  element.setContainer(null);
}

/**
 * @deprecated
 * @description Removes all the elements from the group.
 * @methodOf jsgl.elements.GroupElement
 * @since version 1.0
 * @version 2.0
 */     
jsgl.elements.GroupElement.prototype.removeAllElements=function() {  
  this.clear();
}

/**
 * @description Removes all the elements from the group.
 * @methodOf jsgl.elements.GroupElement#
 * @since version 2.0
 * @version 2.0
 */
jsgl.elements.GroupElement.prototype.clear = function() {
  var element;
  
  for(var i=this.elements.getCount()-1; i>=0; i--) {

    element=this.elements.get(i);
    
    /*this.domPresenter.getXmlElement().removeChild(
      element.getDomPresenter().getXmlElement());*/
    
    this.domSorter.remove(element);
      
    element.setContainer(null);
  }
  
  this.elements.clear();
}    

/**
 * @description Gets the current X-coordinate of the translation of inner
 * coordspace of the group within the coordspace of a parent container.
 * @methodOf jsgl.elements.GroupElement#
 * @returns {number} The current X-coordinate of the translation in pixels.
 * @since version 2.0
 */
jsgl.elements.GroupElement.prototype.getX = function() {

  return this.location.X;
}

/**
 * @description Sets the new X-axis translation of the group's inner
 * coordspace within the coordspace of a parent container.
 * @methodOf jsgl.elements.GroupElement#
 * @param {number} newX Real number representing the new X-coordinate of group's
 * inner (0,0) point within the coordspace of the parent container. Measured in
 * pixels.
 * @since version 2.0
 */
jsgl.elements.GroupElement.prototype.setX = function(newX) {

  this.location.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current X-axis translation of the group's inner
 * coordspace within the coordspace of a parent container.
 * @methodOf jsgl.elements.GroupElement#
 * @returns {number} The current Y-coordinate of the translation in pixels.
 * @since version 2.0
 */
jsgl.elements.GroupElement.prototype.getY = function() {

  return this.location.Y;
}

/**
 * @description Sets the new Y-axis translation of the group's inner
 * coordspace within the coordspace of a parent container.
 * @methodOf jsgl.elements.GroupElement#
 * @param {number} newY Real number representing the new Y-coordinate of group's
 * inner (0,0) point within the coordspace of the parent container. Measured in
 * pixels.
 * @since version 2.0
 */
jsgl.elements.GroupElement.prototype.setY = function(newY) {

  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the translation of the inner coordspace of the group within the
 * coordspace of a parent container. The translation is given as a
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.GroupElement#
 * @param {jsgl.Vector2D} location The new location of group's inner (0,0) point
 * within the coordspace of the parent container.
 * @since version 1.0
 */  
jsgl.elements.GroupElement.prototype.setLocation = function(location) {

  this.setLocationXY(location.X, location.Y);
}

/**
 * @description Sets the translation of the inner coordspace of the group within the
 * coordspace of a parent container. The translation is given as couple of
 * coordinates.
 * @methodOf jsgl.elements.GroupElement#
 * @param {number} x Real number representing the X-coordinate of group's inner
 * (0,0) point within the coordspace of the parent container.
 * @param {number} y Real number representing the Y-coordinate of group's inner
 * (0,0) point within the coordsoace of the parent container.
 * @since version 1.0
 */  
jsgl.elements.GroupElement.prototype.setLocationXY = function(x,y) {

  this.location = new jsgl.Vector2D(x,y);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current translation of the inner coordpace of the group within the
 * coordspace of a parent container.
 * @methodOf jsgl.elements.GroupElement#
 * @returns jsgl.Vector2D
 * @since version 1.0
 */     
jsgl.elements.GroupElement.prototype.getLocation = function() {

  return jsgl.cloneObject(this.location);
}
;/**
 * @fileOverview Implementation of <code>jsgl.elements.SvgGroupDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Purely SVG-based DOM presenter for JSGL group element.
 * @private 
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.SvgGroupDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating SVG elements.
 * @since version 2.0 
 */
jsgl.elements.SvgGroupDomPresenter = function(ownerDocument) {
  
  /**
   * The SVG <code>&lt;g&gt;</code> element for grouping other elements.
   * @type SVGGElement
   * @private
   */      
  this.svgGroupElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");

  this.attachMouseHandlers(this.svgGroupElement);
}
jsgl.elements.SvgGroupDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;g&gt;</code> element that is used for
 * grouping the subelements in DOM tree.
 * @methodOf jsgl.elements.SvgGroupDomPresenter#
 * @returns {SVGGElement}
 * @since version 2.0
 */  
jsgl.elements.SvgGroupDomPresenter.prototype.getXmlElement = function() {

  return this.svgGroupElement;
}

/**
 * @description Updates the contents of rendering SVG accoring to the state
 * of the API group element associated.
 * @methodOf jsgl.elements.SvgGroupDomPresenter#
 * @since version 2.0
 */   
jsgl.elements.SvgGroupDomPresenter.prototype.update = function() {
  
  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);  
  
  var location = this.graphicsElement.getLocation();
  this.svgGroupElement.setAttribute("transform","translate("+location.X+","+location.Y+")");
};/**
 * @fileOverview Implementation of <code>jsgl.elements.NonSvgGroupDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 2.0
 */   

/**
 * @class HTML DIV-based DOM presenter for JSGL group element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.NonSvgGroupDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating DOM elements.
 * @since version 2.0 
 */
jsgl.elements.NonSvgGroupDomPresenter=function(ownerDocument) {

  /**
   * The HTML <code>&lt;div&gt;</code> element to be used for grouping
   * subelements. It is absolutely-positioned and zero-sized but overflowing.
   * @type HTMLDivElement
   * @private         
   */     
  this.divElement=ownerDocument.createElement("div");
  this.divElement.style.position = "absolute";
  this.divElement.style.width=this.divElement.style.height="0px";
  this.divElement.style.overflow="visible";

  this.attachMouseHandlers(this.divElement);
}
jsgl.elements.NonSvgGroupDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the <code>&lt;div&gt;</code> element that is used for embedding
 * subelements.
 * @methodOf jsgl.elements.NonSvgGroupDomPresenter
 * @returns HTMLDivElement
 * @since version 2.0
 */     
jsgl.elements.NonSvgGroupDomPresenter.prototype.getXmlElement=function() {

  return this.divElement;
}

/**
 * @description Updates attributes of the holder <code>&lt;div&gt;</code>
 * element according to group's size and z-index.
 * @methodOf jsgl.elements.NonSvgGroupDomPresenter
 * @private
 * @since version 2.0   
 */
jsgl.elements.NonSvgGroupDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  for(var i=0; i<this.graphicsElement.getElementsCount(); i++) {

    this.graphicsElement.getElementAt(i).getDomPresenter().update();
  }

  var location=this.graphicsElement.getLocation();
  this.divElement.style.left=location.X+"px";
  this.divElement.style.top=location.Y+"px";
};/**
 * @fileOverview Declaration and implementation of
 * <code>jsgl.elements.CurveElement</code>.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Curve element API class. Allows drawing cubic bezier curves.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new <code>jsgl.elements.CurveElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter Appriate
 * curve-rendering DOM presenter for the user's browser.
 * @param {jsgl.Panel} panel The factory <code>jsgl.Panel</code> object that
 * creates the curve.
 * @since version 2.0
 */
jsgl.elements.CurveElement = function(domPresenter, panel) {

  jsgl.elements.AbstractElement.call(this, panel);
  
  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */      
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);
  
  /**
   * The function listening to changes in the associated fill object.
   * @type function
   * @private
   */           
  this.fillChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);
  
  /**
   * Starting point of the cubic bezier curve.
   * @type jsgl.Vector2D
   * @private
   */
  this.startPoint = new jsgl.Vector2D();
  
  /**
   * First control point of the cubic bezier curve.
   * @type jsgl.Vector2D
   * @private
   */
  this.control1Point = new jsgl.Vector2D();
  
  /**
   * Second control point of the cubic bezier curve.
   * @type jsgl.Vector2D
   * @private
   */
  this.control2Point = new jsgl.Vector2D();
  
  /**
   * Ending point of the cubic bezier curve.
   * @type jsgl.Vector2D
   * @private
   */
  this.endPoint = new jsgl.Vector2D();
  
  /**
   * Stroke object specifying style of curve's outline.
   * @type jsgl.stroke.AbstractStroke
   * @private
   */           
  this.stroke = null;
  this.setStroke(new jsgl.stroke.SolidStroke());

  /**
   * Fill object specifying style of curve's interior. By default, it is
   * disabled.
   * @type jsgl.fill.AbstractFill
   * @private
   */
  this.fill = null;
  this.setFill(new jsgl.fill.SolidFill());
  this.fill.setEnabled(false);
  
  /**
   * The DOM presenter to be used for rendering the curve on the user's browser.
   * @type jsgl.elements.AbstractDomPresenter
   * @private
   */           
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.CurveElement.jsglExtend(
  jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.elements.AbstractDomPresenter}
 * @private 
 * @since version 2.0 
 */
jsgl.elements.CurveElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Gets the current X-coordinate of the starting point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getStartX = function() {

  return this.startPoint.X;
}

/**
 * @description Sets the new X-coordinate of the starting point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * starting point in pixels.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setStartX = function(newX) {

  this.startPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the starting point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getStartY = function() {

  return this.startPoint.Y;
}

/**
 * @description Sets the new Y-coordinate of the starting point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newY Real number representing the new Y-coordinate of the
 * starting point in pixels.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setStartY = function(newY) {

  this.startPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current location of the curve's starting point as
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getStartPoint = function() {

  return jsgl.cloneObject(this.startPoint);
}

/**
 * @description Sets the new location of the curve's starting point using a
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @param {jsgl.Vector2D} newLocation The new location of the starting point.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setStartPoint = function(newLocation) {

  this.startPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the new location of the curve's starting point using
 * couple of real-valued coordinates.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX A real number that the X-coordinate will be set to.
 * @param {number} newY A real number that the Y-coordinate will be set to.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setStartPointXY = function(newX, newY) {

  this.startPoint.X = newX;
  this.startPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}  

/**
 * @description Gets the current X-coordinate of the first control point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getControl1X = function() {

  return this.control1Point.X;
}

/**
 * @description Sets the X-coordinate of the first control point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * first control point in pixels.
 * @since version 1.0
 */
jsgl.elements.CurveElement.prototype.setControl1X = function(newX) {

  this.control1Point.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the first control point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getControl1Y = function() {

  return this.control1Point.Y;
}

/**
 * @description Sets the Y-coordinate of the first control point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newY Real number representing the new Y-coordinate of the
 * first control point in pixels.
 * @since version 1.0
 */
jsgl.elements.CurveElement.prototype.setControl1Y = function(newY) {

  this.control1Point.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current location of the first control point of the
 * curve as <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getControl1Point = function() {

  return jsgl.cloneObject(this.control1Point);
}

/**
 * @description Sets the new location of the first control point of the curve
 * using a <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @param {jsgl.Vector2D} newLocation The new location of the curve's 
 * first control point.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setControl1Point = function(newLocation) {

  this.control1Point = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the new location of the first control point of the curve
 * using couple of real-valued coordinates.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX A real number that the X-coordinate will be set to.
 * @param {number} newY A real number that the Y-coordinate will be set to.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setControl1PointXY = function(newX, newY) {

  this.control1Point.X = newX;
  this.control1Point.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current X-coordinate of the second control point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getControl2X = function() {

  return this.control2Point.X;
}

/**
 * @description Sets the X-coordinate of the second control point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * second control point in pixels.
 * @since version 1.0
 */
jsgl.elements.CurveElement.prototype.setControl2X = function(newX) {

  this.control2Point.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the second control point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getControl2Y = function() {

  return this.control2Point.Y;
}

/**
 * @description Sets the Y-coordinate of the second control point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newY Real number representing the new Y-coordinate of the
 * second control point in pixels.
 * @since version 1.0
 */
jsgl.elements.CurveElement.prototype.setControl2Y = function(newY) {

  this.control2Point.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current location of the second control point of the
 * curve as <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getControl2Point = function() {

  return jsgl.cloneObject(this.control2Point);
}

/**
 * @description Sets the new location of the second control point of the curve
 * using a <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @param {jsgl.Vector2D} newLocation The new location of the second control
 * point.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setControl2Point = function(newLocation) {

  this.control2Point = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the new location of the second control point of the curve
 * using couple of real-valued coordinates.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX A real number that the X-coordinate will be set to.
 * @param {number} newY A real number that the Y-coordinate will be set to.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setControl2PointXY = function(newX, newY) {

  this.control2Point.X = newX;
  this.control2Point.Y = newY;
  this.onChangeRaiser.raiseEvent();
}


/**
 * @description Gets the current X-coordinate of the ending point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getEndX = function() {

  return this.endPoint.X;
}

/**
 * @description Sets the X-coordinate of the ending point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * ending point in pixels.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setEndX = function(newX) {

  this.endPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the ending point of the
 * curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getEndY = function() {

  return this.endPoint.Y;
}

/**
 * @description Sets the Y-coordinate of the ending point of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newY Real number representing the new Y-coordinate of the
 * ending point in pixels.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setEndY = function(newY) {

  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current location of the curve's ending point as
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getEndPoint = function() {

  return jsgl.cloneObject(this.endPoint);
}

/**
 * @description Sets the new location of the curve's ending point using a
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CurveElement#
 * @param {jsgl.Vector2D} newLocation The new location of the ending point.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setEndPoint = function(newLocation) {

  this.endPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the new location of the curve's ending point using a
 * couple of real-valued coordinates.
 * @methodOf jsgl.elements.CurveElement#
 * @param {number} newX A real number that the X-coordinate will be set to.
 * @param {number} newY A real number that the Y-coordinate will be set to.
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.setEndPointXY = function(newX, newY) {

  this.endPoint.X = newX;
  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}


/**
 * @description Gets the stroke object that currently defines the line style
 * of the curve.
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 2.0
 */
jsgl.elements.CurveElement.prototype.getStroke = function() {

  return this.stroke;
}

/**
 * @description Sets the stroke object to be used for rendering the curve.
 * The curve element will be listening to changes in the stroke object and
 * repaint itself automatically whenever a change takes place.  
 * @methodOf jsgl.elements.CurveElement#
 * @param {jsgl.stroke.AbstractStroke} stroke The stroke object to be associated
 * with the curve element.
 * @since version 2.0
 */     
jsgl.elements.CurveElement.prototype.setStroke = function(stroke) {

  if(this.stroke) {

    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }
  
  this.stroke = stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);
  this.onChangeRaiser.raiseEvent();
}


/**
 * @description Gets the fill object that currently defines the interior of the
 * curve. By default, the fill is disabled. To enable filling, use
 * <code>myCurve.getFill().setEnabled(true)</code>. 
 * @methodOf jsgl.elements.CurveElement#
 * @returns {jsgl.fill.AbstractFill}
 * @since version 2.0
 */    
jsgl.elements.CurveElement.prototype.getFill = function() {

  return this.fill;
}

/**
 * @description Sets the fill object to be used for rendering curve's interior.
 * The curve element will be listening to the changes in the fill object and
 * repaint itself automatically whenever a change takes place.  
 * @methodOf jsgl.elements.CurveElement#
 * @param {jsgl.fill.AbstractFill} fill The fill object to be associated with
 * the curve element.
 * @since version 1.0
 */     
jsgl.elements.CurveElement.prototype.setFill = function(fill) {

  if(this.fill) {

    this.fill.unregisterChangeListener(this.fillChangeListener);
  }

  this.fill = fill;
  this.fill.registerChangeListener(this.fillChangeListener);
  this.onChangeRaiser.raiseEvent();
};/**
 * @fileOverview <code>jsgl.elements.SvgCurveDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Scalable Vector Graphics DOM presenter for the API curve element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.SvgCurveDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating SVG elements.
 * @since version 2.0
 */
jsgl.elements.SvgCurveDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);

  /**
   * The SVG <code>&lt;path&gt;</code> element to be used for rendering the
   * curve.
   * @type SVGPathElement
   * @private
   */
  this.svgPathElement = ownerDocument.createElementNS(
    "http://www.w3.org/2000/svg", "path");
  
  this.attachMouseHandlers(this.svgPathElement);         
}
jsgl.elements.SvgCurveDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;path&gt;</code> element that is used for
 * rendering the curve.
 * @methodOf jsgl.elements.SvgCurveDomPresenter#
 * @returns {SVGPathElement}
 * @since version 2.0
 */    
jsgl.elements.SvgCurveDomPresenter.prototype.getXmlElement = function() {

  return this.svgPathElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the API curve element associated.
 * @methodOf jsgl.elements.SvgCurveDomPresenter#
 * @since version 2.0
 */
jsgl.elements.SvgCurveDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  this.svgPathElement.setAttribute("d",
    "M" + this.graphicsElement.getStartX() +
    "," + this.graphicsElement.getStartY() +
    "C" + this.graphicsElement.getControl1X() +
    "," + this.graphicsElement.getControl1Y() +
    "," + this.graphicsElement.getControl2X() +
    "," + this.graphicsElement.getControl2Y() +
    "," + this.graphicsElement.getEndX() +
    "," + this.graphicsElement.getEndY());
  
  this.graphicsElement.getStroke().applyToSvgElement(this.svgPathElement);
  this.graphicsElement.getFill().applyToSvgElement(this.svgPathElement);
};/**
 * @fileOverview <code>jsgl.elements.VmlCurveDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Vector Markup Language DOM presenter for the API curve element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlCurveDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML elements.
 * @since version 2.0
 */
jsgl.elements.VmlCurveDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);
  
  /**
   * The VML <code>&lt;curve&gt;</code> element to be used for rendering.
   * @type VmlCurveElement
   * @private
   */
  this.vmlCurveElement = ownerDocument.createElement("vml:curve");
  this.vmlCurveElement.style.position = "absolute";
  
  /**
   * The VML <code>&lt;stroke&gt;</code> subelement.
   * @type VmlStrokeElement
   * @private
   */
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");
  this.vmlCurveElement.appendChild(this.vmlStrokeElement);
    
  /**
   * The VML <code>&lt;fill&gt;</code> subelement.
   * @type VmlFillElement
   * @private
   */           
  this.vmlFillElement = ownerDocument.createElement("vml:fill");
  this.vmlCurveElement.appendChild(this.vmlFillElement);

  this.attachMouseHandlers(this.vmlCurveElement);           
}
jsgl.elements.VmlCurveDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the VML <code>&lt;curve&gt;</code> element that is used for
 * rendering the curve.
 * @methodOf jsgl.elements.VmlCurveDomPresenter#
 * @returns VmlCurveElement   
 * @since version 2.0
 */
jsgl.elements.VmlCurveDomPresenter.prototype.getXmlElement = function() {

  return this.vmlCurveElement;
}

/**
 * @description Gets the VML <code>&lt;stroke&gt;</code> subelement that is used
 * for styling interior of the curve.
 * @methodOf jsgl.elements.VmlCurveDomPresenter#
 * @returns VmlStrokeElement
 * @since version 2.0
 */     
jsgl.elements.VmlCurveDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Get the VML <code>&lt;fill&gt;</code> subelement that is used
 * for styling interior of the curve.
 * @methodOf jsgl.elements.VmlCurveDomPresenter#
 * @returns VmlFillElement
 * @since version 2.0
 */  
jsgl.elements.VmlCurveDomPresenter.prototype.getFillElement = function() {

  return this.vmlFillElement;
}

/**
 * @description Updates the contents of rendering VML in accordance with the
 * state of the API curve object associated.
 * @methodOf jsgl.elements.VmlCurveDomPresenter#
 * @since version 2.0
 */
jsgl.elements.VmlCurveDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  this.vmlCurveElement.from = this.graphicsElement.getStartPoint().toString()
  this.vmlCurveElement.control1 = this.graphicsElement.getControl1Point().toString();
  this.vmlCurveElement.control2 = this.graphicsElement.getControl2Point().toString();
  this.vmlCurveElement.to = this.graphicsElement.getEndPoint().toString();

  /*this.vmlShapeElement.path = "m" + this.graphicsElement.getStartX().jsglVmlize() +
    "," + this.graphicsElement.getStartY().jsglVmlize() +
    "l" + this.graphicsElement.getControl1X().jsglVmlize() +
    "," + this.graphicsElement.getControl1Y().jsglVmlize() +
    "l" + this.graphicsElement.getControl2X().jsglVmlize() +
    "," + this.graphicsElement.getControl2Y().jsglVmlize() +
    "l" + this.graphicsElement.getEndX().jsglVmlize() +
    "," + this.graphicsElement.getEndY().jsglVmlize() + "e";
  
  this.vmlShapeElement.coordsize = (100).jsglVmlize() + " " + (100).jsglVmlize();
  this.vmlShapeElement.style.width = this.vmlShapeElement.style.height = "100px";*/

  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
  this.graphicsElement.getFill().applyToVmlFillElement(this.vmlFillElement);
} ;/**
 * @fileOverview Declaration and implementation of
 * <code>jsgl.elements.CircleElement</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 **/  

/**
 * @class Circle element API class.
 * @extends jsgl.elements.AbstractElement 
 * @constructor 
 * @description Creates new <code>jsgl.elements.CircleElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter Appriate
 * circle-rendering DOM presenter for user's browser.
 * @param {jsgl.Panel} panel The factory <code>jsgl.Panel</code> object that
 * creates the circle. 
 * @since version 1.0
 * @version 2.0 
 */
jsgl.elements.CircleElement = function(domPresenter, panel) {

  jsgl.elements.AbstractElement.call(this, panel);

  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */      
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);
  
  /**
   * The function listening to changes in the associated fill object.
   * @type function
   * @private
   */           
  this.fillChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);
  
  /**
   * Location of the centre point of the circle.
   * @type jsgl.Vector2D
   * @private
   */           
  this.centerLocation = new jsgl.Vector2D();
  
  /**
   * Radius of the circle.
   * @type number
   * @private
   */           
  this.radius = 0;

  /**
   * Stroke object specifying style of circle's outline.
   * @type jsgl.stroke.AbstractStroke
   * @private
   */           
  this.stroke = null;
  this.setStroke(new jsgl.stroke.SolidStroke());

  /**
   * Fill object specifying style of circle's interior.
   * @type jsgl.fill.AbstractFill
   * @private
   */         
  this.fill = null;
  this.setFill(new jsgl.fill.SolidFill());
  
  /**
   * The DOM presenter used for rendering the circle on the user's browser.
   * @type jsgl.elements.AbstractDomPresenter
   * @private
   */           
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.CircleElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM Presenter.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {jsgl.elements.AbstractDomPresenter} 
 * @since version 1.0
 */ 
jsgl.elements.CircleElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Gets the current X-coordinate of the circle's center location.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {number} 
 * @since version 1.0
 */  
jsgl.elements.CircleElement.prototype.getCenterX = function() {

  return this.centerLocation.X;
}

/**
 * @description Sets the X-coordinate of the circle's center location.
 * @methodOf jsgl.elements.CircleElement#
 * @param {number} x The real number that the X-coordiate will be set to. 
 * @since version 1.0
 */ 
jsgl.elements.CircleElement.prototype.setCenterX = function(x) {

  this.centerLocation.X = x;
  this.onChangeRaiser.raiseEvent();
}


/**
 * @description Gets the current Y-coordinate of the circle's center location.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {number}
 * @since version 1.0  
 */ 
jsgl.elements.CircleElement.prototype.getCenterY = function() {

  return this.centerLocation.Y;
}


/**
 * @description Sets the Y-coordinate of the circle's center location.
 * @methodOf jsgl.elements.CircleElement#
 * @param {number} y The real number that the Y-coordinate will be set to.
 * @since version 1.0
 */    
jsgl.elements.CircleElement.prototype.setCenterY = function(y) {

  this.centerLocation.Y = y;
  this.onChangeRaiser.raiseEvent(); 
}

/**
 * @description Gets the current location of the circle's center as
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {jsgl.Vector2D}
 * @since version 1.0
 */    
jsgl.elements.CircleElement.prototype.getCenterLocation = function() {

  return jsgl.cloneObject(this.centerLocation);
}

/**
 * @description Sets the circle's center location to a given
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.CircleElement#
 * @param {jsgl.Vector2D} location The location that the circle's center will
 * be moved to.
 * @since version 1.0
 */  
jsgl.elements.CircleElement.prototype.setCenterLocation = function(location) {

  this.centerLocation = jsgl.cloneObject(location);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the center location to a given couple of real-valued
 * coordinates.
 * @methodOf jsgl.elements.CircleElement#
 * @param {number} x The real number that the X-coordinate will be set to.
 * @param {number} y The real number that the Y-coordinate will be set to.
 * @since version 1.0
 */  
jsgl.elements.CircleElement.prototype.setCenterLocationXY = function(x,y) {

  this.centerLocation.X = x;
  this.centerLocation.Y = y;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current radius of the circle.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.CircleElement.prototype.getRadius = function() {

  return this.radius;
}

/**
 * @description Sets the radius of the circle.
 * @methodOf jsgl.elements.CircleElement#
 * @param {number} radius Non-negative real number that the radius will be set to.  
 * @since version 1.0
 */  
jsgl.elements.CircleElement.prototype.setRadius = function(radius) {

  this.radius = radius;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current stroke object that is used for styling circle's
 * outline.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 1.0
 */
jsgl.elements.CircleElement.prototype.getStroke = function() {

  return this.stroke;
}

/**
 * @description Sets the new stroke object to be applied for styling outline of
 * the circle. The circle element will be listening to changes in the stroke
 * object and repaint itself automatically whenever a change takes place.  
 * @methodOf jsgl.elements.CircleElement#
 * @param {jsgl.stroke.AbstractStroke} stroke The stroke object to be associated
 * with the circle element.
 * @since version 1.0
 */     
jsgl.elements.CircleElement.prototype.setStroke = function(stroke) {

  if(this.stroke) {
  
    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }
  
  this.stroke = stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);
  this.onChangeRaiser.raiseEvent();
}


/**
 * @description Gets the current fill object that is used for styling circle's
 * interior.
 * @methodOf jsgl.elements.CircleElement#
 * @returns {jsgl.fill.AbstractFill}
 * @since version 1.0
 */    
jsgl.elements.CircleElement.prototype.getFill = function() {

  return this.fill;
}

/**
 * @description Sets the new fill object to be applied for styling interior of
 * the circle. The circle element will be listening to the changes in the fill
 * object and repaint itself automatically whenever a change takes place.  
 * @methodOf jsgl.elements.CircleElement#
 * @param {jsgl.fill.AbstractFill} fill The fill object to be associated with
 * the circle element.
 * @since version 1.0
 */     
jsgl.elements.CircleElement.prototype.setFill = function(fill) {

  if(this.fill) {

    this.fill.unregisterChangeListener(this.fillChangeListener);
  }

  this.fill = fill;
  this.fill.registerChangeListener(this.fillChangeListener);
  this.onChangeRaiser.raiseEvent();
};/**
 * @fileOverview <code>jsgl.elements.SvgCircleDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */
 
/**
 * @class Scalable Vector Graphics DOM presenter for JSGL circle element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor  
 * @description Creates new instance of <code>jsgl.elements.SvgCircleDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating SVG elements. 
 * @since version 1.0
 * @version 2.0 
 */
jsgl.elements.SvgCircleDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);

  /**
   * The SVG <code>&lt;circle&gt;</code> element to be used for rendering.
   * @type SVGCircleElement
   * @private
   */           
  this.svgCircleElement = ownerDocument.createElementNS(
    "http://www.w3.org/2000/svg", "circle");
  
  this.attachMouseHandlers(this.svgCircleElement);
}
jsgl.elements.SvgCircleDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the root SVG element that is used for rendering.
 * @methodOf jsgl.elements.SvgCircleDomPresenter#
 * @returns SVGCircleElement
 * @since version 1.0
 * @version 2.0 
 */   
jsgl.elements.SvgCircleDomPresenter.prototype.getXmlElement = function() {

  return this.svgCircleElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the JSGL circle element associated.
 * @methodOf jsgl.elements.SvgCircleDomPresenter#  
 * @private
 * @since version 1.0
 * @version 2.0
 */ 
jsgl.elements.SvgCircleDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var location = this.graphicsElement.getCenterLocation(),
      radius = this.graphicsElement.getRadius();

  this.svgCircleElement.setAttribute("cx", location.X);
  this.svgCircleElement.setAttribute("cy", location.Y);
  this.svgCircleElement.setAttribute("r", radius);

  this.graphicsElement.getStroke().applyToSvgElement(this.svgCircleElement);
  this.graphicsElement.getFill().applyToSvgElement(this.svgCircleElement);
};/**
 * @fileOverview Implementation of <code>jsgl.elements.VmlCircleDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Vector Markup Language DOM presenter for JSGL circle element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlCircleDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML elements.
 * @since version 1.0
 */  
jsgl.elements.VmlCircleDomPresenter = function(ownerDocument) {

  /**
   * The VML shape element to be used for rendering circle. Note that general
   * <code>&lt;shape&gt;</code> is used instead of <code>&lt;oval&gt;</code> to
   * achieve perfect similarity with SVG version.
   * @type VmlShapeElement
   * @private
   */   
  this.vmlElement = ownerDocument.createElement("vml:shape");
  this.vmlElement.style.position = "absolute";
  
  /**
   * The VML stroke subelement.
   * @type VmlStrokeElement
   * @private
   */           
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");
  this.vmlElement.appendChild(this.vmlStrokeElement);
    
  /**
   * The VML fill subelement.
   * @type VmlFillElement
   * @private
   */           
  this.vmlFillElement = ownerDocument.createElement("vml:fill");
  this.vmlElement.appendChild(this.vmlFillElement);
  
  this.attachMouseHandlers(this.vmlElement);
}
jsgl.elements.VmlCircleDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the root VML element that is used for rendering the circle.
 * @methodOf jsgl.elements.VmlCircleDomPresenter#
 * @returns VmlShapeElement
 * @since version 1.0
 */    
jsgl.elements.VmlCircleDomPresenter.prototype.getXmlElement = function() {

  return this.vmlElement;
}

/**
 * @description Gets the stroke VML subelement that is used for defining
 * circle's outline.
 * @methodOf jsgl.elements.VmlCircleDomPresenter#
 * @returns VmlStrokeElement
 * @since version 1.0
 */     
jsgl.elements.VmlCircleDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Get the fill VML subelement that is used for defining
 * circle's interior.
 * @methodOf jsgl.elements.VmlCircleDomPresenter#
 * @returns VmlFillElement
 * @since version 1.0
 */  
jsgl.elements.VmlCircleDomPresenter.prototype.getFillElement = function() {

  return this.vmlFillElement;
}

/**
 * @description Updates the contents of rendering VML according to the state
 * of the JSGL circle element associated.
 * @methodOf jsgl.elements.VmlCircleDomPresenter#
 * @private
 * @since version 1.0
 * @version 2.0
 */
jsgl.elements.VmlCircleDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var location = this.graphicsElement.getCenterLocation(),
      radius = this.graphicsElement.getRadius();

  this.vmlElement.style.left = (location.X - radius) + "px";
  this.vmlElement.style.top = (location.Y - radius) + "px";
  this.vmlElement.style.width = this.vmlElement.style.height=2*radius + "px";
  
  this.vmlElement.coordsize = 20*radius + " " + 20*radius;
  
  this.vmlElement.path = "m" + Math.round(20*radius) + " " + Math.round(10*radius) +
    "qy" + Math.round(10*radius) + " " + Math.round(20*radius) + "qx0 " +
    Math.round(10*radius) + "qy" + Math.round(10*radius) + " 0qx" + Math.round(20*radius) +
    " " + Math.round(10*radius) + "xe";
  
  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
  this.graphicsElement.getFill().applyToVmlFillElement(this.vmlFillElement);
};/**
 * @fileOverview Declaration and implementation of JSGL API
 * <code>jsgl.elements.EllipseElement</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */    

/**
 * @class Ellipse element API class.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new <code>jsgl.elements.EllipseElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter Appropriate
 * ellipse-rendering DOM presenter for user's browser.
 * @param {jsgl.Panel} panel The factory <code>jsgl.Panel</code> object that
 * creates the ellipse.
 * @since version 1.0
 */ 
jsgl.elements.EllipseElement = function(domPresenter, panel) {

  jsgl.elements.AbstractElement.call(this, panel);
  
  /**
   * Location of the centre point of the ellipse.
   * @type jsgl.Vector2D
   * @private
   */           
  this.centerLocation = new jsgl.Vector2D();
  
  /**
   * Size vector of the ellipse. The X-coordinate of the vector represents witdh,
   * whilst the Y-coordinate represents height. Note that the ellipse of this
   * proportions may be further rotated.
   * @type jsgl.Vector2D
   * @private
   */                    
  this.size = new jsgl.Vector2D();
  
  /**
   * Clockwise rotation of the ellipse in degrees.
   * @type number
   * @private
   */         
  this.rotation = 0;

  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */             
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);
  
  /**
   * The function listening to changes in the associated fill object.
   * @type function
   * @private
   */           
  this.fillChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);

  /**
   * Stroke object specifying style of ellipse's outline.
   * @type jsgl.elements.AbstractStroke
   * @private
   */           
  this.stroke = null;
  this.setStroke(new jsgl.stroke.SolidStroke());
  
  /**
   * Fill object specifying style of ellipse's interior.
   * @type jsgl.elements.AbstractFill
   * @private
   */           
  this.fill = null;
  this.setFill(new jsgl.fill.SolidFill());

  /**
   * The DOM presenter that is used for rendering the ellipse on the user's
   * browser.
   * @type jsgl.elements.AbstractEllipseDomPresenter
   * @private
   */              
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.EllipseElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the ellipse.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {jsgl.elements.AbstractDomPresenter}
 * @since version 1.0
 */     
jsgl.elements.EllipseElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Gets the current X-coordinate of the ellipse's center location.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.EllipseElement.prototype.getCenterX = function() {

  return this.centerLocation.X;
}

/**
 * @description Sets the X-coordinate of the ellipse's center location.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {number} x A real number that the X-coordinate will be set to. 
 * @since version 1.0
 */    
jsgl.elements.EllipseElement.prototype.setCenterX = function(newX) {

  this.centerLocation.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the ellipse's center location.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.EllipseElement.prototype.getCenterY = function() {

  return this.centerLocation.Y;
}

/**
 * @description Sets the Y-coordinate of the ellipse's center location.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {number} y A real number that the Y-coordinate will be set to.
 * @since version 1.0
 */    
jsgl.elements.EllipseElement.prototype.setCenterY = function(newY) {

  this.centerLocation.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current location of the ellipse's center as
 * <code>jsgl.Vector2D</code>.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {jsgl.Vector2D}
 * @since version 1.0
 */
jsgl.elements.EllipseElement.prototype.getCenterLocation = function() {

  return jsgl.cloneObject(this.centerLocation);
}

/**
 * @description Sets the ellipse's center location to a given
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {jsgl.Vector2D} location The location that the ellipse's center will
 * be moved to.
 * @since version 1.0
 */    
jsgl.elements.EllipseElement.prototype.setCenterLocation = function(location) {

  this.centerLocation = jsgl.cloneObject(location);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the center location of the ellipse to a given couple of
 * real-valued coordinates.
 * @methodOf jsgl.elements.EllipseElement# 
 * @param {number} x A real number that the X-coordinate will be set to.
 * @param {number} y A real number that the Y-coordinate will be set to.
 * @since version 1.0
 */   
jsgl.elements.EllipseElement.prototype.setCenterLocationXY = function(x, y) {

  this.centerLocation.X = x;
  this.centerLocation.Y = y;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current width of the ellipse. If the ellipse is rotated,
 * then this is the width before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {number}
 * @since version 1.0
 */  
jsgl.elements.EllipseElement.prototype.getWidth = function() {

  return this.size.X;
}

/**
 * @description Sets the width of the ellipse. If the ellipse is rotated, this
 * is the width before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {number} width A non-negative real number representing the new
 * width.
 * @since version 1.0
 */      
jsgl.elements.EllipseElement.prototype.setWidth = function(width) {

  this.size.X = width;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current height of the ellipse. If the ellipse is
 * rotated, then this is the height before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {number}
 * @since version 1.0
 */     
jsgl.elements.EllipseElement.prototype.getHeight = function() {

  return this.size.Y;
}

/**
 * @description Sets the height of the ellipse. If the ellipse is rotated, this
 * is the height before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {number} height A non-negative real number representing the new height.
 * @since version 1.0
 */     
jsgl.elements.EllipseElement.prototype.setHeight = function(height) {

  this.size.Y = height;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current size of the ellipse as <code>jsgl.Vector2D</code>
 * object. The X-coordinate of the object means width, while the Y-coordinate
 * means height. If the ellipse is rotated, this is the size before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {jsgl.Vector2D}
 * @since version 1.0
 */      
jsgl.elements.EllipseElement.prototype.getSize = function() {

  return jsgl.cloneObject(this.size);
}

/**
 * @description Sets the size of the ellipse to a given <code>jsgl.Vector2D</code>
 * object. The X-coordinate of the object means width, while the Y-coordinate
 * means height. If the ellipse is rotated, this is the size before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {jsgl.Vector2D} size The new size vector.
 * @since version 1.0
 */       
jsgl.elements.EllipseElement.prototype.setSize = function(size) {

  this.size = jsgl.cloneObject(size);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the size of the elllipse to a given couple of real values.
 * If the ellipse is rotated, then this is the size before the rotation.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {number} newWidth The new width of the ellipse.
 * @param {number} newHeight The new height of the ellipse.
 * @since version 2.0
 */
jsgl.elements.EllipseElement.prototype.setSizeWH = function(newWidth, newHeight) {

  this.size = new jsgl.Vector2D(newWidth, newHeight);
  this.onChangeRaiser.raiseEvent();
}       

/**
 * @description Gets the current clockwise rotation of the ellipse in
 * degrees.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {number}
 * @since version 1.0
 */     
jsgl.elements.EllipseElement.prototype.getRotation = function() {

  return this.rotation;
}

/**
 * @description Sets the new clockwise rotation of the ellipse in degrees.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {number} rotation A real number representing the new rotation in
 * degrees.
 * @since version 1.0
 */      
jsgl.elements.EllipseElement.prototype.setRotation = function(rotation) {

  this.rotation = rotation;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the stroke object that is currently applied for rendering
 * ellipse's outline.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 1.0
 */     
jsgl.elements.EllipseElement.prototype.getStroke = function() {

  return this.stroke;
}

/**
 * @description Sets the new stroke object to be applied for rendering
 * ellipse's outline. The ellipse element will be listening to changes in
 * the stroke object and repaint itself automatically whenever a change takes
 * place. 
 * @methodOf jsgl.elements.EllipseElement#
 * @param {jsgl.stroke.AbstractStroke} The new stoke object.
 * @since version 1.0
 */   
jsgl.elements.EllipseElement.prototype.setStroke = function(stroke) {

  if(this.stroke) {

    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }

  this.stroke = stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);

  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the fill object that is currently applied for rendering
 * ellipse's interior.
 * @methodOf jsgl.elements.EllipseElement#
 * @returns {jsgl.fill.AbstractFill}
 * @since version 1.0
 */    
jsgl.elements.EllipseElement.prototype.getFill = function() {

  return this.fill;
}

/**
 * @description Sets the new fill object to be applied for rendering ellipse's
 * interior. The ellipse element will be listening to changes in the fill object
 * and repaint itself automatically whenever a change takes place.
 * @methodOf jsgl.elements.EllipseElement#
 * @param {jsgl.fill.AbstractFill} The new fill object.
 * @since version 1.0
 */   
jsgl.elements.EllipseElement.prototype.setFill = function(fill) {

  if(this.fill) {

    this.fill.unregisterChangeListener(this.fillChangeListener);
  }

  this.fill = fill;
  this.fill.registerChangeListener(this.fillChangeListener);

  this.onChangeRaiser.raiseEvent();
}
;/**
 * @fileOverview jsgl.elements.SvgEllipseDomPresenter implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */    

/**
 * @class Scalable Vector Graphics DOM presenter for JSGL ellipse element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of jsgl.elements.SvgEllipseDomPresenter.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating SVG elements.
 * @since version 1.0
 * @version 2.0 
 */       
jsgl.elements.SvgEllipseDomPresenter=function(ownerDocument) {

  /**
   * The SVG <code>&lt;ellipse&gt;</code> element to be used for rendering.
   * @type SVGEllipseElement
   * @private
   */           
  this.svgEllipseElement=ownerDocument.createElementNS("http://www.w3.org/2000/svg","ellipse");
  
  this.attachMouseHandlers(this.svgEllipseElement);
}
jsgl.elements.SvgEllipseDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the root SVG element that is used for rendering.
 * @methodOf jsgl.elements.SvgEllipseDomPresenter#
 * @returns SVGElement
 * @since version 1.0
 * @version 2.0 
 */    
jsgl.elements.SvgEllipseDomPresenter.prototype.getXmlElement=function() {

  return this.svgEllipseElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the JSGL ellipse element associated.
 * @methodOf jsgl.elements.SvgEllipseDomPresenter#
 * @private
 * @since version 1.0
 * @version 2.0
 */   
jsgl.elements.SvgEllipseDomPresenter.prototype.update=function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var location = this.graphicsElement.getCenterLocation();

  this.svgEllipseElement.setAttribute("cx", location.X);
  this.svgEllipseElement.setAttribute("cy", location.Y);
  this.svgEllipseElement.setAttribute("rx",this.graphicsElement.getWidth()/2);
  this.svgEllipseElement.setAttribute("ry",this.graphicsElement.getHeight()/2);
  this.svgEllipseElement.setAttribute("transform","rotate("+this.graphicsElement.getRotation()
    +" "+ location.X +" "+ location.Y +")");

  this.graphicsElement.getStroke().applyToSvgElement(this.svgEllipseElement);
  this.graphicsElement.getFill().applyToSvgElement(this.svgEllipseElement);
};/**
 * @fileOverview Implementation of jsgl.elements.VmlEllipseDomPresenter.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Vector Markup Language DOM presenter for JSGL ellipse element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlEllipseDomPresenter</code>
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating VML elements.
 * @since version 1.0
 */       
jsgl.elements.VmlEllipseDomPresenter=function(ownerDocument) {

  /**
   * The VML shape element to be used for rendering ellipse. Note that general
   * <code>vml:shape</code> is used instead of <code>vml:oval</code> to achieve
   * perfect similarity with SVG version.
   * @type VmlShapeElement
   * @private
   */                 
  this.vmlElement=ownerDocument.createElement("vml:shape");
  this.vmlElement.style.position="absolute";
  
  /**
   * The VML stroke subelement.
   * @type VmlStrokeElement
   * @private
   */           
  this.vmlStrokeElement=ownerDocument.createElement("vml:stroke");
  
  /**
   * The VML fill subelement.
   * @type VmlFillElement
   * @private
   */           
  this.vmlFillElement=ownerDocument.createElement("vml:fill");
  
  this.vmlElement.appendChild(this.vmlStrokeElement);
  this.vmlElement.appendChild(this.vmlFillElement);
  
  this.attachMouseHandlers(this.vmlElement);
}
jsgl.elements.VmlEllipseDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the root VML element that is used for rendering
 * the ellipse.
 * @methodOf jsgl.elements.VmlEllipseDomPresenter#
 * @returns VmlShapeElement
 * @since version 1.0
 */  
jsgl.elements.VmlEllipseDomPresenter.prototype.getXmlElement=function() {

  return this.vmlElement;
}

/**
 * @description Gets the stroke VML subelement that is used for defining
 * ellipse's outline.
 * @methodOf jsgl.elements.VmlEllipseDomPresenter#
 * @returns VmlStrokeElement
 * @since version 1.0
 */     
jsgl.elements.VmlEllipseDomPresenter.prototype.getStrokeElement=function() {

  return this.vmlStrokeElement;
}

/**
 * @description Get the fill VML subelement that is used for defining
 * ellipse's interior.
 * @methodOf jsgl.elements.VmlEllipseDomPresenter#
 * @returns VmlFillElement
 * @since version 1.0
 */   
jsgl.elements.VmlEllipseDomPresenter.prototype.getFillElement=function() {

  return this.vmlFillElement;
}

/**
 * @description Updates the contents of rendeting VML according to the state
 * of the JSGL ellipse element associated.
 * @methodOf jsgl.elements.VmlEllipseDomPresenter#
 * @private
 * @since version 1.0
 * @version 2.0  
 */     
jsgl.elements.VmlEllipseDomPresenter.prototype.update=function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var location=this.graphicsElement.getCenterLocation(),
      size=this.graphicsElement.getSize();
  
  this.vmlElement.style.left=(location.X - size.X/2);
  this.vmlElement.style.top=(location.Y - size.Y/2);
  this.vmlElement.style.width=size.X + "px";
  this.vmlElement.style.height=size.Y + "px";
  this.vmlElement.style.rotation=this.graphicsElement.getRotation();
    
  this.vmlElement.coordsize=10*size.X + " " + 10*size.Y;
  this.vmlElement.path="m" + Math.round(10*size.X) + " " + Math.round(5*size.Y) +
    "qy" + Math.round(5*size.X) + " " + Math.round(10*size.Y) + "qx0 " +
    Math.round(5*size.Y) + "qy" + Math.round(5*size.X) + " 0qx" + Math.round(10*size.X) +
    " " + Math.round(5*size.Y) + "xe";
  
  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
  this.graphicsElement.getFill().applyToVmlFillElement(this.vmlFillElement);
};/**
 * @fileOverview Declaration and implementation of API
 * <code>jsgl.elements.RectangleElement</code> class.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Rectangle element API class. It allows to draw rectangles with various
 * eventual features such as rounded corners or rotation arount the anchor point.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new <code>jsgl.elements.RectangleElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter Appropriate
 * rectangle-rendering DOM presenter for the user's browser.
 * @since version 2.0
 */
jsgl.elements.RectangleElement = function(domPresenter, panel) {

  jsgl.elements.AbstractElement.call(this, panel);
  
  /**
   * Location of the anchor point of the rectangle.
   * @type jsgl.Vector2D
   * @private
   */
  this.location = new jsgl.Vector2D();
  
  /**
   * Size vector of the rectangle. The X-coordinate of the vector represent width,
   * while the Y-coordinate represents height. Note that the rectangle of this
   * proportions may be further rotated.
   * @type jsgl.Vector2D
   * @private
   */
  this.size = new jsgl.Vector2D();
  
  /**
   * Horizontal anchor of the rectangle. It specifies the X-component of the
   * anchor to which rectangle location is related and around which the
   * rectangle rotates.
   * @type jsgl.HorizontalAnchor
   * @private
   */
  this.horizontalAnchor = jsgl.HorizontalAnchor.LEFT;           
  
  /**
   * Vertical anchor of the rectangle. It specifies the Y-component of the
   * anchor to which rectangle location is related and around which the
   * rectangle rotates.
   * @type jsgl.VerticalAnchor
   * @private
   */               
  this.verticalAnchor = jsgl.VerticalAnchor.TOP;             

  /**
   * Clockwise rotation in degrees of the rectangle around its anchor point.
   * @type number
   * @private
   */
  this.rotation = 0;
  
  /**
   * Rounding radii vector for the rectangle's corners. The radii are in pixels.   
   * @type jsgl.Vector2D
   * @private
   */
  this.roundingRadii = new jsgl.Vector2D();

  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */      
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);
  
  /**
   * The function listening to changes in the associated fill object.
   * @type function
   * @private
   */           
  this.fillChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);

  /**
   * Stroke object specifying style of the rectangle's outline.
   * @type jsgl.stroke.AbstractStroke
   * @private
   */           
  this.stroke = null;
  this.setStroke(new jsgl.stroke.SolidStroke());

  /**
   * Fill object specifying style of the rectangle's interior.
   * @type jsgl.fill.AbstractFill
   * @private
   */         
  this.fill = null;
  this.setFill(new jsgl.fill.SolidFill());
  

  /**
   * The DOM presenter that is used for rendering the rectangle.
   * @type jsgl.elements.AbstractDomPresenter
   * @private
   */
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.RectangleElement.jsglExtend(
  jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the rectangle.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.elements.AbstractDomPresenter}
 * @since version 2.0
 */  
jsgl.elements.RectangleElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Get the current X-coordinate of the rectangle's anchor point.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.getX = function() {

  return this.location.X;
}

/**
 * @description Sets the X-coordinate of the rectangle's anchor point.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newX Real number representing the new X-coordinate of
 * the rectangle's anchor point.
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.setX = function(newX) {

  this.location.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the rectangle's anchor point.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */    
jsgl.elements.RectangleElement.prototype.getY = function() {

  return this.location.Y;
}

/**
 * @description Sets the Y-coordinate of the rectangle's anchor point.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newY Real number representing the new Y-coordinate of
 * the rectangle's anchor point.
 * @since version 2.0
 */   
jsgl.elements.RectangleElement.prototype.setY = function(newY) {

  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the location of the rectangle's anchor point.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */    
jsgl.elements.RectangleElement.prototype.getLocation = function() {

  return jsgl.cloneObject(this.location);
}

/**
 * @description Sets the coordinates of the rectangle's anchor point using
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {jsgl.Vector2D} newLocation The new coordinates of the anchor point.
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.setLocation = function(newLocation) {

  this.location = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the new coordinates of the rectangle's anchor point using
 * couple of real numbers.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * anchor point.
 * @param {number} newY Real number representing the new Y-coordinate of the
 * anchor point.
 * @since version 2.0
 */   
jsgl.elements.RectangleElement.prototype.setLocationXY = function(newX, newY) {

  this.location.X=newX;
  this.location.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current width of the rectangle in pixels.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */         
jsgl.elements.RectangleElement.prototype.getWidth = function() {

  return this.size.X;
}

/**
 * @description Sets new width of the rectangle.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newWidth Real number representing the new width of the
 * rectangle in pixels.
 * @since version 2.0
 */  
jsgl.elements.RectangleElement.prototype.setWidth = function(newWidth) {

  this.size.X=newWidth;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current height of the rectangle in pixels.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */       
jsgl.elements.RectangleElement.prototype.getHeight = function() {

  return this.size.Y;
}

/**
 * @description Sets the current height of the rectangle.
 * @param {number} newHeight Real number representing the new height of the
 * rectangle.
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.setHeight = function(newHeight) {

  this.size.Y=newHeight;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current size of the rectangle as <code>jsgl.Vector2D</code>.
 * The X-coordinate of the vector represents the current width of the rectangle,
 * whilst the Y-coordinate codes the current height.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */   
jsgl.elements.RectangleElement.prototype.getSize = function() {

  return jsgl.cloneObject(this.size);
}

/**
 * @description Sets the size of the rectangle using <code>jsgl.Vector2D</code>
 * object. The X-coordinate of the vector is interpreted as width, whilts the
 * Y-coordinate as height. 
 * @methodOf jsgl.elements.RectangleElement#
 * @param {jsgl.Vector2D} newSize The new size vector for the rectangle.
 * @since version 2.0
 */ 
jsgl.elements.RectangleElement.prototype.setSize = function(newSize) {

  this.size = jsgl.cloneObject(newSize);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the size (Width and Height) of the rectangle using couple
 * of real numbers.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newW Real number representing the new width of the rectangle
 * in pixels. 
 * @param {number} newH Real number representing the new height of the rectangle
 * in pixels. 
 * @since version 2.0
 */      
jsgl.elements.RectangleElement.prototype.setSizeWH = function(newW, newH) {
  
  this.size.X=newW;
  this.size.Y=newH;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current clockwise rotation of the rectangle around its
 * anchor point in degrees.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.getRotation = function() {

  return this.rotation;
}

/**
 * @description Sets the clockwise rotation of the rectangle around its anchor
 * point in degrees.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} rotation Real number representing the new rotation in degrees.
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.setRotation = function(rotation) {

  this.rotation = rotation;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current horizontal anchor of the rectangle.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.HorizontalAnchor}
 * @since version 2.0
 */    
jsgl.elements.RectangleElement.prototype.getHorizontalAnchor = function() {

  return this.horizontalAnchor;
}

/**
 * @description Sets the new horizontal anchor of the rectangle. This influences how
 * the rectangle is horizontally positioned with respect to its anchor point.
 * This also affects how the rectangle is rotated around the anchor point.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {jsgl.HorizontalAnchor} horAnchor The new horizontal anchor of the
 * rectangle. 
 * @since version 2.0
 */  
jsgl.elements.RectangleElement.prototype.setHorizontalAnchor = function(horAnchor) {

  this.horizontalAnchor = horAnchor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current vertical anchor of the rectangle.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.VerticalAnchor}
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.getVerticalAnchor = function() {

  return this.verticalAnchor;
}

/**
 * @description Sets the vertical anchor of the rectangle. This influences how
 * the rectangle is vertically positioned with respect to its anchor point. This
 * also affects how the rectangle is rotated around the anchor point.
 * @methodOf jsgl.elements.RectangleElement# 
 * @param {jsgl.VerticalAnchor} vertAnchor The new vertical anchor of the
 * rectangle.
 * @since version 2.0
 */ 
jsgl.elements.RectangleElement.prototype.setVerticalAnchor = function(vertAnchor) {

  this.verticalAnchor = vertAnchor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current X-axis radius of the ellipse used to round off
 * the corners of the rectangle.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.getXRadius = function() {

  return this.roundingRadii.X;
}

/**
 * @description Sets the new X-axis radius for the ellipse used to round off
 * the corners of the rectangle. If this value is set to zero, corners will not
 * be rounded.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newXRadius The new X-axis radius for corner rounding in pixels.
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.setXRadius = function(newXRadius) {

  this.roundingRadii.X = newXRadius;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current y-axis radius of the ellipse used to round off
 * the corners of the rectangle.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {number}
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.getYRadius = function() {

  return this.roundingRadii.Y;
}

/**
 * @description Sets the new y-axis radius for the ellipse used to round off
 * the corners of the rectangle. If this value is set to zero, corners will not
 * be rounded.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newYRadius The new y-axis radius for corner rounding in pixels.
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.setYRadius = function(newYRadius) {

  this.roundingRadii.Y = newYRadius;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the x- and y-axis radii of the ellipse used to round off
 * the corners of the rectangle. <code>jsgl.Vector2D</code> object specifying
 * the radii is returned. 
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.getRadii = function() {

  return jsgl.cloneObject(this.roundingRadii);
}

/**
 * @description Sets the new X- and Y-axis radii for the ellipse used to round
 * off the corners of the rectangle. <code>jsgl.Vector2D</code> object
 * specifying the radii is required.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {jsgl.Vector2D} newRadii The new radii vector.
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.setRadii = function(newRadii) {

  this.roundingRadii = jsgl.cloneObject(newRadii);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Sets the new X- and Y-axis radii for rounding corners using
 * couple real-numbers.
 * @methodOf jsgl.elements.RectangleElement#
 * @param {number} newXRadius The new X-axis radius for corner rounding in pixels.
 * @param {number} newYRadius The new X-axis radius for corner rounding in pixels.
 * @since version 2.0
 */
jsgl.elements.RectangleElement.prototype.setRadiiXY = function(newXRadius, newYRadius) {

  this.roundingRadii.X = newXRadius;
  this.roundingRadii.Y = newYRadius;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current stroke object that is used for rendering
 * rectangle's outline.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 2.0   
 */
jsgl.elements.RectangleElement.prototype.getStroke=function() {

  return this.stroke;
}

/**
 * @description Sets the stroke object to be applied for rendering rectangle's
 * outline. The rectangle element will be listening to changes in the stroke
 * object and repaint itself automatically whenever a change takes place.  
 * @methodOf jsgl.elements.RectangleElement#
 * @param {jsgl.stroke.AbstractStroke} stroke The stroke object to be associated
 * with the rectangle element.
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.setStroke=function(stroke) {

  if(this.stroke) {
  
    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }
  
  this.stroke=stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);
  this.onChangeRaiser.raiseEvent();
}


/**
 * @description Gets the current fill object that is used for rendering rectangle's
 * interior.
 * @methodOf jsgl.elements.RectangleElement#
 * @returns {jsgl.fill.AbstractFill}
 * @since version 2.0
 */    
jsgl.elements.RectangleElement.prototype.getFill=function() {

  return this.fill;
}

/**
 * @description Sets the new fill object to be applied for rendering rectangle's
 * interior. The rectangle element will be listening to the changes in the fill
 * object and repaint itself automatically whenever a change takes place.  
 * @methodOf jsgl.elements.RectangleElement#
 * @param {jsgl.fill.AbstractFill} fill The fill object to be associated with
 * the rectangle element.
 * @since version 2.0
 */     
jsgl.elements.RectangleElement.prototype.setFill=function(fill) {

  if(this.fill) {

    this.fill.unregisterChangeListener(this.fillChangeListener);
  }

  this.fill=fill;
  this.fill.registerChangeListener(this.fillChangeListener);
  this.onChangeRaiser.raiseEvent();
};/**
 * @fileOverview <code>jsgl.elements.SvgRectangleDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Scalable Vector Graphics DOM presenter for the API rectangle element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.SvgRectangleDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating SVG elements.
 * @since version 2.0
 */   
jsgl.elements.SvgRectangleDomPresenter = function(ownerDocument) {

  /**
   * The SVG <code>&lt;rect&gt;</code> element to be used for rendering.
   * @type SVGRectElement
   * @private
   */
  this.svgRectElement = ownerDocument.createElementNS(
    "http://www.w3.org/2000/svg", "rect");

  this.attachMouseHandlers(this.svgRectElement);         
}
jsgl.elements.SvgRectangleDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;rect&gt;</code> element that is used for
 * rendering.
 * @methodOf jsgl.elements.SvgRectangleDomPresenter#
 * @returns SVGRectElement
 * @since version 2.0
 */
jsgl.elements.SvgRectangleDomPresenter.prototype.getXmlElement = function() {

  return this.svgRectElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the API rectangle element associated.
 * @methodOf jsgl.elements.SvgRectangleDomPresenter#
 * @private
 * @since version 2.0
 */
jsgl.elements.SvgRectangleDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  var location = this.graphicsElement.getLocation(),
      size = this.graphicsElement.getSize(),
      radii = this.graphicsElement.getRadii();
  
  var x,y;

  switch(this.graphicsElement.getHorizontalAnchor()) {
  
    case jsgl.HorizontalAnchor.LEFT:
    
      x = location.X;
      break;
    
    case jsgl.HorizontalAnchor.CENTER:
    
      x = location.X - size.X / 2;
      break;
    
    case jsgl.HorizontalAnchor.RIGHT:
    
      x = location.X - size.X;
      break;
  }
  
  switch(this.graphicsElement.getVerticalAnchor()) {
  
    case jsgl.VerticalAnchor.TOP:
    
      y = location.Y;
      break;
    
    case jsgl.VerticalAnchor.MIDDLE:
    
      y = location.Y - size.Y / 2;
      break;
    
    case jsgl.VerticalAnchor.BOTTOM:
    
      y = location.Y - size.Y;
      break;
  }

  this.svgRectElement.setAttribute("x", x);
  this.svgRectElement.setAttribute("y", y);
  
  this.svgRectElement.setAttribute("width", size.X);
  this.svgRectElement.setAttribute("height", size.Y);
  this.svgRectElement.setAttribute("rx", radii.X);
  this.svgRectElement.setAttribute("ry", radii.Y);

  this.svgRectElement.setAttribute("transform",
    "rotate(" + this.graphicsElement.getRotation() +
    "," + location.X + "," + location.Y + ")");

  this.graphicsElement.getStroke().applyToSvgElement(this.svgRectElement);
  this.graphicsElement.getFill().applyToSvgElement(this.svgRectElement);
};/**
 * @fileOverview <code>jsgl.elements.VmlRectangleDomPresenter</code>
 * implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Vector Markup Language DOM presenter for JSGL image element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlRectangleDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML elements.
 * @since version 2.0
 */
jsgl.elements.VmlRectangleDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);
  
  /**
   * The VML <code>&lt;shape&gt;</code> element to be used for rendering. Note
   * that general <code>&lt;shape&gt;</code> element is used instead of VML
   * <code>&lt;roundrect&gt;</code>, most notable because <code>&lt;roundrect&gt;</code>
   * does not support rounding for x- and y-axis separately.
   * @type VmlShapeElement
   * @private
   */
  this.vmlShapeElement = document.createElement("vml:shape");
  this.vmlShapeElement.style.position = "absolute";
    
  /**
   * The VML <code>&lt;stroke&gt;</code> subelement that specifies style of the
   * rectangle's outline.
   * @type VmlStrokeElement
   * @private
   */
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");
  this.vmlShapeElement.appendChild(this.vmlStrokeElement);

  /**
   * The VML <code>&lt;fill&gt;</code> subelement that specifies style
   * of the rectangle's interior.
   * @type VmlFillElement
   * @private
   */
  this.vmlFillElement = ownerDocument.createElement("vml:fill");
  this.vmlShapeElement.appendChild(this.vmlFillElement);
  
  this.attachMouseHandlers(this.vmlShapeElement);         
}
jsgl.elements.VmlRectangleDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the VML <code>&lt;shape&gt;</code> element that is used
 * for rendering the rectangle.
 * @methodOf jsgl.elements.VmlRectangleDomPresenter#
 * @returns VmlShapeElement
 * @since version 2.0
 */    
jsgl.elements.VmlRectangleDomPresenter.prototype.getXmlElement = function() {

  return this.vmlShapeElement;
}

/**
 * @description Gets the VML <code>&lt;stroke&gt;</code> subelement that is used
 * for defining rectangle's outline.
 * @methodOf jsgl.elements.VmlRectangleDomPresenter#
 * @returns VmlStrokeElement
 * @since version 2.0
 */
jsgl.elements.VmlRectangleDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Get the fill VML subelement that is used for defining
 * rectangle's interior.
 * @methodOf jsgl.elements.VmlRectangleDomPresenter#
 * @returns VmlFillElement
 * @since version 2.0
 */  
jsgl.elements.VmlRectangleDomPresenter.prototype.getFillElement = function() {

  return this.vmlFillElement;
}

/**
 * @description Updates the contents of rendering VML according to the state
 * of the API rectangle object associated.
 * @methodOf jsgl.elements.VmlRectangleDomPresenter#
 * @since version 2.0
 */  
jsgl.elements.VmlRectangleDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  // cooperates with Number.prototype.jsglVmlize()
  
  var size = this.graphicsElement.getSize(),
      radii = new jsgl.Vector2D(
        Math.min(this.graphicsElement.getXRadius(), size.X/2),
        Math.min(this.graphicsElement.getYRadius(), size.Y/2)),
      location = this.graphicsElement.getLocation();


  var dPhi = Math.PI * this.graphicsElement.getRotation() / 180;

  var origCX, origCY;
  
  switch(this.graphicsElement.getHorizontalAnchor()) {
  
    case jsgl.HorizontalAnchor.LEFT:
    
      origCX = location.X + size.X/2;
      break;
    
    case jsgl.HorizontalAnchor.CENTER:
    
      origCX = location.X;
      break;
    
    case jsgl.HorizontalAnchor.RIGHT:
    
      origCX = location.X - size.X/2;
      break;
  }
  
  switch(this.graphicsElement.getVerticalAnchor()) {
  
    case jsgl.VerticalAnchor.TOP:
    
      origCY = location.Y + size.Y/2;
      break;
    
    case jsgl.VerticalAnchor.MIDDLE:
    
      origCY = location.Y;
      break;
    
    case jsgl.VerticalAnchor.BOTTOM:
    
      origCY = location.Y - size.Y/2;
      break;
  }
  
  var origPhi = Math.atan2(origCY - location.Y, origCX - location.X);
  
  var d = jsgl.Vector2D.getDistance(location, new jsgl.Vector2D(origCX, origCY));
  
  var trCX = location.X + Math.cos(origPhi + dPhi) * d;
  var trCY = location.Y + Math.sin(origPhi + dPhi) * d;

  this.vmlShapeElement.style.left = trCX - size.X / 2;
  this.vmlShapeElement.style.top = trCY - size.Y / 2;
  
  
  this.vmlShapeElement.coordsize = size.X.jsglVmlize() + " " + size.Y.jsglVmlize();
  this.vmlShapeElement.style.width = size.X;
  this.vmlShapeElement.style.height = size.Y;


  /* During path string computation, redundant qy and qx segments need to be
     removed in case of zero radii, because they affect join style of the
     rectangles's stroke in the corners. */
  var rounded = radii.X > 0 && radii.Y > 0;

  var pathStr = "m" + radii.X.jsglVmlize() + ",0";
  
  pathStr += "l" + (size.X - (rounded ? radii.X : 0)).jsglVmlize() + ",0";

  if(rounded) {

    pathStr += "qx" + size.X.jsglVmlize() + "," + radii.Y.jsglVmlize();
  }
  
  pathStr += "l" + size.X.jsglVmlize() + "," + (size.Y - (rounded ? radii.Y : 0)).jsglVmlize();
  
  if(rounded) {

    pathStr += "qy" + (size.X - radii.X).jsglVmlize() + "," + size.Y.jsglVmlize();
  }
  
  pathStr += "l" + radii.X.jsglVmlize() + "," + size.Y.jsglVmlize();
  
  if(rounded) {
  
    pathStr += "qx0," + (size.Y - radii.Y).jsglVmlize();
  }
  
  pathStr += "l0," + radii.Y.jsglVmlize();
  
  if(rounded) {
  
    pathStr += "qy" + radii.X.jsglVmlize() + ",0";
  }
  
  pathStr += "ex";
  
  this.vmlShapeElement.rotation = this.graphicsElement.getRotation();
  
  this.vmlShapeElement.path = pathStr;

  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
  this.graphicsElement.getFill().applyToVmlFillElement(this.vmlFillElement);
};/**
 * @fileOverview Declaration and implementation of <code>jsgl.elements.Line</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Line element API class.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.LineElement</code>.
 * @param {jsgl.elements.AbstractLineDomPresenter} domPresenter Appropriate
 * line-rendering DOM presenter for the user's browser.   
 * @since version 1.0
 * @version 2.0 
 */        
jsgl.elements.LineElement=function(domPresenter, panel, x1,y1,x2,y2,stroke,zIndex) {

  jsgl.elements.AbstractElement.call(this,panel,zIndex);

  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */             
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser,this.onChangeRaiser.raiseEvent);
  
  /**
   * The starting point of the line, i.e. (x1,y1).
   * @type jsgl.Vector2D
   * @private
   */           
  this.startPoint = new jsgl.Vector2D(x1,y1);
  
  /**
   * The ending point of the line, i.e. (x2,y2).
   * @type jsgl.Vector2D
   * @private
   */         
  this.endPoint = new jsgl.Vector2D(x2,y2);
  
  /**
   * The stroke object specifying the style of the line. Note that the object
   * fully defines the it's style.
   * @type jsgl.stroke.AbstractStroke
   * @private         
   */     
  this.stroke = null;
  this.setStroke(stroke || new jsgl.stroke.SolidStroke());
  
  /**
   * The DOM presenter used for rendering the line on the user's browser.
   * @type jsgl.elements.AbstractLineDomPresenter
   * @private
   */           
  this.domPresenter=domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.LineElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the line.
 * @methodOf jsgl.elements.LineElement#
 * @returns {jsgl.elements.AbstractLineDomPresenter}
 * @since version 1.0
 */       
jsgl.elements.LineElement.prototype.getDomPresenter=function() {

  return this.domPresenter;
}

/**
 * @description Gets the current X-coordinate of the starting point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.getStartX=function() {

  return this.startPoint.X;
}

/**
 * @description Sets the X-coordinate of the starting point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @param {number} newX Real number representing the new X-coordinate.
 * @since version 1.0
 */   
jsgl.elements.LineElement.prototype.setStartX=function(newX) {

  this.startPoint.X=newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the starting point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.getStartY=function() {

  return this.startPoint.Y;
}

/**
 * @description Sets the Y-coordinate of the starting point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @param {number} newY Real number representing the new Y-coordinate.
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.setStartY=function(newY) {

  this.startPoint.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current starting point of the line as
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.LineElement#
 * @returns {jsgl.Vector2D}
 * @since version 1.0 
 */   
jsgl.elements.LineElement.prototype.getStartPoint=function() 
{
  return jsgl.cloneObject(this.startPoint);
}

/**
 * @description Sets the starting point of the line using given
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.LineElement#
 * @param {Vector2D} startPoint The new start point of the line.
 * @since version 1.0 
 */  
jsgl.elements.LineElement.prototype.setStartPoint=function(startPoint) {

  this.setStartPointXY(startPoint.X,startPoint.Y);
}

/**
 * @description Sets the starting point of the line using couple of real-valued
 * coordinates.
 * @methodOf jsgl.elements.LineElement#
 * @param {newX} Real number representing the new X-coordinate.
 * @param {newY} Real number representing the new Y-coordinate.
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.setStartPointXY=function(newX,newY) {

  this.startPoint.X=newX;
  this.startPoint.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current X-coordinate of the ending point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.getEndX=function() {

  return this.endPoint.X;
}

/**
 * @description Sets the X-coordinate of the ending point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @param {number} newX Real number representing the new X-coordinate.
 * @since version 1.0
 */
jsgl.elements.LineElement.prototype.setEndX=function(newX)
{
  this.endPoint.X=newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the ending point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @returns {number}
 * @since version 1.0
 */
jsgl.elements.LineElement.prototype.getEndY=function() {

  return this.endPoint.Y;
}

/**
 * @description Sets the Y-coordinate of the ending point of the line.
 * @methodOf jsgl.elements.LineElement#
 * @param {number} newY Real number representing the new Y-coordinate.
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.setEndY=function(newY) {

  this.endPoint.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current endting point of the line as
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.LineElement#
 * @returns {jsgl.Vector2D}
 * @since version 1.0 
 */   
jsgl.elements.LineElement.prototype.getEndPoint=function() {

  return jsgl.cloneObject(this.endPoint);
}

/**
 * @description Sets the starting point of the line using given
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.LineElement#
 * @param {Vector2D} endPoint The new ending point of the line.
 * @since version 1.0 
 */
jsgl.elements.LineElement.prototype.setEndPoint=function(endPoint)
{
  this.setEndPointXY(endPoint.X,endPoint.Y);
}

/**
 * @description Sets the starting point of the line using couple of real-valued
 * coordinates.
 * @methodOf jsgl.elements.LineElement#
 * @param {newX} Real number representing the new X-coordinate.
 * @param {newY} Real number representing the new Y-coordinate.
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.setEndPointXY=function(newX,newY) {

  this.endPoint.X=newX;
  this.endPoint.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the stroke object that is currently used for styling the line.
 * @methodOf jsgl.elements.LineElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 1.0
 */    
jsgl.elements.LineElement.prototype.getStroke=function() {

  return this.stroke;
}

/**
 * @description Sets the stroke object to be used for styling the line. The line
 * will be listening to changes in the stroke object and update itself
 * automatically whenever a change takes place.
 * @methodOf jsgl.elements.LineElement#
 * @param {jsgl.stroke.AbstractStroke} stroke The new stroke object to be
 * associated with the line element.
 * @since version 1.0
 */       
jsgl.elements.LineElement.prototype.setStroke=function(stroke) {

  if(this.stroke) {
  
    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }
  
  this.stroke=stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);
  this.onChangeRaiser.raiseEvent();
}
;/**
 * @fileOverview <code>jsgl.elements.SvgLineDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 * @version 2.0 
 */

/**
 * @class Scalable Vector Graphics DOM presenter for the API line element. 
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.SvgLineDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating SVG elements. 
 * @since version 1.0 
 * @version 2.0
 */  
jsgl.elements.SvgLineDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);

  /**
   * The SVG <code>&lt;line&gt;</code> element to be used for rendering.
   * @type SVGLineElement
   * @private
   */         
  this.svgLineElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg","line");

  this.attachMouseHandlers(this.svgLineElement);
}
jsgl.elements.SvgLineDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;element&gt;</code> that is used for
 * rendering. 
 * @methodOf jsgl.elements.SvgLineDomPresenter#
 * @returns {SVGLineElement} 
 * @since version 1.0
 * @version 2.0
 */   
jsgl.elements.SvgLineDomPresenter.prototype.getXmlElement = function() {

  return this.svgLineElement;
}

/**
 * @description Updates the rendering SVG in accordance with the state of the
 * API line element associated.
 * @methodOf jsgl.elements.SvgLineDomPresenter#  
 * @since version 1.0
 * @version 2.0
 */
jsgl.elements.SvgLineDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  this.svgLineElement.setAttribute("x1", this.graphicsElement.getStartX());
  this.svgLineElement.setAttribute("y1", this.graphicsElement.getStartY());
  this.svgLineElement.setAttribute("x2", this.graphicsElement.getEndX());
  this.svgLineElement.setAttribute("y2", this.graphicsElement.getEndY());
  
  this.graphicsElement.getStroke().applyToSvgElement(this.svgLineElement);
};/**
 * @fileOverview Implementation of <code>jsgl.elements.VmlLineDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Vector Markup Language DOM presenter for the API line element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlLineDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML elements.
 * @since version 1.0
 */   
jsgl.elements.VmlLineDomPresenter = function(ownerDocument) {

  /**
   * The VML <code>&lt;line&gt;</code> element to be used for rendering.
   * @type VmlLineElement
   * @private
   */         
  this.vmlElement = ownerDocument.createElement("vml:line");
  this.vmlElement.style.position = "absolute";
  
  /**
   * The VML <code>&lt;stroke&gt;</code> element to be used for defining style
   * of the line.
   * @type VmlStrokeElement
   * @private
   */            
  this.vmlStrokeElement=ownerDocument.createElement("vml:stroke");
  this.vmlElement.appendChild(this.vmlStrokeElement);

  this.attachMouseHandlers(this.vmlElement);
}
jsgl.elements.VmlLineDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the VML <code>&lt;line&gt;</code> element that is used for
 * rendering.
 * @methodOf jsgl.elements.VmlLineDomPresenter#
 * @returns {VmlLineElement}
 * @since version 1.0
 */      
jsgl.elements.VmlLineDomPresenter.prototype.getXmlElement = function() {

  return this.vmlElement;
}

/**
 * @description Gets the VML <code>&lt;stroke&gt;</code> subelement that defines
 * style of the line.
 * @methodOf jsgl.elements.VmlLineDomPresenter#
 * @returns {VmlStrokeElement}
 * @since version 1.0
 */     
jsgl.elements.VmlLineDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Updates the contents of rendering VML according to the state
 * of the API line object associated.
 * @methodOf jsgl.elements.VmlLineDomPresenter#
 * @since version 1.0
 */    
jsgl.elements.VmlLineDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  this.vmlElement.from = this.graphicsElement.getStartPoint().toString();
  this.vmlElement.to = this.graphicsElement.getEndPoint().toString();

  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
};/**
 * @fileOverview Declaration and implementation of JSGL API
 * <code>jsgl.elements.LabelElement</code> class.
 * @author Tomas Rehorek
 * @since version 1.0  
 * @version 2.0
 */

/**
 * @class Label element API class. It allows simple text labels to be drawn.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.LabelElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter Appropriate DOM
 * presenter for rendering the label element on the user's browser.
 * @param {jsgl.Panel} panel The factory <code>jsgl.Panel</code> object that
 * is creating the image. Note that no other object than <code>jsgl.Panel</code>
 * should call this constructor.
 * @since version 1.0
 * @version 2.0
 */   
jsgl.elements.LabelElement=function(domPresenter, panel, x,y,text,zIndex) {

  jsgl.elements.AbstractElement.call(this, panel, zIndex);
  
  /**
   * Location of the anchor point of the label.
   * @type jsgl.Vector2D
   * @private
   */           
  this.location=new jsgl.Vector2D(x,y);
  
  /**
   * The string displayed by the label.
   * @type string
   * @private
   */           
  this.text=text || "";
  
  /**
   * The CSS font-family of the label.
   * @type string
   * @private
   */           
  this.fontFamily = "sans-serif";
  
  /**
   * The font size of the label in pixels.
   * @type number
   * @private
   */           
  this.fontSize = 12;
  
  /**
   * The HTML color of the label.
   * @type string
   * @private
   */           
  this.fontColor = "black";
  
  /**
   * Determines whether or not the label is underlined.
   * @type boolean
   * @private
   */           
  this.underlined = false;
  
  /**
   * Determines whether or not the label has a line above it or not.
   * @type boolean
   * @private
   */           
  this.overlined = false;
  
  /**
   * Determines whether or not the label is struck-through.
   * @type boolean
   * @private
   */         
  this.struckThrough = false;
  
  /**
   * Determines whether the weight of the label is bold or not.
   * @type boolean
   * @private
   */       
  this.bold = false;
  
  /**
   * Determines whether the font style of the label is italic or not.
   * @type boolean
   * @private
   */           
  this.italic = false;
  
  /**
   * Horizontal anchor of the label. It specifies the X-component of the anchor
   * to which location of the label is related.
   * @type jsgl.HorizontalAnchor
   * @private
   */             
  this.horizontalAnchor = jsgl.HorizontalAnchor.LEFT;
  
  /**
   * Vertical anchor of the label. It specifies the Y-component of the anchor
   * to which location of the label is related.
   * @type jsgl.VerticalAnchor
   * @private
   */              
  this.verticalAnchor = jsgl.VerticalAnchor.TOP;
  
  /**
   * Opacity of the label.
   * @type number
   * @private
   * @since version 2.0
   */
  this.opacity = 1.0;              
  
  /**
   * The DOM presenter that is used for rendering the label on the user's browser.
   * @type jsgl.elements.AbstractDomPresenter
   * @private
   */
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.LabelElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the label.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {jsgl.elements.AbstractDomPresenter}
 * @since version 1.0
 */     
jsgl.elements.LabelElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Gets the X-axis coordinate of the label's anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {number}
 * @since version 1.0
 */ 
jsgl.elements.LabelElement.prototype.getX = function() {

  return this.location.X;
}

/**
 * @description Sets the X-axis coordinate of the label's anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * label's anchor point.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setX = function(newX) {

  this.location.X=newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the Y-axis coordinate of the label's anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getY = function() {

  return this.location.Y;
}

/**
 * @description Sets the Y-axis coordinate of the label's anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @param {number} newY Real number representing the new Y-coordinate of the
 * label's anchor point.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setY = function(newY) {

  this.location.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the location of the label's anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {jsgl.Vector2D}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getLocation = function() {

  return jsgl.cloneObject(this.location);
}

/**
 * @description Sets the location of the label's anchor point using
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.LabelElement#
 * @param {jsgl.Vector2D} newLocation The new coordinates of the anchor point.
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.setLocation = function(newLocation) {

  this.setLocationXY(newLocation.X, newLocation.Y);
}

/**
 * @description Sets the location of the label's anchor point using couple
 * of real-valued coordinates (X and Y).
 * @methodOf jsgl.elements.LabelElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * label's anchor point.
 * @param {number} newY Real number representing the new Y-coordinate of the
 * label's anchor point.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setLocationXY = function(newX, newY) {

  this.location.X = newX;
  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current horizontal anchor of the label.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {jsgl.HorizontalAnchor}
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.getHorizontalAnchor = function() {

  return this.horizontalAnchor;
}

/**
 * @description Sets the horizontal anchor of the label. This allows the label
 * to be aligned left, center, or right to its anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @param {jsgl.HorizontalAnchor} horizontalAnchor The new horizontal anchor
 * of the label.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setHorizontalAnchor = function(horizontalAnchor) {

  this.horizontalAnchor = horizontalAnchor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current vertical anchor of the label.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {jsgl.VerticalAnchor}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getVerticalAnchor = function() {

  return this.verticalAnchor;
}

/**
 * @description Sets the vertical anchor of the label. This allows the label
 * to be aligned top, middle, or bottom to its anchor point.
 * @methodOf jsgl.elements.LabelElement#
 * @param {jsgl.VerticalAnchor} verticalAnchor the new vertical anchor of the
 * label.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setVerticalAnchor = function(verticalAnchor) {

  this.verticalAnchor = verticalAnchor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the string currently displayed by the label.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {string}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getText = function() {

  return this.text;
}

/**
 * @description Sets the new string to be displayed by the label.
 * @methodOf jsgl.elements.LabelElement#
 * @param {string} newText The new string to be displayed.
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.setText = function(newText) {

  this.text = newText;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current CSS font-family string for the label.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {string}
 * @since version 1.0
 */     
jsgl.elements.LabelElement.prototype.getFontFamily = function() {

  return this.fontFamily;
}

/**
 * @description Sets the new CSS font-family string for the label.
 * @methodOf jsgl.elements.LabelElement#
 * @param {string} fontFamily The new CSS font-family.
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.setFontFamily = function(fontFamily) {

  this.fontFamily = fontFamily;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current font size of the label in pixels.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {number}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getFontSize = function() {

  return this.fontSize;
}

/**
 * @description Sets the new font size of the label in pixels.
 * @methodOf jsgl.elements.LabelElement#
 * @param {number} fontSize Real number representing the new font size of the 
 * label in pixels.
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.setFontSize = function(fontSize) {

  this.fontSize = fontSize;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current CSS color of the label's font.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {string}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getFontColor = function() {

  return this.fontColor;
}

/**
 * @description Sets the new color of the label's font in the CSS color format.
 * @methodOf jsgl.elements.LabelElement#
 * @param {string} fontColor The new font color for the label's font to be used.
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.setFontColor = function(fontColor) {

  this.fontColor = fontColor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether or not the label is currently underlined.
 * @methodOf jsgl.elements.LabelElement#
 * @returns boolean
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.getUnderlined = function() {

  return this.underlined;
}

jsgl.elements.LabelElement.prototype.isUnderlined = jsgl.elements.LabelElement.prototype.getUnderlined;

/**
 * @description Sets whether or not the label should be underlined.
 * @methodOf jsgl.elements.LabelElement#
 * @param {boolean} underlined Boolean value that turns the underlining
 * on or off.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setUnderlined = function(underlined) {

  this.underlined = underlined;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether the label is currently overlined or not.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {boolean}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getOverlined = function() {

  return this.overlined;
}

jsgl.elements.LabelElement.prototype.isOverlined = jsgl.elements.LabelElement.prototype.getOverlined;

/**
 * @description Sets whether or not the label should be overlined or not. Setting
 * overlining true causes the label to have line above it.
 * @methodOf jsgl.elements.LabelElement#
 * @param {boolean} overlined Boolean value that turns the overlining
 * on or off.
 * @since version 1.0
 */     
jsgl.elements.LabelElement.prototype.setOverlined = function(overlined) {

  this.overlined = overlined;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether the label is currently struck-through or not.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {boolean}
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.getStruckThrough = function() {

  return this.struckThrough;
}

jsgl.elements.LabelElement.prototype.isStruckThrough = jsgl.elements.LabelElement.prototype.getStruckThrough;

/**
 * @description Sets whether or not the label should be struck-through or not.
 * Setting this true causes the label to have line that crosses it.
 * @methodOf jsgl.elements.LabelElement#
 * @param {boolean} struckThrough Boolean value that turns the strikethrough
 * on or off.
 * @since version 1.0
 */   
jsgl.elements.LabelElement.prototype.setStruckThrough = function(struckThrough) {

  this.struckThrough = struckThrough;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether the font weight of the label is currently bold.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {boolean}
 * @since version 1.0
 */    
jsgl.elements.LabelElement.prototype.getBold=function() {

  return this.bold;
}

jsgl.elements.LabelElement.prototype.isBold = jsgl.elements.LabelElement.prototype.getBold();

/**
 * @description Sets whether or not the font weight of the label should be bold.
 * @methodOf jsgl.elements.LabelElement#
 * @param {boolean} bold Boolean value telling whether or not use bold font.
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.setBold = function(bold) {

  this.bold = bold;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Determines whether the font style of the label is currently
 * italics.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {boolean}
 * @since version 1.0
 */     
jsgl.elements.LabelElement.prototype.getItalics = function() {
  return this.italics;
}

jsgl.elements.LabelElement.prototype.isItalics = jsgl.elements.LabelElement.getItalics;

/**
 * @description Sets whether or not the font style of the label should be
 * italics.
 * @methodOf jsgl.elements.LabelElement#
 * @param {boolean} italics Boolean value telling whether or not use italics font.
 * @since version 1.0
 */  
jsgl.elements.LabelElement.prototype.setItalics = function(italics) {

  this.italics = italics;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current opacity of the label.
 * @methodOf jsgl.elements.LabelElement#
 * @returns {number} The current opacity.
 * @since version 2.0
 */    
jsgl.elements.LabelElement.prototype.getOpacity = function() {

  return this.opacity;
}

/**
 * @description Sets the opacity of the label.
 * @methodOf jsgl.elements.LabelElement#
 * @param {number} opacity The new opacity.
 * @since version 2.0
 */
jsgl.elements.LabelElement.prototype.setOpacity = function(opacity) {
  
  this.opacity = opacity;
  this.onChangeRaiser.raiseEvent();
}    ;/**
 * @fileOverview <code>jsgl.elements.SvgLabelDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Scalable Vector Graphics DOM presenter for JSGL label element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.SvgLabelDomPresenter</code>
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating HTML elements.
 * @since version 2.0
 */
jsgl.elements.SvgLabelDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);
  
  /**
   * The SVG <code>&lt;text&gt;</code> element.
   * @type SVGTextElement
   * @private
   */           
  this.svgTextElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg","text");
  
  /**
   * The child text node of the SVG <code>&lt;text&gt;</code> element.
   * @type XMLTextNode
   * @private
   */
  this.textNode = ownerDocument.createTextNode("");
  
  this.svgTextElement.appendChild(this.textNode);

  this.attachMouseHandlers(this.svgTextElement);
           
}
jsgl.elements.SvgLabelDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;text&gt;</code> element that is used
 * for rendering the label.
 * @methodOf jsgl.elements.SvgLabelDomPresenter#
 * @private
 * @since version 2.0
 */
jsgl.elements.SvgLabelDomPresenter.prototype.getXmlElement = function() {

  return this.svgTextElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the JSGL label element associated.
 * @methodOf jsgl.elements.SvgLabelDomPresenter#
 * @private
 * @since version 2.0
 */
jsgl.elements.SvgLabelDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  this.textNode.nodeValue = this.graphicsElement.getText();
  
  this.svgTextElement.style.setProperty('font-family', this.graphicsElement.getFontFamily(), null);
  this.svgTextElement.style.setProperty('fill', this.graphicsElement.getFontColor(), null);
  
  var underlined=this.graphicsElement.getUnderlined(),
      overlined=this.graphicsElement.getOverlined(),
      struckThrough=this.graphicsElement.getStruckThrough(),
      decorationString="";

  if(underlined) decorationString="underline";

  if(overlined) {

    if(decorationString) {

      decorationString += " overline";
    }
    else {

      decorationString = "overline";
    }
  }

  if(struckThrough) {
    if(decorationString) {

      decorationString+=" line-through";
    }
    else {

      decorationString="line-through";
    }
  }

  this.svgTextElement.style.fontSize = this.graphicsElement.getFontSize()+"px";
  this.svgTextElement.style.textDecoration = decorationString;
  this.svgTextElement.style.fontWeight = this.graphicsElement.getBold()?"bold":"normal";
  this.svgTextElement.style.fontStyle = this.graphicsElement.getItalics()?"italic":"normal";
  
  this.svgTextElement.style.opacity = this.graphicsElement.getOpacity();

  switch(this.graphicsElement.getHorizontalAnchor()) {

    case jsgl.HorizontalAnchor.LEFT:

      this.svgTextElement.style.setProperty('text-anchor', 'start', null);
      break;
    
    case jsgl.HorizontalAnchor.CENTER:

      this.svgTextElement.style.setProperty('text-anchor', 'middle', null);
      break;
    
    case jsgl.HorizontalAnchor.RIGHT:
    
      this.svgTextElement.style.setProperty('text-anchor', 'end', null);
      break;
  }

  this.svgTextElement.setAttribute('x', this.graphicsElement.getX());

  /*
   * As of November 2011, there is a lack of support of CSS dominant-baseline
   * style property -- hence SVG dx and dy properties are used.
   */     
  switch(this.graphicsElement.getVerticalAnchor()) {
  
    case jsgl.VerticalAnchor.TOP:
      
      this.svgTextElement.setAttribute('dy', '1em', null);
      break;
    
    case jsgl.VerticalAnchor.MIDDLE:
    
      this.svgTextElement.setAttribute('dy', '0.6ex', null);
      break;
    
    case jsgl.VerticalAnchor.BOTTOM:
    
      this.svgTextElement.setAttribute('dy', '0em', null);
      break;
  }
  
  this.svgTextElement.setAttribute('y', this.graphicsElement.getY());

}     



      ;/**
 * @fileOverview <code>jsgl.elements.NonSvgLabelDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */
 
/**
 * @class Non-SVG, HTML-based DOM presenter for JSGL label element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.NonSvgLabelDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating HTML elements.
 * @since version 2.0
 */
jsgl.elements.NonSvgLabelDomPresenter=function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);

  /**
   * The HTML <code>&lt;nobr&gt;</code> element that is used for rendering.
   * @type HTMLNobrElement
   * @private
   */      
  this.spanElement=ownerDocument.createElement("nobr");

  /**
   * The child text node of the HTML <code>&lt;nobr&gt;</code> element.
   * @type HTMLTextNode
   * @private
   */           
  this.spanTextNode=ownerDocument.createTextNode("");

  this.spanElement.appendChild(this.spanTextNode);
  this.spanElement.style.position="absolute";

  this.attachMouseHandlers(this.spanElement);
}
jsgl.elements.NonSvgLabelDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the HTML <code>&lt;nobr&gt;</code> element that is used
 * to render the label.
 * @methodOf jsgl.elements.NonSvgLabelDomPresenter#
 * @returns HTMLNobrElement
 * @since version 2.0
 */     
jsgl.elements.NonSvgLabelDomPresenter.prototype.getXmlElement = function() {

  return this.spanElement;
}

/**
 * @description Updates the contents and CSS properties of the <code>&lt;nobr&gt;</code>
 * HTML element according to the state of the associated JSGL label element.
 * @methodOf jsgl.elements.NonSvgLabelDomPresenter#
 * @since version 2.0
 */  
jsgl.elements.NonSvgLabelDomPresenter.prototype.update=function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  this.spanTextNode.nodeValue=this.graphicsElement.getText();
  this.spanElement.style.fontFamily=this.graphicsElement.getFontFamily();
  this.spanElement.style.color=this.graphicsElement.getFontColor();
  
  var underlined=this.graphicsElement.getUnderlined(),
      overlined=this.graphicsElement.getOverlined(),
      struckThrough=this.graphicsElement.getStruckThrough(),
      decorationString="";

  if(underlined) decorationString="underline";

  if(overlined) {

    if(decorationString) {

      decorationString += " overline";
    }
    else {

      decorationString = "overline";
    }
  }

  if(struckThrough) {
    if(decorationString) {

      decorationString+=" line-through";
    }
    else {

      decorationString="line-through";
    }
  }
  
  this.spanElement.style.fontSize = this.graphicsElement.getFontSize()+"px";
  this.spanElement.style.textDecoration = decorationString;
  this.spanElement.style.fontWeight = this.graphicsElement.getBold()?"bold":"normal";
  this.spanElement.style.fontStyle = this.graphicsElement.getItalics()?"italic":"normal";
  
  if(jsgl.util.BrowserInfo.isMSIElte7) {
    if(this.graphicsElement.getOpacity() != 1) {
      this.spanElement.style.filter = 'alpha(opacity=' +
        Math.round(100*this.graphicsElement.getOpacity()) + ')';
    }
    else {
      this.spanElement.style.filter = '';
    }
  }
  else {
    this.spanElement.style.opacity = this.graphicsElement.getOpacity();
  }

  /*
   * After all the properties affecting size of the label (text, font size etc.)
   * are set, compute the X and Y offset according to vertical and horizontal
   * anchors using clientWidth and clientHeight.
   */

  switch(this.graphicsElement.getHorizontalAnchor()) {

    case jsgl.HorizontalAnchor.LEFT:

      this.spanElement.style.left=this.graphicsElement.getX() + "px";
      break;

    case jsgl.HorizontalAnchor.RIGHT:

      this.spanElement.style.left=(this.graphicsElement.getX() - this.spanElement.clientWidth) + "px";
      break;

    case jsgl.HorizontalAnchor.CENTER:
      this.spanElement.style.left=(this.graphicsElement.getX() - this.spanElement.clientWidth / 2) + "px";
      break;
  }
  
  switch(this.graphicsElement.getVerticalAnchor()) {

    case jsgl.VerticalAnchor.TOP:

      this.spanElement.style.top=this.graphicsElement.getY() + "px";
      break;

    case jsgl.VerticalAnchor.BOTTOM:

      this.spanElement.style.top=(this.graphicsElement.getY() - this.spanElement.clientHeight) + "px";
      break;

    case jsgl.VerticalAnchor.MIDDLE:

      this.spanElement.style.top=(this.graphicsElement.getY() - this.spanElement.clientHeight / 2) + "px";
      break;
  }
};/**
 * @fileOverview Declaration and implementation of
 * <code>jsgl.elements.AbstractPolygonalElement</code>.
 * @author Tomas Rehorek
 * @since version 1.0   
 */

/**
 * @class Base class for polygonal JSGL elements (polygon, polyline).
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Base constructor for polygonal API elements.
 * @since version 1.0
 * @version 2.0
 */     
jsgl.elements.AbstractPolygonalElement=function(panel, zIndex) {

  jsgl.elements.AbstractElement.call(this, panel, zIndex);

  /**
   * The internal list of element's vertices.
   * @type jsgl.util.ArrayList
   * @private
   */             
  this.points=new jsgl.util.ArrayList();
}
jsgl.elements.AbstractPolygonalElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Appends a point to the list of element's vertices. The point
 * is specified as <code>jsgl.Vector2D</code> object. 
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {jsgl.Vector2D} The point to be appended.
 * @since version 1.0
 */   
jsgl.elements.AbstractPolygonalElement.prototype.addPoint=function(point) {

  this.addPointXY(point.X, point.Y);
}

/**
 * @description Appends a point to the list of element's vertices. The point
 * is specified as a couple of coordinates.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {number} A real number for the X-coordinate of the new vertex.
 * @param {number} A real number for the Y-coordinate of the new vertex.
 * @since version 1.0
 */  
jsgl.elements.AbstractPolygonalElement.prototype.addPointXY=function(x,y) {

  this.points.add(new jsgl.Vector2D(x,y));
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Clears the list of element's vertices. This serves as a reset
 * function if entirely new list of vertices is to be built.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @since version 1.0  
 */  
jsgl.elements.AbstractPolygonalElement.prototype.clearPoints=function() {

  this.points.clear();
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets a point from the list of element's vertices at specified
 * index.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {number} index Index of the point in the list.
 * @returns jsgl.Vector2D
 * @since version 1.0
 */      
jsgl.elements.AbstractPolygonalElement.prototype.getPointAt=function(index) {

  return jsgl.cloneObject(this.points.get(index));
}

/**
 * @description Updates the coordinates of a point in the list of element's vertices
 * at the specified index to new values. The coordinates are given as a couple
 * of real numbers. Note that the vertex must already be present in the list at
 * given position.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {number} x The new X-coordinate of the vertex to be updated.
 * @param {number} y The new Y-coordinate of the vertex to be updated.
 * @param {number} index Index of the point to be updated.
 * @since version 1.0
 */
jsgl.elements.AbstractPolygonalElement.prototype.setPointXYAt=function(x,y,index) {

  var point = this.points.get(index);
  point.X=x;
  point.Y=y;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Updates the coordiates of a point in the list of element's vertices
 * at the specified index to new values. The coordinates are specified as
 * <code>jsgl.Vector2D</code> object. Note that the vertex must already be
 * present in the list at given position.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {jsgl.Vector2D} point The new coordinates object.
 * @param {index} index Index of the point to be updated.
 * @since version 1.0
 */   
jsgl.elements.AbstractPolygonalElement.prototype.setPointAt=function(point,index) {

  this.setPointXYAt(point.X,point.Y,index);
}

/**
 * @description Gets the current number of the element's vertices.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @returns number
 * @since version 1.0
 */   
jsgl.elements.AbstractPolygonalElement.prototype.getPointsCount=function() {

  return this.points.getCount();
}

/**
 * @description Inserts a new point to the list of element's vertices at the
 * specified index. All the points starting at the index up to the end of the
 * list are shifted right. The new point is specified as a <code>jsgl.Vector2D</code>
 * object.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {jsgl.Vector2D} point The point to be inserted.
 * @since version 1.0
 */  
jsgl.elements.AbstractPolygonalElement.prototype.insertPointAt=function(point,index) {

  this.insertPointXYAt(point.X,point.Y,index);
}

/**
 * @description Inserts a new point to the list of element's vertices at the
 * specified index. All the points starting at the index up to the end of the
 * list are shifted right. The new point is specified as a couple of
 * real-valued coordinates.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {number} x The X-coordinate of the point to be inserted.
 * @param {number} y The Y-coordinate of the point to be inserted.
 * @since version 1.0
 */   
jsgl.elements.AbstractPolygonalElement.prototype.insertPointXYAt=function(x,y,index) {

  this.points.insertAt(new jsgl.Vector2D(x,y),index);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Removes a point from the list of element's vertices at the
 * specified index. The rest of the list is shifted left after the point is
 * removed.
 * @methodOf jsgl.elements.AbstractPolygonalElement#
 * @param {number} index Index of the point to be removed.
 * @since version 1.0
 */
jsgl.elements.AbstractPolygonalElement.prototype.removePointAt=function(index) {

  this.points.removeAt(index);
  this.onChangeRaiser.raiseEvent();
};/**
 * @fileOverview Declaration and implementation of JSGL API
 * <code>jsgl.elements.PolygonElement</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Polygon element API class.
 * @extends jsgl.elements.AbstractPolygonalElement
 * @constructor
 * @description Creates new <code>jsgl.elements.PolygonElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter An
 * appropriate DOM presenter for rendering the polygon on the user's browser.   
 * @since version 1.0
 * @version 2.0  
 */
jsgl.elements.PolygonElement=function(domPresenter,panel,stroke,fill,zIndex) {

  jsgl.elements.AbstractPolygonalElement.call(this, panel, zIndex);

  /**
   * The function listening to changes in associated stroke object.
   * @type function
   * @private      
   */     
  this.strokeChangeListener=jsgl.util.delegate(
    this.onChangeRaiser,this.onChangeRaiser.raiseEvent);  

  /**
   * The function listening to the changes is associated fill object.
   * @type function
   * @private         
   */  
  this.fillChangeListener=jsgl.util.delegate(
    this.onChangeRaiser,this.onChangeRaiser.raiseEvent);

  /**
   * The stroke object specifying style of circle's outline.
   * @type jsgl.stroke.AbstractStroke
   * @private
   */           
  this.stroke = null;  
  this.setStroke(stroke || new jsgl.stroke.SolidStroke());

  /**
   * The fill object specifying style of circle's interior.
   * @type jsgl.fill.AbstractFill
   * @private
   */           
  this.fill = null;
  this.setFill(fill || new jsgl.fill.SolidFill());

  /**
   * The DOM presenter that is used for rendering the polygon.
   * @type jsgl.elements.AbstractPolygonDomPresenter
   * @private
   */              
  this.domPresenter=domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.PolygonElement.jsglExtend(jsgl.elements.AbstractPolygonalElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the polygon on the user's browser.
 * @methodOf jsgl.elements.PolygonElement#
 * @returns {jsgl.elements.AbstractPolygonDomPresenter}
 * @since version 1.0
 */     
jsgl.elements.PolygonElement.prototype.getDomPresenter=function() {

  return this.domPresenter;
}

/**
 * @description Gets the stroke object currently used for styling the outline
 * of the polygon.
 * @methodOf jsgl.elements.PolygonElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 1.0
 */    
jsgl.elements.PolygonElement.prototype.getStroke=function() {

  return this.stroke;
}

/**
 * @description Sets the new stroke object for styling the outline of the
 * polygon. The polygon element will be listening to changes in the stroke
 * object and repaint itself automatically whenever a change takes place.
 * @methodOf jsgl.elements.PolygonElement#
 * @param {jsgl.stroke.AbstractStroke} The new stroke object to be associated
 * with the polygon.
 * @since version 1.0
 */       
jsgl.elements.PolygonElement.prototype.setStroke=function(stroke) {

  if(this.stroke) {

    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }
  
  this.stroke=stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the fill object currently used for styling the interior
 * of the polygon.
 * @methodOf jsgl.elements.PolygonElement
 * @returns {jsgl.fill.AbstractFill}
 * @since version 1.0
 */      
jsgl.elements.PolygonElement.prototype.getFill=function() {

  return this.fill;
}

/**
 * @description Sets the new fill object for styling the interior of the
 * polygon. The polygon element will be listening to changes in the fill object
 * and repaint itself automatically whenever a change takes place.
 * @methodOf jsgl.elements.PolygonElement#
 * @param {jsgl.fill.AbstractFill} The new fill object to be associated with
 * the polygon.
 * @since version 1.0
 */       
jsgl.elements.PolygonElement.prototype.setFill=function(fill) {
  
  if(this.fill) {
  
    this.fill.unregisterChangeListener(this.fillChangeListener);
  }
  
  this.fill=fill;
  this.fill.registerChangeListener(this.fillChangeListener);
  this.onChangeRaiser.raiseEvent();
}
;/**
 * @fileOverview <code>jsgl.elements.SvgPolygonDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @constructor
 * @version 2.0 
 */ 
jsgl.elements.SvgPolygonDomPresenter=function(ownerDocument) {

  this.svgPolygonElement=ownerDocument.createElementNS("http://www.w3.org/2000/svg","polygon");
  
  this.attachMouseHandlers(this.svgPolygonElement);
}
jsgl.elements.SvgPolygonDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

jsgl.elements.SvgPolygonDomPresenter.prototype.getXmlElement=function() {
  
  return this.svgPolygonElement;
}

jsgl.elements.SvgPolygonDomPresenter.prototype.update=function()
{
  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var pointsCount=this.graphicsElement.getPointsCount();
  
  if(pointsCount < 2) {
  
    this.svgPolygonElement.setAttribute("points","");
    return;
  }

  var pointsString=(this.graphicsElement.getPointAt(0).X)+
    ","+(this.graphicsElement.getPointAt(0).Y);
  
  for(var i=1; i<pointsCount; i++)
  {
    pointsString+=" "+(this.graphicsElement.getPointAt(i).X)+
      ","+(this.graphicsElement.getPointAt(i).Y);
  }
  
  this.svgPolygonElement.setAttribute("points", pointsString);

  this.graphicsElement.getStroke().applyToSvgElement(this.svgPolygonElement);
  this.graphicsElement.getFill().applyToSvgElement(this.svgPolygonElement);
};/**
 * @fileOverview Implementation of <code>jsgl.elements.VmlPolygonDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */   

/**
 * @class Vector Markup Language DOM presenter for the JSGL polygon element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlPolygonDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML element.
 * @since version 1.0
 * @version 2.0
 */    
jsgl.elements.VmlPolygonDomPresenter = function(ownerDocument) {

  /**
   * The VML <code>&lt;shape&gt;</code> element to be used for rendering the
   * polyline. Note that general <code>&lt;shape&gt;</code> element is used
   * instead of VML <code>&lt;polygon&gt;</code> because of several bugs in
   * MSIE's implementation of the VML DOM interface.
   * @type VmlShapeElement
   * @private
   */            
  this.vmlElement = ownerDocument.createElement("vml:shape");
  this.vmlElement.style.position = "absolute";

  /**
   * The VML <code>&lt;stroke&gt;</code> subelement used to define the outline
   * of the polygon.
   * @type VmlStrokeElement
   * @private
   */               
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");
  this.vmlElement.appendChild(this.vmlStrokeElement);

  /**
   * The VML <code>&lt;fill&gt;</code> subelement used to define the interior
   * of the polygon.
   * @type VmlFillElement
   * @private
   */            
  this.vmlFillElement = ownerDocument.createElement("vml:fill");
  this.vmlElement.appendChild(this.vmlFillElement);
  
  this.attachMouseHandlers(this.vmlElement);
}
jsgl.elements.VmlPolygonDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the root VML <code>&lt;shape&gt;</code> element that is
 * used for rendering the polygon.
 * @methodOf jsgl.elements.VmlPolygonDomPresenter
 * @returns {VmlShapeElement}
 * @since version 1.0
 */
jsgl.elements.VmlPolygonDomPresenter.prototype.getXmlElement = function() {

  return this.vmlElement;
}

/**
 * @description Gets the VML <code>&lt;stroke&lt;</code> element that is used
 * for defining the style of polygon's outline.
 * @methodOf jsgl.elements.VmlPolygonDomPresenter#
 * @returns {VmlStrokeElement}
 * @since version 1.0
 */
jsgl.elements.VmlPolygonDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Gets the VML <code>&lt;fill&gt;</code> element that is used
 * for defining the style of polygon's interior.
 * @methodOf jsgl.elements.VmlPolygonDomPresenter#
 * @returns {VmlFillElement}
 * @since version 1.0
 */ 
jsgl.elements.VmlPolygonDomPresenter.prototype.getFillElement = function() {

  return this.vmlFillElement;
}

/**
 * @description Updates the contents of rendering VML in accordance with the
 * state of the API polygon element associated.
 * @methodOf jsgl.elements.VmlPolygonDomPresenter#
 * @since version 1.0
 */    
jsgl.elements.VmlPolygonDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var pointsCount=this.graphicsElement.getPointsCount();

  if(pointsCount < 2) {

    this.vmlElement.path = "";
    this.vmlElement.style.width = this.vmlElement.style.height = "0px";
    return;
  }

  var currentPoint = this.graphicsElement.getPointAt(0);

  var left = currentPoint.X,
      right = currentPoint.X,
      top = currentPoint.Y,
      bottom = currentPoint.Y,
      pathString="M"+currentPoint.X.jsglVmlize()+" "+currentPoint.Y.jsglVmlize();
  
  for(var i=0; i<pointsCount; i++) {

    currentPoint = this.graphicsElement.getPointAt(i);
    
    if(left > currentPoint.X) {

      left = currentPoint.X;
    }
    
    if(right < currentPoint.X) {

      right = currentPoint.X;
    }
    
    if(top > currentPoint.Y) {

      top = currentPoint.Y;
    }
    
    if(bottom < currentPoint.Y) {

      bottom = currentPoint.Y;
    }

    pathString += "l"+currentPoint.X.jsglVmlize()+" "+currentPoint.Y.jsglVmlize();
  }

  pathString += "xe";
  
  this.vmlElement.coordsize = (right-left).jsglVmlize()+" "+(bottom-top).jsglVmlize();
  this.vmlElement.setAttribute("path", pathString);
  this.vmlElement.style.width = (right-left)+"px";
  this.vmlElement.style.height = (bottom-top)+"px";

  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
  this.graphicsElement.getFill().applyToVmlFillElement(this.vmlFillElement);

  //this.vmlElement.parentNode.replaceChild(this.vmlElement,this.vmlElement);
};/**
 * @fileOverview Declaration and implementation of JSGL API
 * <code>jsgl.elements.PolylineElement</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */    

/**
 * @class Polyline element API class.
 * @extends jsgl.elements.AbstractPolygonalElement
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.PolylineElement</code>.
 * @param {jsgl.elements.AbstractDomPresenter} domPresenter An
 * appropriate DOM presenter to be used for rendering the polyline on the user's
 * browser.   
 * @since version 1.0
 * @version 2.0 
 */     
jsgl.elements.PolylineElement=function(domPresenter,panel,stroke,zIndex) {

  jsgl.elements.AbstractPolygonalElement.call(this,panel,zIndex);

  /**
   * The function listening to changes in associated stroke object.
   * @type function
   * @private
   */           
  this.strokeChangeListener=jsgl.util.delegate(
    this.onChangeRaiser,this.onChangeRaiser.raiseEvent);

  /**
   * The stroke object specifying the style of the polyline. Note that because
   * there is no fill object for the polyline, the stroke object completely
   * defines its appearance.     
   * @type jsgl.stroke.AbstractStroke
   * @private
   */           
  this.stroke = null;
  this.setStroke(stroke || new jsgl.stroke.SolidStroke());

  /**
   * The DOM presenter that is used for rendering the polyline on the user's
   * browser.
   * @type jsgl.elements.AbstractPolylineDomPresenter
   * @private
   */            
  this.domPresenter=domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.PolylineElement.jsglExtend(jsgl.elements.AbstractPolygonalElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the polyline on the user's browser.
 * @methodOf jsgl.elements.PolylineElement#
 * @returns {jsgl.elements.AbstractPolylineDomPresenter}
 * @since version 1.0
 */     
jsgl.elements.PolylineElement.prototype.getDomPresenter=function() {

  return this.domPresenter;
}

/**
 * @description Gets the stroke object specifying style of the polyline.
 * @methodOf jsgl.elements.PolylineElement#
 * @returns {jsgl.stroke.AbstractStroke}
 * @since version 1.0
 */    
jsgl.elements.PolylineElement.prototype.getStroke=function() {

  return this.stroke;
}

/**
 * @description Sets the stroke object specifying style of the polyline. Note
 * that this object fully defines the style of the polyline. The polyline
 * element will be listening to changes in the stroke and repaint itself
 * automatically whenever a change takes place.
 * @methodOf jsgl.elements.PolylineElement#
 * @param {jsgl.stroke.AbstractStroke} The stroke object to be associated with
 * the polyline.
 * @since version 1.0
 */    
jsgl.elements.PolylineElement.prototype.setStroke=function(stroke) {

  if(this.stroke) {
  
    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }

  this.stroke=stroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);
  this.onChangeRaiser.raiseEvent();
}
;/**
 * @fileOverview <code>jsgl.elements.SvgPolylineDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Scalable Vector Graphics DOM presenter for JSGL polyline element.
 * @extends jsgl.elements.AbstractDomPresenter   
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.SvgPolylineDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating SVG elements. 
 * @version 2.0 
 */    
jsgl.elements.SvgPolylineDomPresenter=function(ownerDocument) {

  /**
   * The SVG <code>&lt;polyline&gt;</code> element.
   * @type SVGPolylineElement
   * @private
   */         
  this.svgPolylineElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg","polyline");
  this.svgPolylineElement.style.setProperty("fill","none",null);

  this.attachMouseHandlers(this.svgPolylineElement);
}
jsgl.elements.SvgPolylineDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;polyline&gt;</code> element that is used
 * for rendering. 
 * @methodOf jsgl.elements.SvgPolylineDomPresenter#
 * @returns {SVGPolylineElement} 
 * @since version 1.0
 * @version 2.0
 */
jsgl.elements.SvgPolylineDomPresenter.prototype.getXmlElement = function() {

  return this.svgPolylineElement;
}

/**
 * @description Updates the rendering SVG according to the state of the API
 * polyline element associated. 
 * @methodOf jsgl.elements.SvgPolylineDomPresenter# 
 * @since version 1.0
 * @version 2.0  
 */ 
jsgl.elements.SvgPolylineDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var pointsCount=this.graphicsElement.getPointsCount();
  
  if(pointsCount == 0) {
    this.svgPolylineElement.setAttribute("points","");
    return;
  }
  
  var pointsString=(this.graphicsElement.getPointAt(0).X)+
    ","+(this.graphicsElement.getPointAt(0).Y);
  
  for(var i=1; i<pointsCount; i++)
  {
    pointsString+=" "+(this.graphicsElement.getPointAt(i).X)+
      ","+(this.graphicsElement.getPointAt(i).Y);
  }
  
  this.svgPolylineElement.setAttribute("points", pointsString);

  this.graphicsElement.getStroke().applyToSvgElement(this.svgPolylineElement);
};/**
 * @fileOverview Implementation of <code>jsgl.elements.VmlPolylineDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 1.0
 */

/**
 * @class Vector Markup Language DOM presenter for the JSGL polyline element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.VmlPolylineDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML elements.
 * @since version 1.0
 * @version 2.0 
 */   
jsgl.elements.VmlPolylineDomPresenter=function(ownerDocument) {

  /**
   * The VML <code>&lt;shape&gt;</code> element to be used for rendering the polyline.
   * Note that general <code>&lt;shape&gt;</code> element is used instead of
   * VML <code>&lt;polygon&gt;</code> due to several bugs in MSIE's implementation
   * of VML DOM interface.   
   * @type VmlShapeElement
   * @private
   */
  this.vmlElement = ownerDocument.createElement("vml:shape");
  this.vmlElement.style.position = "absolute";
  
  /**
   * The VML <code>&lt;stroke&gt;</code> subelement used to define the style
   * of the polyline.      
   * @type VmlStrokeElement
   * @private
   */            
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");
  this.vmlElement.appendChild(this.vmlStrokeElement);
  
  this.vmlElement.filled = "no";

  this.attachMouseHandlers(this.vmlElement);
}
jsgl.elements.VmlPolylineDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the root VML <code>&lt;shape&gt;</code> element that is
 * used for rendering the polyline.
 * @methodOf jsgl.elements.VmlPolylineDomPresenter
 * @returns {VmlShapeElement}
 * @since version 1.0
 */   
jsgl.elements.VmlPolylineDomPresenter.prototype.getXmlElement = function() {

  return this.vmlElement;
}

/**
 * @description Gets the VML <code>&lt;stroke&lt;</code> element that is used
 * for defining polyline's style.
 * @methodOf jsgl.elements.VmlPolylineDomPresenter
 * @returns {VmlStrokeElement}
 * @since version 1.0
 */
jsgl.elements.VmlPolylineDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Updates the contents of the rendering VML according to the
 * state of the API polyline object associated.
 * @methodOf jsgl.elements.VmlPolylineDomPresenter
 * @since version 1.0 
 */    
jsgl.elements.VmlPolylineDomPresenter.prototype.update=function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);

  var pointsCount = this.graphicsElement.getPointsCount();

  if(pointsCount < 2) {

    this.vmlElement.path = "";
    this.vmlElement.style.width = this.vmlElement.style.height = "0px";
    return;
  }

  var currentPoint = this.graphicsElement.getPointAt(0);

  var left = currentPoint.X,
      right = currentPoint.X,
      top = currentPoint.Y,
      bottom = currentPoint.Y,
      pathString = "m"+Math.round(currentPoint.X)+" "+Math.round(currentPoint.Y);
  
  for(var i=0; i<pointsCount; i++) {
    currentPoint = this.graphicsElement.getPointAt(i);
    
    if(left > currentPoint.X) {

      left = currentPoint.X;
    }

    if(right < currentPoint.X) {

      right = currentPoint.X;
    }
    
    if(top > currentPoint.Y) {

      top = currentPoint.Y;
    }
    
    if(bottom < currentPoint.Y) {

      bottom = currentPoint.Y;
    }

    pathString += "l"+Math.round(currentPoint.X)+","+Math.round(currentPoint.Y);
  }

  pathString += "e";

  this.vmlElement.setAttribute("path", pathString);
  this.vmlElement.coordsize = (right-left)*100+" "+(bottom-top)*100;
  this.vmlElement.style.width = (right-left)*100+"px";
  this.vmlElement.style.height = (bottom-top)*100+"px";

  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
};/**
 * @fileOverview Declaration and implementation of JSGL API
 * <code>jsgl.elements.ImageElement</code>.
 * @author Tomas Rehorek
 * @since version 2.0   
 */
 
/**
 * @class Image element API class.
 * @extends jsgl.elements.AbstractElement
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.ImageElement</code>.
 * @param {jsgl.elements.AbstractImageDomPresenter} domPresenter Appropriate DOM
 * presenter for rendering the image on the user's browser.
 * @param {jsgl.Panel} panel The factory <code>jsgl.Panel</code> object that
 * is creating the image. Note that no other object than <code>jsgl.Panel</code>
 * should call this constructor.
 * @since version 2.0
 */    
jsgl.elements.ImageElement=function(domPresenter,panel) {

  jsgl.elements.AbstractElement.call(this,panel);
  
  /**
   * Location of the anchor point of the image
   * @type jsgl.Vector2D
   * @private
   */           
  this.location=new jsgl.Vector2D();
  
  /**
   * Size vector of the image. The X-coordinate of the vector represent width,
   * while the Y-coordinate represents height. Note that the image of this
   * proportions may be further rotated.
   * @type jsgl.Vector2D
   * @private
   */
  this.size=new jsgl.Vector2D();
  
  /**
   * Horizontal anchor of the image. It specifies the X-component of the anchor
   * to which image location is related and around which the image rotates.
   * @type jsgl.HorizontalAnchor
   * @private
   */
  this.horizontalAnchor = jsgl.HorizontalAnchor.LEFT;           
  
  /**
   * Vertical anchor of the image. It specifies Y-component of the anchor to
   * which image location is related and around which the image rotates.
   * @type jsgl.VerticalAnchor
   * @private
   */               
  this.verticalAnchor = jsgl.VerticalAnchor.TOP;
  
  /**
   * Determines whether the X-coordinate of the image is autosized.
   * @type boolean
   * @private
   */           
  this.autosizeX = true;
  
  /**
   * Determines whether the Y-coordinate of the image is autosized.
   * @type boolean
   * @private
   */
  this.autosizeY = true;           
  
  /**
   * Clockwise rotation in degrees of the image around its anchor point.
   * @type number
   * @private
   */      
  this.rotation = 0;
  
  /**
   * Opacity of the image. This is a real number from interval [0,1]. 0.0 means
   * fully transparent, 1.0 means fully opaque.
   * @type number
   * @private      
   */
  this.opacity = 1.0;
  
  /**
   * URL of the image.
   * @type string
   * @private
   */
  this.url = "";

  /**
   * Stroke object specifying style of optional outline of the image.
   * @type jsgl.elements.AbstractStroke
   * @private
   */
  this.stroke = null;
  this.setStroke(new jsgl.stroke.SolidStroke());
  this.stroke.setEnabled(false);

  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */             
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);

  /**
   * The DOM presenter that is used for rendering the image.
   * @type jsgl.elements.AbstractImageDomPresenter
   * @private
   */
  this.domPresenter=domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.ImageElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that is used for rendering
 * the image.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {jsgl.elements.AbstractImageDomPresenter}
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Gets the current X-coordinate of the image's anchor point.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {number}
 * @since version 2.0
 */    
jsgl.elements.ImageElement.prototype.getX = function() {

  return this.location.X;
}

/**
 * @description Sets the X-coordinate of the image's anchor point.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} newX Real number representing the new X-coordinate of
 * the image's anchor point.
 * @since version 2.0
 */
jsgl.elements.ImageElement.prototype.setX = function(newX) {

  this.location.X = newX;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current Y-coordinate of the image's anchor point.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {number}
 * @since version 2.0
 */    
jsgl.elements.ImageElement.prototype.getY = function() {

  return this.location.Y;
}

/**
 * @description Sets the Y-coordinate of the image's anchor point.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} newY Real number representing the new Y-coordinate of
 * the image's anchor point.
 * @since version 2.0
 */   
jsgl.elements.ImageElement.prototype.setY = function(newY) {

  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current location of the image's anchor point.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */    
jsgl.elements.ImageElement.prototype.getLocation = function() {

  return jsgl.cloneObject(this.location);
}

/**
 * @description Sets the coordinates of the image's anchor point using a
 * <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.elements.ImageElement#
 * @param {jsgl.Vector2D} newLocation The new coordinates of the anchor point.
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.setLocation = function(newLocation) {

  this.setlLcationXY(newLocation.X, newLocation.Y);
}

/**
 * @description Sets the location of the image's anchor point using couple
 * of real-valued coordinates. 
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} newX Real number representing the new X-coordinate of the
 * anchor point.
 * @param {number} newY Real number representing the new Y-coordinate of the
 * anchor point.
 * @since version 2.0
 */   
jsgl.elements.ImageElement.prototype.setLocationXY = function(newX, newY) {

  this.location.X=newX;
  this.location.Y=newY;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current width of the image. If the width has previously
 * been set manually, then the manually set width is returned. If the width hasn't
 * been set manually, two cases may happen: 1) The image has already been loaded
 * and its physical width is returned; 2) The image has not been loaded yet and
 * zero is returned.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {number}
 * @since version 2.0
 */         
jsgl.elements.ImageElement.prototype.getWidth = function() {

  return this.autosizeX ? this.domPresenter.getImageSize().X : this.size.X;
}

/**
 * @description Sets the width of the image. This overrides the physical width
 * of the image that is detected automatically after the image is loaded.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} newWidth Real number representing the new width of the image.
 * @since version 2.0
 */  
jsgl.elements.ImageElement.prototype.setWidth = function(newWidth) {

  this.autosizeX = false;
  this.size.X=newWidth;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current height of the image. If the height has previously
 * been set manually, then the manually set height is returned. If the height hasn't
 * been set manually, two cases may happen: 1) The image has already been loaded
 * and its physical height is returned; 2) The image has not been loaded yet and
 * zero is returned.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {number}
 * @since version 2.0
 */       
jsgl.elements.ImageElement.prototype.getHeight = function() {

  return this.autosizeY ? this.domPresenter.getImageSize().Y : this.size.Y;
}

/**
 * @description Sets the height of the image. This overrides the physical height
 * of the image that is detected automatically after the image is loaded.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} newHeight Real number representing the new height of the image.
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.setHeight = function(newHeight) {

  this.autosizeY = false;
  this.size.Y=newHeight;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current size of the image as <code>jsgl.Vector2D</code>.
 * The X-coordinate of the vector represents the currently used width of the
 * image, whilst the Y-coordinate means the currently used height.  
 * @methodOf jsgl.elements.ImageElement#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */   
jsgl.elements.ImageElement.prototype.getSize = function() {

  return new jsgl.Vector2D(
    this.autosizeX ? this.domPresenter.getImageSize().X : this.size.X,
    this.autosizeY ? this.domPresenter.getImageSize().Y : this.size.Y);
}

/**
 * @description Sets the size of the image using <code>jsgl.Vector2D</code>
 * object. This overrides the physical dimensions of the image that are detected
 * automatically after the image is loaded.
 * @methodOf jsgl.elements.ImageElement#
 * @param {jsgl.Vector2D} newSize The new size vector for the image.
 * @since version 2.0
 */ 
jsgl.elements.ImageElement.prototype.setSize = function(newSize) {

  this.setSizeWH(newSize.X,newSize.Y);
}

/**
 * @description Sets the size (Width and Height) of the image using couple of
 * real numbers. This overrides the physical dimensions of the image that are
 * detected automatically after the image is loaded.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} newW Real number representing the new width of the image.
 * @param {number} newH Real number representing the new height of the image.
 * @since version 2.0
 */      
jsgl.elements.ImageElement.prototype.setSizeWH = function(newW,newH) {

  this.autosizeX = false;
  this.autosizeY = false;
  
  this.size.X=newW;
  this.size.Y=newH;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current opacity of the image.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {number}
 * @since version 2.0
 */    
jsgl.elements.ImageElement.prototype.getOpacity = function() {

  return this.opacity;
}

/**
 * @description Sets the new opacity of the image.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} opacity The new opacity. This is a real number from interval
 * [0,1]. 0.0 means fully transparent, 1.0 means fully opaque.
 * @since version 2.0
 */  
jsgl.elements.ImageElement.prototype.setOpacity = function(opacity) {

  this.opacity = opacity;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current clockwise rotation of the image around its
 * anchor point in degrees.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {number}
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.getRotation = function() {

  return this.rotation;
}

/**
 * @description Sets the clockwise rotation of the image around its anchor
 * point in degrees.
 * @methodOf jsgl.elements.ImageElement#
 * @param {number} rotation Real number representing the new rotation in degrees.
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.setRotation = function(rotation) {

  this.rotation = rotation;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current horizontal anchor of the image.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {jsgl.HorizontalAnchor}
 * @since version 2.0
 */    
jsgl.elements.ImageElement.prototype.getHorizontalAnchor = function() {

  return this.horizontalAnchor;
}

/**
 * @description Sets the horizontal anchor of the image. This influences how
 * the image is horizontally positioned with respect to its anchor point. This
 * also affects how the image is rotated around the anchor point.
 * @methodOf jsgl.elements.ImageElement#
 * @param {jsgl.HorizontalAnchor} horAnchor The new horizontal anchor for the image.
 * @since version 2.0
 */  
jsgl.elements.ImageElement.prototype.setHorizontalAnchor = function(horAnchor) {

  this.horizontalAnchor = horAnchor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current vertical anchor of the image.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {jsgl.VerticalAnchor}
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.getVerticalAnchor = function() {

  return this.verticalAnchor;
}

/**
 * @description Sets the vertical anchor of the image. This influences how
 * the image is vertically positioned with respect to its anchor point. This
 * also affects how the image is rotated around the anchor point.
 * @methodOf jsgl.elements.ImageElement# 
 * @param {jsgl.VerticalAnchor} vertAnchor The new vertical anchor for the image.
 * @since version 2.0
 */ 
jsgl.elements.ImageElement.prototype.setVerticalAnchor = function(vertAnchor) {

  this.verticalAnchor = vertAnchor;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the current URL of the image.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {string}
 * @since version 2.0
 */    
jsgl.elements.ImageElement.prototype.getUrl=function() {
  
  return this.url;
}

/**
 * @description Sets the new URL of the image to be loaded.
 * @methodOf jsgl.elements.ImageElement#
 * @param {string} url The new URL of the image.
 * @since version 2.0
 */     
jsgl.elements.ImageElement.prototype.setUrl = function(url) {

  this.url = url;
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the stroke object that is currently used for painting an
 * outline of the image. By default, the stroke is disabled, i.e. there is no
 * outline painted. To enable outline painting, use
 * <code>myImage.getStroke().setEnabled(true)</code>.
 * @methodOf jsgl.elements.ImageElement#
 * @returns {jsgl.stroke.AbstractStroke} The stroke object currently used by the
 * image.
 * @since version 2.0
 */
jsgl.elements.ImageElement.prototype.getStroke = function() {

  return this.stroke;
}

/**
 * @description Sets the new stroke object to be used for painting outline of the
 * image. The image element will be listening to changes in the stroke object
 * and will repaint itself automatically whenever the stroke stroke changes. 
 * @methodOf jsgl.elements.ImageElement#
 * @param {jsgl.stroke.AbstractStroke} newStroke The new stroke object to be
 * used for painting outline of the image.
 * @since version 2.0
 */
jsgl.elements.ImageElement.prototype.setStroke = function(newStroke) {

  this.stroke = newStroke;
  this.onChangeRaiser.raiseEvent();
}  ;/**
 * @fileOverview Declaration and implementation of
 * <code>jsgl.elements.AbstractImageDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 2.0
 */    

/**
 * @class Base class for DOM presenters of JSGL image element. It contains
 * common methods for preloading images. In order for the image to be rendered
 * properly, its proportions must be known. Hence the image cannot be rendered
 * until it's preloaded. That is why this base class is important for both
 * SVG and VML image presenters.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Base constructor for DOM presenters of JSGL image element.
 * @since version 2.0
 */         
jsgl.elements.AbstractImageDomPresenter = function() {

  /**
   * The URL of the image to be loaded.
   * @type string
   * @private
   */           
  this.loadedUrl = null;
  
  /**
   * Flag determining whether the image is already loaded. This property may
   * be considered protected and can be read by inheriting classes.   
   * @type boolean
   * @private
   */           
  this.isLoaded = false;
  
  /**
   * The browser's Image object for preloading.
   * @type Image
   * @private
   */           
  this.image = null;
}
jsgl.elements.AbstractImageDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Informs the presenter about the current URL of the image that
 * needs to be loaded. If the presenter sees that the URL has changed from the
 * last time, it immediately starts to download the image.
 * @methodOf jsgl.elements.AbstractImageDomPresenter#
 * @param {string} url The URL of the image that currently needs to be loaded.
 * @since version 2.0
 */   
jsgl.elements.AbstractImageDomPresenter.prototype.loadUrl = function(url) {

  if(this.loadedUrl != url) {

     this.loadedUrl = url;
     this.imageLoaded = false;
     this.image = new Image();
     this.image.src = url;
     
     this.image.onload = jsgl.util.delegate(this, function() {

         this.isLoaded = true;
       });

  }
}

/**
 * @description Gets the dimension of the image currently preloaded. If the
 * preloading has not finished yet, zero vector is returned.
 * @methodOf jsgl.elements.AbstractImageDomPresenter#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */     
jsgl.elements.AbstractImageDomPresenter.prototype.getImageSize = function() {

  if(this.isLoaded) {
  
    return new jsgl.Vector2D(this.image.width, this.image.height);
  }
  
  return new jsgl.Vector2D();
};/**
 * @fileOverview <code>jsgl.elements.SvgImageDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Scalable Vector Graphics DOM presenter for JSGL image element.
 * @extends jsgl.elements.AbstractImageDomPresenter
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.SvgImageDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating SVG elements.
 * @since version 2.0
 */
jsgl.elements.SvgImageDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractImageDomPresenter.call(this);
  
  /**
   * The SVG <code>&lt;g&gt;</code> element which hold the image and the rectangle
   * which is used for painting eventual outline.
   * @type SVGGElement
   * @private
   */
  this.svgGElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg","g");
  
  /**
   * The SVG image element.
   * @type SVGImageElement
   * @private
   */
  this.svgImageElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg","image");
  this.svgImageElement.setAttribute('preserveAspectRatio', 'none');
  this.svgGElement.appendChild(this.svgImageElement);
  
  /**
   * The SVG rectangle element used for painting eventual outline of the image.
   * @type SVGRectElement
   * @private
   */           
  this.svgRectElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg","rect");
  this.svgRectElement.style.setProperty("fill", "none", null);
  this.svgGElement.appendChild(this.svgRectElement);


  this.attachMouseHandlers(this.svgGElement);
}
jsgl.elements.SvgImageDomPresenter.jsglExtend(
  jsgl.elements.AbstractImageDomPresenter);

/**
 * @description Gets the SVG <code>&lt;g&gt;</code> element that is used
 * for rendering.
 * @methodOf jsgl.elements.SvgImageDomPresenter#
 * @returns SVGGElement
 * @since version 2.0
 */
jsgl.elements.SvgImageDomPresenter.prototype.getXmlElement = function() {

  return this.svgGElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the JSGL image element associated.
 * @methodOf jsgl.elements.SvgImageDomPresenter#
 * @private
 * @since version 2.0
 */
jsgl.elements.SvgImageDomPresenter.prototype.update = function() {

  this.loadUrl(this.graphicsElement.getUrl());
  
  if(!this.isLoaded) {
    
    window.setTimeout(jsgl.util.delegate(this, this.update), 50);
    return;
  }
  
  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  var size = this.graphicsElement.getSize(),
      location = this.graphicsElement.getLocation();

  var x,y;

  switch(this.graphicsElement.getHorizontalAnchor()) {
  
    case jsgl.HorizontalAnchor.LEFT:
    
      x = location.X;
      break;
    
    case jsgl.HorizontalAnchor.CENTER:
    
      x = location.X - size.X / 2;
      break;
    
    case jsgl.HorizontalAnchor.RIGHT:
    
      x = location.X - size.X;
      break;
  }
  
  switch(this.graphicsElement.getVerticalAnchor()) {
  
    case jsgl.VerticalAnchor.TOP:
    
      y = location.Y;
      break;
    
    case jsgl.VerticalAnchor.MIDDLE:
    
      y = location.Y - size.Y / 2;
      break;
    
    case jsgl.VerticalAnchor.BOTTOM:
    
      y = location.Y - size.Y;
      break;
  }

  this.svgImageElement.setAttribute("x", x);
  this.svgRectElement.setAttribute("x", x);
  
  this.svgImageElement.setAttribute("y", y);
  this.svgRectElement.setAttribute("y", y);
  
  this.svgImageElement.setAttribute("width", size.X);
  this.svgRectElement.setAttribute("width", size.X);
  
  this.svgImageElement.setAttribute("height", size.Y);
  this.svgRectElement.setAttribute("height", size.Y);
  
  this.svgImageElement.setAttributeNS("http://www.w3.org/1999/xlink","href", this.graphicsElement.getUrl());

  this.svgGElement.setAttribute("transform",
    "rotate(" + this.graphicsElement.getRotation() +
    "," + location.X + "," + location.Y + ")");

  this.svgImageElement.style.opacity = this.graphicsElement.getOpacity();

  this.graphicsElement.getStroke().applyToSvgElement(this.svgRectElement);
} ;/**
 * @fileOverview <code>jsgl.elements.VmlImageDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Vector Markup Language DOM presenter for JSGL image element.
 * @extends jsgl.elements.AbstractImageDomPresenter
 * @constructor
 * @description Creates new instance of <code>jsgl.elements.VmlImageDomPresenter</code>
 * @param {XmlDocument} ownerDocument The factory XmlDocument to be used for
 * creating VML elements.
 * @since version 2.0
 */
jsgl.elements.VmlImageDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractImageDomPresenter.call(this);
  
  /**
   * The VML <code>&lt;rect&gt;</code> element used for rendering.
   * @type VmlRectElement
   * @private
   */
  this.vmlRectElement = ownerDocument.createElement("vml:rect");
  this.vmlRectElement.style.position = "absolute";
  this.vmlRectElement.stroked = false;
  
  /**
   * The VML <code>&lt;stroke&gt;</code> elements specifying the outline of the
   * image, i.e. the stroke of the <code>&lt;rect&gt;</code> object.
   * @type VmlStrokeElement
   * @private
   */
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");         
  this.vmlRectElement.appendChild(this.vmlStrokeElement);
  
  /**
   * The VML <code>&lt;fill&gt;</code> element specifying the image to be
   * rendered on <code>&lt;rect&gt;</code>'s background.
   * @type VmlFillElement
   * @private
   */      
  this.vmlFillElement = ownerDocument.createElement("vml:fill");
  this.vmlFillElement.type = "frame";
  this.vmlFillElement.rotate = true;
  
  this.vmlRectElement.appendChild(this.vmlFillElement);
  
  this.attachMouseHandlers(this.vmlRectElement);
}
jsgl.elements.VmlImageDomPresenter.jsglExtend(
  jsgl.elements.AbstractImageDomPresenter);

/**
 * @description Gets the VML rectangle element that is used for rendering.
 * @methodOf jsgl.elements.VmlImageDomPresenter#
 * @retuns {VmlRectElement}
 * @since version 2.0
 */
jsgl.elements.VmlImageDomPresenter.prototype.getXmlElement = function() {

  return this.vmlRectElement;
}

/**
 * @description Updates the contents of the rendering VML according to the state
 * of the JSGL image element associated.
 * @methodOf jsgl.elements.VmlImageDomPresenter#
 * @private
 * @since version 2.0
 */
jsgl.elements.VmlImageDomPresenter.prototype.update = function() {

  this.loadUrl(this.graphicsElement.getUrl());
  
  if(!this.isLoaded) {
    
    window.setTimeout(jsgl.util.delegate(this, this.update), 50);
    return;
  }
  
  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  var size = this.graphicsElement.getSize(),
      location = this.graphicsElement.getLocation();


  var dPhi = Math.PI * this.graphicsElement.getRotation() / 180;

  var origCX, origCY;
  
  switch(this.graphicsElement.getHorizontalAnchor()) {
  
    case jsgl.HorizontalAnchor.LEFT:
    
      origCX = location.X + size.X/2;
      break;
    
    case jsgl.HorizontalAnchor.CENTER:
    
      origCX = location.X;
      break;
    
    case jsgl.HorizontalAnchor.RIGHT:
    
      origCX = location.X - size.X/2;
      break;
  }
  
  switch(this.graphicsElement.getVerticalAnchor()) {
  
    case jsgl.VerticalAnchor.TOP:
    
      origCY = location.Y + size.Y/2;
      break;
    
    case jsgl.VerticalAnchor.MIDDLE:
    
      origCY = location.Y;
      break;
    
    case jsgl.VerticalAnchor.BOTTOM:
    
      origCY = location.Y - size.Y/2;
      break;
  }
  
  var origPhi = Math.atan2(origCY - location.Y, origCX - location.X);
  
  var d = jsgl.Vector2D.getDistance(location, new jsgl.Vector2D(origCX, origCY));
  
  var trCX = location.X + Math.cos(origPhi + dPhi) * d;
  var trCY = location.Y + Math.sin(origPhi + dPhi) * d;

  this.vmlRectElement.style.left = trCX - size.X / 2;
  this.vmlRectElement.style.top = trCY - size.Y / 2;

  this.vmlRectElement.style.width = size.X;
  this.vmlRectElement.style.height = size.Y;

  this.vmlRectElement.style.rotation = this.graphicsElement.getRotation() % 360;
  
  this.vmlFillElement.src = this.graphicsElement.getUrl();  
  this.vmlFillElement.opacity = this.graphicsElement.getOpacity();
  
  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
}     ;/**
 * @fileOverview Declaration and implementation of
 * <code>jsgl.elements.ShapeElement</code> API class.
 * @author Tomas Rehorek
 * @since version 2.0
 */   

/**
 * @constructor
 */ 
jsgl.elements.ShapeElement = function(domPresenter, panel) {

  jsgl.elements.AbstractElement.call(this, panel);

  /**
   * @private
   */
  this.path = new jsgl.util.ArrayList();

  /**
   * The function listening to changes is path.
   * @type function
   * @private
   */
  this.pathChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);           

  /**
   * The function listening to changes in the associated stroke object.
   * @type function
   * @private
   */           
  this.strokeChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);

  /**
   * The function listening to changes in the associated fill object.
   * @type function
   * @private
   */           
  this.fillChangeListener = jsgl.util.delegate(
    this.onChangeRaiser, this.onChangeRaiser.raiseEvent);

  /**
   * Stroke object that specifies style of the shape's outline.
   * @type jsgl.stroke.AbstractStroke
   * @private
   */              
  this.stroke = null;
  this.setStroke(new jsgl.stroke.SolidStroke());
  
  /**
   * Fill object that specifies style of the shape's interior.
   * @type jsgl.fill.AbstractFill
   * @private
   */           
  this.fill = null;
  this.setFill(new jsgl.fill.SolidFill());
  
  this.domPresenter = domPresenter;
  this.domPresenter.setGraphicsElement(this);
}
jsgl.elements.ShapeElement.jsglExtend(jsgl.elements.AbstractElement);

/**
 * @description Gets the associated DOM presenter that renders the shape
 * element on the user's browser.
 * @methodOf jsgl.elements.ShapeElement#
 * @returns jsgl.elements.AbstractDomPresenter
 * @since version 2.0
 */     
jsgl.elements.ShapeElement.prototype.getDomPresenter = function() {

  return this.domPresenter;
}

/**
 * @description Appends a new path segment to the list of the shape's path
 * segment commands.
 * @methodOf jsgl.elements.ShapeElement#
 * @param {jsgl.path.AbstractPathSegment} newSegment The new path segment to
 * be appended.
 * @since version 2.0  
 */
jsgl.elements.ShapeElement.prototype.addPathSegment = function(segment) {

  this.path.add(segment);
  segment.registerChangeListener(this.pathChangeListener);
  
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the path segment at given index from the list of the
 * Shape's path segment commands.
 * @methodOf jsgl.elements.ShapeElement#  
 * @param {number} index Index of the path segment, starting from 0.
 * @returns {jsgl.path.AbstractPathSegment}
 * @since version 2.0  
 */ 
jsgl.elements.ShapeElement.prototype.getPathSegmentAt = function(index) {

  return this.path.get(index);
}

/**
 * @description Gets the current length of the shape's path segment commands list.
 * @methodOf jsgl.elements.ShapeElement#  
 * @returns {number} Number of segments currently present.
 * @since version 2.0 
 */ 
jsgl.elements.ShapeElement.prototype.getPathSize = function() {

  return this.path.getCount();
}

/**
 * @description Replaces a path segment in the list of the Shape's path segment
 * commands at the given index.
 * @methodOf jsgl.elements.ShapeElement#
 * @param {jsgl.path.AbstractPathSegment} newSegment The new path segment command.
 * @param {Number} index Index at which the replacement shall take place in the
 * list.
 * @since version 2.0 
 */ 
jsgl.elements.ShapeElement.prototype.setPathSegmentAt = function(newSegment, index) {

  if(this.path.get(index)) {
    this.path.get(index).unregisterChangeListener(this.pathChangeListener);
  }
  
  this.path.setAt(segment, index);
  segment.registerChangeListener(this.pathChangeListener);

  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Removes a path segment from the list of the shape's path segment
 * commands list at the given index. The rest of the list is shifted left after
 * the segment is removed. 
 * @methodOf jsgl.elements.ShapeElement#
 * @param {Number} index Index of the segment to be removed, starting from 0.
 */ 
jsgl.elements.ShapeElement.prototype.removePathSegmentAt = function(index) {

  this.path.get(index).unregisterChangeListener(this.pathChangeListener);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Inserts a new path segment to the list of the shape's path
 * segment commands. The rest of the list from the index given is shifted left
 * after the segment is inserted. 
 */ 
jsgl.elements.ShapeElement.prototype.insertPathSegmentAt = function(segment, index) {

  this.path.insertAt(segment, index);
  
  segment.registerChangeListener(this.pathChangeListener);
  
  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Removes all the path segments from the Shape's path segment
 * commands list.
 * @methodOf jsgl.elements.ShapeElement#
 * @since version 2.0   
 */ 
jsgl.elements.ShapeElement.prototype.clearPath = function() {

  var pathLength = this.path.getCount();

  for(var i=0; i<pathLength; i++) {
  
    this.path.get(i).unregisterChangeListener(this.pathChangeListener);
  }
  
  this.path.clear();
  
  this.inChangeRaiser.raiseEvent();
}



/**
 * @description Gets the stroke object that is currently used for rendering
 * the outline of the shape.
 * @methodOf jsgl.elements.ShapeElement#
 * @returns jsgl.stroke.AbstractStroke
 * @since version 2.0
 */      
jsgl.elements.ShapeElement.prototype.getStroke = function() {

  return this.stroke;
}

/**
 * @description Sets the new stroke object to be used for rendering
 * the outline of the shape.
 * @methodOf jsgl.elements.ShapeElement#
 * @param {jsgl.stroke.AbstractStroke} newStroke The new stroke object. 
 * @since version 2.0
 */      
jsgl.elements.ShapeElement.prototype.setStroke = function(newStroke) {

  if(this.stroke) {

    this.stroke.unregisterChangeListener(this.strokeChangeListener);
  }

  this.stroke = newStroke;
  this.stroke.registerChangeListener(this.strokeChangeListener);

  this.onChangeRaiser.raiseEvent();
}

/**
 * @description Gets the fill object that is currently used for rendering
 * the interior of the shape.
 * @methodOf jsgl.elements.ShapeElement#
 * @returns jsgl.fill.AbstractFill
 * @since version 2.0
 */      
jsgl.elements.ShapeElement.prototype.getFill = function() {

  return this.fill;
}

/**
 * @description Sets the new fill object to be used for rendering
 * the interior of the shape.
 * @methodOf jsgl.elements.ShapeElement#
 * @param {jsgl.fill.AbstractFill} newFill The new fill object. 
 * @since version 2.0
 */      
jsgl.elements.ShapeElement.prototype.setFill = function(newFill) {

  if(this.fill) {

    this.fill.unregisterChangeListener(this.fillChangeListener);
  }

  this.fill = newFill;
  this.fill.registerChangeListener(this.fillChangeListener);

  this.onChangeRaiser.raiseEvent();
};/**
 * @fileOverview Implementation of <code>jsgl.elements.SvgShapeDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 2.0
 */   

/**
 * @class Scalable Vector Graphics DOM presenter for JSGL shape element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates an instance of
 * <code>jsgl.elements.SvgShapeDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating SVG elements.
 * @since version 2.0
 */   
jsgl.elements.SvgShapeDomPresenter = function(ownerDocument) {

  jsgl.elements.AbstractDomPresenter.call(this);

  /**
   * The SVG <code>&lt;path&gt;</code> element to be used for rendering.
   * @type SVGPathElement
   * @private
   */          
  this.svgPathElement = ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
  this.svgPathElement.style.setProperty('fill-rule', 'evenodd', null);
  
  this.attachMouseHandlers(this.svgPathElement);
}
jsgl.elements.SvgShapeDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the SVG <code>&lt;path&gt;</code> element that is used for
 * rendering the shape.
 * @methodOf jsgl.elements.SvgShapeDomPresenter#
 * @returns {SVGPathElement}
 * @since version 2.0
 */    
jsgl.elements.SvgShapeDomPresenter.prototype.getXmlElement = function() {

  return this.svgPathElement;
}

/**
 * @description Updates the contents of rendering SVG according to the state
 * of the JSGL shape element associated.
 * @methodOf jsgl.elements.SvgShapeDomPresenter#  
 * @private
 * @since version 1.0
 * @version 2.0
 */ 
jsgl.elements.SvgShapeDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  var pathStr = "";
  
  var pathSize = this.graphicsElement.getPathSize();
  
  for(var i=0; i<pathSize; i++) {

    pathStr += this.graphicsElement.getPathSegmentAt(i).toSvgCommand();
  }
  
  this.svgPathElement.setAttribute("d", pathStr);
  
  this.graphicsElement.getStroke().applyToSvgElement(this.svgPathElement);
  this.graphicsElement.getFill().applyToSvgElement(this.svgPathElement);
};/**
 * @fileOverview Implementation of <code>jsgl.elements.VmlShapeDomPresenter</code>.
 * @author Tomas Rehorek
 * @since version 2.0  
 */

/**
 * @class Vector Markup Language DOM presenter for JSGL shape element.
 * @extends jsgl.elements.AbstractDomPresenter
 * @constructor
 * @description Creates new instance of
 * <code>jsgl.elements.VmlShapeDomPresenter</code>.
 * @param {XmlDocument} ownerDocument The factory XML document to be used for
 * creating VML elements.
 * @since version 2.0
 */   
jsgl.elements.VmlShapeDomPresenter = function(ownerDocument) {

  /**
   * The VML <code>&lt;shape&gt;</code> element to be used for rendering.
   * @type VmlShapeElement
   * @private
   */
  this.vmlShapeElement = document.createElement("vml:shape");
  this.vmlShapeElement.style.position = "absolute";
  
  // cooperates with Number.prototype.jsglVmlize()
  this.vmlShapeElement.coordsize = (1).jsglVmlize() + " " + (1).jsglVmlize();
  this.vmlShapeElement.style.width = this.vmlShapeElement.style.height = 1;

  /**
   * The VML <code>&lt;stroke&gt;</code> subelement that specifies style
   * of the shape's outline.   
   * @type VmlStrokeElement
   * @private
   */
  this.vmlStrokeElement = ownerDocument.createElement("vml:stroke");
  this.vmlShapeElement.appendChild(this.vmlStrokeElement);
  
  /**
   * The VML <code>&lt;fill&gt;</code> subelement that specifies style
   * of the shape's interior.
   * @type VmlFillElement
   * @private
   */
  this.vmlFillElement = ownerDocument.createElement("vml:fill");
  this.vmlShapeElement.appendChild(this.vmlFillElement);
  
  this.attachMouseHandlers(this.vmlShapeElement);
}
jsgl.elements.VmlShapeDomPresenter.jsglExtend(
  jsgl.elements.AbstractDomPresenter);

/**
 * @description Gets the VML <code>&lt;shape&gt;</code> element that is used
 * for rendering.
 * @methodOf jsgl.elements.VmlShapeDomPresenter#
 * @returns VmlShapeElement
 * @since version 2.0
 */    
jsgl.elements.VmlShapeDomPresenter.prototype.getXmlElement = function() {

  return this.vmlShapeElement;
}

/**
 * @description Gets the VML <code>&lt;stroke&gt;</code> subelement that is used
 * for defining shape's outline.
 * @methodOf jsgl.elements.VmlShapeDomPresenter#
 * @returns VmlStrokeElement
 * @since version 1.0
 */
jsgl.elements.VmlShapeDomPresenter.prototype.getStrokeElement = function() {

  return this.vmlStrokeElement;
}

/**
 * @description Get the fill VML subelement that is used for defining
 * shape's interior.
 * @methodOf jsgl.elements.VmlShapeDomPresenter#
 * @returns VmlFillElement
 * @since version 1.0
 */  
jsgl.elements.VmlShapeDomPresenter.prototype.getFillElement = function() {

  return this.vmlFillElement;
}

/**
 * @description Updates the contents of rendering VML according to the state
 * of the API shape element associated. Because it is generally a difficult
 * task to render SVG path using VML, various hacks are employed.  
 * @methodOf jsgl.elements.VmlShapeDomPresenter#
 * @private
 * @since version 2.0
 */
jsgl.elements.VmlShapeDomPresenter.prototype.update = function() {

  jsgl.elements.AbstractDomPresenter.prototype.update.call(this);
  
  var pathStr = "",
      pathSize = this.graphicsElement.getPathSize();
  
  var pathHistory = {
  
      currLoc: new jsgl.Vector2D(),
      lastStart: new jsgl.Vector2D()
    };

  for(var i=0; i<pathSize; i++) {
  
    var pathSegment = this.graphicsElement.getPathSegmentAt(i);

    pathStr += pathSegment.toVmlCommand(pathHistory);


    if(pathSegment.isCubicBezier()) {
    
      pathHistory.lastCBCtl = pathSegment.getCBControlPoint(pathHistory);
    }
    else {
    
      pathHistory.lastCBCtl = pathSegment.getNewLocation(pathHistory);
    }
    
    if(pathSegment.isQuadraticBezier()) {
    
      pathHistory.lastQBCtl = pathSegment.getQBControlPoint(pathHistory);
    }
    else {
    
      pathHistory.lastQBCtl = pathSegment.getNewLocation(pathHistory);
    }


    if(!pathSegment.closesSubpath()) {

      pathHistory.currLoc = pathSegment.getNewLocation(pathHistory);
    }
    else {
    
      pathHistory.currLoc = jsgl.cloneObject(pathHistory.lastStart);
    }

    if(pathSegment.startsNewSubpath()) {
    
      pathHistory.lastStart = jsgl.cloneObject(pathHistory.currLoc);
    }
  }

  this.vmlShapeElement.path = pathStr;

  this.graphicsElement.getStroke().applyToVmlStrokeElement(this.vmlStrokeElement);
  this.graphicsElement.getFill().applyToVmlFillElement(this.vmlFillElement);
};/**
 * @fileOverview <code>jsgl.Panel</code> class implementation.
 * @author Tomas Rehorek
 * @since version 1.0
 */


/**
 * @class Core API object for creating and displaying JSGL elements within
 * HTML <code>&lt;div&gt;</code> element. 
 * @constructor
 * @description Creates new <code>jsgl.Panel</code> object.
 * @param {HTMLDivElement} holderElement HTML <code>&lt;div&gt;</code> element
 * to be drawn onto.
 * @since version 1.0 
 * @version 2.0 
 */   
jsgl.Panel=function(holderElement) {

  /**
   * HTML <code>&lt;div&gt;</code> that the graphics elements will be put into.
   * @type HTMLDivElement
   * @private
   */           
  this.holderElement=holderElement;

  /**
   * This list of the elements added to the viewport.
   * @type jsgl.util.ArrayList  
   * @since version 2.0
   * @private   
   */
  this.elements = new jsgl.util.ArrayList();

  /*
   * Owner document of the holder <code>&lt;div&gt;</code> element. In MSIE 5.5,
   * ownerDocument property of the element is not supported, preventing JSGL from
   * being used inside frames.
   * @type HTMLDocument
   * @since version 1.0
   * @private         
   */
  this.ownerDocument = null;
  if(jsgl.util.BrowserInfo.isMSIE55) {
    this.ownerDocument=document;
  }
  else {
    this.ownerDocument=holderElement.ownerDocument;
  }

  this.holderElement.style.position = "relative";
  this.holderElement.style.overflow = "hidden";
  this.holderElement.style.cursor = "default";

  
  this.domPresenter = null;  
  if(jsgl.util.BrowserInfo.supportsSvg) {

    this.domPresenter = new jsgl.panel.SvgPanelDomPresenter(this);
  }
  else {

    this.domPresenter = new jsgl.panel.NonSvgPanelDomPresenter(this);
  }
  
  /**
   * Cursor to display when the mouse is on the panel.
   * @type jsgl.Cursor
   * @since version 2.0
   * @private
   */
  this.cursor = jsgl.Cursor.INHERIT;              
  
  ////////////////////////////////////////////////////
  this.mouseMoveRaiser = new jsgl.util.EventRaiser();
  this.mouseDownRaiser = new jsgl.util.EventRaiser();
  this.mouseUpRaiser = new jsgl.util.EventRaiser();
  this.mouseOverRaiser = new jsgl.util.EventRaiser();
  this.mouseOutRaiser = new jsgl.util.EventRaiser();
  this.clickRaiser = new jsgl.util.EventRaiser();
  this.dblClickRaiser = new jsgl.util.EventRaiser();
}

/**
 * @description Gets the holder HTML <code>&lt;div&gt;</code> for the panel.
 * @methodOf jsgl.Panel#
 * @returns HTMLDivElement
 * @since version 1.0
 */    
jsgl.Panel.prototype.getHolderElement=function() {

  return this.holderElement;
}

/**
 * @description Gets the owner document of the holder <code>&lt;div&gt;</code>
 * element.
 * @methodOf jsgl.Panel#
 * @returns HTMLDocument
 * @since version 2.0
 */
jsgl.Panel.prototype.getOwnerDocument = function() {

  return this.ownerDocument;
}     

/**
 * @description Adds an element (created by some of the factory methods) to the
 * Panel's viewport.
 * @methodOf jsgl.Panel#
 * @param {jsgl.elements.AbstractElement} element The element to be added.
 * @since version 1.0
 * @version 2.0  
 */ 
jsgl.Panel.prototype.addElement=function(element) {

  //this.elementsGroup.addElement(element);
  this.domPresenter.addElement(element);
  this.elements.add(element);
  element.setContainer(this);
}

/**
 * @description Removes all the elements from the Panel's viewport.
 * @methodOf jsgl.Panel#
 * @since version 1.0 
 */  
jsgl.Panel.prototype.clear=function() {

  //this.elementsGroup.removeAllElements();
  this.domPresenter.clear();  
  this.elements.clear();

  for(i=0; i<this.elements.getCount(); i++) {
    this.elements.get(i).setContainer(null);
  }
}

/**
 * @description Gets the number of elements that are currently diplayed on the
 * Panel's viewport.
 * @methodOf jsgl.Panel#
 * @since version 1.0
 * @version 2.0 
 */   
jsgl.Panel.prototype.getElementsCount=function() {

  //return this.elementsGroup.getElementsCount();
  return this.elements.getCount();
}

/**
 * @description Gets an element from the Panel's viewport at the specified index.
 * @methodOf jsgl.Panel#
 * @since version 1.0
 * @param {number} index Index of the element to be returned. 
 * @version 2.0 
 */  
jsgl.Panel.prototype.getElementAt=function(index) {

  //return this.elementsGroup.getElementAt(index);
  return this.elements.get(index);
}

/**
 * @description Determines whether the specified element is currently contained
 * within the Panel's viewport.
 * @methodOf jsgl.Panel#
 * @param {jsgl.elements.AbstractElement} element The element to be tested for
 * presence on the Panel's viewport. 
 * @returns {Boolean}  
 * @since version 1.0
 * @version 2.0 
 */  
jsgl.Panel.prototype.containsElement=function(element) {

  //return this.elementsGroup.containsElement(element);
  return this.elements.contains(element);
}

/**
 * @description Removes the given element out of the Panel's viewport.
 * @methodOf jsgl.Panel#
 * @param {jsgl.elements.AbstractElement} element The element to be removed
 * from the Panel's viewport.
 * @since version 1.0
 * @version 2.0 
 */     
jsgl.Panel.prototype.removeElement=function(element) {

  //this.elementsGroup.removeElement(element);
  this.domPresenter.removeElement(element);
  this.elements.remove(element);
  element.setContainer(null);
}

/**
 * @description Factory method that creates new instance of <code>GroupElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.Element.GroupElement} 
 * @since version 1.0 
 * @version 2.0 
 */
jsgl.Panel.prototype.createGroup=function(x,y,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
    domPresenter = new jsgl.elements.SvgGroupDomPresenter(this.ownerDocument);
  }
  else {
    domPresenter = new jsgl.elements.NonSvgGroupDomPresenter(this.ownerDocument);
  }

  return new jsgl.elements.GroupElement(domPresenter,this,x,y,zIndex);
}

/**
 * @description Factory method that creates new instance of <code>CircleElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.CircleElement} 
 * @since version 1.0
 */   
jsgl.Panel.prototype.createCircle=function(x,y,radius,stroke,fill,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
    domPresenter=new jsgl.elements.SvgCircleDomPresenter(this.ownerDocument);
  }
  else {
    domPresenter=new jsgl.elements.VmlCircleDomPresenter(this.ownerDocument);
  }

  return new jsgl.elements.CircleElement(domPresenter,this,x,y,radius,stroke,fill,zIndex);
}

/**
 * @description Factory method that creates new instance of <code>EllipseElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.EllipseElement} 
 * @since version 1.0 
 */
jsgl.Panel.prototype.createEllipse=function(x,y,width,height,rotation,stroke,fill,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
  
    domPresenter=new jsgl.elements.SvgEllipseDomPresenter(this.ownerDocument);
  }
  else {

    domPresenter=new jsgl.elements.VmlEllipseDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.EllipseElement(domPresenter,this,x,y,width,height,rotation,stroke,fill,zIndex);
}

/**
 * @description Factory method that creates new instance of
 * <code>jsgl.elements.RectangleElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.RectangleElement}
 * @since version 2.0
 */
jsgl.Panel.prototype.createRectangle = function() {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
  
    domPresenter = new jsgl.elements.SvgRectangleDomPresenter(this.ownerDocument);
  }
  else {
  
    domPresenter = new jsgl.elements.VmlRectangleDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.RectangleElement(domPresenter, this);
}  

/**
 * @description Factory method that creates new instance of <code>LineElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.LineElement} 
 * @since version 1.0
 */   
jsgl.Panel.prototype.createLine=function(x1,y1,x2,y2,stroke,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {

    domPresenter=new jsgl.elements.SvgLineDomPresenter(this.ownerDocument);
  }
  else {

    domPresenter=new jsgl.elements.VmlLineDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.LineElement(domPresenter,this,x1,y1,x2,y2,stroke,zIndex);
}


/**
 * @description Factory method that creates new instance of <code>LabelElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.LabelElement} 
 * @since version 1.0
 */   
jsgl.Panel.prototype.createLabel=function(x,y,text,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
  
    domPresenter = new jsgl.elements.SvgLabelDomPresenter(this.ownerDocument);
  }
  else {
  
    domPresenter = new jsgl.elements.NonSvgLabelDomPresenter(this.ownerDocument);
  }

  return new jsgl.elements.LabelElement(domPresenter,this,x,y,text,zIndex);
}


/**
 * @description Factory method that creates new instance of <code>PolylineElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.PolylineElement} 
 * @since version 1.0  
 */
jsgl.Panel.prototype.createPolyline=function(stroke,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
    domPresenter=new jsgl.elements.SvgPolylineDomPresenter(this.ownerDocument);
  }
  else {
    domPresenter=new jsgl.elements.VmlPolylineDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.PolylineElement(domPresenter,this,stroke,zIndex);
}


/**
 * @description Factory method that creates new instance of <code>PolygonElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.PolygonElement} 
 * @since version 1.0
 */
jsgl.Panel.prototype.createPolygon=function(stroke,fill,zIndex) {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
    domPresenter=new jsgl.elements.SvgPolygonDomPresenter(this.ownerDocument);
  }
  else {
    domPresenter=new jsgl.elements.VmlPolygonDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.PolygonElement(domPresenter,this,stroke,fill,zIndex);
}

/**
 * @description Factory method that creates an instance of
 * <code>jsgl.elements.ImageElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.ImageElement}
 * @since version 2.0
 */    
jsgl.Panel.prototype.createImage = function() {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
  
    domPresenter = new jsgl.elements.SvgImageDomPresenter(this.ownerDocument);
  }
  else {
  
    domPresenter = new jsgl.elements.VmlImageDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.ImageElement(domPresenter, this);
}

/**
 * @description Factory method that creates new instance of
 * <code>jsgl.elements.CurveElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.CurveElement}
 * @since version 2.0
 */
jsgl.Panel.prototype.createCurve = function() {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
  
    domPresenter = new jsgl.elements.SvgCurveDomPresenter(this.ownerDocument);
  }
  else {
  
    domPresenter = new jsgl.elements.VmlCurveDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.CurveElement(domPresenter, this);
}     

/**
 * @description Factory method that creates instance of
 * <code>jsgl.elements.ShapeElement</code>.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.elements.ShapeElement}
 * @since version 2.0
 */     
jsgl.Panel.prototype.createShape = function() {

  var domPresenter;
  
  if(jsgl.util.BrowserInfo.supportsSvg) {
  
    domPresenter = new jsgl.elements.SvgShapeDomPresenter(this.ownerDocument);
  }
  else {
  
    domPresenter = new jsgl.elements.VmlShapeDomPresenter(this.ownerDocument);
  }
  
  return new jsgl.elements.ShapeElement(domPresenter, this);
}


////////////////////////////////////////////////

/**
 * @description Sets the new cursor for the Panel.
 * @methodOf jsgl.Panel#
 * @param {jsgl.Cursor} newCursor The new cursor.
 * @since version 2.0 
 */
jsgl.Panel.prototype.setCursor = function(newCursor) {

  this.cursor = newCursor;
  this.domPresenter.update();
}

/**
 * @description Gets the current mouse cursor used by the Panel.
 * @methodOf jsgl.Panel#
 * @returns {jsgl.Cursor} The cursor currently used.
 * @since version 2.0
 */
jsgl.Panel.prototype.getCursor = function() {

  return this.cursor;
}    


/**
 * @description Adds a listener function for handling mouse move events on the
 * panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */ 
jsgl.Panel.prototype.addMouseMoveListener = function(listener) {

  this.mouseMoveRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse move event
 * listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse move events on the panel anymore.
 * @since version 2.0
 */  
jsgl.Panel.prototype.removeMouseMoveListener = function(listener) {

  this.mouseMoveRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse move event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.MouseEvent} eventArgs The mouse move event arguments object.  
 * @private
 * @since version 2.0
 */ 
jsgl.Panel.prototype.raiseMouseMove = function(eventArgs) {

  this.mouseMoveRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling mouse down events on the
 * panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */       
jsgl.Panel.prototype.addMouseDownListener = function(listener) {

  this.mouseDownRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse down event
 * listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse down events on the panel anymore.
 * @since version 2.0
 */  
jsgl.Panel.prototype.removeMouseDownListener = function(listener) {

  this.mouseDownRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse down event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.MouseEvent} eventArgs The mouse down event arguments object.
 * @private
 * @since version 2.0
 */    
jsgl.Panel.prototype.raiseMouseDown = function(eventArgs) {

  this.mouseDownRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling mouse up events on the
 * panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */       
jsgl.Panel.prototype.addMouseUpListener = function(listener) {

  this.mouseUpRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse up event
 * listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse up events on the panel anymore.
 * @since version 2.0
 */      
jsgl.Panel.prototype.removeMouseUpListener = function(listener) {

  this.mouseUpRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse up event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.MouseEvent} eventArgs The mouse up event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.Panel.prototype.raiseMouseUp = function(eventArgs) {

  this.mouseUpRaiser.raiseEvent(eventArgs);
}     

/**
 * @description Adds a listener function for handling mouse over events on the
 * panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */
jsgl.Panel.prototype.addMouseOverListener = function(listener) {

  this.mouseOverRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse over event
 * listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse over events on the panel anymore.
 * @since version 2.0
 */      
jsgl.Panel.prototype.removeMouseOverListener = function(listener) {

  this.mouseOverRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse over event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.MouseEvent} eventArgs The mouse over event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.Panel.prototype.raiseMouseOver = function(eventArgs) {

  this.mouseOverRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling mouse out events on the
 * panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */  
jsgl.Panel.prototype.addMouseOutListener = function(listener) {

  this.mouseOutRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of mouse out event
 * listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to mouse out events on the panel anymore.
 * @since version 2.0
 */      
jsgl.Panel.prototype.removeMouseOutListener = function(listener) {

  this.mouseOutRaiser.unregisterListener(listener);
}

/**
 * @description Raises the mouse out event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.MouseEvent} eventArgs The mouse out event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.Panel.prototype.raiseMouseOut = function(eventArgs) {

  this.mouseOutRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling click events on the panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */  
jsgl.Panel.prototype.addClickListener = function(listener) {

  this.clickRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of click event listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listener function that should not
 * listen to click events on the panel anymore.
 * @since version 2.0
 */     
jsgl.Panel.prototype.removeClickListener = function(listener) {

  this.clickRaiser.unregisterListener(listener);
}

/**
 * @description Raises the click event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.MouseEvent} eventArgs The click event arguments object.  
 * @private
 * @since version 2.0 
 */ 
jsgl.Panel.prototype.raiseClick = function(eventArgs) {

  this.clickRaiser.raiseEvent(eventArgs);
}

/**
 * @description Adds a listener function for handling double click events on the
 * panel.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listening function. If the listener
 * should be executed as a method of some specific object,
 * <code>jsgl.util.delegate(obj, function(eventArgs) {...})</code> can be used.
 * @since version 2.0
 */ 
jsgl.Panel.prototype.addDoubleClickListener = function(listener) {

  this.dblClickRaiser.registerListener(listener);
}

/**
 * @description Removes a listener function from the pool of double click event
 * listeners.
 * @methodOf jsgl.Panel#
 * @param {function(eventArgs)} listener The listeer function that should not
 * listen to double click events on the panel anymore.
 * @since version 2.0
 */   
jsgl.Panel.prototype.removeDoubleClickListener = function(listener) {

  this.dblClickRaiser.unregisterListener(listener);
}

/**
 * @description Raises the double click event.
 * @methodOf jsgl.Panel#
 * @param {jsgl.util.MouseEvet} eventArgs The click event arguments object.
 * @private
 * @since version 2.0
 */
jsgl.Panel.prototype.raiseDoubleClick = function(eventArgs) {

  this.dblClickRaiser.raiseEvent(eventArgs);
};/**
 * @fileOverview Declaration of <code>jsgl.panel.AbstractPanelDomPresenter</code>
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Base class for DOM implementation for <code>jsgl.Panel</code> object.
 * @constructor
 * @description Base constructor for inheriting classes.
 * @param {jsgl.Panel} panelObject The <code>jsgl.Panel</code> object to be
 * implemented in DOM.
 * @since version 2.0
 * @version 2.0 
 */ 
jsgl.panel.AbstractPanelDomPresenter = function(panelObject) {

  /**
   * The <code>jsgl.Panel</code> object to be implemented in DOM.
   * @type jsgl.Panel
   */   
  this.panelObject = panelObject;
  
  /**
   * The holder element (HTML &lt;div&gt;) of the panel.
   * @type HTMLDivElement
   */         
  this.holderElement = this.panelObject.getHolderElement();
  
  this.initMouseHandlers();
}

/**
 * @description Adds a JSGL element to the DOM.
 * @methodOf jsgl.panel.AbstractPanelDomPresenter#
 * @param {jsgl.elements.AbstractElement} element The JSGL element to be
 * added to the panel's DOM.
 * @since version 2.0    
 */ 
jsgl.panel.AbstractPanelDomPresenter.prototype.addElement = function(element) {
  throw "Not implemented";
}

/**
 * @description Removes a JSGL element from the DOM.
 * @methodOf jsgl.panel.AbstractPanelDomPresenter#
 * @param {jsgl.elements.AbstractElement} element The JSGL element to be
 * removed from the panel's DOM.
 * @since version 2.0
 */
jsgl.panel.AbstractPanelDomPresenter.prototype.removeElement = function(element) {
  throw "Not implemented";
}

/**
 * @description Removes all the elements from the DOM.
 * @methodOf jsgl.panel.AbstractPanelDomPresenter#
 * @since version 2.0
 */
jsgl.panel.AbstractPanelDomPresenter.prototype.clear = function() {
  throw "Not implemented";
}


jsgl.panel.AbstractPanelDomPresenter.prototype.update = function() {

  this.holderElement.style.cursor = this.panelObject.getCursor().asCSS;
}



jsgl.panel.AbstractPanelDomPresenter.prototype.initMouseHandlers = function() {

  this.holderElement.onclick = jsgl.util.delegate(this, function(e) {

      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseClick(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.CLICK));
      
      return false;
    });

  this.holderElement.ondblclick = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseDoubleClick(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.DOUBLE_CLICK));
      
      return false;
    });
  
  this.holderElement.onmousedown = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseMouseDown(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.DOWN));
      
      return false;
    });
  
  this.holderElement.onmouseup = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseMouseUp(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.UP));
      
      return false;
    });
  
  this.holderElement.onmousemove = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseMouseMove(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.MOVE));
      
      return false;
    });
  
  this.holderElement.onmouseover = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseMouseOver(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.OVER));
      
      return false;
    });
  
  this.holderElement.onmouseout = jsgl.util.delegate(this, function(e) {
  
      if(jsgl.util.BrowserInfo.usesWindowEvent) {
        e = window.event;
      }
      
      this.panelObject.raiseMouseOut(
        jsgl.MouseEvent.fromJsglPanel(e, this.panelObject, jsgl.MouseEvent.OUT));
      
      return false;
    });
};/**
 * @fileOverview <code>jsgl.panel.NonSvgPanelDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */   

/**
 * @class Simple non-SVG <code>jsgl.Panel</code> DOM presenter that uses
 * exploits <code>jsgl.elements.GroupElement</code>, especially it DOM presenter
 * <code>jsgl.elements.NonSvgGroupPresenter</code>.
 * @extends jsgl.panel.AbstractPanelDomPresenter 
 * @constructor
 * @description Creates new instance of <code>jsgl.panel.NonSvgPanelDomPresenter</code>.
 * @param {jsgl.Panel} panelObject The <code>jsgl.Panel</code> object to be
 * implemented in DOM.
 * @since version 2.0
 * @version 2.0
 */         
jsgl.panel.NonSvgPanelDomPresenter=function(panelObject) {

  jsgl.panel.AbstractPanelDomPresenter.call(this,panelObject)
  
  this.elementsGroup=this.panelObject.createGroup();
  this.holderElement.appendChild(
    this.elementsGroup.getDomPresenter().getXmlElement());
  
  this.elementsGroup.setContainer(panelObject);
}
jsgl.panel.NonSvgPanelDomPresenter.jsglExtend(jsgl.panel.AbstractPanelDomPresenter);

/**
 * @description Adds a JSGL element to the top-level group.
 * @methodOf jsgl.panel.NonSvgPanelDomPresenter#
 * @param {jsgl.elements.AbstactElement} element The JSGL element to be added
 * to the Panel's DOM
 * @since version 2.0
 */
jsgl.panel.NonSvgPanelDomPresenter.prototype.addElement = function(element) {

  this.elementsGroup.addElement(element);
}

/**
 * @description Removes a JSGL element from the top-level group.
 * @methodOf jsgl.panel.NonSvgPanelDomPresenter#
 * @param {jsgl.elements.AbstractElement} element The JSGL element to be removed
 * from the Panel's DOM.
 * @since version 2.0
 */
jsgl.panel.NonSvgPanelDomPresenter.prototype.removeElement = function(element) {

  this.elementsGroup.removeElement(element);
}

/**
 * @description Clears the top-level group.
 * @methodOf jsgl.panel.NonSvgPanelDomPresenter#
 * @since version 2.0
 */
jsgl.panel.NonSvgPanelDomPresenter.prototype.clear = function() {

  this.elementsGroup.clear();
}   ;/**
 * @fileOverview <code>jsgl.panel.SvgPanelDomPresenter</code> implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class SVG DOM presenter for <code>jsgl.Panel</code> object.
 *  
 */ 
jsgl.panel.SvgPanelDomPresenter=function(panelObject) {

  jsgl.panel.AbstractPanelDomPresenter.call(this, panelObject);
  
  this.svgHolder = this.panelObject.getOwnerDocument().createElementNS(
    "http://www.w3.org/2000/svg", "svg");
  this.svgHolder.style.position = "absolute";
  this.svgHolder.style.left = "0px";
  this.svgHolder.style.top = "0px";
  
  this.holderElement.appendChild(this.svgHolder);

  this.domSorter = new jsgl.elements.DomSorter(this.svgHolder);

  
  this.lastSize = new jsgl.Vector2D();
  
  this.sizeUpdate();
  window.setInterval(jsgl.util.delegate(this, this.sizeUpdate), 50);
}
jsgl.panel.SvgPanelDomPresenter.jsglExtend(jsgl.panel.AbstractPanelDomPresenter);

jsgl.panel.SvgPanelDomPresenter.prototype.addElement = function(element) {

  //this.svgHolder.appendChild(element.getDomPresenter().getXmlElement());
  this.domSorter.add(element);
}

jsgl.panel.SvgPanelDomPresenter.prototype.removeElement = function(element) {

  //this.svgHolder.removeChild(element.getDomPresenter().getXmlElement());
  this.domSorter.remove(element);
}

jsgl.panel.SvgPanelDomPresenter.prototype.clear = function() {

/*  while(this.svgHolder.lastChild) {
    this.svgHolder.removeChild(this.svgHolder.lastChild);
  }*/
  
  for(var i=0; i<this.panelObject.getElementsCount(); i++) {
  
    this.domSorter.remove(this.panelObject.getElementAt(i));
  }
}

jsgl.panel.SvgPanelDomPresenter.prototype.sizeUpdate = function() {
  
  if(this.lastSize.X != this.holderElement.clientWidth ||
     this.lastSize.Y != this.holderElement.clientHeight) {
     
    this.lastSize.X = this.holderElement.clientWidth;
    this.lastSize.Y = this.holderElement.clientHeight;
    
    this.svgHolder.setAttribute("width", this.lastSize.X);
    this.svgHolder.setAttribute("height", this.lastSize.Y);
  }
};jsgl.DashStyles={
  DASH: jsgl.stroke.DashDashStyle.getInstance(),
  DASH_DOT: jsgl.stroke.DashDotDashStyle.getInstance(),
  DOT: jsgl.stroke.DotDashStyle.getInstance(),
  LONG_DASH: jsgl.stroke.LongDashDashStyle.getInstance(),
  LONG_DASH_DOT: jsgl.stroke.LongDashDotDashStyle.getInstance(),
  LONG_DASH_DOT_DOT: jsgl.stroke.LongDashDotDotDashStyle.getInstance(),
  SHORT_DASH_DOT: jsgl.stroke.ShortDashDotDashStyle.getInstance(),
  SOLID: jsgl.stroke.SolidDashStyle.getInstance()
};jsgl.JoinStyles={
  ROUND: jsgl.stroke.RoundJoinStyle.getInstance(),
  BEVEL: jsgl.stroke.BevelJoinStyle.getInstance(),
  MITER: new jsgl.stroke.MiterJoinStyle(10)
};jsgl.EndcapTypes={
  ROUND: jsgl.stroke.RoundEndcapType.getInstance(),
  FLAT: jsgl.stroke.FlatEndcapType.getInstance(),
  SQUARE: jsgl.stroke.SquareEndcapType.getInstance()
};
jsgl.Cursor = {

  INHERIT: { asCSS: jsgl.util.BrowserInfo.isMSIE ? '' : 'inherit' },
  DEFAULT: { asCSS: 'default' },
  POINTER: { asCSS: 'pointer' },
  CROSSHAIR: { asCSS: 'crosshair' },
  HELP: { asCSS: 'help' },
  TEXT: { asCSS: 'text' },
  WAIT: { asCSS: 'wait' },
  PROGRESS: { asCSS: 'progress' },
  MOVE: { asCSS: 'move' },
  N_RESIZE: { asCSS: 'n-resize' },
  NE_RESIZE: { asCSS: 'ne-resize' },
  E_RESIZE: { asCSS: 'e-resize' },
  SE_RESIZE: { asCSS: 'se-resize' },
  S_RESIZE: { asCSS: 's-resize' },
  SW_RESIZE: { asCSS: 'sw-resize' },
  W_RESIZE: { asCSS: 'w-resize' },
  NW_RESIZE: { asCSS: 'nw-resize' }
  
};jsgl.VerticalAnchor={
  TOP: 0,
  BOTTOM: 1,
  MIDDLE: 2
};;jsgl.HorizontalAnchor={
  LEFT: 0,
  RIGHT: 1,
  CENTER: 2
};;/**
 * @fileOverview <code>jsgl.MouseEvent</code> class implementation.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Mouse event API class.
 * @constructor
 * //@description Creates new instance of <code>jsgl.MouseEvent</code>.
 * //Contains few hacks making detection of coordinates to work properly on various
 * //browsers. 
 * //@param {MouseEvent} eventObject The event object generated by the web browser.
 * //@param {number} 
  The type of the event. If not provided,
 * //<code>jsgl.MouseEvent.UNKNOWN</code> will be used.
 * @since version 2.0
 */
jsgl.MouseEvent = function(x, y, eventType, sourceElement) {
  
  /**
   * Type of the mouse event.
   * @type number
   * @private
   */      
  this.eventType = eventType || jsgl.MouseEvent.UNKNOWN;

  /**
   * Location of the event in the coordspace of element's container.
   * @type jsgl.Vector2D
   * @private
   */           
  this.location = new jsgl.Vector2D(x, y);
  
  /**
   * The element that the event occured on.
   * @type jsgl.elements.AbstractElement
   * @private
   */           
  this.sourceElement = sourceElement || null;
}

jsgl.MouseEvent.fromJsglElement = function(eventObject, jsglElement, eventType) {

  var location;

  /* Begin:  Determine location */  
  if(jsgl.util.BrowserInfo.usesWindowEvent) {
  
    if(jsgl.util.BrowserInfo.isOpera) {

      location = new jsgl.Vector2D(eventObject.pageX, eventObject.pageY);
    }
    else {

      location = new jsgl.Vector2D(eventObject.x, eventObject.y);
    }
    
    location.X -= parseInt(jsglElement.getPanel().getHolderElement().style.borderLeftWidth) || 0;
    location.Y -= parseInt(jsglElement.getPanel().getHolderElement().style.borderTopWidth) || 0;
    
  }
  else {

    location = new jsgl.Vector2D(eventObject.layerX, eventObject.layerY);
  }

  var panel = jsglElement.getPanel();
  
  var offset = new jsgl.Vector2D();
  var currContainer = jsglElement.getContainer();
  
  do {
  
    if(currContainer != panel) {

      offset = offset.add(currContainer.getLocation());
      currContainer = currContainer.getContainer();
    }
  
  }
  while(currContainer != panel);
  
  if(jsgl.util.BrowserInfo.isOpera) {

    var currElement = jsglElement.getPanel().getHolderElement();
    
    while(currElement != document.body) {

      offset.X += currElement.offsetLeft;
      offset.Y += currElement.offsetTop;
      
      currElement = currElement.offsetParent;
    }
  }

  location = location.subtract(offset);
  /* End: Determine location */

  var jsglElement = null,
      currElement = eventObject.srcElement || eventObject.target;
  
  do {
  
    if(currElement.jsglElement) {
    
      jsglElement = currElement.jsglElement;
      break;
    }
    
    currElement = currElement.parentNode;
  }
  while(currElement != document.body);

  return new jsgl.MouseEvent(location.X, location.Y, eventType, jsglElement);
}

jsgl.MouseEvent.fromJsglPanel = function(eventObject, panelObject, eventType) {

  var location = new jsgl.Vector2D();
  
  if(jsgl.util.BrowserInfo.usesWindowEvent) {
  
    if(jsgl.util.BrowserInfo.isOpera) {

      location = new jsgl.Vector2D(eventObject.pageX, eventObject.pageY);
    }
    else {

      location = new jsgl.Vector2D(eventObject.x, eventObject.y);
    }
    
    location.X -= parseInt(panelObject.getHolderElement().style.borderLeftWidth) || 0;
    location.Y -= parseInt(panelObject.getHolderElement().style.borderTopWidth) || 0;
    
  }
  else {

    location = new jsgl.Vector2D(eventObject.layerX, eventObject.layerY);
  }

  if(jsgl.util.BrowserInfo.isOpera) {

    var currElement = panelObject.getHolderElement();
    
    while(currElement != document.body) {

      location.X -= currElement.offsetLeft;
      location.Y -= currElement.offsetTop;
      
      currElement = currElement.offsetParent;
    }
  }

  var jsglElement = null,
      currElement = eventObject.srcElement || eventObject.target;
  
  do {
  
    if(currElement.jsglElement) {
    
      jsglElement = currElement.jsglElement;
      break;
    }
    
    currElement = currElement.parentNode;
  }
  while(currElement != document.body);
  
  return new jsgl.MouseEvent(location.X, location.Y, eventType, jsglElement);
}

/**
 * Unknown type of event (indicates possible error).
 * @constant
 */ 
jsgl.MouseEvent.UNKNOWN = 0;

/**
 * Click mouse event type. Indicates that mouse button has been pushed and
 * released at some location within the element.
 * @constant
 */  
jsgl.MouseEvent.CLICK = 1;

/**
 * Double-click mouse event type. Indicates that mouse button has been pushed
 * and released twice at some location within the element.
 * @constant
 */  
jsgl.MouseEvent.DOUBLE_CLICK = 2;

/**
 * Mouse-down event type. Indicates that mouse button has been pushed at some
 * location within the element.
 * @constant
 */   
jsgl.MouseEvent.DOWN = 3;

/**
 * Mouse-up event type. Indicates that mouse button has been released at some
 * location within the element.
 * @contant
 */ 
jsgl.MouseEvent.UP = 4;

/**
 * Mouse-move event type. Indicates that the mouse has moved at some location
 * within the element.
 * @constant
 */   
jsgl.MouseEvent.MOVE = 5;

/**
 * Mouse-over event type. Indicates that the mouse has entered the element.
 * @constant
 */   
jsgl.MouseEvent.OVER = 6;

/**
 * Mouse-out event type. Indicates that the mouse has left the element.
 * @constant
 */  
jsgl.MouseEvent.OUT = 7;

/**
 * @description Gets the X-coordinate of the location at which the event took
 * place.
 * @methodOf jsgl.MouseEvent#
 * @returns {number}
 * @since version 2.0
 */      
jsgl.MouseEvent.prototype.getX = function() {

  return this.location.X;
}

/**
 * @description Gets the Y-coordinate of the location at which the event took
 * place.
 * @methodOf jsgl.MouseEvent#
 * @returns {number}
 * @since version 2.0
 */     
jsgl.MouseEvent.prototype.getY = function() {

  return this.location.Y;
}

/**
 * @description Gets the location at which the event took place as an instance
 * of <code>jsgl.Vector2D</code> object.
 * @methodOf jsgl.MouseEvent#
 * @returns {jsgl.Vector2D}
 * @since version 2.0
 */  
jsgl.MouseEvent.prototype.getLocation = function() {

  return jsgl.cloneObject(this.location);
}

/**
 * @description Gets the JSGL element on which the event took place. If there
 * is no such element, e.g. if the event has been captured at an empty part of
 * a <code>jsgl.Panel</code> object, <code>null</code> is returned.
 */ 
jsgl.MouseEvent.prototype.getSourceElement = function() {

  return this.sourceElement;
}

/**
 * @description Gets the type of the event in processing of which the current
 * mouse event object has been generated.
 * @methodOf jsgl.MouseEvent#
 * @returns {Number}
 * @since version 2.0    
 */ 
jsgl.MouseEvent.prototype.getEventType = function() {

  return this.eventType;
};/**
 * @fileOverview Declaration of </code>jsgl.path.AbstractPathSegment</code> class.
 * @author Tomas Rehorek
 * @since version 2.0
 */

/**
 * @class Base class for any SVG path segment command as declared in W3C SVG 1.1
 * Recommendation, Section 8.3. It declared what a pen movement command must be
 * able to do, e.g. it must be able to express itself in both the VML and SVG
 * path commands. For the pupropse of emulation SVG path by VML path, several
 * necessary hacks are included, e.g. the command must be able to determine new
 * absolute position based on the current absolute position. This is because in
 * VML, there are no relative commands, resulting in the necessity to emulate
 * them by the absolute ones. Moreover, some other hackery methods for emulating
 * smooth beziers and subpath starting and closing are included.
 * @constructor
 * @description Base class for any SVG path segment command class.
 * @since version 2.0
 */ 
jsgl.path.AbstractPathSegment = function() {

  /**
   * The MVC event raiser responsible for propagation of changes made in the
   * path segment command. The set of listeners will always contain all the
   * JSGL API shape elements that use the segment (though there will typically
   * be only one such element). Whenever the path segment changes (e.g. when the
   * X-coordinate of the second control point of cubic bezier curve command is
   * set to a new value), an event is raised, making the JSGL elements that use
   * the path segment repaint.
   * @type jsgl.util.EventRaiser
   * @private
   */            
  this.onChangeRaiser = new jsgl.util.EventRaiser();
}

/**
 * @description Registers a function listening to changes in the path segment 
 * command. Typically, JSGL element that uses the command in its path needs to
 * register for changes listening as it needs to be repainted whenever a change
 * in some of its path commands happens.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @param {function} listener The function to start listening to changes in the
 * path command. 
 * @private
 * @since version 2.0 
 */ 
jsgl.path.AbstractPathSegment.prototype.registerChangeListener = function(listener) {

  this.onChangeRaiser.registerListener(listener);
}

/**
 * @description Unregisters a function that is already listening to the path
 * segment command's changes from the pool of listeners. This is typically done
 * by the API element after the command is removed from its path. When such
 * thing happens, changes made to the path command are not imporant for the
 * element anymore.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @param {function} listener The already-listening function that should not
 * listen to the changes in the path segment command anymore.
 * @private
 * @since version 2.0   
 */
jsgl.path.AbstractPathSegment.prototype.unregisterChangeListener = function(listener) {

  this.onChangeRaiser.unregisterListener(listener);
} 

/**
 * @description Outputs the path segment to the SVG path segment command string.
 * Typically, this is trivial since JSGL's implementation closely follows the
 * SVG standard and hence there always exists an appropriate path command string
 * in SVG.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @returns {string} The SVG path command.
 * @since version 2.0     
 */ 
jsgl.path.AbstractPathSegment.prototype.toSvgCommand = function() {

  throw "not implemented";
}

/**
 * @description Outputs the path segment to the VML path commands string. This
 * sometimes results in a sequence of multiple commands since some SVG commands
 * cannot be emulated straightforwardly. 
 * @private
 */ 
jsgl.path.AbstractPathSegment.prototype.toVmlCommand = function(pathHistory) {

  throw "not implemented";
}

/**
 * @description Gets the absolute location of the ending point of the segment,
 * i.e. gets the new current point after the path segment command is applied.
 * @methodOf jsgl.path.AbstractPathSegment# 
 * @returns {jsgl.Vector2D} Absolute location of the segment's ending point. 
 * @private
 * 
 *  
 */
jsgl.path.AbstractPathSegment.prototype.getNewLocation = function(pathHistory) {

  return new jsgl.Vector2D(Number.NaN, Number.NaN);
}

/**
 * @private
 */
jsgl.path.AbstractPathSegment.prototype.startsNewSubpath = function() {

  return false;
}

/**
 * @description Determines whether or not the segment is a close path segment.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @returns {boolean}
 * @private
 * @since version 2.0 
 */ 
jsgl.path.AbstractPathSegment.prototype.closesSubpath = function() {

  return false;
}

/**
 * @description Determines whether or not the path segment is cubic bezier.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @returns {boolean} True if and only if the path segment is cubic bezier. 
 * @private
 * @since version 2.0 
 */ 
jsgl.path.AbstractPathSegment.prototype.isCubicBezier = function() {

  return false;
}

/**
 * @description Gets the absolute location of the last control point if the
 * path segment is cubic bezier. For most path segments, this is not applicable.
 * It is important for emulation of shorthand/smooth cubic bezier segments using
 * VML.
 * @methodOf jsgl.path.AbstractPathSegment# 
 * @param {object} pathHistory the path history object provided by VML path
 * translator. 
 * @returns {jsgl.Vector2D} Absolute location of the last control point.
 * @private
 * @since version 2.0 
 */
jsgl.path.AbstractPathSegment.prototype.getCBControlPoint = function(pathHistory) {

  throw "not applicable";
}

/**
 * @description Determines whether or not the path segment is quadratic bezier.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @returns {boolean} True if and only if the path segment is quadratic bezier.
 * @private
 * @since version 2.0 
 */ 
jsgl.path.AbstractPathSegment.prototype.isQuadraticBezier = function() {

  return false;
}

/**
 * @description Gets the absolute location of the control point if the path
 * segment is quadratic bezier. For most path segments, this is not applicable.
 * It is important for emulation of shorthand/smooth quadratic bezier segments
 * using VML.
 * @methodOf jsgl.path.AbstractPathSegment#
 * @param {object} pathHistory The path history object provided by VML path
 * translator.
 * @returns {jsgl.Vector2D} Absolute location of the control point.
 * @private
 * @since version 2.0 
 */
jsgl.path.AbstractPathSegment.prototype.getQBControlPoint = function(pathHistory) {

  throw "not applicable";
} ;
jsgl.path.AbstractMoveTo = function(x, y) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.location = new jsgl.Vector2D(x || 0, y || 0);
}
jsgl.path.AbstractMoveTo.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractMoveTo.prototype.getX = function() {

  return this.location.X;
}

jsgl.path.AbstractMoveTo.prototype.setX = function(newX) {

  this.location.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractMoveTo.prototype.getY = function() {

  return this.location.Y;
}

jsgl.path.AbstractMoveTo.prototype.setY = function(newY) {

  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractMoveTo.prototype.getLocation = function() {

  return jsgl.cloneObject(this.location);
}

jsgl.path.AbstractMoveTo.prototype.setLocation = function(location) {

  this.location = jsgl.cloneObject(location);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractMoveTo.prototype.setLocationXY = function(newX, newY) {

  this.location.X = newX;
  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}


/**
 * @private
 */
jsgl.path.AbstractMoveTo.prototype.startsNewSubpath = function() {

  return true;
} 
;
jsgl.path.AbsoluteMoveTo = function(x, y) {

  jsgl.path.AbstractMoveTo.call(this, x || 0, y || 0);
}
jsgl.path.AbsoluteMoveTo.jsglExtend(
  jsgl.path.AbstractMoveTo);

jsgl.path.AbsoluteMoveTo.prototype.toSvgCommand = function() {

  return "M" + this.location.X + "," + this.location.Y;
}

jsgl.path.AbsoluteMoveTo.prototype.toVmlCommand = function(pathHistory) {

  return "m" + (this.location.X).jsglVmlize() + "," + (this.location.Y).jsglVmlize();
}

jsgl.path.AbsoluteMoveTo.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.location);
};
jsgl.path.RelativeMoveTo = function(x, y) {

  jsgl.path.AbstractMoveTo.call(this, x || 0, y || 0);
}
jsgl.path.RelativeMoveTo.jsglExtend(
  jsgl.path.AbstractMoveTo);

jsgl.path.RelativeMoveTo.prototype.toSvgCommand = function() {

  return "m" + this.location.X + "," + this.location.Y;
}

jsgl.path.RelativeMoveTo.prototype.toVmlCommand = function(pathHistory) {

  return "t" + (this.location.X).jsglVmlize() + "," + (this.location.Y).jsglVmlize();
}

jsgl.path.RelativeMoveTo.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.location);
}
;
jsgl.path.AbstractLineTo = function(x, y) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.location = new jsgl.Vector2D(x || 0, y || 0);
}
jsgl.path.AbstractLineTo.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractLineTo.prototype.getX = function() {

  return this.location.X;
}

jsgl.path.AbstractLineTo.prototype.setX = function(newX) {

  this.location.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractLineTo.prototype.getY = function() {

  return this.location.Y;
}

jsgl.path.AbstractLineTo.prototype.setY = function(newY) {

  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractLineTo.prototype.getEndPoint = function() {

  return jsgl.cloneObject(this.location);
}

jsgl.path.AbstractLineTo.prototype.setEndPoint = function(location) {

  this.location = jsgl.cloneObject(location);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractLineTo.prototype.setEndPointXY = function(newX, newY) {

  this.location.X = newX;
  this.location.Y = newY;
  this.onChangeRaiser.raiseEvent();
};
jsgl.path.AbsoluteLineTo = function(x, y) {

  jsgl.path.AbstractLineTo.call(this, x || 0, y || 0);
}
jsgl.path.AbsoluteLineTo.jsglExtend(
  jsgl.path.AbstractLineTo);

jsgl.path.AbsoluteLineTo.prototype.toSvgCommand = function() {

  return "L" + this.location.X + "," + this.location.Y;
}

jsgl.path.AbsoluteLineTo.prototype.toVmlCommand = function(pathHistory) {

  return "l" + (this.location.X).jsglVmlize() + "," + (this.location.Y).jsglVmlize();
}

jsgl.path.AbsoluteLineTo.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.location);
};
jsgl.path.RelativeLineTo = function(x, y) {

  jsgl.path.AbstractLineTo.call(this, x || 0, y || 0);
}
jsgl.path.RelativeLineTo.jsglExtend(
  jsgl.path.AbstractLineTo);

jsgl.path.RelativeLineTo.prototype.toSvgCommand = function() {

  return "l" + this.location.X + "," + this.location.Y;
}

jsgl.path.RelativeLineTo.prototype.toVmlCommand = function(pathHistory) {

  return "r" + (this.location.X).jsglVmlize() + "," + (this.location.Y).jsglVmlize();
}

jsgl.path.RelativeLineTo.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.location);
};
jsgl.path.ClosePath = function() {

  jsgl.path.AbstractPathSegment.call(this);
}
jsgl.path.ClosePath.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.ClosePath.prototype.toSvgCommand = function() {

  return "Z";
}

jsgl.path.ClosePath.prototype.toVmlCommand = function(pathHistory) {

  return "xm" + (pathHistory.lastStart.X).jsglVmlize() + "," + (pathHistory.lastStart.Y).jsglVmlize();
}

jsgl.path.ClosePath.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(pathHistory.currLoc);
}

jsgl.path.ClosePath.prototype.closesSubpath = function() {

  return true;
};
jsgl.path.AbsoluteHorizontalLineTo = function(x) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.x = x || 0;
}
jsgl.path.AbsoluteHorizontalLineTo.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbsoluteHorizontalLineTo.prototype.getX = function() {

  return this.x;
}

jsgl.path.AbsoluteHorizontalLineTo.prototype.setX = function(newX) {

  this.x = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbsoluteHorizontalLineTo.prototype.toSvgCommand = function() {

  return "H" + this.x;
}

jsgl.path.AbsoluteHorizontalLineTo.prototype.toVmlCommand = function(pathHisotry) {

  return "l" + (this.x).jsglVmlize() + "," + (pathHistory.currLoc.Y).jsglVmlize();
}

jsgl.path.AbsoluteHorizontalLineTo.prototype.getNewLocation = function(pathHistory) {

  return new jsgl.Vector2D(this.x, pathHistory.currLoc.Y);
};
jsgl.path.RelativeHorizontalLineTo = function(x) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.x = x || 0;
}
jsgl.path.RelativeHorizontalLineTo.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.RelativeHorizontalLineTo.prototype.getX = function() {

  return this.x;
}

jsgl.path.RelativeHorizontalLineTo.prototype.setX = function(newX) {

  this.x = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.RelativeHorizontalLineTo.prototype.toSvgCommand = function() {

  return "h" + this.x;
}

jsgl.path.RelativeHorizontalLineTo.prototype.toVmlCommand = function(pathHistory) {

  return "r" + (this.x).jsglVmlize() + ",0";
}

jsgl.path.RelativeHorizontalLineTo.prototype.getNewLocation = function(pathHistory) {

  return new jsgl.Vector2D(pathHistory.currLoc.X + this.x, pathHistory.currLoc.Y);
};
jsgl.path.AbsoluteVerticalLineTo = function(y) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.y = y || 0;
}
jsgl.path.AbsoluteVerticalLineTo.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbsoluteVerticalLineTo.prototype.getY = function() {

  return this.y;
}

jsgl.path.AbsoluteVerticalLineTo.prototype.setY = function(newY) {

  this.y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbsoluteVerticalLineTo.prototype.toSvgCommand = function() {

  return "V" + this.y;
}

jsgl.path.AbsoluteVerticalLineTo.prototype.toVmlCommand = function(pathHistory) {

  return "l" + (pathHistory.currLoc.X).jsglVmlize() + "," + (this.y).jsglVmlize();
}

jsgl.path.AbsoluteVerticalLineTo.prototype.getNewLocation = function(pathHistory) {

  return new jsgl.Vector2D(pathHistory.currLoc.X, this.y);
};
jsgl.path.RelativeVerticalLineTo = function(y) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.y = y || 0;
}
jsgl.path.RelativeVerticalLineTo.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.RelativeVerticalLineTo.prototype.getY = function() {

  return this.y;
}

jsgl.path.RelativeVerticalLineTo.prototype.setY = function(newY) {

  this.y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.RelativeVerticalLineTo.prototype.toSvgCommand = function() {

  return "v" + this.y;
}

jsgl.path.RelativeVerticalLineTo.prototype.toVmlCommand = function(pathHistory) {

  return "r0," + (this.y).jsglVmlize();
}

jsgl.path.RelativeVerticalLineTo.prototype.getNewLocation = function(pathHistory) {

  return new jsgl.Vector2D(pathHistory.currLoc.X, pathHistory.currLoc.Y + this.y);
};
jsgl.path.AbstractCubicBezier = function(c1x, c1y, c2x, c2y, endX, endY) {

  jsgl.path.AbstractPathSegment.call(this);

  this.control1 = new jsgl.Vector2D(c1x || 0, c1y || 0);

  this.control2 = new jsgl.Vector2D(c2x || 0, c2y || 0);
  
  this.endPoint = new jsgl.Vector2D(endX || 0, endY || 0);
}
jsgl.path.AbstractCubicBezier.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractCubicBezier.prototype.getControl1X = function() {

  return this.control1.X;
}

jsgl.path.AbstractCubicBezier.prototype.setControl1X = function(newX) {

  this.control1.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getControl1Y = function() {

  return this.control1.Y;
}

jsgl.path.AbstractCubicBezier.prototype.setControl1Y = function(newY) {

  this.control1.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getControl1Point = function() {

  return jsgl.cloneObject(this.control1);
}

jsgl.path.AbstractCubicBezier.prototype.setControl1Point = function(newLocation) {

  this.control1 = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getControl2X = function() {

  return this.control2.X;
}

jsgl.path.AbstractCubicBezier.prototype.setControl2X = function(newX) {

  this.control2.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getControl2Y = function() {

  return this.control2.Y;
}

jsgl.path.AbstractCubicBezier.prototype.setControl2Y = function(newY) {

  this.control2.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getControl2Point = function() {

  return jsgl.cloneObject(this.control2);
}

jsgl.path.AbstractCubicBezier.prototype.setControl2Point = function(newLocation) {

  this.control2 = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getEndX = function() {

  return this.endPoint.X;
}

jsgl.path.AbstractCubicBezier.prototype.setEndX = function(newX) {

  this.endPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getEndY = function() {

  return this.endPoint.Y;
}

jsgl.path.AbstractCubicBezier.prototype.setEndY = function(newY) {

  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractCubicBezier.prototype.getEndPoint = function() {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbstractCubicBezier.prototype.setEndPoint = function(newLocation) {

  this.endPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @private
 */
jsgl.path.AbstractCubicBezier.prototype.isCubicBezier = function() {

  return true;
} ;
jsgl.path.AbsoluteCubicBezier = function(c1x, c1y, c2x, c2y, endX, endY) {

  jsgl.path.AbstractCubicBezier.call(
    this, c1x || 0, c1y || 0, c2x || 0, c2y || 0, endX || 0, endY || 0);
}
jsgl.path.AbsoluteCubicBezier.jsglExtend(
  jsgl.path.AbstractCubicBezier);

jsgl.path.AbsoluteCubicBezier.prototype.toSvgCommand = function() {

  return "C" + this.control1.X + "," + this.control1.Y +
         "," + this.control2.X + "," + this.control2.Y +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.AbsoluteCubicBezier.prototype.toVmlCommand = function(pathHistory) {

  return "c" + (this.control1.X).jsglVmlize() + "," + (this.control1.Y).jsglVmlize() +
         "," + (this.control2.X).jsglVmlize() + "," + (this.control2.Y).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() + "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.AbsoluteCubicBezier.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.endPoint);
}

/**
 * @private
 */
jsgl.path.AbsoluteCubicBezier.prototype.getCBControlPoint = function(pathHistory) {

  return jsgl.cloneObject(this.control2);
};
jsgl.path.RelativeCubicBezier = function(c1x, c1y, c2x, c2y, endX, endY) {

  jsgl.path.AbstractCubicBezier.call(
    this, c1x || 0, c1y || 0, c2x || 0, c2y || 0, endX || 0, endY || 0);
}
jsgl.path.RelativeCubicBezier.jsglExtend(
  jsgl.path.AbstractCubicBezier);

jsgl.path.RelativeCubicBezier.prototype.toSvgCommand = function() {

  return "c" + this.control1.X + "," + this.control1.Y +
         "," + this.control2.X + "," + this.control2.Y +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.RelativeCubicBezier.prototype.toVmlCommand = function(pathHistory) {

  return "v" + (this.control1.X).jsglVmlize() + "," + (this.control1.Y).jsglVmlize() +
         "," + (this.control2.X).jsglVmlize() + "," + (this.control2.Y).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() + "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.RelativeCubicBezier.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.endPoint);
}

/**
 * @private
 */
jsgl.path.RelativeCubicBezier.prototype.getCBControlPoint = function(pathHistory)  {

  return pathHistory.currLoc.add(this.control2);
};
jsgl.path.AbstractSmoothCubicBezier = function(controlX, controlY, endX, endY) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.controlPoint = new jsgl.Vector2D(controlX || 0, controlY || 0);
  
  this.endPoint = new jsgl.Vector2D(endX || 0, endY || 0);
}
jsgl.path.AbstractSmoothCubicBezier.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractSmoothCubicBezier.prototype.getControlX = function() {

  return this.controlPoint.X;
}

jsgl.path.AbstractSmoothCubicBezier.prototype.setControlX = function(newX) {

  this.controlPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothCubicBezier.prototype.getControlY = function() {

  return this.controlPoint.Y;
}

jsgl.path.AbstractSmoothCubicBezier.prototype.setControlY = function(newY) {

  this.controlPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothCubicBezier.prototype.getControlPoint = function() {

  return this.controlPoint;
}

jsgl.path.AbstractSmoothCubicBezier.prototype.setControlPoint = function(newLocation) {

  this.controlPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothCubicBezier.prototype.getEndX = function() {

  return this.endPoint.X;
}

jsgl.path.AbstractSmoothCubicBezier.prototype.setEndX = function(newX) {

  this.endPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothCubicBezier.prototype.getEndY = function() {

  return this.endPoint.Y;
}

jsgl.path.AbstractSmoothCubicBezier.prototype.setEndY = function(newY) {

  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothCubicBezier.prototype.getEndPoint = function() {

  return this.endPoint;
}

jsgl.path.AbstractSmoothCubicBezier.prototype.setEndPoint = function(newLocation) {

  this.endPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @private
 */ 
jsgl.path.AbstractSmoothCubicBezier.prototype.isCubicBezier = function() {

  return true;
};
jsgl.path.AbsoluteSmoothCubicBezier = function(controlX, controlY, endX, endY) {

  jsgl.path.AbstractSmoothCubicBezier.call(
    this, controlX || 0, controlY || 0, endX || 0, endY || 0);
}
jsgl.path.AbsoluteSmoothCubicBezier.jsglExtend(
  jsgl.path.AbstractSmoothCubicBezier);

jsgl.path.AbsoluteSmoothCubicBezier.prototype.toSvgCommand = function() {

  return "S" + this.controlPoint.X + "," + this.controlPoint.Y +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.AbsoluteSmoothCubicBezier.prototype.toVmlCommand = function(pathHistory) {

  var newCtlPoint = new jsgl.Vector2D(
    2*pathHistory.currLoc.X - pathHistory.lastCBCtl.X,
    2*pathHistory.currLoc.Y - pathHistory.lastCBCtl.Y);

  return "c" + (newCtlPoint.X).jsglVmlize() + "," + (newCtlPoint.Y).jsglVmlize() +
         "," + (this.controlPoint.X).jsglVmlize() + "," + (this.controlPoint.Y).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() + "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.AbsoluteSmoothCubicBezier.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbsoluteSmoothCubicBezier.prototype.getCBControlPoint = function(pathHistory) {

  return jsgl.cloneObject(this.controlPoint);
};
jsgl.path.RelativeSmoothCubicBezier = function(controlX, controlY, endX, endY) {

  jsgl.path.AbstractSmoothCubicBezier.call(
    this, controlX || 0, controlY || 0, endX || 0, endY || 0);
}
jsgl.path.RelativeSmoothCubicBezier.jsglExtend(
  jsgl.path.AbstractSmoothCubicBezier);

jsgl.path.RelativeSmoothCubicBezier.prototype.toSvgCommand = function() {

  return "s" + this.controlPoint.X + "," + this.controlPoint.Y +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.RelativeSmoothCubicBezier.prototype.toVmlCommand = function(pathHistory) {

  var newCtlPoint = new jsgl.Vector2D(
    pathHistory.currLoc.X - pathHistory.lastCBCtl.X,
    pathHistory.currLoc.Y - pathHistory.lastCBCtl.Y);
  
  return "v" + (newCtlPoint.X).jsglVmlize() + "," + (newCtlPoint.Y).jsglVmlize() +
         "," + (this.controlPoint.X).jsglVmlize() + "," + (this.controlPoint.Y).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() + "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.RelativeSmoothCubicBezier.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.endPoint);
}

jsgl.path.RelativeSmoothCubicBezier.prototype.getCBControlPoint = function(pathHistory) {

  return pathHistory.currLoc.add(this.controlPoint);
};
jsgl.path.AbstractQuadraticBezier = function(controlX, controlY, endX, endY) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.controlPoint = new jsgl.Vector2D(controlX || 0, controlY || 0);
  
  this.endPoint = new jsgl.Vector2D(endX || 0, endY || 0);
}
jsgl.path.AbstractQuadraticBezier.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractQuadraticBezier.prototype.getControlX = function() {

  return this.controlPoint.X;
}

jsgl.path.AbstractQuadraticBezier.prototype.setControlX = function(newX) {

  this.controlPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractQuadraticBezier.prototype.getControlY = function() {

  return this.controlPoint.Y;
}

jsgl.path.AbstractQuadraticBezier.prototype.setControlY = function(newY) {

  this.controlPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractQuadraticBezier.prototype.getControlPoint = function() {

  return jsgl.cloneObject(this.controlPoint);
}

jsgl.path.AbstractQuadraticBezier.prototype.setControlPoint = function(newLocation) {

  this.controlPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractQuadraticBezier.prototype.getEndX = function() {

  return this.endPoint.X;
}

jsgl.path.AbstractQuadraticBezier.prototype.setEndX = function(newX) {

  this.endPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractQuadraticBezier.prototype.getEndY = function() {

  return this.endPoint.Y;
}

jsgl.path.AbstractQuadraticBezier.prototype.setEndY = function(newY) {

  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractQuadraticBezier.prototype.getEndPoint = function() {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbstractQuadraticBezier.prototype.setEndPoint = function(newLocation) {

  this.endPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @private
 */ 
jsgl.path.AbstractQuadraticBezier.prototype.isQuadraticBezier = function() {

  return true;
};
jsgl.path.AbsoluteQuadraticBezier = function(controlX, controlY, endX, endY) {

  jsgl.path.AbstractQuadraticBezier.call(
    this, controlX || 0, controlY || 0, endX || 0, endY || 0);
}
jsgl.path.AbsoluteQuadraticBezier.jsglExtend(
  jsgl.path.AbstractQuadraticBezier);

jsgl.path.AbsoluteQuadraticBezier.prototype.toSvgCommand = function() {

  return "Q" + this.controlPoint.X + "," + this.controlPoint.Y +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.AbsoluteQuadraticBezier.prototype.toVmlCommand = function(pathHistory) {

  /* 'qb' path command does not work on MSIE */
  return "c" + ((pathHistory.currLoc.X + 2*this.controlPoint.X)/3).jsglVmlize() +
         "," + ((pathHistory.currLoc.Y + 2*this.controlPoint.Y)/3).jsglVmlize() +
         "," + ((2*this.controlPoint.X + this.endPoint.X)/3).jsglVmlize() +
         "," + ((2*this.controlPoint.Y + this.endPoint.Y)/3).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() +
         "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.AbsoluteQuadraticBezier.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbsoluteQuadraticBezier.prototype.getQBControlPoint = function(pathHistory) {

  return jsgl.cloneObject(this.controlPoint);
};
jsgl.path.RelativeQuadraticBezier = function(controlX, controlY, endX, endY) {

  jsgl.path.AbstractQuadraticBezier.call(
    this, controlX || 0, controlY || 0, endX || 0, endY || 0);
}
jsgl.path.RelativeQuadraticBezier.jsglExtend(
  jsgl.path.AbstractQuadraticBezier);

jsgl.path.RelativeQuadraticBezier.prototype.toSvgCommand = function() {

  return "q" + this.controlPoint.X + "," + this.controlPoint.Y +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.RelativeQuadraticBezier.prototype.toVmlCommand = function(pathHistory) {

  /* 'qb' path command does not work on MSIE */
  return "c" + (pathHistory.currLoc.X + (2*this.controlPoint.X)/3).jsglVmlize() +
         "," + (pathHistory.currLoc.Y + (2*this.controlPoint.Y)/3).jsglVmlize() +
         "," + (pathHistory.currLoc.X + (2*this.controlPoint.X + this.endPoint.X)/3).jsglVmlize() +
         "," + (pathHistory.currLoc.Y + (2*this.controlPoint.Y + this.endPoint.Y)/3).jsglVmlize() +
         "," + (pathHistory.currLoc.X + this.endPoint.X).jsglVmlize() +
         "," + (pathHistory.currLoc.Y + this.endPoint.Y).jsglVmlize();
}

jsgl.path.RelativeQuadraticBezier.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.endPoint);
}

jsgl.path.RelativeQuadraticBezier.prototype.getQBControlPoint = function(pathHistory) {

  return pathHistory.currLoc.add(this.controlPoint);
};
jsgl.path.AbstractSmoothQuadraticBezier = function(x, y) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.endPoint = new jsgl.Vector2D(x || 0, y || 0);
}
jsgl.path.AbstractSmoothQuadraticBezier.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractSmoothQuadraticBezier.prototype.getEndX = function() {

  return this.endPoint.X;
}

jsgl.path.AbstractSmoothQuadraticBezier.prototype.setEndX = function(newX) {

  this.endPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothQuadraticBezier.prototype.getEndY = function() {

  return this.endPoint.Y;
}

jsgl.path.AbstractSmoothQuadraticBezier.prototype.setEndY = function(newY) {

  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractSmoothQuadraticBezier.prototype.getEndPoint = function() {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbstractSmoothQuadraticBezier.prototype.setEndPoint = function(newLocation) {

  this.endPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent(newLocation);
}

jsgl.path.AbstractSmoothQuadraticBezier.prototype.isQuadraticBezier = function() {

  return true;
};
jsgl.path.AbsoluteSmoothQuadraticBezier = function(x, y) {

  jsgl.path.AbstractSmoothQuadraticBezier.call(this, x || 0, y || 0);
}
jsgl.path.AbsoluteSmoothQuadraticBezier.jsglExtend(
  jsgl.path.AbstractSmoothQuadraticBezier);

jsgl.path.AbsoluteSmoothQuadraticBezier.prototype.toSvgCommand = function() {

  return "T" + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.AbsoluteSmoothQuadraticBezier.prototype.toVmlCommand = function(pathHistory) {

  var newCtlPoint = new jsgl.Vector2D(
    2*pathHistory.currLoc.X - pathHistory.lastQBCtl.X,
    2*pathHistory.currLoc.Y - pathHistory.lastQBCtl.Y);

  return "c" + ((pathHistory.currLoc.X + 2*newCtlPoint.X)/3).jsglVmlize() +
         "," + ((pathHistory.currLoc.Y + 2*newCtlPoint.Y)/3).jsglVmlize() +
         "," + ((2*newCtlPoint.X + this.endPoint.X)/3).jsglVmlize() +
         "," + ((2*newCtlPoint.Y + this.endPoint.Y)/3).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() +
         "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.AbsoluteSmoothQuadraticBezier.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbsoluteSmoothQuadraticBezier.prototype.getQBControlPoint = function(pathHistory) {

  return newCtlPoint = new jsgl.Vector2D(
    2*pathHistory.currLoc.X - pathHistory.lastQBCtl.X,
    2*pathHistory.currLoc.Y - pathHistory.lastQBCtl.Y);
};
jsgl.path.RelativeSmoothQuadraticBezier = function(x, y) {

  jsgl.path.AbstractSmoothQuadraticBezier.call(this, x || 0, y || 0);
}
jsgl.path.RelativeSmoothQuadraticBezier.jsglExtend(
  jsgl.path.AbstractSmoothQuadraticBezier);

jsgl.path.RelativeSmoothQuadraticBezier.prototype.toSvgCommand = function() {

  return "t" + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.RelativeSmoothQuadraticBezier.prototype.toVmlCommand = function(pathHistory) {

  var newCtlPoint = new jsgl.Vector2D(
    pathHistory.currLoc.X - pathHistory.lastQBCtl.X,
    pathHistory.currLoc.Y - pathHistory.lastQBCtl.Y);
  
  return "v" + ((2*newCtlPoint.X)/3).jsglVmlize() +
         "," + ((2*newCtlPoint.Y)/3).jsglVmlize() +
         "," + ((2*newCtlPoint.X + this.endPoint.X)/3).jsglVmlize() +
         "," + ((2*newCtlPoint.Y + this.endPoint.Y)/3).jsglVmlize() +
         "," + (this.endPoint.X).jsglVmlize() +
         "," + (this.endPoint.Y).jsglVmlize();
}

jsgl.path.RelativeSmoothQuadraticBezier.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.endPoint);
}

jsgl.path.RelativeSmoothQuadraticBezier.prototype.getQBControlPoint = function(pathHistory) {

  return new jsgl.Vector2D(
    2*pathHistory.currLoc.X - pathHistory.lastQBCtl.X,
    2*pathHistory.currLoc.Y - pathHistory.lastQBCtl.Y);
};
jsgl.path.AbstractEllipticalArc = function(rx, ry, rotation, largeArc, sweep, endX, endY) {

  jsgl.path.AbstractPathSegment.call(this);
  
  this.radii = new jsgl.Vector2D(rx || 0, ry || 0);
  
  this.rotation = rotation || 0;
  
  this.largeArc = !!largeArc;
  
  this.sweep = !!sweep;
  
  this.endPoint = new jsgl.Vector2D(endX || 0, endY || 0);
}
jsgl.path.AbstractEllipticalArc.jsglExtend(
  jsgl.path.AbstractPathSegment);

jsgl.path.AbstractEllipticalArc.prototype.getXRadius = function() {

  return this.radii.X;
}

jsgl.path.AbstractEllipticalArc.prototype.setXRadius = function(newRX) {

  this.radii.X = newRX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getYRadius = function() {

  return this.radii.Y;
}

jsgl.path.AbstractEllipticalArc.prototype.setYRadius = function(newRY) {

  this.radii.Y = newRY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getRadii = function() {

  return jsgl.cloneObject(this.radii);
}

jsgl.path.AbstractEllipticalArc.prototype.setRadii = function(newRadii) {

  this.radii = jsgl.cloneObject(newRadii);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.setRadiiXY = function(newRX, newRY) {

  this.radii = new jsgl.Vector2D(newRX, newRY);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getRotation = function() {

  return this.rotation;
}

jsgl.path.AbstractEllipticalArc.prototype.setRotation = function(newRotation) {

  this.rotation = newRotation;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getLargeArc = function() {

  return this.largeArc;
}

jsgl.path.AbstractEllipticalArc.prototype.setLargeArc = function(largeArc) {

  this.largeArc = !!largeArc;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getSweep = function() {

  return this.sweep;
}

jsgl.path.AbstractEllipticalArc.prototype.setSweep = function(sweep) {

  this.sweep = !!sweep;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getEndX = function() {

  return this.endPoint.X;
}

jsgl.path.AbstractEllipticalArc.prototype.setEndX = function(newX) {

  this.endPoint.X = newX;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getEndY = function() {

  return this.endPoint.Y;
}

jsgl.path.AbstractEllipticalArc.prototype.setEndY = function(newY) {

  this.endPoint.Y = newY;
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.getEndPoint = function() {

  return jsgl.cloneObject(this.endPoint);
}

jsgl.path.AbstractEllipticalArc.prototype.setEndPoint = function(newLocation) {

  this.endPoint = jsgl.cloneObject(newLocation);
  this.onChangeRaiser.raiseEvent();
}

jsgl.path.AbstractEllipticalArc.prototype.setEndPointXY = function(newX, newY) {

  this.endPoint = new jsgl.Vector2D(newX, newY);
  this.onChangeRaiser.raiseEvent();
}

/**
 * @private
 */ 
jsgl.path.AbstractEllipticalArc.prototype.bezierApproximation = function(x1, y1, phi, rx, ry, x2, y2, numInterpols) {

  /* Based on Dr. Olaf Hoffmann's
     http://hoffmann.bplaced.net/svgueb/zeig.php?was=ellipse05.php */
  
  var rx = Math.abs(rx),
      ry = Math.abs(ry),
      phi = Math.PI * phi / 180,
      ca = Math.cos(phi),
      sa = Math.sin(phi);
  
  if((rx == 0 && ry == 0) || (x1 == x2 && y1 == y2)) {
  
    return "l" + x1.jsglVmlize() + "," + y1.jsglVmlize() +
           "," + x2.jsglVmlize() + "," + y2.jsglVmlize();
  }
  
  var xs1 = (ca*(x1-x2) + sa*(y1-y2)) / 2,
      ys1 = (-sa*(x1-x2) + ca*(y1-y2)) / 2,
      lambda = Math.sqrt((xs1 * xs1)/(rx * rx) + (ys1 * ys1)/(ry * ry));
  
  if(lambda > 1) {
    
    rx *= lambda;
    ry *= lambda;
  }
  
  var fA = this.largeArc,
      fS = this.sweep,
      mltp = (fA == fS) ? -1 : 1,
      wt1 = rx*rx*ry*ry;
      wt2 = rx*rx*ys1*ys1 + ry*ry*xs1*xs1,
      root = Math.sqrt(Math.max(0, wt1/wt2-1)),
      cxs = mltp*root*rx*ys1 / ry,
      cys = -mltp*root*ry*xs1 / rx,
      cx = ca*cxs - sa*cys + (x1+x2)/2, 
      cy = sa*cxs + ca*cys + (y1+y2)/2,
      xt1 = ca*(x1-cx) + sa*(y1-cy),
      yt1 = -sa*(x1-cx) + ca*(y1-cy),
      xt2 = ca*(x2-cx) + sa*(y2-cy),
      yt2 = -sa*(x2-cx) + ca*(y2-cy),
      th1 = xt1 / rx,
      th2 = yt1 / ry,
      th3 = xt2 / rx,
      th4 = yt2 / ry,
      vh = (yt1 >= 0 ? 1 : -1),
      vg = (yt2 >= 0 ? 1 : -1),
      theta1 = vh * Math.acos(th1 / Math.sqrt(th1*th1 + th2*th2)),
      theta2 = vg * Math.acos(th3 / Math.sqrt(th3*th3 + th4*th4)),
      dtheta = Math.abs(theta2 - theta1),
      dthetb = Math.abs(dtheta - 2*Math.PI);
      
  if(fA) {

    dtheta = Math.max(dtheta, dthetb);
  }
  else {
  
    dtheta = Math.min(dtheta, dthetb);
  }
  
  if(!fS) {
  
    dtheta *= -1;
  }
  
  
  var dPhi = dtheta / numInterpols,
      data = [];
  
  for(var i=0; i<=numInterpols; i++) {
  
    data[i] = [];
  
    var tt = i * dPhi,
        cpi = Math.cos(tt + theta1),
        spi = Math.sin(tt + theta1),
        xx = rx*cpi,
        yy = ry*spi,
        dx = -dPhi*rx*spi,
        dy = dPhi*ry*cpi;
    
    data[i][0] = ca*xx - sa*yy + cx;
    data[i][1] = sa*xx + ca*yy + cy;
    data[i][2] = ca*dx - sa*dy;
    data[i][3] = sa*dx + ca*dy;
  }
  
  var cpx = data[0][0] + data[0][2] / 3,
      cpy = data[0][1] + data[0][3] / 3;
  
  var cq = [];
  
  for(var i=0; i<=numInterpols; i++) {
  
    cq[i] = { x : data[i][0] - data[i][2] / 3,
              y : data[i][1] - data[i][3] / 3 };
  }
  
  var result = 'l' + data[0][0].jsglVmlize() + ',' + data[0][1].jsglVmlize() +
               'c' + cpx.jsglVmlize() + ',' + cpy.jsglVmlize() + ',' +
               cq[1].x.jsglVmlize() + ',' + cq[1].y.jsglVmlize() + ',' +
               data[1][0].jsglVmlize() + ',' + data[1][1].jsglVmlize();
  
  for(var i=2; i<=numInterpols; i++) {

    result += 'c' + (2*data[i-1][0] - cq[i-1].x).jsglVmlize() +
              ',' + (2*data[i-1][1] - cq[i-1].y).jsglVmlize() + ',' +
              cq[i].x.jsglVmlize() + ',' + cq[i].y.jsglVmlize() + ',' +
              data[i][0].jsglVmlize() + ',' + data[i][1].jsglVmlize();
  }
  
  return result;
}
;
jsgl.path.AbsoluteEllipticalArc = function(rx, ry, rotation, largeArc, sweep, endX, endY) {

  jsgl.path.AbstractEllipticalArc.call(
    this, rx || 0, ry || 0, rotation || 0, !!largeArc, !!sweep, endX || 0, endY || 0);
}
jsgl.path.AbsoluteEllipticalArc.jsglExtend(
  jsgl.path.AbstractEllipticalArc);

jsgl.path.AbsoluteEllipticalArc.prototype.toSvgCommand = function() {

  return "A" + this.radii.X + "," + this.radii.Y + "," + this.rotation +
         "," + (this.largeArc ? "1" : "0") + "," +  (this.sweep ? "1" : "0") +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.AbsoluteEllipticalArc.prototype.toVmlCommand = function(pathHistory) {

  return this.bezierApproximation(
    pathHistory.currLoc.X, pathHistory.currLoc.Y, this.rotation,
    this.radii.X, this.radii.Y, this.endPoint.X, this.endPoint.Y, 16);

}

jsgl.path.AbsoluteEllipticalArc.prototype.getNewLocation = function(pathHistory) {

  return jsgl.cloneObject(this.endPoint);
};
jsgl.path.RelativeEllipticalArc = function(rx, ry, rotation, largeArc, sweep, endX, endY) {

  jsgl.path.AbstractEllipticalArc.call(
    this, rx || 0, ry || 0, rotation || 0, !!largeArc, !!sweep, endX || 0, endY || 0);
}
jsgl.path.RelativeEllipticalArc.jsglExtend(
  jsgl.path.AbstractEllipticalArc);

jsgl.path.RelativeEllipticalArc.prototype.toSvgCommand = function() {

  return "a" + this.radii.X + "," + this.radii.Y + "," + this.rotation +
         "," + (this.largeArc ? "1" : "0") + "," +  (this.sweep ? "1" : "0") +
         "," + this.endPoint.X + "," + this.endPoint.Y;
}

jsgl.path.RelativeEllipticalArc.prototype.toVmlCommand = function(pathHistory) {

  return this.bezierApproximation(
    pathHistory.currLoc.X, pathHistory.currLoc.Y, this.rotation,
    this.radii.X, this.radii.Y, pathHistory.currLoc.X + this.endPoint.X,
    pathHistory.currLoc.Y + this.endPoint.Y, 16);
}

jsgl.path.RelativeEllipticalArc.prototype.getNewLocation = function(pathHistory) {

  return pathHistory.currLoc.add(this.endPoint);
};