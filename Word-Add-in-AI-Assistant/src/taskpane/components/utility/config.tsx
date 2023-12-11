import { AxiosRequestConfig } from "axios";
import { get, post } from "./request";
import { message } from "antd";
import { _apiKey, _deployment, _endPoint } from "../AIKeyConfigDialog";

export enum GenerateType {
    Text = "Text",
    Picture = "Picture",
}

export enum AssistanceOption {
    Welcome = "Welcome",
    GenerateText = "Generate Text",
    GeneratePicture = "Generate Picture",
    ChatMode = "Chat Mode",
}

export interface GenerateOption {
    promptPrefix: string; //The prompt prefix sent to the AI service,
    dropDownOption: AssistanceOption;
    tips: string; //Display in the text area as a placeholder,
    type: GenerateType;
}

//customize this list according to the AssistanceOption, notice that only the text based option can be customized here
export const GenerateOptionList: GenerateOption[] = [
    {
        promptPrefix: "Generate text about the topic: ",
        dropDownOption: AssistanceOption.GenerateText,
        tips: "Please select the source words. Generate the content about the selected topic.",
        type: GenerateType.Text,
    },
    {
        promptPrefix: "Generate the picture according to the description: ",
        dropDownOption: AssistanceOption.GeneratePicture,
        tips: "Please select the description of picture. Generate the picture and inserted to the original document.",
        type: GenerateType.Picture,
    }
];

export const AzureAI = {
    apiversion: "2023-05-15"
};

export interface AzureTextGenAPI {
    prompt: string;
    max_tokens: number;
}

export interface AzureTextGenItem {
    text: string;
    index: number;
    finish_reason: string;
    logprobs: any;
}

export interface AzureTextGenRes {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: AzureTextGenItem[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export const generate = (content: string, option: GenerateOption): Promise<string> => {
    if (option.type === GenerateType.Text) {
        return generateText(content);
    } else {
        return generatePicture(content);
    }
}

export const generateText = (content: string, maxTokens: number = 1000) => {
    let requestBody: AzureTextGenAPI = { prompt: content, max_tokens: maxTokens };
    let config: AxiosRequestConfig = {
        headers: {
            "api-key": _apiKey,
            "Content-Type": "application/json",
        },
        params: {
            "api-version": AzureAI.apiversion,
        },
    };

    let url = _endPoint + "/openai/deployments/" + _deployment + "/completions";

    return post(url, requestBody, config).then((res) => {
        if (res.status == 200 && res.data != null) {
            let resObj: AzureTextGenRes = res.data;
            if (resObj.choices == null || resObj.choices.length == 0) {
                message.error("get no choices from the azure service.");
            }
            return resObj.choices[0].text;
        } else {
            throw Error(res.data.error);
        }
    }).catch((err) => {
        throw Error(err);
    });
};

////////////////////////////////////////////Generate Picture//////////////////////////////////////////////

export const DallE = {
    apiVersion: "2023-06-01-preview"
};

export const generatePicture = (prompt: string) => {
    let requestBody = {
        prompt: prompt,
        n: 1,
        size: "512x512",
    };
    let config: AxiosRequestConfig = {
        headers: {
            "api-key": _apiKey,
            responseType: "blob",
        },
        params: {
            "api-version": DallE.apiVersion,
        },
    };
    let imageUrl = _endPoint + "/openai/images/generations:submit";

    return post(imageUrl, requestBody, config).then(async (res) => {
        if (res.status == 202 && res.headers["operation-location"] != null) {
            const operationLocation = res.headers["operation-location"];
            var status = "notRunning";
            var maxRetry = 10;
            var count = 0;
            var imageUrl = undefined;
            while (status != "succeeded" && count < maxRetry) {
                await get(operationLocation, {
                    headers: {
                        "api-key": _apiKey,
                    },
                }).then((r) => {
                    if (r.status == 200 && r.data.status == "succeeded") {
                        imageUrl = r.data.result.data[0].url;
                        status = r.data.status;
                    }
                }).then(() => {
                    count++;
                    return new Promise((resolve) => setTimeout(resolve, 1000));
                });
            }
            if (imageUrl == undefined) {
                throw Error("get image url failed.");
            }
            return imageUrl;
        } else {
            throw Error(res);
        }
    }).catch((err) => {
        throw Error(err);
    });
};
