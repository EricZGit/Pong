<template>
<div class="init">

	<div class="profile">

		<div class="playerInfo">
			<div class="player1">
				<div class="playerAvatar">
					<h2 class="fontStyle">{{ endGameInfo.winner.displayname}}</h2>
					<div class="img">
						<img class="avatar" :src="avatarWinner" alt="Player1Avatar">
					</div>
				</div>
			</div>
		</div>

		<div class="playerBorder"></div>
		
		<div class="playerInfo">
			<div class="player2">
				<div class="playerAvatar">
					<h2 class="fontStyle">{{ endGameInfo.loser.displayname}}</h2>
					<div class="img">
						<img class="avatar" :src="avatarLoser" alt="Player2Avatar">
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="scoreGame">
		<p class="p1score">{{ endGameInfo.p1 }}</p>
		<p> SCORE </p>
		<p class="p2score">{{ endGameInfo.p2 }}</p>
	</div>
	
	<div class="play-again">
		<button @click="playingAgain()">EXIT</button>
	</div>
	

</div>
</template>


<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EndGameInfo } from '../types/game.interface'
import UserdataService from '../services/userdata.service'
import router from '@/router'

export default defineComponent ({
	
	name: 'GameScore',
	
	props: {
		endGameInfo: {
			required: true,
			type: Object as PropType<EndGameInfo>
			},
	},

	data() {
		return {
			avatarWinner: '' as string,
			avatarLoser: '' as string,
		}
	},
	
	methods: {
		playingAgain()
		{
			router.push('account');
		},
	},
	mounted() : void {
		UserdataService.getUsersAvatar(this.endGameInfo.winner.pathtoimage).then(
			response => {
				const urlCreator = window.URL || window.webkitURL;
				this.avatarWinner = urlCreator.createObjectURL(response.data);
			},
			() => {
				console.log('Failed to retrieve user avatar')});
		UserdataService.getUsersAvatar(this.endGameInfo.loser.pathtoimage).then(
			response => {
				const urlCreator = window.URL || window.webkitURL;
				this.avatarLoser = urlCreator.createObjectURL(response.data);
			},
			() => {
				console.log('Failed to retrieve user avatar')});
	}
})
</script>

<style scoped>
.fontStyle {
	font-size: 3vw;
	text-align: center;
	color: #4F4F4F;
}

.init {
	top: 10vh;
	position: relative;
}

.profile {
	position: relative;
	display: flex;
	width: 100 vw;
}

.playerInfo {
	width: 50vw;
	height: auto;
	display: flex;
	justify-content: center;
}

.playerBorder {
	border: 1px solid;
	border-color: red;
}

.img {
	min-width: 10rem;
	width: 25%;
	height: auto;
	margin: 0 auto;
}

img {
	border-radius: 50%;
	max-width: 100%;
	max-height: 100%;
	width: 8rem;
	height: 8rem;
}

.scoreGame {
	display: flex;
	justify-content: space-evenly;
	position: relative;
}

.scoreGame p {
	color: #4F4F4F;
	font-size: 4vw;
}

.play-again {
	width: 100%;
	position: relative;
	display: flex;
	justify-content: center;
}

.play-again button {
	padding: 1em;
	border: none;
	border-radius: 10%;
	cursor: pointer;
}

button {
	margin:0 0.3em 0.3em 0;
	border-radius:0.12em;
	box-sizing: border-box;
	text-decoration:none;
	border:1px solid #FFFFFF;
	font-weight:300;
	color:#FFFFFF;
	background-color: green;
	font-size: 2vw;
	text-align:center;
	transition: all 0.2s;
	position:relative;
}

</style>