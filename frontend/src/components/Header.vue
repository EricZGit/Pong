<script lang="ts">
	import { defineComponent } from 'vue';

	export default defineComponent({
		name: 'Header',
			data()
			{
				return {
					timer: -1,
				}
			}
		});
</script>

<template>
<div class="header2">
		<div class="links_container">
			<router-link to="/account" v-if="$store.state.status.loggedIn === true">
				<img src="/icones/profile_ok.svg" alt="Profile_ok"/><span style="text-align: center;color: black;font-weight: bold;margin-left: 8px;">Profile</span>
			</router-link>
			<router-link to="/account" v-else>
				<img src="/icones/profile.svg" alt="Profile"/>
			</router-link>
		</div>
	</div>
	<div class="header1">
		<div class="links_container">
			<router-link to="/">
				<img src="/icones/home.svg" alt="Home"/><span style="text-align: center;color: black;font-weight: bold;margin-left: 8px;">Ladder</span>
			</router-link>
			<router-link to="/friends">
				<img src="/icones/friends.svg" alt="Friends"/><span style="text-align: center;color: black;font-weight: bold;margin-left: 8px;">Friends</span>
			</router-link>
			<router-link to="/chat">
				<img src="/icones/chat.svg" alt="Chat"/><span style="text-align: center;color: black;font-weight: bold;margin-left: 10px;">Chat</span>
			</router-link>
			<router-link to="/gamesalon">
				<img src="/icones/game.svg" alt="Game"/><span style="text-align: center;color: black;font-weight: bold;margin-left: 10px;">Game</span>
			</router-link>
		</div>
	</div>
</template>

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
	height: 120%;
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
	height: 120%;
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