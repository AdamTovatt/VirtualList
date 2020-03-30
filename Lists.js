var api = new Api();

window.onload = async function () {
    api = new Api();
    api.addEventListener("loginNeeded", function (e) { console.log("login needed"); }, false);
    await api.GetIsAuthorized();
}