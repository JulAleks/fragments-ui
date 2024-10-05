// src/app.js
// console logs will show in browser (Shift + CTRL + J)
import { Auth, getUser } from './auth';
import { getUserFragments, createNewFragment } from './api';
const logger = require('./logger');

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const createForm = document.getElementById('createForm');
  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    logger.info('Login button clicked');
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  try {
    const user = await getUser();
    if (!user) {
      // Disable the Logout button
      logoutBtn.disabled = true;
      logger.info('Logout button clicked');
      return;
    }

    // Do an authenticated request to the fragments API server and log the result
    const userFragments = await getUserFragments(user);
    logger.info({ userFragments }, 'Fetched user fragments');

    // Update the UI to welcome the user
    userSection.hidden = false;

    // Show the user's username
    userSection.querySelector('.username').innerText = user.username;

    // Disable the Login button
    loginBtn.disabled = true;

    // Logging that user is signed in
    logger.info({ user }, 'User is signed in');

    // Function to submit a new text fragment
    async function submitTextFragment(user) {
      const fragmentType = document.getElementById('fragmentType').value;
      const fragmentContentValue = document.getElementById('fragmentContent').value;

      try {
        // Submitting the text fragment content directly
        const res = await createNewFragment(user, fragmentContentValue, fragmentType);

        // Reset the form fields
        document.getElementById('fragmentType').value = 'text/plain';
        document.getElementById('fragmentContent').value = '';

        return res; // Return the result if needed
      } catch (error) {
        console.error('Failed to create text fragment:', error);
        alert('Failed to create text fragment. Please try again.');
      }
    }

    // Event listener for form submission (only for text fragments)
    createForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent form submission
      await submitTextFragment(user); // Call the submitTextFragment function
    });
  } catch (error) {
    logger.error(error, 'Error during initialization');
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
