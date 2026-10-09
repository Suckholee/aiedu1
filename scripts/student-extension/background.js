const FEED = 'https://aiedu1.vercel.app/api/blog-auto/public-feed';
async function refreshFeed() {
  try { const r=await fetch(FEED,{cache:'no-store'});if(!r.ok)return;const data=await r.json();if(data.success&&Array.isArray(data.posts))await chrome.storage.local.set({public_feed_posts:data.posts,public_feed_updated:Date.now()}); } catch {}
}
chrome.runtime.onInstalled.addListener(()=>{chrome.alarms.create('public-feed',{periodInMinutes:1});refreshFeed();});
chrome.runtime.onStartup.addListener(()=>{chrome.alarms.create('public-feed',{periodInMinutes:1});refreshFeed();});
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='public-feed')refreshFeed();});
