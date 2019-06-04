import 'mdn-polyfills/NodeList.prototype.forEach';
import 'mdn-polyfills/CustomEvent';
import ScriptQueue from './script-queue';
/**
 * LazyScripts
 * a lazy loader for your javascripts
 * @param {Object} customOptions - define your lazy-script-data selectors
 */
export default function(customOptions = {}) {
  const options = {
    lazyScriptSelector: '[data-lazy-script]',
    lazyScriptsSelector: '[data-lazy-scripts]',
    lazyScriptDoneSelector: '[data-lazy-script-done]',
    lazyScriptLoadedEventName: 'lazyScriptLoaded',
    mutationObserverOptions: {
      attributes: false,
      childList: true,
      subTree: true,
    },
    ...customOptions,
  };

  let lazyScriptDataName = '';
  let lazyScriptsDataName = '';
  let lazyScriptDoneName = '';
  let scriptQueue;
  let loadingScript = false;

  const lazyScriptSelector = 
      `${options.lazyScriptSelector}:not(${options.lazyScriptDoneSelector}),
      ${options.lazyScriptsSelector}:not(${options.lazyScriptDoneSelector})`;

  const loadedScripts = [];
  const lazyScripts = document.querySelectorAll(lazyScriptSelector);


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
            options.lazyScriptLoadedEventName,
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
        entry.target.dataset[lazyScriptDoneName] = true;
        observer.unobserve(entry.target);
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
    /*mutationsList.forEach((mutation) => {
      mutation.addedNodes.forEach((fragment) => {
        if (
          fragment.dataset[lazyScriptDataName]
          || fragment.dataset[lazyScriptsDataName]
          || fragment.querySelectorAll(
              `${options.lazyScriptSelector}, ${options.lazyScriptsSelector}`
          )) {

        }
      });
    });*/
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
    lazyScriptDoneName = hyphensToCamelCase(options.lazyScriptDoneSelector);

    setupIntersectionObserver();
    setupMutationObserver();
  }

  /**
   * check existance of MutationObserver
   * and setup MutationObserver
   */
  function setupMutationObserver() {
    if (!window.MutationObserver) {
      // eslint-disable-next-line no-console
      console.info(
          'MutationObserver not available.',
          'DOM manipulations will not be recognised'
      );
    }

    const mo = new MutationObserver(
        (mutationsList, observer) => mutationCallback(mutationsList, observer)
    );
    mo.observe(
        document.body,
        options.mutationObserverOptions
    );
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
