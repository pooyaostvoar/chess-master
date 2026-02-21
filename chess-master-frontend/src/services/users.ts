import { keyBy } from "lodash-es";
import { User } from "./auth";

export function sortMastersByEvents(masters: User[], events: any[]) {
  const evetsByMasterId = keyBy(events, (e) => e.master.id);

  const sortedMasters = masters.sort((a, b) => {
    return evetsByMasterId[b.id] ? 1 : evetsByMasterId[a.id] ? -1 : 0;
  });

  return sortedMasters;
}
