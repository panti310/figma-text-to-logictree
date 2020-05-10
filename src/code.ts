const inputText: TextNode = getTextFromSelection();
const inputDict: { [key: string]: {} } = {};
let processingKeyArray: Array<string> = [];

if (inputText != null) {
  convertTextIntoDict(inputText.characters);
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


function convertTextIntoDict(chara: string) {
  const charaSplitArray: Array<string> = chara.split('\n');
  
  charaSplitArray.forEach(line => {
    addToDict(line);
  });
  console.log(inputDict);
}

function addToDict(line: string) {
  const lineSplitArray = line.split('- ');
  const indent = Number(lineSplitArray[0].length) / 2;
  const key = lineSplitArray[1];

  if (indent === 0) {
    processingKeyArray = [key];
    inputDict[key] = {};
  }
  else {
    deleteRedundantElem(indent);
    addKeyToDict(key, indent);
  }
  console.log("processingKeyArray: " + processingKeyArray);
}

function deleteRedundantElem(indent: number) {
  if (processingKeyArray.length > indent) {
    processingKeyArray = processingKeyArray.splice(0, indent);
  }
}

function addKeyToDict(key: string, indent: number) {
  let processingDict: { [key: string]: {} } = {};
  for (let i = 0; i < processingKeyArray.length; i++) {
    if (i === 0) {
      processingDict = inputDict[processingKeyArray[i]];
    } else {
      processingDict = processingDict[processingKeyArray[i]];
    }
  }
  processingKeyArray.push(key);
  processingDict[key] = {};

  addProcessingDictToDict(indent, processingDict);
}

function addProcessingDictToDict(indent: number, targetDict: { [key: string]: {}; }) {
  switch (indent) {
    case 1:
      inputDict[processingKeyArray[0]] = targetDict;
      break;
    case 2:
      inputDict[processingKeyArray[0]][processingKeyArray[1]] = targetDict;
      break;
    case 3:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]] = targetDict;
      break;
    case 4:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]] = targetDict;
      break;
    case 5:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]] = targetDict;
      break;
    case 6:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]] = targetDict;
      break;
    case 7:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]] = targetDict;
      break;
    case 8:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][processingKeyArray[7]] = targetDict;
      break;
    case 9:
      inputDict[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][processingKeyArray[7]][processingKeyArray[8]] = targetDict;
      break;
    default:
      console.log('階層が深すぎて対処できません');
      break;
  }
}
