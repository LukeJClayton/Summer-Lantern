import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import weaponData from "../data/weapons.json";

function WeaponsMenu() {
	const {save, setSave} = useContext(SaveContext);
	const [weapons, setWeapons] = useState([])
	const [activeWeapon, setActiveWeapon] = useState(false)
  const [sortedWeapons, setSortedWeapons] = useState([])
	const [hold, setHold] = useState(false)
	let weaponElements = []

	useEffect(() => {
		processWeapons(save)
	}, [save]);

	let loaded = false;
	useEffect(() => {
		if (!loaded) {
			loaded = true
      let processedSave = processWeapons(save)
			setWeapons(processedSave.allWeapons);
			if (!hold) {
				setActiveWeapon(false)
			} else {
				setHold(false)
			}
		}
	}, [save]);

	useEffect(() => {
		updateWeapon()
	}, [activeWeapon]);

	function updateWeapon() {
    if (activeWeapon) {
  		let temp = save.replaceBetween(activeWeapon.index, activeWeapon.index + 32, activeWeapon.code)
      let temp2 = temp.replaceBetween(activeWeapon.originalIndex, activeWeapon.originalIndex + 8, activeWeapon.code.substring(16, 24))
  		setSave(temp2)
    }
	}

	function selectWeapon(weapon) {
		setActiveWeapon(weapon)
	}

	function dropdownSelectWeapon(val) {
		if (val && val.key) {
			let code = activeWeapon.code.replaceBetween(16, 24,val.key)
			setHold(true)
			setActiveWeapon({ ...activeWeapon, weapon: weaponData.weapons[val.key], code: code });
		}
	}

	for (var i = 0; i < weapons.length; i++) {
		weaponElements.push(<WeaponListItem key={i} weapon={weapons[i]} />);
	}

	function WeaponListItem(props) {
		return (
			<div className={"weapons-list-item" + (props.weapon.index == activeWeapon.index ? ' active' : '')} onClick={() => {selectWeapon(props.weapon)}}>
			<p>Weapon: {props.weapon.weapon}</p>
			</div>
		);
	}

	function WeaponEditItem(props) {

   function weaponSort(a, b) {
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

   if (!sortedWeapons.length && activeWeapon) {
      let tempArray = []
      for (const [key, value] of Object.entries(weaponData.weapons)) {
        tempArray.push({key: key, value: value})
      }
      tempArray.sort(weaponSort)
      setSortedWeapons(tempArray)
   }

		return (
			<div className="weapons-active">
				{activeWeapon && (
					<div>
						<SearchableDropdown
						options={sortedWeapons}
						label="value"
						id="key"
						selectedVal={activeWeapon.weapon}
						handleChange={(val) => dropdownSelectWeapon(val)}
						/>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="weapons-wrapper">
		{weapons.length > 0 && (
			<div className="weapons">
				<WeaponEditItem weapon={activeWeapon} />
				<div className="weapons-list">
					{weaponElements}
				</div>
			</div>
		)}
		</div>
	);
}

function processWeapons(save) {
  if (!save.startsWith("410000000000")) {
    return false;
  } else {
    return extractWeapons(save);
  }
}

function extractWeapons(save) {
	let startIndex = save.indexOf(weaponData.start)

	let reg = new RegExp(weaponData.start, 'gi')

	let loop = true;
	let weaponSize = 32
	let weaponNumber = 1;
	let weaponStartID = parseInt('40', 16)
	let allWeapons = []
  let emptySlots = []

	while (loop == true) {
		let weaponData = save.substring(
			startIndex + weaponSize * (weaponNumber - 1),
			startIndex + weaponSize * weaponNumber
		);
		if (parseInt(weaponData.substring(0, 2), 16) == (weaponStartID - 1) + weaponNumber) {
			let weapon = formatWeaponData(weaponData, startIndex + weaponSize * (weaponNumber - 1), save)
			if (weapon.weapon) {
				allWeapons.push(
					weapon
				);
			} else if (weaponData.substring(16, 24) == 'ffffffff') {
        emptySlots.push(
          weapon
        );
      }
			weaponNumber = weaponNumber + 1;
    } else if (weaponData.substring(0, 8) == "00000000") {
      let weapon = formatWeaponData(weaponData, startIndex + weaponSize * (weaponNumber - 1), save)
      emptySlots.push(
        weapon
      );
      weaponNumber = weaponNumber + 1;
		} else {
			loop = false;
		}
	}

	return {allWeapons: allWeapons}; 
}

function formatWeaponData(weapon, index, save) {
  let weaponName = weaponData.weapons[weapon.substring(16, 24)];
  let test = save.substring(0, index - 32)
  let originalIndex = test.indexOf(weapon.substring(16, 24))

  return {
    weapon: weaponName,
    code: weapon,
    index: index,
    originalIndex: originalIndex
  };
}

export { WeaponsMenu };