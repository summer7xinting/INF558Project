import React from "react";
import MyLayout from "./Layout";
import {Col, Row, Typography} from 'antd';

const { Title, Paragraph, } = Typography;

const defaultProps = {};
interface HomeProps extends Readonly<typeof defaultProps> {
}
interface HomeState {}

export class HomeComponent extends React.Component<
  HomeProps,
  HomeState
> {
  public static defaultProps = defaultProps;
  public state: HomeState = {};

  render() {
    return (
      <MyLayout>
        <Typography>
          <Title>
            Welcome to Work Like A Charm<br/>
            <span style={{color: "purple", fontSize: "0.9em"}}><i> A Knowledge Graph That Helps You Find Your Dream Job!</i></span><br/>
          </Title>
          {/* FIXME: <h1>HOME</h1>
          <h1>{this.props.a}</h1>
          <Button type="danger" onClick={this.props.app.setA}>Click Me</Button> */}
          <Row>
            <Col span={16}>
              <Paragraph style={{textAlign: "left", fontSize: "1.0em"}}></Paragraph>
            </Col>
            <Col span={4}>
            </Col>
          </Row>
        </Typography>
      </MyLayout>
    );
  }
}

export default HomeComponent;
