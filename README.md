## READ ME

Oracle Intelligent Bots Version 0.6

### Steps to Install:

1. Import resources 0.6/final-solution/package-currencyConverterMBE.zip into Oracle Mobile Cloud. You can do this by selecting the "burger" like icon in the MCS dash board and the Package menu item in the opened side menu.

2. Import resources 0.6/final-solution/bot/CurrencyConverter.json from the Oracle Intelligent Bots dashboard.

3. Edit the custom component service settings in the bot and change the base URL, the MBE ID and the anonymous key of the component service access. The Mobile Backend is created for you when you import the zip file per step one.

4. Navigate to the MBE in MCS and open it. The MBE ID, base URL and anonymous key are exposed under "Settings".

### Notes:
For this demo, the shared api (currencyconverter) accesses the *Connector* in Oracle Mobile Cloud Service. For this reason there is a mobile dependency created in the package.json file:

~~~~ {
  "name" : "CurrencyConverter",
  "version" : "1.0",
  "description" : "Custom API that converts a base currency value into target currency values",
  "main" : "currencyconverter.js",
  "oracleMobile" : {
    "dependencies" : {
      "apis" : { },
      "connectors" : {"/mobile/connector/foreignexchange":"1.0"}
    }
  }
}
~~~~

The custom component (converterccs) accesses the *shared api* and therefore there is a dependency on that api in the package.json file:

~~~~
"oracleMobile": {
  "dependencies": {
    "apis": {"/mobile/custom/currencyconverter": "1.0"},
    "connectors": {}
  }
}
~~~~
