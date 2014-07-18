var appc = require('node-appc'),
	cmdr = require('commander'),
	fs = require('fs'),
	ic = require('ingot-common'),
	longjohn = require('longjohn'),
	path = require('path'),
	svcmgr = require('svcmgr'),
	winston = require('winston'),
	logger = new winston.Logger({
		padLevels: true,
		levels: {
			ingot: 0,
			svcmgr: 0,
			info: 0,
			error: 0
		},
		colors: {
			ingot: 'magenta',
			svcmgr: 'blue'
		},
		transports: [
			new winston.transports.Console({
				level: 'ingot',
				colorize: true,
				timestamp: true
			})
		]
	});

logger.addLevel = function (name, color, level) {
	var obj = {};
	obj[name] = level || 0;
	logger.setLevels(appc.util.mix(obj, logger.levels));
	obj = {};
	obj[name] = color;
	winston.addColors(obj);
};

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
config.logger = logger;

var services = [];
Array.isArray(cmdr.args) && cmdr.args.forEach(function (arg) {
	arg.split(',').forEach(function (a) {
		services.push(a);
	});
});

if (!services.length) {
	// load them all
	services = ic.findModules('service');
}

svcmgr.setup(config).load(services, function (err) {
	if (services['ingot-web-server']) {
		services['ingot-web-server'].module.app.locals.title = 'Ingot • Powered by Appcelerator';
	}

	svcmgr.start(function () {
		logger.ingot('all services started');
	});
});

// listen for ctrl-c
process.on('SIGINT', function () {
	console.log(); // whitespace
	svcmgr.unload(function () {
		process.exit(0);
	});
});