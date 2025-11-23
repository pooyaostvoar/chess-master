import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getMyBookings, getMasterBookings } from '../services/bookings';
import type { Booking } from '../services/bookings';

const MyBookings: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadBookings = async () => {
			try {
				setLoading(true);
				const res = user?.isMaster
					? await getMasterBookings()
					: await getMyBookings();
				setBookings(res.bookings || []);
				setError(null);
			} catch (err) {
				console.error('Failed to load bookings', err);
				setError('Failed to load bookings');
			} finally {
				setLoading(false);
			}
		};

		loadBookings();
	}, [user?.isMaster]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'free':
				return '#27ae60';
			case 'reserved':
				return '#f39c12';
			case 'booked':
				return '#27ae60'; // Green for confirmed
			default:
				return '#777';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'free':
				return 'Available';
			case 'reserved':
				return 'Pending Approval';
			case 'booked':
				return 'Confirmed';
			default:
				return status;
		}
	};

	if (loading) {
		return (
			<div style={styles.loadingContainer}>
				<div style={styles.spinner}></div>
				<p>Loading bookings...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={styles.errorContainer}>
				<p style={styles.error}>{error}</p>
			</div>
		);
	}

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<h1 style={styles.title}>
					{user?.isMaster ? 'My Bookings' : 'My Bookings'}
				</h1>
				<p style={styles.subtitle}>
					{user?.isMaster
						? 'View all slot requests and confirmed bookings'
						: 'View your upcoming and past sessions with masters'}
				</p>
			</div>

			{bookings.length === 0 ? (
				<div style={styles.emptyState}>
					<div style={styles.emptyIcon}>📅</div>
					<h2 style={styles.emptyTitle}>No bookings yet</h2>
					<p style={styles.emptyText}>
						{user?.isMaster
							? "You don't have any slot requests or bookings yet."
							: "You haven't booked any sessions yet. Browse masters to get started!"}
					</p>
					{!user?.isMaster && (
						<button
							style={styles.browseButton}
							onClick={() => navigate('/masters')}>
							Browse Masters
						</button>
					)}
				</div>
			) : (
				<div style={styles.bookingsList}>
					{bookings.map((booking) => (
						<div
							key={booking.id}
							style={styles.bookingCard}>
							<div style={styles.cardHeader}>
								<div style={styles.timeInfo}>
									<div style={styles.date}>
										{formatDate(booking.startTime)}
									</div>
									<div style={styles.duration}>
										{new Date(booking.endTime).getHours() -
											new Date(
												booking.startTime
											).getHours()}{' '}
										hour
										{new Date(booking.endTime).getHours() -
											new Date(
												booking.startTime
											).getHours() !==
											1 && 's'}
									</div>
								</div>
								<div
									style={{
										...styles.statusBadge,
										background: getStatusColor(
											booking.status
										),
									}}>
									{getStatusLabel(booking.status)}
								</div>
							</div>

							<div style={styles.cardBody}>
								{user?.isMaster ? (
									<div style={styles.userInfo}>
										<div style={styles.avatar}>
											{booking.reservedBy?.username
												?.charAt(0)
												.toUpperCase() || 'U'}
										</div>
										<div style={styles.userDetails}>
											<h3 style={styles.userName}>
												{booking.reservedBy?.username ||
													'Unknown User'}
											</h3>
											{booking.reservedBy?.email && (
												<p style={styles.userEmail}>
													{booking.reservedBy.email}
												</p>
											)}
										</div>
									</div>
								) : (
									<div style={styles.userInfo}>
										<div style={styles.avatar}>
											{booking.master?.username
												?.charAt(0)
												.toUpperCase() || 'M'}
										</div>
										<div style={styles.userDetails}>
											<h3 style={styles.userName}>
												{booking.master?.username ||
													'Unknown Master'}
												{booking.master?.title && (
													<span
														style={styles.titleTag}>
														{' '}
														{booking.master.title}
													</span>
												)}
											</h3>
											{booking.master?.rating && (
												<p style={styles.rating}>
													Rating:{' '}
													{booking.master.rating}
												</p>
											)}
										</div>
									</div>
								)}
							</div>

							{booking.status === 'reserved' &&
								!user?.isMaster && (
									<div style={styles.pendingNote}>
										⏳ Waiting for master approval
									</div>
								)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const styles: Record<string, React.CSSProperties> = {
	container: {
		maxWidth: '1200px',
		margin: '0 auto',
		padding: '40px 20px',
	},
	loadingContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '60vh',
		color: '#7f8c8d',
	},
	spinner: {
		width: '40px',
		height: '40px',
		border: '4px solid #e0e0e0',
		borderTop: '4px solid #3498db',
		borderRadius: '50%',
		animation: 'spin 1s linear infinite',
		marginBottom: '20px',
	},
	errorContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '60vh',
	},
	error: {
		color: '#e74c3c',
		fontSize: '18px',
		padding: '20px',
		background: '#fee',
		borderRadius: '8px',
	},
	header: {
		textAlign: 'center',
		marginBottom: '48px',
	},
	title: {
		fontSize: '42px',
		fontWeight: 700,
		color: '#2c3e50',
		marginBottom: '12px',
		lineHeight: 1.2,
	},
	subtitle: {
		fontSize: '18px',
		color: '#7f8c8d',
		lineHeight: 1.6,
	},
	emptyState: {
		textAlign: 'center',
		padding: '60px 20px',
		background: 'white',
		borderRadius: '16px',
		boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
	},
	emptyIcon: {
		fontSize: '64px',
		marginBottom: '20px',
	},
	emptyTitle: {
		fontSize: '24px',
		fontWeight: 600,
		color: '#2c3e50',
		marginBottom: '12px',
	},
	emptyText: {
		fontSize: '16px',
		color: '#7f8c8d',
		marginBottom: '24px',
	},
	browseButton: {
		padding: '12px 24px',
		background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
		color: '#fff',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontSize: '16px',
		fontWeight: 600,
		transition: 'all 0.3s ease',
	},
	bookingsList: {
		display: 'grid',
		gap: '20px',
	},
	bookingCard: {
		background: 'white',
		padding: '24px',
		borderRadius: '16px',
		boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
		transition: 'all 0.3s ease',
	},
	cardHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: '20px',
		paddingBottom: '20px',
		borderBottom: '1px solid #e0e0e0',
	},
	timeInfo: {
		flex: 1,
	},
	date: {
		fontSize: '18px',
		fontWeight: 600,
		color: '#2c3e50',
		marginBottom: '8px',
	},
	duration: {
		fontSize: '14px',
		color: '#7f8c8d',
	},
	statusBadge: {
		padding: '6px 12px',
		borderRadius: '20px',
		color: 'white',
		fontSize: '12px',
		fontWeight: 600,
		textTransform: 'uppercase',
	},
	cardBody: {
		marginBottom: '16px',
	},
	userInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: '16px',
	},
	avatar: {
		width: '56px',
		height: '56px',
		borderRadius: '50%',
		background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: 'white',
		fontSize: '24px',
		fontWeight: 700,
		flexShrink: 0,
	},
	userDetails: {
		flex: 1,
	},
	userName: {
		fontSize: '20px',
		fontWeight: 600,
		color: '#2c3e50',
		marginBottom: '4px',
	},
	titleTag: {
		background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
		color: 'white',
		display: 'inline-block',
		padding: '2px 8px',
		borderRadius: '4px',
		fontSize: '12px',
		fontWeight: 600,
		marginLeft: '8px',
	},
	userEmail: {
		fontSize: '14px',
		color: '#7f8c8d',
		margin: 0,
	},
	rating: {
		fontSize: '14px',
		color: '#7f8c8d',
		margin: 0,
	},
	pendingNote: {
		padding: '12px',
		background: '#fff9e6',
		borderLeft: '4px solid #f39c12',
		borderRadius: '8px',
		fontSize: '14px',
		color: '#856404',
		fontWeight: 500,
	},
};

export default MyBookings;
