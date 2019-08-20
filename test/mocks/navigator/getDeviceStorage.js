window = {
  navigator: null
};

window.navigator = {
  getDeviceStorage: null
};

window.navigator.getDeviceStorages = () => ({
  get: () => jest.fn(),
  delete: () => jest.fn()
});
