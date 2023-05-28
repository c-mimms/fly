import 'node-fetch';
// import { createParser } from 'eventsource-parser'

const url = 'https://api.openai.com/v1/chat/completions';

async function queryGpt(messages, stopSequence) {
    var model = 'gpt-3.5-turbo';
    // var model = 'gpt-4';
    var temperature = 0.7;
    var maxTokens = 250;

    const params = { model, messages, temperature, max_tokens: maxTokens };
    if (stopSequence) {
      params.stop = stopSequence;
    }
    const headers = {
        Authorization: `Bearer ${process.env.GPT_API_KEY}`,
        'Content-Type': 'application/json',
    };

    console.time("fetchGPT")
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
    });
    // console.log('Response json: ', response);
    console.timeEnd("fetchGPT")
    const json = await response.json();

    if (json.choices && json.choices[0] && json.choices[0].message) {
        return json.choices[0].message.content;
    } else {
        console.log('Error: Unexpected API response format', json);
        return 'ERROR';
    }
}

// export async function streamGpt(messages, callback) {
//     let response = await fetch(url,
//         {
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${process.env.GPT_API_KEY}`
//             },
//             method: "POST",
//             body: JSON.stringify({
//                 // model: "gpt-4",
//                 model: 'gpt-3.5-turbo',
//                 messages: messages,
//                 temperature: 0.75,
//                 max_tokens: 500,
//                 stream: true,
//             }),
//         });

//     console.log("Streaming");

//     const parser = createParser(thing => {
//         var piece = onParse(thing);
//         if (piece) {
//             callback(piece);
//         }
//     });
//     for await (const value of response.body?.pipeThrough(new TextDecoderStream())) {
//         parser.feed(value);
//     }
// }

// function onParse(event) {
//     if (event.type === 'event') {
//         if (event.data !== "[DONE]") {
//             return JSON.parse(event.data).choices[0].delta?.content || "";
//         }
//     } else if (event.type === 'reconnect-interval') {
//         console.log('We should set reconnect interval to %d milliseconds', event.value)
//     }
// }

async function getCompletion(text){
    var message =  {'role': 'system', 'content': `${text}` };
    return await queryGpt([message])
}

//GPT stuff
var gptGoal = 'You can do whatever you like';
function getSystemMessage() {
    var current_date = new Date().toLocaleString();
    return {
        'role': 'system', 'content': `Current date: ${current_date}
You are an LLM that is virtualized on a web app. ${gptGoal}, but the only interface available to you is a computer command line. I suggest you start by familiarizing yourself with your surroundings. You should output in the order of "Thought, Hypothesis, Reflection, Action" where Thought is where you can brainstorm ideas or have internal thoughts, hypothesis is where you formalize your ideas and possible actions, reflection is where you reflect on your thoughts and hypotheses and determine whether they are productive. These 3 can loop as many times as necessary if you find it necessary in your reflection, until you decide on an action. Action is where you output exactly what you want to run in the command line. This ends you current output. You will then see an "Observation:" which will contain only the output from the command you ran, at which point this cycle continues.
Example output format:
Thought: {Thought content}
Hypothesis: {Hypothesis content}
Reflection: {Reflection content}
Action:{command to run on command line}
Observation:

In your action do not output anything other than exactly the command line input.` };
}

var messageHistory = [];
messageHistory.push(getSystemMessage());

var cont = true;
var loops = 0;

// async function startGPT() {
//     //Start the loop
//     var response = await queryGpt(messageHistory, "Observation:")
//     messageHistory.push({ 'role': 'assistant', 'content': response });
//     logWithSocket(response);

//     //Get and run command
//     var action = getActionFromString(response);
//     if (action == null) {
//         logWithSocket("No action found");
//         return;
//     }

//     logWithSocket("Pausing 8 seconds to allow you to abort")
//     await new Promise(resolve => setTimeout(resolve, 8000));
//     if (!cont) {
//         return;
//     }
//     logWithSocket("Continuing")

//     var observation = await evaluateCommand(action);
//     logWithSocket('Console output: ' + observation);
//     messageHistory.push({ 'role': 'user', 'content': 'Observation: ' + observation });

//     loops++;
//     logWithSocket('Number of loops : ' + loops);
//     startGPT();
// }

export {queryGpt, getCompletion};
