import { Injectable, ForbiddenException } from '@nestjs/common';
import {DataSource } from 'typeorm';
import { users } from './entity/users';
import { matchs } from './entity/matchs';
import { cp, unlinkSync } from 'fs';
import { friends } from './entity/friends';
import { blocked } from './entity/blocked';
import { matchrequest } from './entity/matchrequest';
import { groupchat} from './entity/groupchats';
import { get } from 'http';
import { channel_members } from './entity/channelmembers';
import { groupmessages } from './entity/groupmessages';
import { appService } from './app.service';
import { privatemsg } from './entity/privatemsg';
import { privatechat } from './entity/privatechat';
import * as bcrypt from 'bcrypt';
import * as nodeMailer from 'nodemailer';

@Injectable()
export class ChatService {

	async createChannel (IDuser: number, name: string) : Promise<{ID?: number, IDowner ?: number, nameowner ?: string}> {
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await  chatRepository.findOne({ where: { name: name } });
		if (groupchats)
			throw new ForbiddenException("Channel already exists");
		let newchat = new groupchat();
		newchat.name = name;
		newchat.owner = IDuser;
		newchat.type = "public"; // to change
		await chatRepository.save(newchat);
		const chatuser = await appService.PostgresDataSource.getRepository(channel_members);
		let newchatuser = new channel_members();
		newchatuser.iduser = IDuser;
		newchatuser.idgroupchat = newchat.id;
		newchatuser.is_admin = true;
		newchatuser.is_muted = false;
		newchatuser.is_banned = false;
		await chatuser.save(newchatuser);
		return ({ID: newchat.id, IDowner: newchat.owner, nameowner: (await appService.getDataMe(newchat.owner)).displayname});
	}
	
	async getChannels(ID: number) : Promise <string[]> {
		let ret : string[];
		ret = [];
		const channelMembersRepository = await appService.PostgresDataSource.getRepository(channel_members);
		const channelMembers = await channelMembersRepository.find({
			where: { iduser: ID }
		  });
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
	  	for (let i = 0; i < channelMembers.length; i++) {
			let groupchat = await chatRepository.findOne({ where: { id: channelMembers[i].idgroupchat } });
			if (groupchat)
			{
				if (groupchat.type == "public" || groupchat.type == "protected" || (groupchat.type == "private" && this.isbanned(ID, groupchat.id) && channelMembers[i].is_kicked == false))
					ret.push(groupchat.name);
			}
		
		}
		return (ret);
	}

	async getPublicChannels() : Promise <{ID?: number, name?: string, isProtected?: boolean, type ?: string}[]> {
		let ret : {ID?: number, name?: string, isProtected?: boolean, type ?: string}[];
		ret = [];
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.find({ where: [{ type: "public" }, { type: "protected" }] });

		if (!groupchats)
			throw new ForbiddenException("No public channels");
		for (let i = 0 ; i< groupchats.length; i++) {
			let add : {ID?: number, name?: string, isProtected?: boolean , type ?: string};
			add = {};
			add.ID = groupchats[i].id;
			add.name = groupchats[i].name;
			if (groupchats[i].type == "protected")
				add.isProtected = true;
			else
				add.isProtected = false;
			add.type = "public"
			ret.push(add);
		}
		return ret;
	}

	async getPrivateChannels(ID: number) : Promise <{ID?: number, name?: string, isProtected?:boolean, type ?: string}[]> {
		let ret : {ID?: number, name?: string, isProtected?: boolean, type ?: string}[];
		ret = [];
		const channelMembersRepository = await appService.PostgresDataSource.getRepository(channel_members);
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.find({ where: { type: "private" } });
		if (!groupchats)
			throw new ForbiddenException("No private channels");
		for (let i = 0 ; i< groupchats.length; i++) {
			const channelMembers = await channelMembersRepository.findOne({ where: { idgroupchat: groupchats[i].id, iduser: ID } });
			if (channelMembers && channelMembers.is_banned == false)
			{
				let add : {ID?: number, name?: string, isProtected?: boolean, type ?: string};
				add = {};
				add.ID = groupchats[i].id;
				add.name = groupchats[i].name;
				add.isProtected = true;
				add.type = "private";
				ret.push(add);
			}
		}
		return ret;
	}

