'use strict';

(function (exports) {
  let SpeakerState = {
    forcespeaker: true,
    get state() {
      return this.forcespeaker;
    },
    set state(value) {
      if (value !== true && value !== false) {
        return;
      }
      this.forcespeaker = value;
    }
  };

  exports.SpeakerState = SpeakerState;
})(window);
