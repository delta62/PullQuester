import chalk = require('chalk');

const log = console.log;

export interface PullQuesterError extends Error {
    code?: number | string;
    headers?: { [name: string]: string };
}

export function success(message: string) {
    log(chalk.green(message));
}

export function error(err: PullQuesterError) {
    let code = 0;
    if (typeof err.code === 'string') {
        code = parseInt(err.code, 10);
    } else if (typeof err.code === 'number') {
        code = err.code;
    }

    const formattedMessage = formatError(err);
    const helpMessage = formatErrorHelp(code);
    log(chalk.red(`Got status code ${code} from server:`), formattedMessage);
    if (helpMessage) log(helpMessage);
}

function formatError(err: PullQuesterError) {
    if (err.headers) {
        if (/json/.test(err.headers['content-type'])) {
            const json = JSON.parse(err.message);
            return json.message;
        }
    }

    return err.message;
}

function formatErrorHelp(code: number | undefined) {
    switch (code) {
        case 401:
            return 'Ensure that you have a valid auth token in your ~/.pullquester.json file.';
        case 500:
            return 'Are you connected to the internet?';
        default:
            return '';
    }
}
