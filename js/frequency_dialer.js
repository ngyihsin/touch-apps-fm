/* exported FrequencyDialer */
'use strict';

(function(exports) {

  // FrequencyDialer Constructor
  const FrequencyDialer = function() {
    this.currentFreqency = 0.0;
    this.unit = 2
  };

  // Update current frequency dialer UI with current frequency
  FrequencyDialer.prototype.update = function() {
    // Update both frequency and favorite indicate icon if needed
    let favorite = FrequencyManager.checkFrequencyIsFavorite(this.currentFreqency);
    let favoriteObject = FrequencyManager.getCurrentFrequencyObject(this.currentFreqency);
    FMElementFrequencyDialer.innerHTML =
      ` ${this.currentFreqency.toFixed(1)}
     <div>${favoriteObject ? favoriteObject.name === this.currentFreqency.toFixed(1)
      ? '' : favoriteObject.name : ''}</div>
      ${favorite
        ? '<span id="favorite-star" class="remove-to-favorites" data-l10n-id="unfavorite" data-icon="favorite-on"></span>'
        : '<span id="favorite-star" class="add-to-favorites" data-l10n-id="add-to-favorites" data-icon="favorite-off"></span>'}`;

    // No need update focus while FM Radio disabled
    if (!mozFMRadio.enabled) {
      return;
    }

    // No need update focus if FocusManager has not loaded yet
    if (typeof FocusManager === 'undefined') {
      return;
    }

    // No need update focus while current frequency playing is focused
    let focusedItem = FocusManager.getCurrentFocusElement();
    let focusedFreqency = FrequencyList.getFrequencyByElement(focusedItem);
    if (focusedFreqency === this.currentFreqency) {
      return;
    }

    // Update focus
    FocusManager.update();
  };

  // Update current frequency dialer UI with specified frequency
  FrequencyDialer.prototype.updateFrequency = function(frequency) {
    if (frequency) {
      this.currentFreqency = frequency;
      this.updateDialerUI(frequency);
    }
    this.update();
  };

  FrequencyDialer.prototype.getFrequency = function() {
    return this.currentFreqency;
  };

  FrequencyDialer.prototype.initDialerUI = function() {
    document.getElementById('frequency-dialer').innerHTML = '';
    let lower = this._bandLowerBound = mozFMRadio.frequencyLowerBound;
    let upper = this._bandUpperBound = mozFMRadio.frequencyUpperBound;

    let unit = this.unit;
    this._minFrequency = lower - lower % unit;
    this._maxFrequency = upper + unit - upper % unit;
    let unitCount = (this._maxFrequency - this._minFrequency) / unit;

    for (let i = 0; i < unitCount; ++i) {
      let start = this._minFrequency + i * unit;
      start = start < lower ? lower : start;
      let end = this._maxFrequency + i * unit + unit;
      end = upper < end ? upper : end;
      this.addDialerUnit(start, end);
    }

    // cache the size of dialer
    let _dialerUnits = document.getElementsByClassName('dialer-unit');
    let _dialerUnitWidth = _dialerUnits[0].clientWidth;
    this._dialerWidth = _dialerUnitWidth * _dialerUnits.length;
    this._space = this._dialerWidth /
      (this._maxFrequency - this._minFrequency);

    for (let i = 0; i < _dialerUnits.length; i++) {
      _dialerUnits[i].style.left = i * _dialerUnitWidth + 'px';
    }
  }

  FrequencyDialer.prototype.addDialerUnit = function(start, end) {
    let markStart = start - start % this.unit;
    let startMaskWidth = 0;
    let endMaskWidth = 0;
    let unitWidth = 16;

    let total = this.unit * 10;     // 0.1MHz
    for (let i = 0; i < total; i++) {
      let dialValue = markStart + i * 0.1;
      if (dialValue < start) {
        startMaskWidth += unitWidth;
      } else if (dialValue > end) {
        endMaskWidth += unitWidth;
      }
    }

    let container = document.createElement('div');
    container.classList.add('dialer-unit-mark-box');

    if (startMaskWidth > 0) {
      let markEl = document.createElement('div');
      markEl.classList.add('dialer-unit-mark-mask-start');
      markEl.style.width = startMaskWidth + 'px';

      container.appendChild(markEl);
    }

    if (endMaskWidth > 0) {
      let markEnd = document.createElement('div');
      markEnd.classList.add('dialer-unit-mark-mask-end');
      markEnd.style.width = endMaskWidth + 'px';
      container.appendChild(markEnd);
    }

    let width = (100 / this.unit) + '%';
    // Show the frequencies on dialer
    for (let j = 0; j < this.unit; j++) {
      let frequency = Math.floor(markStart) + j;
      let showFloor = frequency >= start && frequency <= end;

      let unit = document.createElement('div');
      unit.classList.add('dialer-unit-floor');
      if (!showFloor) {
        unit.classList.add('hidden-block');
      }
      unit.style.width = width;
      unit.appendChild(document.createTextNode(frequency));
      container.appendChild(unit);
    }

    let dialerUnit = document.createElement('div');
    dialerUnit.className = 'dialer-unit';
    dialerUnit.appendChild(container);
    document.getElementById('frequency-dialer').appendChild(dialerUnit);
  }

  FrequencyDialer.prototype.updateDialerUI = function(frequency, ignoreDialer) {
    if (true !== ignoreDialer) {
      this._translateX = (this._minFrequency - frequency) * this._space;
      let dialer = document.getElementById('frequency-dialer');
      let count = dialer.childNodes.length;
      for (let i = 0; i < count; i++) {
        dialer.childNodes[i].style.MozTransform =
          'translateX(' + this._translateX + 'px)';
      }
      document.getElementById('dialer-container').setAttribute('aria-valuenow', frequency);
    }
  }

  FrequencyDialer.prototype.progressOn = function() {
    let progress = document.getElementById('myProgress');
    progress.classList.remove('hidden');
  }

  FrequencyDialer.prototype.progressOff = function() {
    let progress = document.getElementById('myProgress');
    progress.classList.add('hidden');
  }

  exports.FrequencyDialer = new FrequencyDialer();
})(window);
