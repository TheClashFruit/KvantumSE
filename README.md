<h1 align="center"><img alt="KvantumSE" src="https://kvantumse.herokuapp.com/assets/KvantumSE.png"></h1>
<p align="center">
  <img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fkvantumse.herokuapp.com%2F">
  <img alt="Discord" src="https://img.shields.io/discord/852874519684186113">
</p>

<p align="center">
  This search engine is a for-fun and learing project, it may die soon.
</p>

## API
### Search

`GET https://kvantumse.herokuapp.com/api/v1/search?q=query`

Example Response:
```json
[
  {
    "id": 0,
    "url": "https://www.theclashfruit.ga/",
    "title": "TheClashFruit &bull; Home",
    "added_date": "2021-10-20T12:32:54.000Z",
    "updated_date": "2021-10-20T12:32:54.000Z"
  },
  ...
]
```

### Search v2

`GET https://kvantumse.herokuapp.com/api/v2/search?q=TheClashFruit`

Example Response:
```json
{
  "status": 1,
  "query": "TheClashFruit",
  "message": [
    {
      "id": 0,
      "url": "https://www.theclashfruit.ga/",
      "html_title": "TheClashFruit &bull; Home",
      "title": "TheClashFruit • Home",
      "meta": {
        "name": "TheClashFruit &bull; Home",
        "description": "Hello! I'm TheClashFruit, I make a lot of stuff like discord bots, android applications, games, websites, and a lot more!",
        "keywords": "TheClashFruit, tcf, clash, fruit",
        "theme-color": "#00796B",
        "og:title": "TheClashFruit &bull; Home",
        "og:url": "https://www.theclashfruit.ga",
        "og:image": "https://www.theclashfruit.ga/favicon.ico",
        "og:description": "Hello! I'm TheClashFruit, I make a lot of stuff like discord bots, android applications, games, websites, and a lot more!"
      }
      "added_date": "2021-10-20T12:32:54.000Z"
    },
    ...
  ]
}
```

### Favicon

`GET https://kvantumse.herokuapp.com/api/v2/favicon?url=https://full.url/this_is_a_path/`

Example Response:
```
Will redirect to the favicon image.

https://kvantumse.herokuapp.com/api/v2/favicon?url=https://full.url/this_is_a_path/ > https://full.url/favicon.ico
```
