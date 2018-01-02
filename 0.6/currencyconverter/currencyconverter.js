/**
 * The ExpressJS namespace.
 * @external ExpressApplicationObject
 * @see {@link http://expressjs.com/3x/api.html#app}
 */

/**
 * Mobile Cloud custom code service entry point.
 * @param {external:ExpressApplicationObject}
 * service
 */
module.exports = function(service) {

		/**
		* custom API function that calls OMCe connector to perform currency cionversion
		* using fixer.io website. This function is channel agnostic, which means it can
		* be called from a mobile app, Oracle MAX, Oracle ABCS, chatbots etc.
		*
		* author: Frank Nimphius, 2017
		*/
    service.post('/mobile/custom/currencyconverter/converter', function(req, res) {

          /*payload
           * Note that date is treated as a resource in the call to the converter URL
           * {
           *   date : latest,
           *   baseCurrency:{currency:"USD", amount:100},
           *   targetCurrency:["EUR","GBP"]
           * }
           */
          var resource = req.body.date;
          var baseCurrency = req.body.baseCurrency.currency;
          var baseAmount = req.body.baseCurrency.amount;
          var targetCurrencies = req.body.targetCurrency;

          console.info("payload date is \"" + resource + "\"");
          console.info("base currency is \"" + baseCurrency + "\"");
          console.info("base amount is \"" + baseAmount + "\"");
          console.info("target currencies are " + JSON.stringify(targetCurrencies));

                  var targetCurrenciesString = "";

                  for (var i = 0; i < targetCurrencies.length; ++i) {
                    targetCurrenciesString = targetCurrenciesString + targetCurrencies[i] + ",";
                  }

                  if (targetCurrenciesString.length > 0) {
                    targetCurrenciesString = targetCurrenciesString.substring(0, targetCurrenciesString.length - 1);
                  }
                  console.info("target currency string is \"" + targetCurrenciesString + "\"");

                    //invoke currency converter for the date value that was requested. The
                    //date value is saved as the resource of the request
                    req.oracleMobile.connectors.foreignexchange.get(resource, null, {
                      qs: {
                        base: baseCurrency,
                        symbols: targetCurrenciesString,
                      }
                    }).then(
                      function(result) {

                        /*
                         * Call turned out to be successful. Now convert connector response
                           payload from
                         * {
                         *  "base": "EUR",
                         *  "date": "2017-07-24",
                         *  "rates": {
                         *   "GBP": 85,
                         *   "USD": 105
                         * }
                         *}
                         * to
                         *{
                         *  "date":"2017-07-24",
                         *  "base":{"currency":"EUR","amount":100},
                         *  "conversions":[{"currency":"GBP","amount": 85},{"currency":"USD"."amount": 105}]
                         * }
                         */

                        var connectorResponse = JSON.parse(result.result);

                        console.info("connector response is "+result.result);

                        var response = {};
                        response.date = connectorResponse.date;
                        response.base = {
                          "currency": connectorResponse.base,
                          "amount": baseAmount
                        };
                        response.conversions = [];

                        for (var property in connectorResponse.rates) {
                            let newProp = {
                              "currency": property,
                              "amount": connectorResponse.rates[property] * baseAmount
                            }
                            console.info("adding currency conversion: \"" + property + "\" with amount of " + connectorResponse.rates[property] * baseAmount);
                            response.conversions.push(newProp);
                        }

                        console.info("response is: "+JSON.stringify(response));

                        res.send(result.statusCode, JSON.stringify(response));
                      },
                      function(error) {
                        res.send(error.statusCode, error.error);
                      }
                    );
                  });

              };
