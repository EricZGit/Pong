<script lang="ts">

import { LeaderboardUser } from '@/types/user.interface';
import { defineComponent } from 'vue';
import UserdataService from '../services/userdata.service';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import userdataService from '../services/userdata.service';
import { io, Socket } from 'socket.io-client';
import router from '@/router/index';

interface FriendListData
{
    leaderboardFriends: LeaderboardUser[];
    avatars: string[];
	socket: Socket;
	URL: string;
	socketURL: string;
	countMatchsLive: number;
	isMatchLive: boolean;
}

export default defineComponent({
    name: 'FriendList',
    components: {
    },    
    data(): FriendListData {
        return {
            leaderboardFriends: [],
            avatars: [],
			socket: io() as Socket,
			URL: "http://" + window.location.hostname + ":3000/Status" as string,
			socketURL: "http://" + window.location.hostname + ":3000/Status" as string,
			countMatchsLive: 0,
			isMatchLive: false,
        }
    },
	created(): void {
		this.socket = io(this.socketURL, {});

		this.socket.on('matchLive', (count) => {
			if (count > 0)
				this.isMatchLive = true;
			else
				this.isMatchLive = false;
			this.countMatchsLive = count;
		});

		this.socket.on('checkMatchLive', (count) => {
			if (count > 0)
				this.isMatchLive = true;
			else
				this.isMatchLive = false;
			this.countMatchsLive = count;
		});

		this.socket.on('statusChange', (status, data) => {
			if (status === 'online') {
				for (let i = 0; i < this.leaderboardFriends.length; i++) {
					if (this.leaderboardFriends[i].ID == data) {
						this.leaderboardFriends[i].status = 'online';
						break;
					}
				}
			} else if (status === 'offline') {
				for (let i = 0; i < this.leaderboardFriends.length; i++) {
					if (this.leaderboardFriends[i].ID == data) {
						this.leaderboardFriends[i].status = 'offline';
						break;
					}
				}
			} else if (status === 'in-game') {
				for (let i = 0; i < this.leaderboardFriends.length; i++) {
					if (this.leaderboardFriends[i].ID == data) {
						this.leaderboardFriends[i].status = 'in-game';
						break;
					}
				}
			} else if (status === 'in-queue') {
				for (let i = 0; i < this.leaderboardFriends.length; i++) {
					if (this.leaderboardFriends[i].ID == data) {
						this.leaderboardFriends[i].status = 'in-queue';
						break;
					}
				}
			} else if (status === 'spectating') {
				for (let i = 0; i < this.leaderboardFriends.length; i++) {
					if (this.leaderboardFriends[i].ID == data) {
						this.leaderboardFriends[i].status = 'spectating';
						break;
					}
				}
			}
		});
	},
	mounted(): void {
		UserdataService.getLeaderboardFriends().then(
		response => {
			this.leaderboardFriends = response.data;
			for (let i = 0; i < this.leaderboardFriends.length; i++) {
				UserdataService.getUsersAvatar(this.leaderboardFriends[i].pathto).then(
					response => {
						const urlCreator = window.URL || window.webkitURL;
						this.avatars.push(urlCreator.createObjectURL(response.data));
					},
					() => {
						console.log('Failed to retrieve user avatar')})
			}
		},
		() => {
			console.log('Failed to retrieve leaderboard friends')})
	},
    methods: {
		Ok_Toastify: function(message:string): void {
            toast.success(message);
        },
        NotOk_Toastify: function(message:string): void {
            toast.error(message);
		},
		unfriend: function(friendId: number) {
			UserdataService.unfriend(friendId).then(
				response => {
					if (!response)
						return;
					this.leaderboardFriends = this.leaderboardFriends.filter((user) => user.ID !== friendId);
					this.avatars = this.avatars.filter((avatar) => avatar !== this.avatars[this.leaderboardFriends.length]);
				},
				() => {
					console.log('Failed to unfriend')
				})
		},
		AddNewFriend: function() : void {
            let friendName: FormData = new FormData(document.getElementById("FriendForm") as HTMLFormElement);
                UserdataService.addFriend(friendName.get('NewFriend')).then(
                    response => {
						if (!response)
							return;
                        this.Ok_Toastify('Friend added : ' + friendName.get('NewFriend'));
						userdataService.getLeaderboardFriends().then(
							response => {
								this.leaderboardFriends = response.data;
								for (let i = 0; i < this.leaderboardFriends.length; i++) {
									UserdataService.getUsersAvatar(this.leaderboardFriends[i].pathto).then(
										response => {
											const urlCreator = window.URL || window.webkitURL;
											this.avatars.push(urlCreator.createObjectURL(response.data));
										},
										() => {
											console.log('Failed to retrieve user avatar')})
								}
							},
							() => {
								console.log('Failed to retrieve leaderboard friends')})
					},
					error => {
						this.NotOk_Toastify(error.response.data.message);
					}
				)
		},
		checkMatchLive(): void {
			this.socket.emit('checkMatchLive');
		},
		goMatchLive(): void {
			router.push('matchlive');
		},
		getUserProfile(user_id: number) {
				return "/user/" + user_id;
		},
						
	},
	// beforeRouteLeave(to, from, next) {
	// 	this.socket.disconnect();
	// 	next();
	// }
});	
</script>

