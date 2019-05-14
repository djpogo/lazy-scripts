/*! LazyScripts - v0.2.2 - 2019-05-14
* https://lazyscripts.raoulkramer.de
* Copyright (c) 2019 Raoul Kramer; Licensed GNU General Public License v3.0 */


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.LazyScripts = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  window.NodeList && !NodeList.prototype.forEach && (NodeList.prototype.forEach = function (o, t) {
    t = t || window;

    for (var i = 0; i < this.length; i++) {
      o.call(t, this[i], i, this);
    }
  });

  !function () {
    function t(t, e) {
      e = e || {
        bubbles: !1,
        cancelable: !1,
        detail: void 0
      };
      var n = document.createEvent("CustomEvent");
      return n.initCustomEvent(t, e.bubbles, e.cancelable, e.detail), n;
    }

    "function" != typeof window.CustomEvent && (t.prototype = window.Event.prototype, window.CustomEvent = t);
  }();

  /**
   * ScriptQueue object
   * array _like_ syntax object to store javascript queue data
   */
  var _default =
  /*#__PURE__*/
  function () {
    /**
     * constructor, initialize data objects
     * @param {Function} pushCallback - function to be called after every push
     */
    function _default() {
      var pushCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, _default);

      this.queue = [];
      this.callback = pushCallback;
    }
    /**
     * Add data to the stack
     * @param {Array} data - new array content to get appended to the queue
     */


    _createClass(_default, [{
      key: "push",
      value: function push(data) {
        this.queue = [].concat(_toConsumableArray(this.queue), _toConsumableArray(data));

        if (this.callback) {
          this.callback(this.queue);
        }
      }
      /**
       * return first object of queue
       * @return {String}
       */

    }, {
      key: "shift",
      value: function shift() {
        return this.queue.shift();
      }
      /**
       * return length of queue
       * @return {Number}
       */

    }, {
      key: "length",
      value: function length() {
        return this.queue.length;
      }
    }]);

    return _default;
  }();

  /**
   * LazyScripts
   * a lazy loader for your javascripts
   * @param {Object} customOptions - define your lazy-script-data selectors
   */

  function lazyScripts () {
    var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var options = _objectSpread({
      lazyScriptSelector: '[data-lazy-script]',
      lazyScriptsSelector: '[data-lazy-scripts]'
    }, customOptions);

    var lazyScriptDataName = '';
    var lazyScriptsDataName = '';
    var scriptQueue;
    var loadingScript = false;
    var loadedScripts = [];
    var lazyScripts = document.querySelectorAll("".concat(options.lazyScriptSelector, ", ").concat(options.lazyScriptsSelector));
    /**
     * convert the `querySelectorAll` compatible class options of lazySelectors
     * and return a string, you can use in `dataset[string]`
     * @see https://stackoverflow.com/a/6661012
     * @param {String} string - the text you want to convert
     * @return {String}
     */

    function hyphensToCamelCase(string) {
      return string.replace('[data-', '').replace(']', '').replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
      });
    }
    /**
     * store all `<script src="…"></script>` scripts
     * to know that they are available and don't need to
     * be loaded again
     */


    function initLoadedScripts() {
      document.querySelectorAll('script').forEach(function (script) {
        loadedScripts.push(script.src);
      });
    }
    /**
     * create a `<script>` element, add type, defer and src attribute
     * and append it into the lazyElement
     */


    function loadScript() {
      if (loadingScript) {
        return;
      }

      var scriptSrc = scriptQueue.shift();

      if (!scriptSrc) {
        return;
      }

      if (scriptSrc && loadedScripts.indexOf(scriptSrc) === -1) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptSrc;
        loadingScript = true;

        script.onload = function () {
          loadingScript = false;
          loadedScripts.push(scriptSrc);
          loadScript();
          var event = new CustomEvent('lazyScriptLoaded', {
            detail: {
              scriptSrc: scriptSrc
            }
          });
          document.body.dispatchEvent(event);
        };

        document.body.appendChild(script);
      } else {
        if (scriptQueue.length() > 0) {
          loadScript();
        }
      }
    }
    /**
     * callback from fallback or intersectionObserver method,
     * to process both data attributes from given element and
     * load its scripts
     * @param {HTMLElement} lazyElement - the element which entered
     *    the viewport and will be processed
     */


    function processElement(lazyElement) {
      // process single script data attribute
      if (lazyElement.dataset[lazyScriptDataName]) {
        scriptQueue.push([lazyElement.dataset[lazyScriptDataName]]);
      }

      scriptQueue.push(JSON.parse(lazyElement.dataset[lazyScriptsDataName] || '[]'));
    }
    /**
     * if no IntersectionObserver (and no polyfill) is found,
     * all scripts are gonna be loaded in a batch
     */


    function fallbackScriptLoad() {
      lazyScripts.forEach(function (lazyScript) {
        return processElement(lazyScript);
      });
    }
    /**
     * check every entry if it is `isIntersecting` and load
     * its scripts.
     * when scripts are loaded, the element will be removed from
     * IntersectionObserver
     * @param {Array} entries - IntersectionObserver entry array
     * @param {IntersectionObserver} observer - the IntersectionObserver itself
     */


    function intersectionCallback(entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          processElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }
    /**
     * setup IntersectionObserver (if available)
     * or start loading all scripts within a `requestAnimationFrame`
     * callback - if available
     */


    function setup() {
      initLoadedScripts();
      scriptQueue = new _default(loadScript);
      lazyScriptDataName = hyphensToCamelCase(options.lazyScriptSelector);
      lazyScriptsDataName = hyphensToCamelCase(options.lazyScriptsSelector);

      if (!window.IntersectionObserver) {
        if (!window.requestAnimationFrame) {
          fallbackScriptLoad();
        } else {
          window.requestAnimationFrame(function () {
            return fallbackScriptLoad();
          });
        }

        return;
      }

      var io = new IntersectionObserver(function (entries, observer) {
        return intersectionCallback(entries, observer);
      }, options.intersectionObserverOptions);
      lazyScripts.forEach(function (lazyScript) {
        io.observe(lazyScript);
      });
    }

    setup();
  }

  return lazyScripts;

}));
