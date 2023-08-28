<template>
    
    <div v-if="defaultConfig == true">
        <div class="start">
            <button @click="startGame()">START QUEUE with default options</button>
        </div>
        <div class="startoptions">
            <button @click="startOption()">CHOOSE OPTIONS</button>
        </div>
    </div>
    <div v-else id ="setup">
        <p>Playground Color ><span>
            <i style="background-color: black;color: black;">#</i>
            <i style="background-color: grey;color: grey;">#</i>
            <i style="background-color: orange;color: orange;">#</i>
        </span></p>
        <div class="fond">
            <button :class="select.fond1 ? 'black' : 'notselected'" @click="setBackground('black')"></button>
            <button :class="select.fond2 ? 'grey' : 'notselected'" @click="setBackground('grey')"></button>
            <button :class="select.fond3 ? 'orange' : 'notselected'" @click="setBackground('orange')"></button>
        </div>
        <p>Max Score to win</p>
        <div class="score">
            <button :class="select.score1 ? 'selected' : 'notselected'" @click="setScore(10)">10</button>
            <button :class="select.score2 ? 'selected' : 'notselected'" @click="setScore(15)">15</button>
            <button :class="select.score3 ? 'selected' : 'notselected'" @click="setScore(20)">20</button>
            <button :class="select.score4 ? 'selected' : 'notselected'" @click="setScore(30)">30</button>
        </div>
        <p>Paddle COLOR ><span>
            <i style="background-color: white;color: white;">#</i>
            <i style="background-color: yellow;color: yellow;">#</i>
            <i style="background-color: blue;color: blue;">#</i>
            <i style="background-color: red;color: red;">#</i>
            <i style="background-color: green;color: green;">#</i>           
        </span></p>
        <div class="color">
            <button :class="select.pad1 ? 'white' : 'notselected'" @click="setPadColor('white')"></button>
            <button :class="select.pad2 ? 'yellow' : 'notselected'" @click="setPadColor('yellow')"></button>
            <button :class="select.pad3 ? 'blue' : 'notselected'" @click="setPadColor('blue')"></button>
            <button :class="select.pad4 ? 'red' : 'notselected'" @click="setPadColor('red')"></button>
            <button :class="select.pad5 ? 'green' : 'notselected'" @click="setPadColor('green')"></button>
        </div>
        <div class="start">
            <button @click="startGame()">START QUEUE</button>
        </div>
    </div>
    
</template>
    
<script lang="ts">
    import { defineComponent } from 'vue'
    import { Option } from '../types/game.interface'
    
    export default defineComponent({
    
        name: 'OptionGame',
        emits: ["optionChoice"],
    
        data() {
            return {
                option: { 
                    paddleColor: 'white',
                    maxScore: 10,
                    colorFond: 'default' 
                            } as Option,
                            
                select: { 
                    score1: false, 
                    score2: false, 
                    score3: false,
                    score4: false,
                    fond1: false,
                    fond2: false,
                    fond3: false,
                    pad1: false,
                    pad2: false,
                    pad3: false,
                    pad4: false,
                    pad5: false,
                            },
                defaultConfig: true as boolean 
            }
        },
    
        methods: {
            setBackground(color: string) {
                if (color != undefined) {
                    this.select.fond1 = color === 'black' ? true : false;
                    this.select.fond2 = color === 'grey' ? true : false;
                    this.select.fond3 = color === 'orange' ? true : false;

                    this.option.colorFond = color;
                }
            },
            setScore(score: number) {
                if (score != undefined) {
                    this.select.score1 = score === 10 ? true : false;
                    this.select.score2 = score === 15 ? true : false;
                    this.select.score3 = score === 20 ? true : false;
                    this.select.score4 = score === 30 ? true : false;
    
                    this.option.maxScore = score;
                }
            },
            setPadColor(color: string) {
                if (color != undefined) {
                    this.select.pad1 = color === 'white' ? true : false;
                    this.select.pad2 = color === 'yellow' ? true : false;
                    this.select.pad3 = color === 'blue' ? true : false;
                    this.select.pad4 = color === 'red' ? true : false;
                    this.select.pad5 = color === 'green' ? true : false;

                    this.option.paddleColor = color;
                }
            },
    
            startGame() {
                this.$emit('optionChoice', { optionChoice: this.option as Option});
            },
    
            resetOption() {
                this.option.paddleColor = 'white';
                this.option.maxScore = 10;
                this.option.colorFond = 'default';
            },

            startOption() {
                this.defaultConfig = false;
            }
        },
    
        mounted() {
            this.resetOption();
            this.select.score1 = true;
            this.select.fond1 = true;
            this.select.pad1 = true;
        }
        
    })
</script>
    
    
<style scoped>
    
#setup {
    margin-top: 5em;
}
    
p {
    position: relative;
    text-align: center;
    font-style: normal;
    font-weight: bold;
    font-size: 2em;
    margin-bottom: 0.3em;
    letter-spacing: 0.2em;
    color: black;
}
    
button {
    border: none;
}
.fond, .score, .color, .start, .startoptions {
    display: flex;
    justify-content: center;
}
.selected {
    background-color: #A9DFBF;
}
.notselected {
    background-color: #808B96;
}
.score button:hover {
    background-color: #A9DFBF;
}
.score button {
    margin-left: 2%;
    margin-right: 2%;
    padding: 1%;
    font-size: 1em;
    color: white;
    transition-duration: 0.4s;
}
.color button {
    border-radius: 5px;
    padding: 1em;
    margin-left: 1%;
    margin-right: 1%;
}
.fond button {
    border-radius: 5px;
    padding: 1em;
    margin-left: 1%;
    margin-right: 1%;
}
.color button:hover {
    transform: scale(1.05) perspective(1px)
}
.fond button:hover {
    transform: scale(1.05) perspective(1px)
}
.yellow {
    background-color: #D4AC0D;
}
.blue {
    background-color: blue;
}
.red {
    background-color: red;
}
.green {
    background-color: green;
}
.white {
    background-color: #FDFEFE;
}
.black {
    background-color: black;
}
.grey {
    background-color: grey;
}
.orange {
    background-color: orange;
}
.start {
    position: relative;
    top: 50px;
}
.start button {
    color: #FFFFFF;
    background-color: green;
    border-radius: 10px;
    padding: 14px 40px;
    font-size: 1.5em;
    cursor: pointer;
}
.startoptions button {
    color: #FFFFFF;
    background-color: orangered;
    border-radius: 10px;
    padding: 14px 40px;
    font-size: 1.5em;
    margin-top: 100px;
    cursor: pointer;
}
    
</style>
