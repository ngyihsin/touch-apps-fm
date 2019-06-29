/* exported frequencyList */
'use strict';

(function(exports) {

  // FrequencyList Constructor
  var FrequencyList = function() {};

  // Format frequency list item element innerHTML
  FrequencyList.prototype.formatFrequencyElementInnerHTML = function(frequencyObject) {
    if (!frequencyObject) {
      return;
    }
    let html = `
    <div id=${this.formatFrequencyElementId(frequencyObject.frequency)} 
    class="frequency-list-item" role="option">
      ${frequencyObject.favorite
        ? '<div class="frequency-list-favorite-icon favorite-on"></div>'
        : '<div class="frequency-list-favorite-icon hidden"></div>'}
        <div class="frequency-list-frequency" data-l10n-id="Tab-frequency">
          ${frequencyObject.frequency}
        </div>
        <div id="frequency-action-item" class="frequency-action-container hidden">
        ${frequencyObject.favorite
          ? '<div class="frequency-action-favorite" data-l10n-id="station-removed">Remove from favorite</div>'
          : '<div class="frequency-action-favorite" data-l10n-id="station-added">Add to favorite</div>'}
          <div class="frequency-action-rename">
            Rename Station
          </div>
        </div>
    </div>
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

    FMElementFrequencyListContainer.innerHTML += this.formatFrequencyElementInnerHTML(frequencyObject);
     
  };

  // Update current frequency list UI, favorite list UI, rename UI or stations list UI
  FrequencyList.prototype.updateFrequencyListUI = function(frequencyList) {
    if (!frequencyList) {
      return;
    }

    this.clearCurrentFrequencyList();
    for (let index = 0; index < frequencyList.length; index++) {
      let frequencyObject = frequencyList[index];
      this.addFrequencyToListUI(frequencyObject);
    }
  };

  // Update favorite list UI
  FrequencyList.prototype.updateFavoriteListUI = function() {
    let favoritesList = FrequencyManager.getFavoriteFrequencyList();
    if (favoritesList) {
      favoritesList.sort((a, b) => {return b.favoriteTime - a.favoriteTime});
      this.updateFrequencyListUI(favoritesList);
    }
  };

  // Update stations list UI
  FrequencyList.prototype.updateStationsListUI = function() {
    let stationslist = FrequencyManager.getStationsFrequencyList();
    if (stationslist) {
      stationslist.sort((a, b) => {return a.stationTime - b.stationTime});
      this.updateFrequencyListUI(stationslist);
    }
  };
  exports.FrequencyList = new FrequencyList();
})(window);
