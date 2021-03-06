/* exported StationsList */
'use strict';

(function (exports) {

  const STATION_MAX_INTERVAL = 2000;
  const CANCEL_RETRY_TIMES = 3;

  /*
   * StationsList Constructor
   * StationsList will be loaded only while station list shown
   */
  const StationsList = function () {
    this.scanningAborted = false;
    this.currentFrequency = null;
    this.previousFrequency = null;
    this.KEYNAME = 'station-tab';
    this.STATION = 'stations-list';
    this.FAVORITE = 'favorites-list';
  };

  StationsList.prototype.switchToStationListUI = function () {
    if (!FrequencyDialer.pillButtonLoad) {
      LazyLoader.load('https://shared.local/elements/kai-pillbutton.js',
        () => {
          this.loadStationListUI();
        });
    } else {
      this.loadStationListUI();
    }
  };

  // Switch from favorite list UI to station list UI
  StationsList.prototype.loadStationListUI = function () {
    if (StatusManager.status !== StatusManager.STATUS_FAVORITE_SHOWING &&
      StatusManager.status !== StatusManager.STATUS_DIALOG_FIRST_INIT) {
      // Only in favorite list UI can switch to station list UI
      return;
    }

    // Change frequency list to 'stations-list' to update UI
    FMElementFrequencyListUI.className = this.STATION;
    FMElementFavoriteListWarning.classList.add('hidden');
    FrequencyDialer.createButton();

    let stationslist = FrequencyManager.getStationsFrequencyList();
    if (stationslist.length === 0) {
      if (StatusManager.status === StatusManager.STATUS_DIALOG_FIRST_INIT) {
        StatusManager.update(StatusManager.STATUS_STATIONS_SHOWING);
        this.startScanStations();
      } else {
        StatusManager.update(StatusManager.STATUS_STATIONS_EMPTY);
        FrequencyList.updateStationsListUI();
      }
    } else {
      StatusManager.update(StatusManager.STATUS_STATIONS_SHOWING);

      /*
       * Update StatusManager to update UI
       * Show stations lit UI
       */
      FrequencyList.updateStationsListUI();
    }

    // Update current focus
    FocusManager.update(true);
  };

  // Switch from station list UI to favorite list UI
  StationsList.prototype.switchToFavoriteListUI = function () {
    if (StatusManager.status !== StatusManager.STATUS_STATIONS_SHOWING &&
      StatusManager.status !== StatusManager.STATUS_STATIONS_EMPTY) {
      // Only in station list UI can switch to favorite list UI
      return;
    }
    // Change frequency list to 'favorites-list' to update UI
    FMElementFrequencyListUI.className = this.FAVORITE;
    FrequencyDialer.deleteButton(true);

    // Update StatusManager to update UI
    StatusManager.update(StatusManager.STATUS_FAVORITE_SHOWING);

    // Show favorite list UI
    FrequencyList.updateFavoriteListUI();

    // Update current focus
    FocusManager.update(true);
  };

  // Start scan stations
  StationsList.prototype.startScanStations = function () {
    // Add 'scanning' to update stations list UI
    FMElementFrequencyListUI.classList.add('scanning');
    FrequencyDialer.progressOn();

    // Update StatusManager to update UI
    StatusManager.update(StatusManager.STATUS_STATIONS_SCANING);

    // Clear the stations list scanned before
    this.clearAllStationsList();

    // Mark flag 'scanningAborted' as false
    this.scanningAborted = false;

    // Reset parameter 'previousFrequency' as frequencyLowerBound
    this.previousFrequency = fmRadio.frequencyLowerBound;

    // Request to scan stations
    this.requestToScanStations();
  };

  // Request to scan stations
  StationsList.prototype.requestToScanStations = function () {

    /*
     * Set frequency as 'frequencyLowerBound',
     * whether success or failed, start scan stations
     * It is to make sure stations scanning start from the lower bound frequency
     */
    fmRadio.setFrequency(this.previousFrequency).then(() => {
      this.continueScanStations();
    }, () => {
      this.continueScanStations();
    });
  };

  // Clear the stations list scanned before
  StationsList.prototype.clearAllStationsList = function () {
    FrequencyList.clearCurrentFrequencyList();
    FrequencyManager.clearAllStationsFrequencyList();
  };

  // Add frequency scanned to stations list UI
  StationsList.prototype.addStationScanned = function (frequency) {
    // Update current frequency to data base
    FrequencyManager.updateFrequencyStation(frequency, true);
    // Update current stations list UI
    FrequencyList.updateStationsListUI();
    // Make the frequency in frequency dialer UI is current palying frequency
    this.onFrequencyChanged(true);
  };

  StationsList.prototype.onFrequencyChanged = function (reset) {
    const frequency = fmRadio.frequency;
    // Add current frequency to history
    HistoryFrequency.add(frequency);
    // Update frequency dialer UI
    FrequencyDialer.updateFrequency(frequency);
    // Update current focus
    FocusManager.update(reset);
    // Update Remote data
    Remote.updateMetadata();
  };

  // Handle the fm channel frequency
  StationsList.prototype.handleFrequencyChanged = function () {
    if (StatusManager.status !== StatusManager.STATUS_STATIONS_SCANING &&
      !this.scanningAborted) {
      return this.onFrequencyChanged(false);
    }

    // Get the frequency scanned
    this.currentFrequency = fmRadio.frequency;

    if (this.previousFrequency === this.currentFrequency) {
      // Continue scanning if scanned frequency has no change
      this.continueScanStations();
      return;
    }

    if (this.previousFrequency > this.currentFrequency &&
      !this.scanningAborted) {
      // Scanning finished if scanned frequency is smaller
      this.scanFinished(true, 'kai-scanning-completed');
      return;
    }

    // Update the scanned frequency to 'previousFrequency'
    this.previousFrequency = this.currentFrequency;
    // Add frequency scanned to stations list UI
    this.addStationScanned(this.currentFrequency);

    // Check if current scanning is aborted or not
    if (this.scanningAborted) {
      // When press abort,radio will paly first station
      let frequency = FrequencyManager.getStationsFrequencyList()[0].frequency;
      if (frequency !== this.currentFrequency) {
        fmRadio.setFrequency(frequency);
        return;
      }
      this.scanFinished(true);
      return;
    }

    // Continue scanning
    this.continueScanStations();
  };

  // The actually station scanning operation
  StationsList.prototype.continueScanStations = function () {
    setTimeout(() => {
      fmRadio.seekUp();
    }, 100);
  };

  // Stations scanning operation finished
  StationsList.prototype.scanFinished = function (needupdate, message) {

    /*
     * Hidden scan progress UI
     * Remove 'scanning' to update stations list UI
     */
    FrequencyDialer.progressOff();
    FMElementFrequencyListUI.classList.remove('scanning');
    
    // Mark flag 'scanningAborted' as false
    this.scanningAborted = false;

    // Show toast message
    FMRadio.showMessage(message);

    if (needupdate) {
      this.onFrequencyChanged(true);
    }
    // Update StatusManager to update UI
    StatusManager.update(StatusManager.STATUS_STATIONS_SHOWING);
  };

  // Abort stations scanning operation
  StationsList.prototype.abortScanStations = function (headphone, retryTime) {
    // Cancel seek
    fmRadio.cancelSeek().then(() => {
      if (headphone) {
        // Abort for headphone has been unplugged
        this.scanAbortedHeadphone();
      } else {
        // Abort for abort softkey clicked
        this.scanAbortedNormal();
      }
    }, () => {
      this.retryCancel(retryTime, () => {
        if (headphone) {
          this.scanAbortedHeadphone();
        } else {
          this.scanAbortedNormal();
        }
      }, (retryTime) => {
        this.abortScanStations(headphone, retryTime);
      });
    });
  };

  StationsList.prototype.retryCancel = (retryTime = CANCEL_RETRY_TIMES, cancelCB, continueCB) => {
    retryTime--;
    if (retryTime <= 0) {
      cancelCB && cancelCB();
    } else {
      continueCB && continueCB(retryTime);
    }
  };

  /*
   * Abort stations scanning operation for headphone has been unplugged
   * no need to update focus
   */
  StationsList.prototype.scanAbortedHeadphone = function () {
    this.scanningAborted = true;
    this.scanFinished(false);
  };

  /*
   * Abort stations scanning operation for abort  clicked
   * need to update focus
   */
  StationsList.prototype.scanAbortedNormal = function () {
    this.scanningAborted = true;
    this.ensureScanningAborted();
  };

  /*
   * Abort stations scanning operation for quickly click BrowserBack times
   * not defined update focus or not, decide update to avoid focus error when
   * scanning interrupted.
   */
  StationsList.prototype.scanAbortOnBrowserBack = function (retryTime) {
    // Cancel seek
    fmRadio.cancelSeek().then(() => {
      this.scanningAborted = true;
      this.scanAbortedNormal(true);
    }, () => {
      this.retryCancel(retryTime, () => {
        this.scanningAborted = true;
        this.scanAbortedNormal(true);
      }, (retryTime) => {
        this.scanAbortOnBrowserBack(retryTime);
      });
    });
  };


  /*
   * When signal is too week. this is no station could be scanned, so
   * the frequency would not changed. then scanFinished would not be executed.
   */
  StationsList.prototype.ensureScanningAborted = function () {
    setTimeout(() => {
      if (this.scanningAborted) {
        this.scanFinished(true);
      }
    }, STATION_MAX_INTERVAL);
  };

  exports.StationsList = new StationsList();
})(window);
