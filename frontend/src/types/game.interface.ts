export interface Match {
    score?: string;
    rank?: number;
    username?: string;
    idmatch?: number;
    result?: string;
    opponent?: string;
    avatar?: string;  
    
}

export interface MatchPrivate {
    challenger: Challenger;
    roomid: number;
    opponent: Opponent;
    game: Gamex;
    isalreadywin: boolean;
}

export interface Challenger {
    id?: number;
    username?: string;
    rank?: number;
    score?: string;
    displayname?: string;
    wins?: number;
    loses?: number;
    pathtoimage?: string;
}

export interface Opponent {
    id?: number;
    username?: string;
    rank?: number;
    score?: string;
    displayname?: string;
    wins?: number;
    loses?: number;
    pathtoimage?: string;
}

export interface Room {
	name: string;
	user1DbId: number;
	user2DbId: number;
	player1Id: string;
	player2Id: string;
	nbPeopleConnected: number;
	game: Gamex;
}

export interface Gamex {
	width: number;
	height: number;
	p1Score: number;
	p2Score: number;
	ball: Ball;
	paddle: Paddle;
	p1Left: Player;
	p2Right: Player;
    colorFond: string;
}

export interface Ball {
	radius: number;
	dir: number;
	x: number;
	y: number;
	speed: number;
	velX: number;
	velY: number
}

export interface Player {
	x: number;
	y: number;
	velX: number;
	velY: number;
	paddleColor: string;
}

export interface Paddle {
	height: number;
	width: number;
	border: number;
}

export interface EndGameInfo
{
	winner: Winner;
	loser: Loser;
	p1: number;
	p2: number;
}

export interface Winner {
    id?: number;
    username?: string;
    rank?: number;
    score?: string;
    displayname?: string;
    wins?: number;
    loses?: number;
    pathtoimage?: string;
}

export interface Loser {
    id?: number;
    username?: string;
    rank?: number;
    score?: string;
    displayname?: string;
    wins?: number;
    loses?: number;
    pathtoimage?: string;
}

export interface MatchQueue {
    challenger: Challenger;
    roomid: number;
    opponent: Opponent;
    game: Gamex;
    isalreadywin: boolean;
}

export interface Option {
    paddleColor: string;
    maxScore: number;
    colorFond: string;
}

export interface listOfMatchs {
    isPrivate: boolean;
    listOfMatchs: string[];
}
