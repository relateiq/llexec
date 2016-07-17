const colors = require('colors');

export class BufferedOutput {
  public static MAX_BUFFER_LINES: number = 1000;

  public flushTimeout: number = 250;
  public dataStream: any;

  private _lineBuffer: string[] = [];
  private _bufferTimeout: number = 0;

  constructor(dataStream: any, flushTimeout: number = 250) {
    this.dataStream = dataStream;
    this.flushTimeout = flushTimeout;

    this.dataStream.on('data', this.handleData.bind(this));
  }

  public handleData(data) {
    data
      .toString()
      .trim()
      .split(/\n/g)
      .map(this.wrapLine.bind(this))
      .forEach(l => this._lineBuffer.push(l));

    clearTimeout(this._bufferTimeout);

    if (this._lineBuffer.length > BufferedOutput.MAX_BUFFER_LINES) {
      this.flush();
      return;
    }

    this._bufferTimeout = setTimeout(this.flush.bind(this), this.flushTimeout);
  }

  protected _formattedTimestamp() {
    var d = new Date();
    let str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} - ${d.toLocaleTimeString()}`;
    return str;
  }

  // return the line by default
  // allow manual overriding
  public wrapLine(line) {
    return line;
  }

  public flush() {
    console.log(this._lineBuffer.join('\n'));
    this._lineBuffer = [];
  }

  public done() {
    clearTimeout(this._bufferTimeout);
    this.flush();
  }
}