	async getchannelmembers(IDuser: number, idgroupchat: number) : Promise <{ID?: number, nom?: string, is_admin?: boolean, is_muted?: boolean, time_mute ?: Date, time_ban ?: Date, is_banned?: boolean, is_owner ?: boolean}[]> {
		let ret : {ID?: number, nom?: string, is_admin?: boolean, is_muted?: boolean, is_banned?: boolean, is_owner?: boolean, time_mute ?: Date, time_ban ?: Date}[];
		ret = [];
		const channelMembersRepository = await appService.PostgresDataSource.getRepository(channel_members);
		const channelMembers = await channelMembersRepository.find({where: { idgroupchat: idgroupchat }});
		const idowner = await this.getidowner(idgroupchat);
		for (let i = 0 ; i< channelMembers.length; i++) {
			let add : {ID?: number, nom?: string, is_admin?: boolean, is_muted?: boolean, is_banned?: boolean, is_owner?: boolean, time_mute ?: Date, time_ban ?: Date};
			add = {};
			add.ID = channelMembers[i].iduser;
			add.is_admin = channelMembers[i].is_admin;
			add.is_muted = await this.ismuted(channelMembers[i].iduser, idgroupchat);
			add.time_mute = channelMembers[i].time_mute;
			add.is_banned = await this.isbanned(channelMembers[i].iduser, idgroupchat);
			add.time_ban = channelMembers[i].time_ban;
			add.nom = (await appService.getDataMe(channelMembers[i].iduser)).displayname;
			if (channelMembers[i].iduser == idowner)
				add.is_owner = true;
			else
				add.is_owner = false;
			ret.push(add);
		}
		// console.log('ret getchannelmenbers', ret);
		return ret;
	}

	async getidowner(idgroupchat: number) : Promise <number> {
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.findOne({ where: { id: idgroupchat } });
		if (!groupchats)
			throw new ForbiddenException("Channel doesn't exist");
		return groupchats.owner;
	}

	async isblocked(IDUser: number, IDblocked: number) : Promise <boolean> {
		const blockedRepository = await appService.PostgresDataSource.getRepository(blocked);
		const blockedUser = await blockedRepository.findOne({ where: { iduser: IDUser, idblocked: IDblocked } });
		if (blockedUser)
			return true;
		return false;
	}
	async getallmessage(IDUser: number, nomchat: string) : Promise<{ID?: number, nom?: string, message?: string, date?: Date}[]> {
		let ret : {ID?: number, nom?: string, message?: string, date?: Date}[];
		ret = [];
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.findOne({ where: { name: nomchat } });
		if (!groupchats)
			throw new ForbiddenException("Channel doesn't exist");
		if (await this.isbanned(IDUser, groupchats.id) == true) throw new ForbiddenException("You are banned");
		const chatmessageRepo = await appService.PostgresDataSource.getRepository(groupmessages);
		const chatmessage = await chatmessageRepo.find({ where: { idgroupchat: groupchats.id } });
		for (let i = 0 ; i < chatmessage.length; i++) {
			if (await this.isblocked(IDUser, chatmessage[i].iduser) == false){
				let add : {ID?: number, nom?: string, message?: string, date?: Date};
				add = {};
				add.ID = chatmessage[i].iduser;
				add.message = chatmessage[i].content;
				add.date = chatmessage[i].date;
				add.nom = (await appService.getDataMe(chatmessage[i].iduser)).displayname;
				ret.push(add);
			}
		}
		ret.sort((a, b) => {
			const dateA = a.date instanceof Date ? a.date.getTime() : 0;
			const dateB = b.date instanceof Date ? b.date.getTime() : 0;
			
			return dateA - dateB;
			});
		// console.log(ret);
		return ret;
		}
	
