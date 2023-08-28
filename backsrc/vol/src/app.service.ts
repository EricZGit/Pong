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
import { ChatService } from './chat.service';
import { AuthService } from './auth.service';
import { stringify } from 'querystring';
import { privatemsg } from './entity/privatemsg';
import { privatechat } from './entity/privatechat';
import { Console } from 'console';
import { MailerService } from '@nestjs-modules/mailer';
import {
	Player,
	Ball,
	Room,
	Paddle,
	EndGameInfo,
	Game,
  } from './interfaces/game.interface';
import { check } from 'prettier';
// import {process} from 'process';



@Injectable()
export class AppService {
	
	public PostgresDataSource: DataSource;
	public chatService : ChatService;
	public authService : AuthService;
	constructor() {
		this.PostgresDataSource = new DataSource({
			"type": "postgres",
			"host": "postgre",
			"port": 5432,
			"username": process.env.POSTGRES_USER,
			"password": process.env.POSTGRES_PASSWORD,
			"database": process.env.POSTGRES_DB,
			entities: [users, matchs, friends, blocked, matchrequest, groupchat, channel_members, groupmessages, privatemsg, privatechat],
		});
		this.initializeDataSource();
		this.chatService = new ChatService();
		this.authService = new AuthService();
	}

	private async initializeDataSource(): Promise<void> {
		try {
			await this.PostgresDataSource.initialize();
			// console.log("Data Source has been initialized!");
		} catch (err) {
			console.error("Error during Data Source initialization", err);
		}
	}



	async getHello(): Promise<string> {
			// console.log(process.env)
		return 'Hello World2!';
	}


	async getID (name : string): Promise<number> {
		if (this.checkString(name) == false) throw new ForbiddenException("forbidden character");
		const userRepository = await this.PostgresDataSource.getRepository(users).find({where: {nom: name}});
		if (!userRepository[0]) throw new ForbiddenException("User not found !");
		return userRepository[0].id;
	}

  	async getDataMe(ID: number): Promise<{ id?: number, status?: string, pathtoimage?: string, score?: number, rank?: number,
		 displayname?: string, wins?: number, loses?: number, mail?: string, fa?: boolean}> {
    
      	let returnDataMe : { id?: number, status?: string, pathtoimage?: string, score?: number, rank?: number,
			displayname?: string, wins?: number, loses?: number, mail?: string, fa ?: boolean};
	  
	 	const userRepository = await this.PostgresDataSource.getRepository(users);
	  	const result =  await userRepository.find({
		  	where: {
			  	id: ID,
		  	},
	  	})
		if (!result[0]) throw new ForbiddenException("User not found ! in getdatame");
		returnDataMe = {};
		returnDataMe.displayname = result[0].nom;
		returnDataMe.rank = result[0].rank;
		returnDataMe.score = result[0].score;
		returnDataMe.pathtoimage = result[0].pathtoimage;
		returnDataMe.id = result[0].id;
		returnDataMe.status = result[0].status;
		returnDataMe.wins = result[0].nbofwin;
		returnDataMe.loses = result[0].nbofmatch - result[0].nbofwin;
		returnDataMe.mail = result[0].mail;
		returnDataMe.fa = result[0].twofactorauth;
		return returnDataMe;
	}

  	async getLeaderboard(): Promise <{ username?: string, score?: number, win?: number, 
    lose?: number, avatar?: string, rank?: number}[]> {
    
		let returnLeaderboard : { username?: string, score?: number, win?: number,
		lose?: number, avatar?: string, rank?: number}[];

		let add: { username?: string, score?: number, win?: number,
			lose?: number, avatar?: string, rank?: number};
		returnLeaderboard = [];
		const userRepository = this.PostgresDataSource.getRepository(users);
		const result = await userRepository.find();
		for (let i = 1; i <= 5 && i <= result.length ; i++) {
			for (let j = 0; j < result.length ; j++) {
				if (result[j].rank == i) {
					// console.log("result["+j+"]");
					// console.log(result[j]);
					add = {};
					add.username = result[j].nom;
					add.score = result[j].score;
					add.win = result[j].nbofwin;
					add.lose = result[j].nbofmatch - result[j].nbofwin;
					add.avatar = result[j].pathtoimage;
					add.rank = result[j].rank;
					returnLeaderboard.push(add);
					// console.log("add");
					// console.log(add);
					break;
				}
			}
		}
		// console.log("returnLeaderboard");
		// console.log(returnLeaderboard);
		return returnLeaderboard;
  	}
    
