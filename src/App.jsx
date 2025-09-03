import React, { useEffect, useState } from 'react'
import './App.css'

const BASE_CHAIN_HEX = '0x2105' // 8453
const BASE_RPC = 'https://mainnet.base.org'
const DAPP_URL = 'https://alexcruz3333.github.io/cursed-faction-vite-app/'
const COINBASE_DAPP_LINK = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(DAPP_URL)}`

// LocalStorage keys
const LS_ACCOUNT = 'cf_account'
const LS_PROVIDER = 'cf_provider' // 'coinbase' | 'injected'
const LS_TOKEN_ADDR = 'cf_token_addr'
const LS_NFT_ADDR = 'cf_nft_addr'
const LS_MINT_FN = 'cf_mint_fn'
const LS_MINT_QTY = 'cf_mint_qty'
const LS_CUSTOM_ABI = 'cf_custom_abi'

async function coinbaseConnect(setAccount, setChainId, setMessage) {
  try {
    const { default: CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')
    const sdk = new CoinbaseWalletSDK({ appName: 'Cursed Faction' })
    const provider = sdk.makeWeb3Provider(BASE_RPC, 8453)
    const accs = await provider.request({ method: 'eth_requestAccounts' })
    const addr = accs?.[0] ?? ''
    setAccount(addr)
    localStorage.setItem(LS_ACCOUNT, addr)
    localStorage.setItem(LS_PROVIDER, 'coinbase')
    const cid = await provider.request({ method: 'eth_chainId' })
    setChainId(cid)
    setMessage('Connected with Coinbase Wallet')
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

  // ERC-20 state (persisted)
  const [tokenAddr, setTokenAddr] = useState(localStorage.getItem(LS_TOKEN_ADDR) || '')
  const [tokenInfo, setTokenInfo] = useState({ symbol: '', decimals: 18, balance: '' })
  const [tokenMsg, setTokenMsg] = useState('')

  // NFT mint state (persisted)
  const [nftAddr, setNftAddr] = useState(localStorage.getItem(LS_NFT_ADDR) || '')
  const [mintFn, setMintFn] = useState(localStorage.getItem(LS_MINT_FN) || 'mint')
  const [mintQty, setMintQty] = useState(localStorage.getItem(LS_MINT_QTY) || '1')
  const [customAbi, setCustomAbi] = useState(localStorage.getItem(LS_CUSTOM_ABI) || '')
  const [mintMsg, setMintMsg] = useState('')

  const onBase = chainId?.toLowerCase() === BASE_CHAIN_HEX

  // Persist inputs reactively
  useEffect(() => { localStorage.setItem(LS_TOKEN_ADDR, tokenAddr || '') }, [tokenAddr])
  useEffect(() => { localStorage.setItem(LS_NFT_ADDR, nftAddr || '') }, [nftAddr])
  useEffect(() => { localStorage.setItem(LS_MINT_FN, mintFn || '') }, [mintFn])
  useEffect(() => { localStorage.setItem(LS_MINT_QTY, mintQty || '') }, [mintQty])
  useEffect(() => { localStorage.setItem(LS_CUSTOM_ABI, customAbi || '') }, [customAbi])

  // Init provider state
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

  // Auto-reconnect
  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem(LS_PROVIDER)
      if (!saved) return
      try {
        if (saved === 'coinbase') {
          await coinbaseConnect(setAccount, setChainId, setMessage)
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

  // Base ETH balance
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
      setTokenInfo({ symbol: '', decimals: 18, balance: '' })
      setMessage('Disconnected')
    } catch {}
  }

  const handleCoinbase = () => { coinbaseConnect(setAccount, setChainId, setMessage) }
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

  // ERC-20 balance fetch (lazy-load ethers)
  const fetchToken = async () => {
    try {
      setTokenMsg('')
      const { ethers } = await import('ethers')
      if (!ethers.isAddress(tokenAddr)) { setTokenMsg('Invalid token address'); return }
      const abi = [
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function balanceOf(address) view returns (uint256)'
      ]
      const provider = new ethers.JsonRpcProvider(BASE_RPC)
      const erc20 = new ethers.Contract(tokenAddr, abi, provider)
      const [sym, dec, bal] = await Promise.all([
        erc20.symbol().catch(() => ''),
        erc20.decimals().catch(() => 18),
        erc20.balanceOf(account || ethers.ZeroAddress)
      ])
      let balanceStr = '0'
      if (account) {
        balanceStr = ethers.formatUnits(bal, Number(dec))
      }
      setTokenInfo({ symbol: sym || 'ERC20', decimals: Number(dec), balance: balanceStr })
    } catch (e) {
      setTokenMsg(e?.message || 'Failed to fetch token')
      setTokenInfo({ symbol: '', decimals: 18, balance: '' })
    }
  }

  // NFT mint (generic) with optional custom ABI
  const mintNft = async () => {
    try {
      setMintMsg('')
      const { ethers } = await import('ethers')
      if (!account) { setMintMsg('Connect wallet first'); return }
      if (!ethers.isAddress(nftAddr)) { setMintMsg('Invalid NFT contract'); return }
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      let abi
      if (customAbi) {
        try { abi = JSON.parse(customAbi) } catch { setMintMsg('Invalid ABI JSON'); return }
      } else {
        const qty = mintQty && Number(mintQty) ? true : false
        abi = qty ? [`function ${mintFn}(uint256)`] : [`function ${mintFn}()`]
      }

      const c = new ethers.Contract(nftAddr, abi, signer)
      const tx = (customAbi && mintQty && Number(mintQty))
        ? await c[mintFn](BigInt(mintQty))
        : (customAbi ? await c[mintFn]() : (Number(mintQty) ? await c[mintFn](BigInt(mintQty)) : await c[mintFn]()))
      setMintMsg('Submitted: ' + tx.hash)
      const rc = await tx.wait()
      setMintMsg('Minted in block ' + rc.blockNumber)
    } catch (e) {
      setMintMsg(e?.shortMessage || e?.message || 'Mint failed')
    }
  }

  return (
    <main style={{maxWidth: 880, margin: '40px auto', padding: '0 16px', lineHeight: 1.6}}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
        <h1 style={{margin: 0}}> The Cursed Faction In-Game Banking System </h1>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
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

      {/* ERC-20 balances */}
      <section style={{marginTop: 24}}>
        <h2>Token balance (Base)</h2>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <input style={{flex:'1 1 320px'}} placeholder="ERC-20 token address (Base)" value={tokenAddr} onChange={e=>setTokenAddr(e.target.value)} />
          <button onClick={fetchToken} disabled={!tokenAddr}>Fetch</button>
        </div>
        {tokenMsg && <p style={{color:'#900'}}>{tokenMsg}</p>}
        {tokenInfo.balance && (
          <p>Balance: {tokenInfo.balance} {tokenInfo.symbol || 'ERC20'}</p>
        )}
      </section>

      {/* NFT mint */}
      <section style={{marginTop: 24}}>
        <h2>NFT Mint</h2>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 1fr 1fr', maxWidth:880}}>
          <input placeholder="NFT contract address" value={nftAddr} onChange={e=>setNftAddr(e.target.value)} />
          <input placeholder="Function name (e.g., mint)" value={mintFn} onChange={e=>setMintFn(e.target.value)} />
          <input placeholder="Quantity (optional)" value={mintQty} onChange={e=>setMintQty(e.target.value)} />
        </div>
        <div style={{marginTop:8}}>
          <textarea placeholder="Optional ABI JSON (array) for custom mint function" value={customAbi} onChange={e=>setCustomAbi(e.target.value)} style={{width:'100%', minHeight:120}} />
        </div>
        <div style={{marginTop:8}}>
          <button onClick={mintNft} disabled={!nftAddr || !mintFn}>Mint</button>
          {mintMsg && <p>{mintMsg}</p>}
        </div>
      </section>

      <p style={{marginTop: 32}}>Welcome to the next evolution of digital finance, where every NFT is more than a collectible  its a living asset in a world built on power, trust, and innovation. Inside the Cursed Faction universe, your NFTs can be bought, sold, traded, gifted, or burned  every action shaping a self-sustaining economy designed to reward its community.</p>
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