(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * MUI config module
 * @module config
 */

/** Define module API */
module.exports = {
  /** Use debug mode */
  debug: true
};


},{}],2:[function(require,module,exports){
/**
 * MUI CSS/JS jqLite module
 * @module lib/jqLite
 */

'use strict';

// Global vars
var gDoc = document,
    gDocEl = gDoc.documentElement,
    gWin = window;


/**
 * Add a class to an element.
 * @param {Element} element - The DOM element.
 * @param {string} cssClasses - Space separated list of class names.
 */
function jqLiteAddClass(element, cssClasses) {
  if (!cssClasses || !element.setAttribute) return;

  var existingClasses = _getExistingClasses(element),
      splitClasses = cssClasses.split(' '),
      cssClass;

  for (var i=0; i < splitClasses.length; i++) {
    cssClass = splitClasses[i].trim();
    if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
      existingClasses += cssClass + ' ';
    }
  }
  
  element.setAttribute('class', existingClasses.trim());
}


/**
 * Get or set CSS properties.
 * @param {Element} element - The DOM element.
 * @param {string} [name] - The property name.
 * @param {string} [value] - The property value.
 */
function jqLiteCss(element, name, value) {
  // Return full style object
  if (name === undefined) {
    return getComputedStyle(element);
  }

  var nameType = jqLiteType(name);

  // Set multiple values
  if (nameType === 'object') {
    for (var key in name) element.style[_camelCase(key)] = name[key];
    return;
  }

  // Set a single value
  if (nameType === 'string' && value !== undefined) {
    element.style[_camelCase(name)] = value;
  }

  var styleObj = getComputedStyle(element),
      isArray = (jqLiteType(name) === 'array');

  // Read single value
  if (!isArray) return _getCurrCssProp(element, name, styleObj);

  // Read multiple values
  var outObj = {},
      key;

  for (var i=0; i < name.length; i++) {
    key = name[i];
    outObj[key] = _getCurrCssProp(element, key, styleObj);
  }

  return outObj;
}


/**
 * Check if element has class.
 * @param {Element} element - The DOM element.
 * @param {string} cls - The class name string.
 */
function jqLiteHasClass(element, cls) {
  if (!cls || !element.getAttribute) return false;
  return (_getExistingClasses(element).indexOf(' ' + cls + ' ') > -1);
}


/**
 * Return the type of a variable.
 * @param {} somevar - The JavaScript variable.
 */
function jqLiteType(somevar) {
  // handle undefined
  if (somevar === undefined) return 'undefined';

  // handle others (of type [object <Type>])
  var typeStr = Object.prototype.toString.call(somevar);
  if (typeStr.indexOf('[object ') === 0) {
    return typeStr.slice(8, -1).toLowerCase();
  } else {
    throw new Error("MUI: Could not understand type: " + typeStr);
  }    
}


/**
 * Attach an event handler to a DOM element
 * @param {Element} element - The DOM element.
 * @param {string} type - The event type name.
 * @param {Function} callback - The callback function.
 * @param {Boolean} useCapture - Use capture flag.
 */
function jqLiteOn(element, type, callback, useCapture) {
  useCapture = (useCapture === undefined) ? false : useCapture;

  // add to DOM
  element.addEventListener(type, callback, useCapture);

  // add to cache
  var cache = element._muiEventCache = element._muiEventCache || {};
  cache[type] = cache[type] || [];
  cache[type].push([callback, useCapture]);
}


/**
 * Remove an event handler from a DOM element
 * @param {Element} element - The DOM element.
 * @param {string} type - The event type name.
 * @param {Function} callback - The callback function.
 * @param {Boolean} useCapture - Use capture flag.
 */
function jqLiteOff(element, type, callback, useCapture) {
  useCapture = (useCapture === undefined) ? false : useCapture;

  // remove from cache
  var cache = element._muiEventCache = element._muiEventCache || {},
      argsList = cache[type] || [],
      args,
      i;

  i = argsList.length;
  while (i--) {
    args = argsList[i];

    // remove all events if callback is undefined
    if (callback === undefined ||
        (args[0] === callback && args[1] === useCapture)) {

      // remove from cache
      argsList.splice(i, 1);
      
      // remove from DOM
      element.removeEventListener(type, args[0], args[1]);
    }
  }
}


/**
 * Attach an event hander which will only execute once
 * @param {Element} element - The DOM element.
 * @param {string} type - The event type name.
 * @param {Function} callback - The callback function.
 * @param {Boolean} useCapture - Use capture flag.
 */
function jqLiteOne(element, type, callback, useCapture) {
  jqLiteOn(element, type, function onFn(ev) {
    // execute callback
    if (callback) callback.apply(this, arguments);

    // remove wrapper
    jqLiteOff(element, type, onFn);
  }, useCapture);
}


/**
 * Get or set horizontal scroll position
 * @param {Element} element - The DOM element
 * @param {number} [value] - The scroll position
 */
function jqLiteScrollLeft(element, value) {
  // get
  if (value === undefined) {
    if (element === gWin) {
      var t = (gWin.pageXOffset || gDocEl.scrollLeft)
      return t - (gDocEl.clientLeft || 0);
    } else {
      return element.scrollLeft;
    }
  }

  // set
  if (element === gWin) gWin.scrollTo(value, jqLiteScrollTop(gWin));
  else element.scrollLeft = value;
}


/**
 * Get or set vertical scroll position
 * @param {Element} element - The DOM element
 * @param {number} value - The scroll position
 */
function jqLiteScrollTop(element, value) {
  // get
  if (value === undefined) {
    if (element === gWin) {
      return (gWin.pageYOffset || gDocEl.scrollTop) - (gDocEl.clientTop || 0);
    } else {
      return element.scrollTop;
    }
  }

  // set
  if (element === gWin) gWin.scrollTo(jqLiteScrollLeft(gWin), value);
  else element.scrollTop = value;
}


/**
 * Return object representing top/left offset and element height/width.
 * @param {Element} element - The DOM element.
 */
function jqLiteOffset(element) {
  var rect = element.getBoundingClientRect(),
      scrollTop = jqLiteScrollTop(gWin),
      scrollLeft = jqLiteScrollLeft(gWin);

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    height: rect.height,
    width: rect.width
  };
}


