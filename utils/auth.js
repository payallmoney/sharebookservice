let DB = require("utils/db");
let mqtt = require("utils/mqtt");


var loginedusers = {};


function register(params) {
    var db = DB.getDB();
    var collection = db.collection('auth_user');
    return collection.findOne({ _id: params.userid }).then((doc) => {
        if (!doc) {
            return collection.insertOne({ _id: params.userid, password: params.password }).then(() => {
                return { success: true, msg: "注册成功!" };
            })
        } else {
            return { success: false, msg: "用户名已经存在!" }
        }
    });
}

function share(params) {
    var db = DB.getDB();
    var collection = db.collection('books');
    return collection.insertOne({ userid: params.userid, bookinfo: params.bookinfo }).then((doc) => {
        return { success: true, msg: "分享成功!" };
    });
}

mqtt.regMqttFuncs("login", (param, clientid) => {
    return new Promise((resolve, reject) => {
        //TODO 登录
        login(param).then((data) => {
            console.log(data);
            if (data) {
                loginedusers[param.loginid] = clientid;
                mqtt.setLogined(clientid, true);
                resolve({ success: true, code: 200, msg: "登录成功!" });
            } else {
                resolve({ success: false, code: 401, msg: "登录失败!用户名或密码错误!" });
            }
        }).catch((err) => reject(err))
    });
});
mqtt.regMqttFuncs("auth/logout", (param, clientid) => {
    return new Promise((resolve, reject) => {
        //TODO 登录
        delete loginedusers[param.loginid];
        mqtt.setLogined(clientid, false);;
        resolve(true);
    });
});


mqtt.regMqttFuncs("register", (param, clientid) => {
    return new Promise((resolve, reject) => {
        //TODO 登录
        register(param).then((data) => {
            console.log(data);
            if (data) {
                resolve({ success: true, code: 200, msg: "注册成功!" });
            } else {
                resolve({ success: false, code: 401, msg: "登录失败!用户名或密码错误!" });
            }
        }).catch((err) => reject(err))
    });
});


module.exports = {
    login: login,
    register: register,
    getUserIdByClientId: getUserIdByClientId
};

function getUserIdByClientId(clientid) {
    var users = Object.keys(loginedusers);
    for (var i = 0; i < users.length; i++) {
        var cid = loginedusers[users[i]];
        if (cid === clientid) {
            return users[i]
        }
    }
    return null;
}

function login(params) {
    var db = DB.getDB();
    console.log("params===", params)
    return new Promise((resolve, reject) => {
        var collection = db.collection('auth_user');
        return collection.findOne({ _id: params.userid, password: params.password }).then((doc) => {
            resolve(doc);
        }).catch((err) => { reject(err) });
    });
}