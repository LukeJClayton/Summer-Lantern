import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import { extractGems } from "./Gems.js";
import armourData from "../data/armours.json";

function ArmoursMenu() {
  const {save, setSave} = useContext(SaveContext);
  const [armours, setArmours] = useState([])
  const [activeArmour, setActiveArmour] = useState(false)
  const [sortedArmours, setSortedArmours] = useState([])
  const [hold, setHold] = useState(false)
  const [gems, setGems] = useState([])
  let armourElements = []

  useEffect(() => {
    processArmours(save)
  }, [save]);

  let loaded = false;
  useEffect(() => {
    if (!loaded) {
      loaded = true
      let processedSave = processArmours(save)
      setGems(extractGems(save))
      setArmours(processedSave.allArmours);
      if (!hold) {
        setActiveArmour(false)
      } else {
        setHold(false)
      }
    }
  }, [save]);

  useEffect(() => {
    updateArmour()
  }, [activeArmour]);

  function updateArmour() {
    if (activeArmour) {
      let temp = save.replaceBetween(activeArmour.index, activeArmour.index + 32, activeArmour.code)
      temp = temp.replaceBetween(activeArmour.originalIndex, activeArmour.originalIndex + 8, activeArmour.code.substring(16, 24))
      console.log(activeArmour)
      if (activeArmour.gem1 && activeArmour.gem1 !== "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*0), activeArmour.originalIndex + 48 + (16*0), '01000000' + activeArmour.gem1)
      } else if (activeArmour.gem1 == "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*0), activeArmour.originalIndex + 48 + (16*0), '0000008000000000')
      }

      if (activeArmour.gem2 && activeArmour.gem2 !== "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*1), activeArmour.originalIndex + 48 + (16*1), '01000000' + activeArmour.gem2)
      } else if (activeArmour.gem2 == "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*1), activeArmour.originalIndex + 48 + (16*1), '0000008000000000')
      }

      if (activeArmour.gem3 && activeArmour.gem3 !== "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*2), activeArmour.originalIndex + 48 + (16*2), '01000000' + activeArmour.gem3)
      } else if (activeArmour.gem3 == "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*2), activeArmour.originalIndex + 48 + (16*2), '0000008000000000')
      }

      if (activeArmour.gem4 && activeArmour.gem4 !== "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*3), activeArmour.originalIndex + 48 + (16*3), '01000000' + activeArmour.gem4)
      } else if (activeArmour.gem4 == "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*3), activeArmour.originalIndex + 48 + (16*3), '0000008000000000')
      }

      if (activeArmour.gem5 && activeArmour.gem5 !== "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*4), activeArmour.originalIndex + 48 + (16*4), '01000000' + activeArmour.gem5)
      } else if (activeArmour.gem5 == "No Gem") {
        temp = temp.replaceBetween(activeArmour.originalIndex + 32 + (16*4), activeArmour.originalIndex + 48 + (16*4), '0000008000000000')
      }
      setSave(temp)
    }
  }

  function selectArmour(armour) {
    console.log(armour)
    setActiveArmour(armour)
  }

  function dropdownSelectArmour(val) {
    if (val && val.key) {
      let code = activeArmour.code.replaceBetween(16, 24,val.key)
      setHold(true)
      setActiveArmour({ ...activeArmour, armour: armourData.armours[val.key], code: code });
    }
  }

  function dropdownSelectGem1(val) {
    if (val && val.key) {
      setHold(true)
      setActiveArmour({ ...activeArmour, gem1: val.key, code: activeArmour.code });
    }
  }

  function dropdownSelectGem2(val) {
    if (val && val.key) {
      setHold(true)
      setActiveArmour({ ...activeArmour, gem2: val.key, code: activeArmour.code });
    }
  }

  function dropdownSelectGem3(val) {
    if (val && val.key) {
      setHold(true)
      setActiveArmour({ ...activeArmour, gem3: val.key, code: activeArmour.code });
    }
  }

  function dropdownSelectGem4(val) {
    if (val && val.key) {
      setHold(true)
      setActiveArmour({ ...activeArmour, gem4: val.key, code: activeArmour.code });
    }
  }

  function dropdownSelectGem5(val) {
    if (val && val.key) {
      setHold(true)
      setActiveArmour({ ...activeArmour, gem5: val.key, code: activeArmour.code });
    }
  }


  for (var i = 0; i < armours.length; i++) {
    armourElements.push(<ArmourListItem key={i} armour={armours[i]} />);
  }

  function ArmourListItem(props) {
    return (
      <div className={"armours-list-item" + (props.armour.index == activeArmour.index ? ' active' : '')} onClick={() => {selectArmour(props.armour)}}>
      <p>Armour: {props.armour.armour}</p>
      <p>Gem 1: {props.armour.gem1}</p>
      <p>Gem 2: {props.armour.gem2}</p>
      <p>Gem 3: {props.armour.gem3}</p>
      <p>Gem 4: {props.armour.gem4}</p>
      <p>Gem 5: {props.armour.gem5}</p>
      </div>
    );
  }

  let gemsOptions = gems.map((item) => {
    return {key:item.id, value:item.id}
  })
  gemsOptions.push({key:'No Gem', value:'No Gem'})

  function ArmourEditItem(props) {

   function armourSort(a, b) {
    var parts = {
      a: a.value.split('+'),
      b: b.value.split('+'),
    }

    if (parts.a[0] == parts.b[0] && parts.a[1] && parts.b[1]) {
      let vala = parts.a[1]
      let valb = parts.b[1]
      return parseFloat(vala) - parseFloat(valb)
    } else {
      return parts.a[0] > parts.b[0] ? 1: -1
    }
   }

   if (!sortedArmours.length && activeArmour) {
      let tempArray = []
      for (const [key, value] of Object.entries(armourData.armours)) {
        tempArray.push({key: key, value: value})
      }
      tempArray.sort(armourSort)
      setSortedArmours(tempArray)
   }

    return (
      <div className="armours-active">
        {activeArmour && (
          <div>
            <SearchableDropdown
            options={sortedArmours}
            label="value"
            id="key"
            selectedVal={activeArmour.armour}
            handleChange={(val) => dropdownSelectArmour(val)}
            />
            <SearchableDropdown
            options={gemsOptions}
            label="value"
            id="key"
            selectedVal={activeArmour.gem1}
            handleChange={(val) => dropdownSelectGem1(val)}
            />
            <SearchableDropdown
            options={gemsOptions}
            label="value"
            id="key"
            selectedVal={activeArmour.gem2}
            handleChange={(val) => dropdownSelectGem2(val)}
            />
            <SearchableDropdown
            options={gemsOptions}
            label="value"
            id="key"
            selectedVal={activeArmour.gem3}
            handleChange={(val) => dropdownSelectGem3(val)}
            />
            <SearchableDropdown
            options={gemsOptions}
            label="value"
            id="key"
            selectedVal={activeArmour.gem4}
            handleChange={(val) => dropdownSelectGem4(val)}
            />
            <SearchableDropdown
            options={gemsOptions}
            label="value"
            id="key"
            selectedVal={activeArmour.gem5}
            handleChange={(val) => dropdownSelectGem5(val)}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="armours-wrapper">
    {armours.length > 0 && (
      <div className="armours">
        <ArmourEditItem armour={activeArmour} />
        <div className="armours-list">
          {armourElements}
        </div>
      </div>
    )}
    </div>
  );
}

function processArmours(save) {
  if (!save.startsWith("410000000000")) {
    return false;
  } else {
    return extractArmours(save);
  }
}

function extractArmours(save) {
  let startIndex = save.indexOf(armourData.start)

  let reg = new RegExp(armourData.start, 'gi')

  let loop = true;
  let armourSize = 32
  let armourNumber = 1;
  let armourStartID = parseInt('40', 16)
  let allArmours = []
  let emptySlots = []

  while (loop == true) {
    let armourData = save.substring(
      startIndex + armourSize * (armourNumber - 1),
      startIndex + armourSize * armourNumber
    );
    if (parseInt(armourData.substring(0, 2), 16) == (armourStartID - 1) + armourNumber) {
      let armour = formatArmourData(armourData, startIndex + armourSize * (armourNumber - 1), save)
      if (armour.armour) {
        allArmours.push(
          armour
        );
      } else if (armourData.substring(16, 24) == 'ffffffff') {
        emptySlots.push(
          armour
        );
      }
      armourNumber = armourNumber + 1;
    } else if (armourData.substring(0, 8) == "00000000") {
      let armour = formatArmourData(armourData, startIndex + armourSize * (armourNumber - 1), save)
      emptySlots.push(
        armour
      );
      armourNumber = armourNumber + 1;
    } else {
      loop = false;
    }
  }

  return {allArmours: allArmours}; 
}

function formatArmourData(armour, index, save) {
  let armourName = armourData.armours[armour.substring(16, 24)];
  let test = save.substring(0, index - 32)
  let originalIndex = test.indexOf(armour.substring(16, 24))

  let gem1 = save.substring(originalIndex + 40 + (16*0), originalIndex + 48 + (16*0))
  let gem2 = save.substring(originalIndex + 40 + (16*1), originalIndex + 48 + (16*1))
  let gem3 = save.substring(originalIndex + 40 + (16*2), originalIndex + 48 + (16*2))
  let gem4 = save.substring(originalIndex + 40 + (16*3), originalIndex + 48 + (16*3))
  let gem5 = save.substring(originalIndex + 40 + (16*4), originalIndex + 48 + (16*4))

  return {
    armour: armourName,
    gem1: gem1 === '00000000' ? 'No Gem' : gem1,
    gem2: gem2 === '00000000' ? 'No Gem' : gem2,
    gem3: gem3 === '00000000' ? 'No Gem' : gem3,
    gem4: gem4 === '00000000' ? 'No Gem' : gem4,
    gem5: gem5 === '00000000' ? 'No Gem' : gem5,
    code: armour,
    index: index,
    originalIndex: originalIndex
  };
}

export { ArmoursMenu };