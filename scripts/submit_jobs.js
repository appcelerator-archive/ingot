var request = require('request'),
	oses = ['osx', 'linux', 'win32'],
	platforms = ['ios', 'android', 'mobileweb', 'blackberry'];

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function pick(list) {
	var x = list.length,
		i = 0,
		j = randomIntFromInterval(1, x),
		k,
		l = [];

	for (; i < j; i++) {
		while (1) {
			k = randomIntFromInterval(0, x - 1);
			if (l.indexOf(list[k]) == -1) {
				l.push(list[k]);
				break;
			}
		}
	}

	return l;
}

for (var i = 0; i < 100; i++) {
	// pick some platforms
	var osList = pick(oses),
		platformList = pick(platforms),
		p = platformList.indexOf('ios');
	if (p != -1 && osList.indexOf('osx') == -1) {
		platformList.splice(p, 1);
	}
	if (!platformList.length) continue;

	request.post('http://localhost:8080/api/job', function (err, res, body) {
		if (err || parseInt(res.statusCode / 100) !== 2) {
			// error
			console.error('Error: got HTTP ' + res.statusCode);
			console.error(body);
		} else {
			// success?
			console.info(JSON.parse(body));
		}
	}).form({
		type: 'test',
		priority: randomIntFromInterval(-20, 20),
		payload: JSON.stringify({ foo: new Date }),
		meta: JSON.stringify({
			os: osList,
			platform: platformList
		})
	});
}