  	async changeDisplayName( ID: number, displayName: string): Promise<{ ID?: number, displayName?: string}> {
    
		if (this.checkString(displayName) == false) throw new ForbiddenException("forbidden character");
		let returnChangeDisplayName : { ID?: number, displayName?: string};
		
		const userRepository = this.PostgresDataSource.getRepository(users);
		const result = await userRepository.find({
			where: {
				id: ID,
			},
		})
		if (result.length > 0) {
			const test = await userRepository.find({
				where: {
					nom: displayName,
				},
			})
			if (test.length > 0 && test[0].id !== ID ) 
			{
				throw new ForbiddenException("Displayname already taken");
			}
			result[0].nom = displayName;
			await userRepository.save(result[0]);
		}	
		else 
			throw new ForbiddenException("User not found in displayname change");
		returnChangeDisplayName = {};
		returnChangeDisplayName.ID = ID;
		returnChangeDisplayName.displayName = displayName;
		return returnChangeDisplayName;
  	}

  	async getMatchHistory(ID: number): Promise<{ ID?: number, result?: string, 
    score?: string, opponent?: string, avatar?: string, idmatch?: number, rank?: number }[]> {
		
		let returnMatchHistory : { ID?: number, result?: string, 
		score?: string, opponent?: string, avatar?: string, idmatch?: number, rank?: number}[];

		returnMatchHistory = [];
		let matches  = await this.PostgresDataSource.manager.find(matchs);
		const userRepository = await this.PostgresDataSource.getRepository(users);

		for (let i = 0 ; i < matches.length ; i++)
		{
			if (matches[i].winner == ID || matches[i].loser == ID)
			{
				let idopponent: number;
				let add: { ID?: number, result?: string, 
					score?: string, opponent?: string, avatar?: string, idmatch?: number, rank?: number};
				add = {};
				add.ID = matches[i].id;
				if (matches[i].winner == ID)
				{
					add.result = 'WIN';
					idopponent = matches[i].loser;
				}
				else
				{
					add.result = 'LOSE';
					idopponent = matches[i].winner;
				}
				add.score = matches[i].score;
				add.idmatch = matches[i].id;
				
				const opponent = await userRepository.find({
					where: {
						id: idopponent,
					},
				})
				add.opponent = opponent[0].nom;
				add.avatar = opponent[0].pathtoimage;
				add.rank = opponent[0].rank;
				returnMatchHistory.push(add);
			}
		}

		return returnMatchHistory;
    }

	async calculateRank(): Promise <void> {
		let currentrank = 1;
		let potential = 0;
		let max = -410000;

		let susers = await this.PostgresDataSource.manager.find(users)
		for (let i = 0; i < susers.length; i++) {
			susers[i].rank = 0;
		}
		while (currentrank <= susers.length) {
			max = -41000;
			potential = 0;
			for (let i = 0; i < susers.length; i++) {
				if (susers[i].score > max && susers[i].rank == 0)
				{
					max = susers[i].score;
					potential = i;
				}
			}
			susers[potential].rank = currentrank;
			currentrank++;
		}
		await this.PostgresDataSource.manager.save(susers);
		// await userRepository.save(users);
	}

	async upMatch( match: EndGameInfo, mode: string): Promise<void> {
		
		// console.log("upMatch ", match,' et le mode ', mode);

		let matchRepository = this.PostgresDataSource.getRepository(matchs);
		let newMatch = new matchs();
		newMatch.winner = match.winner.id

		await this.changewinsuccess(match.winner.id, true);

		newMatch.loser = match.loser.id;
		newMatch.score = match.score;
		newMatch.date = new Date();
		newMatch.mode = mode;
		await matchRepository.save(newMatch);
		let loser = await this.PostgresDataSource.getRepository(users).findOne({where: {id: match.loser.id}});
		let winner = await this.PostgresDataSource.getRepository(users).findOne({where: {id: match.winner.id}});
		loser.nbofmatch++;
		winner.nbofmatch++;
		winner.nbofwin++;
		loser.score -= 100;
		winner.score += 100;
		await this.PostgresDataSource.getRepository(users).save(loser);
		await this.PostgresDataSource.getRepository(users).save(winner);
		await this.calculateRank();
	}

