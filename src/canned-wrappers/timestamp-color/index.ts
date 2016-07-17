import * as util from '../../util';
import { ITask, ITaskInfo } from '../../task';

function getTimestamp() {
  var d = new Date();
  let str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} - ${d.toLocaleTimeString()}`;
  return str;
}

export function lineWrapper(taskInfo: ITaskInfo, line: string): string {
  const colorFunc = util.getColorFuncForIndex(taskInfo.taskIndex);
  return colorFunc(getTimestamp() + ' |') + ' ' + line;
}
