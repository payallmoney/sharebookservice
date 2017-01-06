var express = require('express');
var PATH = require('path');
var router = express.Router();


/* GET home page. */
router.get('', function (req, res, next) {
  res.render('index', {title: '新康中心管理系统'});
});
//批量配置apps下的路由
require("utils/router").appsRoute(PATH.join(__dirname,'apps'),'',router);

module.exports = router;
