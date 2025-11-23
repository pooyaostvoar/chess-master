import { useEffect, useState } from 'react';
import { getSlotsByMaster } from '../services/schedule';
import { mapSlotToEvent } from '../utils/slotUtils';
import type { ScheduleSlot } from '../services/schedule';

interface UseScheduleSlotsOptions {
	showBookingHint?: boolean;
	isMasterView?: boolean;
}

export const useScheduleSlots = (
	userId: string | undefined,
	options?: UseScheduleSlotsOptions
) => {
	const [events, setEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadSlots = async () => {
			if (!userId) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const res = await getSlotsByMaster(Number(userId));
				const slots = res.slots || [];
				setEvents(
					slots.map((slot: ScheduleSlot) =>
						mapSlotToEvent(slot, {
							showBookingHint: options?.showBookingHint,
							isMasterView: options?.isMasterView,
						})
					)
				);
				setError(null);
			} catch (err) {
				console.error('Failed to load slots', err);
				setError('Failed to load schedule');
			} finally {
				setLoading(false);
			}
		};

		loadSlots();
	}, [userId, options?.showBookingHint]);

	const refreshSlots = async () => {
		if (!userId) return;

		try {
			const res = await getSlotsByMaster(Number(userId));
			const slots = res.slots || [];
			setEvents(
				slots.map((slot: ScheduleSlot) =>
					mapSlotToEvent(slot, {
						showBookingHint: options?.showBookingHint,
						isMasterView: options?.isMasterView,
					})
				)
			);
		} catch (err) {
			console.error('Failed to refresh slots', err);
		}
	};

	return { events, loading, error, refreshSlots, setEvents };
};

