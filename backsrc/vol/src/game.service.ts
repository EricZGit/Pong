import { Injectable } from '@nestjs/common';
import { appService } from './app.service';

import {
  Player,
  Ball,
  Room,
  Paddle,
  EndGameInfo,
  EndGameInfoFinal,
  EndGameInfoFinalPrivate,
} from './interfaces/game.interface';

@Injectable()
export class GameService {
	constructor() {}

	private readonly GAME_WIDTH: number = 800;
	private readonly GAME_HEIGHT: number = 600;
	private readonly BASE_SPEED: number = 7;
	private readonly BALL_RADIUS: number = 9;
	private readonly MAX_BALL_SPEED: number = 24;
	private readonly MAX_ANGLE: number = Math.PI / 4;

	public readonly FRAMERATE: number = 1000 / 60;
	public readonly TIME_MATCH_START: number = 2000;

 	private INCREASE_SPEED_PERCENTAGE: number = 1.1;

	updateGame(room: Room) : Room
	{
		if ((room.game.ball.x - room.game.ball.radius) < 0) {
			room.game.p2Score++;
			room.game.ball = this.resetBall(1);
		}
		else if ((room.game.ball.x + room.game.ball.radius) > room.game.width) {
			room.game.p1Score++;
			room.game.ball = this.resetBall(-1);
		}
		else {
			room.game.ball.x += room.game.ball.velX;
			room.game.ball.y += room.game.ball.velY;
			this.detectCollision(room);
		}
		return room;
	}

	
	private detectCollision(room: Room) : void
	{
		const ball: Ball = room.game.ball;
		const p1Left: Player = room.game.p1Left;
		const p2Right: Player = room.game.p2Right;
		const paddle: Paddle = room.game.paddle;

		if (ball.x + ball.radius > room.game.width - paddle.width - paddle.border 
			&& ball.y + ball.radius > p2Right.y - paddle.height / 2 
			&& ball.y - ball.radius < p2Right.y + paddle.height / 2)
			this.playerTwoIntersectBall(room);
			
			else if (ball.x - ball.radius < paddle.border + paddle.width 
				&& ball.y > p1Left.y - paddle.height / 2 && ball.y < p1Left.y + paddle.height / 2)
				this.playerOneIntersectBall(room);

				else if (ball.y - ball.radius <= 0) {
					ball.y = ball.radius;
					ball.velY = ball.velY * -1;
				}
				else if (ball.y + ball.radius >= room.game.height) {
					ball.y = room.game.height - ball.radius;
					ball.velY = ball.velY * -1;
				}
			}
			
			private playerOneIntersectBall(room: Room) : void
			{
				const ball: Ball = room.game.ball;
				const paddle: Paddle = room.game.paddle;
				const percentIntersect: number = (ball.y - room.game.p1Left.y) / (paddle.height / 2);
				const angleRad: number = percentIntersect < 0 ? -percentIntersect * this.MAX_ANGLE : 
				percentIntersect * this.MAX_ANGLE;
				
				ball.velX = ball.speed * Math.cos(angleRad);
				ball.velY = percentIntersect < 0 ? ball.speed * -Math.sin(angleRad) :
				ball.speed * Math.sin(angleRad)
				
				if (ball.x - ball.radius < paddle.border + paddle.width)
				ball.x = paddle.border + paddle.width + ball.radius;
				if (ball.speed < this.MAX_BALL_SPEED)
				ball.speed *= this.INCREASE_SPEED_PERCENTAGE;
			}
	
	private playerTwoIntersectBall(room: Room) : void
	{
		const ball: Ball = room.game.ball;
		const paddle: Paddle = room.game.paddle;
		const percentIntersect: number = (ball.y - room.game.p2Right.y) / (paddle.height / 2);
		const angleRad: number = percentIntersect < 0 ? -percentIntersect * this.MAX_ANGLE : 
		percentIntersect * this.MAX_ANGLE;
		
		ball.velX = ball.speed * -Math.cos(angleRad);
		ball.velY = percentIntersect < 0 ? ball.speed * -Math.sin(angleRad) :
		ball.speed * Math.sin(angleRad);
		
		if (ball.x + ball.radius > room.game.width - paddle.border - paddle.width)
		ball.x = room.game.width - paddle.border - paddle.width - ball.radius;
		if (ball.speed < this.MAX_BALL_SPEED)
		ball.speed *= this.INCREASE_SPEED_PERCENTAGE;
	}
	
