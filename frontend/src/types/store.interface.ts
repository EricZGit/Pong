import { LocalStorageUser } from './user.interface';
import { Socket } from 'socket.io-client';

export interface RootLoggedState
{
	status: { loggedIn: boolean };
	user: LocalStorageUser | null;
	avatar: string;
	TwoFA: boolean;
	roomId: number;
	challenger: boolean;
	opponent: boolean;
	socketchallenger: Socket | null;
	socketopponent: Socket | null;
	ischatconnected: boolean;
	nameofmatch: string;
}
