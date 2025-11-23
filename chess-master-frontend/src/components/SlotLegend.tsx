import React from 'react';

const SlotLegend: React.FC = () => {
	return (
		<div className='flex gap-6 mt-6 pt-6 border-t justify-center flex-wrap'>
			<div className='flex items-center gap-2'>
				<div className='w-5 h-5 rounded bg-[#27ae60] shadow-sm'></div>
				<span className='text-sm text-muted-foreground'>
					Available - Click to Book
				</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='w-5 h-5 rounded bg-[#f39c12] shadow-sm'></div>
				<span className='text-sm text-muted-foreground'>Reserved</span>
			</div>
			<div className='flex items-center gap-2'>
				<div className='w-5 h-5 rounded bg-[#e74c3c] shadow-sm'></div>
				<span className='text-sm text-muted-foreground'>Booked</span>
			</div>
		</div>
	);
};

export default SlotLegend;
