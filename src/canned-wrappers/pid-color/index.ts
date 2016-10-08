import { ITaskInfo, ITask } from '../../task';
import * as util from '../../util';

const colors = require('colors');

export function lineWrapper(taskInfo: ITaskInfo, line: string): string {
  const colorFunc = util.getColorFuncForIndex(taskInfo.taskIndex);
  return colorFunc(util.rightPad(process.pid.toString(), 7) + ' |') + ' ' + line;
}

