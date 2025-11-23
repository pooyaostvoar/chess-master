import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
	events,
	selectable = false,
	editable = false,
	onSelect,
	onEventClick,
	onEventDrop,
	onEventResize,
	height = '85vh',
}) => {
	return (
		<FullCalendar
			plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
			initialView='timeGridWeek'
			selectable={selectable}
			editable={editable}
			events={events}
			select={onSelect}
			eventClick={onEventClick}
			eventDrop={onEventDrop}
			eventResize={onEventResize}
			slotDuration='01:00:00'
			height={height}
			headerToolbar={{
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,timeGridWeek,timeGridDay',
			}}
		/>
	);
};

export default ScheduleCalendar;
