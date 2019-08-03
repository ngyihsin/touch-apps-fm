
(function (exports) {
  'use strict';
  let csh = null;

  exports.FMCache = {
    saveFromNode: function cache_saveFromNode(moduleId, node) {
      let html = node.outerHTML;
      this.save(moduleId, html);
    },

    save: function cache_save(moduleId, html) {
      let id = moduleId;
      let langDir = document.querySelector('html').getAttribute('dir');
      let lang = navigator.language;
      html = window.HTML_CACHE_VERSION + (langDir ? ',' + langDir : '') +
        (lang ? ',' + lang : '') + ':' + html;
      try {
        localStorage.setItem('html_cache_' + id, html);
        console.log('html_cache_' + id);

      } catch (e) {
        console.error('Failed save cache:' + e);
      }
    },

    clear: function cache_clear(moduleId) {
      localStorage.removeItem('html_cache_' + moduleId);
    },

    cloneAsInertNodeAvoidingCustomElementHorrors:
      function cache_cloneAsInertNodeAvoidingCustomElementHorrors(node) {
        let templateNode = document.createElement('template');
        let cacheDoc = templateNode.content.ownerDocument;
        return cacheDoc.importNode(node, true);
      }
  };
})(this);
