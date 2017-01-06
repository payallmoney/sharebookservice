var express = require('express');
var router = express.Router();
var Q = require('q');
var Promise = require('bluebird');
var pool = require('utils/db');
/* GET home page. */
router.get("/", function (req, res, next) {
    var query = pool.query('select * from books')
        .then(function (rows) {
            console.log('got rows!')
            console.dir(rows)
            res.json(rows);
        })

});
router.get("/1", function (req, res, next) {
    var query = pool.queryarray(['select * from books'])
        .then(function (rows) {
            console.log('got rows!')
            console.dir(rows)
            res.json(rows);
        })

});

router.get("/2", function (req, res, next) {
    var query = pool.query('select * from books where id=? and name=?',1,'悲惨世界')
        .then(function (rows) {
            console.log('got rows!')
            console.dir(rows)
            res.json(rows);
        })

});
router.get("/3", function (req, res, next) {
    var query = pool.queryarray('select * from books where id=? and name=?',[1,'悲惨世界'])
        .then(function (rows) {
            console.log('got rows!')
            console.dir(rows)
            res.json(rows);
        })
});
router.get("/3", function (req, res, next) {
    var query = pool.queryarray('select * from books where id=? and name=?',[1,'悲惨世界'])
        .then(function (rows) {
            console.log('got rows!')
            console.dir(rows)
            res.json(rows);
        })
});


module.exports = router;
