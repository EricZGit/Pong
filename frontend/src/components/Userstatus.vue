<script lang="ts">
    import { defineComponent } from 'vue'

    export default defineComponent({
        name: 'Userstatus',
        props: {
            status: {
                required: true,
                type: String,
            }, 
			friendId: {
				required: false,
				type: Number,
			},
			userId: {
				required: false,
				type: Number,
			}
        },
		data() {
			return {
				serverURL: "http://" + window.location.hostname + ":3000" as string,
			}
		},
    })
</script>

<template>
    <div class="user_status">

    <p v-if="status === 'online'" class="online"> online</p>
    <p v-if="status === 'offline'" class="offline"> offline</p>
    <p v-if="status === 'in-queue'" class="in-queue"><i style="color: #00b4cc;" class="fa fa-gamepad"></i> in queue</p>
    <p v-if="status === 'spectating'" class="spectating"><i style="color: blueviolet;" class="fa fa-binoculars" aria-hidden="true"></i> spectating</p>
    <p v-if="status === 'in-game'" class="game"><i style="color: green;" class="fas fa-table-tennis"></i> in-game</p>

    </div>
</template>

<style scoped>
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
.game {
	position: relative;
	color: whitesmoke;
}
.user_status
{
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 0.5rem;
}

</style>