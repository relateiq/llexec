const childProcess = require('child_process');

import { BasicColoredOutput, ColorPalette } from '../buffered-output/colored-output';
import { ITask } from '../task';

const possibleColors = Object.keys(ColorPalette);

export class Executor {
  public taskList: ITask[] = [];

  constructor() { }

  private _run(task: ITask, taskIndex: number, resolve: Function, reject: Function): void {
    let child = childProcess.spawn(task.command, task.args);
    let taskColor = possibleColors[taskIndex % possibleColors.length];
    let stdoutBuf = new BasicColoredOutput(taskColor, child.stdout);

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

    return new Promise((resolve, reject) => {
      this._run(task, index, resolve, reject);
    });
  }

  public run(tasks: ITask[]): Promise<any[]> {
    const promiseList = tasks.map(this._runTask.bind(this));
    return Promise.all(promiseList);
  }
}

