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
    if (hiddenState) {
      FMElementFMContainer.classList.remove('hidden');
      FMElementFMFooter.classList.remove('hidden');
      FMElementAntennaUnplugWarning.classList.add('hidden');
      FMAction.fmPowerKey.classList.remove('hidden');
    } else {
      FMElementFMContainer.classList.add('hidden');
      FMElementFMFooter.classList.add('hidden');
      FMElementAntennaUnplugWarning.classList.remove('hidden');
      FMAction.speakSwitch.classList.add('hidden');
      FMAction.fmPowerKey.classList.add('hidden');
    }

    /*
     * If current airplane mode is enabled, or current device has no valid antenna,
     * fm container element should be hidden
     */
    hiddenState = !HeadphoneState.deviceWithValidAntenna;
    let status = hiddenState ? StatusManager.STATUS_WARNING_SHOWING : StatusManager.status;
    if (status === StatusManager.STATUS_FAVORITE_SHOWING) {
      let favoritelist = FrequencyManager.getFavoriteFrequencyList();
      hiddenState = favoritelist && favoritelist.length > 0 ||
        status !== StatusManager.STATUS_FAVORITE_SHOWING;
      FMElementFavoriteListWarning.hidden = hiddenState;
    }

    StatusManager.update(status);
  };

  WarningUI.prototype.themeDetect = function () {
    FMElementAntennaUnplugWarning.description = LanguageManager.noAntennaMsg;
    navigator.mozSettings.createLock().get('theme.selected')
      .then((theme) => {
        this.themeChange(theme['theme.selected']);
      });
    navigator.mozSettings.addObserver('theme.selected', (theme) => {
      this.themeChange(theme['settingValue']);
    });
  };

  WarningUI.prototype.themeChange = function (theme) {
    let mode = (/darktheme/).test(theme)
      ? '/style/images/img-headphone-unplugged-dark.svg'
      : '/style/images/img-headphone-unplugged-light.svg';
    FMElementAntennaUnplugWarning.src = mode;
  };

  exports.WarningUI = new WarningUI();
})(window);
