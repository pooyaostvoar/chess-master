import React from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import MasterCalendarView from './MasterCalendarView';
import BookCalendarView from './BookCalendarView';
import { usePageMeta } from '../lib/seo';

const MasterScheduleCalendar: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const { user } = useUser();
	usePageMeta({
		title: 'Master schedule',
		description: 'Book an open time slot with a chess master.',
		canonicalPath: userId ? `/calendar/${userId}` : undefined,
		// Thin, app-like booking view — keep out of the index; the master's
		// public profile (/master-profile/:username) is the canonical entry point.
		robots: 'noindex',
	});

	// Check if current user is the master owner
	const isOwner = user?.id === Number(userId) && user?.isMaster;

	// Render appropriate view based on ownership
	return isOwner ? <MasterCalendarView /> : <BookCalendarView />;
};

export default MasterScheduleCalendar;
