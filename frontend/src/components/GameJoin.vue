<template>
	<div class="text">
		<div class="test">
			<p id="msg">{{ text }}</p>
		</div>
		<div class="image">
			<img class='gif' src="https://cdn.dribbble.com/users/1436528/screenshots/3541464/media/202140f3ca8f72c6e290a13ad1b2d4c0.gif">
		</div>
	</div>
</template>


<script lang="ts">
import { defineComponent, watch } from 'vue'

export default defineComponent({
	name: 'GameJoin',
	props: {
		isStarting: {
			required: true,
			type: Boolean,
		},
		isPrivate: {
			required: true,
			type: Boolean,
		}
	},

	data()
	{
		return {
			text: "Waiting for another player..."
		}
	},

	methods: {
		updateText(msg: string)
		{
			this.text = msg;
		}
	},

	mounted()
	{
		if (this.isPrivate)
			this.updateText('Waiting for your opponent ...');

		if (this.isStarting) {
			if (this.isPrivate)
                this.updateText('Player found! ');
			else
                this.updateText('Player found! ');
		}

		watch(() => this.isStarting, () => {
			if (this.isPrivate)
                this.updateText('Player found! ')
            else
				this.updateText('Player found! ');
		})
	},

})
</script>

<style>
.text {
	margin-top: 20vh;
	position: relative;
	text-align: center;
	font-size:3vw;
}

#msg {
	letter-spacing: 0.2em;
	font-weight: 700;
}


</style>
