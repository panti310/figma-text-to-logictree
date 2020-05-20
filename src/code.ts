// tree: ロジックツリー全体、階層の上下を表すときは parentTree, currentTree, childTree と表す
// node: 1つの要素
// root: ロジックツリーの起点となるnode、描画はしないが概念上存在する
// margin: node間の余白
// depth: 階層の深さ

// 設定
const NODE_WIDTH = 200;
const NODE_HEIGHT = NODE_WIDTH / 2.5;
const PADDING = NODE_HEIGHT / 10;
const MARGIN_HEIGHT = 20;
const MARGIN_WIDTH = 30;
const INDENT_SPACE_COUNT = 4;
const ITEMIZATION_SYMBOL = "- ";
const ROOT_NODE_NAME = "root";
const BG_COLOR = "FFFFFF";
const FONT_NAME: FontName = { family: "Roboto", style: "Regular" };
const FONT_SIZE = 14;

// 選択中のオブジェクトからテキストを抜き出す
const inputText: TextNode = getTextNodeFromSelection();
if (inputText === null) {
  alert("箇条書きのテキストを選択してください");
} else {
  // テキストをハッシュ化する
  const inputHash: { [key: string]: {} } = convertCharaIntoHash(inputText.characters);
  // フォントを読み込み次第描画する
  const fontLoadPromise = figma.loadFontAsync(FONT_NAME);
  Promise.all([fontLoadPromise])
    .then(() => {
      // 描画する
      drawTree(inputHash);
      figma.closePlugin();
    })
    .catch(() => {
      alert("エラーが発生しました");
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
    // 箇条書きの記号を目印にしてlineを分ける
    const lineSplitArray = line.split(ITEMIZATION_SYMBOL);
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
  let processingNodeArray: Array<string> = [];
  let nodeDrawingPosYArray: Array<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let prevProcessedNodeDepth = 0;

  for (let key in inputHash) {
    drawNodeUnderCurrentNodeRecursively(inputHash, ROOT_NODE_NAME, key);
  }

  function drawNodeUnderCurrentNodeRecursively(
    parentHash: { [key: string]: {} },
    parentKey: string,
    currentKey: string
  ) {
    const currentHash = parentHash[currentKey];

    let currentDepthIndex = 0;
    let childDepthIndex = 1;
    if (parentKey === ROOT_NODE_NAME) {
      // root直下なら親に紐付いていないのでcurrentKeyのみに初期化する
      processingNodeArray = [currentKey];
    } else {
      // root直下でなければ親のkeyからindexを取得して、作業中配列を更新する
      currentDepthIndex = processingNodeArray.indexOf(parentKey) + 1;
      const deleteNum = processingNodeArray.length - currentDepthIndex;
      processingNodeArray.splice(currentDepthIndex, deleteNum, currentKey);
      childDepthIndex = currentDepthIndex + 1;
    }

    // １つ前に描画したnodeの下にnodeが無い時は、それ以降の階層の高さを更新する
    const prevNodeDrawingPosY = nodeDrawingPosYArray[currentDepthIndex];
    if (currentDepthIndex <= prevProcessedNodeDepth) {
      for (let i = currentDepthIndex; i < nodeDrawingPosYArray.length; i++) {
        nodeDrawingPosYArray[i] = prevNodeDrawingPosY;
      }
    }
    prevProcessedNodeDepth = currentDepthIndex;

    // テキストと背景を作成する
    const rectNode: RectangleNode = figma.createRectangle();
    const textNode: TextNode = figma.createText();
    figma.group([textNode, rectNode], rectNode.parent);

    // テキストの設定
    const nodePosX = calcNodeDrawingPosX();
    const treeHeightUnderNode = calctTreeHeightUnderNode(currentHash);
    textNode.characters = currentKey;
    textNode.fontName = FONT_NAME;
    textNode.fontSize = FONT_SIZE;
    textNode.resize(NODE_WIDTH - PADDING * 2, NODE_HEIGHT);
    textNode.textAlignHorizontal = "CENTER";
    textNode.textAlignVertical = "CENTER";
    textNode.x = nodePosX + PADDING;
    textNode.y = treeHeightUnderNode / 2 + prevNodeDrawingPosY;

    // 高さの配列を更新する
    nodeDrawingPosYArray[currentDepthIndex] += treeHeightUnderNode + MARGIN_HEIGHT;
    const currentNodeDrawingPosY = prevNodeDrawingPosY + treeHeightUnderNode + MARGIN_HEIGHT;

    // 背景の設定
    rectNode.resize(NODE_WIDTH, NODE_HEIGHT);
    rectNode.x = nodePosX;
    rectNode.y = textNode.y;
    const cloneFills = clone(rectNode.fills);
    rectNode.fills = changePaints(cloneFills, BG_COLOR);

    // 左の横線の作成
    const leftLine = figma.createLine();
    leftLine.resize(MARGIN_WIDTH / 2, 0);
    leftLine.x = nodePosX - MARGIN_WIDTH / 2;
    leftLine.y = textNode.y + NODE_HEIGHT / 2;

    // 子要素があるなら右の横線を作成
    if (Object.keys(currentHash).length > 0) {
      const rightLine = figma.createLine();
      rightLine.resize(MARGIN_WIDTH / 2, 0);
      rightLine.x = nodePosX + NODE_WIDTH;
      rightLine.y = leftLine.y;
    }

    // 兄弟要素があるなら縦線の作成
    const siblingNum = Object.keys(parentHash).length;
    if (siblingNum > 1) {
      const indexInSibling = Object.keys(parentHash).indexOf(currentKey);
      const isFirstInSibling = indexInSibling === 0;
      const isLastInSibling = indexInSibling >= siblingNum - 1;
      let verticalLineStartPosY = isFirstInSibling ? leftLine.y : prevNodeDrawingPosY;
      let verticalLineEndPosY = isLastInSibling ? leftLine.y : currentNodeDrawingPosY;

      const verticalLine = figma.createLine();
      verticalLine.resize(verticalLineEndPosY - verticalLineStartPosY, 0);
      verticalLine.rotation = -90;
      verticalLine.x = leftLine.x;
      verticalLine.y = verticalLineStartPosY;
    }

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
      const depth = currentDepthIndex + 1;
      const elemCalcResult = depth * NODE_WIDTH;
      const marginCalcResult = (depth - 1) * MARGIN_WIDTH;
      return elemCalcResult + marginCalcResult;
    }
  }
}

/// 以下、便利関数
function changePaints(paints: Array<any>, color: String) {
  if (paints !== null && paints.length > 0) {
    paints.forEach((paint, index) => {
      paints[index] = changePaint(paint, color);
    });
  }
  return paints;
}

function changePaint(paint, color: String) {
  // 単色塗り以外（グラデーション、画像）は対応しない
  if (paint.type !== "SOLID") {
    return paint;
  }
  // 16進数を10進数に変換した後、0~1の少数に置き換える
  const rgbArray = [color.slice(0, 2), color.slice(2, 4), color.slice(4, 6)].map(function (str) {
    return parseInt(str, 16) / 255;
  });
  paint.color.r = rgbArray[0];
  paint.color.g = rgbArray[1];
  paint.color.b = rgbArray[2];
  return paint;
}

function clone(val) {
  return JSON.parse(JSON.stringify(val));
}
