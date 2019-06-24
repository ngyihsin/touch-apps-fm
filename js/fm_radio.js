/* exported FMRadio */
'use strict';

(function(exports) {

  // FMRadio Constructor
  var FMRadio = function() {
    this.KEYNAME_FIRST_INIT = 'is_first_init';
    this.airplaneModeEnabled = false;
    this.deviceWithVolumeHardwareKey = false;
    this.deviceSupportRecorder = false;
    this.previousFMRadioState = false;
    this.previousSpeakerForcedState = false;
  };

  FMRadio.prototype.init = function() {
    // Initialize parameter airplaneModeEnabled
    this.airplaneModeEnabled = (AirplaneModeHelper.getStatus() === 'enabled');
    AirplaneModeHelper.addEventListener('statechange', this.onAirplaneModeStateChanged.bind(this));

    // Initialize FMAction
    FMAction.init();
    // Initialize HeadphoneState
    HeadphoneState.init();

    // Initialize HistoryFrequency
    HistoryFrequency.init(this.onHistorylistInitialized.bind(this));


    // Redirect FM radio callbacks
    mozFMRadio.onenabled = this.onFMRadioEnabled.bind(this);
    mozFMRadio.ondisabled = this.onFMRadioDisabled.bind(this);
    mozFMRadio.onfrequencychange =
      StationsList.handleFrequencyChanged.bind(StationsList);
    };

  FMRadio.prototype.onAirplaneModeStateChanged = function() {
    this.airplaneModeEnabled = (AirplaneModeHelper.getStatus() === 'enabled');
    StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    WarningUI.update();

    if (this.airplaneModeEnabled) {
      // If airplane mode is enabled, just update warning UI is already OK
      return;
    }

    if (!HeadphoneState.deviceWithValidAntenna) {
      // If current device has no valid antenna,
      // just update warning UI is already OK
      return;
    }

    // Make sure show favorite list UI and frequency dialer UI
    // after airplane mode change to disabled
    FrequencyDialer.updateFrequency();
    FrequencyList.updateFavoriteListUI();

    if (typeof FocusManager !== 'undefined') {
      FocusManager.dismissFocus();
    }
  };

  FMRadio.prototype.onHistorylistInitialized = function() {
    // Initialize FrequencyManager
    FrequencyManager.init(function () {
      // Only if current device has valid antenna,
      // should continue update UI, or just update warning UI is already OK
      if (HeadphoneState.deviceWithValidAntenna) {
        // Update frequency dialer UI
        FrequencyDialer.updateFrequency(HistoryFrequency.getFrequency());
        // Update favorite list UI
        FrequencyList.updateFavoriteListUI();
      }
    });
    WarningUI.update();

    // PERFORMANCE EVENT (5): moz-app-loaded
    // Designates that the app is *completely* loaded and all relevant
    // 'below-the-fold' content exists in the DOM, is marked visible,
    // has its events bound and is ready for user interaction. All
    // required startup background processing should be complete.
    window.performance.mark('fullyLoaded');
    window.dispatchEvent(new CustomEvent('moz-app-loaded'));
  };

  FMRadio.prototype.onFMRadioEnabled = function() {
    // Update UI immediately
    this.updateEnablingState(false);
    this.updateDimLightState(false);

    if (!HeadphoneState.deviceWithValidAntenna) {
      // If FMRadio is enabled, but no valid antenna,
      // disable FMRadio again in case that
      // headphone might be unplugged during FMRadio enabling
      this.disableFMRadio();
      return;
    }

    // Update status to update UI
    if (StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING) {
      StatusManager.update();
    } else if (StatusManager.status !== StatusManager.STATUS_DIALOG_FIRST_INIT) {
      StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
    }

    if (typeof FocusManager === 'undefined') {
      // FocusManager must be called firstly here, so lazy load it
      LazyLoader.load('js/focus_manager.js', () => {
        FocusManager.update(true);
      });
    } else {
      FocusManager.update(true);
    }
  };

  FMRadio.prototype.onFMRadioDisabled = function() {
    this.updateEnablingState(false);
    this.updateDimLightState(true);
    // Hide dialog when fm disabled..
    // Update status to update UI
    StatusManager.update();
  };

  FMRadio.prototype.enableFMRadio = function(frequency) {
    if (frequency < mozFMRadio.frequencyLowerBound
      || frequency > mozFMRadio.frequencyUpperBound) {
      frequency = mozFMRadio.frequencyLowerBound;
    }

    let request = mozFMRadio.enable(frequency);
    request.onerror = () => {
      this.updateEnablingState(false);
      this.updateDimLightState(true);
    };
  };

  FMRadio.prototype.disableFMRadio = function() {
    this.turnOffRadio();
  };

  FMRadio.prototype.turnOffRadio = function() {
    mozFMRadio.disable();
    };



  FMRadio.prototype.updateEnablingState = function (enablingState) {
    let enabled = mozFMRadio.enabled;
    let powerSwitch = document.getElementById('power-switch');
    if (enabled) {
      window.performance.mark('fmRadioEnabled');
      powerSwitch.setAttribute('data-l10n-id', 'power-switch-off');
    } else {
      powerSwitch.setAttribute('data-l10n-id', 'power-switch-on');

    }
    powerSwitch.dataset.enabled = enabled;
    WarningUI.update();
  }

  FMRadio.prototype.showFMRadioFirstInitDialog = function() {
    // Show dialog and set dialog message
    FMAction.showDialog('scan-stations-msg');
    // Update status to update UI
    StatusManager.update(StatusManager.STATUS_DIALOG_FIRST_INIT);
  };

  FMRadio.prototype.updateDimLightState = function(state) {
    FMElementFMContainer.classList.toggle('dim', state);
  };

  exports.FMRadio = new FMRadio();
})(window);
