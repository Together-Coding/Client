export const isObject = (v) => {
  return typeof v === "object" && !Array.isArray(v) && v !== null;
};
export const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

export const resizeStartHandler = (ref, updown = false, ...callback) => {
  if (updown) {
    return function (e) {
      let rect = ref.current.getBoundingClientRect();
      let newHeight = rect.bottom - e.clientY;
      ref.current.style.height = parseInt(newHeight) + "px";
      if (callback != null) {
        for (let cb of callback) cb();
      }
    };
  } else {
    return function (e) {
      let rect = ref.current.getBoundingClientRect();
      let newWidth = e.clientX - rect.left;
      ref.current.style.width = parseInt(newWidth) + "px";
      if (callback != null) callback();
    };
  }
};

export const resizeEndHandler = (e) => {
  document.onmousemove = null;
  document.onmouseup = null;
};
