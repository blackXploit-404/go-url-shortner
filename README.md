## go-url-shortner

A lightweight URL shortening service built with Go for high-performance URL storage and retrieval. The application uses an in-memory database for extremely fast operations and UUID-based ID generation to ensure unique short URLs for every request.
previosuly it was using md5 based hash algo to generate short ids but the thing is that its created collisons when the same url is shortened multiple times. So now it is using uuid based id generation to ensure unique short urls for every request.

to test it : 

```bash 
go run main.go
```
and then 
```bash
curl -X GET http://localhost:3000/shorten \
     -H "Content-Type: application/json" \
     -d '{"url": "https://visitportugal.com"}'
```
result : 
```
{"short_url":"http://localhost:3000/redirect/5c4c05a5"}
```
nothing fancy just created for own go learning stuffs.