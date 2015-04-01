# TopBlogger

The application will consist of a web UI and API. We are building the API first.

## API

Please see the [project wiki](https://github.com/topcoderinc/TopBlogger/wiki) for more info especially the [API Contributing page](https://github.com/topcoderinc/TopBlogger/wiki/API---Contributing). Initial documentation for the API can be [found here](https://docs.google.com/a/appirio.com/document/d/1ftQx9W2P2I9SzWCVyNnnihBCnyZv8MguWOflduMwau8/edit#).

During development you may want to disable the authentication requirement. To force authorization for a route, simply add `AuthChecker` to the route like below:

```
/* API endpoint which require auth. */
router.get('/secret', AuthChecker, function (req, res) {
    res.json({
        version: 1.0
    });
});
```
