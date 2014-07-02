# ng-tourcms

AngularJS service for accessing the [TourCMS](http://www.tourcms.com) [API](http://www.tourcms.com/support/api/mp/).

## Status

Early code, configuration is hard coded in the script file, not many API methods implemented.

## Dependencies

Requires [SHA256.js](http://pajhome.org.uk/crypt/md5/sha256.html)

Optionally, add [X2JS](http://code.google.com/p/x2js/) to receive JSON back rather than the default XML

## Configuration

Currently hard coded in the ng-tourcms.js file.

```js
var apiKey = 'API_KEY_HERE';
var marketplaceId = 0;
var channelId = 0;
```

## API methods

### General API / Housekeeping APIs

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

### Channel (Operator / Supplier) APIs

#### [List Channels](http://www.tourcms.com/support/api/mp/channels_list.php)
List channels.
```js
tourcmsApiService.listChannels()
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```

#### [Show Channel](http://www.tourcms.com/support/api/mp/channel_show.php)
Show details on a specific channel.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).
```js
tourcmsApiService.showChannel({channelId: 3930})
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```

#### [Channel Performance](http://www.tourcms.com/support/api/mp/channels_performance.php)
List top 50 channels by number of unique visitor clicks (or check performance for a specific channel).

Supply a Channel ID to just return a specific Channel.

```js
tourcmsApiService.ChannelPerformance()
    .success(function(data, status) {
      console.log('Success');
      console.log(data);
    })
    .error(function(data, status) {
      console.log(data || "Request failed");
      console.log(status);
    });
```

### Tour (Product) APIs

#### [Search Tours](http://www.tourcms.com/support/api/mp/tour_search.php)
Search for tours.

If a Channel ID is not provided, the function will use the Channel ID
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

#### [List Tours](http://www.tourcms.com/support/api/mp/tours_list.php)
List tours.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).
```js
tourcmsApiService.listTours({
      channelId: 3930
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
tourcmsApiService.listTours({
      channelId: 3930,
      qs: {
        booking_style: "booking",
        qc: 1
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

If a Channel ID is not provided, the function will use the Channel ID
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

#### [Show Tour Dates and Deals](http://www.tourcms.com/support/api/mp/tour_datesdeals_show.php)
List the dates available for a specific tour.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).
```js
tourcmsApiService.showTourDatesDeals({
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
tourcmsApiService.showTourDatesDeals({
      channelId: 3930,
      tourId: 1,
      qs: {
        has_offer: 1,
        distinct_start_dates: 1
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
