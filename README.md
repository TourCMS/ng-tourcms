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


#### [Check Tour Availability](http://www.tourcms.com/support/api/mp/tour_checkavail.php)
Check availability for a specific date and number of people on a specific tour.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).

 The following example checks availability for 2 people
 on the first rate (e.g. usually "2 Adults") on the 30th Jan 2015 for Tour ID 1 on Channel 3930.
```js
tourcmsApiService.checkTourAvailability({
      channelId: 3930,
      qs: {
        id: 1,
        date: '2015-30-01',
        r1: 2
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


#### [Show Promo Code](http://www.tourcms.com/support/api/mp/promo_show.php)
Get details on a promotional code. Ueful for checking whether a promo code is valid
for a certain channel, and if so, whether a membership number or similar is required
to verify the promo.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).

 The following example tries to show promo code 'TENPERCENT' on Channel 3930.
```js
tourcmsApiService.showPromo({
      channelId: 3930,
      promo: 'TENPERCENT'
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

### Booking APIs

#### [Search Bookings](http://www.tourcms.com/support/api/mp/booking_search.php)
Search for bookings, view basic details about each.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).

The following example searches for active bookings made in June 2014 on Channel 3930.
```js
tourcmsApiService.searchBookings({
      channelId: 3930,
      qs: {
        active: 1,
        made_date_start: '2014-06-01',
        made_date_end: '2014-06-30'
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
#### [Show Booking](http://www.tourcms.com/support/api/mp/booking_show.php)
Get details on a specific Booking.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service (see above).

The following example tries to show Booking 3770 on Channel 3930.
```js
tourcmsApiService.showBooking({
      channelId: 3930,
      bookingId: 3770
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
