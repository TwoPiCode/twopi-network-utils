# twopicode-network-utils
----

##Instructions

```javascript
import { requestFactory, GET, POST, POST_FILE, PUT, DELETE} from 'twopicode-network-utils'

const get = requestFactory(GET)
const post = requestFactory(POST)
const post_file = requestFactory(POST_FILE)
const put = requestFactory(PUT)
const delete = requestFactory(DELETE)


get('http://example.com/api').then(resp => {
	console.log(resp)
})
```

You can optionally pass a function to the factory that triggers a notification. The function takes a single string - the message to be printed.

For any more information you'll have to read the source, sorry!
