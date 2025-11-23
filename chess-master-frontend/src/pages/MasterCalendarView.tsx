import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createSlot } from '../services/schedule';
import { useScheduleSlots } from '../hooks/useScheduleSlots';
import { mapSlotToEvent } from '../utils/slotUtils';
import ScheduleCalendar from '../components/ScheduleCalendar';
import SlotModal from '../components/SlotModal';

const MasterCalendarView: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const { events, setEvents, refreshSlots } = useScheduleSlots(userId, {
		isMasterView: true,
	});
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<any>(null);

	// Create new slot
	const handleSelect = async (info: any) => {
		const start = info.startStr;
		const end = info.endStr;

		try {
			const res = await createSlot({ startTime: start, endTime: end });
			const newSlot = res.slot;
			setEvents((prev) => [...prev, mapSlotToEvent(newSlot)]);
		} catch (err) {
			console.error('Failed to create slot', err);
		}
	};

	// Open modal to manage slot
	const handleEventClick = (info: any) => {
		setSelectedSlotId(Number(info.event.id));
		setSelectedSlot(info.event.extendedProps?.slot || null);
		setModalVisible(true);
	};

	// Drag & drop update (Note: This endpoint doesn't exist yet, keeping for future implementation)
	const handleEventDrop = async (info: any) => {
		// TODO: Implement slot update endpoint
		console.log('Drag & drop update not yet implemented', info);
	};

	// Resize update (Note: This endpoint doesn't exist yet, keeping for future implementation)
	const handleEventResize = async (info: any) => {
		// TODO: Implement slot update endpoint
		console.log('Resize update not yet implemented', info);
	};

	// Handle delete from modal
	const handleDeleted = (deletedId: number) => {
		setEvents((prev) => prev.filter((e) => e.id !== deletedId));
	};

	const handleStatusChange = (updatedSlot: any) => {
		setEvents((prev) =>
			prev.map((e) =>
				e.id === updatedSlot.id
					? mapSlotToEvent(updatedSlot, { isMasterView: true })
					: e
			)
		);
		// Refresh to get updated relations
		refreshSlots();
	};

	return (
		<div style={styles.container}>
			<ScheduleCalendar
				events={events}
				selectable={true}
				editable={true}
				onSelect={handleSelect}
				onEventClick={handleEventClick}
				onEventDrop={handleEventDrop}
				onEventResize={handleEventResize}
				height='90vh'
			/>

			<SlotModal
				visible={modalVisible}
				slotId={selectedSlotId}
				slot={selectedSlot}
				onClose={() => {
					setModalVisible(false);
					setSelectedSlot(null);
				}}
				onDeleted={handleDeleted}
				onStatusChange={handleStatusChange}
			/>
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

export default MasterCalendarView;
