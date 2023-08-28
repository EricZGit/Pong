export interface User
{
	id: number;
	username: string;
	status: string;
	displayname: string;
	avatar?: string;
	score?: number;
	win?: number;
	lose?: number;
	
}

export interface LeaderboardUser
{
	user: User;
	rank: number;
	avatar?: string;
	username: string;
	status: string;
	nom: string;
	pathtoimage: string;
	pathto: string;
	ID: number;
}

export interface LocalStorageUser
{
	username: string;
	ID: number;
	TwoFA?: boolean;
	Token: string;
	twofactorauth?: boolean;
	channelId?: number;
	ismember?: boolean;
	roomID?: number;
}

export interface UserStatusChangeData
{
	userId: number;
	status: string;
}
