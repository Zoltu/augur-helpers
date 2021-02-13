import * as preactHooks from 'preact/hooks'
import { Claim } from './Claim'
import { Wallet, WalletSelector } from './WalletSelector'

export interface AppModel {
}

export function App(_: Readonly<AppModel>) {
	const [ wallet, setWallet ] = preactHooks.useState<undefined | Wallet>(undefined)
	return <main>
		<WalletSelector onChange={setWallet} />
		{wallet !== undefined &&
			<Claim
				claimWinnings={wallet.type === 'viewing' ? undefined : wallet.claimWinnings.bind(undefined, wallet.address)}
				getMarketDetails={wallet.getMarketDetails}
				getShareBalance={wallet.getShareBalance.bind(undefined, wallet.address)}
			/>
		}
	</main>
}
