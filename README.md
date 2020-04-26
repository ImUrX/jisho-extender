# jisho-extender is a scrapper that extends the current "official" API
This is not a library, this is a server, thought for running it as a "microservice"

### **GET** `/search/words?keyword=${param}`
It's the same as the current Jisho API but it adds 2 new properties
```js
const word = data[0];
console.log(word.audio) /*
    returns {
        mp3: "cloudflare link",
        ogg: "cloudflare link"
    } or returns an empty object
*/
console.log(word.japanese[0].furigana) /*
    (Only on the first index of japanese array)
    returns [
        "す",
        "",
        ""
    ]
    This example is from "住まい"
*/
```