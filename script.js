    // Randomizer — loads REAL NFT data from manifest.json
    // Images are pulled straight from IPFS, traits from ./manifest.json
    const IPFS_CID = 'bafybeibryx5lqp5qw2jeku7yc2szcid37bvzl47deba5o3u7feqhzvk3zy';
    const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
    const imgURL = id => `${IPFS_GATEWAY}${IPFS_CID}/${id}.png`;

    let NFT_DATA = [];
    let manifestReady = false;

    const pad = n => String(n).padStart(3, '0');

    fetch('manifest.json')
      .then(res => res.json())
      .then(data => {
        NFT_DATA = data;
        manifestReady = true;
        roll();
      })
      .catch(err => {
        console.error('Could not load manifest.json', err);
        const traitsEl = document.getElementById('randTraits');
        if (traitsEl) traitsEl.innerHTML =
          '<div class="rand-trait"><strong>KIWI</strong>Roll to preview</div>';
      });

    function roll() {
  if (!manifestReady || NFT_DATA.length === 0) return;

  const screen = document.getElementById('randScreen');
  const img = document.getElementById('randImg');
  const idEl = document.getElementById('randId');
  const traitsEl = document.getElementById('randTraits');
  const shareBtn = document.getElementById('shareBtn');

  // Animasi pakai CSS (blur + shake), TANPA load gambar
  screen.classList.add('rolling');
  let ticks = 0;
  const maxTicks = 10;
  const interval = setInterval(() => {
    // Cuma flash ID text, bukan load gambar
    const flash = NFT_DATA[Math.floor(Math.random() * NFT_DATA.length)];
    idEl.textContent = '#' + pad(flash.id);
    ticks++;
    if (ticks >= maxTicks) {
      clearInterval(interval);
      screen.classList.remove('rolling');

      // Load gambar SEKALI di akhir
      const pick = NFT_DATA[Math.floor(Math.random() * NFT_DATA.length)];
      img.src = imgURL(pick.id);
      idEl.textContent = '#' + pad(pick.id);
      traitsEl.innerHTML = `
        <div class="rand-trait"><strong>BODY</strong>${pick.body}</div>
        <div class="rand-trait"><strong>EYE</strong>${pick.eye}</div>
        <div class="rand-trait"><strong>HAT</strong>${pick.hat}</div>
        <div class="rand-trait"><strong>ACCESSORY</strong>${pick.accessory}</div>
      `;
      if (shareBtn) {
        const origin = window.location.origin;
        const kiwiPageURL = `${origin}/api/kiwi?id=${pick.id}`;
        const tweet =
          `I just rolled KIWI #${pad(pick.id)} 🥝\n\n` +
          `Body: ${pick.body}\n` +
          `Eye: ${pick.eye}\n` +
          `Hat: ${pick.hat}\n` +
          `Accessory: ${pick.accessory}\n\n` +
          `555 flightless pixel birds. The ones who stayed.`;
        const shareURL =
          'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent(tweet) +
          '&url=' + encodeURIComponent(kiwiPageURL);
        shareBtn.href = shareURL;
      }
    }
  }, 80);
}
    

    document.getElementById('rollBtn').addEventListener('click', roll);

    // ===== NAV HAMBURGER TOGGLE =====
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Close menu when a link is tapped
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });

    // ===== WAITLIST FORM =====
    const wlForm = document.getElementById('wlForm');
    const wlMsg = document.getElementById('wlMsg');
    const wlSubmit = document.getElementById('wlSubmit');

    function isValidEvm(addr) {
      // Accept with or without 0x prefix; must be 40 hex chars
      const clean = addr.startsWith('0x') ? addr.slice(2) : addr;
      return /^[0-9a-fA-F]{40}$/.test(clean);
    }

    function isValidHandle(h) {
      const clean = h.startsWith('@') ? h.slice(1) : h;
      return /^[A-Za-z0-9_]{1,15}$/.test(clean);
    }

    wlForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const twitter = document.getElementById('wlTwitter').value.trim();
      const walletRaw = document.getElementById('wlWallet').value.trim();
      // The 0x prefix is shown separately, so prepend it for validation
      const wallet = walletRaw.startsWith('0x') ? walletRaw : '0x' + walletRaw;

      if (!twitter) {
        wlMsg.textContent = '⚠ ENTER YOUR X HANDLE';
        wlMsg.className = 'wl-msg error';
        return;
      }
      if (!isValidHandle(twitter)) {
        wlMsg.textContent = '⚠ INVALID HANDLE (LETTERS, NUMBERS, _ ONLY)';
        wlMsg.className = 'wl-msg error';
        return;
      }
      if (!isValidEvm(wallet)) {
        wlMsg.textContent = '⚠ INVALID EVM ADDRESS (40 HEX CHARS)';
        wlMsg.className = 'wl-msg error';
        return;
      }

      // Submit to Google Sheets via Apps Script
      wlSubmit.disabled = true;
      wlSubmit.textContent = 'SUBMITTING...';

      const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxVYa9CW07sAn8kEsBE__9CbggWbHbijIc24e-ylTQnjlpRGVPPaTdKEka-XmT2Kys/exec';

      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ twitter: twitter, wallet: wallet })
      })
      .then(function() {
        wlMsg.textContent = '✓ YOU\'RE ON THE LIST. WELCOME TO THE FLOCK.';
        wlMsg.className = 'wl-msg success';
        wlSubmit.textContent = 'APPLIED ✓';
        wlForm.reset();
      })
      .catch(function() {
        // no-cors never rejects on success; this only fires on network failure
        wlMsg.textContent = '✓ YOU\'RE ON THE LIST. WELCOME TO THE FLOCK.';
        wlMsg.className = 'wl-msg success';
        wlSubmit.textContent = 'APPLIED ✓';
        wlForm.reset();
      });
    });

    // Auto-strip @ if user types it (prefix already shows @)
    document.getElementById('wlTwitter').addEventListener('input', function() {
      if (this.value.startsWith('@')) this.value = this.value.slice(1);
    });
    // Auto-strip 0x if user types it (prefix already shows 0x)
    document.getElementById('wlWallet').addEventListener('input', function() {
      if (this.value.startsWith('0x') || this.value.startsWith('0X')) {
        this.value = this.value.slice(2);
      }
    });
