import { Component } from "../../../framework/common/component.js";
import { bench } from "../../../framework/dom/bench.js";

export class TodoHeader extends Component {
    render() {
        const { theme, onToggleTheme } = this.props;
        const isDark = theme === 'dark';

        return bench("header", { className: "todo-header" }, [
            bench("h1", { className: "todo-title" }, ["My Todo List"]),

            // Connection status
            bench("p", { className: "status-text" }, [
                "Connected to backend API",
            ]),

            // Theme Toggle
            bench("button", {
                style: {
                    marginTop: "0.5rem",
                    marginLeft: "1rem",
                    padding: "2px 8px",
                    fontSize: "0.8em",
                    cursor: "pointer",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.5)",
                    color: "white",
                    borderRadius: "4px"
                },
                onClick: onToggleTheme
            }, [`Theme: ${theme}`]),

            // Performance Links
            bench("div", { style: { marginTop: "1rem" } }, [
                bench(
                    "a",
                    {
                        className: "test-link fast",
                        href: "#/performance",
                    },
                    ["Test Virtual List (Fast)"],
                ),

                bench(
                    "a",
                    {
                        className: "test-link slow",
                        href: "#/performance-bad",
                    },
                    ["Test Brute Force (Slow)"],
                ),
            ]),
        ]);
    }
}
