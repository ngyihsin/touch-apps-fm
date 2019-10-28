/* exported HeadphoneState */
'use strict';

(function (exports) {


  const HeadphoneState = function () {
    // Indicate current audio channel manager interface
    this.audioChannelManager = null;
    // Indicate whether current device has valid antenna
    this.deviceWithValidAntenna = false;
    // Indicate whether current device has plugged in headphone or not
    this.deviceHeadphoneState = false;
    // Indicate whether current device has internal antenna or not
    this.deviceWithInternalAntenna = false;
    // App Status
    this.appStatus = null;
  };

  HeadphoneState.prototype.init = function () {
    this.audioChannelManager = navigator.mozAudioChannelManager;
    if (!this.audioChannelManager) {
      return;
    }

    this.deviceWithInternalAntenna = mozFMRadio.antennaAvailable;
    this.updateHeadphoneAndAntennaState();

    this.audioChannelManager.onheadphoneschange = this.onHeadphoneStateChanged.bind(this);
  };

  HeadphoneState.prototype.updateHeadphoneAndAntennaState = function () {
    this.deviceHeadphoneState = this.audioChannelManager.headphones;
    this.deviceWithValidAntenna = this.deviceHeadphoneState || this.deviceWithInternalAntenna;
  };

  HeadphoneState.prototype.onHeadphoneStateChanged = function () {
    this.updateHeadphoneAndAntennaState();

    if (this.deviceHeadphoneState) {
      let fmContainer = document.getElementById('fm-container');
      fmContainer.classList.remove('hidden');
      FMAction.speakerUpdate(false);
      if (this.deviceWithInternalAntenna) {
        if (!mozFMRadio.enabled) {
          FMRadio.enableFMRadio(FrequencyDialer.getFrequency());
        }
      }
      // Headphone has plugged
      if (!this.deviceWithInternalAntenna) {
        // Just update UI if device with no internal antenna
        FrequencyDialer.updateFrequency(HistoryFrequency.getFrequency());
        this.appStatus ? this.appStatus
          : this.appStatus = StatusManager.STATUS_FAVORITE_SHOWING;
        StatusManager.update(this.appStatus);
        this.appStatus === StatusManager.STATUS_STATIONS_SHOWING
          ? FrequencyList.updateStationsListUI()
          : FrequencyList.updateFavoriteListUI();
      }
    } else {
      // Headphone has unplugged
      if (!this.deviceWithInternalAntenna) {
        // Make sure FMRadio speaker off while headphone plugged
        FMRadio.previousSpeakerForcedState = false;
        FMAction.speakerUpdate(false);

        /**
         * Device with no internal antenna,make sure FMRadio show favorite list UI
         * or Station List while headphone plugged out
         */
        if (StatusManager.status === StatusManager.STATUS_STATIONS_SCANING) {
          // Abort scanning stations first while scanning stations currently
          StationsList.abortScanStations(true);
        } else if (StatusManager.status === StatusManager.STATUS_FAVORITE_RENAMING) {
          FrequencyRename.undoRename();
        }
        this.appStatus = StatusManager.status;
      }
    }

    WarningUI.update();
  };

  exports.HeadphoneState = new HeadphoneState();
})(window);
