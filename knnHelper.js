const KNN = require("ml-knn");
const csv = require("csvtojson");

module.exports = async function (
  names,
  csvFilePath,
  value,
  exceptColByKey = [],
  resultKey = null,
  headerExist = false
) {
  let knn;

  let seperationSize; // To seperate training and test data

  let data = [],
    X = [],
    y = [];

  let result = {};

  let trainingSetX = [],
    trainingSetY = [],
    testSetX = [],
    typesArray = [],
    testSetY = [];

  await csv({ noheader: headerExist, headers: names })
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      if (jsonObj.length) {
        data = shuffleArray(jsonObj);
        return dressData();
      } else
        return {
          notice: "The dataset not found",
          result: ` Result = Unknown`,
        };
    });

  return result;

  function dressData() {
    /**
     * There are three different types of Iris flowers
     * that this dataset classifies.
     *
     * 1. Iris Setosa (Iris-setosa)
     * 2. Iris Versicolor (Iris-versicolor)
     * 3. Iris Virginica (Iris-virginica)
     *
     * We are going to change these classes from Strings to numbers.
     * Such that, a value of type equal to
     * 0 would mean setosa,
     * 1 would mean versicolor, and
     * 3 would mean virginica
     */

    let types = new Set(); // To gather UNIQUE classes
    let setKey = resultKey ? resultKey : Object.keys(data[0]).pop();
    let indexKey = Object.keys(data[0]).indexOf(setKey);
    let exceptColIndex = [];

    data.forEach((row) => {
      types.add(row[setKey]);
    });

    exceptColByKey.forEach((e) => {
      exceptColIndex.push(Object.keys(data[0]).indexOf(e));
    });

    typesArray = [...types]; // To save the different types of classes.
    data.forEach((row) => {
      let rowArray, typeNumber;
      rowArray = Object.keys(row)
        .map((key) => parseFloat(row[key]))
        .filter((e, i) => indexKey !== i && !exceptColIndex.includes(i));
    
      typeNumber = typesArray.indexOf(row[setKey]); // Convert type(String) to type(Number)

      X.push(rowArray);
      y.push(typeNumber);
    });

      trainingSetX = X.slice(0, seperationSize);
      trainingSetY = y.slice(0, seperationSize);
      testSetX = X.slice(seperationSize);
      testSetY = y.slice(seperationSize);

     return train();
  }

  function train() {
    knn = new KNN(trainingSetX, trainingSetY, { k: 7 });
    return test();
  }

  function test() {
    const result = knn.predict(testSetX);
    const testSetLength = testSetX.length;
    const predictionError = error(result, testSetY);
    const notice = `Test Set Size = ${testSetLength} and number of Misclassifications = ${predictionError}`;
    return predict(notice);
  }

  function error(predicted, expected) {
    let misclassifications = 0;
    for (var index = 0; index < predicted.length; index++) {
      if (predicted[index] !== expected[index]) {
        misclassifications++;
      }
    }
    return misclassifications;
  }

  function predict(notice) {
    let temp = [];
    value.forEach((v) => {
      temp.push(parseFloat(v));
    });

    result = {
      notice,
      result: ` Result = ${typesArray[knn.predict(temp)]}`,
    };
  }

  /**
   * https://stackoverflow.com/a/12646864
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   */
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
};
