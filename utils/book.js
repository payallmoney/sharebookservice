let DB = require("utils/db.js");
let mqtt = require("utils/mqtt");
let auth = require("utils/auth")
module.exports = {
    share: share
};


function share(params, clientid) {
    var db = DB.getDB();
    var userid = auth.getUserIdByClientId(clientid);
    var collection = db.collection('books');
    return collection.insertOne(params).then((doc) => {
        db.collection('auth_user').findOneAndUpdate({ _id: userid }, { $inc: { point: 100, level: 1, sharelevel: 1 } });
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
                    resolve({ success: true, msg: "查询成功!", books: docs });
                }
            }
        );

    });
});

mqtt.regMqttFuncs("search", (param, clientid) => {
    var userid = auth.getUserIdByClientId(clientid);
    return new Promise((resolve, reject) => {
        console.log(param);
        var db = DB.getDB();
        var collection = db.collection('books');
        var searchs = db.collection('searchs');
        var searchlog = db.collection('searchlog');
        var item = { _id: param.text, num: 1 }
        searchlog.findOneAndUpdate({ text: param.text, userid: userid }, { $set: { searchtime: new Date() } }, { upsert: true });
        //searchs.findOneAndUpdate({ _id: param.text }, { $inc: { "num": 1 } }, { upsert: true });
        var pagesize = param.page;
        var skip = (pagesize - 1) * 10;
        var textregex = new RegExp(param.text, "i");
        collection.find({ $or: [{ title: textregex }, { author: textregex }] }, { skip: skip, limit: 10 }).toArray(
            (err, docs) => {
                if (err) {
                    reject({ success: true, msg: "查询错误!请稍后再试!", err: err });
                } else {
                    console.log("docs[0]", docs[0]);
                    if (docs[0]) {
                        collection.findOneAndUpdate({ _id: docs[0]._id }, { $inc: { "searchnum": 1 } }, { upsert: true });
                    }
                    resolve({ success: true, msg: "查询成功!", books: docs });
                }
            }
        );
    });
});

mqtt.regMqttFuncs("popularsearch", (param, clientid) => {
    return new Promise((resolve, reject) => {
        console.log("====popularsearch=====", param);
        var db = DB.getDB();
        var collection = db.collection('books');
        collection.find().sort({ searchnum: -1 }).limit(3).toArray(
            (err, docs) => {
                if (err) {
                    reject({ success: true, msg: "查询错误!请稍后再试!", err: err });
                } else {
                    console.log("limit 3 docs", docs)
                    resolve({ success: true, msg: "查询成功!", books: docs });
                }
            }
        );
    });
});

mqtt.regMqttFuncs("lastsearchs", (param, clientid) => {
    var userid = auth.getUserIdByClientId(clientid);
    return new Promise((resolve, reject) => {
        console.log("====popularsearch=====", param);
        var db = DB.getDB();
        var collection = db.collection('searchlog');
        collection.find({ userid: userid }).sort({ searchtime: -1 }).limit(5).toArray(
            (err, docs) => {
                if (err) {
                    reject({ success: true, msg: "查询错误!请稍后再试!", err: err });
                } else {
                    console.log("limit 5 docs", docs)
                    resolve({ success: true, msg: "查询成功!", searchs: docs });
                }
            }
        );
    });
});

mqtt.regMqttFuncs("focus", (param, clientid) => {
    var userid = auth.getUserIdByClientId(clientid);
    return new Promise((resolve, reject) => {
        console.log("====popularsearch=====", param);
        var db = DB.getDB();
        var collection = db.collection('focus');
        collection.findOneAndUpdate({ userid: userid, bookid: param._id }, { $set: { focustime: new Date() } }, { upsert: true });
        resolve({ success: true, msg: "关注成功!" });
    });
});

mqtt.regMqttFuncs("borrow", (param, clientid) => {
    var userid = auth.getUserIdByClientId(clientid);
    return new Promise((resolve, reject) => {
        console.log("====popularsearch=====", param);
        var db = DB.getDB();
        var collection = db.collection('borrow');
        collection.findOneAndUpdate({ userid: userid, bookid: param._id }, { $set: { focustime: new Date() } }, { upsert: true });
        resolve({ success: true, msg: "借书成功!" });
    });
});