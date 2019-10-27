const useMouse = !("ontouchstart" in document.documentElement);

// we want touchEvent and mouseEvent expose the same properties here
const eventProperties = [
	"clientX",
	"clientY",
	"pageX",
	"pageY",
	"screenX",
	"screenY",
	"currentTarget"
];
const eventNameMapping = {
	mousedown: "vdown",
	mousemove: "vmove",
	mouseup: "vup",
	touchstart: "vdown",
	touchmove: "vmove",
	touchend: "vend"
};
function makeSyntheticEvent(e, target) {
	let pointer = e;
	if (e.touches) pointer = e.touches[0];
	const composedEvent = typeof pointer.clientX === undefined ? {} : eventProperties.reduce((acc, prop) => {
		return Object.assign(acc, {[prop]: pointer[prop]});
	}, {});
	composedEvent.type = eventNameMapping[e.type];
	composedEvent.target = target;
	composedEvent.nativeEvent = e;
	composedEvent.preventDefault = () => e.preventDefault();
	composedEvent.stopPropagation = () => e.stopPropagation();
	return composedEvent;
}

function emit(vnode, name, nativeEvent) {
	// https://stackoverflow.com/questions/40655333/vue-js-emit-event-from-directive
	const handlers =
		(vnode.data && vnode.data.on) ||
		(vnode.componentOptions && vnode.componentOptions.listeners);
	const syntheticEvent = makeSyntheticEvent(nativeEvent, vnode.elm);
	if (handlers && handlers[name]) {
		handlers[name](syntheticEvent);
	}
}

function addEvent(el, name, handler) {
	el.addEventListener(name, handler);
	return function() {
		el.removeEventListener(name, handler);
	};
}

function combineFuncs(...funcs) {
	return function(...args) {
		return funcs.map(fn => fn(...args));
	};
}

export default {
	bind(el, _, vnode) {
    const disposeSelect = addEvent(document, 'selectionchange', emit.bind(null, vnode, 'vselectchange'))
		if (useMouse) {
			const downHandler = function(e) {
				const disposeMove = addEvent(
					document,
					"mousemove",
					emit.bind(null, vnode, "vmove")
				);
				const upHandler = function(e) {
					disposeMove();
          emit(vnode, "vup", e);
          document.removeEventListener('mouseup', upHandler)
          el._$vselectDiposer = combinedSelectDown
				};
				el._$vselectDiposer = combineFuncs(
					combinedSelectDown,
					disposeMove,
					addEvent(document, "mouseup", upHandler)
				);
				emit(vnode, "vdown", e);
			};
      const disposeDown = addEvent(el, "mousedown", downHandler);
      const combinedSelectDown = combineFuncs(
        disposeDown,
        disposeSelect
      );
      el._$vselectDiposer = combinedSelectDown
		} else {
      el._$vselectDiposer = combineFuncs(
        disposeSelect,
				addEvent(el, "touchstart", emit.bind(null, vnode, "vdown")),
				addEvent(el, "touchmove", emit.bind(null, vnode, "vmove")),
				addEvent(el, "touchend", emit.bind(null, vnode, "vup"))
			);
    }
	},
	unbind(el) {
		if (el._$vselectDiposer) el._$vselectDiposer();
	}
};
