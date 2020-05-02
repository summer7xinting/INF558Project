## Work Like A Charm
##### Home Dir: /INF558Project

### Run Jena Server And Expose Http Endpoint: `http://localhost:3030`
`bash ~/Downloads/apache-jena-fuseki-3.14.0/fuseki-server --loc=./DB /projectDB`
Manual upload ttl file if persistent db does not exist

### Query Jena Server Via Http
`ruby ~/Downloads/apache-jena-fuseki-3.14.0/bin/s-query --service=http://localhost:3030/projectDB/sparql --query=sparql-scripts/test.rq > sparql-cache/test1.json`

### Run Flask Server And And Expose Http Endpoint: `http://localhost:10011`
`python api/app.py`

## Run React Visualization
`cd webapp & npm start`

