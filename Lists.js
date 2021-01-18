var api = null;

var screen_Start = null;
var screen_Login = null;
var screen_Register = null;
var screen_UserStartPage = null;
var screen_Loading = null;
var screen_ListPage = null;
var screen_AddItemPage = null;
var screen_SharePage = null;
var screen_AddList = null;

var currentList = null;

window.onload = async function () {
    screen_Start = document.getElementById("Screen_Start");
    screen_Login = document.getElementById("Screen_Login");
    screen_Register = document.getElementById("Screen_Register");
    screen_UserStartPage = document.getElementById("Screen_UserStartPage");
    screen_Loading = document.getElementById("Screen_Loading");
    screen_ListPage = document.getElementById("Screen_ListPage");
    screen_AddItemPage = document.getElementById("Screen_AddItemPage");
    screen_SharePage = document.getElementById("Screen_SharePage");
    screen_AddList = document.getElementById("Screen_AddList");

    screen_Loading.style.display = "block";

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
        HideLoading();
    }
}

function HideAllScreens(showLoading) {
    screen_Start.style.display = "none";
    screen_Login.style.display = "none";
    screen_Register.style.display = "none";
    screen_UserStartPage.style.display = "none";
    screen_ListPage.style.display = "none";
    screen_AddItemPage.style.display = "none";
    screen_SharePage.style.display = "none";
    screen_AddList.style.display = "none";

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

        var cell = listTable.insertRow(-1).insertCell(-1);
        cell.innerHTML = '<button class="ButtonAddListItem" onclick="AddList()">+</button>';
        cell.style.textAlign = "center";
        for (var i = 0; i < lists.length; i++) {
            var row = listTable.insertRow(-1);
            row.insertCell(-1).innerHTML = '<button class="Button" onclick="OpenList(\'' + lists[i].listid + '\')">' + lists[i].listname + '</button>'
        }

        document.getElementById("UserListsContainer").innerHTML = "";
        document.getElementById("UserListsContainer").appendChild(listTable);
        HideLoading();
    }
    else {
        alert("Fel när listor skulle laddas: " + response.message);
    }
}

async function GoToListPage(listId) {
    HideAllScreens(true);

    currentList = listId;

    screen_ListPage.style.display = "block";

    var response = await api.GetListContent(listId);

    if (response.success) {
        var itemTable = document.createElement("table");
        itemTable.className = "ItemTable";

        var listItems = response.message;

        itemTable.insertRow(-1).insertCell(-1).innerHTML = '<div style="width: 100%; text-align: center"><button class="ButtonAddListItem" onClick="AddListItem(\'' + listId + '\')">+</button></div>';

        for (var i = 0; i < listItems.length; i++) { //icke raderade
                var itemName = listItems[i].itemName;
                var itemDescription = listItems[i].description;

            var row = itemTable.insertRow(-1);
            if(!listItems[i].deleted)
                row.insertCell(-1).innerHTML = '<div class="ItemBox"><button class="XButton" onClick="DeleteListItem(\'' + listId + '\', \'' + listItems[i].itemId + '\')"> </button><div class="ItemHeadline">' + itemName + '</div><div class="ItemDescription">' + itemDescription + '</div></div>'
            else
                row.insertCell(-1).innerHTML = '<div class="ItemBox ItemDeleted"><button class="XButton"">✓</button><div class="ItemHeadline ItemDeleted">' + itemName + '</div><div class="ItemDescription ItemDeleted">' + itemDescription + '</div></div>'
        }

        var container = document.getElementById("ListItemContainer");
        container.innerHTML = "";

        container.appendChild(itemTable);

        HideLoading();
    }
    else {
        alert("Fel när lista skulle laddas: " + response.message);

        HideLoading();
        screen_UserStartPage.style.display = "block";
    }
}