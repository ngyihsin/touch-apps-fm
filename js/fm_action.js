/* exported FMAction */
'use strict';

(function (exports) {

  // Handle 'allstations' clicked
  function onAllStationsClicked() {
    StationsList.switchToStationListUI();
  }

  // Handle 'favorites' clicked
  function onFavoritesClicked() {
    StationsList.switchToFavoriteListUI();
  }

  // Handle 'turn-on' clicked
  function onPlayClicked() {
    FMRadio.enableFMRadio(FrequencyDialer.getFrequency());
  }

  // Handle 'turn-off' clicked
  function onStopClicked() {
    FMRadio.disableFMRadio();
  }

  // Handle 'abort' clicked
  function onAbortClicked() {
    StationsList.abortScanStations(false);
  }

  // Handle 'scan' clicked
  function onScanClicked() {
    // Hide dialog and update current status first
    FMAction.hideDialog();
    StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    StationsList.switchToStationListUI();
  }

  // Handle 'add-to-favorites' clicked
  function onAddToFavoritesClicked() {
    if (StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING) {
      // Update current frequency as favorite to data base
      FrequencyManager.updateFrequencyFavorite(FrequencyDialer.getFrequency(), true);
      // Update favorite list UI
      FrequencyList.updateFavoriteListUI();
      // Update frequency dialer UI
      FrequencyDialer.updateFrequency();
      WarningUI.update();
      FocusManager.update();
    }
    // Update status to update softkeys
    StatusManager.update();
  }

  // Handle 'unfavorite' clicked
  function onUnfavoriteClicked() {
    if (StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING) {
      // Update current frequency as unfavorite to data base
      FrequencyManager.updateFrequencyFavorite(FrequencyDialer.getFrequency(), false);
      // Update favorite list UI
      FrequencyList.updateFavoriteListUI();
      FrequencyDialer.updateFrequency();
      WarningUI.update();
      FocusManager.update();
    }
    // Update status to update softkeys
    StatusManager.update();
  }

  // Handle 'rename' clicked
  function onRenameClicked() {
  }

  // Handle 'scan-stations' clicked
  function onScanStationsClicked() {
    StationsList.startScanStations();
  }

  // Handle 'switchToHeadphones' clicked
  function onSwitchToHeadphonesClicked() {
  }

  // Handle 'switchToSpeaker' clicked
  function onSwitchToSpeakerClicked() {
  }

  // Handle'frequency item ' clicked
  function onItemClicked(e) {

  }

  // Handle 'Tab-frequency' clicked
  function onsetFrequency(e) {
    let frequency = e.target.innerText;
    mozFMRadio.setFrequency(frequency)
  }
  
  // Handle 'settings' clicked
  function onSettingsClicked () {
    try {
      new MozActivity({
        name: 'configure',
        data: {
          target: 'device',
          section: 'connectivity-settings'
        }
      });
    } catch (e) {
      console.error('Failed to create an activity: ' + e);
    }
  }

  // Indicate corresponding handle function mapping table
  const FunctionList = {
    'allstations': onAllStationsClicked,
    'favorites': onFavoritesClicked,
    'Options': onItemClicked,
    'power-switch-on': onPlayClicked,
    'power-switch-off': onStopClicked,
    'abort': onAbortClicked,
    'add-to-favorites': onAddToFavoritesClicked,
    'unfavorite': onUnfavoriteClicked,
    'rename': onRenameClicked,
    'scan-stations': onScanStationsClicked,
    'switchToHeadphones': onSwitchToHeadphonesClicked,
    'switchToSpeaker': onSwitchToSpeakerClicked,
    'Tab-frequency': onsetFrequency
  };

  // FMAction Constructor
  function FMAction() { };

  // Initialize FMAction
  FMAction.prototype.init = function () {
    this.isLongPress = false;
    this.timerLongScan = 1500;
    this.timeOutEvent = 0;

    this.HeaderTitle = document.getElementById('header');
    this.speakSwitch = document.getElementById('speaker-switch');
    this.fmPowerKey = document.getElementById('power-switch');

    this.station_action = document.getElementById('station-action');
    this.favorite_station = document.getElementById('favorate-station');
    this.allStation = document.getElementById('all-stations');

    this.fmLeftKey = document.getElementById('frequency-op-seekdown');
    this.fmRightKey = document.getElementById('frequency-op-seekup');

    this.dialog = document.getElementById('myDialog');

    this.fmLeftKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    this.fmRightKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    window.addEventListener('click', this.callFunByClick.bind(this), false);
  };



  FMAction.prototype.callFunByClick = function(e) {
    let clickId = e.target.getAttribute('data-l10n-id');
    if (clickId) {
      FunctionList[clickId](e);
    }
  }

  FMAction.prototype.callFunByLongPress = function(e) {
    e.preventDefault();
    let clickId = e.target.id;
    let click = document.getElementById(clickId);
    if (!this.timeOutEvent) {
      this.timeOutEvent = setTimeout(() => {
        this.timeOutEvent = null;
        this.isLongPress = true;
        this.onLongClickSeek(clickId);
      }, this.timerLongScan);
    }
    click.addEventListener('touchmove', () => {
      clearTimeout(this.timeOutEvent);
      timeOutEvent = null;
      e.preventDefault();
    });
    click.addEventListener('touchend', () => {
      clearTimeout(this.timeOutEvent);
      if (this.timeOutEvent && !this.isLongPress) {
        this.timeOutEvent = null;
        this.onclickSeek(clickId);
      }
    });
  }

  FMAction.prototype.onLongClickSeek = function(seekUpDirection) {
    let seeking = !!this.fmPowerKey.getAttribute('data-seeking');
    this.isLongPress = false;
    // If the FM radio is seeking channel currently, cancel it and seek again.
    if (seeking) {
      let request = mozFMRadio.cancelSeek();
      request.onsuccess = this.startStationScan(seekUpDirection);;
    } else {
      this.startStationScan(seekUpDirection);
    }
  }

  FMAction.prototype.onclickSeek= function(seekUpDirection) {    
    if (mozFMRadio.enabled) {
      if (!this.isLongPress) {
        let frequency = mozFMRadio.frequency;
        frequency = seekUpDirection === 'frequency-op-seekdown' 
        ? frequency - 0.1 : frequency + 0.1;
        if (seekUpDirection === 'frequency-op-seekdown' 
        && frequency < mozFMRadio.frequencyLowerBound) {
          mozFMRadio.setFrequency(mozFMRadio.frequencyUpperBound);
        } else if (seekUpDirection === 'frequency-op-seekup' 
        && frequency > mozFMRadio.frequencyUpperBound) {
          mozFMRadio.setFrequency(mozFMRadio.frequencyLowerBound);
        } else {
          mozFMRadio.setFrequency(frequency);
        }
      } else {
        mozFMRadio.cancelSeek();
      }
      this.isLongPress = false;
    }
  }

  FMAction.prototype.startStationScan = function (seekUpDirection) {
    this.fmPowerKey.dataset.seeking = true;
    let request = seekUpDirection === 'frequency-op-seekdown' 
    ? mozFMRadio.seekDown() : mozFMRadio.seekUp();
    request.onsuccess = () => {
      this.fmPowerKey.removeAttribute('data-seeking');
    };
  };

  // Show dialog
  FMAction.prototype.showDialog = function (l10nIdHeader,l10nIdMsg,l10nIdButton) {
    this.hideDialog();
    this.dialog.setAttribute('title',l10nIdHeader)
    this.dialog.setAttribute('message',l10nIdMsg);
    this.dialog.primarybtntext = l10nIdButton;
    this.dialog.classList.remove('hidden');
    this.dialog.open = true;
    this.dialog.focus();
    document.addEventListener('dialogSecondaryBtnClick', e => {
      if (l10nIdButton === 'SCAN') {
        StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
        this.dialog.open = false;
      } else {
        window.close();
      }
    });
    document.addEventListener('dialogPrimaryBtnClick', e => {
      l10nIdButton === 'SCAN' ? onScanClicked() : onSettingsClicked();
    });
    
  };

  // Hide dialog
  FMAction.prototype.hideDialog = function () {
    if (!this.dialog.classList[0]){
      this.dialog.classList.add('hidden');
      this.dialog.open = false;
    }
  };

  FMAction.prototype.updateStatusUI = function () {
    let status = StatusManager.status;
    switch (status) {
      case StatusManager.STATUS_WARNING_SHOWING:
        this.HeaderTitle.title = 'FM RADIO';
        this.FMElementFMContainer.classList.add('hidden');
        break;
      case StatusManager.STATUS_FAVORITE_SHOWING:
        this.HeaderTitle.title = 'FAVORITES';
        this.station_action.classList.add('hidden');
        this.favorite_station.setAttribute('icon','favorite-on');  
        this.favorite_station.text = '';
        this.allStation.setAttribute('icon','');
        this.allStation.text = 'ALL';
        break;
      case StatusManager.STATUS_STATIONS_SCANING:
        this.HeaderTitle.title = 'STATIONS';
        this.station_action.classList.remove('hidden');
        this.station_action.level = 'secondary';
        this.station_action.text = 'ABORT';
        this.station_action.setAttribute('data-l10n-id', 'abort');
        this.allStation.setAttribute('icon','fm-radio');
        this.allStation.text = '';
        this.favorite_station.setAttribute('icon','');  
        this.favorite_station.text = 'FAVORITES';
        break;
      case StatusManager.STATUS_STATIONS_SHOWING:
        this.HeaderTitle.title = 'STATIONS';
        this.station_action.classList.remove('hidden','scan');
        this.station_action.level = 'secondary';
        this.station_action.text = 'RESCAN';
        this.station_action.setAttribute('data-l10n-id', 'scan-stations');
        this.allStation.setAttribute('icon','fm-radio');
        this.allStation.text = '';
        this.favorite_station.setAttribute('icon','');  
        this.favorite_station.text = 'FAVORITES';
        break;
      case StatusManager.STATUS_DIALOG_FIRST_INIT:        
        break;
    }
  }

  var FMAction = new FMAction();
  exports.FMAction = FMAction;
})(window);

