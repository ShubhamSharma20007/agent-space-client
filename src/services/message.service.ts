import type { AgentId, ChatMessageData } from "@/types/chat";
import instance from "@/utils/axios";

class MessageService {
  async getMessages(conversationId: string) {
    return await instance.get('/chat/get-messages/'+conversationId)
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
      console.log('get conversations error',err)
    })
  }

  async sendMessage(conversationId:string,message: ChatMessageData,agentId:AgentId,file?:File) {
    const formData = new FormData();
    formData.append('conversationId',conversationId);
    formData.append('msgState',JSON.stringify(message));
    formData.append('agentId',agentId);
    if(file) formData.append('file',file);
    return await instance.post('/agent/chat',formData,{
      headers:{
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res=>{
          return res.data?.data || res.data
    })
    .catch(err=>{
     console.log('Error sending message', err);
    })
  }


}
export default new MessageService();