# Introduction
Vega Solutions Engineering Challenge 1

This is the code repo for the frontend application. It is built with Typescript and NextJS framework. 

# Getting Started

## Prerequisites
Please make sure you have the following installed:
1. Node ( version >= 16 )
2. Docker

## Initial Setup
1. Clone this repo
2. Open a terminal and navigate to the source folder, then run: `npm i` to install the necessary packages

## Running with docker-compose
Run the following from the terminal at the source folder
```
docker compose up --build
```
This will build the image spin up the frontend container at http://localhost:3000

Please make sure to close any other programs using the same port 3000

## Developing
For developing the code, use the `npm run dev` command to start the application with live refresh on save
