class Api {
    constructor() {
        this.basePath = "https://warm-plateau-84344.herokuapp.com/";
        this.loginNeeded = new Event("loginNeeded");
        this.token = getCookie("token");;
        this.refreshToken = getCookie("refreshToken");;
    }

    async GetIsAuthorized() {
        if (this.token) {
            console.log("token valid: " + (await this.ValidateToken()).message);
        }
        else {
            return false;
        }
    }

    async GetResponse(method, url, data = null) {
        var requestUrl = this.basePath + url;
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, requestUrl);
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            if (data != null) {
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                if (this.token) {
                    xhr.setRequestHeader("Authorization", "bearer " + this.token);
                }
                xhr.send(JSON.stringify(data));
            }
            else {
                xhr.send();
            }
        });
    }

    async GetUserLists() {
        var path = "user/lists";
        return await this.GetResponse("GET", path);
    }

    async ValidateToken() {
        var path = "token/validate";
        return JSON.parse(await this.GetResponse("GET", path));
    }

    async Login(emailOrUsername, password) {
        var data = null;

        if (emailOrUsername.includes("@")) {
            data = { email: emailOrUsername, username: "", password: password };
        }
        else {
            data = { email: "", username: emailOrUsername, password: password };
        }

        var path = "user/token";
        return JSON.parse(await this.GetResponse("POST", path, data))
    }
}