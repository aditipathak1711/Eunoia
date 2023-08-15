import React, { useState, useEffect, useContext } from 'react';
import { CycleContext } from '../../context/CycleContext';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Droplet } from 'react-feather';
import CycleForm from '../cycles/CycleForm';
import './Calendar.css';

const Calendar = () => {
  const { cycles } = useContext(CycleContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cyclesByDate, setCyclesByDate] = useState({});
  const [animation, setAnimation] = useState('');

  // Get month and year for the header
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Generate calendar days
  useEffect(() => {
    const generateCalendarDays = () => {
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const firstDayOfWeek = firstDayOfMonth.getDay();
      const daysFromPrevMonth = firstDayOfWeek;
      const totalDays = daysFromPrevMonth + lastDayOfMonth.getDate();
      const rows = Math.ceil(totalDays / 7);
      const totalCells = rows * 7;

      const days = [];

      // Add days from previous month
      const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
      for (let i = 0; i < daysFromPrevMonth; i++) {
        const day = prevMonthLastDay - daysFromPrevMonth + i + 1;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
        days.push({
          date,
          day,
          isCurrentMonth: false,
          isToday: false
        });
      }

      // Add days from current month
      const today = new Date();
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        days.push({
          date,
          day: i,
          isCurrentMonth: true,
          isToday:
            today.getDate() === i &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear()
        });
      }

      // Add days from next month
      const remainingCells = totalCells - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        days.push({
          date,
          day: i,
          isCurrentMonth: false,
          isToday: false
        });
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentDate]);

  // Map cycles to dates for easy lookup
  useEffect(() => {
    const mapCyclesToDates = () => {
      const mapping = {};

      cycles.forEach(cycle => {
        const start = new Date(cycle.startDate);
        const end = new Date(cycle.endDate);

        // Loop through each day of the cycle
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

          if (!mapping[dateKey]) {
            mapping[dateKey] = [];
          }

          mapping[dateKey].push({
            ...cycle,
            isStart: d.getTime() === start.getTime(),
            isEnd: d.getTime() === end.getTime(),
            dayOfCycle: Math.floor((d - start) / (1000 * 60 * 60 * 24)) + 1
          });
        }
      });

      setCyclesByDate(mapping);
    };

    mapCyclesToDates();
  }, [cycles]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setAnimation('slide-right');
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      setAnimation('');
    }, 300);
  };

  const goToNextMonth = () => {
    setAnimation('slide-left');
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      setAnimation('');
    }, 300);
  };

  const goToToday = () => {
    setAnimation('fade');
    setTimeout(() => {
      setCurrentDate(new Date());
      setAnimation('');
    }, 300);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day.date);
    setShowCycleForm(true);
  };

  const getCycleDataForDate = (date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return cyclesByDate[dateKey] || [];
  };

  const closeCycleForm = () => {
    setShowCycleForm(false);
    setSelectedDate(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <h1>Cycle Calendar</h1>
          <p className="calendar-subtitle">Track your flow and health patterns</p>
        </div>

        <div className="calendar-actions">
          <button className="today-button" onClick={goToToday}>
            Today
          </button>
          <div className="month-navigation">
            <button className="nav-button" onClick={goToPreviousMonth}>
              <ChevronLeft />
            </button>
            <h2 className="current-month">{monthName} {year}</h2>
            <button className="nav-button" onClick={goToNextMonth}>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div className={`calendar-grid ${animation}`}>
        <div className="weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>

        <div className="days">
          {calendarDays.map((day, index) => {
            const cycleData = getCycleDataForDate(day.date);
            const isPeriodDay = cycleData.length > 0;
            const flowIntensity = isPeriodDay ? cycleData[0].flow : null; // 'light', 'medium', 'heavy'

            return (
              <div
                key={index}
                className={`day 
                  ${!day.isCurrentMonth ? 'other-month' : ''} 
                  ${day.isToday ? 'today' : ''}
                  ${isPeriodDay ? 'period-day' : ''}
                  ${isPeriodDay ? `flow-${flowIntensity}` : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className="day-header">
                  <span className="day-number">{day.day}</span>
                  {isPeriodDay && (
                    <span className="cycle-indicator">
                      <Droplet size={12} className={flowIntensity} />
                    </span>
                  )}
                </div>

                <div className="day-content">
                  {isPeriodDay && (
                    <div className="cycle-info">
                      <span className="cycle-day">Day {cycleData[0].dayOfCycle}</span>
                      <span className="cycle-symptoms">
                        {cycleData[0].symptoms?.slice(0, 2).map((s, i) => (
                          <span key={i} className="symptom-dot" title={s}></span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {day.isCurrentMonth && (
                  <button className="add-task-day" onClick={(e) => {
                    e.stopPropagation();
                    handleDateClick(day);
                  }}>
                    <Plus size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showCycleForm && (
        <div className="calendar-task-form-overlay">
          <div className="calendar-task-form-container glass-panel">
            <div className="calendar-task-form-header">
              <div className="selected-date">
                <CalendarIcon size={18} />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <button className="close-form-button" onClick={closeCycleForm}>×</button>
            </div>
            <div className="form-content-wrapper">
              <CycleForm
                onClose={closeCycleForm}
                initialDate={selectedDate}
                existingCycle={null} // Or pass existing cycle if we want to edit on click
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
