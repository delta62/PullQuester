'use strict';
var program = require('commander');

function noCommandRan() {
    if (program.args.length === 0) {
        return true;
    }

    var command = program.args[0];

    return !(command === 'install' || command === 'init');
}

function enumFilter() {
    var args = arguments;
    return function(val, defaultValue) {
        for (var i = 0; i < args.length; i++) {
            if (val.toLowerCase() === args[i]) {
                return args[i];
            }
        }

        return defaultValue;
    }
}

program
    .option('-i, --id <id>', 'Id for the keyed template to use')
    .version('0.3.0');

program.command('install')
    .description('Install the dependencies of this tool')
    .action(require('./src/commands/install'));

program.command('init [id]')
    .description('Initialize a repo to use this tool')
    .option(
        '-s --source <value>',
        'specify which type of source to get users from (org|collab|team)',
        enumFilter('org', 'collab', 'team'),
        'org')
    .action(function(id, options) {
        require('./src/commands/init')(id, options.source);
    });

program.parse(process.argv);

if (noCommandRan()) {
    require('./src/commands/pull')(program.id || program.args[0]);
}
