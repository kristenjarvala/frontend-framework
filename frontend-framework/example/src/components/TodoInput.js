import { Component } from "../../../framework/common/component.js";
import { bench } from "../../../framework/dom/bench.js";

export class TodoInput extends Component {
    render() {
        const { value, onInput, onAdd } = this.props;

        return bench("div", { className: "add-todo-section" }, [
            bench("input", {
                type: "text",
                className: "todo-input",
                placeholder: "What needs to be done? (min 3 chars)",
                value: value,
                onInput: onInput,
                onKeyup: (e) => {
                    if (e.key === "Enter") onAdd();
                },
            }),
            bench(
                "button",
                {
                    className: "add-button",
                    onClick: onAdd,
                    disabled: !value || value.trim().length < 3,
                },
                ["Add Todo"],
            ),
        ]);
    }
}
