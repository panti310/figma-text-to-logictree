const inputText: TextNode = getTextFromSelection();
const inputHash: { [key: string]: {} } = {};
let processingKeyArray: Array<string> = [];

const elementHeight = 100;
const marginHeight = 50;
let emptyHashNum = 0;

if (inputText != null) {
  convertTextIntoHash(inputText.characters);
}

for (let key in inputHash) {
  const targetHash = inputHash[key];
  drawTree(targetHash);
}

figma.closePlugin();

function getTextFromSelection() {
  const selectionArray = figma.currentPage.selection;
  if (selectionArray === null) {
    return null;
  }

  for (let i = 0; i < selectionArray.length; i++) {
    const element = selectionArray[i];
    if (element.type === "TEXT") {
      return element;
    }
  }
  return null;
}

function convertTextIntoHash(chara: string) {
  const charaSplitArray: Array<string> = chara.split('\n');
  
  charaSplitArray.forEach(line => {
    addToHash(line);
  });
  console.log(inputHash);
}

function addToHash(line: string) {
  const lineSplitArray = line.split('- ');
  const indent = Number(lineSplitArray[0].length) / 2;
  const key = lineSplitArray[1];

  if (indent === 0) {
    processingKeyArray = [key];
    inputHash[key] = {};
  }
  else {
    deleteRedundantElem(indent);
    addKeyToHash(key, indent);
  }
  console.log("processingKeyArray: " + processingKeyArray);
}

function deleteRedundantElem(indent: number) {
  if (processingKeyArray.length > indent) {
    processingKeyArray = processingKeyArray.splice(0, indent);
  }
}

function addKeyToHash(key: string, indent: number) {
  let processingHash: { [key: string]: {} } = {};
  for (let i = 0; i < processingKeyArray.length; i++) {
    if (i === 0) {
      processingHash = inputHash[processingKeyArray[i]];
    } else {
      processingHash = processingHash[processingKeyArray[i]];
    }
  }
  processingKeyArray.push(key);
  processingHash[key] = {};

  addProcessingHashToHash(indent, processingHash);
}

function addProcessingHashToHash(indent: number, targetHash: { [key: string]: {}; }) {
  switch (indent) {
    case 1:
      inputHash[processingKeyArray[0]] = targetHash;
      break;
    case 2:
      inputHash[processingKeyArray[0]][processingKeyArray[1]] = targetHash;
      break;
    case 3:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]] = targetHash;
      break;
    case 4:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]] = targetHash;
      break;
    case 5:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]] = targetHash;
      break;
    case 6:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]] = targetHash;
      break;
    case 7:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]] = targetHash;
      break;
    case 8:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][processingKeyArray[7]] = targetHash;
      break;
    case 9:
      inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][processingKeyArray[7]][processingKeyArray[8]] = targetHash;
      break;
    default:
      console.log('階層が深すぎて対処できません');
      break;
  }
}

function drawTree(targetHash: { [key: string]: {} }) {
  const height = getHeight(targetHash);
  console.log(height);
  // for (let key in targetHash) {
  //   const childHash = targetHash[key];
  //   drawTree(childHash);
  //   console.log(key + " = " + height);
  // }
}

function getHeight(targetHash: { [key: string]: {} }) {
  emptyHashNum = 0;
  searchEmptyHashRecursively(targetHash);
  const elemCalcResult = emptyHashNum > 0 ? emptyHashNum * elementHeight : elementHeight;
  const marginCalcResult = emptyHashNum > 0 ? (emptyHashNum - 1) * marginHeight : 0;
  return elemCalcResult + marginCalcResult;
}

function searchEmptyHashRecursively(targetHash: { [key: string]: {}; }) {
  for (let key in targetHash) {
    const childHash = targetHash[key];
    console.log(key);
    if (Object.keys(childHash).length === 0) {
      emptyHashNum++;
      console.log('length 0');
    }
    searchEmptyHashRecursively(childHash);
  }
}
