import fs = require('fs');
import GitHubApi = require('github');

import { Settings, getGlobalSettings, createGlobalSettings } from '../settings';
import { getRemotes, getLocalBranches, Remote, Branch } from '../local-repo';
import { bindNodeCallback } from '../promise';
import { authenticate, createPR, assignToMe, assignReviewers, getReviewers } from '../github';
import { error, success } from '../log';

export default function main() {
    const api = new GitHubApi();
    let settings: Settings;
    let remotes: Array<Remote>;
    let branches: Array<Branch>;

    Promise.all([ ensureInRepo(), ensurePullQuesterInitialized() ])

        // Initialize settings
        .then(() => getGlobalSettings())
        .catch(() => createGlobalSettings())
        .then((s: Settings) => settings = s)

        // Load API data
        .then(() => authenticate(api, settings))
        .then(() => Promise.all([ getRemotes(), getLocalBranches() ]))
        .then(data => [ remotes, branches ] = data)
        .then(() => getReviewers(api, remotes[0]))

        // Create PR
        .then(() => createPR(api, remotes, branches))
        .then(pr => Promise.all([ assignToMe(api, pr, settings), assignReviewers(api, pr) ]))

        // Done
        .then(() => success('Pull request created'))
        .catch(error);
}

function ensureInRepo(): Promise<void> {
    return bindNodeCallback(fs.stat, '.git');
}

function ensurePullQuesterInitialized(): Promise<void> {
    return bindNodeCallback(fs.stat, '.pullquester');
}
