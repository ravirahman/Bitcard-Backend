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
        path: '/process_transaction',
        config: {
            handler: (request, reply) => {
                var Client = require('coinbase').Client;

                request_lib.post(`http://api.reimaginebanking.com/accounts/${request.payload.account_id}/accounts?key=${process.env.CAPITAL_ONE_SECRET_KEY}`,
                {
                    json: true,
                    body: {
                        "merchant_id": "57de97b4e63c5995587e8ee8",
                        "medium": "balance",
                        "purchase_date": "2016-09-18",
                        "amount": 0.10,
                        "description": "Tim the Beaver Plush Toy"
                    },
                    callback: (err,data,result) => {
                        console.log("data",data);
                        console.log("result",result);
                        if (err) return reply(err).status(500);
                        console.log("processed transaction");
                        return reply({"success": true});
                    }
                });
            }
        }
    });
};