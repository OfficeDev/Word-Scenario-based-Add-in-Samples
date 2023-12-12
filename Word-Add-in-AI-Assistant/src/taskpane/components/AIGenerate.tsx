import { Button, message } from "antd";
import React from "react";
import TextArea from "antd/es/input/TextArea";
import { Page } from "./Home";
import { generate, GenerateOption, GenerateType } from "./utility/config";
import { _apiKey, _deployment, _endPoint } from "./AIKeyConfigDialog";

export interface AIGenerateState {
    sourceWords: string;
    generatedText: string;
    loading: boolean;
}

export interface AIGenerateProps {
    setCurrentPage: (page: Page, generatedContent: string) => void;
    openConfigDialog: (isOpen: boolean) => void;
    generateOption: GenerateOption;
}

export default class AIGenerateText extends React.Component<AIGenerateProps, AIGenerateState> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            sourceWords: "",
            generatedText: "",
            loading: false,
        };
    }

    componentWillReceiveProps() {
        this.setState({
            sourceWords: "",
        });
    }

    componentDidMount() {
        this.registerSelectRangeListner();
    }

    registerSelectRangeListner() {
        Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
            return Word.run(async (context) => {
                const selRange = context.document.getSelection();
                selRange.load();
                await context.sync();
                if (selRange.text.length > 0) {
                    this.setState({ sourceWords: this.props.generateOption.promptPrefix + selRange.text });
                }
            });
        });
    }

    generate = async () => {
        if (this.state.sourceWords.length == 0) {
            message.warning("please select source content.");
        } else if (_apiKey === "" || _endPoint === "" || _deployment === "") {
            this.props.openConfigDialog(true);
        } else {
            this.setState({ loading: true });
            await generate(this.state.sourceWords, this.props.generateOption)
                .then((genStr) => {
                    var genContent = genStr;
                    if (this.props.generateOption.type === GenerateType.Text) {
                        genContent = genContent.replace("\n\r\n", "").replace("\n", "").replace("\n", "");
                    }
                    this.setState({ loading: false });
                    this.props.setCurrentPage(Page.GeneratedPage, genContent);
                }).catch((err) => {
                    message.error(err.message);
                    this.setState({ loading: false });
                })
        }
    };

    onSrcChange = async (e) => {
        this.setState({ sourceWords: e.target.value });
    };

    render() {
        return (
            <>
                <div className="generate">
                    <TextArea
                        style={{ minWidth: "100%", minHeight: "100%", marginBottom: "5px", padding: 0 }}
                        bordered={true}
                        onChange={this.onSrcChange}
                        placeholder={this.props.generateOption.tips}
                        value={this.state.sourceWords}
                        autoSize={false}
                        showCount={true}
                    />
                </div>
                <Button type="primary" className="submit" onClick={this.generate} loading={this.state.loading}>
                    Submit
                </Button>
            </>
        );
    }
}
