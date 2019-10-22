/* exported Remote */
'use strict';
(function (exports) {
  const PLAY_STATUS_PAUSED = 'PAUSED';
  const PLAY_STATUS_PLAYING = 'PLAYING';
  // Remote Constructor
  const Remote = function () {
    this.enabled = false;
    this.mrc = null;
  };

  const commands = {
    playpause() {
      let FMStatus = mozFMRadio.enabled;
      FMStatus ? FMRadio.disableFMRadio()
        : FMRadio.enableFMRadio(FrequencyDialer.getFrequency());
    },
    next() {
      FMAction.onLongClickSeek('frequency-op-seekup');
    },

    previous() {
      FMAction.onLongClickSeek('frequency-op-seekdown');
    }
  };

  Remote.prototype.init = function () {
    LazyLoader.load('shared/js/media/remote_controls.js', () => {
      this.mrc = new MediaRemoteControls();
      for (let command of Object.keys(commands)) {
        this.mrc.addCommandListener(command, commands[command]);
      }
      this.start();
      this.mrc.notifyAppInfo({
        origin: window.location.origin,
        icon: `${window.location.origin}/style/icons/fm_56.png`
      });
      this.enabled = true;
    });
  };

  Remote.prototype.start = function () {
    this.mrc._setupIAC();
  };

  Remote.prototype.postMessage = function (name, data) {
    this.mrc._postMessage(name, data);
  };

  Remote.prototype.updateMetadata = function () {
    if (this.enabled) {
      let frequency = FrequencyDialer.currentFreqency;
      this.postMessage('nowplaying', { title: frequency });
    }
  };

  Remote.prototype.updatePlaybackStatus = function () {
    if (this.enabled) {
      let playStatus = '';
      playStatus = mozFMRadio.enabled
        ? PLAY_STATUS_PLAYING : PLAY_STATUS_PAUSED;
      this.postMessage('status', playStatus);
    }
  };

  exports.Remote = new Remote();
})(window);
