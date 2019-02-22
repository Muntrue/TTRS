Vue.component("lobby", {
    props: {
        socket: null,
        roomId: null,
        gamestate: null
    },
    data: function () {
        return {
            count: 0
        };
    },
    methods: {
        readyUp: function () {
            this.socket.emit("setPlayerReady");
        },
        startGame: function(){
            this.socket.emit("startGame");
        }
    },
    template: `<div id="lobby">
        <div>
            <h1>TTRS</h1>
            
            <div v-if="gamestate.players">
                <div v-for="player in gamestate.players" class="mt-4">
                    {{ player.name }}
                  
                    <span class="badge" v-bind:class="{'badge-danger' : !player.ready, 'badge-success' : player.ready}"><span v-if="!player.ready">not</span> ready</span>
                </div>
                
                <button type="button" class="btn btn-primary mt-4" @click="readyUp">Ready</button>
                <button v-if="gamestate.players[Object.keys(gamestate.players)[0]].ready && gamestate.players[Object.keys(gamestate.players)[1]].ready" 
                        type="button" 
                        class="btn btn-primary mt-4" 
                        @click="startGame">Start</button>
                        
                        <button 
                        type="button" 
                        class="btn btn-primary mt-4" 
                        @click="startGame">Start</button>
            </div>
        </div>
</div>`
});