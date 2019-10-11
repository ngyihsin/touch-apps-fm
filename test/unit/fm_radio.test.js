require('../mocks/DomInitHTML');
require('../mocks/localStorage');
require('../mocks/mediaDB');
require('../mocks/mozRadio');
require('../mocks/navigator/getDeviceStorage');
require('../mocks/navigator/hasFeature');
require('../mocks/navigator/mozAudioChannelManager');
require('../mocks/navigator/mozSettings');
require('../mocks/performance/mark');
require('../mocks/speaker');
require('../mocks/speakerManager');
require('../mocks/document');
require('../mocks/navigator/mozL10n');

require('../../js/fm_radio');
require('../../js/fm_action');
require('../../js/frequency_dialer');
require('../../js/frequency_list');
require('../../js/focus_manager');
require('../../js/frequency_manager');
require('../../js/headphone_state');
require('../../js/stations_list');
require('../../js/warning_ui');
require('../../js/satus_manager');
require('../../js/language_manage');
require('../../js/dialog_helper');
require('../../js/frequency_rename');

document.dir = DomInitHTML.dir;
document.body.innerHTML = DomInitHTML.innerHTML;
HeadphoneState.deviceWithValidAntenna = true;
FMRadio.airplaneModeEnabled = false;
Start.initialize();
FMAction.init();
FrequencyManager.frequencyList = {
  "87.8": {
    favorite: false,
    frequency: 87.8,
    name: '87.8MHZ',
    station: true,
    stationTime: 1
  },
  "91.6": {
    favorite: true,
    frequency: 91.6,
    name: '交通广播',
    station: true,
    stationTime: 2
  },
  "93.1": {
    favorite: false,
    frequency: 93.1,
    name: '<span>shishi</span>',
    station: true,
    stationTime: 3
  }
};
test('radio on', () => {
  window.localStorage.setItem(FMRadio.KEYNAME_FIRST_INIT, true);
  mozFMRadio.enabled = true;
  FMRadio.onFMRadioEnabled();
  expect(document.getElementById('power-switch').getAttribute('data-l10n-id')).toBe('power-switch-off');
  expect(document.getElementById('power-switch').checked).toBe(true);
  expect(document.getElementById('speaker-switch').classList.contains('hidden')).toBe(false);
  expect(FMElementFMContainer.classList.contains('dim')).toBe(false);
  expect(FMElementFMFooter.classList.contains('dim')).toBe(false);
  expect(StatusManager.status).toBe(StatusManager.STATUS_FAVORITE_SHOWING);
});
