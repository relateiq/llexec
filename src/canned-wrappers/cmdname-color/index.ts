import { ITaskInfo, ITask } from '../../task';
import * as util from '../../util';

const colors = require('colors');

let maxCmdLength = null;
export function lineWrapper(taskInfo: ITaskInfo, line: string): string {
  if (maxCmdLength === null) {
    maxCmdLength = util.getMaxCmdLength(taskInfo.allTasks);
  }

  const taskName = taskInfo.task.command;
  const colorFunc = util.getColorFuncForIndex(taskInfo.taskIndex);

  return colorFunc(util.rightPad(taskName, maxCmdLength) + ' |') + ' ' + line;
}

