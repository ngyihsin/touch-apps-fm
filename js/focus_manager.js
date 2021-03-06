/* exported FocusManager */
'use strict';

(function (exports) {

  // FocusManager Constructor
  const FocusManager = function () {
    this.focus = -1;
    this.focusList = {};
    this.previousFocusedItem = null;
    this.previousFocusedIndex = -1;
    this.resetFocus = false;
  };

  // Update current list should be focued in current screen
  FocusManager.prototype.updateCurrentFocusList = function () {
    let elements = [];
    switch (this.focus) {
      case StatusManager.STATUS_FAVORITE_SHOWING:
      case StatusManager.STATUS_DIALOG_FIRST_INIT:
      case StatusManager.STATUS_FAVORITE_RENAMING:
      case StatusManager.STATUS_STATIONS_SCANING:
      case StatusManager.STATUS_STATIONS_SHOWING:
        [].forEach.call(FMElementFrequencyListContainer.children,
          (element) => {
            elements.push(element);
          });
        break;
      default:
        break;
    }

    if (elements.length === 0) {
      return;
    }

    if (!this.focusList[this.focus]) {
      this.focusList[this.focus] = {};
      this.focusList[this.focus].index = 0;
    }
    this.focusList[this.focus].elements = elements;
    return this.focusList[this.focus];
  };

  // Get current focus list
  FocusManager.prototype.getCurrentFocusList = function () {
    return this.focusList[this.focus];
  };

  // Update current focus index
  FocusManager.prototype.updateCurrentFocusIndex = function (index) {
    let focusList = this.getCurrentFocusList();
    if (!focusList || focusList.elements.length === 0) {
      return;
    }

    if (index < 0 || index >= focusList.elements.length) {
      return;
    }

    focusList.index = index;
    let focusedItem = focusList.elements[index];
    if (focusedItem) {
      // Update current focused item and index
      this.previousFocusedItem = focusedItem;
      this.previousFocusedIndex = index;
      if (index === 0) {
        this.backOff = true;
      } else {
        this.backOff = false;
      }
    }
  };

  // Update current focus
  FocusManager.prototype.update = function (resetFocus) {
    switch (StatusManager.status) {
      case StatusManager.STATUS_FAVORITE_SHOWING:
      case StatusManager.STATUS_FAVORITE_RENAMING:
      case StatusManager.STATUS_STATIONS_SCANING:
      case StatusManager.STATUS_STATIONS_SHOWING:
      case StatusManager.STATUS_DIALOG_FIRST_INIT:
        if (StatusManager.status === StatusManager.STATUS_DIALOG_FIRST_INIT) {
          this.focus = StatusManager.STATUS_FAVORITE_SHOWING;
        } else {
          this.focus = StatusManager.status;
        }
        break;
      default:
        return;
    }
    this.resetFocus = resetFocus;
    let currentFrequency = FrequencyDialer.getFrequency();
    let stationslist = this.focus === StatusManager.STATUS_FAVORITE_SHOWING
      ? FrequencyManager.getFavoriteFrequencyList()
      : FrequencyManager.getStationsFrequencyList();
    let fixed = 0;
    let update = stationslist.some((frequency, i) => {
      let frequencyCompare = frequency.frequency === currentFrequency;
      if (frequencyCompare) {
        fixed = i;
      }
      return frequencyCompare;
    });
    if (update) {
      this.resetCurrentFocusedItems(fixed);
    } else {
      this.dismissFocus();
    }
  };

  /*
   * Reset and update current focused items
   * fixed: change current focus to the first item in station list UI or not
   */
  FocusManager.prototype.resetCurrentFocusedItems = function (fixed) {
    let currentFocusList = this.updateCurrentFocusList();
    if (!currentFocusList || currentFocusList.elements.length === 0) {
      return;
    }

    let index = 0;

    if (fixed) {
      if (typeof fixed === 'number') {
        currentFocusList.index = fixed;
      }
      index = currentFocusList.index;
    } else {
      index = 0;
    }
    // Update the specified index item to focus
    this.updateFocus(index);
    // Scroll to the focus item if needed
    if (this.resetFocus) {
      this.previousFocusedItem.scrollIntoView(false);
    }
  };

  // Update the specified index item to focus
  FocusManager.prototype.updateFocus = function (index) {
    let focusList = this.getCurrentFocusList();
    if (!focusList || focusList.elements.length === 0) {
      return;
    }

    if (index >= 0 && index < focusList.elements.length) {
      this.dismissFocus();
      let toFocused = focusList.elements[index];
      toFocused.classList.add('focus');
      toFocused.focus();
    }

    this.updateCurrentFocusIndex(index);
  };

  // Remove current focus
  FocusManager.prototype.dismissFocus = function () {
    let focused = document.querySelectorAll('.focus');
    for (let i = 0; i < focused.length; i++) {
      focused[i].classList.remove('focus');
    }

    focused = document.querySelectorAll('.hasfocused');
    for (let i = 0; i < focused.length; i++) {
      focused[i].classList.remove('hasfocused');
    }
  };

  // Get current focused item
  FocusManager.prototype.getCurrentFocusElement = function () {
    return this.previousFocusedItem;
  };

  exports.FocusManager = new FocusManager();
})(window);
