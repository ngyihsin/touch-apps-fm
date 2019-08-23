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
      if (this.deviceWithInternalAntenna) {
        if (!mozFMRadio.enabled) {
          FMRadio.enableFMRadio(FrequencyDialer.getFrequency());
        }
      }
      // Headphone has plugged
      if (!this.deviceWithInternalAntenna) {
        // Just update UI if device with no internal antenna
        FrequencyDialer.updateFrequency(HistoryFrequency.getFrequency());
        StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);
        FrequencyList.updateFavoriteListUI();
      }
    } else {
      // Headphone has unplugged
      if (!this.deviceWithInternalAntenna) {
        // Make sure FMRadio speaker off while headphone plugged
        FMRadio.previousSpeakerForcedState = false;
        FMAction.speakerUpdate(false);
        // Device with no internal antenna,make sure FMRadio show favorite list UI while headphone plugged out
        if (StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING) {
          StationsList.switchToFavoriteListUI();
        } else if (StatusManager.status === StatusManager.STATUS_STATIONS_SCANING) {
          // Abort scanning stations first while scanning stations currently
          StationsList.abortScanStations(true);
        } else if (StatusManager.status === StatusManager.STATUS_FAVORITE_RENAMING) {
          FMAction.undoRename();
        }
      }

      // Disable FMRadio no matter device with internal antenna or not
      if (mozFMRadio.enabled) {
        FMRadio.disableFMRadio();
      }
    }

    WarningUI.update();
  };

  exports.HeadphoneState = new HeadphoneState();
})(window);
