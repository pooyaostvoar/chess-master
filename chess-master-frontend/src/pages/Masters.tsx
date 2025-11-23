import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Badge } from '../components/ui/badge';
import { ExternalLink, Search, X } from 'lucide-react';
import { findUsers } from '../services/auth';
import type { User } from '../services/auth';

const Masters: React.FC = () => {
	const [masters, setMasters] = useState<User[]>([]);
	const [filteredMasters, setFilteredMasters] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [minRating, setMinRating] = useState('');
	const [titleFilter, setTitleFilter] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const loadMasters = async () => {
			try {
				const response = await findUsers({ isMaster: true });
				setMasters(response.users);
				setFilteredMasters(response.users);
			} catch (err) {
				console.error(err);
				setError('Failed to load masters');
			} finally {
				setLoading(false);
			}
		};

		loadMasters();
	}, []);

	useEffect(() => {
		let filtered = masters;

		if (searchTerm) {
			filtered = filtered.filter((m) =>
				m.username.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (minRating) {
			const rating = parseInt(minRating, 10);
			filtered = filtered.filter((m) => m.rating && m.rating >= rating);
		}

		if (titleFilter) {
			filtered = filtered.filter(
				(m) =>
					m.title &&
					m.title.toLowerCase() === titleFilter.toLowerCase()
			);
		}

		setFilteredMasters(filtered);
	}, [searchTerm, minRating, titleFilter, masters]);

	const handleScheduleClick = (userId: number) => {
		navigate(`/calendar/${userId}`);
	};

	const clearFilters = () => {
		setSearchTerm('');
		setMinRating('');
		setTitleFilter('');
	};

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh]'>
				<div className='w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5' />
				<p className='text-muted-foreground'>Loading masters...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex justify-center items-center min-h-[60vh]'>
				<Card className='max-w-md'>
					<CardContent className='pt-6'>
						<p className='text-destructive text-center'>{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-5 py-10'>
			<div className='text-center mb-12'>
				<h1 className='text-4xl md:text-5xl font-bold mb-4'>
					Find Your Chess Master
				</h1>
				<p className='text-lg text-muted-foreground'>
					Browse and book sessions with experienced chess masters
				</p>
			</div>

			<Card className='mb-8'>
				<CardHeader>
					<CardTitle>Filter Masters</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
						<div>
							<Label htmlFor='search'>Search by name</Label>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
								<Input
									id='search'
									type='text'
									placeholder='Search masters...'
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
									className='pl-10'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='rating'>Minimum rating</Label>
							<Input
								id='rating'
								type='number'
								placeholder='e.g., 2000'
								value={minRating}
								onChange={(e) => setMinRating(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor='title'>Title</Label>
							<select
								id='title'
								value={titleFilter}
								onChange={(e) => setTitleFilter(e.target.value)}
								className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
								<option value=''>All titles</option>
								<option value='GM'>GM</option>
								<option value='IM'>IM</option>
								<option value='FM'>FM</option>
								<option value='CM'>CM</option>
							</select>
						</div>
					</div>

					{(searchTerm || minRating || titleFilter) && (
						<Button
							variant='outline'
							size='sm'
							onClick={clearFilters}
							className='w-full md:w-auto'>
							<X className='mr-2 h-4 w-4' />
							Clear filters
						</Button>
					)}
				</CardContent>
			</Card>

			{filteredMasters.length === 0 ? (
				<Card className='text-center py-12'>
					<CardContent>
						<p className='text-muted-foreground mb-4'>
							No masters found matching your criteria
						</p>
						{(searchTerm || minRating || titleFilter) && (
							<Button
								variant='outline'
								onClick={clearFilters}>
								Clear filters
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<>
					<div className='mb-6'>
						<p className='text-muted-foreground'>
							{filteredMasters.length} master
							{filteredMasters.length !== 1 && 's'} found
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{filteredMasters.map((master) => (
							<Card
								key={master.id}
								className='hover:shadow-lg transition-shadow'>
								<CardHeader>
									<div className='flex items-center gap-4 mb-4'>
										{master.profilePicture ? (
											<img
												src={master.profilePicture}
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
										<div className='mb-3'>
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
											handleScheduleClick(master.id)
										}>
										View Schedule
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default Masters;
