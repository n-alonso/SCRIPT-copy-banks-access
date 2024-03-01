# postman-script

## Overview

This is a tool I developed in one of my previous jobs to help another team perform some tasks that they were not able to.

## Problem Description

The Operations team was not able to delegate/copy application's access to more than 1 bank at a time.
The API endpoint that performs this task only accepts 1 application-source, 1 application-target, and 1 bank.  
The Operations team was not technical and did not know how to perform HTTP requests outside of Postman or how to modify Postman's behaviour with scripts.

## Goals

* Automate the process to require less manual work.
* Speed up the process for the team to be more time efficient.
* Easy to perform task with minimal technical knowledge.

## Description

This script allows for a Postman collection to run and repeat the same request over and over again, while iterating through 2 array:
* Application-targets Array
* Banks Array

The collection will run the request as many times as necessary while also implementing some basic error handling to minimise the previous Postman knowledge required.
