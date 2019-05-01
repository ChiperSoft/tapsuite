var tap = require('tap');

function parseTestArgs (name, extra, cb) {
	if (typeof name === 'function') {
		cb = name;
		name = '';
		extra = {};
	} else if (typeof name === 'object') {
		cb = extra;
		extra = name;
		name = '';
	} else if (typeof extra === 'function') {
		cb = extra;
		extra = {};
	}

	if (!extra) {
		extra = {};
	}

	if (!cb) {
		extra.todo = true;
	} else if (typeof cb !== 'function') {
		throw new TypeError('test() callback must be function if provided');
	}

	if (!name && cb && cb.name) {
		name = cb.name;
	}

	name = name || '(unnamed test)';
	return [ name, extra, cb ];
}

module.exports = exports = function suite (name, extra, cb) {
	var fargs = parseTestArgs(name, extra, cb);
	name = fargs[0];
	extra = fargs[1];
	cb = fargs[2];

	var tests = [];
	var only = null;
	var before = (done) => done();
	var after = (done) => done();
	var failure = (done) => done();

	return tap.test(name, extra, async (tHarness) => {
		var harness = {
			test (...args) {
				tests.push(args);
			},

			skip (n, e, c) {
				var args = parseTestArgs(n, e, c);
				n = args[0];
				e = args[1];
				c = args[2];

				e.skip = true;

				tests.push([ n, e, c ]);
			},

			todo (n, e, c) {
				var args = parseTestArgs(n, e, c);
				n = args[0];
				e = args[1];
				c = args[2];

				e.todo = true;

				tests.push([ n, e, c ]);
			},

			only (...args) {
				only = args;
			},

			before (fn) {
				before = fn;
			},

			after (fn) {
				after = fn;
			},

			comment:    tHarness.comment.bind(tHarness),
			beforeEach: tHarness.beforeEach.bind(tHarness),
			afterEach:  tHarness.afterEach.bind(tHarness),

			onFailure (fn) {
				failure = fn;
			},

			harness: tHarness,
		};

		cb(harness);

		await fromCallbackOrPromise(before);

		if (only) {
			try {
				await tHarness.test(...only);
			} catch (err) {
				await fromCallbackOrPromise(failure, err);
			}
		} else {
			for (const testArgs of tests) {
				try {
					await tHarness.test(...testArgs);
				} catch (err) {
					await fromCallbackOrPromise(failure, err);
				}
			}
		}

		await fromCallbackOrPromise(after);
	});
};

function fromCallback (func) {
	return new Promise((resolve, reject) => {
		const cb = (err, result) => {
			if (err) reject(err);
			else resolve(result);
		};
		try {
			func(cb);
		} catch (e) {
			reject(e);
		}
	});
}

function fromCallbackOrPromise (fn, ...args) {
	if (typeof fn !== 'function') return Promise.resolve();
	return fromCallback((cb) => {
		args.push(cb);
		var ret = fn(...args);
		if (ret && typeof ret.then === 'function') {
			Promise.resolve(ret).then((r) => cb(null, r), cb);
		} else if (fn.length === 0) {
			// function doesn't support a callback and didn't
			// return a promise, so assume sync
			cb();
		}
	});
}
