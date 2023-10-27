
/**
 * @see https://github.com/mrdoob/three.js/blob/dev/src/math/Vector2.js
 **/
class Vector2 {

  public x: number;
  public y: number;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  min(v: Vector2) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);

    return this;
  }

  max(v: Vector2) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);

    return this;
  }

  add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  addVectors(a: Vector2, b: Vector2) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }
  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }

  clone(): Vector2 {
    return new this.constructor(this.x, this.y);
  }
}

export { Vector2 };
