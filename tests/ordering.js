
var suite = require('../');
var stepper = require('stepperbox')();
var assert = require('assert');

stepper.add((method) => {
	assert.equal(method, 'before');
	return Promise.resolve();
});
stepper.add((method, cb) => {
	assert.equal(method, 'beforeEach');
	cb()
});
stepper.add((method) => {
	assert.equal(method, 'test1');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.equal(method, 'afterEach');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.equal(method, 'beforeEach');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.equal(method, 'test2');
	return Promise.resolve();
});
stepper.add((method) => {
	assert.equal(method, 'afterEach');
	return Promise.resolve();
});
stepper.add((method, cb) => {
	assert.equal(method, 'after');
	cb();
});

suite('test A', (s) => {

	s.before(stepper.as('before'));
	s.after(stepper.as('after'));
	s.beforeEach(stepper.as('beforeEach'));
	s.afterEach(stepper.as('afterEach'));

	s.test('test1', stepper.as('test1'));
	s.skip('skipped', stepper.as('skipped'));
	s.todo('todo', stepper.as('todo'));
	s.test('test2', stepper.as('test2'));

}).then((result) => {
	assert.equal(stepper.getStep(), 8, 'not all steps were called');
})
