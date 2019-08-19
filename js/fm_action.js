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
    // StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    StationsList.switchToStationListUI();
  }

  // Handle 'add-to-favorites' clicked
  function onAddToFavoritesClicked() {
    if (StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING) {
      // Update current frequency as favorite to data base
      FrequencyManager.updateFrequencyFavorite(FrequencyDialer.getFrequency(),
        true);
      // Update favorite list UI
      FrequencyList.updateFavoriteListUI();
      // Update frequency dialer UI
      WarningUI.update();
    } else if (StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING) {

      /*
       * Update current frequency as favorite to data base,
       * and mark current frequency is a station
       */
      FrequencyManager.updateFrequencyFavorite(FrequencyDialer.getFrequency(),
        true,
        true);
      const currentFocusedElement = FocusManager.getCurrentFocusElement();
      FrequencyList.updateCurrentFrequencyElement(currentFocusedElement);
    }
    FrequencyDialer.updateFrequency();
    FocusManager.update();
    StatusManager.update();
  }

  // Handle 'unfavorite' clicked
  function onUnfavoriteClicked() {
    if (StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING) {
      // Update current frequency as unfavorite to data base
      FrequencyManager.updateFrequencyFavorite(FrequencyDialer.getFrequency(),
        false);
      // Update favorite list UI
      FrequencyList.updateFavoriteListUI();
      WarningUI.update();
    } else if (StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING) {

      /*
       * Update current frequency as unfavorite to data base,
       * and mark current frequency is a station
       */
      FrequencyManager.updateFrequencyFavorite(FrequencyDialer.getFrequency(),
        false,
        true);
      const currentFocusedElement = FocusManager.getCurrentFocusElement();
      FrequencyList.updateCurrentFrequencyElement(currentFocusedElement);
    }
    FrequencyDialer.updateFrequency();
    FocusManager.update();
    StatusManager.update();
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
    FrequencyDialer.progressOn();
    StationsList.startScanStations();
  }

  // Handle 'switchToHeadphones' clicked
  function onSwitchToHeadphonesClicked() {
    SpeakerState.state = false;
    FMAction.speakerUpdate(false);
  }

  // Handle 'switchToSpeaker' clicked
  function onSwitchToSpeakerClicked() {
    SpeakerState.state = true;
    FMAction.speakerUpdate(true);
  }

  // Handle 'Tab-frequency' clicked
  function onsetFrequency(e) {
    const frequency = FrequencyList.getFrequencyByElement(e.target);
    mozFMRadio.setFrequency(frequency);
  }

  // Handle 'option-menu clicked
  function onoptionMenu(e) {
    FMAction.optionMenuShow(e);
  }

  // Handle 'settings' clicked
  function onSettingsClicked() {
    try {
      new MozActivity({
        name: 'configure',
        data: {
          target: 'device',
          section: 'connectivity-settings'
        }
      });
    } catch (e) {
      console.error(`Failed to create an activity: ${e}`);
    }
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
    this.preStatus = 0;

    this.mainBody = document.querySelector('section');
    this.HeaderTitle = document.getElementById('header');
    this.speakSwitch = document.getElementById('speaker-switch');
    this.fmPowerKey = document.getElementById('power-switch');

    this.stationＡction = document.getElementById('station-action');

    this.fmLeftKey = document.getElementById('frequency-op-seekdown');
    this.fmRightKey = document.getElementById('frequency-op-seekup');

    this.dialog = document.getElementById('myDialog');
    this.freDialer = document.getElementById('dialer-bar');

    this.optionMenu = document.querySelector('kai-optionmenu');
    this.inputDialog = document.getElementById('input-dialog');

    FMElementFMFooter.setAttribute('items', JSON.stringify(LanguageManager.items));

    this.fmLeftKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    this.fmRightKey.addEventListener('touchstart', this.callFunByLongPress.bind(this), false);
    window.addEventListener('click', this.callFunByClick.bind(this), false);
    document.addEventListener('categorybarSelect', (e) => {
      const clickId = e.detail.selected;
      FunctionList[clickId]();
    });
  };


  FMAction.prototype.callFunByClick = function (e) {
    const clickId = e.target.getAttribute('data-l10n-id');
    if (clickId) {
      FunctionList[clickId](e);
    }
  };

  FMAction.prototype.callFunByLongPress = function (e) {
    e.preventDefault();
    const clickId = e.target.id;
    const click = document.getElementById(clickId);
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
    const seeking = !!this.fmPowerKey.getAttribute('data-seeking');
    this.isLongPress = false;
    // If the FM radio is seeking channel currently, cancel it and seek again.
    if (seeking) {
      const request = mozFMRadio.cancelSeek();
      request.onsuccess = this.startStationScan(seekUpDirection);
    } else {
      this.startStationScan(seekUpDirection);
    }
  };

  // Short press to seek
  FMAction.prototype.onclickSeek = function (seekUpDirection) {
    if (mozFMRadio.enabled) {
      if (!this.isLongPress) {
        let { frequency } = mozFMRadio;
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
    const request = seekUpDirection === 'frequency-op-seekdown'
      ? mozFMRadio.seekDown() : mozFMRadio.seekUp();
    request.onsuccess = () => {
      this.fmPowerKey.removeAttribute('data-seeking');
    };
  };

  // Show dialog
  FMAction.prototype.showDialog = function (l10nIdHeader, l10nIdMsg, l10nIdButton) {
    this.hideDialog();
    this.dialog.title = l10nIdHeader;
    this.dialog.message = l10nIdMsg;
    this.dialog.primarybtntext = l10nIdButton;
    this.dialog.secondarybtntext = LanguageManager.cancel;
    this.dialog.classList.remove('hidden');
    this.dialog.open = true;
    this.dialog.focus();
    document.addEventListener('dialogSecondaryBtnClick', () => {
      if (this.dialog.className === 'first-init') {
        StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
        WarningUI.update();
        this.dialog.open = false;
      } else {
        window.close();
      }
    });
    document.addEventListener('dialogPrimaryBtnClick', () => {
      this.dialog.className === 'first-init' ? onScanClicked() : onSettingsClicked();
    });
  };

  // Hide dialog
  FMAction.prototype.hideDialog = function () {
    if (!this.dialog.classList[0]) {
      this.dialog.classList.add('hidden');
      this.dialog.open = false;
    }
  };
  // Toggle speaker and headphone
  FMAction.prototype.speakerUpdate = function (state) {
    if (state) {
      this.speakSwitch.setAttribute('data-l10n-id', 'switchToHeadphones');
      this.speakSwitch.setAttribute('data-icon', 'speaker-on');
    } else {
      this.speakSwitch.setAttribute('data-l10n-id', 'speaker-switch');
      this.speakSwitch.setAttribute('data-icon', 'audio-output');
    }
  };

  FMAction.prototype.optionMenuShow = function (e) {
    const { id } = e.rangeParent;
    const element = document.getElementById(id);
    const from = element.getBoundingClientRect().top;
    const to = element.getBoundingClientRect().bottom;
    this.optionMenu.position = { from, to };
    this.optionMenu.options[0].label = LanguageManager.rename;
    this.optionMenu.open = !this.optionMenu.open;
    const currentValue = e.rangeParent.innerText;
    this.frequencyToRenameElement = e.rangeParent;
    const input = document.getElementById('textfield');
    const editButton = document.getElementById('edit-button');
    const inputLength = document.getElementById('input-num');
    editButton.children[0].text = LanguageManager.cancel;
    editButton.children[1].text = LanguageManager.save;
    this.preStatus = StatusManager.status;
    document.addEventListener('optionmenuSelect', () => {
      this.inputDialog.setAttribute('class', '');
      input.value = currentValue;
      inputLength.innerText = currentValue.length;
      this.optionMenu.open = false;
      StatusManager.update(StatusManager.STATUS_FAVORITE_RENAMING);
      document.addEventListener('input', (e) => {
        this.editValue = e.target.value;
        inputLength.innerText = this.editValue.length;
      });
    });
  };

  // Cancel current rename operation
  FMAction.prototype.undoRename = function () {
    StatusManager.update(this.preStatus);
    this.inputDialog.setAttribute('class', 'hidden');
  };

  // Save the renamed station name
  FMAction.prototype.saveRename = function () {
    // // Get renamed frequency name from input UI
    let frequencyName = this.editValue;
    const frequency = FrequencyList.getFrequencyByElement(this.frequencyToRenameElement);
    if (!frequencyName) {
      frequencyName = frequency.toFixed(1);
    }

    // Update renamed frequency name to data base
    FrequencyManager.updateFrequencyName(frequency,
      frequencyName);

    // Update renamed frequency name to UI
    this.frequencyToRenameElement.querySelector('.frequency-list-frequency').textContent = frequencyName;
    FrequencyDialer.update();
    this.undoRename();
  };

  FMAction.prototype.updateStatusUI = function () {
    let status = StatusManager.status;
    switch (status) {
      case StatusManager.STATUS_WARNING_SHOWING:
        this.HeaderTitle.title = LanguageManager.radioTitle;
        break;
      case StatusManager.STATUS_FAVORITE_SHOWING:
        this.HeaderTitle.title = LanguageManager.favoritesTitle;
        this.stationAction.classList.add('hidden');
        this.freDialer.classList.remove('hidden');
        FMElementFMFooter.selected = 'favorites';
        break;
      case StatusManager.STATUS_STATIONS_SCANING:
        this.HeaderTitle.title = LanguageManager.allstationsTitle;
        this.stationAction.classList.remove('hidden');
        this.freDialer.classList.add('hidden');
        this.stationAction.level = 'secondary';
        this.stationAction.text = LanguageManager.abort;
        this.stationAction.setAttribute('data-l10n-id',
          'abort');
        break;
      case StatusManager.STATUS_STATIONS_SHOWING:
        this.HeaderTitle.title = LanguageManager.allstationsTitle;
        this.stationAction.classList.remove('hidden',
          'scan');
        this.freDialer.classList.add('hidden');
        this.stationAction.level = 'secondary';
        this.stationAction.text = LanguageManager.scanStations;
        FMElementFMFooter.selected = 'allstations';
        this.stationAction.setAttribute('data-l10n-id',
          'scan-stations');
        break;
      case StatusManager.STATUS_STATIONS_EMPTY:
        this.HeaderTitle.title = LanguageManager.allstationsTitle;
        this.stationAction.classList.remove('hidden',
          'scan');
        this.freDialer.classList.add('hidden');
        this.stationAction.level = 'primary';
        this.stationAction.text = LanguageManager.scan;
        FMElementFMFooter.selected = 'allstations';
        this.stationAction.setAttribute('data-l10n-id',
          'scan-stations');
        break;
    }
  };

  exports.FMAction = new FMAction();
}(window));

