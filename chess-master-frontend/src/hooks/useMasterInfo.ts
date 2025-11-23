import { useEffect, useState } from 'react';
import { findUsers } from '../services/auth';
import type { User } from '../services/auth';

export const useMasterInfo = (userId: string | undefined) => {
	const [masterInfo, setMasterInfo] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadMasterInfo = async () => {
			if (!userId) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const res = await findUsers({ isMaster: true });
				const master = res.users.find((u) => u.id === Number(userId));
				setMasterInfo(master || null);
			} catch (err) {
				console.error('Failed to load master info', err);
			} finally {
				setLoading(false);
			}
		};

		loadMasterInfo();
	}, [userId]);

	return { masterInfo, loading };
};

