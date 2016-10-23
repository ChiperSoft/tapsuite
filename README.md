# tapsuite
===
A tool for creating suites of tests for node-tap.

Allows for creation of a suite of subtests in a file with dedicated pre-suite and post-suite behavior, as well as providing `t.only`, `t.skip` and `t.todo` functions for easier test development.

## Installation

```
npm install tap tapsuite
```

Tapsuite has a peer dependency on node-tap, which must be installed alongside.

## Usage

```js
var suite = require('tapsuite');

suite('this is a suite of tests', (s) => {
	
	// All of the pre and post suite/test functions are asynchronous and must
	// declare when they are finished by either invoking the `done` callback
	// or by returning a promise
	s.before((done) => {
		// pre-suite setup tasks
		done();
	});

	s.after(() => {
		// post-suite teardown tasks
		return Promise.resolve();
	});

	s.beforeEach((done) => {
		// pre-test setup tasks
		done();
	});

	s.afterEach(() => {
		// post-test teardown tasks
		return Promise.resolve();
	});

	s.test('this is a normal tap test', (t) => {
		// Suite tests execute exactly like normal tap subtests, with one exception.
		// Normal tap tests execute instantly, tapsuite tests do not execute until after
		// the suite function has returned and the before task has finished.
		t.end();
	});

	s.only('this is the only tap test that will run', (t) => {
		// s.only is exactly like s.test, except that when a test
		// is created via .only, all other tests in the suite will
		// be ignored.
		t.end();
	});

	// Todo and Skip tests are identical to passing `skip:true` or `todo:true` on the
	// test options object. Tap will report the skipped tests like usual. The functions
	// exist to make marking these tests a little easier

	s.todo('this is a test that needs to be written');

	s.skip('this is a test that is being skipped', (t) => {
		t.end();
	});

	// Unlike with node-tap, a suite function executes synchronously and does not
	// require calling an s.end() function, which does not even exist.

}).then(() => {
	// The suite function returns a promise which resolves when the suite completes
})
```
