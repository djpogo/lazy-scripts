  /**
   * convert the `querySelectorAll` compatible class options of lazySelectors
   * and return a string, you can use in `dataset[string]`
   * @see https://stackoverflow.com/a/6661012
   * @param {String} string - the text you want to convert
   * @return {String}
   */
  export default function (string) {
    return string
      .replace('[data-', '')
      .replace(']', '')
      .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
