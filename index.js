'use strict';

const Hapi = require('hapi');
var yar = require('yar');
const recursive = require('recursive-readdir');
const path = require("path");
const bell = require("bell");
const coinbase = require('coinbase');
var Client = require('coinbase').Client;
var Grant = require('grant-hapi');
var grant = new Grant();
var request = require('request');
var firebase = require('firebase');
const querystring = require('querystring');

console.log("coinbase id", process.env.COINBASE_CLIENT_ID);

const server = new Hapi.Server();
server.connection(
    { port: process.env.PORT || 3000,
      routes: { cors: true }
    }
);
server.app.firebase = firebase.initializeApp({
    serviceAccount: JSON.parse(Buffer.from(process.env.GOOGLE_API_SECRET_CONFIG, 'base64')),
    databaseURL: process.env.FIREBASE_DB_URL
});

server.register([
    { // REQUIRED:
        register: yar,
        options: {
            cookieOptions: {
                password: process.env.COOKIE_PASSWORD,
                isSecure: false
            }
        }
    },
    { // mount grant
        register: grant,
        options: {
            server: {
                protocol: process.env.PROTOCOL,
                host: process.env.HOST,
                state: true,
                callback: "/callback"
            },
            coinbase: {
                "key": process.env.COINBASE_CLIENT_ID,
                "secret": process.env.COINBASE_CLIENT_SECRET,
                "scope": ["wallet:user:email", "wallet:user:read", "wallet:transactions:send", "wallet:accounts:read"],
                "custom_params": {
                    "meta[send_limit_amount]": 1,
                    "meta[send_limit_currency]": "USD",
                    "meta[send_limit_period]": "week"
                },
                "callback": "/callback/coinbase"
        },}
    },
    require('inert')
], function (err) {
    if (err) {
        throw err
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('demo/index.html');
        }
    });
    server.route({
        method: 'GET',
        path: '/index.html',
        handler: function (request, reply) {
            reply.file('demo/index.html');
        }
    });
    server.route({
        method: 'GET',
        path: '/index.js',
        handler: function (request, reply) {
            reply.file('demo/index.js');
        }
    });

    recursive('endpoints', function (err, files) {
        // Files is an array of filename
        for (var filename of files) {
            require(path.join(__dirname, filename))(server);
        }
    });

    server.route({
        method: ['GET'],
        path: '/callback/{provider}',
        handler: function (req, reply) {
            var access_token = req.query.access_token;
            var refresh_token = req.query.refresh_token;
            var client = new Client({
                'accessToken': access_token,
                'refreshToken':refresh_token
            });
            client.getCurrentUser((err, result) => {
                if (err) return reply(err);
                let uid = result.id;

                var db = server.app.firebase.database();
                var ref = db.ref();

                ref.once("value", function (snapshot) {
                    var answer = {
                        coinbase_access_key: access_token,
                        coinbase_refresh_token: refresh_token,
                        coinbase_uid: uid
                        //firebase_access_token: server.app.firebase.auth().createCustomToken(uid)
                    };
                    var has_cb_id = snapshot.hasChild(uid);
                    if (has_cb_id) {
                        answer["c1_id"] = snapshot.child(uid).val();
                    }
                    let qs_ans = querystring.stringify(answer);
                    return reply.redirect(`chrome-extension://jbhaeeplonafkglmanjflfaocajafnfd/oauth_callback.html?${qs_ans}`);
                });
            });
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.info.uri}`);
    });
});