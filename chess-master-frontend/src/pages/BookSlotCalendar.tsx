import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { API_URL } from '../services/config';
import { useParams } from 'react-router-dom';
import { bookSlot } from '../services/schedule';

const BookSlotCalendar: React.FC = () => {
	const [events, setEvents] = useState<any[]>([]);
	const [masterInfo, setMasterInfo] = useState<any>(null);
	const { userId } = useParams<{ userId: string }>();

	// ------------------------------
	// MAP STATUS → TITLE + COLOR
	// ------------------------------
	const mapStatusToEvent = (slot: any) => {
		let title = 'Unknown';
		let color = '#777';
		let textColor = '#fff';

		switch (slot.status) {
			case 'free':
				title = 'Available - Click to Book';
				color = '#27ae60';
				textColor = '#fff';
				break;

			case 'reserved':
				title = 'Reserved';
				color = '#f39c12';
				textColor = '#fff';
				break;

			case 'booked':
				title = 'Booked';
				color = '#e74c3c';
				textColor = '#fff';
				break;
		}

		return {
			id: slot.id,
			title,
			start: slot.startTime,
			end: slot.endTime,
			backgroundColor: color,
			borderColor: color,
			textColor: textColor,
			// Only allow clicking on free slots
			classNames: slot.status === 'free' ? ['bookable-slot'] : [],
		};
	};

	// ---------------------------------------------------
	// LOAD MASTER INFO
	// ---------------------------------------------------
	useEffect(() => {
		const loadMasterInfo = async () => {
			try {
				const res = await axios.get(`${API_URL}/users`, {
					params: { isMaster: true },
					withCredentials: true,
				});
				const master = res.data.users.find(
					(u: any) => u.id === Number(userId)
				);
				setMasterInfo(master);
			} catch (err) {
				console.error('Failed to load master info', err);
			}
		};

		if (userId) {
			loadMasterInfo();
		}
	}, [userId]);

	// ---------------------------------------------------
	// LOAD EXISTING SLOTS
	// ---------------------------------------------------
	useEffect(() => {
		const loadSlots = async () => {
			try {
				const res = await axios.get(
					`${API_URL}/schedule/slot/user/${userId}`,
					{
						withCredentials: true,
					}
				);

				const slots = res.data.slots || [];
				setEvents(slots.map(mapStatusToEvent));
			} catch (err) {
				console.error('Failed to load slots', err);
			}
		};

		if (userId) {
			loadSlots();
		}
	}, [userId]);

	// ---------------------------------------------------
	// BOOK SLOT
	// ---------------------------------------------------
	const handleEventClick = async (info: any) => {
		const slotId = Number(info.event.id);

		// Only allow booking free slots (green color)
		if (info.event.backgroundColor !== '#27ae60') {
			return;
		}

		if (
			!window.confirm(
				`Book this time slot?\n${info.event.startStr} - ${info.event.endStr}`
			)
		) {
			return;
		}

		try {
			await bookSlot(slotId);
			// Reload slots to update the UI
			const res = await axios.get(
				`${API_URL}/schedule/slot/user/${userId}`,
				{
					withCredentials: true,
				}
			);
			const slots = res.data.slots || [];
			setEvents(slots.map(mapStatusToEvent));
			alert('Slot booked successfully!');
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
			{masterInfo && (
				<div style={styles.header}>
					<h2 style={styles.title}>
						{masterInfo.username}
						{masterInfo.title && (
							<span style={styles.titleTag}>
								{' '}
								{masterInfo.title}
							</span>
						)}
						's Schedule
					</h2>
					{masterInfo.rating && (
						<p style={styles.rating}>Rating: {masterInfo.rating}</p>
					)}
					<p style={styles.instruction}>
						Click on green "Available" slots to book a session
					</p>
				</div>
			)}

			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
				initialView='timeGridWeek'
				selectable={false}
				editable={false}
				events={events}
				eventClick={handleEventClick}
				slotDuration='01:00:00'
				height='85vh'
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay',
				}}
			/>

			<div style={styles.legend}>
				<div style={styles.legendItem}>
					<div
						style={{
							...styles.legendColor,
							background: '#27ae60',
						}}></div>
					<span>Available - Click to Book</span>
				</div>
				<div style={styles.legendItem}>
					<div
						style={{
							...styles.legendColor,
							background: '#f39c12',
						}}></div>
					<span>Reserved</span>
				</div>
				<div style={styles.legendItem}>
					<div
						style={{
							...styles.legendColor,
							background: '#e74c3c',
						}}></div>
					<span>Booked</span>
				</div>
			</div>
		</div>
	);
};

// ----------------- STYLES -----------------
const styles: Record<string, React.CSSProperties> = {
	container: {
		maxWidth: '1200px',
		margin: '20px auto',
		background: '#fff',
		padding: 20,
		borderRadius: 10,
		boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
	},
	header: {
		marginBottom: 24,
		paddingBottom: 20,
		borderBottom: '1px solid #e0e0e0',
	},
	title: {
		fontSize: '28px',
		fontWeight: 700,
		color: '#2c3e50',
		marginBottom: 8,
	},
	titleTag: {
		background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
		color: 'white',
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: '6px',
		fontSize: '14px',
		fontWeight: 600,
		marginLeft: 8,
	},
	rating: {
		fontSize: '16px',
		color: '#7f8c8d',
		marginBottom: 12,
	},
	instruction: {
		fontSize: '15px',
		color: '#3498db',
		fontWeight: 500,
		marginTop: 8,
	},
	legend: {
		display: 'flex',
		gap: 24,
		marginTop: 20,
		paddingTop: 20,
		borderTop: '1px solid #e0e0e0',
		justifyContent: 'center',
		flexWrap: 'wrap',
	},
	legendItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontSize: '14px',
		color: '#2c3e50',
	},
	legendColor: {
		width: 20,
		height: 20,
		borderRadius: 4,
	},
};

export default BookSlotCalendar;