<template>
	<form id="FriendForm" style="display: flex;margin-top: -200px;">
		<input name="NewFriend" placeholder="Enter name here">
		<button type="button" class="accept_button2" v-on:click="AddNewFriend()"><i class="fas fa-check" style="margin-left: 3px;">Add</i></button>
	</form>

	<div id="leaderboard">
		<div>
			<button class="bn533" @click="checkMatchLive()">Any Match Alive?</button>
			<button v-if="isMatchLive == true" class="bn53" @click="goMatchLive()">Watch Live</button>
			<button v-if="isMatchLive == false" class="bn54">No Match Alive</button>
		</div>
		<div class="leaderboardUsers">
			<div class="leaderboard_header">
				<div class="userInfo">
					<div class="rank">
						Rank
					</div>
					<div class="profile" style="margin-left: -35px;">
						Avatar
					</div>
					<div class="username">
						Name
					</div>
				</div>
				<div class="stat">
					<div class="score">
						Status
					</div>
					<div class="loses">
						Kick
					</div>
				</div>
			</div>
			<div class="contourcadre" v-if="$store.state.status.loggedIn === true">
				<div class="leaderboard_item" div v-for="(leaderboarduser, index) in leaderboardFriends" :key="leaderboarduser.nom">
					<div class="userInfo"> 
						<div class="rank">
							<p class="rankNumber"> {{ leaderboardFriends[index].rank }} </p>
						</div>
						<div class="image">
							<img :src="avatars[index]" alt="avatar" width="40" height="40">
						</div>
						<p class="username">
						<router-link :to="getUserProfile( leaderboardFriends[index].ID )"> {{ leaderboardFriends[index].nom }} </router-link>
						</p>
					</div>
					<div class="stat">
						<div class="score">
							{{ leaderboardFriends[index].status }}
						</div>
						<div class="loses">
							<button class="unfriend_button" v-on:click="unfriend(leaderboarduser.ID)" >Kick</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
    
input[name="NewFriend"] {
    width: 150px;
    margin-left: auto;
    display: flex;
}
.accept_button2 {
	background-color: green;
	color: white;
	border: solid 1px green;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	transition: all 0.25s;
    display: flex;
    margin-right: auto;
}

#leaderboard {
	margin: 0 auto;
}
.username {
	width: 30px;
}
.contourcadre {
	border: solid;
	border-color: black;
}
.leaderboardUsers {
	width: 80%;
	height: auto;
	display: flex;
	margin-left: auto;
	flex-direction: column;
	/* overflow-y: auto; */
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.leaderboard_header {
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	height: 4rem;
	background: #b16b2a;
	color: white;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.leaderboard_header .rank {
	font-weight: bold;
	color: white;
}
.leaderboard_header .profile {
	font-weight: bold;
}
.leaderboard_header .username {
	font-weight: bold;
}
.leaderboard_header .score {
	font-weight: bold;
	width: 33%;
	text-align: center;
}
.leaderboard_header .wins {
	font-weight: bold;
	width: 33%;
	text-align: center;
}
.leaderboard_header .loses {
	font-weight: bold;
	width: 33%;
	text-align: center;
}
.leaderboard_item {
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	height: 3rem;
	color: whitesmoke;
}
.userInfo {
	width: 40%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 5rem;
}
.stat {
	display: flex;
	justify-content: space-around;
	flex-wrap: nowrap;
	align-items: center;
	width: 40%;
	height: 5rem;
	margin: 0.25rem 0;
}
.leaderboard_item .score {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 33%;
	height: 100%;
	padding: 0 1rem;
	font-size: 1.125rem;
	align-self: center;
}
.loses {
	text-align: center;
	width: 33%;
}
.leaderboard_item img {
	width: 3rem;
	height: 3rem;
	max-width: 4.5rem;
	max-height: 100%;
	border-radius: 100%;
	margin-left: -15px;
}
.unfriend_button {
	padding: 0.25rem 0.5rem;
	background-color: #c40707;
	color: white;
	/* margin-right: 1rem; */
	cursor: pointer;
	border: solid 1px transparent;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	transition: all 0.25s;
	font-size: 1rem;
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
