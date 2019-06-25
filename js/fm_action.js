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
  }

  // Handle 'unfavorite' clicked
  function onUnfavoriteClicked() {
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

  // Indicate corresponding handle function mapping table
  const FunctionList = {
    'allstations': onAllStationsClicked,
    'favorites': onFavoritesClicked,
    'Options': onItemClicked,
    'power-switch-on': onPlayClicked,
    'power-switch-off': onStopClicked,
    'abort': onAbortClicked,
    'scan': onScanClicked,
    'add-to-favorites': onAddToFavoritesClicked,
    'unfavorite': onUnfavoriteClicked,
    'rename': onRenameClicked,
    'scan-stations': onScanStationsClicked,
    'switchToHeadphones': onSwitchToHeadphonesClicked,
    'switchToSpeaker': onSwitchToSpeakerClicked,
  };

  // FMAction Constructor
  function FMAction() { };

  // Initialize FMAction
  FMAction.prototype.init = function () {
    this.isLongPress = false;
    this.timerLongScan = 1500;
    this.timeOutEvent = 0;

    this.HeaderTitle = document.getElementById('header-title');
    this.station_action = document.getElementById('station-action');
    this.favorite = document.getElementById('favorate-station');
    this.allStation = document.getElementById('all-stations');

    this.fmLeftKey = document.getElementById('frequency-op-seekdown');
    this.fmPowerKey = document.getElementById('power-switch');
    this.fmRightKey = document.getElementById('frequency-op-seekup');

    this.fmDialogContainer = document.querySelector('.dialog-container');
    this.fmDialogContent = this.fmDialogContainer.querySelector('.content');

    this.fmLeftKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    this.fmRightKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    window.addEventListener('click', this.callFunByClick.bind(this), false);
  };



  FMAction.prototype.callFunByClick = function(e) {
    let clickId = e.target.getAttribute('data-l10n-id');
    FunctionList[clickId]();
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
  FMAction.prototype.showDialog = function (l10nId) {
    this.hideDialog();
    this.fmDialogContent.setAttribute('data-l10n-id', l10nId);
    this.fmDialogContainer.classList.remove('hidden');
    this.fmDialogContainer.focus();
  };

  // Hide dialog
  FMAction.prototype.hideDialog = function () {
    if (!this.fmDialogContainer.classList.contains('hidden')) {
      this.fmDialogContainer.classList.add('hidden');
    }
  };

  FMAction.prototype.updateStatusUI = function () {
    let status = StatusManager.status;
    switch (status) {
      case StatusManager.STATUS_WARNING_SHOWING:
        this.HeaderTitle.innerText = 'FM RADIO';
        this.FMElementFMContainer.classList.add('hidden');
        break;
      case StatusManager.STATUS_FAVORITE_SHOWING:
        this.HeaderTitle.innerText = 'FAVORITES';
        this.station_action.classList.add('hidden');
        this.favorite.classList.add('favorite-icon');
        break;
      case StatusManager.STATUS_STATIONS_SCANING:
        this.HeaderTitle.innerText = 'STATIONS';
        this.station_action.classList.remove('hidden');
        this.station_action.innerHTML = 'ABORT';
        this.station_action.setAttribute('data-l10n-id', 'abort');
        break;
      case StatusManager.STATUS_STATIONS_SHOWING:
        this.HeaderTitle.innerText = 'STATIONS';
        this.station_action.classList.remove('hidden');
        this.station_action.innerHTML = 'RESCAN';
        this.station_action.setAttribute('data-l10n-id', 'scan-stations');
        this.allStation.classList.add('icon-back');
        break;
      case StatusManager.STATUS_DIALOG_FIRST_INIT:
        this.station_action.classList.remove('hidden');
        this.station_action.innerHTML = 'SCAN';
        this.station_action.setAttribute('data-l10n-id', 'scan');
        this.allStation.classList.add('icon-back');
        break;
    }
  }

  var FMAction = new FMAction();
  exports.FMAction = FMAction;
})(window);