	async getID(nomchat: string) : Promise <number> {
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.findOne({ where: { name: nomchat } });
		if (!groupchats)
			throw new ForbiddenException("Channel doesn't exist");
		return groupchats.id;
	}

	async sendmessage(IDuser: number, nomchat: string, message: string) : Promise <void> {
		const chatRepository = await appService.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.findOne({ where: { name: nomchat } });
		// console.log (IDuser, nomchat, message);
		if (!groupchats){
			// console.log("Channel doesn't exist");
			throw new ForbiddenException("Channel doesn't exist");
		}
		const channelMembersRepository = await appService.PostgresDataSource.getRepository(channel_members);
		const channelMembers = await channelMembersRepository.findOne({ where: { idgroupchat: groupchats.id, iduser: IDuser } });
		if (!channelMembers){
			// console.log("memb doesn't exist");
			throw new ForbiddenException("You are not in this channel");
		}
		if (await this.isbanned(IDuser, groupchats.id) == true){
			// console.log("banned");
			throw new ForbiddenException("You are banned from this channel");
		}
		if (await this.ismuted(channelMembers.iduser, groupchats.id) == true)
		{
			// console.log("muted");
			throw new ForbiddenException("You are muted in this channel");
		}
		const chatmessageRepo = await appService.PostgresDataSource.getRepository(groupmessages);
		const chatmessage = await chatmessageRepo.create();
		chatmessage.idgroupchat = groupchats.id;
		chatmessage.iduser = IDuser;
		chatmessage.content = message;
		chatmessage.date = new Date();
		await chatmessageRepo.save(chatmessage);
	}

	async getalldirectchat(IDUser: number) : Promise<{IDuser?: number, IDchat?: number, nom?: string}[]> {
		// console.log('getalldirectchat', IDUser);
		let ret : {IDuser?: number, IDchat?: number, nom?: string}[];
		ret = [];
		const privatechatRepository = await appService.PostgresDataSource.getRepository(privatechat);
		const chatIds = await privatechatRepository
		.createQueryBuilder("privateChat")
		.select("*")
		.where("privateChat.iduser1 = :IDUser OR privateChat.iduser2 = :IDUser", { IDUser })
		.getRawMany();
		for (let i = 0 ; i< chatIds.length; i++) {
			let add : {IDuser?: number, IDchat?: number, nom?: string};
			add = {};
			if (chatIds[i].iduser1 != IDUser)
				add.IDuser = chatIds[i].iduser1;
			else
				add.IDuser = chatIds[i].iduser2;
			// console.log('chqt ',chatIds[i])
			add.IDchat = chatIds[i].id;
			add.nom = (await appService.getDataMe(add.IDuser)).displayname;
			ret.push(add);
		}
		// console.log('ret getalldirectchat', ret);
		return ret;
	}

	async getallmessageprivate(iduser: number, IDchat: number) : Promise<{ID?: number, nom?: string, message?: string, date?: Date}[]> {
		let ret : {ID?: number, nom?: string, message?: string, date?: Date}[];
		ret = [];
		const chatRepository = await appService.PostgresDataSource.getRepository(privatechat);
		let chan = await chatRepository.findOne({ where: { id: IDchat } });
		let IDuser2 : number;
		if (!chan)
			throw new ForbiddenException("Channel doesn't exist");
		if (chan.iduser1 != iduser && chan.iduser2 != iduser)
			throw new ForbiddenException("You are not in this channel");
		if (chan.iduser1 == iduser)
			IDuser2 = chan.iduser2;
		else
			IDuser2 = chan.iduser1;
		ret = await this.getallmessageprivatefromuser(iduser, await appService.getDataMe(IDuser2).then((data) => data.displayname));
		// let chatmessage = await appService.PostgresDataSource.getRepository(privatemsg).find({ where: { idchat: IDchat } });
		
		// for (let i = 0 ; i < chatmessage.length; i++) {
		// 	let add : {ID?: number, nom?: string, message?: string, date?: Date};
		// 	add = {};
		// 	add.ID = chatmessage[i].iduser;
		// 	add.message = chatmessage[i].content;
		// 	add.date = chatmessage[i].date;
		// 	add.nom = (await appService.getDataMe(chatmessage[i].iduser)).displayname;
		// 	ret.push(add);
		// 	}
		// 	ret.sort((a, b) => {
		// 		const dateA = a.date instanceof Date ? a.date.getTime() : 0;
		// 		const dateB = b.date instanceof Date ? b.date.getTime() : 0;
		// 		return dateA - dateB;
		// 		});
		return ret;
	}

