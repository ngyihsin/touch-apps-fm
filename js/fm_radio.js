/* exported FMRadio */
'use strict';
(function (exports) {

  // FMRadio Constructor
  const FMRadio = function () {
    this.KEYNAME_FIRST_INIT = 'is_first_init';
    this.airplaneModeEnabled = false;
    this.previousSpeakerForcedState = false;
  };

  FMRadio.prototype.init = function () {
    // Initialize parameter airplaneModeEnabled
    this.airplaneModeEnabled = AirplaneModeHelper.getStatus() === 'enabled';
    AirplaneModeHelper.addEventListener('statechange', this.onAirplaneModeStateChanged.bind(this));
    // Initialize FMAction
    FMAction.init();
    // Initialize SpeakerState
    SpeakerState.init();
    // Initialize FrequencyDialerUI
    FrequencyDialer.initDialerUI();
    // Initialize HistoryFrequency
    HistoryFrequency.init(this.onHistorylistInitialized.bind(this));
  
    // Redirect FM radio callbacks
    mozFMRadio.onenabled = this.onFMRadioEnabled.bind(this);
    mozFMRadio.ondisabled = this.onFMRadioDisabled.bind(this);
    mozFMRadio.onfrequencychange =
        StationsList.handleFrequencyChanged.bind(StationsList);
  };

  FMRadio.prototype.onAirplaneModeStateChanged = function () {
    this.airplaneModeEnabled = AirplaneModeHelper.getStatus() === 'enabled';
    this.updateAirplaneDialog();

    if (this.airplaneModeEnabled) {
      // If airplane mode is enabled, just update warning UI is already OK
      return;
    }

    if (!HeadphoneState.deviceWithValidAntenna) {
      // If current device has no valid antenna,just update warning UI is already OK
      return;
    }

    // Make sure show favorite list UI and frequency dialer UI after airplane mode change to disabled
    FrequencyDialer.updateFrequency();
    FrequencyList.updateFavoriteListUI();

    if (typeof FocusManager !== 'undefined') {
      FocusManager.dismissFocus();
    }
  };

  FMRadio.prototype.onHistorylistInitialized = function () {
    // Initialize FrequencyManager
    FrequencyManager.init(() => {
      // Only if current device has valid antenna,should continue update UI, or just update warning UI is already OK
      if (HeadphoneState.deviceWithValidAntenna) {
        // Update frequency dialer UI
        FrequencyDialer.updateFrequency(HistoryFrequency.getFrequency());
        // Update favorite list UI
        FrequencyList.updateFavoriteListUI();
      }
      this.saveCache();
    });

    /*
     * PERFORMANCE EVENT (5): moz-app-loaded
     * Designates that the app is *completely* loaded and all relevant
     * 'below-the-fold' content exists in the DOM, is marked visible,
     * has its events bound and is ready for user interaction. All
     * required startup background processing should be complete.
     */
    window.performance.mark('fullyLoaded');
    window.dispatchEvent(new CustomEvent('moz-app-loaded'));
  };

  FMRadio.prototype.onFMRadioEnabled = function () {
    // Update UI immediately
    this.updateEnablingState();
    this.updateDimLightState(false);
    if (!Remote.enabled) {
      // Init remote on first turn on radio
      Remote.init();
    }
    Remote.updatePlaybackStatus();

    if (!HeadphoneState.deviceWithValidAntenna) {

      /*
       * If FMRadio is enabled, but no valid antenna,
       * disable FMRadio again in case that
       * headphone might be unplugged during FMRadio enabling
       */
      this.disableFMRadio();
      return;
    }

    // Update status to update UI
    if (StatusManager.status === StatusManager.STATUS_DIALOG_FIRST_INIT) {
      StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    }
    StatusManager.update(StatusManager.status);
  };

  FMRadio.prototype.onFMRadioDisabled = function () {
    this.updateEnablingState(false);
    this.updateDimLightState(true);
    Remote.updatePlaybackStatus();
    SpeakerState.state = false;
    // Hide dialog when fm disabled..
    Dialog.hideDialog();
  };

  FMRadio.prototype.enableFMRadio = function (frequency) {
    let script = [
      'js/remoteControl.js',
      'shared/js/media/remote_controls.js'
    ];
    if (typeof Remote === 'undefined') {
      LazyLoader.load(script).then(() => {
        this.turnOnRadio(frequency);
      });
    } else {
      this.turnOnRadio(frequency);
    }
  };

  FMRadio.prototype.turnOnRadio = function (frequency) {
    if (frequency < mozFMRadio.frequencyLowerBound ||
      frequency > mozFMRadio.frequencyUpperBound) {
      frequency = mozFMRadio.frequencyLowerBound;
    }

    if (HeadphoneState.deviceHeadphoneState) {

      /**
       * After headphone plugged, no matter device with internal antenna or not
       * set speaker state as previous state
       */
      if (SpeakerState.state !== this.previousSpeakerForcedState) {
        SpeakerState.state = this.previousSpeakerForcedState;
      }
    } else {

      /**
       * When device with internal, the speaker will come out sperker
       */
      FMAction.speakerUpdate(true);
    }

    let powerSwitch = document.getElementById('power-switch');
    powerSwitch.disabled = true;
    let request = mozFMRadio.enable(frequency);
    request.onerror = () => {
      this.updateEnablingState();
      this.updateDimLightState(true);
    };
  };

  FMRadio.prototype.disableFMRadio = function () {
    if (StatusManager.status === StatusManager.STATUS_STATIONS_SCANING) {
      StatusManager.update(StatusManager.STATUS_STATIONS_SHOWING);
      StationsList.abortScanStations(true);
    }
    this.saveCache();
    this.turnOffRadio();
  };

  FMRadio.prototype.turnOffRadio = function () {
    // Remember previous states
    this.previousSpeakerForcedState = SpeakerState.state;
    mozFMRadio.disable();
  };

  FMRadio.prototype.updateAirplaneDialog = function () {
    if (this.airplaneModeEnabled) {
      this.disableFMRadio();
      Dialog.showDialog(Dialog.airplane,
        false,
        FMAction.settingsClicked.bind(this),
        this.airplneCancel.bind(this));
    } else {
      Dialog.hideDialog();
    }
  };

  FMRadio.prototype.updateEnablingState = function () {
    let enabled = mozFMRadio.enabled;
    FMPowerKey.disabled = false;
    if (enabled) {
      FMPowerKey.setAttribute('data-l10n-id', 'power-switch-off');
      FMPowerKey.setAttribute('class', 'power-switch-off');
      FMPowerKey.checked = true;
      FMspeakSwitch.classList.remove('hidden');
      let isFirstInit = window.localStorage.getItem(this.KEYNAME_FIRST_INIT);
      if (!isFirstInit) {
        this.showFMRadioFirstInitDialog();
        try {
          window.localStorage.setItem(this.KEYNAME_FIRST_INIT, true);
        } catch (e) {
          console.error('Failed set first init status :' + e);
        }
      }
    } else {
      FMPowerKey.setAttribute('data-l10n-id', 'power-switch-on');
      FMPowerKey.setAttribute('class', 'power-switch-on');
      FMPowerKey.checked = false;
      FMspeakSwitch.classList.add('hidden');
    }
    FMPowerKey.dataset.enabled = enabled;
  };

  FMRadio.prototype.showFMRadioFirstInitDialog = function () {
    // Update status to update UI
    StatusManager.update(StatusManager.STATUS_DIALOG_FIRST_INIT);    
    // Show dialog and set dialog message
    Dialog.showDialog(Dialog.firstInit,
      false,
      FMAction.onScanClicked.bind(this),
      this.cancelFirst.bind(this));
  };

  FMRadio.prototype.cancelFirst = function () {
    StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    FrequencyList.updateFavoriteListUI();
    Dialog.hideDialog();
  };

  FMRadio.prototype.airplneCancel = function () {
    window.close();
  };

  FMRadio.prototype.updateDimLightState = function (state) {
    FMElementFMContainer.classList.toggle('dim', state);
    FMElementFMFooter.classList.toggle('dim', state);
  };

  FMRadio.prototype.showMessage = function (l10nId, option = {}) {
    if (!l10nId) {
      return;
    }

    const options = Object.assign(
      { messageL10nId: l10nId }, option);

    if (typeof Toaster === 'undefined') {
      LazyLoader.load('shared/js/toaster.js',
        () => {
          Toaster.showToast(options);
        });
    } else {
      Toaster.showToast(options);
    }
  };

  FMRadio.prototype.saveCache = function () {
    if (navigator.mozAudioChannelManager.headphones ||
        mozFMRadio.antennaAvailable) {
      if (StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING) {
        FrequencyDialer.deleteButton(false);
        FMCache.clear('fm-container');
        let cacheHtml = document.getElementById('fm-container');
        let codeNode = FMCache.cloneAsInertNodeAvoidingCustomElementHorrors(cacheHtml);
        if (!codeNode.classList.contains('dim')) {
          codeNode.classList.add('dim');
        }
        FMCache.saveFromNode('fm-container', codeNode);
      }
    }
  };

  exports.FMRadio = new FMRadio();
})(window);
