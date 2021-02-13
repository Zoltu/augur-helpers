// THIS FILE IS AUTOMATICALLY GENERATED BY `generateContractInterfaces.ts`. DO NOT EDIT BY HAND'

import { EventDescription, DecodedEvent, ParameterDescription, EncodableArray, EncodableTuple, decodeParameters, decodeEvent, decodeMethod } from '@zoltu/ethereum-abi-encoder'
export { EncodableArray, EncodableTuple }

export interface Log {
	readonly topics: ReadonlyArray<bigint>
	readonly data: Uint8Array
}
export interface TransactionReceipt {
	readonly status: boolean
	readonly logs: Iterable<Log>
}

export const eventDescriptions: { [signatureHash: string]: EventDescription & {signature: string} } = {
	'17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31': {"type":"event","name":"ApprovalForAll","signature":"ApprovalForAll(address,address,bool)","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"operator","indexed":true},{"type":"bool","name":"approved","indexed":false}]},
	'4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb': {"type":"event","name":"TransferBatch","signature":"TransferBatch(address,address,address,uint256[],uint256[])","inputs":[{"type":"address","name":"operator","indexed":true},{"type":"address","name":"from","indexed":true},{"type":"address","name":"to","indexed":true},{"type":"uint256[]","name":"ids","indexed":false},{"type":"uint256[]","name":"values","indexed":false}]},
	'c3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62': {"type":"event","name":"TransferSingle","signature":"TransferSingle(address,address,address,uint256,uint256)","inputs":[{"type":"address","name":"operator","indexed":true},{"type":"address","name":"from","indexed":true},{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"id","indexed":false},{"type":"uint256","name":"value","indexed":false}]},
	'6bb7ff708619ba0610cba295a58592e0451dee2622938c8755667688daf3529b': {"type":"event","name":"URI","signature":"URI(string,uint256)","inputs":[{"type":"string","name":"value","indexed":false},{"type":"uint256","name":"id","indexed":true}]}
}

export namespace ShareToken {
	export interface ApprovalForAll extends DecodedEvent {
		name: 'ApprovalForAll'
		parameters: {
			owner: bigint
			operator: bigint
			approved: boolean
		}
	}
}

export namespace ShareToken {
	export interface TransferBatch extends DecodedEvent {
		name: 'TransferBatch'
		parameters: {
			operator: bigint
			from: bigint
			to: bigint
			ids: Array<bigint>
			values: Array<bigint>
		}
	}
}

export namespace ShareToken {
	export interface TransferSingle extends DecodedEvent {
		name: 'TransferSingle'
		parameters: {
			operator: bigint
			from: bigint
			to: bigint
			id: bigint
			value: bigint
		}
	}
}

export namespace ShareToken {
	export interface URI extends DecodedEvent {
		name: 'URI'
		parameters: {
			value: string
			id: bigint
		}
	}
}

export type Event = DecodedEvent | ShareToken.ApprovalForAll | ShareToken.TransferBatch | ShareToken.TransferSingle | ShareToken.URI


export interface Dependencies {
	call(address: bigint, methodSignature: string, methodParameters: EncodableArray, value: bigint): Promise<Uint8Array>
	submitTransaction(address: bigint, methodSignature: string, methodParameters: EncodableArray, value: bigint): Promise<TransactionReceipt>
}


/**
 * By convention, pure/view methods have a `_` suffix on them indicating to the caller that the function will be executed locally and return the function's result.  payable/nonpayable functions have both a local version and a remote version (distinguished by the trailing `_`).  If the remote method is called, you will only get back a transaction hash which can be used to lookup the transaction receipt for success/failure (due to EVM limitations you will not get the function results back).
 */
export class Contract {
	protected constructor(protected readonly dependencies: Dependencies, public readonly address: bigint) { }

	protected async localCall(methodSignature: string, outputParameterDescriptions: ReadonlyArray<ParameterDescription>, methodParameters: EncodableArray, attachedEth?: bigint): Promise<EncodableTuple> {
		const result = await this.dependencies.call(this.address, methodSignature, methodParameters, attachedEth || 0n)
		if (result.length >= 4 && result[0] === 8 && result[1] === 195 && result[2] === 121 && result[3] === 160) {
			const decodedError = decodeMethod(0x08c379a0, [ { name: 'message', type: 'string' } ], result) as { message: string }
			throw new Error(`Contract Error: ${decodedError.message}`)
		}
		return decodeParameters(outputParameterDescriptions, result)
	}

	protected async remoteCall(methodSignature: string, parameters: EncodableArray, errorContext: { transactionName: string }, attachedEth?: bigint): Promise<Array<Event>> {
		const transactionReceipt = await this.dependencies.submitTransaction(this.address, methodSignature, parameters, attachedEth || 0n)
		if (!transactionReceipt.status) throw new Error(`Remote call of ${errorContext.transactionName} failed: ${JSON.stringify(transactionReceipt)}`)
		return this.decodeEvents(transactionReceipt.logs)
	}

	private decodeEvents(encodedEvents: Iterable<Log>): Array<Event> {
		const decodedEvents: Array<DecodedEvent> = []
		for (const encodedEvent of encodedEvents) {
			const decodedEvent = this.tryDecodeEvent(encodedEvent)
			if (decodedEvent) decodedEvents.push(decodedEvent)
		}
		return decodedEvents as Array<Event>
	}

	private tryDecodeEvent(encodedEvent: Log): DecodedEvent | null {
		const signatureHash = encodedEvent.topics[0]
		const eventDescription = eventDescriptions[signatureHash.toString(16)]
		if (!eventDescription) return null
		return decodeEvent(eventDescription, encodedEvent.topics, encodedEvent.data)
	}
}


export class ShareToken extends Contract {
	public constructor(dependencies: Dependencies, address: bigint) {
		super(dependencies, address)
	}

	public _balances_ = async (arg0: bigint, arg1: bigint): Promise<bigint> => {
		const methodSignature = '_balances(uint256 , address )' as const
		const methodParameters = [arg0, arg1] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public _operatorApprovals_ = async (arg0: bigint, arg1: bigint): Promise<boolean> => {
		const methodSignature = '_operatorApprovals(address , address )' as const
		const methodParameters = [arg0, arg1] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public _supplys_ = async (arg0: bigint): Promise<bigint> => {
		const methodSignature = '_supplys(uint256 )' as const
		const methodParameters = [arg0] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public assertBalances_ = async (market: bigint): Promise<void> => {
		const methodSignature = 'assertBalances(address _market)' as const
		const methodParameters = [market] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public augur_ = async (): Promise<bigint> => {
		const methodSignature = 'augur()' as const
		const methodParameters = [] as const
		const outputParameterDescriptions = [{"internalType":"contract IAugur","name":"","type":"address"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public balanceOf_ = async (account: bigint, id: bigint): Promise<bigint> => {
		const methodSignature = 'balanceOf(address account, uint256 id)' as const
		const methodParameters = [account, id] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public balanceOfBatch_ = async (accounts: ReadonlyArray<bigint>, ids: ReadonlyArray<bigint>): Promise<Array<bigint>> => {
		const methodSignature = 'balanceOfBatch(address[] accounts, uint256[] ids)' as const
		const methodParameters = [accounts, ids] as const
		const outputParameterDescriptions = [{"internalType":"uint256[]","name":"","type":"uint256[]"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <Array<bigint>>result.result
	}

	public balanceOfMarketOutcome_ = async (market: bigint, outcome: bigint, account: bigint): Promise<bigint> => {
		const methodSignature = 'balanceOfMarketOutcome(address _market, uint256 _outcome, address _account)' as const
		const methodParameters = [market, outcome, account] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public buyCompleteSets = async (market: bigint, account: bigint, amount: bigint): Promise<Array<Event>> => {
		const methodSignature = 'buyCompleteSets(address _market, address _account, uint256 _amount)' as const
		const methodParameters = [market, account, amount] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'buyCompleteSets' })
	}

	public buyCompleteSets_ = async (market: bigint, account: bigint, amount: bigint): Promise<boolean> => {
		const methodSignature = 'buyCompleteSets(address _market, address _account, uint256 _amount)' as const
		const methodParameters = [market, account, amount] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public buyCompleteSetsForTrade = async (market: bigint, amount: bigint, longOutcome: bigint, longRecipient: bigint, shortRecipient: bigint): Promise<Array<Event>> => {
		const methodSignature = 'buyCompleteSetsForTrade(address _market, uint256 _amount, uint256 _longOutcome, address _longRecipient, address _shortRecipient)' as const
		const methodParameters = [market, amount, longOutcome, longRecipient, shortRecipient] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'buyCompleteSetsForTrade' })
	}

	public buyCompleteSetsForTrade_ = async (market: bigint, amount: bigint, longOutcome: bigint, longRecipient: bigint, shortRecipient: bigint): Promise<boolean> => {
		const methodSignature = 'buyCompleteSetsForTrade(address _market, uint256 _amount, uint256 _longOutcome, address _longRecipient, address _shortRecipient)' as const
		const methodParameters = [market, amount, longOutcome, longRecipient, shortRecipient] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public calculateCreatorFee_ = async (market: bigint, amount: bigint): Promise<bigint> => {
		const methodSignature = 'calculateCreatorFee(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public calculateProceeds_ = async (market: bigint, outcome: bigint, numberOfShares: bigint): Promise<bigint> => {
		const methodSignature = 'calculateProceeds(address _market, uint256 _outcome, uint256 _numberOfShares)' as const
		const methodParameters = [market, outcome, numberOfShares] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public calculateReportingFee = async (market: bigint, amount: bigint): Promise<Array<Event>> => {
		const methodSignature = 'calculateReportingFee(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'calculateReportingFee' })
	}

	public calculateReportingFee_ = async (market: bigint, amount: bigint): Promise<bigint> => {
		const methodSignature = 'calculateReportingFee(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public cash_ = async (): Promise<bigint> => {
		const methodSignature = 'cash()' as const
		const methodParameters = [] as const
		const outputParameterDescriptions = [{"internalType":"contract ICash","name":"","type":"address"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public claimTradingProceeds = async (market: bigint, shareHolder: bigint, fingerprint: bigint): Promise<Array<Event>> => {
		const methodSignature = 'claimTradingProceeds(address _market, address _shareHolder, bytes32 _fingerprint)' as const
		const methodParameters = [market, shareHolder, fingerprint] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'claimTradingProceeds' })
	}

	public claimTradingProceeds_ = async (market: bigint, shareHolder: bigint, fingerprint: bigint): Promise<Array<bigint>> => {
		const methodSignature = 'claimTradingProceeds(address _market, address _shareHolder, bytes32 _fingerprint)' as const
		const methodParameters = [market, shareHolder, fingerprint] as const
		const outputParameterDescriptions = [{"internalType":"uint256[]","name":"_outcomeFees","type":"uint256[]"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <Array<bigint>>result._outcomeFees
	}

	public divideUpWinnings = async (market: bigint, outcome: bigint, numberOfShares: bigint): Promise<Array<Event>> => {
		const methodSignature = 'divideUpWinnings(address _market, uint256 _outcome, uint256 _numberOfShares)' as const
		const methodParameters = [market, outcome, numberOfShares] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'divideUpWinnings' })
	}

	public divideUpWinnings_ = async (market: bigint, outcome: bigint, numberOfShares: bigint): Promise<{_proceeds: bigint, _shareHolderShare: bigint, _creatorShare: bigint, _reporterShare: bigint}> => {
		const methodSignature = 'divideUpWinnings(address _market, uint256 _outcome, uint256 _numberOfShares)' as const
		const methodParameters = [market, outcome, numberOfShares] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"_proceeds","type":"uint256"},{"internalType":"uint256","name":"_shareHolderShare","type":"uint256"},{"internalType":"uint256","name":"_creatorShare","type":"uint256"},{"internalType":"uint256","name":"_reporterShare","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <{_proceeds: bigint, _shareHolderShare: bigint, _creatorShare: bigint, _reporterShare: bigint}>result
	}

	public getInitialized_ = async (): Promise<boolean> => {
		const methodSignature = 'getInitialized()' as const
		const methodParameters = [] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public getMarket_ = async (tokenId: bigint): Promise<bigint> => {
		const methodSignature = 'getMarket(uint256 _tokenId)' as const
		const methodParameters = [tokenId] as const
		const outputParameterDescriptions = [{"internalType":"contract IMarket","name":"","type":"address"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public getOutcome_ = async (tokenId: bigint): Promise<bigint> => {
		const methodSignature = 'getOutcome(uint256 _tokenId)' as const
		const methodParameters = [tokenId] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public getTokenId_ = async (market: bigint, outcome: bigint): Promise<bigint> => {
		const methodSignature = 'getTokenId(address _market, uint256 _outcome)' as const
		const methodParameters = [market, outcome] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"_tokenId","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result._tokenId
	}

	public getTokenIds_ = async (market: bigint, outcomes: ReadonlyArray<bigint>): Promise<Array<bigint>> => {
		const methodSignature = 'getTokenIds(address _market, uint256[] _outcomes)' as const
		const methodParameters = [market, outcomes] as const
		const outputParameterDescriptions = [{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <Array<bigint>>result._tokenIds
	}

	public getTypeName_ = async (): Promise<bigint> => {
		const methodSignature = 'getTypeName()' as const
		const methodParameters = [] as const
		const outputParameterDescriptions = [{"internalType":"bytes32","name":"","type":"bytes32"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public initialize = async (augur: bigint): Promise<Array<Event>> => {
		const methodSignature = 'initialize(address _augur)' as const
		const methodParameters = [augur] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'initialize' })
	}

	public initialize_ = async (augur: bigint): Promise<void> => {
		const methodSignature = 'initialize(address _augur)' as const
		const methodParameters = [augur] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public initializeMarket = async (market: bigint, numOutcomes: bigint, numTicks: bigint): Promise<Array<Event>> => {
		const methodSignature = 'initializeMarket(address _market, uint256 _numOutcomes, uint256 _numTicks)' as const
		const methodParameters = [market, numOutcomes, numTicks] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'initializeMarket' })
	}

	public initializeMarket_ = async (market: bigint, numOutcomes: bigint, numTicks: bigint): Promise<void> => {
		const methodSignature = 'initializeMarket(address _market, uint256 _numOutcomes, uint256 _numTicks)' as const
		const methodParameters = [market, numOutcomes, numTicks] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public isApprovedForAll_ = async (account: bigint, operator: bigint): Promise<boolean> => {
		const methodSignature = 'isApprovedForAll(address account, address operator)' as const
		const methodParameters = [account, operator] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public lowestBalanceOfMarketOutcomes_ = async (market: bigint, outcomes: ReadonlyArray<bigint>, account: bigint): Promise<bigint> => {
		const methodSignature = 'lowestBalanceOfMarketOutcomes(address _market, uint256[] _outcomes, address _account)' as const
		const methodParameters = [market, outcomes, account] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public name_ = async (): Promise<string> => {
		const methodSignature = 'name()' as const
		const methodParameters = [] as const
		const outputParameterDescriptions = [{"internalType":"string","name":"","type":"string"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <string>result.result
	}

	public publicBuyCompleteSets = async (market: bigint, amount: bigint): Promise<Array<Event>> => {
		const methodSignature = 'publicBuyCompleteSets(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'publicBuyCompleteSets' })
	}

	public publicBuyCompleteSets_ = async (market: bigint, amount: bigint): Promise<boolean> => {
		const methodSignature = 'publicBuyCompleteSets(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public publicSellCompleteSets = async (market: bigint, amount: bigint): Promise<Array<Event>> => {
		const methodSignature = 'publicSellCompleteSets(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'publicSellCompleteSets' })
	}

	public publicSellCompleteSets_ = async (market: bigint, amount: bigint): Promise<{_creatorFee: bigint, _reportingFee: bigint}> => {
		const methodSignature = 'publicSellCompleteSets(address _market, uint256 _amount)' as const
		const methodParameters = [market, amount] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"_creatorFee","type":"uint256"},{"internalType":"uint256","name":"_reportingFee","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <{_creatorFee: bigint, _reportingFee: bigint}>result
	}

	public safeBatchTransferFrom = async (from: bigint, to: bigint, ids: ReadonlyArray<bigint>, values: ReadonlyArray<bigint>, data: Uint8Array): Promise<Array<Event>> => {
		const methodSignature = 'safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] values, bytes data)' as const
		const methodParameters = [from, to, ids, values, data] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'safeBatchTransferFrom' })
	}

	public safeBatchTransferFrom_ = async (from: bigint, to: bigint, ids: ReadonlyArray<bigint>, values: ReadonlyArray<bigint>, data: Uint8Array): Promise<void> => {
		const methodSignature = 'safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] values, bytes data)' as const
		const methodParameters = [from, to, ids, values, data] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public safeTransferFrom = async (from: bigint, to: bigint, id: bigint, value: bigint, data: Uint8Array): Promise<Array<Event>> => {
		const methodSignature = 'safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data)' as const
		const methodParameters = [from, to, id, value, data] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'safeTransferFrom' })
	}

	public safeTransferFrom_ = async (from: bigint, to: bigint, id: bigint, value: bigint, data: Uint8Array): Promise<void> => {
		const methodSignature = 'safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data)' as const
		const methodParameters = [from, to, id, value, data] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public sellCompleteSets = async (market: bigint, holder: bigint, recipient: bigint, amount: bigint, fingerprint: bigint): Promise<Array<Event>> => {
		const methodSignature = 'sellCompleteSets(address _market, address _holder, address _recipient, uint256 _amount, bytes32 _fingerprint)' as const
		const methodParameters = [market, holder, recipient, amount, fingerprint] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'sellCompleteSets' })
	}

	public sellCompleteSets_ = async (market: bigint, holder: bigint, recipient: bigint, amount: bigint, fingerprint: bigint): Promise<{_creatorFee: bigint, _reportingFee: bigint}> => {
		const methodSignature = 'sellCompleteSets(address _market, address _holder, address _recipient, uint256 _amount, bytes32 _fingerprint)' as const
		const methodParameters = [market, holder, recipient, amount, fingerprint] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"_creatorFee","type":"uint256"},{"internalType":"uint256","name":"_reportingFee","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <{_creatorFee: bigint, _reportingFee: bigint}>result
	}

	public sellCompleteSetsForTrade = async (market: bigint, outcome: bigint, amount: bigint, shortParticipant: bigint, longParticipant: bigint, shortRecipient: bigint, longRecipient: bigint, price: bigint, sourceAccount: bigint, fingerprint: bigint): Promise<Array<Event>> => {
		const methodSignature = 'sellCompleteSetsForTrade(address _market, uint256 _outcome, uint256 _amount, address _shortParticipant, address _longParticipant, address _shortRecipient, address _longRecipient, uint256 _price, address _sourceAccount, bytes32 _fingerprint)' as const
		const methodParameters = [market, outcome, amount, shortParticipant, longParticipant, shortRecipient, longRecipient, price, sourceAccount, fingerprint] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'sellCompleteSetsForTrade' })
	}

	public sellCompleteSetsForTrade_ = async (market: bigint, outcome: bigint, amount: bigint, shortParticipant: bigint, longParticipant: bigint, shortRecipient: bigint, longRecipient: bigint, price: bigint, sourceAccount: bigint, fingerprint: bigint): Promise<{_creatorFee: bigint, _reportingFee: bigint}> => {
		const methodSignature = 'sellCompleteSetsForTrade(address _market, uint256 _outcome, uint256 _amount, address _shortParticipant, address _longParticipant, address _shortRecipient, address _longRecipient, uint256 _price, address _sourceAccount, bytes32 _fingerprint)' as const
		const methodParameters = [market, outcome, amount, shortParticipant, longParticipant, shortRecipient, longRecipient, price, sourceAccount, fingerprint] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"_creatorFee","type":"uint256"},{"internalType":"uint256","name":"_reportingFee","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <{_creatorFee: bigint, _reportingFee: bigint}>result
	}

	public setApprovalForAll = async (operator: bigint, approved: boolean): Promise<Array<Event>> => {
		const methodSignature = 'setApprovalForAll(address operator, bool approved)' as const
		const methodParameters = [operator, approved] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'setApprovalForAll' })
	}

	public setApprovalForAll_ = async (operator: bigint, approved: boolean): Promise<void> => {
		const methodSignature = 'setApprovalForAll(address operator, bool approved)' as const
		const methodParameters = [operator, approved] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public supportsInterface_ = async (interfaceId: bigint): Promise<boolean> => {
		const methodSignature = 'supportsInterface(bytes4 interfaceId)' as const
		const methodParameters = [interfaceId] as const
		const outputParameterDescriptions = [{"internalType":"bool","name":"","type":"bool"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <boolean>result.result
	}

	public symbol_ = async (): Promise<string> => {
		const methodSignature = 'symbol()' as const
		const methodParameters = [] as const
		const outputParameterDescriptions = [{"internalType":"string","name":"","type":"string"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <string>result.result
	}

	public totalSupply_ = async (id: bigint): Promise<bigint> => {
		const methodSignature = 'totalSupply(uint256 id)' as const
		const methodParameters = [id] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public totalSupplyForMarketOutcome_ = async (market: bigint, outcome: bigint): Promise<bigint> => {
		const methodSignature = 'totalSupplyForMarketOutcome(address _market, uint256 _outcome)' as const
		const methodParameters = [market, outcome] as const
		const outputParameterDescriptions = [{"internalType":"uint256","name":"","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <bigint>result.result
	}

	public unpackTokenId_ = async (tokenId: bigint): Promise<{_market: bigint, _outcome: bigint}> => {
		const methodSignature = 'unpackTokenId(uint256 _tokenId)' as const
		const methodParameters = [tokenId] as const
		const outputParameterDescriptions = [{"internalType":"address","name":"_market","type":"address"},{"internalType":"uint256","name":"_outcome","type":"uint256"}] as const
		const result = await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
		return <{_market: bigint, _outcome: bigint}>result
	}

	public unsafeBatchTransferFrom = async (from: bigint, to: bigint, ids: ReadonlyArray<bigint>, values: ReadonlyArray<bigint>): Promise<Array<Event>> => {
		const methodSignature = 'unsafeBatchTransferFrom(address _from, address _to, uint256[] _ids, uint256[] _values)' as const
		const methodParameters = [from, to, ids, values] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'unsafeBatchTransferFrom' })
	}

	public unsafeBatchTransferFrom_ = async (from: bigint, to: bigint, ids: ReadonlyArray<bigint>, values: ReadonlyArray<bigint>): Promise<void> => {
		const methodSignature = 'unsafeBatchTransferFrom(address _from, address _to, uint256[] _ids, uint256[] _values)' as const
		const methodParameters = [from, to, ids, values] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}

	public unsafeTransferFrom = async (from: bigint, to: bigint, id: bigint, value: bigint): Promise<Array<Event>> => {
		const methodSignature = 'unsafeTransferFrom(address _from, address _to, uint256 _id, uint256 _value)' as const
		const methodParameters = [from, to, id, value] as const
		return await this.remoteCall(methodSignature, methodParameters, { transactionName: 'unsafeTransferFrom' })
	}

	public unsafeTransferFrom_ = async (from: bigint, to: bigint, id: bigint, value: bigint): Promise<void> => {
		const methodSignature = 'unsafeTransferFrom(address _from, address _to, uint256 _id, uint256 _value)' as const
		const methodParameters = [from, to, id, value] as const
		const outputParameterDescriptions = [] as const
		await this.localCall(methodSignature, outputParameterDescriptions, methodParameters)
	}
}