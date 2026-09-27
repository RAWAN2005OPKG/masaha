import React, { useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';

const SEAT_TYPES = ['مقعد عادي', 'مكتب خاص', 'غرفة اجتماع', 'مقعد هادئ'];
const INITIAL_FROM = '09:00';
const INITIAL_TO = '17:00';

const EditBookingModal = ({
  isOpen,
  onClose,
  spaceName = 'مساحة الإبداع',
  currentBooking = { date: '2024/12/20', time: '9:00 ص', seatType: 'مقعد عادي', duration: '8 ساعات' },
  onSave,
}) => {
  const [newDate, setNewDate] = useState('');
  const [fromTime, setFromTime] = useState(INITIAL_FROM);
  const [toTime, setToTime] = useState(INITIAL_TO);
  const [seatType, setSeatType] = useState(currentBooking.seatType);

  if (!isOpen) return null;

  const canSave =
    newDate !== '' ||
    fromTime !== INITIAL_FROM ||
    toTime !== INITIAL_TO ||
    seatType !== currentBooking.seatType;

  const handleSave = () => {
    if (!canSave) return;
    onSave?.({ newDate, fromTime, toTime, seatType });
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
        {/* الهيدر */}
        <div
          className="flex shrink-0 items-center justify-between p-6 text-white"
          style={{ backgroundImage: 'var(--grad-teal)' }}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-extrabold">تعديل الحجز</h3>
            <p className="text-xs font-medium text-white/80">{spaceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 active:scale-90"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-8">
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'var(--offer-bg)', borderColor: 'var(--offer-border)' }}
          >
            <p
              className="mb-1 text-[10px] font-black uppercase tracking-wide"
              style={{ color: 'var(--offer-title)' }}
            >
              الحجز الحالي
            </p>
            <p className="text-sm font-bold text-slate-700">
              {currentBooking.date} — {currentBooking.time}
            </p>
            <p className="mt-1 text-[10px] font-bold" style={{ color: 'var(--offer-sub)' }}>
              {currentBooking.seatType} • {currentBooking.duration}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block pr-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              التاريخ الجديد
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block pr-2 text-[10px] font-black text-slate-400">من الساعة</label>
             <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold"
                />
            </div>
            <div className="space-y-2">
              <label className="block pr-2 text-[10px] font-black text-slate-400">إلى الساعة</label>
              <input
                    type="time"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold"
                    />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block pr-2 text-[10px] font-black text-slate-400">نوع المقعد</label>
            <div className="grid grid-cols-2 gap-3">
              {SEAT_TYPES.map((s) => {
                const isSelected = seatType === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeatType(s)}
                    className={`rounded-xl border py-3 text-[11px] font-bold transition-all ${
                      isSelected ? '' : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'color-mix(in srgb, var(--primary) 8%, white)',
                            borderColor: 'var(--primary)',
                            color: 'var(--primary)',
                          }
                        : undefined
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-slate-100 py-4 font-black text-slate-400 transition hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 rounded-2xl py-4 font-black text-white transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 enabled:active:scale-[0.98]"
              style={
                canSave
                  ? { backgroundColor: 'var(--primary)', boxShadow: '0 10px 20px -8px var(--primary)' }
                  : undefined
              }
            >
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;