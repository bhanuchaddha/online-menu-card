const CACHE_NAME = 'menucard-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip cross-origin requests and non-GET requests
  if (!request.url.startsWith(self.location.origin) || request.method !== 'GET') {
    return
  }

  // Handle API requests with network-first strategy
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone()
          
          // Only cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
          }
          
          return response
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response
              }
              
              // If not in cache, return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/offline')
              }
              
              throw new Error('Resource not available offline')
            })
        })
    )
    return
  }

  // Handle navigation requests with cache-first strategy for better performance
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            // Check if we have a newer version in the background
            fetch(request)
              .then((fetchResponse) => {
                if (fetchResponse.status === 200) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, fetchResponse.clone()))
                }
              })
              .catch(() => {}) // Ignore network errors in background
            
            return response
          }
          
          // Not in cache, try network
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone))
              }
              return fetchResponse
            })
            .catch(() => {
              // Network failed, return offline page
              return caches.match('/offline')
            })
        })
    )
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response
        }
        
        return fetch(request)
          .then((fetchResponse) => {
            if (fetchResponse.status === 200 && request.url.includes('.')) {
              const responseClone = fetchResponse.clone()
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, responseClone))
            }
            return fetchResponse
          })
      })
  )
})

// Background sync for menu uploads (when back online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'menu-upload') {
    event.waitUntil(
      // Handle deferred menu uploads when back online
      handleDeferredMenuUploads()
    )
  }
})

async function handleDeferredMenuUploads() {
  // This would handle any menu uploads that were queued while offline
  // For now, we'll just clear any pending uploads
  const cacheNames = await caches.keys()
  const pendingCache = await caches.open('menucard-pending')
  const requests = await pendingCache.keys()
  
  for (const request of requests) {
    try {
      await fetch(request)
      await pendingCache.delete(request)
    } catch (error) {
      console.log('Upload still failing:', error)
    }
  }
}

// Push notifications (for future features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const clickedAction = event.action
  const notificationData = event.notification.data
  
  let url = '/'
  if (clickedAction === 'view_menu') {
    url = `/menu/${notificationData.slug}`
  } else if (clickedAction === 'dashboard') {
    url = '/dashboard'
  }
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
