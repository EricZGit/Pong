import {
		WebSocketGateway,
		WebSocketServer,
		OnGatewayConnection,
		OnGatewayDisconnect,
	}
	from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { SubscribeMessage, ConnectedSocket, MessageBody} from '@nestjs/websockets';
// import { AppService } from './app.service';

interface userCo {
	id: number;
	socketid: string;
}

@WebSocketGateway(
	{ 
		cors: {
		origin: '*'
		},
	})

// @WebSocketGateway({	cors: true, namespace: '/matchLauncher' })
// @WebSocketGateway({	cors: true, namespace: '/Chat' })

@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	// constructor(private readonly appService: AppService) {}
	
	async onModuleInit()
	{
		// console.log("[Chat Gateway] Module initialized");
	}

	async onModuleDestroy()
	{
		// console.log("[Chat Gateway] Module destroyed");
	}

	@WebSocketServer() server: Server;
	nbofusers: number = 0;
	listofusers: string[] = [];
	listCo: userCo[] = [];

	async sendNewMessageToUser(message: Object, user: string)
	{
		this.server.emit('message', message);
	}

	async sendNewMessageDirectToUser(message: Object, idchat: number)
	{
		this.server.emit('messagedirect', message, idchat);
	}

	async kickMember(name: string)
	{
		this.server.emit('kicked', name);
	}

	async addMember(room: string, msg: string)
	{
		this.server.emit('new_member');
	}

	@SubscribeMessage('coucou')
	async handleDisconnectEvent(@ConnectedSocket() client: Socket)
	{
		// console.log(client.id + " disconnected from chat gateway");
		this.handleDisconnect(client);
	}

	handleDisconnect(client: Socket)
	{
		this.nbofusers--;
		// console.log("[Chat Gateway] User disconnected --> Total Users connected to chat gateway : " + this.nbofusers);
		this.server.emit("user_disconnected", {});
		this.listofusers = this.listofusers.filter(item => item !== client.id);
		for (let i = 0; i < this.listCo.length; i++)
		{
			if (this.listCo[i].socketid == client.id)
			{
				this.listCo.splice(i, 1);
				break;
			}
		}
		// console.log("listofusers", this.listofusers);
	}

	async handleConnection(client: Socket, ...args: any[])
	{
		// console.log("[Chat Gateway] User connected", client.id);
		this.nbofusers++;
		// console.log("[Chat Gateway] Total Users connected to chat gateway : " + this.nbofusers);
		this.server.emit("user_connected", {});
		this.listofusers.push(client.id);
		// console.log("listofusers", this.listofusers);
	}

	async leaveChannel(channel: string, msg: string)
	{
		this.server.emit("user_left_channel", channel, msg);
		let socket : Socket = null;
		if (socket)
			socket.leave("channel_" + channel + "_by_username : " + msg);
	}

	async destroyChannel(msg: string)
	{
		this.server.emit("channel_destroyed", msg);
	}

	createChannel(channel_name: string)
	{
		this.server.emit("channel_created", channel_name);
	}

	changeType(channel_id: number, type: string)
	{
		this.server.emit("channel_type_changed", type)
	}

	activePassword(name: string, channel_id)
	{
		this.server.emit("channel_password_actived", name, channel_id);
	}

	deletePassword(name: string)
	{
		this.server.emit("channel_password_deleted", name);
	}

	promoteAdmin(name: string)
	{
		this.server.emit("user_promoted", name);
	}

	demoteAdmin(name: string)
	{
		this.server.emit("user_demoted", name);
	}

	@SubscribeMessage('join')
	async joinChannel(@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		// console.log("join channel", data);
		for (let i = 0; i < this.listofusers.length; i++)
		{
			if (this.listofusers[i] == client.id)
			{
				this.listofusers.splice(i, 1);
				break;
			}
		}
		this.listofusers.push(client.id);
		this.listCo.push({id: data, socketid: client.id});
		// console.log("listofco", this.listCo);
	}

	@SubscribeMessage('leave')
	async leaveChannel2(@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		// console.log("leave channel", data);
		for (let i = 0; i < this.listofusers.length; i++)
		{
			if (this.listofusers[i] == client.id)
			{
				this.listofusers.splice(i, 1);
				break;
			}
		}
		for (let i = 0; i < this.listCo.length; i++)
		{
			if (this.listCo[i].id == data)
			{
				this.listCo.splice(i, 1);
				break;
			}
		}
		// console.log("listofco", this.listCo);
	}

	@SubscribeMessage('checkOnChat')
	async checkOnChat(@ConnectedSocket() client: Socket, @MessageBody() data: any)
	{
		// console.log("checkOnChat", data);
		let res = false;
		for (let i = 0; i < this.listCo.length; i++)
		{
			if (this.listCo[i].id == data)
			{
				res = true;
				// console.log("res true", res);
				break;
			}
		}
		client.emit("checkOnChatRes", res);
	}
}



