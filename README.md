# Contentful Course Editor
## Page Extension for the Contentful CMS

## Features

- Imports all content type 'lessons' on load only showing relavent information
- Allows for additino, deletion and ordering of lessons in a course 
- Uses JSON objects to save lesson information
- displays durations of entire course from the sum of individual lesson durations

## TO RUN

git clone this repo then cd into the folder
```
cd course-scheduler
```
install dependencies
```
npm i
```
fire up the dev server
```
npm run start
```

## FURTHER DEVELOPMENT / NOTES

- gotcha - setting the value of a JSON object does not need to be parsed, but it must be an object!
- set content-types to be scheduled at instancing initiation and check that content-type has field duration
