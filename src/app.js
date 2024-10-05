// src/app.js

import { getUserFragments, createNewFragment } from './api';
import { Auth, getUser } from './auth';
const logger = require('./logger');

/*
  On init
  */
async function init() {
  logger.info('Initializing the app...');

  // Get our UI elements
  const userSection = document.querySelector('#user'); //user id
  const loginBtn = document.querySelector('#login'); // login btn
  const logoutBtn = document.querySelector('#logout'); // logout btn
  const createForm = document.getElementById('createForm'); // the form for fragment
  const fragmentTypeSelect = document.getElementById('fragmentType'); // the fragment type
  const fragmentContentTextarea = document.getElementById('fragmentContent'); // the actual fragment

  logger.info('UI elements retrieved.');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    logger.info('No user found, disabling logout button.');
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  /*
  Fetch user fragments
  */

  const userFragments = await getUserFragments(user);
  // Log the user info for debugging purposes seeing in shift+ctrl+j
  console.log({ userFragments });
  logger.info('User fragments retrieved:', userFragments);

  // Update the UI to welcome the user
  userSection.hidden = false;
  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;
  // Disable the Login button
  loginBtn.disabled = true;

  /*
  New Fragment submit
  */
  createForm.onsubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh

    const fragmentContent = fragmentContentTextarea.value; // The fragment
    const contentType = fragmentTypeSelect.value; // The type

    logger.info('Submitting new fragment:', { contentType, fragmentContent });

    try {
      // Create a new fragment
      const newFragment = await createNewFragment(user, fragmentContent, contentType);
      console.log('New Fragment Created:', newFragment);
      logger.info('New fragment created:', newFragment);

      // Fetch the updated list of user fragments
      const updatedFragments = await getUserFragments(user);
      console.log({ updatedFragments });

      // Clear the form
      fragmentContentTextarea.value = '';
      fragmentTypeSelect.selectedIndex = 0; // Reset to first option
    } catch (error) {
      console.error('Error creating fragment:', error.message);
      logger.error('Error creating fragment:', error.message);
      alert('Failed to create fragment. Please try again.'); // User feedback
    }
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
