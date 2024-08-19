import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import weaponData from "../data/weapons.json";

function WeaponsMenu() {
	const {save, setSave} = useContext(SaveContext);
	const [weapons, setWeapons] = useState([])
	const [activeWeapon, setActiveWeapon] = useState(false)
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
      console.log(processedSave)
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
		let temp = save.replaceBetween(activeWeapon.index, activeWeapon.index + 32, activeWeapon.code)
		setSave(temp)
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
		let weaponOptions = []
		for (const [key, value] of Object.entries(weaponData.weapons)) {
			weaponOptions.push({
				key: key,
				value: value
			});
		}

		return (
			<div className="weapons-active">
				{activeWeapon && (
					<div>
						<SearchableDropdown
						options={weaponOptions}
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
	console.log(weapons)
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
			let weapon = formatWeaponData(weaponData, startIndex + weaponSize * (weaponNumber - 1))
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
      let weapon = formatWeaponData(weaponData, startIndex + weaponSize * (weaponNumber - 1))
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

function formatWeaponData(weapon, index) {
	console.log(weapon)
	console.log(weapon.substring(16, 24))
  let weaponName = weaponData.weapons[weapon.substring(16, 24)];

  return {
    weapon: weaponName,
    code: weapon,
    index: index
  };
}

export { WeaponsMenu };