class Client {

    constructor() {
        this.initVue();

    }

    initVue() {
        new Vue({
            el: "#app",

            data: {
                serverAddress: "http://127.0.0.1:3000",
                socket: null,
                sessionId: null,
                room: "",
                showLobby: false,
                gameState: {},
                blockDimensions: 30,
            },
            created: function () {
                this.room = this.randomRoom;

            },
            computed: {
                rowWidth: function(){
                  return this.gameState.grid ? (this.gameState.grid[0].length * this.blockDimensions + 2) : 0;
                },
                randomRoom: {
                    get: function () {
                        let text       = "";
                        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

                        for (let i = 0; i < 5; i++) {
                            text += possible.charAt(Math.floor(Math.random() * possible.length));
                        }

                        return text;
                    },
                    set: function (value) {
                        this.room = value;
                    }
                }
            },
            methods: {

                /**
                 * Connect socket
                 */
                connect() {
                    const params = [
                        "room=" + this.room
                    ];

                    this.socket = io(this.serverAddress + "?" + params.join("&"));
                    this.eventListeners();

                    this.showLobby = true;
                },

                /**
                 * Socket event listeners
                 */
                eventListeners() {

                    this.socket.on("receiveSessionId", (msg) => {
                        this.sessionId = msg;
                        console.table(this.grid);
                    });

                    this.socket.on("receiveGamestate", (msg) => {
                        this.gameState = msg;
                        console.table(this.gameState.grid);
                    });
                }
            }
        });
    }
}