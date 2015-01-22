"use strict";

module.exports = function custom(obj) {

	return function *custom(next) {

		this.body = merge(this.body || {}, obj);
		yield *next;
	};
};

function merge(a, b) {
	if (!b) {
		return a;
	}

	for (let prop in b) {
		a[prop] = b[prop];
	}

	return a;
}