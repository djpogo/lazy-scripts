/*! LazyScripts - v0.2.2 - 2019-05-14
* https://lazyscripts.raoulkramer.de
* Copyright (c) 2019 Raoul Kramer; Licensed GNU General Public License v3.0 */


window.NodeList&&!NodeList.prototype.forEach&&(NodeList.prototype.forEach=function(o,t){t=t||window;for(var i=0;i<this.length;i++)o.call(t,this[i],i,this);});

!function(){function t(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}"function"!=typeof window.CustomEvent&&(t.prototype=window.Event.prototype,window.CustomEvent=t);}();

/**
 * ScriptQueue object
 * array _like_ syntax object to store javascript queue data
 */
class ScriptQueue {

  /**
   * constructor, initialize data objects
   * @param {Function} pushCallback - function to be called after every push
   */
  constructor(pushCallback = null) {
    this.queue = [];
    this.callback = pushCallback;
  }

  /**
   * Add data to the stack
   * @param {Array} data - new array content to get appended to the queue
   */
  push(data) {
    this.queue = [...this.queue, ...data];
    if (this.callback) {
      this.callback(this.queue);
    }
  }

  /**
   * return first object of queue
   * @return {String}
   */
  shift() {
    return this.queue.shift();
  }

  /**
   * return length of queue
   * @return {Number}
   */
  length() {
    return this.queue.length;
  }
}

/**
 * LazyScripts
 * a lazy loader for your javascripts
 * @param {Object} customOptions - define your lazy-script-data selectors
 */
function lazyScripts(customOptions = {}) {
  const options = {
    lazyScriptSelector: '[data-lazy-script]',
    lazyScriptsSelector: '[data-lazy-scripts]',
    ...customOptions,
  };

  let lazyScriptDataName = '';
  let lazyScriptsDataName = '';
  let scriptQueue;
  let loadingScript = false;

  const loadedScripts = [];
  const lazyScripts = document.querySelectorAll(
      `${options.lazyScriptSelector}, ${options.lazyScriptsSelector}`
  );


  /**
   * convert the `querySelectorAll` compatible class options of lazySelectors
   * and return a string, you can use in `dataset[string]`
   * @see https://stackoverflow.com/a/6661012
   * @param {String} string - the text you want to convert
   * @return {String}
   */
  function hyphensToCamelCase(string) {
    return string
        .replace('[data-', '').
        replace(']', '').
        replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * store all `<script src="…"></script>` scripts
   * to know that they are available and don't need to
   * be loaded again
   */
  function initLoadedScripts() {
    document.querySelectorAll('script').forEach((script) => {
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
    const scriptSrc = scriptQueue.shift();
    if (!scriptSrc) {
      return;
    }
    if (scriptSrc && loadedScripts.indexOf(scriptSrc) === -1) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptSrc;
      loadingScript = true;
      script.onload = () => {
        loadingScript = false;
        loadedScripts.push(scriptSrc);
        loadScript();
        const event = new CustomEvent(
            'lazyScriptLoaded',
            {detail: {scriptSrc}}
        );
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

    scriptQueue.push(
        JSON.parse(lazyElement.dataset[lazyScriptsDataName] || '[]')
    );
  }

  /**
   * if no IntersectionObserver (and no polyfill) is found,
   * all scripts are gonna be loaded in a batch
   */
  function fallbackScriptLoad() {
    lazyScripts.forEach((lazyScript) => processElement(lazyScript));
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
    entries.forEach((entry) => {
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
    scriptQueue = new ScriptQueue(loadScript);
    lazyScriptDataName = hyphensToCamelCase(options.lazyScriptSelector);
    lazyScriptsDataName = hyphensToCamelCase(options.lazyScriptsSelector);
    if (!window.IntersectionObserver) {
      if (!window.requestAnimationFrame) {
        fallbackScriptLoad();
      } else {
        window.requestAnimationFrame(() => fallbackScriptLoad());
      }
      return;
    }

    const io = new IntersectionObserver(
        (entries, observer) => intersectionCallback(entries, observer),
        options.intersectionObserverOptions,
    );

    lazyScripts.forEach((lazyScript) => {
      io.observe(lazyScript);
    });
  }

  setup();
}

export default lazyScripts;
