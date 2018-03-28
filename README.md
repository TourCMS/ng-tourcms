# ng-tourcms

AngularJS service for accessing the [TourCMS](http://www.tourcms.com) [API](http://www.tourcms.com/support/api/mp/).

## Table of Contents

* [Status](#status)
* [Dependencies / Requirements](#dependencies--requirements)
* [Installation / Configuration](#installation--configuration)
* [Broadcast messages](#broadcast-messages)
* [API method wrappers](#api-methods)
  * [General/ Housekeeping APIs](#general-housekeeping-apis)
    * [API Rate Limit Status](#api-rate-limit-status)
    * [Generic API request](#generic-api-request)
  * [Channel (Operator / Supplier) APIs](#channel-operator--supplier-apis)
    * [List Channels](#list-channels)
    * [Show Channel](#show-channel)
    * [Channel Performance](#channel-performance)
  * [Tour (Product) APIs](#tour-product-apis)
    * [Search Tours](#search-tours)
    * [List Tours](#list-tours)
    * [Show Tour](#show-tour)
    * [Show Tour Dates & Deals](#show-tour-dates-and-deals)
    * [Show Departure](#show-departure)
    * [Update Departure](#update-departure)
    * [Check Tour Availability](#check-tour-availability)
    * [Check Option Availability](#check-option-availability)
    * [Update Tour](#update-tour)
    * [Show Promo Code](#show-promo-code)
  * [Booking APIs](#booking-apis)
    * [Search Bookings](#search-bookings)
    * [Show Booking](#show-booking)
    * [Start New Booking](#start-new-booking)
    * [Delete Booking](#delete-booking)
    * [Commit Booking](#commit-booking)
    * [Cancel Booking](#cancel-booking)
    * [Add Note to Booking](#add-note-to-booking)
    * [Search Vouchers](#search-vouchers)
    * [Redeem Voucher](#redeem-voucher)
    * [Add booking component](#add-booking-component)
    * [Remove booking component](#remove-booking-component)
    * [Update booking component](#update-booking-component)
    * [Send booking email](#send-booking-email)
  * [Payment APIs](#payment-apis)
    * [Create Payment](#create-payment)
    * [Spreedly Create Payment](#spreedly-create-payment)
    * [List Payments](#list-payments)
    * [List Staff Members](#list-staff-members)
  * [Customer / Enquiry APIs](#customer--enquiry-apis)
    * [Show Customer](#show-customer)
  * [Travel Agents](#travel-agents)
    * [Search Agents](#search-agents)
  * [Internal Supplier APIs](#internal-supplier-apis)
    * [Show Supplier](#show-supplier)

## Status

Fairly stable, see Issues for more detail. Not all API methods implemented.

## Dependencies / Requirements

1. Requires [SHA256.js](http://pajhome.org.uk/crypt/md5/sha256.html)

2. Optionally, add [X2JS](http://code.google.com/p/x2js/) to receive JSON back rather than the default XML

3. At the time of writing TourCMS API does not support [CORS](http://www.w3.org/TR/cors/), thus this library is largely
intended for use developing with AngularJS in native wrapper environments such as Cordova (Phonegap).

  If using Cordova (Phonegap) you may need to whitelist network access to the TourCMS API on`https://api.tourcms.com` and - if you are linking to TourCMS hosted images - our media CDN on `http://media.tourcms.com` and `http://*.rackcdn.com`.

## Installation / Configuration

Ensure `ng-tourcms.js` is included in your project, `tourcms.ng-tourcms` is required by your module and `tourcmsApiService` is injected wherever it will be used.

Call the `configure` method on `tourcmsApiService` to set your API parameters. `channelID` can alternatively be passed when
making API calls; those accessing the API as an Agent and thus working with multiple Channels will likely work in that way
rather than configuring here.

Typical Tour Operator configuration:

```js
tourcmsApiService.configure({
      private_key: 'Your API Key',
      channel_id: 'Your Channel ID'
    });
```

Also supports multiple channel credentials, passed as an array

```js
tourcmsApiService.configure([
      {
      private_key: 'Your API Key',
      channel_id: 'Your Channel ID'
      },
      {
      private_key: 'Your second API Key',
      channel_id: 'Your second Channel ID'
      }
    ]);
```


Typical Marketplace Agent configuration (working with multiple Channels):


```js
tourcmsApiService.configure({
      private_key: 'Your API Key',
      marketplace_id: 'Your Marketplace ID'
    });
```

## Broadcast messages

In addition to returning error messages provided by TourCMS directly, the app will also broadcast messages to rootScope in certain situations. All messages are prefaced `ng-tourcms:`.

The current list is:

* `ng-tourcms:FAIL_SESSION_EXPIRED_IDLE` - Transmitted whenever an API call is rejected due to a timeout on the users API credentials
* `ng-tourcms:FAIL_SESSION_EXPIRED_DURATION` - Transmitted whenever an API call is rejected due to an expiry of the users API credentials
* `ng-tourcms:FAIL_SIG` - Transmitted when a "FAIL_SIG" response is encountered, likely due to incorrect API credentials

Currently requires X2JS (see [Dependencies / Requirements](#dependencies--requirements) above).

## API method wrappers

### General/ Housekeeping APIs

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

#### Generic API request
Provides an interface for calling APIs with no specific wrapper function.

E.g. to simulate API Rate Limit Status (above):
```js
tourcmsApiService.genericRequest({
        channelId: 3930,
        path: '/api/rate_limit_status.xml'
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
Can also provide a `verb` (default is 'GET') and
`postData`, which - if provided - must be a DOM document representing the XML data
to post to the API.

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
 configured on the service.
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
List top 50 Channels by number of unique visitor clicks (or check performance for a specific channel).

Optonally supply an object containing a `channelId` to just return a specific Channel.

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
Search Tours.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.
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
List Tours.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.
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
Show details of a specific Tour.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.
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
 configured on the service.
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


#### [Show Departure](http://www.tourcms.com/support/api/mp/tour_datesprices_dep_manage_show.php)
Show a departure, designed for managing dates and prices rather than displaying to customers. Includes the loaded rates, spaces, special offer details, bookings etc.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.
```js
tourcmsApiService.showDeparture({
      channelId: 3930,
      tourId: 1,
      departureId: 8117
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

#### [Update Departure](http://www.tourcms.com/support/api/mp/tour_datesprices_dep_manage_update.php)
Update a departure.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

If X2JS is being used, departure data can be provided as an object
```js
tourcmsApiService.updateDeparture({
      channelId: 3930,
      departure: {
        tour_id: 1,
        departure_id: 1234,
        special_offer: {
          offer_price: 45,
          offer_note: "Early booking discount"
        }
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
If X2JS is not being used, tour data must be provided as an XML string
```js
tourcmsApiService.updateDeparture({
      channelId: 3930,
      tour: '<departure> ... <special_offer><offer_price>45</offer_price></special_offer></departure>'
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
 configured on the service.

 The following example checks availability for 2 people
 on the first rate (e.g. usually "2 Adults") on the 30th Jan 2015 for Tour ID 1 on Channel 3930.
```js
tourcmsApiService.checkTourAvailability({
      channelId: 3930,
      qs: {
        id: 1,
        date: '2015-01-30',
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

#### [Check Option Availability](http://www.tourcms.com/support/api/mp/tour_checkavail_options.php)
Check for Option availability.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

If X2JS is being used, tour data can be provided as an object
```js
tourcmsApiService.checkOptionAvailability({
      channelId: 3930,
      qs: {
        booking_id: 12662,
        tour_component_id: 8052295
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

#### [Update Tour](http://www.tourcms.com/support/api/mp/tour_update.php)
Update the main details on a Tour, currently supports updating the Tour URL only.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

If X2JS is being used, tour data can be provided as an object
```js
tourcmsApiService.updateTour({
      channelId: 3930,
      tour: {
        tour_id: 1,
        tour_url: '/example-tour_1/'
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
If X2JS is not being used, tour data must be provided as an XML string
```js
tourcmsApiService.updateTour({
      channelId: 3930,
      tour: '<tour><tour_id>1</tour_id><tour_url>/example-tour_1/</tour_url></tour>'
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
 configured on the service.

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
 configured on the service.

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

If a Channel ID is not provided, the function will use the Channel ID configured on the service.

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

#### [Start New Booking](http://www.tourcms.com/support/api/mp/booking_start_new.php)
Create a temporary booking, holding stock.

If a Channel ID is not provided, the function will use the Channel ID configured on the service.

If X2JS is being used, booking data can be provided as an object
```js
tourcmsApiService.startNewBooking({
      channelId: 3930,
      booking: {
        total_customers: 2,
        components: {
          component: [
            {
              component_key: 'YYY-YYYYYYY-YYYYY',
              note: 'Some text'
            },
            {
              component_key: 'ZZZ-ZZZZZZZ-ZZZZZ',
              note: 'Extra info',
              pickup_key: 'TTT-TTTTTTTTT-TTTTTT'
            }
          ]
        }
        customers: {
          customer: [
            {
              firstname: 'Joe',
              surname: 'Bloggs'
            }
          ]
        }
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
If X2JS is not being used, booking data must be provided as an XML string
```js
tourcmsApiService.startNewBooking({
      channelId: 3930,
      booking: '<booking><total_customers>2</totalcustomers><components> ... etc ... </components></booking>'
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

#### [Delete Booking](http://www.tourcms.com/support/api/mp/booking_delete.php)
Delete a temporary booking, releasing stock.

If a booking has been committed (see below) it can no longer be deleted, instead cancel it using the "Cancel Booking" method.

If a Channel ID is not provided, the function will use the Channel ID configured on the service.

```js
tourcmsApiService.deleteBooking({
      channelId: 3930,
      bookingId: 1234
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

#### [Commit Booking](http://www.tourcms.com/support/api/mp/booking_commit_new.php)
Convert a temporary booking into a proper booking.

If a Channel ID is not provided, the function will use the Channel ID configured on the service.

If X2JS is being used, booking data can be provided as an object
```js
tourcmsApiService.commitBooking({
      channelId: 3930,
      booking: {
        booking_id: 1234,
        suppress_email: 1
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
If X2JS is not being used, booking data must be provided as an XML string
```js
tourcmsApiService.commitBooking({
      channelId: 3930,
      booking: '<booking><booking_id>1234</booking_id><suppress_email>1</suppress_email></booking>'
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
#### [Cancel Booking](http://www.tourcms.com/support/api/mp/booking_cancel.php)
Cancel a committed booking.

If a Channel ID is not provided, the function will use the Channel ID configured on the service.

```js
tourcmsApiService.cancelBooking({
      channelId: 3930,
      bookingId: 1234,
      note: 'Some reason for cancellation'
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

#### [Add Note to Booking](http://www.tourcms.com/support/api/mp/booking_note_new.php)
Add a note to a booking.

There are multiple note types that can be used, see the API documentation linked above for details.

If a Channel ID is not provided, the function will use the Channel ID configured on the service.

```js
tourcmsApiService.addNoteToBooking({
      channelId: 3930,
      bookingId: 1234,
      noteType: 'AUDIT',
      noteText: 'Some text to add to booking'
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

#### [Search Vouchers](http://www.tourcms.com/support/api/mp/voucher_search.php)
Provide the barcode data from a TourCMS (or OTA) voucher and receive a list of matching components.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

 NB: At the time of writing the text displayed under the barcode on TourCMS vouchers is __not__
 the same as the text contained within the barcode. For testing purposes grab the _barcode_data_ from
 one of the Booking APIs or decode the QR code on a voucher.

```js
tourcmsApiService.searchVouchers({
      channelId: 3930,
      voucherString: 'TOURCMS|4069|4112'
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

#### [Redeem Voucher](http://www.tourcms.com/support/api/mp/voucher_redeem.php)
Redeem (Check in) a particular component using a key obtained from "Search Vouchers".

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

```js
tourcmsApiService.redeemVoucher({
      channelId: 3930,
      key: 'Ax9SLSJFLSFJLS/oZu9NhurfJ8RMibtHmrL2kT6w=',
      note: 'Optionally add a note here'
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

#### [Add booking component](http://www.tourcms.com/support/api/mp/booking_add_component.php)
Add a Tour (with or without Options) to a booking, or add Options to an existing Tour that is already on a booking.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

```js
tourcmsApiService.addBookingComponent({
      channelId: 3930,
      booking: {
        booking_id: 12920,
        component: {
          component_key: '500II4/cOf21qGqulu6E5lU9rjOa5qvmibXKFMh3otSkgCsUAbrdap/7CTxDKl+p'
        }
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

#### [Remove booking component](http://www.tourcms.com/support/api/mp/booking_remove_component.php)
Remove a tour from a regular (i.e. non-temporary, non-archived) booking.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

```js
tourcmsApiService.removeBookingComponent({
      channelId: 3930,
      booking: {
        booking_id: 12920,
        component: {
            component_id: 8285991
        }
      }
    })
    .success(function(data, status) {
      console.log('Success');
      console.info(data);
    })
    .error(function(data, status) {
      console.info(data || "Request failed");
      console.info(status);
    });
```

#### [Update booking component](http://www.tourcms.com/support/api/mp/booking_update_component.php)
Change some details of a particular booking component (tour/option/fee).

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

```js
tourcmsApiService.updateBookingComponent({
      channelId: 3930,
      booking: {
        booking_id: 12920,
        component: {
            component_id: 8286001,
            sale_quantity: 3
        }
      }
    })
    .success(function(data, status) {
      console.log('Success');
      console.info(data);
    })
    .error(function(data, status) {
      console.info(data || "Request failed");
      console.info(status);
    });
```

#### [Send booking email](http://www.tourcms.com/support/api/mp/booking_send_email.php)
Send one of the pre-configured email templates.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

```js
tourcmsApiService.sendBookingEmail({
      booking: {
        booking_id: 12920,
        email_type: 1
      }
    })
    .success(function(data, status) {
      console.log('Success');
      console.info(data);
    })
    .error(function(data, status) {
      console.info(data || "Request failed");
      console.info(status);
    });
```



### Payment APIs
### [Create Payment](http://www.tourcms.com/support/api/mp/payment_create.php)
Store details of a payment in TourCMS.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

 ```js
 tourcmsApiService.createPayment({
       channelId: 3930,
       bookingId: 1234,
       paymentValue: 100,
       creditcardFeeType: 0,
       paymentType: "Amex"
       currency: 'GBP'
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

### [Spreedly Create Payment](http://www.tourcms.com/support/api/mp/spreedly_payment_create.php)
Specialised version of "Create Payment" for those using TourCMS [Spreedly integration](http://www.tourcms.com/support/payments/spreedly.php).

Accepts a [Spreedly payment method token](https://docs.spreedly.com/basics/payment-method/), processes the payment via Spreedly and in the case of a successful payment, commits the booking and records details of the payment in TourCMS.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

 ```js
 tourcmsApiService.createPayment({
       spreedlyPaymentMethod: 'SPREEDLY_PAYMENT_METHOD_TOKEN'
       channelId: 3930,
       bookingId: 1234,
       paymentValue: 100,
       creditcardFeeType: 0,
       paymentType: "Amex"
       currency: 'GBP'
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

### [List Payments](http://www.tourcms.com/support/api/mp/payments_list.php)
List of payments made during a specifif period and/or from staff member. Can be called by operators or travel agents.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.

 ```js
 var qs = {
      from_date: "2018-03-23",
      to_date: "2018-03-26"
    };

 tourcmsApiService.paymentsList({
        channelId: 3930,
        qs
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

### Customer / Enquiry APIs
#### [Show Customer](http://www.tourcms.com/support/api/mp/customer_show.php)
Get details on a specific customer.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.
```js
tourcmsApiService.showCustomer({
      channelId: 3930,
      customerId: 1
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

### Travel Agents
#### [Search Agents](http://www.tourcms.com/support/api/mp/agent_search.php)
Get a list of Travel Agents.

If a Channel ID is not provided, the function will use the Channel ID
configured on the service.
```js
tourcmsApiService.searchAgents({
  channelId: 3930,
  qs: {
    order: 'toprecent',
    filter: 'staff_ui'
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

### List Staff Members
#### [List Staff Members](http://www.tourcms.com/support/api/mp/#)
Get a list of staff members. Only available for operators, no travel agents.

If a Channel ID is not provided, the function will use the Channel ID
configured on the service.
```js
tourcmsApiService.staffMembersList({
  channelId: 3930
}).success(function(data, status) {
  console.log('Success');
  console.log(data);
})
.error(function(data, status) {
  console.log(data || "Request failed");
  console.log(status);
});
```

### Internal Supplier APIs
#### [Show Supplier](http://www.tourcms.com/support/api/mp/supplier_show.php)
Get details on a specific Supplier.

If a Channel ID is not provided, the function will use the Channel ID
 configured on the service.
```js
tourcmsApiService.showBooking({
      channelId: 3930,
      supplierId: 1
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
