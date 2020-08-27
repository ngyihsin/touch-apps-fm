/* exported Remote */
'use strict';
(function (exports) {
  const PLAY_STATUS_PAUSED = 'PAUSED';
  const PLAY_STATUS_PLAYING = 'PLAYING';

  const Remote = function () {
    this.enabled = false;
  };

  const commands = {
    playpause() {
      let FMStatus = fmRadio.enabled;
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
    if (!this.mrc) {      
      this.mrc = new MediaRemoteControls();
    }
    for (let command of Object.keys(commands)) {
      this.mrc.addCommandListener(command, commands[command]);
    }
    this.start();
    this.mrc.notifyAppInfo({
      origin: window.location.origin,
      icon: `${window.location.origin}/style/icons/fm_56.png`
    });
    this.enabled = true;
  };

  Remote.prototype.start = function () {
    this.mrc._setupIAC();
  };

  Remote.prototype.postMessage = function (name, data) {
    if (!this.mrc) {      
      this.mrc = new MediaRemoteControls();
    }
    this.mrc._postMessage(name,
      data);
  };

  Remote.prototype.updateMetadata = function () {
    let frequency = FrequencyDialer.currentFreqency;
    let favoriteObject = FrequencyManager.getCurrentFrequencyObject(frequency);
    let frequencyName = '';
    if (favoriteObject && favoriteObject.name) {
      frequencyName = favoriteObject.name;
    }
    this.postMessage('nowplaying', { title: frequencyName, frequency: frequency });
  };

  Remote.prototype.updatePlaybackStatus = function () {
    let playStatus = '';
    playStatus = fmRadio.enabled
      ? PLAY_STATUS_PLAYING : PLAY_STATUS_PAUSED;
    this.postMessage('status', playStatus);
  };

  Remote.prototype.stopRemote = function () {
    this.postMessage('stop', { origin: window.location.origin });
  };

  exports.Remote = new Remote();
})(window);
