
var suite = require('../');
var stepper = require('stepperbox')();
var assert = require('assert');

function wait (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

var waitingStage = 0;
stepper.add(async (method) => {
	assert.strictEqual(method, 'before');

	waitingStage++;
	await wait(500);
	waitingStage++;
});
stepper.add(async (method) => {
	assert.strictEqual(method, 'beforeEach');
	assert.strictEqual(waitingStage, 2, 'before did not wait');

	waitingStage++;
	await wait(500);
	waitingStage++;
});
stepper.add(async (method) => {
	assert.strictEqual(method, 'test1');
	assert.strictEqual(waitingStage, 4, 'beforeEach did not wait');

	waitingStage++;
	await wait(500);
	waitingStage++;
});
stepper.add(async (method) => {
	assert.strictEqual(method, 'afterEach');
	assert.strictEqual(waitingStage, 6, 'test run did not wait');

	waitingStage++;
	await wait(500);
	waitingStage++;
});

stepper.add(async (method) => {
	assert.strictEqual(method, 'after');
	assert.strictEqual(waitingStage, 8, 'afterEach did not wait');

	waitingStage++;
	await wait(500);
	waitingStage++;
});

suite('test A', (s) => {

	s.before(stepper.as('before'));
	s.after(stepper.as('after'));
	s.beforeEach(stepper.as('beforeEach'));
	s.afterEach(stepper.as('afterEach'));

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
