import { Socket, Server } from 'socket.io';
import { 
        WebSocketGateway,
        WebSocketServer,
		OnGatewayConnection,
		OnGatewayDisconnect,
        } 
        from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { AppService } from './app.service';
import { GameService } from './game.service';
import { Room , Option , listOfMatchs, EndGameInfoFinal, EndGameInfoFinalPrivate} from './interfaces/game.interface';
import { StatusGateway } from './status.gateway';


@WebSocketGateway({	cors: true, namespace: '/matchLauncher' })

@Injectable()
export class MatchLauncherGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private readonly appService: AppService, private readonly gameService: GameService,
				private readonly statusGateway: StatusGateway) {}
	
	async onModuleInit() 
	{
		// console.log("[matchLauncher Gateway] Module initialized");
	}

	async onModuleDestroy()
	{
		// console.log("[matchLauncher Gateway] Module destroyed");
	}
	
	@WebSocketServer() server: Server;
	nbofchallengers: number = 0;
	idchallenger: number = 0;
	optionchallenger: Option = {
		paddleColor: 'white',
		maxScore: 10,
		colorFond: 'default'
	};
	optionopponent: Option = {
		paddleColor: 'white',
		maxScore: 10,
		colorFond: 'default'
	};
	countstop: number = 0;
	countstopprivate: number = 0;
	roomresult: Room = null;
	roomresultprivate: Room = null;
	nbofmatchs: number = 0;
	listOfMatch: listOfMatchs = {
		isPrivate: false,
		listOfMatchs: [] as string[]
	};
	endgameinfoqueue: EndGameInfoFinal = null;
	endgameinfoprivate: EndGameInfoFinalPrivate = null;

	handleDisconnect(client: any) 
	{
		// console.log("[matchLauncher Gateway] Client disconnected from gateway");
	}

	async handleConnection(client: Socket, args: any[]) 
	{
		// console.log("[matchLauncher Gateway] Client connected to gateway", client.id);
	}

	@SubscribeMessage('challenge')
	async handleChallengeSomebody(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		try 
        {
			let resultopponent = await this.appService.getDataMe(obj.oppId);
			let resultchallenger = await this.appService.getDataMe(obj.userId);
			
			this.server.emit('acceptChallenge', resultchallenger, resultopponent);
    	}
        catch (e) 
        {
			// console.log("Challenge error with opponent " + obj.opponent + " : " + e.message);
		}
	}

	@SubscribeMessage('waitInPrivateQueue')
	async handleWaitInPrivateQueue(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		try 
		{
			let resultopponent = await this.appService.getDataMe(obj.oppId);
			let resultchallenger = await this.appService.getDataMe(obj.userId);

			this.appService.changeStatus(resultchallenger.id, 'in-queue');
			this.statusGateway.handleInQueue('in-queue', resultchallenger.id);
			
			this.server.emit('waitInPrivateQueue', resultchallenger, resultopponent);
		}
		catch (e) 
		{
			// console.log("Challenge errorrrrrrr with opponent : " + e.message);
		}
	}

	@SubscribeMessage('goToChallenge')
	async handleGoToChallenge(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		try 
		{
			let resultopponent = await this.appService.getDataMe(obj[1].id);
			let resultchallenger = await this.appService.getDataMe(obj[0].id);
			
			this.server.emit('startingGamePrivate', true, resultchallenger, resultopponent);
		}
		catch (e) 
		{
			// console.log("Challenge Error with opponent : " + e.message);
		}
	}

	@SubscribeMessage('launchGame')
	async handleLaunchGame(@ConnectedSocket() client: Socket, @MessageBody() obj: any) : Promise<void>
	{
		this.appService.changeinvitsuccess(obj[0].id, true);

		let statuschallenger = await this.appService.getDataMe(obj[0].id);
		let statusopponent = await this.appService.getDataMe(obj[1].id);
		this.appService.changeStatus(statuschallenger.id, 'in-game');
		this.appService.changeStatus(statusopponent.id, 'in-game');
		this.statusGateway.handleInGame('in-game', statuschallenger.id);
		this.statusGateway.handleInGame('in-game', statusopponent.id);
		
		// spectator ON
		this.nbofmatchs++;
		this.server.emit('liveMatchs', this.nbofmatchs);
		this.statusGateway.handleMatchUp();
		// spectator ON

		// this.listOfMatch.push(statuschallenger.displayname + ' vs ' + statusopponent.displayname);
		this.listOfMatch.isPrivate = true;
		this.listOfMatch.listOfMatchs.push(statuschallenger.displayname + ' vs ' + statusopponent.displayname);
		this.server.emit('actualizeGame');
	}

	@SubscribeMessage('refuseChallenge')
	async handleRefuseChallenge(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		let resultopponent = await this.appService.getDataMe(obj[1].id);
		let resultchallenger = await this.appService.getDataMe(obj[0].id);
		this.appService.changeStatus(resultchallenger.id, 'online');
		this.appService.changeStatus(resultopponent.id, 'online');
		this.statusGateway.handleOnline('online', resultchallenger.id);
		this.statusGateway.handleOnline('online', resultopponent.id);

		this.server.emit('stopChallenge', resultchallenger, resultopponent);
	}

	@SubscribeMessage('pongEvent')
	handlePongEvent(@ConnectedSocket() client: Socket, @MessageBody() obj: any): void
	{
		// console.log('pongEvent', obj);
		if (obj[1].challenger.id == 0 || obj[1].opponent.id == 0) {
			return;
		}
		const roomreturn: Room = this.gameService.updatePlayerPos(client.id, obj[0], obj[1], obj[2]);
		
		let newListOfMatch: listOfMatchs = {
			isPrivate: false,
			listOfMatchs: [] as string[]
		}
		if (roomreturn) {
			this.server.emit('actualizexxxxGame', roomreturn);
			if (roomreturn.game.p1Score >= 10 || roomreturn.game.p2Score >= 10) {
				this.countstopprivate++;
				if (this.countstopprivate == 1) {
					this.roomresultprivate = roomreturn;
					this.server.emit('endGame', roomreturn);
					this.countstopprivate = 0;
					this.appService.changeStatus(roomreturn.challenger.id, 'online');
					this.appService.changeStatus(roomreturn.opponent.id, 'online');
					this.statusGateway.handleOnline('online', roomreturn.challenger.id);
					this.statusGateway.handleOnline('online', roomreturn.opponent.id);
					
					// spectator OFF
					this.nbofmatchs--;
					if (this.nbofmatchs < 0)
					this.nbofmatchs = 0;
					this.server.emit('liveMatchs', this.nbofmatchs);
					this.statusGateway.handleMatchDown();
					// spectator OFF
					
					newListOfMatch.listOfMatchs = this.listOfMatch.listOfMatchs.filter(item => item !== roomreturn.challenger.displayname + ' vs ' + roomreturn.opponent.displayname);
						newListOfMatch.isPrivate = true;
						this.listOfMatch = newListOfMatch;
					}
					else
					return;
				}
			}
		}
		
	@SubscribeMessage('updateBall')
	async handleUpdateBall(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		this.server.emit('actualizeBall', this.gameService.updateGame(obj[0]));
		// this.handlePongEvent(client, obj);
	}

	@SubscribeMessage('coucou')
	handleCoucouEvent(@ConnectedSocket() client: Socket)
	{
		// console.log(client.id + 'is disconnected from matchLauncher');
	}
	
	@SubscribeMessage('gameStop')
	handleGameStopEvent(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		this.server.emit('stopGame', obj);
		
		// spectator OFF
		this.nbofmatchs--;
		if (this.nbofmatchs < 0)
			this.nbofmatchs = 0;
		this.server.emit('liveMatchs', this.nbofmatchs);
		this.statusGateway.handleMatchDown();
		// spectator OFF
	}

	@SubscribeMessage('joinQueue')
	async handleJoinQueue(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		if (this.nbofchallengers == 0) {
			this.nbofchallengers++;
			this.idchallenger = obj[0];
			this.optionchallenger = obj[1];
			this.server.emit('waitInQueue');
			this.appService.changeStatus(this.idchallenger, 'in-queue');
			this.statusGateway.handleInQueue('in-queue', this.idchallenger);
		}
		else if (this.nbofchallengers == 1) {
			this.nbofchallengers = 0;
			let resultchallenger = await this.appService.getDataMe(this.idchallenger);
			let resultopponent = await this.appService.getDataMe(obj[0]);

			this.server.emit('actualiseQueue');
			this.server.emit('startGameQueue', true, resultchallenger, resultopponent, this.optionchallenger, obj[1]);
			this.appService.changeStatus(this.idchallenger, 'in-game');
			this.appService.changeStatus(obj[0], 'in-game');
			this.statusGateway.handleInGame('in-game', this.idchallenger);
			this.statusGateway.handleInGame('in-game', obj[0]);
			
			// spectator ON
			this.nbofmatchs++;
			this.server.emit('liveMatchs', this.nbofmatchs);
			this.statusGateway.handleMatchUp();
			// spectator ON

			this.listOfMatch.isPrivate = false;
			this.listOfMatch.listOfMatchs.push(resultchallenger.displayname + ' vs ' + resultopponent.displayname);
		}
		else {
			console.log('error');
		}
	}

	@SubscribeMessage('pongEventQueue')
	handlePongEventQueue(@ConnectedSocket() client: Socket, @MessageBody() obj: any): void
	{
		const roomreturn: Room = this.gameService.updatePlayerPosQueue(client.id, obj[0], obj[1], obj[2], obj[3]);
		let newListOfMatch: listOfMatchs = {
			isPrivate: false,
			listOfMatchs: [] as string[]
		}
		if (roomreturn) {
				this.server.emit('actualizeQueueGame', roomreturn);
				if (roomreturn.game.p1Score >= obj[3].optionChoice.maxScore || roomreturn.game.p2Score >= obj[3].optionChoice.maxScore) {
					this.countstop++;
					if (this.countstop == 1) {
					this.roomresult = roomreturn;
					this.server.emit('endGameQueue', roomreturn);
					this.countstop = 0;
					this.appService.changeStatus(roomreturn.challenger.id, 'online');
					this.appService.changeStatus(roomreturn.opponent.id, 'online');
					this.statusGateway.handleOnline('online', roomreturn.challenger.id);
					this.statusGateway.handleOnline('online', roomreturn.opponent.id);
					
					// spectator OFF
					this.nbofmatchs--;
					if (this.nbofmatchs < 0)
						this.nbofmatchs = 0;
					this.server.emit('liveMatchs', this.nbofmatchs);
					this.statusGateway.handleMatchDown();
					// spectator OFF

					newListOfMatch.listOfMatchs = this.listOfMatch.listOfMatchs.filter(item => item !== roomreturn.challenger.displayname + ' vs ' + roomreturn.opponent.displayname);
					this.listOfMatch = newListOfMatch;
					}
					else 
						return;
				}
			}
	}

	@SubscribeMessage('updateBallqueue')
	async handleUpdateBallQueue(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		this.server.emit('actualizeBallqueue', this.gameService.updateGameQueue(obj[0]));
		// this.handlePongEventQueue(client, obj);
	}

	@SubscribeMessage('gameStopQueue')
	handleGameStopQUeueEvent(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		this.server.emit('gameStopQueue', obj);
		
		// spectator OFF
		this.nbofmatchs--;
		if (this.nbofmatchs < 0)
			this.nbofmatchs = 0;
		this.server.emit('liveMatchs', this.nbofmatchs);
		this.statusGateway.handleMatchDown();
		// spectator OFF
	}

	@SubscribeMessage('history')
	async handleHistory(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		this.endgameinfoqueue = {
			winner: obj[0].winner,
			loser: obj[0].loser,
			p1: obj[0].p1,
			p2: obj[0].p2,
			gameoption: obj[1].optionChoice,
		}
		this.gameService.endGameQueue(this.endgameinfoqueue);
	}

	@SubscribeMessage('historyprivate')
	async handleHistoryPrivate(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		// console.log('historyprivate', this.roomresultprivate, client.id );
		this.endgameinfoprivate = {
			winner: obj.winner,
			loser: obj.loser,
			p1: obj.p1,
			p2: obj.p2,
		}
		this.gameService.endGame(this.endgameinfoprivate);
	}

	@SubscribeMessage('checkMatchLive')
	async handleCheckMatchLive(@ConnectedSocket() client: Socket)
	{
		this.server.emit('checkMatchLive', this.nbofmatchs);
	}

	@SubscribeMessage('listOfMatch')
	async handleListOfMatch(@ConnectedSocket() client: Socket)
	{
		this.server.emit('listOfMatchs', this.listOfMatch);
	}

	@SubscribeMessage('launchSpectating')
	async handleLaunchSpectating(@ConnectedSocket() client: Socket, @MessageBody() obj: any)
	{
		if (!obj)
			return;
		this.server.emit('launchSpectating');
	}

}
