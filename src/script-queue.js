/**
 * ScriptQueue object
 * array _like_ syntax object to store javascript queue data
 */
export default class {
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
