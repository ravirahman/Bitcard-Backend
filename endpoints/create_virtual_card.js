module.exports = (server) => {
    server.route({
        method: ['GET','POST'],
        path: '/create_virtual_card',
        config: {
            auth: {
                mode: 'required',
                strategy: 'simple'
            },
            handler: (request, reply) => {
                reply('hello, ' + JSON.stringify(request));

                var Client = require('coinbase').Client;

                var client = new Client({'apiKey': 'API KEY',
                         'apiSecret': 'API SECRET'});

                client.getAccount('2bbf394c-193b-5b2a-9155-3b4732659ede', function(err, account) {
                account.sendMoney({'to': '1AUJ8z5RuHRTqD1eikyfUUetzGmdWLGkpT',
                     'amount': '0.1',
                     'currency': 'BTC',
                     'idem': '9316dd16-0c05'}, function(err, tx) {
                console.log(tx);
  });
});
            }
        }
    });
};