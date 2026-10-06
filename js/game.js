/**
 * Main Game Controller for Forty-One (41) Card Game
 * Manages game state, turns, user interactions, animations, telemetry, and scoring.
 */

const BOT_NAMES_POOL = [
    'Alzha', 'Fadhil', 'Moreno', 'Bayu', 'Apri',
    'Alpin', 'Faris', 'Reiki', 'Thorik', 'Dennys',
    'Bobby', 'Bara', 'Aji', 'Farhan', 'Yogi'
];

class GameController {
    constructor() {
        this.deck = new Deck();
        this.discardPile = [];
        this.currentRound = 1;
        this.turnIndex = 0; // 0 = Player, 1 = CPU 1, 2 = CPU 2, 3 = CPU 3
        this.turnPhase = 'IDLE'; // 'AWAITING_DRAW', 'AWAITING_DISCARD', 'CPU_ACTING', 'ROUND_OVER'
        
        this.selectedCardId = null;
        this.isProcessing = false;

        // Players initialization with randomized bot names
        this.randomizeBotPlayers();

        this.initDOMReferences();
        this.updatePlayerNamesInDOM();
        this.initEventListeners();
        this.initConfetti();

        // Show Disclaimer Modal on first load (Main Menu)
        this.showDisclaimerModal();
    }

    /**
     * Randomly picks 3 unique names from BOT_NAMES_POOL for CPU 1, CPU 2, and CPU 3
     */
    randomizeBotPlayers() {
        const shuffled = [...BOT_NAMES_POOL].sort(() => 0.5 - Math.random());
        const selectedNames = shuffled.slice(0, 3);

        const botConfigs = [
            { id: 1, icon: 'fa-user-ninja', personality: 'balanced' },
            { id: 2, icon: 'fa-robot', personality: 'cautious' },
            { id: 3, icon: 'fa-user-astronaut', personality: 'aggressive' }
        ];

        this.players = [
            { id: 0, name: 'Kamu', isHuman: true, hand: [], cumulativeScore: 0 },
            ...botConfigs.map((cfg, idx) => {
                const name = selectedNames[idx];
                return new AIPlayer(cfg.id, `${name} (CPU ${cfg.id})`, cfg.icon, cfg.personality);
            })
        ];
    }

    /**
     * Updates all seat labels and draw-turn modal slots with the active bot names
     */
    updatePlayerNamesInDOM() {
        for (let i = 1; i <= 3; i++) {
            const player = this.players[i];
            if (!player) continue;

            // Update seat name label on the board
            const seatNameEl = document.querySelector(`#seat-cpu${i} .player-name`);
            if (seatNameEl) {
                seatNameEl.textContent = player.name;
            }

            // Update player name in the first-turn draw modal slot
            const drawNameEl = document.querySelector(`#draw-slot-${i} .draw-player-name`);
            if (drawNameEl) {
                const baseName = player.name.replace(/\s*\(CPU\s*\d+\)/i, '');
                drawNameEl.textContent = baseName;
            }
        }
    }

    initDOMReferences() {
        // Screen Views & Main Menu Elements
        this.domScreenMainMenu = document.getElementById('screen-main-menu');
        this.domScreenGame = document.getElementById('screen-game');
        this.domBtnModeSingle = document.getElementById('btn-mode-single');
        this.domBtnModeMulti = document.getElementById('btn-mode-multi');
        this.domBtnMenuRules = document.getElementById('btn-menu-rules');
        this.domBtnMenuDisclaimer = document.getElementById('btn-menu-disclaimer');
        this.domBtnMenuSound = document.getElementById('btn-menu-sound');
        this.domBtnMenuFullscreen = document.getElementById('btn-menu-fullscreen');
        this.domBtnBackMenu = document.getElementById('btn-back-menu');

        // Headers & Badges
        this.domPlayerCumulative = document.getElementById('player-cumulative-score');
        this.domCurrentRound = document.getElementById('current-round');
        this.domSoundBtn = document.getElementById('btn-sound');
        this.domFullscreenBtn = document.getElementById('btn-fullscreen');
        this.domRulesBtn = document.getElementById('btn-rules');
        this.domShuffleBtn = document.getElementById('btn-shuffle');
        this.domRestartBtn = document.getElementById('btn-restart');

        // Central Table Elements
        this.domStockCardTop = document.getElementById('stock-card-top');
        this.domStockPile = document.getElementById('stock-pile');
        this.domDiscardPile = document.getElementById('discard-pile');
        this.domDiscardDeckArea = document.getElementById('deck-discard');
        this.domDiscardDropHint = document.getElementById('discard-drop-hint');
        this.domLastDiscardTag = document.getElementById('last-discard-tag');
        this.domLastDiscardText = document.getElementById('last-discard-text');
        this.domCardsLeftCount = document.getElementById('cards-left-count');
        this.domTakeDiscardBtn = document.getElementById('btn-take-discard');
        this.domTurnText = document.getElementById('turn-text');
        this.domTurnInstruction = document.getElementById('turn-instruction');
        this.domLiveLog = document.getElementById('live-activity-log');
        this.domShuffleStage = document.getElementById('shuffle-stage');
        this.domCenterStagePiles = document.getElementById('center-stage-piles');
        this.domShuffleCascade = document.getElementById('shuffle-cascade');

        // Seats & Hands
        this.domSeats = [
            document.getElementById('seat-player'),
            document.getElementById('seat-cpu1'),
            document.getElementById('seat-cpu2'),
            document.getElementById('seat-cpu3')
        ];

        this.domHands = [
            document.getElementById('hand-player'),
            document.getElementById('hand-cpu1'),
            document.getElementById('hand-cpu2'),
            document.getElementById('hand-cpu3')
        ];

        this.domCpuScores = [
            null,
            document.getElementById('score-cpu1'),
            document.getElementById('score-cpu2'),
            document.getElementById('score-cpu3')
        ];

        this.domCpuBubbles = [
            null,
            document.getElementById('bubble-cpu1'),
            document.getElementById('bubble-cpu2'),
            document.getElementById('bubble-cpu3')
        ];

        // Player HUD
        this.domUserPoints = document.getElementById('user-current-points');
        this.domDiscardBtn = document.getElementById('btn-discard');
        this.domKnockBtn = document.getElementById('btn-knock');
        this.domTelemetrySpades = document.querySelector('#telemetry-spades .suit-val');
        this.domTelemetryHearts = document.querySelector('#telemetry-hearts .suit-val');
        this.domTelemetryClubs = document.querySelector('#telemetry-clubs .suit-val');
        this.domTelemetryDiamonds = document.querySelector('#telemetry-diamonds .suit-val');

        // Modals
        this.domDisclaimerModal = document.getElementById('modal-disclaimer');
        this.domCloseDisclaimerBtn = document.getElementById('btn-close-disclaimer');
        this.domAgreeDisclaimerBtn = document.getElementById('btn-agree-disclaimer');
        this.domRulesModal = document.getElementById('modal-rules');
        this.domCloseRulesBtn = document.getElementById('btn-close-rules');
        this.domUnderstoodBtn = document.getElementById('btn-understood');
        this.domGameOverModal = document.getElementById('modal-gameover');
        this.domGameOverTbody = document.getElementById('gameover-tbody');
        this.domGameOverTitle = document.getElementById('gameover-title');
        this.domGameOverSubtitle = document.getElementById('gameover-subtitle');
        this.domGameOverCrown = document.getElementById('gameover-crown');
        this.domPlayAgainBtn = document.getElementById('btn-play-again');

        // Turn Order Draw Modal Elements
        this.domModalDrawTurn = document.getElementById('modal-draw-turn');
        this.domDrawSlots = [
            document.getElementById('draw-slot-0'),
            document.getElementById('draw-slot-1'),
            document.getElementById('draw-slot-2'),
            document.getElementById('draw-slot-3')
        ];
        this.domDrawCardBoxes = [
            document.getElementById('draw-card-box-0'),
            document.getElementById('draw-card-box-1'),
            document.getElementById('draw-card-box-2'),
            document.getElementById('draw-card-box-3')
        ];
        this.domDrawCardVals = [
            document.getElementById('draw-card-val-0'),
            document.getElementById('draw-card-val-1'),
            document.getElementById('draw-card-val-2'),
            document.getElementById('draw-card-val-3')
        ];
        this.domDrawResultAnnounce = document.getElementById('draw-result-announcement');
        this.domBtnDrawContinue = document.getElementById('btn-draw-continue');
    }

