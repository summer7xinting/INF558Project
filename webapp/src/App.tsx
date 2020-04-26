import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./Home";
import NotFound404 from "./NotFound404";
import Search from "./Search";
import Sparql from "./Sparql";
import CompanyDetails from "./CompanyDetails";
import JobDetails from "./JobDetails";
import "./App.css";
import {inject, observer} from "mobx-react";
import {IStore} from "./stores";

interface Props {}

@inject((stores: IStore) => ({
  routing: stores.routing,
  kgStore: stores.kgStore
}))
@observer
export default class App extends React.Component<Props> {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/search" component={Search} />
          <Route exact path="/sparql" component={Sparql} />
          <Route path='/companies/:companyURI' component={CompanyDetails}/>
          <Route path='/jobs/:jobURI' component={JobDetails}/>
          <Route component={NotFound404} />
        </Switch>
      </BrowserRouter>
    );
  }
}
