var mqttclients = {};
var loginedusers = {};
var onlineDevices = {};
var mqttFuncs = {};

function createMqttServer(server) {
    var mosca = require('mosca');

    var ascoltatore = {
        //using ascoltatore
        type: 'mongo',
        url: 'mongodb://localhost:27017/mqtt',
        pubsubCollection: 'mqtt',
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
        console.log('client connected', client.id);
        if (client.onlinetime) {
            client.lastonlinetime = client.onlinetime;
        }
        client.onlinetime = new Date();
        mqttclients[client.id] = client;
    });

    // fired when a message is received
    broker.on('published', function(packet, client) {
        console.log('packet.payload===', packet.payload.toString());
        console.log('packet,client===', packet);
        if (packet.topic === 'server') {
            console.log("client.id===", client.id);
            let payload = JSON.parse(packet.payload.toString());
            let type = payload.type;
            if (mqttFuncs[type]) {
                mqttFuncs[type](payload.param).then((data) => {
                    //返回结果
                    console.log("client.id===", client.id);
                    console.log("payload===", payload);
                    let ret = { uuid: payload.uuid, data: data };
                    console.log(ret);
                    var message = {
                        topic: client.id,
                        payload: JSON.stringify(ret), // or a Buffer
                        qos: 0, // 0, 1, or 2
                        retain: false // or true
                    };
                    broker.publish(message);
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
}

function regmqttFuncs(type, func) {
    mqttFuncs[type] = func;
}
regmqttFuncs("regdevice", (param) => {
    console.log("regdevice===", param);
    return new Promise((resolve, reject) => {
        console.log(param);
        //onlineDevices[param] = param;
        resolve(true);
    });
});

module.exports = {
    createMqttServer: createMqttServer,
    regmqttFuncs: regmqttFuncs
}