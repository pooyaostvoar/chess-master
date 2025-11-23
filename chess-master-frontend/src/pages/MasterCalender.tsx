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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // ------------------------------
  // MAP STATUS → TITLE + COLOR
  // ------------------------------
  const mapStatusToEvent = (slot: any) => {
    let title = "Unknown";
    let color = "#777";

    switch (slot.status) {
      case "free":
        title = "Available";
        color = "green";
        break;

      case "reserved":
        title = "Reserved";
        color = "orange";
        break;

      case "booked":
        title = "Booked";
        color = "red";
        break;
    }

    return {
      id: slot.id,
      title,
      start: slot.startTime,
      end: slot.endTime,
      backgroundColor: color,
      borderColor: color,
    };
  };

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
        setEvents(slots.map(mapStatusToEvent));
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

      setEvents((prev) => [...prev, mapStatusToEvent(newSlot)]);
    } catch (err) {
      console.error("Failed to create slot", err);
    }
  };

  // ---------------------------------------------------
  // OPEN MODAL
  // ---------------------------------------------------
  const handleEventClick = (info: any) => {
    setSelectedSlotId(Number(info.event.id));
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
  // RESIZE UPDATE
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

  // ---------------------------------------------------
  // HANDLE DELETE (FROM MODAL)
  // ---------------------------------------------------
  const handleDeleted = (deletedId: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== deletedId));
  };

  const handleStatusChange = (updatedSlot: any) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === updatedSlot.id ? mapStatusToEvent(updatedSlot) : e
      )
    );
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

      <SlotModal
        visible={modalVisible}
        slotId={selectedSlotId}
        onClose={() => setModalVisible(false)}
        onDeleted={handleDeleted}
        onStatusChange={handleStatusChange}
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
