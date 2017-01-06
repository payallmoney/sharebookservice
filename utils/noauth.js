var noauthurl = require('conf/noauthurl.js');
var urls = {};
var pres = {};

Object.keys(noauthurl).forEach((key, value) => {
    console.log(key)
    var value = noauthurl[key];
    if (value) {
        if (key.substr(key.length - 2, 2) == '**') {
            pres[key.substr(0, key.length - 2)] = true;
        } else {
            urls[key] = true;
        }
    }
})
// console.dir(urls);
// console.dir(pres);

module.exports = {
    pass: pass,
};

function pass(url) {
    if (urls[url]) {
        return true;
    } else {
        var keys = Object.keys(pres);
        for(var i=0 ;i<keys.length;i++){
            var key = keys[i];
            // console.log(key);
            // console.log(url.substr(0,key.length));
            if(url.substr(0,key.length) === key){
                return true;
            }
        }
    }
    return false;
}
