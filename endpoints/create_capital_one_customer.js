/**
 * Created by Ravi on 9/17/16.
 */
'use strict';

var yar = require('yar');
const recursive = require('recursive-readdir');
const path = require("path");
const coinbase = require('coinbase');
var Client = require('coinbase').Client;
var request_lib = require('request');

module.exports = (server) => {
    server.route({
        method: ['POST'],
        path: '/create_capital_one_customer',
        config: {
            handler: (request, reply) => {
                var client = new Client({'accessToken': request.payload.access_token, 'refreshToken': request.payload.refresh_token});
                client.getCurrentUser((err, result) => {
                    if (err) throw err;
                    let uid = result.id;

                    var db = server.app.firebase.database();
                    var ref = db.ref();
                    ref.once("value", function(snapshot) {
                        let has_cb_id = snapshot.hasChild(uid);
                        if (has_cb_id) {
                            return reply({
                                "coinbase_id": uid,
                                "c1_id": snapshot.child(uid).val()
                            });
                        }


                        return request_lib.post(`http://api.reimaginebanking.com/customers?key=${process.env.CAPITAL_ONE_SECRET_KEY}`,{
                            json: true,
                            body: {
                                "first_name": request.payload.first_name,
                                "last_name": request.payload.last_name,
                                "address": {
                                    "street_number": request.payload.street_number,
                                    "street_name": request.payload.street_name,
                                    "city": request.payload.city,
                                    "state": request.payload.state,
                                    "zip": `${request.payload.zip}`
                                }

                            },
                            callback: (err,result,body) => {
                                if (err) {
                                    return reply(err);
                                }
                                let c1id = body.objectCreated._id;
                                console.log("c1id",c1id);
                                ref.child(uid).set(c1id);
                                return reply({
                                    "coinbase_id": uid,
                                    "c1_id": c1id
                                });

                            }
                        });
                    });
                });
            }
        }
    });
};
