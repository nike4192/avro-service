<script setup lang='ts'>
import { h, nextTick, ref, toRaw } from 'vue'
import { BoundingBox, BoundingBoxCollection, Vector2 } from '@/core/math'
import { COMPLEX_TYPES, JsonError, Type } from '~shared/avro/types'
import SchemaRecord from '@/components/schemas/schema-types/SchemaRecord.vue'
import { useHardRerender } from '@/composables/hardRerender'
import { HardRerender } from '@/types/schema'
import SchemaEnum from '@/components/schemas/schema-types/SchemaEnum.vue'
import SchemaFixed from '@/components/schemas/schema-types/SchemaFixed.vue'
import SchemaMap from '@/components/schemas/schema-types/SchemaMap.vue'
import { walkThroughComplexTypes } from '@/utils/schemas'

const props = defineProps({
  schema: Object
});

const { flag: rerenderFlag } = useHardRerender(HardRerender.SchemaTree);

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

const gapX = 32;
const gapY = 8;

function makeTree(
  schema: any,
  collection: BoundingBoxCollection,
  delta: Vector2,
  cb?: (el, box) => void
) {
  (function walkThroughTree(schema, delta) {
    if (schema) {
      let box = null;

      if (schema.el) {
        box = ElementBoundingBox.fromElement(schema.el);

        box.translate(new Vector2(-box.left, -box.top));
        box.translate(delta);

        collection.addBox(box);

        if (cb) cb(schema.el, box);

        delta.x += box.width + gapX;
      }

      const typeName = Type.getType(schema);
      let childBox;

      switch (typeName) {
        case 'array':
          childBox = walkThroughTree(schema.items, delta.clone());
          delta.y += childBox ? childBox.height + gapY: 0;
          break;
        case 'union':
          for (const type of schema) {
            if (!Type.getType(type) && Type.getType(type.type)) {
              childBox = walkThroughTree(type.type, delta.clone());
            } else {
              childBox = walkThroughTree(type, delta.clone());
            }
            delta.y += childBox ? childBox.height + gapY: 0;
          }
          break;
        case 'record':
          for (const field of schema.fields) {
            childBox = walkThroughTree(field.type, delta.clone());
            delta.y += childBox ? childBox.height + gapY: 0;
          }
          break;
      }

      if (box) return box;
      if (childBox) return childBox;
    }
  })(schema, delta);
}

const typeComponents = {
  record: SchemaRecord,
  enum: SchemaEnum,
  fixed: SchemaFixed,
  map: SchemaMap
};

function fitElements(rootEl, schema) {
  if (rootEl) {
    const parent = rootEl.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const parentBox = BoundingBox.fromDOMRect(parentRect);
    parentBox.translate(new Vector2(-parentRect.left, -parentRect.top));

    const collection = new BoundingBoxCollection();
    makeTree(schema, collection, new Vector2(0, 0));

    const collectionCenter = collection.superBox.getCenter(new Vector2(0, 0));
    for (const box of collection.boxes) {
      box.el.style.translate = `${box.left - collectionCenter.x}px ${box.top - collectionCenter.y}px`;
    }
  }
}

function render() {
  const schema = toRaw(props.schema);

  if (schema) {
    window.debug_schema = schema;

    const errors = Type.validate(schema);

    if (errors.length) {
      console.error(errors);
    }

    const complexTypes = [];
    walkThroughComplexTypes(schema, (complexType, path) => {
      const pathString: string = path.join('.');
      complexType = ref(complexType);  // For rerender errors in SchemaRecord
      complexType.value.path = path;
      complexType.value.errors = errors.filter(
        e => e instanceof JsonError && e.path.join('.').startsWith(pathString)
      );
      complexTypes.push(complexType);
    });

    return h('div', {
      class: 'schema-tree',
      key: rerenderFlag.value || true,
      ref: (el) => nextTick(() => fitElements(el, schema))
    }, complexTypes.map((complexType, i) => {
      const typeName = Type.getType(complexType.value);
      if (typeComponents[typeName]) {
        return h(typeComponents[typeName], { [typeName]: complexType.value });
      }
    }))
  }
}

</script>

<template lang='pug'>
render
</template>

<style lang='stylus'>
.schema-tree
  position: relative
  margin auto
  top 50%
  width 0
</style>