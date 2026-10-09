module.exports = (app) => {
  const { db: dbConfig } = app.config;
  if(!dbConfig) {
    console.log("------- Could not find dbConfig")
    return;
  }

  return require('knex')(dbConfig);
}