    initEventListeners() {
        // Main Menu Screen Navigation
        if (this.domBtnModeSingle) {
            this.domBtnModeSingle.addEventListener('click', () => {
                sounds.playClick();
                this.randomizeBotPlayers();
                this.updatePlayerNamesInDOM();
                this.currentRound = 1;
                this.domCurrentRound.textContent = '1';
                this.showGameScreen();
                this.startNewRound();
            });
        }

        if (this.domBtnBackMenu) {
            this.domBtnBackMenu.addEventListener('click', () => {
                sounds.playClick();
                this.showMainMenu();
            });
        }

        if (this.domBtnMenuRules) {
            this.domBtnMenuRules.addEventListener('click', () => {
                sounds.playClick();
                this.showRulesModal();
            });
        }

        if (this.domBtnMenuDisclaimer) {
            this.domBtnMenuDisclaimer.addEventListener('click', () => {
                this.showDisclaimerModal();
            });
        }

        if (this.domBtnMenuSound) {
            this.domBtnMenuSound.addEventListener('click', () => {
                const isEnabled = sounds.toggle();
                this.syncSoundButtons(isEnabled);
            });
        }

        if (this.domBtnMenuFullscreen) {
            this.domBtnMenuFullscreen.addEventListener('click', () => {
                sounds.playClick();
                this.toggleFullscreen();
            });
        }

        // Sound toggle (Header)
        if (this.domSoundBtn) {
            this.domSoundBtn.addEventListener('click', () => {
                const isEnabled = sounds.toggle();
                this.syncSoundButtons(isEnabled);
                this.logActivity(isEnabled ? 'Suara diaktifkan' : 'Suara dimatikan');
            });
        }

        // Fullscreen toggle (Header)
        if (this.domFullscreenBtn) {
            this.domFullscreenBtn.addEventListener('click', () => {
                sounds.playClick();
                this.toggleFullscreen();
            });
        }

        // Global Fullscreen Change Listener
        document.addEventListener('fullscreenchange', () => this.syncFullscreenButtons());
        document.addEventListener('webkitfullscreenchange', () => this.syncFullscreenButtons());
        document.addEventListener('mozfullscreenchange', () => this.syncFullscreenButtons());
        document.addEventListener('MSFullscreenChange', () => this.syncFullscreenButtons());

        // Disclaimer modal
        if (this.domCloseDisclaimerBtn) {
            this.domCloseDisclaimerBtn.addEventListener('click', () => this.hideDisclaimerModal());
        }
        if (this.domAgreeDisclaimerBtn) {
            this.domAgreeDisclaimerBtn.addEventListener('click', () => this.hideDisclaimerModal());
        }
        if (this.domDisclaimerModal) {
            this.domDisclaimerModal.addEventListener('click', (e) => {
                if (e.target === this.domDisclaimerModal) {
                    this.hideDisclaimerModal();
                }
            });
        }

        // Rules modal
        this.domRulesBtn.addEventListener('click', () => this.showRulesModal());
        this.domCloseRulesBtn.addEventListener('click', () => this.hideRulesModal());
        this.domUnderstoodBtn.addEventListener('click', () => this.hideRulesModal());

        // Shuffle button
        if (this.domShuffleBtn) {
            this.domShuffleBtn.addEventListener('click', () => {
                if (!this.isProcessing) {
                    this.startNewRound();
                }
            });
        }

        // Restart / Reset
        this.domRestartBtn.addEventListener('click', () => {
            if (confirm('Mulai ulang ronde saat ini?')) {
                this.startNewRound();
            }
        });

        // Play Again after game over
        this.domPlayAgainBtn.addEventListener('click', () => {
            this.domGameOverModal.classList.remove('active');
            this.currentRound++;
            this.domCurrentRound.textContent = this.currentRound;
            this.startNewRound();
        });

        // Draw from Stock Deck (Human Player)
        this.domStockCardTop.addEventListener('click', () => {
            if (this.turnIndex === 0 && this.turnPhase === 'AWAITING_DRAW' && !this.isProcessing) {
                this.handlePlayerDrawStock();
            }
        });

        // Draw from Discard Pile (Human Player)
        this.domTakeDiscardBtn.addEventListener('click', () => {
            if (this.turnIndex === 0 && this.turnPhase === 'AWAITING_DRAW' && !this.isProcessing) {
                this.handlePlayerDrawDiscard();
            }
        });

        this.domDiscardPile.addEventListener('click', () => {
            if (this.turnIndex === 0 && !this.isProcessing) {
                if (this.turnPhase === 'AWAITING_DRAW' && this.discardPile.length > 0) {
                    this.handlePlayerDrawDiscard();
                } else if (this.turnPhase === 'AWAITING_DISCARD' && this.selectedCardId) {
                    this.handlePlayerDiscard();
                }
            }
        });

        // Discard selected card (Human Player)
        this.domDiscardBtn.addEventListener('click', () => {
            if (this.turnIndex === 0 && this.turnPhase === 'AWAITING_DISCARD' && this.selectedCardId && !this.isProcessing) {
                this.handlePlayerDiscard();
            }
        });

        // Knock / Tutup Kartu (Human Player)
        this.domKnockBtn.addEventListener('click', () => {
            if (this.turnIndex === 0 && this.turnPhase === 'AWAITING_DRAW' && !this.isProcessing) {
                if (confirm('Apakah kamu yakin ingin Menutup (Knock) kartu sekarang? Ronde akan berakhir dan skor semua pemain akan dihitung.')) {
                    sounds.playKnock();
                    this.logActivity('Kamu melakukan KNOCK! Ronde selesai!');
                    this.endRound('Kamu melakukan Knock!');
                }
            }
        });
    }