	async getAvatar(ID: number): Promise<{ ID?: number, avatar?: string}> {
		let returnAvatar : { ID?: number, avatar?: string};
		const userRepository = this.PostgresDataSource.getRepository(users);
		const result = await userRepository.find({
			where: {
				id: ID,
			},
		})
		if (result.length > 0) {
			returnAvatar = {};
			returnAvatar.ID = ID;
			returnAvatar.avatar = result[0].pathtoimage;
		}
		else
			throw new ForbiddenException("User not found in getavatar");
		// console.log('returnAvatar', returnAvatar);
			return returnAvatar;
	}

	async uploadAvatar(ID: number, avatar: string): Promise<{ ID?: number, avatar?: string}> {

		try {
			// console.log('uploadAvatar', ID, avatar);
			const userRepository = this.PostgresDataSource.getRepository(users);
			const result = await userRepository.find({
				where: {
					id: ID,
				},
			})
			if (result.length > 0) {
				if (result[0].pathtoimage === "default")
				{
					result[0].pathtoimage = avatar;
					await userRepository.save(result[0]);

					await this.changeavatarsuccess(ID, true);

				} else {
					unlinkSync("./images/" + result[0].pathtoimage);
					result[0].pathtoimage = avatar;
					await userRepository.save(result[0]);
				}
			}
			else
				throw new ForbiddenException("User not found in uploadavatar");
		} catch (e) {
			throw e;
		}
		return { ID, avatar };
	}
											
	async getallusers (ID: number) : Promise<{ID?: number, nom?: string,status?: string,pathtoimage?: string, score?: number, rank?: number}[]> {
		let returnalluser : {ID?: number, nom?: string,status?: string,pathtoimage?: string, score?: number, rank?: number}[];
		returnalluser = [];
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const result = await userRepository.find();
		if (result.length > 0) {
			for (let i = 0; i < result.length; i++) {
				if (result[i].id !== ID)
				{
					let add: {ID?: number, nom?: string, status?: string,pathtoimage?: string, score?: number, rank?: number};
					add = {};
					add.ID = result[i].id;
					add.nom = result[i].nom;
					add.status = result[i].status;
					add.pathtoimage = result[i].pathtoimage;
					add.score = result[i].score;
					add.rank = result[i].rank;
					returnalluser.push(add);
				}
			}
			return (returnalluser);
		}
		else
		throw new ForbiddenException(" No User found in database");
		// console.log(returnalluser);
	}
		
