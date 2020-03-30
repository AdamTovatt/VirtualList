var screen_CreateUser = null;
var screen_Chat = null;

var chatInputArea = null;
var chatInputBox = null;

var api = null;
var userId = null;

var currentChat = null;

var chats = [];
var knownAuthors = [];

var justSent = false;
var sentBubbles = [];

var usersScreenActive = false;
var lastTypeSend = new Date();

window.onload = async function () {
    screen_CreateUser = document.getElementById("Screen_CreateUser");
    screen_Chat = document.getElementById("Screen_Chat");
    this.chatInputArea = this.document.getElementById("ChatInputArea");
    this.chatInputBox = this.document.getElementById("ChatTextInput");

    screen_CreateUser.style.display = "block";

    api = new Api();
    await api.CleanDatabase();

    this.document.getElementById("ChatTextInput").addEventListener("keydown", function (event) {
        if (!event.shiftKey) {
            if (event.keyCode === 13) {
                event.preventDefault();
                SendChat();
            }
        }
    });

    var oldUserId = getCookie("userId");
    if (oldUserId) {
        userId = oldUserId;

        screen_CreateUser.style.display = "none";
        OpenUsersTab();
        GetUserChats();
    }

    this.setInterval(this.GetUserChats, 5500);
    this.setInterval(this.LoadCurrentChatTick, 2000);
    this.setInterval(this.UserHeartBeat, 60000);
    this.setInterval(this.RefreshUsersTick, 11000);
}

async function EnterChat(username) {
    //var response = { success: true, id: 19, message: "ok" };
    var response = JSON.parse(await api.CreateUser(username));
    if (!response["success"]) {
        if (response.message["code"] == 23505) {
            alert("Det namnet är upptaget just nu");
            return;
        }
        else {
            alert("Okänt fel, försök igen");
            return;
        }
    }

    userId = response["id"];

    setCookie("userId", userId, 2);

    OpenUsersTab();
    GetUserChats();
}

async function LoadUsers() {
    var users = JSON.parse(await api.GetUsers());

    if (users["success"]) {
        var userList = document.getElementById("UserList");
        userList.innerHTML = "";
        var table = document.createElement("table");
        table.className = "UserList";

        activeUsers = [];

        for (var i = 0; i < users.message.length; i++) {
            users.message[i].minutesAfk = ((new Date()) - new Date(users.message[i].lastactive)) / (1000 * 60);
            if (users.message[i].minutesAfk < 30)
                activeUsers.push(users.message[i]);
        }

        activeUsers.sort((a, b) => a.minutesAfk - b.minutesAfk);

        for (var i = 0; i < activeUsers.length; i++) {
            console.log(activeUsers[i].minutesAfk < 30);
            var tr = table.insertRow(-1);
            var name = activeUsers[i].username;
            var id = activeUsers[i].id;
            if (id != userId)
                tr.insertCell(-1).innerHTML = '<button class="Button" onclick="OpenNewChat(\'' + name + '\', \'' + id + '\')">' + name + '</button>';
        }

        userList.appendChild(table);

        screen_CreateUser.style.display = "none";
        screen_Chat.style.display = "block";
    }
    else {
        alert("Okänt fel när användare skulle hämtas");
    }
}

async function OpenNewChat(betaName, betaId) {
    var existingChat = null;
    for (var i = 0; i < chats.length; i++) {
        if (chats[i]["betaId"] == betaId)
            existingChat = chats[i];
    }
    if (existingChat == null) {
        var createChatResponse = JSON.parse(await api.CreateChat(userId, betaId));
        if (!createChatResponse["success"]) {
            alert("Okänt fel när chatt skulle skapas");
            return;
        }

        existingChat = { id: createChatResponse["id"], betaId, betaName };

        chats.push(existingChat);

        AddChatButton(existingChat);
    }

    setTimeout(function () { OpenChatTab(existingChat.id); }, 100);
}

function AddChatButton(chat) {
    var button = document.createElement("button");
    button.className = "TabButton";
    var id = chat.id;
    button.onclick = function () { OpenChatTab(id) };
    button.innerHTML = chat.betaName;
    button.id = "button_" + chat.id;

    document.getElementById("TabButtons").appendChild(button);

    var div = document.createElement("div");
    div.className = "TabContent";
    //div.innerHTML = "En chatt med " + chat.betaName;
    div.id = "chat_" + chat.id;

    var chatTable = document.createElement("table");
    chatTable.id = "chatTable_" + chat.id;
    chatTable.className = "ChatTable";
    div.appendChild(chatTable);

    screen_Chat.appendChild(div);
    div.innerHTML += '<div id="chatTyping_' + chat.id + '" class="lds-grid"><div></div><div></div><div></div>';
    div.innerHTML += '<div style="height: 8em"></div>'

    var chat = GetChatById(chat.id);
    if (chat)
        chat.added = true;
}

