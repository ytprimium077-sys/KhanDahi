let KHAN_DATA=null;
let selectedPublic={};
async function loadKhanProducts(){
 try{const d=await fetch('/api/site',{cache:'no-store'}).then(r=>r.json());KHAN_DATA=d;renderPublicProducts(d.products||[])}
 catch(e){const box=document.getElementById('publicProducts');if(box)box.innerHTML='<div class="catalog-empty">Product details are being prepared.</div>'}
}
function renderPublicProducts(products){
 const box=document.getElementById('publicProducts');if(!box)return;
 box.innerHTML=products.map((p,pi)=>{
   const variants=p.variants||[]; const vi=selectedPublic[pi]??0; const v=variants[vi]||variants[0]||{}; const image=v.image||p.image||'/assets/hero-poster.png';
   return `<article class="catalog-card" data-product="${pi}">
    <div class="catalog-visual"><img id="productImage-${pi}" src="${escK(image)}" alt="${escK(p.name||'KHAN Dahi')}" loading="lazy"><span class="catalog-number">${String(pi+1).padStart(2,'0')}</span><div class="visual-caption"><b id="visualOption-${pi}">${escK(v.label||'Single')}</b><span id="visualSize-${pi}">${escK(v.size||'')}</span></div></div>
    <div class="catalog-info"><span class="catalog-kicker">KHAN दही · ${(escK(p.subtitle||'FRESH')).toUpperCase()}</span><h3>${escK(p.name||'Fresh Dahi')}</h3><p>${escK(p.subtitle||'Thick · Creamy · Naturally set')}</p>
      <div class="option-chips">${variants.map((x,i)=>`<button type="button" class="option-chip ${i===vi?'selected':''}" onclick="selectPublicOption(${pi},${i})"><span>${escK(x.label||x.size||'Option')}</span><small>${escK(x.size||'')}</small></button>`).join('')}</div>
      <div class="price-pop" id="pricePop-${pi}"><div><span id="priceLabel-${pi}">${escK(v.label||'Single')}</span><small id="priceSize-${pi}">${escK(v.size||'')}</small></div><div class="price-values"><del id="mainPrice-${pi}"></del><strong id="offerPrice-${pi}">${formatPrice(v)}</strong></div><span class="save-pill small" id="saving-${pi}"></span></div>
    </div>
   </article>`
 }).join('')||'<div class="catalog-empty">No products added yet.</div>';
 products.forEach((p,pi)=>updatePublicOptionUI(pi,selectedPublic[pi]??0));
}
function selectPublicOption(pi,vi){selectedPublic[pi]=vi;updatePublicOptionUI(pi,vi);const card=document.querySelector(`[data-product="${pi}"]`);if(card){card.classList.remove('option-flash');void card.offsetWidth;card.classList.add('option-flash')}}
function updatePublicOptionUI(pi,vi){const p=KHAN_DATA?.products?.[pi];if(!p)return;const v=(p.variants||[])[vi]||p.variants?.[0];if(!v)return;const image=v.image||p.image||'/assets/hero-poster.png';const img=document.getElementById(`productImage-${pi}`);if(img){img.style.opacity='.15';setTimeout(()=>{img.src=image;img.style.opacity='1'},120)};const vo=document.getElementById(`visualOption-${pi}`);const vs=document.getElementById(`visualSize-${pi}`);if(vo)vo.textContent=v.label||'Option';if(vs)vs.textContent=v.size||'';document.querySelectorAll(`[data-product="${pi}"] .option-chip`).forEach((b,i)=>b.classList.toggle('selected',i===vi));const pp=document.getElementById(`pricePop-${pi}`);if(pp){document.getElementById(`priceLabel-${pi}`).textContent=v.label||'Option';document.getElementById(`priceSize-${pi}`).textContent=v.size||'';const price=Number(v.price)||0,offer=Number(v.offerPrice)||0,has=offer>0&&offer<price;document.getElementById(`mainPrice-${pi}`).textContent=has?`₹${price.toLocaleString('en-IN')}`:'';document.getElementById(`offerPrice-${pi}`).textContent=`₹${(has?offer:price).toLocaleString('en-IN')}`;const save=document.getElementById(`saving-${pi}`);save.textContent=has?`Save ₹${(price-offer).toLocaleString('en-IN')}`:'';save.style.display=has?'inline-flex':'none';pp.classList.remove('price-flash');void pp.offsetWidth;pp.classList.add('price-flash')}}
function formatPrice(v){const price=Number(v.price)||0,offer=Number(v.offerPrice)||0;return `₹${(offer>0&&offer<price?offer:price).toLocaleString('en-IN')}`}
function escK(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
loadKhanProducts();
