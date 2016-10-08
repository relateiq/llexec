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

    let child = childProcess.spawn('sh', ['-c', task.command]);

    child.on('close', code => {
      // flush the buffers
      stdoutBuf.done();
      stderrBuf.done();
    });

    child.on('exit', (code, signal) => {
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
    const curPid = process.pid - 1; // not sure how reliable this is...
    const childProcs = childProcess.execSync(`ps -A -o pgid,pid | grep -E '^${curPid}' | awk '{ print $2 }'`);

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

