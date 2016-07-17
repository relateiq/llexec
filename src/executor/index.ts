import { BufferedOutput } from '../buffered-output';
import { ITask, ITaskInfo } from '../task';

const childProcess = require('child_process');

export class Executor {
  public taskList: ITask[] = [];
  private _maxCmdLength: number = 0;

  constructor(public lineWrapper?: (taskInfo: ITaskInfo, line: string) => string) {
  }

  private _run(task: ITask, taskIndex: number, resolve: Function, reject: Function): void {
    let child = childProcess.exec(task.command);

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

    child.on('close', (code) => {
      // flush the buffers
      stdoutBuf.done();

      // resolve promise with the exit code
      if (code > 0) {
        reject(code);
      }
      else {
        resolve(true);
      }
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

  public run(tasks: ITask[]): Promise<any[]> {
    const promiseList = tasks.map(this._runTask.bind(this));
    return Promise.all(promiseList);
  }
}

