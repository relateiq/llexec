import { BufferedOutput } from '../buffered-output';
import { ITask, ITaskInfo } from '../task';

const childProcess = require('child_process');

export class Executor {
  public taskList: ITask[] = [];
  private _maxCmdLength: number = 0;
  private _runningProcs: any = [];

  constructor(public lineWrapper?: (taskInfo: ITaskInfo, line: string) => string) {
  }

  private _run(task: ITask, taskIndex: number, resolve: Function, reject: Function): void {
    let child = childProcess.exec(task.command, {}, (error) => {
      // just exit quietly if no error
      if (!error) {
        resolve(0);
        return;
      }

      // otherwise bubble the error up
      if (error['killed']) {
        reject(false);
      }
      else {
        reject(error);
      }
      this.killall();
    });

    this._runningProcs[taskIndex] = child;

    let [ cmd, args ] = task.command.split(/\s/);

    let taskInfo = {
      task: task,
      commandName: cmd,
      argStr: args || '',
      allTasks: this.taskList,
      taskIndex: taskIndex
    };

    let stdoutBuf = new BufferedOutput(child.stdout, line => {
      if (!this.lineWrapper) {
        return line;
      }

      return this.lineWrapper(taskInfo, line);
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
    this._runningProcs.forEach(proc => proc && proc.kill());
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

