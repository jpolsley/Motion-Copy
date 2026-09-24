import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Share2,
  Clock,
  Calendar,
  CheckCircle2,
  User,
  Mail,
  Copy,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function BookingView() {
  const { state, updateBooking, bookMeetingFromLink, addToast, setCurrentView } = useApp();
  const booking = state.booking;

  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [bookedConfirmation, setBookedConfirmation] = useState<any>(null);

  // Compute available open slots for the selected date
  const computeAvailableSlots = () => {
    const slots: string[] = [];
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    if (!booking.workingDays.includes(dayOfWeek)) {
      return slots; // Non-working day
    }

    const eventsOnDay = state.events.filter((ev) => ev.startTime.startsWith(selectedDate));
    const fixedEvents = eventsOnDay.filter((ev) => ev.isFixed || ev.type === 'meeting' || ev.type === 'focus_time');

    for (let h = booking.startHour; h < booking.endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotStart = new Date(dateObj);
        slotStart.setHours(h, m, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + selectedDuration * 60000);
        if (slotEnd.getHours() > booking.endHour || (slotEnd.getHours() === booking.endHour && slotEnd.getMinutes() > 0)) {
          continue;
        }

        const hasCollision = fixedEvents.some((ev) => {
          const evStart = new Date(new Date(ev.startTime).getTime() - booking.bufferMinutes * 60000);
          const evEnd = new Date(new Date(ev.endTime).getTime() + booking.bufferMinutes * 60000);
          return slotStart < evEnd && slotEnd > evStart;
        });

        if (!hasCollision) {
          slots.push(
            slotStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          );
        }
      }
    }
    return slots;
  };

  const availableSlots = computeAvailableSlots();

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot || !guestName || !guestEmail) {
      addToast('Please pick a time slot and fill in your name and email', true);
      return;
    }

    const [time, meridiem] = selectedTimeSlot.split(' ');
    const [hStr, mStr] = time.split(':');
    let hours = parseInt(hStr, 10);
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const minutes = parseInt(mStr, 10);

    const slotDate = new Date(selectedDate + 'T00:00:00');
    slotDate.setHours(hours, minutes, 0, 0);

    const event = bookMeetingFromLink(
      guestName,
      guestEmail,
      slotDate.toISOString(),
      selectedDuration,
      guestNotes
    );

    setBookedConfirmation({
      title: event.title,
      time: `${slotDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${selectedTimeSlot}`,
      duration: selectedDuration,
      guestName,
      guestEmail,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://kin.app/book/${booking.slug}`);
    addToast('Booking link copied to clipboard!');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Team Schedule & Booking Links</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Allow clients and teammates to book open slots. Confirmed meetings automatically shift flexible task blocks.
          </p>
        </div>

        <button className="toolbar-btn" onClick={handleCopyLink}>
          <Copy size={13} />
          <span>Copy Public Link</span>
        </button>
      </div>

      {/* Share Strip */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={16} style={{ color: '#2563eb' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              https://kin.app/book/{booking.slug}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              Protected with {booking.bufferMinutes}m buffer padding and working hours ({booking.startHour}:00 - {booking.endHour}:00)
            </div>
          </div>
        </div>

        <button className="toolbar-btn" onClick={handleCopyLink}>
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Settings Column */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Booking Preferences</h3>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Page Title
            </label>
            <input
              type="text"
              value={booking.title}
              onChange={(e) => updateBooking({ title: e.target.value })}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Buffer Between Appointments
            </label>
            <select
              value={booking.bufferMinutes}
              onChange={(e) => updateBooking({ bufferMinutes: parseInt(e.target.value, 10) })}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#4b5563' }}>
            <ShieldCheck size={14} style={{ color: '#2563eb', marginBottom: '4px' }} />
            <div>
              <strong>Zero double-booking:</strong> Only true open windows are shown to guests, protecting your existing appointments and focus sessions.
            </div>
          </div>
        </div>

        {/* Live Simulator Preview */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', background: '#ffffff' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            Client Booking Simulator
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Test booking a slot to see how the engine instantly confirms it and shifts task blocks.
          </p>

          {bookedConfirmation ? (
            <div style={{ textAlign: 'center', padding: '24px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Check size={20} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>Meeting Confirmed!</h3>
              <p style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                {bookedConfirmation.title} on {bookedConfirmation.time}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <button className="toolbar-btn" onClick={() => setBookedConfirmation(null)}>
                  Book Another
                </button>
                <button className="btn-motion-new" style={{ width: 'auto', margin: 0, padding: '0 12px' }} onClick={() => setCurrentView('calendar')}>
                  View in Calendar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  1. Meeting Length
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {booking.durations.map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => {
                        setSelectedDuration(dur);
                        setSelectedTimeSlot(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: '6px',
                        background: selectedDuration === dur ? '#2563eb' : '#f3f4f6',
                        color: selectedDuration === dur ? '#fff' : '#374151',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                    2. Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot(null);
                    }}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 8px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                    3. Available Slots ({availableSlots.length})
                  </label>
                  <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', border: '1px solid #e5e7eb', padding: '6px', borderRadius: '6px' }}>
                    {availableSlots.length === 0 ? (
                      <div style={{ gridColumn: 'span 2', fontSize: '11px', color: '#9ca3af', textAlign: 'center', padding: '8px' }}>
                        No slots on this date
                      </div>
                    ) : (
                      availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            background: selectedTimeSlot === slot ? '#2563eb' : '#f9fafb',
                            color: selectedTimeSlot === slot ? '#fff' : '#111827',
                            border: '1px solid #e5e7eb',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          {slot}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
                  required
                />
                <input
                  type="email"
                  placeholder="Guest Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-motion-new"
                style={{ width: '100%', height: '34px', margin: 0 }}
                disabled={!selectedTimeSlot}
              >
                Confirm Appointment {selectedTimeSlot ? `at ${selectedTimeSlot}` : ''}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
