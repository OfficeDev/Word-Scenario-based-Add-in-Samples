import { Button } from "antd";
import React from "react";
import { Page } from "./Home";

export interface AIPictureDisplayProps {
    pictureUrl: string;
    setCurrentPage: (page: Page, generatedContent: string) => void;
}

export interface AIPictureDisplayState {
    pictureUrl: string;
}

export default class AIPictureDisplay extends React.Component<AIPictureDisplayProps, AIPictureDisplayState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            pictureUrl: props.pictureUrl,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.generatedContent !== this.props.pictureUrl) {
            this.setState({
                pictureUrl: nextProps.generatedContent,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.generatedContent !== this.props.pictureUrl) {
            var displayGenerated = document.getElementById("display");
            displayGenerated.scrollIntoView({ block: "end" });
        }
    }

    handleCancel = () => {
        this.props.setCurrentPage(Page.Home, this.state.pictureUrl);
    };

    handleOk = async () => {
      fetch(this.props.pictureUrl).then(async (data) => {
        const blob = await data.blob();
        let bs64withPrefix = await new Promise((resolve) => {
          let reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const startIndex = bs64withPrefix.toString().indexOf("base64,");
        let base64 = bs64withPrefix.toString().substr(startIndex + 7);
        return Word.run(async (context) => {
          const range = context.document.getSelection();
          //convert the pictureUrl to base64
          const insPicture = range.insertInlinePictureFromBase64(base64, "After");
          insPicture.width = 200;
          insPicture.height = 200;
          await context.sync();
        });
      });
    };

    render() {
        return <>
            <div className="display" id="display">
                <div className="title">
                    <h2>Where you want to insert the generated picture?</h2>
                </div>
                <div className="pictureArea">
                    <img src={this.props.pictureUrl} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                </div>
                <div className="buttons">
                    <div className="button">
                        <Button key="back" onClick={this.handleCancel}>
                            Return
                        </Button>
                    </div>
                    <div className="button">
                        <Button key="submit" type="primary" onClick={this.handleOk}>
                            Insert
                        </Button>
                    </div>
                </div>
            </div>
        </>
    }
}