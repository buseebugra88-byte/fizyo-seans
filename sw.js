// Fizyo Seans — çevrimdışı çalışma (service worker)
// Sayfalar değişince C'deki sürümü bir artır; eski önbellek kendiliğinden silinir.
const C='fizyo-seans-v2';
const YEREL=["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon.svg", "./apple-touch-icon.png"];
const CDN=[];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all([
  ...YEREL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})),
  ...CDN.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{}))
])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(C.replace(/-v\d+$/,'-'))&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    if(!u.pathname.startsWith(new URL('./',self.registration.scope).pathname))return; // başka depolara karışma
    // Önce internetten en güncelini al; olmazsa önbellekteki kopyayı aç.
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match(YEREL[0]):undefined)).then(m=>m||Response.error())));return}
  if(/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})))}
});
