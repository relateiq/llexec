///<reference path="../typings/index.d.ts" />

import { Executor } from './executor';

let instance = new Executor();

instance.run([
  { command: './testcmd' },
  { command: './testcmd' },
  { command: './testcmd' },
  { command: './testcmd' }
]).then(function(exitCode) {
  console.log('--- ALL DONE! ---');
});
