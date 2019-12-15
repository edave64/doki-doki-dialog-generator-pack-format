const valueLineParser = /(\w+)=(.*)/;
const nullChar = String.fromCharCode(0);
const operatorType = "Operator";

const collectionTypeTuple = "Tuple";
const collectionTypeArray = "Array";

/**
 * @param {string} oldStr
 */
function convertCC21File(oldStr) {
  oldStr.replace("\r", "");
  const lines = oldStr.split("\n");
  const values = new Map();
  const parsed = [];
  for (const line of lines) {
    const match = line.match(valueLineParser);
    if (match) {
      values.set(match[1], parse(match[2]));
      parsed.push(["value", match[1]]);
    } else {
      parsed.push(["literal", line]);
    }
  }

  if (!values.has("pose_styles") || !values.has("poses")) {
    throw new Error("This doesn't appear to be a CC2.1 character file");
  }

  const newPoses = [];

  const poses = values.get("poses");
  const poseStyles = values.get("pose_styles");
  const poseOnTop = values.has("pose_ontop")
    ? !!values.has("pose_ontop")
    : false;

  if (poses.length !== poseStyles.length) {
    throw new Error(
      "This file contains different numbers of poses and pose styles"
    );
  }

  for (let i = 0; i < poses.length; ++i) {
    const nps = newPose(poseOnTop, poses[i], poseStyles[i]);
    for (const pose of nps) {
      newPoses.push(pose);
    }
  }

  newPoses.type = collectionTypeArray;
  values.set("poses", newPoses);

  for (let i = 0; i < parsed.length; ++i) {
    const line = parsed[i];
    if (
      line[0] === "value" &&
      (line[1] === "pose_ontop" || line[1] === "pose_styles")
    ) {
      do {
        parsed.splice(i, 1);
        --i;
      } while (parsed[i][0] === "literal" && parsed[i][1].startsWith("#"));
    }
  }

  let outfile = "";

  for (const line of parsed) {
    if (line[0] === "literal") {
      outfile += line[1] + "\n";
    } else if (line[0] === "value") {
      outfile += line[1] + "=" + pythonify(values.get(line[1])) + "\n";
    }
  }

  return outfile;
}

function newPose(onTop, pose, poseStyle) {
  switch (poseStyle) {
    case 0:
      if (onTop) {
        return [pyTuple([pose[0], pose[1], "_head"])];
      } else {
        return [pyTuple(["_head", pose[0], pose[1]])];
      }
    case 1:
      if (onTop) {
        return [pyTuple([pose[0], "_head"])];
      } else {
        return [pyTuple(["_head", pose[0]])];
      }
    case 2:
      return [pyTuple([pose[0]])];
    case 3:
      if (onTop) {
        return [pyTuple([pose[0], "_head_alt"])];
      } else {
        return [pyTuple(["_head_alt", pose[0]])];
      }
    case 4:
      if (onTop) {
        return [pyTuple([pose[0], pyTuple([pose[1], pose[2]]), "_head_alt"])];
      } else {
        return [
          pyTuple([
            pyTuple([pose[1], pose[2]]),
            "_head_alt",
            pyTuple([0, 0]),
            pose[0]
          ])
        ];
      }
    default:
      throw new Error("Unknown pose style");
  }
}

function pyArray(ary) {
  ary.type = collectionTypeArray;
  return ary;
}

function pyTuple(ary) {
  ary.type = collectionTypeTuple;
  return ary;
}

function pythonify(value) {
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    return '"' + value + '"';
  }
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  if (value.type === collectionTypeArray) {
    return `[${value.map(pythonify).join(", ")}]`;
  }
  if (value.type === collectionTypeTuple) {
    return `(${value.map(pythonify).join(", ")})`;
  }
  throw new Error("Unknown value type");
}

