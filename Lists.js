var api = null;

var screen_Start = null;
var screen_Login = null;
var screen_Register = null;
var screen_UserStartPage = null;

window.onload = async function () {
    screen_Start = document.getElementById("Screen_Start");
    screen_Login = document.getElementById("Screen_Login");
    screen_Register = document.getElementById("Screen_Register");
    screen_UserStartPage = document.getElementById("Screen_UserStartPage");

    api = new Api();

    if (await api.GetIsAuthorized()) {
        await GoToUserPage();
    }
    else {
        screen_Start.style.display = "block";
    }
}

function HideAllScreens() {
    screen_Start.style.display = "none";
    screen_Login.style.display = "none";
    screen_Register.style.display = "none";
}

async function GoToUserPage() {
    HideAllScreens();

    screen_UserStartPage.style.display = "block";

    var response = await api.GetUserLists();

    if (response.success) {
        var lists = response.message;

        console.log(lists);

        var listTable = document.createElement("table");
        listTable.className = "ListTable";

        for (var i = 0; i < lists.length; i++) {
            var row = listTable.insertRow(-1);
            row.insertCell(-1).innerHTML = '<button class="Button" onclick="OpenNewChat(\'' + "[name]" + '\', \'' + "[id]" + '\')">' + lists[i].listname + '</button>'
        }

        document.getElementById("UserListsContainer").appendChild(listTable);
    }
    else {
        alert("Fel när listor skulle laddas");
    }
}