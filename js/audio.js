/**
 * Web Audio API Sound Synthesizer for Card Game 41
 * Generates dynamic, crystal-clear sound effects without relying on external MP3 files.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playCardDeal() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // White noise burst for card swoosh
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.08);
    }

    playCardDraw() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playCardDiscard() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.09);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playCardSelect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.03); // A5

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
    }

    playTurnAlert() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25]; // C5, E5

        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + index * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.12, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + 0.15);
        });
    }

    playKnock() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        [0, 0.12].forEach(offset => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + offset;

            osc.type = 'square';
            osc.frequency.setValueAtTime(140, startTime);
            osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.08);

            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.08);
        });
    }

    playVictory() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Fanfare chord: C4, E4, G4, C5
        const melody = [
            { f: 523.25, d: 0.12, t: 0 },
            { f: 659.25, d: 0.12, t: 0.12 },
            { f: 783.99, d: 0.12, t: 0.24 },
            { f: 1046.50, d: 0.45, t: 0.36 }
        ];

        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + item.t;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, startTime);

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + item.d);
        });
    }

    playFortyOneExplosion() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Big royal fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.07;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.6);
        });
    }

    playCardShuffle() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const numCards = 20;
        const duration = 1.0;

        // Sequence of crisp card riffle snaps
        for (let i = 0; i < numCards; i++) {
            const timeOffset = (i / numCards) * duration + (Math.random() * 0.02 - 0.01);
            const startTime = now + Math.max(0, timeOffset);

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = i % 2 === 0 ? 'triangle' : 'square';
            const baseFreq = 280 + (i * 20) + (Math.random() * 60);
            osc.frequency.setValueAtTime(baseFreq, startTime);
            osc.frequency.exponentialRampToValueAtTime(90, startTime + 0.035);

            gain.gain.setValueAtTime(0.16, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, startTime);
            filter.Q.setValueAtTime(2, startTime);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.035);
        }

        // Final deck gathering thump & snap
        const finalTime = now + duration + 0.08;
        const thumpOsc = this.ctx.createOscillator();
        const thumpGain = this.ctx.createGain();

        thumpOsc.type = 'sine';
        thumpOsc.frequency.setValueAtTime(180, finalTime);
        thumpOsc.frequency.exponentialRampToValueAtTime(45, finalTime + 0.09);

        thumpGain.gain.setValueAtTime(0.3, finalTime);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, finalTime + 0.09);

        thumpOsc.connect(thumpGain);
        thumpGain.connect(this.ctx.destination);

        thumpOsc.start(finalTime);
        thumpOsc.stop(finalTime + 0.09);
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}

const sounds = new SoundEngine();
