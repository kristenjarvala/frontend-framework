import { Component } from '../../../framework/common/component.js';
import { bench } from '../../../framework/dom/bench.js';

export class PerformanceTestNoVirtual extends Component {
    constructor() {
        super();
        this.items = Array.from({ length: 200000 }, (_, i) => ({
            id: i,
            text: `Performance Test Item #${i + 1}`
        }));
    }

    render() {
        return bench('div', { style: { padding: '20px' } }, [
            bench('h2', { style: { color: 'red' } }, ['Brute Force Rendering (200,000 items)']),

            bench('div', {
                style: {
                    height: '500px',
                    overflowY: 'auto',
                    border: '2px solid red'
                }
            },
                this.items.map(item =>
                    bench('div', {
                        style: {
                            height: '50px',
                            borderBottom: '1px solid #eee',
                            paddingLeft: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            background: item.id % 2 === 0 ? '#fff' : '#f9f9f9'
                        }
                    }, [`${item.text}`])
                ))
        ]);
    }
}