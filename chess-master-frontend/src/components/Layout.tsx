import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import { useUser } from '../contexts/UserContext';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, User, Calendar, BookOpen } from 'lucide-react';

const Layout: React.FC = () => {
	const navigate = useNavigate();
	const { user, loading, setUser } = useUser();

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!loading && !user) {
			navigate('/login', { replace: true });
		}
	}, [user, loading, navigate]);

	// Show loading state while user is being fetched
	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen'>
				<div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5' />
				<p className='text-muted-foreground'>Loading...</p>
			</div>
		);
	}

	// Don't render if user is not authenticated (will redirect)
	if (!user) {
		return null;
	}

	const firstLetter = user?.username
		? user.username.charAt(0).toUpperCase()
		: '?';

	const handleLogout = async () => {
		try {
			await logout();
			setUser(null);
			navigate('/login');
		} catch (err) {
			console.error('Logout error', err);
			setUser(null);
			navigate('/login');
		}
	};

	return (
		<div className='min-h-screen flex flex-col bg-background'>
			<nav className='sticky top-0 z-50 w-full border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm'>
				<div className='container mx-auto px-6 py-4'>
					<div className='flex items-center justify-between'>
						<Link
							to='/home'
							className='flex items-center gap-3 text-xl font-bold'>
							<span className='text-3xl'>♔</span>
							<span>Chess Master</span>
						</Link>

						<div className='flex items-center gap-8'>
							<Link
								to='/home'
								className='text-sm font-medium hover:text-primary transition-colors'>
								Home
							</Link>
							<Link
								to='/masters'
								className='text-sm font-medium hover:text-primary transition-colors'>
								Browse Masters
							</Link>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className='w-11 h-11 rounded-full bg-white text-slate-900 font-bold text-lg flex items-center justify-center hover:ring-2 hover:ring-primary transition-all'>
										{firstLetter}
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align='end'
									className='w-56'>
									<DropdownMenuLabel>
										<div className='flex flex-col space-y-1'>
											<p className='text-sm font-medium'>
												{user?.username}
											</p>
											<p className='text-xs text-muted-foreground'>
												{user?.isMaster
													? 'Master'
													: 'Player'}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() =>
											navigate('/edit-profile')
										}>
										<User className='mr-2 h-4 w-4' />
										<span>Edit Profile</span>
									</DropdownMenuItem>
									{user?.isMaster && (
										<DropdownMenuItem
											onClick={() =>
												navigate(`/calendar/${user.id}`)
											}>
											<Calendar className='mr-2 h-4 w-4' />
											<span>My Schedule</span>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem
										onClick={() => navigate('/bookings')}>
										<BookOpen className='mr-2 h-4 w-4' />
										<span>My Bookings</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className='text-destructive'>
										<LogOut className='mr-2 h-4 w-4' />
										<span>Logout</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</nav>

			<main className='flex-1'>
				<Outlet />
			</main>

			<footer className='border-t bg-slate-900 text-white py-8'>
				<div className='container mx-auto px-6'>
					<div className='flex justify-between items-center flex-wrap gap-4'>
						<span className='text-lg font-bold'>
							♔ Chess Master
						</span>
						<span className='text-sm text-muted-foreground'>
							© {new Date().getFullYear()} Chess Master. All
							rights reserved.
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Layout;
