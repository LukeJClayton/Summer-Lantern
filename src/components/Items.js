import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { SearchableDropdown } from "./SearchableDropdown.js";
import itemData from "../data/items.json";

function ItemsMenu() {
	const {save, setSave} = useContext(SaveContext);
	const [items, setItems] = useState([])
  const [emptySlots, setEmptySlots] = useState([])
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
      let processedSave = processItems(save)
			setItems(processedSave.allItems);
      setEmptySlots(processedSave.emptySlots);
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

  function dropdownSelectQuantity(val) {
    if (val && val.key) {
      let code = activeItem.code.replaceBetween(24, 26, val.key)
      setHold(true)
      setActiveItem({ ...activeItem, quantity: val.value, code: code });
    }
  }

	for (var i = 0; i < items.length; i++) {
		itemElements.push(<ItemListItem key={i} item={items[i]} />);
	}

  function addNewItem() {
    let item = emptySlots.splice(0, 1)[0]
    let index = parseInt(save.substring(item.index - 32, item.index - 30), 16) + 1
    let code = item.code = index.toString(16) + itemData.default
    let newItem = {...item, quantity: parseInt(code.substring(24, 26), 16), item: itemData.items[code.substring(16, 24)], code: code }
    let temp = items
    temp.push(newItem)
    setItems(temp)
    setHold(true)
    selectItem(newItem)
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

    let quantityOptions = []
    let quantity = Array.from(Array(99).keys())
    for (var i = 0; i < quantity.length; i++) {
      quantityOptions.push({
        key: toHex(quantity[i]),
        value: quantity[i].toString()
      })
    }

    function toHex(d) {
      return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
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
            <SearchableDropdown
            options={quantityOptions}
            label="value"
            id="key"
            selectedVal={activeItem.quantity}
            handleChange={(val) => dropdownSelectQuantity(val)}
            />
					</div>
				)}
        <div>
          <button onClick={() => {addNewItem()}}>
            Add New Item
          </button>
        </div>
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
  let emptySlots = []

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
			} else if (itemData.substring(16, 24) == 'ffffffff') {
        emptySlots.push(
          item
        );
      }
			itemNumber = itemNumber + 1;
    } else if (itemData.substring(0, 8) == "00000000") {
      let item = formatItemData(itemData, startIndex + itemSize * (itemNumber - 1))
      emptySlots.push(
        item
      );
      itemNumber = itemNumber + 1;
		} else {
			loop = false;
		}
	}

	return {allItems: allItems, emptySlots: emptySlots}; 
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