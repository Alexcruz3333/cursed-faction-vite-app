import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

function coinbaseConnect(setAccount, setChainId, setMessage) {
  try {
    const appName = 'Cursed Faction'
    const appLogoUrl = 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4'
    const defaultChainId = 8453
    const rpcUrl = 'https://mainnet.base.org'

    const sdk = new CoinbaseWalletSDK({ appName, appLogoUrl })
    const provider = sdk.makeWeb3Provider(rpcUrl, defaultChainId)

    provider.request({ method: 'eth_requestAccounts' }).then((accs) => {
      setAccount(accs?.[0] ?? '')
      return provider.request({ method: 'eth_chainId' })
    }).then((cid) => {
      setChainId(cid)
      setMessage('Connected with Coinbase Wallet')
    }).catch((err) => setMessage(err?.message || 'Coinbase connect failed'))
  } catch (e) {
    setMessage(e?.message || 'Coinbase connect failed')
  }
}\nimport React, { useEffect, useState } from 'react'
import './App.css'

const BASE_CHAIN_HEX = '0x2105' // 8453

export default function App() {\n  // Coinbase connect helper\n  const handleCoinbase = () => coinbaseConnect(setAccount, setChainId, setMessage);
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const eth = window.ethereum
    if (!eth) return

    eth.request({ method: 'eth_chainId' }).then(setChainId).catch(() => {})

    const handleAccounts = (accs) => setAccount(accs?.[0] ?? '')
    const handleChain = (cid) => setChainId(cid)

    eth.request({ method: 'eth_accounts' }).then((accs) => handleAccounts(accs)).catch(() => {})

    eth.on?.('accountsChanged', handleAccounts)
    eth.on?.('chainChanged', handleChain)
    return () => {
      eth.removeListener?.('accountsChanged', handleAccounts)
      eth.removeListener?.('chainChanged', handleChain)
    }
  }, [])

  const connect = async () => {
    try {
      if (!window.ethereum) {
        setMessage('No EVM wallet detected. Install Coinbase Wallet or MetaMask.')
        return
      }
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accs?.[0] ?? '')
      const cid = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(cid)
      setMessage('Connected')
    } catch (err) {
      setMessage(err?.message || 'Connect failed')
    }
  }

  const switchToBase = async () => {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_HEX }] })
      setMessage('Switched to Base')
    } catch (err) {
      // 4902 = chain not added
      if (err?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_CHAIN_HEX,
              chainName: 'Base Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          })
          setMessage('Base added. Please retry switch if needed.')
        } catch (addErr) {
          setMessage(addErr?.message || 'Failed to add Base')
        }
      } else {
        setMessage(err?.message || 'Switch failed')
      }
    }
  }

  const onBase = chainId?.toLowerCase() === BASE_CHAIN_HEX

  return (
    <main style={{maxWidth: 880, margin: '40px auto', padding: '0 16px', lineHeight: 1.6}}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
        <h1 style={{margin: 0}}> The Cursed Faction In-Game Banking System </h1>
        <div style={{display: 'flex', gap: 8}}><button onClick={handleCoinbase}>Coinbase Wallet</button>
          <button onClick={connect}>{account ? account.slice(0,6)+''+account.slice(-4) : 'Connect Wallet'}</button>
          <button onClick={switchToBase} disabled={!account || onBase}>{onBase ? 'On Base' : 'Switch to Base'}</button>
        </div>
      </header>

      {message && <p style={{color: '#0a7'}}> {message} </p>}

      <p>Welcome to the next evolution of digital finance, where every NFT is more than a collectible  its a living asset in a world built on power, trust, and innovation. Inside the Cursed Faction universe, your NFTs can be bought, sold, traded, gifted, or burned  every action shaping a self-sustaining economy designed to reward its community.</p>
      <p>At its core lies an AI-operated banking system, engineered to remove human error and run with flawless precision. Protected by Legion Cyber-Circuitry, this intelligence operates with 24/7 autonomous detection and defense, ensuring every transaction is secure, transparent, and unstoppable.</p>
      <p>Every move strengthens the system:</p>
      <ul>
        <li><strong>5% Compliance Fee</strong>  automatically secured for real-world tax reporting.</li>
        <li><strong>5% Ecosystem Fee</strong>  reinvested back into the Cursed Faction economy, driving upgrades, innovation, and player rewards.</li>
        <li><strong>2% Shared Profit Pool</strong>  distributed across every NFT holder, turning the entire community into partners in growth.</li>
      </ul>
      <p>This is not just a game.</p>
      <p>This is a decentralized, AI-guarded financial universe where play becomes profit, security is absolute, and every choice carries real value.</p>
      <p><em>In Cursed Faction, you dont just play the future  you own it, you shape it, you live it.</em></p>
    </main>
  )
}


