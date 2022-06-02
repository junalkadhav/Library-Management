# Book Service

Add these endpoints after your api url ( like: `http://<HOST>:<PORT>/book/<ENDPOINT>`)

Available endpoints:
| Method        | Endpoint      | Info |
| ------------- |-------------| -----|
| GET   | `get-books` | Takes optional query parameters `get-books?id=bookId(s)` *OR* `get-books?search=HarryPotter` |
| POST      | `create-book`     |    |
| PUT | `update-book/bookId`      |   Needs path parameter ( i.e bookId ) |
| DELETE | `delete-book/bookId`      |   Needs path parameter ( i.e bookId ) |
