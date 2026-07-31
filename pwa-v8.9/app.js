(async function(){
 const pages=[...document.querySelectorAll('.page')],tabs=[...document.querySelectorAll('[data-page]')];
 function show(id){pages.forEach(x=>x.hidden=x.id!==id);tabs.forEach(x=>x.classList.toggle('active',x.dataset.page===id));history.replaceState(null,'','#'+id);}
 tabs.forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
 document.querySelector('#source-close').addEventListener('click',()=>document.querySelector('#source-dialog').close());
 document.querySelector('#refresh').addEventListener('click',async()=>{await load();});
 async function load(){document.body.classList.add('loading');const s=await window.PIMStore.init();const status=document.querySelector('#data-status');status.textContent=s.message;status.dataset.level=s.cacheLevel|| (s.error?'danger':'ok');document.querySelector('#preview-banner').hidden=s.mode!=='preview';if(s.payload){window.PIMRenderers.renderAll();document.querySelector('#fatal').hidden=true;}else{document.querySelector('#fatal').hidden=false;document.querySelector('#fatal').textContent=s.message;}document.body.classList.remove('loading');}
 show(location.hash.slice(1)&&window.PIM_CONFIG.PAGES.includes(location.hash.slice(1))?location.hash.slice(1):'dashboard');await load();
 if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js?v=8.9').catch(console.warn);
})();
