<script lang="ts">
    import { defineComponent } from 'vue';
    import UserdataService  from '../services/userdata.service';
    import { Match } from '@/types/game.interface';

    interface MatchHistoryComponentData
    {
        currUserId: number;
        matches: Match[];
        avatars: string[];
    }

    export default defineComponent({
        name: 'MatchHistory',
        components: {
        },
        data(): MatchHistoryComponentData {
            return {
                currUserId: 0,
                matches: [],
                avatars: [],
            }
        },

        methods: {
        },
        created(): void {
            this.currUserId = this.$store.state.user;
            UserdataService.getMatchHistory().then(
                response => {
                    if (response.data.length > 0) {
                    	this.matches = response.data;
					for (let i = 0; i < this.matches.length; i++) {
						UserdataService.getUsersAvatar(this.matches[i].avatar).then(
							response => {
								const urlCreator = window.URL || window.webkitURL;
								this.avatars[i] = urlCreator.createObjectURL(response.data);
							},
							() => {
								console.log('Failed to retrieve user avatar')})
						}
					}
                },
                () => {console.log("Error can check the datas for the current user"); 
            }	
        )}
    })
</script>

<template>
    <div class="leaderboardUsers">
        <div class="leaderboard_header">
            <div class="userInfo">
                <div class="rank">
	    			Rank
				</div>
				<div class="profile" style="margin-right: 15px;">
					Avatar
				</div>
				<div class="username">
					Name
				</div>
                <div class="result">
                    Result
                </div>
                <div class="score">
                    Score
                </div>
            </div>
        </div>
        <div class="test">
            <div class="contourcadre">
            <div class="leaderboard_item">
                <div v-for="(match, index) in matches" :key="match.idmatch">
                <div class="userInfo2"> 
                    <div class="rank">
						{{ matches[index].rank }} 
					</div>
					<div class="image">
						<img :src = "avatars[index]" alt="avatar" width="40" height="40">
					</div>
					<div class="username">
						{{ matches[index].opponent }}
                    </div>
						<div class="result">
							{{ matches[index].score }}
						</div>
						<div class="wins" v-if="matches[index].result == 'WIN'" style="color:#27AE60;">
								{{ matches[index].result }}
						</div>
						<div class="loses" v-if="matches[index].result == 'LOSE'" style="color:#FF0000;">
							{{ matches[index].result }}
						</div>
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
.contourcadre {
	/*border: solid;*/
	border-color: black;
}
.username {
	width: 30px;
}
.leaderboardUsers {
	width: 60%;
	height: auto;
	display: flex;
	margin-left: auto;
	margin-right: auto;
	flex-direction: column;
	overflow-y: auto;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.leaderboard_header {
	display: flex;
	align-items: center;
	justify-content: space-around;
	height: 3rem;
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
}
.leaderboard_header .result {
	font-weight: bold;
    margin-left: 10px;
}
.leaderboard_header .wins {
	font-weight: bold;
	width: 33%;
	text-align: center;
	color:#27AE60;
}
.leaderboard_header .loses {
	font-weight: bold;
	width: 33%;
	text-align: center;
	color:#FF0000;
}
.leaderboard_item {
	width: 100%;
	height: 13rem;
	color: whitesmoke;
    display: flex;
    flex-direction: column;
}
.userInfo {
	width: 100%;
	display: flex;
	justify-content: space-evenly;
	align-items: center;
	height: 5rem;
}
.userInfo2 {
	width: auto;
	display: flex;
	justify-content: space-evenly;
    flex-direction: row;
    align-items: center;
}
.rank {
	color: whitesmoke;
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
}
.leaderboard_item img {
	width: 3rem;
	height: 3rem;
	max-width: 4.5rem;
	max-height: 100%;
	border-radius: 100%;
	margin-left: 10px;
}

</style>