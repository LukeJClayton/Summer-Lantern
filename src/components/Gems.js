import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import gemData from "../data/gems.json";

String.prototype.replaceBetween = function(start, end, what) {
  return this.substring(0, start) + what + this.substring(end);
};

function DropDown(props) {
  const [open, setOpen] = useState(false)

  function handleToggle() {
    setOpen(!open)
  }

  return (
      <div className={"dropdown" + (!open ? " dropdown-collapsed": '')}>
        <p className="dropdown-button" onClick={handleToggle}>{props.label}</p>
        <div className="dropdown-content">
          {props.content}
        </div>
      </div>
    )
}

function GemsMenu(props) {
  const {save, setSave} = useContext(SaveContext);
  const [gems, setGems] = useState([]);
  const [hold, setHold] = useState(true)
  const [activeGem, setActiveGem] = useState(false);
  let gemElements = [];

  for (var i = 0; i < gems.length; i++) {
    gemElements.push(<GemListItem key={i} gem={gems[i]} />);
  }

  useEffect(() => {
    setGems(processGems(save));
    if (!hold) {
      setActiveGem(false)
    } else {
      setHold(false)
    }
  }, [save]);

  useEffect(() => {
    updateGem()
  }, [activeGem]);

  function updateGem() {
    let temp = save.replaceBetween(activeGem.index, activeGem.index + 80, activeGem.code)
    setSave(temp)
  }

  function GemEditItem(props) {
    let shapes = [];
    for (const [key, value] of Object.entries(gemData.gem_shapes)) {
      shapes.push(
        <ValueItem key={key} id={key} value={value} onClick={selectShape} />
      );
    }

   const effectRegex = /\((\+|\-)([0-9.]*)[\%]?\)/g

   function effectSort(a, b) {
    var parts = {
      a: a.props.value.split('('),
      b: b.props.value.split('('),
    }

    if (parts.a[0] == parts.b[0] && parts.a[1] && parts.b[1]) {
      let vala = parts.a[1].replace('+', '').replace('-', '').replace('%', '').replace(')', '')
      let valb = parts.b[1].replace('+', '').replace('-', '').replace('%', '').replace(')', '')
      return parseFloat(vala) - parseFloat(valb)
    } else {
      return parts.a[0] > parts.b[0] ? 1: -1
    }
   }

    let effects1 = [];
    for (const [key, value] of Object.entries(gemData.gem_effects)) {
      effects1.push(
        <ValueItem key={key} id={key} value={value} onClick={selectEffect1} />
      );
    }
    effects1.sort(effectSort)

    let effects2 = [];
    for (const [key, value] of Object.entries(gemData.gem_effects)) {
      effects2.push(
        <ValueItem key={key} id={key} value={value} onClick={selectEffect2} />
      );
    }
    effects2.sort(effectSort)

    let effects3 = [];
    for (const [key, value] of Object.entries(gemData.gem_effects)) {
      effects3.push(
        <ValueItem key={key} id={key} value={value} onClick={selectEffect3} />
      );
    }
    effects3.sort(effectSort)

    return (
      <div className="gems-active">
        {activeGem && (
          <div>
            <p>{activeGem.type}</p>
            <DropDown label={activeGem.shape} content={shapes} />
            <DropDown label={activeGem.effect1} content={effects1} />
            <DropDown label={activeGem.effect2} content={effects2} />
            <DropDown label={activeGem.effect3} content={effects3} />
          </div>
        )}
      </div>
    );
  }

  function GemListItem(props) {
    return (
      <div className={"gems-list-item" + (props.gem == activeGem ? ' active' : '')} onClick={() => {selectGem(props.gem)}}>
        <p>{props.gem.type}</p>
        <p>{props.gem.shape}</p>
        <p>{props.gem.effect1}</p>
        <p>{props.gem.effect2}</p>
        <p>{props.gem.effect3}</p>
      </div>
    );
  }

  function ValueItem(props) {
    return (
      <div onClick={props.onClick} data-id={props.id}>
        {props.value}
      </div>
    );
  }

  function selectShape(e) {
    let code = activeGem.code.replaceBetween(8,16,e.target.getAttribute("data-id"))
    setHold(true)
    setActiveGem({ ...activeGem, shape: gemData.gem_shapes[e.target.getAttribute("data-id")], code: code });
  }

  function selectEffect1(e) {
    let code = activeGem.code.replaceBetween(16,24,e.target.getAttribute("data-id"))
    setHold(true)
    setActiveGem({ ...activeGem, effect1: gemData.gem_effects[e.target.getAttribute("data-id")], code: code });
  }

  function selectEffect2(e) {
    let code = activeGem.code.replaceBetween(24,32,e.target.getAttribute("data-id"))
    setHold(true)
    setActiveGem({ ...activeGem, effect2: gemData.gem_effects[e.target.getAttribute("data-id")], code: code });
  }

  function selectEffect3(e) {
    let code = activeGem.code.replaceBetween(32,40,e.target.getAttribute("data-id"))
    setHold(true)
    setActiveGem({ ...activeGem, effect3: gemData.gem_effects[e.target.getAttribute("data-id")], code: code });
  }

  function selectGem(gem) {
    setActiveGem(gem)
  }

  return (
    <div>
      {gems.length > 0 && (
        <div className="gems">
          <GemEditItem gem={activeGem} />
          <div className="gems-list">
          {gemElements}
          </div>
        </div>
      )}
    </div>
  );
}

function processGems(save) {
  if (!save.startsWith("41000000000000")) {
    return false;
  } else {
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

  let gemStartIndex = Math.min(...indices);
  const gemSize = 80;
  let gemNumber = 1;
  while (loop == true) {
    let gemItemData = save.substring(
      gemStartIndex + gemSize * (gemNumber - 1),
      gemStartIndex + gemSize * gemNumber
    );
    if (gemItemData.match(regex)) {
      allGems.push(
        formatGemData(gemItemData, gemStartIndex + gemSize * (gemNumber - 1))
      );
      gemNumber = gemNumber + 1;
    } else {
      loop = false;
    }
  }

  return allGems; 
}

function formatGemData(gem, index) {
  let type = gemData.types[gem.substring(0, 8)];

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
