# User Service
Add these endpoints after your api url ( like: `http://<HOST>:<PORT>/user/<ENDPOINT>`)

Available endpoints:
| Method        | Endpoint                      | Info                                                     | Body Structure for Post/Put method                       |
| ------------- | ----------------------------- | -------------------------------------------------------- |:--------------------------------------------------------:|
| POST          |`/register`                     |                                                         | `{"name":"dummy","email":"dummy@email","password":"123"}`|
| POST          |`/login`                        |                                                         | `{"email":"dummy@email","password":"123"}`               |
| GET           |`/favourite-books`              |                                                         |                                                          |
| POST          |`/add-favourite-book`           |                                                         |`{"bookId":"yourBookId"}`                                 |
| POST          |`/remove-favourite-book`        |                                                         |`{"bookId":"yourBookId"}`                                 |
| GET           |`/get-users`                    |Takes optional query parameters `/get-users?id=userId(s)`|                                                          |
| PUT           |`/update-user-permission/userId`|Needs path parameter ( i.e userId )                      |`{"role":"yourValue","status":"yourValue"}`               |