	async getallmessageprivatefromuser(IDuser1 : number, nameuser2 : string) : Promise<{ID?: number, nom?: string, message?: string, date?: Date}[]> {
		let ret : {ID?: number, nom?: string, message?: string, date?: Date}[];
		ret = [];
		let IDuser2 = await appService.getID(nameuser2);
		const chatRepository = await appService.PostgresDataSource.getRepository(privatechat)
		let chatroom = await chatRepository.findOne({ where: { iduser1: IDuser1, iduser2: IDuser2 } });
		if (!chatroom)
			chatroom = await chatRepository.findOne({ where: { iduser2: IDuser1, iduser1: IDuser2 } });
		if (!chatroom){
			chatroom = await chatRepository.create();
			chatroom.iduser1 = IDuser1;
			chatroom.iduser2 = (await appService.getID(nameuser2));
			await chatRepository.save(chatroom);
		}
		let chatmessage = await appService.PostgresDataSource.getRepository(privatemsg).find({ where: { idchat: chatroom.id } });
		for (let i = 0 ; i < chatmessage.length; i++) {
				let add : {ID?: number, nom?: string, message?: string, date?: Date};
				add = {};
				add.ID = chatmessage[i].iduser;
				add.message = chatmessage[i].content;
				add.date = chatmessage[i].date;
				add.nom = (await appService.getDataMe(chatmessage[i].iduser)).displayname;
				if (await this.isblocked(IDuser1, add.ID) == false)
					ret.push(add);
		}
		ret.sort((a, b) => {
			const dateA = a.date instanceof Date ? a.date.getTime() : 0;
			const dateB = b.date instanceof Date ? b.date.getTime() : 0;
			return dateA - dateB;
			});
		return ret;
	}

	async sendprivatemessage(IDuser: number, nomfriend : string, message: string) : Promise <void> {
		// console.log('sendprivatebackend', IDuser, nomfriend, message);
		const chatRepository = await appService.PostgresDataSource.getRepository(privatechat)
		let chatroom = await chatRepository.findOne({ where: { iduser1: IDuser, iduser2: (await appService.getID(nomfriend)) } });
		if (!chatroom)
			chatroom = await chatRepository.findOne({ where: { iduser2: IDuser, iduser1: (await appService.getID(nomfriend)) } });
		if (!chatroom){
			chatroom = await chatRepository.create();
			chatroom.iduser1 = IDuser;
			chatroom.iduser2 = (await appService.getID(nomfriend));
			await chatRepository.save(chatroom);
		}
		if (message !== ""){
			let msg = await appService.PostgresDataSource.getRepository(privatemsg).create();
			msg.idchat = chatroom.id;
			msg.iduser = IDuser;
			msg.content = message;
			msg.date = new Date();
			await appService.PostgresDataSource.getRepository(privatemsg).save(msg);
		}
	}
	
	async getinfochannel(idchannel : number) :Promise<groupchat> {
	return await appService.PostgresDataSource.getRepository(groupchat).findOne({ where: { id: idchannel } });
	}
	
	async getpassword(IDuser: number, IDchannel: number) : Promise <string> {
		const passw = (await appService.PostgresDataSource.getRepository(groupchat).findOne({ where: { id: IDchannel } })).pass;
		if (!passw)
			throw new ForbiddenException("channel not found or no password on channel");
		if (await this.isbanned(IDuser, IDchannel) == true)
		{
			throw new ForbiddenException("you are banned from this channel");
		}
		return passw;
	}

