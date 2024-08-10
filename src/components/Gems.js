import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import gemData from "../data/gems.json";

String.prototype.replaceBetween = function(start, end, what) {
  return this.substring(0, start) + what + this.substring(end);
};

function GemsMenu(props) {
  const { save, setSave } = useContext(SaveContext);
  const [gems, setGems] = useState([]);
  let gemElements = [];

  useEffect(() => {
    setGems(processGems(save));
  }, [save]);

  for (var i = 0; i < gems.length; i++) {
    gemElements.push(<GemListItem key={i} gem={gems[i]} />);
  }

  return (
    <div>
      {gems.length > 0 && (
        <div>
          <ActiveGemModal gem={gems[0]} />
          {gemElements}
        </div>
      )}
    </div>
  );
}

function ActiveGemModal(props) {
  const [activeGem, setActiveGem] = useState(props.gem);
  const { save, setSave } = useContext(SaveContext);

  useEffect(() => {
    updateGem()
  }, [activeGem]);

  function updateGem() {
    let temp = save.replaceBetween(activeGem.index, activeGem.index + 80, activeGem.code)
    setSave(temp)
  }

  function DropDownItem(props) {
    return (
      <div onClick={props.onClick} data-id={props.id}>
        {props.value}
      </div>
    );
  }

  function selectShape(e) {
    // console.log(activeGem.code)
    console.log(activeGem)
    let code = activeGem.code.replaceBetween(8,16,e.target.getAttribute("data-id"))
    setActiveGem({ ...activeGem, shape: gemData.gem_shapes[e.target.getAttribute("data-id")], code: code });
  }

  function GemEditItem(props) {
    let shapes = [];
    for (const [key, value] of Object.entries(gemData.gem_shapes)) {
      shapes.push(
        <DropDownItem key={key} id={key} value={value} onClick={selectShape} />
      );
    }

    return (
      <div>
        <p>{activeGem.type}</p>
        <div className="dropdown dropdown-collapsed">
          <p>{activeGem.shape}</p>
          {shapes}
        </div>
        <p>{activeGem.effect1}</p>
        <p>{activeGem.effect2}</p>
        <p>{activeGem.effect3}</p>
      </div>
    );
  }

  return (
    <div className="gem-modal">
      <GemEditItem gem={props.gem} />
    </div>
  );
}

function GemListItem(props) {
  return (
    <div>
      <p>{props.gem.type}</p>
      <p>{props.gem.shape}</p>
      <p>{props.gem.effect1}</p>
      <p>{props.gem.effect2}</p>
      <p>{props.gem.effect3}</p>
    </div>
  );
}

function processGems(save) {
  console.log(save)
  if (!save.startsWith("41000000000000")) {
    console.log('here')
    return false;
  } else {
    console.log('here1')
    return extractGems(save);
  }
}

function extractGems(save) {
  let allGems = [];
  let possibilities = gemData.gem_possibilities;
  let loop = true;

  let regexStr = possibilities.join("|");
  var regex = new RegExp(regexStr, "gi");
  var result;
  var indices = [];
  while ((result = regex.exec(save))) {
    indices.push(result.index);
  }
  // console.log(indices)
  let gemStartIndex = Math.min(...indices);
  const gemSize = 80;
  let gemNumber = 1;
  while (loop == true) {
    let gemItemData = save.substring(
      gemStartIndex + gemSize * (gemNumber - 1),
      gemStartIndex + gemSize * gemNumber
    );
    // console.log(gemItemData)
    if (gemItemData.match(regex)) {
      allGems.push(
        formatGemData(gemItemData, gemStartIndex + gemSize * (gemNumber - 1))
      );
      gemNumber = gemNumber + 1;
    } else {
      loop = false;
    }
  }
  // console.log(allGems)
  return allGems; 
}

function formatGemData(gem, index) {
  // gem = gem.toUpperCase();
  let type = gemData.types[gem.substring(0, 8)];
  // console.log(gem)
  console.log(gem.substring(16, 24))
  let shape, effect1, effect2, effect3;
  if (type == "gem") {
    shape = gemData.gem_shapes[gem.substring(8, 16)];
    effect1 = gemData.gem_effects[gem.substring(16, 24)];
    effect2 = gemData.gem_effects[gem.substring(24, 32)];
    effect3 = gemData.gem_effects[gem.substring(32, 40)];
  }

  return {
    type: type,
    shape: shape,
    effect1: effect1,
    effect2: effect2,
    effect3: effect3,
    index: index,
    code: gem,
  };
}

export { GemsMenu };
