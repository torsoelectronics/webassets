let turingSketch = (s) => {
  let penta = [0, 3, 5, 7, 9];
  let seqs = [];

  class DrumSynth {
    constructor() {
      Tone.loaded().then(() => {
        let snds = [
          "https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_tom.wav",
          "https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_pluck.wav",
          "https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_kick.wav",
          "https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_hats.wav",
          "https://torsoelectronics.com/downloads/t-1/assets/909/CLAP2.WAV",
        ];
        this.players = snds.map((p) => new Tone.Player(p).toDestination());
        this.players[3].volume.param = -32;
      });
    }

    onUpdate(value, time) {
      let sel = Math.floor(value * this.players.length);
      this.players[sel].start(time);
    }
  }

  class Sampler {
    constructor(sample) {
      Tone.loaded().then(() => {
        let snd =
          "https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_tom.wav";
        this.player = new Tone.Player(snd).toDestination();
        this.player.volume.value = -6;
      });
    }

    onUpdate(value, time) {
      let midi = 69 + penta[Math.round(value * 5)];
      this.player.playbackRate =
        Tone.Frequency(midi, "midi").toFrequency(midi) / 440.0;
      this.player.start(time);
    }
  }

  class Sampler2 {
    constructor(sample) {
      Tone.loaded().then(() => {
        let snd =
          "https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_pluck.wav";
        this.player = new Tone.Player(snd).toDestination();
        this.player.volume.value = -6;
      });
    }

    onUpdate(value, time) {
      let midi = 69 + penta[Math.round(value * 5)];
      this.player.playbackRate =
        Tone.Frequency(midi, "midi").toFrequency(midi) / 440.0;
      this.player.start(time);
    }
  }



  class ToneSynth {
    constructor() {
      Tone.loaded().then(() => {
        const reverb = new Tone.Reverb(0.5).toDestination();
        this.osc = new Tone.PluckSynth().toDestination().connect(reverb);
        this.osc.volume.value = 4;
      });
    }

    onUpdate(value, time) {
      let midi = 60 + penta[Math.round(value * 5)];
      this.osc.triggerAttackRelease(
        Tone.Frequency(midi, "midi").toFrequency(midi),
        "8n",
        time
      );
    }
  }

  class Sequence extends Grid {
    constructor(options) {
      super({
        p5: options.p5,
        x: options.x,
        y: options.y,
        nx: options.nx,
        ny: options.ny,
        gridSize: options.gridSize,
        margin: options.margin,
        radius: 4.0,
        defaultColor: options.p5.color(230),
      });

      this.x = options.x;
      this.y = options.y;
      this.c = options.c;
      this.generator = options.generator;
      this.gridSizeX = options.gridSize;
      this.gridSizeY = options.gridSize;
      this.playing = false;
      this.mouseOver = false;
      this.p5 = options.p5;
      this.boxSizeX = this.nx * this.gridSizeX;
      this.boxSizeY = this.ny * this.gridSizeY;

      this.hasPlayed = false;

      this.clk = 0;
      this.data = [];
      for (let i = 0; i < this.ny; ++i) {
        this.data[i] = Math.floor(Math.random() * 5) / 5;
      }

      // let button = this.p5.createButton('play');
      // button.position(this.x, 400);
      // let testimg = this.p5.image(mute,this.x,450,30,30);
      // testimg.addClass("mute-icon");
      // button.mouseClicked(() => {
      //   this.togglePlaying();
      // });
    }

    update(time) {
      if (this.playing) {
        this.generator.onUpdate(this.data[this.clk], time);

        if (Math.random() < 0.2) {
          this.data[this.clk] = Math.floor(Math.random() * 5) / 5;
        }
      }

      this.clk = this.clk + 1;
      if (this.clk < 0) {
        this.clk = this.ny - 1;
      }

      if (this.clk >= this.ny) {
        this.clk = 0;
      }
    }

    togglePlaying() {
      this.playing = !this.playing;
      if (this.playing) {
        this.hasPlayed = true;
      }
    }

    clicked() {
      if (this.mouseOver) {
        this.togglePlaying();
      }
    }

    isMouseOver() {
      if (
        this.p5.mouseX > this.x &&
        this.p5.mouseX < this.x + this.boxSizeX &&
        this.p5.mouseY > this.y &&
        this.p5.mouseY < this.y + this.boxSizeY
      ) {
        this.mouseOver = true;
      } else {
        this.mouseOver = false;
      }
      return this.mouseOver;
    }

    draw() {
      super.draw();

      if (!this.mouseOver) {
        this.hasPlayed = false;
      }

      for (let i = 0; i < this.ny; ++i) {
        let offColor;
        if (this.mouseOver && !(!this.playing && this.hasPlayed)) {
          offColor = this.c;
        } else if (this.playing) {
          offColor = s.lerpColor(this.c, s.color(255), 0.2);
        } else {
          offColor = s.color(210);
        }
        // offColor = this.mouseOver ? offColor : this.defaultColor;
        let onColor = this.playing ? s.color(120) : offColor;
        let clr = i == this.clk ? onColor : offColor;
        this.setColor(Math.round(this.data[i] * 5), i, clr);
      }
    }
  }

  s.setup = () => {
    let xSteps = 5;
    let ySteps = 8;
    let gridSize = 50;
    let margin = 3;

    let parentWidth = document.getElementById("interactive-turing").offsetWidth;
    let seqWidth = xSteps * gridSize;
    let maxNumSeqs = 3; // TODO: dynamic relative to parent width, i.e. scale
    // for phone/tablet
    let numSeqs = Math.min(Math.floor(parentWidth / seqWidth), maxNumSeqs);
    // numSeqs = 3;
    let seqGap;
    if (numSeqs > 1) {
      seqGap = (parentWidth - numSeqs * seqWidth + margin * 2) / (numSeqs - 1);
    } else {
      seqGap = (parentWidth - seqWidth) / 2;
    }

    s.createCanvas(parentWidth, 400);

    let colors = [s.color("#EE8F38"), s.color("#65D1B1"), s.color("#ED8DE9")];

    let generators = [
      // (v) => new DrumSynth(),
      (v) => new Sampler2(),
      (v) => new Sampler(),
      (v) => new ToneSynth(),
    ];

    for (let i = 0; i < numSeqs; ++i) {
      seqs.push(
        new Sequence({
          p5: s,
          x: numSeqs == 1 ? seqGap + margin : (seqGap + seqWidth) * i,
          y: 0,
          nx: xSteps,
          ny: ySteps,
          gridSize: gridSize,
          c: colors[i % colors.length],
          margin: margin,
          generator: generators[i % generators.length](),
        })
      );
    }

    let clickedOnce = false;
    document.addEventListener("click", async () => {
      if (!clickedOnce) {
        clickedOnce = true;
        StartAudioContext(Tone.context);
        await Tone.start();

        Tone.Transport.scheduleRepeat((time) => {
          for (let i = 0; i < numSeqs; ++i) {
            seqs[i].update(time);
          }
        }, "16n");

        Tone.Transport.start();
        Tone.Transport.set({ bpm: 85 });
      }
    });
  };

  s.draw = () => {
    let mouseOver = 0;
    for (let i = 0; i < seqs.length; ++i) {
      seqs[i].draw();
      mouseOver += seqs[i].isMouseOver();
    }
    if (mouseOver) {
      s.cursor(s.HAND);
    } else {
      s.cursor(s.ARROW);
    }
  };

  s.mouseClicked = () => {
    seqs.forEach((s) => {
      s.clicked();
    });
  };
};

let turingWidget = new p5(turingSketch, "interactive-turing");
