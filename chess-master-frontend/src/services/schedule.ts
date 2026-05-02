// Re-export from organized API modules
export {
  createSlot,
  createPeriodicBatchSlots,
  getSlotsByMaster,
  getMasterActiveSlots,
  deleteSlots,
  deleteBatchSlots,
  updatePeriodicBatchSlots,
  bookSlot,
  updateSlot,
  updateSlotStatus,
  getSlotById,
} from "./api/schedule.api";
export type {
  CreateSlotData,
  ScheduleSlot,
  CreatePeriodicBatchSlotsInput,
  CreatePeriodicBatchSlotsResponse,
  PeriodicSlotConfigSummary,
} from "./api/schedule.api";
export type {
  DeleteBatchSlotResponse,
  GetMasterSlotsResponse,
  UpdatePeriodicBatchSlotInput,
  UpdatePeriodicBatchSlotResponse,
} from "@chess-master/schemas";
