# Required Features:

- Global Database (MongoDB)

  - The database must be “global,” meaning that all data from every part of the system should be stored within a single database. In other words, either a centralized or distributed database system can be utilized, provided that there is only one database managing all data across your software components. For example, if SQLite is used, “global” means that there cannot be more than one SQLite database file. All data must be contained within a single SQLite database file to maintain a unified system.

- User Interface

- User Management

  - sign up, log in or log out.

- Licence Management
  - The system should have basic licence management functionalities. It must allow users to use the software only if they can provide a valid licence key or licence key-file. Alicence key is a string, formatted like AAAA-BBBB-CCCC-DDDD, that users enter into the system to confirm their right to use the software or access specific features. A licence key file contains one or more licence keys, allowing the user to specify the file instead of typing all the keys. Possible licensing schemes include a single licence key for the entire system, a separate licence key for individual features, or a licence key that is valid for a specific subscription period (such as those used for services like Nxxflxx).
  - This means that having a user account alone is not sufficient for the user. Licence keys must be provided in order to fully enjoy using the system or accessing specific features.

# Externally Observable Extra Features

1. Post Creation, update and deletion

   - The platform supports content (text-based) creation through a post submission feature available to all registered users.

2. Comment creation and deletion

   - The platform supports comment creation through a post submission feature available to all registered users.

3. Follow

   - The platform supports a follow mechanism that enables users to subscribe to content from specific accounts.

4. 2FA & CAPTCHA

   - The platform offers optional Two-Factor Authentication for enhanced account security, requiring a verification code alongside passwords during login. CAPTCHA verification automatically activates during registration, suspicious logins, and rapid actions to differentiate human users from automated bots.

5. Logging

   - The platform supports intelligent logging system continuously tracks user interactions and system events, including login attempts and data access, etc.

6. Basic account management

   - Including changing profile picture, username, email account, password and account deactivation/deletion options.

# Future considerations

1. Password Reset

2. Post Category

3. Report and Flagging Mechanism

4. Anonymity (anonymous post and comment)

5. Search keywords
