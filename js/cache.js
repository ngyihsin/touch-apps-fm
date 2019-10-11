
'use strict';

(function (exports) {
  exports.FMCache = {
    saveFromNode: function saveFromNode(moduleId, node) {
      let html = node.outerHTML;
      this.save(moduleId, html);
    },

    save: function save(moduleId, html) {
      let id = moduleId;
      let langDir = document.querySelector('html').getAttribute('dir');
      let lang = navigator.language;
      let stationAction = document.getElementById('station-action').outerHTML;
      let progress = document.getElementById('myProgress').outerHTML;
      let rewrite = html.replace(/(\<kai-pillbutton).*\/kai-pillbutton\>/, stationAction);
      rewrite = rewrite.replace(/(\<kai-loader).*\/kai-loader\>/, progress);
      html = window.HTML_CACHE_VERSION + (langDir ? ',' + langDir : '') +
        (lang ? ',' + lang : '') + ':' + rewrite;
      try {
        localStorage.setItem('html_cache_' + id, html);
      } catch (e) {
        console.error('Failed save cache:' + e);
      }
    },

    clear: function clear(moduleId) {
      localStorage.removeItem('html_cache_' + moduleId);
    },

    cloneAsInertNodeAvoidingCustomElementHorrors:
      function cloneAsInertNodeAvoidingCustomElementHorrors(node) {
        let templateNode = document.createElement('template');
        let cacheDoc = templateNode.content.ownerDocument;
        return cacheDoc.importNode(node, true);
      }
  };
})(this);
