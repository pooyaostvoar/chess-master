import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface MiniCalendarProps {
	onDateSelect?: (date: Date) => void;
	currentDate?: Date;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
	onDateSelect,
	currentDate,
}) => {
	const calendarRef = useRef<FullCalendar>(null);
	const [currentMonth, setCurrentMonth] = useState(
		currentDate || new Date()
	);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const handleDateClick = (info: any) => {
		// Prevent default behavior
		if (info.jsEvent) {
			info.jsEvent.preventDefault();
			info.jsEvent.stopPropagation();
		}
		
		// Get the clicked date - use dateStr for reliability
		let clickedDate: Date;
		if (info.date) {
			clickedDate = new Date(info.date);
		} else if (info.dateStr) {
			clickedDate = new Date(info.dateStr + 'T12:00:00'); // Set to noon to avoid timezone issues
		} else {
			console.error('No date information in dateClick event', info);
			return;
		}
		
		// Ensure date is valid
		if (isNaN(clickedDate.getTime())) {
			console.error('Invalid date:', info);
			return;
		}
		
		// Set selected date for highlighting
		setSelectedDate(clickedDate);
		
		if (onDateSelect) {
			onDateSelect(clickedDate);
		}
	};

	const handlePrevMonth = () => {
		if (calendarRef.current) {
			const calendarApi = calendarRef.current.getApi();
			calendarApi.prev();
			setCurrentMonth(calendarApi.getDate());
		}
	};

	const handleNextMonth = () => {
		if (calendarRef.current) {
			const calendarApi = calendarRef.current.getApi();
			calendarApi.next();
			setCurrentMonth(calendarApi.getDate());
		}
	};

	const handleToday = () => {
		if (calendarRef.current) {
			const calendarApi = calendarRef.current.getApi();
			calendarApi.today();
			setCurrentMonth(calendarApi.getDate());
			const today = new Date();
			setSelectedDate(today);
			if (onDateSelect) {
				onDateSelect(today);
			}
		}
	};

	const formatMonthYear = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric',
		});
	};

	return (
		<div className='w-full'>
			{/* Month Navigation */}
			<div className='flex items-center justify-between mb-4'>
				<Button
					variant='ghost'
					size='icon'
					onClick={handlePrevMonth}
					className='h-8 w-8'>
					<ChevronLeft className='h-4 w-4' />
				</Button>
				<div className='text-sm font-semibold text-foreground'>
					{formatMonthYear(currentMonth)}
				</div>
				<Button
					variant='ghost'
					size='icon'
					onClick={handleNextMonth}
					className='h-8 w-8'>
					<ChevronRight className='h-4 w-4' />
				</Button>
			</div>

			{/* Mini Calendar */}
			<div className='mini-calendar-container'>
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView='dayGridMonth'
					dateClick={handleDateClick}
					headerToolbar={false}
					footerToolbar={false}
					height='auto'
					aspectRatio={1}
					firstDay={1}
					dayMaxEvents={false}
					moreLinkClick='popover'
					dayHeaderFormat={{ weekday: 'short' }}
					dayCellClassNames={(info: any) => {
						const classes = ['mini-calendar-day'];
						if (selectedDate) {
							const cellDate = new Date(info.date);
							const selected = new Date(selectedDate);
							// Compare dates (ignore time)
							if (
								cellDate.getFullYear() === selected.getFullYear() &&
								cellDate.getMonth() === selected.getMonth() &&
								cellDate.getDate() === selected.getDate()
							) {
								classes.push('mini-calendar-selected');
							}
						}
						return classes;
					}}
					dayHeaderClassNames='mini-calendar-header'
					selectable={false}
					selectMirror={false}
					unselectAuto={false}
				/>
			</div>

			{/* Today Button */}
			<Button
				variant='outline'
				onClick={handleToday}
				className='w-full mt-4 text-sm'>
				Today
			</Button>
		</div>
	);
};

export default MiniCalendar;

