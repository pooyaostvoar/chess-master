import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { createSlot } from "../services/schedule";
import { API_URL } from "../services/config";
import { useParams } from "react-router-dom";
import SlotModal from "../components/SlotModal";

const MasterScheduleCalendar: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const { userId } = useParams<{ userId: string }>();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // ---------------------------------------------------
  // LOAD EXISTING SLOTS
  // ---------------------------------------------------
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const res = await axios.get(`${API_URL}/schedule/slot/user/${userId}`, {
          withCredentials: true,
        });

        const slots = res.data.slots || [];

        setEvents(
          slots.map((slot: any) => ({
            id: slot.id,
            title: "Available",
            start: slot.startTime,
            end: slot.endTime,
          }))
        );
      } catch (err) {
        console.error("Failed to load slots", err);
      }
    };

    loadSlots();
  }, [userId]);

  // ---------------------------------------------------
  // CREATE SLOT
  // ---------------------------------------------------
  const handleSelect = async (info: any) => {
    const start = info.startStr;
    const end = info.endStr;

    try {
      const res = await createSlot({ startTime: start, endTime: end });
      const newSlot = res.data.slot;

      setEvents((prev) => [
        ...prev,
        { id: newSlot.id, title: "Available", start, end },
      ]);
    } catch (err) {
      console.error("Failed to create slot", err);
    }
  };

  // ---------------------------------------------------
  // OPEN MODAL ON CLICK
  // ---------------------------------------------------
  const handleEventClick = (info: any) => {
    const id = Number(info.event.id);
    setSelectedSlotId(id);
    setModalVisible(true);
  };

  // ---------------------------------------------------
  // DRAG & DROP UPDATE
  // ---------------------------------------------------
  const handleEventDrop = async (info: any) => {
    const id = info.event.id;

    try {
      await axios.patch(
        `${API_URL}/schedule/${id}`,
        {
          startTime: info.event.start,
          endTime: info.event.end,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to update slot", err);
    }
  };

  // ---------------------------------------------------
  // RESIZE EVENT UPDATE
  // ---------------------------------------------------
  const handleEventResize = async (info: any) => {
    const id = info.event.id;

    try {
      await axios.patch(
        `${API_URL}/schedule/${id}`,
        {
          startTime: info.event.start,
          endTime: info.event.end,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to resize slot", err);
    }
  };

  return (
    <div style={styles.container}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        slotDuration="01:00:00"
        height="90vh"
      />

      {/* MODAL */}
      <SlotModal
        visible={modalVisible}
        slotId={selectedSlotId}
        onClose={() => setModalVisible(false)}
        onDeleted={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
      />
    </div>
  );
};

// ----------------- STYLES -----------------
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "20px auto",
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
};

export default MasterScheduleCalendar;
