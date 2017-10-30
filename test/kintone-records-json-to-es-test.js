const fs = require("fs");
const filepath = "./output/output.json";

const elasticsearch = require("elasticsearch");
const ES_INDEX = "kintone";     // Elasticsearch index name
const ES_TYPE = "log";          // Elsticsearch index type name

const ES_CLIENT = new elasticsearch.Client({
  host: "127.0.0.1:9200"        // Elasticsearch URL:port
});

describe("es書き込み", function () {
  it("JSON読み込み＆書き込み", function (done) {

    this.timeout(1000 * 60 * 30);   // 30 minutes

    const input = fs.readFileSync(filepath);
    const records = JSON.parse(input);
    const searchRecords = [];

    records.forEach((record) => {

      const header = {
        "index": {
          "_index": ES_INDEX,
          "_type": ES_TYPE
          // "_id": record.Id
        }
      };

      let item = {};

      const keys = Object.keys(record);
      keys.forEach((key) => {
        const type = record[key]["type"];
        if (type === "MODIFIER" || type === "CREATOR") {
          item[key] = `${record[key]["value"]["code"]}:${record[key]["value"]["name"]}`;
        } else {
          item[key] = record[key]["value"];
        }
      });

      searchRecords.push(header);
      searchRecords.push(item);

    });

    // console.log(searchRecords);

    ES_CLIENT.bulk({
      "body": searchRecords
    }, function (err, resp) {
      if (err) {
        console.log(err);
      } else {
        console.log(resp);
      }
      done();
    });


  });

});
