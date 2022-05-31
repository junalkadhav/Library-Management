# Library-Management 
## This project uses Node.js Microservices and RESTful APIs
This project demonstrates digital book library management system, In this project there are two Microservices as listed below:
- User Service
- Book Service

### Overview
These services communicate each other via RESTful APIs. All user realted service's are provided by user service, and all the book realted service's are provided by book service.

In this application there are three type of user roles available:
- Super-Admin - Manages all the user's ( change user role [ SuperAdmin, Admin, User ] change user status [ active, disabled ] )
- Admin - Manages books ( perform CRUD operations on books )
- User - Can access books, mark them as favourites and remove them from favourites.

All these API's are secured by authorization and authentication ( A "User" cannot perform tasks for which he/she is not authorized )

## Requirements

* [MongoDB atlas](https://www.mongodb.com/cloud/atlas/register)
* [NodeJS](https://nodejs.org/en/download "NodeJS")

## Project Set-up
### Installing Node dependencies
As these are microservices we have to set-up them seperately

Use the following command inside a particular `SERVICE` folder to install all the required dependencies for that service.

For ex. to install dependencies for User service go inside the `User Service` folder there in the terminal run the following command.

( Similarly do for other services ) :

```sh
npm install
```

See `package.json` for more details.
### Setting up Environment variables
Certain values such as your database credentials, database-name, your service urls.. etc keep changing as they are different and dynamic for each user these values can be referred as environment variables, In this project these varibles are stored in the `.env` file in each service folder. you have to insert your own credentials there to set-up this project to make it work.

To pass a credential/value to your enviroment variable in `.env` file use below syntax:
```env
DATABASE_NAME="Book_database"
```
here `Book_database` is your credential/value.

* To know more about environment variables in Node.js click [here](https://nodejs.dev/learn/how-to-read-environment-variables-from-nodejs)
## Build for local development

As these are microservices we have to build and run them seperately

Use the following command inside a particular `SERVICE` folder to build & start a development server for that service.

( Similarly do for other services ) :

```sh
npm run start:dev
```

See `package.json` for more details.
## Tests

Following tests libraries are used for writing test scripts:
* [MochaJS](https://mochajs.org "MochaJS")
* [SinonJS](http://sinonjs.org "SinonJS")
* [ChaiJS](http://chaijs.com/ "ChaiJS")

Tests are kept in root folder next to app.js

Use following command inside a particular `SERVICE` folder to run tests for that service.

( Similarly do for other services ) :

```sh
npm test
```
