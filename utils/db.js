var cfg = require('conf/conf.js');
var MongoClient = require('mongodb').MongoClient,
    co = require('co');
var db;
var url = `mongodb://${cfg.db.host}:${cfg.db.port}/${cfg.db.dbname}`;
MongoClient.connect(url).then((database) => {
    db = database
});
module.exports = {
    getDB: getDB
}

function getDB() {
    return db;
}