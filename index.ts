import 'promise-do';

import fs = require('fs');
import path = require('path');
import os = require('os');
import GitHubApi = require('github');
import inquirer = require('inquirer');
import { ISettings, getGlobalSettings, saveGlobalSettings, createGlobalSettings } from './src/settings';
import { getRemote, getLocalBranches } from './src/local-repo';
import { bindNodeCallback } from './src/promise';

type BranchName = string;

const api = new GitHubApi({
    debug: true
});

interface PullRequest {
    number: number;
}

// Main
getGlobalSettings()
    .do(() => Promise.all([ ensureInRepo(), ensurePullQuesterInitialized() ]))
    .then(settings => settings || createGlobalSettings())
    .do(authenticate)
    .then(settings => Promise.all([ settings, getRemote(), getLocalBranches() ]))
    // .then(createPR)
    .then(console.log.bind(console))
    .catch(console.error.bind(console));

function ensureInRepo(): Promise<void> {
    return bindNodeCallback(fs.stat, '.git');
}

function ensurePullQuesterInitialized(): Promise<void> {
    return bindNodeCallback(fs.stat, '.pullquester');
}

function authenticate(settings: ISettings): void {
    api.authenticate({
        type: 'token',
        token: settings.authToken
    });
}

function createPR(settings: ISettings): Promise<void> {
    const questions: inquirer.Questions = [
        {
            type: 'list',
            name: 'head',
            message: 'What do you want to PR?'
        },
        {
            type: 'input',
            name: 'base',
            message: 'What is the base branch?',
            default: 'master'
        },
        {
            type: 'input',
            name: 'title',
            message: 'PR Title',
            default: 'My Super PR'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Type in a summary of your changes'
        },
        {
            type: 'checkbox',
            name: 'reviewers',
            message: 'Select Reviewers',
            choices: [ 'One', 'Two', 'Three' ]
        },
        {
            type: 'list',
            name: 'milestone',
            message: 'Milestone',
            choices: [ 'None', '1.9', '1.10', '1.11', '1.12' ]
        }
    ];

    let answers = null;

    return getLocalBranches()
        .then(localBranches => {
            questions[0].choices = localBranches.map(b => b.name)
            return inquirer.prompt(questions);
        })
        .then(inquirerAnswers => answers = inquirerAnswers)
        .then(answers => api.pullRequests.create({
            owner: '',
            repo: '',
            title: '',
            head: '',
            base: '',
            body: '' as any
        }))
        .do(assignPR)
        .then(assignPRReviewers)
        .then(() => undefined);
}

function assignPR(pr: PullRequest): Promise<void> {
    return api.issues.addAssigneesToIssue({
        owner: '',
        repo: '',
        number: pr.number,
        assignees: [ 'sam.noedel' ]
    });
}

function assignPRReviewers(pr: PullRequest): Promise<void> {
    return api.pullRequests.createReviewRequest({
        owner: '',
        repo: '',
        number: pr.number,
        reviewers: [ ]
    });
}
