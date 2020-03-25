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

    this.fmLeftKey = document.getElementById('frequency-op-seekdown');
    this.fmRightKey = document.getElementById('frequency-op-seekup');

    this.freDialer = document.getElementById('dialer-bar');
    this.frequencyBar = document.getElementById('frequency-bar');

    this.action = document.getElementById('action');
    this.footer = document.getElementById('fm-footer');

    FMElementFMFooter.setAttribute('items', JSON.stringify(LanguageManager.items));
    // RTL change
    this.rtlChange();

    this.fmLeftKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    this.fmRightKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    FMElementFrequencyListUI.addEventListener('click', this.callFunByClick.bind(this), false);
    FMElementHeader.addEventListener('click', this.callFunByClick.bind(this), false);
    this.frequencyBar.addEventListener('click', this.callFunByClick.bind(this), false);
    window.addEventListener('keydown', this.callFunBackSpace.bind(this));
    this.footer.addEventListener('categorybarSelect',
      (e) => {
        let clickId = e.detail.selected;
        FunctionList[clickId]();
      });
  };

  FMAction.prototype.rtlChange = function () {
    let isRtl = 'rtl' === document.documentElement.dir;
    
    if (isRtl) {
      this.fmLeftKey.setAttribute('data-l10n-id', 'frequency-op-seekup');
      this.fmRightKey.setAttribute('data-l10n-id', 'frequency-op-seekdown');
    } else {
      this.fmRightKey.setAttribute('data-l10n-id', 'frequency-op-seekup');
      this.fmLeftKey.setAttribute('data-l10n-id', 'frequency-op-seekdown');
    }
  };

  FMAction.prototype.callFunBackSpace = function (e) {
    if (e.key === 'GoBack') {
      let status = StatusManager.status;
      switch (status) {
        case StatusManager.STATUS_FAVORITE_RENAMING:
          FrequencyRename.undoRename();
          e.preventDefault();
          break;
        case StatusManager.STATUS_WARNING_SHOWING:
          window.close();
          break;
        default:
          window.history.back();
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

  FMAction.prototype.callFunByLongPress = function (e) {
    e.preventDefault();
    let id = e.target.id;
    let clickId = e.target.getAttribute('data-l10n-id');
    let click = document.getElementById(id);
    if (!this.timeOutEvent) {
      this.timeOutEvent = setTimeout(() => {
        this.timeOutEvent = null;
        this.isLongPress = true;
        this.onLongClickSeek(clickId);
      }, this.timerLongScan);
    }
    click.addEventListener('touchend',
      () => {
        clearTimeout(this.timeOutEvent);
        if (this.timeOutEvent && !this.isLongPress) {
          this.timeOutEvent = null;
          this.onclickSeek(clickId);
        }
      });
  };

  // Long press to seek
  FMAction.prototype.onLongClickSeek = function (seekUpDirection) {
    let seeking = !!FMPowerKey.getAttribute('data-seeking');
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
    FMPowerKey.dataset.seeking = true;
    let request = seekUpDirection === 'frequency-op-seekdown'
      ? mozFMRadio.seekDown() : mozFMRadio.seekUp();
    request.onsuccess = () => {
      FMPowerKey.removeAttribute('data-seeking');
    };
  };

  /*
   * Toggle speaker and headphone
   */
  FMAction.prototype.speakerUpdate = function (state) {
    if (state) {
      SpeakerState.state = true;
      FMspeakSwitch.setAttribute('data-l10n-id', 'switchToHeadphones');
      FMspeakSwitch.setAttribute('data-icon', 'speaker-on');
    } else {
      SpeakerState.state = false;
      FMspeakSwitch.setAttribute('data-l10n-id', 'speaker-switch');
      FMspeakSwitch.setAttribute('data-icon', 'audio-output');
    }
  };

  FMAction.prototype.optionMenuShow = function (e) {
    let frequencyToRenameElement = e.rangeParent;
    let editValue = e.rangeParent.innerText;
    if (typeof FrequencyRename === 'undefined') {
      let script = [
        'js/frequency_rename.js',
        'app://shared.gaiamobile.org/elements/kai-textfield.js',
        'app://shared.gaiamobile.org/elements/kai-popupmenu.js'
      ];
      LazyLoader.load(script,
        () => {
          FrequencyRename.init(frequencyToRenameElement, editValue);
        });
    } else {
      FrequencyRename.init(frequencyToRenameElement, editValue);
    } 
  };

  FMAction.prototype.onScanClicked = function () {
    // Hide dialog and update current status first
    Dialog.hideDialog();
    StationsList.switchToStationListUI();
  };

  FMAction.prototype.updateStatusUI = function () {
    let status = StatusManager.status;
    switch (status) {
      case StatusManager.STATUS_WARNING_SHOWING:
        FMElementHeader.title = LanguageManager.radioTitle;
        break;
      case StatusManager.STATUS_FAVORITE_SHOWING:
        FMElementHeader.title = LanguageManager.favoritesTitle;
        this.freDialer.classList.remove('hidden');
        FMElementFMFooter.selected = 'favorites';
        break;
      case StatusManager.STATUS_STATIONS_SCANING:
        FMElementHeader.title = LanguageManager.allstationsTitle;
        this.freDialer.classList.add('hidden');
        FrequencyDialer.stationAction.setAttribute('level', 'secondary');
        FrequencyDialer.stationAction.setAttribute('text', LanguageManager.abort);
        this.fmLeftKey.setAttribute('class', 'dis-button');
        this.fmRightKey.setAttribute('class', 'dis-button');
        FrequencyDialer.stationAction.disabled = false;
        FrequencyDialer.stationAction.setAttribute('data-l10n-id', 'abort');
        FMElementFMFooter.selected = 'allstations';
        FMElementFMFooter.disabled = true;
        break;
      case StatusManager.STATUS_STATIONS_SHOWING:
        FMElementHeader.title = LanguageManager.allstationsTitle;
        this.freDialer.classList.add('hidden');
        FrequencyDialer.stationAction.setAttribute('level', 'secondary');
        FrequencyDialer.stationAction.setAttribute('text', LanguageManager.scanStations);
        FMElementFMFooter.selected = 'allstations';
        this.fmLeftKey.setAttribute('class', '');
        this.fmRightKey.setAttribute('class', '');
        FrequencyDialer.stationAction.disabled = false;
        FrequencyDialer.stationAction.setAttribute('data-l10n-id', 'scan-stations');
        FMElementFMFooter.disabled = false;
        break;
      case StatusManager.STATUS_STATIONS_EMPTY:
        FMElementHeader.title = LanguageManager.allstationsTitle;
        this.freDialer.classList.add('hidden');
        FrequencyDialer.stationAction.setAttribute('level', 'primary');
        FrequencyDialer.stationAction.setAttribute('text', LanguageManager.scan);
        FMElementFMFooter.selected = 'allstations';
        FrequencyDialer.stationAction.disabled = false;
        FrequencyDialer.stationAction.setAttribute('data-l10n-id', 'scan-stations');
        break;
      default:
        break;
    }
  };

  var FMAction = new FMAction();
  exports.FMAction = FMAction;
}(window));

