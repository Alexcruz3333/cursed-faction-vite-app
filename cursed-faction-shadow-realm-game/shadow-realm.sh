#!/bin/bash

# Cursed Faction Shadow Realm Game - Main Script
# This script provides command-line utilities for the shadow realm game

echo "═══════════════════════════════════════"
echo "     CURSED FACTION SHADOW REALM      "
echo "═══════════════════════════════════════"
echo ""

# Game state variables
PLAYER_LEVEL=1
SHADOW_ENERGY=100
CURSED_TOKENS=0

# Function to display game status
show_status() {
    echo "┌─────────────────────────────────────┐"
    echo "│            PLAYER STATUS            │"
    echo "├─────────────────────────────────────┤"
    echo "│ Level: $PLAYER_LEVEL                        │"
    echo "│ Shadow Energy: $SHADOW_ENERGY               │" 
    echo "│ Cursed Tokens: $CURSED_TOKENS               │"
    echo "└─────────────────────────────────────┘"
}

# Function to enter shadow realm
enter_realm() {
    echo "🌑 Entering the Shadow Realm..."
    echo "The darkness welcomes you, cursed one."
    echo "Ancient powers stir in the void..."
    show_status
}

# Function to cast shadow spell
cast_spell() {
    if [ $SHADOW_ENERGY -ge 10 ]; then
        SHADOW_ENERGY=$((SHADOW_ENERGY - 10))
        CURSED_TOKENS=$((CURSED_TOKENS + 1))
        echo "⚡ Shadow spell cast successfully!"
        echo "You gained 1 Cursed Token."
    else
        echo "❌ Insufficient shadow energy to cast spell."
    fi
    show_status
}

# Function to restore energy
restore_energy() {
    SHADOW_ENERGY=100
    echo "🔋 Shadow energy restored to maximum."
    show_status
}

# Main game loop
case "$1" in
    "enter")
        enter_realm
        ;;
    "status")
        show_status
        ;;
    "cast")
        cast_spell
        ;;
    "restore")
        restore_energy
        ;;
    "help")
        echo "Available commands:"
        echo "  enter   - Enter the shadow realm"
        echo "  status  - Show player status"
        echo "  cast    - Cast a shadow spell"
        echo "  restore - Restore shadow energy"
        echo "  help    - Show this help message"
        ;;
    *)
        echo "Welcome to the Cursed Faction Shadow Realm!"
        echo "Use './shadow-realm.sh help' to see available commands."
        enter_realm
        ;;
esac