import { BufferedOutput } from '../buffered-output';
import { ITask, ITaskInfo } from '../task';
import { tokenize } from '../arg-tokenizer';

const childProcess = require('child_process');
const colors = require('colors');

export class Executor {
  public taskList: ITask[] = [];
  private _maxCmdLength: number = 0;
  private _runningProcs: any = [];

  constructor(public lineWrapper?: (taskInfo: ITaskInfo, line: string) => string) {
    process.on('SIGTERM', this._cleanup.bind(this, 'TERM'));
    process.on('SIGINT', this._cleanup.bind(this, 'INT'));
    process.on('SIGHUP', this._cleanup.bind(this, 'HUP'));
  }

  private _cleanup(signal) {
    this.killall();
  }

  private _run(task: ITask, taskIndex: number, resolve: Function, reject: Function): void {
    let [ command, ...args ] = tokenize(task.command);
    let stdoutBuf = null;
    let stderrBuf = null;

    if (!task.command) {
      return;
    }

    // NOTE to myself and others: we can't spawn commands directly here, we have to
    // use `sh -c` for (as of now) 2 reasons:
    //  * commands can start with env vars, such as `FOO=bar cmdname arg`
    //  * yargs parser parses some args as `undefined`, which gets converted to a string when the command runs
    //
    // basically, spawning tasks directly is a tricky use case that's best handled by 
    // the system shell rather than llexec.
    let child = childProcess.spawn('sh', ['-c', task.command]);

    // sometimes the 'exit' event fires before the streams are closed... making it basically useless
    child.on('close', (code, signal) => {
      // flush the buffers
      stdoutBuf.done();
      stderrBuf.done();

      // resolve promise with the exit code
      if (code > 0) {
        // otherwise bubble the error up
        this.killall();
        reject({
          killed: child['killed'],
          command: task.command
        });
      }
      else if (signal) {
        reject({
          killed: child['killed'],
          command: task.command
        });
      }
      else {
        resolve(true);
      }
    });

    this._runningProcs[taskIndex] = child;

    let taskInfo = {
      task: task,
      commandName: command,
      argList: args,
      argStr: args.join(' '),
      allTasks: this.taskList,
      taskIndex: taskIndex
    };

    stdoutBuf = new BufferedOutput(child.stdout, line => {
      if (!this.lineWrapper) {
        return line;
      }

      return this.lineWrapper(taskInfo, line);
    });

    stderrBuf = new BufferedOutput(child.stderr, line => {
      const lineWrapper = this.lineWrapper || ((ti, l) => l);
      return lineWrapper(taskInfo, colors.bgRed(colors.white(line)));
    });
  }

  private _runTask(task: ITask, index: number): Promise<any> {
    this.taskList.push(task);

    if (task.command.length > this._maxCmdLength) {
      this._maxCmdLength = task.command.length;
    }

    return new Promise((resolve, reject) => {
      this._run(task, index, resolve, reject);
    });
  }

  public killall() {
    // not sure how reliable this is... but hopefully pretty darn.
    // it seems to work, but my guess is that it could potentiall break in rare cases
    // and cause bad things to happen... we shall see.
    const curPid = process.pid - 1;

    // this lists all processes along with their process-group id, then filters
    // down to tasks that are in the current process' group.  then awk filders out
    // the process group, leaving a list of processes that should be killed
    //
    // ...i'd love to be able to do this without `ps`...
    const childProcs = childProcess.execSync(`ps -A -o pgid,pid | grep -E '^${curPid}' | awk '{ print $2 }'`);

    // BURN THEM ALL!!
    childProcs.toString().split(/\n/g).forEach(pid => {
      try {
        process.kill(pid);
      } catch (e) {}
    });
  }

  public run(tasks: ITask[]): Promise<any[]> {
    const promiseList = tasks.map(this._runTask.bind(this));

    return Promise.all(promiseList).catch(function() {
      let results = Array.prototype.slice.call(arguments, 0);
      let failedJobs = results.filter(r => r && !r.killed);

      // rethrow the error so the promise rejects
      return Promise.reject(failedJobs);
    });
  }
}

