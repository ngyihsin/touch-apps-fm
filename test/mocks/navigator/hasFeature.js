window = {
  navigator: null
};

window.navigator = {
  hasFeature: null,
  then: null,
  catch: null
};

window.navigator.hasFeature = function (featureName) {
  let cPromise = new Promise((resolve, reject) => {
    if (featureName !== 'device.capability.volume-key') {
      reject('featureName is not in the list!');
    } else if (featureName !== 'device.capability.fm.recorder') {
      reject('featureName is not in the list!');
    }
    resolve(false);
  });
  return cPromise;
};
