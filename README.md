# Work Hours Calculator

A small React website based on the existing Excel work-hours calculator.

## What it does

- Calculates a target clock-out time from Clock In + target work hours + lunch duration.
- Supports no lunch by leaving both lunch fields empty.
- Optionally accepts an actual clock-out time and shows worked, regular, and overtime durations.
- Defaults to an 8-hour workday, but the target is editable.

## How the calculation works

Think in minutes rather than AM/PM while doing the math:

1. Convert Clock In to "minutes after midnight."
2. If both lunch times exist, calculate Lunch In - Lunch Out.
3. Convert target work hours to minutes.
4. Target Clock Out = Clock In + target work minutes + lunch minutes.
5. Convert that result back to a friendly AM/PM time.

Example: 7:00 AM + 8 hours + 30-minute lunch = 3:30 PM.

## Project map

- `index.html` - the page Vite loads first.
- `src/main.jsx` - starts React and displays the `App` component.
- `src/App.jsx` - inputs, calculation logic, and displayed results. Heavily commented for learning.
- `src/styles.css` - appearance and mobile layout.

## Run locally

```bash
npm install
npm run dev
```

Vite will print the local address to open in your browser.

## Create a production build

```bash
npm run build
```

The deployable website will be created in `dist/`.
