import React from 'react';
import { useParams } from 'react-router-dom';
import { bookSlot } from '../services/schedule';
import { useScheduleSlots } from '../hooks/useScheduleSlots';
import { useMasterInfo } from '../hooks/useMasterInfo';
import ScheduleCalendar from '../components/ScheduleCalendar';
import MasterInfoHeader from '../components/MasterInfoHeader';
import SlotLegend from '../components/SlotLegend';

const BookCalendarView: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const { events, refreshSlots } = useScheduleSlots(userId, {
		showBookingHint: true,
	});
	const { masterInfo } = useMasterInfo(userId);

	// Book a slot
	const handleEventClick = async (info: any) => {
		const slotId = Number(info.event.id);

		// Only allow booking free slots (green color)
		if (info.event.backgroundColor !== '#27ae60') {
			return;
		}

		if (
			!window.confirm(
				`Request this time slot?\n${info.event.startStr} - ${info.event.endStr}\n\nThe master will need to approve your request.`
			)
		) {
			return;
		}

		try {
			await bookSlot(slotId);
			// Reload slots to update the UI
			await refreshSlots();
			alert('Slot request sent! The master will review your request.');
		} catch (err: any) {
			console.error('Failed to book slot', err);
			alert(
				err.response?.data?.error ||
					'Failed to book slot. Please try again.'
			);
		}
	};

	return (
		<div style={styles.container}>
			{masterInfo && <MasterInfoHeader masterInfo={masterInfo} />}

			<ScheduleCalendar
				events={events}
				selectable={false}
				editable={false}
				onEventClick={handleEventClick}
				height='85vh'
			/>

			<SlotLegend />
		</div>
	);
};

const styles: Record<string, React.CSSProperties> = {
	container: {
		maxWidth: '1200px',
		margin: '20px auto',
		background: '#fff',
		padding: 20,
		borderRadius: 10,
		boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
	},
};

export default BookCalendarView;
