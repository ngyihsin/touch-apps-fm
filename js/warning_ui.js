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
      this.antennaUnplugWarning
        ? this.antennaUnplugWarning.classList.add('hidden') : '';
      FMAction.fmPowerKey.classList.remove('hidden');
    } else if (!this.antennaUnplugWarning) {
      LazyLoader.load('app://shared.gaiamobile.org/elements/kai-emptypage.js',
        () => {
          this.antennaUnplugWarning = document.createElement('kai-emptypage');
          this.antennaUnplugWarning.id = 'antenna-warning';
          this.antennaUnplugWarning.description = LanguageManager.noAntennaMsg;
          document.querySelector('section').appendChild(this.antennaUnplugWarning);
          // Add theme init
          this.themeDetect();
          this.updateAntennaUI();
        });
    } else {
      this.updateAntennaUI();
    }

    /*
     * If current airplane mode is enabled, 
     * or current device has no valid antenna,
     * fm container element should be hidden
     */
    hiddenState = !HeadphoneState.deviceWithValidAntenna;
    let status = hiddenState
      ? StatusManager.STATUS_WARNING_SHOWING : StatusManager.status;
    if (status === StatusManager.STATUS_FAVORITE_SHOWING) {
      let favoritelist = FrequencyManager.getFavoriteFrequencyList();
      hiddenState = favoritelist && favoritelist.length > 0 ||
        status !== StatusManager.STATUS_FAVORITE_SHOWING;
      let noFavoriteMsg = LanguageManager.noFavoriteMsg;
      if (!hiddenState) {
        document.getElementById('noFavoritelistMsg').innerHTML =
          noFavoriteMsg.replace(
            '{{ star }}',
            '<i data-icon="favorite-off"></i>'
          );
      }
      hiddenState ? FMElementFavoriteListWarning.classList.add('hidden')
        : FMElementFavoriteListWarning.classList.remove('hidden');
    }

    StatusManager.update(status);
  };

  WarningUI.prototype.themeDetect = function () {
    this.antennaUnplugWarning.description = LanguageManager.noAntennaMsg;
    navigator.mozSettings.createLock().get('theme.selected')
      .then((theme) => {
        this.themeChange(theme['theme.selected']);
      });
    navigator.mozSettings.addObserver('theme.selected',
      (theme) => {
        this.themeChange(theme['settingValue']);
      });
  };

  WarningUI.prototype.themeChange = function (theme) {
    let mode = (/darktheme/).test(theme)
      ? '/style/images/img-headphone-unplugged-dark.svg'
      : '/style/images/img-headphone-unplugged-light.svg';
    this.antennaUnplugWarning.src = mode;
  };

  WarningUI.prototype.updateAntennaUI = function () {
    FMElementFMContainer.classList.add('hidden');
    FMElementFMFooter.classList.add('hidden');
    this.antennaUnplugWarning.classList.remove('hidden');
    FMAction.speakSwitch.classList.add('hidden');
    FMAction.fmPowerKey.classList.add('hidden');
  };

  exports.WarningUI = new WarningUI();
})(window);
