(function (exports) {

  let LazyLoader = (function () {
    return {
      load: function (key) {
        return jest.fn();
      }
    };
  })();
  
    exports.LazyLoader = LazyLoader;
  })(window);