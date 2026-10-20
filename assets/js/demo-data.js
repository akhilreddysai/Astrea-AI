/* Astrea trader demo — data extract.
   Danish day-ahead record, 23 September – 6 October 2026.
   Daily-mean day-ahead prices in EUR/MWh. Forecasts are one-day-ahead,
   issued before gate closure on forecast-weather inputs.

   This file is the only data source for the demo page. Replacing it with a
   live feed that exposes the same shape (window.ASTREA_DEMO) swaps the page
   onto production data without touching demo.js. */

window.ASTREA_DEMO = {
  window: '23 September – 6 October 2026',
  unit: '€/MWh',
  oosFrom: 6, // index of the first out-of-sample delivery day (29 Sep)

  days: [
    '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26',
    '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
    '2026-10-05', '2026-10-06'
  ],

  // German day-ahead anchor where it appears in the model's driver
  // attribution. null = not recorded for that delivery day.
  germany: [
    null, null, null, null,
    111.1, 195.4, 165.8, 140.7,
    195.2, 200.5, null, 168.3,
    156.6, 201.7
  ],

  zones: {
    DK1: {
      label: 'DK1 — Western Denmark',
      cleared: [187.76, 143.77, 184.07, 150.42, 106.21, 194.58, 164.23,
                121.56, 188.20, 199.75, 167.91, 166.96, 136.12, 201.25],
      forecast: [188.25, 147.39, 158.98, 130.06, 92.39, 133.43, 218.08,
                 138.65, 126.34, 193.25, 153.32, 122.98, 165.66, 163.75],
      mase: 0.61
    },
    DK2: {
      label: 'DK2 — Eastern Denmark',
      cleared: [190.80, 157.21, 184.17, 150.62, 107.70, 192.08, 168.37,
                126.74, 187.06, 199.41, 167.92, 167.28, 143.99, 199.98],
      forecast: [205.01, 156.15, 159.42, 128.66, 91.30, 125.74, 219.60,
                 157.79, 131.33, 192.15, 162.74, 130.76, 183.80, 158.48],
      mase: 0.54
    }
  }
};
