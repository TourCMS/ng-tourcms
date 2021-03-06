(function(window, angular, Math) {
  angular.module('tourcms.ng-tourcms', [])
 .factory('tourcmsApiService', function($rootScope, $http, $q) {

    var baseUrl = 'https://api.tourcms.com';

    var apiKey = '';
    var marketplaceId = 0;
    var channelId = 0;
    var channels = [];

    // Generic API request function
    var makeRequest = function(a) {
      // If the request is for a different channel to our default
      // AND we aren't a Marketplace partner
      // Get our API key
      if(marketplaceId == 0 && a.channelId != channelId ) {
        angular.forEach(channels, function(chan) {
          if(parseInt(chan.channel_id) == parseInt(a.channelId))
            rApiKey = chan.private_key;
        });
      } else {
        rApiKey = apiKey;
      }

      // Sensible defaults
      if(typeof a.channelId == "undefined")
        a.channelId = 0;

      if(typeof a.verb == "undefined")
        a.verb = 'GET';

      if(typeof a.postData == "undefined") {
        var apiParams = "";
      } else {
        var s = new XMLSerializer();
        var apiParams = '<?xml version="1.0"?>' + "\n" + s.serializeToString(a.postData);
      }

      // Get the current time
      var outboundTime = generateTime();

      // Generate the signature
      var signature = generateSignature(a.path, a.channelId, a.verb, outboundTime, rApiKey);
      // Full URL to call
      var apiUrl = baseUrl + a.path;

      // Make the call using Angular $http
      return $http({
                method: a.verb,
                url: apiUrl,
                data: apiParams,
                headers: {
                  'x-tourcms-date': outboundTime,
                  'Authorization': 'TourCMS ' + a.channelId + ':' + marketplaceId + ':' + signature,
                  'Content-type': 'text/xml;charset="utf-8"'
                },
                transformResponse: function(data) {
                  // If we have X2JS running
                  if(typeof X2JS !== 'undefined') {

                    // Convert response to JSON
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json( data );

                    // If session has expired, send a message
                    if((typeof json.response.error !== 'undefined') && (json.response.error == "FAIL_SESSION_EXPIRED_IDLE")) {
                      $rootScope.$broadcast('ng-tourcms:FAIL_SESSION_EXPIRED_IDLE');
                    }

                    // If session has expired, send a message
                    if((typeof json.response.error !== 'undefined') && (json.response.error == "FAIL_SESSION_EXPIRED_DURATION")) {
                      $rootScope.$broadcast('ng-tourcms:FAIL_SESSION_EXPIRED_DURATION');
                    }

                    // If fail sig, send a message
                    if((typeof json.response.error !== 'undefined') && (json.response.error == "FAIL_SIG")) {
                      $rootScope.$broadcast('ng-tourcms:FAIL_SIG');
                    }

                    return json;
                  } else {
                    return data;
                  }
                }
      });
    };

    // Generate the signature required to sign API calls
    var generateSignature = function(path, channelId, verb, outboundTime, apiKey) {
      var stringToSign = channelId + "/" + marketplaceId + "/" + verb + "/" + outboundTime + path;
      var signature = rawurlencode(b64_hmac_sha256(apiKey, stringToSign) + "=");

      return signature;
    }

    // Generate the current Unix Timestamp (PHP style)
    var generateTime = function() {
      return Math.floor(new Date().getTime() / 1000);
    }

    // URL encode to match PHP
    var rawurlencode = function(str) {
    //From http://phpjs.org/functions/rawurlencode/
    str = (str + '')
      .toString();

      return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .
      replace(/\)/g, '%29')
        .replace(/\*/g, '%2A');
    }

    var toTourcmsDate = function(date) {
      return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }

    var toDateObject = function(string) {
      var dateBits = string.split('-');
      return new Date(dateBits[0], dateBits[1] - 1, dateBits[2]);
    }

    // Convert an object to a Query String
    var toQueryString = function(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
        return parts.join("&");
    }

    // Convert an Object or XML string to DOM
    // Object conversion requires X2JS
    var toDom = function(xmlStringOrJs, rootNode) {

      // If we have X2JS installed
      if(typeof X2JS !== 'undefined') {

        // If we have an Object rather than an XML string
        if(typeof xmlStringOrJs === 'object') {

          // If we've been given a root node to use
          if(typeof rootNode ===  'string'){

            // Add our root node
            var tourObj = {};
            tourObj[rootNode] = xmlStringOrJs;
          }

          // Convert
          var x2js = new X2JS();
          var doc = x2js.json2xml( tourObj );
          return doc;
        }
      }

      // No X2JS so just attempt to parse as an XML string
      var parser = new DOMParser();
      var doc = parser.parseFromString(xmlStringOrJs, "application/xml");
      return doc;
    }

    // Return our singleton
    return {
        // Configure this service
        configure: function(a, defaultChannel) {
            var deferred = $q.defer();

            // Ensure we have an array of settings
            a = [].concat(a);

            // Ensure we have a default channel variable
            defaultChannel = defaultChannel || 0;

            // Store the channels globally
            channels = a;

            // Loop through and set the default channel
            index = 0;

            angular.forEach(a, function(chan, ind) {
              if(chan.channel_id == defaultChannel) {
                index = ind;
              }
            });

            this.configureDefaultChannel(channels[index])
            .then(function() {
              deferred.resolve();
            });


        },
        configureDefaultChannel: function(a) {
          var deferred = $q.defer();

          if(typeof a.private_key !== 'undefined') {
            apiKey = a.private_key;
          }
          if(typeof a.marketplace_id !== 'undefined') {
            marketplaceId = a.marketplace_id;
          }
          if(typeof a.channel_id !== 'undefined') {
            channelId = a.channel_id;
          }
          return deferred.promise;
        },
        // Housekeeping
        apiRateLimitStatus: function(a) {

                                if(typeof a === 'undefined')
                                  a = {};

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/api/rate_limit_status.xml';
                                return makeRequest(a);
        },
        // Channels
        listChannels: function(a) {

                                if(typeof a === 'undefined')
                                  a = {};

                                a.path = '/p/channels/list.xml';
                                return makeRequest(a);
        },
        showChannel: function(a) {

                                if(typeof a === 'undefined')
                                  a = {};

                                if(typeof a.channelId === 'undefined')
                                  a.channelId = channelId;

                                a.path = '/c/channel/show.xml';
                                return makeRequest(a);
        },
        channelPerformance: function(a) {

                                if(typeof a === 'undefined')
                                  a = {};

                                if(typeof a.channelId === 'undefined')
                                  a.channelId = channelId;

                                a.path = '/p/channels/performance.xml';
                                return makeRequest(a);
        },
        // Tours
        listProductFilters: function(a) {
                                if(typeof a === 'undefined')
                                  a = {};

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/tours/filters.xml';

                                return makeRequest(a);
        },
        searchTours: function(a) {

                                if(typeof a === 'undefined')
                                  a = {};

                              // Convert/set search params
                                // If undefined
                                if(typeof a.qs === "undefined") {
                                  a.qs = {};
                                }

                                var qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                              // Set API path
                                if(a.channelId==0)
                                  a.path = '/p/tours/search.xml?' + qs;
                                else
                                  a.path = '/c/tours/search.xml?' + qs;

                                return makeRequest(a);
        },
        listTours: function(a) {

                                if(typeof a === 'undefined')
                                  a = {};

                              // Convert/set search params
                                // If undefined
                                if(typeof a.qs === "undefined") {
                                  a.qs = {};
                                }

                                a.qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                              // Set API path
                                if(a.channelId==0)
                                  a.path = '/p/tours/list.xml?' + a.qs;
                                else
                                  a.path = '/c/tours/list.xml?' + a.qs;

                                return makeRequest(a);
        },
        showTour: function(a) {

                                // If QS undefined
                                if(typeof a.qs === "undefined") {
                                    a.qs = {};
                                }

                                // Add in the TourId in if provided separately
                                if(typeof a.tourId !== 'undefined') {
                                  a.qs['id'] = a.tourId;

                                }

                                // Fix id if passed in to qs directly as tourId
                                if(typeof a.qs.tourId !== 'undefined') {
                                  a.qs['id'] = a.qs.tourId;
                                  delete a.qs['tourId'];
                                }

                                a.qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/tour/show.xml?' + a.qs;

                                return makeRequest(a);
        },
        updateTour: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                              // Tour ID
                                // If tour is object and provided as tourId, fix
                                if(typeof a.tour !== 'string') {
                                  if(typeof a.tour.tour_id === "undefined") {
                                      if(typeof a.tour.tourId !== "undefined") {
                                        a.tour.tour_id = a.tour.tourId;
                                        delete a.tour.tourId;
                                      }
                                  }
                                }

                              // Tour data
                                // Convert string/object to DOM
                                var tourInfo = toDom(a.tour, 'tour');

                              // Set post data

                                a.postData = tourInfo;

                              // Set API path
                                a.path = '/c/tour/update.xml';

                                a.verb = 'POST';

                                return makeRequest(a);
        },
        showTourDatesDeals: function(a) {

                                // If QS undefined
                                if(typeof a.qs === "undefined") {
                                    a.qs = {};
                                }

                                // Add in the TourId in if provided separately
                                if(typeof a.tourId !== 'undefined') {
                                  a.qs['id'] = a.tourId;
                                }

                                // Fix id if passed in to qs directly as tourId
                                if(typeof a.qs.tourId !== 'undefined') {
                                  a.qs['id'] = a.qs.tourId;
                                  delete a.qs['tourId'];
                                }

                                a.qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/tour/datesprices/datesndeals/search.xml?' + a.qs;

                                return makeRequest(a);
        },
        checkTourAvailability: function(a) {

                                // If QS undefined
                                if(typeof a.qs === "undefined") {
                                    a.qs = {};
                                }

                                // Add in the TourId in if provided separately
                                if(typeof a.tourId !== 'undefined') {
                                  a.qs['id'] = a.tourId;
                                }

                                // Fix id if passed in to qs directly as tourId
                                if(typeof a.qs.tourId !== 'undefined') {
                                  a.qs['id'] = a.qs.tourId;
                                  delete a.qs['tourId'];
                                }

                                a.qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/tour/datesprices/checkavail.xml?' + a.qs;

                                return makeRequest(a);
        },
        checkOptionAvailability: function(a) {

                                // If QS undefined
                                if(typeof a.qs === "undefined") {
                                    a.qs = {};
                                }

                                a.querystring = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/booking/options/checkavail.xml?' + a.querystring;

                                return makeRequest(a);
        },
        getDeparturesOverview: function(a) {

                              if(typeof a.channelId === 'undefined')
                                a.channelId = channelId;

                              // Build qyery string
                              params = {};

                              if(typeof a.date !== 'undefined')
                                params.date = toTourcmsDate(a.date);

                              if(typeof a.productTypes !== 'undefined')
                                params.product_type = a.productTypes.join(',');

                              if(typeof a.page !== 'undefined')
                                params.page = a.page;

                              if(typeof a.perPage !== 'undefined')
                                params.per_page = a.perPage;

                              qs = toQueryString(params);

                              a.path = '/c/tour/datesprices/dep/manage/overview.xml?' + qs;

                              return makeRequest(a);
        },
        showDeparture: function(a) {

                              if(typeof a.channelId === 'undefined')
                                a.channelId = channelId;

                              a.path = '/c/tour/datesprices/dep/manage/show.xml?id=' + a.tourId + '&departure_id=' + a.departureId;

                              return makeRequest(a);
        },
        updateDeparture: function(a) {

                              if(typeof a.channelId === 'undefined')
                                a.channelId = channelId;

                              a.postData = toDom(a.departure, 'departure');

                              a.path = '/c/tour/datesprices/dep/manage/update.xml';

                              a.verb = 'POST';

                              return makeRequest(a);

        },
        showPromo: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/promo/show.xml?promo_code=' + a.promo;

                                return makeRequest(a);
        },
        // Booking API Methods
        searchBookings: function(a) {
                                if(typeof a === 'undefined')
                                  a = {};

                              // Query String
                                // If QS undefined
                                if(typeof a.qs === "undefined") {
                                    a.qs = {};
                                }
                                // Convert to string
                                a.qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // Set API path
                                  if(a.channelId==0)
                                    a.path = '/p/bookings/search.xml?' + a.qs;
                                  else
                                    a.path = '/c/bookings/search.xml?' + a.qs;

                                return makeRequest(a);
        },
        showBooking: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/booking/show.xml?booking_id=' + a.bookingId;

                                return makeRequest(a);
        },
        showBookingTotals: function(a) {
                                if(typeof a === 'undefined')
                                  a = {};

                              // Query String
                                // If QS undefined
                                if(typeof a.qs === "undefined") {
                                    a.qs = {};
                                }
                                // Convert to string
                                a.qs = toQueryString(a.qs);

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // Set API path
                                  if(a.channelId==0)
                                    a.path = '/p/bookings/totals.xml?' + a.qs;
                                  else
                                    a.path = '/c/bookings/totals.xml?' + a.qs;

                                return makeRequest(a);
        },
        startNewBooking: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // Convert string/object to DOM
                                var bookingInfo = toDom(a.booking, 'booking');

                                // Set post data
                                a.postData = bookingInfo;

                                a.path = '/c/booking/new/start.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        deleteBooking: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/booking/delete.xml?booking_id=' + a.bookingId;

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        commitBooking: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // Convert string/object to DOM
                                var bookingInfo = toDom(a.booking, 'booking');

                                // Set post data
                                a.postData = bookingInfo;

                                a.path = '/c/booking/new/commit.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        cancelBooking: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // creates a Document object with root "<booking>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var bookingData = doc.createElement("booking"), text;

                                // create the <booking_id> node
                                var bookingIdData = doc.createElement("booking_id"), text;
                                var bookingIdText = doc.createTextNode(a.bookingId);
                                bookingIdData.appendChild(bookingIdText);

                                // append to document
                                bookingData.appendChild(bookingIdData);

                                // optionally add a note
                                if(typeof a.note !== 'undefined') {
                                  // create the <note> node
                                  var noteData = doc.createElement("note"), text;
                                  var noteText = doc.createTextNode(a.note);
                                  noteData.appendChild(noteText);

                                  bookingData.appendChild(noteData);
                                }

                                // optionally add a reason
                                if(typeof a.cancelReason !== 'undefined') {
                                  // create the <note> node
                                  var reasonData = doc.createElement("cancel_reason"), text;
                                  var reasonText = doc.createTextNode(a.cancelReason);
                                  reasonData.appendChild(reasonText);

                                  bookingData.appendChild(reasonData);
                                }

                                doc.appendChild(bookingData);
                                a.postData = bookingData;

                                a.path = '/c/booking/cancel.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        createPayment: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // creates a Document object with root "<booking>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var paymentData = doc.createElement("payment"), text;

                                // create the <booking_id> node
                                  var bookingIdData = doc.createElement("booking_id"), text;
                                  var bookingIdText = doc.createTextNode(a.bookingId);
                                  bookingIdData.appendChild(bookingIdText);

                                  // append to document
                                  paymentData.appendChild(bookingIdData);

                                // Create the <payment_amount> node
                                  var paymentValueData = doc.createElement("payment_value"), text;
                                  var paymentValueText = doc.createTextNode(a.paymentValue);
                                  paymentValueData.appendChild(paymentValueText);

                                  // append to document
                                  paymentData.appendChild(paymentValueData);

                                // Payment currency
                                if(typeof a.currency !== 'undefined') {
                                  // create the <payment_currency> node
                                    var paymentCurrencyData = doc.createElement("payment_currency"), text;
                                    var paymentCurrencyText = doc.createTextNode(a.currency);
                                    paymentCurrencyData.appendChild(paymentCurrencyText);

                                    // append to document
                                    paymentData.appendChild(paymentCurrencyData);
                                }

                                // Payment type
                                if(typeof a.paymentType !== 'undefined') {
                                  // create the <payment_type> node
                                    var paymentTypeData = doc.createElement("payment_type"), text;
                                    var paymentTypeText = doc.createTextNode(a.paymentType);
                                    paymentTypeData.appendChild(paymentTypeText);

                                    // append to document
                                    paymentData.appendChild(paymentTypeData);
                                }

                                // Payment note
                                if(typeof a.paymentNote !== 'undefined') {
                                  // create the <payment_type> node
                                    var paymentNoteData = doc.createElement("payment_note"), text;
                                    var paymentNoteText = doc.createTextNode(a.paymentNote);
                                    paymentNoteData.appendChild(paymentNoteText);

                                    // append to document
                                    paymentData.appendChild(paymentNoteData);
                                }


                                // Credit card fee type
                                if(typeof a.creditcardFeeType !== 'undefined') {
                                  // create the <creditcard_fee_type> node
                                    var creditcardFeeTypeData = doc.createElement("creditcard_fee_type"), text;
                                    var creditcardFeeTypeText = doc.createTextNode(a.creditcardFeeType);
                                    creditcardFeeTypeData.appendChild(creditcardFeeTypeText);

                                    // append to document
                                    paymentData.appendChild(creditcardFeeTypeData);
                                }

                                // Gateway Mode
                                if(typeof a.gatewayMode !== 'undefined') {
                                  // create the <payment_currency> node
                                    var gatewayModeData = doc.createElement("gateway_mode"), text;
                                    var gatewayModeText = doc.createTextNode(a.gatewayMode);
                                    gatewayModeData.appendChild(gatewayModeText);

                                    // append to document
                                    paymentData.appendChild(gatewayModeData);
                                }

                                // Who pays
                                if(typeof a.paymentBy !== 'undefined') {
                                  // create the <paid_by> node
                                    var paymentByData = doc.createElement("paid_by"), text;
                                    var paymentByText = doc.createTextNode(a.paymentBy);
                                    paymentByData.appendChild(paymentByText);

                                    // append to document
                                    paymentData.appendChild(paymentByData);
                                }

                                // Who pays id
                                if(typeof a.paymentById !== 'undefined') {
                                  // create the <payment_by> node
                                    var paymentByIdData = doc.createElement("paid_by_id"), text;
                                    var paymentByIdText = doc.createTextNode(a.paymentById);
                                    paymentByIdData.appendChild(paymentByIdText);

                                    // append to document
                                    paymentData.appendChild(paymentByIdData);
                                }


                                doc.appendChild(paymentData);
                                a.postData = paymentData;

                                a.path = '/c/booking/payment/new.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        spreedlyCreatePayment: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // creates a Document object with root "<booking>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var paymentData = doc.createElement("payment"), text;

                                // create the <booking_id> node
                                  var bookingIdData = doc.createElement("booking_id"), text;
                                  var bookingIdText = doc.createTextNode(a.bookingId);
                                  bookingIdData.appendChild(bookingIdText);

                                  // append to document
                                  paymentData.appendChild(bookingIdData);

                                // Create the <payment_amount> node
                                  var paymentValueData = doc.createElement("payment_value"), text;
                                  var paymentValueText = doc.createTextNode(a.paymentValue);
                                  paymentValueData.appendChild(paymentValueText);

                                  // append to document
                                  paymentData.appendChild(paymentValueData);

                                  // Spreedly Token
                                    // create the <spreedly_payment_method> node
                                    var spreedlyPaymentMethodData = doc.createElement("spreedly_payment_method"), text;
                                    var spreedlyPaymentMethodText = doc.createTextNode(a.spreedlyPaymentMethod);
                                    spreedlyPaymentMethodData.appendChild(spreedlyPaymentMethodText);

                                    // append to document
                                    paymentData.appendChild(spreedlyPaymentMethodData);


                                  // Payment currency
                                  if(typeof a.currency !== 'undefined') {
                                    // create the <payment_currency> node
                                      var paymentCurrencyData = doc.createElement("payment_currency"), text;
                                      var paymentCurrencyText = doc.createTextNode(a.currency);
                                      paymentCurrencyData.appendChild(paymentCurrencyText);

                                      // append to document
                                      paymentData.appendChild(paymentCurrencyData);
                                  }

                                  // Payment type
                                  if(typeof a.paymentType !== 'undefined') {
                                    // create the <payment_type> node
                                      var paymentTypeData = doc.createElement("payment_type"), text;
                                      var paymentTypeText = doc.createTextNode(a.paymentType);
                                      paymentTypeData.appendChild(paymentTypeText);

                                      // append to document
                                      paymentData.appendChild(paymentTypeData);
                                  }

                                  // Payment note
                                  if(typeof a.paymentNote !== 'undefined') {
                                    // create the <payment_type> node
                                      var paymentNoteData = doc.createElement("payment_note"), text;
                                      var paymentNoteText = doc.createTextNode(a.paymentNote);
                                      paymentNoteData.appendChild(paymentNoteText);

                                      // append to document
                                      paymentData.appendChild(paymentNoteData);
                                  }

                                  // Credit card fee type
                                  if(typeof a.creditcardFeeType !== 'undefined') {
                                    // create the <creditcard_fee_type> node
                                      var creditcardFeeTypeData = doc.createElement("creditcard_fee_type"), text;
                                      var creditcardFeeTypeText = doc.createTextNode(a.creditcardFeeType);
                                      creditcardFeeTypeData.appendChild(creditcardFeeTypeText);

                                      // append to document
                                      paymentData.appendChild(creditcardFeeTypeData);
                                  }

                                  // Gateway Mode
                                  if(typeof a.gatewayMode !== 'undefined') {
                                    // create the <payment_currency> node
                                      var gatewayModeData = doc.createElement("gateway_mode"), text;
                                      var gatewayModeText = doc.createTextNode(a.gatewayMode);
                                      gatewayModeData.appendChild(gatewayModeText);

                                      // append to document
                                      paymentData.appendChild(gatewayModeData);
                                  }

                                  // Who pays
                                  if(typeof a.paymentBy !== 'undefined') {
                                    // create the <payment_by> node
                                      var paymentByData = doc.createElement("paid_by"), text;
                                      var paymentByText = doc.createTextNode(a.paymentBy);
                                      paymentByData.appendChild(paymentByText);

                                      // append to document
                                      paymentData.appendChild(paymentByData);
                                  }

                                  // Who pays id
                                  if(typeof a.paymentById !== 'undefined') {
                                    // create the <payment_by> node
                                      var paymentByIdData = doc.createElement("paid_by_id"), text;
                                      var paymentByIdText = doc.createTextNode(a.paymentById);
                                      paymentByIdData.appendChild(paymentByIdText);

                                      // append to document
                                      paymentData.appendChild(paymentByIdData);
                                  }
				
				  //Cardholder details:
                                  if(typeof a.cardholderCustomer !== 'undefined'){
                                    var paymentCardholderDetailsData = doc.createElement("cardholder_customer"), text;
                                    //var paymentCasrdholderDetailsText = doc.createTextNode(a.cardholderCustomer);

                                    if(typeof a.cardholderCustomer.firstname !== 'undefined'){
                                      var cardholderFirstnameData = doc.createElement("firstname"), text;
                                      var cardholderFirstnameText = doc.createTextNode(a.cardholderCustomer.firstname);
                                      cardholderFirstnameData.appendChild(cardholderFirstnameText);
                                      paymentCardholderDetailsData.appendChild(cardholderFirstnameData);
                                    }
                                    
                                    if (typeof a.cardholderCustomer.surname !== 'undefined') {
                                      var cardholderSurnameData = doc.createElement("surname"), text;
                                      var cardholderSurnameText = doc.createTextNode(a.cardholderCustomer.surname);
                                      cardholderSurnameData.appendChild(cardholderSurnameText);
                                      paymentCardholderDetailsData.appendChild(cardholderSurnameData);
                                    }
                                    
                                    if (typeof a.cardholderCustomer.email !== 'undefined') {
                                      var cardholderEmailData = doc.createElement("email"), text;
                                      var cardholderEmailText = doc.createTextNode(a.cardholderCustomer.email);
                                      cardholderEmailData.appendChild(cardholderEmailText);
                                      paymentCardholderDetailsData.appendChild(cardholderEmailData);
                                    }

                                    if(typeof a.cardholderCustomer.address !== 'undefined') {
                                      var cardholderAddressData = doc.createElement("address"), text;
                                      var cardholderAddressText = doc.createTextNode(a.cardholderCustomer.address);
                                      cardholderAddressData.appendChild(cardholderAddressText);
                                      paymentCardholderDetailsData.appendChild(cardholderAddressData);
                                    }

                                    if(typeof a.cardholderCustomer.city !== 'undefined') {
                                      var cardholderCityData = doc.createElement("city"), text;
                                      var cardholderCityText = doc.createTextNode(a.cardholderCustomer.city);
                                      cardholderCityData.appendChild(cardholderCityText);
                                      paymentCardholderDetailsData.appendChild(cardholderCityData);
                                    }

                                    if(typeof a.cardholderCustomer.county !== 'undefined') {
                                      var cardholderCountyData = doc.createElement("county"), text;
                                      var cardholderCountyText = doc.createTextNode(a.cardholderCustomer.county);
                                      cardholderCountyData.appendChild(cardholderCountyText);
                                      paymentCardholderDetailsData.appendChild(cardholderCountyData);
                                    }

                                    if(typeof a.cardholderCustomer.country !== 'undefined') {
                                      var cardholderCountryData = doc.createElement("country"), text;
                                      var cardholderCountryText = doc.createTextNode(a.cardholderCustomer.country);
                                      cardholderCountryData.appendChild(cardholderCountryText);
                                      paymentCardholderDetailsData.appendChild(cardholderCountryData);
                                    }

                                    if(typeof a.cardholderCustomer.postcode !== 'undefined') {
                                      var cardholderPostcodeData = doc.createElement("postcode"), text;
                                      var cardholderPostcodeText = doc.createTextNode(a.cardholderCustomer.postcode);
                                      cardholderPostcodeData.appendChild(cardholderPostcodeText);
                                      paymentCardholderDetailsData.appendChild(cardholderPostcodeData);
                                    }

                                    if(typeof a.cardholderCustomer.tel_home !== 'undefined') {
                                      var cardholderTelData = doc.createElement("tel_home"), text;
                                      var cardholderTelText = doc.createTextNode(a.cardholderCustomer.tel_home);
                                      cardholderTelData.appendChild(cardholderTelText);
                                      paymentCardholderDetailsData.appendChild(cardholderTelData);
                                    }

                                    doc.appendChild(paymentCardholderDetailsData);
            
                                    // append to document
                                    paymentData.appendChild(paymentCardholderDetailsData);
                                  }


                                doc.appendChild(paymentData);
                                a.postData = paymentData;

                                a.path = '/c/booking/payment/spreedly/new.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        payworksCreatePayment: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // creates a Document object with root "<booking>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var paymentData = doc.createElement("payment"), text;

                                // create the <booking_id> node
                                  var bookingIdData = doc.createElement("booking_id"), text;
                                  var bookingIdText = doc.createTextNode(a.bookingId);
                                  bookingIdData.appendChild(bookingIdText);

                                  // append to document
                                  paymentData.appendChild(bookingIdData);

                                // Create the <payment_amount> node
                                  var paymentValueData = doc.createElement("payment_value"), text;
                                  var paymentValueText = doc.createTextNode(a.paymentValue);
                                  paymentValueData.appendChild(paymentValueText);

                                  // append to document
                                  paymentData.appendChild(paymentValueData);

                                // Payment currency
                                if(typeof a.currency !== 'undefined') {
                                  // create the <payment_currency> node
                                    var paymentCurrencyData = doc.createElement("payment_currency"), text;
                                    var paymentCurrencyText = doc.createTextNode(a.currency);
                                    paymentCurrencyData.appendChild(paymentCurrencyText);

                                    // append to document
                                    paymentData.appendChild(paymentCurrencyData);
                                }

                                // Payment type
                                if(typeof a.paymentType !== 'undefined') {
                                  // create the <payment_type> node
                                    var paymentTypeData = doc.createElement("payment_type"), text;
                                    var paymentTypeText = doc.createTextNode(a.paymentType);
                                    paymentTypeData.appendChild(paymentTypeText);

                                    // append to document
                                    paymentData.appendChild(paymentTypeData);
                                }

                                // Payment note
                                if(typeof a.paymentNote !== 'undefined') {
                                  // create the <payment_type> node
                                    var paymentNoteData = doc.createElement("payment_note"), text;
                                    var paymentNoteText = doc.createTextNode(a.paymentNote);
                                    paymentNoteData.appendChild(paymentNoteText);

                                    // append to document
                                    paymentData.appendChild(paymentNoteData);
                                }


                                // Credit card fee type
                                if(typeof a.creditcardFeeType !== 'undefined') {
                                  // create the <creditcard_fee_type> node
                                    var creditcardFeeTypeData = doc.createElement("creditcard_fee_type"), text;
                                    var creditcardFeeTypeText = doc.createTextNode(a.creditcardFeeType);
                                    creditcardFeeTypeData.appendChild(creditcardFeeTypeText);

                                    // append to document
                                    paymentData.appendChild(creditcardFeeTypeData);
                                }

                                // Gateway Mode
                                if(typeof a.gatewayMode !== 'undefined') {
                                  // create the <payment_currency> node
                                    var gatewayModeData = doc.createElement("gateway_mode"), text;
                                    var gatewayModeText = doc.createTextNode(a.gatewayMode);
                                    gatewayModeData.appendChild(gatewayModeText);

                                    // append to document
                                    paymentData.appendChild(gatewayModeData);
                                }

                                // Payment Reference
                                if(typeof a.paymentReference !== 'undefined') {
                                  // create the <payment_reference> node
                                    var gatewayPaymentRefData = doc.createElement("payworks_payment_reference"), text;
                                    var gatewayPaymentRefText = doc.createTextNode(a.paymentReference);
                                    gatewayPaymentRefData.appendChild(gatewayPaymentRefText);

                                    // append to document
                                    paymentData.appendChild(gatewayPaymentRefData);
                                }

                                // Who pays
                                if(typeof a.paymentBy !== 'undefined') {
                                  // create the <payment_by> node
                                    var paymentByData = doc.createElement("paid_by"), text;
                                    var paymentByText = doc.createTextNode(a.paymentBy);
                                    paymentByData.appendChild(paymentByText);

                                    // append to document
                                    paymentData.appendChild(paymentByData);
                                }

                                // Who pays id
                                if(typeof a.paymentById !== 'undefined') {
                                  // create the <payment_by> node
                                    var paymentByIdData = doc.createElement("paid_by_id"), text;
                                    var paymentByIdText = doc.createTextNode(a.paymentById);
                                    paymentByIdData.appendChild(paymentByIdText);

                                    // append to document
                                    paymentData.appendChild(paymentByIdData);
                                }

                                doc.appendChild(paymentData);
                                a.postData = paymentData;

                                a.path = '/c/booking/payment/payworks/new.xml';

                                a.verb = 'POST';


                                return makeRequest(a);

        },
        addNoteToBooking: function(a) {
                                // Channel ID
                                  // If undefined, use object level channelId
                                  if(typeof a.channelId === "undefined")
                                    a.channelId = channelId;

                                // creates a Document object with root "<booking>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var bookingNode = doc.createElement("booking"), text;

                                // create the <booking_id> node
                                var bookingIdNode = doc.createElement("booking_id"), text;
                                var bookingIdText = doc.createTextNode(a.bookingId);
                                bookingIdNode.appendChild(bookingIdText);

                                // append to document
                                bookingNode.appendChild(bookingIdNode);

                                // Add a note

                                // create the <note> node
                                var noteNode = doc.createElement("note"), text;

                                var noteTypeNode = doc.createElement("type");
                                var noteType = doc.createTextNode(a.noteType);
                                noteTypeNode.appendChild(noteType);

                                var noteTextNode = doc.createElement("text");
                                var noteText = doc.createTextNode(a.noteText);
                                noteTextNode.appendChild(noteText);

                                noteNode.appendChild(noteTypeNode);
                                noteNode.appendChild(noteTextNode);
                                bookingNode.appendChild(noteNode);


                                doc.appendChild(bookingNode);

                                a.postData = bookingNode;



                                // Post data
                                  // Convert string/object to DOM
                                //  a.postData = toDom(a.booking, 'booking');

                                // Set API path
                                  a.path = '/c/booking/note/new.xml';

                                  a.verb = 'POST';

                                  return makeRequest(a);
        },
        // Trigger booking email
        sendBookingEmail: function(a) {
                                // Channel ID
                                  // If undefined, use object level channelId
                                  if(typeof a.channelId === "undefined")
                                    a.channelId = channelId;

                                // Post data
                                  // Convert string/object to DOM
                                 a.postData = toDom(a.booking, 'booking');

                                // Set API path
                                  a.path = '/c/booking/email/send.xml';

                                  a.verb = 'POST';

                                  return makeRequest(a);
        },
        // Booking components
        addBookingComponent: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // Convert string/object to DOM
                                var bookingInfo = toDom(a.booking, 'booking');

                                // Set post data
                                a.postData = bookingInfo;

                                a.path = '/c/booking/component/new.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        // Remove a component from a booking
        removeBookingComponent: function(a) {

                                // Channel ID
                                  // If undefined, use object level channelId
                                  if(typeof a.channelId === "undefined")
                                    a.channelId = channelId;

                                // Convert string/object to DOM
                                  var bookingInfo = toDom(a.booking, 'booking');

                                // Set post data
                                  a.postData = bookingInfo;

                                // Set API path
                                  a.path = '/c/booking/component/delete.xml';

                                  a.verb = 'POST';

                                  return makeRequest(a);
        },
        // Edit a component on a booking
        updateBookingComponent: function(a) {

                                // Channel ID
                                  // If undefined, use object level channelId
                                  if(typeof a.channelId === "undefined")
                                    a.channelId = channelId;

                                // Convert string/object to DOM
                                  var bookingInfo = toDom(a.booking, 'booking');

                                // Set post data
                                  a.postData = bookingInfo;

                                // Set API path
                                  a.path = '/c/booking/component/update.xml';

                                  a.verb = 'POST';

                                  return makeRequest(a);
        },
        // Update booking
        updateBooking: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                // Convert string/object to DOM
                                var bookingInfo = toDom(a.booking, 'booking');

                                // Set post data
                                a.postData = bookingInfo;

                                a.path = '/c/booking/update.xml';

                                a.verb = 'POST';

                                return makeRequest(a);

        },
        // Vouchers
        searchVouchers: function(a) {
                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                if(typeof a.voucherString === "undefined")
                                a.voucherString = '';

                                // creates a Document object with root "<voucher>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var voucherData = doc.createElement("voucher"), text;

                                // create the <barcode_data> node
                                var barcodeData = doc.createElement("barcode_data"), text;
                                var barcodeText = doc.createTextNode(a.voucherString);
                                barcodeData.appendChild(barcodeText);
                                voucherData.appendChild(barcodeData);

                                // create the <barcode_data> node
                                if(typeof a.wideDates != 'undefined') {
                                  var wideDateData = doc.createElement("wide_dates"), text;
                                  var wideDateText = doc.createTextNode(a.wideDates);
                                  wideDateData.appendChild(wideDateText);
                                  voucherData.appendChild(wideDateData);
                                }

                                // create the <barcode_data> node
                                if(typeof a.superWideDates != 'undefined') {
                                  var superWideDateData = doc.createElement("super_wide_dates"), text;
                                  var superWideDateText = doc.createTextNode(a.superWideDates);
                                  superWideDateData.appendChild(superWideDateText);
                                  voucherData.appendChild(superWideDateData);
                                }

                                // append to document
                                doc.appendChild(voucherData);
                                a.postData = voucherData;

                                // Set API path
                                if(a.channelId==0)
                                  a.path = '/p/voucher/search.xml';
                                else
                                  a.path = '/c/voucher/search.xml';

                                a.verb = 'POST';

                                return makeRequest(a);
        },
        findBookingChannel: function(a) {

                            var deferred = $q.defer();

                            this.searchVouchers({
                                voucherString: a.bookingId,
                                superWideDates: '1'
                            })
                            .then(function(result) {

                              if(typeof result.data !== 'undefined') {

                                if(typeof result.data.response.booking == 'undefined')
                                  result.data.response.booking = [];

                                var data = [].concat(result.data.response.booking);

                                angular.forEach(data, function(booking) {
                                  if(booking.booking_id == a.bookingId)
                                    deferred.resolve(booking.channel_id);
                                });

                              }

                              deferred.resolve();
                            });

                            return deferred.promise;
        },
        redeemVoucher: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                if(typeof a.key === "undefined")
                                a.key = '';

                                // creates a Document object with root "<voucher>"
                                var doc = document.implementation.createDocument(null, null, null);
                                var voucherData = doc.createElement("voucher"), text;

                                // create the <key> node
                                var keyData = doc.createElement("key"), text;
                                var keyText = doc.createTextNode(a.key);

                                // append to document
                                keyData.appendChild(keyText);
                                voucherData.appendChild(keyData);

                                // Create the <note> node if we have one
                                if(typeof a.note !== 'undefined') {
                                  var noteData = doc.createElement("note"), text;
                                  var noteText = doc.createTextNode(a.note);
                                  noteData.appendChild(noteText);
                                  voucherData.appendChild(noteData);
                                }

                                doc.appendChild(voucherData);
                                a.postData = voucherData;

                                // Set API path
                                a.path = '/c/voucher/redeem.xml';

                                a.verb = 'POST';

                                return makeRequest(a);
        },
        // Customers
        showCustomer: function(a) {

            if(typeof a.channelId === "undefined")
              a.channelId = channelId;

            a.path = '/c/customer/show.xml?customer_id=' + a.customerId;

            return makeRequest(a);

        },
        updateCustomer: function(a) {

                              if(typeof a.channelId === 'undefined')
                                a.channelId = channelId;

                              a.postData = toDom(a.customer, 'customer');

                              a.path = '/c/customer/update.xml';

                              a.verb = 'POST';

                              return makeRequest(a);

        },
        // Agents
        searchAgents: function(a) {

                    if(typeof a === 'undefined')
                      a = {};

                    // Convert/set search params
                    // If undefined
                    if(typeof a.qs === "undefined") {
                      a.qs = {};
                    }

                    a.qs = toQueryString(a.qs);

                    // Channel ID
                    // If undefined, use object level channelId
                    if(typeof a.channelId === "undefined")
                      a.channelId = channelId;

                    // Set API path
                    a.path = '/c/agents/search.xml?' + a.qs;

                    return makeRequest(a);

        },
        // Suppliers (Internal TourCMS)
        showSupplier: function(a) {

                              // Channel ID
                                // If undefined, use object level channelId
                                if(typeof a.channelId === "undefined")
                                  a.channelId = channelId;

                                a.path = '/c/supplier/show.xml?supplier_id=' + a.supplierId;

                                return makeRequest(a);
        },
        // Get a TourCMS function date
        getTourcmsDate: function(a){
          //a = a || new Date();
          return toTourcmsDate(a);
        },
        // Accepts a tourcms date string, returns a date object
        getDateObject: function(a){
          return toDateObject(a);
        },
        getDefaultChannel: function() {
          return channelId;
        },
        // Make a generic API request
        genericRequest: function(a) {

                                return makeRequest(a);

        }

    };

});
})(this, this.angular, Math);
