import React from "react";
import { useParams } from "react-router-dom";

import EditSlotSection from "../components/slots/EditSlotSection";
import { usePageMeta } from "../lib/seo";

const EditSlot: React.FC = () => {
  usePageMeta({ title: "Edit slot", robots: "noindex" });
  const { id } = useParams<{ id: string }>();
  return <EditSlotSection id={Number(id)} />;
};

export default EditSlot;
