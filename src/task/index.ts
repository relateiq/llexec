export interface ITask {
  command: string;
  args?: string;
}

export class Task implements ITask {
  command: string;
  args: string;
}

export interface ITaskInfo {
  task: ITask,
  commandName: string,
  argStr: string,
  allTasks: ITask[],
  taskIndex: number
}
