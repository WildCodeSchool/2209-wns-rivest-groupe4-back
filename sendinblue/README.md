# WCS Codeless project - Sendinblue

### Description

This is a containerized Express.js server used to send emails from the contact page.

### Stack

The tecnologies that are used in this project are:

```
  Express.js
  Typescript
  Cors
  sendinblue/client
  Docker
```

### Links

This is the link to our project repositories :
front-end : [Link](https://github.com/WildCodeSchool/2209-wns-rivest-groupe4-front")

back-end : [Link](https://github.com/WildCodeSchool/2209-wns-rivest-groupe4-back")

mobile-app : [Link](https://github.com/WildCodeSchool/2209-wns-rivest-groupe4-mobile)

### Install instructions

To use sendinblue you will need to install it's dependencies, use the following commands:

```
- npm i
```

You also need to set up environment vairables.

create a .env in sendinblue folder with and define 'PORT=5005' variable and SIB_API_KEY who is your sendinblue api key.

### Run

This container can be run bu using the 'docker-compose up --build' command inside the backend directory.
