/**
 * Maps slot status to calendar event format
 */
export const mapSlotToEvent = (
	slot: any,
	options?: { showBookingHint?: boolean; isMasterView?: boolean }
) => {
	let title = 'Unknown';
	let color = '#777';

	switch (slot.status) {
		case 'free':
			title = options?.showBookingHint
				? 'Available - Click to Book'
				: 'Available';
			color = '#27ae60';
			break;

		case 'reserved':
			// Show request info for masters, regular "Reserved" for others
			if (options?.isMasterView && slot.reservedBy) {
				title = `Request from ${slot.reservedBy.username || 'User'}`;
			} else {
				title = 'Reserved';
			}
			color = '#f39c12';
			break;

		case 'booked':
			title = 'Booked';
			color = '#e74c3c';
			break;
	}

	return {
		id: slot.id,
		title,
		start: slot.startTime,
		end: slot.endTime,
		backgroundColor: color,
		borderColor: color,
		textColor: '#fff',
		extendedProps: {
			fullSlot: slot, // Store full slot data for modal
		},
	};
};

