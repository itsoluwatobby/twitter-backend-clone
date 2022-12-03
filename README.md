# Twitter Clone ---BACKEND
## Description
> A personal full stack project on twitter web page replication
___
## **Tools Used**
* Javascript (**_NODE.JS_**)

```javascript
npm install
```
---
---
> **AUTHENTICATION**
---

New registered users are will be required to go through a email verification process. The email verification link could only be used once and only lasts for 15 minutes after which it expires.

_**incase of expired email verification link:**_ The user will be required to login with the registered credentials then a new email verification link will be sent to the user and this link will only last for 25 minutes before it expires.

Unverified users will not be granted access to perform all _**CRUD**_ operations until the account is verified.

---
> **AUTHORIZATION**
---

Upon user login, every user is granted an access token which lasts for only 2 hours. This token authorizes a user's access to the site's available resource. 

Upon registration, each user is given the role of a USER which is the default role assigned to all registered users.

>**Granting of Roles**

Admin role has the ability of granting additional roles to a specific user

---
---

## _Some of The Dependencies Used_
* bcrypt
* jsonwebtoken
* nodemaiiler
* cors
* mongoose

***
## _FEATURES_
* [x] Tweets creation
* [x] Toggle tweets like and unlike
* [x] Tweets update
* [x] Tweets deletion
* [x] Fetching of tweets
* [x] Commenting on tweets
* [x] Edit comment on tweets
* [x] delete comment on tweets
* [x] Like and unlike comments on tweets
* [x] Replying comments on comment
* [x] Edit response on comment
* [x] delete response on comment
* [x] Like and unlike response on comment
* [x] Tweets share
* [x] Tweets retweet
* [x] Role Based authentication
* [x] Users get the role of a USER by default
* [x] Admin can fetch all user
* [x] Role and token based authentication
* [x] following and unfollowing a user
* [x] Granting of roles to users by only admin
* [x] Deleting of posts/users by only admin
* [x] Locking and Unlocking of users account by admin by only admin
* [x] Users can update their info
* [x] Users can delete their account
* [x] Email verification based registration
* [x] Email verification based password reset


