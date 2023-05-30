<template>
	<div class="header2">
		<div class="links_container">
			<router-link to="/account" v-if="$store.state.status.loggedIn === true">
				<img src="/icones/profile_ok.svg" alt="Profile_ok"/>
			</router-link>
			<router-link to="/account" v-else>
				<img src="/icones/profile.svg" alt="Profile"/>
			</router-link>
		</div>
	</div>
	<div class="header1">
		<div class="links_container">
			<router-link to="/">
				<img src="/icones/home.svg" alt="Home"/>
			</router-link>
			<router-link to="/friends">
				<img src="/icones/friends.svg" alt="Friends"/>
			</router-link>
			<router-link to="/chat">
				<img src="/icones/chat.svg" alt="Chat"/>
			</router-link>
			<router-link to="/game">
				<img src="/icones/game.svg" alt="Game"/>
			</router-link>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import userService from '../services/user.service';
export default defineComponent({
	name: 'Header',
	mounted()
	{
		if (this.$store.state.status.loggedIn === true)
		{
			userService.getCurrUserAvatar().then(
				response => {
					const urlCreator = window.URL || window.webkitURL;
					this.$store.state.avatar = urlCreator.createObjectURL(response.data);
				},
				() => { console.log("Couldn't get user avatar from backend"); }
			)
		}
	},
});
</script>

<style>
.header1
{
	position: absolute;
	top: 0;
	right: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	z-index: 99999;
	background-color: white;
	height: 100vh;
	width: 6.5rem;
	padding: 0.5rem 1rem;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 50%);
	transition: all 0.25s;
}
.header2
{
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	z-index: 99999;
	background-color: white;
	height: 100vh;
	width: 6.5rem;
	padding: 0.5rem 1rem;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 50%);
	transition: all 0.25s;
}
.links_container
{
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 1.2rem;
	padding: 0.5rem 1rem;
	margin: 0.5rem 0;
}
.links_container img
{
	display: block;
	width: 4rem;
	margin-top: 20px;
}
</style>