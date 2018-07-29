

/***************************************************
****************************************************
****************************************************
****************************************************
****************************************************

*******Code responsible for PWA features************

****************************************************
****************************************************
****************************************************
****************************************************
***************************************************/
var cacheName = 'E-shop-v21';
var filesToCache = [
    '/',
    '/index.html',
    '/src/pages/add.html',
    '/src/pages/save.html',    
    '/src/pages/inbox.html',
    '/src/pages/message.html',
    '/src/pages/signin.html',
    '/src/pages/signup.html',
    '/src/css/bootstrap.min.css',
    '/src/css/style.css',
    '/src/js/inbox.js',
    '/src/js/index.js',
    '/src/js/main.js',
    '/src/js/message.js',                          
    '/src/js/signin.js',                                                                    
    '/src/js/signup.js',
    '/src/images/loader.png',
    '/src/images/right-arrow.png',
    '/src/images/pexels-photo.jpg',                                                                                                                                         
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== cacheName) {
            if(key === 'static'){
              console.log(key,"don't need to remove");
            }else{
              console.log('Key is:',key)
              console.log('[ServiceWorker] Removing old cache', key);
              return caches.delete(key);
            }
          }
        }));
      })
    );
    return self.clients.claim();
  })


  self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
      e.respondWith(
        caches.match(e.request).then(function(response) {
          return response || fetch(e.request);
        })
      );
  });









/***************************************************
****************************************************
****************************************************
****************************************************
****************************************************

*******Code responsible for Push notification*******

****************************************************
****************************************************
****************************************************
****************************************************
***************************************************/


// Listener for Push Notification
self.addEventListener('push', function (event) {
  console.log('Received a push message', event);
  var notification = event.data.json().notification
  var title = notification.title;
  var body = notification.body;
  var url = notification.click_action;
  var icon = '/src/images/192.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      data: url
    })
  );

});

// on Notification Click do whatever you want...
self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification);
  event.notification.close();
  clients.openWindow(event.notification.data);
});