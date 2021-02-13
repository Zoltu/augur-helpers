import * as preactHooks from 'preact/hooks'
import { bigintToDecimalString } from '../library/big-number-utilities'
import { AsyncProperty, refreshableAsyncState } from '../library/react-utilities'
import { AddressPrompt } from './AddressPrompt'

function ShareAmount(model: Readonly<{
	amount: bigint,
	numTicks: bigint
}>) {
	if (!Number.isSafeInteger(Number(model.numTicks))) return <div>numTicks is too large: {model.numTicks.toString(10)}</div>
	const numTicksNumber = Number(model.numTicks)
	if (!/^10+$/.test(numTicksNumber.toString(10))) return <div>numTicks isn't a power of 10: {model.numTicks.toString(10)}</div>
	const shareScalingFactor = 18n - BigInt(Math.log(numTicksNumber) * Math.LOG10E)
	const amountString = bigintToDecimalString(model.amount, shareScalingFactor)
	return <span>{amountString}</span>
}

function OutcomeBalance(model: Readonly<{
	label: string,
	balance: Promise<bigint>,
	numTicks: bigint
}>) {
	const [, forceUpdate] = preactHooks.useReducer<number, void>(x => x + 1, 0)
	const balanceAsync = preactHooks.useMemo(() => refreshableAsyncState(forceUpdate, () => model.balance), [model.balance])
	switch (balanceAsync.state) {
		case 'pending':
			return <div>Loading balance...</div>
		case 'rejected':
			return <div>Error loading balance: {balanceAsync.error.message}</div>
		case 'resolved':
			return <div>
				<span>{model.label}: </span>
				<ShareAmount amount={balanceAsync.value} numTicks={model.numTicks} />
			</div>
	}
}

function ClaimButton(model: Readonly<{
	claim: () => Promise<void>
}>) {
	const [, forceUpdate] = preactHooks.useReducer<number, void>(x => x + 1, 0)
	const [claimResult, setClaimResult ] = preactHooks.useState<undefined | AsyncProperty<void>>(undefined)
	switch (claimResult?.state) {
		case undefined:
			return <div><button onClick={() => setClaimResult(refreshableAsyncState(forceUpdate, async () => model.claim()))}>Claim</button></div>
		case 'pending':
			return <div><span><svg style={{ height: '1em' }} class='spinner' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45"/></svg></span></div>
		case 'rejected':
			return <>
				<button onClick={() => setClaimResult(refreshableAsyncState(forceUpdate, async () => model.claim()))}>Claim</button>
				<div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{claimResult.error.message}</div>
			</>
		case 'resolved':
			return <></>
	}
}

function ClaimOutcomes(model: Readonly<{
	getShareBalance: (outcome: number) => Promise<bigint>,
	claimWinnings?: () => Promise<void>,
	marketAddress: bigint,
	numOutcomes: number,
	numTicks: bigint,
}>) {
	if (model.numOutcomes === 3) {
		return <div>
			<OutcomeBalance label='INVALID' balance={model.getShareBalance(0)} numTicks={model.numTicks} />
			<OutcomeBalance label='NO' balance={model.getShareBalance(1)} numTicks={model.numTicks} />
			<OutcomeBalance label='YES' balance={model.getShareBalance(2)} numTicks={model.numTicks} />
			{model.claimWinnings !== undefined && <ClaimButton claim={model.claimWinnings} />}
		</div>
	} else {
		return <div>
			<OutcomeBalance label='INVALID' balance={model.getShareBalance(0)} numTicks={model.numTicks} />
			{[...Array(model.numOutcomes - 1).keys()].map(x => x + 1).map(outcome => {
				<OutcomeBalance label={`OUTCOME-${outcome}`} balance={model.getShareBalance(outcome)} numTicks={model.numTicks} />
			})}
			{model.claimWinnings !== undefined && <ClaimButton claim={model.claimWinnings} />}
		</div>
	}
}

export function Claim(model: Readonly<{
	getMarketDetails: (market: bigint) => Promise<{ address: bigint, numOutcomes: number, numTicks: bigint }>,
	getShareBalance: (market: bigint, outcome: number) => Promise<bigint>,
	claimWinnings?: (market: bigint) => Promise<void>,
}>) {
	const [, forceUpdate] = preactHooks.useReducer<number, void>(x => x + 1, 0)
	const [ marketAddress, setMarketAddress ] = preactHooks.useState<undefined | bigint>(undefined)
	const marketDetails = preactHooks.useMemo(() => refreshableAsyncState(forceUpdate, async () => {
		if (marketAddress === undefined) return undefined
		return await model.getMarketDetails(marketAddress)
	}), [marketAddress])

	return <div>
		<AddressPrompt label='Market Address' onChange={setMarketAddress} />
		{
			marketDetails.state === 'pending' ? <div>Loading Market...</div>
			: marketDetails.state === 'rejected' ? <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>Error loading market: {marketDetails.error.message}</div>
			: marketDetails.value !== undefined ? <ClaimOutcomes
				claimWinnings={model.claimWinnings === undefined ? undefined : model.claimWinnings.bind(undefined, marketDetails.value.address)}
				getShareBalance={model.getShareBalance.bind(undefined, marketDetails.value.address)}
				marketAddress={marketDetails.value.address}
				numOutcomes={marketDetails.value.numOutcomes}
				numTicks={marketDetails.value.numTicks}
			/>
			: <></>
		}
	</div>
}
