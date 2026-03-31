import { Component } from '../../../framework/common/component.js';
import { VirtualList } from '../../../framework/common/VirtualList.js'
import { bench } from '../../../framework/dom/bench.js';

export class PerformancePage extends Component {
    constructor() {
        super();
        this.items = Array.from({ length: 200000 }, (_, i) => ({
            id: i,
            text: `Performance Test Item #${i + 1}`
        }));
    }

    render() {
        return bench('div', { style: { padding: '20px' } }, [
            bench('h2', {}, [`Rendering ${this.items.length} Items`]),
            bench('p', {}, ['Scroll down fast! The DOM stays light.']),

            bench(VirtualList, {
                items: this.items,
                height: 500,
                itemHeight: 50,
                renderRow: (item) => bench('div', {
                    style: {
                        height: '50px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        background: item.id % 2 === 0 ? '#fff' : '#f9f9f9'
                    }
                }, [`${item.text}`])
            })
        ]);
    }
}