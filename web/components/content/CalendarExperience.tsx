"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "../../lib/format";
import { getPrayerPreview, getTithiTone } from "../../lib/presentation";
import type { Festival, Panchang, Prayer } from "../../lib/types";
import { Button } from "../ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "../ui/Icons";

function monthKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}`;
}

function buildMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(value);
}

function toLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTithiCellLabel(name?: string) {
  if (!name) return "Panchang unavailable";
  const compact = name.trim();
  if (compact.length <= 6) return compact;
  return compact.slice(0, 4);
}

function formatPrayerContext(day: Panchang, prayers: Prayer[]) {
  const tone = getTithiTone(day.tithi.name);
  const matches = prayers.filter((prayer) => {
    const haystack = `${prayer.title.en} ${prayer.deity?.name?.en || ""} ${(prayer.tags || []).join(" ")}`.toLowerCase();
    if (tone === "inauspicious") {
      return /(shiva|mahamrityunjaya|pitru|ancestor)/.test(haystack);
    }
    if (tone === "auspicious") {
      return /(bhagavathi|devi|ganesha|gayatri|lakshmi|saraswati)/.test(haystack);
    }
    return prayer.durationMinutes <= 10;
  });

  return (matches.length ? matches : prayers).slice(0, 3);
}

function monthGrid(baseMonth: Date) {
  const year = baseMonth.getFullYear();
  const month = baseMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; dayNumber: number; inMonth: boolean }> = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({
      iso: `placeholder-${i}`,
      dayNumber: 0,
      inMonth: false
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellDate = new Date(year, month, day);
    const iso = toIsoDate(cellDate);
    cells.push({ iso, dayNumber: day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      iso: `tail-${cells.length}`,
      dayNumber: 0,
      inMonth: false
    });
  }

  return cells;
}

export function CalendarExperience({
  today,
  upcoming,
  festivals,
  prayers
}: {
  today: Panchang | null;
  upcoming: Panchang[];
  festivals: Festival[];
  prayers: Prayer[];
}) {
  const dayMap = useMemo(() => new Map(upcoming.map((day) => [day.date, day])), [upcoming]);
  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    upcoming.forEach((day) => {
      const date = toLocalDate(day.date);
      keys.add(monthKey(date));
    });
    return Array.from(keys).sort((left, right) => {
      const [leftYear, leftMonth] = left.split("-").map(Number);
      const [rightYear, rightMonth] = right.split("-").map(Number);
      return leftYear === rightYear ? leftMonth - rightMonth : leftYear - rightYear;
    }).map((value) => {
      const [year, month] = value.split("-").map(Number);
      return new Date(year, month, 1);
    });
  }, [upcoming]);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today?.date || upcoming[0]?.date || "");
  const activeMonth = monthOptions[currentMonthIndex] || toLocalDate(today?.date || toIsoDate(new Date()));
  const activeDay = dayMap.get(selectedDate) || today || null;
  const festivalSoon = festivals.find((festival) => Number(festival.startsInDays || 99) <= 7) || null;
  const recommendedPrayers = activeDay ? formatPrayerContext(activeDay, prayers) : [];

  function changeMonth(nextIndex: number) {
    const nextMonth = monthOptions[nextIndex];
    if (!nextMonth) return;
    setCurrentMonthIndex(nextIndex);
    const nextDay = upcoming.find((day) => monthKey(toLocalDate(day.date)) === monthKey(nextMonth));
    if (nextDay) {
      setSelectedDate(nextDay.date);
    }
  }

  return (
    <div className="calendar-experience">
      <div className="surface-card calendar-month-panel">
        <div className="calendar-month-panel__header">
          <button
            type="button"
            className="icon-button"
            onClick={() => changeMonth(Math.max(0, currentMonthIndex - 1))}
            disabled={currentMonthIndex === 0}
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </button>
          <h3>{buildMonthLabel(activeMonth)}</h3>
          <button
            type="button"
            className="icon-button"
            onClick={() => changeMonth(Math.min(monthOptions.length - 1, currentMonthIndex + 1))}
            disabled={currentMonthIndex === monthOptions.length - 1}
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </button>
        </div>
        <div className="calendar-month-panel__weekdays" aria-hidden="true">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="calendar-month-grid">
          {monthGrid(activeMonth).map((cell) => {
            if (!cell.inMonth) {
              return <div key={cell.iso} className="calendar-month-grid__blank" aria-hidden="true" />;
            }

            const day = dayMap.get(cell.iso);
            const tone = getTithiTone(day?.tithi.name);
            const isToday = today?.date === cell.iso;
            const isSelected = selectedDate === cell.iso;

            return (
              <button
                key={cell.iso}
                type="button"
                className={`calendar-month-cell calendar-month-cell--${tone} ${
                  isSelected ? "calendar-month-cell--selected" : ""
                }`}
                onClick={() => setSelectedDate(cell.iso)}
              >
                <div className="calendar-month-cell__head">
                  <strong>{cell.dayNumber}</strong>
                  {isToday ? <span className="calendar-month-cell__today-dot" /> : null}
                </div>
                <span className="calendar-month-cell__tithi" title={day?.tithi.name || "Panchang unavailable"}>
                  {formatTithiCellLabel(day?.tithi.name)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className={`surface-card calendar-detail-panel ${activeDay ? "calendar-detail-panel--open" : ""}`}>
        {activeDay ? (
          <>
            <div className="surface-card__meta">
              <span className="pill pill--soft">{formatDate(activeDay.date, { month: "long", day: "numeric" })}</span>
              <span className="muted">{activeDay.timezone}</span>
            </div>
            <h3>{activeDay.tithi.name}</h3>
            <div className="list-stack">
              <div className="list-row"><span>Tithi</span><span>{activeDay.tithi.name}</span></div>
              <div className="list-row"><span>Nakshatra</span><span>{activeDay.nakshatra.name}</span></div>
              <div className="list-row"><span>Yoga</span><span>{activeDay.dailyGuidance?.overall || "Steady devotional guidance"}</span></div>
              <div className="list-row"><span>Karana</span><span>{activeDay.dailyGuidance?.auspiciousWindow || "Temple timing guidance available"}</span></div>
              <div className="list-row"><span>Rahukaal</span><span>{activeDay.rahuKaal?.start || "--"} to {activeDay.rahuKaal?.end || "--"}</span></div>
            </div>
            {festivalSoon ? (
              <div className="discovery-banner discovery-banner--gold">
                <strong>Upcoming festival</strong>
                <p>{festivalSoon.name.en} is within {festivalSoon.startsInDays} days. Begin preparation early.</p>
              </div>
            ) : null}
            <div className="calendar-detail-panel__prayers">
              <div>
                <p className="eyebrow">Recommended prayers for today</p>
                <h4>Match your practice to the day.</h4>
              </div>
              <div className="calendar-detail-panel__prayer-list">
                {recommendedPrayers.map((prayer) => (
                  <article key={prayer._id} className="surface-card calendar-prayer-card">
                    <div className="surface-card__meta">
                      <span className="pill pill--soft">{prayer.type}</span>
                      <span className="muted">{prayer.durationMinutes} min</span>
                    </div>
                    <h4>{prayer.title.en}</h4>
                    <p>{getPrayerPreview(prayer)}</p>
                    <Button tone="secondary" href={`/prayers/${prayer.slug}`}>
                      Open prayer
                    </Button>
                  </article>
                ))}
              </div>
            </div>
            <Link href={`/prayers?context=${getTithiTone(activeDay.tithi.name)}`} className="inline-link">
              Browse all prayers for today {"->"}
            </Link>
          </>
        ) : (
          <p className="muted">Select a date to open its full panchang details and recommended prayers.</p>
        )}
      </aside>
    </div>
  );
}
