let KHAN_DATA=null;
let selectedPublic={};
async function loadKhanProducts(){
 try{const d=await fetch('/api/site',{cache:'no-store'}).then(r=>r.json());KHAN_DATA=d;applyPublicSettings(d.settings);renderPublicProducts(d.products||[]);renderPublicReviews(d.reviews||[])}
 catch(e){const box=document.getElementById('publicProducts');if(box)box.innerHTML='<div class="catalog-empty">Product details are being prepared.</div>'}
}
function applyPublicSettings(settings){
 const s=settings||{};
 const phone=document.getElementById('publicPhone');
 const address=document.getElementById('publicAddress');
 const email=document.getElementById('publicEmail');
 if(phone){const value=s.phone||'';phone.textContent=value||'Contact us';phone.href=value?'tel:'+value.replace(/[^+\d]/g,''): '#contact';}
 if(address)address.textContent=s.address||'Freshly made with care.';
 if(email){email.textContent=s.email||'';email.style.display=s.email?'block':'none';}
 const title=document.querySelector('title'); if(title && s.brand) title.textContent=(s.brand+' '+(s.hindi||'दही')+' | Pure by Nature');
 document.querySelectorAll('.logo,.loader-brand,.signature span').forEach(el=>{if(s.brand){const first=el.querySelector('span');if(first)first.textContent=s.brand;else if(el.classList.contains('logo')||el.classList.contains('loader-brand'))el.childNodes[0].textContent=s.brand;}});
 document.querySelectorAll('.logo b,.loader-brand b,.signature b').forEach(el=>{if(s.hindi)el.textContent=s.hindi});
 const tagline=document.querySelector('.hero-tag'); if(tagline && s.tagline){const parts=String(s.tagline).split(/\.\s*/).filter(Boolean);tagline.innerHTML=parts.length>1?escK(parts[0])+'.<br><i>'+escK(parts.slice(1).join('. '))+(String(s.tagline).endsWith('.')?'':'.')+'</i>':escK(s.tagline);}
 const video=document.querySelector('.hero-video'); if(video && s.heroVideo){const source=video.querySelector('source'); if(source && source.getAttribute('src')!==s.heroVideo){source.src=s.heroVideo; video.load();}}
 const poster=document.querySelector('.hero-poster'); if(poster && s.heroImage) poster.style.backgroundImage=`url('${String(s.heroImage).replace(/'/g,"\\'")}')`;
 const videoPoster=document.querySelector('.hero-video'); if(videoPoster && s.heroImage) videoPoster.setAttribute('poster',s.heroImage);
}
function renderPublicReviews(reviews){
 const box=document.getElementById('publicReviews'); if(!box)return;
 const items=(reviews||[]).slice().reverse();
 if(!items.length){box.innerHTML='<div class="reviews-empty glass-review">Reviews will appear here after the owner adds them.</div>';return;}
 box.innerHTML=items.map((r,i)=>{const rating=Math.max(1,Math.min(5,Number(r.rating)||5));return `<button type="button" class="review-card" onclick="openReviewModal(${i})"><div class="review-stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div><p>“${escK(r.text)}”</p><div class="review-author"><span>${escK(r.name)}</span><small>Verified customer</small></div></button>`}).join('');
 window.__publicReviews=items;
}
function openReviewModal(i){const r=(window.__publicReviews||[])[i];if(!r)return;const m=document.getElementById('reviewModal');if(!m)return;document.getElementById('modalReviewName').textContent=r.name||'Customer';document.getElementById('modalReviewText').textContent=r.text||'';const rating=Math.max(1,Math.min(5,Number(r.rating)||5));document.getElementById('modalReviewStars').textContent='★'.repeat(rating)+'☆'.repeat(5-rating);m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('review-modal-open')}
function closeReviewModal(){const m=document.getElementById('reviewModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.classList.remove('review-modal-open')}}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeReviewModal()});
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
