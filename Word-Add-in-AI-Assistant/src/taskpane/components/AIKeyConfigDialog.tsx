import { Input, Modal } from "antd";
import React from "react";

// global variable to store the api key/endpoint/deployment, configrued by developer
export let _apiKey = "";
export let _endPoint = "";
export let _deployment = "";

export interface ApiKeyConfigProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

export interface ApiKeyConfigState {
    inputKey: string;
    endPoint: string;
    deployment: string;
}

export default class AIKeyConfigDialog extends React.Component<ApiKeyConfigProps, ApiKeyConfigState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            inputKey: _apiKey,
            endPoint: _endPoint,
            deployment: _deployment,
        };
    }

    componentDidMount(): void {
        this.setState({
            inputKey: _apiKey,
            endPoint: _endPoint,
            deployment: _deployment,
        });
    }

    setKey = (key: string) => {
        _apiKey = key;
    }

    setEndpoint = (endpoint: string) => {
        _endPoint = endpoint;
    }

    setDeployment = (deployment: string) => {
        _deployment = deployment;
    }

    handleOk = () => {
        if (this.state != null && this.state.inputKey != null) {
            this.setKey(this.state.inputKey);
        }
        if (this.state != null && this.state.endPoint != null) {
            this.setEndpoint(this.state.endPoint);
        }
        if (this.state != null && this.state.deployment != null) {
            this.setDeployment(this.state.deployment);
        }
        this.props.setOpen(false);
    };

    handleCancel = () => {
        //back to the global variable
        this.setState({
            inputKey: _apiKey,
            endPoint: _endPoint,
            deployment: _deployment,
        })
        this.props.setOpen(false);
    };

    keyChange = (e) => {
        this.setState({ inputKey: e.target.value });
    }

    ednpointChange = (e) => {
        this.setState({ endPoint: e.target.value });
    }

    deploymentChange = (e) => {
        this.setState({ deployment: e.target.value });
    }

    render() {
        return <>
            <Modal
                title="Connect to Azure OpenAI service."
                open={this.props.isOpen}
                onOk={this.handleOk}
                onCancel={this.handleCancel}>
                <label>EndPoint:</label>
                <Input placeholder="input endpoint here" onChange={this.ednpointChange} value={this.state.endPoint}/>
                <label>Deployment:</label>
                <Input placeholder="input deployment here" onChange={this.deploymentChange} value={this.state.deployment}/>
                <label>API key:</label>
                <Input placeholder="input api key here" onChange={this.keyChange} value={this.state.inputKey}/>
            </Modal>
        </>;
    }
}