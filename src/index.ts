#!/usr/bin/env node

///<reference path="../typings/index.d.ts" />

import { Executor } from './executor';
import { lineWrapper as cmdnameWrapper } from './canned-wrappers/cmdname-color';
import { lineWrapper as firstargWrapper } from './canned-wrappers/firstarg-color';
import { lineWrapper as timestampWrapper } from './canned-wrappers/timestamp-color';

const lineWrappers = {
  'cmdname': cmdnameWrapper,
  'firstarg': firstargWrapper,
  'timestamp': timestampWrapper
};

const argv = require('yargs').argv;

if (argv._.length < 1) {
  console.log('Run arbitrary commands in parallel');
  console.log('');
  console.log('   llexec "cmd 1" "cmd 2" "cmd 3"');
  process.exit(1);
}

const subcommands = argv._.map(commandString => {
  commandString = commandString.replace(/:::\s*/, '');

  return { command: commandString };
});

const instance = new Executor(lineWrappers[argv.w]);

instance.run(subcommands).then(function(exitCode) {
  process.exit();
});

