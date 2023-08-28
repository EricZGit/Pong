<script lang="ts">

import { defineComponent } from 'vue';
import userdataService from '@/services/userdata.service';

interface SuccessData
{
	success_win: boolean;
	success_avatar: boolean;
	success_friend: boolean;
	success_chat: boolean;
	success_invit: boolean;
}

export default defineComponent({
	name: 'Success',
	data():SuccessData {
		return {
			success_win: false,
			success_avatar: false,
			success_friend: false,
			success_chat: false,
			success_invit: false,
		}
	},
	mounted() {
		userdataService.getSuccess().then(
			response => {
				this.success_win = response.data[0].success_win;
				this.success_avatar = response.data[0].success_avatar;
				this.success_friend = response.data[0].success_friend;
				this.success_chat = response.data[0].success_chat;
				this.success_invit = response.data[0].success_invit;
				// this.success_win = response.data.success_win;
				// this.success_avatar = response.data.success_avatar;
				// this.success_friend = response.data.success_friend;
				// this.success_chat = response.data.success_chat;
				// this.success_invit = response.data.success_invit;
			},
			error => {
				console.log(error);
			}
		);
	}
})
</script>

<template>
	<div class="successDiv">
				<p v-if="success_win == true" style="background-color: green;"><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Win a match</b></p>
				<p v-else><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Win a match</b></p>
                <p v-if="success_avatar == true" style="background-color: green;"><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Upload an avatar</b></p>
                <p v-else><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Upload an avatar</b></p>
                <p v-if="success_friend" style="background-color: green;"><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Add a friend</b></p>	
                <p v-else><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Add a friend</b></p>	
				<p v-if="success_chat" style="background-color: green;"><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Create a chat</b></p>
				<p v-else><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Create a chat</b></p>
                <p v-if="success_invit" style="background-color: green;"><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Invit a player</b></p>
                <p v-else><i style="margin-left: 10px;" class="fa fa-trophy"></i> <b>Invit a player</b></p>
	</div>
</template>

<style scoped>
.successDiv {
	color: whitesmoke;
	text-align: center;
}
.successDiv p {
	display: flex;
	margin-left: 15px;
	color: black;
	font: bold;
	font-weight: 900;
	background: red;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	padding-left: 10px;
	padding-right: 10px;
}
</style>