// Re-export from organized API modules
export {
  createSlot,
  createBatchSlots,
  getSlotsByMaster,
  getMasterActiveSlots,
  deleteSlots,
  deleteBatchSlots,
  bookSlot,
  updateSlot,
  updateSlotStatus,
  getSlotById,
} from "./api/schedule.api";
export type {
  CreateSlotData,
  ScheduleSlot,
  CreateBatchSlotsInput,
  CreateBatchSlotsResponse,
  PeriodicSlotConfigSummary,
} from "./api/schedule.api";
export type {
  DeleteBatchSlotResponse,
  GetMasterSlotsResponse,
} from "@chess-master/schemas";
