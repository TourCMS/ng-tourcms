(function(window, angular, Math) {
  angular.module('tourcms.ng-tourcms', [])
 .factory('tourcmsApiService', function($http) {

    var baseUrl = 'https://api.tourcms.com';

    var apiKey = '';
    var marketplaceId = 0;
    var channelId = 0;

    var makeRequest = function(a) {
      // Sensible defaults
      if(typeof a.channelId == "undefined")
        a.channelId = 0;

      if(typeof a.verb == "undefined")
        a.verb = 'GET';

      //console.log(a.postData);

      if(typeof a.postData == "undefined") {
        var apiParams = "";
      } else {
        var s = new XMLSerializer();
        var apiParams = s.serializeToString(a.postData);
      }
      console.log(apiParams);
      // Get the current time
      var outboundTime = generateTime();

      // Generate the signature
      var signature = generateSignature(a.path, a.channelId, a.verb, outboundTime);

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
                  if(typeof X2JS !== 'undefined') {
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json( data );
                    return json;
                  } else {
                    return data;
                  }
                }
      });
    };

    // Generate the signature required to sign API calls
    var generateSignature = function(path, channelId, verb, outboundTime) {
      var stringToSign = channelId + "/" + marketplaceId + "/" + verb + "/" + outboundTime + path;
      var signature = rawurlencode(b64_hmac_sha256(apiKey, stringToSign) + "=");

      return signature;
    }

    // Generate the current Unix Timestamp (PHP style)
    var generateTime = function() {
      return Math.floor(new Date().getTime() / 1000);
    }

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

    var toQueryString = function(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
        return parts.join("&");
    }

    // Return our singleton
    return {
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
        searchTours: function(a) {

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
                                  a.path = '/p/tours/search.xml?' + a.qs;
                                else
                                  a.path = '/c/tours/search.xml?' + a.qs;

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

                            		// append to document
                            		barcodeData.appendChild(barcodeText);
                            		voucherData.appendChild(barcodeData);
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

    };

});
})(this, this.angular, Math);
