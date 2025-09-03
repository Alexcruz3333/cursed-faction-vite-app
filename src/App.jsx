import React, { useEffect, useState } from 'react'
import './App.css'
import { ethers } from 'ethers'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

const BASE_CHAIN_HEX = '0x2105' // 8453
const BASE_RPC = 'https://mainnet.base.org'
const DAPP_URL = 'https://alexcruz3333.github.io/cursed-faction-vite-app/'
const COINBASE_DAPP_LINK = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(DAPP_URL)}`
const LS_ACCOUNT = 'cf_account'
const LS_PROVIDER = 'cf_provider' // 'coinbase' | 'injected'

function coinbaseConnect(setAccount, setChainId, setMessage) {
  try {
    const sdk = new CoinbaseWalletSDK({ appName: 'Cursed Faction' })
    const provider = sdk.makeWeb3Provider(BASE_RPC, 8453)
    provider
      .request({ method: 'eth_requestAccounts' })
      .then((accs) => {
        const addr = accs?.[0] ?? ''
        setAccount(addr)
        localStorage.setItem(LS_ACCOUNT, addr)
        localStorage.setItem(LS_PROVIDER, 'coinbase')
        return provider.request({ method: 'eth_chainId' })
      })
      .then((cid) => {
        setChainId(cid)
        setMessage('Connected with Coinbase Wallet')
      })
      .catch((err) => setMessage(err?.message || 'Coinbase connect failed'))
  } catch (e) {
    setMessage(e?.message || 'Coinbase connect failed')
  }
}

function formatEthFromHex(weiHex) {
  try {
    if (!weiHex) return '0'
    const wei = BigInt(weiHex)
    const base = 10n ** 18n
    const whole = wei / base
    const frac = wei % base
    let fracStr = frac.toString().padStart(18, '0')
    fracStr = fracStr.replace(/0+$/, '')
    return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString()
  } catch { return '0' }
}

export default function App() {
  const [account, setAccount] = useState(localStorage.getItem(LS_ACCOUNT) || '')
  const [chainId, setChainId] = useState('')
  const [message, setMessage] = useState('')
  const [baseEth, setBaseEth] = useState('')
  const [noWallet, setNoWallet] = useState(false)

  const onBase = chainId?.toLowerCase() === BASE_CHAIN_HEX

  // Auto init provider state
  useEffect(() => {
    const eth = window.ethereum
    if (!eth) { setNoWallet(true); return }

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

  // Auto-reconnect saved session
  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem(LS_PROVIDER)
      if (!saved) return
      try {
        if (saved === 'coinbase') {
          coinbaseConnect(setAccount, setChainId, setMessage)
        } else if (saved === 'injected' && window.ethereum) {
          const accs = await window.ethereum.request({ method: 'eth_accounts' })
          const addr = accs?.[0]
          if (addr) {
            setAccount(addr)
            localStorage.setItem(LS_ACCOUNT, addr)
            setChainId(await window.ethereum.request({ method: 'eth_chainId' }))
            setMessage('Reconnected')
          }
        }
      } catch {}
    })()
  }, [])

  // Fetch Base balance on account/chain changes
  useEffect(() => {
    async function fetchBalance() {
      try {
        if (!account) return
        if (onBase && window.ethereum) {
          const wei = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] })
          setBaseEth(formatEthFromHex(wei))
        } else {
          const body = { jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [account, 'latest'] }
          const res = await fetch(BASE_RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
          const json = await res.json()
          setBaseEth(formatEthFromHex(json?.result))
        }
      } catch { setBaseEth('') }
    }
    fetchBalance()
  }, [account, onBase])

  const connect = async () => {
    try {
      if (!window.ethereum) {
        setNoWallet(true)
        setMessage('No EVM wallet detected. Install Coinbase Wallet or MetaMask, or use the Coinbase deep link below.')
        return
      }
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accs?.[0] ?? ''
      setAccount(addr)
      localStorage.setItem(LS_ACCOUNT, addr)
      localStorage.setItem(LS_PROVIDER, 'injected')
      const cid = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(cid)
      setMessage('Connected')
    } catch (err) {
      setMessage(err?.message || 'Connect failed')
    }
  }

  const disconnect = () => {
    try {
      localStorage.removeItem(LS_ACCOUNT)
      localStorage.removeItem(LS_PROVIDER)
      setAccount('')
      setChainId('')
      setBaseEth('')
      setMessage('Disconnected')
    } catch {}
  }

  const handleCoinbase = () => coinbaseConnect(setAccount, setChainId, setMessage)
  const openCoinbaseDeepLink = () => window.open(COINBASE_DAPP_LINK, '_blank')

  const switchToBase = async () => {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_HEX }] })
      setMessage('Switched to Base')
    } catch (err) {
      if (err?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BASE_CHAIN_HEX,
              chainName: 'Base Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: [BASE_RPC],
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

  return (
    <main style={{maxWidth: 880, margin: '40px auto', padding: '0 16px', lineHeight: 1.6}}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
        <h1 style={{margin: 0}}> The Cursed Faction In-Game Banking System </h1>
        <div style={{display: 'flex', gap: 8}}>
          {!account && <button onClick={connect}>Connect Wallet</button>}
          {!account && <button onClick={handleCoinbase}>Coinbase Wallet</button>}
          {!account && <button onClick={openCoinbaseDeepLink}>Open in Coinbase Wallet</button>}
          {account && <button onClick={switchToBase} disabled={onBase}>{onBase ? 'On Base' : 'Switch to Base'}</button>}
          {account && <button onClick={disconnect}>Disconnect</button>}
        </div>
      </header>

      {noWallet && (
        <div style={{background:'#fee', color:'#900', padding: '12px', borderRadius: 8, marginTop: 12}}>
          <strong>No wallet detected.</strong> Install a wallet or open directly in Coinbase Wallet.
          <div style={{marginTop: 8, display:'flex', gap: 8, flexWrap:'wrap'}}>
            <a href="https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad" target="_blank" rel="noreferrer">Get Coinbase Wallet Extension</a>
            <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">Get MetaMask</a>
            <a href={COINBASE_DAPP_LINK} target="_blank" rel="noreferrer">Open in Coinbase Wallet</a>
          </div>
        </div>
      )}

      {message && <p style={{color: '#0a7'}}> {message} </p>}

      {account && (
        <p>
          Address: <a target="_blank" rel="noreferrer" href={`https://basescan.org/address/${account}`}>{account}</a>
          {baseEth && <>  Base ETH: {baseEth}</>}
        </p>
      )}

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