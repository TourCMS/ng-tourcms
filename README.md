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
tourcmsApiService.apiRateLimitStatus({channelId: 3930})
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```

#### [Search Tours](http://www.tourcms.com/support/api/mp/tour_search.php)
Search for tours.

If a Channel ID is not provided, the function will use the channel Id
 configured on the service (see above).
```js
tourcmsApiService.searchTours({
      channelId: 3930,
      qs: {
        k: 'rafting',
        order: 'price_down'
      }
    })
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```

#### [Show Tour](http://www.tourcms.com/support/api/mp/tour_show.php)
Show details of a specific tour tour.

If a Channel ID is not provided, the function will use the channel Id
 configured on the service (see above).
```js
tourcmsApiService.showTour({
      channelId: 3930,
      tourId: 1
    })
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```
Also supports passing of the various query string parameters
```js
tourcmsApiService.showTour({
      channelId: 3930,
      tourId: 1,
      qs: {
        show_options: 1,
        show_offers: 1
      }
    })
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```
