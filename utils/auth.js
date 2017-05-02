let DB = require("utils/db.js");
module.exports = {
    login: login,
    register: register
};

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