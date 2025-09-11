#!/bin/bash

# Cursed Faction Shadow Realm - Game Commands
# Collection of utility commands for the shadow realm game

# Function to generate random cursed names
generate_cursed_name() {
    local prefixes=("Shadow" "Cursed" "Dark" "Void" "Phantom" "Wraith" "Doom" "Hex")
    local suffixes=("blade" "wraith" "lord" "keeper" "walker" "weaver" "bringer" "master")
    
    local prefix=${prefixes[$RANDOM % ${#prefixes[@]}]}
    local suffix=${suffixes[$RANDOM % ${#suffixes[@]}]}
    
    echo "${prefix}${suffix}"
}

# Function to check NFT balance (simulated)
check_nft_balance() {
    local wallet_address="$1"
    if [ -z "$wallet_address" ]; then
        echo "❌ Please provide wallet address"
        return 1
    fi
    
    # Simulate NFT balance check
    local nft_count=$((RANDOM % 10 + 1))
    echo "🎭 NFT Balance for ${wallet_address:0:6}...${wallet_address: -4}:"
    echo "   Cursed Faction NFTs: $nft_count"
    echo "   Shadow Realm Access: $([ $nft_count -ge 3 ] && echo "✅ Granted" || echo "❌ Denied")"
}

# Function to calculate shadow power
calculate_shadow_power() {
    local level="$1"
    local energy="$2"
    local tokens="$3"
    
    if [ -z "$level" ] || [ -z "$energy" ] || [ -z "$tokens" ]; then
        echo "Usage: calculate_shadow_power <level> <energy> <tokens>"
        return 1
    fi
    
    local power=$((level * 10 + energy / 2 + tokens * 5))
    echo "⚡ Shadow Power: $power"
    
    if [ $power -ge 500 ]; then
        echo "🏆 Rank: Shadow Lord"
    elif [ $power -ge 200 ]; then
        echo "👑 Rank: Shadow Master"
    elif [ $power -ge 100 ]; then
        echo "⚔️ Rank: Shadow Warrior"
    else
        echo "🌑 Rank: Shadow Initiate"
    fi
}

# Function to generate game art
show_shadow_art() {
    echo "         ░░░░░░░░░░░░░░░░░░░░░░░░░"
    echo "       ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░"
    echo "     ░░▓▓██████████████████████▓▓░░"
    echo "   ░░▓▓██████████████████████████▓▓░░"
    echo "  ░▓▓████████████████████████████████▓▓░"
    echo " ░▓██████████████████████████████████████▓░"
    echo "░▓████████████████████████████████████████▓░"
    echo "▓██████████████████████████████████████████▓"
    echo "██████████████  SHADOW REALM  ██████████████"
    echo "▓██████████████████████████████████████████▓"
    echo "░▓████████████████████████████████████████▓░"
    echo " ░▓██████████████████████████████████████▓░"
    echo "  ░▓▓████████████████████████████████▓▓░"
    echo "   ░░▓▓██████████████████████████▓▓░░"
    echo "     ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░"
    echo "       ░░░░░░░░░░░░░░░░░░░░░░░"
}

# Main command handler
case "$1" in
    "name")
        generate_cursed_name
        ;;
    "nft")
        check_nft_balance "$2"
        ;;
    "power")
        calculate_shadow_power "$2" "$3" "$4"
        ;;
    "art")
        show_shadow_art
        ;;
    "help")
        echo "Available game commands:"
        echo "  name           - Generate a cursed name"
        echo "  nft <address>  - Check NFT balance"
        echo "  power <l> <e> <t> - Calculate shadow power (level, energy, tokens)"
        echo "  art            - Show shadow realm art"
        echo "  help           - Show this help"
        ;;
    *)
        echo "Use './game-commands.sh help' for available commands"
        ;;
esac