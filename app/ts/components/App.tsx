import * as preactHooks from 'preact/hooks'
import { Account } from './Claim'
import { TransferUni } from './TransferUni'
import { Wallet, WalletSelector } from './WalletSelector'

export interface AppModel {
}

function Tabs(model: Readonly<{
	wallet: Wallet,
	selectedTab: 'claim' | 'uni',
}>) {
	switch (model.selectedTab) {
		case 'claim':
			return <Account
				claimWinnings={model.wallet.type === 'viewing' ? undefined : model.wallet.claimWinnings.bind(undefined, model.wallet.address)}
				getMarketDetails={model.wallet.getMarketDetails}
				getShareBalance={model.wallet.getShareBalance.bind(undefined, model.wallet.address)}
			/>
		case 'uni':
			return <TransferUni
				getBalance={model.wallet.getTokenBalance.bind(undefined, 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984n, model.wallet.address)}
				withdrawUni={model.wallet.type === 'signing' ? model.wallet.withdrawToken.bind(undefined, 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984n) : () => {}}
			/>
	}
}

export function App(_: Readonly<AppModel>) {
	const [ wallet, setWallet ] = preactHooks.useState<undefined | Wallet>(undefined)
	const [ selectedTab, setSelectedTab ] = preactHooks.useState<undefined | 'claim' | 'uni'>(undefined)
	return <main>
		<WalletSelector onChange={setWallet} />
		{ wallet !== undefined &&
			<div>
				<button onClick={() => setSelectedTab('claim')}>Claim Winnings</button>
				<button onClick={() => setSelectedTab('uni')}>Transfer UNI</button>
			</div>
		}
		{wallet !== undefined && selectedTab !== undefined && <Tabs wallet={wallet} selectedTab={selectedTab} />}
	</main>
}
