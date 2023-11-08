import { computed, ref } from 'vue'

const zIndexStack = ref(2);
const _hoveredElement = ref(null);

const hoveredElement = computed({
  get() {
    return _hoveredElement.value;
  },
  set(element) {
    if (_hoveredElement.value) {
      _hoveredElement.value.removeAttribute('hovered');
    }
    if (element) {
      element.setAttribute('hovered', '');
    }
    _hoveredElement.value = element;
  }
});

export function useZIndexStack () {

  function up() { return ++zIndexStack.value; }
  function down() { zIndexStack.value--; return null; }

  function childOf(rootSelector: string, element: Element) {
    return true;
    // const parent = element.parentElement;
    // if (parent) {
    //   if (parent.matches(rootSelector)) {
    //     return true;
    //   } else {
    //     return childOf(rootSelector, parent);
    //   }
    // } else {
    //   return false;
    // }
  }
  function zIndexRec(rootSelector: string, element: Element, value: number | null) {
    element.style.zIndex = value;
    const parent = element.parentElement;
    if (parent && !parent.matches(rootSelector)) {
      zIndexRec(rootSelector, parent, value);
    }
  }

  const zIndexFixEventListeners = (rootSelector) => ({
    onMouseenter(e) {
      const { target } = e;
      if (!childOf(rootSelector, target)) return;

      if (document.activeElement !== target) {
        zIndexRec(rootSelector, target, up());
        hoveredElement.value = target;
      }
    },
    onMouseleave(e) {
      const { target } = e;
      if (!childOf(rootSelector, target)) return;

      if (document.activeElement !== target) {
        zIndexRec(rootSelector, target, down());
        hoveredElement.value = null;
      }
    },
    onFocus(e) {
      const { target } = e;
      if (!childOf(rootSelector, target)) return;

      if (!target.style.zIndex) {
        zIndexRec(rootSelector, target, up());
        hoveredElement.value = target;
      }
    },
    onBlur(e) {
      const { target } = e;
      if (!childOf(rootSelector, target)) return;

      if (target.style.zIndex) {
        zIndexRec(rootSelector, target, down());
        hoveredElement.value = null;
      }
    }
  });

  return {
    zIndexFixEventListeners,
  };
}