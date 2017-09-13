import 'promise-do';

import minimist = require('minimist');

import pullRequestWorkflow from './src/workflows/pullrequest';
import initWorkflow from './src/workflows/init';

const argv = minimist(process.argv.slice(2));

if (argv._[0] === 'init') {
    const profile = argv._[1] || null;
    initWorkflow(profile);
} else {
    pullRequestWorkflow();
}
