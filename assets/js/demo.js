/* Astrea trader demo — renderer.
   Reads window.ASTREA_DEMO (assets/js/demo-data.js) and draws the chart,
   the summary modules, the day table and the per-day driver panel.
   No build step, no dependencies. */

(function () {
  'use strict';

  var D = window.ASTREA_DEMO;
  if (!D) return;

  var NS = 'http://www.w3.org/2000/svg';
  var C = {
    cleared: '#0A436A',   // CamerEye navy — the market
    forecast: '#759840',  // Nuvve green — us
    band: '#F2F8FB',
    grid: '#E6ECF0',
    axis: '#C6D2D9',
    label: '#5F7384',
    up: '#55732D',
    down: '#BF5A1E'
  };

  var state = { zone: 'DK1', day: D.days.length - 1 };

  /* ---------- helpers ---------- */

  function eur(v, dp) {
    var d = dp === undefined ? 1 : dp;
    return '€' + Math.abs(v).toFixed(d);
  }
  function signed(v, dp) {
    var d = dp === undefined ? 1 : dp;
    return (v >= 0 ? '+' : '−') + '€' + Math.abs(v).toFixed(d);
  }
  function fmtDay(iso, long) {
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var ml = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
              'August', 'September', 'October', 'November', 'December'];
    var p = iso.split('-');
    var mi = parseInt(p[1], 10) - 1;
    var dd = parseInt(p[2], 10);
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      new Date(Date.UTC(+p[0], mi, dd)).getUTCDay()];
    return long ? (wd + ' ' + dd + ' ' + ml[mi]) : (wd + ' ' + dd + ' ' + m[mi]);
  }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function series() {
    var z = D.zones[state.zone];
    var err = z.cleared.map(function (c, i) { return c - z.forecast[i]; });
    var abs = err.map(Math.abs);
    var mean = function (a) {
      return a.reduce(function (s, x) { return s + x; }, 0) / a.length;
    };
    return {
      z: z, err: err,
      mae: mean(abs), maeOos: mean(abs.slice(D.oosFrom)), bias: mean(err)
    };
  }

  /* ---------- summary modules ---------- */

  function renderStats() {
    var s = series();
    var host = document.getElementById('demoStats');
    if (!host) return;
    host.textContent = '';

    var cards = [
      ['€', s.mae.toFixed(2), '', 'Mean error, 14 days', '',
       'Absolute error against the cleared price, averaged over every delivery day in the window.'],
      ['€', s.maeOos.toFixed(2), '', 'Mean error, out of sample', '',
       'The eight delivery days after the training cut, scored the same way.'],
      ['+€', s.bias.toFixed(1), '', 'Mean signed error', '',
       'Cleared minus forecast. Positive means the model ran below the market across the window.'],
      ['', s.z.mase.toFixed(2), '', 'MASE at D+1', 'tag-up',
       'Scaled against a seasonal-naive benchmark. Below 1.00 beats the benchmark.']
    ];

    cards.forEach(function (c) {
      var mod = el('div', { 'class': 'mod' });
      mod.appendChild(el('p', { 'class': 'figure' }, c[0] + c[1]));
      mod.appendChild(el('p', { 'class': 'tag ' + c[4] }, c[3]));
      mod.appendChild(el('p', {}, c[5]));
      host.appendChild(mod);
    });
  }

  /* ---------- chart ---------- */

  function renderChart() {
    var host = document.getElementById('chart');
    if (!host) return;
    var s = series();
    var n = D.days.length;

    // On a narrow container the SVG scales down, so the type has to scale up
    // in user units to stay legible. Two profiles rather than a continuum.
    var narrow = host.clientWidth && host.clientWidth < 640;
    var W = narrow ? 600 : 980;
    var H = narrow ? 430 : 400;
    var fs = narrow ? 17 : 11.5;
    var stride = narrow ? 3 : 2;
    var mL = narrow ? 54 : 52, mR = 14, mT = narrow ? 28 : 22;
    var mB = narrow ? 56 : 46;
    var iw = W - mL - mR, ih = H - mT - mB;

    var all = s.z.cleared.concat(s.z.forecast);
    var lo = Math.floor(Math.min.apply(null, all) / 25) * 25;
    var hi = Math.ceil(Math.max.apply(null, all) / 25) * 25;

    var x = function (i) { return mL + (iw * i) / (n - 1); };
    var y = function (v) { return mT + ih - ((v - lo) / (hi - lo)) * ih; };

    var g = svg('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      role: 'img',
      'aria-label': 'Astrea forecast against the cleared day-ahead price in ' +
        state.zone + ', ' + D.window
    });

    // out-of-sample band
    var bx = x(D.oosFrom) - iw / (n - 1) / 2;
    g.appendChild(svg('rect', {
      x: bx, y: mT, width: (W - mR) - bx, height: ih, fill: C.band
    }));
    var lbl = svg('text', {
      x: W - mR - 10, y: mT + fs + 4, fill: C.label, 'text-anchor': 'end',
      'font-family': 'IBM Plex Mono, monospace', 'font-size': String(fs),
      'letter-spacing': '1.6'
    });
    lbl.textContent = 'OUT OF SAMPLE';
    g.appendChild(lbl);

    // gridlines
    var step = (hi - lo) > 150 && narrow ? 50 : 25;
    for (var v = lo; v <= hi; v += step) {
      g.appendChild(svg('line', {
        x1: mL, x2: W - mR, y1: y(v), y2: y(v),
        stroke: C.grid, 'stroke-width': '1'
      }));
      var t = svg('text', {
        x: mL - 10, y: y(v) + fs / 3, fill: C.label, 'text-anchor': 'end',
        'font-family': 'IBM Plex Mono, monospace', 'font-size': String(fs)
      });
      t.textContent = v;
      g.appendChild(t);
    }

    // axis spine
    g.appendChild(svg('line', {
      x1: mL, x2: W - mR, y1: mT + ih, y2: mT + ih,
      stroke: C.axis, 'stroke-width': '1'
    }));

    // selected-day marker
    g.appendChild(svg('line', {
      x1: x(state.day), x2: x(state.day), y1: mT, y2: mT + ih,
      stroke: C.forecast, 'stroke-width': '1', 'stroke-dasharray': '2 4', opacity: '0.85'
    }));

    // error ticks
    for (var i = 0; i < n; i++) {
      g.appendChild(svg('line', {
        x1: x(i), x2: x(i), y1: y(s.z.cleared[i]), y2: y(s.z.forecast[i]),
        stroke: s.err[i] >= 0 ? C.down : C.up, 'stroke-width': '2', opacity: '0.55'
      }));
    }

    function path(arr) {
      return arr.map(function (v, i) {
        return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1);
      }).join(' ');
    }

    g.appendChild(svg('path', {
      d: path(s.z.forecast), fill: 'none', stroke: C.forecast,
      'stroke-width': '2', 'stroke-linejoin': 'round'
    }));
    g.appendChild(svg('path', {
      d: path(s.z.cleared), fill: 'none', stroke: C.cleared,
      'stroke-width': '2', 'stroke-linejoin': 'round'
    }));

    var r0 = narrow ? 4 : 3;
    for (i = 0; i < n; i++) {
      var sel = i === state.day;
      g.appendChild(svg('rect', {
        x: x(i) - (sel ? 4.5 : r0), y: y(s.z.forecast[i]) - (sel ? 4.5 : r0),
        width: (sel ? 9 : r0 * 2), height: (sel ? 9 : r0 * 2),
        fill: '#FFFFFF', stroke: C.forecast, 'stroke-width': '2'
      }));
      g.appendChild(svg('circle', {
        cx: x(i), cy: y(s.z.cleared[i]), r: sel ? 5 : r0,
        fill: C.cleared
      }));
    }

    // x labels
    for (i = 0; i < n; i++) {
      if (i % stride !== 0 && i !== state.day) continue;
      if (i !== state.day && Math.abs(i - state.day) < stride) continue;
      var anchor = i === 0 ? 'start' : (i === n - 1 ? 'end' : 'middle');
      var xt = svg('text', {
        x: x(i), y: H - mB / 2 - 2,
        fill: i === state.day ? C.forecast : C.label, 'text-anchor': anchor,
        'font-family': 'IBM Plex Mono, monospace', 'font-size': String(fs),
        'letter-spacing': '0.6'
      });
      xt.textContent = fmtDay(D.days[i]).slice(4).toUpperCase();
      g.appendChild(xt);
    }

    // hit areas
    var cw = iw / (n - 1);
    for (i = 0; i < n; i++) {
      var hit = svg('rect', {
        x: x(i) - cw / 2, y: mT, width: cw, height: ih,
        fill: 'transparent', style: 'cursor:crosshair'
      });
      (function (idx) {
        hit.addEventListener('click', function () { select(idx); });
        hit.addEventListener('mouseenter', function () { select(idx); });
      })(i);
      g.appendChild(hit);
    }

    host.textContent = '';
    host.appendChild(g);

    var note = document.getElementById('chartNote');
    if (note) {
      note.textContent = 'Daily-mean day-ahead price in ' + D.unit + ', ' +
        s.z.label + ', ' + D.window + '. Each forecast point was issued one day ' +
        'before its delivery day, before gate closure, on forecast-weather inputs. ' +
        'The shaded region is out of sample. Vertical ticks show the gap between ' +
        'the two lines on each day.';
    }
  }

  /* ---------- day table ---------- */

  function renderTable() {
    var body = document.getElementById('demoRows');
    if (!body) return;
    var s = series();
    body.textContent = '';

    D.days.forEach(function (d, i) {
      var tr = el('tr', { tabindex: '0' });
      if (i === state.day) tr.className = 'is-sel';
      tr.appendChild(el('td', {}, fmtDay(d)));
      tr.appendChild(el('td', { 'class': 'num' }, s.z.forecast[i].toFixed(2)));
      tr.appendChild(el('td', { 'class': 'num' }, s.z.cleared[i].toFixed(2)));
      tr.appendChild(el('td', {
        'class': 'num ' + (s.err[i] >= 0 ? 'pos' : 'neg')
      }, signed(s.err[i], 1)));
      tr.appendChild(el('td', { 'class': 'num' },
        D.germany[i] === null ? '—' : D.germany[i].toFixed(1)));
      tr.appendChild(el('td', {}, i < D.oosFrom ? 'In sample' : 'Out of sample'));

      tr.addEventListener('click', function () { select(i); });
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
      });
      body.appendChild(tr);
    });
  }

  /* ---------- per-day driver panel ---------- */

  function renderDetail() {
    var host = document.getElementById('dayDetail');
    if (!host) return;
    var s = series();
    var i = state.day;
    var e = s.err[i];
    var g = D.germany[i];
    var gPrev = i > 0 ? D.germany[i - 1] : null;

    var line;
    if (g !== null && gPrev !== null) {
      var dg = g - gPrev;
      var sameWay = (dg >= 0) === (e >= 0);
      line = 'The German day-ahead price moved ' + signed(dg, 1) + ' from the ' +
        'previous delivery day, to ' + eur(g, 1) + '. Our error on the day was ' +
        signed(e, 1) + ', ' + (sameWay ? 'in the same direction and of similar size'
          : 'in the opposite direction') + '. Across the recorded days the model ' +
        'carries the previous German level forward and is wrong by roughly the ' +
        'size of the move.';
    } else if (g !== null) {
      line = 'The German day-ahead price settled at ' + eur(g, 1) + ' on this ' +
        'delivery day. The previous day’s anchor is not in the recorded set, ' +
        'so the day-over-day move cannot be stated here.';
    } else {
      line = 'The German anchor is not recorded for this delivery day, so the ' +
        'error is not attributed to a driver.';
    }

    var basis = (g !== null) ? s.z.cleared[i] - g : null;

    host.textContent = '';

    var hd = el('div', { 'class': 'detail-head' });
    hd.appendChild(el('p', { 'class': 'tag' }, 'Selected day · ' + state.zone));
    hd.appendChild(el('h3', {}, fmtDay(D.days[i], true) + ' 2026'));
    hd.appendChild(el('span', { 'class': 'tag tag-dim' },
      i < D.oosFrom ? 'In sample' : 'Out of sample'));
    host.appendChild(hd);

    var grid = el('div', { 'class': 'detail-grid' });
    var kv = [
      ['Forecast', eur(s.z.forecast[i], 2), ''],
      ['Cleared', eur(s.z.cleared[i], 2), ''],
      ['Error', signed(e, 2), e >= 0 ? 'down' : 'up'],
      ['German anchor', g === null ? '—' : eur(g, 1), ''],
      ['Basis to Germany', basis === null ? '—' : signed(basis, 1), ''],
      ['Zone', s.z.label.split(' — ')[0], '']
    ];
    kv.forEach(function (p) {
      var cell = el('div', { 'class': 'detail-kv' });
      cell.appendChild(el('span', { 'class': 'detail-k' }, p[0]));
      cell.appendChild(el('span', { 'class': 'detail-v ' + p[2] }, p[1]));
      grid.appendChild(cell);
    });
    host.appendChild(grid);
    host.appendChild(el('p', { 'class': 'detail-say' }, line));
  }

  /* ---------- wiring ---------- */

  function select(i) {
    if (i === state.day) return;
    state.day = i;
    renderChart();
    renderTable();
    renderDetail();
  }

  function renderAll() {
    renderStats();
    renderChart();
    renderTable();
    renderDetail();
  }

  var btns = document.querySelectorAll('.seg button[data-zone]');
  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener('click', function () {
      state.zone = b.getAttribute('data-zone');
      Array.prototype.forEach.call(btns, function (o) {
        o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
      renderAll();
    });
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderChart, 150);
  });

  renderAll();
})();
