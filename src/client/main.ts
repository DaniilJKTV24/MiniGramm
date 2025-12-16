import { AppView } from './views/AppView.js';
import { AppController } from './controllers/AppController.js';

// Get root container where the application will be rendered
const root = document.getElementById('app');

// Initialize the application only if the root element exists
if (root) {
  (async () => {
  // Create the main view and controller
  const view = new AppView(root);
  const controller = new AppController(view);

  // Start the application (sets up event listeners, renders UI, etc.)
  controller.init();
  })();
}
