import { attoToString } from '../library/big-number-utilities'
import { useAsyncState } from '../library/preact-utilities'

export function TransferUni(model: Readonly<{
	withdrawUni: (amount: bigint) => void,
	getBalance: () => Promise<bigint>,
}>) {
	const [ balance, setBalance ] = useAsyncState(model.getBalance)
	switch (balance.state) {
		case 'pending':
			return <div>
				<span>UNI: <svg style={{ height: '1em' }} class='spinner' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45"/></svg></span>
			</div>
		case 'inactive':
		case 'rejected':
			return <div>
				<div>UNI: <button onClick={() => setBalance(model.getBalance)}>↻</button></div>
				{balance.state === 'rejected' && <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{balance.error.message}</div>}
			</div>
		case 'resolved':
			return <div>
				<div><span>UNI: {attoToString(balance.value)}</span> <button onClick={() => setBalance(model.getBalance)}>↻</button></div>
				<button onClick={() => model.withdrawUni(balance.value)}>Withdraw To Self</button>
			</div>
	}
}