    /**
     * Executes realistic 3D card shuffling animation with sound effects
     */
    runShuffleAnimation(callback) {
        this.isProcessing = true;
        this.domTurnText.innerHTML = '<i class="fa-solid fa-shuffle fa-spin text-gold"></i> Mengocok Kartu...';
        this.domTurnInstruction.textContent = 'Mempersiapkan susunan kartu baru secara acak.';
        this.logActivity(`Mengocok 52 kartu deck secara acak...`);

        // Populate cascade interleaving cards
        if (this.domShuffleCascade) {
            this.domShuffleCascade.innerHTML = '';
            const numLeaves = 12;
            for (let i = 0; i < numLeaves; i++) {
                const isLeft = i % 2 === 0;
                const cardEl = document.createElement('div');
                cardEl.className = `game-card card-back shuffle-cascade-card ${isLeft ? 'from-left' : 'from-right'}`;
                cardEl.style.animationDelay = `${0.15 + (i * 0.055)}s`;
                cardEl.style.zIndex = i + 1;
                this.domShuffleCascade.appendChild(cardEl);
            }
        }

        // Activate shuffle visual stage
        if (this.domShuffleStage) {
            this.domShuffleStage.classList.add('active');
        }
        if (this.domCenterStagePiles) {
            this.domCenterStagePiles.classList.add('shuffling-active');
        }

        // Play riffle shuffle audio
        sounds.playCardShuffle();

        // Finish shuffle sequence after 1.3s
        setTimeout(() => {
            if (this.domShuffleStage) {
                this.domShuffleStage.classList.remove('active');
            }
            if (this.domCenterStagePiles) {
                this.domCenterStagePiles.classList.remove('shuffling-active');
            }
            if (this.domShuffleCascade) {
                this.domShuffleCascade.innerHTML = '';
            }

            // Snap burst pulse effect on deck
            if (this.domStockCardTop) {
                this.domStockCardTop.classList.add('shuffle-complete-burst');
                setTimeout(() => {
                    this.domStockCardTop.classList.remove('shuffle-complete-burst');
                }, 400);
            }

            if (typeof callback === 'function') {
                callback();
            }
        }, 1300);
    }

    /**
     * Visual dealing animation where 16 cards fly one by one from center deck to 4 players,
     * followed by flipping the 1st discard card.
     */
    animateDealingSequence(callback) {
        this.domTurnText.innerHTML = '<i class="fa-solid fa-layer-group text-gold"></i> Membagikan Kartu...';
        this.domTurnInstruction.textContent = 'Setiap pemain menerima 4 kartu.';
        this.logActivity(`Ronde ${this.currentRound}: Membagikan 4 kartu ke masing-masing pemain...`);

        const totalDeals = 16;
        let currentDeal = 0;
        const dealStepInterval = 115; // Fast and snappy casino speed

        const sourceEl = this.domStockCardTop;
        const sourceRect = sourceEl ? sourceEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 90, height: 130 };

        const dealNextCard = () => {
            if (currentDeal >= totalDeals) {
                // All 16 cards dealt! Now flip the 1st card into the Discard Pile
                setTimeout(() => {
                    const firstDiscard = this.deck.draw();
                    if (firstDiscard) {
                        this.updateDeckCount();
                        this.animateCardFlyDraw(this.domStockCardTop, this.domDiscardPile, firstDiscard, true, () => {
                            this.discardPile.push(firstDiscard);
                            this.renderDiscardPile(true);
                            this.isProcessing = false;
                            if (typeof callback === 'function') callback();
                        });
                    } else {
                        this.isProcessing = false;
                        if (typeof callback === 'function') callback();
                    }
                }, 280);
                return;
            }

            const playerIndex = currentDeal % this.players.length;
            const targetEl = this.domHands[playerIndex] || this.domSeats[playerIndex];
            const targetRect = targetEl ? targetEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 100, width: 90, height: 130 };
            const card = this.deck.draw();

            if (!card) {
                if (typeof callback === 'function') callback();
                return;
            }

            const isHuman = playerIndex === 0;

            // Create flying deal card clone
            const flyer = document.createElement('div');
            flyer.className = 'flying-deal-card';
            flyer.innerHTML = card.renderHTML(isHuman, 'flying-deal-inner');

            const startX = sourceRect.left;
            const startY = sourceRect.top;
            const targetX = targetRect.left + (targetRect.width - (sourceRect.width || 90)) / 2;
            const targetY = targetRect.top + (targetRect.height - (sourceRect.height || 130)) / 2;

            flyer.style.left = `${startX}px`;
            flyer.style.top = `${startY}px`;
            flyer.style.transform = isHuman ? 'scale(0.85) rotate(0deg)' : 'scale(0.8) rotateY(180deg)';
            document.body.appendChild(flyer);

