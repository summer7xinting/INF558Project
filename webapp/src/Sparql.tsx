import React from "react";
import MyLayout from "./Layout";
import { Row, Col, Input, Button } from 'antd';
import {inject, observer} from "mobx-react";
import {IStore} from "./stores";
import {RouterProps} from "react-router";

const { TextArea } = Input;

interface SparqlProps extends RouterProps {
  postSPARQLQuery: (sparqlQuery: string) => any,
}
interface SparqlState {
  sparqlQuery: string
}

@inject((stores: IStore) => ({
  postSPARQLQuery: stores.kgStore.postSPARQLQuery,
}))
@observer
export class SparqlComponent extends React.Component<
  SparqlProps,
  SparqlState
> {
  public state: SparqlState = {
    sparqlQuery: ""
  };

  componentDidMount() {
  }

  render() {
    return (
      <MyLayout>
        <Row>
          <TextArea
            rows={20}
            name="SPARQL Endpoint"
            defaultValue="Enter your SPARQL query here..."
            value={this.state.sparqlQuery}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              const { currentTarget } = event;
              this.setState({ sparqlQuery: currentTarget.value });
            }}
            wrap="soft"
            style={{
              padding:"5px",
              border:"2px solid",
              borderRadius: "5px",
              width: "100%"
            }}
          ></TextArea>
        </Row>
        <Row>
          <Col span={24}>
            <Button
              type="danger"
              onClick={() => {
                this.setState({ sparqlQuery: "" })
              }}
              style={{ margin: "10px", float: "right" }}
            >Clear</Button>
            <Button
              type="primary"
              onClick={() => {
                setTimeout(() => {this.props.history.push('/search');}, 100);
                this.props.postSPARQLQuery(this.state.sparqlQuery);
              }}
              style={{ margin: "10px", float: "right" }}
            >Submit</Button>
          </Col>
        </Row>
      </MyLayout>
  ); }
}

export default SparqlComponent;