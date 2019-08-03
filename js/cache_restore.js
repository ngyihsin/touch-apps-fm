(function (exports) {
  'use strict';

  window.HTML_CACHE_VERSION = '4';

  exports.FMCacheRestore = {

    hydrateHtml: function cache_hydrateHtml(id) {
      let parsedResults = this.retrieve(id);
      let lang = navigator.language;

      if (parsedResults.langDir && (lang === parsedResults.lang)) {
        document.querySelector('html').setAttribute('dir', parsedResults.langDir);
      }

      let cardsNode = document.getElementById('fm-container');
      let contents = parsedResults.contents;
      if (contents === '') {
        return;
      }
      cardsNode.outerHTML = contents;
    },

    retrieve: function cache_retrieve(id) {
      let value = localStorage.getItem('html_cache_' + id) || '';
      let index, version, langDir, lang;
      index = value.indexOf(':');

      if (index === -1) {
        value = '';
      } else {
        version = value.substring(0, index);
        value = value.substring(index + 1);

        let versionParts = version.split(',');
        version = versionParts[0];
        langDir = versionParts[1];
        lang = versionParts[2];
      }

      if (version !== window.HTML_CACHE_VERSION) {
        value = '';
      }

      return {
        langDir: langDir,
        lang: lang,
        contents: value
      };
    },

  };
})(this);
