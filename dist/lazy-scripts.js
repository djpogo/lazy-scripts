/*! LazyScripts - v0.3.1 - 2020-04-26
* https://lazyscripts.raoulkramer.de
* Copyright (c) 2020 Raoul Kramer; Licensed GNU General Public License v3.0 */


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.LazyScripts = factory());
}(this, (function () { 'use strict';

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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  window.NodeList && !NodeList.prototype.forEach && (NodeList.prototype.forEach = function (o, t) {
    t = t || window;

    for (var i = 0; i < this.length; i++) {
      o.call(t, this[i], i, this);
    }
  });

  /**
   * ScriptQueue object
   * array _like_ syntax object to store javascript queue data
   */
  var _default = /*#__PURE__*/function () {
    /**
     * constructor, initialize data objects
     * @param {Function} pushCallback - function to be called after every push
     */
    function _default() {
      var pushCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

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
   * convert the `querySelectorAll` compatible class options of lazySelectors
   * and return a string, you can use in `dataset[string]`
   * @see https://stackoverflow.com/a/6661012
   * @param {String} string - the text you want to convert
   * @return {String}
   */
  function hyphensToCamelCase (string) {
    return string.replace('[data-', '').replace(']', '').replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  }

  /**
   * LazyScripts
   * a lazy loader for your javascripts
   * @param {Object} customOptions - define your lazy-script-data selectors
   */

  function lazyScripts () {
    var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var options = _objectSpread2({
      lazyScriptsInitialized: 'lsi',
      lazyScriptSelector: '[data-lazy-script]',
      lazyScriptsSelector: '[data-lazy-scripts]',
      lazyScriptDoneSelector: '[data-lazy-script-done]',
      lazyScriptLoadedEventName: 'lazyScriptLoaded',
      mutationObserverOptions: {
        attributes: false,
        childList: true,
        subtree: true
      },
      intersectionObserverOptions: {
        root: null,
        threshold: 0
      }
    }, customOptions);

    var html = document.documentElement;
    var intersectionObserver;

    if (html.dataset[options.lazyScriptsInitialized] === 'true') {
      // eslint-disable-next-line no-console
      console.info('🛈 LazyScripts already initialized');
      return;
    }

    var lazyScriptDataName = '';
    var lazyScriptsDataName = '';
    var lazyScriptDoneName = '';
    var scriptQueue;
    var loadingScript = false;
    var lazyScriptSelector = "\n    ".concat(options.lazyScriptSelector, ":not(").concat(options.lazyScriptDoneSelector, "),\n    ").concat(options.lazyScriptsSelector, ":not(").concat(options.lazyScriptDoneSelector, ")\n  ");
    var loadedScripts = {};
    var lazyScripts = document.querySelectorAll(lazyScriptSelector);
    /**
     * store all `<script src="…"></script>` scripts
     * to know that they are available and don't need to
     * be loaded again
     */

    function initLoadedScripts() {
      document.querySelectorAll('script').forEach(function (script) {
        if (script.src && script.src !== '') {
          loadedScripts[script.src] = true;
        }
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

      if (scriptSrc && !loadedScripts[scriptSrc]) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptSrc;
        loadingScript = true;
        script.dataset.lazyScript = true;
        loadedScripts[scriptSrc] = true;

        script.onload = function () {
          loadingScript = false;
          loadScript();

          if (window.CustomEvent) {
            var event = new CustomEvent(options.lazyScriptLoadedEventName, {
              detail: {
                scriptSrc: scriptSrc
              }
            });
            document.body.dispatchEvent(event);
          }
        };

        script.onerror = function () {
          loadingScript = false;
          loadedScripts[scriptSrc] = false;
          loadScript();
        };

        document.body.appendChild(script);
        return;
      }

      if (scriptQueue.length() > 0) {
        window.setTimeout(function () {
          loadScript();
        });
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
      entries.forEach(function (_ref) {
        var isIntersecting = _ref.isIntersecting,
            target = _ref.target;

        if (isIntersecting) {
          processElement(target); // eslint-disable-next-line no-param-reassign

          target.dataset[lazyScriptDoneName] = true;
          observer.unobserve(target);
        }
      });
    }
    /**
     * callback from MutationObserver of document.body element
     * reinitialize intersectionObserver if an element is added
     * @param {Array<MutationRecord>} mutationsList
     * @param {MutationObserver} observer
     */


    function mutationCallback(mutationsList, observer) {
      mutationsList.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (fragment) {
          if (!fragment.dataset) {
            return;
          } // check if added fragment contains lazy-script[s] data attribute


          if (fragment.dataset[lazyScriptDataName] || fragment.dataset[lazyScriptsDataName]) {
            if (intersectionObserver) {
              intersectionObserver.observe(fragment);
            } else {
              fallbackScriptLoad();
            }
          } // check if fragments subtree contains lazy-script[s] support


          fragment.querySelectorAll(lazyScriptSelector).forEach(function (element) {
            if (intersectionObserver) {
              intersectionObserver.observe(element);
            } else {
              fallbackScriptLoad();
            }
          });
        });
      });
    }
    /**
     * check existance of MutationObserver
     * and setup MutationObserver
     */


    function setupMutationObserver() {
      if (!window.MutationObserver) {
        // eslint-disable-next-line no-console
        console.info('MutationObserver not available.', 'DOM manipulations will not be recognised');
      }

      var mo = new MutationObserver(function (mutationsList, observer) {
        return mutationCallback(mutationsList);
      });
      var body = document.querySelector('body');
      mo.observe(body, options.mutationObserverOptions);
    }
    /**
     * check existance of IntersectionObserver
     * and setup IntersectionObserver
     */


    function setupIntersectionObserver() {
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

      intersectionObserver = new IntersectionObserver(function (entries, observer) {
        return intersectionCallback(entries, observer);
      }, options.intersectionObserverOptions);
      lazyScripts.forEach(function (lazyScript) {
        intersectionObserver.observe(lazyScript);
      });
    }
    /**
     * setup IntersectionObserver (if available)
     * or start loading all scripts within a `requestAnimationFrame`
     * callback - if available
     */


    function setup() {
      html.dataset[options.lazyScriptsInitialized] = true;
      initLoadedScripts();
      scriptQueue = new _default(loadScript);
      lazyScriptDataName = hyphensToCamelCase(options.lazyScriptSelector);
      lazyScriptsDataName = hyphensToCamelCase(options.lazyScriptsSelector);
      lazyScriptDoneName = hyphensToCamelCase(options.lazyScriptDoneSelector);
      setupMutationObserver();
      setupIntersectionObserver();
    }

    setup();
  }

  return lazyScripts;

})));
