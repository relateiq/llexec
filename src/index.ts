#!/usr/bin/env node
// vim: ft=typescript
import { Executor } from "./executor";
import { lineWrapper as cmdnameWrapper } from "./canned-wrappers/cmdname-color";
import { lineWrapper as firstargWrapper } from "./canned-wrappers/firstarg-color";
import { lineWrapper as timestampWrapper } from "./canned-wrappers/timestamp-color";
import { lineWrapper as pidWrapper } from "./canned-wrappers/pid-color";

const lineWrappers = {
  cmdname: cmdnameWrapper,
  firstarg: firstargWrapper,
  timestamp: timestampWrapper,
  pid: pidWrapper
};

const argv = require("yargs").argv;

if (argv._.length < 1) {
  console.log(`
llexec - run arbitrary commands in parallel

llexec is designed to take a list of commands, run them in parallel, and perform
output buffering on the results so the output is human-readable.

usage:
  llexec [-w line-wrapper] cmd [, cmd, [...]]

  possible line-wrappers:
    cmdname:    prefixes each line with the name of the command
    firstarg:   prefixes each line with the first argument (useful for build tools)
    timestamp:  prefixes each line with a timestamp

examples:

  llexec -w cmdname 'tsc -p src/' 'scss -w scss/'
  llexec -w firstarg 'make module1' 'make module2'
`);
  process.exit(1);
}

const subcommands = argv._.map(commandString => {
  commandString = commandString.replace(/:::\s*/, "");

  return { command: commandString };
});

const instance = new Executor(lineWrappers[argv.w]);

instance
  .run(subcommands)
  .then(function() {
    process.exit(0);
  })
  .catch(function(failedJobs) {
    failedJobs.forEach(j =>
      console.error(`[llexec: (${process.pid}) job failed]: ${j.command}`)
    );
    instance.killall();
    process.exit(1);
  });
