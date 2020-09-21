'use strict';

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.onsystemmessage = (evt) => {
  if ('activity' === evt.name) {
    const handler = evt.data.webActivityRequestHandler();
    const aData = handler.source.data;
    evt.waitUntil(clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          category: 'systemmessage',
          message: aData,
        });
      });
    }));
  }
};
