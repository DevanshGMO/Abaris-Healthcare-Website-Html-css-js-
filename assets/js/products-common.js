function slugify(str){
  return String(str||'').toLowerCase()
    .replace(/[%/.,()]+/g,' ')
    .replace(/\s+/g,' ').trim().replace(/\s/g,'-');
}

async function loadProducts(){
  if (window.PRODUCTS) return window.PRODUCTS;           // if you later switch to products.js
  const res = await fetch('assets/data/products.json', {cache:'no-store'});
  if (!res.ok) throw new Error('products.json not found');
  const rows = await res.json();
  return rows.map(r => {
    const name = (r.product_name||'').trim();
    const strength = (r.strength||'').trim();
    const pack = (r.pack||'').trim();
    const category = (r.category||'').trim();
    const dosage_form =
      /large volume/i.test(category) ? 'LVP' :
      /small volume|svp/i.test(category) ? 'SVP' :
      /oral/i.test(category) ? 'Oral' :
      /tablet/i.test(category) ? 'Tablet' : '';
    const slug = slugify(`${name} ${strength} ${pack}`);
    return {...r, name, strength, pack, category, dosage_form, slug};
  });
}

function qp(name){ return new URL(location.href).searchParams.get(name); }
function setQP(obj){
  const url = new URL(location.href);
  for (const [k,v] of Object.entries(obj)){
    if (v==null || v==='') url.searchParams.delete(k); else url.searchParams.set(k,v);
  }
  history.replaceState({},'',url);
}
function htm(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content; }

