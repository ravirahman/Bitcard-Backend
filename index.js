'use strict';

const Hapi = require('hapi');
var yar = require('yar');
const recursive = require('recursive-readdir');
const path = require("path");
const firebase = require('firebase');
const bell = require("bell");
const coinbase = require('coinbase');
var Grant = require('grant-hapi');
var grant = new Grant();

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });
server.app.firebase = firebase.initializeApp({
    serviceAccount: JSON.parse(Buffer.from(process.env.GOOGLE_API_SECRET_CONFIG, 'base64')),
    databaseURL: process.env.FIREBASE_DB_URL
});

server.connection({ port: 8000 });

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
                state: true
            },
            coinbase: {
                "key": process.env.COINBASE_CLINET_ID,
                "secret": process.env.COINBASE_CLIENT_SECRET,
                "scope": ["wallet:user:email", "wallet:user:read", "wallet:transaction:send"],
        },}
    },
    require('hapi-auth-bearer-token')
], function (err) {
    if (err) {
        throw err
    }
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply({});
        }
    });

    recursive('endpoints', function (err, files) {
        // Files is an array of filename
        for (var filename of files) {
            require(path.join(__dirname, filename))(server);
        }
    });

    server.auth.strategy('simple', 'bearer-access-token', {
        allowQueryToken: false,
        allowMultipleHeaders: false,
        validateFunc: function (authToken, callback) {
            // idToken comes from the client app (shown above)
            server.app.firebase.auth().verifyIdToken(authToken).then(function(decodedToken) {
                var uid = decodedToken.uid;
                callback(null,true,{authToken: authToken, user: decodedToken});
                // ...
            }).catch(function(error) {
                // Handle error
                callback(null,false);
            });
        }
    });
    server.auth.default('simple');

    server.route({
        method: ['GET', 'POST'],
        path: '/connect/coinbase/callback',
        handler: function (req, reply) {
            var userId = "";
            console.log(req.query);
            //todo exchange code for coinbase access key
            //todo look up if customer is new or existing. if new,
                //todo get profile information from coinbase (first name, last name, address), populate in firebase
                //todo create capital one customer
            //todo return the coinbase access key, refresh key, and firebase access token
            reply(JSON.stringify({
                coinbase_access_key: "",
                coinbase_refresh_token: "",
                firebase_access_token: server.app.firebase.auth().createCustomToken(userId)
            }))
    }});

    server.start((err) => {
        if (err) {
            throw err;
        }
        //console.log(`Server running at: ${server.info.uri}`);
    });
});