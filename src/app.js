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
  const fileLoader = document.querySelector('#fragment_file'); // Get the file input element

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
  console.log({ userFragments }); //delete after we have a working DB <<<<<<<<<<<<<<<<<
  logger.info('User fragments retrieved');

  // Update the UI to welcome the user
  userSection.hidden = false;
  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;
  // Disable the Login button
  loginBtn.disabled = true;

  // Populate the fragment list
  if (userFragments && userFragments.fragments) {
    populateFragmentList(userFragments.fragments);
  }

  /*
   New file loaded 
  */
  let fileContent = null;
  fileLoader.addEventListener('change', handleFile);

  function handleFile(event) {
    const input = event.target;
    const files = input.files;

    //if no file do nothing
    if (!files.length) {
      return;
    }

    const file = files[0]; //process the first file
    const selectedType = fragmentTypeSelect.value; //get the selected type from the dropdown

    //check if the file's MIME type matches the selected type
    if (file.type && file.type !== selectedType) {
      alert(
        `Selected file type (${file.type}) does not match the chosen type (${selectedType}). Please select a matching file.`
      );
      fileLoader.value = ''; //clear the file input
      return;
    }

    //read the file
    const reader = new FileReader();

    //loading the file based on what type was loaded
    switch (true) {
      case selectedType.startsWith('text/'):
        console.log('Request to load text file submitted');
        reader.onload = (e) => {
          fileContent = e.target.result;
          console.log('Text file content loaded:', fileContent); // For debugging
        };
        reader.readAsText(file); // Read file as text
        console.log('Text file loaded');
        fileLoader.value = ''; //clear the file input
        break;
      /*  to test when img is supported 
      case selectedType.startsWith('image/'):
        console.log('Request to load image file submitted');
        reader.onload = (e) => {
          fileContent = e.target.result; //load as a URL to the file
          console.log('Image file content loaded');
        };
        reader.readAsDataURL(file); //read file as Data URL
        fileLoader.value = '';//clear the file input
        break;*/
      default:
        alert('Unsupported file type selected.');
        fileLoader.value = ''; //clear the file input
        break;
    }
  }

  // Update the file input accept attribute based on the dropdown selection
  fragmentTypeSelect.addEventListener('change', updateFileAccept);

  function updateFileAccept() {
    const selectedType = fragmentTypeSelect.value;
    fileLoader.accept = selectedType;
  }

  /*
  New Fragment submit
  */

  createForm.onsubmit = async (event) => {
    event.preventDefault(); // Prevent page refresh

    const fragmentContent = fileContent || fragmentContentTextarea.value; // The fragment
    const contentType = fragmentTypeSelect.value; // The type

    if (!fragmentContent) {
      alert('Please provide content by typing or uploading a file.');
      return;
    }

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
      fileContent = null;
      fragmentContentTextarea.value = '';
      fragmentTypeSelect.selectedIndex = 0; // Reset to first option
    } catch (error) {
      console.error('Error creating fragment:', error.message);
      logger.error('Error creating fragment:', error.message);
      alert('Failed to create fragment. Please try again.'); // User feedback
    }
  };
}

function populateFragmentList(fragments) {
  const fragmentList = document.getElementById('fragment_list');
  fragmentList.innerHTML = ''; //clear html

  // Check if there are fragments
  const validFragments = fragments.filter(
    (fragment) => fragment !== null && fragment !== undefined
  );

  //if no fragments chnage inner html to display that the list is empty
  if (validFragments.length === 0) {
    fragmentList.innerHTML = '<div id="empty-message">No fragments found.</div>';
  } else {
    //loop through each fragment
    validFragments.forEach((fragment) => {
      const fragmentItem = document.createElement('div');
      fragmentItem.classList.add('fragment-item');

      //getting the fragment info
      let id = fragment.id ? fragment.id : 'Unknown ID';
      let type = fragment.type ? fragment.type : 'Unknown Type';
      let created = fragment.created ? new Date(fragment.created).toLocaleString() : 'Unknown';
      let updated = fragment.updated ? new Date(fragment.updated).toLocaleString() : 'Unknown';
      let size = fragment.size ? `${fragment.size} bytes` : 'Unknown Size';
      let ownerId = fragment.ownerId ? fragment.ownerId : 'Unknown Owner';

      //display the fragment
      fragmentItem.innerHTML = `
      <div><b>ID:</b> ${id}</div>
      <div><b>Type:</b> ${type}</div>
      <div><b>Created:</b> ${created}</div>
      <div><b>Updated:</b> ${updated}</div>
      <div><b>Size:</b> ${size}</div>
      <div><b>Owner ID:</b> ${ownerId}</div>
    `;
      //append the fragment item to the fragment list
      fragmentList.appendChild(fragmentItem);
    });
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
