"use strict";

const renderer = require('./convertercompUI');
module.exports = {

  metadata: () => ({
    "name": "currency.converter",
    "properties": {
      "baseCurrency": {
        "type": "string",
        "required": true
      },
      "baseAmount": {
        "type": "int",
        "required": true
      },
      "targetCurrencyEntity": {
        "type": "string",
        "required": true
      },
      "nlpresultVariable": {
        "type": "string",
        "required": true
      }
    },
    "supportedActions": ["conversionSuccess", "missingInformation", "error"]
  }),

  invoke: (conversation, done) => {
    //the currency you want to convert into target currencies
    const baseCurrency = conversation.properties().baseCurrency;
    //amount of money to calculate the conversion for
    const baseAmount = conversation.properties().baseAmount;
    //we check for entity matches. This allows us to detect an undefined
    //number of target currencies.
    const targetCurrencyEntity = conversation.properties().targetCurrencyEntity;

    const nlpResultVariable = conversation.properties().nlpresultVariable;

    //before we move on, we need to check if we got all values we need to do the
    //conversion.
    console.info("Input provided to component: baseCurrency: " + baseCurrency + ", baseAmount: " + baseAmount + ", targetCurrencyEntity: " + targetCurrencyEntity);

    var missingInfoString = "Sorry, you did not enter all information I need for the job. Please provide ";

    var hasMissingInformation = false;

    if (!baseCurrency) {
      hasMissingInformation = true;
      missingInfoString = missingInfoString + "a base currency,";
    }

    if (!baseAmount) {
      hasMissingInformation = true;
      missingInfoString = missingInfoString + "a base amount,";
    }

    //get nlpresult to access entity matches, We assume only a single
    //variable of type nlpresult, so that the nlpresult variable name
    //can be omitted.


    var nlpResult = conversation.nlpResult(nlpResultVariable ? nlpResultVariable : '');
    var targetCurrenciesArray = nlpResult.entityMatches(targetCurrencyEntity);

    //Ensuring that a missing target currency is detected. If the base
    //currency is mistakenly detected as a target currency, remove it.
    //Also, remove the case in which users put the base currency as the
    //target currency
    if (targetCurrenciesArray && (targetCurrenciesArray.length > 0)) {
      //clean the base currency from the target curreny array if contained

      for (let i = 0; i < targetCurrenciesArray.length; i++) {
        console.info(" #### " + targetCurrenciesArray[i]);
        if (targetCurrenciesArray[i].toUpperCase() == baseCurrency.toUpperCase()) {
          //use delete instead of splice a it does not change the array index
          delete targetCurrenciesArray[i];
        }
      }

      //remove any elemnt that is undefined due to the previous delete action

      targetCurrenciesArray = targetCurrenciesArray.filter(function(element) {
        return element !== undefined;
      });
    }


    if (!targetCurrenciesArray || (targetCurrenciesArray.length < 1)) {
      hasMissingInformation = true;
      missingInfoString = missingInfoString + "one or more target currencies,";
    }

    //stop processing and print message
    if (hasMissingInformation == true) {
      console.info("Information missing: " + missingInfoString)
      //before printing, remove the trailing comma
      conversation.reply(missingInfoString.slice(0, -1));
      conversation.keepTurn();
      conversation.transition("missingInformation");
      done();
    }

    //invoke the custom API in Oracle Mobile Cloud that queries the currency conversion
    //website. Payload expected by the custom API is
    //{
    // "date" : "latest",
    // "baseCurrency":{"currency":"USD", "amount":100},
    // "targetCurrency":["EUR","GBP"]
    //}

    var body = {};
    body.date = "latest";
    body.baseCurrency = {
      "currency": baseCurrency,
      "amount": baseAmount
    };

    body.targetCurrency = targetCurrenciesArray;

    console.info("payload to custom API = " + JSON.stringify(body));

    conversation.oracleMobile.custom.currencyconverter.post('converter', body, {
      inType: 'json'
    }).then(
      function(result) {

        console.info("Custom API response = " + result.result);
        //call UI class for this component to render the response specific
        //for the messenger client that is used
        renderer.render(conversation, result.result);
        conversation.keepTurn();
        conversation.transition("conversionSuccess");
        done();
      },
      function(error) {
        //set error for the default error handler to pick up the action
        console.warning("Currency conversion failed with error " + error.error)
        conversation.error(true);
        conversation.keepTurn();
        conversation.transition("error");
        done();
      }).catch(function(e) {
      //set error for the default error handler to pick up the action
      console.severe("Error occured in call to currency converter custom API: " + e.message);
    });
  }
};
