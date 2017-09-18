import inquirer = require('inquirer');

export interface PRAnswers {
    head: string;
    base: string;
    title: string;
    body: string;
}

export function buildPRQuestions(localBranches: Array<string>): inquirer.Questions {
    return [
        {
            type: 'list',
            name: 'head',
            message: 'What do you want to PR?',
            choices: localBranches
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
            message: 'PR Title'
        },
        {
            type: 'input',
            name: 'body',
            message: 'Type in a summary of your changes'
        }
    ];
}
