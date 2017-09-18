import fs = require('fs');
import path = require('path');
import { bindNodeCallback } from './promise';

const PULLQUESTER_DIR = '.pullquester';

export function initTemplate(profile: string | null): Promise<void> {
    return ensurePullQuesterDir()
        .then(() => createTemplate(profile));
}

export function generateDescription(template: string): string {
    return 'this is a description' + template;
}

function ensurePullQuesterDir(): Promise<void> {
    return bindNodeCallback(fs.stat, PULLQUESTER_DIR)
        .catch(() => bindNodeCallback(fs.mkdir, PULLQUESTER_DIR))
        .then(() => undefined);
}

function createTemplate(profile: string | null): Promise<void> {
    const sourceFile = path.join(__dirname, 'templates', '');
    const filename = profile
        ? `pullrequest.${profile}.json`
        : 'pullrequest.json';

    return bindNodeCallback(fs.readFile, sourceFile, { encoding: 'utf8' })
        .then(template => bindNodeCallback(fs.writeFile, filename, template))
        .then(() => undefined);
}
