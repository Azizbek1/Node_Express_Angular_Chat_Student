app.controller("indexController", [ '$scope','indexFactory', 'configFactory',($scope,indexFactory, configFactory)  => {
    // Assosiy proyektimizdagi kodlarni shu yerda yozamiz
    // bu yerda Client tarafindan ko'rinadigan qismi

    $scope.messages = [];
    $scope.players = {};

    $scope.init = () => {
      const username = prompt("Iltimos Ismingizni Kiriting !!!");
      if (username) {
        initScoket(username);
      } else {
        return false;
      }
    };

    function scrollTop() {
      setTimeout(() => {
        const elee = document.querySelector("#chat-area");
        elee.scrollTop = elee.scrollHeight;
      }, 1000);
    }

   async function initScoket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600,
      };

      const socketUrl = await configFactory.getConfig()
      // console.log(socketUrl.data.socketUrl);
      indexFactory
        .connectSocket(socketUrl.data.socketUrl, connectionOptions)
        .then((socket) => {
          socket.emit("newUser", { username });

          socket.on("initPlayers", (players) => {
            $scope.players = players;
            $scope.$apply(); // amalni bekenda bajaradi frontda bajarmidi
          });

          socket.on("newUser", (data) => {
            const messageData = {
              type: {
                code: 0, // server or user message
                message: 1, // login or disconnect
              },
              username: data.username,
            };

            $scope.messages.push(messageData); // clinyetga yuboramiz
            $scope.players[data.id] = data;
            // console.log($scope.players[data.id]);
            scrollTop();
            $scope.$apply();
          });

          socket.on("disUser", (user) => {
            // console.log(user);
            const messageData = {
              type: {
                code: 0, // server or user message
                message: 0, // login or disconnect
              },
              username: user.username,
            };

            $scope.messages.push(messageData); // clinyetga yuboramiz
            delete $scope.players[user.id];
            scrollTop();
            $scope.$apply();
          });

          socket.on("animate", (data) => {
            // console.log(data);
            $("#" + data.socketId).animate(
              { left: data.x, top: data.y },
              () => {
                animate = false;
              }
            );
          });

          //================      message qarshilimiz serverdan kelgan message    ============================
          socket.on("newMessage", (message) => {
            $scope.messages.push(message); // bizning yozgan hatlarimiz
            scrollTop();
            $scope.$apply();
            // scrollTop();
          });

          // ====================================================================
          let animate = false;
          $scope.onClickPlayer = ($event) => {
            if (!animate) {
              let x = $event.offsetX;
              let y = $event.offsetY;

              socket.emit("animate", { x, y }); // Jo'natamiz

              animate = true;
              $("#" + socket.id).animate({ left: x, top: y }, () => {
                animate = false;
              });
            }
            console.log($event.offsetX, $event.offsetY);

            // $('#' + socket.id).animate( { 'left' : $event.offsetX, 'top': $event.offsetY } )
          };

          $scope.newMessage = () => {
            let message = $scope.message;
            const messageData = {
              type: {
                code: 1,
              },
              username: username,
              text: message,
            };
            $scope.messages.push(messageData); // bizning yozgan hatlarimiz
            $scope.message = "";

            socket.emit("newMessage", messageData);
            scrollTop();
          };
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
]);
