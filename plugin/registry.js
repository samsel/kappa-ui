var _ = require('underscore'),
	Registry = require('npm-registry-client'),
	npmconf = require('npmconf'),
	path = require('path'),
	config = require('./config'),
	options,
	client,
	connectionConfig = {
		timeout: 1000
	};

function sync(cb) {
	var uri = options.registry + "-/all";
	client.get(uri, connectionConfig, function (err, data, raw, res) {
		if (err) {
			throw err;
			return;
		}

		if (typeof cb === 'function') {
			cb(data);
		}

	});  	
}

module.exports.setup = function (_options, callback) {
	options = _options;

	npmconf.load({}, function (err, conf) {
		if (err) {
			throw err;
			return;
		}

	  	conf.set('cache', path.resolve(__dirname + '/../' + config.directory.cache));
	  	conf.set('always-auth', false);
	  	conf.set('strict-ssl', false);

		client = new Registry(conf);
		//setInterval(sync, config.syncInterval);
		sync(function (packages) {
			callback();
		});
	});
};


module.exports.list = function (page, callback) {
	var start = page * config.pageSize,
		end = start + config.pageSize;

	sync(function (packages) {
		var keys = Object.keys(packages);
		keys = keys.splice(1, keys.length); //ignore the first key which is '_updated'
		callback(_.values(_.pick(packages, keys.slice(start, end))));
	}); 
};

module.exports.packageInfo = function (name, callback) {
	var uri = options.registry + name;

	client.get(uri, connectionConfig, function (err, data, raw, res) {
		if (err) {
			throw err;
			return;
		}

		callback(data);

	});
};


