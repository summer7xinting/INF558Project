import React from "react";
import {inject, observer} from "mobx-react";
import {IStore} from "./stores";
import {RouteComponentProps} from "react-router";
import MyLayout from "./Layout";
import { Table } from "antd";
import { Link } from "react-router-dom";
const { Column } = Table;


type JobDetailsProps = {
  getJobDetails: (jobURI: string) => any,
  jobDetails: object,
}
interface JobDetailsState {
}

@inject((stores: IStore) => ({
  getJobDetails: stores.kgStore.getJobDetails,
  jobDetails: stores.kgStore.jobDetails
}))
@observer
export class JobDetailsComponent extends React.Component<
  JobDetailsProps & RouteComponentProps,
  JobDetailsState
> {
  public state: JobDetailsState = {
  };

  componentDidMount () {
    // @ts-ignore
    this.props.getJobDetails(this.props.match.params.jobURI)
  }

  render() {
    const { jobDetails } = this.props;
    const keyList: string[] = Object.keys(jobDetails);
    const valueList = Object.values(jobDetails);
    const data = keyList.map((k, idx) => {
      return ({
        key: k,
        value: valueList[idx]
      })
    });
    return (
      <MyLayout>
        <Table dataSource={data} size="small"
          pagination={{ defaultPageSize: 10 }}
        >
          <Column
            title="Key" dataIndex="key" key="key"
          />
          <Column
            title="Value" dataIndex="value" key="value"
            render={(value) => {
              if (value.type === "uri") {
                if (value.value.includes("uri:xinting_myunghee") && !value.value.includes("job")) {
                  return (
                    <Link to={`/companies/${value.value}`}>
                      <a style={{ marginRight: 16 }}>{value.value}</a>
                    </Link>)
                } else if (value.value.includes("uri:xinting_myunghee") && value.value.includes("job")) {
                  return (
                    <Link to={`/jobs/${value.value}`}>
                      <a style={{ marginRight: 16 }}>{value.value}</a>
                    </Link>)
                } else {
                  return (
                    <a style={{ marginRight: 16 }} href={value.value}>{value.value}</a>
                  );
                }
              } else {
                return (<p>
                  {JSON.stringify(value.value, null, 2)}
                </p>);
              }
            }}
          />
        </Table>
      </MyLayout>
    );
  }
}

export default JobDetailsComponent;