/* eslint consistent-this:0, prefer-rest-params:0, prefer-spread:0 */
'use strict';

var Promise = require('bluebird');
var tap = require('tap');
var Test = tap.Test;

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

	return tap.test(name, extra, (tHarness) => {
		var harness = {
			test () {
				tests.push(Array.from(arguments));
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

			only () {
				only = Array.from(arguments);
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

		return fromCallbackOrPromise(before)
			.then(() => {
				if (only) {
					return Promise.resolve(tHarness.test.apply(tHarness, only))
						.catch((err) => fromCallbackOrPromise(failure, err));
				}

				var pTests = tests.map((args) =>
					Promise.resolve(tHarness.test.apply(tHarness, args))
						.catch((err) => fromCallbackOrPromise(failure, err))
				);

				return Promise.all(pTests);
			})
			.then(() => fromCallbackOrPromise(after));
	});
};

function fromCallbackOrPromise () {
	var args = Array.from(arguments);
	var fn = args.shift();
	if (typeof fn !== 'function') return Promise.resolve();
	return Promise.fromCallback((cb) => {
		args.push(cb);
		var ret = fn.apply(null, args);
		if (ret && typeof ret.then === 'function') {
			Promise.resolve(ret).asCallback(cb);
		} else if (fn.length === 0) {
			// function doesn't support a callback and didn't
			// return a promise, so assume sync
			cb();
		}
	});
}
