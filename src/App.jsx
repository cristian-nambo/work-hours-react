import React, { useMemo, useState } from 'react';
import { Clock3, Coffee, RotateCcw, TimerReset } from 'lucide-react';

/*
  WORK HOURS CALCULATOR
  ---------------------
  This app mirrors the idea behind the Excel workbook:
  1. Start with the employee's clock-in time.
  2. Add the number of hours they actually need to WORK.
  3. If a lunch break was entered, add that break to the day because lunch is not worked time.

  Example:
  Clock in: 7:00 AM
  Lunch:    11:30 AM to 12:00 PM (30 minutes)
  Target:   8 hours of work
  Result:   3:30 PM
*/

// Convert an HTML time such as "07:30" into minutes after midnight.
// Doing all math in minutes keeps the calculation easy to read and avoids Date/time-zone issues.
function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Return the forward-moving difference between two times.
// Adding 1440 (minutes in one day) and using remainder also supports a break crossing midnight.
function elapsedMinutes(start, end) {
  return (end - start + 1440) % 1440;
}

// Turn minutes after midnight back into a friendly time such as "3:30 PM".
function formatTime(totalMinutes) {
  const minutesInDay = 1440;
  const normalized = ((Math.round(totalMinutes) % minutesInDay) + minutesInDay) % minutesInDay;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Present a duration in plain language for the supporting details.
function formatDuration(minutes) {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export default function App() {
  // Each field is stored separately so changing one input immediately recalculates the answer.
  const [clockIn, setClockIn] = useState('07:00');
  const [lunchOut, setLunchOut] = useState('11:30');
  const [lunchIn, setLunchIn] = useState('12:00');
  const [clockOut, setClockOut] = useState('');
  const [targetHours, setTargetHours] = useState(8);

  // useMemo recalculates only when one of the input values changes.
  const result = useMemo(() => {
    const start = timeToMinutes(clockIn);
    const lunchStart = timeToMinutes(lunchOut);
    const lunchEnd = timeToMinutes(lunchIn);
    const actualOut = timeToMinutes(clockOut);
    const requestedMinutes = Number(targetHours) * 60;

    if (start === null || !Number.isFinite(requestedMinutes) || requestedMinutes <= 0) return null;

    // Lunch counts only when BOTH lunch fields are filled in.
    // This copies the workbook behavior where an incomplete/blank lunch means zero lunch time.
    const lunchMinutes = lunchStart !== null && lunchEnd !== null
      ? elapsedMinutes(lunchStart, lunchEnd)
      : 0;

    // Excel equivalent: Clock In + 8 work hours + Lunch duration.
    const targetOut = start + requestedMinutes + lunchMinutes;

    // If the user enters an actual clock-out time, calculate worked hours too.
    // Worked time = total elapsed day - unpaid lunch.
    let workedMinutes = null;
    if (actualOut !== null) {
      workedMinutes = Math.max(0, elapsedMinutes(start, actualOut) - lunchMinutes);
    }

    return {
      lunchMinutes,
      targetOut,
      workedMinutes,
      regularMinutes: workedMinutes === null ? null : Math.min(workedMinutes, requestedMinutes),
      overtimeMinutes: workedMinutes === null ? null : Math.max(workedMinutes - requestedMinutes, 0),
    };
  }, [clockIn, lunchOut, lunchIn, clockOut, targetHours]);

  function reset() {
    setClockIn('');
    setLunchOut('');
    setLunchIn('');
    setClockOut('');
    setTargetHours(8);
  }

  return (
    <main className="page-shell">
      <section className="calculator-card" aria-labelledby="page-title">
        <header className="hero">
          <div className="hero-icon"><Clock3 size={28} aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">TIME TOOL</p>
            <h1 id="page-title">Work Hours Calculator</h1>
            <p className="subtitle">Enter your day below. We’ll calculate when your 8-hour workday is complete.</p>
          </div>
        </header>

        <div className="input-panel">
          <div className="section-title">
            <h2>Your times</h2>
            <button className="reset-button" type="button" onClick={reset}><RotateCcw size={16}/> Reset</button>
          </div>

          <div className="input-grid">
            <TimeField label="Clock in" value={clockIn} onChange={setClockIn} required />
            <TimeField label="Lunch out" value={lunchOut} onChange={setLunchOut} />
            <TimeField label="Lunch in" value={lunchIn} onChange={setLunchIn} />
            <TimeField label="Actual clock out" value={clockOut} onChange={setClockOut} hint="Optional" />
          </div>

          <label className="hours-field">
            <span>Target work hours</span>
            <div className="number-wrap">
              <input type="number" min="0.25" max="24" step="0.25" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} />
              <span>hours</span>
            </div>
          </label>
        </div>

        <section className="result-panel" aria-live="polite">
          <div className="result-kicker"><TimerReset size={19}/> TARGET CLOCK OUT</div>
          <div className="big-time">{result ? formatTime(result.targetOut) : '—'}</div>
          <p>{clockIn ? `Based on a ${targetHours || 0}-hour workday${result?.lunchMinutes ? ' plus your lunch break' : ''}.` : 'Enter your clock-in time to calculate your target.'}</p>
        </section>

        <div className="details-grid">
          <Detail icon={<Coffee size={18}/>} label="Lunch break" value={result ? formatDuration(result.lunchMinutes) : '—'} />
          <Detail label="Worked" value={result?.workedMinutes !== null && result?.workedMinutes !== undefined ? formatDuration(result.workedMinutes) : 'Enter clock out'} />
          <Detail label="Regular" value={result?.regularMinutes !== null && result?.regularMinutes !== undefined ? formatDuration(result.regularMinutes) : '—'} />
          <Detail label="Overtime" value={result?.overtimeMinutes !== null && result?.overtimeMinutes !== undefined ? formatDuration(result.overtimeMinutes) : '—'} />
        </div>

        <footer>
          Lunch is treated as unpaid time. If you did not take lunch, leave both lunch fields blank.
        </footer>
      </section>
    </main>
  );
}

// A small reusable component prevents us from repeating the same label/input markup four times.
function TimeField({ label, value, onChange, required = false, hint }) {
  const id = label.toLowerCase().replaceAll(' ', '-');
  return (
    <label className="field" htmlFor={id}>
      <span>{label} {required && <small>Required</small>} {hint && <small>{hint}</small>}</span>
      <input id={id} type="time" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// Detail cards are intentionally simple: one label and one calculated value.
function Detail({ icon, label, value }) {
  return <div className="detail"><span className="detail-label">{icon}{label}</span><strong>{value}</strong></div>;
}
