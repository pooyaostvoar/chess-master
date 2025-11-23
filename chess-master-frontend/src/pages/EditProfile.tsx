import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateUser } from '../services/auth';
import { useUser } from '../contexts/UserContext';

const EditProfile: React.FC = () => {
	const [formData, setFormData] = useState<any>(null);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success'
	);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { setUser } = useUser();

	useEffect(() => {
		const checkAuth = async () => {
			const response = await getMe();
			if (!response.user) {
				navigate('/login');
			} else {
				setFormData(response.user);
			}
		};

		checkAuth();
	}, [navigate]);

	if (!formData) {
		return (
			<div style={styles.loadingContainer}>
				<div style={styles.spinner}></div>
				<p>Loading profile...</p>
			</div>
		);
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		try {
			const data = await updateUser(formData.id, {
				email: formData.email,
				username: formData.username,
				title: formData.title,
				rating: formData.rating,
				bio: formData.bio,
				isMaster: formData.isMaster,
			});

			if (data.status === 'success') {
				setMessage('Profile updated successfully!');
				setMessageType('success');
				setUser(data.user);
			} else {
				setMessage('Something went wrong');
				setMessageType('error');
			}
		} catch (err) {
			console.error(err);
			setMessage('Error updating profile');
			setMessageType('error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<div style={styles.header}>
					<h2 style={styles.heading}>Edit Profile</h2>
					<p style={styles.subtitle}>
						Update your account information
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					style={styles.form}>
					<div style={styles.section}>
						<h3 style={styles.sectionTitle}>Basic Information</h3>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Username</label>
							<input
								type='text'
								name='username'
								value={formData.username || ''}
								onChange={handleChange}
								style={styles.input}
								placeholder='Your username'
							/>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Email</label>
							<input
								type='email'
								name='email'
								value={formData.email || ''}
								onChange={handleChange}
								style={styles.input}
								placeholder='your.email@example.com'
							/>
						</div>
					</div>

					<div style={styles.section}>
						<h3 style={styles.sectionTitle}>Chess Profile</h3>

						<div style={styles.inputGroup}>
							<label style={styles.label}>
								Chess Title (optional)
							</label>
							<select
								name='title'
								value={formData.title || ''}
								onChange={(e: any) => handleChange(e)}
								style={styles.select}>
								<option value=''>No title</option>
								<option value='CM'>
									CM - Candidate Master
								</option>
								<option value='FM'>FM - FIDE Master</option>
								<option value='IM'>
									IM - International Master
								</option>
								<option value='GM'>GM - Grandmaster</option>
							</select>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>
								Rating (optional)
							</label>
							<input
								type='number'
								name='rating'
								value={formData.rating || ''}
								onChange={handleChange}
								style={styles.input}
								placeholder='e.g., 2000'
							/>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Bio (optional)</label>
							<textarea
								name='bio'
								value={formData.bio || ''}
								onChange={handleChange}
								style={styles.textarea}
								placeholder='Tell us about your chess journey...'
								rows={4}
							/>
						</div>
					</div>

					<div style={styles.section}>
						<h3 style={styles.sectionTitle}>Account Type</h3>

						<div style={styles.checkboxWrapper}>
							<label style={styles.checkboxLabel}>
								<input
									type='checkbox'
									name='isMaster'
									checked={!!formData.isMaster}
									onChange={(e) =>
										setFormData((prev: any) => ({
											...prev,
											isMaster: e.target.checked,
										}))
									}
									style={styles.checkbox}
								/>
								<span style={styles.checkboxText}>
									I am a chess master and want to offer
									coaching sessions
								</span>
							</label>
						</div>
					</div>

					<button
						type='submit'
						style={{
							...styles.button,
							opacity: loading ? 0.7 : 1,
							cursor: loading ? 'not-allowed' : 'pointer',
						}}
						disabled={loading}>
						{loading ? 'Saving...' : 'Save Changes'}
					</button>
				</form>

				{message && (
					<div
						style={{
							...styles.message,
							background:
								messageType === 'success' ? '#e8f8f5' : '#fee',
							color:
								messageType === 'success'
									? '#27ae60'
									: '#e74c3c',
						}}>
						{message}
					</div>
				)}
			</div>
		</div>
	);
};

const styles: Record<string, React.CSSProperties> = {
	container: {
		maxWidth: '700px',
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
	card: {
		background: '#fff',
		borderRadius: '16px',
		padding: '40px',
		boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
	},
	header: {
		marginBottom: '32px',
	},
	heading: {
		fontSize: '32px',
		fontWeight: 700,
		color: '#2c3e50',
		marginBottom: '8px',
	},
	subtitle: {
		fontSize: '16px',
		color: '#7f8c8d',
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: '32px',
	},
	section: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
	},
	sectionTitle: {
		fontSize: '20px',
		fontWeight: 600,
		color: '#2c3e50',
		marginBottom: '8px',
		paddingBottom: '12px',
		borderBottom: '2px solid #e0e0e0',
	},
	inputGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
	},
	label: {
		fontSize: '14px',
		fontWeight: 600,
		color: '#2c3e50',
	},
	input: {
		padding: '12px 16px',
		fontSize: '15px',
		borderRadius: '8px',
		border: '2px solid #e0e0e0',
		outline: 'none',
		transition: 'all 0.2s ease',
		fontFamily: 'inherit',
	},
	select: {
		padding: '12px 16px',
		fontSize: '15px',
		borderRadius: '8px',
		border: '2px solid #e0e0e0',
		outline: 'none',
		transition: 'all 0.2s ease',
		fontFamily: 'inherit',
		background: 'white',
		cursor: 'pointer',
	},
	textarea: {
		padding: '12px 16px',
		fontSize: '15px',
		borderRadius: '8px',
		border: '2px solid #e0e0e0',
		outline: 'none',
		transition: 'all 0.2s ease',
		fontFamily: 'inherit',
		resize: 'vertical',
	},
	checkboxWrapper: {
		background: '#f8f9fa',
		padding: '16px',
		borderRadius: '8px',
	},
	checkboxLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		cursor: 'pointer',
	},
	checkbox: {
		width: '20px',
		height: '20px',
		cursor: 'pointer',
		flexShrink: 0,
	},
	checkboxText: {
		fontSize: '15px',
		color: '#2c3e50',
		lineHeight: 1.5,
	},
	button: {
		padding: '14px',
		background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
		color: '#fff',
		fontWeight: 600,
		fontSize: '16px',
		borderRadius: '8px',
		border: 'none',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
	},
	message: {
		marginTop: '20px',
		padding: '16px',
		borderRadius: '8px',
		textAlign: 'center',
		fontSize: '15px',
		fontWeight: 500,
	},
};

export default EditProfile;
