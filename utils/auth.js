let DB = require("utils/db");
let mqtt = require("utils/mqtt");


var loginedusers = {};


function register(params) {
    var db = DB.getDB();
    var collection = db.collection('auth_user');
    return collection.findOne({ _id: params.userid }).then((doc) => {
        if (!doc) {
            return collection.insertOne({ _id: params.userid, password: params.password, score: 10, sharescore: 10 }).then(() => {
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
                data.password = '******';
                //去掉以前的登录信息
                let lastuserid = getUserIdByClientId(clientid);
                while (lastuserid) {
                    delete loginedusers[lastuserid];
                    lastuserid = getUserIdByClientId(clientid);
                }
                loginedusers[param.userid] = clientid;
                mqtt.setLogined(clientid, true);
                var point = data.sharepoint;
                point = point ? point : 0;
                let level = point / 1000 + 1;
                let sharelevel = point / 1000 + 1;
                let ret = {
                    userid: data._id,
                    username: data.name,
                    level: level,
                    sharelevel: sharelevel
                }
                resolve({ success: true, code: 200, msg: "登录成功!", data: ret });
            } else {
                resolve({ success: false, code: 401, msg: "登录失败!用户名或密码错误!" });
            }
        }).catch((err) => reject(err))
    });
});
mqtt.regMqttFuncs("auth/logout", (param, clientid) => {
    return new Promise((resolve, reject) => {
        //TODO 登录
        delete loginedusers[param.userid];
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

mqtt.regMqttFuncs("auth/accountinfo", (param, clientid) => {
    return new Promise((resolve, reject) => {
        //TODO 登录
        let user = getUserIdByClientId(clientid);
        resolve({ success: true, msg: "查询成功!", data: user });
    });
});


mqtt.regMqttFuncs("auth/checklogin", (param, clientid) => {
    return new Promise((resolve, reject) => {
        resolve({ success: true, msg: "已登录!" });
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