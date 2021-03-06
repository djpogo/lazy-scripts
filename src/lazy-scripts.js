import 'mdn-polyfills/NodeList.prototype.forEach';
import ScriptQueue from './script-queue';
import hyphensToCamelCase from './utils/hyphensToCamelCase';
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
    lazyScriptDoneSelector: '[data-lazy-script-done]',
    lazyScriptLoadedEventName: 'lazyScriptLoaded',
    mutationObserverOptions: {
      attributes: false,
      childList: true,
      subtree: true,
    },
    intersectionObserverOptions: {
      root: null,
      threshold: 0,
    },
    ...customOptions,
  };

  const html = document.documentElement;
  let intersectionObserver;

  if (html.dataset[options.lazyScriptsInitialized] === 'true') {
    // eslint-disable-next-line no-console
    console.info('🛈 LazyScripts already initialized');
    return;
  }

  let lazyScriptDataName = '';
  let lazyScriptsDataName = '';
  let lazyScriptDoneName = '';
  let scriptQueue;
  let loadingScript = false;

  const lazyScriptSelector = `
    ${options.lazyScriptSelector}:not(${options.lazyScriptDoneSelector}),
    ${options.lazyScriptsSelector}:not(${options.lazyScriptDoneSelector})
  `;

  const loadedScripts = {};
  const lazyScripts = document.querySelectorAll(lazyScriptSelector);

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
            options.lazyScriptLoadedEventName,
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
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        processElement(target);
        // eslint-disable-next-line no-param-reassign
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
    mutationsList.forEach((mutation) => {
      mutation.addedNodes.forEach((fragment) => {
        if (!fragment.dataset) {
          return;
        }
        // check if added fragment contains lazy-script[s] data attribute
        if (
          fragment.dataset[lazyScriptDataName]
          || fragment.dataset[lazyScriptsDataName]
        ) {
          if (intersectionObserver) {
            intersectionObserver.observe(fragment);
          } else {
            fallbackScriptLoad();
          }
        }

        // check if fragments subtree contains lazy-script[s] support
        fragment.querySelectorAll(lazyScriptSelector)
          .forEach((element) => {
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
      console.info(
        'MutationObserver not available.',
        'DOM manipulations will not be recognised',
      );
    }

    const mo = new MutationObserver(
      (mutationsList, observer) => mutationCallback(mutationsList, observer),
    );
    const body = document.querySelector('body');
    mo.observe(
      body,
      options.mutationObserverOptions,
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

    intersectionObserver = new IntersectionObserver(
      (entries, observer) => intersectionCallback(entries, observer),
      options.intersectionObserverOptions,
    );

    lazyScripts.forEach((lazyScript) => {
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
    scriptQueue = new ScriptQueue(loadScript);
    lazyScriptDataName = hyphensToCamelCase(options.lazyScriptSelector);
    lazyScriptsDataName = hyphensToCamelCase(options.lazyScriptsSelector);
    lazyScriptDoneName = hyphensToCamelCase(options.lazyScriptDoneSelector);

    setupMutationObserver();
    setupIntersectionObserver();
  }
  setup();
}
