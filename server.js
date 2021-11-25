const csv = require("csvtojson");
const express = require("express");
const app = express();
const port = 3000;

const csvFilePath = "./iris.csv"; // Data
const names = [
  "sepalLength",
  "sepalWidth",
  "petalLength",
  "petalWidth",
  "type",
]; // For header
const nameTable = [
  { name: "sepal Length" },
  { name: "sepal Width" },
  { name: "petal Length" },
  { name: "petal Width" },
  { name: "type", ops: ["Iris-setosa", "Iris-versicolor", "Iris-virginica"] },
]; // For name table

app.set("view engine", "ejs");

app.get("/", async function (req, res) {
  let msgError = null;
  let result;
  let value = [];
  //check data
  const dataQuery = req.query;
  const keyQuery = Object.keys(req.query);

  if (keyQuery.length > 0) {
    names.forEach(async (v) => {
      if (!keyQuery.includes(v)) msgError = "Harap isi semua Kolom";
      value.push(dataQuery[v]);
    });

    if (!msgError)
      result = await require("./knnHelper")(names, csvFilePath, value);
 
  }
  res.render("pages/index", { names, nameTable, msgError, dataQuery,result });
});

app.get("/dataset", function (req, res) {
  csv({ noheader: true, headers: names })
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      res.render("pages/dataset", { dataset: jsonObj, names, nameTable });
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
