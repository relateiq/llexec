llexec
===================================================================================================

# goals:
  * run arbitrary commands in parallel
  * to provide good output buffering for use in build runners / jobs w/a lot of output
  * provide a way to wrap output to distinguish messages from different commands

# not goals:
  * running the same command in parallel on a list of inputs
  * controlling parallelism (adjusting # of processes/workers)
  * job management (starting/stopping background processes)
  * distributed processing (eg: running across machines)

installation
===================================================================================================

`npm install -g llexec`

usage
===================================================================================================

`llexec` is designed to be run as a CLI.

```
llexec - run arbitrary commands in parallel

llexec is designed to take a list of commands, run them in parallel, and perform
output buffering on the results so the output is human-readable.

usage:
  llexec [-w line-wrapper] cmd [, cmd, [...]]

  possible line-wrappers:
    cmdname     prefixes each line with the name of the command
    firstarg    prefixes each line with the first argument (useful for build tools)
    timestamp   prefixes each line with a timestamp

examples:

  llexec -w cmdname 'tsc -p src/' 'scss -w scss/'
  llexec -w firstarg 'make module1' 'make module2'
```


