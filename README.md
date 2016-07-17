llexec
===================================================================================================

# goals:
  * run arbitrary commands in parallel as if it was a single process
  * to provide good output buffering for use in build runners / jobs w/a lot of output

# not goals:
  * running the same command in parallel on a list of inputs
  * controlling parallelism (adjusting # of processes/workers)
  * job management (starting/stopping background processes)
  * distributed processing (eg: running across machines)

# requirements:
  * accept command list as arguments or from STDIN
  * run commands in parallel processes
  * ability to buffer by N lines, by N ms, or not at all
  * have a predictable exit code that conforms to normal UNIX codes
  * ability to wrap lines with additional content (timestamps, teamcity msgs, etc.)
  * fail immediately on any subjob failure

# flush modes:
  * every N lines (or 0 for unlimited)
  * every N ms (or 0 for unlimited)
  * if no output in N ms (or 0 for 'no buffering')

examples
===================================================================================================

# js api

```typescript
// configure an instance of llexec with specific flush modes
// and line wrapping strategies
var llconfig = llexec.config({
  flushMode: 'line' | 'period' | 'chunking',
  flushThreshold: 1000,
  wrap: function(commandInfo, lineContent) {
    let line = lineContent;

    if (commandInfo.command.startsWith('iqb')) {
      line = (new Date().toString()) + ' |';
    }

    return line;
  }
});

// create a new job with that configuration
var job = llconfig.tasks([
  'iqb build:ts',
  'iqb build:scss'
  'iqb build:libs'
  'iqb build:templates'
]);

// run the job
executor.run().then(function(results) {
});
```

# cli (shell wrapper around JS API)


# riq-specific wrapper

Wrap the JSAPI in a simple wrapper that handles configuration, line buffering,
special transformations, etc. and just lets you pipe in the commands you need.


