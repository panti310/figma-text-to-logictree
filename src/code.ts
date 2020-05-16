const NODE_HEIGHT = 100;
const NODE_WIDTH = 200;
const MARGIN_HEIGHT = 50;
const MARGIN_WIDTH = 50;
const font: TextStyle = figma.getLocalTextStyles()[0];

let inputHash: { [key: string]: {} } = {};
const inputText: TextNode = getTextFromSelection();
if (inputText != null) {
  inputHash = convertTextIntoHash(inputText.characters);
}

const fontLoadPromise = figma.loadFontAsync(font.fontName);

Promise.all([fontLoadPromise]).then(() => {
  console.log(inputHash);
  for (let key in inputHash) {
    drawTree('root', key, inputHash);
    nodeCount ++;
  }
  figma.closePlugin();
});


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

function convertTextIntoHash(chara: string): { [key: string]: {} } {
  let hash: { [key: string]: {} } = {};
  let processingKeyArray: Array<string> = [];
  const charaSplitArray: Array<string> = chara.split("\n");

  charaSplitArray.forEach((line) => {
    addToHash(line);
  });
  return hash;

  function addToHash(line: string) {
    const lineSplitArray = line.split("- ");
    const indent = Number(lineSplitArray[0].length) / 2;
    const key = lineSplitArray[1];

    if (indent === 0) {
      processingKeyArray = [key];
      hash[key] = {};
    } else {
      deleteRedundantElem(indent);
      addKeyToHash(key, indent);
    }
  }

  function deleteRedundantElem(indent: number) {
    if (processingKeyArray.length > indent) {
      processingKeyArray = processingKeyArray.splice(0, indent);
    }
  }

  function addKeyToHash(key: string, indent: number) {
    let targetHash: { [key: string]: {} } = {};
    for (let i = 0; i < processingKeyArray.length; i++) {
      if (i === 0) {
        targetHash = hash[processingKeyArray[i]];
      } else {
        targetHash = targetHash[processingKeyArray[i]];
      }
    }
    processingKeyArray.push(key);
    targetHash[key] = {};

    addTargetHashToHash(indent, targetHash);
  }

  function addTargetHashToHash(indent: number, targetHash: { [key: string]: {} }) {
    switch (indent) {
      case 1:
        hash[processingKeyArray[0]] = targetHash;
        break;
      case 2:
        hash[processingKeyArray[0]][processingKeyArray[1]] = targetHash;
        break;
      case 3:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]] = targetHash;
        break;
      case 4:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ] = targetHash;
        break;
      case 5:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]] = targetHash;
        break;
      case 6:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]] = targetHash;
        break;
      case 7:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]] = targetHash;
        break;
      case 8:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][
          processingKeyArray[7]
        ] = targetHash;
        break;
      case 9:
        hash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][
          processingKeyArray[7]
        ][processingKeyArray[8]] = targetHash;
        break;
      default:
        console.log("階層が深すぎて対処できません");
        break;
    }
  }
}

let depthArray: Array<string> = ["root"];
let nodeHightArray: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let nodeCount: number = 0; 
function drawTree(parentKey: string, childKey: string, hash: { [key: string]: {} }) {
  const targetHash = hash[childKey];
  const index = depthArray.indexOf(parentKey);
  depthArray.splice(index + 1, depthArray.length);
  depthArray.push(childKey);
  console.log("after = " + depthArray);
  console.log("nodeHightArray.length = " + nodeHightArray.length);
  console.log("index = " + index);

  
  const textNode: TextNode = figma.createText();
  textNode.textStyleId = font.id;
  textNode.x = calcPosX();
  textNode.y = calcPosY(targetHash) / 2 + nodeHightArray[index];
  textNode.characters = childKey;
  
  if (nodeHightArray[index] !== nodeHightArray[index + 1] &&
    nodeHightArray[index + 1] > 0) {
    nodeHightArray[index + 1] = nodeHightArray[index];
    console.log('飛ばし');
  }
  nodeHightArray[index] += calcPosY(targetHash) + MARGIN_HEIGHT;
  console.log(nodeHightArray);

  for (let nextKey in targetHash) {
    drawTree(childKey, nextKey, targetHash);
  }

  function calcPosY(targetHash: { [key: string]: {} }): number {
    let emptyHashNum = 0;
    searchEmptyHashRecursively(targetHash);
    const elemCalcResult = emptyHashNum > 0 ? emptyHashNum * NODE_HEIGHT : NODE_HEIGHT;
    const marginCalcResult = emptyHashNum > 0 ? (emptyHashNum - 1) * MARGIN_HEIGHT : 0;
    return elemCalcResult + marginCalcResult;

    function searchEmptyHashRecursively(targetHash: { [key: string]: {} }) {
      for (let key in targetHash) {
        const childHash = targetHash[key];
        if (Object.keys(childHash).length === 0) {
          emptyHashNum++;
        }
        searchEmptyHashRecursively(childHash);
      }
    }
  }

  function calcPosX(): number {
    const depth = depthArray.length - 1;
    const elemCalcResult = depth > 0 ? depth * NODE_WIDTH : NODE_WIDTH;
    const marginCalcResult = depth > 0 ? (depth - 1) * MARGIN_WIDTH : 0;
    return elemCalcResult + marginCalcResult;
  }
}
