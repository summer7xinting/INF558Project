import * as React from "react";
import {Link} from "react-router-dom";
import { Layout, Menu } from 'antd';
import {inject} from "mobx-react";
import {IStore} from "./stores";

const { Header, Content, Footer } = Layout;

type LayoutProps = {
  children?: any,
  isLoading?: boolean,
  hasFailed?: boolean,
  errorData?: object
};

type LayoutState = {
  selectedKey: string
};

@inject((stores: IStore) => ({
  routing: stores.routing,
  kgStore: stores.kgStore,
}))
export default class MyLayout extends React.Component<LayoutProps> {
  state: Readonly<LayoutState> = {
    selectedKey: ""
  }

  render() {
    const { children } = this.props;

    // FIXME: onClick and highlight is not consistent
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          openKeys={["search"]}
          style={{ lineHeight: '64px' }}
          onClick={({ key }) => this.setState({
            selectedKey: key
          })}
        >
          <Menu.Item key="home">
            <Link to={"/"}>
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="search">
            <Link to={"/search"}>
              Search
            </Link>
          </Menu.Item>
          <Menu.Item key="sparql">
            <Link to={"/sparql"}>
              SPARQL
            </Link>
          </Menu.Item>
        </Menu>
        </Header>
        <Content style={{ padding: '30px 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 400, height: "100%", overflow: "auto" }}>
          {children}
         </div>
        </Content>
        <Footer style={{ textAlign: 'center', verticalAlign: "bottom" }}>Work Like A Charm ©2020 Created by Myunghee Lee and Xinting Wang</Footer>
      </Layout>
    );
  }
}