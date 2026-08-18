    // Randomizer — cycles through preview kiwis
    // Put PNGs at ./img/preview/1.png, 2.png, ... etc.
    const TOTAL_PREVIEWS = 20; // change to however many you drop into img/preview/

    // Sample traits pool (for demo — you can wire this to real metadata later)
    const bodies = ["Brown", "Gold", "Red", "Blue", "Alien Green", "Zombie", "Robot", "Mummy"];
    const eyes = ["Normal", "Laser Red", "Laser Blue", "Sleepy", "Angry", "Dead X", "Star", "Heart", "Red Glow", "Sparkle", "Cyclops", "Alien"];
    const hats = ["Crown", "Santa", "Top Hat", "Cowboy", "Cap", "Beanie", "Ninja Band", "Halo", "Wizard", "Party", "Royal Crown", "Devil Horns", "Viking", "Afro", "Snapback"];
    const accs = ["Gold Chain", "Bow Tie", "Necktie", "Scarf", "Bandana", "Cape", "Spike Collar", "Medal", "Pearl Necklace", "Diamond Pendant", "Suspenders", "Dollar Chain", "Pink Scarf", "Apron", "Backpack"];

    const rand = arr => arr[Math.floor(Math.random() * arr.length)];
    const pad = n => String(n).padStart(3, '0');

    function roll() {
      const screen = document.getElementById('randScreen');
      const img = document.getElementById('randImg');
      const idEl = document.getElementById('randId');
      const traitsEl = document.getElementById('randTraits');

      screen.classList.add('rolling');
      let ticks = 0;
      const maxTicks = 10;
      const interval = setInterval(() => {
        const id = Math.floor(Math.random() * TOTAL_PREVIEWS) + 1;
        img.src = `img/preview/${id}.png`;
        ticks++;
        if (ticks >= maxTicks) {
          clearInterval(interval);
          screen.classList.remove('rolling');
          const finalId = Math.floor(Math.random() * 555) + 1;
          const previewId = ((finalId - 1) % TOTAL_PREVIEWS) + 1;
          img.src = `img/preview/${previewId}.png`;
          idEl.textContent = '#' + pad(finalId);
          traitsEl.innerHTML = `
            <div class="rand-trait"><strong>BODY</strong>${rand(bodies)}</div>
            <div class="rand-trait"><strong>EYE</strong>${rand(eyes)}</div>
            <div class="rand-trait"><strong>HAT</strong>${rand(hats)}</div>
            <div class="rand-trait"><strong>ACCESSORY</strong>${rand(accs)}</div>
          `;
        }
      }, 80);
    }

    document.getElementById('rollBtn').addEventListener('click', roll);

    // Initial roll on page load
    window.addEventListener('load', () => setTimeout(roll, 500));

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

      // Success — in production, POST to your backend / Google Form / Formspree here
      wlSubmit.disabled = true;
      wlSubmit.textContent = 'SUBMITTING...';
      setTimeout(() => {
        wlMsg.textContent = '✓ YOU\'RE ON THE LIST. WELCOME TO THE FLOCK.';
        wlMsg.className = 'wl-msg success';
        wlSubmit.textContent = 'APPLIED ✓';
        wlForm.reset();
        // NOTE: replace the setTimeout block with a real fetch() to your endpoint:
        // fetch('YOUR_ENDPOINT', {method:'POST', body: JSON.stringify({twitter, wallet})})
      }, 800);
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
