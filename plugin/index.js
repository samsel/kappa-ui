'use strict';

var pkg          = require('../package');
var utils        = require('./utils');
var interceptor  = require('./interceptor');
var templater    = require('./templater');

module.exports = {

    name: pkg.name,

    version: pkg.version,

    register: function (plugin, options, next) {

        plugin.views({
            engines: {
                html: {
                    module: templater
                    //layout: utils.layoutFile
                }
            },
            partialsPath: utils.viewPath,
            path: utils.viewPath,
            isCached: false
        });        

        plugin.route({
            method: 'GET',
            path: utils.assestRoute,
            vhost: options.vhost,
            handler: {
                directory: {
                    path: utils.assestPath,
                    listing: false,
                    index: true
                }
            }
        });          

        plugin.ext('onRequest', function (req, reply) {
            if (utils.isSearchRequest(req)) {
                interceptor.search(req, reply);
                return;
            }

            if (utils.shouldRenderHtml(req)) {
                interceptor.render(req, reply);
                return;
            }

            reply();
        });

        plugin.ext('onPreResponse', function (req, reply) {
            if (req.response && req.response.isBoom && utils.shouldRenderHtml(req)) {            
                interceptor.renderError(req, reply);
                return;
            }

            reply();
        });

        interceptor.setup(options, next);                    
    }
};