	async comparepassword(IDuser: number, IDchannel: number, password : string) : Promise <boolean> {
		const passw = (await appService.PostgresDataSource.getRepository(groupchat).findOne({ where: { id: IDchannel } })).pass;
		if (!passw)
			throw new ForbiddenException("channel not found or no password on channel");
		if (await this.isbanned(IDuser, IDchannel) == true)
		{
			throw new ForbiddenException("you are banned from this channel");
		}
		 return bcrypt.compare(password, passw);
	}

	async changepassword(IDuser: number, IDchannel: number, password : string) : Promise <boolean> {
	let repo = await appService.PostgresDataSource.getRepository(groupchat);
	let chan = await repo.findOne({ where: { id: IDchannel } });
	if (!chan)
		throw new ForbiddenException("channel not found");
	if (chan.owner != IDuser)
		throw new ForbiddenException("not the owner of this channel");
	chan.type = "protected"
	chan.pass = await bcrypt.hash(password, 10);
	await repo.save(chan);
	return true;
	}

	async newpassword(IDuser: number, IDchannel: number, password : string) : Promise <boolean> {
	let repo = await appService.PostgresDataSource.getRepository(groupchat);
	let chan = await repo.findOne({ where: { id: IDchannel } });
	if (!chan)
		throw new ForbiddenException("channel not found");
	if (chan.owner != IDuser)
		throw new ForbiddenException("not the owner of this channel");
	chan.pass = await bcrypt.hash(password, 10);
	chan.type = "private"
	await repo.save(chan);
	return true;
	}

	async removepassword(IDuser: number, IDchannel: number) : Promise <boolean> {
		let repo = await appService.PostgresDataSource.getRepository(groupchat);
		let chan = await repo.findOne({ where: { id: IDchannel } });
		if (!chan)
			throw new ForbiddenException("channel not found");
		if (chan.owner != IDuser)
			throw new ForbiddenException("not the owner of this channel");
		chan.pass = null;
		chan.type = "public"
		await repo.save(chan);
		return true
	}

