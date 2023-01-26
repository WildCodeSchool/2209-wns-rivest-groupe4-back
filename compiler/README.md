# WCS Codeless project - Compiler

### Description

This is a containerized Express.js server used for receiving and executing code in an isolated environment.

This is done to ensure that other aspects of this project remain online if there is an error inside the sent code.

### Stack

The tecnologies that are used in this project are:

```
  Express.js
  Typescript
  Cors
  fs-extra
  Docker
```

### Links

This is the link to our project repositories :
front-end : [Link](https://github.com/WildCodeSchool/2209-wns-rivest-groupe4-front")

back-end : [Link](https://github.com/WildCodeSchool/2209-wns-rivest-groupe4-back")

mobile-app : [Link](https://github.com/WildCodeSchool/2209-wns-rivest-groupe4-mobile)

### Install instructions

To use the compiler you will need to install it's dependencies, use the following commands:

```
- npm i
```

You also need to set up environment vairables.

create a .env in the compiler folder with and define 'PORT=7008' variable

### Run

This container can be run bu using the 'docker-compose up --build' command inside the backend directory.
