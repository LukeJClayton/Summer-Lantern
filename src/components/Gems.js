import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import gemData from "../data/gems.json";

String.prototype.replaceBetween = function(start, end, what) {
  return this.substring(0, start) + what + this.substring(end);
};

function GemsMenu(props) {
  const {save, setSave} = useContext(SaveContext);
  const [gems, setGems] = useState([]);
  const [hold, setHold] = useState(false)
  const [activeGem, setActiveGem] = useState(false);
  const [sortedEffects, setSortedEffects] = useState([])
  const [sortedRuneEffects, setSortedRuneEffects] = useState([])
  let gemElements = [];

  for (var i = 0; i < gems.length; i++) {
    gemElements.push(<GemListItem key={i} gem={gems[i]} />);
  }
  let loaded = false;
  useEffect(() => {
    if (!loaded) {
      loaded = true
      setGems(processGems(save));
      if (!hold) {
        setActiveGem(false)
      } else {
        setHold(false)
      }
    }
  }, [save]);

  useEffect(() => {
    updateGem()
  }, [activeGem]);

  function updateGem() {
    if (activeGem) {
      let temp = save.replaceBetween(activeGem.index, activeGem.index + 80, activeGem.code)
      setSave(temp)
    }
  }

  function GemEditItem(props) {
    let types = [];
    for (const [key, value] of Object.entries(gemData.types)) {
      types.push({
        key: key,
        value: value
      });
    }

    let shapes = [];
    for (const [key, value] of Object.entries(gemData.gem_shapes)) {
      shapes.push({
        key: key,
        value: value
      });
    }

    let runeTypes = []
    for (const [key, value] of Object.entries(gemData.rune_shapes)) {
      runeTypes.push({
        key: key,
        value: value
      });
    }

   function effectSort(a, b) {
    var parts = {
      a: a.value.split('('),
      b: b.value.split('('),
    }

    if (parts.a[0] == parts.b[0] && parts.a[1] && parts.b[1]) {
      let vala = parts.a[1].replace('+', '').replace('-', '').replace('%', '').replace(')', '')
      let valb = parts.b[1].replace('+', '').replace('-', '').replace('%', '').replace(')', '')
      return parseFloat(vala) - parseFloat(valb)
    } else {
      return parts.a[0] > parts.b[0] ? 1: -1
    }
   }

   if (!sortedEffects.length && activeGem) {
      let tempArray = []
      for (const [key, value] of Object.entries(gemData.gem_effects)) {
        tempArray.push({key: key, value: value})
      }
      tempArray.sort(effectSort)
      setSortedEffects(tempArray)
   }

   if (!sortedRuneEffects.length && activeGem) {
      let tempArray = []
      for (const [key, value] of Object.entries(gemData.rune_effects)) {
        tempArray.push({key: key, value: value})
      }
      tempArray.sort(effectSort)
      setSortedRuneEffects(tempArray)
   }

    return (
      <div className="gems-active">
        {activeGem && (
          <div>
            <SearchableDropdown
              options={types}
              label="value"
              id="key"
              selectedVal={activeGem.type}
              handleChange={(val) => dropdownSelectType(val)}
            />
            <SearchableDropdown
              options={activeGem.type == 'rune' ? runeTypes : shapes}
              label="value"
              id="key"
              selectedVal={activeGem.shape}
              handleChange={(val) => dropdownSelectShape(val)}
            />
            <SearchableDropdown
              options={activeGem.type == 'rune' ? sortedRuneEffects : sortedEffects}
              label="value"
              id="key"
              selectedVal={activeGem.effect1}
              handleChange={(val) => dropdownSelectEffect1(val)}
            />
            <SearchableDropdown
              options={activeGem.type == 'rune' ? sortedRuneEffects : sortedEffects}
              label="value"
              id="key"
              selectedVal={activeGem.effect2}
              handleChange={(val) => dropdownSelectEffect2(val)}
            />
            <SearchableDropdown
              options={activeGem.type == 'rune' ? sortedRuneEffects : sortedEffects}
              label="value"
              id="key"
              selectedVal={activeGem.effect3}
              handleChange={(val) => dropdownSelectEffect3(val)}
            />
          </div>
        )}
      </div>
    );
  }

  function GemListItem(props) {
    return (
      <div className={"gems-list-item" + (props.gem.index == activeGem.index ? ' active' : '')} onClick={() => {selectGem(props.gem)}}>
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

  function dropdownSelectType(val) {
    if (val && val.key) {
      let code = activeGem.code.replaceBetween(0,40, gemData.defaults[val.value])
      let type = gemData.defaults[val.value].substring(0, 8)
      let shape = gemData.defaults[val.value].substring(8, 16)
      let effect1 = gemData.defaults[val.value].substring(16, 24)
      let effect2 = gemData.defaults[val.value].substring(24, 32)
      let effect3 = gemData.defaults[val.value].substring(32, 40)

      setHold(true)
      setActiveGem({
        ...activeGem,
        type: gemData.types[type],
        shape: gemData[gemData.types[type] == 'rune' ? 'rune_shapes' : 'gem_shapes'][shape],
        effect1: gemData[gemData.types[type] == 'rune' ? 'rune_effects' : 'gem_effects'][effect1],
        effect2: gemData[gemData.types[type] == 'rune' ? 'rune_effects' : 'gem_effects'][effect2],
        effect3: gemData[gemData.types[type] == 'rune' ? 'rune_effects' : 'gem_effects'][effect3],
        code: code
      });
    }
  }

  function dropdownSelectShape(val) {
    if (val && val.key) {
      let code = activeGem.code.replaceBetween(8,16,val.key)
      setHold(true)
      setActiveGem({ ...activeGem, shape: gemData[activeGem.type == 'rune' ? 'rune_shapes' : 'gem_shapes'][val.key], code: code });
    }
  }

  function dropdownSelectEffect1(val) {
    if (val && val.key) {
      let code = activeGem.code.replaceBetween(16,24,val.key)
      setHold(true)
      setActiveGem({ ...activeGem, effect1: gemData[activeGem.type == 'rune' ? 'rune_effects' : 'gem_effects'][val.key], code: code });
    }
  }

  function dropdownSelectEffect2(val) {
    if (val && val.key) {
      let code = activeGem.code.replaceBetween(24,32,val.key)
      setHold(true)
      setActiveGem({ ...activeGem, effect2: gemData[activeGem.type == 'rune' ? 'rune_effects' : 'gem_effects'][val.key], code: code });
    }
  }

  function dropdownSelectEffect3(val) {
    if (val && val.key) {
      let code = activeGem.code.replaceBetween(32,40,val.key)
      setHold(true)
      setActiveGem({ ...activeGem, effect3: gemData[activeGem.type == 'rune' ? 'rune_effects' : 'gem_effects'][val.key], code: code });
    }
  }

  function selectGem(gem) {
    setActiveGem(gem)
  }

  return (
    <div className="gems-wrapper">
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
  if (!save.startsWith("410000000000")) {
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
  } else {
    shape = gemData.rune_shapes[gem.substring(8, 16)]
    effect1 = gemData.rune_effects[gem.substring(16, 24)];
    effect2 = gemData.rune_effects[gem.substring(24, 32)];
    effect3 = gemData.rune_effects[gem.substring(32, 40)];
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
