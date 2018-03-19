let _fetch = [@bs] ((filePath) => Fetch.fetch(filePath));

let load = (jsonPathArr) => LoaderManagerSystem.load(jsonPathArr, _fetch, MainStateData.stateData);

let loadToData = (jsonPathArr, stateData) =>
  LoaderManagerSystem.load(jsonPathArr, _fetch, stateData);