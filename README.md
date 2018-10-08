# StationCast
A cross platform Podcast platform based on an Angular frontend and NodeJS backend.

## Features
* Podcast browser
* Automatic podcast metadata download
* Audio playlist

## Server deploy
1. cd /path/to/backend/folder/
2. docker-compose up -d
3. docker attach [docker_image_name]
4. npm install
5. npm start
6. ctrl+P
7. ctrl+q

## Client deploy
1. cd /path/to/frontend/folder/
2. docker-compose up -d
3. docker attach [docker_image_name]
4. npm install
5. npm start
6. ctrl+P
7. ctrl+q

## TODO
- [ ] Manually edit Podcast info
- [ ] Delete Podcast
- [ ] Episode sorting
- [ ] Mobile player layout fix
- [ ] Audiobook browser

## FAQ
#### Where are my podcasts?
If you want to backup or access you podcast audio files, check the files/ folder in the backend root path.

##

You can follow the app development in our [Trello board](https://trello.com/b/HiThha8b). Feel free to stop by and add you sugestions.
