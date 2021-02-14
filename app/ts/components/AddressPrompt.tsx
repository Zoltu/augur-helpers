import * as preactHooks from 'preact/hooks'
import { addressString } from '../library/big-number-utilities'

export function AddressPrompt(model: Readonly<{
	onChange: (address: bigint | undefined) => void,
	label: string,
}>) {
	const [ stringAddress, setStringAddress ] = preactHooks.useState('')
	const [ address, setAddress ] = preactHooks.useState<undefined | bigint>(undefined)
	const [ error, setError ] = preactHooks.useState('')
	preactHooks.useEffect(() => {
		const match = /^(?:0x)?([a-fA-F0-9]{40})$/.exec(stringAddress)
		if (stringAddress === '') {
			setError('')
			if (address !== undefined) {
				setAddress(undefined)
				model.onChange(undefined)
			}
		} else if (match === null) {
			setError(`${model.label} must be a hex string encoded byte array with an optional '0x' prefix.`)
			if (address !== undefined) {
				setAddress(undefined)
				model.onChange(undefined)
			}
		} else {
			const newAddress = BigInt(`0x${match[1]}`)
			setError('')
			if (newAddress !== address) {
				setAddress(newAddress)
				model.onChange(newAddress)
			}
		}
	}, [stringAddress])

	if (address !== undefined) {
		return <>
			<label>{model.label}: </label>
			<span>{addressString(address)}</span>
			<button onClick={() => setStringAddress('')}>↻</button>
		</>
	}
	return <>
		<label>{model.label}: </label>
		<input style={{ width:'300px' }} type='text' placeholder='0x6fcd6E1D96965d52e2606fd54a192F7c6292eA41' onChange={event => setStringAddress(event.currentTarget.value)} value={stringAddress} />
		{error !== '' && <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{error}</div>}
	</>
}
