<script lang="ts">
import { defineComponent } from 'vue';
import Header from './components/Header.vue';

export default defineComponent({
	name: 'App',
	components:
	{
		Header
	},
});
</script>

<template>
	<div>
		<Header/>
		<div class="page_entiere header_mode">
			<RouterView></RouterView>
		</div>
	</div>
</template>

<style>
body {
	margin: 0;
	overflow-x: hidden;
	overflow-y: hidden;
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

.page_entiere {
	width: 100%;
	background: #0b1933;
	transition: all 0.25s;
	min-height: 100vh;
}

.page_entiere.header_mode {
	width: calc(100% - 6.5rem);
	margin-left: 6.5rem;
}
</style>