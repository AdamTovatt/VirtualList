var api = null;

var screen_Start = null;
var screen_Login = null;
var screen_Register = null;
var screen_UserStartPage = null;
var screen_Loading = null;

window.onload = async function () {
    screen_Start = document.getElementById("Screen_Start");
    screen_Login = document.getElementById("Screen_Login");
    screen_Register = document.getElementById("Screen_Register");
    screen_UserStartPage = document.getElementById("Screen_UserStartPage");
    screen_Loading = document.getElementById("Screen_Loading");

    this.document.getElementById("LoginButton").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            if (screen_Login.style.display == "block") {
                event.preventDefault();
                LoginButton();
            }
        }
    }); 

    api = new Api();

    if (await api.GetIsAuthorized()) {
        await GoToUserPage();
    }
    else {
        screen_Start.style.display = "block";
    }
}

function HideAllScreens(showLoading) {
    screen_Start.style.display = "none";
    screen_Login.style.display = "none";
    screen_Register.style.display = "none";
    if (showLoading) {
        screen_Loading.style.display = "block";
    }
}

function HideLoading() {
    screen_Loading.style.display = "none";
}

async function GoToUserPage() {
    HideAllScreens(true);

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
        HideLoading();
    }
    else {
        alert("Fel när listor skulle laddas");
    }
}