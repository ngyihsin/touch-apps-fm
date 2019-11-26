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
    let favoriteItem = FMElementFrequencyListTemplate.content.querySelector('span');
    frequencyItem.id = 'detail' + this.formatFrequencyElementId(frequencyObject.frequency);
    frequencyItem.textContent = frequencyObject.name;
    let condition = StatusManager.status === StatusManager.STATUS_STATIONS_SHOWING ||
      StatusManager.status === StatusManager.STATUS_STATIONS_SCANING;
    if (condition) {
      if (frequencyObject.favorite) {
        favoriteItem.setAttribute('data-icon', 'favorite-on');
        favoriteItem.setAttribute('data-l10n-id', 'unfavorite');
      } else {
        favoriteItem.setAttribute('data-icon', 'favorite-off');
        favoriteItem.setAttribute('data-l10n-id', 'add-to-favorites');
      }
    } else {
      favoriteItem.setAttribute('data-icon', 'favorite-on');
      favoriteItem.setAttribute('data-l10n-id', 'unfavorite');
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
      frequencyObject.favorite
        ? FrequencyDialer.addFavoriteDialer(frequencyObject) : '';
    }
  };

  // Update favorite list UI
  FrequencyList.prototype.updateFavoriteListUI = function () {
    let favoritesList = FrequencyManager.getFavoriteFrequencyList();
    if (favoritesList) {
      favoritesList.sort((a, b) => a.frequency - b.frequency);
      this.updateFrequencyListUI(favoritesList);
      FocusManager.update();
    }
  };

  FrequencyList.prototype.favoriteDeal = function (favorite, e) {
    let frequency = '';
    let element = null;
    if (e.rangeParent.id === 'frequency-display') {
      frequency = FrequencyDialer.getFrequency();
      element = FocusManager.getCurrentFocusElement();
    } else {
      frequency = this.getFrequencyByElement(e.rangeParent);
      element = e.rangeParent;
    }
    if (!favorite) {
      FrequencyManager.updateFrequencyName(frequency, frequency.toFixed(1));
    }
    FrequencyManager.updateFrequencyFavorite(frequency, favorite);
    if (StatusManager.status === StatusManager.STATUS_FAVORITE_SHOWING) {
      this.updateFavoriteListUI();
      WarningUI.update();
    } else {
      let frequencyObject = FrequencyManager.getCurrentFrequencyObject(frequency);
      if (frequencyObject && frequencyObject.station) {
        element.innerHTML = '';
        element.appendChild(this.formatFrequencyListTemplate(frequencyObject));
        WarningUI.update();
      }
    }
    FrequencyDialer.updateFrequency();
    FocusManager.update();
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
      this.updateFrequencyListUI(stationslist);
      FocusManager.update();
    }
  };
  exports.FrequencyList = new FrequencyList();
})(window);
