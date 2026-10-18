# Astrea website

Static site. No build step, no framework, no dependencies. Plain HTML, one
stylesheet, two small scripts. Push it to GitHub, point Vercel at the repo,
done.

## Pages

| URL | File | What it says |
|---|---|---|
| `/` | `index.html` | The problem, the reasoning/computation split, how the forecast works in time, the two engines |
| `/platform` | `platform.html` | Pipeline, the agent layer, governance and audit trail |
| `/validation` | `validation.html` | The Danish day-ahead record, the German-coupling diagnosis, what comes next |
| `/company` | `company.html` | Leadership, the Nuvve relationship, contact |
| `/demo` | `demo/index.html` | Trader demo — interactive DK1/DK2 chart, day table, driver panel |

The demo is reachable from the **Demo** dropdown in the main nav on every page,
which is also where a second demo would go.

## Scope

The site covers product and company only. There are no raise terms, no
valuation, no cap, no discount, no ownership table and no financial plan
anywhere in it. That material stays in the deck, which is marked confidential
and distributed to named recipients. Keeping it off a public URL avoids raising
general-solicitation questions against the Reg D exemption. If you later want a
password-gated investor page, that is a separate decision worth running past
securities counsel first.

## Deploy

```bash
cd astrea-site
git init
git add -A
git commit -m "Astrea site"
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

Then in Vercel: **Add New → Project → import the repo**. Framework preset
**Other**, build command empty, output directory empty (root). Deploy.

`vercel.json` sets `cleanUrls: true`, which is what makes `/platform` serve
`platform.html` and `/demo` serve `demo/index.html`. It also sets a long cache
on `/assets/*` and three standard security headers. Keep the file at the repo
root.

### Local preview

```bash
cd astrea-site
python3 -m http.server 8000
```

Clean URLs do not work under `python -m http.server`, so locally use
`/platform.html` rather than `/platform`. On Vercel both forms work.

## The trader demo

`demo/index.html` holds the markup. Everything else lives in two files:

- `assets/js/demo-data.js` — the data, and nothing else. One global object,
  `window.ASTREA_DEMO`: the day list, the German anchor series, and per-zone
  `cleared` / `forecast` / `mase`.
- `assets/js/demo.js` — the renderer. Draws the SVG chart, the four summary
  cards, the day table and the driver panel. It computes mean error, the
  out-of-sample mean and the signed bias from the arrays at load, so nothing
  on the page can drift out of step with the data.

To put the demo on live numbers, replace `demo-data.js` with an endpoint that
emits the same shape. Nothing else changes.

Current extract: 23 September – 6 October 2026, both Danish bidding zones,
daily-mean day-ahead prices in €/MWh, one-day-ahead forecasts issued before gate
closure on forecast-weather inputs. Delivery days from 29 September are out of
sample. Figures on the page reconcile with the accuracy review: DK1 mean error
€27.82 over fourteen days and €33.11 out of sample; DK2 €29.50 and €33.53.

Error throughout the site is **cleared minus forecast**, so a positive error
means the market came in above us. That convention is stated on the page and is
used in the chart, the table and the driver panel — do not mix it with the
reverse when you add to the site.

## Design system

Everything is in `assets/css/styles.css`, as custom properties on `:root`.
Change a token there and it propagates.

```
--navy    #0E2A47   headers, hero and footer grounds, primary text
--ground  #F7F6F2   page background
--gold    #9A7B2E   accent, text-safe weight
--gold-bright #C8A659  accent on navy
--teal    #2F7D6E   positive / forecast series
--rust    #A8503A   misses, flagged values
```

Type is Source Serif 4 for display, IBM Plex Sans for body, IBM Plex Mono for
figures, loaded from Google Fonts. All three have declared fallbacks, so the
page holds its layout if the font request is blocked.

## Before it goes live

- `hello@astrea.ai` on `/company` is a placeholder. Swap in the real inbox.
- Add `astrea.ai` (or whichever domain) in Vercel → Settings → Domains.
- The leadership bios and the Nuvve ticker line are taken from the deck. Give
  them a read before the site is public.
- Every number on `/validation` and `/demo` traces to the 6 October accuracy
  review. When that record is extended, update `demo-data.js` and the three
  stat cards on `/validation` together.
