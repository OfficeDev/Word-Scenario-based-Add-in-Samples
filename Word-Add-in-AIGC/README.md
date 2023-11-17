## This sample illustrates
- Import the document template
- Generated title/comment/footnote by Azure OpenAI service or predefined can be inserted to Word document
- Format the document style
- Insert predefined picture into the document


## Prerequisite to use this sample
- The Word app installed
- An Azure OpenAI service account. If you do not have, apply one from https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython&pivots=rest-api.


## Minimal path to awesome
### Run the app locally
1. Clone the repo to your local workspace or directly download the source code.
1. Open the project in Visual Studio Code.
1. You can fill in the parameters apiKey, endpoint and deployment in src/taskpane/components/utility/AIData.tsx to persist the Azure OpenAI account or you can skip this step to fill in the account when you operate the AI related UI.
If you cannot get an OpenAI account, just try the predefined functionality. Just go ahead.
1. cd src folder and execute following commands:
   npm install
   npm start
1. Start debugging the project by hitting the `F5` key in Visual Studio Code.


### How to create your own Word add-in
The get started documentation https://learn.microsoft.com/en-us/office/dev/add-ins/quickstarts/word-quickstart?tabs=yeomangenerator