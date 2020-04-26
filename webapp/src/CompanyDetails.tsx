import React from "react";
import {inject, observer} from "mobx-react";
import {IStore} from "./stores";
import {RouteComponentProps} from "react-router";
import MyLayout from "./Layout";
import { Table } from "antd";
import { Link } from "react-router-dom";
const { Column } = Table;

type CompanyDetailsProps = {
  getCompanyDetails: (companyURI: string) => any,
  companyDetails: object,
}
interface CompanyDetailsState {
}

@inject((stores: IStore) => ({
  getCompanyDetails: stores.kgStore.getCompanyDetails,
  companyDetails: stores.kgStore.companyDetails
}))
@observer
export class CompanyDetailsComponent extends React.Component<
  CompanyDetailsProps & RouteComponentProps,
  CompanyDetailsState
> {
  public state: CompanyDetailsState = {
  };

  componentDidMount () {
    // @ts-ignore
    this.props.getCompanyDetails(this.props.match.params.companyURI)
  }

  render() {
    const { companyDetails } = this.props;
    const keyList: string[] = Object.keys(companyDetails);
    const valueList = Object.values(companyDetails);
    const data = keyList.map((k, idx) => {
      return ({
        key: k,
        value: valueList[idx]
      })
    });
    return (
      <MyLayout>
        <Table dataSource={data} size="small"
          pagination={{ defaultPageSize: 15 }}
        >
          <Column
            title="Key" dataIndex="key" key="key"
          />
          <Column
            title="Value" dataIndex="value" key="value"
            render={(value) => {
              if (value.type == "uri") {
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
              } else if (value.value.includes("http")) {
                return (
                  <a style={{ marginRight: 16 }} href={value.value}>{value.value}</a>
                );
              }
              else {
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

export default CompanyDetailsComponent;