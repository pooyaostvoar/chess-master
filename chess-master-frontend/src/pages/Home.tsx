import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, User, BookOpen, BarChart3, Crown } from 'lucide-react';

const Home: React.FC = () => {
	const navigate = useNavigate();
	const { user, loading: userLoading } = useUser();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Wait for user to load
		if (!userLoading) {
			if (!user) {
				navigate('/login');
			} else {
				setLoading(false);
			}
		}
	}, [user, userLoading, navigate]);

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh]'>
				<div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5' />
				<p className='text-muted-foreground'>Loading...</p>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-5 py-10'>
			<div className='text-center mb-16'>
				<h1 className='text-4xl md:text-5xl font-bold mb-4'>
					Welcome back, {user?.username || 'Chess Player'}!
				</h1>
				<p className='text-lg text-muted-foreground'>
					{user?.isMaster
						? 'Manage your schedule and connect with students'
						: 'Find your perfect chess master and book a session'}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
				{user?.isMaster ? (
					<>
						<Card
							className='cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => navigate(`/calendar/${user.id}`)}>
							<CardHeader>
								<Calendar className='h-12 w-12 text-primary mb-2' />
								<CardTitle>My Schedule</CardTitle>
								<CardDescription>
									Manage your availability and upcoming
									sessions
								</CardDescription>
							</CardHeader>
						</Card>

						<Card
							className='cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => navigate('/edit-profile')}>
							<CardHeader>
								<User className='h-12 w-12 text-primary mb-2' />
								<CardTitle>My Profile</CardTitle>
								<CardDescription>
									Update your profile, rating, and bio
								</CardDescription>
							</CardHeader>
						</Card>

						<Card
							className='cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => navigate('/bookings')}>
							<CardHeader>
								<BookOpen className='h-12 w-12 text-primary mb-2' />
								<CardTitle>My Bookings</CardTitle>
								<CardDescription>
									View slot requests and confirmed bookings
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className='cursor-not-allowed opacity-60 relative'>
							<Badge
								className='absolute top-4 right-4'
								variant='warning'>
								Coming Soon
							</Badge>
							<CardHeader>
								<BarChart3 className='h-12 w-12 text-muted-foreground mb-2' />
								<CardTitle>Statistics</CardTitle>
								<CardDescription>
									View your performance metrics
								</CardDescription>
							</CardHeader>
						</Card>
					</>
				) : (
					<>
						<Card
							className='cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => navigate('/masters')}>
							<CardHeader>
								<Crown className='h-12 w-12 text-primary mb-2' />
								<CardTitle>Browse Masters</CardTitle>
								<CardDescription>
									Discover and book sessions with chess
									masters
								</CardDescription>
							</CardHeader>
						</Card>

						<Card
							className='cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => navigate('/edit-profile')}>
							<CardHeader>
								<User className='h-12 w-12 text-primary mb-2' />
								<CardTitle>My Profile</CardTitle>
								<CardDescription>
									View and edit your profile settings
								</CardDescription>
							</CardHeader>
						</Card>

						<Card
							className='cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => navigate('/bookings')}>
							<CardHeader>
								<BookOpen className='h-12 w-12 text-primary mb-2' />
								<CardTitle>My Bookings</CardTitle>
								<CardDescription>
									View your upcoming and past sessions
								</CardDescription>
							</CardHeader>
						</Card>
					</>
				)}
			</div>

			{user?.isMaster && (
				<Card className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'>
					<CardHeader>
						<CardTitle className='text-3xl mb-6'>
							Master Dashboard
						</CardTitle>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<Card className='bg-white/15 backdrop-blur-sm'>
								<CardContent className='pt-6 text-center'>
									<div className='text-4xl font-bold mb-2'>
										{user.rating || 'Unrated'}
									</div>
									<div className='text-sm opacity-90'>
										Your Rating
									</div>
								</CardContent>
							</Card>
							<Card className='bg-white/15 backdrop-blur-sm'>
								<CardContent className='pt-6 text-center'>
									<div className='text-4xl font-bold mb-2'>
										{user.title || 'No Title'}
									</div>
									<div className='text-sm opacity-90'>
										Chess Title
									</div>
								</CardContent>
							</Card>
						</div>
					</CardHeader>
				</Card>
			)}
		</div>
	);
};

export default Home;
