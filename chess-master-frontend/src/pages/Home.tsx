import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { API_URL } from '../services/config';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
	Crown,
	TrendingUp,
	BookOpen,
	ArrowRight,
	ExternalLink,
	Calendar,
	Clock,
} from 'lucide-react';
import { getMyBookings, getMasterBookings } from '../services/bookings';
import moment from 'moment';

const Home: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	const [topMasters, setTopMasters] = useState<any[]>([]);
	const [recommendedMasters, setRecommendedMasters] = useState<any[]>([]);
	const [recentBookings, setRecentBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [bookingsLoading, setBookingsLoading] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			try {
				const response = await axios.get(`${API_URL}/users`, {
					params: { isMaster: true },
					withCredentials: true,
				});

				const allMasters = response.data.users.filter(
					(m: any) => m.rating
				);

				// Sort by rating (highest first) and take top 5
				const sorted = allMasters
					.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
					.slice(0, 5);

				setTopMasters(sorted);

				// For logged-in users, get recommended masters (different from top rated)
				if (user) {
					// Shuffle and take 6 different masters, or all if less than 6
					const shuffled = [...allMasters]
						.filter(
							(m: any) =>
								!sorted.some((top: any) => top.id === m.id)
						)
						.sort(() => Math.random() - 0.5)
						.slice(0, 6);
					setRecommendedMasters(shuffled);

					// Load recent bookings
					setBookingsLoading(true);
					try {
						const bookingsRes = user.isMaster
							? await getMasterBookings()
							: await getMyBookings();
						const bookings = bookingsRes.data.bookings || [];
						// Get upcoming bookings (next 3)
						const upcoming = bookings
							.filter(
								(b: any) => new Date(b.startTime) > new Date()
							)
							.sort(
								(a: any, b: any) =>
									new Date(a.startTime).getTime() -
									new Date(b.startTime).getTime()
							)
							.slice(0, 3);
						setRecentBookings(upcoming);
					} catch (err) {
						console.error('Failed to load bookings', err);
					} finally {
						setBookingsLoading(false);
					}
				}
			} catch (err) {
				console.error('Failed to load masters', err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [user]);

	const handleViewSchedule = (userId: number) => {
		if (user) {
			navigate(`/calendar/${userId}`);
		} else {
			navigate('/login');
		}
	};

	return (
		<div className='min-h-screen'>
			{user ? (
				// Logged-in user view
				<div className='max-w-7xl mx-auto px-5 py-10'>
					{/* Welcome Section */}
					<div className='mb-12'>
						<h1 className='text-4xl md:text-5xl font-bold mb-4'>
							Welcome back, {user.username}!
						</h1>
						<p className='text-lg text-muted-foreground'>
							{user.isMaster
								? 'Manage your schedule and connect with students'
								: 'Continue your chess journey with expert guidance'}
						</p>
					</div>

					{/* Recent Bookings Section */}
					{!user.isMaster && (
						<div className='mb-12'>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-2xl md:text-3xl font-bold'>
									Upcoming Sessions
								</h2>
								<Button
									variant='outline'
									onClick={() => navigate('/bookings')}>
									View All
									<ArrowRight className='ml-2 h-4 w-4' />
								</Button>
							</div>

							{bookingsLoading ? (
								<div className='flex justify-center py-8'>
									<div className='w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin' />
								</div>
							) : recentBookings.length === 0 ? (
								<Card>
									<CardContent className='pt-6 text-center'>
										<Calendar className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
										<p className='text-muted-foreground mb-4'>
											No upcoming sessions scheduled
										</p>
										<Button
											onClick={() =>
												navigate('/masters')
											}>
											Browse Masters
										</Button>
									</CardContent>
								</Card>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									{recentBookings.map((booking) => (
										<Card
											key={booking.id}
											className='cursor-pointer hover:shadow-lg transition-shadow'
											onClick={() =>
												navigate('/bookings')
											}>
											<CardHeader>
												<div className='flex items-center gap-3 mb-2'>
													<Clock className='h-5 w-5 text-primary' />
													<CardTitle className='text-lg'>
														{moment(
															booking.startTime
														).format('MMM D, YYYY')}
													</CardTitle>
												</div>
												<CardDescription>
													{moment(
														booking.startTime
													).format('h:mm A')}{' '}
													-{' '}
													{moment(
														booking.endTime
													).format('h:mm A')}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<div className='flex items-center gap-2'>
													{booking.master
														?.profilePicture ? (
														<img
															src={
																booking.master
																	.profilePicture
															}
															alt={
																booking.master
																	.username
															}
															className='w-8 h-8 rounded-full object-cover'
														/>
													) : (
														<div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold'>
															{booking.master?.username
																?.charAt(0)
																.toUpperCase() ||
																'?'}
														</div>
													)}
													<span className='font-medium'>
														{booking.master
															?.username ||
															'Unknown Master'}
													</span>
													{booking.master?.title && (
														<Badge
															variant='default'
															className='ml-auto'>
															{
																booking.master
																	.title
															}
														</Badge>
													)}
												</div>
												<div className='mt-3'>
													<Badge
														variant={
															booking.status ===
															'booked'
																? 'success'
																: booking.status ===
																  'reserved'
																? 'warning'
																: 'default'
														}>
														{booking.status ===
														'booked'
															? 'Confirmed'
															: booking.status ===
															  'reserved'
															? 'Pending'
															: booking.status}
													</Badge>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</div>
					)}

					{/* Recommended Masters Section */}
					<div className='mb-12'>
						<div className='flex justify-between items-center mb-6'>
							<div>
								<h2 className='text-2xl md:text-3xl font-bold mb-2'>
									Recommended Masters
								</h2>
								<p className='text-muted-foreground'>
									Discover talented chess masters to learn
									from
								</p>
							</div>
							<Button
								variant='outline'
								onClick={() => navigate('/masters')}
								className='hidden md:flex'>
								View All Masters
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</div>

						{loading ? (
							<div className='flex justify-center py-8'>
								<div className='w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin' />
							</div>
						) : recommendedMasters.length === 0 ? (
							<Card>
								<CardContent className='pt-6 text-center'>
									<p className='text-muted-foreground'>
										No masters available at the moment
									</p>
								</CardContent>
							</Card>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4'>
								{recommendedMasters.map((master) => (
									<Card
										key={master.id}
										className='cursor-pointer hover:shadow-lg transition-shadow'
										onClick={() =>
											handleViewSchedule(master.id)
										}>
										<CardHeader>
											<div className='flex items-center gap-4 mb-4'>
												{master.profilePicture ? (
													<img
														src={
															master.profilePicture
														}
														alt={master.username}
														className='w-16 h-16 rounded-full object-cover border-2 border-primary'
													/>
												) : (
													<div className='w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold'>
														{master.username
															.charAt(0)
															.toUpperCase()}
													</div>
												)}
												<div className='flex-1'>
													<CardTitle className='text-xl'>
														{master.username}
													</CardTitle>
													{master.title && (
														<Badge
															variant='default'
															className='mt-1'>
															{master.title}
														</Badge>
													)}
												</div>
											</div>
											{master.rating && (
												<div className='mb-2'>
													<span className='text-sm text-muted-foreground'>
														Rating:{' '}
													</span>
													<span className='text-lg font-bold'>
														{master.rating}
													</span>
												</div>
											)}
											{master.bio && (
												<CardDescription className='line-clamp-2 mb-3'>
													{master.bio}
												</CardDescription>
											)}
											{(master.chesscomUrl ||
												master.lichessUrl) && (
												<div className='flex gap-3 mt-3'>
													{master.chesscomUrl && (
														<a
															href={
																master.chesscomUrl.startsWith(
																	'http'
																)
																	? master.chesscomUrl
																	: `https://www.chess.com/member/${master.chesscomUrl}`
															}
															target='_blank'
															rel='noopener noreferrer'
															className='text-xs text-primary hover:underline flex items-center gap-1'
															onClick={(e) =>
																e.stopPropagation()
															}>
															Chess.com
															<ExternalLink className='h-3 w-3' />
														</a>
													)}
													{master.lichessUrl && (
														<a
															href={
																master.lichessUrl.startsWith(
																	'http'
																)
																	? master.lichessUrl
																	: `https://lichess.org/@/${master.lichessUrl.replace(
																			'@/',
																			''
																	  )}`
															}
															target='_blank'
															rel='noopener noreferrer'
															className='text-xs text-primary hover:underline flex items-center gap-1'
															onClick={(e) =>
																e.stopPropagation()
															}>
															Lichess
															<ExternalLink className='h-3 w-3' />
														</a>
													)}
												</div>
											)}
										</CardHeader>
										<CardContent>
											<Button
												className='w-full'
												onClick={() =>
													handleViewSchedule(
														master.id
													)
												}>
												View Schedule
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						)}

						<div className='text-center'>
							<Button
								variant='outline'
								size='lg'
								onClick={() => navigate('/masters')}
								className='md:hidden'>
								View All Masters
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</div>
					</div>
				</div>
			) : (
				// Non-logged-in user view
				<>
					{/* Hero Section */}
					<div className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20'>
						<div className='max-w-7xl mx-auto px-5 text-center'>
							<h1 className='text-5xl md:text-6xl font-bold mb-6'>
								Learn Chess from Masters
							</h1>
							<p className='text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto'>
								Connect with experienced chess masters and
								elevate your game through personalized
								one-on-one sessions
							</p>
							<div className='flex gap-4 justify-center flex-wrap'>
								<Button
									size='lg'
									variant='secondary'
									onClick={() => navigate('/login')}
									className='text-lg px-8'>
									Get Started
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='text-lg px-8 bg-transparent border-white text-white hover:bg-white/10'
									onClick={() => navigate('/masters')}>
									Browse Masters
								</Button>
							</div>
						</div>
					</div>

					{/* Features Section */}
					<div className='max-w-7xl mx-auto px-5 py-16'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl md:text-4xl font-bold mb-4'>
								Why Choose Chess Master?
							</h2>
							<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
								Experience personalized chess coaching from
								verified masters
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16'>
							<Card className='text-center'>
								<CardHeader>
									<Crown className='h-12 w-12 text-primary mx-auto mb-4' />
									<CardTitle>Verified Masters</CardTitle>
									<CardDescription>
										All our masters are verified with
										official ratings and titles
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className='text-center'>
								<CardHeader>
									<BookOpen className='h-12 w-12 text-primary mx-auto mb-4' />
									<CardTitle>Flexible Scheduling</CardTitle>
									<CardDescription>
										Book sessions at times that work for you
										with our easy scheduling system
									</CardDescription>
								</CardHeader>
							</Card>

							<Card className='text-center'>
								<CardHeader>
									<TrendingUp className='h-12 w-12 text-primary mx-auto mb-4' />
									<CardTitle>Improve Your Game</CardTitle>
									<CardDescription>
										Get personalized feedback and strategies
										to take your chess to the next level
									</CardDescription>
								</CardHeader>
							</Card>
						</div>

						{/* Top Masters Section */}
						<div className='mb-12'>
							<div className='flex justify-between items-center mb-8'>
								<div>
									<h2 className='text-3xl md:text-4xl font-bold mb-2'>
										Top Rated Masters
									</h2>
									<p className='text-lg text-muted-foreground'>
										Meet our highest-rated chess masters
									</p>
								</div>
								<Button
									variant='outline'
									onClick={() => navigate('/masters')}
									className='hidden md:flex'>
									View All Masters
									<ArrowRight className='ml-2 h-4 w-4' />
								</Button>
							</div>

							{loading ? (
								<div className='flex justify-center items-center py-20'>
									<div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin' />
								</div>
							) : topMasters.length === 0 ? (
								<Card className='text-center py-12'>
									<CardContent>
										<p className='text-muted-foreground'>
											No masters available at the moment
										</p>
									</CardContent>
								</Card>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
									{topMasters.map((master) => (
										<Card
											key={master.id}
											className='cursor-pointer hover:shadow-lg transition-shadow'>
											<CardHeader>
												<div className='flex items-center gap-4 mb-4'>
													{master.profilePicture ? (
														<img
															src={
																master.profilePicture
															}
															alt={
																master.username
															}
															className='w-16 h-16 rounded-full object-cover border-2 border-primary'
														/>
													) : (
														<div className='w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold'>
															{master.username
																.charAt(0)
																.toUpperCase()}
														</div>
													)}
													<div className='flex-1'>
														<CardTitle className='text-xl'>
															{master.username}
														</CardTitle>
														{master.title && (
															<Badge
																variant='default'
																className='mt-1'>
																{master.title}
															</Badge>
														)}
													</div>
												</div>
												{master.rating && (
													<div className='mb-2'>
														<span className='text-sm text-muted-foreground'>
															Rating:{' '}
														</span>
														<span className='text-lg font-bold'>
															{master.rating}
														</span>
													</div>
												)}
												{master.bio && (
													<CardDescription className='line-clamp-2 mb-3'>
														{master.bio}
													</CardDescription>
												)}
												{(master.chesscomUrl ||
													master.lichessUrl) && (
													<div className='flex gap-3 mt-3'>
														{master.chesscomUrl && (
															<a
																href={
																	master.chesscomUrl.startsWith(
																		'http'
																	)
																		? master.chesscomUrl
																		: `https://www.chess.com/member/${master.chesscomUrl}`
																}
																target='_blank'
																rel='noopener noreferrer'
																className='text-xs text-primary hover:underline flex items-center gap-1'
																onClick={(e) =>
																	e.stopPropagation()
																}>
																Chess.com
																<ExternalLink className='h-3 w-3' />
															</a>
														)}
														{master.lichessUrl && (
															<a
																href={
																	master.lichessUrl.startsWith(
																		'http'
																	)
																		? master.lichessUrl
																		: `https://lichess.org/@/${master.lichessUrl.replace(
																				'@/',
																				''
																		  )}`
																}
																target='_blank'
																rel='noopener noreferrer'
																className='text-xs text-primary hover:underline flex items-center gap-1'
																onClick={(e) =>
																	e.stopPropagation()
																}>
																Lichess
																<ExternalLink className='h-3 w-3' />
															</a>
														)}
													</div>
												)}
											</CardHeader>
											<CardContent>
												<Button
													className='w-full'
													onClick={() =>
														handleViewSchedule(
															master.id
														)
													}>
													View Schedule
												</Button>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							<div className='text-center'>
								<Button
									variant='outline'
									size='lg'
									onClick={() => navigate('/masters')}
									className='md:hidden'>
									View All Masters
									<ArrowRight className='ml-2 h-4 w-4' />
								</Button>
							</div>
						</div>
					</div>

					{/* CTA Section */}
					<div className='bg-muted py-16'>
						<div className='max-w-4xl mx-auto px-5 text-center'>
							<h2 className='text-3xl md:text-4xl font-bold mb-4'>
								Ready to Improve Your Chess?
							</h2>
							<p className='text-lg text-muted-foreground mb-8'>
								Join our community and start learning from the
								best
							</p>
							<div className='flex gap-4 justify-center flex-wrap'>
								<Button
									size='lg'
									onClick={() => navigate('/signup')}
									className='text-lg px-8'>
									Sign Up Now
								</Button>
								<Button
									size='lg'
									variant='outline'
									onClick={() => navigate('/login')}
									className='text-lg px-8'>
									Log In
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default Home;
