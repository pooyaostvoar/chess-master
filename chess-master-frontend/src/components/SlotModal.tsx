import React from "react";
import axios from "axios";
import { deleteSlots } from "../services/schedule";

const API_URL = "http://localhost:3004";

interface SlotModalProps {
  visible: boolean;
  onClose: () => void;
  slotId: number | null;
  onDeleted?: (id: number) => void;
  onStatusChange?: (slot: any) => void; // optional UI update callback
}

const SlotModal: React.FC<SlotModalProps> = ({
  visible,
  onClose,
  slotId,
  onDeleted,
  onStatusChange,
}) => {
  if (!visible || slotId == null) return null;

  // -------------------------
  // DELETE SLOT
  // -------------------------
  const handleDelete = async () => {
    if (!window.confirm("Delete this slot?")) return;

    try {
      await deleteSlots([slotId]);
      onDeleted?.(slotId);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting slot");
    }
  };

  // -------------------------
  // UPDATE SLOT STATUS
  // -------------------------
  const updateStatus = async (status: "free" | "reserved" | "booked") => {
    try {
      const res = await axios.patch(
        `${API_URL}/schedule/slot/${slotId}/status`,
        { status },
        { withCredentials: true }
      );

      onStatusChange?.(res.data.slot);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const handleAccept = () => updateStatus("reserved");
  const handleBook = () => updateStatus("booked");
  const handleFree = () => updateStatus("free");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Slot Options</h3>

        <p>Slot ID: {slotId}</p>

        <div style={styles.actions}>
          <button style={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>

          <button style={styles.acceptBtn} onClick={handleAccept}>
            Mark as Reserved
          </button>

          <button style={styles.bookBtn} onClick={handleBook}>
            Mark as Booked
          </button>

          <button style={styles.freeBtn} onClick={handleFree}>
            Set Free
          </button>
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// ----------------- STYLES -----------------
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    background: "white",
    padding: 25,
    borderRadius: 10,
    width: "300px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  title: {
    marginTop: 0,
    marginBottom: 15,
    fontSize: 18,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  deleteBtn: {
    background: "#e74c3c",
    color: "white",
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  acceptBtn: {
    background: "#f39c12",
    color: "white",
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  bookBtn: {
    background: "#c0392b",
    color: "white",
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  freeBtn: {
    background: "#27ae60",
    color: "white",
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  closeBtn: {
    background: "#ccc",
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
};

export default SlotModal;
