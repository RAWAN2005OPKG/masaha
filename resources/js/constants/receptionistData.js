export const SPACE_CAPACITY = 30;    
export const MAX_SESSION_HOURS = 8;  

export const INITIAL_ATTENDEES = [
  { id: 1, name: "يوسف أحمد",    seat: "A-01", hours: 3, checkInTime: "٨:٣٠" },
  { id: 2, name: "سارة حسن",     seat: "A-03", hours: 2, checkInTime: "٩:٠٠" },
  { id: 3, name: "خالد محمود",   seat: "A-06", hours: 1, checkInTime: "١٠:٠٠" },
  { id: 4, name: "أميرة عبدالله", seat: "B-01", hours: 4, checkInTime: "٨:٠٠" },
  { id: 5, name: "طارق حمدان",   seat: "B-03", hours: 2, checkInTime: "٩:٣٠" },
  { id: 6, name: "ليلى سمير",    seat: "C-02", hours: 3, checkInTime: "٨:٤٥" },
];

export const hoursLabel = (h) =>
  h === 1 ? "ساعة" : h === 2 ? "ساعتان" : h <= 10 ? "ساعات" : "ساعة";