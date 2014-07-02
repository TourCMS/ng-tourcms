# ng-tourcms

AngularJS service for accessing the [TourCMS](http://www.tourcms.com) [API](http://www.tourcms.com/support/api/mp/).

## Status

Early code, configuration is hard coded in the script file, not many API methods implemented.

## Dependencies

Requires [SHA256.js](http://pajhome.org.uk/crypt/md5/sha256.html)

Optionally, add [X2JS](http://code.google.com/p/x2js/) to receive JSON back rather than the default XML

## Usage

### Configuration

Currently hard coded in the ng-tourcms.js file.

```js
var apiKey = 'API_KEY_HERE';
var marketplaceId = 0;
var channelId = 0;
```

### API methods

#### [API Rate Limit Status](http://www.tourcms.com/support/api/mp/rate_limit_status.php)
Check the current API rate limit status.
```js
tourcmsApiService.apiRateLimitStatus({channelId:3930})
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```
