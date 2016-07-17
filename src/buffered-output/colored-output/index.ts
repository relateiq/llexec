import { BufferedOutput } from '../';

const colors = require('colors');

export const ColorPalette = {
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  MAGENTA: 'magenta',
  CYAN: 'cyan',
  WHITE: 'white',
  BLACK: 'black',
  RED: 'red',
  GRAY: 'gray'
};

export class BasicColoredOutput extends BufferedOutput {
  public color: string = ColorPalette.BLACK;

  constructor(jobColor: string, dataStream: any, flushTimeout?: number) {
    super(dataStream, flushTimeout);

    this.color = jobColor;
  }

  public wrapLine(line) {
    let colorFunc = colors[ColorPalette[this.color]];
    return colorFunc(this._formattedTimestamp() + '> ') + line;
  }
}
