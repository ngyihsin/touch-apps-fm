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

  // Handle 'add-to-favorites' clicked
  function onAddToFavoritesClicked(e) {
    FrequencyList.favoriteDeal(true, e);
  }

  // Handle 'unfavorite' clicked
  function onUnfavoriteClicked(e) {
    FrequencyList.favoriteDeal(false, e);
  }

  // Handle 'rename' clicked
  function onSaveRenameClicked() {
    FMAction.saveRename();
  }

  // Handle 'rename' clicked
  function onCancelRenameClicked() {
    FMAction.undoRename();
  }

  // Handle 'scan-stations' clicked
  function onScanStationsClicked() {
    StationsList.startScanStations();
  }

  // Handle 'switchToHeadphones' clicked
  function onSwitchToHeadphonesClicked() {
    FMAction.speakerUpdate(false);
  }

  // Handle 'switchToSpeaker' clicked
  function onSwitchToSpeakerClicked() {
    FMAction.speakerUpdate(true);
  }

  // Handle 'Tab-frequency' clicked
  function onsetFrequency(e) {
    let frequency = FrequencyList.getFrequencyByElement(e.target);
    mozFMRadio.setFrequency(frequency);
  }

  // Handle 'option-menu clicked
  function onoptionMenu(e) {
    FMAction.optionMenuShow(e);
  }

  // Indicate corresponding handle function mapping table
  const FunctionList = {
    'allstations': onAllStationsClicked,
    'favorites': onFavoritesClicked,
    'power-switch-on': onPlayClicked,
    'power-switch-off': onStopClicked,
    'abort': onAbortClicked,
    'add-to-favorites': onAddToFavoritesClicked,
    'unfavorite': onUnfavoriteClicked,
    'save-rename': onSaveRenameClicked,
    'cancel-rename': onCancelRenameClicked,
    'scan-stations': onScanStationsClicked,
    'switchToHeadphones': onSwitchToHeadphonesClicked,
    'speaker-switch': onSwitchToSpeakerClicked,
    'tab-frequency': onsetFrequency,
    'option-menu': onoptionMenu
  };

  // FMAction Constructor
  function FMAction() {}

  // Initialize FMAction
  FMAction.prototype.init = function () {
    this.isLongPress = false;
    this.timerLongScan = 1500;
    this.timeOutEvent = 0;
    this.editValue = '';
    this.frequencyToRenameElement = null;

    this.HeaderTitle = document.getElementById('header');
    this.speakSwitch = document.getElementById('speaker-switch');
    this.fmPowerKey = document.getElementById('power-switch');

    this.fmLeftKey = document.getElementById('frequency-op-seekdown');
    this.fmRightKey = document.getElementById('frequency-op-seekup');

    this.freDialer = document.getElementById('dialer-bar');

    this.optionMenu = document.querySelector('kai-popupmenu');

    this.action = document.getElementById('action');

    /**
     * Due to component kill-button can't save cache so when page init, update kill button
     */
    this.pillButtonUpdate();
    FMElementFMFooter.setAttribute('items', JSON.stringify(LanguageManager.items));

    this.fmLeftKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    this.fmRightKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    window.addEventListener('click', this.callFunByClick.bind(this), false);
    window.addEventListener('keydown', this.callFunBackSpace.bind(this));
    document.addEventListener('categorybarSelect', (e) => {
      let clickId = e.detail.selected;
      FunctionList[clickId]();
    });
    this.optionMenu.addEventListener('select', () => {
      FrequencyRename.switchToRenameModeUI();
    });
  };

  FMAction.prototype.callFunBackSpace = function (e) {
    if (e.key === 'Backspace') {
      if (FMElementAntennaUnplugWarning.classList.contains('hidden')) {
        if (StatusManager.status === StatusManager.STATUS_FAVORITE_RENAMING) {
          FrequencyRename.undoRename();
          e.preventDefault();
          return;
        }
        window.history.back();
      } else {
        window.close();
      }
    }
  };


  FMAction.prototype.callFunByClick = function (e) {
    if (this.clickDownFreezeTimeout) {
      return;
    }

    this.clickDownFreezeTimeout = setTimeout(() => {
      clearTimeout(this.clickDownFreezeTimeout);
      this.clickDownFreezeTimeout = null;
    }, 200);
    let clickId = e.target.getAttribute('data-l10n-id');
    if (clickId) {
      FunctionList[clickId](e);
    }
  };

  // Handle 'settings' clicked
  FMAction.prototype.settingsClicked = function () {
    try {
      new MozActivity({
        name: 'configure',
        data: {
          target: 'device',
          section: 'root'
        }
      });
    } catch (e) {
      console.error(`Failed to create an activity: ${e}`);
    }
  };

  // Avoid pillnutton was destory by mozl10
  FMAction.prototype.pillButtonUpdate = function () {
    if (this.action.innerHTML.indexOf('span') === -1) {
      let button = `
      <kai-pillbutton id="station-action" data-l10n-id="scan-stations" 
      text=${LanguageManager.scanStations} level="secondary">
      </kai-pillbutton>`;
      this.action.innerHTML = button;
    }
    this.stationAction = document.getElementById('station-action');
  };

  FMAction.prototype.callFunByLongPress = function (e) {
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
    click.addEventListener('touchend', () => {
      clearTimeout(this.timeOutEvent);
      if (this.timeOutEvent && !this.isLongPress) {
        this.timeOutEvent = null;
        this.onclickSeek(clickId);
      }
    });
  };

  // Long press to seek
  FMAction.prototype.onLongClickSeek = function (seekUpDirection) {
    let seeking = !!this.fmPowerKey.getAttribute('data-seeking');
    this.isLongPress = false;
    // If the FM radio is seeking channel currently, cancel it and seek again.
    if (seeking) {
      let request = mozFMRadio.cancelSeek();
      request.onsuccess = this.startStationScan(seekUpDirection);
    } else {
      this.startStationScan(seekUpDirection);
    }
  };

  // Short press to seek
  FMAction.prototype.onclickSeek = function (seekUpDirection) {
    if (mozFMRadio.enabled) {
      if (!this.isLongPress) {
        let frequency = mozFMRadio.frequency;
        frequency = seekUpDirection === 'frequency-op-seekdown'
          ? frequency - 0.1 : frequency + 0.1;
        if (seekUpDirection === 'frequency-op-seekdown' &&
          frequency < mozFMRadio.frequencyLowerBound) {
          mozFMRadio.setFrequency(mozFMRadio.frequencyUpperBound);
        } else if (seekUpDirection === 'frequency-op-seekup' &&
          frequency > mozFMRadio.frequencyUpperBound) {
          mozFMRadio.setFrequency(mozFMRadio.frequencyLowerBound);
        } else {
          mozFMRadio.setFrequency(frequency);
        }
      } else {
        mozFMRadio.cancelSeek();
      }
      this.isLongPress = false;
    }
  };

  FMAction.prototype.startStationScan = function (seekUpDirection) {
    this.fmPowerKey.dataset.seeking = true;
    let request = seekUpDirection === 'frequency-op-seekdown'
      ? mozFMRadio.seekDown() : mozFMRadio.seekUp();
    request.onsuccess = () => {
      this.fmPowerKey.removeAttribute('data-seeking');
    };
  };

  /*
   * Toggle speaker and headphone
   */
  FMAction.prototype.speakerUpdate = function (state) {
    if (state) {
      SpeakerState.state = true;
      this.speakSwitch.setAttribute('data-l10n-id', 'switchToHeadphones');
      this.speakSwitch.setAttribute('data-icon', 'speaker-on');
    } else {
      SpeakerState.state = false;
      this.speakSwitch.setAttribute('data-l10n-id', 'speaker-switch');
      this.speakSwitch.setAttribute('data-icon', 'audio-output');
    }
  };

  FMAction.prototype.optionMenuShow = function (e) {
    this.optionMenu.options[0].label = LanguageManager.rename;
    this.optionMenu.open = !this.optionMenu.open;
    FrequencyRename.editValue = e.rangeParent.innerText;
    FrequencyRename.frequencyToRenameElement = e.rangeParent;
    FrequencyRename.previousStatus = StatusManager.status;
  };

  FMAction.prototype.onScanClicked = function () {
    // Hide dialog and update current status first
    Dialog.hideDialog();
    // StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    StationsList.switchToStationListUI();
  };

  FMAction.prototype.updateStatusUI = function () {
    let status = StatusManager.status;
    switch (status) {
      case StatusManager.STATUS_WARNING_SHOWING:
        this.HeaderTitle.title = LanguageManager.radioTitle;
        break;
      case StatusManager.STATUS_FAVORITE_SHOWING:
        this.HeaderTitle.title = LanguageManager.favoritesTitle;
        this.action.classList.add('hidden');
        this.freDialer.classList.remove('hidden');
        FMElementFMFooter.selected = 'favorites';
        break;
      case StatusManager.STATUS_STATIONS_SCANING:
        this.HeaderTitle.title = LanguageManager.allstationsTitle;
        this.action.classList.remove('hidden');
        this.freDialer.classList.add('hidden');
        this.stationAction.level = 'secondary';
        this.stationAction.text = LanguageManager.abort;
        this.fmLeftKey.setAttribute('class', 'dis-button');
        this.fmRightKey.setAttribute('class', 'dis-button');
        this.stationAction.setAttribute('data-l10n-id', 'abort');
        FMElementFMFooter.selected = 'allstations';
        FMElementFMFooter.disabled = true;
        break;
      case StatusManager.STATUS_STATIONS_SHOWING:
        this.HeaderTitle.title = LanguageManager.allstationsTitle;
        this.action.classList.remove('hidden', 'scan');
        this.freDialer.classList.add('hidden');
        this.stationAction.level = 'secondary';
        this.stationAction.text = LanguageManager.scanStations;
        FMElementFMFooter.selected = 'allstations';
        this.fmLeftKey.setAttribute('class', '');
        this.fmRightKey.setAttribute('class', '');
        this.stationAction.setAttribute('data-l10n-id', 'scan-stations');
        FMElementFMFooter.disabled = false;
        break;
      case StatusManager.STATUS_STATIONS_EMPTY:
        this.HeaderTitle.title = LanguageManager.allstationsTitle;
        this.action.classList.remove('hidden', 'scan');
        this.freDialer.classList.add('hidden');
        this.stationAction.level = 'primary';
        this.stationAction.text = LanguageManager.scan;
        FMElementFMFooter.selected = 'allstations';
        this.stationAction.setAttribute('data-l10n-id', 'scan-stations');
        break;
      default:
        break;
    }
  };

  var FMAction = new FMAction();
  exports.FMAction = FMAction;
}(window));

