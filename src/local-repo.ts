import path = require('path');
import fs = require('fs');
import { bindNodeCallback } from './promise';

interface Branch {
    name: string;
}

interface RepoContext {
    name: string;
    repo: string;
    owner: string;
}

export function getLocalBranches(): Promise<Array<Branch>> {
    const gitConfigFilePath = path.join('.git', 'refs', 'heads');
    return bindNodeCallback(fs.readdir, gitConfigFilePath)
        .then((files: Array<string>) => files.map(f => ({ name: f })));
}

export function getRemote(): Promise<RepoContext> {
    const gitConfigFilePath = path.join('.git', 'config');
    return bindNodeCallback(fs.readFile, gitConfigFilePath, { encoding: 'utf8' })
        .then((config: string) => {
            const remote = parseRemotes(config).find(r => r.name === 'origin');
            if (!remote) {
                throw new Error('Unable to determine remote');
            }
            return remote;
        });
}

function parseRemotes(configText: string): Array<RepoContext> {
    const matches = configText.match(/\[remote[^\]]*\](?:\n[^[]*)/gm) || [ ];

    return matches.reduce((acc, m) => {
        const lines = m.split('\n');

        const nameMatches = lines[0].match(/\[remote "(.*)"\]/);
        if (!nameMatches || nameMatches.length !== 2) {
            return acc;
        }
        const name = nameMatches[1];

        const metaLines = lines.slice(1, lines.length - 1);
        const url = metaLines.find(l => /url\s*=/.test(l));
        if (!url) {
            return acc;
        }

        const parsedUrl = parseRepoUrl(url);
        if (!parsedUrl) {
            return acc;
        }

        acc.push({
            name,
            repo: parsedUrl.repo,
            owner: parsedUrl.owner
        });

        return acc;
    }, [ ] as Array<RepoContext>);
}

function parseRepoUrl(url: string): { repo: string, owner: string } | null {
    const urlMatch = url.match(/\w+@[^:]+:([^\/]+)\/(.+)\.git/);
    if (!urlMatch) return null;
    return {
        owner: urlMatch[1],
        repo: urlMatch[2]
    };
}

