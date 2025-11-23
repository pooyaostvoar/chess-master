// Re-export from organized API modules
export {
  createSlot,
  getSlotsByMaster,
  deleteSlots,
  bookSlot,
  updateSlotStatus,
} from './api/schedule.api';
export type { CreateSlotData, ScheduleSlot } from './api/schedule.api';
