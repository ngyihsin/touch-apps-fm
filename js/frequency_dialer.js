/* exported FrequencyDialer */
'use strict';

(function(exports) {

  // FrequencyDialer Constructor
  const FrequencyDialer = function() {
    this.currentFreqency = 0.0;
  };

  // Update current frequency dialer UI with current frequency
  FrequencyDialer.prototype.update = function() {
    // Update both frequency and favorite indicate icon if needed
    let favorite = FrequencyManager.checkFrequencyIsFavorite(this.currentFreqency);
    FMElementFrequencyDialer.innerHTML = 
     ` ${this.currentFreqency.toFixed(1)}
      ${favorite 
      ? '<span id="favorite-star" class="remove-to-favorites" data-l10n-id="unfavorite" data-icon="favorite-on"></span>'
      : '<span id="favorite-star" class="add-to-favorites" data-l10n-id="add-to-favorites" data-icon="favorite-off"></span>'}`;

    // No need update focus while FM Radio disabled
    if (!mozFMRadio.enabled) {
      return;
    }

    // No need update focus while favorite list UI is not shown
    if (StatusManager.status !== StatusManager.STATUS_FAVORITE_SHOWING) {
      return;
    }

    // No need update focus if FocusManager has not loaded yet
    if (typeof FocusManager === 'undefined') {
      return;
    }

    // No need update focus while current frequency dialer UI is focused
    let focusedItem = FocusManager.getCurrentFocusElement();
    if (focusedItem.id === 'frequency-display') {
      return;
    }

    // No need update focus while current frequency playing is focused
    let focusedFreqency = FrequencyList.getFrequencyByElement(focusedItem);
    if (focusedFreqency === this.currentFreqency) {
      return;
    }

    // Update focus
    FocusManager.update();
  };

  // Update current frequency dialer UI with specified frequency
  FrequencyDialer.prototype.updateFrequency = function(frequency){
    if (frequency) {
      this.currentFreqency = frequency;
    }

    this.update();
  };

  FrequencyDialer.prototype.getFrequency = function() {
    return this.currentFreqency;
  };

  exports.FrequencyDialer = new FrequencyDialer();
})(window);
