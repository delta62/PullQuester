import Handlebars = require('handlebars');
import fs = require('fs');
import { bindNodeCallback } from './promise';

const PULLQUESTER_DIR = '.pullquester';

export function initTemplate(profile: string | null): Promise<void> {
    return ensurePullQuesterDir()
        .then(() => createTemplate(profile));
}

export function generateDescription(template: string) {
    return Handlebars.compile(template)({ });
}

function ensurePullQuesterDir(): Promise<void> {
    return bindNodeCallback(fs.stat, PULLQUESTER_DIR)
        .catch(() => bindNodeCallback(fs.mkdir, PULLQUESTER_DIR))
        .then(() => undefined);
}

function createTemplate(profile: string | null): Promise<void> {
    const filename = profile
        ? `pullrequest.${profile}.json`
        : 'pullrequest.json';

    return bindNodeCallback(fs.readFile, '', { encoding: 'utf8' })
        .then(template => bindNodeCallback(fs.writeFile, filename, template))
        .then(() => undefined);
}
