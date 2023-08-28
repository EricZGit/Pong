<script lang="ts">
    import { defineComponent } from 'vue';
    import UserdataService from '../services/userdata.service';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import router from '../router/index';

    interface AvatarUploadData
    {
        imagePreview: string | ArrayBuffer | null | undefined;
        showPreview: boolean;
        picture: string;
    }

    export default defineComponent({
        name: 'AvatarUpload',
        data(): AvatarUploadData {
            return {
                imagePreview: null,
                showPreview: false,
                picture: '',
            }
        },

        methods: {             
            Ok_Toastify: function(message:string): void {
                toast.success(message);
            },
            NotOk_Toastify: function(message:string): void {
                toast.error(message);
            },
            onFileChange: function(event) {
                this.picture = event.target.files[0];
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    this.showPreview = true;
                    this.imagePreview = reader.result;
                }, false)
                if (this.picture) reader.readAsDataURL(this.picture as unknown as Blob);
            },
            submitForm(): void {
                let formData = new FormData();
                formData.append('avatar', this.picture);
                UserdataService.uploadAvatar(formData).then(
(                   () => {
                        this.picture = '';
                        this.showPreview = false;
                        this.imagePreview = null;
                        this.Ok_Toastify("Successfully updated your avatar");

                        UserdataService.getUserAvatar().then(
                            response => {
                                const urlCreator = window.URL || window.webkitURL;
                                this.$store.state.avatar = urlCreator.createObjectURL(response.data);
                            },
                            () => { console.log("Couldn't get user avatar from backend"); })

                        router.push('/account');
                    }),
                    (error) => {
                        this.picture = '';
                        this.showPreview = false;
                        this.imagePreview = null;
                        console.log("Couldn't update your avatar");
                        console.log(error);
                        this.NotOk_Toastify("Couldn't update your avatar");
                    }
                );
            },
        },
    });
</script>

<template>
    <div class="avatarDiv">
        <p>Upload your avatar</p>
        <form @submit.prevent="submitForm">
            <label for="file-upload" class="custom-file-upload">
                <i class="fas fa-regular fa-folder"></i> 
            </label>
            <input id="file-upload" type="file" accept="image/*" @change="onFileChange" />
            <input type="submit" />
        </form>
        <div v-if="showPreview">
            <img :src="imagePreview" alt="avatar preview" width="100" height="100" />
        </div>
        <button v-if="showPreview" @click="submitForm">Confirm</button>
    </div>
        

</template>

<style scoped>
.avatarDiv {
	color: whitesmoke;
	text-align: center;
}
.avatarDiv p {
	margin-left: 20px;
	color: black;
	font: bold;
	font-weight: 900;
	background: #b16b2a;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.custom-file-upload {
	color: white;
	cursor: pointer;
    display: flex;
    flex-direction: column-reverse;
    flex-wrap: wrap;
    justify-self: start;
}
.custom-file-upload:hover {
	border-color: whitesmoke;
	color: whitesmoke;
}

input[type="file"] {
	display: none;
}

input[type="submit"] {
	display: none;
}

form {
	max-width: 10rem;
	/* background: #b16b2a; */
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	margin-left: 200px;
}


</style>