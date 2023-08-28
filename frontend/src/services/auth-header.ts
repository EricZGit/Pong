import { LocalStorageUser } from '../types/user.interface'

export default function authHeader(): { Authorization: number } | Record<number, never> {
	const user: LocalStorageUser = JSON.parse(localStorage.getItem('user') || '{}');

	if (user ) {
		return { Authorization: user.ID };
	} else {
		return {};
	}
}