            sounds.playCardDeal();

            // Force reflow
            void flyer.offsetWidth;

            // Target transforms based on seat position
            let targetTransform = '';
            if (playerIndex === 0) {
                // Bottom (You)
                targetTransform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(1) rotate(0deg)`;
            } else if (playerIndex === 1) {
                // Left (Budi)
                targetTransform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.7) rotate(-90deg)`;
            } else if (playerIndex === 2) {
                // Top (Siti)
                targetTransform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.68) rotate(0deg)`;
            } else if (playerIndex === 3) {
                // Right (Anton)
                targetTransform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.7) rotate(90deg)`;
            }

            flyer.style.transform = targetTransform;

            setTimeout(() => {
                flyer.style.opacity = '0';
                setTimeout(() => {
                    if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
                }, 40);

                this.players[playerIndex].hand.push(card);
                this.renderHands();
                this.updateDeckCount();
                if (isHuman) {
                    this.updatePlayerTelemetry();
                }
            }, 230);

            currentDeal++;
            setTimeout(dealNextCard, dealStepInterval);
        };

        dealNextCard();
    }

    /**
     * Executes High-Card Draw / Cangkul Penentu Giliran
     * Each of the 4 players draws 1 card from deck.
     * Evaluates winner based on:
     * 1. Rank: 2 < 3 < ... < 10 < J < Q < K < A
     * 2. Suit Hierarchy: Ketupat (♦) < Keriting (♣) < Hati (♥) < Skop (♠)
     */
    runDrawTurnOrderSequence(callback) {
        this.isProcessing = true;
        if (!this.domModalDrawTurn) {
            if (typeof callback === 'function') callback(0);
            return;
        }

        // Show Turn Draw modal
        this.domModalDrawTurn.classList.add('active');
        if (this.domBtnDrawContinue) {
            this.domBtnDrawContinue.style.display = 'none';
        }

        // Reset UI slots
        for (let i = 0; i < 4; i++) {
            if (this.domDrawSlots[i]) {
                this.domDrawSlots[i].classList.remove('winner-slot');
            }
            if (this.domDrawCardBoxes[i]) {
                this.domDrawCardBoxes[i].innerHTML = `
                    <div class="game-card card-back draw-placeholder-card">
                        <div class="deck-pattern"><div class="deck-emblem">41</div></div>
                    </div>
                `;
            }
            if (this.domDrawCardVals[i]) {
                this.domDrawCardVals[i].textContent = 'Mencangkul...';
            }
        }

        if (this.domDrawResultAnnounce) {
            this.domDrawResultAnnounce.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-gold"></i> Setiap pemain mencangkul 1 kartu dari deck...';
        }

        // Draw 4 cards for determination
        const drawnCards = [
            this.deck.draw(),
            this.deck.draw(),
            this.deck.draw(),
            this.deck.draw()
        ];

        // Reveal each player's card with stagger
        const revealStep = (idx) => {
            if (idx >= 4) {
                // All 4 cards revealed! Determine winner
                setTimeout(() => {
                    let winnerIdx = 0;
                    for (let i = 1; i < 4; i++) {
                        if (compareTurnCards(drawnCards[i], drawnCards[winnerIdx]) > 0) {
                            winnerIdx = i;
                        }
                    }

                    const winningCard = drawnCards[winnerIdx];
                    const winnerPlayer = this.players[winnerIdx];

                    // Check for suit tie-breaker reasoning
                    const tiedOpponents = [];
                    for (let i = 0; i < 4; i++) {
                        if (i !== winnerIdx && drawnCards[i].rank === winningCard.rank) {
                            tiedOpponents.push(this.players[i]);
                        }
                    }

                    // Highlight winning slot
                    if (this.domDrawSlots[winnerIdx]) {
                        this.domDrawSlots[winnerIdx].classList.add('winner-slot');
                    }

                    sounds.playVictory();

                    let reasonText = '';
                    if (tiedOpponents.length > 0) {
                        const tiedNames = tiedOpponents.map(p => p.name).join(', ');
                        reasonText = `👑 <strong>${winnerPlayer.name}</strong> mencangkul <strong>${winningCard.rank}${winningCard.suit.symbol} (${winningCard.suit.name})</strong> — Simbol ${winningCard.suit.name} mengalahkan ${tiedNames}, giliran pertama!`;
                    } else {
                        reasonText = `👑 <strong>${winnerPlayer.name}</strong> mencangkul <strong>${winningCard.rank}${winningCard.suit.symbol} (${winningCard.suit.name})</strong> — Kartu tertinggi, berhak mulai duluan!`;
                    }

                    if (this.domDrawResultAnnounce) {
                        this.domDrawResultAnnounce.innerHTML = reasonText;
                    }
                    this.logActivity(reasonText.replace(/<[^>]*>?/gm, ''));

                    // Show continue button & setup auto-dismiss
                    if (this.domBtnDrawContinue) {
                        this.domBtnDrawContinue.style.display = 'inline-flex';
                    }

                    let hasProceeded = false;
                    const proceed = () => {
                        if (hasProceeded) return;
                        hasProceeded = true;
                        this.domModalDrawTurn.classList.remove('active');
                        // Reset deck to full 52 cards ready for deal
                        this.deck.reset();
                        if (typeof callback === 'function') {
                            callback(winnerIdx);
                        }
                    };

                    if (this.domBtnDrawContinue) {
                        this.domBtnDrawContinue.onclick = proceed;
                    }
                    setTimeout(proceed, 3200);
                }, 500);
                return;
            }

            const card = drawnCards[idx];
            if (this.domDrawCardBoxes[idx] && card) {
                this.domDrawCardBoxes[idx].innerHTML = card.renderHTML(true, 'draw-card-revealed');
                sounds.playCardDraw();
            }
            if (this.domDrawCardVals[idx] && card) {
                this.domDrawCardVals[idx].innerHTML = `<strong class="${card.suit.colorClass}">${card.rank} ${card.suit.symbol}</strong> (${card.suit.name})`;
            }

            setTimeout(() => revealStep(idx + 1), 450);
        };

        setTimeout(() => revealStep(0), 400);
    }

    startNewRound() {
        this.isProcessing = true;
        this.deck.reset();
        this.discardPile = [];
        this.selectedCardId = null;

        // Reset player hands
        this.players.forEach(p => p.hand = []);
        this.renderAll();

        // 1. Run shuffle animation first
        this.runShuffleAnimation(() => {
            // 2. Determine turn order with high-card draw (Cangkul Penentu Giliran) on round 1
            if (this.currentRound === 1) {
                this.runDrawTurnOrderSequence((winnerIndex) => {
                    this.turnIndex = winnerIndex;
                    this.animateDealingSequence(() => {
                        this.checkInstantWinInitial();
                    });
                });
            } else {
                this.animateDealingSequence(() => {
                    this.checkInstantWinInitial();
                });
            }
        });
    }

    checkInstantWinInitial() {
        // Check if anyone was dealt natural 41
        for (const player of this.players) {
            const scoreObj = evaluateHandScore(player.hand);
            if (scoreObj.isFortyOne) {
                sounds.playFortyOneExplosion();
                this.logActivity(`Luar biasa! ${player.name} mendapatkan 41 ALAMI langsung di awal!`);
                this.endRound(`${player.name} Mendapatkan 41 Poin Alami!`);
                return;
            }
        }
        this.startTurn();
    }

    startTurn() {
        this.updateActiveSeatUI();
        const currentPlayer = this.players[this.turnIndex];

        if (this.domDiscardDeckArea) {
            this.domDiscardDeckArea.classList.remove('discard-target-active');
        }

        if (currentPlayer.isHuman) {
            this.turnPhase = 'AWAITING_DRAW';
            this.domTurnText.textContent = 'Giliran Kamu!';
            this.domTurnInstruction.textContent = 'Ambil 1 kartu dari Deck atau Tumpukan Buangan';
            this.domStockCardTop.classList.add('clickable');
            this.domTakeDiscardBtn.disabled = this.discardPile.length === 0;
            this.domDiscardBtn.disabled = true;
            this.domKnockBtn.disabled = false;
            sounds.playTurnAlert();
        } else {
            this.turnPhase = 'CPU_ACTING';
            this.domTurnText.textContent = `Giliran ${currentPlayer.name}`;
            this.domTurnInstruction.textContent = `${currentPlayer.name} sedang memilih kartu...`;
            this.domStockCardTop.classList.remove('clickable');
            this.domTakeDiscardBtn.disabled = true;
            this.domDiscardBtn.disabled = true;
            this.domKnockBtn.disabled = true;

            this.runCPUTurn(currentPlayer);
        }
    }

    handlePlayerDrawStock() {
        if (this.deck.remaining() === 0) {
            this.logActivity('Deck habis! Ronde berakhir.');
            this.endRound('Kartu di deck telah habis!');
            return;
        }

        this.isProcessing = true;
        this.domStockCardTop.classList.remove('clickable');
        this.domTakeDiscardBtn.disabled = true;
        this.domKnockBtn.disabled = true;

        const card = this.deck.draw();
        this.updateDeckCount();
        this.logActivity(`Kamu mengambil kartu dari Deck (Cangkul)...`);

        // Trigger smooth flying draw animation from stock deck into human hand
        this.animateCardFlyDraw(this.domStockCardTop, this.domHands[0], card, true, () => {
            this.players[0].hand.push(card);
            this.turnPhase = 'AWAITING_DISCARD';
            this.domTurnInstruction.textContent = 'Pilih 1 kartu di tanganmu lalu buang ke tumpukan buangan.';

            if (this.domDiscardDeckArea) {
                this.domDiscardDeckArea.classList.add('discard-target-active');
            }

            this.renderPlayerHand(true);
            this.updatePlayerTelemetry();
            this.isProcessing = false;
        });
    }

    handlePlayerDrawDiscard() {
        if (this.discardPile.length === 0) return;

        this.isProcessing = true;
        this.domStockCardTop.classList.remove('clickable');
        this.domTakeDiscardBtn.disabled = true;
        this.domKnockBtn.disabled = true;

        const card = this.discardPile.pop();
        this.logActivity(`Kamu mengambil ${card.rank}${card.suit.symbol} dari tumpukan buangan.`);

        // Trigger flying draw animation from discard pile into human hand
        this.animateCardFlyDraw(this.domDiscardPile, this.domHands[0], card, true, () => {
            this.renderDiscardPile();
            this.players[0].hand.push(card);
            this.turnPhase = 'AWAITING_DISCARD';
            this.domTurnInstruction.textContent = 'Pilih 1 kartu di tanganmu lalu buang ke tumpukan buangan.';

            if (this.domDiscardDeckArea) {
                this.domDiscardDeckArea.classList.add('discard-target-active');
            }

            this.renderPlayerHand(true);
            this.updatePlayerTelemetry();
            this.isProcessing = false;
        });
    }

    /**
     * Smooth 3D flying draw card animation from deck/discard into hand
     */
    animateCardFlyDraw(sourceEl, targetEl, card, isFaceUp, callback) {
        if (!sourceEl || !targetEl) {
            if (callback) callback();
            return;
        }

        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        const flyer = document.createElement('div');
        flyer.className = 'flying-draw-card';
        flyer.innerHTML = card.renderHTML(isFaceUp, 'flying-card-inner');

        const startX = sourceRect.left + (sourceRect.width - (sourceRect.width || 90)) / 2;
        const startY = sourceRect.top;
        const targetX = targetRect.left + (targetRect.width - (sourceRect.width || 90)) / 2;
        const targetY = targetRect.top + (targetRect.height - (sourceRect.height || 130)) / 2;

        flyer.style.left = `${startX}px`;
        flyer.style.top = `${startY}px`;
        flyer.style.transform = isFaceUp ? 'scale(0.9) rotate(0deg)' : 'scale(0.85) rotateY(180deg)';
        document.body.appendChild(flyer);

        sounds.playCardDraw();

        // Force browser reflow
        void flyer.offsetWidth;

        // Fly to target hand position
        flyer.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(${isFaceUp ? 1.05 : 0.85}) rotate(${isFaceUp ? 0 : 5}deg)`;

        setTimeout(() => {
            flyer.style.opacity = '0';
            setTimeout(() => {
                if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
            }, 60);

            if (typeof callback === 'function') {
                callback();
            }
        }, 360);
    }

    /**
     * Smooth 3D flying card animation from source element to discard pile
     */
    animateCardFlyToDiscard(sourceEl, card, authorName, callback) {
        if (!sourceEl || !this.domDiscardPile) {
            if (callback) callback();
            return;
        }

        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = this.domDiscardPile.getBoundingClientRect();

        // Create flying clone
        const flyer = document.createElement('div');
        flyer.className = 'flying-discard-card';
        flyer.innerHTML = card.renderHTML(true, 'flying-card-inner');
        
        const startX = sourceRect.left + (sourceRect.width - targetRect.width) / 2;
        const startY = sourceRect.top + (sourceRect.height - targetRect.height) / 2;
        const targetX = targetRect.left;
        const targetY = targetRect.top;

        flyer.style.left = `${startX}px`;
        flyer.style.top = `${startY}px`;
        flyer.style.transform = 'scale(0.92) rotate(-8deg)';
        document.body.appendChild(flyer);

        sounds.playCardDiscard();

        // Force browser reflow to register starting point
        void flyer.offsetWidth;

        // Animate to target with smooth bezier arc and rotation
        const randomRot = (Math.random() * 10 - 5);
        flyer.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(1.04) rotate(${randomRot}deg)`;

        setTimeout(() => {
            flyer.style.opacity = '0';
            setTimeout(() => {
                if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
            }, 60);

            // Update last discard tag
            if (this.domLastDiscardTag && this.domLastDiscardText) {
                this.domLastDiscardText.innerHTML = `<strong>${authorName}</strong>: ${card.rank}${card.suit.symbol}`;
                this.domLastDiscardTag.style.display = 'inline-flex';
            }

            if (typeof callback === 'function') {
                callback();
            }
        }, 400);
    }

    handlePlayerDiscard() {
        if (!this.selectedCardId) return;

        const cardIndex = this.players[0].hand.findIndex(c => c.id === this.selectedCardId);
        if (cardIndex === -1) return;

        this.isProcessing = true;
        if (this.domDiscardDeckArea) {
            this.domDiscardDeckArea.classList.remove('discard-target-active');
        }

        // Get source DOM element before removing from hand
        const selectedCardEl = this.domHands[0].querySelector(`[data-card-id="${this.selectedCardId}"]`) || this.domSeats[0];
        const discardedCard = this.players[0].hand.splice(cardIndex, 1)[0];
        
        this.selectedCardId = null;
        this.renderPlayerHand();
        this.updatePlayerTelemetry();
        this.domDiscardBtn.disabled = true;

        this.logActivity(`Kamu membuang ${discardedCard.rank}${discardedCard.suit.symbol}...`);

        // Trigger flying card visual animation
        this.animateCardFlyToDiscard(selectedCardEl, discardedCard, 'Kamu', () => {
            this.discardPile.push(discardedCard);
            this.renderDiscardPile(true);

            // Check 41 for player
            const scoreObj = evaluateHandScore(this.players[0].hand);
            if (scoreObj.isFortyOne) {
                sounds.playFortyOneExplosion();
                this.logActivity(`FORTY ONE! Kamu berhasil mencapai 41 POIN!`);
                this.endRound(`KAMU MENCAPAI 41 POIN!`);
                return;
            }

            // Check if deck is empty
            if (this.deck.remaining() === 0) {
                this.logActivity('Deck habis! Menghitung skor akhir...');
                this.endRound('Kartu di deck telah habis!');
                return;
            }

            this.isProcessing = false;
            this.nextTurn();
        });
    }

    runCPUTurn(cpuPlayer) {
        const cpuIndex = cpuPlayer.id;
        const topDiscard = this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1] : null;

        this.showCpuBubble(cpuIndex, 'Sedang berpikir...');

        setTimeout(() => {
            // Decision: Draw
            const drawSource = cpuPlayer.decideDrawSource(topDiscard);
            let drawnCard = null;

            const handleCpuDiscardStep = () => {
                setTimeout(() => {
                    const cardToDiscard = cpuPlayer.decideDiscardCard();
                    if (cardToDiscard) {
                        const idx = cpuPlayer.hand.findIndex(c => c.id === cardToDiscard.id);
                        if (idx !== -1) {
                            cpuPlayer.hand.splice(idx, 1);
                        }
                        this.renderCpuHand(cpuIndex);
                        this.showCpuBubble(cpuIndex, cpuPlayer.getReactionText('discard', `${cardToDiscard.rank}${cardToDiscard.suit.symbol}`));
                        this.logActivity(`${cpuPlayer.name} membuang ${cardToDiscard.rank}${cardToDiscard.suit.symbol}...`);

                        const cpuSeatEl = this.domHands[cpuIndex] || this.domSeats[cpuIndex];

                        // Trigger flying card visual animation for CPU
                        this.animateCardFlyToDiscard(cpuSeatEl, cardToDiscard, cpuPlayer.name, () => {
                            this.discardPile.push(cardToDiscard);
                            this.renderDiscardPile(true);

                            // Check 41 for CPU
                            const cpuScore = evaluateHandScore(cpuPlayer.hand);
                            if (cpuScore.isFortyOne) {
                                sounds.playFortyOneExplosion();
                                this.logActivity(`FORTY ONE! ${cpuPlayer.name} mencapai 41 POIN!`);
                                this.endRound(`${cpuPlayer.name} Mencapai 41 Poin!`);
                                return;
                            }

                            // Check deck count
                            if (this.deck.remaining() === 0) {
                                this.logActivity('Deck habis! Menghitung skor akhir...');
                                this.endRound('Kartu di deck telah habis!');
                                return;
                            }

                            setTimeout(() => {
                                this.hideCpuBubble(cpuIndex);
                                this.nextTurn();
                            }, 500);
                        });
                    } else {
                        this.nextTurn();
                    }
                }, 750);
            };

            if (drawSource === 'discard' && this.discardPile.length > 0) {
                drawnCard = this.discardPile.pop();
                this.showCpuBubble(cpuIndex, cpuPlayer.getReactionText('draw_discard', `${drawnCard.rank}${drawnCard.suit.symbol}`));
                this.logActivity(`${cpuPlayer.name} mengambil ${drawnCard.rank}${drawnCard.suit.symbol} dari tumpukan buangan.`);

                // Animate draw from discard into CPU hand
                this.animateCardFlyDraw(this.domDiscardPile, this.domHands[cpuIndex], drawnCard, true, () => {
                    this.renderDiscardPile();
                    cpuPlayer.hand.push(drawnCard);
                    this.renderCpuHand(cpuIndex);
                    handleCpuDiscardStep();
                });
            } else {
                if (this.deck.remaining() === 0) {
                    this.endRound('Kartu di deck telah habis!');
                    return;
                }
                drawnCard = this.deck.draw();
                this.updateDeckCount();
                this.showCpuBubble(cpuIndex, cpuPlayer.getReactionText('draw_stock'));
                this.logActivity(`${cpuPlayer.name} menarik kartu dari Deck (Cangkul)...`);

                // Animate draw from stock deck into CPU hand
                this.animateCardFlyDraw(this.domStockCardTop, this.domHands[cpuIndex], drawnCard, false, () => {
                    cpuPlayer.hand.push(drawnCard);
                    this.renderCpuHand(cpuIndex);
                    handleCpuDiscardStep();
                });
            }
        }, 900);
    }

    nextTurn() {
        this.turnIndex = (this.turnIndex + 1) % this.players.length;
        this.startTurn();
    }

    updateActiveSeatUI() {
        this.domSeats.forEach((seat, idx) => {
            if (idx === this.turnIndex) {
                seat.classList.add('active-turn');
            } else {
                seat.classList.remove('active-turn');
            }
        });
    }

    showCpuBubble(cpuIndex, text) {
        const bubble = this.domCpuBubbles[cpuIndex];
        if (bubble) {
            bubble.textContent = text;
            bubble.classList.add('visible');
        }
    }

    hideCpuBubble(cpuIndex) {
        const bubble = this.domCpuBubbles[cpuIndex];
        if (bubble) {
            bubble.classList.remove('visible');
        }
    }

    renderAll() {
        this.renderHands();
        this.renderDiscardPile();
        this.updateDeckCount();
        this.updatePlayerTelemetry();
        this.updateCumulativeScores();
    }

    renderHands(revealAll = false) {
        this.renderPlayerHand();
        for (let i = 1; i <= 3; i++) {
            this.renderCpuHand(i, revealAll);
        }
    }

    renderPlayerHand(justDrawn = false) {
        const player = this.players[0];
        let html = '';

        player.hand.forEach((card, index) => {
            const isSelected = card.id === this.selectedCardId;
            const extraClass = (isSelected ? 'selected ' : '') + (justDrawn && index === player.hand.length - 1 ? 'just-drawn' : '');
            html += card.renderHTML(true, extraClass);
        });

        this.domHands[0].innerHTML = html;

        // Attach click listeners to player cards
        const cardElements = this.domHands[0].querySelectorAll('.game-card');
        cardElements.forEach(el => {
            el.addEventListener('click', () => {
                if (this.turnPhase === 'AWAITING_DISCARD') {
                    const cardId = el.getAttribute('data-card-id');
                    this.selectCard(cardId);
                }
            });
        });
    }

    selectCard(cardId) {
        if (this.selectedCardId === cardId) {
            // Double click / second click can confirm discard
            this.handlePlayerDiscard();
            return;
        }

        this.selectedCardId = cardId;
        sounds.playCardSelect();
        this.renderPlayerHand();
        this.domDiscardBtn.disabled = false;
    }

    renderCpuHand(cpuIndex, reveal = false) {
        const cpuPlayer = this.players[cpuIndex];
        let html = '';

        cpuPlayer.hand.forEach(card => {
            html += card.renderHTML(reveal, '');
        });

        this.domHands[cpuIndex].innerHTML = html;
    }

    renderDiscardPile(isNewCardLanded = false) {
        if (this.discardPile.length === 0) {
            this.domDiscardPile.innerHTML = '<div class="discard-placeholder">KOSONG</div>';
            this.domTakeDiscardBtn.disabled = true;
            if (this.domLastDiscardTag) {
                this.domLastDiscardTag.style.display = 'none';
            }
        } else {
            const topCard = this.discardPile[this.discardPile.length - 1];
            const landClass = isNewCardLanded ? 'discard-top-card card-land-pop' : 'discard-top-card';
            this.domDiscardPile.innerHTML = topCard.renderHTML(true, landClass);

            if (this.turnIndex === 0 && this.turnPhase === 'AWAITING_DRAW') {
                this.domTakeDiscardBtn.disabled = false;
            }
        }
    }

    updateDeckCount() {
        const count = this.deck.remaining();
        this.domCardsLeftCount.textContent = count;
        if (count === 0) {
            this.domStockCardTop.style.opacity = '0.3';
            this.domStockCardTop.classList.remove('clickable');
        } else {
            this.domStockCardTop.style.opacity = '1';
        }
    }

    updatePlayerTelemetry() {
        const player = this.players[0];
        const scoreObj = evaluateHandScore(player.hand);

        this.domUserPoints.textContent = scoreObj.netScore;
        this.domTelemetrySpades.textContent = scoreObj.suitTotals.spades;
        this.domTelemetryHearts.textContent = scoreObj.suitTotals.hearts;
        this.domTelemetryClubs.textContent = scoreObj.suitTotals.clubs;
        this.domTelemetryDiamonds.textContent = scoreObj.suitTotals.diamonds;

        // Highlight dominant suit
        document.querySelectorAll('.suit-badge').forEach(b => b.classList.remove('dominant'));
        if (scoreObj.dominantSuit) {
            const domBadge = document.getElementById(`telemetry-${scoreObj.dominantSuit.id}`);
            if (domBadge) domBadge.classList.add('dominant');
        }
    }

    updateCumulativeScores() {
        this.domPlayerCumulative.textContent = this.players[0].cumulativeScore;
        for (let i = 1; i <= 3; i++) {
            if (this.domCpuScores[i]) {
                this.domCpuScores[i].textContent = `${this.players[i].cumulativeScore} Pts`;
            }
        }
    }

    logActivity(message) {
        this.domLiveLog.textContent = message;
    }

    endRound(reasonText = '') {
        this.turnPhase = 'ROUND_OVER';
        this.isProcessing = true;

        // Reveal all hands
        this.renderHands(true);

        // Calculate scores for all players
        const results = this.players.map(player => {
            const scoreObj = evaluateHandScore(player.hand);
            return {
                player: player,
                scoreObj: scoreObj,
                netScore: scoreObj.netScore,
                isFortyOne: scoreObj.isFortyOne
            };
        });

        // Sort descending by net score (41 always top)
        results.sort((a, b) => {
            if (a.isFortyOne && !b.isFortyOne) return -1;
            if (!a.isFortyOne && b.isFortyOne) return 1;
            return b.netScore - a.netScore;
        });

        // Award cumulative points (1st place gets +100 bonus, others get their net score)
        results.forEach((res, rank) => {
            const pointsEarned = res.netScore + (rank === 0 ? 50 : 0);
            res.player.cumulativeScore += Math.max(0, pointsEarned);
        });

        this.updateCumulativeScores();

        const winner = results[0];
        const isUserWinner = winner.player.isHuman;

        if (isUserWinner) {
            sounds.playVictory();
            this.startConfetti();
        } else {
            sounds.playCardDiscard();
        }

        // Show Game Over Modal
        this.domGameOverTitle.textContent = isUserWinner ? 'KAMU MENANG!' : `${winner.player.name.toUpperCase()} MENANG!`;
        this.domGameOverSubtitle.textContent = reasonText || `Pemenang ronde ini adalah ${winner.player.name}!`;
        this.domGameOverCrown.style.display = isUserWinner ? 'block' : 'block';

        let tbodyHtml = '';
        results.forEach((res, idx) => {
            const isWinner = idx === 0;
            const rankMedal = idx === 0 ? '🥇 #1' : (idx === 1 ? '🥈 #2' : (idx === 2 ? '🥉 #3' : '4'));
            
            let miniCardsHtml = '<div class="mini-hand-preview">';
            res.player.hand.forEach(c => {
                miniCardsHtml += `<span class="mini-card-tag ${c.suit.colorClass}">${c.rank}${c.suit.symbol}</span>`;
            });
            miniCardsHtml += '</div>';

            const suitInfo = res.scoreObj.dominantSuit 
                ? `${res.scoreObj.dominantSuit.symbol} ${res.scoreObj.dominantSuit.name} (${res.scoreObj.dominantSum} pts)` 
                : '-';

            tbodyHtml += `
                <tr class="${isWinner ? 'winner-row' : ''}">
                    <td>${rankMedal}</td>
                    <td><strong>${res.player.name}</strong></td>
                    <td>${suitInfo}</td>
                    <td>${miniCardsHtml}</td>
                    <td><strong>${res.isFortyOne ? '41 (MAX!)' : res.netScore}</strong></td>
                </tr>
            `;
        });

        this.domGameOverTbody.innerHTML = tbodyHtml;
        
        setTimeout(() => {
            this.domGameOverModal.classList.add('active');
        }, 1000);
    }

    showRulesModal() {
        this.domRulesModal.classList.add('active');
    }

    hideRulesModal() {
        this.domRulesModal.classList.remove('active');
    }

    showDisclaimerModal() {
        if (this.domDisclaimerModal) {
            this.domDisclaimerModal.classList.add('active');
            sounds.playClick();
        }
    }

    hideDisclaimerModal() {
        if (this.domDisclaimerModal) {
            this.domDisclaimerModal.classList.remove('active');
            sounds.playClick();
        }
    }

    /* Confetti Particle Engine */
    initConfetti() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isConfettiActive = false;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    startConfetti() {
        this.particles = [];
        const colors = ['#ffd700', '#d4af37', '#e63946', '#22c55e', '#38bdf8', '#ffffff'];
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                w: Math.random() * 10 + 6,
                h: Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.7) * 16,
                gravity: 0.25,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }
        this.isConfettiActive = true;
        this.animateConfetti();
    }

    animateConfetti() {
        if (!this.isConfettiActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let activeCount = 0;

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotSpeed;
            p.opacity -= 0.005;

            if (p.opacity > 0 && p.y < this.canvas.height + 50) {
                activeCount++;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                this.ctx.restore();
            }
        });

        if (activeCount > 0) {
            requestAnimationFrame(() => this.animateConfetti());
        } else {
            this.isConfettiActive = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    showMainMenu() {
        if (this.domScreenMainMenu) {
            this.domScreenMainMenu.classList.add('active');
        }
        if (this.domScreenGame) {
            this.domScreenGame.classList.remove('active');
        }
    }

    showGameScreen() {
        if (this.domDisclaimerModal) {
            this.domDisclaimerModal.classList.remove('active');
        }
        if (this.domScreenMainMenu) {
            this.domScreenMainMenu.classList.remove('active');
        }
        if (this.domScreenGame) {
            this.domScreenGame.classList.add('active');
        }
    }

    syncSoundButtons(isEnabled) {
        if (this.domSoundBtn) {
            this.domSoundBtn.innerHTML = isEnabled 
                ? '<i class="fa-solid fa-volume-high"></i>' 
                : '<i class="fa-solid fa-volume-xmark"></i>';
        }
        if (this.domBtnMenuSound) {
            this.domBtnMenuSound.innerHTML = isEnabled
                ? '<i class="fa-solid fa-volume-high"></i> Suara: ON'
                : '<i class="fa-solid fa-volume-xmark"></i> Suara: OFF';
        }
    }

    /**
     * Toggles fullscreen mode across all standard and vendor-prefixed browser APIs
     */
    toggleFullscreen() {
        const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (!isFull) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    /**
     * Synchronizes fullscreen button icons and labels with the active browser display state
     */
    syncFullscreenButtons() {
        const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        
        if (this.domFullscreenBtn) {
            this.domFullscreenBtn.innerHTML = isFull
                ? '<i class="fa-solid fa-compress"></i>'
                : '<i class="fa-solid fa-expand"></i>';
            this.domFullscreenBtn.title = isFull ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)';
        }

        if (this.domBtnMenuFullscreen) {
            this.domBtnMenuFullscreen.innerHTML = isFull
                ? '<i class="fa-solid fa-compress text-gold"></i> Normal'
                : '<i class="fa-solid fa-expand"></i> Fullscreen';
            this.domBtnMenuFullscreen.title = isFull ? 'Keluar Layar Penuh' : 'Layar Penuh (Fullscreen)';
        }
    }
}

// Instantiate game when DOM is loaded (starts on Main Menu)
window.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();
});

