var mqttclients = {};

var onlineDevices = {};
var mqttFuncs = {};
var mosca = require('mosca');
//var auth = require('utils/auth');
//var book = require('utils/book');
var cfg = require('conf/conf');



function createMqttServer(server) {
    var ascoltatore = {
        //using ascoltatore
        type: 'mongo',
        url: `mongodb://${cfg.db.host}:${cfg.db.port}/${cfg.db.mqttdb}`,
        pubsubCollection: cfg.db.mqttconnection,
        mongo: {}
    };

    var settings = {
        // port: 3005,
        // http: {
        //     // port: 3002,
        //     bundle: true,
        //     static: './'
        // },
        backend: ascoltatore
    };

    var broker = new mosca.Server(settings);
    broker.attachHttpServer(server);
    // httpServ.
    broker.on('clientConnected', function(client) {
        if (client.onlinetime) {
            client.lastonlinetime = client.onlinetime;
        }
        client.onlinetime = new Date();
        mqttclients[client.id] = client;
    });
    broker.on('clientDisconnected', function(client) {
        delete mqttclients[client.id];
    });

    // fired when a message is received
    broker.on('published', function(packet, client) {
        if (packet.topic === 'server') {
            let payload = JSON.parse(packet.payload.toString());
            let type = payload.type;
            if (mqttFuncs[type]) {
                //未登录的直接放行
                if ("auth/" === type.substr(0, 5) && (!mqttclients[client.id] || !mqttclients[client.id].logined)) {
                    let ret = { uuid: payload.uuid, data: { success: false, code: 401, msg: "未登录!" } };
                    pub(client.id, ret);
                    return;
                }
                mqttFuncs[type](payload.param, client.id).then((data) => {
                    //返回结果
                    let ret = { uuid: payload.uuid, data: data };
                    pub(client.id, ret);
                });
            } else {
                console.error("错误:类型为" + type + "的处理方法未注册!")
            }

        }
        //let data = JSON.parse(packet.payload.toString());

        // broker.publish(client.id,)
    });

    broker.on('ready', setup);


    // fired when the mqtt server is ready
    function setup() {
        console.log('Mosca server is up and running');
    }

    function pub(topic, data) {
        var message = {
            topic: topic,
            payload: JSON.stringify(data), // or a Buffer
            qos: 0, // 0, 1, or 2
            retain: false // or true
        };
        broker.publish(message);
    }
}


/**
 * 
 * @param {*} messagetype
 * @param {*} processfunc  a function return promise
 */
function regMqttFuncs(messagetype, processfunc) {
    mqttFuncs[messagetype] = processfunc;
}

function setLogined(clientid, logined) {
    mqttclients[clientid].logined = logined;
}


//注册原始方法,需要使用client.id的方法
regMqttFuncs("regdevice", (param, clientid) => {
    return new Promise((resolve, reject) => {
        onlineDevices[param.deviceid] = clientid;
        resolve(true);
    });
});


module.exports = {
    createMqttServer: createMqttServer,
    regMqttFuncs: regMqttFuncs,
    setLogined: setLogined
}