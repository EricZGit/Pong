import { Injectable , ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { users } from './entity/users';
import { appService } from './app.service'
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from './app.service';
import * as nodeMailer from 'nodemailer';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class AuthService {
	async registerNewUser(username: string, password: string) {
		try {
			const userRepository = appService.PostgresDataSource.getRepository(users);
			const result = await userRepository.find({
				where: {
					nom: username,
			}})
			if (!username || username.length <= 2) 
				throw new ForbiddenException("3 characters minimum for User name");
			if (!password || password.length <= 2) 
				throw new ForbiddenException("3 characters minimum for Password");
			if (result.length > 0)
			{
				// console.log(result);
				throw new ForbiddenException("User already exist !");
			}
			const saltOrRounds = 10;
			const hash = await bcrypt.hash(password, saltOrRounds);
			const newUser =userRepository.create({
				nom: username,
				pass: hash,
				status: "online",
				pathtoimage: "default",
				twofactorauth: false,
				score: 100,
				rank: 0,
				nbofwin: 0,
				nbofmatch: 0,
			})
			await userRepository.save(newUser);
			await appService.calculateRank();
			return ('Register Done !');


		} 
		catch (e) {
			throw e;
		}
	}

	async loginNew_User(username: string, password: string) {
		try {
			// const result = await dataSource.manager.find(users)
			if (!username || !password) throw new ForbiddenException("Username or password empty !");
			// verification existant register/password?
			
			const userRepository = await appService.PostgresDataSource.getRepository(users);
			let result = await userRepository.find({
				where: {
					nom: username,
				},
			})
			//console.log(result[0]);
			if (!result) throw new ForbiddenException("User not found !");
			if (!result[0]) throw new ForbiddenException("User not found !");
			
			// if (result[0].nom === "admin")
			// {
			// 	var admin : { ID?: number, twofactorauth?: boolean};
			// 	admin = {};
			// 	admin.ID = result[0].id;
			// 	admin.twofactorauth = result[0].twofactorauth;
			// //	console.log(admin);
			// 	result[0].status = "online";
			// 	await userRepository.save(result[0]);
			// 	return admin;
			// }
			const isMatch = await bcrypt.compare(password, result[0].pass);
			if (!isMatch) throw new ForbiddenException("Password not match !");
			let returnUserLogin : { ID?: number, twofactorauth?: boolean};
			returnUserLogin = {};
			returnUserLogin.ID = result[0].id;
			returnUserLogin.twofactorauth = result[0].twofactorauth;
			// console.log(returnUserLogin);
			if (returnUserLogin.twofactorauth === true)
			{
				this.twofactorsendmail(returnUserLogin.ID);
				return returnUserLogin;
			}
			this.loginUser(result[0].id);
			return returnUserLogin;
		} 
		catch (e) {
			throw e;
		}
	}


	async logoutUser(id: number) {
		try {
			const userRepository = await appService.PostgresDataSource.getRepository(users);
			let result = await userRepository.find({
				where: {
					id: id,
				},
			})
			// console.log(id);
			if (!result) throw new ForbiddenException("User not found !");
			result[0].status = "offline";
			await userRepository.save(result[0]);
		} 
		catch (e) {
			throw "errorrr";
		}
	}

	async loginUser(id: number) {
		try {
			const userRepository = await appService.PostgresDataSource.getRepository(users);
			let result = await userRepository.find({
				where: {
					id: id,
				},
			})
			// console.log(id);
			if (!result) throw new ForbiddenException("User not found !");
			result[0].status = "online";
			await userRepository.save(result[0]);
		}
		catch (e) {
			throw "errorrr";
		}
	}

	async twofactorsendmail(id: number) {
		let code = Math.floor(Math.random() * 1000000);
		
		let msg = "Your code is : " + code;
		// console.log(msg);
		let userRepository = await appService.PostgresDataSource.getRepository(users);
		let result = await userRepository.find({where: {id: id}});
		if (!result) throw new ForbiddenException("User not found !");
		result[0].twofactorcode = code.toString();
		await userRepository.save(result[0]);
		this.sendmail(msg, result[0].mail);
	}

	async twofactorcheckcode(id: number, code: string): Promise<boolean> {
		let userRepository = await appService.PostgresDataSource.getRepository(users);
		let result = await userRepository.find({where: {id: id}});
		if (!result) throw new ForbiddenException("User not found !");
		if (result[0].twofactorcode === code)
		{
			this.loginUser(id);
			return true;
		}
		else 
			return false
	}


	async sendmail(msg : string, mail : string){
		try
		{
			let transporter = nodeMailer.createTransport({
			host: "smtp.free.fr",
			port: 587,
			secure: false,
			auth: {
			user: process.env.MAIL, 
			pass: process.env.MAIL_PASSWORD,
			},
		});
		// console.log("send mail to ", mail);
		let info = await transporter.sendMail({
			from: '<trans42123@free.fr>',
			to: mail, 
			subject: "2FA",
			text: msg,
			html: "<b>" + msg + "</b>",
		});
		
		}
		catch (e)
		{
			return false;
		}
		return true;
	}

	async getToken(code : string)   { 
		let httpservice = new HttpService();
		let url = "https://api.intra.42.fr/oauth/token";
		let data = {
			grant_type: "authorization_code",
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: process.env.REDIRECT_URI,
			code: code
		};
		// console.log(data);
		try {
			// console.log("try : ");
			let result = await httpservice.post(url, data).toPromise();
			// console.log("access code :" + result.data.access_token);
			return result.data.access_token;
		}
		catch (e)
		{
			if (e.response) {
				console.log("Error response:", e.response.data);
				console.log("Status code:", e.response.status);
			  } else {
				console.log("Error:", e.message);
			  }
		}
	}

	async get42User(code : string)  {
		let access_token = await this.getToken(code);
		let httpservice = new HttpService();
		let url = "https://api.intra.42.fr/v2/me";
		let config = {
			headers: {
				Authorization: "Bearer " + access_token,
			},
		};
		let login = "";
		// console.log("access token : " + access_token);
		try {
			let result = await httpservice.get(url, config).toPromise();
			// console.log(result.data.login);
			login = result.data.login;
		}
		catch (e)
		{
			console.log(e);
		}
		let userRepository = await appService.PostgresDataSource.getRepository(users);
		let result = await userRepository.find({where: {login42: login}});
		if (result.length == 0) 
		{
			result = await userRepository.find({where: {nom: login}});
			if (result.length == 0)
			{
				await this.create42User(login);
				result = await userRepository.find({where: {nom: login}});
			}
			else
			{
				let name = await this.create42Displayname(login);
				await this.create42User2(login, name);
				result = await userRepository.find({where: {nom: name}});
			}
		}
		userRepository = await appService.PostgresDataSource.getRepository(users);
		result = await userRepository.find({where: {login42: login}});
		// console.log(result);
		let returnUserLogin : { ID?: number, twofactorauth?: boolean};
		returnUserLogin = {};
		returnUserLogin.ID = result[0].id;
		returnUserLogin.twofactorauth = result[0].twofactorauth;
		return returnUserLogin;
	}

	async create42Displayname(displayname : string) : Promise<string>
	{
		let userRepository = await appService.PostgresDataSource.getRepository(users);
		let result = await userRepository.find({where: {nom: displayname}});
		while (result.length != 0)
		{
			displayname = displayname + "1";
			result = await userRepository.find({where: {nom: displayname}});
		}
		return displayname;
	}

	async create42User2(login : string, nom : string)
	{
		// console.log("create42User2");
		let userRepository = await appService.PostgresDataSource.getRepository(users);
		const newUser =userRepository.create({
			login42: login,
			nom: nom,
			pass: "impossible",
			status: "online",
			pathtoimage: "default",
			twofactorauth: false,
			score: 100,
			rank: 0,
			nbofwin: 0,
			nbofmatch: 0,
		})
		// console.log(newUser);
		await userRepository.save(newUser);
		await appService.calculateRank();
		return ('Register Done !');
	}
	async create42User(login : string) 
	{
		// console.log("create42User");
		let userRepository = await appService.PostgresDataSource.getRepository(users);
		const newUser =userRepository.create({
			login42: login,
			nom: login,
			pass: "impossible",
			status: "online",
			pathtoimage: "default",
			twofactorauth: false,
			score: 100,
			rank: 0,
			nbofwin: 0,
			nbofmatch: 0,
		})
		// console.log(newUser);
		await userRepository.save(newUser);
		await appService.calculateRank();
		return ('Register Done !');
		
	}
}



