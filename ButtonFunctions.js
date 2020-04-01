function ShowLogin() {
    HideAllScreens();
    screen_Login.style.display = "block";
}

async function LoginButton() {
    HideAllScreens(true);
    var loginResponse = await api.Login(document.getElementById("UsernameInput").value, document.getElementById("PasswordInput").value);

    if (loginResponse.success) {
        setCookie("token", loginResponse.token);
        setCookie("tokenDate", Date.now());
        setCookie("refreshToken", loginResponse.refreshToken);
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

async function GoToStartPage() {
    GoToUserPage();
}

async function OpenList(listId) {
    GoToListPage(listId);
}