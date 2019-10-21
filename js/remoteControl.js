/* exported Remote */
'use strict';
(function (exports) {
  const PLAY_STATUS_PAUSED = 'PAUSED';
  const PLAY_STATUS_PLAYING = 'PLAYING';
  const mrc = new MediaRemoteControls();
  // Remote Constructor
  const Remote = function () {
    this.enabled = false;
  };

  const commands = {
    playpause() {
      let FMStatus = mozFMRadio.enabled;
      FMStatus ? FMRadio.disableFMRadio()
        : FMRadio.enableFMRadio(FrequencyDialer.getFrequency());
    },
    nexttrack() {
      FMAction.onLongClickSeek('frequency-op-seekup');
    },

    prevtrack() {
      FMAction.onLongClickSeek('frequency-op-seekdown');
    }
  };

  Remote.prototype.init = function () {
      for (let command of Object.keys(commands)) {
        mrc.addCommandListener(command, commands[command]);
      }
      this.start();
      mrc.notifyAppInfo({
        origin: window.location.origin,
        icon: `${window.location.origin}/style/icons/fm_56.png`
      });
      this.enabled = true;
  };

  Remote.prototype.start = function () {
    mrc._setupIAC();
  };

  Remote.prototype.postMessage = function (name, data) {
    mrc._postMessage(name, data);
  };

  Remote.prototype.updateMetadata = function () {
    let frequency = FrequencyDialer.currentFreqency;
    this.postMessage('nowplaying', { title: frequency });
  };

  Remote.prototype.updatePlaybackStatus = function () {
    let playStatus = '';
    playStatus = mozFMRadio.enabled
      ? PLAY_STATUS_PLAYING : PLAY_STATUS_PAUSED;
    this.postMessage('status', playStatus);
  };

  exports.Remote = new Remote();
})(window);
