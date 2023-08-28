<template>
    <div class="homePage">
        <div class="container1">
            
            <p class="text1">PROFILE</p>
            <div class="avatarcontainer">
                <div id="avatar-display" v-if="$store.state.avatar">
                    <img class="avatar" :src="$store.state.avatar" alt="User avatar"/>
                </div>
                <div style="margin-left: 120px;margin-bottom: 50px;" class="buttons_container">
                    <div class="buttons_wrapper">
                        <div class="conf_selected" id="avatarupload_button" @click="avatarOrTwofaMode($event, 'avatarupload')">Upload Avatar</div>
                        
                        <div id="twofa_button" @click="avatarOrTwofaMode($event, 'twofa')">twoFA authen</div>

                        <div id="success_button" @click="avatarOrTwofaMode($event, 'success')">Success</div>
                    </div>
                </div>
                       
                <div v-if="config_mode == 'twofa'">
                    <TwoFA/>
                </div>
                        
                <div v-if="config_mode == 'avatarupload'">
                    <AvatarUpload/>
                </div>

                <div v-if="config_mode == 'success'">
                    <Success/>
                </div>
            </div>
            
            <p class="text2">Statut</p><Userstatus :status="status" style="margin-top: -50px;margin-left: 200px;"/>
            <div class="container4">
                <div id="info">
                    <div class="info_body" style="display: flex;">
                        <div class="basic_info">
                            <div v-if="!displaynameEditMode"><p style="margin-top: 0px;"><i style="margin-left: 10px;" class="fas fa-minus-square"></i> <b>Playername</b> : {{ displayname }}</p>
                                <button style="text-decoration: none; color: whitesmoke;" class="edit_displayname" @click="displaynameEditMode = true">Edit Playername</button>
                            </div>
                            <form v-else id="changedisplaynameForm"><p style="margin-top: 0px;"><i style="margin-left: 10px;" class="fas fa-minus-square"></i> <b>Playername</b> : {{ displayname }}</p>
                                <button style="text-decoration: none;cursor:none;" class="edit_displayname">Edit Playername</button>
                                <p><i style="margin-left: 10px;" class="fas fa-minus-square"></i> <b>New Name</b> : 
                            <input name="changedisplaynameInput" v-model="displaynameInput"></p><br/>
                            <button style="text-decoration: none; color: whitesmoke;" class="edit_displayname2" type="button" v-on:click="changedisplayname()">Update</button>
                            <button style="text-decoration: none; color: whitesmoke;" class="cancel_displayname" @click="displaynameEditMode = false; displaynameInput = displayname; displaynameErrorMessage = '';">Cancel</button>
                            </form>
                        </div>
                        
                        <div v-if="!displaynameEditMode">
                        <div class="score_info">
                            <p style="margin-top: 0px;"><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Rank</b> : <b> {{ rank }} </b></p>
                            <p><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Wins</b> : <span style="color:#27AE60;"><b>{{ wins }}</b></span></p>
                            <p><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Losses</b> : <span style="color:#FF0000;"><b>{{ loses }}</b></span></p>
                        </div>
                        </div>
                        <div v-else>
                        <div class="score_info2">
                            <p style="margin-top: 0px;"><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Rank</b> : <b> {{ rank }} </b></p>
                            <p><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Wins</b> : <span style="color:#27AE60;"><b>{{ wins }}</b></span></p>
                            <p><i style="margin-left: 50px;" class="fas fa-minus-square"></i> <b>Losses</b> : <span style="color:#FF0000;"><b>{{ loses }}</b></span></p>
                        </div>
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
    import UserdataService from '../services/userdata.service';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import MatchHistory from '../components/MatchHistory.vue';
    import AvatarUpload from '../components/AvatarUpload.vue';
    import Userstatus from '../components/Userstatus.vue';
    import { UserStatusChangeData } from '@/types/user.interface';
    import TwoFA from '../components/TwoFA.vue';
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
    }
        
    export default defineComponent({
        name: 'Account',
        components: {
            MatchHistory,
            AvatarUpload,
            Userstatus,
            TwoFA,
            Success,
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
            }
        },
        methods: {
            changedisplayname: function(): void {
                if (this.displaynameInput.length < 4 || this.displaynameInput.length > 10)
                {
                    this.NotOk_Toastify("Playername must be between 4 and 10 characters");
                    return;
                }
                UserdataService.changeDisplayName(this.displaynameInput).then(
                    response => {
                        if (response.data.error)
                        {
                            this.NotOk_Toastify(response.data.error);
                            return;
                        }
                        this.displayname = this.displaynameInput;
                        this.displaynameEditMode = false;
                        this.Ok_Toastify("Playername successfully updated");
                    },
                    () => {console.log("Error can check the datas for the current user")}
                );
            },
            avatarOrTwofaMode(event, mode)
            {
                let elem = document.getElementById(this.config_mode + '_button');
                if (elem)
                    elem.classList.remove('conf_selected');
                event.currentTarget.classList.add('conf_selected');
                this.config_mode = mode;
            },
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
        mounted(): void {
            UserdataService.getUserData().then(
                response => {
                    this.displayname = this.displaynameInput = response.data.displayname;
                    this.rank = response.data.rank;
                    this.wins = response.data.wins;
                    this.loses = response.data.loses;
                    this.id = response.data.id;
                    },
                    () => {console.log("Error can check the datas for the current user"); })
                    
                    UserdataService.getUserAvatar().then(
                        response => {
                            const urlCreator = window.URL || window.webkitURL;
                            this.$store.state.avatar = urlCreator.createObjectURL(response.data);
                        },
                    )
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
.buttons_container {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}
.buttons_wrapper {
    display: flex;
    flex-wrap: wrap;
    align-self: center;
}
.buttons_wrapper > div {
    padding: 0.25rem 1rem;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
    border: solid 1px black;
    color: whitesmoke;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.25s;
}
.buttons_wrapper > .conf_selected {
    background-color: #b16b2a;
    color: white;
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
}
.score_info2 {
    width: 150%;
}
.edit_displayname {
    background-color: #0b1933;
    color: white;
    margin-left: 80px;
    cursor: pointer;
    border: solid 3px transparent;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
    transition: all 0.25s;
}
.edit_displayname:hover{
    border-color: whitesmoke;
    color: whitesmoke;
    background-color: black;
}
.cancel_displayname {
    display: flex;
    margin-left: 240px;
    margin-top: -23px;
    background-color: red;
    cursor: pointer;
    border: solid 3px transparent;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
    transition: all 0.25s;
}
.cancel_displayname:hover {
    border-color: whitesmoke;
    color: whitesmoke;
    background-color: black;
}
    
input[name="changedisplaynameInput"] {
    width: 150px;
}
.homePage {
    width: 100%;
    display: block;
    background-color: #0b1933;
    z-index: 100;
}
.edit_displayname2 {
    display: flex;
    background-color: green;
    color: white;
    margin-left: 180px;
    margin-top: -36px;
    cursor: pointer;
    border: solid 3px transparent;
    box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
    transition: all 0.25s;
}
.edit_displayname2:hover{
    border-color: whitesmoke;
    color: whitesmoke;
    background-color: black;
}
</style>
        