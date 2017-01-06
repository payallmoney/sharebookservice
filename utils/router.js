module.exports = {
    appsRoute: appsRoute,
    subRoute: subRoute
};

/**
 * 将path路径下的所有js文件载入路由
 * @param folder 基础路径
 * @param path
 * @param router
 */
function appsRoute(folder, path, router) {
    var fs = require('fs');
    var PATH = require('path');
    var URLJoin = require('url-join');
    var routedir = PATH.join(folder);
    var files = fs.readdirSync(routedir);
    for (var idx in files) {
        var file = files[idx];
        var stat = fs.statSync(PATH.join(routedir, file));
        if (stat.isFile()) {
            var ext = PATH.extname(file);
            if (ext === '.js') {
                var basename = PATH.basename(file, ext);
                var url = URLJoin(path , PATH.basename(file, ext));
                var approute = require(PATH.join(folder,  basename));
                router.use(url, approute);
            }
        } else if (stat.isDirectory()) {
            appsRoute(PATH.join(folder,file), URLJoin(path, file), router)
        }

    }
}
/**
 * 将与文件名相同目录名下的路由全部载入
 * @param folder
 * @param filepath
 * @param router
 */
function subRoute(folder, filepath, router) {
    var PATH = require('path');
    var ext = PATH.extname(filepath);
    var basename = PATH.basename(filepath, ext);
    return appsRoute(folder, '/' + basename + '/', router);
}