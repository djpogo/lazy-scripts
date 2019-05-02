export default function (customOptions = {}) {
  const options = {
    lazyScriptSelector: '[data-lazy-script]',
    lazyScriptsSelector: '[data-lazy-scripts]',
    ...customOptions,
  };

  const lazyScriptDataName = hyphensToCamelCase(options.lazyScriptSelector);
  const lazyScriptsDataName = hyphensToCamelCase(options.lazyScriptsSelector);

  const loadedScripts = [];
  const lazyScripts = document.querySelectorAll(
    `${options.lazyScriptSelector}, ${options.lazyScriptsSelector}`
  );

  

  /**
   * convert the `querySelectorAll` compatible class options of lazySelectors and
   * return a string, you can use in `dataset[string]`
   * @see https://stackoverflow.com/a/6661012
   * @param {String} string - the text you want to convert
   */
  function hyphensToCamelCase(string) {
    return string.replace('[data-', '').replace(']', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
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
   * @param {Array} scriptsSrc - Array with full paths to js files
   * @param {HTMLElement} element - element the script will be append to
   */
  function loadScript(scriptsSrc, element) {
    const scriptSrc = scriptsSrc.shift();
    if (scriptSrc && loadedScripts.indexOf(scriptSrc) === -1) {
      const script = document.createElement('script');
      loadedScripts.push(scriptSrc);
      script.type = 'text/javascript';
      script.src = scriptSrc;
      if (scriptsSrc.length > 0) {
        script.onload = () => {
          loadScript(scriptsSrc, element);
        };
      }
      element.appendChild(script);
    } else if (scriptSrc.length > 0) {
      loadScript(scriptsSrc, element);
    }
  }

  /**
   * callback from fallback or intersectionObserver method,
   * to process both data attributes from given element and
   * load its scripts
   * @param {HTMLElement} lazyElement - the element which entered the viewport and will be processed
   */
  function processElement(lazyElement) {
    // process single script data attribute
    if (lazyElement.dataset[lazyScriptDataName]) {
      loadScript([lazyElement.dataset[lazyScriptDataName]], lazyElement);
    }

    const scripts = JSON.parse(lazyElement.dataset[lazyScriptsDataName] || '[]');
    loadScript(scripts, lazyElement);
  }

  /**
   * if no IntersectionObserver (and no polyfill) is found,
   * all scripts are gonna be loaded in a batch
   */
  function fallbackScriptLoad() {
    lazyScripts.forEach(lazyScript => processElement(lazyScript));
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
