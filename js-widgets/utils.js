// let globalStyle = getComputedStyle(document.documentElement);
// ct["blue"] = globalStyle.getPropertyValue('--e-global-color-457d6f6');

class Grid {
    constructor(options) {
      this.p5 = options.p5;
      this.x = options.x;
      this.y = options.y;
      this.nx = options.nx;
      this.ny = options.ny;
      this.gridSizeX = options.gridSize;
      this.gridSizeY = options.gridSize;
      this.margin = options.margin;
      this.radius = options.radius;
      this.defaultColor = options.defaultColor;

      this.colors = [];

      for (let i = 0; i < this.ny; ++i) {
        this.colors[i] = [];
        for (let j = 0; j < this.nx; ++j) {
          this.colors[i][j] = this.defaultColor;
        }
      }
    }

    draw() {
      this.p5.noStroke();
      for (let i = 0; i < this.ny; ++i) {
        for (let j = 0; j < this.nx; ++j) {
          let x = this.x + j * this.gridSizeX - this.margin;
          let y = this.y + i * this.gridSizeY - this.margin;
          this.p5.fill(this.colors[i][j]);
          this.p5.rect(
            x + this.margin,
            y + this.margin,
            this.gridSizeX - this.margin * 2.0,
            this.gridSizeY - this.margin * 2.0,
            this.radius
          );
        }
      }

      for (let i = 0; i < this.ny; ++i) {
        for (let j = 0; j < this.nx; ++j) {
          this.colors[i][j] = this.defaultColor;
        }
      }
    }

    setColor(x, y, clr) {
      this.colors[y][x] = clr;
    }
  }

