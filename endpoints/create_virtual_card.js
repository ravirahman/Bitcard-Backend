'use strict';

const Hapi = require('hapi');
var yar = require('yar');
const recursive = require('recursive-readdir');
const path = require("path");
const firebase = require('firebase');
const bell = require("bell");
const coinbase = require('coinbase');
var Client = require('coinbase').Client;
var Grant = require('grant-hapi');
var grant = new Grant();
var generator = require('creditcard-generator');
var request_lib = require("request");

module.exports = (server) => {
    server.route({
        method: ['POST'],
        path: '/create_virtual_card',
        config: {
            handler: (request, reply) => {
                var Client = require('coinbase').Client;
                var client = new Client({'accessToken': request.payload.access_token, 'refreshToken': request.payload.refresh_token});
                let amount_to_charge = request.payload.amount_to_charge; //in dollars
                client.getCurrentUser((err, result) => {
                    if (err) reply(err).status(500);
                    let uid = result.id;

                    var db = server.app.firebase.database();
                    var ref = db.ref();
                    ref.once("value", function (snapshot) {
                        let has_cb_id = snapshot.hasChild(uid);
                        if (!has_cb_id) {
                            return reply({
                                "error": "no c1 id",
                            }).status(500);
                        }
                        client.getAccounts({}, function(err, accounts) {
                            accounts.forEach(function(account) {
                                if (account.primary) {
                                    if (amount_to_charge > account.native_balance.amount) {
                                        return reply(JSON.stringify({
                                            "code": 400,
                                            "message": "Bitcoin balance too low"
                                            })
                                        );
                                    }
                                    client.getAccount(account.id, function(err,account) {
                                        return account.sendMoney({
                                            'to': process.env.BITCOIN_WALLET,
                                            'amount': amount_to_charge,
                                            'currency': 'USD',
                                            'type': "send"
                                        }, function(err, tx, data) {
                                            if (err) {
                                                return reply(JSON.stringify({
                                                        "code": 500,
                                                        "message": "Could not send money"
                                                    })
                                                ).status(500);
                                            }
                                            request_lib.post(`http://api.reimaginebanking.com/customers/${snapshot.child(uid).val()}/accounts?key=${process.env.CAPITAL_ONE_SECRET_KEY}`, {
                                                json: true,
                                                body: {
                                                    "type": "Credit Card",
                                                    "nickname": "Virtual Card",
                                                    "rewards": 0,
                                                    "balance": parseFloat(amount_to_charge),
                                                    "account_number": generator.GenCC("VISA", 1)[0]
                                                },
                                                callback: (err, res, data) => {
                                                    if (err) return reply(err).status(500);
                                                    return reply(data);
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            }
        }
    });
};