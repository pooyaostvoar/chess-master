import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useUser } from '../contexts/UserContext';

const Login: React.FC = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { setUser } = useUser();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		try {
			const data = await login(username, password);

			if (data.status === 'success') {
				setUser(data.user);
				navigate('/home');
			} else {
				setMessage('Invalid username or password');
			}
		} catch (err) {
			console.error(err);
			setMessage('Error logging in. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.leftPanel}>
				<div style={styles.branding}>
					<h1 style={styles.brandTitle}>Chess Master</h1>
					<p style={styles.brandSubtitle}>
						Connect with world-class chess masters and elevate your
						game
					</p>
					<div style={styles.features}>
						<div style={styles.feature}>
							<span style={styles.checkmark}>✓</span>
							<span>Book sessions with top masters</span>
						</div>
						<div style={styles.feature}>
							<span style={styles.checkmark}>✓</span>
							<span>Flexible scheduling</span>
						</div>
						<div style={styles.feature}>
							<span style={styles.checkmark}>✓</span>
							<span>Personalized training</span>
						</div>
					</div>
				</div>
			</div>

			<div style={styles.rightPanel}>
				<div style={styles.card}>
					<h2 style={styles.title}>Welcome Back</h2>
					<p style={styles.subtitle}>
						Sign in to continue your journey
					</p>

					<form
						onSubmit={handleSubmit}
						style={styles.form}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Username</label>
							<input
								type='text'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								style={styles.input}
								placeholder='Enter your username'
							/>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Password</label>
							<input
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								style={styles.input}
								placeholder='Enter your password'
							/>
						</div>

						<button
							type='submit'
							style={{
								...styles.button,
								opacity: loading ? 0.7 : 1,
								cursor: loading ? 'not-allowed' : 'pointer',
							}}
							disabled={loading}>
							{loading ? 'Signing in...' : 'Sign In'}
						</button>
					</form>

					{message && <p style={styles.message}>{message}</p>}

					<div style={styles.footer}>
						<span style={styles.footerText}>
							Don't have an account?
						</span>
						<button
							style={styles.linkButton}
							onClick={() => navigate('/signup')}>
							Create Account
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const styles: Record<string, React.CSSProperties> = {
	container: {
		display: 'flex',
		minHeight: '100vh',
	},
	leftPanel: {
		flex: 1,
		background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '40px',
		color: 'white',
	},
	branding: {
		maxWidth: '500px',
	},
	brandTitle: {
		fontSize: '48px',
		fontWeight: 700,
		marginBottom: '20px',
		lineHeight: 1.2,
	},
	brandSubtitle: {
		fontSize: '20px',
		lineHeight: 1.6,
		marginBottom: '40px',
		opacity: 0.9,
	},
	features: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
	},
	feature: {
		display: 'flex',
		alignItems: 'center',
		gap: '15px',
		fontSize: '18px',
	},
	checkmark: {
		fontSize: '24px',
		fontWeight: 'bold',
		color: '#27ae60',
	},
	rightPanel: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '40px',
		background: '#f8f9fa',
	},
	card: {
		width: '100%',
		maxWidth: '420px',
		padding: '40px',
		borderRadius: '16px',
		background: 'white',
		boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
	},
	title: {
		fontSize: '32px',
		fontWeight: 700,
		marginBottom: '8px',
		color: '#2c3e50',
	},
	subtitle: {
		fontSize: '16px',
		color: '#7f8c8d',
		marginBottom: '32px',
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
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
	button: {
		marginTop: '10px',
		padding: '14px',
		background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
		color: 'white',
		fontSize: '16px',
		fontWeight: 600,
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
	},
	footer: {
		marginTop: '24px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: '8px',
		paddingTop: '24px',
		borderTop: '1px solid #e0e0e0',
	},
	footerText: {
		fontSize: '14px',
		color: '#7f8c8d',
	},
	linkButton: {
		background: 'none',
		border: 'none',
		padding: 0,
		color: '#3498db',
		cursor: 'pointer',
		fontWeight: 600,
		fontSize: '14px',
		textDecoration: 'none',
	},
	message: {
		marginTop: '16px',
		padding: '12px',
		textAlign: 'center',
		color: '#e74c3c',
		background: '#fee',
		borderRadius: '8px',
		fontSize: '14px',
	},
};

export default Login;
