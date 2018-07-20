/**
 * 事件
 */
export default class Emitter {
    /** 监听数组 */
    private static listeners = {};

    /** 
     * 注册事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    public static register(name: string, callback: Function) {
        console.log('register')
        console.log(name)
        console.log(callback)
        Emitter.listeners[name] = callback;
    }

    // /**
    //  * 移除事件
    //  * @param name 事件名称
    //  * @param callback 回调函数
    //  * @param context 上下文
    //  */
    // public static remove(name: string, callback: Function, context: any) {
    //     let observers: Observer[] = Emitter.listeners[name];
    //     if (!observers) return;
    //     let length = observers.length;
    //     for (let i = 0; i < length; i++) {
    //         let observer = observers[i];
    //         if (observer.compar(context)) {
    //             observers.splice(i, 1);
    //             break;
    //         }
    //     }
    //     if (observers.length == 0) {
    //         delete Emitter.listeners[name];
    //     }
    // }

    /**
     * 发送事件
     * @param name 事件名称
     */
    public static fire(name: string, watcher?: Function) {
        console.log(name)
        let observer = Emitter.listeners[name] as Function;
        console.log(observer)
        if (observer !== undefined)
            observer(watcher);
    }


}
