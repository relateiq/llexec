import { ITaskInfo, ITask } from '../../task';
import * as util from '../../util';

const colors = require('colors');

let maxCmdLength = null;

function getFirstArg(command: string) {
  return command.split(/\s/g)[1] || '';
}

export function lineWrapper(taskInfo: ITaskInfo, line: string): string {
  if (maxCmdLength === null) {
    let firstArgs = taskInfo.allTasks.map(task => {
      return getFirstArg(task.command);
    });

    maxCmdLength = util.getMaxLength(firstArgs);
  }

  const taskName = getFirstArg(taskInfo.task.command);
  const colorFunc = util.getColorFuncForIndex(taskInfo.taskIndex);

  return colorFunc(util.rightPad(taskName, maxCmdLength) + ' |') + ' ' + line;
}

