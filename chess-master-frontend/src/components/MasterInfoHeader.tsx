import React from 'react';
import { Badge } from './ui/badge';

interface MasterInfoHeaderProps {
	masterInfo: {
		username: string;
		title?: string | null;
		rating?: number | null;
	};
}

const MasterInfoHeader: React.FC<MasterInfoHeaderProps> = ({ masterInfo }) => {
	return (
		<div className='mb-8 pb-6 border-b'>
			<div className='flex items-center gap-3 mb-4'>
				<h2 className='text-3xl md:text-4xl font-bold'>
					{masterInfo.username}
					{masterInfo.title && (
						<Badge
							variant='default'
							className='ml-3'>
							{masterInfo.title}
						</Badge>
					)}
					<span className='text-muted-foreground font-normal'>
						's Schedule
					</span>
				</h2>
			</div>
			{masterInfo.rating && (
				<p className='text-muted-foreground mb-2'>
					Rating:{' '}
					<span className='font-semibold text-foreground'>
						{masterInfo.rating}
					</span>
				</p>
			)}
			<p className='text-primary font-medium'>
				Click on green "Available" slots to book a session
			</p>
		</div>
	);
};

export default MasterInfoHeader;
