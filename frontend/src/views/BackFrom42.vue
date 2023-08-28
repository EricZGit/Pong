<template>
	<div>
        <hr>
		<h1 style="margin-left: 50%;margin-right: 50%;">Authentification from 42</h1>
		<hr>
	</div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'

interface BackFrom42ViewData
{
	codename: string;
    codepass: string;
}

export default defineComponent({
	name: 'Callback',

	data(): BackFrom42ViewData {
		return {
			codename: this.$route.query.code as string,
            codepass: this.$route.query.state as string,
		}
	},
	methods: {
		handleLogin: async function(): Promise<void> {
			try 
            {
				const result = await this.$store.dispatch('Login42', { codename: this.codename, codepass: this.codepass });
				if (result.ID) 
					this.$store.commit('LoginSuccess', result);
				else
					this.$store.commit('DisconnectedUser', { payload: "Something went wrong." });
			} 
            catch(error) 
            {
				this.$store.commit('DisconnectedUser', { payload: "Something went wrong." });
			}
		}
	},
	mounted(): void {
		this.handleLogin();
	}
})
</script>
