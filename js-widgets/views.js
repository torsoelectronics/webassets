  class View extends Grid {
    constructor(options) {
      super({
        p5: options.p5,
        x: options.x,
        y: options.y,
        nx: 8,
        ny: 2,
        gridSize: options.gridSize,
        radius: 6,
        defaultColor: options.defaultColor,
        margin: options.margin,
      })
      this.xSteps = 8;
      this.ySteps = 2;
      this.data = options.colors;
      this.defaultColor = options.defaultColor;
      this.boxSizeX = this.xSteps * this.gridSizeX;
      this.boxSizeY = this.ySteps * this.gridSizeY;
    }

    draw() {
      super.draw();

      for (let x = 0; x < this.xSteps; x++) {
        for (var y = 0; y < this.ySteps; y++) {
          let c = this.overBox ? this.data[y][x] : this.defaultColor;
          this.setColor(x, y, c);
        }
      }

      if (
        this.p5.mouseX > this.x &&
        this.p5.mouseX < this.x + this.boxSizeX &&
        this.p5.mouseY > this.y &&
        this.p5.mouseY < this.y + this.boxSizeY
      ) {
        this.overBox = true;
      } else {
        this.overBox = false;
      }
    }
  }

let viewSketch = (s) => {
  let views = [];
  let nx = 8;
  let ny = 2;
  let gridSize = 54;
  let margin = 4.5;
  let gap;

  s.setup = () => {
    let parentWidth = document.getElementById('interactive-views').offsetWidth; // TODO get parent from p5
    let canvas = s.createCanvas(parentWidth, 600);
    gridSize = parentWidth / 24.5;
    let width = gridSize * nx - margin;
    let height = gridSize * ny;

    // let maxCols = 3; // TODO: dynamic relative to parent width, i.e. scale for phone/tablet
    // let numCols = Math.min(Math.floor((parentWidth) / (width)), maxCols);
    let numCols = 3; //TODO: dynamic relative to parent width, i.e. scale for phone/tablet
    gap = (parentWidth + margin - numCols * width) / (numCols - 1);


    let o = s.color('#EE8F38');
    let od = s.color('#EE8F38'); // TODO find dim orange
    let b = s.color('#3C80C0');
    let bd = s.color('#96A1AF');
    let g = s.color('#3BBC57');
    let gd = s.color('#96D5A3');
    let r = s.color('#F18080');
    let w = s.color('#FFFFFF');
    let wd = s.color('#CDCDCD');
    let m = s.color('#ED8DE9');
    let t = s.color('#65D1B1');

    // Views
    let viewColors = {};
    viewColors['step'] = [
      [o, bd, bd, bd, bd, bd, o, bd],
      [bd, bd, bd, o, bd, bd, bd, bd],
    ];

    viewColors['bank'] = [
      [r, r, r, r, gd, gd, gd, gd],
      [g, gd, gd, gd, gd, gd, gd, gd],
    ];

    viewColors['bipolar'] = [
      [bd, bd, bd, bd, bd, bd, bd, r],
      [wd, wd, wd, od, od, o, wd, r],
    ];

    viewColors['length'] = [
      [g, g, g, g, g, g, g, g],
      [w, gd, gd, gd, gd, gd, gd, gd],
    ];

    viewColors['random'] = [
      [r, r, r, r, r, bd, bd, bd],
      [bd, bd, bd, bd, bd, bd, bd, bd],
    ];

    viewColors['pattern'] = [
      [b, b, w, bd, bd, bd, bd, bd],
      [bd, bd, bd, bd, bd, bd, bd, bd],
    ];

    viewColors['division'] = [
      [bd, bd, bd, bd, bd, bd, bd, r],
      [wd, wd, b, b, b, b, b, r],
    ];

    viewColors['home'] = [
      [bd, bd, o, wd, wd, wd, wd, wd],
      [wd, wd, wd, wd, wd, wd, m, t],
    ];

    viewColors['unipolar'] = [
      [bd, bd, bd, bd, bd, bd, bd, bd],
      [bd, bd, wd, wd, wd, wd, wd, wd],
    ];

    viewColors['style'] = [
      [gd, gd, gd, gd, wd, wd, wd, wd],
      [gd, gd, gd, gd, wd, wd, wd, wd],
    ];

    viewColors['steps'] = [
      [r, bd, bd, b, bd, bd, bd, bd],
      [b, bd, bd, b, bd, bd, bd, bd],
    ];

    viewColors['scale'] = [
      [wd, wd, wd, wd, wd, wd, wd, wd],
      [bd, bd, bd, b, b, b, b, r],
    ];


    Object.values(viewColors).forEach((c, i) => {
      views.push(
        new View({
          p5: s,
          x: (i % 3) * (width + gap),
          y: Math.floor(i/3) * (height + gap),
          colors: c,
          gridSize: gridSize,
          margin: margin,
          defaultColor: wd,
        })
      );
    });
  };

  s.draw = () => {
    views.forEach((v) => {
      v.draw();
    });
  };
};

let viewWigdet = new p5(viewSketch, 'interactive-views');