/**
 * Attach a callback to the DOM ready event listener
 * @param {Function} fn - The callback function.
 */
function jqLiteReady(fn) {
  var done = false,
      top = true,
      doc = document,
      win = doc.defaultView,
      root = doc.documentElement,
      add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
      rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
      pre = doc.addEventListener ? '' : 'on';

  var init = function(e) {
    if (e.type == 'readystatechange' && doc.readyState != 'complete') {
      return;
    }

    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
    if (!done && (done = true)) fn.call(win, e.type || e);
  };

  var poll = function() {
    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
    init('poll');
  };

  if (doc.readyState == 'complete') {
    fn.call(win, 'lazy');
  } else {
    if (doc.createEventObject && root.doScroll) {
      try { top = !win.frameElement; } catch(e) { }
      if (top) poll();
    }
    doc[add](pre + 'DOMContentLoaded', init, false);
    doc[add](pre + 'readystatechange', init, false);
    win[add](pre + 'load', init, false);
  }
}


/**
 * Remove classes from a DOM element
 * @param {Element} element - The DOM element.
 * @param {string} cssClasses - Space separated list of class names.
 */
function jqLiteRemoveClass(element, cssClasses) {
  if (!cssClasses || !element.setAttribute) return;

  var existingClasses = _getExistingClasses(element),
      splitClasses = cssClasses.split(' '),
      cssClass;
  
  for (var i=0; i < splitClasses.length; i++) {
    cssClass = splitClasses[i].trim();
    while (existingClasses.indexOf(' ' + cssClass + ' ') >= 0) {
      existingClasses = existingClasses.replace(' ' + cssClass + ' ', ' ');
    }
  }

  element.setAttribute('class', existingClasses.trim());
}


