/* exported LanguageManager */
'use strict';

(function (exports) {

  exports.LanguageManager = {
    init: function init() {
      this.airplaneModeHeader = window.api.l10n.get('airplaneModeHeader');
      this.airplaneModeMsg = window.api.l10n.get('airplaneModeMsg');
      this.airplaneModeButton = window.api.l10n.get('settings');
      this.noFavoriteMsg = window.api.l10n.get('noFavoritelistMsg');
      this.noAntennaMsg = window.api.l10n.get('noAntennaMsg');
      this.scanStationsMsg = window.api.l10n.get('scan-stations-msg');
      this.scanStationsHeader = window.api.l10n.get('scan-stations-header');
      this.scanStations = window.api.l10n.get('scan-stations');
      this.scan = window.api.l10n.get('scan');
      this.favoritesTitle = window.api.l10n.get('favorites');
      this.radioTitle = window.api.l10n.get('radio');
      this.allstationsTitle = window.api.l10n.get('allstations');
      this.abort = window.api.l10n.get('abort');
      this.save = window.api.l10n.get('save');
      this.cancel = window.api.l10n.get('cancel');
      this.rename = window.api.l10n.get('station-renamed');
      this.items = [
        { label: window.api.l10n.get('favorites'), value: 'favorites', icon: 'favorite-on' },
        { label: window.api.l10n.get('all'), value: 'allstations', icon: 'fm-radio-32px' }
      ];

      this.dialog = document.querySelector('kai-dialog');
      this.HeaderTitle = document.getElementById('header');
      this.footer = document.getElementById('fm-footer');
    },

    updateLanguage: function updateLanguage() {
      let optionMenu = document.querySelector('kai-popupmenu');
      optionMenu ? optionMenu.options[0].label = this.rename : '';
      this.footer.setAttribute('items', JSON.stringify(this.items));
      let status = StatusManager.status;
      switch (status) {
        case StatusManager.STATUS_WARNING_SHOWING:
          this.HeaderTitle.primarytitle = this.radioTitle;
          HeadphoneState.antennaUnplugWarning.description = this.noAntennaMsg;
          if (this.dialog.open) {
            this.dialog.primarybtntext = this.airplaneModeButton;
            this.dialog.secondarybtntext = this.cancel;
            this.dialog.dialogtitle = this.airplaneModeHeader;
            this.dialog.message = this.airplaneModeMsg;
          }
          break;
        case StatusManager.STATUS_FAVORITE_SHOWING:
          this.HeaderTitle.primarytitle = this.favoritesTitle;
          break;
        case StatusManager.STATUS_STATIONS_SCANING:
          this.HeaderTitle.primarytitle = this.allstationsTitle;
          FrequencyDialer.stationAction.text = this.abort;
          break;
        case StatusManager.STATUS_STATIONS_SHOWING:
          this.HeaderTitle.primarytitle = this.allstationsTitle;
          FrequencyDialer.stationAction.text = this.scanStations;
          break;
        case StatusManager.STATUS_STATIONS_EMPTY:
          this.HeaderTitle.primarytitle = this.allstationsTitle;
          FrequencyDialer.stationAction.text = this.scan;
          break;
        case StatusManager.STATUS_DIALOG_FIRST_INIT:
          this.dialog.primarybtntext = this.scan;
          this.dialog.secondarybtntext = this.cancel;
          this.dialog.dialogtitle = this.scanStationsHeader;
          this.dialog.message = this.scanStationsMsg;
          break;
        case StatusManager.STATUS_FAVORITE_RENAMING:
          this.dialog.primarybtntext = this.save;
          this.dialog.secondarybtntext = this.cancel;
          this.dialog.dialogtitle = this.rename;
          break;
        default:
          break;
      }
    }
  };
})(window);
