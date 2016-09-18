module.exports = (server) => {
    server.route({
        method: ['GET','POST'],
        path: '/create_virtual_card',
        config: {
            auth: 'coinbase',
            handler: (request, reply) => {
                reply('hello, ' + JSON.stringify(request));
            }
        }
    });
};