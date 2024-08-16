import { useContext, useState, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import itemData from "../data/items.json";

function ItemsMenu() {
	const {save, setSave} = useContext(SaveContext);

	useEffect(() => {
		processItems(save)
	}, [save]);

	return (
		<div></div>
	)
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
			allItems.push(
				itemData //format here
			);
			itemNumber = itemNumber + 1;
		} else {
			loop = false;
		}

		console.log(allItems)
	}
}

export { ItemsMenu };