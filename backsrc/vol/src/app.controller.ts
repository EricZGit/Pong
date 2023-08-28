import { Controller, Get , Post , Body, Req, Res, NotFoundException, BadRequestException, Param } from '@nestjs/common';
import { AppService, appService } from './app.service';
import { AuthService } from "./auth.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { get } from 'http';
import { send } from 'process';
import { ChatService } from './chat.service';
import { blocked } from './entity/blocked';
import { AppGateway } from './channel.gateway';
import { StatusGateway } from './status.gateway';
import { MatchLauncherGateway } from './matchLauncher.gateway';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
			  private readonly statusGateway: StatusGateway) {}


	@Get('/')
		async getHello() {
			return await this.appService.getHello();
		}

  	@Get('user/data/me')
  		async getDataMe(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.getDataMe(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}

	@Get('game/look_for_a_game')
	async look_for_a_game(@Req() req) {
		return ("0");
	}
	
	
	@Get('user/data/success')
		async getSuccess(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			let test =  await this.appService.getSuccess(checkIDindatabase);
			let result = [{success_win: test.success_win, success_avatar: test.success_avatar, success_friend: test.success_friend, success_chat: test.success_chat, success_invit: test.success_invit}];
			return result;
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('user/data/deban')
	async debanUser(@Req() req, @Body('id') id: number) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.unblockuser(checkIDindatabase, id);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('user/data/addfriend')
	async addFriend(@Req() req, @Body('nom') nom: string) {
		if (this.appService.checkString(nom) == false) throw new BadRequestException("Forbidden");
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.addfriend(checkIDindatabase, nom);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('user/data/unfriend')
	async unfriend(@Req() req, @Body('id') id: number) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.removefriend(checkIDindatabase, id);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/listall')
	async listAllUsers(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.getallusers(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/listadd')
	async getListAdders(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.getalladders(checkIDindatabase);
			// return await this.appService.getallusers(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/listall/blocked')
	async listAllBlocked(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.getallblocked(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/listall/nofriends')
	async listAllNoFriends(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.getallfriends(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/profile/:id')
	async getProfile(@Param('id') id: number) {
		// console.log("getProfile: ", id);
		try {
			return await this.appService.getDataMe(id);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/profile/avatar/:id')
	async getProfileAvatar(@Param('id') id: number, @Res() res) {
		// console.log("getProfileAvatar: ", id);
		const user_avatar = this.appService.getAvatar(id);
		res.sendFile((await user_avatar).avatar, { root: 'images' });
	}
	
	@Get('user/data/avatar')
	async getAvatar(@Req() req, @Res() res) {
		const checkIDindatabase = req.headers.authorization;
		const user_avatar = this.appService.getAvatar(checkIDindatabase);
		res.sendFile((await user_avatar).avatar, { root: 'images' });
	}
	
	@Get('user/data/leaderboard')
	async getLeaderboard() {
		return await this.appService.getLeaderboard();
	}
	
	@Get('user/data/leaderboard/friends')
	async getLeaderboardFriends(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		
		try {
			let result = await this.appService.getallfriends(checkIDindatabase);
			
			for (let i = 0; i < result.length; i++) 
			{
				let retour = await this.appService.getStatus(result[i].ID);
				// console.log("getLeaderboardFriends: ", retour);

				if (retour == 'online')
				{
					this.statusGateway.handleOnline('online', result[i].ID);
					result[i].status = 'online';
				}
				else if (retour == 'in-game')
				{
					this.statusGateway.handleInGame('in-game', result[i].ID);
					result[i].status = 'in-game';
				}
				else if (retour == 'in-queue')
				{
					this.statusGateway.handleInQueue('in-queue', result[i].ID);
					result[i].status = 'in-queue';
				}
				else if (retour == 'spectating')
				{
					this.statusGateway.handleSpectating('spectating', result[i].ID);
					result[i].status = 'spectating';
				}
				else
				{
					this.statusGateway.handleOffline('offline', result[i].ID);
					result[i].status = 'offline';
				}
			}
			return result;
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('user/data/matchhistory')
	async getMatchHistory(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.getMatchHistory(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('user/data/change/displayname')
	async changeDisplayName(@Req() req, @Body('displayName') displayName: string) {
		const checkIDindatabase = req.headers.authorization;
		if (this.appService.checkString(displayName) == false) throw new BadRequestException('Forbidden characters in displayName');
		try {
			return await this.appService.changeDisplayName(checkIDindatabase, displayName);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('user/data/upload/avatar')
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			destination: './images',
		}),
	}))
	async uploadAvatar(@Req() req, @UploadedFile() file) {
		const checkIDindatabase = req.headers.authorization;
		try {
			await this.appService.uploadAvatar(checkIDindatabase, file.filename);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('user/avatar')
	async getUsersAvatar(@Body() pathInfo: { path: string }, @Res() res) {
		try	{
			res.sendFile(pathInfo.path, { root: 'images' });
		} catch (e) {
			return await new NotFoundException();
		}
	}
	
	@Post('2fa/turn-on')
	async turnOn2FA(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		// console.log("turnon"+checkIDindatabase);
		try {
			return await await this.appService.setdoubleauthtrue(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('2fa/turn-off')
	async turnOff2FA(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		// console.log("turnoff"+checkIDindatabase);
		try {
			return await await this.appService.setdoubleauthfalse(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('2fa/check-email-code')
	async checkEmailCode(@Req() req, @Body('code') code: string) {
		if (this.appService.checkString(code) == false) throw new BadRequestException('Forbidden characters in code');
		const checkIDindatabase = req.headers.authorization;
		// console.log("checkEmailCode: ", code);
		try {
			return await this.appService.checkEmailCode(checkIDindatabase, code);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('2fa/show-email')
	async showEmail(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.appService.showEmail(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	
	@Post('2fa/upload-email-code')
	async uploadEmailCode(@Req() req, @Body('code') code: string) {
		if (this.appService.checkString(code) == false) throw new BadRequestException('Forbidden characters in code');
		const checkIDindatabase = req.headers.authorization;
		// console.log("uploadEmailCode: ", code);
		try {
			return await this.appService.uploadEmail(checkIDindatabase, code);
		}
		catch (e) {
			throw e;
		}
	}
	
}		

@Controller('/channels')
export class ChatController {
	constructor(private readonly chatService: ChatService, private readonly websocketGateway: AppGateway, private readonly appService: AppService) {}
	
	@Post('channels') //create channel still need the ID of the creator
	async createChannel(@Req() req, @Body('channel_name') channel_name: string) {
		if (this.appService.checkString(channel_name) == false) throw new BadRequestException('Forbidden characters in channel_name');
		// console.log("creation channel_name: ", channel_name);
		const checkIDindatabase = req.headers.authorization;
		
		try {
			let result = await this.chatService.createChannel(checkIDindatabase, channel_name);
			this.websocketGateway.createChannel(channel_name);

			this.appService.changechatsuccess(checkIDindatabase, true);

			return result;
		}	
		catch (e) {
			throw e;
		}
	}
	
	@Get('getidowner/:idgroupchat')
	async getIDowner(@Param('idgroupchat') idgroupchat: number, @Req() req) {
		try {
			return await this.chatService.getidowner(idgroupchat);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('channels/public')
	async getPublicChannels() {
		// const checkIDindatabase = req.headers.authorization;
		try {
			return await this.chatService.getPublicChannels();
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('channels/private')
	async getPrivateChannels(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.chatService.getPrivateChannels(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('channelinfo/:idgroupchat')
	async getChannelInfo(@Req() req, @Param('idgroupchat') idgroupchat: number) {
		try {
			// console.log("getChannelInfo: ", idgroupchat);
			return  await this.chatService.getchannelmembers(req.headers.authorization, idgroupchat);
		}
		catch (e) {
			// console.log("getChannelInfoerror: ", e);
			throw e;
		}
	}
	
	@Post('getidchannel/:name')
	async getID(@Param('name') name: string, @Req() req) {
		if (this.appService.checkString(name) == false) throw new BadRequestException('Forbidden characters in getidchannelname');
		try {
			// console.log("getidchannelname: ", name);	
			return this.chatService.getID(name);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('allmessages/:name')
	async getallmessages(@Param('name') name: string, @Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("getallmessagesname: ", name);
			return await this.chatService.getallmessage(checkIDindatabase, name);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('sendmessage/:name')
	async sendmessage(@Param('name') name: string, @Req() req, @Body('message') message: string) {
		if (this.appService.checkString(message) == false) throw new BadRequestException('Forbidden characters in message');
		const checkIDindatabase = req.headers.authorization;	
		// this.websocketGateway.sendNewMessageToUser(message, name);
		try {
			// console.log("sendmessage: ", name);
			let result = await this.chatService.sendmessage(checkIDindatabase, name, message);
			this.websocketGateway.sendNewMessageToUser(message, name);
			return result;
			// return await this.chatService.sendmessage(checkIDindatabase, name, message);
		}
		catch (e) {
			throw e;
		}
	}	
	
	// // return await le passeword du channel et verif si le user n est pas banned
	@Post('getpassword/:idchannel')
	async getpassword(@Param('idchannel') idchannel: number, @Req() req, @Body('password') password: string) {
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("getpassword: ", idchannel);
			return await this.chatService.comparepassword(checkIDindatabase, idchannel, password);
		}
		catch (e) {
			throw e;
		}
	}
	
	// change le password
	@Post('changepassword/:idchannel')
	async changepassword(@Param('idchannel') idchannel: number, @Req() req, @Body('password') password: string) {
		const checkIDindatabase = req.headers.authorization;
		
		// this.websocketGateway.notifChannel('' + idchannel, ' new_password : ', password);
		let infochannel = await this.chatService.getinfochannel(idchannel);
		let channel_name = infochannel.name;
		
		
		try {
			let result = await this.chatService.changepassword(checkIDindatabase, idchannel, password);
			if (result == true)
			{
				this.websocketGateway.activePassword(channel_name, idchannel);
				return result;
			}
			else
			return result;
			// console.log("changepassword: ", idchannel, password, checkIDindatabase);
			// return await this.chatService.changepassword(checkIDindatabase, idchannel, password);
		}
		catch (e) {
			throw e;
		}
	}
	
	
	// ajoute/change le password et pass le channel de public a protected 
	@Post('newpassword/:idchannel')
	async newpassword(@Param('idchannel') idchannel: number, @Req() req, @Body('password') password: string) {
		const checkIDindatabase = req.headers.authorization;
		
		this.websocketGateway.changeType(idchannel, 'private');
		
		try {
			// console.log("newpassword: ", idchannel);
			return await this.chatService.newpassword(checkIDindatabase, idchannel, password);
		}
		catch (e) {
			throw e;
		}
	}
	
	//remove channel^password 
	@Post('removepassword/:idchannel')
	async removepassword(@Param('idchannel') idchannel: number, @Req() req, @Body('owner') owner: number) {
		// console.log("removepassword: ", owner);
		const checkIDindatabase = owner;
		let infochannel = await this.chatService.getinfochannel(idchannel);
		let channel_name = infochannel.name;
		
		// this.websocketGateway.deletePassword(idchannel);
		try {
			let result = await this.chatService.removepassword(checkIDindatabase, idchannel);
			if (result == true)
			{
				this.websocketGateway.deletePassword(channel_name);
				return result;
			}
			else
			return result;
			// console.log("removepassword: ", checkIDindatabase  , idchannel);
			// return await this.chatService.removepassword(checkIDindatabase, idchannel);
		}
		catch (e) {
			throw e;
		}
	}
	
	// promote/demote admin et return boolean isadmin dans getchannelmenbers
	// CHECK dans le back si le user est deja admin ou owner ou s'il est muted ou banned go EXECTPTION
	@Post('promoteadmin/:idchannel')
	async promoteadmin(@Param('idchannel') idchannel: number, @Req() req, @Body('adminname') adminname: string) {	
		if (this.appService.checkString(adminname) == false) throw new BadRequestException('Forbidden characters in adminname');
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("promoteadmin: ", idchannel);
			this.websocketGateway.promoteAdmin(adminname);
			return await this.chatService.promoteadmin(checkIDindatabase, idchannel, adminname);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post ('demoteadmin/:idchannel')
	async demoteadmin(@Param('idchannel') idchannel: number, @Req() req, @Body('adminname') adminname: string) {
		if (this.appService.checkString(adminname) == false) throw new BadRequestException('Forbidden characters in adminname');
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("demoteadmin: ", idchannel);
			this.websocketGateway.demoteAdmin(adminname);
			return await this.chatService.demoteadmin(checkIDindatabase, idchannel, adminname);
		}
		catch (e) {
			throw e;
		}
	}
	
	// ban/unban user et return boolean isbanned dans getchannelmenbers FOR LIMITED TIME à definir
	// CHECK dans le back si le user est  admin ou owner => EXECTPTION impossible
	@Post('banmenber/:idchannel')
	async banmenber(@Param('idchannel') idchannel: number, @Req() req, @Body('banname') banname: string) {
		if (this.appService.checkString(banname) == false) throw new BadRequestException('Forbidden characters in banname');
		const checkIDindatabase = req.headers.authorization;
		
		try {
			// console.log("banmenber: ", idchannel);
			return await this.chatService.banuser(checkIDindatabase, idchannel, banname);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('unbanmenber/:idchannel')
	async unbanmenber(@Param('idchannel') idchannel: number, @Req() req, @Body('banname') banname: string) {
		if (this.appService.checkString(banname) == false) throw new BadRequestException('Forbidden characters in banname');
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("unbanmenber: ", idchannel);
			return await this.chatService.unbanuser(checkIDindatabase, idchannel, banname);
		}
		catch (e) {
			throw e;
		}
	}
	// mute/unmute user et return await boolean ismuted dans getchannelmenbers
	// CHECK dans le back si le user est  admin ou owner => EXECTPTION impossible
	@Post('mutemenber/:idchannel')
	async mutemenber(@Param('idchannel') idchannel: number, @Req() req, @Body('mutename') mutename: string) {
		if (this.appService.checkString(mutename) == false) throw new BadRequestException('Forbidden characters in mutename');
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("mutemenber: ", idchannel);
			return await this.chatService.muteuser(checkIDindatabase, idchannel, mutename);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('unmutemenber/:idchannel')
	async unmutemenber(@Param('idchannel') idchannel: number, @Req() req, @Body('mutename') mutename: string) {
		if (this.appService.checkString(mutename) == false) throw new BadRequestException('Forbidden characters in mutename');
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("unmutemenber: ", idchannel);
			return await this.chatService.unmuteuser(checkIDindatabase, idchannel, mutename);
		}
		catch (e) {
			throw e;
		}
	}
	
	
	// kick user et donc mmets a jour list des menbers
	// CHECK dans le back si le user est  admin ou owner => EXECTPTION impossible
	@Post('kickmember/:idchannel')
	async kickmenber(@Param('idchannel') idchannel: number, @Req() req, @Body('kickname') kickname: string) {
		if (this.appService.checkString(kickname) == false) throw new BadRequestException('Forbidden characters in kickname');
		// console.log("kickmenber: ", kickname, idchannel, req.headers.authorization);
		const checkIDindatabase = req.headers.authorization;
		
		let infochannel = await this.chatService.getinfochannel(idchannel);
		let channel_name = infochannel.name;
		let idowner = await this.chatService.getidowner(idchannel);
		
		let idadmin = await this.appService.getID(kickname);
		let isadmin = await this.chatService.isadmin(idadmin ,idchannel);
		if (isadmin == true)
		throw ("You can't kick an admin of the channel");
		
		let datame = await this.appService.getDataMe(idowner);
		if (datame.displayname == kickname)
		throw ("You can't kick the owner of the channel");
		

		
		this.websocketGateway.kickMember(kickname);
		this.websocketGateway.leaveChannel(channel_name, kickname);
		
		try {
			// console.log("kickmenber: ", idchannel);
			return await this.chatService.kickmember(checkIDindatabase, idchannel, kickname);
		}
		catch (e) {
			throw e;
		}
	}
	
	// add user apres un join et donc mets a jour list des menbers
	@Post('addmenberinchannel/:idchannel')
	async addmenberinchannel(@Param('idchannel') idchannel: number, @Req() req, @Body('userID') userID: number) {
		const checkIDindatabase = req.headers.authorization;
		
		let datame = await this.appService.getDataMe(userID);
		let username = datame.displayname;
		let infochannel = await this.chatService.getinfochannel(idchannel);
		let channel_name = infochannel.name;
		
		this.websocketGateway.addMember(channel_name, username);
		
		try {
			// console.log("addmenberinchannel: ", idchannel);
			let result = await this.chatService.adduserinchannel(checkIDindatabase, idchannel, userID);
			if (result == true)
			{
				this.websocketGateway.addMember(channel_name, username);
				return result;
			}
			else
			return result;
			// return await this.chatService.adduserinchannel(checkIDindatabase, idchannel, userID);
		}
		catch (e) {
			throw e;
		}
	}
	
	// leave channel et donc mets a jour list des menbers
	// CHECK dans le back si le user est  owner => destruction du channel
	@Post('leavechannel/:idchannel')
	async leavechannel(@Param('idchannel') idchannel: number, @Req() req, @Body('user_id') user_id: number) {
		const checkIDindatabase = user_id;
		
		let datame = await this.appService.getDataMe(user_id);
		let username = datame.displayname;
		let idowner = await this.chatService.getidowner(idchannel);
		let infochannel = await this.chatService.getinfochannel(idchannel);
		let channel_name = infochannel.name;
		
		try {
			// console.log("leavechannel: ", idchannel);
			let result = await this.chatService.leavechannel(checkIDindatabase, idchannel);
			if (result == true)
			{
				this.websocketGateway.leaveChannel(channel_name, username);
				if (idowner == user_id)
				this.websocketGateway.destroyChannel(channel_name);
				return result;
			}
			else
			return result;
			// return await this.chatService.leavechannel(checkIDindatabase, idchannel);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('block/:name')
	async blockUser(@Param('name') name: string, @Req() req, @Body('userID') userID: number) {
		if (this.appService.checkString(name) == false) throw new BadRequestException('Forbidden characters in blockname');
		const checkIDindatabase = userID;
		try {
			return await this.chatService.blockuser(checkIDindatabase, name);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('unblock/:name')
	async unblockUser(@Param('name') name: string, @Req() req,@Body('userID') userID: number) 
	{
		if (this.appService.checkString(name) == false) throw new BadRequestException('Forbidden characters in unblockname');
		const checkIDindatabase = userID;
		try {
			return await this.chatService.unblockuser(checkIDindatabase, name);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('direct/:name')
	async createDirect(@Param('name') name: string, @Req() req, @Body('message') message: string) {
		if (this.appService.checkString(name) == false) throw new BadRequestException('Forbidden characters in directname');
		if (this.appService.checkString(message) == false) throw new BadRequestException('Forbidden characters in message');
		const checkIDindatabase = req.headers.authorization;
		// console.log("createDirect: ", checkIDindatabase, name, message);
		try {
			return await this.chatService.sendprivatemessage(checkIDindatabase, name, message);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('channels/direct')
	async getChannelsD(@Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			return await this.chatService.getalldirectchat(checkIDindatabase);
		}
		catch (e) {
			throw e;
		}
	}
	
	@Get('alldirectmessages/:idchat')
	async getalldirectmessages(@Param('idchat') idchat: number, @Req() req) {
		const checkIDindatabase = req.headers.authorization;
		try {
			// console.log("getalldirectmessages : ", idchat);
			let ret = await this.chatService.getallmessageprivate(checkIDindatabase, idchat);
			// console.log("ret :  ", ret);
			return ret;
		}
		catch (e) {
			throw e;
		}
	}
	
	@Post('sendmessagedirect/:name')
	async sendmessagedirect(@Param('name') name: string, @Req() req, @Body('message') message: string) {
		if (this.appService.checkString(name) == false) throw new BadRequestException('Forbidden characters in directname');
		if (this.appService.checkString(message) == false) throw new BadRequestException('Forbidden characters in senddirectmessage');
		const checkIDindatabase = req.headers.authorization;
		// console.log("sendmessagedirect: ", checkIDindatabase, name, message);
		
		let infochannel = await this.chatService.getallmessageprivatefromuser(checkIDindatabase, name);
		// console.log("sendmessagedirect: ", infochannel);
		let directchat = await this.chatService.getalldirectchat(checkIDindatabase);
		// console.log("sendmessagedirect: ", directchat);
		let idchat = 0;
		for (let i = 0; i < directchat.length; i++) {
			if (directchat[i].nom == name)
			{	
				idchat = directchat[i].IDchat;
				// console.log("sendmessagedirect: ", idchat);
				break;
			}
		}
		
		try {
			let result = await this.chatService.sendprivatemessage(checkIDindatabase, name, message);
			// console.log("sendmessagedirect: ", name);
			this.websocketGateway.sendNewMessageDirectToUser(infochannel, idchat);
			return result;
			// return await this.chatService.sendprivatemessage(checkIDindatabase, name, message);
		}
		catch (e) {
			throw e;
		}
	}
}

@Controller('/login')
export class AuthController {
	constructor(private readonly authService: AuthService,private readonly statusGateway: StatusGateway,
				private readonly appService: AppService) {}
	
	//AUTHENTIFICATION 42
	@Post()
	login42(@Body('codename') codename: string) {
		
		// console.log("login42 codecallback: ", codename);

		if (codename == '')
			throw ("codename is empty");
		try {
			// return ({ ID: 1, twofactorauth: false})
			return this.authService.get42User(codename);
		} catch (e) {
			throw e;
		}
		
	}
	// MEME return que loginNewUser  ID et twofactorauth
	
	@Post('new_user_register')
	registerNewUser(@Body('username') username: string, @Body('password') password: string) {
		if (this.appService.checkString(username) == false) throw new BadRequestException('Forbidden characters in username');
		try {
			return this.authService.registerNewUser(username, password);
		} catch (e) {
			throw e;
		}
	}
	
	@Post('new_user_login')
	loginNewUser(@Body('username') username: string, @Body('password') password: string) {
		if (this.appService.checkString(username) == false) throw new BadRequestException('Forbidden characters in username');
		try {
			return this.authService.loginNew_User(username, password);
		} catch (e) {
			throw e;
		}
	}
	
	@Post('push-to-back')
	loginPushToBack(@Req() req) {
		try {
			// console.log("loginPushToBack: ", req.headers.authorization);
			this.statusGateway.handleOnline('online', req.headers.authorization);
			this.appService.changeStatus(req.headers.authorization, 'online');
			return this.authService.loginUser(req.headers.authorization);
		} catch (e) {
			throw e;
		}
	}
	
	@Post('out-push-to-back')
	logoutPushToBack(@Req() req) {
		try {
			// console.log("logoutPushToBack: ", req.headers.authorization);
			this.statusGateway.handleOffline('offline', req.headers.authorization);
			this.appService.changeStatus(req.headers.authorization, 'offline');
			return this.authService.logoutUser(req.headers.authorization);
		} catch (e) {
			throw e;
		}
	}
	
	@Post('check-2fa')
	check2FA(@Req() req, @Body('code') code: string) {
		if (this.appService.checkString(code) == false) throw new BadRequestException('Forbidden characters in check2facode');
		try {
			// console.log("check2FA: ", req.headers.authorization, code);
			return this.authService.twofactorcheckcode(req.headers.authorization, code);
		}
		catch (e) {
			throw e;
		}
	}

}

@Controller('/game')
export class GameController {
	constructor(private readonly statusGateway: StatusGateway, 
		private readonly matchlauncherGateway: MatchLauncherGateway,
		private readonly appService: AppService) {}
		
	@Get('game/look_for_a_game')
	async look_for_a_game(@Req() req) {
		
		return ("0");
	}

	@Post('challenge/:nomadversaire')
	async challenge(@Req() req, @Param('nomadversaire') nomadversaire: number, @Body('userId') userId: number) {
		// console.log("challenge: ", userId , nomadversaire);
		let opponent = await this.appService.getStatus(nomadversaire);
		if (opponent != 'online')
			throw ("Your opponent is not online");
		
		try {
				this.statusGateway.handleInQueue('in-queue', userId);
				return 1;
		}
		catch (e) {
			throw e;
		}
	}
}