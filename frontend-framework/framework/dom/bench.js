export function bench(tag, props, children = []) {
    if (!Array.isArray(children)) {
        children = [children];
    }
    return { tag, props, children };
}
