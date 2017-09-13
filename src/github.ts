import GitHubApi = require('github');
import inquirer = require('inquirer');

import { RepoContext } from './local-repo';
import { Settings } from './settings';
import { questions } from './questions';

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

export function assignToMe(api: GitHubApi): Promise<void> {
    return api.issues.addAssigneesToIssue({
        owner: '',
        repo: '',
        number: 42,
        assignees: [ 'sam' ]
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

export function createPR(api: GitHubApi, repos: Array<RepoContext>): Promise<PullRequest> {
    const repo = repos.find(r => r.name === 'origin');
    if (!repo) {
        throw new Error('Unable to find origin remote');
    }

    return inquirer.prompt(questions)
        .then(() => api.pullRequests.create({
            owner: repo.owner,
            repo: repo.repo,
            title: '',
            head: '',
            base: '',
            body: '' as any
        }));
}
