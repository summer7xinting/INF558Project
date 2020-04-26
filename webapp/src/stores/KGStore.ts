import {action, observable} from "mobx";
import axios from "axios";

export type RDFResultType = {
  company_name: RDFEntryType,
  se_ds: RDFEntryType,
  job_title: RDFEntryType,
  job_uri: RDFEntryType,
  company_uri: RDFEntryType,
  location: RDFEntryType,
  rating?: RDFEntryType
}

export type RDFEntryType = {
  type: string,
  value: string
}

const flaskUrl = "http://localhost:10011";

export default class KGStore {

  @observable RDFResults: RDFResultType[] = [];
  @observable companyNames: string[] = [];
  @observable jobDetails: object = [];
  @observable companyDetails: object = [];

  @action.bound getCompanyDetails = (companyURI: string) => {
    Promise.resolve().then(() =>
      axios.get(`${flaskUrl}/companies/${companyURI}`)
      .then(
        resp => {
          this.companyDetails = resp.data[0];
        },
        error => {
          console.log(error);
    }));
  }

  @action.bound getJobDetails = (jobURI: string) => {
    Promise.resolve().then(() =>
      axios.get(`${flaskUrl}/jobs/${jobURI}`)
      .then(
        resp => {
          this.jobDetails = resp.data[0];
        },
        error => {
          console.log(error);
    }));
  }


  @action.bound getCompanyNames = () => {
    Promise.resolve().then(() =>
      axios.get(`${flaskUrl}/companies`)
      .then(
        resp => {
          this.companyNames = resp.data;
        },
        error => {
          console.log(error);
    }));
  }

  @action.bound searchRDFResults = (
    company_name: string,
    title: string,
    job_type: string,
    skillset: string,
    location: string,
    rating_rank: string
  ) => {
    console.log(`Searching for ${company_name}`)
    Promise.resolve().then(() =>
      axios.post(`${flaskUrl}/search`, {
        company_name,
        title,
        job_type,
        skillset,
        location,
        rating_rank
      }).then(
        resp => {
          this.RDFResults = resp.data;
        },
        error => {
          console.log("Should handle error properly!");
          console.log(error);
    }));
  }

  @action.bound postSPARQLQuery = (sparqlQuery: string) => {
    Promise.resolve().then(() =>
      axios.post(`${flaskUrl}/sparql`, {
        sparql_query: sparqlQuery
      }).then(
        resp => {
          this.RDFResults = resp.data;
        },
        error => {
          console.log(error);
    }));
  }

  // @action.bound setGraphCreated = (graphCreated: boolean) => {
  //   this.graphCreated = graphCreated;
  // }
};
