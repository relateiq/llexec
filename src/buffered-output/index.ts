export { ColorPalette } from "./colors";

export class BufferedOutput {
  public static MAX_BUFFER_LINES: number = 10;

  public flushTimeout: number = 250;
  public dataStream: any;
  public lineWrapper: (line: string) => string;

  private _lineBuffer: string[] = [];
  private _bufferTimeout: NodeJS.Timeout = null;

  constructor(
    dataStream: any,
    lineWrapper: (line: string) => string,
    flushTimeout: number = 250
  ) {
    this.dataStream = dataStream;
    this.flushTimeout = flushTimeout;
    this.lineWrapper = lineWrapper;

    this.dataStream.on("data", this.handleData.bind(this));
    this.dataStream.on("close", this.flush.bind(this));
  }

  public handleData(data) {
    data
      .toString()
      .trim()
      .split(/\n/g)
      .map(this.lineWrapper.bind(this))
      .forEach(l => this._lineBuffer.push(l));

    clearTimeout(this._bufferTimeout);

    if (this._lineBuffer.length > BufferedOutput.MAX_BUFFER_LINES) {
      this.flush();
      return;
    }

    this._bufferTimeout = setTimeout(this.flush.bind(this), this.flushTimeout);
  }

  public flush() {
    if (!this._lineBuffer.length) {
      return;
    }

    console.log(this._lineBuffer.join("\n"));
    this._lineBuffer = [];
  }

  public done() {
    clearTimeout(this._bufferTimeout);
    this.flush();
  }
}
