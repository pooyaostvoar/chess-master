import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import EditSlotSection from "./EditSlotSection";

interface EditSlotModalProps {
  visible: boolean;
  onClose: () => void;
  slotId: number | null;
}

const EditSlotModal: React.FC<EditSlotModalProps> = ({
  visible,
  onClose,
  slotId,
}) => {
  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Slot details</DialogTitle>
          <DialogDescription>Enter you slot's detail?</DialogDescription>
        </DialogHeader>
        <EditSlotSection id={slotId as number} onUpdate={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default EditSlotModal;
