export declare type PromiseExecutor<T> = (resolve: Action<T | PromiseLike<T>>, reject: Action<any>) => void;
export declare enum PromiseState {
    pending = 0,
    fulfilled = 1,
    rejected = 2,
}
export declare class NeoPromise<T> implements PromiseLike<T> {
    private _state;
    private _callback_attached;
    private _value;
    private _reason;
    private _onFulfilled;
    private _onRejected;
    private _next_promise;
    private _tag;
    constructor(executor: PromiseExecutor<T>);
    static all(iterable: NeoPromise<any>[]): NeoPromise<any[]>;
    catch<TResult>(onRejected: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
    private checkState();
    private reject(reason);
    static reject(reason: any): PromiseLike<any>;
    private resolve(value);
    static resolve<T>(value: T | PromiseLike<T>): PromiseLike<T>;
    then<TResult>(onFulfilled?: Func<T, TResult | PromiseLike<TResult>>, onRejected?: Func<any, TResult | PromiseLike<TResult>>): PromiseLike<TResult>;
}
