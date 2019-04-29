export default class {
  constructor(options = {}) {
    this.options = {
      lazyScriptSelector: '[data-lazy-script]',
      lazyScriptsSelector: '[data-lazy-scripts]',
      ...options,
    };

    this.lazyScriptDataName = this.hyphensToCamelCase(this.options.lazyScriptSelector);
    this.lazyScriptsDataName = this.hyphensToCamelCase(this.options.lazyScriptsSelector);

    this.loadedScripts = [];
    this.initLoadedScripts();
    this.lazyScripts = document.querySelectorAll(
      `${this.options.lazyScriptSelector}, ${this.options.lazyScriptsSelector}`
    );
    this.setup();
  }

  /**
   * convert the `querySelectorAll` compatible class options of lazySelectors and
   * return a string, you can use in `dataset[string]`
   * @see https://stackoverflow.com/a/6661012
   * @param {String} string - the text you want to convert
   */
  // eslint-disable-next-line class-methods-use-this
  hyphensToCamelCase(string) {
    return string.replace('[data-', '').replace(']', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
  }

  /**
   * store all `<script src="…"></script>` scripts
   * to know that they are available and don't need to
   * be loaded again
   */
  initLoadedScripts() {
    document.querySelectorAll('script').forEach((script) => {
      this.loadedScripts.push(script.src);
    });
  }

  /**
   * create a `<script>` element, add type, defer and src attribute
   * and append it into the lazyElement
   * @param {String} scriptSrc - full path to js file
   * @param {HTMLElement} element - element the script will be append to
   * @param {Boolean} defer - optional flag if script tag should have `defer` attribute
   */
  loadScript(scriptSrc, element, defer = false) {
    if (this.loadedScripts.indexOf(scriptSrc) === -1) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      if (defer) {
        script.defer = true;
      }
      script.src = scriptSrc;
      element.appendChild(script);
      this.loadedScripts.push(scriptSrc);
    }
  }

  /**
   * callback from fallback or intersectionObserver method,
   * to process both data attributes from given element and
   * load its scripts
   * @param {HTMLElement} lazyElement - the element which entered the viewport and will be processed
   */
  processElement(lazyElement) {
    // process single script data attribute
    if (lazyElement.dataset[this.lazyScriptDataName]) {
      this.loadScript(lazyElement.dataset[this.lazyScriptDataName], lazyElement);
    }

    const scripts = JSON.parse(lazyElement.dataset[this.lazyScriptsDataName] || '[]');
    scripts.forEach(script => this.loadScript(script, lazyElement, true));
  }

  /**
   * if no IntersectionObserver (and no polyfill) is found,
   * all scripts are gonna be loaded in a batch
   */
  fallbackScriptLoad() {
    this.lazyScripts.forEach(lazyScript => this.processElement(lazyScript));
  }

  /**
   * check every entry if it is `isIntersecting` and load
   * its scripts.
   * when scripts are loaded, the element will be removed from
   * IntersectionObserver
   * @param {Array} entries - IntersectionObserver entry array
   * @param {IntersectionObserver} observer - the IntersectionObserver itself
   */
  intersectionCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.processElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }

  /**
   * setup IntersectionObserver (if available)
   * or start loading all scripts within a `requestAnimationFrame`
   * callback - if available
   */
  setup() {
    if (!window.IntersectionObserver) {
      if (!window.requestAnimationFrame) {
        this.fallbackScriptLoad();
      } else {
        window.requestAnimationFrame(() => this.fallbackScriptLoad());
      }
      return;
    }

    const io = new IntersectionObserver(
      (entries, observer) => this.intersectionCallback(entries, observer),
      this.options.intersectionObserverOptions,
    );

    this.lazyScripts.forEach((lazyScript) => {
      io.observe(lazyScript);
    });
  }
}
