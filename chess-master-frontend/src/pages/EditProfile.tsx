import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateUser } from '../services/auth';
import { useUser } from '../contexts/UserContext';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Upload, X } from 'lucide-react';

const EditProfile: React.FC = () => {
	const [formData, setFormData] = useState<any>(null);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success'
	);
	const [loading, setLoading] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const navigate = useNavigate();
	const { setUser } = useUser();

	useEffect(() => {
		const checkAuth = async () => {
			const response = await getMe();
			if (!response.user) {
				navigate('/login');
			} else {
				setFormData(response.user);
				if (response.user.profilePicture) {
					setPreviewImage(response.user.profilePicture);
				}
			}
		};

		checkAuth();
	}, [navigate]);

	if (!formData) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh]'>
				<div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5' />
				<p className='text-muted-foreground'>Loading profile...</p>
			</div>
		);
	}

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				setMessage('Please select an image file');
				setMessageType('error');
				return;
			}

			// Validate file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				setMessage('Image size should be less than 2MB');
				setMessageType('error');
				return;
			}

			const reader = new FileReader();
			reader.onerror = () => {
				setMessage('Error reading image file. Please try again.');
				setMessageType('error');
			};
			reader.onloadend = () => {
				try {
					const base64String = reader.result as string;
					if (!base64String) {
						throw new Error('Failed to read image');
					}
					setPreviewImage(base64String);
					setFormData({ ...formData, profilePicture: base64String });
					setMessage('Image loaded successfully');
					setMessageType('success');
					// Clear success message after 2 seconds
					setTimeout(() => setMessage(''), 2000);
				} catch (err) {
					console.error('Error processing image:', err);
					setMessage('Error processing image. Please try again.');
					setMessageType('error');
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const removeImage = () => {
		setPreviewImage(null);
		setFormData({ ...formData, profilePicture: null });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		try {
			// Log the data being sent (without the full base64 string for debugging)
			console.log('Updating profile with:', {
				...formData,
				profilePicture: formData.profilePicture
					? `${formData.profilePicture.substring(0, 50)}... (${
							formData.profilePicture.length
					  } chars)`
					: null,
			});

			const data = await updateUser(formData.id, {
				email: formData.email,
				username: formData.username,
				title: formData.title,
				rating: formData.rating,
				bio: formData.bio,
				isMaster: formData.isMaster,
				profilePicture: formData.profilePicture,
				chesscomUrl: formData.chesscomUrl,
				lichessUrl: formData.lichessUrl,
			});

			if (data.status === 'success') {
				setMessage('Profile updated successfully!');
				setMessageType('success');
				setUser(data.user);
				// Update preview image if profile picture was changed
				if (data.user.profilePicture) {
					setPreviewImage(data.user.profilePicture);
				} else {
					setPreviewImage(null);
				}
			} else {
				setMessage('Something went wrong');
				setMessageType('error');
			}
		} catch (err: any) {
			console.error('Error updating profile:', err);
			const errorMessage =
				err.response?.data?.error ||
				err.message ||
				'Error updating profile. Please try again.';
			setMessage(errorMessage);
			setMessageType('error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-3xl mx-auto px-5 py-10'>
			<Card>
				<CardHeader>
					<CardTitle className='text-3xl'>Edit Profile</CardTitle>
					<CardDescription>
						Update your account information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className='space-y-8'>
						{/* Profile Picture Section */}
						<div className='space-y-4'>
							<h3 className='text-xl font-semibold'>
								Profile Picture
							</h3>
							<div className='flex items-start gap-6'>
								<div className='flex-shrink-0'>
									{previewImage ? (
										<div className='relative'>
											<img
												src={previewImage}
												alt='Profile preview'
												className='w-32 h-32 rounded-full object-cover border-4 border-primary'
											/>
											<button
												type='button'
												onClick={removeImage}
												className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90'>
												<X className='h-4 w-4' />
											</button>
										</div>
									) : (
										<div className='w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary'>
											<span className='text-4xl font-bold text-muted-foreground'>
												{formData.username
													?.charAt(0)
													.toUpperCase() || '?'}
											</span>
										</div>
									)}
								</div>
								<div className='flex-1'>
									<Label
										htmlFor='profilePicture'
										className='mb-2 block'>
										Upload Profile Picture
									</Label>
									<div className='flex items-center gap-4'>
										<Label
											htmlFor='profilePicture'
											className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'>
											<Upload className='h-4 w-4' />
											Choose Image
										</Label>
										<Input
											id='profilePicture'
											type='file'
											accept='image/*'
											onChange={handleImageChange}
											className='hidden'
										/>
										<p className='text-sm text-muted-foreground'>
											JPG, PNG or GIF. Max size 2MB
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Basic Information */}
						<div className='space-y-4'>
							<h3 className='text-xl font-semibold'>
								Basic Information
							</h3>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='username'>Username</Label>
									<Input
										id='username'
										type='text'
										name='username'
										value={formData.username || ''}
										onChange={handleChange}
										placeholder='Your username'
									/>
								</div>

								<div>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										type='email'
										name='email'
										value={formData.email || ''}
										onChange={handleChange}
										placeholder='your.email@example.com'
									/>
								</div>
							</div>
						</div>

						{/* Chess Profile */}
						<div className='space-y-4'>
							<h3 className='text-xl font-semibold'>
								Chess Profile
							</h3>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='title'>
										Chess Title (optional)
									</Label>
									<select
										id='title'
										name='title'
										value={formData.title || ''}
										onChange={handleChange}
										className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
										<option value=''>No title</option>
										<option value='CM'>
											CM - Candidate Master
										</option>
										<option value='FM'>
											FM - FIDE Master
										</option>
										<option value='IM'>
											IM - International Master
										</option>
										<option value='GM'>
											GM - Grandmaster
										</option>
									</select>
								</div>

								<div>
									<Label htmlFor='rating'>
										Rating (optional)
									</Label>
									<Input
										id='rating'
										type='number'
										name='rating'
										value={formData.rating || ''}
										onChange={handleChange}
										placeholder='e.g., 2000'
									/>
								</div>

								<div>
									<Label htmlFor='bio'>Bio (optional)</Label>
									<Textarea
										id='bio'
										name='bio'
										value={formData.bio || ''}
										onChange={handleChange}
										placeholder='Tell us about your chess journey...'
										rows={4}
									/>
								</div>
							</div>
						</div>

						{/* Chess Platform URLs */}
						<div className='space-y-4'>
							<h3 className='text-xl font-semibold'>
								Chess Platform Profiles
							</h3>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='chesscomUrl'>
										Chess.com Username/URL (optional)
									</Label>
									<Input
										id='chesscomUrl'
										type='text'
										name='chesscomUrl'
										value={formData.chesscomUrl || ''}
										onChange={handleChange}
										placeholder='e.g., username or https://www.chess.com/member/username'
									/>
								</div>

								<div>
									<Label htmlFor='lichessUrl'>
										Lichess Username/URL (optional)
									</Label>
									<Input
										id='lichessUrl'
										type='text'
										name='lichessUrl'
										value={formData.lichessUrl || ''}
										onChange={handleChange}
										placeholder='e.g., username or https://lichess.org/@/username'
									/>
								</div>
							</div>
						</div>

						{/* Account Type */}
						<div className='space-y-4'>
							<h3 className='text-xl font-semibold'>
								Account Type
							</h3>
							<div className='flex items-center space-x-2 p-4 bg-muted rounded-lg'>
								<input
									type='checkbox'
									id='isMaster'
									name='isMaster'
									checked={!!formData.isMaster}
									onChange={(e) =>
										setFormData((prev: any) => ({
											...prev,
											isMaster: e.target.checked,
										}))
									}
									className='h-4 w-4 rounded border-gray-300'
								/>
								<Label
									htmlFor='isMaster'
									className='cursor-pointer'>
									I am a chess master and want to offer
									coaching sessions
								</Label>
							</div>
						</div>

						<Button
							type='submit'
							disabled={loading}
							className='w-full'
							size='lg'>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>

						{message && (
							<div
								className={`p-4 rounded-md text-center ${
									messageType === 'success'
										? 'bg-green-50 text-green-800'
										: 'bg-red-50 text-red-800'
								}`}>
								{message}
							</div>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default EditProfile;
