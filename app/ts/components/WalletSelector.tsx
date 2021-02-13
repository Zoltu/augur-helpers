import * as preactHooks from 'preact/hooks'
import { BrowserDependencies } from '@zoltu/solidity-typescript-generator-browser-dependencies'
import { FetchDependencies, FetchJsonRpc } from '@zoltu/solidity-typescript-generator-fetch-dependencies'
import { Market } from '../library/market';
import { ShareToken } from '../library/share-token';
import { AddressPrompt } from './AddressPrompt';
import { addressString } from '../library/big-number-utilities';

export interface BaseWallet {
	address: bigint
	getMarketDetails: (market: bigint) => Promise<{ address: bigint, numOutcomes: number, numTicks: bigint }>
	getShareBalance: (user: bigint, market: bigint, outcome: number) => Promise<bigint>
}

export interface ViewingWallet extends BaseWallet {
	type: 'viewing'
}

export interface SigningWallet extends BaseWallet {
	type: 'signing'
	claimWinnings: (user: bigint, market: bigint) => Promise<void>
}

export type Wallet = SigningWallet | ViewingWallet

async function tryCreateInjectedWallet() {
	const browserDependencies = new BrowserDependencies(undefined, {})
	const shareToken = new ShareToken(browserDependencies, 0x9e4799ff2023819b1272eee430eadf510eDF85f0n)

	const accounts = await browserDependencies.request('eth_requestAccounts', []) as string[]
	if (accounts.length === 0) throw new Error(`No accounts returned by wallet provider.  Did you deny the account request prompt?`)
	if (!/(0x)?[a-zA-Z0-9]{40}/.test(accounts[0])) throw new Error(`Wallet provider returned an address that doesn't look like an address: ${accounts[0]}`)
	const address = BigInt(accounts[0])

	const wallet: SigningWallet = {
		type: 'signing',
		address: address,
		getMarketDetails: async marketAddress => {
			const market = new Market(browserDependencies, marketAddress)
			return {
				address: marketAddress,
				numOutcomes: Number(await market.getNumberOfOutcomes_()),
				numTicks: await market.getNumTicks_(),
			}
		},
		getShareBalance: async (user, market, outcome) => {
			return await shareToken.balanceOfMarketOutcome_(market, BigInt(outcome), user)
		},
		claimWinnings: async (user, market) => {
			await shareToken.claimTradingProceeds(market, user, 0n)
		},
	}

	return wallet
}

function createViewingWallet(address: bigint) {
	const jsonRpcAddress = 'https://ethereum.zoltu.io'
	const rpc = new FetchJsonRpc(jsonRpcAddress, window.fetch.bind(window), { addressProvider: async () => address })
	const fetchDependencies = new FetchDependencies(rpc)
	const shareToken = new ShareToken(fetchDependencies, 0x9e4799ff2023819b1272eee430eadf510eDF85f0n)

	const wallet: ViewingWallet = {
		type: 'viewing',
		address: address,
		getMarketDetails: async marketAddress => {
			const market = new Market(fetchDependencies, marketAddress)
			return {
				address: marketAddress,
				numOutcomes: Number(await market.getNumberOfOutcomes_()),
				numTicks: await market.getNumTicks_(),
			}
		},
		getShareBalance: async (user, market, outcome) => {
			return await shareToken.balanceOfMarketOutcome_(market, BigInt(outcome), user)
		},
	}

	return wallet
}

function ConnectToInjected(model: Readonly<{
	onChange: (wallet: ViewingWallet | SigningWallet | undefined) => void,
}>) {
	const [ error, setError ] = preactHooks.useState('')
	return <>
		<button onClick={() => tryCreateInjectedWallet().then(x => model.onChange(x)).catch(error => setError(error.message))}>Connect to Injected Wallet</button>
		{error !== '' && <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{error}</div>}
	</>
}

export function WalletSelector(model: Readonly<{
	onChange: (wallet: ViewingWallet | SigningWallet | undefined) => void,
}>) {
	const [ wallet, setWallet ] = preactHooks.useState<undefined | Wallet>(undefined)
	preactHooks.useEffect(() => model.onChange(wallet), [wallet])
	if (wallet !== undefined) {
		return <div>
			<label>User Address: </label>
			<span>{addressString(wallet.address)} </span>
			<button onClick={() => setWallet(undefined)}>↻</button>
		</div>
	}
	return <div>
		<ConnectToInjected onChange={setWallet}/> or <AddressPrompt label='enter address' onChange={address => setWallet(address === undefined ? undefined : createViewingWallet(address))} />
	</div>
}
