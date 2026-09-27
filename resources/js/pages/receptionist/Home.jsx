import { useState } from "react";
import { RiHome5Line, RiUserReceived2Line } from "react-icons/ri";
import PageHeader from "../../components/common/PageHeader"; 
import OccupancyCard from "../../components/receptionist/OccupancyCard";
import AttendeesList from "../../components/receptionist/AttendeesList";
import CheckInForm from "../../components/receptionist/CheckInForm";
import { SPACE_CAPACITY, INITIAL_ATTENDEES } from "../../constants/receptionistData";

export default function Home() {
  const [attendees, setAttendees] = useState(INITIAL_ATTENDEES);
  const occupied = attendees.length;

  const handleCheckOut = (id) =>
    setAttendees((prev) => prev.filter((a) => a.id !== id));

  const handleCheckIn = ({ name, hours }) =>
    setAttendees((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name,
        hours,
        seat: "—", 
        checkInTime: new Date().toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

  return (
       <div className="space-y-10 font-['Cairo']">

      <PageHeader
        title="الرئيسية"
        icon={<RiHome5Line />}
        role="receptionist"
        roleIcon={<RiUserReceived2Line size={20} />}
      />

      {/* <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4">
        <OccupancyCard occupied={occupied} capacity={SPACE_CAPACITY} />
        <AttendeesList attendees={attendees} onCheckOut={handleCheckOut} />
        <CheckInForm
          occupied={occupied}
          capacity={SPACE_CAPACITY}
          onCheckIn={handleCheckIn}
        />
      </div> */}
    </div>
  );
}