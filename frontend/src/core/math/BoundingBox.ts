import { Vector2 } from './Vector2'

/**
 * @see https://gist.github.com/WetHat/192eb4f42a5140ab6834cdbc0b750d78
 * @see https://github.com/mrdoob/three.js/blob/dev/src/math/Box2.js
 **/
class BoundingBox {
  readonly min: Vector2;
  readonly max: Vector2;

  constructor(
    min = new Vector2(Infinity, Infinity),
    max = new Vector2(-Infinity, -Infinity)
  ) {
    this.min = min;
    this.max = max;
  }

  get left() { return this.min.x; }
  get top() { return this.min.y; }

  get width() {
    return this.max.x - this.min.x;
  }

  get height() {
    return this.max.y - this.min.y;
  }

  makeEmpty() {
    this.min.x = this.min.y = +Infinity;
    this.max.x = this.max.y = -Infinity;

    return this;
  }

  isEmpty() {
    // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

    return (this.max.x < this.min.x) || (this.max.y < this.min.y);
  }

  getCenter(target: Vector2) {
    return this.isEmpty()
      ? target.set(0, 0)
      : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }

  static fromElement(element: Element) {
    return BoundingBox.fromDOMRect(element.getBoundingClientRect());
  }
  static fromDOMRect(rect: DOMRect) {
    return new BoundingBox(
      new Vector2(rect.left, rect.top),
      new Vector2(rect.right, rect.bottom)
    );
  }

  translate(offset: Vector2) {
    this.min.add(offset);
    this.max.add(offset);

    return this;
  }

  intersect(box) {
    this.min.max(box.min);
    this.max.min(box.max);

    if (this.isEmpty()) this.makeEmpty();

    return this;
  }

  union(box) {
    this.min.min(box.min);
    this.max.max(box.max);

    return this;
  }

  copy(box: BoundingBox) {
    this.min.copy(box.min);
    this.max.copy(box.max);

    return this;
  }

  clone() {
    return new this.constructor().copy(this);
  }
}

export { BoundingBox };
