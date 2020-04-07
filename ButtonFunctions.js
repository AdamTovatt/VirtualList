function ShowLogin() {
    HideAllScreens();
    screen_Login.style.display = "block";
}

async function LoginButton() {
    HideAllScreens(true);
    var loginResponse = await api.Login(document.getElementById("UsernameInput").value, document.getElementById("PasswordInput").value);

    if (loginResponse.success) {
        setCookie("token", loginResponse.token, 100);
        setCookie("tokenDate", Date.now(), 100);
        setCookie("refreshToken", loginResponse.refreshToken, 100);
        api = new Api();
        await GoToUserPage();
    }
    else {
        screen_Login.style.display = "block";
        HideLoading();
        alert(loginResponse.message);
    }
}

async function LogoutButton() {
    setCookie("token", "");
    setCookie("tokenDate", "");
    setCookie("refreshToken", "");
    location.reload();
}

async function GoToLastListPage() {
    GoToListPage(currentList);
}

async function GoToStartPage() {
    GoToUserPage();
}

async function OpenList(listId) {
    GoToListPage(listId);
}

async function AddListItem(listId) {
    HideAllScreens();
    screen_AddItemPage.style.display = "block";
}

async function AddItemToList() {
    var itemHeadline = document.getElementById("ItemHeadlineInput").value;
    var itemDescription = document.getElementById("ItemDescriptionInput").value;

    var result = await api.AddListItem(currentList, itemHeadline, itemDescription);

    if (!result.success)
        alert(result.message);

    GoToListPage(currentList);

    document.getElementById("ItemHeadlineInput").value = "";
    document.getElementById("ItemDescriptionInput").value = "";
}

async function DeleteListItem(listId, itemId) {
    var result = await api.DeleteListItem(listId, itemId);

    if (!result.success)
        alert(result.message);

    GoToListPage(currentList);
}

async function ShowCreateAccount() {
    HideAllScreens();

    screen_Register.style.display = "block";
}

async function CreateAccountButton() {
    var usernameInput = document.getElementById("Register_UsernameInput").value;
    var emailInput = document.getElementById("Register_EmailInput").value;
    var displayNameInput = document.getElementById("Register_DisplayNameInput").value;
    var passwordInput1 = document.getElementById("Register_PasswordInput1").value;
    var passwordInput2 = document.getElementById("Register_PasswordInput2").value;

    if (passwordInput1 != passwordInput2) {
        alert("Passwords don't match");
        document.getElementById("Register_PasswordInput1").value = "";
        document.getElementById("Register_PasswordInput2").value = "";
        return;
    }

    if (!emailInput.includes("@") || !emailInput.includes(".")) {
        alert("That doesn't look like a valid email address");
        return;
    }

    var result = await api.CreateUser(emailInput, usernameInput, displayNameInput, passwordInput2);

    if (!result.success) {
        alert(result.message);
        return;
    }
    else {
        HideAllScreens();

        document.getElementById("Register_UsernameInput").value = "";
        document.getElementById("Register_EmailInput").value = "";
        document.getElementById("Register_PasswordInput1").value = "";
        document.getElementById("Register_PasswordInput2").value = "";
        document.getElementById("Register_DisplayNameInput").value = "";

        screen_Start.style.display = "block";
    }
}

async function SetDisplayName() {
    var di = document.getElementById("Register_DisplayNameInput");

    if (di.value == "") {
        di.value = document.getElementById("Register_UsernameInput").value;
    }
}