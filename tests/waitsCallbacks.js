
var suite = require('../');
var stepper = require('stepperbox')();
var assert = require('assert');

function wait (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

var waitingStage = 0;
stepper.add((method, cb) => {
	assert.strictEqual(method, 'before');

	waitingStage++;
	wait(500).then(() => {
		waitingStage++;
		cb();
	}).catch(cb);
});
stepper.add((method, cb) => {
	assert.strictEqual(method, 'beforeEach');
	assert.strictEqual(waitingStage, 2, 'before did not wait');

	waitingStage++;
	wait(500).then(() => {
		waitingStage++;
		cb();
	}).catch(cb);
});
stepper.add((method, t) => {
	assert.strictEqual(method, 'test1');
	assert.strictEqual(waitingStage, 4, 'beforeEach did not wait');

	waitingStage++;
	wait(500).then(() => {
		waitingStage++;
		t.end();
	}).catch(t.end);
});
stepper.add((method, cb) => {
	assert.strictEqual(method, 'afterEach');
	assert.strictEqual(waitingStage, 6, 'test run did not wait');

	waitingStage++;
	wait(500).then(() => {
		waitingStage++;
		cb();
	}).catch(cb);
});

stepper.add((method, cb) => {
	assert.strictEqual(method, 'after');
	assert.strictEqual(waitingStage, 8, 'afterEach did not wait');

	waitingStage++;
	wait(500).then(() => {
		waitingStage++;
		cb();
	}).catch(cb);
});

suite('test A', (s) => {

	s.before((cb) => stepper('before', cb));
	s.after((cb) => stepper('after', cb));
	s.beforeEach((cb) => stepper('beforeEach', cb));
	s.afterEach((cb) => stepper('afterEach', cb));

	s.test('test1', stepper.as('test1'));

})
	.then(() => {
		assert.strictEqual(waitingStage, 10, 'after did not wait');
		assert.strictEqual(stepper.getStep(), 5, 'not all steps were called');
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
