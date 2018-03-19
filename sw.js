var CACHE_VERSION = null;
var Curr_CACHES = null;
var urlsToCache = null;

// 处理消息
self.addEventListener('message', function (event) {
  if (event.data) {
    console.log("------>port2 service worker接收到主线程发送的版本号: " + event.data.verNum);
    
    //初始化当前版本号
    CACHE_VERSION = event.data.verNum;
    Curr_CACHES = {
        ver: CACHE_VERSION
    };
    urlsToCache = "/" + CACHE_VERSION;


    console.log("sw 设置当前缓存版本号: " + Curr_CACHES.ver);
    event.ports[0].postMessage({
              msg: urlsToCache
            });

  // 删除所有不在Curr_CACHES内的缓存
  if (Curr_CACHES) {
      var expectedCacheNames = Object.keys(Curr_CACHES).map(function(key) {
        return Curr_CACHES[key];
      });

      event.waitUntil(
        caches.keys().then(function(cacheNames) {
          return Promise.all(
            cacheNames.map(function(cacheName) {
              if (expectedCacheNames.indexOf(cacheName) === -1) {
                //如果此缓存名称不存在于“预期”缓存名称的数组中，则将其删除
                console.log('删除过期缓存: ', cacheName);
                caches.delete(cacheName);
                // clients.claim()可以改变"在安装SW之后，需要刷新页面才能有效果"这一默认行为
                self.clients.claim();
              }
            })
          );
        })
      );
    }
  }
});

//安装完成后触发
self.addEventListener('install', function(event) {

      //让新SW踢掉旧的，然后当它变为waiting状态时立即激活--sw.js自更新 [重要-不能删]
      self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('sw activate');  
});

self.addEventListener('fetch', function(event) {
  console.log('fetch caches----------------------');

  if (!urlsToCache||event.request.url.indexOf(urlsToCache)==-1) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        //在缓存中有匹配的资源->直接返回
        if (response) {
          return response;
        }

        //否则返回默认的网络请求
        //因为请求和响应流只能被读取一次。为了给浏览器返回响应以及把它缓存起来，需要克隆一份
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            var responseToCache = response.clone();

            //新加入缓存
            if(Curr_CACHES && Curr_CACHES.ver){
              caches.open(Curr_CACHES.ver)
              .then(function(cache) {
                //资源是从event.request抓取的，它的响应会被response.clone()克隆一份然后被加入缓存
                //原始的会返回给浏览器，克隆的会发送到缓存中
                //cache.put() 被用来把这些资源加入缓存中
                cache.put(event.request, responseToCache);
              });
            }

            return response;
          }
        );
      })
    );
})