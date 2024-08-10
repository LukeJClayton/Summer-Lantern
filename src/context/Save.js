import { createContext, useState } from 'react';

export const SaveContext = createContext([{}, () => {}])

export const SaveProvider = ({children}) => {
	const [save, setSave] = useState('')

	return (
		<SaveContext.Provider value={{ save, setSave }}>
			{children}
		</SaveContext.Provider>
	)
}