
function normalizePhone(input, defaultCountry='91'){
  let digits = String(input||'').replace(/\D/g,'');
  if(!digits) return '';
  digits = digits.replace(/^0+/, '');
  if(digits.length === 10) digits = defaultCountry + digits;
  return digits;
}
async function loadSettings(){
  try{
    const ts = Date.now();
    const res = await fetch(`assets/settings.json?v=${ts}`, { cache: 'no-store' });
    if(!res.ok) throw new Error('Failed to load settings.json');
    const data = await res.json();
    const biz = data.business || {};
    const services = data.services || [];
    const cityEl = document.getElementById('cityText');
    const hoursEl = document.getElementById('hoursText');
    if(cityEl) cityEl.textContent = [biz.city, biz.areas].filter(Boolean).join(' — ') || '—';
    if(hoursEl) hoursEl.textContent = biz.hours || '—';
    const form = document.getElementById('bookingForm');
    if(form){
      if(biz.phone) form.dataset.whatsapp = biz.phone;
      if(biz.email) form.dataset.email = biz.email;
    }
    const igLink = document.getElementById('igLink');
    const igLink2 = document.getElementById('igLink2');
    if(igLink && biz.instagram) igLink.href = biz.instagram;
    if(igLink2 && biz.instagram) igLink2.href = biz.instagram;
    const grid = document.getElementById('servicesGrid');
    if(grid){
      grid.innerHTML = '';
      services.forEach(s => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-6 card-hover';
        card.innerHTML = `
          <h3 class="serif text-2xl font-bold">${s.name || 'Service'}</h3>
          ${s.desc ? `<p class="mt-2 text-gray-600">${s.desc}</p>` : ''}
          ${s.price ? `<div class="mt-4 text-3xl font-bold">${s.price}</div>` : ''}
        `;
        grid.appendChild(card);
      });
    }
  }catch(e){
    console.log('Settings load error:', e);
  }
}
const form = document.getElementById('bookingForm');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const date = form.date.value;
    const time = form.time.value;
    const service = form.service.value;
    const notes = form.notes.value.trim();
    const proPhoneRaw = form.dataset.whatsapp || '';
    const proPhone = normalizePhone(proPhoneRaw, '91');
    const msg = encodeURIComponent(`Hi! I’d like to book:\nName: ${name}\nPhone: ${phone}\nService: ${service}\nWhen: ${date} at ${time}\nNotes: ${notes}`);
    if(proPhone){
      const wa = `https://wa.me/${proPhone}?text=${msg}`;
      window.open(wa, '_blank');
    }else{
      alert('WhatsApp number is not set. Please update assets/settings.json');
    }
    setTimeout(()=>{
      if(document.hasFocus()){
        const mail = (form.dataset.email || 'hello@example.com').trim();
        window.location.href = `mailto:${mail}?subject=Booking%20Request&body=${msg}`;
      }
    }, 600);
  });
}
const IG_USER = localStorage.getItem('INSTAGRAM_USER_ID');
const IG_TOKEN = localStorage.getItem('INSTAGRAM_TOKEN');
async function loadInstagram(){
  const grid = document.getElementById('instaGrid');
  const notice = document.getElementById('igNotice');
  try{
    if(!IG_USER || !IG_TOKEN){
      if(notice) notice.classList.remove('hidden');
      return;
    }
    const url = `https://graph.instagram.com/${IG_USER}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${IG_TOKEN}&limit=12`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Instagram API error');
    const data = await res.json();
    const items = data.data || [];
    grid.innerHTML = '';
    items.forEach(item=>{
      const isVideo = item.media_type === 'VIDEO';
      const src = isVideo ? (item.thumbnail_url || item.media_url) : item.media_url;
      const card = document.createElement('div');
      card.className = 'insta-card card-hover';
      card.innerHTML = `<img loading="lazy" src="${src}" alt=""><a href="${item.permalink}" target="_blank" rel="noopener"></a>`;
      grid.appendChild(card);
    });
  }catch(e){
    console.log('Instagram load failed:', e);
  }
}
document.getElementById('year').textContent = new Date().getFullYear();
loadSettings();
loadInstagram();
