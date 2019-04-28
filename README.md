# lazy-scripts
like you do with lazy loaded images, lazy load, parse and execute your js

## Quick Start

include `lazy-scripts.js` at the end of your document.

enrich your HTML with one of the following `data-`-attributes:

```
  <div class="my-slider" data-lazy-script="/path/to/my-slider.js">…</div>
```

or 

```
  <div class="my-slider" data-lazy-scripts='["/path/to/a/3rd-party/slider-lib.js","/path/to/my-slider.js"]'>…</div>
```

and that's it.

as soon as your html element enters the viewport, the js is loaded and executed.

### ES-6 usage

```
import LazyScripts from 'lazy-scripts';

new LazyScripts();
```

### ES-5 usage

```<script src="/modules/vendor/lazy-scripts.js"></script>```

ES-5 is written as IIFE, so it will be immediately executed.

## Script Adjustments

If your script waits for a`DOMContentLoaded` or `window.load` you
need to change that. These Events will be long forgotten when your scripts will be loaded, parsed and executed.

If you use Custom Events, this should be not a problem, the script
is embedded in your page and will than catch every event you fire.

## Browser Support

lazy-scripts is a plain js library. It utilises IntersectionObserver but when no IntersectionObserver is found it will load all scripts directly. Your choice to include a IntersectionObserver polyfill or not.
