/* exported FrequencyDialer */
'use strict';

(function (exports) {

  // FrequencyDialer Constructor
  const FrequencyDialer = function () {
    this.currentFreqency = 0.0;
    this.blankUnit = 3;
    this.space = 5;
    this.progressLoad = false;
    this.pillButtonLoad = false;
  };

  // Update current frequency dialer UI with current frequency
  FrequencyDialer.prototype.update = function () {
    // Update both frequency and favorite indicate icon if needed
    let favorite = FrequencyManager.checkFrequencyIsFavorite(this.currentFreqency);
    let favoriteObject = FrequencyManager.getCurrentFrequencyObject(this.currentFreqency);
    let frequencyArr = this.currentFreqency.toFixed(1).split('');
    FMElementFrequencyDialer.innerHTML =
      ` 
      ${frequencyArr.map((digit) => digit !== '.'
    ? `<span class="num" data-icon="numeric_${digit}_rounded_bold"></span>`
    : `<div id="point"><span></span></div>`).join('')}
      ${favorite
    ? '<div id="favorite-star" class="remove-to-favorites" data-l10n-id="unfavorite" data-icon="favorite-on"></div>'
    : '<div id="favorite-star" class="add-to-favorites" data-l10n-id="add-to-favorites" data-icon="favorite-off"></div>'}
      `;
    if (favoriteObject && favoriteObject.name !== this.currentFreqency.toFixed(1)) {
      document.getElementById('frequency-name').innerText = favoriteObject.name;
    } else {
      document.getElementById('frequency-name').innerText = '';
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

  // Unit diar
  FrequencyDialer.prototype.diarUpdate = function (value, bound, shadow) {
    if (shadow) {
      return `
      <li class="diar-item decimal shadow"></li>
      <li class="diar-item shadow"></li>
      <li class="diar-item shadow"></li>
      <li class="diar-item shadow"></li>
      <li class="diar-item shadow"></li>
   `;
    }
    return `
        <li class="diar-item decimal ${bound}">
          <span class="diar-num">
            ${value}
          </span>
        </li>
        <li class="diar-item"></li>
        <li class="diar-item"></li>
        <li class="diar-item"></li>
        <li class="diar-item"></li>
     `;
  };

  FrequencyDialer.prototype.initDialerUI = function () {
    this.diarUnit = document.getElementById('dialer-unit');
    this.fmHeader = document.getElementById('fm-header');
    
    let lower = fmRadio.frequencyLowerBound;
    let upper = fmRadio.frequencyUpperBound;

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
    this.diarUnit.children[favoriteNum].classList.add('favorite-unit');
    let decimal = this.diarUnit.children[favoriteNum].classList.contains('decimal');    
    let elementHtml = `
      <span class="favorite-diar" style="position:absolute;
      left:${frequency.toFixed(1).toString()
    .split('.')[1] * 1.6 + 'px'};
      top:${decimal ? '0px' : '-3px'}"></span>`;

    this.diarUnit.children[favoriteNum].innerHTML += elementHtml;
  };

  FrequencyDialer.prototype.removeFavoriteDialer = function () {
    let favoritesList = document.getElementsByClassName('favorite-unit');
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
        favoritesList[i].classList.remove('favorite-unit');
        i--;
      }
    }
  };

  FrequencyDialer.prototype.createButton = function () {
    if (this.stationAction) {
      this.stationAction.classList.remove('hidden');
    } else {
      this.stationAction = document.createElement('kai-pillbutton');
      this.stationAction.id = 'station-action';
      this.stationAction.level = "secondary";
      this.fmHeader.appendChild(this.stationAction);
    }
    this.stationAction.addEventListener('click', FMAction.callFunByClick.bind(this));
  };

  FrequencyDialer.prototype.deleteButton = function (hidden) {
    if (this.stationAction) {
      this.stationAction.removeEventListener('click', FMAction.callFunByClick.bind(this));
      if (hidden) {
        this.stationAction.classList.add('hidden');
      } else {
        this.fmHeader.removeChild(this.stationAction);
        this.stationAction = null;
      }
    }
  };

  FrequencyDialer.prototype.createLoader = function () {
    this.progress = document.createElement('kai-loader');
    FMElementFrequencyListUI.appendChild(this.progress);
  };

  FrequencyDialer.prototype.progressOn = function () {
    if (!this.progressLoad) {
      LazyLoader.load('https://shared.local/elements/kai-loader.js',
        () => {
          this.createLoader();
        });
    } else {
      this.createLoader();
    }
  };

  FrequencyDialer.prototype.progressOff = function () {
    FMElementFrequencyListUI.contains(this.progress) &&
      FMElementFrequencyListUI.removeChild(this.progress);
  };

  exports.FrequencyDialer = new FrequencyDialer();
})(window);
