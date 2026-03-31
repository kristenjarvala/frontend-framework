import { Component } from "../../framework/common/component.js";
import { bench } from "../../framework/dom/bench.js";
import { mount } from "../../framework/dom/mount.js";

class Calculator extends Component {
    constructor() {
        super();
        this.state = {
            count: 0,
            inputValue: 1
        };
    }

    render() {
        return bench('div', { style: { fontFamily: 'sans-serif', padding: '20px' } }, [
            bench('h1', {}, ['Simple Calculator']),

            // Display Result
            bench('div', {}, [`Result: ${this.state.count}`]),

            // Controls
            bench('div', {}, [
                // Input for amount
                bench('input', {
                    type: 'number',
                    value: this.state.inputValue,
                    onInput: (e) => {
                        this.state.inputValue = Number(e.target.value);
                    }
                }),

                // Add Button
                bench('button', {
                    onClick: () => {
                        this.state.count += this.state.inputValue;
                    }
                }, ['Add']),

                // Subtract Button
                bench('button', {
                    onClick: () => {
                        this.state.count -= this.state.inputValue;
                    }
                }, ['Subtract']),

                // Reset Button
                bench('button', {
                    onClick: () => {
                        this.state.count = 0;
                        this.state.inputValue = 1;
                    }
                }, ['Reset'])
            ])
        ]);
    }
}

// Mount the app
const app = new Calculator();
app.mountTo('#app');