import { Component } from "../../../framework/common/component.js";
import { bench } from "../../../framework/dom/bench.js";

export class TodoStats extends Component {
    render() {
        const { total, active, done } = this.props;

        return bench("footer", { className: "todo-footer" }, [
            bench("div", { className: "todo-stats" }, [
                bench("strong", {}, [`${total} total`]),
                bench("span", { className: "stat-separator" }, ["•"]),
                bench("span", { className: "stat-active" }, [`${active} active`]),
                bench("span", { className: "stat-separator" }, ["•"]),
                bench("span", { className: "stat-done" }, [`${done} done`]),
            ]),
        ]);
    }
}
