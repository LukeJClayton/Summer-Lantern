import { useUpdateSaveState, useUpdateFile } from '../js/SaveHandler.js'

function SaveHandler(props) {
	const { updateSaveState } = useUpdateSaveState()
	const { updateFile } = useUpdateFile()

	return (
		<div>
			<label for="file">Save File</label>
  			<input id="file" name="file" type="file" />
  			<button onClick={updateSaveState}>Process Save</button>
  			<button onClick={updateFile}>Download File</button>
		</div>
	)
}

export {SaveHandler}