// ------------------------------
// Utilities
// ------------------------------
var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g,
    MOZ_HACK_REGEXP = /^moz([A-Z])/,
    ESCAPE_REGEXP = /([.*+?^=!:${}()|\[\]\/\\])/g,
    BOOLEAN_ATTRS;


BOOLEAN_ATTRS = {
  multiple: true,
  selected: true,
  checked: true,
  disabled: true,
  readonly: true,
  required: true,
  open: true
}


function _getExistingClasses(element) {
  var classes = (element.getAttribute('class') || '').replace(/[\n\t]/g, '');
  return ' ' + classes + ' ';
}


function _camelCase(name) {
  return name.
    replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).
    replace(MOZ_HACK_REGEXP, 'Moz$1');
}


function _escapeRegExp(string) {
  return string.replace(ESCAPE_REGEXP, "\\$1");
}


function _getCurrCssProp(elem, name, computed) {
  var ret;

  // try computed style
  ret = computed.getPropertyValue(name);

  // try style attribute (if element is not attached to document)
  if (ret === '' && !elem.ownerDocument) ret = elem.style[_camelCase(name)];

  return ret;
}


/**
 * Module API
 */
module.exports = {
  /** Add classes */
  addClass: jqLiteAddClass,

  /** Get or set CSS properties */
  css: jqLiteCss,

  /** Check for class */
  hasClass: jqLiteHasClass,

  /** Remove event handlers */
  off: jqLiteOff,

  /** Return offset values */
  offset: jqLiteOffset,

  /** Add event handlers */
  on: jqLiteOn,

  /** Add an execute-once event handler */
  one: jqLiteOne,

  /** DOM ready event handler */
  ready: jqLiteReady,

  /** Remove classes */
  removeClass: jqLiteRemoveClass,

  /** Check JavaScript variable instance type */
  type: jqLiteType,

  /** Get or set horizontal scroll position */
  scrollLeft: jqLiteScrollLeft,

  /** Get or set vertical scroll position */
  scrollTop: jqLiteScrollTop
};


},{}],3:[function(require,module,exports){
/**
 * MUI CSS/JS utilities module
 * @module lib/util
 */

'use strict';


var config = require('../config.js'),
    jqLite = require('./jqLite.js'),
    win = window,
    doc = document,
    nodeInsertedCallbacks = [],
    scrollLock = 0,
    scrollLockCls = 'mui-body--scroll-lock',
    scrollLockPos,
    head,
    _supportsPointerEvents;

head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;


/**
 * Logging function
 */
function logFn() {
  if (config.debug && typeof win.console !== "undefined") {
    try {
      win.console.log.apply(win.console, arguments);
    } catch (a) {
      var e = Array.prototype.slice.call(arguments);
      win.console.log(e.join("\n"));
    }
  }
}


/**
 * Load CSS text in new stylesheet
 * @param {string} cssText - The css text.
 */
function loadStyleFn(cssText) {
  var e = doc.createElement('style');
  e.type = 'text/css';
    
  if (e.styleSheet) e.styleSheet.cssText = cssText;
  else e.appendChild(doc.createTextNode(cssText));
  
  // add to document
  head.insertBefore(e, head.firstChild);

  return e;
}


/**
 * Raise an error
 * @param {string} msg - The error message.
 */
function raiseErrorFn(msg) {
  throw new Error("MUI: " + msg);
}


/**
 * Register callbacks on muiNodeInserted event
 * @param {function} callbackFn - The callback function.
 */
function onNodeInsertedFn(callbackFn) {
  nodeInsertedCallbacks.push(callbackFn);

  // initalize listeners
  if (nodeInsertedCallbacks._initialized === undefined) {
    jqLite.on(doc, 'animationstart', animationHandlerFn);
    jqLite.on(doc, 'mozAnimationStart', animationHandlerFn);
    jqLite.on(doc, 'webkitAnimationStart', animationHandlerFn);

    nodeInsertedCallbacks._initialized = true;
  }
}


/**
 * Execute muiNodeInserted callbacks
 * @param {Event} ev - The DOM event.
 */
function animationHandlerFn(ev) {
  // check animation name
  if (ev.animationName !== 'mui-node-inserted') return;

  var el = ev.target;

  // iterate through callbacks
  for (var i=nodeInsertedCallbacks.length - 1; i >= 0; i--) {
    nodeInsertedCallbacks[i](el);
  }
}


/**
 * Convert Classname object, with class as key and true/false as value, to an
 * class string.
 * @param  {Object} classes The classes
 * @return {String}         class string
 */
function classNamesFn(classes) {
  var cs = '';
  for (var i in classes) {
    cs += (classes[i]) ? i + ' ' : '';
  }
  return cs.trim();
}


/**
 * Check if client supports pointer events.
 */
function supportsPointerEventsFn() {
  // check cache
  if (_supportsPointerEvents !== undefined) return _supportsPointerEvents;
  
  var element = document.createElement('x');
  element.style.cssText = 'pointer-events:auto';
  _supportsPointerEvents = (element.style.pointerEvents === 'auto');
  return _supportsPointerEvents;
}


/**
 * Create callback closure.
 * @param {Object} instance - The object instance.
 * @param {String} funcName - The name of the callback function.
 */
function callbackFn(instance, funcName) {
  return function() {instance[funcName].apply(instance, arguments);};
}


/**
 * Dispatch event.
 * @param {Element} element - The DOM element.
 * @param {String} eventType - The event type.
 * @param {Boolean} bubbles=true - If true, event bubbles.
 * @param {Boolean} cancelable=true = If true, event is cancelable
 * @param {Object} [data] - Data to add to event object
 */
function dispatchEventFn(element, eventType, bubbles, cancelable, data) {
  var ev = document.createEvent('HTMLEvents'),
      bubbles = (bubbles !== undefined) ? bubbles : true,
      cancelable = (cancelable !== undefined) ? cancelable : true,
      k;
  
  ev.initEvent(eventType, bubbles, cancelable);

  // add data to event object
  if (data) for (k in data) ev[k] = data[k];

  // dispatch
  if (element) element.dispatchEvent(ev);

  return ev;
}


/**
 * Turn on window scroll lock.
 */
function enableScrollLockFn() {
  // increment counter
  scrollLock += 1

  // add lock
  if (scrollLock === 1) {
    scrollLockPos = {left: jqLite.scrollLeft(win), top: jqLite.scrollTop(win)};
    jqLite.addClass(doc.body, scrollLockCls);
    win.scrollTo(scrollLockPos.left, scrollLockPos.top);
  }
}


/**
 * Turn off window scroll lock.
 */
function disableScrollLockFn() {
  // ignore
  if (scrollLock === 0) return;

  // decrement counter
  scrollLock -= 1

  // remove lock 
  if (scrollLock === 0) {
    jqLite.removeClass(doc.body, scrollLockCls);
    win.scrollTo(scrollLockPos.left, scrollLockPos.top);
  }
}


/**
 * Define the module API
 */
module.exports = {
  /** Create callback closures */
  callback: callbackFn,
  
  /** Classnames object to string */
  classNames: classNamesFn,

  /** Disable scroll lock */
  disableScrollLock: disableScrollLockFn,

  /** Dispatch event */
  dispatchEvent: dispatchEventFn,
  
  /** Enable scroll lock */
  enableScrollLock: enableScrollLockFn,

  /** Log messages to the console when debug is turned on */
  log: logFn,

  /** Load CSS text as new stylesheet */
  loadStyle: loadStyleFn,

  /** Register muiNodeInserted handler */
  onNodeInserted: onNodeInsertedFn,

  /** Raise MUI error */
  raiseError: raiseErrorFn,

  /** Support Pointer Events check */
  supportsPointerEvents: supportsPointerEventsFn
};


},{"../config.js":1,"./jqLite.js":2}],4:[function(require,module,exports){
/**
 * MUI React buttons module
 * @module react/buttons
 */

'use strict';

var util = require('../js/lib/util.js'),
    Ripple = require('./ripple.jsx');

var btnClass = 'mui-btn',
    btnAttrs = {style: 1, color: 1, size: 1};


/**
 * Button constructor
 * @class
 */
var Button = React.createClass({displayName: "Button",
  mixins: [Ripple],
  getDefaultProps: function() {
    return {
      style: 'default', // default|flat|raised|fab
      color: 'default', // default|primary|danger|dark|accent
      size: 'default', // default|small|large
      disabled: false
    };
  },
  render: function() {
    var cls = btnClass,
        k,
        v;
    
    for (k in btnAttrs) {
      v = this.props[k];
      if (v !== 'default') cls += ' ' + btnClass + '--' + v;
    }

    return (
      React.createElement("button", {
        className:  cls, 
        disabled:  this.props.disabled, 
        onMouseDown:  this.ripple, 
        onTouchStart:  this.ripple, 
        onClick:  this.props.onClick
      }, 
         this.props.children, 
         this.state.ripples && this.renderRipples()
      )
    );
  }
});


/** Define module API */
module.exports = {
  Button: Button
};


},{"../js/lib/util.js":3,"./ripple.jsx":9}],5:[function(require,module,exports){
/**
 * MUI React dropdowns module
 * @module react/dropdowns
 */
/* jshint quotmark:false */
// jscs:disable validateQuoteMarks

'use strict';

var util = require('../js/lib/util'),
    jqLite = require('../js/lib/jqLite'),
    buttons = require('./buttons.jsx'),
    Button = buttons.Button;

var dropdownClass = 'mui-dropdown',
    caretClass = 'mui-caret',
    menuClass = 'mui-dropdown__menu',
    openClass = 'mui--is-open',
    rightClass = 'mui-dropdown__menu--right';


/**
 * Dropdown constructor
 * @class
 */
var Dropdown = React.createClass({displayName: "Dropdown",
  getDefaultProps: function() {
    return {
      style: 'default',
      color: 'default',
      size: 'default',
      label: '',
      right: false,
      disabled: false
    };
  },
  getInitialState: function() {
    return {
      opened: false,
      menuTop: 0
    };
  },
  componentWillMount: function() {
    document.addEventListener('click', this._outsideClick);
  },
  componentWillUnmount: function() {
    document.removeEventListener('click', this._outsideClick);
  },
  render: function() {
    var button;

    button = (
        React.createElement(Button, {
          ref: "button", 
          onClick:  this._click, 
          style:  this.props.style, 
          color:  this.props.color, 
          size:  this.props.size, 
          disabled:  this.props.disabled
        }, 
           this.props.label, 
          React.createElement("span", {className:  caretClass })
        )
    );

    var cs = {};

    cs[menuClass] = true;
    cs[openClass] = this.state.opened;
    cs[rightClass] = this.props.right;
    cs = util.classNames(cs);

    return (
      React.createElement("div", {className:  dropdownClass }, 
         button, 
         this.state.opened && (
            React.createElement("ul", {
              className:  cs, 
              style:  {top: this.state.menuTop}, 
              onClick:  this._select
            }, 
               this.props.children
            ))
        
      )
    );
  },
  _click: function(ev) {
    // only left clicks
    if (ev.button !== 0) return;

    // exit if toggle button is disabled
    if (this.props.disabled) return;

    setTimeout(function() {
      if (!ev.defaultPrevented) this._toggle();
    }.bind(this), 0);
  },
  _toggle: function() {
    // exit if no menu element
    if (!this.props.children) {
      return util.raiseError('Dropdown menu element not found');
    }

    if (this.state.opened) this._close();
    else this._open();
  },
  _open: function() {
    // position menu element below toggle button
    var wrapperRect = ReactDOM.findDOMNode(this).getBoundingClientRect(),
        toggleRect;

    toggleRect = ReactDOM.findDOMNode(this.refs.button).getBoundingClientRect();

    this.setState({
      opened: true,
      menuTop: toggleRect.top - wrapperRect.top + toggleRect.height
    });
  },
  _close: function() {
    this.setState({opened: false});
  },
  _select: function(ev) {
    if (this.props.onClick) this.props.onClick(this, ev);
  },
  _outsideClick: function(ev) {
    var isClickInside = ReactDOM.findDOMNode(this).contains(ev.target);

    if (!isClickInside) this._close();
  }
});


/**
 * DropdownItem constructor
 * @class
 */
var DropdownItem = React.createClass({displayName: "DropdownItem",
  render: function() {
    return (
      React.createElement("li", null, 
        React.createElement("a", {href:  this.props.link, onClick:  this._click}, 
           this.props.children
        )
      )
    );
  },
  _click: function(ev) {
    if (this.props.onClick) this.props.onClick(this, ev);
  }
});


/** Define module API */
module.exports = {
  Dropdown: Dropdown,
  DropdownItem: DropdownItem
};


},{"../js/lib/jqLite":2,"../js/lib/util":3,"./buttons.jsx":4}],6:[function(require,module,exports){
/**
 * MUI React main module
 * @module react/main
 */

(function(win) {
  // return if library has been loaded already
  if (win._muiReactLoaded) return;
  else win._muiReactLoaded = true;

  // load dependencies
  var layout = require('./layout.jsx'),
      forms = require('./forms.jsx'),
      buttons = require('./buttons.jsx'),
      dropdowns = require('./dropdowns.jsx'),
      tabs = require('./tabs.jsx'),
      doc = win.document;

  // export React classes
  win.MUIContainer = layout.Container;
  win.MUIFluidContainer = layout.FluidContainer;
  win.MUIPanel = layout.Panel;

  win.MUITextfield = forms.Textfield;

  win.MUIButton = buttons.Button;

  win.MUIDropdown = dropdowns.Dropdown;
  win.MUIDropdownItem = dropdowns.DropdownItem;
 
  win.MUITab = tabs.Tab;
  win.MUITabs = tabs.Tabs;
  
})(window);


},{"./buttons.jsx":4,"./dropdowns.jsx":5,"./forms.jsx":7,"./layout.jsx":8,"./tabs.jsx":10}],7:[function(require,module,exports){
/**
 * MUI React forms module
 * @module react/forms
 */

'use strict';

var util = require('../js/lib/util.js');

var textfieldClass = 'mui-textfield',
    floatMod = '--float-label',
    isEmptyClass = 'mui--is-empty',
    isNotEmptyClass = 'mui--is-not-empty',
    isDirtyClass = 'mui--is-dirty';


/**
 * Input constructor
 * @class
 */
var Input = React.createClass({displayName: "Input",
  getDefaultProps: function() {
    return {
      value: '',
      type: 'text',
      placeholder: '',
      autofocus: false,
      onChange: null
    };
  },
  getInitialState: function() {
    return {
      value: this.props.value,
      isDirty: Boolean(this.props.value.length)
    };
  },
  render: function() {
    var cls = {},
        isNotEmpty = Boolean(this.state.value),
        inputEl;

    cls[isEmptyClass] = !isNotEmpty;
    cls[isNotEmptyClass] = isNotEmpty;
    cls[isDirtyClass] = this.state.isDirty;

    cls = util.classNames(cls);

    if (this.props.type === 'textarea') {
      inputEl = (
        React.createElement("textarea", {
          ref: "input", 
          className:  cls, 
          placeholder:  this.props.placeholder, 
          value:  this.props.value, 
          autoFocus:  this.props.autofocus, 
          onChange:  this._handleChange, 
          onFocus:  this._handleFocus}
        )
      );
    } else {
      inputEl = (
        React.createElement("input", {
          ref: "input", 
          className:  cls, 
          type:  this.props.type, 
          value:  this.state.value, 
          placeholder:  this.props.placeholder, 
          autoFocus:  this.props.autofocus, 
          onChange:  this._handleChange, 
          onFocus:  this._handleFocus}
        )
      );
    }

    return inputEl;
  },
  _handleChange: function(ev) {
    this.setState({value: ev.target.value});
    if (this.props.onChange) this.props.onChange(ev);
  },
  _handleFocus: function(ev) {
    this.setState({isDirty: true});
  }
});


/**
 * Label constructor
 * @class
 */
var Label = React.createClass({displayName: "Label",
  getDefaultProps: function() {
    return {
      text: '',
      floating: false,
      onClick: null
    };
  },
  getInitialState: function() {
    return {
      style: {}
    };
  },
  componentDidMount: function() {
    setTimeout(function() {
      var s = '.15s ease-out',
          style;

      style = {
        transition: s,
        WebkitTransition: s,
        MozTransition: s,
        OTransition: s,
        msTransform: s
      };

      this.setState({
        style: style
      });
    }.bind(this), 150);
  },
  render: function() {
    return (
      React.createElement("label", {
        refs: "label", 
        style:  this.state.style, 
        onClick:  this.props.onClick
      }, 
         this.props.text
      )
    );
  }
});




/**
 * Textfield constructor
 * @class
 */
var Textfield = React.createClass({displayName: "Textfield",
  getDefaultProps: function() {
    return {
      type: 'text',
      value: '',
      label: '',
      placeholder: '',
      isLabelFloating: false,
      autofocus: false,
      onChange: null
    };
  },
  render: function() {
    var cls = {},
        labelEl;

    if (this.props.label.length) {
      labelEl = (
        React.createElement(Label, {
          text:  this.props.label, 
          onClick:  this._focus}
        )
      );
    }

    cls[textfieldClass] = true;
    cls[textfieldClass + floatMod] = this.props.isLabelFloating;
    cls = util.classNames(cls);

    return (
      React.createElement("div", {className:  cls }, 
        React.createElement(Input, {
          type:  this.props.type, 
          value:  this.props.value, 
          placeholder:  this.props.placeholder, 
          autoFocus:  this.props.autofocus, 
          onChange:  this.props.onChange}
        ), 
         labelEl 
      )
    );
  },
  _focus: function(e) {
    // pointer-events shim
    if (util.supportsPointerEvents() === false) {
      e.target.style.cursor = 'text';
      ReactDOM.findDOMNode(this.refs.input).focus();
    }
  }
});


/** Define module API */
module.exports = {
  Textfield: Textfield
};


},{"../js/lib/util.js":3}],8:[function(require,module,exports){
/**
 * MUI React layout module
 * @module react/layout
 */

'use strict';

var containerClass = 'mui-container',
    fluidClass = 'mui-container-fluid',
    panelClass = 'mui-panel';


/**
 * Container constructor
 * @class
 */
var Container = React.createClass({displayName: "Container",
  render: function() {
    return (
      React.createElement("div", {className:  containerClass }, 
         this.props.children
      )
    );
  }
});


/**
 * FluidContainer constructor
 * @class
 */
var FluidContainer = React.createClass({displayName: "FluidContainer",
  render: function() {
    return (
      React.createElement("div", {className:  fluidClass }, 
         this.props.children
      )
    );
  }
});


/**
 * Panel constructor
 * @class
 */
var Panel = React.createClass({displayName: "Panel",
  render: function() {
    return (
      React.createElement("div", {className:  panelClass }, 
         this.props.children
      )
    );
  }
});


/** Define module API */
module.exports = {
  Container: Container,
  FluidContainer: FluidContainer,
  Panel: Panel
};


},{}],9:[function(require,module,exports){
/**
 * MUI React ripple module
 * @module react/ripple
 */

'use strict';

var jqLite = require('../js/lib/jqLite.js');

var rippleClass = 'mui-ripple-effect';


/**
 * Ripple singleton
 */
var Ripple = {
  getInitialState: function() {
    return {
      touchFlag: false,
      ripples: []
    };
  },
  getDefaultProps: function() {
    return {
      rippleClass: rippleClass
    };
  },
  ripple: function (ev) {
    // only left clicks
    if (ev.button !== 0) return;

    var buttonEl = ReactDOM.findDOMNode(this);

    // exit if button is disabled
    if (this.props.disabled === true) return;

    // de-dupe touchstart and mousedown with 100msec flag
    if (this.state.touchFlag === true) {
      return;
    } else {
      this.setState({ touchFlag: true });
      setTimeout(function() {
        this.setState({ touchFlag: false });
      }.bind(this), 100);
    }

    var offset = jqLite.offset(buttonEl),
      xPos = ev.pageX - offset.left,
      yPos = ev.pageY - offset.top,
      diameter,
      radius;

    // get height
    if (this.props.floating) {
      diameter = offset.height / 2;
    } else {
      diameter = offset.height;
    }

    radius = diameter / 2;

    var style = {
      height: diameter,
      width: diameter,
      top: yPos - radius,
      left: xPos - radius
    };

    var ripples = this.state.ripples || [];
      
    window.setTimeout(function() {
      this._removeRipple();
    }.bind(this), 2000);

    ripples.push({ style: style });

    this.setState({
      ripples: ripples
    });
  },
  _removeRipple: function () {
    this.state.ripples.shift();
    this.setState({
      ripples: this.state.ripples
    });
  },
  renderRipples: function () {
    if (this.state.ripples.length === 0) return;

    var i = 0;
    return this.state.ripples.map(function (ripple) {
      i++;
      return (
        React.createElement("div", {
          className:  this.props.rippleClass, 
          key:  i, 
          style:  ripple.style}
        )
      );
    }.bind(this));
  }
};


/** Define module API */
module.exports = Ripple;

},{"../js/lib/jqLite.js":2}],10:[function(require,module,exports){
/**
 * MUI React tabs module
 * @module react/tabs
 */
/* jshint quotmark:false */
// jscs:disable validateQuoteMarks

'use strict';

var util = require('../js/lib/util.js');

var tabsBarClass = 'mui-tabs__bar',
    tabsBarJustifiedClass = 'mui-tabs__bar--justified',
    tabsPaneClass = 'mui-tabs__pane',
    isActiveClass = 'mui--is-active';


/**
 * Tabs constructor
 * @class
 */
var Tabs = React.createClass({displayName: "Tabs",
  getDefaultProps: function() {
    return {
      justified: false,
      onChange: null,
      initialSelectedIndex: 0
    };
  },
  getInitialState: function() {
    return {
      currentSelectedIndex: parseInt(this.props.initialSelectedIndex)
    };
  },
  render: function() {
    var tabEls = [],
        paneEls = [],
        children = this.props.children,
        m = children.length,
        selectedIndex = this.state.currentSelectedIndex % m,
        isActive,
        item,
        cls,
        i;


    for (i=0; i < m; i++) {
      item = children[i];

      // only accept MUITab elements
      if (item.type !== Tab) util.raiseError('Expecting MUITab React Element');

      isActive = (i === selectedIndex) ? true : false;

      // tab element
      tabEls.push(
        React.createElement("li", {key:  i, className:  (isActive) ? isActiveClass : ''}, 
          React.createElement("a", {onClick:  this._handleClick.bind(this, i, item) }, 
             item.props.label
          )
        )
      );

      // pane element
      cls = tabsPaneClass + ' ';
      if (isActive) cls += isActiveClass;

      paneEls.push(
        React.createElement("div", {key:  i, className:  cls }, 
           item.props.children
        )
      );
    }

    cls = tabsBarClass;
    if (this.props.justified) cls += ' ' + tabsBarJustifiedClass;
    
    return (
      React.createElement("div", null, 
        React.createElement("ul", {className:  cls }, 
           tabEls 
        ), 
         paneEls 
      )
    );
  },
  _handleClick: function(i, tab, ev) {
    if (i !== this.state.currentSelectedIndex) {
      this.setState({currentSelectedIndex: i});

      // onActive callback
      if (tab.props.onActive) tab.props.onActive(tab);

      // onChange callback
      if (this.props.onChange) {
        this.props.onChange(i, tab.props.value, tab, ev);
      }
    }
  }
});


/**
 * Tab constructor
 * @class
 */
var Tab = React.createClass({displayName: "Tab",
  getDefaultProps: function() {
    return {
      value: null,
      label: '',
      onActive: null
    };
  },
  render: function() {
    return null;
  }
});


/** Define module API */
module.exports = {
  Tab: Tab,
  Tabs: Tabs
};


},{"../js/lib/util.js":3}]},{},[6])