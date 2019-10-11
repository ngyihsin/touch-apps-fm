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
    this.updateAirplaneDialog();
    AirplaneModeHelper.addEventListener('statechange', this.onAirplaneModeStateChanged.bind(this));

    // Initialize FMAction
    FMAction.init();
    // Initialize HeadphoneState
    HeadphoneState.init();
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
    StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
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
    WarningUI.update();

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
    if (StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING) {
      StatusManager.update();
    } else if (StatusManager.status !== StatusManager.STATUS_DIALOG_FIRST_INIT) {
      StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    }
  };

  FMRadio.prototype.onFMRadioDisabled = function () {
    this.updateEnablingState(false);
    this.updateDimLightState(true);
    SpeakerState.state = false;
    // Hide dialog when fm disabled..
    Dialog.hideDialog();
    // Update status to update UI
    StatusManager.update();
  };

  FMRadio.prototype.enableFMRadio = function (frequency) {
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
      Dialog.dialog.setAttribute('class', 'airplane-dialog');
      Dialog.showDialog(Dialog.airplane, false,
        FMAction.settingsClicked.bind(this), this.airplneCancel.bind(this));
    } else {
      Dialog.hideDialog();
    }
  };

  FMRadio.prototype.updateEnablingState = function () {
    let enabled = mozFMRadio.enabled;
    let powerSwitch = document.getElementById('power-switch');
    let speakerSwitch = document.getElementById('speaker-switch');
    powerSwitch.disabled = false;
    if (enabled) {
      powerSwitch.setAttribute('data-l10n-id', 'power-switch-off');
      powerSwitch.setAttribute('class', 'power-switch-off');
      powerSwitch.checked = true;
      speakerSwitch.classList.remove('hidden');
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
      powerSwitch.setAttribute('data-l10n-id', 'power-switch-on');
      powerSwitch.setAttribute('class', 'power-switch-on');
      powerSwitch.checked = false;
      speakerSwitch.classList.add('hidden');
    }
    powerSwitch.dataset.enabled = enabled;
    WarningUI.update();
  };

  FMRadio.prototype.showFMRadioFirstInitDialog = function () {
    // Show dialog and set dialog message
    Dialog.dialog.setAttribute('class', 'first-init');
    Dialog.showDialog(Dialog.firstInit, false,
      FMAction.onScanClicked.bind(this), this.cancelFirst.bind(this));
    // Update status to update UI
    StatusManager.update(StatusManager.STATUS_DIALOG_FIRST_INIT);
  };

  FMRadio.prototype.cancelFirst = function () {
    StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    WarningUI.update();
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

    const options = Object.assign({
      messageL10nId: l10nId,
      latency: 2000
    }, option);

    if (typeof Toaster === 'undefined') {
      LazyLoader.load('shared/js/toaster.js', () => {
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
