from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import json
import uuid

app = Flask(__name__)
CORS(app)

S_QUERY_EXEC = "/Users/summ7t/Downloads/apache-jena-fuseki-3.14.0/bin/s-query"
CACHE_DIR = "/Users/summ7t/dev/INF558Project/sparql-cache"
SPARQL_ENDPOINT = "http://localhost:3030/projectDB/sparql"


@app.route("/", methods=["GET"])
def index():
    return {"response": "Hello World!"}


@app.route("/test", methods=["GET"])
def test_jena():
    rq_file = "/Users/summ7t/dev/INF558Project/sparql-scripts/test.rq"
    data = run_sparql_on_jena(rq_file)
    return jsonify(data)


@app.route("/companies", methods=["GET"])
def list_company_names():
    # TODO: create a company name file for cache purposes
    data = [
        "amazon",
        "acara solutions",
        "accela incorprated",
        "acceleron pharma",
        # "facebook",
        "google llc",
        "nvidia"
    ]
    return jsonify(data)


@app.route("/sparql", methods=["POST"])
def run_sparql_from_server():
    sparql_query = request.json.get("sparql_query", "")
    rq_file = save_sparql_to_file(sparql_query)
    data = run_sparql_on_jena(rq_file)
    return jsonify(data)


@app.route("/search", methods=["POST"])
def search_with_constraints_server():
    # Create the sparql query based on constraints
    company_name = request.json.get("company_name", "")
    title = request.json.get("title", "")
    job_type = request.json.get("job_type", "")
    skillset = request.json.get("skillset", "")
    location = request.json.get("location", "")
    rating_rank = request.json.get("rating_rank", "")

    sparql_query = """
    PREFIX my_ns: <uri:xinting_myunghee:>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    
    SELECT ?job_uri ?company_uri ?company_name ?se_ds ?job_title ?location ?rating
    WHERE {
        ?job_uri a my_ns:job ;
           my_ns:company ?company_uri ;
           my_ns:se_ds ?se_ds ;
           my_ns:job_title ?job_title ;
           schema:location ?location .
        OPTIONAL {?job_uri schema:description ?job_description}
        ?company_uri schema:name ?company_name .
        OPTIONAL {?company_uri schema:aggregateRating ?rating}
    """
    if company_name:
        sparql_query += f"""
        FILTER (?company_name = '{company_name}')
        """
    if title:
        sparql_query += f"""
        FILTER contains(?title, '{title}')
        """
    if job_type:
        sparql_query += f"""
        FILTER contains(?se_ds, '{job_type}')
        """
    if location:
        sparql_query += f"""
        FILTER contains(?location, '{location}')
        """
    if skillset:
        sparql_query += f"""
        FILTER contains(?job_description, '{skillset}')
        """
    sparql_query += """
    } """ + f"""
    ORDER BY {rating_rank}(?rating)
    """
    print(sparql_query)
    rq_file = save_sparql_to_file(sparql_query)
    data = run_sparql_on_jena(rq_file)
    print(data)
    return jsonify(data)


@app.route("/companies/<company_uri>", methods=["GET"])
def list_company_details(company_uri):
    company_uri = f"my_ns:{company_uri.split(':')[-1]}"
    sparql_query = """
    PREFIX my_ns: <uri:xinting_myunghee:>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    SELECT ?name ?competitors ?foundingYear ?headquarters ?rating ?revenue ?sector ?numberOfEmployees ?ownershipType ?description ?url ?sameAs ?founder ?ceo ?parentOrganization ?subOrganization
    WHERE { """ + f"""
        {company_uri} schema:name ?name . """ + """
        OPTIONAL { """ + f"{company_uri}" + """ my_ns:competitors ?competitors . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:foundingYear ?foundingYear . }
        OPTIONAL { """ + f"{company_uri}" + """ my_ns:headquarters ?headquarters . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:aggregateRating ?rating . }
        OPTIONAL { """ + f"{company_uri}" + """ my_ns:revenue ?revenue . }
        OPTIONAL { """ + f"{company_uri}" + """ my_ns:sector ?sector . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:numberOfEmployees ?numberOfEmployees . }
        OPTIONAL { """ + f"{company_uri}" + """ my_ns:ownershipType ?ownershipType . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:description ?description . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:url ?url . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:sameAs ?sameAs . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:founder ?founder . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:ceo ?ceo . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:parentOrganization ?parentOrganization . }
        OPTIONAL { """ + f"{company_uri}" + """ schema:subOrganization ?subOrganization . }
    }
    """
    print(sparql_query)
    rq_file = save_sparql_to_file(sparql_query)
    data = run_sparql_on_jena(rq_file)
    print(data)
    return jsonify(data)


@app.route("/jobs/<job_uri>", methods=["GET"])
def list_job_details(job_uri):
    job_uri = f"my_ns:{job_uri.split(':')[-1]}"
    sparql_query = """
    PREFIX my_ns: <uri:xinting_myunghee:>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    SELECT ?title ?se_ds ?company_uri ?description ?location ?industry
    WHERE { """ + f"""
        {job_uri} my_ns:job_title ?title ;
                  my_ns:se_ds ?se_ds ;
                  my_ns:company ?company_uri ;
    """ + """
        OPTIONAL { """ + f"{job_uri}" + """ schema:description ?description . }
        OPTIONAL { """ + f"{job_uri}" + """ schema:location ?location . }
        OPTIONAL { """ + f"{job_uri}" + """ my_ns:industry ?industry . }
    }
    """
    print(sparql_query)
    rq_file = save_sparql_to_file(sparql_query)
    data = run_sparql_on_jena(rq_file)
    print(data)
    return jsonify(data)

# --- Helper Functions ----


def save_sparql_to_file(sparql_query):
    session_id = uuid.uuid4()
    with open(f"{CACHE_DIR}/{session_id}.rq", "w") as f:
        f.write(sparql_query)
    print(f"Being saved at {CACHE_DIR}/{session_id}.rq...")
    return f"{CACHE_DIR}/{session_id}.rq"


def run_sparql_on_jena(rq_file):
    # Assume rq file is valid
    command = f"ruby {S_QUERY_EXEC} --service={SPARQL_ENDPOINT} --query={rq_file}"
    output = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    json_string, _ = output.communicate()
    data = json.loads(json_string)
    if "results" not in data:
        results = []
    else:
        results = data["results"]["bindings"]
    return results


if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=10011, debug=True)
