class Api {
    constructor() {
        this.basePath = "https://lucidchat.herokuapp.com/";
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
                xhr.send(JSON.stringify(data));
            }
            else {
                xhr.send();
            }
        });
    }

    async CleanDatabase() {
        var path = "database/clean";
        return await this.GetResponse("POST", path);
    }

    async CreateChat(alphaId, betaId) {
        var path = "chat/create";
        return await this.GetResponse("POST", path, { alphaId, betaId });
    }

    async UserTyping(chatId, userId) {
        var path = "chat/usertyping";
        return await this.GetResponse("POST", path, { chatId, userId });
    }

    async SendMessage(chatId, userId, message) {
        var path = "chat/sendMessage";
        return await this.GetResponse("POST", path, { chatId, userId, message });
    }

    async GetChat(chatId) {
        var path = "chat/get?id=" + chatId;
        return await this.GetResponse("GET", path);
    }

    async GetUserChats(userId) {
        var path = "users/chats?userId=" + userId;
        return await this.GetResponse("GET", path);
    }

    async CreateUser(username) {
        var path = "users/create";
        return await this.GetResponse("POST", path, { username });
    }

    async UserHeartBeat(userId) {
        var path = "users/heartbeat";
        return await this.GetResponse("POST", path, { userId });
    }

    async GetUsers() {
        var path = "users/get";
        return await this.GetResponse("GET", path);
    }

    async GetUserInfo(id) {
        var path = "users/getuser?id=" + id;
        return await this.GetResponse("GET", path);
    }
}