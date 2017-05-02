let DB = require("utils/db.js");
module.exports = {
    login: login
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