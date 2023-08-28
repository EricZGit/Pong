<template>
	<div>
		<div class="fullWindow" id="fullGameWindow">
		<canvas id="PongGame"></canvas> 
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType } from 'vue';
	import { MatchQueue,
			Ball,
			Player,
			Paddle,
			Gamex } from '../types/game.interface';
	import { toast } from 'vue3-toastify';
	import 'vue3-toastify/dist/index.css';
	import { reactive } from 'vue';

	export default defineComponent({
	name: 'Game',
	props: {
		matchqueue: {
			required: true,
			type: Object as PropType<MatchQueue>
		},
		isSpectating: {
			required: true,
			type: Boolean,
		},
	},
	
	data() {
		return {
			mousePos: {
				x: -1 as number,
				y: -1 as number
			},
			fullGameWindow: null as HTMLElement | null,
			ctx: null as CanvasRenderingContext2D | null,
			canvas: null as HTMLCanvasElement | null,
			game: null as Gamex | null,
			keys: reactive({
				KeyW: false,
				KeyS: false,
			}),
		}
	},

	methods: {
		rapport(posY: number) : number 
		{
			let ret = 0;
			if (this.canvas) 
				ret = posY / this.canvas.height * this.matchqueue.game.height;
			return ret;
		},
		
		drawPaddle(player1: Player, player2: Player, paddle: Paddle)
		{
			if (this.ctx && this.canvas) {
				let nPaddle = {
					height: paddle.height / this.matchqueue.game.height * this.canvas.height,
					width: paddle.width / this.matchqueue.game.width * this.canvas.width,
					border: paddle.border / this.matchqueue.game.height * this.canvas.height
				}
				
				let p1 = {
					x: player1.x / this.matchqueue.game.width * this.canvas.width,
					y: player1.y / this.matchqueue.game.height * this.canvas.height - nPaddle.height / 2
				};
				
				let p2 = {
					x: player2.x / this.matchqueue.game.width * this.canvas.width,
					y: player2.y / this.matchqueue.game.height * this.canvas.height - nPaddle.height / 2
				}

				this.ctx.fillStyle = player1.paddleColor;
				this.ctx.fillRect(p1.x, p1.y, nPaddle.width, nPaddle.height);
				this.ctx.fillStyle = player2.paddleColor;
				this.ctx.fillRect(p2.x, p2.y, nPaddle.width, nPaddle.height);
			}
		},
	
		drawBall(ball: Ball)
		{
			if (this.ctx && this.canvas) {
				let nBall = {
					radius: ball.radius / this.matchqueue.game.width * this.canvas.width,
					x: ball.x / this.matchqueue.game.width * this.canvas.width,
					y: ball.y / this.matchqueue.game.height * this.canvas.height,
				}
				this.ctx.beginPath();
				this.ctx.arc(nBall.x, nBall.y, nBall.radius, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = 'white';
				this.ctx.fill();
				this.ctx.stroke();
			}
		},

		drawScore(player1Score: number, player2Score: number)
		{
			if (this.ctx && this.canvas) {
				this.ctx.font = '38px serif';
				this.ctx.fillStyle = 'white';
				this.ctx.fillText(player1Score.toString(), this.canvas.width / 4, 48);
				this.ctx.fillText(player2Score.toString(), this.canvas.width * 3 / 4, 48);
				this.ctx.font = '18px serif';
				this.ctx.fillStyle = 'whitesmoke';
				this.ctx.fillText("Tape W or S to ↑ or ↓", 50, this.canvas.height - 10, this.canvas.width - 30);
			}
		},

		drawSeparator()
		{
			if (this.ctx && this.canvas) {
				let w = this.canvas.width / 200;
				let h = this.canvas.height / 58;
				this.ctx.fillStyle = "red";

				for (let i = 0; i < this.canvas.height; i++) {
					if (!(i % Math.floor(this.canvas.height / 40)))
						this.ctx.fillRect(this.canvas.width / 2, i, w, h);
				}
			}
		},

		drawGame(matchqueue: MatchQueue)
		{
			if (this.ctx && this.canvas) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				if (this.matchqueue.game.colorFond === 'default')
					this.ctx.fillStyle = "black";
				else
					this.ctx.fillStyle = this.matchqueue.game.colorFond;
				this.ctx.fillRect(0, 0, this.canvas.width , this.canvas.height);

				this.drawPaddle(matchqueue.game.p1Left, matchqueue.game.p2Right, matchqueue.game.paddle);
				this.drawSeparator();
				this.drawBall(matchqueue.game.ball);
				this.drawScore(matchqueue.game.p1Score, matchqueue.game.p2Score);
			}
		},

		gameScale() : number
		{
			return this.matchqueue.game.width / this.matchqueue.game.height;
		},

		gameScaleReverse() : number
		{
			return this.matchqueue.game.height / this.matchqueue.game.width;
		},
		
		pongEvent()
		{
			if (this.canvas && !this.isSpectating) {
						let rect = this.canvas.getBoundingClientRect() as DOMRect;
						if (this.keys.KeyW) {
							this.$emit('playerQueueEvent', this.rapport(rect.top - this.matchqueue.game.p1Left.y));
							this.$emit('playerQueueEvent', this.rapport(rect.top - this.matchqueue.game.p2Right.y));
							this.keys.KeyW = false;
						}
						if (this.keys.KeyS) {
							this.$emit('playerQueueEvent', this.rapport(this.matchqueue.game.p1Left.y - rect.top));
							this.$emit('playerQueueEvent', this.rapport(this.matchqueue.game.p2Right.y - rect.top));
							this.keys.KeyS = false;
						}
			}
		},

		refreshScreen(): void
		{
			this.drawGame(this.matchqueue);
			let count = requestAnimationFrame(this.refreshScreen);
			if (count == 50)
				this.Info_Toastify("3");
			if (count == 100)
				this.Info_Toastify("2");
			if (count == 150)
				this.Info_Toastify("1");
			if (count == 200)
				this.Info_Toastify("GO");
			if (count > 200)
				this.$emit('gamecountqueue', count);
		},
		Ok_Toastify: function(message:string): void {
			toast.success(message);
		},
		NotOk_Toastify: function(message:string): void {
		    toast.error(message);
        },
        Info_Toastify: function(message:string): void {
            toast.info(message);
        },
	},

	mounted()
	{
		this.canvas = document.getElementById('PongGame') as HTMLCanvasElement;
		this.fullGameWindow = document.getElementById('fullGameWindow') as HTMLElement;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

		window.addEventListener("keydown", (event) => {
          if (event.code === "KeyS" || event.code === "KeyW") {
			this.keys[event.code] = true;
			this.pongEvent();
          }
        });
		window.addEventListener("keyup", (event) => {
          if (event.code === "KeyW") {
            this.keys[event.code] = true;
			this.keys["KeyS"] = false;
			this.pongEvent();
          }
        });
		window.addEventListener("keydown", (event) => {
		  if (event.code === "keyW") {
			this.keys[event.code] = true;
			this.keys["KeyS"] = false;
			this.pongEvent();
		  }
		});
		window.addEventListener("keyup", (event) => {
		  if (event.code === "keyS" || event.code === "keyW") {
			this.keys[event.code] = true;
			this.pongEvent();
		  }
		});


		this.pongEvent();
		this.refreshScreen();
	},

})
</script>

<style scoped>
.fullWindow
{
	width: 100%;
	min-height: 100vh;
	background-color: #0b1933;
}

canvas
{
	margin-left: 30px;
	margin-top: 30px;
	box-shadow: 0px 0px 17px 10px #FFFFFF;
	height: 600px;
	width: 800px;
}

</style>