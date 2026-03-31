import { routes } from "./routes.js";
import { Router } from "../../framework/router/router.js";

console.log("App starting");

// Initialize router and mount it to the app container
const router = new Router(routes);
router.init(document.querySelector("#app"));

console.log("!!!!App mounted successfully!!!!");