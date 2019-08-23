/* exported frequencyList */
'use strict';

(function (exports) {

  // FrequencyList Constructor
  const FrequencyList = function () {};

  // Format frequency list item element innerHTML
  FrequencyList.prototype.formatFrequencyListTemplate = function (frequencyObject) {
    if (!frequencyObject) {
      return;
    }
    let frequencyItem = FMElementFrequencyListTemplate.content.querySelector('div');
    frequencyItem.id = 'detail' + this.formatFrequencyElementId(frequencyObject.frequency);
    frequencyItem.textContent = frequencyObject.name;
    let condition = (StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING ||
      StatusManager.status === StatusManager.STATUS_STATIONS_SCANING) && frequencyObject.favorite;
    if (condition) {
      let starObiect = document.createElement('span');
      starObiect.classList = 'favorite-icon';
      starObiect.setAttribute('data-icon', 'favorite-on');
      frequencyItem.appendChild(starObiect);
    }
    let cloneChild = document.importNode(FMElementFrequencyListTemplate.content, true);
    return cloneChild;
  };

  // Format frequency list item element ID
  FrequencyList.prototype.formatFrequencyElementId = function (frequency) {
    return !frequency ? null : 'frequency-' + frequency;
  };

  // Clear current frequency list UI
  FrequencyList.prototype.clearCurrentFrequencyList = function () {
    FMElementFrequencyListContainer.innerHTML = '';
  };

  // Add frequency to frequency list UI
  FrequencyList.prototype.addFrequencyToListUI = function (frequencyObject) {
    if (!frequencyObject) {
      return;
    }
    let element = document.createElement('div');
    element.id = this.formatFrequencyElementId(frequencyObject.frequency);
    element.className = 'frequency-list-item';
    element.appendChild(this.formatFrequencyListTemplate(frequencyObject));
    FMElementFrequencyListContainer.appendChild(element);
  };

  // Update current frequency list UI, favorite list UI, rename UI or stations list UI
  FrequencyList.prototype.updateFrequencyListUI = function (frequencyList) {
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
  FrequencyList.prototype.updateFavoriteListUI = function () {
    let favoritesList = FrequencyManager.getFavoriteFrequencyList();
    if (favoritesList) {
      favoritesList.sort((a, b) => b.favoriteTime - a.favoriteTime);
      this.updateFrequencyListUI(favoritesList);
      FocusManager.update();
    }
  };

  // Update current single frequency list item element
  FrequencyList.prototype.updateCurrentFrequencyElement = function (element) {
    if (!element) {
      return;
    }

    let frequency = this.getFrequencyByElement(element);
    if (element.id === 'frequency-display') {
      FrequencyDialer.updateFrequency();
    } else {
      let frequencyObject = FrequencyManager.getCurrentFrequencyObject(frequency);
      element.innerHTML = '';
      element.appendChild(this.formatFrequencyListTemplate(frequencyObject));
    }
  };

  // Get the frequency of current frequency list item
  FrequencyList.prototype.getFrequencyByElement = function (element) {
    if (!element) {
      return;
    }
    return parseFloat(element.id.substring(element.id.indexOf('-') + 1));
  };

  // Update stations list UI
  FrequencyList.prototype.updateStationsListUI = function () {
    let stationslist = FrequencyManager.getStationsFrequencyList();
    if (stationslist) {
      stationslist.sort((a, b) => a.stationTime - b.stationTime);
      this.updateFrequencyListUI(stationslist);
      FocusManager.update();
    }
  };
  exports.FrequencyList = new FrequencyList();
})(window);
