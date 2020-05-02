from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import json
import uuid
import pandas as pd

app = Flask(__name__)
CORS(app)

S_QUERY_EXEC = "/Users/summ7t/Downloads/apache-jena-fuseki-3.14.0/bin/s-query"
CACHE_DIR = "/Users/summ7t/dev/INF558Project/sparql-cache"
DATA_DIR = "/Users/summ7t/dev/INF558Project/data"
SPARQL_ENDPOINT = "http://localhost:3030/projectDB/sparql"

COMPANY_LIST = [
    "dematic",
    "cybercoders",
    "astrazeneca",
    "software engineering institute",
    "the church of jesus christ of latter-day saints",
    "walmart ecommerce",
    "amazon",
    "genworth",
    "kapsch",
    "caci international",
    "novartis",
    "atlassian",
    "juniper networks",
    "massmutual",
    "mitre",
    "novetta",
    "osi engineering",
    "advantage resourcing",
    "boeing intelligence & analytics",
    "jpmorgan chase",
    "liberty mutual insurance",
    "randstad",
    "relativity",
    "takeda pharmaceuticals",
    "the judge group",
    "esri",
    "mission essential",
    "adient",
    "atterro",
    "bluebird bio",
    "centauri",
    "honeywell",
    "intuit - data",
    "mantech",
    "matrix resources",
    "my job tank",
    "reynolds american",
    "staffing now",
    "xilinx",
    "adobe",
    "american axle & manufacturing",
    "amtec human capital",
    "centurylink",
    "collabera",
    "dell",
    "e-trade",
    "fidelity talentsource",
    "genentech",
    "genesys",
    "j.p. morgan chase & co",
    "jp morgan chase & co.",
    "mars",
    "pfizer",
    "pnnl",
    "quicken loans inc.",
    "the mil corporation",
    "us army ground vehicle systems center",
    "western digital",
    "workday",
    "23andme",
    "bioclinica inc.",
    "cgi group  inc.",
    "dcs corporation",
    "decisive intel",
    "general atomics",
    "ignw",
    "jlg industries",
    "kratos defense & security solutions",
    "neteffects inc.",
    "north american lighting",
    "npaworldwide recruitment network",
    "numeric llc",
    "raytheon",
    "sandia national laboratories",
    "scientific research corporation",
    "synechron",
    "technology navigators",
    "the clorox company",
    "university of nebraska lincoln",
    "adp technology services inc",
    "aic",
    "ascent services group",
    "avanade",
    "cboe global markets",
    "cdk global",
    "citti handelsgesellschaft mbh & co. kg",
    "clarus commerce",
    "clearedge",
    "demandbase",
    "efolder inc.",
    "eliassen group",
    "ellie mae",
    "equity residential",
    "erc",
    "fivestars",
    "general dynamics mission systems inc",
    "gsk",
    "hays specialist recruitment",
    "henkel",
    "imodules",
    "infoweb systems inc.",
    "interactive brokers llc",
    "intuit - software engineering",
    "invitae",
    "jbl resources",
    "kronos bio",
    "lrs",
    "new england biolabs",
    "nvidia"
]
COMPANY_LIST.sort()


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
    return jsonify(COMPANY_LIST)


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
        FILTER (lcase(?company_name) = lcase('{company_name}'))
        """
    if title:
        sparql_query += f"""
        FILTER contains(lcase(?job_title), lcase('{title}'))
        """
    if job_type:
        sparql_query += f"""
        FILTER contains(?se_ds, '{job_type}')
        """
    if location:
        sparql_query += f"""
        FILTER contains(lcase(?location), lcase('{location}'))
        """
    if skillset:
        sparql_query += f"""
        FILTER contains(lcase(?job_description), lcase('{skillset}'))
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
