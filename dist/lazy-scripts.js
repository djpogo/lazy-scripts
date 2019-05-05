/*! LazyScripts - v0.2.0 - 2019-05-05
* https://lazyscripts.raoulkramer.de
* Copyright (c) 2019 Raoul Kramer; Licensed GNU General Public License v3.0 */


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.LazyScripts = factory());
}(this, function () { 'use strict';

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

  window.NodeList && !NodeList.prototype.forEach && (NodeList.prototype.forEach = function (o, t) {
    t = t || window;

    for (var i = 0; i < this.length; i++) {
      o.call(t, this[i], i, this);
    }
  });

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
     * @param {Array} scriptsSrc - Array with full paths to js files
     * @param {HTMLElement} element - element the script will be append to
     */


    function loadScript(scriptsSrc, element) {
      var scriptSrc = scriptsSrc.shift();

      if (scriptSrc && loadedScripts.indexOf(scriptSrc) === -1) {
        var script = document.createElement('script');
        loadedScripts.push(scriptSrc);
        script.type = 'text/javascript';
        script.src = scriptSrc;

        if (scriptsSrc.length > 0) {
          script.onload = function () {
            loadScript(scriptsSrc, element);
          };
        }

        element.appendChild(script);
      } else if (scriptsSrc.length > 0) {
        loadScript(scriptsSrc, element);
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
        loadScript([lazyElement.dataset[lazyScriptDataName]], lazyElement);
      }

      loadScript(JSON.parse(lazyElement.dataset[lazyScriptsDataName] || '[]'), lazyElement);
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