	async isadmin(IDuser: number, IDchannel: number) : Promise <boolean> {
		let repo = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!repo)
			return false;
		if (repo.is_admin == true)
			return true;
		return false;
	}

	async promoteadmin(IDuser: number, IDchannel: number, nameadmin) : Promise <boolean> {
		let repo = await appService.PostgresDataSource.getRepository(groupchat);
		let chan = await repo.findOne({ where: { id: IDchannel } });
		if (!chan)
			throw new ForbiddenException("channel not found");
		const IDadmin = await appService.getID(nameadmin);
		if (chan.owner != IDuser)
			throw new ForbiddenException("not the owner of this channel");
		if (await this.isadmin(IDadmin, IDchannel))
			throw new ForbiddenException("already admin of this channel");
		let member = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDadmin, idgroupchat: IDchannel } });
		if (!member)
			throw new ForbiddenException("user not in this channel");
		if (member.is_banned == true || member.is_muted == true)
			throw new ForbiddenException("user is banned/muted from this channel");
		member.is_admin = true;
		await appService.PostgresDataSource.getRepository(channel_members).save(member);
		return true;
	}

	async demoteadmin(IDuser: number, IDchannel: number, nameadmin) : Promise <boolean> {
		let repo = await appService.PostgresDataSource.getRepository(groupchat);
		let chan = await repo.findOne({ where: { id: IDchannel } });
		if (!chan)
			throw new ForbiddenException("channel not found");
		const IDadmin = await appService.getID(nameadmin);
		if (chan.owner != IDuser)
			throw new ForbiddenException("not the owner of this channel");
		if (chan.owner == IDadmin)
			throw new ForbiddenException("already owner of this channel");
		if ((await this.isadmin(IDadmin, IDchannel)) == false)
			throw new ForbiddenException("not an admin of this channel");
		let member = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDadmin, idgroupchat: IDchannel } });
		if (!member)
			throw new ForbiddenException("user not in this channel");
		member.is_admin = false;
		await appService.PostgresDataSource.getRepository(channel_members).save(member);
		return true;
	}

	async banuser(IDuser: number, IDchannel: number, nameuser : string) : Promise <boolean> {
		let user = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!user)
			throw new ForbiddenException("you are not in this channel");
		if (user.is_admin == false && await this.getidowner(IDchannel) != IDuser)
			throw new ForbiddenException("you are not an admin of this channel");
		let banned = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: await appService.getID(nameuser), idgroupchat: IDchannel } });
		if (!banned)
			throw new ForbiddenException("user not in this channel");
		if (banned.iduser == IDuser)
			throw new ForbiddenException("you can't ban yourself");
		if (banned.is_admin == true && await this.getidowner(IDchannel) != IDuser)
			throw new ForbiddenException("you are not the owner of this channel, you can't ban an admin");
		if (banned.iduser == await this.getidowner(IDchannel))
			throw new ForbiddenException("you can't ban the owner of this channel");
		banned.is_banned = true;
		banned.time_ban = new Date(Date.now() + 60000);
		await appService.PostgresDataSource.getRepository(channel_members).save(banned);
		return true;
	}

	async unbanuser(IDuser: number, IDchannel: number, nameuser : string) : Promise <boolean> {
		let user = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!user)
			throw new ForbiddenException("you are not in this channel");
		if (user.is_admin == false && await this.getidowner(IDchannel) != IDuser)
			throw new ForbiddenException("you are not an admin of this channel");
		let banned = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: await appService.getID(nameuser), idgroupchat: IDchannel } });
		banned.is_banned = false;
		banned.time_ban = null;
		await appService.PostgresDataSource.getRepository(channel_members).save(banned);
		return true;
	}

	async isbanned(IDuser: number, IDchannel: number) : Promise <boolean> {
		let user = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!user)
			return false;
		if (user.is_banned == true )
		{
			if (user.time_ban > new Date(Date.now()))
				return true;
			user.is_banned = false;
			user.time_ban = null;
			await appService.PostgresDataSource.getRepository(channel_members).save(user);
		}
		return false;
	}

	async muteuser(IDuser: number, IDchannel: number, nameuser : string) : Promise <boolean> {
		let user = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!user)
			throw new ForbiddenException("you are not in this channel");
		if (user.is_admin == false && await this.getidowner(IDchannel) != IDuser)
			throw new ForbiddenException("you are not an admin of this channel");
		let muted = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: await appService.getID(nameuser), idgroupchat: IDchannel } });
		if (await this.getidowner(IDchannel) == muted.iduser)
			throw new ForbiddenException("cannot mute the owner of a channel");
		if (muted.is_admin == true && await this.getidowner(IDchannel) != muted.iduser)
			throw new ForbiddenException("cannot mute the owner or an admin of this channel");
		muted.is_muted = true;
		muted.time_mute = new Date(Date.now() + 60000);
		await appService.PostgresDataSource.getRepository(channel_members).save(muted);
		return true;
	}

	async unmuteuser(IDuser: number, IDchannel: number, nameuser : string) : Promise <boolean> {
		let user = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!user)
			throw new ForbiddenException("you are not in this channel");
		if (user.is_admin == false && await this.getidowner(IDchannel) != IDuser)
			throw new ForbiddenException("you are not an admin of this channel");
		let muted = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: await appService.getID(nameuser), idgroupchat: IDchannel } });
		muted.is_muted = false;
		muted.time_mute = null;
		await appService.PostgresDataSource.getRepository(channel_members).save(muted);
		return true;
	}

	async ismuted(IDuser: number, IDchannel: number) : Promise <boolean> {
		let user = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!user)
			throw new ForbiddenException("you are not in this channel");
		if (user.is_muted === true )
		{
			// console.log('is muted' + user.is_muted);
			if (user.time_mute > new Date(Date.now()))
				return true;
			user.is_muted = false;
			user.time_mute = null;
			await appService.PostgresDataSource.getRepository(channel_members).save(user);
		}
		// console.log('is muted' + user.is_muted);
		return false;
	}


	async kickmember(IDuser: number, IDchannel: number, nameuser : string) : Promise <boolean> {
		// console.log('kick memberchatservice', IDuser, IDchannel, nameuser);
		let chan = await appService.PostgresDataSource.getRepository(groupchat).findOne({ where: { id: IDchannel } });
		// console.log('chan', chan);
		if (!chan)
			throw new ForbiddenException("channel not found");
		const IDkicked = await appService.getID(nameuser);
		// console.log('IDkicked', IDkicked);
		if (!(await this.isadmin(IDuser, IDchannel)))
			throw new ForbiddenException("you are not an admin of this channel");
		if (await this.isadmin(IDkicked, IDchannel) && await this.getidowner(IDchannel) != IDuser)
			throw new ForbiddenException("cannot kick an admin");
		if (await this.getidowner(IDchannel) == IDkicked)
			throw new ForbiddenException("cannot kick the owner");
		
		let member = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDkicked, idgroupchat: IDchannel } });
		await this.leavechannel(IDkicked, IDchannel);
		return true;
	}

	async leavechannel(IDuser: number, IDchannel: number) : Promise <boolean> {
		// console.log('leave channel', IDuser, IDchannel);
		let member = await appService.PostgresDataSource.getRepository(channel_members).findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (!member)
			throw new ForbiddenException("you are not in this channel");
		if ((await appService.PostgresDataSource.getRepository(groupchat).findOne({ where: { id: IDchannel } })).owner == IDuser)
		{
			await this.destroychannel(IDchannel);
			return true;
		}
		if (await this.ismuted(IDuser, IDchannel) == true ||  await this.isbanned(IDuser, IDchannel)== true)
		{
			member.is_kicked = true;
			await appService.PostgresDataSource.getRepository(channel_members).save(member);
			return true;
		}
		await appService.PostgresDataSource.getRepository(channel_members).remove(member);	
		return true;
	}

	async destroychannel(IDchannel: number) {
		let msg = await appService.PostgresDataSource.getRepository(groupmessages)
		await msg.delete({ idgroupchat: IDchannel });
		let members = await appService.PostgresDataSource.getRepository(channel_members)
		members.delete({ idgroupchat: IDchannel });
		let channel = await appService.PostgresDataSource.getRepository(groupchat)
		channel.delete({ id: IDchannel });
		
	}
	// check 
	async blockuser(IDuser: number, nameblocked : string) {
	let idblocked = await appService.getID(nameblocked);
	// console.log( IDuser, 'block user',idblocked);
	await appService.blockuser(IDuser, idblocked);
	
	}

	async unblockuser(IDuser: number, nameblocked : string) {
	let idblocked = await appService.getID(nameblocked);
	// console.log( IDuser, 'unblock user',idblocked);
	await appService.unblockuser(IDuser, idblocked);

	}

	async adduserinchannel(IDiser: number, IDchannel: number, IDuser : number) : Promise <boolean> {
		let channelMembers = await appService.PostgresDataSource.getRepository(channel_members);
		const test = await channelMembers.findOne({ where: { iduser: IDuser, idgroupchat: IDchannel } });
		if (test == undefined)
		{
			// console.log('add user in channel user :' + IDuser + ' channel : ' + IDchannel);
			let add = new channel_members();
			add.idgroupchat = IDchannel;
			add.iduser = IDuser;
			add.is_admin = false;
			add.is_banned = false;
			add.is_muted = false;
			add.is_kicked = false;
			add.time_ban = null;
			add.time_mute = null;
			await channelMembers.save(add);
			return true;
		}
		if (await this.isbanned(IDuser, IDchannel))
		{
			// console.log('bannned user in channel');
			throw new ForbiddenException("you are banned from this channel");
		}
		if(test.is_kicked == true)
		{
			// console.log('unkick user in channel');
			test.is_kicked = false;
			await channelMembers.save(test);
			return true;
		}
		return true;
	}
}