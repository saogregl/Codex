import { forwardRef, memo, useMemo, useRef } from "react";

interface CalendarStripProps {
  // add any props specific to the CalendarStrip component
}

const CalendarStrip = forwardRef<HTMLDivElement, CalendarStripProps>(
  (props, ref) => {
    const daysRef = useRef<HTMLDivElement[]>([]);

    // memoize the array of 30 days starting from today
    const days = useMemo(() => {
      const today = new Date();
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date;
      });
    }, []);

    return (
      <div className="calendar-strip" ref={ref}>
        {days.map((day, index) => (
          <CalendarDay
            key={day.getTime()}
            day={day}
            index={index}
            ref={(element) => daysRef.current.push(element)}
          />
        ))}
      </div>
    );
  }
);

interface CalendarDayProps {
  day: Date;
  index: number;
}

const CalendarDay = memo(
  forwardRef<HTMLDivElement, CalendarDayProps>(({ day, index }, ref) => {

    const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];


    return (
      <div className="calendar-day" style={{ left: index * 30 + 15 }} ref={ref}>
        <div className="day">{day.getDate()}</div>
        <div className="month">{weekday[day.getDay()]}</div>
      </div>
    );
  })
);

export default CalendarStrip;
