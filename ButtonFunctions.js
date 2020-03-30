function ShowLogin() {
    HideAllScreens();
    screen_Login.style.display = "block";
}

async function LoginButton() {
    var loginResponse = await api.Login(document.getElementById("UsernameInput").value, document.getElementById("PasswordInput").value);

    if (loginResponse.success) {
        setCookie("token", loginResponse.token);
        setCookie("tokenDate", Date.now());
        setCookie("refreshToken", loginResponse.refreshToken);
    }
    else {
        alert(loginResponse.message);
    }

    GoToUserPage();
}