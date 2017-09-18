import GitHubApi = require('github');
import inquirer = require('inquirer');

import { Remote, Branch } from './local-repo';
import { Settings } from './settings';
import { PRAnswers, buildPRQuestions } from './questions';

interface Repo {
    owner: string;
    repo: string;
}

interface PullRequest {
    repo: Repo;
    number: number;
}

interface Reviewer {
    name: string;
    username: string;
}

export function getReviewers(api: GitHubApi, repo: Repo): Promise<Array<Reviewer>> {
    return api.repos.getCollaborators({
        repo: repo.repo,
        owner: repo.owner
    });
}

export function assignToMe(api: GitHubApi, pr: PullRequest, settings: Settings): Promise<void> {
    return api.issues.addAssigneesToIssue({
        owner: pr.repo.owner,
        repo: pr.repo.repo,
        number: pr.number,
        assignees: [ settings.userName ]
    });
}

export function assignReviewers(api: GitHubApi, pr: PullRequest): Promise<void> {
    return api.pullRequests.createReviewRequest({
        owner: pr.repo.owner,
        repo: pr.repo.repo,
        number: pr.number,
        reviewers: [ 'sam' ]
    });
}

export function authenticate(api: GitHubApi, settings: Settings): void {
    api.authenticate({
        type: 'token',
        token: settings.authToken
    });
}

export function createPR(api: GitHubApi, repos: Array<Remote>, branches: Array<Branch>): Promise<PullRequest> {
    const remote = repos.find(r => r.name === 'origin');
    if (!remote) {
        throw new Error('Unable to find origin remote');
    }

    return inquirer.prompt(buildPRQuestions(branches.map(b => b.name)))
        .then((answers: PRAnswers) => formatAnswers(answers, remote))
        .then(answers => api.pullRequests.create({
            owner: answers.owner,
            repo: answers.repo,
            title: answers.title,
            head: answers.head,
            base: answers.base,
            body: answers.body as any
        }));
}

function formatAnswers(answers: PRAnswers, remote: Remote): PRAnswers & { owner: string, repo: string } {
    return Object.assign(answers, {
        owner: remote.owner,
        repo: remote.repo
    });
}
