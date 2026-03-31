import { Component } from "../../../framework/common/component.js";
import { bench } from "../../../framework/dom/bench.js";

export class TodoFilters extends Component {
    render() {
        const { currentFilter, onSetFilter } = this.props;

        const renderButton = (filterType, label) => {
            return bench(
                "button",
                {
                    className: currentFilter === filterType ? "filter-btn active" : "filter-btn",
                    onClick: () => onSetFilter(filterType),
                },
                [label],
            );
        };

        return bench("div", { className: "filter-section" }, [
            renderButton("all", "All"),
            renderButton("active", "Active"),
            renderButton("completed", "Completed"),
        ]);
    }
}
