/* exported WarningUI */
'use strict';

(function (exports) {

  const WarningUI = function () {};

  WarningUI.prototype.update = function () {
    let hiddenState = false;

    /*
     * If current device has no valid antenna,
     * antenna warning UI should be shown
     */
    hiddenState = HeadphoneState.deviceWithValidAntenna;
    FMElementAntennaUnplugWarning.hidden = hiddenState;
    if (hiddenState) {
      FMElementFMContainer.classList.remove('hidden');
      FMElementFMFooter.classList.remove('hidden');
      document.getElementById('power-switch').classList.remove('hidden');
    } else {
      FMElementFMContainer.classList.add('hidden');
      FMElementFMFooter.classList.add('hidden');
      document.getElementById('power-switch').classList.add('hidden');
    }

    /*
     * If current airplane mode is enabled,
     * airplane mode warning UI should be shown
     */
    hiddenState = !FMRadio.airplaneModeEnabled;
    hiddenState = !FMRadio.airplaneModeEnabled;
    if (!hiddenState) {
      FMAction.dialog.setAttribute('class', 'airplane-dialog');
      FMAction.showDialog(LanguageManager.airplaneModeHeader, LanguageManager.airplaneModeMsg, LanguageManager.airplaneModeButton);
    }

    /*
     * If current airplane mode is enabled, or current device has no valid antenna,
     * fm container element should be hidden
     */
    hiddenState = FMRadio.airplaneModeEnabled || !HeadphoneState.deviceWithValidAntenna;
    let status = hiddenState ? StatusManager.STATUS_WARNING_SHOWING : StatusManager.status;
    FMElementFavoriteListWarning.hidden = true;
    if (status === StatusManager.STATUS_FAVORITE_SHOWING) {
      let favoritelist = FrequencyManager.getFavoriteFrequencyList();
      hiddenState = favoritelist && favoritelist.length > 0 ||
        status !== StatusManager.STATUS_FAVORITE_SHOWING;
      FMElementFavoriteListWarning.hidden = hiddenState;
    }

    StatusManager.update(status);
  };

  exports.WarningUI = new WarningUI();
})(window);
