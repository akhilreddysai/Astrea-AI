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
| `/company` | `company.html` | Leadership, the two JV parents, contact |
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

### Two things went wrong, in order

**First (19 October): the files were not there.** The deployment served only
the four root HTML files — `assets/`, `demo/` and `vercel.json` never reached
Vercel. That is what happens when pages are dragged into the dashboard
individually or added to git one by one. Deploy the **whole folder**, not the
pages. This is fixed; the current deployment has everything.

**Second (20 October): browsers cached the 404.** While the site was broken,
`/assets/css/styles.css` returned a 404 — and the `/assets/(.*)` rule in
`vercel.json` stamped `max-age=31536000, immutable` on that 404 response. Any
browser that loaded the site during the broken window stored "this file does
not exist" for a year. The server was fixed; those browsers kept showing an
unstyled page.

Both are now handled:

- Every CSS, JS and icon link carries `?v=2`. A different URL is a different
  cache entry, so a poisoned cache is bypassed for everyone, not just people
  who know to hard-reload.
- `vercel.json` no longer sends a one-year immutable cache on assets. It sends
  `max-age=600, stale-while-revalidate=604800`: fast for repeat visits, but
  self-healing within ten minutes instead of a year.

**Bump the `?v=` number whenever you change the CSS or a JS file.** Filenames
here are not content-hashed, so the query string is what tells a returning
browser the file is new. It appears once in the shared head and script block —
search the five HTML files for `?v=2`.

### The reliable way

```bash
cd astrea-site
npx vercel --prod
```

The CLI uploads the directory as it stands, subfolders and dotless files
included, and prints the URL. Link it to the existing project when it asks, so
the domain stays the same.

### Or through GitHub

```bash
cd astrea-site          # the folder itself is the repo root
git init
git add -A
git status              # must list assets/, demo/ and vercel.json
git commit -m "Astrea site"
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```

Run `git status` before committing and confirm all three appear. In Vercel:
**Add New → Project → import the repo**, framework preset **Other**, build
command empty, output directory empty. If the repo has `astrea-site/` as a
subfolder rather than at its root, set **Root Directory** to `astrea-site` in
the project's Build and Deployment settings.

### Verify after deploying

Open these four URLs. All four must return content, not a 404 page:

```
https://<your-domain>/assets/css/styles.css      → CSS source
https://<your-domain>/assets/js/demo.js          → JS source
https://<your-domain>/demo                       → the trader demo
https://<your-domain>/validation.html            → should redirect to /validation
```

The last one is the vercel.json check: if it does not redirect, the config file
is missing and clean URLs are off.

`vercel.json` sets `cleanUrls: true`, which is what makes `/platform` serve
`platform.html` and `/demo` serve `demo/index.html`. It also sets a long cache
on `/assets/*` and three standard security headers. Keep the file at the
deployment root.

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
  modules, the day table and the driver panel. It computes mean error, the
  out-of-sample mean and the signed bias from the arrays at load, so nothing
  on the page can drift out of step with the data. Chart colors are declared
  once in the `C` object at the top and mirror the CSS tokens; the legend
  swatches in `demo/index.html` are the one place they are repeated.

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

The site is built as an instrument, not a brochure: white ground, hairline
grid, monospace labels, numbers set larger than the prose. Sections are
numbered channels with the index in the left gutter; modules are cells of a 1px
grid rather than floating cards. It is a single committed light theme — every
color is painted explicitly, so nothing inherits a ground from a host.

**The palette is the joint venture.** Green is Nuvve's, sampled from
nuvve.com. Navy and sky are CamerEye's, sampled from camereye.ai. The display
face is Nuvve's Montserrat; the body face is CamerEye's Source Sans. Pill
buttons come from both parents, who use them. Mono carries the data, which is
Astrea's own.

Everything is in `assets/css/styles.css`, as custom properties on `:root`.
Change a token there and it propagates.

```
--paper     #FFFFFF   page ground
--mist      #F5F7F2   alternating band (Nuvve off-white, nudged green)
--line      #DEE5E9   hairlines (the grid is made of these)
--ink       #0A436A   CamerEye navy — headlines, figures, table headers
--ink-2     #44607A   body copy
--muted     #5F7384   footnotes, mono labels
--green     #55732D   Nuvve dark green — the accent, 5.0:1 on white
--green-mid #759840   forecast series, module rules
--lime      #ABCA47   Nuvve lime — fills, the live dot, current-page mark
--sky       #9AD3E8   CamerEye sky — reasoning plane, out-of-sample band
--flag      #BF5A1E   semantic only — flagged miss, positive error
```

Green is the accent and carries no meaning on its own. Orange is semantic and
appears only on data. Keeping that split is what stops the page turning into a
Christmas tree as sections get added. Note the lightness discipline: `--green`
is the only green safe for small text, `--green-mid` is for lines and rules,
and `--lime` is decorative only — never put 12px type on it.

In the demo chart, navy is the market and green is us. That reads as the JV
without needing a caption.

Three patterns worth knowing before you edit the CSS. `.mod p`, `.slab p` and
`.seq-col p` set a body size, so a utility class on one of those paragraphs
(`.figure`, `.tag`, `.note`) must out-rank them — those overrides live in the
"specificity guards" block at the end of the file. Buttons and the zone toggle
are pills; modules, tables and panels are square — that contrast is deliberate.
And the selected-day readout on the demo is the one inverted panel on the site;
if you add a second, the first stops being a focal point.

## Claims discipline

The 16 October prep note lists claims that must not go in front of a buyer
until they are backed up. Two of them had been on this site and are now gone:

- "Proven on batteries operated by Nuvve in live wholesale and ancillary
  markets, not on a back-test alone" → replaced with *scored on Danish
  day-ahead data in both bidding zones, against the price that cleared, out of
  sample from 29 September. Asset-level validation on Nuvve batteries runs
  next.*
- "Astrea is validated on batteries Nuvve operates…" on `/company` → replaced
  with the two-parent module and a *What is shown today* block that states the
  record is Danish market data and that operated-asset validation is not
  claimed.

The site still says Nuvve **operates** batteries in live markets, which is true
of the parent and is framed as the route to asset-level validation rather than
as something Astrea has done.

Nothing on the site uses "proprietary engine", a spike-catching claim, or an
error-rate percentage without a horizon and a window. Keep it that way: any new
number needs its metric, its horizon and its out-of-sample window beside it.

## Open question: who the demo is for

The prep note is explicit that the buyer is the asset owner, not a trading
desk. The demo is currently titled **Trader demo** in the nav and on the page.
If the owner positioning holds, that label works against it, and the page
itself — forecast against cleared, driver behind each miss — is already an
owner's view rather than a desk's. Renaming it *Forecast record* or *Owner
view* is a two-line change in `demo/index.html` and the nav block of every
page; the `/demo` URL can stay.

## Before it goes live

- `hello@astrea.ai` on `/company` is a placeholder. Swap in the real inbox.
- Add `astrea.ai` (or whichever domain) in Vercel → Settings → Domains.
- The leadership bios are taken from the deck. Give them a read before the site
  is public.
- Confirm the joint-venture wording in the footer matches how the entity is
  actually described in filings.
- Every number on `/validation` and `/demo` traces to the 6 October accuracy
  review. When that record is extended, update `demo-data.js` and the three
  stat modules on `/validation` together.
