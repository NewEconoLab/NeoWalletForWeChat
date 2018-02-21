"use strict";
exports.__esModule = true;
var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["pending"] = 0] = "pending";
    PromiseState[PromiseState["fulfilled"] = 1] = "fulfilled";
    PromiseState[PromiseState["rejected"] = 2] = "rejected";
})(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
var NeoPromise = /** @class */ (function () {
    function NeoPromise(executor) {
        this._state = PromiseState.pending;
        this._callback_attached = false;
        if (executor != null)
            executor(this.resolve.bind(this), this.reject.bind(this));
    }
    NeoPromise.all = function (iterable) {
        return new NeoPromise(function (resolve, reject) {
            if (iterable.length == 0) {
                resolve([]);
                return;
            }
            var results = new Array(iterable.length);
            var rejected = false;
            var onFulfilled = function (result) {
                results[this._tag] = result;
                for (var i = 0; i < iterable.length; i++)
                    if (iterable[i]._state != PromiseState.fulfilled)
                        return;
                resolve(results);
            };
            var onRejected = function (reason) {
                if (!rejected) {
                    rejected = true;
                    reject(reason);
                }
            };
            for (var i = 0; i < iterable.length; i++) {
                iterable[i]._tag = i;
                iterable[i].then(onFulfilled, onRejected);
            }
        });
    };
    NeoPromise.prototype["catch"] = function (onRejected) {
        return this.then(null, onRejected);
    };
    NeoPromise.prototype.checkState = function () {
        if (this._state != PromiseState.pending && this._callback_attached) {
            var callback = this._state == PromiseState.fulfilled ? this._onFulfilled : this._onRejected;
            var arg = this._state == PromiseState.fulfilled ? this._value : this._reason;
            var value = void 0, reason = void 0;
            try {
                value = callback == null ? this : callback.call(this, arg);
            }
            catch (ex) {
                reason = ex;
            }
            if (this._next_promise == null) {
                if (reason != null)
                    return NeoPromise.reject(reason);
                else if (value instanceof NeoPromise)
                    return value;
                else
                    return NeoPromise.resolve(value);
            }
            else {
                if (reason != null)
                    this._next_promise.reject(reason);
                else if (value instanceof NeoPromise)
                    value.then(this.resolve.bind(this._next_promise), this.reject.bind(this._next_promise));
                else
                    this._next_promise.resolve(value);
            }
        }
    };
    NeoPromise.prototype.reject = function (reason) {
        this._state = PromiseState.rejected;
        this._reason = reason;
        this.checkState();
    };
    NeoPromise.reject = function (reason) {
        return new NeoPromise(function (resolve, reject) { return reject(reason); });
    };
    NeoPromise.prototype.resolve = function (value) {
        this._state = PromiseState.fulfilled;
        this._value = value;
        this.checkState();
    };
    NeoPromise.resolve = function (value) {
        if (value instanceof NeoPromise)
            return value;
        return new NeoPromise(function (resolve, reject) { return resolve(value); });
    };
    NeoPromise.prototype.then = function (onFulfilled, onRejected) {
        this._onFulfilled = onFulfilled;
        this._onRejected = onRejected;
        this._callback_attached = true;
        if (this._state == PromiseState.pending) {
            this._next_promise = new NeoPromise(null);
            return this._next_promise;
        }
        else {
            return this.checkState();
        }
    };
    return NeoPromise;
}());
exports.NeoPromise = NeoPromise;
