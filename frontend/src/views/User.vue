<template>
    <div class="homePage">
        <div class="container1">
            
            <p class="text1">PROFILE of {{ displayname }}</p>
            <div class="avatarcontainer">
                <div id="avatar-display">
                    <img class="avatar" :src="avatar" alt="User avatar"/>
                </div>
                <Success/>
            </div>
            
            <p class="text2">Statut</p><Userstatus :status="status" style="margin-top: -50px;margin-left: 200px;"/>
            <div class="container4">
                <div id="info">
                    <div class="info_body">
                        <div class="basic_info">
                            <div>
                                <p style="margin-top: 0px;"><i style="margin-left: 10px;" class="fas fa-minus-square"></i> <b>Playername</b> : {{ displayname }}</p>
                            </div>
                        </div>
                        
                        <div class="score_info">
                            <p style="margin-top: 0px;"><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Rank</b> : <b> {{ rank }} </b></p>
                            <p><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Wins</b> : <span style="color:#27AE60;"><b>{{ wins }}</b></span></p>
                            <p><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Losses</b> : <span style="color:#FF0000;"><b>{{ loses }}</b></span></p>
                        </div>
                    </div>
                </div>
            </div>
    
            <p class="text3">Match History</p>
            <div id="leaderboard" style="width: 60%;margin-left: auto;margin-right: auto;">
                <MatchHistory/>
            </div>
        </div>
    </div>
</template>
        
<script lang="ts">
    import { defineComponent } from 'vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import MatchHistory from '../components/MatchHistory.vue';
    import Userstatus from '../components/Userstatus.vue';
    import { UserStatusChangeData } from '@/types/user.interface';
    import axios from 'axios';
    import Success from '../components/Success.vue';
        
    interface AccountData
    {
        displayname: string;
        displaynameEditMode: boolean;
        displaynameInput: string;
        config_mode: string;
        rank: number;
        wins: number;
        loses: number;     
        status: string; 
        id : number;
        avatar: string; 
        userID: number;
    }
        
    export default defineComponent({
        name: 'Account',
        components: {
    MatchHistory,
    Userstatus,
    Success
},
        data():AccountData {
            return {
                displayname: '',
                displaynameEditMode: false,
                displaynameInput: '',
                config_mode: 'avatarupload',
                rank: 0,
                wins: 0,
                loses: 0,
                status: 'online',
                id: 0,
                avatar: '',
                userID: 0,
            }
        },
        methods: {
            Ok_Toastify: function(message:string): void {
                toast.success(message);
            },
            NotOk_Toastify: function(message:string): void {
                toast.error(message);
            },
            changeStatus: function(data: UserStatusChangeData): void {
                if (data.userId == this.id)
                {
                    this.status = data.status;
                }
            }
        },
        async mounted(): Promise<void> {
            this.userID = parseInt(this.$route.params.id as string);
                axios.get('http://localhost:3000/user/data/profile/' + this.userID).then(
                    (response) => {
                        this.displayname = response.data.displayname;
                        this.rank = response.data.rank;
                        this.wins = response.data.wins;
                        this.loses = response.data.loses;
                        this.status = response.data.status;
                        // console.log('User status : ', this.status);
                        this.id = response.data.id;
                    },
                    () => {
                        this.NotOk_Toastify('Error while retrieving user profile'); })
                    
                    axios.get('http://localhost:3000/user/data/profile/avatar/' + this.userID, {responseType : 'blob'}).then(
                        (response) => {
                            const urlCreator = window.URL || window.webkitURL;
                            this.avatar = urlCreator.createObjectURL(response.data);
                        },
                     ),
                    () => {
                        this.NotOk_Toastify('Error while retrieving user avatar'); }
            },
        
    })
</script>
        
<style scoped>
.container1 {
    display: block;
    position: relative;
}
.text1 {
    text-align: center;
    width: 100%;
    margin: 0 auto;
    color: whitesmoke;
    font-size:3.5em;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 0.2em;
    background: black;
    position: relative; 
}  	
.text2 {
    margin-top: 100px;
    text-align: center;
    width: 100%;
    color: whitesmoke;
    font-size:2.5em;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin-bottom: 0.2em;
    background: black;
    position: relative; 
}  	
.text3 {
    margin-top: 100px;
    text-align: center;
    width: 100%;
    color: whitesmoke;
    font-size:2.5em;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin-bottom: 0.2em;
    background: black;
    position: relative; 
    } 
.avatarcontainer {
    position: relative;
    display: flex;
    margin-left: auto;
    margin-right: auto;
    width: 800px;
    height: 215px;
    margin-top: 100px;
    background-color: #0b1933;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.avatarcontainer button {
    padding: 0.25rem 2rem;
    margin-top: 7px;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
    border: solid 3px transparent;
    background: #0b1933;
    color: white;
    cursor: pointer;
    transition: all 0.25s;
}
.avatarcontainer button:hover {
    background: black;
    color: whitesmoke;
    border-color: whitesmoke;
}
.avatar    {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-top: 50px;
    margin-left: 75px;
}
#avatar-display    {
    background-color: #0b1933;
    text-align: center;
}
.container4 {
    position: relative;
    display: flex;
    margin-left: auto;
    margin-right: auto;
    width: 600px;
    height: 100px;
    margin-top: 50px;
    background-color: #b16b2a;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.info_body {
    width: 100%;
}
.basic_info {
    width: 100%;
}
.score_info {
    width: 150%;
    margin-left: 102%;
    margin-top: -36px;
}
.homePage {
    width: 100%;
    display: block;
    background-color: #0b1933;
    z-index: 100;
}
</style>
        