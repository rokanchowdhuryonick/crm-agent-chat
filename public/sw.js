// public/sw.js
self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    return self.clients.claim();
  });
  
  const IMAGE_CACHE = 'chat-images-v1';
  
  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Only cache requests for images
    if (event.request.method === 'GET' && 
        url.pathname.startsWith('/public-files/chat_attachments/images/')) {
      event.respondWith(
        caches.open(IMAGE_CACHE).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            // Return cached response if we have it
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Otherwise fetch from network and cache
            return fetch(event.request).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
        })
      );
    }
  });