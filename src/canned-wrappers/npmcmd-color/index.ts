import { ITaskInfo, ITask } from "../../task";
import * as util from "../../util";

function getCommandName(command: string) {
  return command.replace(/npm run /g, "");
}

let maxCmdLength = null;
export function lineWrapper(taskInfo: ITaskInfo, line: string): string {
  if (maxCmdLength === null) {
    maxCmdLength = util.getMaxLength(
      taskInfo.allTasks.map(t => getCommandName(t.command))
    );
  }

  const taskName = getCommandName(taskInfo.task.command);
  const colorFunc = util.getColorFuncForIndex(taskInfo.taskIndex);

  return colorFunc(util.rightPad(taskName, maxCmdLength) + " |") + " " + line;
}
