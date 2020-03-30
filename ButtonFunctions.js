function OpenUsersTab() {
    usersScreenActive = true;
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("TabContent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("ActiveTabButton");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className = "TabButton";
    }

    document.getElementById("UserList").style.display = "block";
    document.getElementById("UserListButton").className = "ActiveTabButton";

    chatInputArea.style.display = "none";

    LoadUsers();
}

function OpenChatTab(chatId) {
    usersScreenActive = false;
    var tabcontent = document.getElementsByClassName("TabContent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    var tablinks = document.getElementsByClassName("ActiveTabButton");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className = "TabButton";
    }

    document.getElementById("chat_" + chatId).style.display = "block";
    document.getElementById("button_" + chatId).className = "ActiveTabButton";

    chatInputArea.style.display = "block";
    chatInputBox.value = "";
    currentChat = chatId;
    LoadCurrentChat();
}

function SubmitName() {
    var inputBox = document.getElementById("UsernameInput");
    var value = inputBox.value.trim();
    var regexp = new RegExp("^(?=.*[a-zA-Z])[a-zA-Z0-9]+$");
    if (value.length < 2) {
        alert("Ditt namn måste vara minst två tecken långt");
        return;
    }
    if (value.length > 16) {
        alert("Ditt namn får inte vara mer än 16 tecken långt");
        return;
    }
    if (regexp.test(value)) {
        EnterChat(value);
    }
    else {
        alert("Ditt namn får inte innehålla specialtecken");
        return;
    }
}

async function SendChat() {
    console.log(chatInputBox.value.length);
    if (chatInputBox.value.length > 0) {
        var response = JSON.parse(await api.SendMessage(currentChat, userId, chatInputBox.value));
        if (!response["success"]) {
            alert("Kunde inte skicka medelande");
            return;
        }
        else {
            var text = chatInputBox.value;
            chatInputBox.value = "";

            var row = AddSingleMessage(true, text, document.getElementById("chatTable_" + currentChat), true);
            sentBubbles.push({ chatId: currentChat, rowObject: row } );
            justSent = true;
        }
    }
}

async function UserTyped() {
    var time = new Date() - lastTypeSend;
    if (time > 1000 * 3) {
        lastTypeSend = new Date();
        await api.UserTyping(currentChat, userId);
    }
}