function parse(text) {
  const tokens = tokenize(text);
  let context = null;
  const contextStack = [];

  for (const token of tokens) {
    if (token instanceof String) {
      if (token.valueOf() === ",") continue;
      if (token.valueOf() === "]" || token.valueOf() === ")") {
        const newContext = contextStack.pop();
        if (newContext === null) {
          return context;
        } else {
          context = newContext;
        }
      }
      if (token.valueOf() === "(") {
        const newContext = [];
        newContext.type = collectionTypeTuple;
        contextStack.push(context);
        if (context) context.push(newContext);
        context = newContext;
      }
      if (token.valueOf() === "[") {
        const newContext = [];
        newContext.type = collectionTypeArray;
        contextStack.push(context);
        if (context) context.push(newContext);
        context = newContext;
      }
    } else {
      if (context) {
        context.push(token);
      } else {
        return token;
      }
    }
  }

  throw new Error("Toast");
}

function tokenize(text) {
  let currentState = tsNeutral;
  const tokens = [];
  const walker = new StringWalker(text);

  while (currentState != tsEnd) {
    currentState = currentState(walker, tokens);
  }

  return tokens;
}

/**
 * @param {StringWalker} walk
 * @param {Object[]} tokens
 */
function tsNeutral(walk, tokens) {
  switch (walk.current) {
    case '"':
    case "'":
      return tsString;
    case "#":
      return tsLineComment;
    case "(":
    case ")":
    case "[":
    case "]":
    case ",":
      return tsSingleOperator;
    case nullChar:
      return tsEnd;
    default:
      if (walk.current.match(/[a-z]/i)) {
        return tsBoolean;
      }
      if (walk.current.match(/\s/)) {
        walk.next();
        return tsNeutral;
      }
      if (walk.current.match(/\d/)) {
        return tsNumber;
      }
      throw new Error("Unexpected character");
  }
}

/**
 * @param {StringWalker} walk
 * @param {Object[]} tokens
 */
function tsNumber(walk, tokens) {
  let num = "";

  while (walk.current.match(/[\d\.e]/)) {
    num += walk.current;
    walk.next();
  }

  const val = parseFloat(num);
  if (val !== val) {
    throw new Error("Improperly formated number");
  }

  tokens.push(val);
  return tsNeutral;
}

/**
 * @param {StringWalker} walk
 * @param {Object[]} tokens
 */
function tsBoolean(walk, tokens) {
  let word = "";

  while (walk.current.match(/\w/)) {
    word += walk.current;
    walk.next();
  }

  if (word === "True") {
    tokens.push(true);
    return tsNeutral;
  }

  if (word === "False") {
    tokens.push(false);
    return tsNeutral;
  }

  throw new Error("Unrecognized identifier");
}

/**
 * @param {StringWalker} walk
 * @param {Object[]} tokens
 */
function tsString(walk, tokens) {
  var quoter = walk.current;
  var content = "";
  var escape = false;

  while (true) {
    if (walk.next() === nullChar) {
      throw new Exception("Unexpected end of string");
    }

    if (escape) {
      content += walk.current;
      escape = false;
      continue;
    }

    if (walk.current == "\\") {
      escape = true;
      continue;
    }

    if (walk.current == quoter) {
      tokens.push(content);
      walk.next();
      return tsNeutral;
    }

    content += walk.current;
  }
}

/**
 * @param {StringWalker} walk
 * @param {Object[]} tokens
 */
function tsSingleOperator(walk, tokens) {
  const val = new String(walk.current);
  walk.next();
  val.type = operatorType;
  tokens.push(val);
  return tsNeutral;
}

/**
 * @param {StringWalker} walk
 * @param {Object[]} tokens
 */
function tsEnd() {
  return tsEnd;
}

class StringWalker {
  /**
   * @param {string} str
   */
  constructor(str) {
    this._str = str;
    this._pos = 0;
  }

  get position() {
    return this._pos;
  }

  get current() {
    if (this._pos < 0 || this._pos >= this._str.length) return nullChar;
    return this._str[this._pos];
  }

  next() {
    ++this._pos;
    return this.current;
  }

  previous() {
    --this._pos;
    return this.current;
  }

  get ahead() {
    if (this._pos >= this._str.length - 2) return nullChar;
    return this._str[this._pos + 1];
  }

  get behind() {
    if (this._pos < 1) return nullChar;
    return this._str[this._pos - 1];
  }
}
