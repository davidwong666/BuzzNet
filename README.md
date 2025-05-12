# BuzzNet

Group Project for CSCI3100 2024-25 Sem 2 at CUHK

# Developer's Role

- Zhang Ka Sing - Frontend
- Peng Minqi - Frontend
- Li Chun Leung - Backend
- Zeng Bai Chuan - Backend
- Wong Kwok Kam - Backend

# Dev Env Setup

This project uses VS Code's **Remote Development extension** for a consistent development environment:

1. Install [VS Code](https://code.visualstudio.com/) and the [Remote Development extension pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
2. Clone this repository via **HTTPS**
3. Open the repository in VS Code
4. When prompted, click "**Reopen in Container**" or run the "Remote-Containers: Reopen in Container" command
5. cd `BuzzNet` and run `npm install` to install the dependencies
6. Run `cd frontend && npm run dev` to run the frontend locally
7. Run `cd backend && npm run dev` to run the backend locally

# ChangeLog

## 11-05-2025 Updates by Zhang Ka Sing

###  Fixed and Added the following features:
1. Profile Page Improvements:
- Fixed profile page data fetching from backend
- Added proper user information display
- Implemented loading and error states

2. Admin Mode Implementation:
- Added admin role verification middleware
- Implemented admin-specific post deletion permission
- Added admin mode visual indicator in header

3. Login/Register Form Improvements:
- Added specific password requirements message
- Added two times repeated password validation
- Added password strength indicator
- Account lockout after multiple failed attempts


## 11-05-2025 Updates by Baichuan ZENG

1. Update password set-up policy:
- at least one upper case, one lower case and one number
- minimum length 8 characters

2. Update Comment Post function:
### Backend
- add addCommentToPost(), likeComment(), dislikeComment() functions in postController.js
- update commentSchema in Post.js
- update postRoutes.js due to new functions
### Frontend
- update PostDetail.jsx to handle comment
- show no. of comments
- show time of comments
### REMIND
- Modify frontend/src/pages/PostDetail.jsx when deplying

## 11-05-2025 Updates by Peng Minqi
### Fixed and Added the following features:
### Implementations:
   - Implement likes and dislikes methods:
    User can like or dislike posts.
    Clicking like on a disliked post will remove the dislike and add a like; otherwise, it will remove the like and add a dislikes.
    The like/dislike count is displayed next to the repective buttons.
   - Implement post read more/show less:
    Clicking "Read more" expands the content to full length;
    Clicking "Show less" collapses the content to truncated view.
   - Implement post detail page:
    clicking post will redirect to a post detail page;
    post content display;
    navigation feature, containing Back button;
    interaction features: like/dislike posts and comments;
    some changes on comment system: comment list, comment interactions.
### Fix bugs:
   - collarborate with David to fix some bugs in likes and dislikes
   - some frontend view bugs, like zoom rate and feed view:
    Improve the adaptability of web pages to front-end display functions at different zoom rates；
    Improve the frontend performance the webpages.

## 11-05-2025 Updates by Kwok Kam Wong

### Added the following things:

- Fixed the bug that logged in user cannot like/unlike a post
- Use optimistic like for a post. (Local change not necesasrily reflect the server state)
- Removed redundant code in the frontend
- Store user_id in local storage for later use
- Set JWT token expiry time to 1m (will change back to 15m: first time and 7d: refresh later)
- Code review and bug identification
- Recheck SRS and design implementation to make sure correct project alignment

## 10-05-2025 Updates by Zhang Ka Sing

### Fixed and Added the following features:

1. Bug Fixes:

   - Fixed the issue where usernames were not displaying correctly in posts
   - Fixed the post deletion functionality
   - Implemented post deletion restriction (only post authors can delete their own posts)

2. UI Improvements:
   - Optimized frontend page layout and design
   - Added a basic profile page for users (Access by clicking on your username in the header)
   - Enhanced overall user experience

## 09-5-05-2025 Updates by Kwok Kam Wong

### Added the following things:

- Instructions on how to run the project locally
- Modified the Post Model to embed comments and display comment count.
- Modified the User Model to include role field.
- Modified the authMiddleware to provide more detailed error messages.
- Fixed 'cannot create post' bug, now you can create a post if you are signed in.
- Focus on geting all posts and creating posts only. Modified the routes and controllers to focus on these two functionalities.
- Added a TODO:
  - Display username instead of user ID in the posts.

## 03-05-2025 Updates by Baichuan ZENG

### I made some modifications:

- Fixed the bug which for unsuccessful sign-in of account.

### Some ToDos:

- Limit the time of like/dislike of the post to one.
- Limit the deletion function of post to author and admin only.

## 01-05-2025 Updates by Zhang Ka Sing

I've implemented a complete user authentication system and merged it with the existing codebase. Here's what I've added:

1. Frontend Changes:

- Added Login component with form validation
- Implemented user authentication state management
- Added user interface elements (username display, logout button)
- UI with responsive design

2. Backend Changes:

- Added user authentication routes (/api/users/register and /api/users/login)
- Implemented JWT-based authentication
- Added user model and controllers

3. Security Features:

- Implemented password hashing
- Added JWT token validation

## 27-04-2025 Updates by Wong Kwok Kam

I've fixed a problem when connecting to MongoDB in local development.

Features added / modified:

1. User model

2. Post controller to incorporate user model

3. Error function for easier error handling in backend

4. Fixed code duplication in backend/api/index.js, migrate the logic to backend/index.js -> need to be tested by re-deployment

5. Added .env.example, removed committed .env and .env.production for security reasons.

## 16-04-2025 Updates by Baichuan ZENG

I've made comprehensive changes to implement the unlike functionality and comment feature:

1. Updated the Post component to:

- Add an unlike button
- Add a comment section with a toggle
- Display comment count
- Handle comment submission

2. Created a new CommentForm component that:

- Provides a textarea for comment input
- Handles form submission
- Shows error messages
- Disables functionality when offline

3. Updated the PostsContext to:

- Add unlike functionality
- Add comment management
- Handle offline mode for comments
- Update the UI state accordingly

4. Added new CSS styles for:

- Unlike button
- Comment section
- Comment form
- Individual comments
- Action buttons

The new features include:

- Unlike button next to the like button
- Comment count display
- Expandable comment section
- Comment form with validation
- Styled comment list
- Offline support for all new features

## 14-04-2025 Updates by Baichuan ZENG

I've implemented a simple but comprehensive set of functions for both frontend and backend. Here's what I've created:

- Backend:
  MongoDB Post Model: Created a schema for posts with fields for title, content, author, likes, and creation date.
  Database Connection: Set up a MongoDB connection configuration with error handling.
  Post Controller: Implemented controller functions for CRUD operations (Create, Read, Update, Delete) and a like function.
  Routes: Created API routes for posts with appropriate HTTP methods.
  Express Server: Updated the main server file to use routes and DB connection.
  Deployed on Vercel https://vercel.com/nokktsangs-projects/buzz-net-backend

- Frontend:
  Post List Component: Fetches and displays posts from the API.
  Post Item Component: Displays individual posts with formatted date, expandable content, and like functionality.
  Post Form Component: Allows users to create new posts with validation.
  Main App Component: Integrates all components with a clean layout and refresh functionality.
  Real-time refreshing of the webpage
  CSS Styling: Added comprehensive styling for a modern, responsive UI.
  Deployed on Vercel https://vercel.com/nokktsangs-projects/buzz-net-frontend

- Database:
  Collections: posts
  Deployed on MongoDB https://cloud.mongodb.com/v2/67fc861383cfad4a0275d512#/overview

- To use this application locally:
  Start the backend server: cd BuzzNet/backend && npm run dev
  Start the frontend development server: cd BuzzNet/frontend && npm run dev

- Check out the prototype on: https://buzz-net-tau.vercel.app/ and https://github.com/NokkTsang/BuzzNet

## 22-03-2025 Suggestions from Professor

Adding more details:

- Encryption
- Rate Limit
- Internationalization
- Provide reason on choosing MongoDB

Communication between frontend and backend: RESTful API Information

Consider removing some part due to tiem limit

## 27-03-2025 Division of labor

Added [Developer's Role](#developers-role)

## 03-04-2025 Modifying development setup guide

Removed ssh mount, change to https instead (easier set up)
