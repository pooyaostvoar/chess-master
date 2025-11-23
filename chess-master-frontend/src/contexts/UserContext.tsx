import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMe } from '../services/auth';

export interface User {
	id: number;
	username: string;
	email: string;
	isMaster: boolean;
	title?: string | null;
	rating?: number | null;
	bio?: string | null;
}

interface UserContextType {
	user: User | null;
	setUser: (u: User | null, skipLoad?: boolean) => void;
	loading: boolean;
}

const UserContext = createContext<UserContextType>({
	user: null,
	setUser: () => {},
	loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [skipAutoLoad, setSkipAutoLoad] = useState(false);
	const location = useLocation();

	useEffect(() => {
		// Skip auto-load if explicitly set (e.g., after logout)
		if (skipAutoLoad) {
			setLoading(false);
			return;
		}

		// Skip auto-load on public routes (login, signup)
		const publicRoutes = ['/login', '/signup'];
		if (publicRoutes.includes(location.pathname)) {
			setLoading(false);
			// Don't try to load user on public routes
			return;
		}

		const loadUser = async () => {
			try {
				const data = await getMe();
				if (data.user) {
					setUser(data.user);
					// Reset skip flag if we successfully loaded a user
					setSkipAutoLoad(false);
				} else {
					setUser(null);
				}
			} catch (err: any) {
				// User is not authenticated or session expired
				if (err.response?.status === 401) {
					// Session is invalid, clear user
					setUser(null);
				} else if (err.response?.status !== 401) {
					console.error('Failed to load user', err);
				}
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, [skipAutoLoad, location.pathname]);

	// Custom setUser that can skip auto-load
	const setUserWithSkip = (u: User | null, skipLoad = false) => {
		setUser(u);
		if (skipLoad) {
			setSkipAutoLoad(true);
		} else if (u !== null) {
			// Reset skip flag when setting a user (e.g., after login)
			setSkipAutoLoad(false);
		}
	};

	return (
		<UserContext.Provider
			value={{
				user,
				setUser: setUserWithSkip,
				loading,
			}}>
			{children}
		</UserContext.Provider>
	);
};
