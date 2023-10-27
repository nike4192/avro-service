<script setup lang='ts'>
import { capitalize, h, ref } from 'vue'
import * as avro from 'avsc'
import { BoundingBox, BoundingBoxCollection, Vector2 } from '@/core/math'

const props = defineProps({
  schema: Object,
  records: Array
});

class ElementBoundingBox extends BoundingBox {
  readonly el: Element;

  constructor(min: Vector2, max: Vector2, el: Element) {
    super(min, max);
    this.el = el;
  }

  static fromElement(el: Element) {
    const rect = el.getBoundingClientRect();
    return new ElementBoundingBox(
      new Vector2(rect.left, rect.top),
      new Vector2(rect.right, rect.bottom),
      el
    )
  }
}

const root = ref(null);

const GAP = 16;
const gapX = GAP;
const gapY = GAP;

const TYPES = Object.fromEntries(
  Object.values(avro.types).map(t => {
    return [t.prototype.typeName, t];
  })
);

function getType(schema: any) {
  if (schema) {
    if (typeof schema === 'string') {
      return schema !== 'null' ? schema : null;
    } else if (typeof schema === 'object') {
      const type = schema.type;
      if (typeof type === 'string') {
        return type;
      }
      if (Array.isArray(type)) {
        let hasNull = false;
        for (const t of type) {
          const tt = getType(t);
          if (tt) {
            return tt + (hasNull ? "?" : "");
          } else if (tt === null) {
            hasNull = true;
          }
        }
      } else {
        return getType(type);
      }
    }
  }
}

function render() {
  const { schema, records } = props;

  // console.log(avro);

  function makeTree(
    schema: any,
    collection: BoundingBoxCollection,
    delta: Vector2,
    cb?: (el, box) => void
  ) {
    if (schema && schema.el) {
      const box = ElementBoundingBox.fromElement(schema.el);

      box.translate(new Vector2(-box.left, -box.top));
      box.translate(delta);

      collection.addBox(box);

      if (cb) cb(schema.el, box);

      delta.x += box.width + gapX;

      for (const field of schema.fields) {
        if (field.type) {
          if (Array.isArray(field.type)) {
            for (const t of field.type) {
              const childBox = makeTree(t, collection, delta.clone(), cb);
              delta.y += childBox ? childBox.height + gapY: 0;
            }
          } else if (typeof field.type === 'object' && field.type.el) {
            const childBox = makeTree(field.type, collection, delta.clone(), cb);
            delta.y += childBox ? childBox.height + gapY: 0;
          }
        }
      }

      return box;
    }
  }

  function fitElements(rootEl) {
    const parent = rootEl.parentElement;
    if (schema && parent) {
      const parentRect = parent.getBoundingClientRect();
      const parentBox = BoundingBox.fromDOMRect(parentRect);
      parentBox.translate(new Vector2(-parentRect.left, -parentRect.top));
      const center = parentBox.getCenter(new Vector2(0, 0));

      const collection = new BoundingBoxCollection();
      makeTree(schema, collection, new Vector2(0, 0));

      const collectionCenter = collection.superBox.getCenter(new Vector2(0, 0));
      for (const box of collection.boxes) {
        box.el.style.translate = `${box.left - collectionCenter.x}px ${box.top - collectionCenter.y}px`;
      }
      console.log(collection);
    }
  }

  if (schema && records) {
    return h('div', {
      class: 'schema-tree',
      ref: fitElements
    }, records.map(r => {
      return h('div', {
        class: 'schema',
        ref: (el) => { r.el = el; }
      }, r.fields.map(f => {
        return h('div', {
          class: 'schema-field',
          ref: (el) => { f.el = el },
          onClick: () => {
            console.log(f);
          }
        }, [
          h('span', f.name),  // Name
          h('span', { class: 'type' }, capitalize(getType(f)))
        ])
      }));
    }))
  }
}

</script>

<template lang='pug'>
render
</template>

<style lang='stylus'>
.schema-tree
  //display flex
  //justify-content center
  //align-items center
  //gap 12px

  .schema
    margin auto
    position absolute
    width 220px
    background-color var(--color-background-mute)
    border-radius 8px

    .schema-field
      display flex
      justify-content space-between
      padding 6px 12px

      span.type
        font-style italic
        color var(--vt-c-green-dark)
</style>