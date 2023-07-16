/**
 * Given an array of keys and a callback, fire the callback only when the event.key matches one of the keys included in the array
 *
 * @param {string[]} keys An array of key names you want to match and fire the callback on
 * @param {func} callback A callback to be fired when the specific keys are pressed
 * @returns void
 */
export const handleSpecificKeyDown = (keys, callback) => (evt) => {
    if (keys.includes(evt.key)) {
      callback(evt);
    }
  };
  