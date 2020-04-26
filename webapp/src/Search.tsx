import React from "react";
import MyLayout from "./Layout";
import { Table, Row, Col, Select, Button, Input } from 'antd';
import {inject, observer} from "mobx-react";
import {IStore} from "./stores";
import { RDFResultType } from "./stores/KGStore";
import { Link } from "react-router-dom";
const { Column } = Table;
const { Option } = Select;

const defaultProps = {};
interface SearchProps extends Readonly<typeof defaultProps> {
  RDFResults: RDFResultType[],
  searchRDFResults: (
    company_name: string, title: string, job_type: string,
    skillset: string, location: string, ratingRank: string
  ) => any,
  getCompanyNames: () => any,
  companyNames: string[]
}
interface SearchState {
  companyName: string,
  title: string,
  jobType: string,
  location: string,
  skillset: string,
  ratingRank: string
}

const USStates = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

@inject((stores: IStore) => ({
  searchRDFResults: stores.kgStore.searchRDFResults,
  RDFResults: stores.kgStore.RDFResults,
  getCompanyNames: stores.kgStore.getCompanyNames,
  companyNames: stores.kgStore.companyNames
}))
@observer
export class SearchComponent extends React.Component<
  SearchProps,
  SearchState
> {
  public state: SearchState = {
    companyName: "",
    title: "",
    jobType: "",
    location: "",
    skillset: "",
    ratingRank: "DESC"
  };

  componentDidMount() {
    this.props.getCompanyNames();
  }

  render() {
    const data = this.props.RDFResults.map((r, i) => {
      return ({
        companyName: r.company_name.value,
        jobType: r.se_ds.value,
        jobTitle: r.job_title.value,
        location: r.location.value,
        key: i,
        rating: r.rating ? parseFloat(r.rating.value).toString() : "N/A",
        job_uri: r.job_uri.value,
        company_uri: r.company_uri.value,
      })
    })
    console.log(data)
    return (
      <MyLayout>
        <Row style={{ verticalAlign: "middle" }}>
          <Col span={8}>
            <p style={{ margin: "0" }}>Select From Top 100 Big Names:</p>
            <Select
              value={this.state.companyName}
              style={{ width: "95%", margin: "5px" }}
              onChange={(value)  => {
                if (value === undefined || value === null) { return; }
                this.setState({ companyName: value.toString()});
              }}
              maxTagCount={100}
            >
              {this.props.companyNames.map((cn, i) => {
                return (<Option
                  value={cn} key={`cn-${i}`}
                >{cn}</Option>);
              })}
            </Select>
          </Col>
          <Col span={4}>
            <p style={{ margin: "0" }}>Select Job Type:</p>
            <Select value={this.state.jobType} style={{ width: "95%", margin: "5px" }} onChange={(value)  => {
              if (value === undefined || value === null) { return; }
              this.setState({ jobType: value.toString()});
            }}>
              <Option value="SE" key="SE">SE</Option>
              <Option value="DS" key="DS">DS</Option>
            </Select>
          </Col>
          <Col span={4}>
            <p style={{ margin: "0" }}>Select Location:</p>
            <Select value={this.state.location} style={{ width: "95%", margin: "5px" }} onChange={(value)  => {
              if (value === undefined || value === null) { return; }
              this.setState({ location: value.toString()});
            }}>
              {USStates.map((sc, i) => {
                return (<Option
                  value={sc} key={`sc-${i}`}
                >{sc}</Option>);
              })}
            </Select>
          </Col>
          <Col span={4}>
            <p style={{ margin: "0" }}>Order By Rating:</p>
            <Select value={this.state.ratingRank} style={{ width: "95%", margin: "5px" }} onChange={(value)  => {
              if (value === undefined || value === null) { return; }
              this.setState({ ratingRank: value.toString()});
            }}>
              <Option value="DESC" key="DESC">DESC</Option>
              <Option value="ASC" key="ASC">ASC</Option>
            </Select>
          </Col>
          <Col span={4}></Col>
        </Row>
        <Row style={{ verticalAlign: "middle" }}>
          <Col span={8}>
            <p style={{ margin: "0" }}>Search Title Keywords:</p>
            <Input
              placeholder="Enter title keywords..."
              value={this.state.title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget } = event;
                this.setState({ title: currentTarget.value });
              }}
              style={{
                margin: "5px",
                borderRadius: "5px",
                width: "95%"
              }}
            />
          </Col>
          <Col span={12}>
            <p style={{ margin: "0" }}>Search Skillset Keywords:</p>
            <Input
              placeholder="Enter skillset keywords..."
              value={this.state.skillset}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget } = event;
                this.setState({ skillset: currentTarget.value });
              }}
              style={{
                margin: "5px",
                borderRadius: "5px",
                width: "100%"
              }}
            />
          </Col>
          <Col span={4}>
            <Button
              type="danger"
              onClick={() => {
                this.setState({
                  companyName: "",
                  title: "",
                  jobType: "",
                  location: "",
                  skillset: "",
                  ratingRank: "DESC"
                })
              }}
              style={{ margin: "15px", float: "right" }}
            >Clear</Button>
            <Button
              type="primary"
              onClick={() => {
                this.props.searchRDFResults(
                  this.state.companyName,
                  this.state.title,
                  this.state.jobType,
                  this.state.skillset,
                  this.state.location,
                  this.state.ratingRank
                );
              }}
              style={{ margin: "15px", float: "right" }}
            >Submit</Button>
          </Col>
        </Row>
        <Row>
          <p style={{ margin: "15px 0 0 0" }}>Here are the results:</p>
        </Row>
        <Table dataSource={data}>
          <Column
            title="Company Name" dataIndex="companyName" key="companyName"
            render={(value, record) => {
              return (
              // @ts-ignore
              <Link to={`/companies/${record!.company_uri}`}>
                <a style={{ marginRight: 16 }}>{value}</a>
              </Link>
            )}}
          />
          <Column
            title="Job Title" dataIndex="jobTitle" key="jobTitle"
            render={(value, record) => {
              return (
              // @ts-ignore
              <Link to={`/jobs/${record!.job_uri}`}>
                <a style={{ marginRight: 16 }}>{value}</a>
              </Link>
            )}}
          />
          <Column title="Location" dataIndex="location" key="location" />
          <Column title="Job Type" dataIndex="jobType" key="jobType" />
          <Column title="Company Rating" dataIndex="rating" key="rating" />
        </Table>
      </MyLayout>
  ); }
}

export default SearchComponent;
