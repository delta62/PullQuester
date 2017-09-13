import inquirer = require('inquirer');

export const questions: inquirer.Questions = [
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
