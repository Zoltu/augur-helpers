import * as preactHooks from 'preact/hooks'
import { encodeMethod } from '@zoltu/ethereum-abi-encoder'
import { keccak256 } from '@zoltu/ethereum-crypto'
import { BrowserDependencies } from '@zoltu/solidity-typescript-generator-browser-dependencies'
import { Dependencies, FetchDependencies, FetchJsonRpc } from '@zoltu/solidity-typescript-generator-fetch-dependencies'
import { Market } from '../library/market';
import { ShareToken } from '../library/share-token';
import { AugurWalletRegistryV2 } from '../library/augur-wallet-registry-v2'
import { AddressPrompt } from './AddressPrompt';
import { addressString } from '../library/big-number-utilities';
import { AugurWallet } from '../library/augur-wallet'
import { useAsyncState } from '../library/preact-utilities'
import { Erc20 } from '../library/erc20'

export interface BaseWallet {
	dependencies: Dependencies
	address: bigint
	getMarketDetails: (market: bigint) => Promise<{ address: bigint, numOutcomes: number, numTicks: bigint }>
	getShareBalance: (user: bigint, market: bigint, outcome: number) => Promise<bigint>
	getTokenBalance: (token: bigint, user: bigint) => Promise<bigint>
}

export interface ViewingWallet extends BaseWallet {
	type: 'viewing'
}

export interface SigningWallet extends BaseWallet {
	type: 'signing'
	claimWinnings: (user: bigint, market: bigint) => Promise<void>
	withdrawToken: (token: bigint, amount: bigint) => Promise<void>
}

export type Wallet = SigningWallet | ViewingWallet

function createWalletFromDependencies(dependencies: Dependencies, address: bigint, canSign: boolean = true) {
	const shareToken = new ShareToken(dependencies, 0x9e4799ff2023819b1272eee430eadf510eDF85f0n)

	const wallet: Wallet = {
		dependencies,
		address,
		getMarketDetails: async marketAddress => {
			const market = new Market(dependencies, marketAddress)
			return {
				address: marketAddress,
				numOutcomes: Number(await market.getNumberOfOutcomes_()),
				numTicks: await market.getNumTicks_(),
			}
		},
		getShareBalance: async (user, market, outcome) => await shareToken.balanceOfMarketOutcome_(market, BigInt(outcome), user),
		getTokenBalance: async (tokenAddress, user) => {
			const token = new Erc20(dependencies, tokenAddress)
			return await token.balanceOf_(user)
		},
		...(canSign ? {
			type: 'signing',
			claimWinnings: async (user, market) => { await shareToken.claimTradingProceeds(market, user, 0n) },
			withdrawToken: async () => { throw new Error(`This is a regular wallet, not a contract wallet, so your tokens are already yours.`) }
		} : {
			type: 'viewing',
		})
	}

	return wallet
}

async function createInjectedWallet() {
	const browserDependencies = new BrowserDependencies(undefined, {})

	const accounts = await browserDependencies.request('eth_requestAccounts', []) as string[]
	if (accounts.length === 0) throw new Error(`No accounts returned by wallet provider.  Did you deny the account request prompt?`)
	if (!/(0x)?[a-zA-Z0-9]{40}/.test(accounts[0])) throw new Error(`Wallet provider returned an address that doesn't look like an address: ${accounts[0]}`)
	const address = BigInt(accounts[0])

	return createWalletFromDependencies(browserDependencies, address, true) as SigningWallet
}

function createViewingWallet(address: bigint) {
	const jsonRpcAddress = 'https://ethereum.zoltu.io'
	const rpc = new FetchJsonRpc(jsonRpcAddress, window.fetch.bind(window), { addressProvider: async () => address })
	const fetchDependencies = new FetchDependencies(rpc)
	return createWalletFromDependencies(fetchDependencies, address, false)
}

async function createContractWallet(underlying: Wallet) {
	const augurWalletRegistry = new AugurWalletRegistryV2(underlying.dependencies, 0x1dD864Ed6F291b31C86aAF228DB387cd60a20e18n)
	const walletAddress = await augurWalletRegistry.getWallet_(underlying.address)
	if (walletAddress === 0n) throw new Error(`${addressString(underlying.address)} does not have an Augur v2 contract wallet.`)
	const augurWallet = new AugurWallet(underlying.dependencies, walletAddress)
	if (underlying.type === 'signing' && !await augurWallet.authorizedProxies_(underlying.address)) {
		// TODO: let the user know what we are prompting for
		await augurWallet.addAuthorizedProxy(underlying.address)
	}

	const dependencies: Dependencies = {
		call: async (address, methodSignature, methodParameters, value) => {
			// FIXME: the Augur wallet contract doesn't support propogating return data, so we can't call through it and our library
			// FIXME: ideally, we would execute the call via underlying dependencies but with the wallet address as the `from`, but library doesn't support that right now
			return await underlying.dependencies.call(address, methodSignature, methodParameters, value)
			// const calldata = await encodeMethod(keccak256.hash, methodSignature, methodParameters)
			// return await underlying.dependencies.call(walletAddress, 'executeTransaction(address _to, bytes _data, uint256 _value)', [address, calldata, value], 0n)
		},
		submitTransaction: async (address, methodSignature, methodParameters, value) => {
			const calldata = await encodeMethod(keccak256.hash, methodSignature, methodParameters)
			return await underlying.dependencies.submitTransaction(walletAddress, 'executeTransaction(address _to, bytes _data, uint256 _value)', [address, calldata, value], 0n)
		},
	}

	const wallet = createWalletFromDependencies(dependencies, walletAddress, underlying.type === 'signing')
	if (wallet.type === 'signing') {
		wallet.withdrawToken = async (tokenAddress, amount) => {
			const token = new Erc20(dependencies, tokenAddress)
			await token.transfer(underlying.address, amount)
		}
	}
	return wallet
}

function ConnectToInjected(model: Readonly<{
	onChange: (wallet: Promise<SigningWallet>) => void,
}>) {
	return <>
		<button onClick={() => model.onChange(createInjectedWallet())}>Connect to Injected Wallet</button>
	</>
}

export function WalletSelector(model: Readonly<{
	onChange: (wallet: Wallet | undefined) => void,
}>) {
	const [ walletAsync, setWalletAsync, resetWalletAsync ] = useAsyncState<Wallet>()
	preactHooks.useEffect(() => {
		if (walletAsync.state === 'inactive') model.onChange(undefined)
		if (walletAsync.state === 'resolved') model.onChange(walletAsync.value)
	}, [walletAsync])
	switch (walletAsync.state) {
		case 'inactive':
		case 'rejected':
			return <div>
				<ConnectToInjected onChange={walletPromise => setWalletAsync(async () => walletPromise)}/> or <AddressPrompt label='enter address' onChange={address => address === undefined ? resetWalletAsync() : setWalletAsync(async () => createViewingWallet(address))} />
				{walletAsync?.state === 'rejected' && <div style={{ width: '100%', color: 'red', fontSize: '80%' }}>{walletAsync.error.message}</div>}
			</div>
		case 'pending':
			return <div><svg style={{ height: '1em' }} class='spinner' viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45"/></svg></div>
		case 'resolved':
			const wallet = walletAsync.value
			return <div>
				<label>User Address: </label>
				<span>{addressString(walletAsync.value.address)} </span>
				<button onClick={() => resetWalletAsync()}>↻</button>
				<span>Click <button onClick={() => setWalletAsync(async () => createContractWallet(wallet))}>here</button> if you have pre-redo wallet.  If you don't know what this is, please ignore.</span>
			</div>
	}
}
