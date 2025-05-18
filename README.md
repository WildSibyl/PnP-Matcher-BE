# PnP Matcher API

A community finding application API for the lovers of Pen and Paper games.
Graduation project for the Full Stack Web Development Bootcamp @ WBS CODING SCHOOL.

## Setup

- Fork repo
- Clone into your computer
- `cd` into working directory
- `npm i` to install dependencies
- create a `.env` file with variables:
  - `MONGO_URI` set to a valid MongoDB connection string.
  - `PORT` ONLY in case you want to override the default `8000`

## Commands

- `npm run dev`: Starts development server, pulling environment variables from `.env` file
- `npm start`: Starts production server, pulling environment variables from the systems

## Usage

- The code is organised as follows:

```
PnP-Matcher-BE/
|- controllers/ => Our controller functions per resource
|- db/
|   \_ index.js => Database connection with Mongoose
|- joi/ => JOI schemas for data validations
|- middlewares/ => custom middlewares
|- models/ => Our models per resource
|- routers/ => Our routers per resource
|- utils/ => Utility functions
\_ index.js
```
