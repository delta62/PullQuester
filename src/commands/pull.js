'use strict';
var inquirer = require('inquirer');
var exec =  require('child_process').exec;
var _ = require('lodash');
var Q = require('q');
var temp = require('temp');
var fs = require('fs');
temp.track();

var config = require('./../../config');
var template = require('./../../template');

module.exports = function () {
    var gitBranchPromise = Q.nfcall(exec, 'git rev-parse --abbrev-ref HEAD').catch(function (error) {
        console.log('This is not a git repo or there was an error getting the branch name', error);
    });

    Q.all(gitBranchPromise)
        .then(function (results) {
        var branchname = results[0].replace(/^\s+|\s+$/g, ''),
            storyIdMatches = branchname.match(/^\d+/),
            storyId = storyIdMatches ? storyIdMatches[0] : '',
            templateValue = template.get(),
            configValue = config.get(),
            promptQuestions = [
                {
                    name: 'title',
                    type: 'input',
                    default: branchname,
                    message: 'Title:'
                },
                {
                    name: 'storyId',
                    type: 'input',
                    default: storyId,
                    message: 'StoryId:'
                },
                {
                    name: 'description',
                    type: 'input',
                    default: '',
                    message: 'Description of changes:'
                }
            ];

        if (!config) {
            console.log('Error: Pull not initialized pull --init to build one for your repository');
            return;
        }

        if (configValue.requirements) {
            promptQuestions.push({
                name: 'additionalRequirements',
                type: 'checkbox',
                message: 'Select additional requirements:',
                choices: configValue.requirements
            });
        }

        var separator = [new inquirer.Separator()];

        if (configValue.developers) {
            promptQuestions.push({
                name: 'reviewers',
                type: 'checkbox',
                message: 'Select reviewers:',
                choices: _.sortBy(configValue.developers, 'name').concat(separator)
            });
        }


        if (configValue.testers) {
            promptQuestions.push({
                name: 'testers',
                type: 'checkbox',
                message: 'Select testers:',
                choices: _.sortBy(configValue.testers, 'name').concat(separator)
            });
        }

        if (configValue.questions) {
            var questions = _.map(configValue.questions, function(question) {
                if (question.when) {
                    var conditional = question.when;
                    question.when = function(answers) {
                        return answers[conditional];
                    };
                }

                return question;
            });

            promptQuestions.push.apply(promptQuestions, questions);
        }

        inquirer.prompt(promptQuestions, function (answers) {
            answers.branchname = branchname;
            answers.buildTypeId = configValue.buildTypeId;
            var pullrequest = _.template(templateValue, answers, {
                variable: 'config'
            });


            var pullFile = temp.openSync();
            fs.writeSync(pullFile.fd, pullrequest);

            var request = 'hub pull-request -F ' + pullFile.path;
            console.log(request);
            var env = process.env;
            env.REQUEST = pullrequest;
            exec(request, {env: env}, function (error, stdout) {
                if (error) {
                    console.log('Pull failed:');
                    console.log(error);
                    return;
                }
                console.log('Pull success');
                console.log(stdout);
                temp.cleanup();
            });
        });

    });
};