<script lang="ts">

import { defineComponent } from 'vue';
import { LeaderboardUser } from '../types/user.interface';
import  UserdataService  from '../services/userdata.service';

interface LeaderboardComponentData
{
	leaderboardUsers: LeaderboardUser[];
	avatars: string[];
	rankStart: number;
}

export default defineComponent({
	name: 'Leaderboard',
	components: {
	},
	data(): LeaderboardComponentData {
		return {
			leaderboardUsers: [],
			avatars: [],
			rankStart: 1,
		}
	},
	methods: {
	},
	mounted(): void {
		UserdataService.getLeaderboard().then(
			response => {
				this.leaderboardUsers = response.data;
				for (let i = 0; i < this.leaderboardUsers.length; i++) {
					UserdataService.getUsersAvatar(this.leaderboardUsers[i].avatar).then(
						response => {
							const urlCreator = window.URL || window.webkitURL;
							this.avatars[i] = urlCreator.createObjectURL(response.data);
						},
						() => {
							console.log('Failed to retrieve user avatar')})
				}
			})},
});
</script>

<template>
	<div id="leaderboard">
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
						Score
					</div>
					<div class="wins">
						Wins
					</div>
					<div class="loses">
						Loses
					</div>
				</div>
			</div>
			<div class="contourcadre" v-if="$store.state.status.loggedIn === true">
				<div class="leaderboard_item" div v-for="(leaderboarduser, index) in leaderboardUsers" :key="leaderboarduser.username">
					<div class="userInfo"> 
						<div class="rank">
							<p class="rankNumber"> {{ leaderboardUsers[index].rank }} </p>
						</div>
						<div class="image">
							<img :src="avatars[index]" alt="avatar" width="40" height="40">
						</div>
						<p class="username">
							{{ leaderboardUsers[index].username }}
						</p>
					</div>
					<div class="stat">
						<div class="score">
							{{ leaderboardUsers[index].score }}
						</div>
						<div class="wins">
							{{ leaderboardUsers[index].win }}
						</div>
						<div class="loses">
							{{ leaderboardUsers[index].lose }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

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
	width: 60%;
	height: auto;
	display: flex;
	margin-left: auto;
	margin-right: auto;
	flex-direction: column;
	/* overflow-y: auto; */
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.leaderboard_header {
	display: flex;
	margin-left: auto;
	margin-right: auto;
	flex-wrap: nowrap;
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
.wins {
	text-align: center;
	width: 33%;
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
</style>

