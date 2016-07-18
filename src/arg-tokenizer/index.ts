// borrowed from yargs parser and syntactically tweaked
// https://github.com/yargs/yargs-parser/blob/master/lib/tokenize-arg-string.js

export function tokenize(argString) {
  if (Array.isArray(argString)) {
    return argString;
  }

  let i = 0;
  let c = null;
  let opening = null;
  let args = [];

  for (let ii = 0; ii < argString.length; ii++) {
    c = argString.charAt(ii);

    // split on spaces unless we're in quotes.
    if (c === ' ' && !opening) {
      i++;
      continue;
    }

    // don't split the string if we're in matching
    // opening or closing single and double quotes.
    if (c === opening) {
      opening = null;
      continue;
    } else if ((c === "'" || c === '"') && !opening) {
      opening = c;
      continue;
    }

    if (!args[i]) {
      args[i] = '';
    }
    args[i] += c;
  }

  return args;
}
