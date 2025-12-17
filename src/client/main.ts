import { AppView } from './views/AppView.js';
import { AppController } from './controllers/AppController.js';

// Locate the root DOM element where the client application
// will mount and render its UI
const root = document.getElementById('app');

// Bootstrap the client application only if the root element exists
if (root) {
  (async () => {
    // Instantiate the view (UI + DOM interaction layer)
    const view = new AppView(root);

    // Instantiate the controller, which coordinates:
    // - user interactions from the view
    // - API communication with the server
    // - updating the view with server-provided data
    const controller = new AppController(view);

    // Initialize the application:
    // - fetch initial data from the server
    // - bind view event handlers
    // - render the initial UI state
    controller.init();
  })();
}
