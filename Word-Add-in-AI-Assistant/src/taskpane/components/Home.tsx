import React, { ReactElement } from "react";
import { DownOutlined, InteractionOutlined, RightOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, message, Space, Tooltip } from 'antd';
import AIWelcome from "./AIWelcome";
import { AssistanceOption, GenerateOptionList } from "./utility/config";
import AIGenerate from "./AIGenerate";
import AIKeyConfigDialog from "./AIKeyConfigDialog";
import AITextDisplay from "./AITextDisplay";
import AIPictureDisplay from "./AIPictureDisplay";
import Chat from "./Chat";

export enum Page {
    Home = "Home",
    GeneratedPage = "GeneratedPage",
    Chat = "Chat"
}

export default class Home extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    state = {
        selectedOption: AssistanceOption.Welcome,
        content: <AIWelcome />,
        curPage: Page.Home,
        generatedContent: "",
        openKeyConfigDialog: false,
    }

    setCurrentPage(page: Page, generatedContent: string) {
        this.setState({ curPage: page, generatedContent: generatedContent })
    }

    switchToChat = () => {
        this.setState({ curPage: Page.Chat })
    }

    open = (isOpen: boolean) => {
        this.setState({ openKeyConfigDialog: isOpen });
    };

    generateAssistanceContent: MenuProps['onClick'] = (e) => {
        if (e.key !== this.state.selectedOption) {
            var content: ReactElement = <></>
            switch (e.key) {
                case AssistanceOption.ChatMode:
                    this.switchToChat();
                    return;
                case AssistanceOption.Welcome:
                    content = <AIWelcome />
                    break;
                default:
                    content = this.generateRequestArea(e.key);
            }
            if (content["type"]["name"] === undefined) {
                //popup message to indicate the prompt type is not configured yet
                message.warning("This option item isn't configured yet.");
                return;
            }
            this.setState({
                selectedOption: e.key,
                content: content,
                curPage: Page.Home
            })
        }
    }

    generateRequestArea(key: string): ReactElement {
        var areaGenerated: ReactElement = <></>;
        GenerateOptionList.forEach((item) => {
            if (item.dropDownOption === key) {
                areaGenerated = <AIGenerate setCurrentPage={this.setCurrentPage.bind(this)} generateOption={item} openConfigDialog={this.open.bind(this)}/>
            }
        })
        return areaGenerated;
    }

    generateDropDownOption(): MenuProps['items'] {
        return Object.entries(AssistanceOption).map(([_, value]) => { return { label: <div style={{ textAlign: "center" }}>{value}</div >, key: value } });
    }

    render() {

        const items: MenuProps['items'] = this.generateDropDownOption();

        const menuProps = {
            items,
            onClick: this.generateAssistanceContent,
        };

        if(this.state.curPage === Page.Chat) {
            return (
              <>
                <Chat back={this.setCurrentPage.bind(this)} setOpen={this.open.bind(this)}>
                  <AIKeyConfigDialog
                    isOpen={this.state.openKeyConfigDialog}
                    setOpen={this.open.bind(this)}
                  />
                </Chat>
              </>
            );
        }

        return (
          <>
            <div className="wrapper">
              <div className="survey">
                <RightOutlined />
                <a
                  href="https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR8GFRbAYEV9Hmqgjcbr7lOdUNVAxQklNRkxCWEtMMFRFN0xXUFhYVlc5Ni4u"
                  target="_blank"
                >
                  How do you like this sample? Tell us more!
                </a>
              </div>
              <img
                src="https://i1.wp.com/artificialintelligencestechnology.com/wp-content/uploads/2020/03/Logo.png?fit=4167%2C4167&ssl=1"
                className="logo"
              />
              <h5 className="name">Content Generation</h5>
              <div className="login">
                <span>User: contoso</span>
                <AIKeyConfigDialog
                  isOpen={this.state.openKeyConfigDialog}
                  setOpen={this.open.bind(this)}
                />
                <div>
                  <Tooltip placement="topLeft" title="chat mode">
                    <InteractionOutlined
                      className="setting switchIcon"
                      onClick={() => this.setCurrentPage(Page.Chat, "")}
                    />
                  </Tooltip>
                  <SettingOutlined className="setting" onClick={() => this.open(true)} />
                </div>
              </div>
              <div className="option_selection">
                <Dropdown menu={menuProps} className="dropdown_option">
                  <Button>
                    <Space>
                      {this.state.selectedOption}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
              {this.state.content}
            </div>
            <div
              className="displayGenerated"
              id="displayGenerated"
              style={{ display: `${this.state.curPage == Page.GeneratedPage ? "block" : "none"}` }}
            >
              {this.state.selectedOption === AssistanceOption.GeneratePicture ? (
                <AIPictureDisplay
                  setCurrentPage={this.setCurrentPage.bind(this)}
                  pictureUrl={this.state.generatedContent}
                />
              ) : (
                <AITextDisplay
                  setCurrentPage={this.setCurrentPage.bind(this)}
                  generatedContent={this.state.generatedContent}
                />
              )}
            </div>
          </>
        );
    }
} 