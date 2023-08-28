<script lang="ts">

    import { defineComponent } from 'vue';
    import FriendList from '@/components/FriendList.vue';
    import AffichRequests from '@/components/AffichRequests.vue';
    import AffichBlocked from '@/components/AffichBlocked.vue';
    import AffichList from '@/components/AffichList.vue';
    import 'vue3-toastify/dist/index.css';

    interface FriendsData
    {
        config_mode: string;
    }

    export default defineComponent({
        name: 'Friends',
        components:
        {
            FriendList,
            AffichRequests,
            AffichBlocked,
            AffichList,
        },
        data(): FriendsData {
            return {
                config_mode: '',
            }
        },
        methods: {
            affichOrSearchMode(event, mode)
            {
                let elem = document.getElementById(this.config_mode + '_button');
                if (elem)
                    elem.classList.remove('conf_selected');
                event.currentTarget.classList.add('conf_selected');
                this.config_mode = mode;
            },
        }
    });
</script>

<template>
<div class="homePage">
    <div class="container1">

        <p class="text1">Search Users</p>
        <div class="avatarcontainer">
            <div><button type="button" class="affichbutton" @click="affichOrSearchMode($event, 'affich')">List All Users</button></div>
            <div><button type="button" class="searchbutton" @click="affichOrSearchMode($event, 'search')">Blocked</button></div>
            <div><button type="button" class="listbutton" @click="affichOrSearchMode($event, 'list')">Add Friend</button></div>
            <div style="display: flex;margin-top: -70px;margin-left: 200px;" v-if="config_mode == 'affich'">
                <AffichRequests/>
            </div>
            <div style="display: flex;margin-top: -70px;margin-left: 200px;" v-if="config_mode == 'search'">
                <AffichBlocked/>
            </div>
            <div style="display: flex;margin-top: -70px;margin-left: 200px;" v-if="config_mode == 'list'">
                <AffichList/>
            </div>
        </div>
    </div>
           
    <p class="text2">Friends</p>
        <div class="statutfriends">
            <p class="online">online</p>
            <p class="offline" style="margin-top: -5px;">offline</p>
            <p class="in-queue" style="margin-top: -5px;"><i style="color: #00b4cc;" class="fa fa-gamepad"></i> in-queue</p>
            <p class="spectating" style="margin-top: -5px;"><i style="color: blueviolet;" class="fa fa-binoculars" aria-hidden="true"></i> spectating</p>
            <p class="in-game" style="margin-top: -5px;"><i style="color: green;" class="fas fa-table-tennis"></i> in-game</p>
        </div> 

    <div id="leaderboard" style="width: 60%;margin-left: auto;margin-right: auto;">
        <FriendList/>
    </div>
</div>
</template>

<style scoped>
    
input[name="NewFriend"] {
    width: 150px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
}
.statutfriends {
    margin-left: 250px;
    margin-top: 50px;
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
.homePage {
	width: 100%;
	display: block;
	background-color: #0b1933;
	z-index: 100;
}
.container1 {
    display: block;
    position: relative;
}
.avatarcontainer {
    position: relative;
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
    cursor: pointer;
    transition: all 0.25s;
}
.avatarcontainer button:hover {
    background: black;
    color: whitesmoke;
    border-color: whitesmoke;
}
.online {
	color: whitesmoke;
	position: relative;
	padding-left: 1.25rem;
}
.online::before {
	content: ' ';
	position: absolute;
	top: 50%;
	left: 0;
	transform: translateY(-50%);
	width: 1rem;
	height: 1rem;
	background-color: #00a100;
	border-radius: 100%;
}
.offline {
	position: relative;
	color: whitesmoke;
	padding-left: 1.25rem;
}
.offline::before {
	content: ' ';
	position: absolute;
	top: 50%;
	left: 0;
	transform: translateY(-50%);
	width: 1rem;
	height: 1rem;
	background-color: #d41717;
	border-radius: 100%;
}
.in-queue {
	position: relative;
	color: whitesmoke;
}
.in-game {
	position: relative;
	color: whitesmoke;
}
.spectating {
	position: relative;
	color: whitesmoke;
}
.affichbutton {
	padding: 0.25rem 1rem;
	background-color: #0b1933;
	color: white;
	margin-right: 1rem;
	cursor: pointer;
	border: solid 1px #39d88f;
	transition: all 0.25s;
}
.searchbutton {
	padding: 0.25rem 1rem;
	background-color:#0b1933;
	color: white;
	margin-right: 1rem;
	cursor: pointer;
	border: solid 1px red;
	transition: all 0.25s;
}
.listbutton {
	padding: 0.25rem 1rem;
	background-color:#0b1933;
	color: white;
	margin-right: 1rem;
	cursor: pointer;
	border: solid 1px red;
	transition: all 0.25s;
}
</style>

