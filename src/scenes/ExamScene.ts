import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, LEVELS } from '../utils/Constants';
import { SaveManager } from '../utils/SaveManager';

interface Question {
  subject: string;
  level: 'HL' | 'SL' | 'Core';
  question: string;
  options: string[];
  correctIndex: number;
}

export class ExamScene extends Phaser.Scene {
  private questions: Question[] = [];
  private currentQuestionIndex: number = 0;
  private correctAnswers: number = 0;
  private totalQuestions: number = 0;
  private selectedOption: number = -1;
  private answered: boolean = false;
  private examStarted: boolean = false;
  private examFinished: boolean = false;

  private questionText!: Phaser.GameObjects.Text;
  private subjectText!: Phaser.GameObjects.Text;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private optionBackgrounds: Phaser.GameObjects.Graphics[] = [];
  private progressText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.EXAM });
  }

  create(): void {
    this.resetState();
    this.loadQuestions();
    this.createExamRoom();
    this.playIntro();
  }

  private resetState(): void {
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.selectedOption = -1;
    this.answered = false;
    this.examStarted = false;
    this.examFinished = false;
    this.optionTexts = [];
    this.optionBackgrounds = [];
  }

  private loadQuestions(): void {
    // IB-level questions for each subject
    this.questions = [
      // Literature (Higher Level)
      {
        subject: 'English Literature',
        level: 'HL',
        question: 'In Shakespeare\'s Hamlet, what literary device is used when Hamlet says "To be or not to be"?',
        options: ['Metaphor', 'Soliloquy', 'Simile', 'Allegory'],
        correctIndex: 1,
      },
      {
        subject: 'English Literature',
        level: 'HL',
        question: 'In Thomas Hardy\'s "Tess of the d\'Urbervilles", what does the colour red symbolise throughout the novel?',
        options: ['Wealth and prosperity', 'Passion, sin, and bloodshed', 'Nature and growth', 'Purity and innocence'],
        correctIndex: 1,
      },

      // History (Standard Level)
      {
        subject: 'History',
        level: 'SL',
        question: 'The Treaty of Versailles (1919) primarily blamed which country for World War I?',
        options: ['Austria-Hungary', 'Ottoman Empire', 'Germany', 'Russia'],
        correctIndex: 2,
      },
      {
        subject: 'History',
        level: 'SL',
        question: 'Which event marked the beginning of the Cold War era?',
        options: ['Berlin Wall construction', 'Yalta Conference', 'Cuban Missile Crisis', 'Iron Curtain speech'],
        correctIndex: 3,
      },

      // Biology (Higher Level)
      {
        subject: 'Biology',
        level: 'HL',
        question: 'During the Krebs cycle, how many molecules of ATP are directly produced per glucose molecule?',
        options: ['2 ATP', '4 ATP', '34 ATP', '38 ATP'],
        correctIndex: 0,
      },
      {
        subject: 'Biology',
        level: 'HL',
        question: 'Which enzyme unwinds the DNA double helix during replication?',
        options: ['DNA polymerase', 'Ligase', 'Helicase', 'Primase'],
        correctIndex: 2,
      },

      // Chemistry (Higher Level)
      {
        subject: 'Chemistry',
        level: 'HL',
        question: 'What is the hybridization of the central carbon in ethene (C2H4)?',
        options: ['sp', 'sp2', 'sp3', 'sp3d'],
        correctIndex: 1,
      },
      {
        subject: 'Chemistry',
        level: 'HL',
        question: 'In an electrochemical cell, reduction occurs at which electrode?',
        options: ['Anode', 'Cathode', 'Salt bridge', 'Both electrodes'],
        correctIndex: 1,
      },

      // Maths (Standard Level)
      {
        subject: 'Mathematics',
        level: 'SL',
        question: 'What is the derivative of ln(x)?',
        options: ['x', '1/x', 'e^x', 'x ln(x)'],
        correctIndex: 1,
      },
      {
        subject: 'Mathematics',
        level: 'SL',
        question: 'If f(x) = x^2 - 4x + 3, what are the roots of the equation f(x) = 0?',
        options: ['x = 1, x = 3', 'x = -1, x = -3', 'x = 2, x = 2', 'x = 0, x = 4'],
        correctIndex: 0,
      },

      // German (Standard Level)
      {
        subject: 'German',
        level: 'SL',
        question: 'What is the correct German translation of "I have been living here for three years"?',
        options: [
          'Ich habe hier seit drei Jahren gelebt',
          'Ich wohne hier seit drei Jahren',
          'Ich lebte hier drei Jahre',
          'Ich werde hier drei Jahre wohnen'
        ],
        correctIndex: 1,
      },
      {
        subject: 'German',
        level: 'SL',
        question: 'Which case does the preposition "mit" require in German?',
        options: ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'],
        correctIndex: 2,
      },

      // Theory of Knowledge (bonus)
      {
        subject: 'Theory of Knowledge',
        level: 'Core',
        question: 'Which of these is NOT considered a primary "Way of Knowing" in TOK?',
        options: ['Reason', 'Emotion', 'Technology', 'Perception'],
        correctIndex: 2,
      },
    ];

    // Shuffle questions
    this.questions = Phaser.Utils.Array.Shuffle(this.questions);
    this.totalQuestions = this.questions.length;
  }

  private createExamRoom(): void {
    const graphics = this.add.graphics();

    // Classroom wall (cream/beige)
    graphics.fillStyle(0xf5f5dc, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Desk surface (wooden brown) - large, takes up bottom portion
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, GAME_HEIGHT - 100, GAME_WIDTH, 100);

    // Desk wood grain lines
    graphics.lineStyle(1, 0x6b3510, 0.3);
    for (let y = GAME_HEIGHT - 95; y < GAME_HEIGHT; y += 8) {
      graphics.lineBetween(0, y, GAME_WIDTH, y + Math.sin(y) * 2);
    }

    // Exam paper (white rectangle on desk)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(GAME_WIDTH / 2 - 180, GAME_HEIGHT - 95, 360, 85);

    // Paper shadow
    graphics.fillStyle(0x000000, 0.1);
    graphics.fillRect(GAME_WIDTH / 2 - 177, GAME_HEIGHT - 92, 360, 85);

    // Paper lines
    graphics.lineStyle(1, 0xcccccc, 0.5);
    for (let y = GAME_HEIGHT - 85; y < GAME_HEIGHT - 15; y += 8) {
      graphics.lineBetween(GAME_WIDTH / 2 - 170, y, GAME_WIDTH / 2 + 170, y);
    }

    // Pencil on desk
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(GAME_WIDTH - 80, GAME_HEIGHT - 40, 60, 6);
    graphics.fillStyle(0xffb6c1, 1);
    graphics.fillRect(GAME_WIDTH - 80, GAME_HEIGHT - 40, 8, 6);
    graphics.fillStyle(0x2f2f2f, 1);
    graphics.fillTriangle(
      GAME_WIDTH - 20, GAME_HEIGHT - 37,
      GAME_WIDTH - 12, GAME_HEIGHT - 37,
      GAME_WIDTH - 16, GAME_HEIGHT - 33
    );

    // Clock on wall
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(GAME_WIDTH - 40, 30, 20);
    graphics.lineStyle(2, 0x333333);
    graphics.strokeCircle(GAME_WIDTH - 40, 30, 20);
    // Clock hands
    graphics.lineStyle(2, 0x333333);
    graphics.lineBetween(GAME_WIDTH - 40, 30, GAME_WIDTH - 40, 18); // minute
    graphics.lineBetween(GAME_WIDTH - 40, 30, GAME_WIDTH - 32, 30); // hour

    // "IB DIPLOMA EXAMINATION" header
    const header = this.add.text(GAME_WIDTH / 2, 20, 'IB DIPLOMA EXAMINATION', {
      fontSize: '14px',
      color: '#1a1a8c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    header.setOrigin(0.5);

    // Subject indicator
    this.subjectText = this.add.text(GAME_WIDTH / 2, 40, '', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: 'monospace',
    });
    this.subjectText.setOrigin(0.5);

    // Progress indicator
    this.progressText = this.add.text(20, 20, '', {
      fontSize: '10px',
      color: '#333333',
      fontFamily: 'monospace',
    });

    // Score indicator
    this.scoreText = this.add.text(20, 35, '', {
      fontSize: '10px',
      color: '#27ae60',
      fontFamily: 'monospace',
    });

    // Question text area
    this.questionText = this.add.text(GAME_WIDTH / 2, 70, '', {
      fontSize: '9px',
      color: '#1a1a1a',
      fontFamily: 'monospace',
      wordWrap: { width: 400 },
      align: 'center',
    });
    this.questionText.setOrigin(0.5, 0);

    // Create option backgrounds and texts
    for (let i = 0; i < 4; i++) {
      const yPos = 115 + i * 28;

      const bg = this.add.graphics();
      bg.fillStyle(0xe8e8e8, 1);
      bg.fillRoundedRect(GAME_WIDTH / 2 - 180, yPos, 360, 24, 4);
      this.optionBackgrounds.push(bg);

      const optionLabel = this.add.text(GAME_WIDTH / 2 - 170, yPos + 12, `${String.fromCharCode(65 + i)}.`, {
        fontSize: '10px',
        color: '#333333',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      optionLabel.setOrigin(0, 0.5);

      const optionText = this.add.text(GAME_WIDTH / 2 - 150, yPos + 12, '', {
        fontSize: '9px',
        color: '#333333',
        fontFamily: 'monospace',
        wordWrap: { width: 320 },
      });
      optionText.setOrigin(0, 0.5);
      this.optionTexts.push(optionText);

      // Make clickable
      const zone = this.add.zone(GAME_WIDTH / 2, yPos + 12, 360, 24);
      zone.setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        if (!this.answered) {
          this.highlightOption(i, 0xd0d0ff);
        }
      });

      zone.on('pointerout', () => {
        if (!this.answered && this.selectedOption !== i) {
          this.highlightOption(i, 0xe8e8e8);
        }
      });

      zone.on('pointerdown', () => {
        if (!this.answered) {
          this.selectOption(i);
        }
      });
    }

    // Keyboard hints
    const hints = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, 'Press 1-4 to select | ENTER to confirm', {
      fontSize: '8px',
      color: '#666666',
      fontFamily: 'monospace',
    });
    hints.setOrigin(0.5);

    // Setup keyboard input
    this.setupInput();
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;

    // Number keys for selection
    this.input.keyboard.on('keydown-ONE', () => this.selectOption(0));
    this.input.keyboard.on('keydown-TWO', () => this.selectOption(1));
    this.input.keyboard.on('keydown-THREE', () => this.selectOption(2));
    this.input.keyboard.on('keydown-FOUR', () => this.selectOption(3));

    // Enter to confirm
    this.input.keyboard.on('keydown-ENTER', () => this.confirmAnswer());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmAnswer());
  }

  private playIntro(): void {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Intro text
    const introText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'END OF YEAR EXAMS', {
      fontSize: '20px',
      color: '#1a1a8c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    });
    introText.setOrigin(0.5);
    introText.setAlpha(0);

    const subIntro = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'You need 80% to pass!', {
      fontSize: '12px',
      color: '#e74c3c',
      fontFamily: 'monospace',
    });
    subIntro.setOrigin(0.5);
    subIntro.setAlpha(0);

    // Animate intro
    this.tweens.add({
      targets: [introText, subIntro],
      alpha: 1,
      duration: 500,
      hold: 2000,
      yoyo: true,
      onComplete: () => {
        introText.destroy();
        subIntro.destroy();
        this.examStarted = true;
        this.showQuestion();
      },
    });
  }

  private showQuestion(): void {
    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.finishExam();
      return;
    }

    const q = this.questions[this.currentQuestionIndex];

    // Update UI
    this.subjectText.setText(`${q.subject} (${q.level})`);
    this.progressText.setText(`Question ${this.currentQuestionIndex + 1}/${this.totalQuestions}`);
    this.scoreText.setText(`Score: ${this.correctAnswers}/${this.currentQuestionIndex}`);
    this.questionText.setText(q.question);

    // Update options
    q.options.forEach((option, i) => {
      this.optionTexts[i].setText(option);
      this.highlightOption(i, 0xe8e8e8);
    });

    // Reset state
    this.selectedOption = -1;
    this.answered = false;

    // Play question sound
    this.playQuestionSound();
  }

  private selectOption(index: number): void {
    if (this.answered || !this.examStarted || this.examFinished) return;

    // Clear previous selection
    if (this.selectedOption >= 0) {
      this.highlightOption(this.selectedOption, 0xe8e8e8);
    }

    // Highlight new selection
    this.selectedOption = index;
    this.highlightOption(index, 0xb0b0ff);

    this.playSelectSound();
  }

  private highlightOption(index: number, color: number): void {
    const bg = this.optionBackgrounds[index];
    bg.clear();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(GAME_WIDTH / 2 - 180, 115 + index * 28, 360, 24, 4);
  }

  private confirmAnswer(): void {
    if (this.answered || this.selectedOption < 0 || !this.examStarted || this.examFinished) return;

    this.answered = true;
    const q = this.questions[this.currentQuestionIndex];
    const isCorrect = this.selectedOption === q.correctIndex;

    if (isCorrect) {
      this.correctAnswers++;
      this.highlightOption(this.selectedOption, 0x90ee90); // Green
      this.playCorrectSound();
      this.showFeedback('Correct!', '#27ae60');
    } else {
      this.highlightOption(this.selectedOption, 0xffb6b6); // Red
      this.highlightOption(q.correctIndex, 0x90ee90); // Show correct answer
      this.playWrongSound();
      this.showFeedback('Incorrect', '#e74c3c');
    }

    // Move to next question after delay
    this.time.delayedCall(1500, () => {
      this.currentQuestionIndex++;
      this.showQuestion();
    });
  }

  private showFeedback(text: string, color: string): void {
    const feedback = this.add.text(GAME_WIDTH / 2, 55, text, {
      fontSize: '12px',
      color: color,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    feedback.setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      alpha: 0,
      y: 45,
      duration: 1000,
      onComplete: () => feedback.destroy(),
    });
  }

  private finishExam(): void {
    this.examFinished = true;

    const passThreshold = Math.ceil(this.totalQuestions * 0.8);
    const passed = this.correctAnswers >= passThreshold;
    const percentage = Math.round((this.correctAnswers / this.totalQuestions) * 100);

    // Clear question display
    this.questionText.setText('');
    this.subjectText.setText('');
    this.optionTexts.forEach(t => t.setText(''));
    this.optionBackgrounds.forEach(bg => bg.clear());

    // Results
    const resultBg = this.add.graphics();
    resultBg.fillStyle(0xffffff, 0.95);
    resultBg.fillRoundedRect(GAME_WIDTH / 2 - 150, 50, 300, 150, 10);

    const resultTitle = this.add.text(GAME_WIDTH / 2, 70, 'EXAMINATION RESULTS', {
      fontSize: '14px',
      color: '#1a1a8c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    resultTitle.setOrigin(0.5);

    const scoreDisplay = this.add.text(GAME_WIDTH / 2, 100, `Score: ${this.correctAnswers}/${this.totalQuestions} (${percentage}%)`, {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'monospace',
    });
    scoreDisplay.setOrigin(0.5);

    const passText = this.add.text(GAME_WIDTH / 2, 130, passed ? 'PASSED!' : 'FAILED', {
      fontSize: '20px',
      color: passed ? '#27ae60' : '#e74c3c',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    passText.setOrigin(0.5);

    if (passed) {
      // IB Diploma awarded message
      const diplomaText = this.add.text(GAME_WIDTH / 2, 155, 'IB Diploma Awarded!', {
        fontSize: '12px',
        color: '#ffd700',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      diplomaText.setOrigin(0.5);

      this.playVictorySound();

      // Continue prompt
      this.time.delayedCall(2000, () => {
        const continueText = this.add.text(GAME_WIDTH / 2, 180, 'Press SPACE to continue', {
          fontSize: '10px',
          color: '#666666',
          fontFamily: 'monospace',
        });
        continueText.setOrigin(0.5);

        this.tweens.add({
          targets: continueText,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1,
        });

        this.input.keyboard?.once('keydown-SPACE', () => {
          // Play graduation celebration with mortarboard hats falling
          this.playGraduationCelebration();
        });
      });
    } else {
      // Failure - restart from beginning of Varndean
      const failText = this.add.text(GAME_WIDTH / 2, 155, 'You need 80% to pass!', {
        fontSize: '10px',
        color: '#666666',
        fontFamily: 'monospace',
      });
      failText.setOrigin(0.5);

      this.playFailSound();

      this.time.delayedCall(2000, () => {
        const retryText = this.add.text(GAME_WIDTH / 2, 180, 'Press SPACE to retry Varndean', {
          fontSize: '10px',
          color: '#e74c3c',
          fontFamily: 'monospace',
        });
        retryText.setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
          // Clear checkpoint for Varndean to force restart from beginning
          SaveManager.save({ currentLevel: LEVELS.VARNDEAN, checkpointId: null });

          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.GAME, { level: LEVELS.VARNDEAN });
          });
        });
      });
    }
  }

  private playGraduationCelebration(): void {
    // Create mortarboard hat texture
    if (!this.textures.exists('mortarboard')) {
      const graphics = this.add.graphics();
      // Hat base (square top)
      graphics.fillStyle(0x1a1a1a, 1);
      graphics.fillRect(0, 0, 16, 4);
      // Hat cap
      graphics.fillStyle(0x2c2c2c, 1);
      graphics.fillRect(4, 4, 8, 6);
      // Tassel
      graphics.fillStyle(0xffd700, 1);
      graphics.fillCircle(8, 2, 2);
      graphics.lineStyle(1, 0xffd700);
      graphics.lineBetween(8, 2, 12, 8);
      graphics.generateTexture('mortarboard', 16, 12);
      graphics.destroy();
    }

    // Spawn many falling mortarboard hats
    const hats: Phaser.GameObjects.Sprite[] = [];
    for (let i = 0; i < 30; i++) {
      const hat = this.add.sprite(
        Math.random() * GAME_WIDTH,
        -20 - Math.random() * 100,
        'mortarboard'
      );
      hat.setScale(1.5);
      hat.setDepth(200);
      hats.push(hat);

      // Falling animation with rotation
      this.tweens.add({
        targets: hat,
        y: GAME_HEIGHT + 20,
        rotation: Math.random() * 4 - 2,
        duration: 2000 + Math.random() * 1500,
        delay: Math.random() * 500,
        ease: 'Quad.easeIn',
      });
    }

    // Play celebration sound
    this.playVictorySound();

    // Black screen drops in after hats start falling
    this.time.delayedCall(1500, () => {
      const blackScreen = this.add.graphics();
      blackScreen.fillStyle(0x000000, 1);
      blackScreen.fillRect(0, -GAME_HEIGHT, GAME_WIDTH, GAME_HEIGHT);
      blackScreen.setDepth(300);

      // Drop black screen down
      this.tweens.add({
        targets: blackScreen,
        y: GAME_HEIGHT,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => {
          // Save progress and transition to UCL
          SaveManager.save({ currentLevel: LEVELS.UCL, checkpointId: null });
          this.scene.start(SCENES.GAME, { level: LEVELS.UCL });
        },
      });
    });
  }

  // Sound effects
  private playQuestionSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  }

  private playSelectSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    }
  }

  private playCorrectSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const notes = [523, 659, 784];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    }
  }

  private playWrongSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.value = 150;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  }

  private playVictorySound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    }
  }

  private playFailSound(): void {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
    if (soundManager.context) {
      const ctx = soundManager.context;
      const notes = [392, 349, 311, 294];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + i * 0.2;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    }
  }
}
