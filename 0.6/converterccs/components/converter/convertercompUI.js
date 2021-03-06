"use strict";

//Currency conversion renderer
module.exports = {

  render: (conversation, data) => {

    var messageChannel = conversation.channelType();

    console.info("rendering response for message channel: " + messageChannel)


    //the data object that comes from the custom API has
    //the following structure
    //{
    // "date":"2017-08-10",
    //   "base":{
    //     "currency":"USD",
    //     "amount":100
    //  },
    //  "conversions":[
    //  {
    //    "currency":"GBP",
    //    "amount":76.972
    //  },
    //  {
    //    "currency":"EUR",
    //    "amount":85.237
    //  }
    // ]
    //}

    let dataObject = JSON.parse(data);
    let conversionsArray = dataObject.conversions;
    let baseCurrency = dataObject.base;
    let arrayLength = conversionsArray.length;


    //print base currency and amount
    console.info(" base currency = " + JSON.stringify(baseCurrency));
    conversation.reply("Currency conversion for " + baseCurrency.currency + " " + baseCurrency.amount);

    //print currency conversion for facebook and the tester
    if (messageChannel === 'facebook') {

      var elements = [];

      //get current date. Src from https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i
      function getToday() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
          dd = '0' + dd;
        }
        if (mm < 10) {
          mm = '0' + mm;
        }
        return today = dd + '/' + mm + '/' + yyyy;
      }

      for (let i = 0; i < arrayLength; ++i) {

        let currency = conversionsArray[i].currency;
        let amount = conversionsArray[i].amount;

        elements[i] = {
          "title": currency + " : " + amount,
          "subtitle": getToday()
        };

        //console.info(messageChannel + " element #" + i + " is: " + JSON.stringify(elements[i]));
      }
      //show conversions as card layout
      let response = {
        "attachment": {
          "type": "template",
          "payload": {
            "elements": elements,
            "template_type": "generic"
          }
        }
      };

      console.info(messageChannel + " response  : " + JSON.stringify(response));

      conversation.reply(response);
    }
    //tester does not suport templates. Here we just print the
    //conversions as a line delimited text
    else if (messageChannel === 'test') {
      let response = "The equivalent " + (arrayLength > 1 ? "amounts are" : "amount is");

      for (let i = 0; i < arrayLength; ++i) {

        let currency = conversionsArray[i].currency;
        let amount = conversionsArray[i].amount;

        response = response + "\n\n" + currency + " : " + amount;
      }

      console.info(messageChannel + " response  : " + response);
      conversation.reply({
        text: response
      });

    } else {
      conversation.reply("Sorry. Unknown messenger");
    }

  }


}
