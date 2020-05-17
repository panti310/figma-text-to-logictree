// tree: ロジックツリー全体、階層の上下を表すときは parentTree, currentTree, childTree と表す
// node: 1つの要素
// root: ロジックツリーの起点となるnode、描画はしないが概念上存在する
// margin: node間の余白
// depth: 階層の深さ

const NODE_HEIGHT = 100;
const NODE_WIDTH = 200;
const MARGIN_HEIGHT = 50;
const MARGIN_WIDTH = 50;
const INDENT_SPACE_COUNT = 2;
const ROOT_NODE_NAME = "root";

// スタイルを取得する
// TODO: 指定できるようにする
const font: TextStyle = figma.getLocalTextStyles()[0];

// 選択中のオブジェクトからテキストを抜き出す
const inputText: TextNode = getTextNodeFromSelection();
if (inputText != null) {
  // テキストをハッシュ化する
  const inputHash: { [key: string]: {} } = convertCharaIntoHash(inputText.characters);
  // フォントを読み込み次第描画する
  const fontLoadPromise = figma.loadFontAsync(font.fontName);
  Promise.all([fontLoadPromise])
    .then(() => {
      // 描画する
      drawTree(inputHash);
      figma.closePlugin();
    })
    .catch(() => {
      figma.closePlugin();
    });
}

function getTextNodeFromSelection(): TextNode {
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

function convertCharaIntoHash(chara: string): { [key: string]: {} } {
  let inputHash: { [key: string]: {} } = {};
  let processingKeyArray: Array<string> = [];

  // 1行ずつの配列にする
  const charaSplitArray: Array<string> = chara.split("\n");
  // 階層構造を保持してハッシュに追加する
  charaSplitArray.forEach((line) => {
    addLineToHash(line);
  });
  return inputHash;

  function addLineToHash(line: string) {
    // 箇条書きの「- 」を目印にしてlineを分ける
    const lineSplitArray = line.split("- ");
    // インデント数を算出する
    const indentNum = Number(lineSplitArray[0].length) / INDENT_SPACE_COUNT;

    const key = lineSplitArray[1];
    if (indentNum === 0) {
      processingKeyArray = [key];
      inputHash[key] = {};
    } else {
      addKeyToHash(key, indentNum);
    }
  }

  function addKeyToHash(key: string, indent: number) {
    // 処理中ではなくなったkeyを削除する
    if (processingKeyArray.length > indent) {
      processingKeyArray = processingKeyArray.splice(0, indent);
    }
    // 対象となるハッシュを取得する
    let targetHash: { [key: string]: {} } = {};
    for (let i = 0; i < processingKeyArray.length; i++) {
      if (i === 0) {
        targetHash = inputHash[processingKeyArray[i]];
      } else {
        targetHash = targetHash[processingKeyArray[i]];
      }
    }
    // 配列とハッシュに追加する
    processingKeyArray.push(key);
    targetHash[key] = {};
    addTargetHashToHash(indent, targetHash);
  }

  function addTargetHashToHash(indent: number, targetHash: { [key: string]: {} }) {
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
        inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ] = targetHash;
        break;
      case 5:
        inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]] = targetHash;
        break;
      case 6:
        inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]] = targetHash;
        break;
      case 7:
        inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]] = targetHash;
        break;
      case 8:
        inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][
          processingKeyArray[7]
        ] = targetHash;
        break;
      case 9:
        inputHash[processingKeyArray[0]][processingKeyArray[1]][processingKeyArray[2]][
          processingKeyArray[3]
        ][processingKeyArray[4]][processingKeyArray[5]][processingKeyArray[6]][
          processingKeyArray[7]
        ][processingKeyArray[8]] = targetHash;
        break;
      default:
        alert("10階層以上は対処できません");
        break;
    }
  }
}

function drawTree(inputHash: { [key: string]: {} }) {
  let parentNodeArray: Array<string> = [ROOT_NODE_NAME];
  let nodeDrawingPosYArray: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  //
  for (let key in inputHash) {
    drawNodeUnderCurrentNodeRecursively(inputHash, ROOT_NODE_NAME, key);
  }

  function drawNodeUnderCurrentNodeRecursively(
    parentHash: { [key: string]: {} },
    parentKey: string,
    currentKey: string
  ) {
    const currentHash = parentHash[currentKey];
    const index = parentNodeArray.indexOf(parentKey);
    parentNodeArray.splice(index + 1, parentNodeArray.length - index, currentKey);

    // テキストを作成する
    // TODO: 背景やスタイルを設定する
    const textNode: TextNode = figma.createText();
    textNode.characters = currentKey;
    textNode.textStyleId = font.id;

    // x軸の描画場所を計算する
    textNode.x = calcNodeDrawingPosX();

    // y軸の描画場所を計算する
    const treeHeightUnderNode = calctTreeHeightUnderNode(currentHash);
    const currentNodeDrawingPosY = nodeDrawingPosYArray[index];
    const childNodeDrawingPosY = nodeDrawingPosYArray[index + 1];
    // 子階層が歯抜けになっている時に小階層のy軸描画位置を現階層に合わせて更新する
    // 要素がない箇所以降に位置のズレが生じるため、差分を埋める処理が必要となる
    if (currentNodeDrawingPosY !== childNodeDrawingPosY && childNodeDrawingPosY > 0) {
      nodeDrawingPosYArray[index + 1] = currentNodeDrawingPosY;
    }
    // yの描画位置 = そのnode以下のツリーの高さの中央 + その階層の次の描画位置
    textNode.y = treeHeightUnderNode / 2 + currentNodeDrawingPosY;
    nodeDrawingPosYArray[index] += treeHeightUnderNode + MARGIN_HEIGHT;

    // 子ツリーを順に描画する
    for (let nextKey in currentHash) {
      drawNodeUnderCurrentNodeRecursively(currentHash, currentKey, nextKey);
    }

    function calctTreeHeightUnderNode(targetHash: { [key: string]: {} }): number {
      const emptyTreeCount = getEmptyTreeCount();
      const nodeCalcResult = emptyTreeCount > 0 ? emptyTreeCount * NODE_HEIGHT : NODE_HEIGHT;
      const marginCalcResult = emptyTreeCount > 0 ? (emptyTreeCount - 1) * MARGIN_HEIGHT : 0;
      return nodeCalcResult + marginCalcResult;

      function getEmptyTreeCount(): number {
        let emptyTreeCount = 0;
        searchEmptyHashRecursively(targetHash);
        return emptyTreeCount;

        function searchEmptyHashRecursively(targetHash: { [key: string]: {} }) {
          for (let key in targetHash) {
            const childHash = targetHash[key];
            if (Object.keys(childHash).length === 0) {
              emptyTreeCount++;
            }
            searchEmptyHashRecursively(childHash);
          }
        }
      }
    }

    function calcNodeDrawingPosX(): number {
      const depth = parentNodeArray.length - 1;
      const elemCalcResult = depth > 0 ? depth * NODE_WIDTH : NODE_WIDTH;
      const marginCalcResult = depth > 0 ? (depth - 1) * MARGIN_WIDTH : 0;
      return elemCalcResult + marginCalcResult;
    }
  }
}
