let euclidSketch = (s) => {
  let penta = [0, 2, 5, 7, 8];
  let seqs = [];
  const reverb = new Tone.Reverb(2.0).toDestination();
  let arcWidth = 220;
  let strokeWeight = 15;
  let seqWidth = arcWidth + strokeWeight;
  let tooltip;
  let parentWidth;

  let defaultSteps = 8;
  let defaultPulses = 3;

  class DrumSynth {
    constructor() {
      Tone.loaded().then(() => {
        let snds = [
          'https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_perc_low.wav',
          'https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_perc_mini.wav',
          'https://torsoelectronics.com/downloads/t-1/assets/web_samples/web_sample_perc_high.wav',
        ];
        this.players = snds.map((p) => new Tone.Player(p).toDestination());
        this.players[0].volume.value = -3;
        this.players[1].volume.value = -3;
        this.players[2].volume.value = -6;
      });
    }

    onUpdate(value, time) {
      let sel = Math.floor(value * this.players.length);
      this.players[sel].start(time);
    }
  }

  class Tooltip {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.show = false;
      this.text = '';
    }

    draw() {
      if (this.show) {
        s.noStroke();
        s.textSize(20);
        s.fill(130);
        s.text(this.text, this.x, this.y, parentWidth, 400);
      }
    }
  }

  class Slider {
    constructor(x, y, w, min, max, onChange, label) {
      this.x = x;
      this.y = y;
      this.label = label;
      this._min = min;
      this._max = max;
      this._value = 8;
      this.slider = s.createSlider(this._min, this._max, this._value, 1);
      this.slider.position(this.x, this.y);
      this.slider.size(w);
      this.onChange = (val) => {
        onChange(this.slider.value());
      };

      this.slider.input(() => {
        this.value = this.slider.value();
      });
      this.slider.class('slider');

      this.slider.elt.addEventListener('mouseover', (evt) => {
        tooltip.text = this.label;
        tooltip.show = true;
      });

      this.slider.elt.addEventListener('mouseout', (evt) => {
        tooltip.text = '';
        tooltip.show = false;
      });
    }

    set max(val) {
      this._max = val;
      this.slider.elt.value = Math.min(this.slider.elt.value, this._max);
    }

    set min(val) {
      this._min = val;
      this.slider.elt.value = Math.max(this.slider.elt.value, this._min);
    }

    set value(val) {
      this._value = val;
      let tmp = this.clip(val);
      this.slider.elt.value = tmp;
      this._value = tmp;
      this.onChange(this._value);
    }

    get value() {
      return this._value;
    }

    clip(val) {
      return Math.max(Math.min(this._value, this._max), this._min);
    }
  }

  function mod(x, hi) {
    let lo = 0;
    if (x >= hi) {
      x -= hi;
      if (x < hi) {
        return x;
      }
    } else if (x < lo) {
      x += hi;
      if (x >= lo) {
        return x;
      }
    } else {
      return x;
    }
    if (hi == lo) {
      return lo;
    }
    let c;
    c = x % hi;
    if (c < 0) {
      c += hi;
    }
    return c;
  }

  class Euclid {
    constructor(x, y, steps, pulses, generator, pitch, color) {
      this.x = x;
      this.y = y;
      this.generator = new DrumSynth();
      this.c = color;
      this.clk = 0;
      this.steps = steps;
      this.pulses = pulses;
      this.rotate = 0;
      this.pitch = pitch;
      this.inputs = [];
      this.data = new Array(24).fill(0);
      this.playing = false;
      this.symbolSize = 30;
      this.sliderPosY = this.y + seqWidth / 2 + 50;
      this.sliderSize = seqWidth - 15;
      this.sliderSize -= this.symbolSize +1;
      this.sliderPosX = this.x - this.sliderSize / 2;
      this.sliderPosX += this.symbolSize / 2 + 1;
      this.symbolPosX = this.sliderPosX - this.symbolSize;
      this.initSeq();

      this.pSlider = new Slider(
        this.sliderPosX,
        this.sliderPosY,
        this.sliderSize,
        0,
        24,
        (val) => {
          let dir = val - this.pulses;
          this.pulses = val;
          if (dir > 0 && this.pulses >= this.steps) {
            this.sSlider.value = val;
          }
          this.initSeq();
        },
        'pulses: increase number of onsets'
      );

      this.sSlider = new Slider(
        this.sliderPosX,
        this.sliderPosY + 30,
        this.sliderSize,
        0,
        24,
        (val) => {
          let dir = val - this.steps;
          this.steps = val;
          if (dir < 0 && this.pulses >= this.steps) {
            this.pSlider.value = val;
          }
          this.initSeq();
        },
        'steps: increase length of the sequence'
      );
      this.sSlider.min = 2;
      this.sSlider.value = this.steps;
      this.pSlider.value = this.pulses;
    }

    initSeq() {
      for (let i = 0; i < this.steps; i++) {
        this.data[i] = this.isPulse(i + 1);
      }
    }

    isPulse(idx) {
      return (
        (mod(idx - this.rotate - 1, this.steps) * this.pulses) % this.steps <
        this.pulses
      );
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
        s.mouseX > this.x - seqWidth / 2 &&
        s.mouseX < this.x + seqWidth / 2 &&
        s.mouseY > this.y - seqWidth / 2 &&
        s.mouseY < this.y + seqWidth / 2
      ) {
        this.mouseOver = true;
      } else {
        this.mouseOver = false;
      }
      return this.mouseOver;
    }

    update(time) {
      this.clk = this.clk + 1;

      if (this.clk >= this.steps) {
        this.clk = 0;
      }
      if (this.data[this.clk]) {
        if (this.playing) {
          this.generator.onUpdate(this.pitch, time);
        }
      }
    }

    drawStep(idx, clr) {
      s.stroke(clr);
      s.noFill();
      s.strokeWeight(strokeWeight);
      if (this.steps == 1) {
        this.margin = 0;
      } else {
        this.margin = 0.1;
      }
      s.arc(
        this.x,
        this.y,
        arcWidth,
        arcWidth,
        this.stepWidth * idx + this.margin - Math.PI / 2,
        this.stepWidth * (idx + 1) - this.margin - Math.PI / 2
      );
    }

    draw() {
      this.stepWidth = (2 * s.PI) / this.steps;

      if (!this.mouseOver) {
        this.hasPlayed = false;
      }

      for (let j = 0; j < this.steps; j++) {
        let restClr = s.color(230);
        let pulseClr;
        if (this.mouseOver && !(!this.playing && this.hasPlayed)) {
          pulseClr = this.c;
        } else if (this.playing) {
          pulseClr = s.lerpColor(this.c, s.color(255), 0.3);
        } else {
          pulseClr = s.color(180);
        }

        let stepClr = this.data[j] ? pulseClr : restClr;
        let cursorColor = this.playing ? s.color(120) : stepClr;
        let clr = j == this.clk ? cursorColor : stepClr;

        this.drawStep(j, clr);
      }
      
      // Draw symbols
      s.stroke(180);
      s.strokeWeight(2);
      s.fill(180);
      this.pSymbol = s.arc(
        this.symbolPosX,
        this.sliderPosY + this.symbolSize / 4,
        this.symbolSize / 2,
        this.symbolSize / 2,
        0,
        2 * s.PI
      );
      s.noFill();
      this.sSymbol = s.arc(
        this.symbolPosX,
        this.sliderPosY + 30 + this.symbolSize / 4,
        this.symbolSize / 2,
        this.symbolSize / 2,
        0,
        2 * s.PI
      );
    }
  }

  s.setup = () => {
    let colors = [s.color('#EE8F38'), s.color('#46D2A8'), s.color('#ED8DE9')];
    parentWidth = document.getElementById('interactive-euclid').offsetWidth;
    let maxNumSeqs = 3;
    let numSeqs = Math.min(Math.floor(parentWidth / seqWidth), maxNumSeqs);
    if (numSeqs > 1) {
      seqGap = (parentWidth - numSeqs * seqWidth) / (numSeqs - 1);
    } else {
      seqGap = (parentWidth - seqWidth) / 2;
    }
    s.createCanvas(parentWidth, 400);

    tooltip = new Tooltip(0, 350);

    for (let i = 0; i < numSeqs; i++) {
      seqs.push(
        new Euclid(
          numSeqs == 1
            ? seqGap + seqWidth / 2
            : seqWidth / 2 + i * (seqWidth + seqGap),
          seqWidth / 2,
          defaultSteps,
          defaultPulses,
          new DrumSynth(),
          i / 3.0,
          colors[i]
        )
      );
    }

    let clickedOnce = false;
    document.addEventListener('click', async () => {
      if (!clickedOnce) {
        clickedOnce = true;
        StartAudioContext(Tone.context);
        await Tone.start();
        Tone.Transport.scheduleRepeat((time) => {
          for (let i = 0; i < seqs.length; ++i) {
            seqs[i].update(time);
          }
        }, '16n');

        Tone.Transport.start();
        Tone.Transport.set({ bpm: 85 });
      }
    });
  };

  s.draw = () => {
    // s.background(245);
    s.clear();
    let mouseOver = 0;
    seqs.forEach((seq) => {
      seq.draw();
      mouseOver += seq.isMouseOver();
    });
    if (mouseOver) {
      s.cursor(s.HAND);
    } else {
      s.cursor(s.ARROW);
    }
  };

  s.mouseClicked = () => {
    seqs.forEach((seq) => {
      seq.clicked();
    });
  };
};

let euclidWidget = new p5(euclidSketch, 'interactive-euclid');
