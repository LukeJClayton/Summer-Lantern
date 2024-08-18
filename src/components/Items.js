import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import itemData from "../data/items.json";

function ItemsMenu() {
	const {save, setSave} = useContext(SaveContext);
	const [items, setItems] = useState([])
	const [activeItem, setActiveItem] = useState(false)
	const [hold, setHold] = useState(false)
	let itemElements = []

	useEffect(() => {
		processItems(save)
	}, [save]);

	let loaded = false;
	useEffect(() => {
		if (!loaded) {
			loaded = true
			setItems(processItems(save));
			if (!hold) {
				setActiveItem(false)
			} else {
				setHold(false)
			}
		}
	}, [save]);

	useEffect(() => {
		updateItem()
	}, [activeItem]);

	function updateItem() {
		let temp = save.replaceBetween(activeItem.index, activeItem.index + 32, activeItem.code)
		setSave(temp)
	}

	function selectItem(item) {
		setActiveItem(item)
	}

	function dropdownSelectItem(val) {
		if (val && val.key) {
			let code = activeItem.code.replaceBetween(16, 24,val.key)
			setHold(true)
			setActiveItem({ ...activeItem, item: itemData.items[val.key], code: code });
		}
	}

	for (var i = 0; i < items.length; i++) {
		itemElements.push(<ItemListItem key={i} item={items[i]} />);
	}

	function ItemListItem(props) {
		return (
			<div className={"items-list-item" + (props.item.index == activeItem.index ? ' active' : '')} onClick={() => {selectItem(props.item)}}>
			<p>Item: {props.item.item}</p>
			<p>Quantity: {props.item.quantity}</p>
			</div>
		);
	}

	function ItemEditItem(props) {
		let itemOptions = []
		for (const [key, value] of Object.entries(itemData.items)) {
			itemOptions.push({
				key: key,
				value: value
			});
		}

		return (
			<div className="items-active">
				{activeItem && (
					<div>
						<SearchableDropdown
						options={itemOptions}
						label="value"
						id="key"
						selectedVal={activeItem.item}
						handleChange={(val) => dropdownSelectItem(val)}
						/>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="items-wrapper">
		{items.length > 0 && (
			<div className="items">
				<ItemEditItem item={activeItem} />
				<div className="items-list">
					{itemElements}
				</div>
			</div>
		)}
		</div>
	);
}

function processItems(save) {
  if (!save.startsWith("410000000000")) {
    return false;
  } else {
    return extractItems(save);
  }
}

function extractItems(save) {
	let startIndex = save.indexOf(itemData.start)

	let reg = new RegExp(itemData.start, 'gi')

	let loop = true;
	let itemSize = 32
	let itemNumber = 1;
	let itemStartID = parseInt('40', 16)
	let allItems = []

	while (loop == true) {
		let itemData = save.substring(
			startIndex + itemSize * (itemNumber - 1),
			startIndex + itemSize * itemNumber
		);
		if (parseInt(itemData.substring(0, 2), 16) == (itemStartID - 1) + itemNumber) {
			let item = formatItemData(itemData, startIndex + itemSize * (itemNumber - 1))
			if (item.item) {
				allItems.push(
					item
				);
			}
			itemNumber = itemNumber + 1;
		} else {
			loop = false;
		}
	}

	return allItems; 
}

function formatItemData(item, index) {
  let itemName = itemData.items[item.substring(16, 24)];
  let quantity = parseInt(item.substring(24, 26), 16)

  return {
    item: itemName,
    code: item,
    quantity: quantity,
    index: index
  };
}

export { ItemsMenu };