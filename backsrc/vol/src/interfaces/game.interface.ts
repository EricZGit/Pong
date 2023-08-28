export interface Room
{
	name: string;
	user1DbId: number;
	user2DbId: number;
	player1Id: string;
	player2Id: string;
	roomId: number;
	game: Game;
	challenger: Challenger;
	opponent: Opponent;
    gameoption: Option;
}

export interface EndGameInfoFinal
{
	winner: Winner;
	loser: Loser;
	p1: number;
	p2: number;
    gameoption: Option;
}

export interface EndGameInfoFinalPrivate
{
	winner: Winner;
	loser: Loser;
	p1: number;
	p2: number;
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

export interface Game
{
	isStarted: boolean;
	width: number;
	height: number;
	p1Score: number;
	p2Score: number;
	ball: Ball;
	paddle: Paddle;
	p1Left: Player;
	p2Right: Player;
}

export interface Ball 
{
	radius: number;
	dir: number;
	x: number;
	y: number;
	speed: number;
	velX: number;
	velY: number
}

export interface Player 
{
	x: number;
	y: number;
	velX: number;
	velY: number;
	paddlecolor: string;
}

export interface Paddle 
{
	height: number;
	width: number;
	border: number;
}

export interface EndGameInfo
{
	winner: Winner;
	loser: Loser;
	room: Room;
    score: string;
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
    game: Game;
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