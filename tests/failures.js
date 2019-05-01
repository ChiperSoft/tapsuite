/* eslint no-unreachable:0 */
var suite = require('../');
var stepper = require('stepperbox')();
var assert = require('assert');

return; // remove this to run the test

stepper.add((method) => {
	assert.strictEqual(method, 'before');
	return Promise.resolve();
});
stepper.add((method, cb) => {
	assert.strictEqual(method, 'beforeEach');
	cb();
});
stepper.add((method) => {
	assert.strictEqual(method, 'test1');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.strictEqual(method, 'afterEach');
	return Promise.resolve();
});

stepper.add((method, cb) => {
	assert.strictEqual(method, 'beforeEach');
	cb();
});
stepper.add((method) => {
	assert.strictEqual(method, 'afterEach');
	return Promise.resolve();
});

stepper.add((method) => {
	assert.strictEqual(method, 'beforeEach');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.strictEqual(method, 'test2');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.strictEqual(method, 'afterEach');
	return Promise.resolve();
});

stepper.add((method, cb) => {
	assert.strictEqual(method, 'after');
	cb();
});


suite('test A', (s) => {

	s.before(stepper.as('before'));
	s.after(stepper.as('after'));
	s.beforeEach(stepper.as('beforeEach'));
	s.afterEach(stepper.as('afterEach'));

	s.test('test1', stepper.as('test1'));
	s.test('failure', async () => { throw new Error('This test fails'); });
	s.test('test2', stepper.as('test2'));

})
	.catch(stepper.as('tapFailed'))
	.then((result) => {
		assert(result);
		assert.strictEqual(stepper.getStep(), 10, 'not all steps were called');
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
