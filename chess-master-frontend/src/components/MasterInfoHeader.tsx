import React from 'react';

interface MasterInfoHeaderProps {
	masterInfo: {
		username: string;
		title?: string | null;
		rating?: number | null;
	};
}

const MasterInfoHeader: React.FC<MasterInfoHeaderProps> = ({ masterInfo }) => {
	return (
		<div style={styles.header}>
			<h2 style={styles.title}>
				{masterInfo.username}
				{masterInfo.title && (
					<span style={styles.titleTag}> {masterInfo.title}</span>
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
	);
};

const styles: Record<string, React.CSSProperties> = {
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
};

export default MasterInfoHeader;
