import {createBrowserHistory} from "history";
import {RouterStore, syncHistoryWithStore} from "mobx-react-router";
import KGStore from "./KGStore";
// import { autorun } from "mobx";

export const routingStore = new RouterStore();
export const stores = {
  routing: routingStore,
  kgStore: new KGStore()
}

export type IStore = Readonly<typeof stores>;
export const history = syncHistoryWithStore(
  createBrowserHistory(),
  routingStore
);
