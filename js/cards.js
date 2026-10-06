/**
 * Cards Engine & Rule 41 Scoring Logic
 * Rules:
 * - Ace = 11 points
 * - K, Q, J, 10 = 10 points
 * - 2 to 9 = Face value points (2 to 9)
 * - Hand Score = (Sum of cards in dominant suit) - (Sum of cards in other suits)
 * - Maximum possible: 41 points (A [11] + K [10] + Q [10] + J [10] in the same suit)
 */

const SUITS = [
    { id: 'spades', symbol: '♠', name: 'Skop', colorClass: 'suit-spade' },
    { id: 'hearts', symbol: '♥', name: 'Hati', colorClass: 'suit-heart' },
    { id: 'clubs', symbol: '♣', name: 'Keriting', colorClass: 'suit-club' },
    { id: 'diamonds', symbol: '♦', name: 'Ketupat', colorClass: 'suit-diamond' }
];

// Hierarchy for turn order determination (Cangkul Penentu Giliran)
// User Rule: Ketupat (1) < Keriting (2) < Hati (3) < Skop/Padung (4)
const SUIT_HIERARCHY = {
    'diamonds': 1, // Ketupat / Wajik (Paling kecil)
    'clubs': 2,    // Keriting
    'hearts': 3,   // Hati
    'spades': 4    // Skop / Padung (Paling tinggi)
};

const RANK_HIERARCHY = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
};

/**
 * Compares two cards for turn order determination.
 * Primary: Rank hierarchy (2..10, J, Q, K, A)
 * Secondary: Suit hierarchy (Ketupat < Keriting < Hati < Skop)
 * Returns positive if cardA > cardB, negative if cardA < cardB.
 */
function compareTurnCards(cardA, cardB) {
    const rankA = RANK_HIERARCHY[cardA.rank] || 0;
    const rankB = RANK_HIERARCHY[cardB.rank] || 0;
    if (rankA !== rankB) {
        return rankA - rankB;
    }
    const suitA = SUIT_HIERARCHY[cardA.suit.id] || 0;
    const suitB = SUIT_HIERARCHY[cardB.suit.id] || 0;
    return suitA - suitB;
}

const RANKS = [
    { rank: '2', value: 2 },
    { rank: '3', value: 3 },
    { rank: '4', value: 4 },
    { rank: '5', value: 5 },
    { rank: '6', value: 6 },
    { rank: '7', value: 7 },
    { rank: '8', value: 8 },
    { rank: '9', value: 9 },
    { rank: '10', value: 10 },
    { rank: 'J', value: 10 },
    { rank: 'Q', value: 10 },
    { rank: 'K', value: 10 },
    { rank: 'A', value: 11 }
];

class Card {
    constructor(suit, rank, value) {
        this.id = `${rank.rank}_${suit.id}`;
        this.suit = suit;
        this.rank = rank.rank;
        this.value = value;
    }

    renderHTML(isFaceUp = true, customClass = '') {
        if (!isFaceUp) {
            return `
                <div class="game-card card-back ${customClass}" data-card-id="${this.id}">
                    <div class="deck-pattern">
                        <div class="deck-emblem">41</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="game-card ${this.suit.colorClass} ${customClass}" data-card-id="${this.id}">
                <div class="card-corner top-left">
                    <span class="rank">${this.rank}</span>
                    <span class="suit-mini">${this.suit.symbol}</span>
                </div>
                <div class="card-center-art">${this.suit.symbol}</div>
                <div class="card-point-tag">${this.value} pts</div>
                <div class="card-corner bottom-right">
                    <span class="rank">${this.rank}</span>
                    <span class="suit-mini">${this.suit.symbol}</span>
                </div>
            </div>
        `;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                this.cards.push(new Card(suit, rank, rank.value));
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length === 0) return null;
        return this.cards.pop();
    }

    remaining() {
        return this.cards.length;
    }
}

/**
 * Calculates score breakdown for a set of cards (typically 4 cards in hand)
 */
function evaluateHandScore(cards) {
    if (!cards || cards.length === 0) {
        return {
            dominantSuit: null,
            dominantSum: 0,
            penaltySum: 0,
            netScore: 0,
            isFortyOne: false,
            suitTotals: { spades: 0, hearts: 0, clubs: 0, diamonds: 0 }
        };
    }

    const suitTotals = { spades: 0, hearts: 0, clubs: 0, diamonds: 0 };
    const suitCardCounts = { spades: 0, hearts: 0, clubs: 0, diamonds: 0 };
    let grandTotal = 0;

    cards.forEach(card => {
        suitTotals[card.suit.id] += card.value;
        suitCardCounts[card.suit.id] += 1;
        grandTotal += card.value;
    });

    let bestSuitId = 'spades';
    let maxNetScore = -9999;
    let bestDominantSum = 0;
    let bestPenaltySum = 0;

    for (const suit of SUITS) {
        const sId = suit.id;
        const dominantSum = suitTotals[sId];
        const penaltySum = grandTotal - dominantSum;
        const netScore = dominantSum - penaltySum;

        if (netScore > maxNetScore) {
            maxNetScore = netScore;
            bestSuitId = sId;
            bestDominantSum = dominantSum;
            bestPenaltySum = penaltySum;
        }
    }

    const dominantSuitObj = SUITS.find(s => s.id === bestSuitId);
    // 41 check: exactly 4 cards of the same suit and total sum is 41
    const isFortyOne = cards.length === 4 && 
                       suitCardCounts[bestSuitId] === 4 && 
                       bestDominantSum === 41;

    return {
        dominantSuit: dominantSuitObj,
        dominantSum: bestDominantSum,
        penaltySum: bestPenaltySum,
        netScore: maxNetScore,
        isFortyOne: isFortyOne,
        suitTotals: suitTotals
    };
}
