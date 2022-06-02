# Brad&rsquo;s MERN Stack Example

The database connection string value we will use in our Node code:

```
"mongodb://root:root@localhost:27017/AmazingMernApp?&authSource=admin"
```

The database connection string value we will use in the MongoDB Compass app:

```
mongodb://root:root@localhost:27017/
```

- [Node.js](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Visual Studio Code](https://code.visualstudio.com/)

## React Tip Regarding Props

If you have an object with several properties that you want to pass as props, you can use the following spread syntax. For example, this would save us from having to manually type out the props for name, species, photo and \_id:

```
<AnimalCard {...animal} key={animal._id} />
```
