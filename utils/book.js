let DB = require("utils/db.js");
let mqtt = require("utils/mqtt");
let auth = require("utils/auth");
let moment = require('moment');
let ObjectID = require('mongodb').ObjectID;
// let zhcn = require('moment/locale/zh-cn.js');
module.exports = {
    share: share
};

//
function share(params, clientid) {
    var db = DB.getDB();
    var userid = auth.getUserIdByClientId(clientid);
    console.log("userid==", userid);
    var collection = db.collection('books');
    //根据时区减去16小时后记录的时间和当前时间一致
    params.sharedate = new Date();

    return collection.insertOne(params).then((doc) => {
        db.collection('auth_user').findOneAndUpdate({ _id: userid }, { $inc: { sharepoint: 100 } });
        return { success: true, msg: "分享成功!" };
    });
}

mqtt.regMqttFuncs("auth/share", (param, clientid) => {
    //分享
    var userid = auth.getUserIdByClientId(clientid);
    param.userid = userid;
    //const params = { userid: userid, bookinfo: param };
    return share(param, clientid)
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
mqtt.regMqttFuncs("auth/sharelist", (param, clientid) => {
    return new Promise((resolve, reject) => {
        let userid = auth.getUserIdByClientId(clientid);
        var db = DB.getDB();
        var collection = db.collection('books');
        var pagesize = param.page;
        var skip = (pagesize - 1) * 10;
        console.log(userid);
        collection.find({ $query: { userid: userid }, $orderby: { sharedate: -1 } }, { skip: skip, limit: 10 }).toArray(
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

mqtt.regMqttFuncs("auth/borrowhistory", (param, clientid) => {
    return new Promise((resolve, reject) => {
        let userid = auth.getUserIdByClientId(clientid);
        var db = DB.getDB();
        var collection = db.collection('borrow');
        var pagesize = param.page;
        var skip = (pagesize - 1) * 10;
        console.log(userid);
        collection.aggregate(
            [{
                    $match: {
                        userid: userid
                    }
                },
                {
                    $lookup: {
                        from: "books",
                        localField: "bookid",
                        foreignField: "_id",
                        as: "book"
                    }
                },
                { $sort: { borrowtime: -1 } },
                { $skip: skip },
                { $limit: 10 },
            ]).toArray(
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


mqtt.regMqttFuncs("top100", (param, clientid) => {
    return new Promise((resolve, reject) => {
        let userid = auth.getUserIdByClientId(clientid);
        var db = DB.getDB();
        var collection = db.collection('auth_user');
        console.log(userid);
        collection.find({ $query: {} }, { limit: 100 }).sort({ sharepoint: -1 })
            .toArray(
                (err, docs) => {
                    if (err) {
                        reject({ success: true, msg: "查询错误!请稍后再试!", err: err });
                    } else {
                        resolve({ success: true, msg: "查询成功!", top100: docs });
                    }
                }
            );

    });
});


mqtt.regMqttFuncs("auth/focuslist", (param, clientid) => {
    return new Promise((resolve, reject) => {
        let userid = auth.getUserIdByClientId(clientid);
        var db = DB.getDB();
        var collection = db.collection('focus');
        var pagesize = param.page;
        var skip = (pagesize - 1) * 10;
        console.log(userid);
        collection.aggregate(
            [{
                    $match: {
                        userid: userid
                    }
                },
                {
                    $lookup: {
                        from: "books",
                        localField: "bookid",
                        foreignField: "_id",
                        as: "book"
                    }
                },
                { $sort: { borrowtime: -1 } },
                { $skip: skip },
                { $limit: 10 },
            ]).toArray(
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

mqtt.regMqttFuncs("auth/focus", (param, clientid) => {
    var userid = auth.getUserIdByClientId(clientid);
    return new Promise((resolve, reject) => {
        console.log("====popularsearch=====", param);
        var db = DB.getDB();
        var collection = db.collection('focus');
        collection.findOneAndUpdate({ userid: userid, bookid: ObjectID(param._id) }, { $set: { focustime: new Date() } }, { upsert: true });
        resolve({ success: true, msg: "关注成功!" });
    });
});

mqtt.regMqttFuncs("auth/borrow", (param, clientid) => {
    var userid = auth.getUserIdByClientId(clientid);
    return new Promise((resolve, reject) => {
        console.log("====popularsearch=====", param);
        var db = DB.getDB();
        var collection = db.collection('borrow');
        var books = db.collection('books');
        books.findOneAndUpdate({ _id: param._id }, { $inc: { borrownum: 1 } })
        collection.findOneAndUpdate({ userid: userid, bookid: ObjectID(param._id) }, {
            $set: {
                borrowtime: new Date()
            }
        }, { upsert: true });
        resolve({ success: true, msg: "借书成功!" });
    });
});