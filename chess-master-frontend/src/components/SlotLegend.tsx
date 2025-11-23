import React from 'react';

const SlotLegend: React.FC = () => {
	return (
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
	);
};

const styles: Record<string, React.CSSProperties> = {
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

export default SlotLegend;
