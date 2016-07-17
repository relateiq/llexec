export interface ITask {
  command: string;
  args?: string[];
}

export class Task implements ITask {
  command: string;
  args: string[];
}

