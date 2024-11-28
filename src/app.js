import { Auth, getUser } from './auth';
import { createNewFragment, getFragmentsExpanded } from './api';

async function init() {
  // Get our UI elements with safe checks
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const createForm = document.querySelector('#create-fragment-form');
  const fileInput = document.getElementById('fragment_file');
  const fragmentContentTextarea = document.getElementById('fragment-content');
  const fragmentTypeSelect = document.getElementById('fragment-type');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const refreshButton = document.querySelector('#refresh-fragments');

  // Ensure all critical elements exist
  if (!loginBtn || !logoutBtn) {
    console.error('Login or logout button missing from DOM.');
    return;
  }

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => Auth.federatedSignIn();
  logoutBtn.onclick = () => Auth.signOut();

  // Check if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    console.log('No user is authenticated');
    if (logoutBtn) logoutBtn.disabled = true;
    return;
  }

  // Update the UI to welcome the user
  if (userSection) {
    userSection.hidden = false;
    const usernameElem = userSection.querySelector('.username');
    if (usernameElem) {
      usernameElem.innerText = user.username;
    }
  }
  if (loginBtn) loginBtn.disabled = true;

  // Function to update the fragments list
  async function updateFragmentsList() {
    const user = await getUser();
    if (!user) return;

    try {
      const fragmentsList = document.querySelector('#fragments-container');
      if (!fragmentsList) {
        console.error('Fragments container is missing in the DOM.');
        return;
      }

      const { fragments } = await getFragmentsExpanded(user);

      fragmentsList.innerHTML = fragments
        .map(
          (fragment) => `
          <div class="fragment">
            <div><b>ID:</b> ${fragment.id}</div>
            <div><b>Type:</b> ${fragment.type}</div>
            <div><b>Size:</b> ${fragment.size} bytes</div>
            <div><b>Created:</b> ${new Date(fragment.created).toLocaleString()}</div>
            <div><b>Updated:</b> ${new Date(fragment.updated).toLocaleString()}</div>
          </div><br/>
        `
        )
        .join('');
    } catch (err) {
      console.error('Unable to update fragments list:', err);
      const fragmentsList = document.querySelector('#fragments-container');
      if (fragmentsList) {
        fragmentsList.innerHTML = '<div class="error">Error loading fragments</div>';
      }
    }
  }

  // Add refresh button handler
  if (refreshButton) {
    refreshButton.addEventListener('click', updateFragmentsList);
  }

  // Initial load of fragments
  await updateFragmentsList();

  // Form submission handler
  if (createForm) {
    createForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const currentUser = await getUser();
      console.log('Current user at form submission:', currentUser);

      if (!currentUser) {
        console.error('No user authenticated');
        return;
      }

      try {
        const type = fragmentTypeSelect?.value || 'text/plain';
        const content = fragmentContentTextarea?.value || '';
        console.log('Creating fragment:', { type, content });

        const result = await createNewFragment(content, type, currentUser);
        console.log('Fragment created:', result);

        // Clear form and refresh the list
        if (createForm) createForm.reset();
        await updateFragmentsList();
      } catch (err) {
        console.error('Unable to create fragment:', err);
      }
    });
  }

  // File input handler
  if (fileInput && fileNameDisplay && fragmentContentTextarea && fragmentTypeSelect) {
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Display file name
      fileNameDisplay.textContent = `Selected file: ${file.name}`;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const selectedType = fragmentTypeSelect.value;
          if (selectedType === 'application/json') {
            // Parse JSON files
            fragmentContentTextarea.value = JSON.stringify(JSON.parse(e.target.result), null, 2);
          } else {
            // Load text for other types
            fragmentContentTextarea.value = e.target.result;
          }
          console.log('Loaded file content:', fragmentContentTextarea.value);
        } catch (error) {
          console.error('Error reading file:', error);
          alert('Error loading file content. Ensure the format matches the selected type.');
          fragmentContentTextarea.value = ''; // Clear content on error
        }
      };

      // Read file based on type selection
      if (
        fragmentTypeSelect.value === 'application/json' ||
        fragmentTypeSelect.value.startsWith('text/')
      ) {
        reader.readAsText(file); // Read as text for JSON and other text-based files
      } else {
        alert('Unsupported file type. Please select a compatible type.');
        fragmentContentTextarea.value = ''; // Clear content for unsupported types
      }
    });
  }
}

// Wait for the DOM to be ready, then start the app
document.addEventListener('DOMContentLoaded', init);
