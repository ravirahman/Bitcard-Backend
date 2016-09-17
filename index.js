'use strict';

const Hapi = require('hapi');
const recursive = require('recursive-readdir');
const path = require("path");
const firebase = require('firebase');
const bell = require("bell");
const coinbase = require('coinbase');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });
server.app.firebase = firebase.initializeApp({
    serviceAccount: JSON.parse(Buffer.from(process.env.GOOGLE_API_SECRET_CONFIG, 'base64')),
    databaseURL: process.env.FIREBASE_DB_URL
});

server.connection({ port: 8000 });

// Register bell with the server
server.register(bell, function (err) {

    server.auth.strategy('coinbase', 'bell', {
        provider: {
            protocol: 'oauth2',
            auth: 'https://www.coinbase.com/oauth/authorize',
            token: 'http://www.coinbase.com/oauth/token',
            scope: ["wallet:user:email", "wallet:user:read", "wallet:transaction:send"],
            profile: function(credentials, params, get, callback) {

                console.log("credentials",credentials);
                console.log("params", params);
                callback();
            },
            clientId: process.env.COINBASE_CLINET_ID,
            clientSecret: process.env.COINBASE_CLIENT_SECRET,
            forceHttps: true
        },
        clientId: process.env.COINBASE_CLINET_ID,
        clientSecret: process.env.COINBASE_CLIENT_SECRET,
        isSecure: false     // Terrible idea but required if not using HTTPS especially if developing locally
    });

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


    // Use the 'twitter' authentication strategy to protect the
    // endpoint handling the incoming authentication credentials.
    // This endpoints usually looks up the third party account in
    // the database and sets some application state (cookie) with
    // the local application account information.
    server.route({
        method: ['GET', 'POST'], // Must handle both GET and POST
        path: '/login/coinbase/callback',          // The callback endpoint registered with the provider
        config: {
            auth: 'coinbase',
            handler: function (request, reply) {

                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }

                // Perform any account lookup or registration, setup local session,
                // and redirect to the application. The third-party credentials are
                // stored in request.auth.credentials. Any query parameters from
                // the initial request are passed back via request.auth.credentials.query.
                return reply.redirect('/home');
            }
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.info.uri}`);
    });
});