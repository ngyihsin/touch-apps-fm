/* exported LanguageManager */
'use strict';

(function (exports) {

  exports.LanguageManager = {
    init: function init() {
      this.airplaneModeHeader = navigator.mozL10n.get('airplaneModeHeader');
      this.airplaneModeMsg = navigator.mozL10n.get('airplaneModeMsg');
      this.airplaneModeButton = navigator.mozL10n.get('settings');
      this.scanStationsMsg = navigator.mozL10n.get('scan-stations-msg');
      this.scanStationsHeader = navigator.mozL10n.get('scan-stations-header');
      this.scanStations = navigator.mozL10n.get('scan-stations');
      this.scan = navigator.mozL10n.get('scan');
      this.favoritesTitle = navigator.mozL10n.get('favorites');
      this.radioTitle = navigator.mozL10n.get('radio');
      this.allstationsTitle = navigator.mozL10n.get('allstations');
      this.abort = navigator.mozL10n.get('abort');
      this.save = navigator.mozL10n.get('save');
      this.cancel = navigator.mozL10n.get('cancel');
      this.rename = navigator.mozL10n.get('station-renamed');
      this.items = [
        { label: navigator.mozL10n.get('favorites'), value: 'favorites', icon: 'favorite-on' },
        { label: navigator.mozL10n.get('all'), value: 'allstations', icon: 'fm-radio' }
      ];

      this.dialog = document.getElementById('myDialog');
      this.optionMenu = document.querySelector('kai-optionmenu');
      this.HeaderTitle = document.getElementById('header');
      this.stationAction = document.getElementById('station-action');
      this.editButton = document.getElementById('edit-button');
      this.footer = document.getElementById('fm-footer');
    },

    updateLanguage: function updateLanguage() {
      this.optionMenu.options[0].label = this.rename;
      this.editButton.children[0].text = this.cancel;
      this.editButton.children[1].text = this.save;
      this.footer.setAttribute('items', JSON.stringify(this.items));
      let status = StatusManager.status;
      switch (status) {
        case StatusManager.STATUS_WARNING_SHOWING:
          FMAction.HeaderTitle.title = this.radioTitle;
          if (this.dialog.open) {
            this.dialog.primarybtntext = this.airplaneModeButton;
            this.dialog.secondarybtntext = this.cancel;
            this.dialog.title = this.airplaneModeHeader;
            this.dialog.message = this.airplaneModeMsg;
          }
          break;
        case StatusManager.STATUS_FAVORITE_SHOWING:
          this.HeaderTitle.title = this.favoritesTitle;
          break;
        case StatusManager.STATUS_STATIONS_SCANING:
          this.HeaderTitle.title = this.allstationsTitle;
          this.stationAction.text = this.abort;
          break;
        case StatusManager.STATUS_STATIONS_SHOWING:
          this.HeaderTitle.title = this.allstationsTitle;
          this.stationAction.text = this.scanStations;
          break;
        case StatusManager.STATUS_STATIONS_EMPTY:
          this.HeaderTitle.title = this.allstationsTitle;
          this.stationAction.text = this.scan;
          break;
        case StatusManager.STATUS_DIALOG_FIRST_INIT:
          this.dialog.primarybtntext = this.scan;
          this.dialog.secondarybtntext = this.cancel;
          this.dialog.title = this.scanStationsHeader;
          this.dialog.message = this.scanStationsMsg;
          break;
      }
    }
  };
})(this);
