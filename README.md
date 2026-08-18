# 🥝 KIWI — 555 Chunky Pixel Birds

The official website for the KIWI collection — 555 hand-crafted, flightless pixel birds living on-chain.

**Every other bird flies. Kiwis don't.**

## Structure

```
kiwi-site/
├── index.html        # main page
├── css/
│   └── style.css     # all styles
├── js/
│   └── script.js     # nav toggle, randomizer, waitlist form
├── img/
│   ├── hero.png      # hero kiwi
│   ├── og.png        # social share image
│   └── preview/      # 20 sample kiwis for the randomizer
├── vercel.json       # deploy config
└── README.md
```

## Local Preview

Open `index.html` directly in a browser, or run a local server:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com), click **New Project** and import the repo.
3. Framework preset: **Other** (it's a static site — no build step).
4. Click **Deploy**. Done.

Every push to the repo auto-redeploys.

## To-Do Before Launch

- [ ] Replace `#` links (OpenSea, X/Twitter) in `index.html` footer & nav with real URLs.
- [ ] Wire the waitlist form in `js/script.js` to a real endpoint (Formspree / Google Sheets).
- [ ] Swap the CSS logo box for a GIF logo if desired (`.nav-logo`).
- [ ] Update the token link from "TOKEN COMINGSOON" once live.

## Sections

- **Hero** — intro + CTA
- **Stats** — collection breakdown
- **About** — why KIWI
- **Story** — the lore
- **Roll** — interactive trait randomizer
- **Roadmap** — what's next
- **Waitlist** — apply form (X handle + EVM address)
