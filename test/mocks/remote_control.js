(function(exports) {

    let MediaRemoteControls = function() {
      this._commandListeners = {};
    };
    MediaRemoteControls.prototype.addCommandListener = function(command, listener) {
      if (this._commandListeners[command])
        this._commandListeners[command].push(listener);
    };
    MediaRemoteControls.prototype._postMessage = jest.fn();
    MediaRemoteControls.prototype._setupIAC = jest.fn();
    MediaRemoteControls.prototype.notifyAppInfo = jest.fn();
    exports.MediaRemoteControls = MediaRemoteControls;
  })(window);
  