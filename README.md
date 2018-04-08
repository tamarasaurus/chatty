# chatty
realtime websockets chat inspired by 2000s ICQ. you can chat in real-time, everybody can see what you write before hitting enter, and maximum 20 concurrent users.


![intro](https://user-images.githubusercontent.com/1336344/38470062-09ac36cc-3b5e-11e8-950a-daaedc26bff2.png)

![chat](https://user-images.githubusercontent.com/1336344/38470063-0b885d40-3b5e-11e8-9258-b138013813b6.png)


### setup

backend:
- [Set up and install redis](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-redis-on-ubuntu-16-04)
- [Install nodejs 8.9.4](https://nodejs.org/en/) or above

frontend:
- [Install yarn](https://yarnpkg.com/lang/en/)
- Run `yarn install && yarn run start`
- Go to `http://localhost:8080`


### tasks

- [x] Persist connections
- [x] Add different colors for uncommitted lines
- [x] Usernames
- [x] Store the last 5 minutes of messages
- [x] Store clients and messages in redis
- [x] Page style
- [x] Add simple color formatting
- [x] Add different colors for users
- [ ] Deploy to heroku