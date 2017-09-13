import fs = require('fs');
import GitHubApi = require('github');

import { getGlobalSettings, createGlobalSettings } from '../settings';
import { getRemotes, getLocalBranches } from '../local-repo';
import { bindNodeCallback } from '../promise';
import { authenticate /*, createPR, assignToMe, assignReviewers */ } from '../github';

const api = new GitHubApi();

export default function main() {
    Promise.all([ ensureInRepo(), ensurePullQuesterInitialized() ])
        .then(() => getGlobalSettings())
        .catch(() => createGlobalSettings())
        .then(settings => settings || createGlobalSettings())
        .do(settings => authenticate(api, settings))
        .then(settings => Promise.all([ settings, getRemotes(), getLocalBranches() ]))
        // .then(([, repo ]) => createPR(api, repo))
        // .then(pr => Promise.all([ assignToMe(api, pr), assignReviewers(api, pr) ]))
        .then(console.log.bind(console))
        .catch(console.error.bind(console));
}

function ensureInRepo(): Promise<void> {
    return bindNodeCallback(fs.stat, '.git');
}

function ensurePullQuesterInitialized(): Promise<void> {
    return bindNodeCallback(fs.stat, '.pullquester');
}
