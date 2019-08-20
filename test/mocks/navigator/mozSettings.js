window = {
  navigator: null
};

window.navigator = {
  mozSettings: null
};

window.navigator.mozSettings = {
  addObserver: jest.fn(),
  createLock: () => ({
    get: () => ({
      addEventListener: jest.fn()
    }),
    set: jest.fn()
  })
};
