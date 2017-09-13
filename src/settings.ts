import fs = require('fs');
import path = require('path');
import os = require('os');
import inquirer = require('inquirer');
import { bindNodeCallback } from './promise';

const GLOBAL_CONFIG_FILE = path.join(os.homedir(), '.pullquester.json');

type AuthToken = string;

export interface Settings {
    apiRoot: string;
    authToken: AuthToken;
    userName: string;
}

export function getGlobalSettings(): Promise<Settings | null> {
    return bindNodeCallback(fs.readFile, GLOBAL_CONFIG_FILE, { encoding: 'utf8' })
        .then(JSON.parse);
}

function saveGlobalSettings(settings: Settings): Promise<Settings> {
    const globalSettings = JSON.stringify(settings);
    return bindNodeCallback(fs.writeFile, GLOBAL_CONFIG_FILE, globalSettings, { mode: 0o600 })
        .then(() => settings);
}

export function createGlobalSettings(): Promise<Settings> {
    console.log("It looks like you haven't set PullQuester up yet.");
    console.log('I need some stuff from you before I can start creating PRs!');
    console.log();
    console.log('API keys require the repo permission (and all of its child permissions).');

    const questions: inquirer.Questions = [
        {
            type: 'input',
            name: 'key',
            message: 'API Key',
            validate: validateApiKey
        },
        {
            type: 'input',
            name: 'apiRoot',
            message: 'Where is the root of your GitHub API?',
            default: 'https://api.github.com/v3'
        },
        {
            type: 'input',
            name: 'userName',
            message: 'What is your username?'
        }
    ];

    return inquirer.prompt(questions)
        .then(answers => ({
            apiRoot: answers.apiRoot,
            authToken: answers.key,
            userName: answers.userName
        }))
        .then(saveGlobalSettings)
        .then(settings => {
            console.log("Okay, cool. I've saved that for future use.");
            return settings;
        });
}

function validateApiKey(key: string) {
    if (/^[a-f0-9]{40}$/.test(key)) return true;
    return 'API keys should be 40 characters, including digits and the letters a through f';
}
