# Book Service

Add these endpoints after your api url ( like: `http://<HOST>:<PORT>/book/<ENDPOINT>`)

Available endpoints:
| Method | Endpoint            | Info                                                                                         |Body Structure for Post/Put metods |
| ------ |---------------------| -------------------------------------------------------------------------------------------- |-----------------------------------|
| GET    |`/get-books`         | Takes optional query parameters `get-books?id=bookId(s)` *OR* `get-books?search=HarryPotter` |                                   |
| POST   |`/create-book`       ||`{"title":"bleh","isbn":"12345","publicationYear":"2022","authors":["sam"],"genres":["comedy"],"awardsWon":["big"]}`             |
| PUT    |`/update-book/bookId`|Needs path parameter ( i.e bookId ) |`{"title":"bleh","isbn":"12345","publicationYear":"2022","authors":["sam"],"genres":["comedy"],"awardsWon":["big"]}`|
| DELETE |`/delete-book/bookId`|   Needs path parameter ( i.e bookId )                                                        |                                   |

*In order to use these services you need to send Bearer Token with each request you make, token will be generated after successfull login*
