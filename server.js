const csv = require("csvtojson");
const express = require("express");
const app = express();
const port = 3000;

const csvFilePath = "./public/shs_score.csv"; // Data

const names = [
  "No",
  "NIS",
  "NilaiRataRataRapot",
  "NilaiRataRataUN",
  "PlacementTest",
  "NilaiAkhir",
  "Minat",
]; // For header

const removeColumn = ["No", "NIS"];
const resultValue = "Minat";

const nameTable = [
  { name: "No", isExcept: true },
  { name: "NIS", isExcept: true },
  { name: "Nilai Rata - rata Rapot" },
  { name: "Nilai Rata - rata UN" },
  { name: "Placement Test" },
  { name: "Nilai Akhir" },
  { name: "Minat", ops: ["IPA", "IPS"], isExcept: true },
]; // For name table

app.set("view engine", "ejs");

app.use("/storages", express.static("public"));

app.get("/", async function (req, res) {
  let msgError = null;
  let result;
  let value = [];
  //check data
  const dataQuery = req.query;
  const keyQuery = Object.keys(req.query);

  if (keyQuery.length > 0) {
    const namesSelection = names.filter(
      (v) => !removeColumn.includes(v) && resultValue !== v
    );
    names.forEach(async (v) => {
      if (namesSelection.includes(v) && !dataQuery[v])
        msgError = "Harap isi semua Kolom";
      value.push(dataQuery[v]);
    });

    if (!msgError)
      result = await require("./knnHelper")(
        names,
        csvFilePath,
        value,
        removeColumn,
        resultValue
      );
  }
  res.render("pages/index", { names, nameTable, msgError, dataQuery, result });
});

app.get("/dataset", function (req, res) {
  csv({ noheader: false, headers: names })
    .fromFile(csvFilePath)

    .then((jsonObj) => {
      res.render("pages/dataset", { dataset: jsonObj, names, nameTable });
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
