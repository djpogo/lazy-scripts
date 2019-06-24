# lazy-scripts
Like you do with lazy loaded images, lazy load, parse and execute your js.

## Quick Start

Include `lazy-scripts.min.js` somewhere in your page, and call `new LazyScripts();` at the end of your page, or whenever your page is loaded.

Add one of the following `data-`-attributes to your markup:

```
  <div class="my-slider" data-lazy-script="/path/to/my-slider.js">…</div>
```

or 

```
  <div class="my-slider" data-lazy-scripts='["/path/to/a/3rd-party/slider-lib.js","/path/to/my-slider.js"]'>…</div>
```
***!important:*** *take care of JSON.parse compatible Array-String when you use `data-lazy-scripts`.*

and that's it.

As soon as your html element enters the viewport, the js is loaded and executed.

### ES-6 usage

```
import LazyScripts from 'lazy-scripts';

new LazyScripts();
```

### ES-5 usage

```
<script src="lazy-scripts.min.js"></script>
<script>new LazyScripts();</script>
```

## Options

The constructor call `new LazyScripts()` supports an option object like this:

```
  new LazyScripts({
    lazyScriptSelector: '[data-load-script]',
    lazyScriptsSelector: '[data-load-scripts]'
  });
```

by default the scripts will query your DOM for `data-lazy-script` for a single js file, and `data-lazy-scripts` for array notated scripts, load, parsed and executed in array order.

## CustomEvents (since 0.2.2)

LazyScripts fires on every successful loaded script a `lazyScriptLoaded` CustomEvent on the `body` element, you can catch and do something with it.

```
  …
  function lazyCallback(event) {
    console.log(event.detail.scriptSrc); // path of actual added script
  }

  document.body.addEventListener('lazyScriptLoaded', lazyCallback);
  …
```

## CustomEvents (since 0.2.3)

I **de-include** the `CustomEvent` polyfill I added in `0.2.2`. LazyScripts still dispatches CustomEvents if your browser supports it. It is up to you to include (or no) the polyfill you like the most.

## Script Adjustments

If your script(s) wait for a `DOMContentLoaded` or `window.load` you need to change that. These Events will be long forgotten when your scripts will be loaded, parsed and executed.

If you use Custom Events, this should be not a problem, the script is embedded in your page and will catch every event you fire.

## Browser Support

lazy-scripts is a plain js library. It utilises IntersectionObserver but when no IntersectionObserver is found it will load all scripts directly. Your choice to include a IntersectionObserver polyfill or not.

For IE11 [mdn-polyfills/NodeList.prototype.forEach](https://www.npmjs.com/package/mdn-polyfills) is included, so you can use umd minified source out of the box.

With `0.2.2` [mdn-polyfills/CustomEvent](https://www.npmjs.com/package/mdn-polyfills) is added.

With `0.2.3` CustomEvent polyfill was removed. Include it by yourself if you need it.
