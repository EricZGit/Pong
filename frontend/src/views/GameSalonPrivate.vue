<template>
	<div id="game">
		<GameJoin  v-if="OkGameJoin" :isPrivate="isPrivate" :isStarting="isStarting" ></GameJoin>
		<Game v-if="OkGameStart" :isSpectating="isSpectating" :matchprivate="matchprivate" @playerEvent="updatePosition($event, matchprivate)" @gamecount="updateBall($event)"></Game>
		<GameScore v-if="OKGameScore" :endGameInfo="endGameInfo"></GameScore>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GameJoin from '../components/GameJoin.vue'
import io from 'socket.io-client'
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { Socket } from 'socket.io-client';
import { MatchPrivate,
			Ball,
			Player,
			Paddle,
			Gamex, 
			EndGameInfo,
			Winner,
			Loser} from '../types/game.interface';
import Game from '../components/Game.vue';
import GameScore from '../components/GameScore.vue';
import router from '@/router/index';

export default defineComponent({
	
	name: 'GameSalonPrivate',
	components: { GameJoin , Game, GameScore },

	data() {
		return {
			socket: io() as Socket,
			room: 0,
			matchprivate: {
				isalreadywin: false,
				roomid: 0,
				challenger: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					},
				opponent: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					},
				game: {
					p1Score: 0,
					p2Score: 0,
					width: 800,
					height: 600,
					p1Left: {
						x: 0,
						y: 600 / 2 - 35,
						velX: 7,
						velY: 10,
						paddleColor: 'white'
					} as Player,
					p2Right: {
						x: 800 - 18,
						y: 600 / 2 - 35,
						velX: 7,
						velY: 10,
						paddleColor: 'white'
					} as Player,
					paddle: {
						height: 90,
						width: 18,
						border: 6
					} as Paddle,
					ball: {
						x: 800 / 2 - 9,
						y: 600 / 2 - 9,
						radius: 9,
						speed: 10,
						velX: 5,
						velY: 5,
						dir: 1,
					} as Ball,
				} as Gamex | null,
			} as MatchPrivate,
			endGameInfo:  {
				p1: 0,
				p2: 0,
				winner: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					} as Winner,
				loser: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					} as Loser,
			} as EndGameInfo,

			OkGameJoin: false as boolean,
			OkGameStart: false as boolean,
			OKGameScore: false as boolean,
			isPrivate: false as boolean,
			isStarting: false as boolean,
			isSpectating: false as boolean,
			gamecount: 0 as number,

			serverURL: "http://" + window.location.hostname + ":3000/matchLauncher" as string,
		}
	},

	methods: 
	{   
        Ok_Toastify: function(message:string): void {
			toast.success(message);
		},
		NotOk_Toastify: function(message:string): void {
		    toast.error(message);
        },
        Info_Toastify: function(message:string): void {
            toast.info(message);
        },
		waitInPrivateQueue() : void
		{
			this.isPrivate = true;
			this.OkGameJoin = true;
			this.isStarting = false;
			this.room = this.$store.state.roomId;
            this.Info_Toastify("Default options in private game.");
		},
		startingGame(inGame: boolean, chall, opp) : void
		{
			if (inGame) {
				this.OkGameJoin = false;
				this.matchprivate.roomid = this.room;
				this.matchprivate.challenger = chall;
				this.matchprivate.opponent = opp;
				// this.Ok_Toastify("Game is starting !");
				this.isStarting = true;
				this.OkGameStart = true;
				this.OKGameScore = false;
			}
		},
		resetData() : void
		{
			this.OkGameJoin  = false;
			this.isPrivate = false;
			this.isStarting = false;
			this.OkGameStart = false;
			this.OKGameScore = false;
			this.isSpectating = false;
			this.gamecount = 0;
			this.matchprivate = {
				isalreadywin: false,
				roomid: 0,
				challenger: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					},
				opponent: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					},
				game: {
					p1Score: 0,
					p2Score: 0,
					width: 800,
					height: 600,
					p1Left: {
						x: 0,
						y: 600 / 2 - 35,
						velX: 7,
						velY: 10,
						paddleColor: 'white'
					} as Player,
					p2Right: {
						x: 800 - 18,
						y: 600 / 2 - 35,
						velX: 7,
						velY: 10,
						paddleColor: 'white'
					} as Player,
					paddle: {
						height: 90,
						width: 18,
						border: 6
					} as Paddle,
					ball: {
						x: 800 / 2 - 9,
						y: 600 / 2 - 9,
						radius: 9,
						speed: 10,
						velX: 5,
						velY: 5,
						dir: 1,
					} as Ball,
				} as Gamex | null,
			} as MatchPrivate;
		},
		actualizeGame() : void
		{
			if (this.OkGameJoin) {
				this.OkGameJoin = false
				this.isStarting = true;
			}
			if (this.isStarting) {
				this.OkGameStart = true;
			}
		},
		updatePosition(playerPosY: number, matchprivate)
		{
			// console.log(playerPosY);
			if ( this.$store.state.socketchallenger) {
				this.socket.emit('pongEvent', playerPosY, matchprivate, 'left');
			}
			else if ( this.$store.state.socketopponent) {
				this.socket.emit('pongEvent', playerPosY, matchprivate, 'right');
			}
		},
		updateBall(gamecount: number)
		{
			this.gamecount = gamecount;
			this.socket.emit('updateBall', this.matchprivate, this.gamecount);
		},
		gameEnded(matchprivate)
		{
				if (!matchprivate.challenger.displayname || !matchprivate.opponent.displayname)
					return ;
			
			cancelAnimationFrame(this.room);
			cancelAnimationFrame(this.$store.state.roomId);
			this.OkGameJoin = false;
			this.OkGameStart = false;
			if (matchprivate.game.p1Score > matchprivate.game.p2Score) {
				// this.Ok_Toastify(matchprivate.challenger.displayname + ' has won the game !');
				this.endGameInfo.winner = matchprivate.challenger;
				this.endGameInfo.loser = matchprivate.opponent;
				this.endGameInfo.p1 = matchprivate.game.p1Score;
				this.endGameInfo.p2 = matchprivate.game.p2Score;
				this.matchprivate.isalreadywin = true;
				this.OKGameScore = true;
				
				if (this.$store.state.socketchallenger) {
				this.socket.emit('historyprivate', this.endGameInfo);
				this.$store.state.socketchallenger = null;
				this.$store.state.socketopponent = null;
			}
			else if (this.$store.state.socketopponent)
				return ;

				this.socket.disconnect();
			}
			else if (matchprivate.game.p1Score < matchprivate.game.p2Score) {
				// this.Ok_Toastify(matchprivate.opponent.displayname + ' has won the game !');
				this.endGameInfo.winner = matchprivate.opponent;
				this.endGameInfo.loser = matchprivate.challenger;
				this.endGameInfo.p2 = matchprivate.game.p1Score;
				this.endGameInfo.p1 = matchprivate.game.p2Score;
				this.matchprivate.isalreadywin = true;
				this.OKGameScore = true;
				
				if (this.$store.state.socketchallenger) {
				this.socket.emit('historyprivate', this.endGameInfo);
				this.$store.state.socketchallenger = null;
				this.$store.state.socketopponent = null;
			}
			else if (this.$store.state.socketopponent)
				return ;

				this.socket.disconnect();
			}
			else
				this.Ok_Toastify('Draw !');
		},
		gameStop(matchprivate)
		{
			cancelAnimationFrame(this.room);
			cancelAnimationFrame(this.$store.state.roomId);

			
			if (this.$store.state.socketopponent)
			{
				matchprivate.game.p1Score = 10;
				matchprivate.game.p2Score = 0;
				matchprivate.isalreadywin = true;
				this.matchprivate = matchprivate;
				this.socket.emit('gameStop', matchprivate);
			}
			else if (this.$store.state.socketchallenger)
			{
				matchprivate.game.p1Score = 0;
				matchprivate.game.p2Score = 10;
				matchprivate.isalreadywin = true;
				this.matchprivate = matchprivate;
				this.socket.emit('gameStop', matchprivate);
			}
		},
		launchSpectate() : void
		{
			this.isSpectating = true;
			this.isStarting = true;
			this.OkGameStart = true;
		},
	},
	created() 
	{
		this.socket = io(this.serverURL, {});
		if (this.socket && this.$store.state.challenger == true)
		{
			this.waitInPrivateQueue();
			this.$store.state.socketchallenger = this.socket;
		}
		else if (this.socket && this.$store.state.opponent == true && this.$store.state.challenger == false)
		{
			this.$store.state.socketopponent = this.socket;
			this.OkGameStart = true;
		}
		else 
		{
			this.socket.emit('launchSpectating', this.$store.state.nameofmatch);
		}
		
		this.socket.on('waitInPrivateQueue', (chall, opp) => {
			this.Ok_Toastify(chall.displayname + ' is waiting ' + opp.displayname + ' in private queue for a game.');
		}); 
		
		this.socket.on('startingGamePrivate', (inGame: boolean, chall, opp) => {
			this.startingGame(inGame, chall, opp);
		});
		
		this.socket.on('actualizeGame', () => {
			this.actualizeGame();
		});
		
		this.socket.on('stopChallenge', () => {
			this.resetData();
			router.push('./chat');
			this.NotOk_Toastify("Your opponent has refused your challenge !");
		});
		
		this.socket.on('actualizexxxxGame', (matchprivate) => {
			// console.log('actualizexxxxGame', matchprivate);
			this.matchprivate = matchprivate;
		});

		this.socket.on('actualizeBall', (matchprivate) => {
			this.matchprivate = matchprivate;
		});
		
		this.socket.on('endGame', (matchprivate) => {
			this.matchprivate = matchprivate;
			this.gameEnded(matchprivate);
			// this.Ok_Toastify("Game is over !");
		});
		
		this.socket.on('stopGame', (matchprivate) => {
			this.NotOk_Toastify("One player has left the game !");
			this.gameEnded(matchprivate);
		});

		this.socket.on('launchSpectating', () => {
			this.launchSpectate();
		});
		
		
	},
	beforeRouteLeave (to, from , next)
	{
		this.socket.emit('coucou');

		if (this.matchprivate.isalreadywin == false)
			this.gameStop(this.matchprivate);
		next();
	},
})
</script>

<style>

.router_view
{
	background-color: #E6EFF2;
}

#game
{
	min-height: 100%;
}

</style>
