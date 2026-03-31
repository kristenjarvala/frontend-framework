import { TodoList } from './components/TodoList.js';
import { PerformancePage } from './components/PerformancePage.js';
import { PerformanceTestNoVirtual } from './components/PerformanceTestNoVirtual.js';

export const routes = {
    '/': TodoList,
    '/index.html': TodoList,
    '/performance': PerformancePage,
    '/performance-bad': PerformanceTestNoVirtual,
    '/filter/:status': TodoList
};