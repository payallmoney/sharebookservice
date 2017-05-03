let DB = require("utils/db.js");
let mqtt = require("utils/mqtt");
let auth = require("utils/auth")
module.exports = {
    share: share
};


function share(params) {
    var db = DB.getDB();
    var collection = db.collection('books');
    return collection.insertOne(params).then((doc) => {
        return { success: true, msg: "分享成功!" };
    });
}
mqtt.regMqttFuncs("auth/share", (param, clientid) => {
    //分享
    var userid = auth.getUserIdByClientId(clientid);
    param.userid = userid;
    //const params = { userid: userid, bookinfo: param };
    return share(param)
});

mqtt.regMqttFuncs("booklist", (param, clientid) => {
    return new Promise((resolve, reject) => {
        console.log(param);
        var db = DB.getDB();
        var collection = db.collection('books');
        var pagesize = param.page;
        var skip = (pagesize - 1) * 10;
        collection.find({}, { skip: skip, limit: 10 }).toArray(
            (err, docs) => {
                if (err) {
                    reject({ success: true, msg: "查询错误!请稍后再试!", err: err });
                } else {
                    resolve({ success: true, msg: "查询成功!", booklist: docs });
                }
            }
        );

    });
});