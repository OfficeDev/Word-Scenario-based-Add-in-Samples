import { Button, Checkbox, Col, Row, message } from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import React from "react";
import { Page } from "./Home";
import TextArea from "antd/es/input/TextArea";

export enum InsertOption {
    Comment = "Comment",
    Footnote = "Footnote",
    Header = "Header",
    Document = "Document",
}

export interface InsertContentProps {
    setCurrentPage: (page: Page, generatedContent: string) => void;
    generatedContent: string;
}

export interface InsertContentState {
    generatedContent: string;
    checked: CheckboxValueType[];
}

export default class AITextDisplay extends React.Component<InsertContentProps, InsertContentState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            generatedContent: props.generatedContent,
            checked: [InsertOption.Document],
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.generatedContent !== this.props.generatedContent) {
            this.setState({
                generatedContent: nextProps.generatedContent,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.generatedContent !== this.props.generatedContent) {
            var displayGenerated = document.getElementById("display");
            displayGenerated.scrollIntoView({ block: "end" });
        }
    }

    handleOk = async () => {
        //iterate all the checked type and insert to corresponding position
        if (this.state.generatedContent.length > 0) {
            await Word.run(async (ctx) => {
              let range = ctx.document.getSelection();
              range.load();
              await ctx.sync();
              this.state.checked.map(async (checkedItem) => {
                switch (checkedItem) {
                  case InsertOption.Document:
                    let generatedRange = range.insertText(this.state.generatedContent + "\n", "After");
                    generatedRange.select();
                    break;
                  case InsertOption.Comment:
                    let insComment = range.insertComment(this.state.generatedContent);
                    break;
                  case InsertOption.Footnote:
                    let ftn = range.insertFootnote(this.state.generatedContent);
                    ftn.body.getRange().select();
                    break;
                  case InsertOption.Header:
                    const insHeader = ctx.document.sections
                      .getFirst()
                      .getHeader(Word.HeaderFooterType.primary)
                      .insertText(this.state.generatedContent, "End");
                      insHeader.select();
                    break;
                  default:
                    throw Error("Not implemented");
                }
                await ctx.sync();
              });
            }).catch((error) => {
              message.error(error.message);
            });
        }
    };

    handleCancel = () => {
        this.props.setCurrentPage(Page.Home, this.state.generatedContent);
    };

    onChange = (checkedValues: CheckboxValueType[]) => {
        this.setState({ checked: checkedValues });
    };

    onTextAreaChange = (e) => {
        this.setState({ generatedContent: e.target.value });
    };

    render() {
        return (
            <>
                <div className="display" id="display">
                    <div className="title">
                        <h2>Where you want to insert the generated content?</h2>
                    </div>
                    <div className="textArea">
                        <TextArea
                            style={{ minWidth: "100%", minHeight: "100%" }}
                            bordered={true}
                            placeholder="This is the generated text."
                            value={this.state.generatedContent}
                            autoSize={false}
                            showCount={true}
                            onChange={this.onTextAreaChange}
                        />
                    </div>
                    <div>
                        <Checkbox.Group
                            style={{ width: "100%", margin: "0.5rem 0" }}
                            defaultValue={[InsertOption.Document]}
                            onChange={this.onChange}
                        >
                            <Row className="checkWrapper">
                                <Col className="checkItem">
                                    <Checkbox value={InsertOption.Document}>{InsertOption.Document}</Checkbox>
                                </Col>
                                <Col className="checkItem">
                                    <Checkbox value={InsertOption.Comment}>{InsertOption.Comment}</Checkbox>
                                </Col>
                            </Row>
                            <Row className="checkWrapper">
                                <Col className="checkItem">
                                    <Checkbox value={InsertOption.Footnote}>{InsertOption.Footnote}</Checkbox>
                                </Col>
                                <Col className="checkItem">
                                    <Checkbox value={InsertOption.Header}>{InsertOption.Header}</Checkbox>
                                </Col>
                            </Row>
                        </Checkbox.Group>
                    </div>
                    <div className="buttons">
                        <div className="button">
                            <Button key="back" onClick={this.handleCancel}>
                                Return
                            </Button>
                        </div>
                        <div className="button">
                            <Button key="submit" type="primary" onClick={this.handleOk}>
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
