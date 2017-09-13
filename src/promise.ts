/*tslint:disable:ban-types*/
export function bindNodeCallback<T>(fn: Function, ...args: Array<any>): Promise<T> {
/*tslint:enable:ban-types*/
    const fnArgs = args.slice();
    return new Promise((resolve, reject) => {
        fnArgs.push((err: Error, data: T) => {
            if (err) reject(err);
            else resolve(data);
        });
        fn.apply(null, fnArgs);
    });
}
