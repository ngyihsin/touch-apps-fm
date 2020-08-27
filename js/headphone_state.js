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

  HeadphoneState.prototype.init = function (callback) {
    this.audioChannelManager = navigator.b2g.audioChannelManager;
    if (!this.audioChannelManager) {
      return;
    }
  
    this.deviceWithInternalAntenna = fmRadio.antennaAvailable;
    this.updateHeadphoneAndAntennaState();
    !this.deviceWithValidAntenna && StatusManager.update(this.status);

    this.audioChannelManager.onheadphoneschange = this.onHeadphoneStateChanged.bind(this);
    callback();
  };

  HeadphoneState.prototype.updateHeadphoneAndAntennaState = function () {
    this.deviceHeadphoneState = this.audioChannelManager.headphones;
    this.deviceWithValidAntenna = this.deviceHeadphoneState || this.deviceWithInternalAntenna;
    
    if (!this.deviceWithValidAntenna) {
      this.status = StatusManager.STATUS_WARNING_SHOWING;
      if (!this.antennaUnplugWarning) {
        LazyLoader.load('https://shared.local/elements/kai-emptypage.js',
          () => {
            this.antennaUnplugWarning = document.createElement('kai-emptypage');
            this.antennaUnplugWarning.id = 'antenna-warning';
            this.antennaUnplugWarning.description = LanguageManager.noAntennaMsg;
            this.antennaUnplugWarning.src = '--fm-empty-url';
            document.querySelector('section').appendChild(this.antennaUnplugWarning);
            this.updateAntennaUI();
          });
      } else {
        this.updateAntennaUI();
      }
    } else {
      FMElementFMContainer.classList.remove('hidden');
      FMElementFMFooter.classList.remove('hidden');
      this.antennaUnplugWarning
        ? this.antennaUnplugWarning.classList.add('hidden') : '';
      FMPowerKey.classList.remove('hidden');
    }
  };

  HeadphoneState.prototype.onHeadphoneStateChanged = function () {
    this.updateHeadphoneAndAntennaState();

    if (this.deviceHeadphoneState) {
      let fmContainer = document.getElementById('fm-container');
      fmContainer.classList.remove('hidden');
      if (this.deviceWithInternalAntenna) {
        if (!fmRadio.enabled) {
          FMRadio.enableFMRadio(FrequencyDialer.getFrequency());
        }
      }
      FMAction.speakerUpdate(false);
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
        StatusManager.update(StatusManager.STATUS_WARNING_SHOWING);
        Remote && Remote.stopRemote();
      }
      // Disable FMRadio no matter device with internal antenna or not
      if (fmRadio.enabled) {
        FMRadio.disableFMRadio();
      }
    }
  };


  HeadphoneState.prototype.updateAntennaUI = function () {
    FMElementFMContainer.classList.add('hidden');
    FMElementFMFooter.classList.add('hidden');
    this.antennaUnplugWarning.classList.remove('hidden');
    FMspeakSwitch.classList.add('hidden');
    FMPowerKey.classList.add('hidden');
  };

  exports.HeadphoneState = new HeadphoneState();
})(window);
