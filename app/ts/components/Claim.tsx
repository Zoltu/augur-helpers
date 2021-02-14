import * as preactHooks from 'preact/hooks'
import { bigintToDecimalString } from '../library/big-number-utilities'
import { asyncState } from '../library/react-utilities'
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
	getBalance: () => Promise<bigint>,
	numTicks: bigint
}>) {
	const [ balanceAsync, setBalanceAsync ] = asyncState(model.getBalance)
	switch (balanceAsync.state) {
		case 'inactive':
			return <div><button onClick={() => setBalanceAsync(model.getBalance)}>↻</button></div>
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
	const [ claimResultAsync, setClaimResultAsync ] = asyncState<void>()
	switch (claimResultAsync.state) {
		case 'pending':
			return <div>
				<span><svg style={{ height: '1em' }} class='spinner' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45"/></svg></span>
			</div>
		case 'inactive':
		case 'rejected':
			return <div>
				<button onClick={() => setClaimResultAsync(model.claim)}>Claim</button>
				{claimResultAsync.state === 'rejected' && <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{claimResultAsync.error.message}</div>}
			</div>
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
			<OutcomeBalance label='INVALID' getBalance={() => model.getShareBalance(0)} numTicks={model.numTicks} />
			<OutcomeBalance label='NO' getBalance={() => model.getShareBalance(1)} numTicks={model.numTicks} />
			<OutcomeBalance label='YES' getBalance={() => model.getShareBalance(2)} numTicks={model.numTicks} />
			{model.claimWinnings !== undefined && <ClaimButton claim={model.claimWinnings} />}
		</div>
	} else {
		return <div>
			<OutcomeBalance label='INVALID' getBalance={() => model.getShareBalance(0)} numTicks={model.numTicks} />
			{[...Array(model.numOutcomes - 1).keys()].map(x => x + 1).map(outcome => {
				<OutcomeBalance label={`OUTCOME-${outcome}`} getBalance={() => model.getShareBalance(outcome)} numTicks={model.numTicks} />
			})}
			{model.claimWinnings !== undefined && <ClaimButton claim={model.claimWinnings} />}
		</div>
	}
}

export function Market(model: Readonly<{
	getShareBalance: (outcome: number) => Promise<bigint>,
	claimWinnings?: () => Promise<void>,
	marketDetails: { address: bigint, numOutcomes: number, numTicks: bigint }
}>) {
	return <ClaimOutcomes
		claimWinnings={model.claimWinnings}
		getShareBalance={model.getShareBalance}
		marketAddress={model.marketDetails.address}
		numOutcomes={model.marketDetails.numOutcomes}
		numTicks={model.marketDetails.numTicks}
	/>
}

export function MaybeMarket(model: Readonly<{
	getMarketDetails: () => Promise<{ address: bigint, numOutcomes: number, numTicks: bigint }>,
	getShareBalance: (outcome: number) => Promise<bigint>,
	claimWinnings?: () => Promise<void>,
}>) {
	const [ marketDetails, queryMarketDetails ] = asyncState(model.getMarketDetails)
	switch (marketDetails.state) {
		case 'pending':
			return <div>
				<svg style={{ height: '1em' }} class='spinner' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45"/></svg>
			</div>
		case 'inactive':
		case 'rejected':
			return <div>
				<button onClick={() => queryMarketDetails(model.getMarketDetails)}>↻</button>
				{marketDetails.state === 'rejected' && <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{marketDetails.error.message}</div>}
			</div>
		case 'resolved':
			return <div>
				<Market getShareBalance={model.getShareBalance} marketDetails={marketDetails.value} claimWinnings={model.claimWinnings} />
			</div>

	}
}

export function Account(model: Readonly<{
	getMarketDetails: (market: bigint) => Promise<{ address: bigint, numOutcomes: number, numTicks: bigint }>,
	getShareBalance: (market: bigint, outcome: number) => Promise<bigint>,
	claimWinnings?: (market: bigint) => Promise<void>,
}>) {
	const [ marketAddress, setMarketAddress ] = preactHooks.useState<undefined | bigint>(undefined)
	const claimWinnings = model.claimWinnings
	return <div>
		<AddressPrompt
			label='Market Address'
			onChange={setMarketAddress}
		/>
		{marketAddress !== undefined && <MaybeMarket
			getMarketDetails={() => model.getMarketDetails(marketAddress)}
			getShareBalance={outcome => model.getShareBalance(marketAddress, outcome)}
			claimWinnings={claimWinnings === undefined ? undefined : () => claimWinnings(marketAddress)}
		/>}
	</div>
}