	async getallfriends (ID: number) : Promise<{ID?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[]> {
	
		let returnallfriends : {ID?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[];
		returnallfriends = [];
		const userRepository = await this.PostgresDataSource.getRepository(friends);
		const result = await userRepository.find();
		
		if (result.length > 0)
		{
			for (let i =0; i< result.length; i++)
			{
				if (result[i].iduser == ID)
				{
					let tmp : { id?: number, status?: string, pathtoimage?: string, score?: number, rank?: number,
						displayname?: string, wins?: number, loses?: number}
						tmp = await this.getDataMe(result[i].idfriend);
						let add : {ID?: number, nom?: string,status?: string,pathto?: string, rank?: number};
						add = {};
						add.ID = result[i].idfriend;
						add.nom = tmp.displayname;
						add.status = tmp.status;
					add.pathto = tmp.pathtoimage;
					add.rank = tmp.rank;
					returnallfriends.push(add);
				}

			}
			return returnallfriends;
		}
		return returnallfriends;
	}

	async getallblocked (ID: number) : Promise<{ID?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[]> {
		let returnallblocked : {ID?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[];
		returnallblocked = [];
		const userRepository = await this.PostgresDataSource.getRepository(blocked);
		const result = await userRepository.find();
		
		if (result.length > 0)
		{
			for (let i =0; i< result.length; i++)
			{
				if (result[i].iduser == ID)
				{
					let tmp : { id?: number, status?: string, pathtoimage?: string, score?: number, rank?: number,
						displayname?: string, wins?: number, loses?: number}
					tmp = await this.getDataMe(result[i].idblocked);
					let add : {ID?: number, nom?: string,status?: string,pathto?: string, rank?: number};
					add = {};
					add.ID = result[i].idblocked;
					add.nom = tmp.displayname;
					add.status = tmp.status;
					add.pathto = tmp.pathtoimage;
					add.rank = tmp.rank;
					returnallblocked.push(add);
				}

			}
		return returnallblocked;
		}
	return returnallblocked;
	}

	async  getallrequestsent (ID: number) : Promise<{ID?: number, IDadversary?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[]> {

		let returnallrequestsent : {ID?: number, IDadversary?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[];
		returnallrequestsent = [];
		const matchrequestRepository = await this.PostgresDataSource.getRepository(matchrequest);
		const matchrequestlist = await matchrequestRepository.find({ where: { idasker: ID } });
		for (let i = 0; i < matchrequestlist.length; i++) {
			let add : {ID?: number, IDadversary?: number, nom?: string,status?: string,pathto?: string, rank?: number};
			add = {};
			let adversary : { id?: number, status?: string, pathtoimage?: string, score?: number, rank?: number,
				displayname?: string, wins?: number, loses?: number};
			adversary = await this.getDataMe(matchrequestlist[i].idreceiver);
			add.ID = matchrequestlist[i].idasker;
			add.IDadversary = matchrequestlist[i].idreceiver;
			add.nom = adversary.displayname;
			add.status = adversary.status;
			add.pathto = adversary.pathtoimage;
			add.rank = adversary.rank;
			returnallrequestsent.push(add);
		}
	
		return returnallrequestsent;
	}

	async getallrequestreceived (ID: number) : Promise<{ID?: number, IDadversary?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[]> {
	
		let returnallrequest : {ID?: number, IDadversary?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number}[];
		returnallrequest = [];
		const matchrequestRepository = await this.PostgresDataSource.getRepository(matchrequest);
		const matchrequestlist = await matchrequestRepository.find({ where: { idreceiver: ID } });
		for (let i = 0; i < matchrequestlist.length; i++) {
			let add : {ID?: number, IDadversary?: number, nom?: string,status?: string,pathto?: string, rank?: number};
			add = {};
			let adversary : { id?: number, status?: string, pathtoimage?: string, score?: number, rank?: number,
				displayname?: string, wins?: number, loses?: number};
			adversary = await this.getDataMe(matchrequestlist[i].idasker);
			add.ID = matchrequestlist[i].idreceiver;
			add.IDadversary = matchrequestlist[i].idasker;
			add.nom = adversary.displayname;
			add.status = adversary.status;
			add.pathto = adversary.pathtoimage;
			add.rank = adversary.rank;
			returnallrequest.push(add);
		}
		return (returnallrequest);
	}

	async setdoubleauthtrue (ID: number) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		await this.PostgresDataSource.query('UPDATE users SET twofactorauth = true WHERE id = $1', [ID]);

	}

	async setdoubleauthfalse (ID: number) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		// const user = await userRepository.findOne({ where: { id: ID } });
		// user.twofactorauth = false;
		// // console.log('push : ', user.twofactorauth);
		// await userRepository.save(user);
		// await userRepository.update({ id: ID }, { twofactorauth: false });
		// const user2 = await userRepository.findOne({ where: { id: ID } });
		// console.log('after : ', user2.twofactorauth);
		await this.PostgresDataSource.query('UPDATE users SET twofactorauth = false WHERE id = $1', [ID]);
	}

	async getdoubleauth (ID: number) : Promise<boolean> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		return (user.twofactorauth);
	}

	async blockuser (ID: number, IDblocked: number) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(blocked);

		if (ID == IDblocked)
			return;
		const test = await userRepository.findOne({ where: { iduser: ID, idblocked: IDblocked } });
		if (test)
			return;
		const user = new blocked();
		user.iduser = ID;
		user.idblocked = IDblocked;
		await userRepository.save(user);
	}

	async unblockuser (ID: number, IDblocked: number) : Promise<void> {
		// console.log('unblockuser', ID, IDblocked);
		const userRepository = await this.PostgresDataSource.getRepository(blocked);
		const user = await userRepository.findOne({ where: { iduser: ID, idblocked: IDblocked } });
		if (user)
			await userRepository.remove(user);
	}

	async addfriend (ID: number, namefriend: string) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(friends);
		const userRepository2 = await this.PostgresDataSource.getRepository(users);
		const user2 = await userRepository2.findOne({ where: { nom : namefriend } });
		if (ID == user2.id)
			throw new ForbiddenException("User cannot add himself");
		const test = await userRepository.findOne({ where: { iduser: ID, idfriend: user2.id } });
		if (test)
			throw new ForbiddenException("User already in friendlist");
		const user = new friends();
		user.iduser = ID;
		user.idfriend = user2.id;

		await this.changefriendsuccess(ID, true);

		await userRepository.save(user);
	}

	async removefriend (ID: number, IDfriend: number) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(friends);
		const user = await userRepository.findOne({ where: { iduser: ID, idfriend: IDfriend } });
		if (user)
			await userRepository.remove(user);
	}

	async checkEmailCode (ID: number, code: string) : Promise<boolean> {
		// console.log("code : ", code);
		let returnvalue : boolean;
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		// console.log("user : ", user.twofactorcode);
		return (user.twofactorcode  == code);
	}

	async showEmail (ID: number) : Promise<string> {
		let returnvalue : string;
		let user = await this.getDataMe(ID);
		returnvalue = user.mail;
		return (returnvalue);
	}

	async getalladders (ID: number) : Promise<{ID?: number, nom?: string, status?: string,pathtoimage?: string, score?: number, rank?: number}[]> {
		let ret : {ID?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number, score?: number}[];
		const user = await this.getallusers(ID);
		const blocked = await this.getallblocked(ID);
		const friends = await this.getallfriends(ID);
		ret = [];
		for (let i = 0; i < user.length; i++) {
			let add : {ID?: number, nom?: string,status?: string,pathtoimage?: string, rank?: number, score?: number};
			add = {};
			let test : boolean;
			test = false;
			for (let j = 0; j < blocked.length; j++) {
				if (user[i].ID == blocked[j].ID)
					test = true;
			}
			for (let j = 0; j < friends.length; j++) {
				if (user[i].ID == friends[j].ID)
					test = true;
			}
			if (test == false) {
				add.ID = user[i].ID;
				add.nom = user[i].nom;
				add.status = user[i].status;
				add.pathtoimage = user[i].pathtoimage;
				add.score = user[i].score;
				add.rank = user[i].rank;
				ret.push(add);
			}
		}
		return (ret);
	}

	async uploadEmail(ID: number, mail: string) : Promise<boolean> {

		// console.log("mail : ", mail);

		if (this.validatemail(mail) == false)
		{
			throw new ForbiddenException("Invalid mail");
		}
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		user.mail = mail;
		user.twofactorauth = true;
		await userRepository.save(user);
		return true;
	}

	validatemail (mail: string) : boolean {
		if (mail == null || mail == "")
			return (false);
		const atIndex = mail.indexOf("@");
		const dotIndex = mail.lastIndexOf(".");
		const spaceIndex = mail.indexOf(" ");
		return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < mail.length - 1 && spaceIndex == -1;
	}

	async createChannel (IDuser: number, name: string) : Promise<{ID?: number}> {
		const chatRepository = await this.PostgresDataSource.getRepository(groupchat);
		const groupchats = await  chatRepository.findOne({ where: { name: name } });
		if (groupchats)
			throw new ForbiddenException("Channel already exists");
		let newchat = new groupchat();
		newchat.name = name;
		newchat.owner = IDuser;
		newchat.type = "public"; // to change
		await chatRepository.save(newchat);
		const chatuser = await this.PostgresDataSource.getRepository(channel_members);
		let newchatuser = new channel_members();
		newchatuser.iduser = IDuser;
		newchatuser.idgroupchat = newchat.id;
		newchatuser.is_admin = true;
		newchatuser.is_muted = false;
		newchatuser.is_banned = false;
		await chatuser.save(newchatuser);
		return ({ID: newchat.id});
	}
	
	async getChannels(ID: number) : Promise <string[]> {
		let ret : string[];
		ret = [];
		const channelMembersRepository = await this.PostgresDataSource.getRepository(channel_members);
		const channelMembers = await channelMembersRepository.find({
			where: { iduser: ID }
		  });
		const chatRepository = await this.PostgresDataSource.getRepository(groupchat);
		// const groupchats = await chatRepository.find({ where});
	  	for (let i = 0; i < channelMembers.length; i++) {
			// console.log("hello");
			let groupchat = await chatRepository.findOne({ where: { id: channelMembers[i].idgroupchat } });
			if (groupchat)
				ret.push(groupchat.name);
		}


		return (ret);
	}
	async getallmessage(nomchat: string) : Promise<{ID?: number, nom?: string, message?: string, date?: Date}[]> {
		let ret : {ID?: number, nom?: string, message?: string, date?: Date}[];
		ret = [];

		const chatRepository = await this.PostgresDataSource.getRepository(groupchat);
		const groupchats = await chatRepository.findOne({ where: { name: nomchat } });
		if (!groupchats)
			throw new ForbiddenException("Channel doesn't exist");
		const chatmessageRepo = await this.PostgresDataSource.getRepository(groupmessages);
		const chatmessage = await chatmessageRepo.find({ where: { idgroupchat: groupchats.id } });
		for (let i = 0 ; i < chatmessage.length; i++) {
			let add : {ID?: number, nom?: string, message?: string, date?: Date};
			add = {};
			add.ID = chatmessage[i].iduser;
			add.message = chatmessage[i].content;
			add.date = chatmessage[i].date;
			add.nom = (await appService.getDataMe(chatmessage[i].iduser)).displayname;
			ret.push(add);
			}
		
		ret.sort((a, b) => {
			const dateA = a.date instanceof Date ? a.date.getTime() : 0;
			const dateB = b.date instanceof Date ? b.date.getTime() : 0;
			
			return dateA - dateB;
			});
		return ret;
		}

	async getSuccess(ID: number) : Promise<{success_win?: boolean, success_avatar?: boolean, success_friend?: boolean, success_chat?: boolean, success_invit?: boolean}> {
		let ret : {success_win?: boolean, success_avatar?: boolean, success_friend?: boolean, success_chat?: boolean, success_invit?: boolean};
		ret = {};
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		ret.success_win = user.winmatch;
		ret.success_avatar = user.uploadavatar;
		ret.success_friend = user.addfriend;
		ret.success_chat = user.createchat;
		ret.success_invit = user.inviteplayer;
		return ret;
	}

	async changewinsuccess(ID: number, changeTo: boolean ) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		if (user.winmatch === changeTo)
			return;
		user.winmatch = changeTo;
		await userRepository.save(user);
	}

