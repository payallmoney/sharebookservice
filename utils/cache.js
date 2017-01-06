/**
 * Created by payallmoney on 2016/3/8.
 */
var cache = {};
cache.sqlcache = {list:{},map:{}};
getSqlCache();


module.exports = {
    cache: getCache,
    getList:getList,
    getMap:getMap
};

function getCache(){
    return cache;
}
function getList(code){
    return cache.sqlcache.list[code];
}
function getMap(code){
    return cache.sqlcache.map[code];
}
function getSqlCache() {
    var sqlcachecfg = require('utils/sqlcachecfg');
    var db = require('utils/db');
    var promises = [];
    for (var id in sqlcachecfg) {
        var sql = sqlcachecfg[id];
        db.exec(sqlcachecfg[id]).then(function (rows) {
            cache.sqlcache.list[id] = rows;
            cache.sqlcache.map[id] = {};
            for(var idx in rows){
                cache.sqlcache.map[id][ rows[idx].code] = rows[idx].value;
            }
        });
    }
}