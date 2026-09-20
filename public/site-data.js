async function loadKhanProducts(){
 try{
  const d=await fetch("/api/site").then(r=>r.json());
  const p=(d.products||[])[0]; if(!p)return;
  const img=document.querySelector(".product-image");
  if(p.image) img.style.backgroundImage=`linear-gradient(145deg,#cdbb99aa,#63705e99),url("${p.image}")`;
  document.querySelector(".product-index").textContent="01 / "+(p.name||"SIGNATURE").toUpperCase();
  document.querySelector(".product-info h3").innerHTML=`${escK(p.name||"Fresh Dahi")}<br><i>KHAN दही</i>`;
  const box=document.getElementById("publicVariants");
  box.innerHTML=(p.variants||[]).map(v=>`<div class="public-price"><div><b>${escK(v.label||v.size)}</b><small>${escK(v.size||"")}</small></div><div><del>₹${Number(v.price||0).toLocaleString("en-IN")}</del><strong>₹${Number(v.offerPrice||0).toLocaleString("en-IN")}</strong></div></div>`).join("");
 }catch(e){}
}
function escK(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
loadKhanProducts();