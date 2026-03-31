import { Component } from "./component.js";
import { bench } from "../dom/bench.js";

/**
 * VirtualList Component
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of items to render
 * @param {number} props.height - Height of the virtual list container
 * @param {number} props.itemHeight - Height of each item
 * @param {Function} props.renderRow - Function to render each item
 */
export class VirtualList extends Component {
    constructor(props) {
        super(props);
        this.state = { scrollTop: 0 };
    }

    /**
     * Handle scroll event
     * @param {Event} event 
     */
    onScroll(event) {
        console.log("Scroll fired! Top:", event.target.scrollTop);
        this.state.scrollTop = event.target.scrollTop;
    }

    /**
     * Render the virtual list
     * @returns {VNode} 
     */
    render() {
        const { items = [],
            height = 400,
            itemHeight = 50,
            renderRow
        } = this.props;

        const { scrollTop } = this.state;

        console.log("VirtualList Render. ScrollTop is:", scrollTop);

        const totalHeight = items.length * itemHeight;

        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(items.length, Math.floor((scrollTop + height) / itemHeight) + 1);

        const visibleItems = items.slice(startIndex, endIndex);

        const offsetY = startIndex * itemHeight;

        return bench("div", {
            style: {
                height: `${height}px`,
                overflowY: "auto",
                position: 'relative',
                border: '1px solid #ccc'
            },
            onScroll: (e) => this.onScroll(e)
        }, [
            bench("div", {
                style: {
                    height: `${totalHeight}px`,
                    position: 'relative'
                }
            }, [
                bench("div", {
                    style: {
                        position: 'absolute',
                        top: `${offsetY}px`,
                        left: '0',
                        right: '0'
                    }
                }, visibleItems.map(item => renderRow(item)))
            ])
        ]);
    }
}