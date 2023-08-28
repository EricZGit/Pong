<script lang="ts">
	import { defineComponent } from 'vue';
	import Header from './components/Header.vue';

	export default defineComponent({
		name: 'App',
		components:
		{
			Header,
		},
	});
</script>

<template>
	<div>
		<Header/>
			<div class="router-view header_mode">
			<router-view></router-view>
		</div>
	</div>
</template>

<style>
body {
	margin: 0;
	overflow-x: hidden;
	background: #0b1933;
	font-family: 'Source Sans Pro';
}

* {
	box-sizing: border-box;
}

a {
	text-decoration: none;
	color: whitesmoke;
}

.flex {
	display: flex;
}

.admin {
	justify-content: space-between;
}

#app > div {
	display: flex;
	width: 100%;
}

.router-view {
	width: 100%;
	background: #0b1933;
	transition: all 0.25s;
	min-height: 100vh;
}

.router-view.header_mode {
	width: calc(100% - 6.5rem);
	margin-left: 6.5rem;
}
</style>