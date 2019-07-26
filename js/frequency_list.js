/* exported frequencyList */
'use strict';

(function(exports) {

  // FrequencyList Constructor
  const FrequencyList = function() {};

  // Format frequency list item element innerHTML
  FrequencyList.prototype.formatFrequencyElementInnerHTML = function(frequencyObject) {
    if (!frequencyObject) {
      return;
    }
    let html = `
      <div id=${'detail' + this.formatFrequencyElementId(frequencyObject.frequency)} 
        class="frequency-list-frequency" data-l10n-id="Tab-frequency">
        ${frequencyObject.name}
      </div>
      ${ StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING
        || StatusManager.status === StatusManager.STATUS_STATIONS_SCANING
        ? frequencyObject.favorite
          ? '<span class="favorite-icon" data-icon="favorite-on"></span>'
          : '' : ''
      }
        <i class="menu style-scope kai-1line-listitem" data-icon="menu" data-l10n-id="option-menu"></i>
     `
    return html;
  };

  // Format frequency list item element ID
  FrequencyList.prototype.formatFrequencyElementId = function(frequency) {
    return !frequency ? null : ('frequency-' + frequency);
  };

  // Clear current frequency list UI
  FrequencyList.prototype.clearCurrentFrequencyList = function() {
    FMElementFrequencyListContainer.innerHTML = '';
  };

  // Add frequency to frequency list UI
  FrequencyList.prototype.addFrequencyToListUI = function(frequencyObject) {
    if (!frequencyObject) {
      return;
    }
    let element = `
      <div id=${this.formatFrequencyElementId(frequencyObject.frequency)}
      class="frequency-list-item">
        ${this.formatFrequencyElementInnerHTML(frequencyObject)}
      </div>
      `
    FMElementFrequencyListContainer.innerHTML += element;
  };

  // Update current frequency list UI, favorite list UI, rename UI or stations list UI
  FrequencyList.prototype.updateFrequencyListUI = function(frequencyList) {
    if (!frequencyList) {
      return;
    }

    this.clearCurrentFrequencyList();
    FrequencyDialer.removeFavoriteDialer();
    for (let index = 0; index < frequencyList.length; index++) {
      let frequencyObject = frequencyList[index];
      this.addFrequencyToListUI(frequencyObject);
      FrequencyDialer.addFavoriteDialer(frequencyObject);
    }
  };

  // Update favorite list UI
  FrequencyList.prototype.updateFavoriteListUI = function() {
    let favoritesList = FrequencyManager.getFavoriteFrequencyList();
    if (favoritesList) {
      favoritesList.sort((a, b) => { return b.favoriteTime - a.favoriteTime });
      this.updateFrequencyListUI(favoritesList);
    }
  };

  // Update current single frequency list item element
  FrequencyList.prototype.updateCurrentFrequencyElement = function(element) {
    if (!element) {
      return;
    }

    let frequency = this.getFrequencyByElement(element);
    if (element.id === 'frequency-display') {
      FrequencyDialer.updateFrequency();
    } else {
      let frequencyObject = FrequencyManager.getCurrentFrequencyObject(frequency);
      element.innerHTML = this.formatFrequencyElementInnerHTML(frequencyObject);
    }
  };

  // Get the frequency of current frequency list item
  FrequencyList.prototype.getFrequencyByElement = function(element) {
    if (!element) {
      return;
    }
    return parseFloat(element.id.substring(element.id.indexOf('-') + 1));
  };

  // Update stations list UI
  FrequencyList.prototype.updateStationsListUI = function() {
    let stationslist = FrequencyManager.getStationsFrequencyList();
    if (stationslist) {
      stationslist.sort((a, b) => { return a.stationTime - b.stationTime });
      this.updateFrequencyListUI(stationslist);
    }
  };
  exports.FrequencyList = new FrequencyList();
})(window);
