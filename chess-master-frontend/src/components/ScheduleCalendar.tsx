import React, { forwardRef, useImperativeHandle } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/calendar.css';

interface ScheduleCalendarProps {
	events: any[];
	selectable?: boolean;
	editable?: boolean;
	onSelect?: (info: any) => void;
	onEventClick?: (info: any) => void;
	onEventDrop?: (info: any) => void;
	onEventResize?: (info: any) => void;
	height?: string;
}

export interface ScheduleCalendarRef {
	gotoDate: (date: Date, switchToDayView?: boolean) => void;
	getCurrentView: () => string | null;
	getCurrentDateRange: () => { start: Date; end: Date } | null;
}

const ScheduleCalendar = forwardRef<ScheduleCalendarRef, ScheduleCalendarProps>(
	(
		{
			events,
			selectable = false,
			editable = false,
			onSelect,
			onEventClick,
			onEventDrop,
			onEventResize,
			height = '85vh',
		},
		ref
	) => {
		const calendarRef = React.useRef<FullCalendar>(null);

		useImperativeHandle(ref, () => ({
			gotoDate: (date: Date, switchToDayView: boolean = false) => {
				if (calendarRef.current) {
					const calendarApi = calendarRef.current.getApi();
					// Ensure we're navigating to the correct date
					const targetDate = new Date(date);
					targetDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

					// Switch to day view if requested
					if (switchToDayView) {
						calendarApi.changeView('timeGridDay', targetDate);
					} else {
						// Stay in current view, just navigate to the date
						const currentView = calendarApi.view.type;
						// Explicitly maintain the current view when navigating
						calendarApi.changeView(currentView, targetDate);
					}
				}
			},
			getCurrentView: () => {
				if (calendarRef.current) {
					return calendarRef.current.getApi().view.type;
				}
				return null;
			},
			getCurrentDateRange: () => {
				if (calendarRef.current) {
					const view = calendarRef.current.getApi().view;
					return {
						start: new Date(view.activeStart),
						end: new Date(view.activeEnd),
					};
				}
				return null;
			},
		}));
		// Prevent selecting past dates
		const selectAllow = (selectInfo: any) => {
			const now = new Date();
			now.setHours(0, 0, 0, 0);
			const selectStart = new Date(selectInfo.start);
			selectStart.setHours(0, 0, 0, 0);
			return selectStart >= now;
		};

		// Prevent dragging/resizing events to the past
		const eventAllow = (dropInfo: any) => {
			const now = new Date();
			const eventStart = new Date(dropInfo.start);
			return eventStart >= now;
		};

		// Set valid range to prevent navigating to past dates
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return (
			<div className='w-full'>
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					initialView='timeGridWeek'
					views={{
						timeGridDay: {
							slotMinTime: '06:00:00',
							slotMaxTime: '24:00:00',
						},
						timeGridWeek: {
							slotMinTime: '06:00:00',
							slotMaxTime: '24:00:00',
						},
					}}
					selectable={selectable}
					editable={editable}
					events={events}
					select={onSelect}
					selectAllow={selectAllow}
					eventAllow={eventAllow}
					eventClick={onEventClick}
					eventDrop={onEventDrop}
					eventResize={onEventResize}
					slotDuration='01:00:00'
					height={height}
					validRange={{
						start: today.toISOString().split('T')[0],
					}}
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'timeGridDay,timeGridWeek',
					}}
					slotMinTime='06:00:00'
					slotMaxTime='24:00:00'
					allDaySlot={false}
					weekNumbers={false}
					weekNumberCalculation='ISO'
					firstDay={1}
					dayHeaderFormat={{
						weekday: 'short',
						day: 'numeric',
					}}
					eventDisplay='block'
					eventTimeFormat={{
						hour: 'numeric',
						minute: '2-digit',
						omitZeroMinute: false,
						meridiem: 'short',
					}}
					slotLabelFormat={{
						hour: 'numeric',
						minute: '2-digit',
						meridiem: 'short',
					}}
					nowIndicator={true}
				/>
			</div>
		);
	}
);

ScheduleCalendar.displayName = 'ScheduleCalendar';

export default ScheduleCalendar;
