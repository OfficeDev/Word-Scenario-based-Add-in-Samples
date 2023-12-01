import { Input, Modal } from "antd";
import React from "react";

export interface ApiKeyConfigProps {
    isOpen: boolean;
    apiKey: string;
    setKey: (key: string) => void;
    setOpen: (isOpen: boolean) => void;
}

export interface ApiKeyConfigState {
    inputKey: string;
}

export default class AIKeyConfigDialog extends React.Component<ApiKeyConfigProps, ApiKeyConfigState> {
    constructor(props, context) {
        super(props, context);
    }

    handleOk = () => {
        if (this.state != null && this.state.inputKey != null && this.state.inputKey.length > 0) {
            this.props.setKey(this.state.inputKey);
        } else {
            this.props.setOpen(false);
        }
    };

    handleCancel = () => {
        this.props.setOpen(false);
    };

    inputChange = (e) => {
        this.setState({ inputKey: e.target.value });
    }

    render() {
        return <>
            <Modal
                title="Input the api key!"
                open={this.props.isOpen}
                onOk={this.handleOk}
                onCancel={this.handleCancel}>
                <Input placeholder="input here" onChange={this.inputChange} />
            </Modal>
        </>;
    }
}