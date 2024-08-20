import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import armourData from "../data/armours.json";

function ArmoursMenu() {
  const {save, setSave} = useContext(SaveContext);
  const [armours, setArmours] = useState([])
  const [activeArmour, setActiveArmour] = useState(false)
  const [sortedArmours, setSortedArmours] = useState([])
  const [hold, setHold] = useState(false)
  let armourElements = []

  useEffect(() => {
    processArmours(save)
  }, [save]);

  let loaded = false;
  useEffect(() => {
    if (!loaded) {
      loaded = true
      let processedSave = processArmours(save)
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
      let temp2 = temp.replaceBetween(activeArmour.originalIndex, activeArmour.originalIndex + 8, activeArmour.code.substring(16, 24))
      setSave(temp2)
    }
  }

  function selectArmour(armour) {
    setActiveArmour(armour)
  }

  function dropdownSelectArmour(val) {
    if (val && val.key) {
      let code = activeArmour.code.replaceBetween(16, 24,val.key)
      setHold(true)
      setActiveArmour({ ...activeArmour, armour: armourData.armours[val.key], code: code });
    }
  }

  for (var i = 0; i < armours.length; i++) {
    armourElements.push(<ArmourListItem key={i} armour={armours[i]} />);
  }

  function ArmourListItem(props) {
    return (
      <div className={"armours-list-item" + (props.armour.index == activeArmour.index ? ' active' : '')} onClick={() => {selectArmour(props.armour)}}>
      <p>Armour: {props.armour.armour}</p>
      </div>
    );
  }

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

  return {
    armour: armourName,
    code: armour,
    index: index,
    originalIndex: originalIndex
  };
}

export { ArmoursMenu };