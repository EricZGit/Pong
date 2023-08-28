import { Socket, Server } from 'socket.io';
import { 
        WebSocketGateway,
        WebSocketServer,
        OnGatewayConnection,
        OnGatewayDisconnect,      
    } 
        from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { appService } from './app.service';
import { SubscribeMessage, ConnectedSocket } from '@nestjs/websockets';

@WebSocketGateway({	cors: true, namespace: 'Status' })

@Injectable()
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	async onModuleInit()
    {
        // console.log("[Status Gateway] Module initialized");
    }
    
    async onModuleDestroy()
    {
        // console.log("[Status Gateway] Module destroyed");
    }

    @WebSocketServer() server: Server;
    nbofusers: number = 0;
    nbofmatchs: number = 0;

    //OK
	handleDisconnect(client: any) 
    {
		this.nbofusers--;
        // console.log("[Status Gateway] Client disconnected from StatusGateway --> Total : " + this.nbofusers);
	}

	//OK
    async handleConnection(client: Socket, args: any[]) 
    {
		this.nbofusers++;
        // console.log("[Status Gateway] Client connected to gateway --> Total : " + this.nbofusers, client.id);
	}

	async handleOnline(status : string, data: any)
    {
        // console.log("[Status Gateway] handleOnline");
		this.server.emit('statusChange', status, data);
        appService.changeStatus(data, "online");

	}

	async handleOffline(status : string, data: any)
    {
		// console.log("[Status Gateway] handleOffline");
        this.server.emit('statusChange', status, data);
        appService.changeStatus(data, "offline");
	}

	async handleInGame(status : string, data: any) 
    {
		// console.log("[Status Gateway] handleInGame");
        this.server.emit('statusChange', status, data);
        appService.changeStatus(data, "in-game");
	}

	async handleInQueue(status : string, data: any)
    {
		// console.log("[Status Gateway] handleInQueue");
        this.server.emit('statusChange', status, data);
        appService.changeStatus(data, "in-queue");
	}

	async handleSpectating(status : string, data: any)
    {
		// console.log("[Status Gateway] handleSpectating");
        this.server.emit('statusChange', status, data);
        appService.changeStatus(data, "spectating");
	}

    async handleMatchUp()
    {
        this.nbofmatchs++;
        this.server.emit('matchLive', this.nbofmatchs);
    }

    async handleMatchDown()
    {
        this.nbofmatchs--;
        if (this.nbofmatchs < 0)
            this.nbofmatchs = 0;
        this.server.emit('matchLive', this.nbofmatchs);
    }

    @SubscribeMessage('checkMatchLive')
	async handleCheckMatchLive(@ConnectedSocket() client: Socket)
	{
		this.server.emit('checkMatchLive', this.nbofmatchs);
	}
}
