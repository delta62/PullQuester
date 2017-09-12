export function bindNodeCallback<T>(fn: Function, ...args: any[]): Promise<T> {
    const fnArgs = args.slice();
    return new Promise((resolve, reject) => {
        fnArgs.push((err: Error, data: T) => {
            if (err) reject(err);
            else resolve(data);
        });
        fn.apply(null, fnArgs);
    });
}
