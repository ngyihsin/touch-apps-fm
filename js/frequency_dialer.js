/* exported FrequencyDialer */
'use strict';

(function (exports) {

  // FrequencyDialer Constructor
  const FrequencyDialer = function () {
    this.currentFreqency = 0.0;
    this.blankUnit = 3;
    this.space = 5;
  };

  // Update current frequency dialer UI with current frequency
  FrequencyDialer.prototype.update = function () {
    // Update both frequency and favorite indicate icon if needed
    let favorite = FrequencyManager.checkFrequencyIsFavorite(this.currentFreqency);
    let favoriteObject = FrequencyManager.getCurrentFrequencyObject(this.currentFreqency);
    let frequencyArr = this.currentFreqency.toFixed(1).split('');
    let frequencyDisplay = document.createElement('div');
    frequencyDisplay.id = 'frequency-display';
    frequencyDisplay.innerHTML =
      ` 
      ${frequencyArr.map((digit) => (digit !== '.'
          ? `<span data-icon="numeric_${digit}_rounded_bold"></span>`
          : `<div id="point"><span></span></div>`)).join('')}
      ${favorite
    ? '<div id="favorite-star" class="remove-to-favorites" data-l10n-id="unfavorite" data-icon="favorite-on"></div>'
    : '<div id="favorite-star" class="add-to-favorites" data-l10n-id="add-to-favorites" data-icon="favorite-off"></div>'}
      `;
    FMElementFrequencyDialer.innerHTML = frequencyDisplay.outerHTML;
    if (favoriteObject && favoriteObject.name !== this.currentFreqency.toFixed(1)) {
      let dispalyName = document.createElement('span');
      dispalyName.id = 'frequency-name';
      dispalyName.innerText = favoriteObject.name;
      FMElementFrequencyDialer.appendChild(dispalyName);
    }
  };

  // Update current frequency dialer UI with specified frequency
  FrequencyDialer.prototype.updateFrequency = function (frequency) {
    if (frequency) {
      this.currentFreqency = frequency;
      this.updateDialerUI(frequency);
    }
    this.update();
  };

  FrequencyDialer.prototype.getFrequency = function () {
    return this.currentFreqency;
  };

  /** Unit diar */
  FrequencyDialer.prototype.diarUpdate = function (value, bound, shadow) {
    if (shadow) {
      return `
      <li class="decimal shadow"></li>
      <li class="shadow"></li>
      <li class="shadow"></li>
      <li class="shadow"></li>
      <li class="shadow"></li>
   `;
    }
    return `
        <li class="decimal ${bound}">
          <span>
            ${value}
          </span>
        </li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
     `;
  };

  FrequencyDialer.prototype.initDialerUI = function () {
    this.diarUnit = document.getElementById('dialer-unit');

    let lower = mozFMRadio.frequencyLowerBound;
    let upper = mozFMRadio.frequencyUpperBound;

    this.minFrequency = lower - lower % this.space;
    this.minBlankFrequency = this.minFrequency - this.blankUnit * this.space;
    this.maxFrequency = upper + this.space - upper % this.space;
    this.maxBlankFrequency = this.maxFrequency + this.blankUnit * this.space;
    if (this.diarUnit.children.length > 0) {
      this.updateElementWidth();
      return;
    }
    let unitCount = Math.ceil((this.maxBlankFrequency - this.minBlankFrequency) / this.space);
    for (let i = 0; i < unitCount; ++i) {
      let value = this.minBlankFrequency + i * this.space;
      let bound = '';
      let shadow = false;
      if (value === this.minFrequency || value === this.maxFrequency) {
        bound = 'bound';
      }
      if (value > this.maxFrequency || value < this.minFrequency) {
        shadow = true;
      }
      this.diarUnit.innerHTML += this.diarUpdate(value, bound, shadow);
    }

    this.updateElementWidth();
  };

  FrequencyDialer.prototype.updateDialerUI = function (frequency, ignoreDialer) {
    if (true !== ignoreDialer) {
      if (this.dialerWidth === 0) {
        this.updateElementWidth();
      }
      this.translateX = (this.minBlankFrequency - frequency) * this.space + this.appWidth / 2;
      let dialer = document.getElementById('dialer-unit');
      dialer.style.MozTransform =
        'translateX(' + this.translateX + 'px)';
      document.getElementById('dialer-container').setAttribute('aria-valuenow', frequency);
    }
  };

  FrequencyDialer.prototype.updateElementWidth = function () {
    let frequencyDiar = document.getElementById('frequency-dialer');
    this.dialerWidth = this.diarUnit.clientWidth;
    this.appWidth = frequencyDiar.clientWidth;
    this.space = this.dialerWidth /
      (this.maxBlankFrequency - this.minBlankFrequency);
  };

  FrequencyDialer.prototype.addFavoriteDialer = function (frequencyObject) {
    let frequency = frequencyObject.frequency;
    let favoriteNum = Math.floor(frequency - this.minBlankFrequency);
    this.diarUnit.children[favoriteNum].classList.add('favorite-icon');
    let elementHtml = `
      <span class="favorite-diar" 
      style="position:absolute;left:${frequency.toFixed(1).toString()
    .split('.')[1] * 1.6 + 'px'}"></span>
      `;
    this.diarUnit.children[favoriteNum].innerHTML += elementHtml;
  };

  FrequencyDialer.prototype.removeFavoriteDialer = function () {
    let favoritesList = document.getElementsByClassName('favorite-icon');
    if (favoritesList.length > 0) {
      for (let i = 0; i < favoritesList.length; i++) {
        if (favoritesList[i].className.indexOf('decimal') !== -1) {
          let favoriteChild = favoritesList[i].childNodes;
          for (let j = favoriteChild.length - 1; j >= 0; j--) {
            favoriteChild[j].className === 'favorite-diar'
              ? favoritesList[i].removeChild(favoriteChild[j])
              : '';
          }
        } else {
          favoritesList[i].innerHTML = '';
        }
        favoritesList[i].classList.remove('favorite-icon');
        i--;
      }
    }
  };

  FrequencyDialer.prototype.progressOn = function () {
    let progress = document.getElementById('myProgress');
    progress.classList.remove('hidden');
  };

  FrequencyDialer.prototype.progressOff = function () {
    let progress = document.getElementById('myProgress');
    progress.classList.add('hidden');
  };

  exports.FrequencyDialer = new FrequencyDialer();
})(window);
