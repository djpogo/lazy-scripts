import 'mdn-polyfills/NodeList.prototype.forEach';
import ScriptQueue from './script-queue';
/**
 * LazyScripts
 * a lazy loader for your javascripts
 * @param {Object} customOptions - define your lazy-script-data selectors
 */
export default function (customOptions = {}) {
  const options = {
    lazyScriptsInitialized: 'lsi',
    lazyScriptSelector: '[data-lazy-script]',
    lazyScriptsSelector: '[data-lazy-scripts]',
    ...customOptions,
  };

  const html = document.documentElement;

  if (html.dataset[options.lazyScriptsInitialized] === 'true') {
    // eslint-disable-next-line no-console
    console.info('🛈 LazyScripts already initialized');
    return;
  }

  let lazyScriptDataName = '';
  let lazyScriptsDataName = '';
  let scriptQueue;
  let loadingScript = false;

  const loadedScripts = {};
  const lazyScripts = document.querySelectorAll(
    `${options.lazyScriptSelector}, ${options.lazyScriptsSelector}`,
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
      .replace('[data-', '')
      .replace(']', '')
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * store all `<script src="…"></script>` scripts
   * to know that they are available and don't need to
   * be loaded again
   */
  function initLoadedScripts() {
    document.querySelectorAll('script').forEach((script) => {
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
    const scriptSrc = scriptQueue.shift();
    if (!scriptSrc) {
      return;
    }
    if (scriptSrc && !loadedScripts[scriptSrc]) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptSrc;
      loadingScript = true;
      script.dataset.lazyScript = true;
      loadedScripts[scriptSrc] = true;
      script.onload = () => {
        loadingScript = false;
        loadScript();
        if (window.CustomEvent) {
          const event = new CustomEvent(
            'lazyScriptLoaded',
            { detail: { scriptSrc } },
          );
          document.body.dispatchEvent(event);
        }
      };
      script.onerror = () => {
        loadingScript = false;
        loadedScripts[scriptSrc] = false;
        loadScript();
      };
      document.body.appendChild(script);
      return;
    }
    if (scriptQueue.length() > 0) {
      window.setTimeout(() => {
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

    scriptQueue.push(
      JSON.parse(lazyElement.dataset[lazyScriptsDataName] || '[]'),
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
    html.dataset[options.lazyScriptsInitialized] = true;
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
