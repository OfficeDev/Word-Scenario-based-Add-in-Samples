import { LeftOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Segmented, message } from "antd";
import React, { Children } from "react";
import { Page } from "./Home";
import { generateText } from "./utility/config";
import { _apiKey, _deployment, _endPoint } from "./AIKeyConfigDialog";

export interface IChatProps {
  children?: React.ReactNode;
  back: (page: Page, generatedContent: string) => void;
  setOpen: (isOpen: boolean) => void;
}

export default class Chat extends React.Component<IChatProps> {
  constructor(props, context) {
    super(props, context);
  }

  state = {
    greeting: "please input whatever you want to say to the AI.",
    content: <></>,
    input: "",
    selectedMessage: "",
  };

  componentDidMount(): void {
    this.generateChatFlow();
    this.registerSelectRangeListner();
  }

  componentDidUpdate(): void {
    this.scrollToBottom();
  }

  generateChatFlow(): void {
    const content = (
      <div className="message clear">
        <span className="left">{this.state.greeting}</span>
      </div>
    );
    this.setState({ content: content });
  }

  registerSelectRangeListner() {
    Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
      return Word.run(async (context) => {
        const selRange = context.document.getSelection();
        selRange.load();
        await context.sync();
        if (selRange.text.length > 0) {
          this.setState({ input: selRange.text });
        }
      });
    });
  }

  scrollToBottom = () => {
    const bottom = document.getElementById("bottom");
    if (bottom) {
      bottom.scrollIntoView();
    }
  };

  onChange = async (option) => {
    await Word.run(async (context) => {
      const selRange = context.document.getSelection();
      switch (option) {
        case "Document":
          const insRange = selRange.insertText(this.state.selectedMessage, "After");
          insRange.style = "Normal";
          break;
        case "Comment":
          const insComment = selRange.insertComment(this.state.selectedMessage);
          insComment.getRange().style = "Normal";
          insComment.getRange().select();
          break;
        case "Footnote":
          const insFootnote = selRange.insertFootnote(this.state.selectedMessage);
          insFootnote.body.style = "Normal";
          insFootnote.body.select();
          break;
        case "Header":
          const insHeader = context.document.sections
            .getFirst()
            .getHeader(Word.HeaderFooterType.primary)
            .insertText(this.state.selectedMessage, "End");
          insHeader.style = "Normal";
          insHeader.select();
          break;
        default:
          break;
      }
      await context.sync();
    });
  };

  getSelectedContent = (e) => {
    const selectedMessage = e.currentTarget.getElementsByTagName("span");
    console.log(selectedMessage[0].innerText);
    this.setState({ selectedMessage: selectedMessage[0].innerText });
  };

  addChat = async () => {
    if (this.state.input == "" || this.state.input.trim() == "") return;

    const input = this.state.input;

    const reqMessage = (
      <div className="message clear">
        <span className="right">{this.state.input}</span>
      </div>
    );

    if (_apiKey === "" || _endPoint === "" || _deployment === "") {
      const alertMessage = (
        <>
          <div className="message clear">
            <div className="clear">
              <span className="left">
                Please config the{" "}
                <span onClick={() => this.props.setOpen(true)} className="configKey">
                  Azure OpenAI Account.{" "}
                </span>
              </span>
            </div>
          </div>
        </>
      );
      this.setState({
        content: (
          <>
            {" "}
            {this.state.content} {reqMessage} {alertMessage}{" "}
          </>
        ),
        input: "",
      });
      return;
    }

    this.setState({
      content: (
        <>
          {" "}
          {this.state.content} {reqMessage}{" "}
        </>
      ),
      input: "",
    });

    const ret = await generateText(input, 50).then((res) => {
      return res.replace("\n\r\n", "").replace("\n", "").replace("\n", "");
    }).catch((err) => {
      message.error(err.message);
      throw Error(err);
    });
    const responseMessage = (
      <div className="message clear" onClick={this.getSelectedContent}>
        <div className="clear">
          <span className="left">{ret}</span>
        </div>
        <div>
          <Segmented
            style={{ fontSize: "0.6rem", fontWeight: "bold", margin: 0, padding: 0 }}
            options={["Options", "Document", "Comment", "Footnote", "Header"]}
            onChange={this.onChange}
          />
        </div>
      </div>
    );
    this.setState({
      content: (
        <>
          {this.state.content}
          {responseMessage}
        </>
      ),
    });
  };

  onKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.addChat();
    }
  };

  back = () => {
    this.props.back(Page.Home, "");
  };

  inputChange = (e) => {
    this.setState({ input: e.target.value });
  }

  render() {
    return (
      <>
        <div className="chatWrapper">
          <div className="header">
            <div className="back">
              <div className="cursor" onClick={this.back}>
                <LeftOutlined />
                <span>Back</span>
              </div>
            </div>
          </div>
          <div className="content">
            <div id="chats">{this.state.content}</div>
            <div id="bottom"></div>
          </div>
          <div className="inputWrapper">
            <Input
              className="inputBox"
              placeholder="Input your prompt"
              onChange={this.inputChange}
              onKeyPress={this.onKeyPress}
              value={this.state.input}
            />
            <SendOutlined className="sendIcon" onClick={this.addChat}></SendOutlined>
          </div>
          <div>
            {Children.only(this.props.children)}
          </div>
        </div>
      </>
    );
  }
}
