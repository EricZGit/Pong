<template>
	<div id="game">
		<GameJoin  v-if="OkGameJoin" :isPrivate="isPrivate" :isStarting="isStarting" ></GameJoin>
		<GameQueue v-if="OkGameStart" :isSpectating="isSpectating" :matchqueue="matchqueue" @playerQueueEvent="updatePosition($event, matchqueue)"  @gamecountqueue="updateBall($event)"></GameQueue>
		<GameScore v-if="OKGameScore" :endGameInfo="endGameInfo"></GameScore>
		<GameOption v-if="OkOption" @optionChoice="optionChoice($event)"></GameOption>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GameJoin from '../components/GameJoin.vue'
import io from 'socket.io-client'
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { Socket } from 'socket.io-client';
import { 	Ball,
			Player,
			Paddle,
			Gamex, 
			EndGameInfo,
			Winner,
			Loser,
			Option,
			MatchQueue} from '../types/game.interface';
import GameScore from '../components/GameScore.vue';
import router from '@/router/index';
import GameOption from '../components/GameOption.vue';
import GameQueue from '../components/GameQueue.vue';

export default defineComponent({
	
	name: 'GameSalon',
	components: { GameJoin , GameQueue, GameScore, GameOption },

	data() {
		return {
			socket: io() as Socket,
			room: 0,
			matchqueue: {
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
					colorFond: 'black',
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
			} as MatchQueue,
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
			gameoption: {
				paddleColor: 'white',
				maxScore: 10,
				colorFond: 'default'
				} as Option,

			OkGameJoin: false as boolean,
			OkGameStart: false as boolean,
			OKGameScore: false as boolean,
			isPrivate: false as boolean,
			isStarting: false as boolean,
			OkOption: true as boolean,
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
		rejoinQueue() : void
		{
			this.resetData();
		},
		waitInQueue() : void
		{
			this.isPrivate = false;
			this.OkGameJoin = true;
			this.isStarting = false;
			this.OkGameStart = false;
			this.OKGameScore = false;
			this.OkOption = false;
			this.room = this.$store.state.roomId;
			// this.Info_Toastify("Waiting for an opponent !");
		},
		startingGame(inGame: boolean, chall, opp, optionchall, optionopp) : void
		{
			if (inGame) {
				this.OkGameJoin = false;
				this.matchqueue.roomid = this.room;
				this.matchqueue.challenger = chall;
				this.matchqueue.opponent = opp;
				
				this.matchqueue.game.p1Left.paddleColor = optionchall.optionChoice.paddleColor;
				this.matchqueue.game.p2Right.paddleColor = optionopp.optionChoice.paddleColor;
				
				if (optionchall.optionChoice.colorFond == 'default' && optionopp.optionChoice.colorFond != 'default')
					this.matchqueue.game.colorFond = optionopp.optionChoice.colorFond;
				else if (optionchall.optionChoice.colorFond != 'default' && optionopp.optionChoice.colorFond == 'default')
					this.matchqueue.game.colorFond = optionchall.optionChoice.colorFond;
				else if (optionchall.optionChoice.colorFond != 'default' && optionopp.optionChoice.colorFond != 'default') {
					this.matchqueue.game.colorFond = 'default';
					this.Info_Toastify("Both players have chosen a custom background, the default background will be used !");
				}
				else
					this.matchqueue.game.colorFond = 'default';
				this.isStarting = true;
				this.OkGameStart = true;
				this.OKGameScore = false;

				// console.log('startingGameQueue', this.matchqueue);
			}
		},
		resetData() : void
		{
			this.OkGameJoin  = false;
			this.isPrivate = false;
			this.isStarting = false;
			this.OkGameStart = false;
			this.OKGameScore = false;
			this.OkOption = true;
			this.endGameInfo = {
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
					},
				loser: {
					id: 0,
					username: '',
					rank: 0,
					displayname: '',
					score: '',
					wins: 0,
					loses: 0,
					pathtoimage: '',
					},
			} as EndGameInfo;
			this.gameoption = {
				paddleColor: 'white',
				maxScore: 10,
				colorFond: 'default'
				} as Option;
			this.matchqueue = {
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
					colorFond: 'black',
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
			} as MatchQueue;
		},
		updatePosition(playerPosY: number, matchqueue)
		{
			if ( this.$store.state.socketchallenger) {
				this.socket.emit('pongEventQueue', playerPosY, matchqueue, 'left', this.gameoption);
			}
			else if ( this.$store.state.socketopponent) {
				this.socket.emit('pongEventQueue', playerPosY, matchqueue, 'right', this.gameoption);
			}
		},
		updateBall(gamecount: number)
		{
			this.gamecount = gamecount;
			this.socket.emit('updateBallqueue', this.matchqueue, this.gamecount);
		},
		gameEnded(matchqueue)
		{
			if (!matchqueue.challenger.displayname || !matchqueue.opponent.displayname)
			{
				return ;
			}

			cancelAnimationFrame(this.room);
			cancelAnimationFrame(this.$store.state.roomId);
			this.OkGameJoin = false;
			this.OkGameStart = false;
			this.OkGameJoin = false;
			if (matchqueue.game.p1Score > matchqueue.game.p2Score) {
				// this.Ok_Toastify(matchqueue.challenger.displayname + ' has won the game !');
				this.endGameInfo.winner = matchqueue.challenger;
				this.endGameInfo.loser = matchqueue.opponent;
				this.endGameInfo.p1 = matchqueue.game.p1Score;
				this.endGameInfo.p2 = matchqueue.game.p2Score;
				this.matchqueue.isalreadywin = true;
				this.OKGameScore = true;
			
				if (this.$store.state.socketchallenger) {
					this.socket.emit('history', this.endGameInfo, this.gameoption);
					this.$store.state.socketchallenger = null;
					this.$store.state.socketopponent = null;
				}
				else if (this.$store.state.socketopponent)
					return ;

				this.socket.disconnect();
			}
			else if (matchqueue.game.p1Score < matchqueue.game.p2Score) {
				// this.Ok_Toastify(matchqueue.opponent.displayname + ' has won the game !');
				this.endGameInfo.winner = matchqueue.opponent;
				this.endGameInfo.loser = matchqueue.challenger;
				this.endGameInfo.p2 = matchqueue.game.p1Score;
				this.endGameInfo.p1 = matchqueue.game.p2Score;
				this.matchqueue.isalreadywin = true;
				this.OKGameScore = true;
				if (this.$store.state.socketchallenger) {
					this.socket.emit('history', this.endGameInfo, this.gameoption);
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
		gameStop(matchqueue)
		{
			cancelAnimationFrame(this.room);
			cancelAnimationFrame(this.$store.state.roomId);

			
			if (this.$store.state.socketopponent)
			{
				matchqueue.game.p1Score = 10;
				matchqueue.game.p2Score = 0;
				matchqueue.isalreadywin = true;
				this.matchqueue = matchqueue;
				this.socket.emit('gameStopQueue', matchqueue);
			}
			else if (this.$store.state.socketchallenger)
			{
				matchqueue.game.p1Score = 0;
				matchqueue.game.p2Score = 10;
				matchqueue.isalreadywin = true;
				this.matchqueue = matchqueue;
				this.socket.emit('gameStopQueue', matchqueue);
			}
		},
		optionChoice(option: Option)
		{
			this.gameoption = option;

			if (this.socket && this.$store.state.opponent == false && this.$store.state.challenger == false)
			{
				this.$store.state.roomId = 1;
				this.waitInQueue();
				this.socket.emit('joinQueue', this.$store.state.user.ID, this.gameoption);
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
		this.$store.state.challenger = false;
		this.$store.state.opponent = false;

		
		this.socket = io(this.serverURL, {});
		if (this.socket && this.$store.state.challenger == true)
		{
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
		
		this.socket.on('waitInQueue', () => {
			this.$store.state.socketchallenger = this.socket;
		});
		
		this.socket.on('startGameQueue', (inGame: boolean, chall, opp, optionchall, optionopp) => {
			this.startingGame(inGame, chall, opp, optionchall, optionopp);
		});
		
		this.socket.on('stopChallenge', () => {
			this.resetData();
			router.push('./chat');
			this.NotOk_Toastify("Your opponent has refused your challenge !");
		});
		
		this.socket.on('actualiseQueue', () => {
			if (this.$store.state.socketchallenger && !this.$store.state.socketopponent)
			{
				this.$store.state.socketchallenger = this.socket;
				this.$store.state.challenger = true;
				this.$store.state.opponent = false;
			}
			else if (!this.$store.state.socketopponent && !this.$store.state.socketchallenger)
			{
				this.$store.state.socketopponent = this.socket;
				this.$store.state.opponent = true;
				this.$store.state.challenger = false;
			}
		});

		this.socket.on('actualizeQueueGame', (matchqueue) => {
			this.matchqueue = matchqueue;
		});

		this.socket.on('actualizeBallqueue', (matchqueue) => {
			this.matchqueue = matchqueue;
		});

		this.socket.on('endGameQueue', (matchqueue) => {
			this.matchqueue = matchqueue;
			this.gameEnded(matchqueue);
			// this.Ok_Toastify("Game is over !");
		});

		this.socket.on('gameStopQueue', (matchqueue) => {
			this.gameEnded(matchqueue);
			this.NotOk_Toastify("One player has left the game !");
		});

		this.socket.on('launchSpectating', () => {
			this.launchSpectate();
		});
	},
	beforeRouteLeave (to, from , next)
	{
		this.socket.emit('coucou');

		if (this.matchqueue.isalreadywin == true)
		{
			this.resetData();
		}

		if (this.matchqueue.isalreadywin == false && this.OkGameStart == true)
			this.gameStop(this.matchqueue);
		else if (this.matchqueue.isalreadywin == false && this.OkGameStart == false)
			return next();
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
