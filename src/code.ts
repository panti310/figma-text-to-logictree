const targetText: TextNode = getTextFromArray();

if (targetText != null) {
  createDictonary(targetText.characters);
}

figma.closePlugin();

function getTextFromArray() {
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

function createDictonary(chara: string) {
  const dict: { [key: string]: {} } = {};
  const charaSplitArray: Array<string> = chara.split('\n');
  let currentKeysArray: Array<string> = [];
  
  charaSplitArray.forEach(line => {
    const lineSplitArray = line.split('- ');
    console.log(lineSplitArray);
    const indent = Number(lineSplitArray[0].length) / 2;
    const key = lineSplitArray[1];

    if (indent === 0) {
      currentKeysArray = [key];
      dict[key] = {};
    } else if (indent === 1) {
      if (currentKeysArray.length > indent) {
        currentKeysArray = currentKeysArray.splice(indent - 1, 1);
      }
      currentKeysArray.push(key);
      const targetDict = dict[currentKeysArray[0]];
      targetDict[key] = {};
      dict[currentKeysArray[0]] = targetDict;
    } else if (indent === 2) {
      if (currentKeysArray.length > indent) {
        currentKeysArray = currentKeysArray.splice(indent - 1, 1);
      }
      const targetDict = dict[currentKeysArray[0]][currentKeysArray[1]];
      targetDict[key] = {};
      dict[currentKeysArray[0]][currentKeysArray[1]] = targetDict;
    }
    console.log("currentKeysArray: " + currentKeysArray);
  });
  console.log(dict);
}