	updatePlayerPos(playerId: string, playerPosY: number, room: Room, side: string) : Room 	{
		if (room && side === "left")
		playerPosY > room.game.p1Left.y ? this.userMoveDown(room, room.game.p1Left, playerPosY) :
		this.userMoveUp(room, room.game.p1Left, playerPosY);
		else if (room && side === "right")
		playerPosY > room.game.p2Right.y ? this.userMoveDown(room, room.game.p2Right, playerPosY) :
		this.userMoveUp(room, room.game.p2Right, playerPosY);
		// this.updateGame(room);			
		return room;
	}
	
	private userMoveUp(room: Room, player : Player, playerPosY: number) : void
	{
		player.y -= (player.y - playerPosY > player.velY) ? player.velY : player.y - playerPosY;
		(player.y < room.game.paddle.height / 2) ? player.y = room.game.paddle.height / 2 : 0;
	}
	
	private userMoveDown(room: Room, player : Player, playerPosY: number) : void
	{
		player.y += (playerPosY - player.y > player.velY) ? player.velY : playerPosY - player.y;
		(player.y > this.GAME_HEIGHT - room.game.paddle.height / 2) ? 
		player.y = this.GAME_HEIGHT - room.game.paddle.height / 2 : 0;
	}

	private resetBall(dir: number) : Ball
	{
		return {
			radius: this.BALL_RADIUS,
			dir: -dir,
			x: this.GAME_WIDTH * 0.5,
			y: this.GAME_HEIGHT * 0.5,
			speed: this.BASE_SPEED,
			velX: dir * this.BASE_SPEED,
			velY: 0,
		}
	}
	
	updatePlayerPosQueue(playerId: string, playerPosY: number, room: Room, side: string, gameoption) : Room 	{
		room.gameoption = gameoption.optionChoice;
		if (room && side === "left")
		playerPosY > room.game.p1Left.y ? this.userMoveDown(room, room.game.p1Left, playerPosY) :
		this.userMoveUp(room, room.game.p1Left, playerPosY);
		else if (room && side === "right")
		playerPosY > room.game.p2Right.y ? this.userMoveDown(room, room.game.p2Right, playerPosY) :
		this.userMoveUp(room, room.game.p2Right, playerPosY);
		// this.updateGameQueue(room);			
		return room;
	}
	
	updateGameQueue(room: Room) : Room
	{
		if ((room.game.ball.x - room.game.ball.radius) < 0) {
			room.game.p2Score++;
			room.game.ball = this.resetBall(1);
		}

		else if ((room.game.ball.x + room.game.ball.radius) > room.game.width) {
			room.game.p1Score++;
			room.game.ball = this.resetBall(-1);
		}
		
		else {
			room.game.ball.x += room.game.ball.velX;
			room.game.ball.y += room.game.ball.velY;
			this.detectCollision(room);
		}
		
		// if (room.game.p1Score >= room.gameoption.maxScore || room.game.p2Score >= room.gameoption.maxScore) {
			// 	this.endGameQueue(room);
			// }
			return room;
		}
		
		endGameQueue(room: EndGameInfoFinal) : void
		{
			let endGameInfo: EndGameInfo = null;
			if (room.p1 >= room.gameoption.maxScore) {
				endGameInfo = {
					winner: room.winner,
					loser: room.loser,
					room: null,
					score : room.p1.toString() + " - " + room.p2.toString(),
				}
			}
			else if (room.p2 >= room.gameoption.maxScore) {
				endGameInfo = {
					winner: room.winner,
				loser: room.loser,
				room: null,
				score : room.p2.toString() + " - " + room.p1.toString(),
				
			}
		}
		appService.upMatch(endGameInfo, "special");
	}
	
		endGame(room: EndGameInfoFinalPrivate) : void
		{
			let endGameInfo: EndGameInfo = null;
			if (room.p1 >= 10) {
				endGameInfo = {
					winner: room.winner,
					loser: room.loser,
					room: null,
					score : room.p1.toString() + " - " + room.p2.toString(),
				}
			}
			else if (room.p2 >= 10) {
				endGameInfo = {
					winner: room.winner,
					loser: room.loser,
					room: null,
					score : room.p2.toString() + " - " + room.p1.toString(),
				}
			}
			appService.upMatch(endGameInfo,"default");
		}
}
