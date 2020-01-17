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
require('../../js/satus_manager');
require('../../js/language_manage');

document.dir = DomInitHTML.dir;
document.body.innerHTML = DomInitHTML.innerHTML;
HeadphoneState.deviceWithValidAntenna = true;
FMRadio.airplaneModeEnabled = false;
Start.initialize();
FMAction.init();
test('short press to seek', () => {
  mozFMRadio.enabled = true;
  FMAction.isLongPress = false;
  FMAction.onclickSeek('frequency-op-seekdown');
  expect(mozFMRadio.frequency).toBe(97.7);
  FMAction.onclickSeek('frequency-op-up');
  expect(mozFMRadio.frequency).toBe(97.8);
});

test('toggle speaker and headphone', () => {
  FMAction.speakerUpdate(true);
  expect(FMspeakSwitch.getAttribute('data-l10n-id')).toBe('switchToHeadphones');
  expect(FMspeakSwitch.getAttribute('data-icon')).toBe('speaker-on');
  FMAction.speakerUpdate(false);
  expect(FMspeakSwitch.getAttribute('data-l10n-id')).toBe('speaker-switch');
  expect(FMspeakSwitch.getAttribute('data-icon')).toBe('audio-output');
});
