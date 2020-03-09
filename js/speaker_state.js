/* exported SpeakerState */
'use strict';

(function (exports) {

  const SpeakerState = {
    speakerManagers: null,

    init: function () {
      window.SpeakerManager = window.SpeakerManager || window.MozSpeakerManager;
      this.speakerManagers = new SpeakerManager('playing');
      this.speakerManagers.forcespeaker = false;
    },

    get state() {
      return this.speakerManagers.forcespeaker;
    },

    set state(value) {
      if (value !== true && value !== false) {
        return;
      }

      this.speakerManagers.forcespeaker = value;
    }
  };

  exports.SpeakerState = SpeakerState;
})(window);
