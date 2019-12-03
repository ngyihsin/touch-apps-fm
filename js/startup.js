/* Launch or quit fmradio */
'use strict';

(function () {
  const time = 300;
  window.mozFMRadio = navigator.mozFM || navigator.mozFMRadio;

  function initialize() {
    window.FMElementFMContainer = document.getElementById('fm-container');
    window.FMElementFrequencyDialer = document.getElementById('frequency-display');
    window.FMElementFrequencyListUI = document.getElementById('frequency-list');
    window.FMElementAntennaUnplugWarning = document.getElementById('antenna-warning');
    window.FMElementFavoriteListWarning = document.getElementById('favoritelist-warning');
    window.FMElementFrequencyListContainer = document.getElementById('frequency-list-container');
    window.FMElementFrequencyListTemplate = document.getElementById('frequency-list-template');
    window.FMElementFMFooter = document.querySelector('kai-categorybar');
  }

  if (navigator.mozAudioChannelManager.headphones ||
    mozFMRadio.antennaAvailable) {
    FMCacheRestore.hydrateHtml('fm-container');
  } else {
    document.getElementById('fm-container').classList.add('hidden');
    document.querySelector('kai-categorybar').classList.add('hidden');
    document.getElementById('power-switch').classList.add('hidden');
    document.getElementById('antenna-warning').hidden = false;
  }

  navigator.mozL10n.ready(() => {
    LanguageManager.init();
    LanguageManager.updateLanguage();
  });

  // Toggle the large-text. changed big to small then to big. so change text should executed earlier
  document.body.classList.toggle('large-text', navigator.largeTextEnabled);
  window.addEventListener('largetextenabledchanged', () => {
    document.body.classList.toggle('large-text', navigator.largeTextEnabled);
  });

  function lazyload() {
    setTimeout(() => {
      let lazyFiles = [
        'shared/js/media/remote_controls.js',
        'js/remoteControl.js',
        'js/headphone_state.js',
        'js/speaker_state.js',
        'js/fm_action.js',
        'js/history_frequency.js',
        'js/stations_list.js',
        'js/frequency_manager.js',
        'js/frequency_dialer.js',
        'js/frequency_list.js',
        'js/warning_ui.js',
        'js/fm_radio.js',
        'js/focus_manager.js',
        'js/dialog_helper.js',
        'js/frequency_rename.js'
      ];

      LazyLoader.load(lazyFiles, () => {
        initialize();
        FMRadio.init();
      });
    }, time);
  }

  function unload() {
    FMRadio.disableFMRadio();
  }

  window.addEventListener('load', lazyload, false);
  window.addEventListener('unload', unload, false);
})();
