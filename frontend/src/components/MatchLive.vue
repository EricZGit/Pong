<script lang="ts">
    import { defineComponent } from 'vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
	import { io, Socket } from 'socket.io-client';
	import router from '@/router';
    import { listOfMatchs } from '@/types/game.interface';


    export default defineComponent({
        name: 'MatchLive',
        data() {
            return {
				socket: io() as Socket,
                socketURLGame: "http://" + window.location.hostname + ":3000/matchLauncher" as string,
                isChooseMatch: false,
                listOfMatch: [] as string[],
                isPrivate: false,
			};
        },
		created(): void {
			this.socket = io(this.socketURLGame, {});

            this.socket.on("listOfMatchs", (listOfMatch: listOfMatchs) => {
                this.listOfMatch = listOfMatch.listOfMatchs;
                this.isPrivate = listOfMatch.isPrivate;
            });
        },
        methods: {
			Ok_Toastify: function(message:string): void {
				toast.success(message);
			},
		    NotOk_Toastify: function(message:string): void {
			    toast.error(message);
            },
            listMatch(): void {
                this.socket.emit("listOfMatch");
            },
            GoSpectating(name: string): void {
                if (this.isPrivate == true) {
                    router.push('/gamesalonprivate')
                    this.$store.state.nameofmatch = name;
                }
                else if (this.isPrivate == false) {
                    router.push('/gamesalon')
                    this.$store.state.nameofmatch = name;
                }
            },
        },
        beforeRouteLeave(to, from, next) {
            this.socket.disconnect();
            next();
        },
    });
</script>
```
<template>
    <div class="chat">
        <p class="text1">LIST GAMES ALIVE</p>
		
  			<button class="bn533" @click="listMatch()">Choose A Match</button>
            <div v-for="match in listOfMatch" :key="match">
                <button class="bn55" @click="isChooseMatch = true; Ok_Toastify('You have chosen a match!')">Match {{match}}</button>
                <button v-if="isChooseMatch == true" class="bn53" @click="GoSpectating(match)">Go Live</button>
            </div>

            <button v-if="isChooseMatch == false" class="bn54">Waiting..</button>
    </div>
</template>

<style scoped>
.chat {
	display: block;
	position: relative;
	margin-top: 30px;
	overflow-y: auto;
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
.bn55 {
    display:flex;
    align-items:center;
    justify-content:center;
    text-align: center;
    background-color: #b16b2a;
    padding: 7px;
    width: 100px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    cursor: pointer;
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