import { ITask } from '../task';
const colors = require('colors');

export const ColorPalette = [
  'blue',    'green', 'yellow',
  'magenta', 'cyan',  'white',
  'black',   'red',   'gray'
];

export function rightPad(str: string, len: number) {
  let strCopy = str;
  for (let x = 0, xl = len - str.length; x < xl; x++) {
    strCopy += ' ';
  }
  return strCopy;
}

export function getMaxLength(strs: string[]): number {
  return strs.reduce((maxLen: number, str: string) => {
    if (str.length > maxLen) {
      return str.length;
    }

    return maxLen;
  }, 0);
}

export function getMaxCmdLength(taskList: ITask[]): number {
  return getMaxLength(taskList.map(t => t.command));
}

export function getColorFuncForIndex(index: number): Function {
  return colors[ColorPalette[index % ColorPalette.length]];
}
