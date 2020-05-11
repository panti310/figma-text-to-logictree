const NODE_HEIGHT = 100;
const MARGIN_HEIGHT = 50;

let inputHash: { [key: string]: {} } = {};
const inputText: TextNode = getTextFromSelection();
if (inputText != null) {
  inputHash = convertTextIntoHash(inputText.characters);
}

for (let key in inputHash) {
  drawTree(key);
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
    console.log("processingKeyArray: " + processingKeyArray);
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

  function addTargetHashToHash(
    indent: number,
    targetHash: { [key: string]: {} }
  ) {
    switch (indent) {
      case 1:
        hash[processingKeyArray[0]] = targetHash;
        break;
      case 2:
        hash[processingKeyArray[0]][processingKeyArray[1]] = targetHash;
        break;
      case 3:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ] = targetHash;
        break;
      case 4:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ][processingKeyArray[3]] = targetHash;
        break;
      case 5:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ][processingKeyArray[3]][processingKeyArray[4]] = targetHash;
        break;
      case 6:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ][processingKeyArray[3]][processingKeyArray[4]][
          processingKeyArray[5]
        ] = targetHash;
        break;
      case 7:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][
          processingKeyArray[6]
        ] = targetHash;
        break;
      case 8:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][
          processingKeyArray[6]
        ][processingKeyArray[7]] = targetHash;
        break;
      case 9:
        hash[processingKeyArray[0]][processingKeyArray[1]][
          processingKeyArray[2]
        ][processingKeyArray[3]][processingKeyArray[4]][processingKeyArray[5]][
          processingKeyArray[6]
        ][processingKeyArray[7]][processingKeyArray[8]] = targetHash;
        break;
      default:
        console.log("階層が深すぎて対処できません");
        break;
    }
  }
}

function drawTree(key: string) {
  const targetHash = inputHash[key];
  const height = getHeight(targetHash);
  console.log(key + " = " + height);

  for (let key in targetHash) {
    drawTree(key);
  }

  function getHeight(targetHash: { [key: string]: {} }) {
    let emptyHashNum = 0;
    searchEmptyHashRecursively(targetHash);
    const elemCalcResult =
      emptyHashNum > 0 ? emptyHashNum * NODE_HEIGHT : NODE_HEIGHT;
    const marginCalcResult =
      emptyHashNum > 0 ? (emptyHashNum - 1) * MARGIN_HEIGHT : 0;
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
}
