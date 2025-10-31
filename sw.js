/*
 * Service Worker：缓存与离线支持（SWR 策略 + 离线回退）
 */

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';
// 允许被 SW 处理的域名白名单
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  "huangxuan.me",
  "yanshuo.io",
  "cdnjs.cloudflare.com"
]


// 标准化 URL：统一协议 + 加缓存破坏参数，避免陈旧缓存
const getFixedUrl = (req) => {
  var now = Date.now();
  url = new URL(req.url)

  // 1. fixed http URL
  // Just keep syncing with location.protocol 
  // fetch(httpURL) belongs to active mixed content. 
  // And fetch(httpRequest) is not supported yet.
  url.protocol = self.location.protocol

  // 2. add query for caching-busting.
  // Github Pages served with Cache-Control: max-age=600
  // max-age on mutable content is error-prone, with SW life of bugs can even extend.
  // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
  // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
  url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  return url.href
}

// The Util Function to detect and polyfill req.mode="navigate"
// request.mode of 'navigate' is unfortunately not supported in Chrome
// versions older than 49, so we need to include a less precise fallback,
// which checks for a GET request with an Accept: text/html header.
const isNavigationReq = (req) => (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept').includes('text/html')))

// 是否为带扩展名的请求（多为静态资源）
// 说明：URL 里不带点不等于“不是静态资源”，这里只做粗略判断
const endWithExtension = (req) => Boolean(new URL(req.url).pathname.match(/\.\w+$/))

// Redirect in SW manually fixed github pages arbitray 404s on things?blah 
// what we want:
//    repo?blah -> !(gh 404) -> sw 302 -> repo/?blah 
//    .ext?blah -> !(sw 302 -> .ext/?blah -> gh 404) -> .ext?blah 
// If It's a navigation req and it's url.pathname isn't end with '/' or '.ext'
// it should be a dir/repo request and need to be fixed (a.k.a be redirected)
// Tracking https://twitter.com/Huxpro/status/798816417097224193
const shouldRedirect = (req) => (isNavigationReq(req) && new URL(req.url).pathname.substr(-1) !== "/" && !endWithExtension(req))

// The Util Function to get redirect URL
// `${url}/` would mis-add "/" in the end of query, so we use URL object.
// P.P.S. Always trust url.pathname instead of the whole url string.
const getRedirectUrl = (req) => {
  url = new URL(req.url)
  url.pathname += "/"
  return url.href
}

// 安装：预缓存离线页
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(PRECACHE).then(cache => {
      return cache.add('offline.html')
      .then(self.skipWaiting())
      .catch(err => console.log(err))
    })
  )
});


// 激活：立即接管控制权
self.addEventListener('activate',  event => {
  // console.log('service worker activated.')
  event.waitUntil(self.clients.claim());
});


// 抓取：优先网络，失败回退缓存，最终离线页
self.addEventListener('fetch', event => {
  // logs for debugging
  // console.log(`fetch ${event.request.url}`)
  //console.log(` - type: ${event.request.type}; destination: ${event.request.destination}`)
  //console.log(` - mode: ${event.request.mode}, accept: ${event.request.headers.get('accept')}`)

  // Skip some of cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
    
    // Redirect in SW manually fixed github pages 404s on repo?blah 
    if(shouldRedirect(event.request)){
      event.respondWith(Response.redirect(getRedirectUrl(event.request)))
      return;
    }

    // Stale-while-revalidate 
    // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
    // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
    const cached = caches.match(event.request);
    const fixedUrl = getFixedUrl(event.request);
    const fetched = fetch(fixedUrl, {cache: "no-store"});
    const fetchedCopy = fetched.then(resp => resp.clone());

    // Call respondWith() with whatever we get first.
    // If the fetch fails (e.g disconnected), wait for the cache.
    // If there’s nothing in cache, wait for the fetch. 
    // If neither yields a response, return offline pages.
    event.respondWith(
      Promise.race([fetched.catch(_ => cached), cached])
        .then(resp => resp || fetched)
        .catch(_ => caches.match('offline.html'))
    );

    // Update the cache with the version we fetched (only for ok status)
    event.waitUntil(
      Promise.all([fetchedCopy, caches.open(RUNTIME)])
        .then(([response, cache]) => response.ok && cache.put(event.request, response))
        .catch(_ => {/* eat any errors */})
    );
  }
});
