
var cfg = require('conf/conf.js');
var Q = require("q");
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: cfg.db.maxconn,
    host: cfg.db.host,
    port: cfg.db.port,
    user: cfg.db.user,
    password: cfg.db.password,
    database: cfg.db.dbname
});
module.exports = {
    pool: pool,
    query: query,
    queryarray:queryarray
}

function query(/*arguments*/) {
    var args = Array.prototype.slice.call(arguments);
    var sql = args.shift();
    console.log(args);
    return queryarray(sql,args);
}

function queryarray(sql,args) {
    var deferred = Q.defer();
    var data = [];
    var query = pool.query(sql, args);
    query.on('error', function (err) {
        deferred.reject(err);
    }).on('result', function (row) {
        data.push(row);
    }).on('end', function () {
        deferred.resolve(data);
    });
    return deferred.promise;
}