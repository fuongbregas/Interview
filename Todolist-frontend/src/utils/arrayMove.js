export function arrayMove(array, fromIndex, toIndex) {
    const next = array.slice();
    const startIndex = fromIndex < 0 ? next.length + fromIndex : fromIndex;

    if (startIndex < 0 || startIndex >= next.length) return next;

    const [item] = next.splice(startIndex, 1);
    const endIndex = toIndex < 0 ? next.length + toIndex : toIndex;
    const clampedIndex = Math.max(0, Math.min(endIndex, next.length));
    next.splice(clampedIndex, 0, item);
    return next;
}