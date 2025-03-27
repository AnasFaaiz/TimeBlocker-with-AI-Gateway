// import { OpenAI } from 'openai';

// const langdbProjectId = import.meta.env.VITE_REACT_LANGDB_PROJECT_ID  

// const client = new OpenAI({
//   baseURL: `https://api.us-east-1.langdb.ai/${langdbProjectId}/v1`,
//   apiKey:  import.meta.env.VITE_REACT_LANGDB_API_KEY   
// });

// const messages = [
//   {
//     role: 'system',
//     content: 'You are a helpful assistant.'
//   },
//   {
//     role: 'user',
//     content: 'What are the earnings of Apple in 2022?'
//   }
// ];
// async function getAssistantReply() {
//   const { choices } = await client.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages: messages
//   });
//   console.log('Assistant:', choices[0].message.content);
// }
// getAssistantReply();