function GetChatById(id) {
    for (var i = 0; i < chats.length; i++) {
        if (chats[i].id == id)
            return chats[i];
    }
    return null;
}

async function GetUserChats() {
    var response = JSON.parse(await api.GetUserChats(userId));
    if (response["success"]) {
        for (var i = 0; i < response["message"].length; i++) {
            var chat = response["message"][i];
            var existingChat = GetChatById(chat["id"]);
            if (existingChat && existingChat.added)
                continue;
            var otherId = chat["alphaid"] == userId ? chat["betaid"] : chat["alphaid"];
            var otherName = await GetAuthorName(otherId);
            otherName = await GetAuthorName(otherId);
            var newChat = { id: chat["id"], betaId: otherId, betaName: otherName };
            chats.push(newChat);
            AddChatButton(newChat);
        };
    }
}

function AddSingleMessage(ownMessage, messageText, currentChatTable, animate) {
    var bubble = document.createElement("div");
    bubble.className = ownMessage ? "OwnMessage" : "OtherMessage";
    bubble.innerHTML = messageText;

    var row = currentChatTable.insertRow(-1);
    row.insertCell(-1).appendChild(bubble);

    if (animate) {
        bubble.style = "animation: scaleUp 0.2s; animation-timing-function: cubic-bezier(0.1, 0.1, 0.1, 1.0);";
    }

    return row;
}

async function LoadCurrentChat() {
    var chatResponse = JSON.parse(await api.GetChat(currentChat));

    var chatObject = GetChatById(currentChat); //hämtar den sparade chatten från minnet
    if (!chatObject.lastMessageId) //förbered id för sista medelandet som har ritats ut
        chatObject.lastMessageId = 0;
    if (!chatObject.lastLength)
        chatObject.lastLength = 0; //förbered längd som det var sist vi kollade

    if (chatResponse["success"]) {
        var currentChatTable = document.getElementById("chatTable_" + currentChat);
        var currentTypingIcon = document.getElementById("chatTyping_" + currentChat);

        var typing = chatResponse.message.metadata.alphaid == userId ? chatResponse.message.metadata.betatyping : chatResponse.message.metadata.alphatyping;
        if (typing != null) {
            var msSinceTyping = new Date() - new Date(typing);
            if (msSinceTyping > 3500) {
                var delay = chatObject.lastLength == 0 ? 0 : 500;
                this.setTimeout(function () { currentTypingIcon.className = "lds-grid-hidden"; }, delay);
                currentTypingIcon.style.animation = "fadeOut 0.3s linear forwards";
            }
            else {
                currentTypingIcon.className = "lds-grid";
                currentTypingIcon.style.animation = "fadeIn 0.3s linear forwards";
            }
        }
        else {
            this.setTimeout(function () { currentTypingIcon.className = "lds-grid-hidden"; }, delay);
        }

        for (var i = 0; i < sentBubbles.length; i++) {
            document.getElementById("chatTable_" + sentBubbles[i].chatId).deleteRow(sentBubbles[i].rowObject.rowIndex);
        }
        sentBubbles = [];

        if (chatResponse["message"]["messages"].length > 0) {//&& chatResponse["message"]["messages"].length > chatObject.lastLength) {
            var betaName = null;
            for (var i = 0; i < chatResponse["message"]["messages"].length; i++) { //för att hitta namnet på andra personen
                if (chatResponse["message"]["messages"][i]["authorid"] != userId) {
                    betaName = await GetAuthorName(chatResponse["message"]["messages"][i]["authorid"]);
                    break;
                }
            }

            for (var i = 0; i < chatResponse["message"]["messages"].length; i++) {
                var message = chatResponse["message"]["messages"][i];
                if (message.id > chatObject.lastMessageId) {
                    var ownMessage = message["authorid"] == userId;
                    var messageAuthor = ownMessage ? "Du" : betaName; //"Du" används här så att det alltid står det på ens egna medelanden
                    var messageText = message["textcontent"];
                    var messageTime = message["senttime"];

                    AddSingleMessage(ownMessage, messageText, currentChatTable, false);

                    chatObject.lastMessageId = message.id;
                }
                else {
                }
            }

            chatObject.lastLength = chatResponse["message"]["messages"].length; //uppdaterar den senaste längden
        }
    }
}

async function GetAuthorName(id) {
    for (var i = 0; i < knownAuthors.length; i++) {
        if (knownAuthors[i].id == id) {
            return knownAuthors[i].name;
        }
    }
    var response = JSON.parse(await api.GetUserInfo(id));
    if (response["success"]) {
        knownAuthors.push({ name: response["message"]["username"], id: id });
    }
}

async function LoadCurrentChatTick() {
    if (currentChat) {
        if (justSent) {
            justSent = false;
            setTimeout(function () { LoadCurrentChat(); }, 500);
        }
        else {
            LoadCurrentChat();
        }
    }
}

async function RefreshUsersTick() {
    if (usersScreenActive) {
        LoadUsers();
    }
}