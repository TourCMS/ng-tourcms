(function(window, angular, Math) {
  angular.module('tourcms.ng-tourcms', [])
 .factory('tourcmsApiService', function($http) {

    var baseUrl = 'https://api.tourcms.com';

    var apiKey = 'API_KEY_HERE';
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
                params: apiParams,
                headers: {
                  'x-tourcms-date': outboundTime,
                  'Authorization': 'TourCMS ' + a.channelId + ':' + marketplaceId + ':' + signature,
                  'Content-type': 'text/xml;charset="utf-8"'
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

    // Return our singleton
    return {
        apiRateLimitStatus: function(a) {
                                // Add in the API path
                                a.path = '/api/rate_limit_status.xml';

                                // Call API
                                return makeRequest(a);
                              }
    };

});
})(this, this.angular, Math);
