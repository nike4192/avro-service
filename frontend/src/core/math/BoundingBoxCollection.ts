import { BoundingBox } from '@/core/math/BoundingBox'
import { Vector2 } from '@/core/math/Vector2'

/**
 * @see https://gist.github.com/WetHat/192eb4f42a5140ab6834cdbc0b750d78
 **/
class BoundingBoxCollection {
  readonly superBox: BoundingBox;
  readonly boxes: BoundingBox[];
  private centerSum: Vector2;

  constructor(boxes?: BoundingBox[]) {
    this.superBox = new BoundingBox();
    this.boxes = [];
    this.centerSum = new Vector2(0, 0);

    if (boxes && boxes.length) {
      for (const box of boxes) {
        this.addBox(box);
      }
    }
  }

  translate(offset: Vector2) {
    for (const box of this.boxes) {
      box.translate(offset);
    }
  }

  addBox(box: BoundingBox) {
    this.superBox.union(box);
    this.boxes.push(box);
    this.centerSum.add(box.getCenter(new Vector2(0, 0)));
  }

  getCenter(target: Vector2) {
    return target.copy(this.centerSum).divideScalar(this.boxes.length);
  }

  recalculateCenter() {
    this.centerSum.set(0, 0);
    for (const box of this.boxes) {
      this.centerSum.add(box.getCenter(new Vector2(0, 0)));
    }
  }
}

export { BoundingBoxCollection };
