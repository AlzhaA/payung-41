/**
 * AI Decision Engine for Forty-One (41) CPU Opponents
 * Controls CPU decision making for drawing (stock vs discard) and selecting the optimal discard card.
 */

class AIPlayer {
    constructor(id, name, avatarIcon, personality = 'balanced') {
        this.id = id;
        this.name = name;
        this.avatarIcon = avatarIcon;
        this.personality = personality; // 'aggressive', 'balanced', 'cautious'
        this.hand = [];
        this.cumulativeScore = 0;
    }

    resetHand() {
        this.hand = [];
    }

    /**
     * Determines CPU's target suit based on current cards in hand
     */
    getTargetSuit() {
        const counts = { spades: 0, hearts: 0, clubs: 0, diamonds: 0 };
        const totals = { spades: 0, hearts: 0, clubs: 0, diamonds: 0 };

        this.hand.forEach(card => {
            counts[card.suit.id] += 1;
            totals[card.suit.id] += card.value;
        });

        let bestSuitId = 'spades';
        let highestWeight = -1;

        for (const suit of SUITS) {
            const sId = suit.id;
            // Weight formula gives weight to count of cards and point total
            const weight = counts[sId] * 15 + totals[sId];
            if (weight > highestWeight) {
                highestWeight = weight;
                bestSuitId = sId;
            }
        }

        return bestSuitId;
    }

    /**
     * Decide whether to draw from discard pile or stock pile
     */
    decideDrawSource(topDiscardCard) {
        if (!topDiscardCard) {
            return 'stock';
        }

        const targetSuit = this.getTargetSuit();
        const currentScoreObj = evaluateHandScore(this.hand);

        // If top discard matches our target suit, simulate taking it
        if (topDiscardCard.suit.id === targetSuit) {
            const simulatedHand = [...this.hand, topDiscardCard];
            let bestSimulatedScore = -999;

            // Find best 4-card hand if we take this card and discard the worst
            for (let i = 0; i < simulatedHand.length; i++) {
                const subHand = simulatedHand.filter((_, idx) => idx !== i);
                const evalSub = evaluateHandScore(subHand);
                if (evalSub.netScore > bestSimulatedScore) {
                    bestSimulatedScore = evalSub.netScore;
                }
            }

            // If taking discard improves score or provides high value target suit card (>=7)
            if (bestSimulatedScore > currentScoreObj.netScore || (topDiscardCard.value >= 7 && topDiscardCard.suit.id === targetSuit)) {
                return 'discard';
            }
        }

        return 'stock';
    }

    /**
     * Decide which card to discard from a 5-card hand
     */
    decideDiscardCard() {
        if (this.hand.length <= 4) return null;

        let bestCardToDiscard = null;
        let highestRemainingScore = -9999;
        let maxDiscardPenalty = -1;

        // Simulate discarding each card
        for (let i = 0; i < this.hand.length; i++) {
            const cardCandidate = this.hand[i];
            const remainingHand = this.hand.filter((_, idx) => idx !== i);
            const evalResult = evaluateHandScore(remainingHand);

            if (evalResult.netScore > highestRemainingScore) {
                highestRemainingScore = evalResult.netScore;
                bestCardToDiscard = cardCandidate;
                maxDiscardPenalty = cardCandidate.value;
            } else if (evalResult.netScore === highestRemainingScore) {
                // Tiebreaker: discard card with higher point value if it's not of target suit
                if (cardCandidate.value > maxDiscardPenalty) {
                    highestRemainingScore = evalResult.netScore;
                    bestCardToDiscard = cardCandidate;
                    maxDiscardPenalty = cardCandidate.value;
                }
            }
        }

        return bestCardToDiscard;
    }

    /**
     * Optional fun speech lines when CPU acts
     */
    getReactionText(action, detail = '') {
        const drawStockLines = [
            'Coba ambil dari deck...',
            'Semoga dapat kartu bagus!',
            'Mari kita lihat...',
            'Menarik kartu misteri.'
        ];
        const drawDiscardLines = [
            `Wah, ${detail} cocok buatku!`,
            'Kebetulan kartu ini saya butuhkan!',
            'Terima kasih buangannya!'
        ];
        const discardLines = [
            `Buang ${detail}`,
            `Lepas ${detail} dulu`,
            `Tidak butuh ${detail}`
        ];

        if (action === 'draw_stock') {
            return drawStockLines[Math.floor(Math.random() * drawStockLines.length)];
        } else if (action === 'draw_discard') {
            return drawDiscardLines[Math.floor(Math.random() * drawDiscardLines.length)];
        } else if (action === 'discard') {
            return discardLines[Math.floor(Math.random() * discardLines.length)];
        }
        return 'Sedang berpikir...';
    }
}
