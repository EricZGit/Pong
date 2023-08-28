<script lang="ts">
    import { defineComponent } from 'vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import Userstatus from '../components/Userstatus.vue';
	import axios from 'axios';
	import authHeader from '@/services/auth-header';
	import { ChannelInterface } from '@/types/channel.interface';
	import { UserInterface } from '@/types/channel.interface';
	import { MessageInterface } from '@/types/channel.interface';
	import { DirectInterface } from '@/types/channel.interface';
	import $ from 'jquery';
	import UserdataService from '@/services/userdata.service';
	import { io, Socket } from 'socket.io-client';
	import router from '@/router';


    export default defineComponent({
        name: 'Chat',
        data() {
            return {
				displayname: '',
				socket: io() as Socket,
				socketGame: io() as Socket,
                mode: 'normal' as string,
				channels: [] as ChannelInterface[],
				channel: {
					ID: 0,
					canDirectTalk: false,
					name: '',  
					type: 'public',
					messages: new Array<MessageInterface>(),
					isProtected: false,
					IDowner: 0,
					nameowner: '',
					password: '',
					admin: 0,
					nom: '',
				} as ChannelInterface,
				userID: 0,
				filter: 'public',
				channelinfo: {
					menbers: new Array<UserInterface>(),
				} as ChannelInterface,
				directinfo: {
					direct: new Array<DirectInterface>(),
				} as ChannelInterface,
				isbanned: false,
				URL: "http://" + window.location.hostname + ":3000" as string,
				socketURL: "http://" + window.location.hostname + ":3000" as string,
				socketURLGame: "http://" + window.location.hostname + ":3000/matchLauncher" as string,
				countMatchsLive: 0,
				isMatchLive: false,
				isOnChat: false,
			};
        },
        components: {
            Userstatus,
        },
		computed: {
			placeholder() {
				if (this.channel.ID == 0)
					return 'Join a channel to send a message';
				else
					return 'Send a message';
			},
		},
		created(): void {
			this.$store.state.ischatconnected = true;

			this.userID = this.$store.state.user.ID;
			this.mode = 'normal';
			this.loadChannelsList();

			//SOCKET START
				this.socket = io(this.socketURL, {});
				this.socketGame = io(this.socketURLGame, {});

				this.socket.on('connect', () => {
					this.socket.emit('join', this.userID);
				});

				this.socket.on('disconnect', () => {
					this.socket.emit('leave', this.userID);
				});

				this.socket.on('checkOnChatRes', (data) => {
					if (data == true)
						this.isOnChat = true;
				});

				this.socketGame.on('liveMatchs', (count) => {
					if (count > 0)
						this.isMatchLive = true;
					else
						this.isMatchLive = false;
					this.countMatchsLive = count;
				});

				this.socketGame.on('checkMatchLive', (count) => {
					if (count > 0)
						this.isMatchLive = true;
					else
						this.isMatchLive = false;
					this.countMatchsLive = count;
				});

				this.socketGame.on('acceptChallenge', (chall, opp) => {
					if (opp.id == this.userID) {
						window.focus();
						if (window.confirm('Do you want to fight against ' + chall.displayname + ' ?'))
						{
							router.push('/gamesalonprivate');
							this.$store.state.roomId = 0;
							this.$store.state.challenger = false;
							this.$store.state.opponent = true;
							this.socketGame.emit('goToChallenge', chall, opp);
							this.socketGame.emit('launchGame', chall, opp);
						}
						else {
							this.socketGame.emit('refuseChallenge', chall, opp);
						}
					}
				});

				this.socketGame.on('startingGamePrivate', (bol, chall, opp) => {
					this.Ok_Toastify(chall.displayname + ' VS ' + opp.displayname + ' : is starting !');
					this.socket.emit('coucou');
				});

				this.socket.on('message', (data: MessageInterface) => {
					if (this.channel.messages)
					{
						this.channel.messages.push(data);
					}
					this.loadMessages();
				});

				this.socket.on('messagedirect', (data: MessageInterface, idchat) => {
					if (this.channel.messages)
					{
						this.channel.messages.push(data);						
					}
					this.loadMessagesDirect(idchat);
				});

				this.socket.on('new_member', () => {
					this.loadChannelsList();
					this.loadChannelInfo();
				});

				this.socket.on('user_left_channel', (channel, msg) => {
					this.Ok_Toastify('Member left this room -> ' + channel + ' : ' + msg);
					this.loadChannelInfo();
					this.loadChannelsList();
				});
				
				this.socket.on('kicked', (msg) => {
					this.loadChannelsList();
					this.loadChannelInfo();
					this.Ok_Toastify(msg + ' : You have been kicked from channel');
				});

				this.socket.on("channel_created", (channel_name) =>
				{
					this.Ok_Toastify('Channel created : ' + channel_name);
					this.loadChannelsList()
				});
				
				this.socket.on("channel_type_changed", (type) =>
				{
					this.Ok_Toastify('Channel type changed : ' + type);
					this.setFilter(type);
					this.loadChannelInfo();
					this.loadChannelsList();
				});
				
				this.socket.on("channel_password_actived", (name, channel_id) =>
				{
					for (let channel of this.channels) {
						if (channel.ID == channel_id) {
							if (channel.isProtected == false)
								this.Ok_Toastify('New password on this channel : ' + name);
							channel.isProtected = true;
							this.loadChannelsList();
							break;
						}
					}
				});

				this.socket.on("channel_password_deleted", (name) =>
				{
					this.Ok_Toastify('Password deleted on this channel : ' + name);
					this.loadChannelsList();
				});

				this.socket.on("channel_destroyed", (msg) =>
				{
					this.channel.ID = 0;
					this.channel.name = '';
					this.channel.type = 'public';
					this.channel.messages = new Array<MessageInterface>();
					this.channel.isProtected = false;
					this.channel.IDowner = 0;
					this.channel.nameowner = '';
					this.channel.password = '';
					this.channel.admin = 0;
					$('#goto_channel_input').val('');
					$('#create_channel_input').val('');
					$('#addadmin_channel_input').val('');
					$('#msg_input').val('');
					this.setFilter('public');
					this.loadChannelsList();
					this.Ok_Toastify('Channel destroyed : ' + msg);
				})

				this.socket.on("user_promoted", (msg) =>
				{
					this.Ok_Toastify(msg + ' : You have been promoted to admin');
					this.loadChannelInfo();
				});

				this.socket.on("user_demoted", (msg) =>
				{
					this.Ok_Toastify(msg + ' : You have been demoted to member');
					this.loadChannelInfo();
				});
			//SOCKET END//

			UserdataService.getUserData().then(
				response => {
					this.displayname = response.data.displayname;
				},
				error => {
					console.log(error);
				}
			);
		},
        methods: {
			Ok_Toastify: function(message:string): void {
				toast.success(message);
			},
		    NotOk_Toastify: function(message:string): void {
			    toast.error(message);
            },
			changeMode(mode: string): void {
				this.mode = mode;
			},
			async loadChannelsList() {
				return new Promise((resolve, reject) => {
					axios.get(this.URL + '/channels/channels/' + this.filter, {headers: authHeader()}).then((response) => {
						if (this.filter == 'direct')
						{
							axios.get(this.URL + '/channels/channels/direct', {headers: authHeader()}).then((response) => {
								this.directinfo.direct= response.data;
							})
						}
						this.channels = response.data;
						resolve(response.data);
						this.mode = 'normal';
					})
					.catch((error) => {
						this.NotOk_Toastify('Failed to load channels list');
						reject(error);
					});
				});
			},
			loadChannelInfo(): void {
				axios.get(this.URL + '/channels/channelinfo/' + this.channel.ID, {headers: authHeader()}).then((response) => {
					this.channelinfo.menbers = response.data;
					for (let i = 0; i < this.channelinfo.menbers.length; i++) {
						if (this.channelinfo.menbers[i].is_admin && this.channelinfo.menbers[i].ID == this.userID)
						{
							this.channel.admin = this.channelinfo.menbers[i].ID;
						}
					}
				})
				.catch(() => {
					console.log('Failed to load channel info');
				});
			},
			createChannel(): void {
				let channel_name = (document.getElementById('create_channel_input') as HTMLInputElement).value;
				if (channel_name && channel_name.length > 0) {
					axios.post(this.URL + '/channels/channels/', {channel_name: channel_name}, {headers: authHeader()}).then((response) => {
						this.channel = response.data;
						this.channel.name = channel_name;
						this.channel.type = 'public';
						this.loadChannelsList();
						this.loadChannelInfo();
						this.goChannel(response.data.ID);
						this.changeMode('normal');
					})
					.catch(() => {
						this.NotOk_Toastify('Failed to create channel');
					});
				}
			},
			setFilter(new_filter: string) {
				this.filter = new_filter;
				$('.channel_filter').removeClass('selected');
				$('#' + new_filter).addClass('selected');
				this.loadChannelsList();
			},
			setAdminFilter(new_filter: string) {
				$('.admin_filter').removeClass('selected');
				$('#' + new_filter).addClass('selected');
				if (new_filter == 'ban')
					this.banMenber();
				else if (new_filter == 'mute')
					this.muteMenber();
				else if (new_filter == 'kick')
					this.kickMenber();
			},
			checkIfChannelMemberExist(channel_dir: string): void {
				if (!channel_dir)
					return;
						axios.get(this.URL + '/channels/channelinfo/' + this.$store.state.user.channelID, {headers: authHeader()}).then((response) => {
						this.channelinfo.menbers = response.data;
						for (let i = 0; i < this.channelinfo.menbers.length; i++) {
							if (this.channelinfo.menbers[i].is_admin && this.channelinfo.menbers[i].ID == this.userID)
							{
								this.channel.admin = this.channelinfo.menbers[i].ID;
							}
						}
					})
					if (this.channel.ID == 0)
					console.log('channelcheckID vaux 0');
					
					for (let i = 0; i < this.channelinfo.menbers.length; i++) {
						if (this.channelinfo.menbers[i].ID == this.userID)
						{
							this.$store.state.user.ismember = true;
						}
						else
							this.$store.state.user.ismember = false;
					}
			},
			checkIfChannelMemberIsBAnned(channel_dir: string): void {
				if (!channel_dir)
					return;
				axios.get(this.URL + '/channels/channelinfo/' + this.$store.state.user.channelID, {headers: authHeader()}).then((response) => {
						this.channelinfo.menbers = response.data;
						for (let i = 0; i < this.channelinfo.menbers.length; i++) {
							if (this.channelinfo.menbers[i].is_banned && this.channelinfo.menbers[i].ID == this.userID)
							{
								this.Ok_Toastify('You are banned from this channel');
								this.isbanned = true;
							}
							else
								this.isbanned = false;
						}
			})
			
			},
			goToChannel() : void {
				
				let channel_dir = (document.getElementById('goto_channel_input') as HTMLInputElement).value;
				if (this.filter == 'direct')
				{
					this.Ok_Toastify('starting chat with : ' + channel_dir);
					this.direct(channel_dir);
					return;
				}
				
				axios.post(this.URL + '/channels/getidchannel/' + channel_dir + '/', {headers: authHeader()}).then((response) => {
						let chennel_id = response.data;
						this.channel.ID = chennel_id;
						this.$store.state.user.channelID = chennel_id;
			
					this.checkIfChannelMemberIsBAnned(channel_dir);
						if (this.isbanned == true)
						{
							return;
						}

					this.checkIfChannelMemberExist(channel_dir);
					if (this.$store.state.user.ismember == true)
					{
						this.Ok_Toastify('You are already a member of this channel : ' + channel_dir);
						this.goChannel(this.channel.ID);
					}
					else if (this.$store.state.user.ismember == false)
						{
					axios.post(this.URL + '/channels/getidchannel/' + channel_dir + '/', {headers: authHeader()}).then((response) => {
						let channel_id = response.data;
						for (let i = 0; i < this.channels.length; i++) {
							if (this.channels[i].ID == channel_id) {
								this.channel = this.channels[i];
								break;
							}
						}
						if (!this.channel.isProtected) {
							axios.post(this.URL + '/channels/addmenberinchannel/' + this.channel.ID + '/', {userID: this.userID}, {headers: authHeader()}).then((response) => {
								if (response.data == true)
									this.Ok_Toastify('Channel joined : ' + channel_dir);
								this.loadChannelsList();
								this.loadChannelInfo();
								this.loadMessages();
							})
							this.goChannel(channel_id);
						} 
						else {
							let password = prompt("Enter password");
							axios.post(this.URL + '/channels/getpassword/' + channel_id + '/', {password: password}, {headers: authHeader()}).then((response) => {
									if (response.data == true)
									{	
										axios.post(this.URL + '/channels/addmenberinchannel/' + this.channel.ID + '/', {userID: this.userID}, {headers: authHeader()}).then((response) => {
											if (response.data == true)
												this.Ok_Toastify('Channel joined : ' + channel_dir);
											this.loadChannelsList();
											this.loadChannelInfo();
											this.loadMessages();
										})
										this.goChannel(channel_id);
									}
									else
										this.NotOk_Toastify('Wrong password');
								})
							}
						})
					}
				})
			},	
			goChannel(channel_id: number): void {
				let i = 0;
				let idowner = 0;
				for (i = 0; i < this.channels.length; i++) {
					if (this.channels[i].ID == channel_id) {
						this.channel = this.channels[i];
						this.changeMode('normal');
						axios.get(this.URL + '/channels/getidowner/' + channel_id + '/' , {headers: authHeader()}).then((response) => {
							idowner = response.data;
							this.channel.IDowner = idowner;
							this.loadChannelInfo();
							this.loadMessages();
							this.loadChannelsList();
						})
						this.loadChannelInfo();
						this.loadMessages();
						this.loadChannelsList();
						break;
					}
				this.mode = 'normal';
				}
			},
			fromMe(message: MessageInterface) {
				return message.ID == this.userID;
			},
			getUserProfile(user_id: number) {
				return "/user/" + user_id;
			},
			loadMessages(): void {
				axios.get(this.URL + '/channels/allmessages/' + this.channel.name + '/', {headers: authHeader()}).then((response) => {
					for (let i = 0; i < response.data.length; i++) {
						this.channel.messages = response.data;
					}
				})
				.catch(() => {
					console.log('Failed to load messages');
				});
			},
			sendMessage(): void {
				let message = (document.getElementById('msg_input') as HTMLInputElement).value;

				if (this.filter == 'direct')
				{
					axios.post(this.URL + '/channels/sendmessagedirect/' + this.channel.name + '/',{ message: message}, {headers: authHeader()}).then((response) => {
						if (response.data == true)
							this.Ok_Toastify('Message sent');
						for (let i = 0; i < this.directinfo.direct.length; i++) {
							if (this.directinfo.direct[i].nom == this.channel.name) {
								this.loadMessagesDirect(this.directinfo.direct[i].IDchat);
								break;
							}
						}
						
						(document.getElementById('msg_input') as HTMLInputElement).value = '';
						})
						.catch(() => {
							this.NotOk_Toastify('Failed to send message/May be you have to join this channel first');
						});
					return;
				}
						axios.post(this.URL + '/channels/sendmessage/' + this.channel.name + '/',{ message: message}, {headers: authHeader()}).then((response) => {
							if (response.data == true)
								this.Ok_Toastify('Message sent');
							
							for (let i = 0; i < this.channelinfo.menbers.length; i++) {
								if (this.channelinfo.menbers[i].ID == this.userID)
								{
									if (this.channelinfo.menbers[i].is_muted == true)
									{
										this.NotOk_Toastify('You are unmuted');
										this.channelinfo.menbers[i].is_muted = false;
										break;
									}
									else if (this.channelinfo.menbers[i].is_banned == true)
									{
										this.NotOk_Toastify('You are unbanned');
										this.channelinfo.menbers[i].is_banned = false;
										break;
									}
									else {
										break;
									}
								}
							} 
						this.loadMessages();
						(document.getElementById('msg_input') as HTMLInputElement).value = '';
						})
						.catch(() => {
							this.NotOk_Toastify('Failed to send message maybe you are muted/banned');
						});
			},
			changeChannelType(): void {
				if (this.channel.type == 'public') {
					this.channel.type = 'private';
						let password = prompt("Enter new password for private channel");
							axios.post(this.URL + '/channels/newpassword/' + this.channel.ID + '/', {password: password}, {headers: authHeader()}).then((response) => {
							if (response.data == true)
								this.channel.password = password;
							this.setFilter('private');
							this.loadChannelsList();
							this.loadChannelInfo();
							this.loadMessages();
						})
				} else {
					this.Ok_Toastify('Channel is now public');
					this.removeChannelPassword();
					this.setFilter('public');
				}
			},
			getPassword(channel_id: number): string {
				let password = '';
				axios.get(this.URL + '/channels/getpassword/' + channel_id + '/', {headers: authHeader()}).then((response) => {
					password = response.data;
				})
				.catch(() => {
					this.NotOk_Toastify('Failed to get password');
				});
				return password;
			},
			changeChannelPassword(): void {
				let password = prompt("Enter new password");
				axios.post(this.URL + '/channels/changepassword/' + this.channel.ID + '/', {password: password}, {headers: authHeader()}).then((response) => {
					if (response.data == true)
						this.channel.password = password;
					this.loadChannelsList();
					this.loadChannelInfo();
					this.loadMessages();
				})
				.catch(() => {
					this.NotOk_Toastify('Failed to change channel password');
				});
			},
			removeChannelPassword(): void {
				axios.post(this.URL + '/channels/removepassword/' + this.channel.ID + '/',{owner: this.channel.IDowner } ,{headers: authHeader()}).then((response) => {
					if (response.data == true)
						this.channel.password = '';
					this.loadChannelsList();
					this.loadChannelInfo();
					this.loadMessages();
				})
				.catch(() => {
					this.NotOk_Toastify('Failed to remove channel password');
				});
			},
			promoteAdmin(): void {
				let adminname = (document.getElementById('addadmin_channel_input') as HTMLInputElement).value;
				if (adminname && adminname.length > 0) {
					this.loadChannelInfo();
					for (let i = 0; i < this.channelinfo.menbers.length; i++) {
						if (this.channelinfo.menbers[i].nom == adminname) {
							if (this.channelinfo.menbers[i].is_admin == false)
							{
								axios.post(this.URL + '/channels/promoteadmin/' + this.channel.ID + '/', {adminname: adminname}, {headers: authHeader()}).then((response) => {
									if (response.data == true)
										this.channel.admin = this.channelinfo.menbers[i].ID;
									this.loadChannelsList();
									this.loadChannelInfo();
									this.loadMessages();
									this.changeMode('normal');
								})
								.catch(() => {
									this.NotOk_Toastify('Failed to promote admin');
								});
							}
							else
							{
								axios.post(this.URL + '/channels/demoteadmin/' + this.channel.ID + '/', {adminname: adminname}, {headers: authHeader()}).then((response) => {
									if (response.data == true)
										this.channel.admin = this.channel.IDowner;
									this.loadChannelsList();
									this.loadChannelInfo();
									this.loadMessages();
									this.changeMode('normal');
								})
								.catch(() => {
									this.NotOk_Toastify('Failed to promote admin');
								});
							}
							break;
						}
					}
				}
			},
			banMenber(): void {
				let banname = prompt("Enter name of menber to ban/deban");
				if (banname && banname.length > 0) {
					this.loadChannelInfo();
					for (let i = 0; i < this.channelinfo.menbers.length; i++) {
						if (this.channelinfo.menbers[i].nom == banname) {
							if (this.channelinfo.menbers[i].is_banned == false)
							{
								axios.post(this.URL + '/channels/banmenber/' + this.channel.ID + '/', {banname: banname}, {headers: authHeader()}).then((response) => {
									if (response.data == true)
										this.Ok_Toastify('Menber banned : ' + banname);
									this.loadChannelsList();
									this.loadChannelInfo();
									this.loadMessages();
									this.changeMode('normal');
								})
								.catch(() => {
									this.NotOk_Toastify('Failed to ban menber');
								});
							}
							else
							{
								axios.post(this.URL + '/channels/unbanmenber/' + this.channel.ID + '/', {banname: banname}, {headers: authHeader()}).then((response) => {
									if (response.data == true)
										this.Ok_Toastify('Menber unbanned : ' + banname);
									this.loadChannelsList();
									this.loadChannelInfo();
									this.loadMessages();
									this.changeMode('normal');
								})
								.catch(() => {
									this.NotOk_Toastify('Failed to unban menber');
								});
							}
							break;
						}
					}
				}
			},
			muteMenber(): void {
				let mutename = prompt("Enter name of menber to mute/unmute");
				if (mutename && mutename.length > 0) {
					this.loadChannelInfo();
					for (let i = 0; i < this.channelinfo.menbers.length; i++) {
						if (this.channelinfo.menbers[i].nom == mutename) {
							if (this.channelinfo.menbers[i].is_muted == false)
							{
								axios.post(this.URL + '/channels/mutemenber/' + this.channel.ID + '/', {mutename: mutename}, {headers: authHeader()}).then((response) => {
								if (response.data == true)
									this.Ok_Toastify('Menber muted : ' + mutename);
								this.loadChannelsList();
								this.loadChannelInfo();
								this.loadMessages();
								this.changeMode('normal');
								})
								.catch(() => {
									this.NotOk_Toastify('Failed to mute menber');
								});	
							}
							else
							{
								axios.post(this.URL + '/channels/unmutemenber/' + this.channel.ID + '/', {mutename: mutename}, {headers: authHeader()}).then((response) => {
								if (response.data == true)
									this.Ok_Toastify('Menber unmuted : ' + mutename);
								this.loadChannelsList();
								this.loadChannelInfo();
								this.loadMessages();
								this.changeMode('normal');
								})
								.catch(() => {
									this.NotOk_Toastify('Failed to unmute menber');
								});
							}
							break;
						}
					}
				}
			},
			kickMenber(): void {
				let kickname = prompt("Enter name of menber to kick");
				if (kickname && kickname.length > 0) {
					axios.post(this.URL + '/channels/kickmember/' + this.channel.ID + '/', {kickname: kickname}, {headers: authHeader()}).then((response) => {
						if (response.data == true)
							this.Ok_Toastify('Menber kicked : ' + kickname);
						this.loadChannelsList();
						this.loadChannelInfo();
						this.loadMessages();
						this.changeMode('normal');
					})
					.catch(() => {
						this.NotOk_Toastify('Failed to kick menber...maybe admin or owner');
					});
				}
			},
			leaveChannel(): void {
				const user_id = this.$store.state.user.ID;

				axios.post(this.URL + '/channels/leavechannel/' + this.channel.ID + '/',  {user_id: user_id} , {headers: authHeader()}).then((response) => {
					if (response.data == true)
					{
						this.setFilter('public');
						this.loadChannelsList();
						this.loadChannelInfo();
					}
					this.changeMode('normal');
					this.channel.ID = 0;
					this.channel.name = '';
					this.channel.type = 'public';
					this.channel.messages = new Array<MessageInterface>();
					this.channel.isProtected = false;
					this.channel.IDowner = 0;
					this.channel.nameowner = '';
					this.channel.password = '';
					this.channel.admin = 0;
					$('#goto_channel_input').val('');
					$('#create_channel_input').val('');
					$('#addadmin_channel_input').val('');
					$('#msg_input').val('');
					this.loadChannelsList();
				})
				.catch(() => {
					console.log('Failed to leave channel');
				});
			},
			block(name: string): void {
				axios.post(this.URL + '/channels/block/' + name + '/',{ userID: this.userID }, {headers: authHeader()}).then((response) => {
					if (response.data == true)
						this.Ok_Toastify('User blocked : ' + name);
					this.Ok_Toastify('User blocked : ' + name);
					this.loadChannelsList();
					this.loadChannelInfo();
					this.loadMessages();
					this.changeMode('normal');
				})
				.catch(() => {
					this.NotOk_Toastify('Failed to block user');
				});
			},
			unblock(): void {
				let name = prompt("Enter name of user to unblock");
				axios.post(this.URL + '/channels/unblock/' + name + '/',{ userID: this.userID }, {headers: authHeader()}).then((response) => {
					if (response.data == true)
						this.Ok_Toastify('User unblocked : ' + name);
					this.Ok_Toastify('User unblocked : ' + name);
					this.loadChannelsList();
					this.loadChannelInfo();
					this.loadMessages();
					this.changeMode('normal');
				})
				.catch(() => {
					this.NotOk_Toastify('Failed to unblock user');
				});
			},
			direct(name: string): void {
				let message = prompt("Enter message for direct conversation");
				this.Ok_Toastify('Direct conversation started with : ' + name);

				axios.post(this.URL + '/channels/direct/' + name + '/', {message: message}, {headers: authHeader()}).then((response) => {
					if (response.data == true)
						this.Ok_Toastify('Direct conversation started with : ' + name);
					this.setFilter('direct');
					this.loadChannelsList();
						for (let i = 0; i < this.directinfo.direct.length; i++) {
							if (this.directinfo.direct[i].nom == name) {
								this.channel.type = 'direct';
								this.setFilter('direct');
								this.channel.name = name;
								this.loadMessagesDirect(this.directinfo.direct[i].IDchat);
								this.channel.ID = 0;
								break;
							}
						}
						this.changeMode('normal');
					})
					.catch(() => {
						this.NotOk_Toastify('Failed to start direct conversation');
						});
			},
			loadMessagesDirect(idchat: number): void {
				axios.get(this.URL + '/channels/alldirectmessages/' + idchat + '/', {headers: authHeader()}).then((response) => {
					for (let i = 0; i < response.data.length; i++) {
						this.channel.messages = response.data;
					}
				})
				.catch(() => {
					console.log('Failed to load messages');
				});
			},
			invitation(): void {
				window.focus();

				let name = prompt("Enter name of user to invite");
				window.focus();
				if (name == '' || name == null)
				{
					this.NotOk_Toastify('Plz enter a name');
					return;
				}
				this.setFilter('direct');
				this.direct(name);
			},
			match(nomadversaire :number): void {
				this.checkOnChat(nomadversaire);
				if (this.isOnChat == false)
				{
					this.NotOk_Toastify('Opponent is not on chat or blocked you ! try again one more time');
					return;
				} else {
				if (window.confirm("Do you want to launch private game(no options) ?")) {
					axios.post(this.URL + '/game/challenge/' + nomadversaire + '/', { userId: this.$store.state.user.ID }, {headers: authHeader()}).then((response) => {
						let newRoomId = response.data;
					let oppId = nomadversaire;
					this.$store.state.roomId = 0;
					this.$store.state.challenger = true;
					this.socketGame.emit('challenge', {roomId: newRoomId, userId: this.$store.state.user.ID, oppId: oppId});
					this.socketGame.emit('waitInPrivateQueue',{roomId: newRoomId, userId: this.$store.state.user.ID, oppId: oppId});
					this.$store.state.ischatconnected = false;
					router.push('/gamesalonprivate');
					}).catch(() => {
						this.NotOk_Toastify('Failed to challenge..maybe opponent is not online');
					});
				}
			}
			},
			checkMatchLive(): void {
				this.socketGame.emit('checkMatchLive');
			},
			goMatchLive(): void {
				router.push('matchlive');
			},
			checkOnChat(id: number): void {
				this.socket.emit('checkOnChat', id);
			},
		},
		beforeRouteLeave(to, from, next) {
		this.socket.disconnect();
		// this.socketGame.disconnect();
		next();
	}
});
</script>
```
<template>
    <div class="chat">
        <p class="text1">CHAT : {{ displayname }}</p>
		<div class="chat_container">
            <div class="chat_mode" v-if="mode == 'create_channel' || mode == 'go_to_channel' || mode == 'channel_list' || mode == 'add_admin'" v-on:click="changeMode('normal')"></div>
            
			<div class="chat_list" :class="{active: mode == 'channel_list'}">
				<div class="channels_filter_container">
					<div class="channel_filter selected" id="public" @click="setFilter('public')">
						Public
					</div>
					<div class="channel_filter" id="private" @click="setFilter('private')">
						Private
					</div>
					<div class="channel_filter" id="direct" @click="setFilter('direct')">
						Direct
					</div>
				</div>
				<div class="list">
					<div v-for="(chan, index) in channels" v-bind:key="chan.ID" class="chat_item" v-bind:data-id="index">
						<div class="flex">
							<p class="title">{{ chan.name }}{{ chan.nom }}</p>
							<div v-if="chan.isProtected">
								<p class="plus">(Password)</p>
							</div>
						</div>
					</div>
				</div>
				<div class="button_choice" style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; padding: 1rem; box-sizing: border-box;">
					<div id="join_channel_button" v-on:click="changeMode('go_to_channel')">
					<span>Join</span>
					</div>
					<div v-if="filter == 'public'" id="create_channel_button" v-on:click="changeMode('create_channel')">
					<span>Add</span>
					</div>
				</div>
				<div>
  					<button class="bn533" @click="checkMatchLive()">Any Match Alive?</button>
					<button v-if="isMatchLive == true" class="bn53" @click="goMatchLive()">Watch Live</button>
					<button v-if="isMatchLive == false" class="bn54">No Match Alive</button>
				</div>
			</div>

			<div class="chat_view">
				<div class="chat_view_header">
					<p id="chat_title">
						{{ channel.name }}
						<Userstatus v-if="channel.canDirectTalk" :status="channel.members[1].status" :friendId="channel.members[1].id" :userId="userId"/>
					</p>
					</div>
					<div class="view">
						<div v-for="message in channel.messages" :key="message" class="message" :class="{ me: fromMe(message)}">
							<router-link class="username" :to="getUserProfile(message.ID)">{{ message.nom }}</router-link>
							<!-- <p  v-if="message.ID != userID" id="play_button" class="fas fa-table-tennis" v-on:click="match(message.ID)"></p> -->
							<p  v-if="message.ID != userID" id="play_button" class="fas fa-table-tennis" v-on:click="match(message.ID)"></p>
							<button v-if="message.ID != userID" class="unfriend_button" v-on:click="block(message.nom)" >Block</button>
							<button v-if="message.ID != userID && filter != 'direct'" class="direct_button" v-on:click="direct(message.nom)" >Direct</button>
							<p class="content">{{ message.message }}</p>
						</div>
					</div>
					<div class="message_bar" v-if="channel.ID != 0 || filter == 'direct'">
						<input id="msg_input" type="text" v-bind:placeholder="placeholder" v-on:keyup.enter="sendMessage()"/>
						<button id="send_button" v-on:click="sendMessage()">Envoyer</button>
					</div>
				</div>
				
				<div class="popup" v-if="mode == 'create_channel'">
					<input type="text" placeholder="Channel's name" id="create_channel_input" v-on:keyup.enter="createChannel"/>
					<button id="create_channel" @click="createChannel()">Add</button>
				</div>
				<div class="popup" v-if="mode == 'go_to_channel'">
					<input type="text" placeholder="Channel choice" id="goto_channel_input" v-on:keyup.enter="goToChannel"/>
					<button id="go_to_channel" @click="goToChannel()">Go</button>
			</div>
			<div class="popup" v-if="mode == 'add_admin'">
				<input type="text" placeholder="Name Admin" id="addadmin_channel_input" v-on:keyup.enter="promoteAdmin"/>
				<button id="go_to_channel" @click="promoteAdmin()">Go</button>
			</div>
			
			<div class="channel_info_container" v-if="channel.ID != 0">
				
				<div class="function_filter_container">
					<section>
						<div v-if="channel.IDowner == userID"  class="function_filter selected">
							Owner
						</div>
						<div v-else class="function_filter">
							Owner
						</div>
					</section>
					<section>	
						<div v-if="channel.admin == userID" class="function_filter selected">
							Admin
						</div>
						<div v-else class="function_filter">
							Admin
						</div>
					</section>	
					<section>
						<div class="function_filter selected">
							Member
						</div>
					</section>
				</div>
				
				<p style="margin-left: 100px;margin-right: auto;font-weight: bold;text-decoration: underline;">Info Channel</p>
				
					<section v-if="channel.IDowner == userID">
						<p class="title" style="margin-left: 100px;" v-if="!channel.isProtected">Type : Public</p>
						<p class="title" style="margin-left: 100px;" v-if="channel.isProtected && channel.type =='private'">Type  : Private</p>
						<div class="content">
							<div class="switch_container">
								<p class="chat_info_button" v-on:click="changeChannelType()">Change Type</p>
								<p class="chat_info_button2" v-on:click="changeChannelPassword()">Chg/Add Pswd</p>
								<p class="chat_info_button3" v-on:click="removeChannelPassword()">Remov Pswd</p>
							</div>
						</div>
					</section>
				
				
				
				<p class="title" style="font-weight: bold;height: 5px;">Total Members : {{  channelinfo.menbers.length }}</p>
					
					<button class="unfriend_button2" v-on:click="unblock()" >UnBlock</button>
					<button class="unfriend_button3" v-on:click="invitation()" >Direct</button>
				
				<div v-for="member in channelinfo.menbers" :key="member" class="chat_item" style="height: 30px;">
					<div class="flex">
						<p class="title">{{ member.nom }}</p>
						<div v-if="member.is_muted">
							<p class="plush">(muted)</p>
						</div>
						<div v-if="member.is_banned">
							<p class="plush">(banned)</p>
						</div>
						<div v-if="member.is_owner">
							<p class="plusher">(owner)</p>
						</div>
					</div>
				</div>

				<p class="title" style="font-weight: bold;height: 5px;margin-left: 180px;">List of Admins</p>
				<div v-for="member in channelinfo.menbers" :key="member" class="chat_item" style="height: 30px;margin-left: 130px;">
					<div class="flex">
						<div v-if="member.is_owner || member.is_admin">
							<p class="title">{{ member.nom }}</p>
						</div>
					</div>
				</div>
				<section v-if="channel.IDowner == userID">
					<p class="chat_info_button4" v-on:click="changeMode('add_admin')">Add/Kick Admin</p>
				</section>
				
				<section v-if="channel.admin == userID || channel.IDowner == userID">
					<div class="admin_filter_container">
						<div class="admin_filter selected" id="public" @click="setAdminFilter('ban')">
							Ban On/off
						</div>
						<div class="admin_filter" id="private" @click="setAdminFilter('mute')">
							Mute On/off
						</div>
						<div class="admin_filter" id="direct" @click="setAdminFilter('kick')">
							Kick Menber
						</div>
					</div>
				</section>

				<section>
					<p class="chat_info_button5" v-on:click="leaveChannel()">Leave Channel</p>
				</section>
			</div>
		
		</div>
	</div>
</template>

<style scoped>
.unfriend_button {
	background-color: #c40707;
	color: white;
	cursor: pointer;
	border: solid 1px transparent;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 25%);
	transition: all 0.25s;
	margin-left: 5px;
}
.unfriend_button2 {
	background-color: darkred;
	color: white;
	cursor: pointer;
	border: solid 1px transparent;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 25%);
	transition: all 0.25s;
	margin-left: 5px;
}
.unfriend_button3 {
	background-color: green;
	color: white;
	cursor: pointer;
	border: solid 1px transparent;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 25%);
	transition: all 0.25s;
	margin-left: 5px;
}
.direct_button {
	background-color: green;
	color: white;
	cursor: pointer;
	border: solid 1px transparent;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 25%);
	transition: all 0.25s;
	margin-left: 5px;
}
.channel_info_container	{
	position: absolute;
	overflow-y: auto;
	width: 20rem;
	max-width: 80%;
	height: 100%;
	padding: 1rem;
	z-index: 999;
	background-color: #b16b2a;
	margin-left: 1115px;
	color: black;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	
}
.chat {
	display: block;
	position: relative;
	margin-top: 30px;
	overflow-y: auto;
}
.chat_container	{
	display: flex;
	flex-direction: row;
	justify-content: center;
	width: 70%;
	margin: 0 auto;
	position: relative;
}
.chat_container .chat_mode {
	position: absolute;
	top: 100;
	left: 100;
	width: 100%;
	height: 100%;
	background: rgba(89, 89, 73, 0.37);
	z-index: 9;
}
.text1 {
    text-align: center;
    width: 100%;
    margin: 0 auto;
    color: whitesmoke;
    font-size:3.5em;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 0.5em;
    background: black;
    position: relative; 
} 
.popup    {
	position: absolute;
	top: 0%;
	left: 50%;
	transform: translateX(-50%);
	width: fit-content;
	display: flex;
	z-index: 999;
}
.popup input 	{
	display: block;
	padding: 0.5rem 1rem;
	border: none;
	outline: none;
}
.popup input::placeholder	{
	color: #b3b3b3;
}
.popup button	{
	position: relative;
	appearance: none;
	width: 5rem;
	border: none;
	color: white;
	background:#0b1933;
	outline: none;
	cursor: pointer;
}
.popup button i	{
	position: relative;
	font-size: 1.25rem;
	color: #0b1933;
}
.channels_filter_container	{
	margin: 1rem 0;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
.function_filter_container	{
	margin: 1rem 0;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
.admin_filter_container	{
	margin: 1rem 0;
	display: flex;
	justify-content: center;
}
.channel_filter	{
	padding: 0.25rem 1rem;
	border: solid 1px #0b1933;
	cursor: pointer;
}
.channel_filter.selected{
	background: #0b1933;
	color: white;
}
.function_filter	{
	padding: 0.25rem 1rem;
	border: solid 1px orangered;
}
.function_filter.selected{
	background: orange;
	color: white;
}
.admin_filter	{
	padding: 0.25rem 1rem;
	border: solid 1px orangered;
	cursor: pointer;
}
.admin_filter:hover	{
	background: red;
	color: white;
	cursor: pointer;
}
.admin_filter.selected{
	background: red;
	color: white;
}
.chat_list	{
	display: flex;
	position: relative;
	flex-direction: column;
	min-height: 80vh;
	min-width: 300px;
	max-height: 80vh;
	background-color: #b16b2a;
	color: black;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	z-index: 1;
	margin-left: -40%;
}
.chat_list .list {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
}
.chat_list .chat_item {
	position: relative;
	padding: 1rem;
	font-weight: bold;
}

.chat_list .chat_item.selected	{
	background: rgb(235, 235, 235);
	color: black;
}

.chat_list .chat_item .title	{
	font-size: 1rem;
	margin: 0.25rem;
	font-weight: bold;
}
.chat_list .chat_item .plus	{
	margin: 0.25rem;
	color: rgb(190 190 190);
	font-size: 0.9rem;
	letter-spacing: 0.5px;
}
.plush	{
	margin: 0.rem;
	color: rgb(190 190 190);
	font-size: 0.9rem;
}
.plusher	{
	margin: 0.rem;
	color: red;
	font-size: 0.9rem;
}
.chat_list #create_channel_button	{
	display: flex;
	align-items: center;
	justify-content: center;
	bottom: 2rem;
	right: 1rem;
	width: 2rem;
	height: 2rem;
	border-radius: 100%;
	background-color: #0b1933;
	cursor: pointer;
}
.chat_list #create_channel_button span	{
	font-size: 1rem;
	color: white;
}
.chat_list #join_channel_button	{
	display: flex;
	align-items: center;
	justify-content: center;
	bottom: 2rem;
	right: 1rem;
	width: 2rem;
	height: 2rem;
	border-radius: 100%;
	background-color: green;
	cursor: pointer;
}
.chat_list #join_channel_button span	{
	font-size: 1rem;
	color: white;
}
.chat_view 	{
	position: relative;
	color: white;
	background-color: #efefef;
	width: 70%;
	max-height: 80vh;
	overflow-y: auto;
}
.chat_view > div	{
	display: flex;
	flex-direction: column;
}
.chat_view .chat_view_header	{
	display: flex;
	font-size: 1.25rem;
	text-align: center;
	background-color: white;
	border-bottom: solid 1px rgba(0, 0, 0, 0.15);
	padding: 0 1rem;
}
.chat_view #chat_title	{
	width: calc(100% - 2rem);
	color: black;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
.chat_info_button	{
	border: solid 1px black;
	font-size: 1rem;
	color: white;
	transition: all 0.25s;
	margin-left: auto;
	margin-right: auto;
	margin-top: 0px;
	background-color: #0b1933;
	width: 90px;
}
.chat_info_button2	{
	border: solid 1px black;
	font-size: 1rem;
	color: white;
	transition: all 0.25s;
	margin-left: auto;
	margin-right: auto;
	margin-top: 0px;
	background-color: green;
	width: 90px;
}
.chat_info_button3	{
	border: solid 1px black;
	font-size: 1rem;
	color: white;
	transition: all 0.25s;
	margin-left: auto;
	margin-right: auto;
	margin-top: 0px;
	background-color: red;
	width: 90px;
}
.chat_info_button4	{
	border: solid 1px black;
	font-size: 1rem;
	color: white;
	transition: all 0.25s;
	margin-left: auto;
	margin-right: auto;
	background-color: #0b1933;
	width: 90px;
	max-inline-size: max-content;
}
.chat_info_button5	{
	border: solid 1px black;
	font-size: 1rem;
	color: white;
	transition: all 0.25s;
	margin-left: auto;
	margin-right: auto;
	background-color: #0b1933;
	width: 90px;
	max-inline-size: max-content;
}
.chat_info_button:hover	{
	background-color: #0b1933;
	color: white;
	border-color: white;
	cursor: pointer;
}
.chat_info_button2:hover	{
	background-color: #0b1933;
	color: white;
	border-color: white;
	cursor: pointer;
}
.chat_info_button3:hover	{
	background-color: #0b1933;
	color: white;
	border-color: white;
	cursor: pointer;
}
.chat_info_button4:hover	{
	background-color: #0b1933;
	color: white;
	border-color: white;
	cursor: pointer;
}
.chat_info_button5:hover	{
	background-color: #0b1933;
	color: white;
	border-color: white;
	cursor: pointer;
}
.chat_view .view	{
	display: flex;
	flex-direction: column;
	padding: 0 1rem;
	/* overflow-y: auto; */
}
.chat_view .message	{
	padding: 0.5rem 1rem;
	margin: 0.2rem 0;
	background-color: darkorange;
	color: white;
	border-top-right-radius: 1rem;
	border-bottom-right-radius: 1rem;
	border-top-left-radius: 1rem;
	margin-inline-end: auto;
}
.chat_view #msg_input	{
	display: block;
	width: 80%;
	margin-left: auto;
	border: solid 1px rgb(122, 122, 122);
	border-top-left-radius: 1rem;
	border-bottom-left-radius: 1rem;
	border-right: none;
	font-size: 1rem;
	outline: none;
	padding: 0.5rem 1.25rem;
}
.chat_view #send_button	{
	margin-right: auto;
	margin-left: auto;
	font-size: 1rem;
	padding: 0.25rem 1rem;
	border: solid 1px rgb(122, 122, 122);
	cursor: pointer;
	border-radius: 1rem;
	border-radius: 1rem;
	transition: all 0.125s;
}
.chat_view #send_button:hover	{
	background: #39ea88;
	color: white;
}
.chat_view #play_button	{
	font-size: 1.5rem;
	margin: 0rem 1rem;
	margin-right: auto;
	cursor: pointer;
	color: black;
	height: fit-content;
	align-self: center;
}
.chat_view .message .username {
	color: black;
	padding-bottom: 0.25rem;
}
.chat_view .message.me	{
	margin-left: auto;
	border-top-left-radius: 1rem;
	border-bottom-left-radius: 1rem;
	border-bottom-right-radius: 0;
	background-color: #35c85b;
}
.chat_view .message p	{
	margin: 0;
	font-size: 1rem;
	font-weight: bold;
}
.chat_view .message .plusplus {
	margin: 0.20rem;
	color: #0b1933;
	font-size: 0.7rem;
	letter-spacing: 0.5px;
}
.chat_view .message_bar	{
	display: flex;
	margin-top: auto;
}
.chat_view #msg_input	{
	display: flex;
	margin-right: auto;
	width: 50%;
	margin-left: auto;
	border: solid 1px rgb(122, 122, 122);
	border-radius: 1rem;
	font-size: 1rem;
	outline: none;
	padding: 0.5rem 1.25rem;
}
.chat_view #play_button	{
	font-size: 1.5rem;
	margin: 0rem 1rem;
	margin-right: auto;
	cursor: pointer;
	color: black;
	opacity: 80%;
}
.bn53 {
	display:flex;
	align-items:center;
	justify-content:center;
	text-align: center;
	background-color: green;
	padding: 7px;
	width: 100px;
	font-family: Verdana, Geneva, Tahoma, sans-serif;
	animation: bn53bounce 4s infinite;
	margin-left: 100px;
	cursor: pointer;
}
.bn54 {
	display:flex;
	align-items:center;
	justify-content:center;
	text-align: center;
	background-color: #b81515;
	padding: 7px;
	width: 100px;
	font-family: Verdana, Geneva, Tahoma, sans-serif;
	animation: bn53bounce 4s infinite;
	margin-left: 100px;
}
.bn533 {
	display:flex;
	align-items:center;
	justify-content:center;
	text-align: center;
	background-color: #e7e407;
	padding: 7px;
	width: 100px;
	font-family: Verdana, Geneva, Tahoma, sans-serif;
	cursor: pointer;
	margin-left: 100px;
}

@keyframes bn53bounce {
	5%,
	50% {
		transform: scale(1);
	}

	10% {
		transform: scale(1);
	}

	15% {
		transform: scale(1);
	}

	20% {
		transform: scale(1) rotate(-5deg);
	}

	25% {
		transform: scale(1) rotate(5deg);
	}

	30% {
		transform: scale(1) rotate(-3deg);
	}

	35% {
		transform: scale(1) rotate(2deg);
	}

	40% {
		transform: scale(1) rotate(0);
  }
}

</style>