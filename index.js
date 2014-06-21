var appc = require('node-appc'),
	cmdr = require('commander'),
	fs = require('fs'),
	path = require('path'),
	svcmgr = require('svcmgr');

cmdr.version(require('./package.json').version)
	.parse(process.argv);

// load the config
var config = {},
	configFile = appc.fs.resolvePath('~/.appcelerator/ingot.json');
if (fs.existsSync(configFile)) {
	var cfg = JSON.parse(fs.readFileSync(configFile));
	for (var i in cfg) {
		config[i] = cfg[i];
	}
}
config.logger === undefined && (config.logger = console);

var services = [];
Array.isArray(cmdr.args) && cmdr.args.forEach(function (arg) {
	arg.split(',').forEach(function (a) {
		services.push(a);
	});
});

if (!services.length) {
	// load them all
	services = [
		'ingot-hub',
		'ingot-spoke'
	];
}

svcmgr.setup(config).load(services, function (err) {
	if (services['ingot-web-server']) {
		services['ingot-web-server'].module.app.locals.title = 'Ingot • Powered by Appcelerator';
	}

	svcmgr.start(function () {
		console.info('ingot: all services started');
	});
});

// listen for ctrl-c
process.on('SIGINT', function () {
	console.log(); // whitespace
	svcmgr.unload(function () {
		process.exit(0);
	});
});