	async changeavatarsuccess(ID: number, changeTo: boolean ) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		if (user.uploadavatar === changeTo)
			return;
		user.uploadavatar = changeTo;
		await userRepository.save(user);
	}

	async changefriendsuccess(ID: number, changeTo: boolean ) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		if (user.addfriend === changeTo)
			return;
		user.addfriend = changeTo;
		await userRepository.save(user);
	}
	async changechatsuccess(ID: number, changeTo: boolean ) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		user.createchat = changeTo;
		await userRepository.save(user);
	}
	async changeinvitsuccess(ID: number, changeTo: boolean ) : Promise<void> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		if (user.inviteplayer === changeTo)
			return;
		user.inviteplayer = changeTo;
		await userRepository.save(user);
	}

	async changeStatus(ID: number, status: string) : Promise<void> {

		// console.log("changeStatus", ID, status);

		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		user.status = status;
		await userRepository.save(user);
	}
	
	async getStatus(ID: number) : Promise<string> {
		const userRepository = await this.PostgresDataSource.getRepository(users);
		const user = await userRepository.findOne({ where: { id: ID } });
		return (user.status);
	}

	checkString(str: string) : boolean {
		const sqlInjectionChars = ["'", "\"", ";", "--", "/*", "*/", "xp_", "exec", "SELECT", "INSERT", "UPDATE", "DELETE"];
		for (const char of sqlInjectionChars) {
			if (str.includes(char))
				return false;
			}
		return true;
	}
		
}

export const appService = new AppService();